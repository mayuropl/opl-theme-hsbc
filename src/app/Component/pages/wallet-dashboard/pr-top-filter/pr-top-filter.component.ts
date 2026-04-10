import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TooltipDetailPopupComponent } from 'src/app/Popup/HSBC/tooltip-detail-popup/tooltip-detail-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {Constants} from '../../../../CommoUtils/constants';
import { GroupedOption } from '../../../../CommoUtils/common-select/common-select.component';

@Component({
  selector: 'app-pr-top-filter',
  templateUrl: './pr-top-filter.component.html',
  styleUrl: './pr-top-filter.component.scss'
})
export class PrTopFilterComponent implements OnChanges, OnInit {
  showFilter: boolean = false;
  @Input() showComparison: boolean = false;
  @Input() filters: any[] = [];
  @Input() filtersC: any[] = [];
  @Input() datasetsC: any[] = [];
  @Input() selectedBureau: number = 1;
  @Input() restoredFiltersC: any = null;
  @Input() restoredFilters: any = null;
  @Input() searchViewBySelectionRestored: any = null;
  @Input() searchViewByOptionsRestored: any[] = null; // Restored option array with labels
  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersAppliedC = new EventEmitter<any>();
  @Output() resetAppliedC = new EventEmitter<any>();
  @Output() showSummaryChange  = new EventEmitter<any>();
  @Output() viewByChanged = new EventEmitter<any>();
  @Output() filtersStateChanged = new EventEmitter<boolean>();
  @Output() searchViewBySelectionChanged = new EventEmitter<any[]>();
  @Output() searchViewByOptionsChanged = new EventEmitter<any[]>(); // Emit current option array for saving
  @Output() clearRestoredFilters = new EventEmitter<void>(); // Emit to clear restored filters in parent
  topBarFilters : any;
  topBarFiltersC : any;
  topBarRadioFilters : any;
  topBarRadioFiltersC : any;
  isUtilizationLoaded = false;
  loadedUtilizationOptions: any[] = null; // Cache for API-loaded utilization_wallet_pct options
  lastSelectedOption: any;
  clearWalletMinMax = false;
  minValue : any;
  maxValue: any;
  resetFlag: boolean = false;
  viewByName : any;
  isDisabled :  boolean = true;
  previousDatasetKey: string | null = null;
  skipSubTypeAutoSelect: boolean = false;
  skipSubTypeAutoSelectC: boolean = false;
  skipProductTypeAutoSelect: boolean = false; // Skip auto-select for product_type when restoring
  isRestoringFilters: boolean = false;
  isRestoringSummaryFilters: boolean = false;
  hasCompletedSummaryRestore: boolean = false; // Flag to track if restore is done - prevents re-restore
  skipSummaryApiCall: boolean = false; // Flag to skip Summary API call when restoring Comparison tab
  isApplyButtonClicked: boolean = false; // Flag to prevent duplicate API calls when Apply button is clicked
  search_view_by_selection : any;

  // OptionArray = ['All', 'Fund based', 'Non fund based'];
  OptionArray: { label: string; value: any }[] = [];
  defaultCache : any;
  selectModel: string[] = [];
  isInitialLoad: boolean = true;
  selectedValues: { [key: string]: any } = {};
  selectedValuesC: { [key: string]: any } = {};
  radioValue: Number = 2;
  radioValueC: number | null = 3;
  mySelectedValue = '';
  isWalletDisabled  : any;
  optionList = [];
  // optionList = ['One', 'Two', 'Three'];
  radioOptions = [
    { label: 'Product Level', value: 1 },
    { label: 'Customer Level', value: 2 },
  ];
  
  // Product Sub-Type grouped options - now handled dynamically from backend
  // selectedProductSubTypes: any[] = [];
  
  page_offset = 0;
  page_size = 50;
  dependantFilters: any[] = [];
  isLoading: boolean;
  currentDatasetName : any;
  currentDatasetId : any;
  private _previousProductTypeSelection: any[] = [];
  private _previousProductTypeSelectionC: any[] = [];
  searchByDataHistory: {
    [key: number]: {
      'searchValue': string,
      'isCalled': boolean,
      'dataset_name': string,
      'data': any[],
      'page_size': number,
      'page_offset': number,
      'wasAllUnselected'?: boolean
    }
  } = {};

  searchSubject = new Subject<{ searchText: string, datasetId: number, datasetName: string }>();
  searchValue$ = new Subject<string>();
  protected readonly consValue = Constants;
  pageData: any;
   ngOnInit(): void {
    //     this.searchSubject.pipe(
    //   debounceTime(400), // wait 400ms after user stops typing
    //   distinctUntilChanged((prev, curr) => prev.searchText === curr.searchText)
    // ).subscribe(({ searchText, datasetId, datasetName }) => {
    //   if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
    //     this.page_offset = 0;
    //     this.callDashboardApi(datasetId, datasetName, false);
    //   }
    // });

      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS,this.consValue.pageMaster.PR_DASHBOARD);
      this.searchValue$
    .pipe(debounceTime(400))
    .subscribe((value) => {
      this.onSearchValueChanged(value);
    });
    
    // Initialize product_sub_type as empty array since no product type is selected initially
    this.selectedValues['product_sub_type'] = [];
    this.selectedValuesC['product_sub_type'] = [];
    
    //this.onSearchValueChange();
   }

  constructor(public msmeService: MsmeService, public dialog: MatDialog, protected commonService: CommonService, private cdr: ChangeDetectorRef) {
  }

  TooltipDetailPopup(popupData?: any) {
    const dialogRef = this.dialog.open(TooltipDetailPopupComponent, {
      panelClass: ['popupMain_design'],
      data: popupData || '',
      autoFocus: false,
    });
  }
onSearchValueChange(value: string) {
   this.onSearchValueChanged(value);
}

  applyFilters() {
    // Skip if essential filter data is not ready yet
    if (!this.selectedValues['date_of_report']) {
      console.log('Skipping applyFilters - date_of_report not ready yet');
      return;
    }

    // Set flag to prevent duplicate API calls from ngOnChanges
    this.isApplyButtonClicked = true;
    setTimeout(() => {
      this.isApplyButtonClicked = false;
    }, 100);

    const hasFilters = this.checkIfFiltersApplied();
    this.filtersStateChanged.emit(hasFilters);
    
    // Ensure cmr, psl_status, utilization_wallet_pct are always included in the request
    // If not set in selectedValues, get all option values (what UI shows as "All")
    const cmrFilter = this.topBarFilters?.find(f => f.filter_name === 'cmr');
    const pslFilter = this.topBarFilters?.find(f => f.filter_name === 'psl_status');
    const utilizationFilter = this.topBarFilters?.find(f => f.filter_name === 'utilization_wallet_pct');
    
    // Get the values - if selectedValues has them, use those; otherwise get all options
    let cmrValue = this.selectedValues['cmr'];
    let pslValue = this.selectedValues['psl_status'];
    let utilizationValue = this.selectedValues['utilization_wallet_pct'];
    
    // If values are undefined/null but filter exists with options, pass all option values
    if ((cmrValue === undefined || cmrValue === null) && cmrFilter?.options?.length > 0) {
      cmrValue = cmrFilter.options.map(o => o.value);
    }
    if ((pslValue === undefined || pslValue === null) && pslFilter?.options?.length > 0) {
      pslValue = pslFilter.options.map(o => o.value);
    }
    if ((utilizationValue === undefined || utilizationValue === null) && utilizationFilter?.options?.length > 0) {
      utilizationValue = utilizationFilter.options.map(o => o.value);
    }
    
    // Check if this is after redirect restore - always pass null for chart_utilization_wallet_pct
    const isAfterRedirect = this.hasCompletedSummaryRestore;
    
    const filtersToEmit = {
      ...this.selectedValues,
      which_level: this.radioValue,
      cmr: cmrValue,
      psl_status: pslValue,
      utilization_wallet_pct: utilizationValue,
      // Always pass null for chart_utilization_wallet_pct after redirect
      chart_utilization_wallet_pct: isAfterRedirect ? null : (this.selectedValues['chart_utilization_wallet_pct'] || null)
    };
    
    this.filtersApplied.emit(filtersToEmit);
  }

  applyFiltersC() {
    this.filtersAppliedC.emit({
      ...this.selectedValuesC,
      gain_or_loss : this.radioValueC,
      wallet_min: this.minValue !== null ? parseFloat(this.minValue) : null,
      wallet_max: this.maxValue !== null ? parseFloat(this.maxValue) : null,
      group_by_column : this.viewByName
    });
  }

  getAppliedFilterList() {
    return this.selectedValues;
  }

  // Get the Search View By second dropdown selection (e.g., Bank Line selection)
  getSearchViewBySelection() {
    return this.selectModel;
  }

  ngOnChanges(changes: SimpleChanges) {
    // Check if we have valid restored filters for Summary tab
    // BUT skip if we've already completed the restore
    const hasRestoredSummaryFilters = !this.hasCompletedSummaryRestore && 
                                      this.restoredFilters !== null && 
                                      this.restoredFilters !== undefined &&
                                      Object.keys(this.restoredFilters).length > 0;
    
    // Check specifically for product_sub_type to control auto-select behavior for Summary
    const hasRestoredSummarySubType = hasRestoredSummaryFilters &&
                                      this.restoredFilters.product_sub_type &&
                                      Array.isArray(this.restoredFilters.product_sub_type) &&
                                      this.restoredFilters.product_sub_type.length > 0;
    
    // Handle restored Summary filters when they first arrive
    if (changes['restoredFilters'] && hasRestoredSummaryFilters) {
      
      this.isRestoringSummaryFilters = true;
      if (hasRestoredSummarySubType) {
        this.skipSubTypeAutoSelect = true;
      }
      // Skip auto-select for product_type when restoring
      if (this.restoredFilters.product_type && Array.isArray(this.restoredFilters.product_type)) {
        this.skipProductTypeAutoSelect = true;
        console.log('Setting skipProductTypeAutoSelect = true');
      }
      // Pre-populate selectedValues for Summary tab
      // Exclude "Search by" filter keys - these are managed by parent's selectedItemsMap
      const searchByFilterKeys = ['city', 'city_id', 'segment', 'segment_id', 'rm', 'rm_id', 'company_name', 'city_name', 'seg_name', 'employee_name', 'employee_id', 'company_name_search', 'parent_company_id', 'parent_country_id'];
      Object.keys(this.restoredFilters).forEach(key => {
        if (!['global_primary_rm_id', 'role_id', 'role_type', 'division_value', 'page_size', 'page_offset', 'latest_6_report_date', ...searchByFilterKeys].includes(key)) {
          console.log('Restoring key to selectedValues:', key, '=', this.restoredFilters[key]);
          this.selectedValues[key] = this.restoredFilters[key];
        } else {
          console.log('SKIPPING key (excluded):', key);
        }
      });
      // Restore radioValue (which_level)
      if (this.restoredFilters.which_level !== undefined) {
        this.radioValue = this.restoredFilters.which_level;
      }
      console.log('selectedValues AFTER restore:', JSON.stringify(this.selectedValues));
      this.cdr.detectChanges();
    }

    // Check if we have valid restored filters
    const hasRestoredFilters = this.restoredFiltersC !== null && 
                               this.restoredFiltersC !== undefined &&
                               Object.keys(this.restoredFiltersC).length > 0;
    
    // Check specifically for product_sub_type to control auto-select behavior
    const hasRestoredSubType = hasRestoredFilters &&
                               this.restoredFiltersC.product_sub_type &&
                               Array.isArray(this.restoredFiltersC.product_sub_type) &&
                               this.restoredFiltersC.product_sub_type.length > 0;
    
    // Handle restored filters when they first arrive - set flag for later use
    if (changes['restoredFiltersC'] && hasRestoredFilters) {
      this.isRestoringFilters = true;
      this.skipSummaryApiCall = true; // Skip Summary API call when restoring Comparison tab
      if (hasRestoredSubType) {
        this.skipSubTypeAutoSelectC = true;
      }
      // Pre-populate selectedValuesC
      Object.keys(this.restoredFiltersC).forEach(key => {
        if (!['global_primary_rm_id', 'role_id', 'role_type', 'division_value', 'page_size', 'page_offset'].includes(key)) {
          this.selectedValuesC[key] = this.restoredFiltersC[key];
        }
      });
      // Restore radioValueC and isWalletDisabled
      if (this.restoredFiltersC.gain_or_loss !== undefined) {
        this.radioValueC = this.restoredFiltersC.gain_or_loss;
        this.isWalletDisabled = (this.radioValueC === 3);
      }
      
      // Check if min/max values are being restored - if so, wallet options should be empty
      const hasMinMax = (this.restoredFiltersC.wallet_min !== undefined && this.restoredFiltersC.wallet_min !== null) ||
                        (this.restoredFiltersC.wallet_max !== undefined && this.restoredFiltersC.wallet_max !== null);
      
      if (hasMinMax) {
        // When min/max is used, wallet options should be empty
        this.selectedValuesC['wallet'] = [];
        if (this.restoredFiltersC.wallet_min !== undefined && this.restoredFiltersC.wallet_min !== null) {
          this.minValue = this.restoredFiltersC.wallet_min;
        }
        if (this.restoredFiltersC.wallet_max !== undefined && this.restoredFiltersC.wallet_max !== null) {
          this.maxValue = this.restoredFiltersC.wallet_max;
        }
      }

      this.cdr.detectChanges();
    }

    if (changes['filters']) {
      // Reset cmr and date_of_report selected values when bureau changes
      // so the new swapped options get picked up correctly
      if (changes['selectedBureau'] && !changes['selectedBureau'].firstChange) {
        delete this.selectedValues['cmr'];
        delete this.selectedValues['date_of_report'];
      }

      // Check if we're restoring Summary filters
      const shouldRestoreSummary = this.isRestoringSummaryFilters || hasRestoredSummaryFilters;
      
      this.setupTopBarRadioFilter();
      this.setupTopBarFilter();

      setTimeout(() => {
        
        // After setup, re-apply restored values if we're restoring Summary filters
        // Only restore ONCE on initial load, not on subsequent filter changes
        if (shouldRestoreSummary && this.restoredFilters && this.isRestoringSummaryFilters && !this.hasCompletedSummaryRestore) {
          // Exclude "Search by" filter keys - these are managed by parent's selectedItemsMap
          const searchByFilterKeys = ['city', 'city_id', 'segment', 'segment_id', 'rm', 'rm_id', 'company_name', 'city_name', 'seg_name', 'employee_name', 'employee_id', 'company_name_search', 'parent_company_id', 'parent_country_id'];
          Object.keys(this.restoredFilters).forEach(key => {
            if (!['global_primary_rm_id', 'role_id', 'role_type', 'division_value', 'page_size', 'page_offset', 'latest_6_report_date', ...searchByFilterKeys].includes(key)) {
              console.log('setTimeout: Restoring key:', key, '=', this.restoredFilters[key]);
              this.selectedValues[key] = this.restoredFilters[key];
            }
          });
          // Re-apply radioValue (which_level)
          if (this.restoredFilters.which_level !== undefined) {
            this.radioValue = this.restoredFilters.which_level;
          }
          
          // Re-apply product_type dependency for product_sub_type
          const restoredProductType = this.selectedValues['product_type'];
          if (restoredProductType && Array.isArray(restoredProductType) && restoredProductType.length > 0) {
            // First set up the groupedOptions
            this.handleProductTypeDependency(restoredProductType, true);
            
            // Then re-apply the restored product_sub_type selection
            // This ensures the selection is applied AFTER groupedOptions are set up
            if (this.restoredFilters.product_sub_type && Array.isArray(this.restoredFilters.product_sub_type)) {
              this.selectedValues['product_sub_type'] = [...this.restoredFilters.product_sub_type];
            }
          }
          
          this.cdr.detectChanges();
          this.filtersStateChanged.emit(true);
          
          // Mark restore as completed - this prevents any future re-restore
          this.hasCompletedSummaryRestore = true;
          this.isRestoringSummaryFilters = false;
          
          // Reset auto-select flags after restore is complete
          // This allows normal auto-select behavior when user changes filters
          this.skipProductTypeAutoSelect = false;
          this.skipSubTypeAutoSelect = false;
          
          // Tell parent to clear restoredFilters so it won't be passed again
          this.clearRestoredFilters.emit();
        }
        // Only call applyFilters if we're not restoring Comparison tab state and not triggered by Apply button click
        // and only when in Summary mode (not Comparison)
        if (!this.skipSummaryApiCall && !this.isApplyButtonClicked && !this.showComparison) {
          this.applyFilters();
        }
      });
    }

    if (changes['filtersC']) {
      // Reset date_of_report selected value when bureau changes
      // so the new swapped options get picked up correctly
      if (changes['selectedBureau'] && !changes['selectedBureau'].firstChange) {
        delete this.selectedValuesC['date_of_report'];
      }

      // Check if we're restoring filters (flag set earlier or restoredFiltersC exists)
      const shouldRestore = this.isRestoringFilters || hasRestoredFilters;
      
      this.setupTopBarRadioFilterC();
      this.setupComparisonTopBarFilter();
      this.setupTopBarFilterC();
      
      setTimeout(() => {
        // After setup, re-apply restored values if we're restoring
        if (shouldRestore && this.restoredFiltersC) {
          // Check if min/max values are being restored - if so, wallet options should be empty
          const hasMinMax = (this.restoredFiltersC.wallet_min !== undefined && this.restoredFiltersC.wallet_min !== null) ||
                            (this.restoredFiltersC.wallet_max !== undefined && this.restoredFiltersC.wallet_max !== null);
          
          Object.keys(this.restoredFiltersC).forEach(key => {
            // Skip wallet if min/max values are being restored
            if (hasMinMax && key === 'wallet') {
              this.selectedValuesC['wallet'] = [];
              return;
            }
            if (!['global_primary_rm_id', 'role_id', 'role_type', 'division_value', 'page_size', 'page_offset'].includes(key)) {
              this.selectedValuesC[key] = this.restoredFiltersC[key];
            }
          });
          // Re-apply radioValueC and isWalletDisabled
          if (this.restoredFiltersC.gain_or_loss !== undefined) {
            this.radioValueC = this.restoredFiltersC.gain_or_loss;
            this.isWalletDisabled = (this.radioValueC === 3);
          }
          
          // Re-apply min/max values if they exist
          if (hasMinMax) {
            if (this.restoredFiltersC.wallet_min !== undefined && this.restoredFiltersC.wallet_min !== null) {
              this.minValue = this.restoredFiltersC.wallet_min;
            }
            if (this.restoredFiltersC.wallet_max !== undefined && this.restoredFiltersC.wallet_max !== null) {
              this.maxValue = this.restoredFiltersC.wallet_max;
            }
          }
          
          // Re-apply Search View By selection after optionList is populated
          const groupByColumn = this.restoredFiltersC.group_by_column;
          if (groupByColumn && this.optionList.length > 0) {
            const viewByMapping: { [key: string]: string } = {
              'seg_name': 'Segment',
              'city_name': 'City',
              'employee_name': 'RM',
              'cust.cust_name': 'Customer',
              'fin.parent_product_display_name': 'Product'
            };
            const viewByValue = viewByMapping[groupByColumn];
            if (viewByValue && this.optionList.includes(viewByValue)) {
              this.mySelectedValue = viewByValue;
              this.viewByName = groupByColumn;
              this.isDisabled = false;
              this.viewByChanged.emit(viewByValue);
            }
          }

          const restoredProductType = this.selectedValuesC['product_type'];
          if (restoredProductType && Array.isArray(restoredProductType) && restoredProductType.length > 0) {
            this.handleProductTypeDependencyC(restoredProductType, true);
          }
          
          this.cdr.detectChanges();
        }
        // Only call applyFiltersC when in Comparison mode
        if (this.showComparison) {
          this.applyFiltersC();
        }
      });
    }

    // Handle restored filters - apply after filtersC is processed
    if (changes['restoredFiltersC'] && hasRestoredFilters) {
      this.restoreComparisonFilters(this.restoredFiltersC);
    }
    if (changes['searchViewBySelectionRestored']) {
      this.restoreComparisonFilters(this.restoredFiltersC);
    }
  }

  // Restore comparison filters when navigating back
  restoreComparisonFilters(savedFilters: any) {
    if (!savedFilters) return;

    // Restore other state
    if (savedFilters.gain_or_loss !== undefined && savedFilters.gain_or_loss !== null) {
      this.radioValueC = savedFilters.gain_or_loss;
      // Set wallet disabled state based on gain_or_loss value
      // 3 = Both (wallet disabled), 1 = Gain, 2 = Loss (wallet enabled)
      this.isWalletDisabled = (this.radioValueC === 3);
    }
    
    // Check if min/max values are being restored - if so, wallet options should be empty
    const hasMinMax = (savedFilters.wallet_min !== undefined && savedFilters.wallet_min !== null) ||
                      (savedFilters.wallet_max !== undefined && savedFilters.wallet_max !== null);
    
    if (hasMinMax) {
      // When min/max is used, wallet options should be empty
      this.selectedValuesC['wallet'] = [];
      if (savedFilters.wallet_min !== undefined && savedFilters.wallet_min !== null) {
        this.minValue = savedFilters.wallet_min;
      }
      if (savedFilters.wallet_max !== undefined && savedFilters.wallet_max !== null) {
        this.maxValue = savedFilters.wallet_max;
      }
    } else {
      // Restore wallet selection only if min/max is not used
      if (savedFilters.wallet !== undefined) {
        this.selectedValuesC['wallet'] = savedFilters.wallet;
      }
    }
    
    // Restore Search View By selection based on group_by_column (already overridden with original from session)
    const groupByColumn = savedFilters.group_by_column;
    if (groupByColumn) {
      const viewByMapping: { [key: string]: string } = {
        'seg_name': 'Segment',
        'city_name': 'City',
        'employee_name': 'RM',
        'cust.cust_name': 'Customer',
        'fin.parent_product_display_name': 'Product'
      };
      const viewByValue = viewByMapping[groupByColumn];
      if (viewByValue) {
        this.mySelectedValue = viewByValue;
        this.viewByName = groupByColumn;
        this.isDisabled = false;
        this.viewByChanged.emit(viewByValue);
        console.log('Restored Search View By:', viewByValue);
        
        // Set up the dataset for the restored view
        const datasetKeyMapping: { [key: string]: string } = {
          'Segment': 'segment_search',
          'City': 'city_name_search',
          'RM': 'rm_name_search',
          'Customer': 'company_name_search',
          'Product': 'product_type_search'
        };
        const datasetKey = datasetKeyMapping[viewByValue];
        if (datasetKey) {
          const matchedDataset = this.datasetsC.find(d => d.dataset_name === datasetKey);
          if (matchedDataset) {
            this.currentDatasetId = matchedDataset.dataset_id;
            this.currentDatasetName = matchedDataset.dataset_name;
            this.previousDatasetKey = datasetKey;
          }
        }
      }
    }

    // Restore Search View By second dropdown selection (e.g., Bank Line selection)
    if (this.searchViewBySelectionRestored && Array.isArray(this.searchViewBySelectionRestored)) {
      this.selectModel = this.searchViewBySelectionRestored;
      this.isInitialLoad = false;

      this.searchViewBySelectionChanged.emit(this.selectModel);
      
      // If we have restored options (with labels), use them directly
      if (this.searchViewByOptionsRestored && Array.isArray(this.searchViewByOptionsRestored) && this.searchViewByOptionsRestored.length > 0) {
        // Use the restored options directly - they contain the selected items with labels
        this.OptionArray = [...this.searchViewByOptionsRestored];
        
        // Update the cache with restored options
        if (this.currentDatasetId) {
          if (!this.searchByDataHistory[this.currentDatasetId]) {
            this.searchByDataHistory[this.currentDatasetId] = {
              searchValue: '',
              isCalled: true,
              dataset_name: this.currentDatasetName,
              data: this.searchViewByOptionsRestored.map(opt => ({ key: opt.label, value: opt.value })),
              page_size: this.page_size,
              page_offset: 0
            };
          } else {
            // Merge restored options with existing cache
            const existingValues = new Set(this.searchByDataHistory[this.currentDatasetId].data.map((item: any) => item.value));
            const newItems = this.searchViewByOptionsRestored
              .filter(opt => !existingValues.has(opt.value))
              .map(opt => ({ key: opt.label, value: opt.value }));
            this.searchByDataHistory[this.currentDatasetId].data = [...newItems, ...this.searchByDataHistory[this.currentDatasetId].data];
          }
        }
        
        // Also load more options from API to populate the dropdown
        if (this.currentDatasetId && this.currentDatasetName) {
          setTimeout(() => {
            this.callDashboardApiC(this.currentDatasetId, this.currentDatasetName, false);
          }, 100);
        }
      } else {
        // No restored options available, trigger API call to load the dropdown options
        // Also fetch the selected items by their IDs to ensure they appear in the dropdown
        if (this.currentDatasetId && this.currentDatasetName) {
          setTimeout(() => {
            this.callDashboardApiC(this.currentDatasetId, this.currentDatasetName, false);
            // Fetch selected items by IDs to ensure they appear in dropdown
            this.fetchSelectedItemsByIds(this.currentDatasetId, this.currentDatasetName, this.searchViewBySelectionRestored);
          }, 100);
        }
      }
    }

    // Trigger change detection to update UI
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
      
      const restoredProductType = this.selectedValuesC['product_type'];
      if (restoredProductType && Array.isArray(restoredProductType) && restoredProductType.length > 0) {
        // Skip auto-selection since we're restoring existing selections
        this.handleProductTypeDependencyC(restoredProductType, true);
      }
      
      // Reset the flags after applying
      this.skipSubTypeAutoSelectC = false;
      this.isRestoringFilters = false;
      this.skipSummaryApiCall = false; // Reset flag after Comparison restore is complete
      
      this.cdr.detectChanges();
    }, 200);
  }

  onOptionSelected(value: any) {
    if(value !=''){
        this.isDisabled = false;
    }
    if (this.lastSelectedOption === value) return;
    this.lastSelectedOption = value;
    this.mySelectedValue = value;
    console.log('View By',value);
    this.viewByChanged.emit(value);

    let datasetKey = '';
    if(this.mySelectedValue == 'Segment'){
      datasetKey = 'segment_search';
      this.viewByName ='seg_name';
    }
     else if(this.mySelectedValue == 'City'){
      datasetKey = 'city_name_search';
      this.viewByName ='city_name';
    }
    else if(this.mySelectedValue == 'RM'){
      datasetKey = 'rm_name_search';
      this.viewByName ='employee_name';
    }
    else if(this.mySelectedValue == 'Customer'){
      datasetKey = 'company_name_search';
      this.viewByName ='cust.cust_name';
    }
    else if (this.mySelectedValue == 'Product') {
      datasetKey = 'product_type_search';
      this.viewByName ='fin.parent_product_display_name';
    }

  const allSearchKeys = [
    'segment_search',
    'city_name_search',
    'rm_name_search',
    'company_name_search',
    'product_type_search'
  ];

  allSearchKeys.forEach(key => {
    if (key !== datasetKey) {
      this.selectedValuesC[key] = null;   // Clear unwanted filter
    }
  });

  if (this.previousDatasetKey !== datasetKey) {

     this.OptionArray = [];
    this.selectModel = [];
    this.isInitialLoad = true;

     this.defaultCache = null;

     this.page_offset = 0;

     if (this.currentDatasetId) {
      delete this.searchByDataHistory[this.currentDatasetId];
    }
  }
    this.previousDatasetKey = datasetKey;
    const matchedDataset = this.datasetsC.find(d => d.dataset_name === datasetKey);

    if (matchedDataset) {
      this.currentDatasetId = matchedDataset.dataset_id;
      this.currentDatasetName = matchedDataset.dataset_name;

      this.callDashboardApiC(this.currentDatasetId, this.currentDatasetName, false);
    } else {
      console.warn('No matching dataset found for', value);
    }
  }

  onSelectionChange(value: any, filter: any) {
    this.selectedValues[filter.filter_name] = value;
    if (filter.isMultiple) {
    this.selectedValues[filter.filter_name] = value;
  } else {
     this.selectedValues[filter.filter_name] = Array.isArray(value) ? value[0] : value;
  }
    if(!this.isUtilizationLoaded){
        this.utilizationWalletCheckBoxValue(filter);
    }

    // Handle product_type dependency for product_sub_type
    if (filter.filter_name === 'product_type') {
      this.handleProductTypeDependency(value, this.skipSubTypeAutoSelect);
    }
   }

  // Handle product_type dependency for product_sub_type
  handleProductTypeDependency(selectedProductTypes: any[], skipAutoSelect: boolean = false): void {    
    const productSubTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_sub_type');
    
    if (!productSubTypeFilter) {
      return;
    }

    // Ensure originalGroupedOptions is available
    if (!productSubTypeFilter.originalGroupedOptions || productSubTypeFilter.originalGroupedOptions.length === 0) {
      // Try to get from the original filters data
      const originalFilter = this.filters?.find(f => f.filter_name === 'product_sub_type');
      if (originalFilter && originalFilter.options) {
        productSubTypeFilter.originalGroupedOptions = (originalFilter.options || []).map((grp: any) => ({
          parentId: grp.parent_id,
          groupName: grp.group_name,
          options: (grp.options || []).map((opt: any) => ({
            label: opt.label,
            value: opt.value
          }))
        }));
      }
    }

    // If still no originalGroupedOptions, return
    if (!productSubTypeFilter.originalGroupedOptions || productSubTypeFilter.originalGroupedOptions.length === 0) {
      return;
    }
    
    const productTypeFilterS = this.topBarFilters.find(
     f => f.filter_name === 'product_type'
    );

  const allProductTypeValues = productTypeFilterS?.options?.map(o => o.value) || [];

  const isAllProductTypeSelected =
    selectedProductTypes?.length === allProductTypeValues.length &&
    allProductTypeValues.every(v => selectedProductTypes.includes(v));

  productSubTypeFilter.showGroupedAll = isAllProductTypeSelected;

  if (isAllProductTypeSelected) {
    if (!skipAutoSelect) {
      this.selectAllProductSubTypes(productSubTypeFilter);
    } else {
      // Just restore the grouped options without auto-selecting
      productSubTypeFilter.groupedOptions = [
        ...productSubTypeFilter.originalGroupedOptions
      ];
    }
    return;
  }

    productSubTypeFilter.groupedOptions = [
      ...productSubTypeFilter.originalGroupedOptions
    ];

    // If no product types selected or empty selection, hide all sub-type options
    if (!selectedProductTypes || selectedProductTypes.length === 0) {
      productSubTypeFilter.groupedOptions = [];
      // Clear any existing sub-type selections
      this.selectedValues['product_sub_type'] = [];
      return;
    }

    // Get selected product type labels for mapping
    const productTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_type');
    
    // Also get from original filters as fallback
    const originalProductTypeFilter = this.filters?.find(f => f.filter_name === 'product_type');
    
    const selectedProductTypeLabels = selectedProductTypes.map(productTypeValue => {
      // First try topBarFilters
      let productTypeOption = productTypeFilter?.options?.find(opt => opt.value === productTypeValue);
      
      // Fallback to original filters if not found
      if (!productTypeOption && originalProductTypeFilter?.options) {
        const originalOption = originalProductTypeFilter.options.find(opt => opt.value === productTypeValue);
        if (originalOption) {
          productTypeOption = { label: originalOption.key, value: originalOption.value };
        }
      }
      
      return productTypeOption ? productTypeOption.label : null;
    }).filter(Boolean);

    // Map product type labels to group names (case-insensitive matching)
    const selectedGroups = new Set<string>();
    
    selectedProductTypeLabels.forEach(productTypeLabel => {
      const label = this.normalize(productTypeLabel);

      productSubTypeFilter.originalGroupedOptions.forEach(group => {
        const groupName = this.normalize(group.groupName);

        const isMatch = label === groupName || this.isProductTypeGroupMatch(label, groupName);
        if (isMatch) {
          selectedGroups.add(group.groupName);
        }
      });
    });


    // Filter grouped options based on selected product types
    productSubTypeFilter.groupedOptions =
      productSubTypeFilter.originalGroupedOptions.filter(
        group => selectedGroups.has(group.groupName)
      );

    // Check if product type selection actually changed
    const previousProductTypes = this._previousProductTypeSelection || [];
    const productTypeChanged = !this.arraysEqual(previousProductTypes, selectedProductTypes);
    
    // Find newly added and removed product types
    const newlyAddedProductTypes = selectedProductTypes.filter(pt => !previousProductTypes.includes(pt));
    const removedProductTypes = previousProductTypes.filter(pt => !selectedProductTypes.includes(pt));
    const hasNewProductTypes = newlyAddedProductTypes.length > 0;
    const hasRemovedProductTypes = removedProductTypes.length > 0;
    
    console.log('removedProductTypes:', removedProductTypes);
    console.log('hasRemovedProductTypes:', hasRemovedProductTypes);
    
    if (productTypeChanged) {
      if (!skipAutoSelect) {
        // Normal case: auto-select all visible sub-types
        this.selectAllVisibleSubTypes(productSubTypeFilter);
      } else if (hasNewProductTypes) {
        // After redirect: add sub-types for newly added product types
        this.addSubTypesForNewProductTypes(productSubTypeFilter, newlyAddedProductTypes, selectedProductTypeLabels);
      } else if (hasRemovedProductTypes) {
        // After redirect: when product types are removed, auto-select all remaining visible sub-types
        this.selectAllVisibleSubTypes(productSubTypeFilter);
      }
      this._previousProductTypeSelection = [...selectedProductTypes];
    }

    // Clear product_sub_type selection if current selection is not available in filtered groups
    if (!skipAutoSelect) {
      this.clearInvalidSubTypeSelections(productSubTypeFilter.groupedOptions);
    }
  }
  
  // Add sub-types for newly added product types while keeping existing selections
  private addSubTypesForNewProductTypes(productSubTypeFilter: any, newlyAddedProductTypes: any[], allSelectedLabels: string[]): void {
    const currentSelection = this.selectedValues['product_sub_type'] || [];
    const newSubTypeValues: any[] = [];
    
    // Get labels for newly added product types
    const productTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_type');
    const originalProductTypeFilter = this.filters?.find(f => f.filter_name === 'product_type');
    
    const newProductTypeLabels = newlyAddedProductTypes.map(productTypeValue => {
      let productTypeOption = productTypeFilter?.options?.find(opt => opt.value === productTypeValue);
      if (!productTypeOption && originalProductTypeFilter?.options) {
        const originalOption = originalProductTypeFilter.options.find(opt => opt.value === productTypeValue);
        if (originalOption) {
          productTypeOption = { label: originalOption.key, value: originalOption.value };
        }
      }
      return productTypeOption ? productTypeOption.label : null;
    }).filter(Boolean);
    
    // Find groups that match the newly added product types
    newProductTypeLabels.forEach(productTypeLabel => {
      const label = this.normalize(productTypeLabel);
      
      productSubTypeFilter.originalGroupedOptions.forEach(group => {
        const groupName = this.normalize(group.groupName);
        
        if (label === groupName || this.isProductTypeGroupMatch(label, groupName)) {
          // Add all sub-types from this group
          group.options.forEach(opt => {
            if (!currentSelection.includes(opt.value) && !newSubTypeValues.includes(opt.value)) {
              newSubTypeValues.push(opt.value);
            }
          });
        }
      });
    });
    
    // Merge existing selection with new sub-types
    if (newSubTypeValues.length > 0) {
      // Remove -1 (All) from current selection since we're adding specific items
      const filteredCurrentSelection = currentSelection.filter(v => v !== -1);
      const mergedSelection = [...filteredCurrentSelection, ...newSubTypeValues];
      
      // Check if all sub-types are now selected
      const allVisibleSubTypeValues = productSubTypeFilter.groupedOptions.flatMap(g => g.options.map(o => o.value));
      const allSelected = allVisibleSubTypeValues.every(v => mergedSelection.includes(v));
      
      if (allSelected) {
        this.selectedValues['product_sub_type'] = [-1, ...mergedSelection];
      } else {
        this.selectedValues['product_sub_type'] = mergedSelection;
      }
    }
  }
  // Helper method to compare two arrays
  private arraysEqual(a: any[], b: any[]): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  }

    handleProductTypeDependencyC(selectedProductTypes: any[], skipAutoSelect: boolean = false): void {
    const productSubTypeFilter = this.topBarFiltersC?.find(f => f.filter_name === 'product_sub_type');
    
    if (!productSubTypeFilter || !productSubTypeFilter.groupedOptions) {
      return;
    }
    
    const productTypeFilterS = this.topBarFiltersC.find(
     f => f.filter_name === 'product_type'
    );

  const allProductTypeValues = productTypeFilterS?.options?.map(o => o.value) || [];

  const isAllProductTypeSelected =
    selectedProductTypes?.length === allProductTypeValues.length &&
    allProductTypeValues.every(v => selectedProductTypes.includes(v));

  productSubTypeFilter.showGroupedAll = isAllProductTypeSelected;

      if (isAllProductTypeSelected) {
        if (!skipAutoSelect) {
          this.selectAllProductSubTypesC(productSubTypeFilter);
        } else {
          // Just restore the grouped options without auto-selecting
          productSubTypeFilter.groupedOptions = [
            ...productSubTypeFilter.originalGroupedOptions
          ];
        }
        return;
      }

      // Get the original grouped options (store them if not already stored)
      if (!productSubTypeFilter.originalGroupedOptions) {
        productSubTypeFilter.originalGroupedOptions = [...productSubTypeFilter.groupedOptions];
      }

      productSubTypeFilter.groupedOptions = [
        ...productSubTypeFilter.originalGroupedOptions
      ];

    // If no product types selected or empty selection, hide all sub-type options
    if (!selectedProductTypes || selectedProductTypes.length === 0) {
      productSubTypeFilter.groupedOptions = [];
      // Clear any existing sub-type selections
      this.selectedValuesC['product_sub_type'] = [];
      return;
    }

    // Get selected product type labels for mapping
    const productTypeFilter = this.topBarFiltersC?.find(f => f.filter_name === 'product_type');
    const selectedProductTypeLabels = selectedProductTypes.map(productTypeValue => {
      const productTypeOption = productTypeFilter?.options?.find(opt => opt.value === productTypeValue);
      return productTypeOption ? productTypeOption.label : null;
    }).filter(Boolean);

    // Map product type labels to group names (case-insensitive matching)
    const selectedGroups = new Set<string>();
    
    selectedProductTypeLabels.forEach(productTypeLabel => {
      const label = this.normalize(productTypeLabel);

      productSubTypeFilter.originalGroupedOptions.forEach(group => {
        const groupName = this.normalize(group.groupName);

        if (
          label === groupName ||
          this.isProductTypeGroupMatch(label, groupName)
        ) {
          selectedGroups.add(group.groupName);
        }
      });
    });

      productSubTypeFilter.groupedOptions =
        productSubTypeFilter.originalGroupedOptions.filter(
          group => selectedGroups.has(group.groupName)
        );

    // Check if product type selection actually changed
    const previousProductTypes = this._previousProductTypeSelectionC || [];
    const productTypeChanged = !this.arraysEqual(previousProductTypes, selectedProductTypes);
    
    // Only auto-select all sub-types if product type selection changed and not skipping auto-select
    if (productTypeChanged && !skipAutoSelect) {
      this.selectAllVisibleSubTypesC(productSubTypeFilter);
      this._previousProductTypeSelectionC = [...selectedProductTypes];
    }

    // Clear product_sub_type selection if current selection is not available in filtered groups
    if (!skipAutoSelect) {
      this.clearInvalidSubTypeSelectionsC(productSubTypeFilter.groupedOptions);
    }
  }

  private expandSubTypeSelectionIfAllAlreadySelected(
  productSubTypeFilter: any
): void {
  const currentSelection = this.selectedValues['product_sub_type'] || [];

  // ✅ Only when ALL was already selected
  if (!currentSelection.includes(-1)) {
    return;
  }

  // Collect all currently visible sub-type values
  const allVisibleSubTypeValues: any[] = [];

  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allVisibleSubTypeValues.push(opt.value);
    });
  });

  // Merge existing + new values
  const mergedSelection = new Set<any>([
    -1,
    ...currentSelection,
    ...allVisibleSubTypeValues
  ]);

  this.selectedValues['product_sub_type'] = Array.from(mergedSelection);
}

  private expandSubTypeSelectionIfAllAlreadySelectedC(
  productSubTypeFilter: any
): void {
  const currentSelection = this.selectedValuesC['product_sub_type'] || [];

  // ✅ Only when ALL was already selected
  if (!currentSelection.includes(-1)) {
    return;
  }

  // Collect all currently visible sub-type values
  const allVisibleSubTypeValues: any[] = [];

  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allVisibleSubTypeValues.push(opt.value);
    });
  });

  // Merge existing + new values
  const mergedSelection = new Set<any>([
    -1,
    ...currentSelection,
    ...allVisibleSubTypeValues
  ]);

  this.selectedValuesC['product_sub_type'] = Array.from(mergedSelection);
}

// Auto-select all visible sub-type options when a specific product type is selected
private selectAllVisibleSubTypes(productSubTypeFilter: any): void {
  const allVisibleSubTypeValues: any[] = [];

  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allVisibleSubTypeValues.push(opt.value);
    });
  });

  // Select all visible sub-type options with -1 (All) included
  this.selectedValues['product_sub_type'] = [-1, ...allVisibleSubTypeValues];
}

// Auto-select all visible sub-type options for comparison filter
private selectAllVisibleSubTypesC(productSubTypeFilter: any): void {
  const allVisibleSubTypeValues: any[] = [];

  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allVisibleSubTypeValues.push(opt.value);
    });
  });

  // Select all visible sub-type options with -1 (All) included
  this.selectedValuesC['product_sub_type'] = [-1, ...allVisibleSubTypeValues];
}

private normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}


  // Custom matching logic for product type to group mapping
  isProductTypeGroupMatch(productTypeLabel: string, groupName: string): boolean {
    // Define custom mappings here
    const customMappings: { [key: string]: string[] } = {
      'bank line': ['bank line'],
      'commercial paper': ['commercial paper'],
      'corporate card': ['corporate card'],
      'exim': ['exim loans', 'exim'],
      'exim loans': ['exim loans', 'exim'],
      'export': ['exim loans'],
      'import': ['exim loans'],
      'factoring': ['factoring'],
      'fund based': ['fund based'],
      'non fund based': ['non fund based'],
      'others': ['others'],
      'secured': ['secured'],
      'term loan': ['term loan'],
      'treasury': ['treasury'],
      // Add more custom mappings as needed
    };

    // First try exact key match to avoid partial matches (e.g. "fund based" matching "non fund based")
    if (customMappings[productTypeLabel]) {
      return customMappings[productTypeLabel].some(mappedGroupName => mappedGroupName === groupName);
    }

    // Then try partial key match for cases like "export" matching "exim loans"
    for (const [productType, groupNames] of Object.entries(customMappings)) {
      if (productTypeLabel.includes(productType) || productType.includes(productTypeLabel)) {
        return groupNames.some(mappedGroupName => mappedGroupName === groupName);
      }
    }

    // Fallback: exact match only to avoid substring false positives
    return productTypeLabel === groupName;
  }

  // Clear invalid sub-type selections when groups are filtered
  clearInvalidSubTypeSelections(filteredGroups: GroupedOption[]): void {
    const currentSubTypeSelection = this.selectedValues['product_sub_type'];
    
    if (!currentSubTypeSelection || !Array.isArray(currentSubTypeSelection)) {
      return;
    }

    // Get all valid values from filtered groups
    const validValues = new Set<any>();
    filteredGroups.forEach(group => {
      group.options.forEach(option => {
        validValues.add(option.value);
      });
    });

    // Filter current selection to keep only valid values
    const filteredSelection = currentSubTypeSelection.filter(value => 
      value === -1 || validValues.has(value)
    );

    // Update selection if it changed
    if (filteredSelection.length !== currentSubTypeSelection.length) {
      this.selectedValues['product_sub_type'] = filteredSelection;
    }
  }

    clearInvalidSubTypeSelectionsC(filteredGroups: GroupedOption[]): void {
    const currentSubTypeSelection = this.selectedValuesC['product_sub_type'];
    
    if (!currentSubTypeSelection || !Array.isArray(currentSubTypeSelection)) {
      return;
    }

    // Get all valid values from filtered groups
    const validValues = new Set<any>();
    filteredGroups.forEach(group => {
      group.options.forEach(option => {
        validValues.add(option.value);
      });
    });

    // Filter current selection to keep only valid values
    const filteredSelection = currentSubTypeSelection.filter(value => 
      value === -1 || validValues.has(value)
    );

    // Update selection if it changed
    if (filteredSelection.length !== currentSubTypeSelection.length) {
      this.selectedValuesC['product_sub_type'] = filteredSelection;
    }
  }

  selectAllProductSubTypes(productSubTypeFilter: any): void {
  // Restore all groups
  productSubTypeFilter.groupedOptions = [
    ...productSubTypeFilter.originalGroupedOptions
  ];

  // Collect all sub-type values
  const allSubTypeValues: any[] = [];
  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allSubTypeValues.push(opt.value);
    });
  });

  // ✅ Set selection: ['all', ...values]
  this.selectedValues['product_sub_type'] = [-1, ...allSubTypeValues];
}

  selectAllProductSubTypesC(productSubTypeFilter: any): void {
  // Restore all groups
  productSubTypeFilter.groupedOptions = [
    ...productSubTypeFilter.originalGroupedOptions
  ];

  // Collect all sub-type values
  const allSubTypeValues: any[] = [];
  productSubTypeFilter.groupedOptions.forEach(group => {
    group.options.forEach(opt => {
      allSubTypeValues.push(opt.value);
    });
  });

  // ✅ Set selection: ['all', ...values]
  this.selectedValuesC['product_sub_type'] = [-1, ...allSubTypeValues];
}


  onSelectionChangeC(value: any, filter: any) {
    this.selectedValuesC[filter.filter_name] = value;
    // Always call handleProductTypeDependencyC to update groupedOptions
    // The skipSubTypeAutoSelectC flag only controls whether to auto-select all sub-types
    if (filter.filter_name === 'product_type') {
      this.handleProductTypeDependencyC(value, this.skipSubTypeAutoSelectC);
    }
    if (this.radioValueC === 3) {
      this.selectedValuesC['wallet'] = [];
      this.isWalletDisabled = true;
      return;
    }
    this.isWalletDisabled = false;
    if (
      filter.filter_name === 'wallet' &&
      Array.isArray(value) &&
      value.length > 0
    ) {
      this.clearWalletMinMax = true; 
      this.minValue = null;
      this.maxValue = null;
      
      setTimeout(() => this.clearWalletMinMax = false);
      return;
    }

    if (
      filter.filter_name === 'wallet' &&
      Array.isArray(value) &&
      value.length === 0
    ) {
      return;
    }
  }

  onMinMaxChanged(event: { min: any; max: any }, filter: any) {
  this.minValue = event.min === '' ? null : event.min;
  this.maxValue = event.max === '' ? null : event.max;
}

  onOptionSelectedF(value: any) {
  if (this.lastSelectedOption === value) return;
  this.lastSelectedOption = value;

  const datasetKey = this.currentDatasetName;

  this.selectedValuesC = {
    ...this.selectedValuesC,
    [datasetKey]: value
  };

  console.log('Selected option:', value);
  
  setTimeout(() => {
    this.searchViewBySelectionChanged.emit(this.selectModel);
    // Emit the current options so they can be saved for restoration
    this.searchViewByOptionsChanged.emit(this.OptionArray);
  }, 0);
  }

  onSummaryToggleChange(value: boolean) {
    this.showComparison = value;
    this.showSummaryChange.emit(value);
    
    // Restore filter state when switching back to Summary view
    if (!value) {
      // Switching to Summary view - set flag to skip auto-selection
      this.skipSubTypeAutoSelect = true;
      
      // Ensure date_of_report is set
      if (!this.selectedValues.hasOwnProperty('date_of_report') || this.selectedValues['date_of_report'] === undefined) {
        const dateFilter = this.topBarFilters?.find(f => f.filter_name === 'date_of_report');
        if (dateFilter?.options && dateFilter.options.length > 0) {
          this.selectedValues['date_of_report'] = dateFilter.options[0].value;
        }
      }
      
      // Switching to Summary view - restore product_sub_type groupedOptions based on current product_type selection
      const currentProductType = this.selectedValues['product_type'];
      if (currentProductType && Array.isArray(currentProductType) && currentProductType.length > 0) {
        // Temporarily store the current product_sub_type selection
        const currentSubTypeSelection = [...(this.selectedValues['product_sub_type'] || [])];
        // Re-apply the product type dependency to restore groupedOptions without auto-selecting
        this.handleProductTypeDependency(currentProductType, true);
        
        // Restore the original sub-type selection
        if (currentSubTypeSelection.length > 0) {
          this.selectedValues['product_sub_type'] = currentSubTypeSelection;
        } else {
          // If no sub-type selection was stored, check if all product types are selected
          // and auto-select all sub-types
          const productTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_type');
          const allProductTypeValues = productTypeFilter?.options?.map(o => o.value) || [];
          const isAllProductTypeSelected = currentProductType.length === allProductTypeValues.length &&
            allProductTypeValues.every(v => currentProductType.includes(v));
          
          if (isAllProductTypeSelected) {
            // All product types selected, so select all sub-types
            const productSubTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_sub_type');
            if (productSubTypeFilter?.originalGroupedOptions) {
              const allSubTypeValues: any[] = [];
              productSubTypeFilter.originalGroupedOptions.forEach(group => {
                group.options.forEach(opt => {
                  allSubTypeValues.push(opt.value);
                });
              });
              this.selectedValues['product_sub_type'] = [-1, ...allSubTypeValues];
            }
          }
        }
        
        // Call Summary API when switching to Summary tab
        this.applyFilters();
      } else {
        // No product type selected in Summary - check if we need to restore from initial state
        // This handles the case where user went to Comparison first without selecting anything in Summary
        const productTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_type');
        if (productTypeFilter?.options && productTypeFilter.options.length > 0) {
          // Auto-select all product types (without -1, let the component detect "All" automatically)
          const allProductTypeValues = productTypeFilter.options.map(o => o.value);
          this.selectedValues['product_type'] = [...allProductTypeValues];
          
          // Re-apply the product type dependency to set up groupedOptions and auto-select all sub-types
          this.handleProductTypeDependency(allProductTypeValues, false);
          
          // Call Summary API when switching to Summary tab
          this.applyFilters();
        }
      }
      
      // Reset the flag after a short delay to allow Angular to process the change
      setTimeout(() => {
        this.skipSubTypeAutoSelect = false;
        this.skipProductTypeAutoSelect = false;
        this.cdr.detectChanges();
      }, 100);
    } else {
      // Switching to Comparison view - only skip auto-selection if we have existing selections to preserve
      const hasExistingSubTypeSelection = this.selectedValuesC['product_sub_type'] && 
                                          Array.isArray(this.selectedValuesC['product_sub_type']) &&
                                          this.selectedValuesC['product_sub_type'].length > 0;
      
      if (hasExistingSubTypeSelection) {
        this.skipSubTypeAutoSelectC = true;
      }
      
      // Switching to Comparison view - restore product_sub_type groupedOptions for comparison filters
      const currentProductTypeC = this.selectedValuesC['product_type'];
      if (currentProductTypeC && Array.isArray(currentProductTypeC) && currentProductTypeC.length > 0) {
        // Temporarily store the current product_sub_type selection
        const currentSubTypeSelectionC = [...(this.selectedValuesC['product_sub_type'] || [])];
        // Re-apply the product type dependency to restore groupedOptions without auto-selecting
        this.handleProductTypeDependencyC(currentProductTypeC, true);
        // Restore the original sub-type selection
        if (currentSubTypeSelectionC.length > 0) {
          this.selectedValuesC['product_sub_type'] = currentSubTypeSelectionC;
        }
      }
      
      // Reset the flag after a short delay to allow Angular to process the change
      setTimeout(() => {
        this.skipSubTypeAutoSelectC = false;
      }, 100);
    }
  }

  resetFilters() {
    const dateOfReport = this.selectedValues['date_of_report'];
    this.selectedValues = {
      date_of_report: dateOfReport,
      product_type: null,
      cmr:null,
      psl_status: null,
      utilization_wallet_pct: null,
      product_sub_type: []
    };
    
    // Reset product_sub_type grouped options to hide all groups
    this.resetProductSubTypeGroups();
    
    this.filtersStateChanged.emit(false);
    this.filtersApplied.emit({
      ...this.selectedValues,
      which_level: this.radioValue
    });
  }

  // Reset product sub-type groups to show all options
  resetProductSubTypeGroups(): void {
    const productSubTypeFilter = this.topBarFilters?.find(f => f.filter_name === 'product_sub_type');
    
    if (productSubTypeFilter && productSubTypeFilter.originalGroupedOptions) {
      productSubTypeFilter.groupedOptions = [...productSubTypeFilter.originalGroupedOptions];
    }
  }

    resetProductSubTypeGroupsC(): void {
    const productSubTypeFilter = this.topBarFiltersC?.find(f => f.filter_name === 'product_sub_type');
    
    if (productSubTypeFilter && productSubTypeFilter.originalGroupedOptions) {
      productSubTypeFilter.groupedOptions = [...productSubTypeFilter.originalGroupedOptions];
    }
  }

  resetFiltersC() {
    const dateOfReport = this.selectedValuesC['date_of_report'];
    const calculationOn = this.selectedValuesC['calculation_on'];
    this.selectedValuesC = {
      date_of_report: dateOfReport,
      gain_or_loss: 1,
      calculation_on: calculationOn,
      wallet: null,
      company_name_search: [],
      product_type: null,
      product_sub_type: []
    };
    this.radioValueC = 3;
    this.maxValue = null;
    this.minValue = null;
    this.mySelectedValue = '';
    this.isDisabled = true;
    this.selectModel = [];
    this.OptionArray = [];
    this.searchByDataHistory = {};
    this.currentDatasetId = null;
    this.currentDatasetName = null;
    this.isInitialLoad = true;

    this.resetFlag = true;

    this.resetProductSubTypeGroupsC();

    setTimeout(() => {
      this.resetFlag = false;
      this.resetAppliedC.emit({
        ...this.selectedValuesC,
      });
    }, 100);
  }

  utilizationWalletCheckBoxValue(filter : any){
    const filterId = this.filters.find(f => f.filter_name === "utilization_wallet_pct")?.filter_id;
    const dependanTFilterId = this.filters.find(f => f.filter_name === "which_level")?.filter_id;
    const payload = {
      "dashboard_id": 2,
      "child_filter_id": filterId,
      "parent_filter_id": dependanTFilterId,
      "filter_values": {
        "which_level": 2
      }
    };


    if(filter.filter_name === 'utilization_wallet_pct' && !this.isUtilizationLoaded) {
      this.msmeService.getPrDashboardDependentFilterList(payload).subscribe((response) => {
        const options = response.data.dependent_filters.options;

        this.isUtilizationLoaded = true;
        this.loadedUtilizationOptions = options.map(o => ({
          label: o.key,
          value: o.value
        }));
        filter.options = this.loadedUtilizationOptions;
      })
    }
  }

    setupTopBarRadioFilter() {
    const filterNames = ['which_level'];
     const filter = this.filters.find(f => filterNames.includes(f.filter_name));
      if (filter && filter.options?.length) {
        this.topBarRadioFilters = filter.options.map(o => ({
          label: o.key,
          value: o.value
        }));
      } else {
        this.topBarRadioFilters = [];
      }
  }

  setupTopBarRadioFilterC() {
    const filterNames = ['gain_or_loss'];
     const filter = this.filtersC.find(f => filterNames.includes(f.filter_name));
      if (filter && filter.options?.length) {
        this.topBarRadioFiltersC = filter.options.map(o => ({
          label: o.key,
          value:  o.value === undefined ? null : o.value
        }));
      } else {
        this.topBarRadioFiltersC = [];
      }
  }

  setupTopBarFilter() {
    const filterNames = ['product_type','product_sub_type', 'utilization_wallet_pct', 'date_of_report','cmr','psl_status'];
    this.topBarFilters = this.filters.filter(f => filterNames.includes(f.filter_name))
      .sort((a, b) => filterNames.indexOf(a.filter_name) - filterNames.indexOf(b.filter_name))
      .map(f => {
      let isMultiple = true;
      let searchEnabled = true;
      let isShowRadioGroup = false;
      let groupedOptions = null;
      if (f.filter_name === 'date_of_report') {
        isMultiple = false;
        searchEnabled = false;
      }
      if (f.filter_name === 'psl_status') {
        isMultiple = true;
        searchEnabled = true;
        isShowRadioGroup: false;
      }
      if (f.filter_name === 'utilization_wallet_pct') {
        isMultiple = true;
        searchEnabled = true;
        isShowRadioGroup = true;
      }

        if (f.filter_name === 'product_sub_type') {
          groupedOptions = (f.options || []).map((grp: any) => ({
            parentId: grp.parent_id,
            groupName: grp.group_name,
            options: (grp.options || []).map((opt: any) => ({
              label: opt.label,
              value: opt.value
            }))
          }));
        }

      // if (f.filter_name === 'psl_status') {
      //   const options = f.options?.map(o => ({ label: o.key, value: o.value })) || [];

      //   this.selectedValues['psl_status'] = null;

      //   return {
      //     ...f,
      //     options,
      //     isMultiple: true,
      //     searchEnabled: true,
      //     isShowRadioGroup: false
      //   };
      // }

      let options = f.options
        ?.filter(o => o.key && o.value)
        .map(o => ({ label: o.key, value: o.value })) || [];

      // Restore cached utilization_wallet_pct options if they were previously loaded from the dependent filter API
      if (f.filter_name === 'utilization_wallet_pct' && this.loadedUtilizationOptions) {
        options = this.loadedUtilizationOptions;
      }

      if (f.filter_name === 'date_of_report' && options.length > 0) {
        this.selectedValues = this.selectedValues || {};
        // Only set default if no date is already selected
        if (!this.selectedValues[f.filter_name]) {
          this.selectedValues[f.filter_name] = options[0].value;
        }
      }

      return {
        ...f,
        options: f.filter_name === 'product_sub_type' ? [] : options,
        groupedOptions: f.filter_name === 'product_sub_type' ? [] : groupedOptions,
        originalGroupedOptions: f.filter_name === 'product_sub_type' ? [...(groupedOptions || [])] : undefined,
        isMultiple,
        searchEnabled,
        isShowRadioGroup
      };
    });
  }

    setupTopBarFilterC() {
    const filterNames = ['product_type','product_sub_type', 'calculation_on','wallet', 'date_of_report'];
    this.topBarFiltersC = this.filtersC.filter(f => filterNames.includes(f.filter_name))
      .sort((a, b) => filterNames.indexOf(a.filter_name) - filterNames.indexOf(b.filter_name))
      .map(f => {
      let isMultiple = true;
      let searchEnabled = true;
      let isShowRadioGroup = false;
      let isshowMinCount = false;
      let groupedOptions = null;
        if (f.filter_name === 'calculation_on') {
          const options = f.options
            ?.filter(o => o.key && o.value)
            .map(o => ({ label: o.key, value: o.value })) || [];
          isMultiple = false;
          searchEnabled = false;
          this.selectedValuesC = this.selectedValuesC || {};
          // Only set default if not already restored
          if (this.selectedValuesC[f.filter_name] === undefined || this.selectedValuesC[f.filter_name] === null) {
            this.selectedValuesC[f.filter_name] = options.length > 1 ? options[1].value : options[0].value;
          }
        }
      if (f.filter_name === 'date_of_report') {
                  const options = f.options
            ?.filter(o => o.key && o.value)
            .map(o => ({ label: o.key, value: o.value })) || [];
          isMultiple = false;
          searchEnabled = false;
          this.selectedValuesC = this.selectedValuesC || {};
          // Set default if not already restored, or if current value doesn't exist in available options
          const currentValue = this.selectedValuesC[f.filter_name];
          const valueExistsInOptions = options.some(o => o.value === currentValue);
          if (currentValue === undefined || currentValue === null || !valueExistsInOptions) {
            this.selectedValuesC[f.filter_name] = options.length > 0 ? options[0].value : null;
          }


        isMultiple = false;
        searchEnabled = false;
      }
      if (f.filter_name === 'wallet') {
        isMultiple = true;
        searchEnabled = true;
        isShowRadioGroup = true;
        isshowMinCount = true;
      }
      if (f.filter_name === 'product_sub_type') {
          groupedOptions = (f.options || []).map((grp: any) => ({
            parentId: grp.parent_id,
            groupName: grp.group_name,
            options: (grp.options || []).map((opt: any) => ({
              label: opt.label,
              value: opt.value
            }))
          }));
        }

      const options = f.options
        ?.filter(o => o.key && o.value)
        .map(o => ({ label: o.key, value: o.value })) || [];

      // if (f.filter_name === 'date_of_report' && options.length > 0) {
      //   this.selectedValues = this.selectedValues || {};
      //   this.selectedValues[f.filter_name] = options[0].value;
      // }

      return {
        ...f,
        options: f.filter_name === 'product_sub_type' ? [] : options,
        groupedOptions: f.filter_name === 'product_sub_type' ? groupedOptions : null,
        originalGroupedOptions: f.filter_name === 'product_sub_type' ? [...(groupedOptions || [])] : undefined,
        isMultiple,
        searchEnabled,
        isShowRadioGroup,
        isshowMinCount
      };
    });

    // Auto-select all product_sub_type values when data is loaded from cookie
    // Use setTimeout to avoid NG0100 ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      const productSubTypeFilter = this.topBarFiltersC?.find(f => f.filter_name === 'product_sub_type');
      if (productSubTypeFilter?.originalGroupedOptions?.length > 0) {
        
        // Check if product_sub_type is not already set AND we're not restoring filters
        if ((!this.selectedValuesC['product_sub_type'] || this.selectedValuesC['product_sub_type'].length === 0) && !this.skipSubTypeAutoSelectC) {
          // Collect all sub-type values
          const allSubTypeValues: any[] = [];
          productSubTypeFilter.originalGroupedOptions.forEach(group => {
            group.options.forEach(opt => {
              allSubTypeValues.push(opt.value);
            });
          });
          // Set selection with -1 (All) included
          this.selectedValuesC['product_sub_type'] = [-1, ...allSubTypeValues];
          // Set groupedOptions to show all groups
          productSubTypeFilter.groupedOptions = [...productSubTypeFilter.originalGroupedOptions];
          productSubTypeFilter.showGroupedAll = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

    setupComparisonTopBarFilter() {
    const searchByFilter = this.filtersC.find(f => f.filter_name === 'search_by');
    if (!searchByFilter) return;

        this.optionList = searchByFilter.options.map(opt => opt.key);
        // Only set default 'Product' if not restoring filters and no value selected
        if (this.optionList.includes('Product') && !this.mySelectedValue && !this.isRestoringFilters) {
          setTimeout(() => {
            this.onOptionSelected('Product');
          });
        } else if (this.isRestoringFilters && this.restoredFiltersC?.group_by_column) {
          // Re-apply the restored Search View By selection after optionList is populated
          const groupByColumn = this.restoredFiltersC.group_by_column;
          const viewByMapping: { [key: string]: string } = {
            'seg_name': 'Segment',
            'city_name': 'City',
            'employee_name': 'RM',
            'cust.cust_name': 'Customer',
            'fin.parent_product_display_name': 'Product'
          };
          const viewByValue = viewByMapping[groupByColumn];
          if (viewByValue && this.optionList.includes(viewByValue)) {
            setTimeout(() => {
              this.mySelectedValue = viewByValue;
              this.viewByName = groupByColumn;
              this.isDisabled = false;
              this.viewByChanged.emit(viewByValue);
              this.cdr.detectChanges();
            });
          }
        }
    }

    callDashboardApiC(dataSetid: number, dataSetName: any, append: boolean = false) {
    if (!append) {
      this.page_offset = 0;
    }
      if (!this.searchByDataHistory[dataSetid]) {
    this.searchByDataHistory[dataSetid] = {
      searchValue: '',
      isCalled: false,
      dataset_name: dataSetName,
      data: [],
      page_size: this.page_size,
      page_offset: this.page_offset
    };
  }

  const currentCache = this.searchByDataHistory[dataSetid];
  const searchValue = currentCache.searchValue?.trim() || '';

    if (!append && currentCache.isCalled && searchValue === '') {
    console.log('Using cached default data');
    this.OptionArray = currentCache.data.map((item: any) => ({
      label: item.key?.trim() || '',
      value: item.value
    }));
     if (this.isInitialLoad && (!this.selectModel || this.selectModel.length === 0)) {
      this.selectModel = this.OptionArray.map(opt => opt.value);
      this.isInitialLoad = false;
    }
    return;
  }

    const payload = {
      dashboard_id : 3,
      dataset_id: dataSetid,
      [dataSetName]: searchValue && searchValue.trim().length > 2 ? searchValue.trim() : null,
      page_size: this.page_size,
      page_offset: this.page_offset
    };
    this.msmeService.getPrDashboardDependentFilterData(payload).subscribe({
      next: (res) => {
          if (res && res.data?.data) {
            const newData = res.data.data;
            if (append) {
               const existingValues = new Set(currentCache.data.map((item: any) => item.value));
              const newUniqueData = newData.filter((item: any) => !existingValues.has(item.value));
              currentCache.data = [...currentCache.data, ...newUniqueData];
            }
            else if (currentCache.data.length === 0) {
              currentCache.data = newData;
            }
            else if (searchValue && searchValue.trim().length >= 3) {
               const existingValues = new Set(currentCache.data.map((item: any) => item.value));
              const newUniqueData = newData.filter((item: any) => !existingValues.has(item.value));
              currentCache.data = [...currentCache.data, ...newUniqueData];
            }
            else {
              console.log("📌 Prevented first-page overwrite on reopen");
            }

        currentCache.isCalled = true;
        currentCache.page_offset = this.page_offset;
        currentCache.page_size = this.page_size;

if (searchValue === '' && (!this.defaultCache || this.defaultCache.length === 0)) {
  this.defaultCache = [...newData];
}
          const uniqueDataMap = new Map();
         currentCache.data.forEach((item: any) => {
           if (!uniqueDataMap.has(item.value)) {
             uniqueDataMap.set(item.value, item);
           }
         });

         this.OptionArray = Array.from(uniqueDataMap.values()).map((item: any) => ({
          label: item.key?.trim() || '',
          value: item.value
        }));

         const wasAllUnselected = currentCache.wasAllUnselected === true;
        const isCurrentlySearching = searchValue && searchValue.trim().length > 0;

         if (this.isInitialLoad && (!this.selectModel || this.selectModel.length === 0) && !isCurrentlySearching) {
           this.selectModel = this.OptionArray.map(opt => opt.value);
          this.isInitialLoad = false;
          this.searchViewBySelectionChanged.emit(this.selectModel);
        } else if (!append) {
          const isCurrentlySearching = searchValue && searchValue.trim().length > 0;

          if (!isCurrentlySearching) {
            const allCurrentValues = this.OptionArray.map(opt => opt.value);
            const hasAnySelected = this.selectModel.some(val => allCurrentValues.includes(val));
            if (!hasAnySelected) {
              this.selectModel = [...allCurrentValues];
              this.searchViewBySelectionChanged.emit(this.selectModel);
            }
          }
        }
      }
      this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }

  // Fetch selected items by their IDs to ensure they appear in the dropdown when restoring
  // This method fetches items that were previously selected but may not be in the first page of results
  fetchSelectedItemsByIds(dataSetid: number, dataSetName: string, selectedIds: any[]) {
    if (!selectedIds || selectedIds.length === 0) {
      return;
    }

    // Create payload to fetch items - pass selected_ids to backend
    // The backend should return items matching these IDs
    const payload = {
      dashboard_id: 3,
      dataset_id: dataSetid,
      [dataSetName]: null, // No search text
      page_size: Math.max(selectedIds.length, 50),
      page_offset: 0
    };

    this.msmeService.getPrDashboardDependentFilterData(payload).subscribe({
      next: (res) => {
        if (res && res.data?.data) {
          const fetchedData = res.data.data;
          
          // Filter to only include items that match our selected IDs
          const selectedItemsData = fetchedData.filter((item: any) => 
            selectedIds.includes(item.value)
          );
          
          if (selectedItemsData.length > 0) {
            // Add selected items to OptionArray if they don't already exist
            const existingValues = new Set(this.OptionArray.map(opt => opt.value));
            const newItems = selectedItemsData
              .filter((item: any) => !existingValues.has(item.value))
              .map((item: any) => ({
                label: item.key?.trim() || '',
                value: item.value
              }));
            
            if (newItems.length > 0) {
              // Add selected items at the beginning of the array so they're visible
              this.OptionArray = [...newItems, ...this.OptionArray];
              
              // Also update the cache
              const currentCache = this.searchByDataHistory[dataSetid];
              if (currentCache) {
                const existingCacheValues = new Set(currentCache.data.map((item: any) => item.value));
                const newCacheItems = selectedItemsData.filter((item: any) => !existingCacheValues.has(item.value));
                currentCache.data = [...newCacheItems, ...currentCache.data];
              }
              
              this.cdr.detectChanges();
            }
          }
        }
      },
      error: (err) => {
        console.error('Error fetching selected items:', err);
      }
    });
  }

  onSearchValueChanged(value: string) {
    console.log("On value changedd");

  const dataSetId = this.currentDatasetId;
  const dataSetName = this.currentDatasetName;
    const trimmedValue = value ? value.trim() : '';
    if (!value || trimmedValue === '') {
       if (this.searchByDataHistory[dataSetId]) {
        this.searchByDataHistory[dataSetId].searchValue = '';
        this.searchByDataHistory[dataSetId].page_offset = 0;
        this.searchByDataHistory[dataSetId].isCalled = false;
      }

       if (this.defaultCache && this.defaultCache.length > 0) {
         this.OptionArray = this.defaultCache.map((item: any) => ({
          label: item.key?.trim() || '',
          value: item.value
        }));
         if (this.searchByDataHistory[dataSetId]) {
          this.searchByDataHistory[dataSetId].data = [...this.defaultCache];
          this.searchByDataHistory[dataSetId].isCalled = true;
        }
         if (this.isInitialLoad && (!this.selectModel || this.selectModel.length === 0)) {
          this.selectModel = this.OptionArray.map(opt => opt.value);
          this.isInitialLoad = false;
        }
        return;
      }
       this.callDashboardApiC(dataSetId, dataSetName, false);
      return;
    }

   const trimmedSearchValue = value.trim();
  if (trimmedSearchValue.length < 3) {
  const cache = this.searchByDataHistory[dataSetId];

  if (cache && cache.data.length > 0) {
    console.log("📌 Using cached data for <3 chars search");
     this.OptionArray = cache.data.map(item => ({
      label: item.key?.trim() || '',
      value: item.value
    }));
    return;
  }

   if (this.defaultCache && this.defaultCache.length > 0) {
    this.OptionArray = this.defaultCache.map(item => ({
      label: item.key?.trim() || '',
      value: item.value
    }));
  }
  return;
  }

   const searchValueToStore = trimmedSearchValue;

   const wasAllUnselected = !this.selectModel || this.selectModel.length === 0;

   const cache = this.searchByDataHistory[dataSetId];
  if (cache && cache.data && cache.data.length > 0) {
    this.OptionArray = cache.data.map(item => ({
      label: item.key?.trim() || '',
      value: item.value
    }));

    if (!this.searchByDataHistory[dataSetId]) {
      this.searchByDataHistory[dataSetId] = {
        searchValue: searchValueToStore,
        isCalled: false,
        dataset_name: dataSetName,
        data: cache.data,
        page_size: this.page_size,
        page_offset: 0,
        wasAllUnselected: wasAllUnselected
      };
    } else {
       this.searchByDataHistory[dataSetId].searchValue = searchValueToStore;
      this.searchByDataHistory[dataSetId].page_offset = 0;
      this.searchByDataHistory[dataSetId].isCalled = false;
      this.searchByDataHistory[dataSetId].wasAllUnselected = wasAllUnselected;
    }

     this.callDashboardApiC(dataSetId, dataSetName, false);
  } else {
     if (!this.searchByDataHistory[dataSetId]) {
      this.searchByDataHistory[dataSetId] = {
        searchValue: searchValueToStore,
        isCalled: false,
        dataset_name: dataSetName,
        data: [],
        page_size: this.page_size,
        page_offset: 0,
        wasAllUnselected: wasAllUnselected
      };
    } else {
      this.searchByDataHistory[dataSetId].searchValue = searchValueToStore;
      this.searchByDataHistory[dataSetId].page_offset = 0;
      this.searchByDataHistory[dataSetId].isCalled = false;
      this.searchByDataHistory[dataSetId].wasAllUnselected = wasAllUnselected;
    }

    this.callDashboardApiC(dataSetId, dataSetName, false);
  }
}

onScroll() {
  console.log('📜 Reached bottom in parent');

  if (this.isLoading || !this.mySelectedValue || !this.searchByDataHistory) {
    return;
  }

  const dataSetId = this.currentDatasetId;
  const dataSetName = this.currentDatasetName;

   if (!this.searchByDataHistory) {
    this.searchByDataHistory = {};
  }

   if (!this.searchByDataHistory[dataSetId]) {
    this.searchByDataHistory[dataSetId] = {
      searchValue: '',
      isCalled: false,
      dataset_name: dataSetName,
      data: [],
      page_size: this.page_size || 50,
      page_offset: 0
    };
  }


  // Now safe to access
  this.page_offset = this.searchByDataHistory[dataSetId].page_offset ?? 0;
  this.page_offset += this.page_size;
  this.searchByDataHistory[dataSetId].page_offset = this.page_offset;
  this.searchByDataHistory[dataSetId].isCalled = false;

  console.log('📜 Infinite scroll - loading more...');
  this.isLoading = true;
  this.callDashboardApiC(dataSetId, dataSetName, true);
}

onDropdownOpened() {
  const id = this.currentDatasetId;
  const name = this.currentDatasetName;

  if (!id) return;

  const cache = this.searchByDataHistory[id];

  if (cache && cache.data && cache.data.length > 0) {
    console.log("📌 Restoring cached data on reopen");

    this.OptionArray = cache.data.map(item => ({
      label: item.key,
      value: item.value
    }));

    this.page_offset = cache.page_offset;

    return;
  }


  this.page_offset = 0;
  this.callDashboardApiC(id, name, false);
}




  getIcon(filterName: string): string {
  switch (filterName) {
    case 'product_type': return 'fi fi-rr-cube red_text mr-1';
    case 'utilization_wallet_pct': return 'fi fi-rr-wallet red_text mr-1';
    case 'wallet': return 'fi fi-rr-wallet red_text mr-1';
    case 'calculation_on': return 'fi fi-sr-stats mr-1 red_text';
    case 'date_of_report': return 'fi fi-rr-calendar-day red_text mr-1';
    case 'cmr': return 'fi fi-rr-analytics red_text mr-1';
    case 'psl_status': return 'fi fi-rr-chart-line-up red_text mr-1';
    case 'product_sub_type': return 'fi fi-rr-layers red_text mr-1';
    default: return 'fi fi-rr-filter red_text mr-1';
  }
}

  getInfoTooltip(filter: any): string {
    const tooltipMap: { [key: string]: string } = {
      'product_type': 'Select product types to filter',
      'psl_status': 'Click to view PSL status details',
      'date_of_report': 'Click to view Date of report details',
      'utilization_wallet_pct': 'Click to view Utilization Wallet % details',
      'cmr': 'Click to view CMR score details',
      'product_sub_type': 'Select product sub-types grouped by category'
    };
    return tooltipMap[filter?.filter_name] || '';
  }

  shouldUsePopup(filter: any): boolean {
    const popupFilters = ['product_type', 'psl_status', 'date_of_report', 'utilization_wallet_pct', 'cmr'];
    return popupFilters.includes(filter?.filter_name);
  }

  getPopupData(filter: any): any {
    if (filter?.filter_name === 'psl_status') {
      return {
        filterName: filter?.filter_name,
        filterLabel: filter?.filter_label,
        filter: filter,
        tooltipType: 'psl_tooltips'
      };
    }
    if (filter?.filter_name === 'date_of_report') {
      return {
        filterName: filter?.filter_name,
        filterLabel: filter?.filter_label,
        filter: filter,
        tooltipType: 'date_report_popup'
      };
    }
    if (filter?.filter_name === 'utilization_wallet_pct') {
      return {
        filterName: filter?.filter_name,
        filterLabel: filter?.filter_label,
        filter: filter,
        tooltipType: 'utilization_wallet_popup'
      };
    }
    if (filter?.filter_name === 'cmr') {
      return {
        filterName: filter?.filter_name,
        filterLabel: filter?.filter_label,
        filter: filter,
        tooltipType: 'cmr_popup'
      };
    }
    return {
      filterName: filter?.filter_name,
      filterLabel: filter?.filter_label,
      filter: filter
    };
  }

  onOpenTooltipPopup(popupData: any): void {
    this.TooltipDetailPopup(popupData);
  }

  private checkIfFiltersApplied(): boolean {
    return Object.keys(this.selectedValues).some(key => {
      if (key === 'date_of_report') return false; // Exclude date_of_report as it's always selected
      const value = this.selectedValues[key];
      return value !== null && value !== undefined &&
             (Array.isArray(value) ? value.length > 0 : true);
    });
  }

  isApplyDisabled(): boolean {
    const productType = this.selectedValues['product_type'];
    const productSubType = this.selectedValues['product_sub_type'];
    
    // Disable if no product type is selected
    if (!productType || !Array.isArray(productType) || productType.length === 0) {
      return true;
    }
    
    // Disable if product type is selected but no product sub type is selected
    if (!productSubType || !Array.isArray(productSubType) || productSubType.length === 0) {
      return true;
    }
    
    return false;
  }

    isApplyDisabledC(): boolean {
    const productType = this.selectedValuesC['product_type'];
    const productSubType = this.selectedValuesC['product_sub_type'];
    
    // Disable if no product type is selected
    if (!productType || !Array.isArray(productType) || productType.length === 0) {
      return true;
    }
    
    // Disable if product type is selected but no product sub type is selected
    if (!productSubType || !Array.isArray(productSubType) || productSubType.length === 0) {
      return true;
    }
    
    return false;
  }

}
