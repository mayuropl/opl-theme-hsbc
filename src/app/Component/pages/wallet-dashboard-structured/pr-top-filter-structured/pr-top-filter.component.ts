import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TooltipDetailPopupComponent } from 'src/app/Popup/HSBC/tooltip-detail-popup/tooltip-detail-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {Constants} from '../../../../CommoUtils/constants';

@Component({
  selector: 'app-pr-top-filter-structured',
  templateUrl: './pr-top-filter.component.html',
  styleUrl: './pr-top-filter.component.scss'
})
export class PrTopFilterStructuredComponent implements OnChanges, OnInit {
  showFilter: boolean = false;
  showComparison: boolean = false;
  @Input() filters: any[] = [];
  @Input() filtersC: any[] = [];
  @Input() datasetsC: any[] = [];
  @Output() filtersApplied = new EventEmitter<any>();
  @Output() filtersAppliedC = new EventEmitter<any>();
  @Output() resetAppliedC = new EventEmitter<any>();
  @Output() showSummaryChange  = new EventEmitter<any>();
  @Output() viewByChanged = new EventEmitter<any>();
  @Output() filtersStateChanged = new EventEmitter<boolean>();
  topBarFilters : any;
  topBarFiltersC : any;
  topBarRadioFilters : any;
  topBarRadioFiltersC : any;
  isUtilizationLoaded = false;
  lastSelectedOption: any;
  minValue : any;
  maxValue: any;
  resetFlag: boolean = false;
  viewByName : any;
  isDisabled :  boolean = true;
  previousDatasetKey: string | null = null;

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
  optionList = ['One', 'Two', 'Three'];
  radioOptions = [
    { label: 'Product Level', value: 1 },
    { label: 'Customer Level', value: 2 },
  ];
  page_offset = 0;
  page_size = 50;
  dependantFilters: any[] = [];
  isLoading: boolean;
  currentDatasetName : any;
  currentDatasetId : any;
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
    //this.onSearchValueChange();
   }

  constructor(public msmeService: MsmeService, public dialog: MatDialog ,protected commonService: CommonService) {
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
    const hasFilters = this.checkIfFiltersApplied();
    this.filtersStateChanged.emit(hasFilters);
    this.filtersApplied.emit({
      ...this.selectedValues,
      which_level: this.radioValue
    });
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {
      this.setupTopBarRadioFilter();
      this.setupTopBarFilter();

    setTimeout(() => {
      this.applyFilters();
    });
    }

    if (changes['filtersC']) {
      this.setupTopBarRadioFilterC();
      this.setupComparisonTopBarFilter();
      this.setupTopBarFilterC();
    }
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
      this.viewByName ='cmca.name';
    }
    else if(this.mySelectedValue == 'RM'){
      datasetKey = 'rm_name_search';
      this.viewByName ='employee_name';
    }
    else if(this.mySelectedValue == 'Customer'){
      datasetKey = 'company_name_search';
      this.viewByName ='c.name';
    }
    else if (this.mySelectedValue == 'Product') {
      datasetKey = 'product_type_search';
      this.viewByName ='cpm.display_name';
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
   }

  onSelectionChangeC(value: any, filter: any) {
    this.selectedValuesC[filter.filter_name] = value;
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
  }

  onSummaryToggleChange(value: boolean) {
    this.showComparison = value;
    this.showSummaryChange.emit(value);
  }

  resetFilters() {
    const dateOfReport = this.selectedValues['date_of_report'];
    this.selectedValues = {
      date_of_report: dateOfReport,
      product_type: null,
      cmr:null,
      psl_status: null,
      utilization_wallet_pct: null
    };
    this.filtersStateChanged.emit(false);
    this.filtersApplied.emit({
      ...this.selectedValues,
      which_level: this.radioValue
    });
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
        "which_level": 1
      }
    };


    if(filter.filter_name === 'utilization_wallet_pct' && !this.isUtilizationLoaded) {
      this.msmeService.getPrDashboardDependentFilterList(payload).subscribe((response) => {
        const options = response.data.dependent_filters.options;

        this.isUtilizationLoaded = true;
        filter.options = options.map(o => ({
          label: o.key,
          value: o.value
        }));
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
    const filterNames = ['product_type', 'utilization_wallet_pct', 'date_of_report','cmr','psl_status'];
    this.topBarFilters = this.filters.filter(f => filterNames.includes(f.filter_name))
      .sort((a, b) => filterNames.indexOf(a.filter_name) - filterNames.indexOf(b.filter_name))
      .map(f => {
      let isMultiple = true;
      let searchEnabled = true;
      let isShowRadioGroup = false;
      if (f.filter_name === 'date_of_report') {
        isMultiple = false;
        searchEnabled = false;
      }
      if (f.filter_name === 'utilization_wallet_pct') {
        isMultiple = true;
        searchEnabled = true;
        isShowRadioGroup = true;
      }

      if (f.filter_name === 'psl_status') {
        const options = f.options?.map(o => ({ label: o.key, value: o.value })) || [];

        this.selectedValues['psl_status'] = null;

        return {
          ...f,
          options,
          isMultiple: true,
          searchEnabled: true,
          isShowRadioGroup: false
        };
      }

      const options = f.options
        ?.filter(o => o.key && o.value)
        .map(o => ({ label: o.key, value: o.value })) || [];

      if (f.filter_name === 'date_of_report' && options.length > 0) {
        this.selectedValues = this.selectedValues || {};
        this.selectedValues[f.filter_name] = options[0].value;
      }

      return {
        ...f,
        options,
        isMultiple,
        searchEnabled,
        isShowRadioGroup
      };
    });
  }

    setupTopBarFilterC() {
    const filterNames = ['product_type', 'calculation_on','wallet', 'date_of_report'];
    this.topBarFiltersC = this.filtersC.filter(f => filterNames.includes(f.filter_name))
      .sort((a, b) => filterNames.indexOf(a.filter_name) - filterNames.indexOf(b.filter_name))
      .map(f => {
      let isMultiple = true;
      let searchEnabled = true;
      let isShowRadioGroup = false;
      let isshowMinCount = false;
        if (f.filter_name === 'calculation_on') {
          const options = f.options
            ?.filter(o => o.key && o.value)
            .map(o => ({ label: o.key, value: o.value })) || [];
          isMultiple = false;
          searchEnabled = false;
          this.selectedValuesC = this.selectedValuesC || {};
          this.selectedValuesC[f.filter_name] = options[0].value;
        }
      if (f.filter_name === 'date_of_report') {
                  const options = f.options
            ?.filter(o => o.key && o.value)
            .map(o => ({ label: o.key, value: o.value })) || [];
          isMultiple = false;
          searchEnabled = false;
          this.selectedValuesC = this.selectedValuesC || {};
          this.selectedValuesC[f.filter_name] = options[0].value;


        isMultiple = false;
        searchEnabled = false;
      }
      if (f.filter_name === 'wallet') {
        isMultiple = true;
        searchEnabled = true;
        isShowRadioGroup = true;
        isshowMinCount = true;
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
        options,
        isMultiple,
        searchEnabled,
        isShowRadioGroup,
        isshowMinCount
      };
    });
  }

    setupComparisonTopBarFilter() {
    const searchByFilter = this.filtersC.find(f => f.filter_name === 'search_by');
    if (searchByFilter) {
        this.optionList = searchByFilter.options.map(opt => opt.key);
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
    console.log("payload", payload);
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
        } else if (!append) {
          const isCurrentlySearching = searchValue && searchValue.trim().length > 0;

          if (!isCurrentlySearching) {
            const allCurrentValues = this.OptionArray.map(opt => opt.value);
            const hasAnySelected = this.selectModel.some(val => allCurrentValues.includes(val));
            if (!hasAnySelected) {
              this.selectModel = [...allCurrentValues];
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
    default: return 'fi fi-rr-filter red_text mr-1';
  }
}

  getInfoTooltip(filter: any): string {
    const tooltipMap: { [key: string]: string } = {
      'product_type': 'Select product types to filter',
      'psl_status': 'Click to view PSL status details',
      'date_of_report': 'Click to view Date of report details',
      'utilization_wallet_pct': 'Click to view Utilization Wallet % details',
      'cmr': 'Click to view CMR score details'
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

}
