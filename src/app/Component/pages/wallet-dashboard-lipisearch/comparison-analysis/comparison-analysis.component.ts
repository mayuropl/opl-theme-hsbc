import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ComparisonAnalysisPopupComponent } from 'src/app/Popup/HSBC/comparison-analysis-popup/comparison-analysis-popup.component';
import { CreateCampaignPopupComponent } from 'src/app/Popup/create-campaign-popup/create-campaign-popup.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {Constants} from '../../../../CommoUtils/constants';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-comparison-analysis',
  templateUrl: './comparison-analysis.component.html',
  styleUrl: './comparison-analysis.component.scss'
})
export class ComparisonAnalysisComponent {
  collapseStates: boolean[] = [];
 allCities: string[] = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris'];
 isLoading: boolean = true;
 isLoadingSecondLevel: boolean = false;
 selectedCities: string[] = [];
 isSortingSearchingCall: boolean = false;
 @Input() selectedViewBy: any;
 @Input() totalRecordsFirstLevel: number = 0;
 @Input() totalRecordsSecondLevel: number = 0;
 @Input() firstLevelDataC : any;
 @Input() secendLevelViewData : any;
 @Input() filtersffC : any;
 @Input() filtersffCFirstLevel : any;
 @Input() dataSetIdCRQ : any;
 @Input() dataSetIdCTRQ : any;
 @Input() calculationOn : any;
 @Input() searchViewBySelection: any[] = [];
 @Input() searchViewByOptions: any[] = [];  // Option array with labels for saving
//  @Output() pageChangeFirstLevel = new EventEmitter<{pageSize: number; offset: number; sortSearchReq?: any}>();
//  @Output() pageChangeSecondLevel = new EventEmitter<{parentSelectName : any, pageSize: number; offset: number; sortSearchReq?: any}>();
 @Output() pageChangeFirstLevel = new EventEmitter<any>();
 @Output() pageChangeSecondLevel = new EventEmitter<any>();
 @Output() pageChangeThirdLevel = new EventEmitter<{firstLevelColumnName : any,secondLevelSelectName : any, pageSize: number; offset: number}>();
 @Output() pageChangeFourLevel = new EventEmitter<{parentSelectName : any, pageSize: number; offset: number}>();
 tableHeaders: { key: string; label: string; width?: string }[] = [];
 tableHeadersS: { key: string; label: string; width?: string }[] = [];

 // Search and Sort functionality
 parentSearchFilters: any = {};
 childSearchFilters: any = {};
 private parentSearchSubject = new Subject<string>();
 private childSearchSubject = new Subject<any>();
 parentTableSortOrderObj = {order_by_column: null, order_by_type: null};
 childTableSortOrderObj = {order_by_column: null, order_by_type: null};

 columnMap: Record<string, string> = {};
 filteredCities: string[] = [...this.allCities];
 firstLevelColumnName : any;
 firstLevelSelectName : any;
 firstLevelPageOffset: number = 0;
 firstLevelPageSize: number = 5;
 allColumns: string[] = [];
 nextLevelName: string | null = null;
 @Input() selectedUnitC: string = 'Million';
 @Input() isLoadingFromParent: boolean = true;
 @Input() isFilterApplied: boolean = false;
 @Input() hasFiltersApplied: boolean = false;
 @Output() emitComaprisonExcelDownload = new EventEmitter<any>();
 @Input() selectedDateOfReportShowCom : any;
 @Input() latestDateOfReportShowCom  : any;
 @Input() filterOptions: any[] = [];
//  @Input() isLoadingSecondLevel: boolean = false;
 moneyFormatTableHeader: string = '(₹M)';

 // ============ Customer Level Selection Logic ============
 selectedCustomers: Set<string> = new Set();
 deselectedCustomers: Set<string> = new Set();
 selectAllAcrossPages: boolean = false;
 selectedCustomerDetails: Map<string, { customerName: string, customerId: string, pan: string, rmId: string, customerType: number }> = new Map();
 pageSize = 10;
 page = 1;
 pageSizeS = 5;
 pageS = 1;
 viewHierarchyConfig = {
  Segment: 'City',
  City: 'RM',
  RM: 'Customer',
  Product : 'Customer'
};

filterKeyMapping = {
  Segment: 'seg_name',
  City: 'city_name',
  RM: 'employee_name',
  'Customer': 'cust.cust_name',
};
  protected readonly consValue = Constants;
  pageData: any;

 constructor( public dialog: MatDialog , protected commonService: CommonService, private router: Router, private msmeService: MsmeService){
    // Setup debounced search for parent table
    this.parentSearchSubject.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      console.log('debouncing the event parentSearchSubject');
      this.emitParentPagination();
    });

    // Setup debounced search for child table
    this.childSearchSubject.pipe(
      debounceTime(600),
      distinctUntilChanged((prev, curr) =>
        prev.value === curr.value && prev.parentName === curr.parentName
      )
    ).subscribe(({ value, parentName }) => {
      this.emitChildPagination(parentName);
    });
  };


  ngOnInit() {
    this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS, this.consValue.pageMaster.PR_DASHBOARD);
  }

  // Navigate to Commercial Bureau History page when customer name is clicked
  onCustomerBureauClick(customer: any) {
    const req = {
      pan : customer.pan_no
    }
   
    this.msmeService.getDecPan(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data) {
            let pageData = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS2, this.consValue.pageMaster.COMMERCIAL_BUREAU2);
              this.commonService.setStorage("pr_commercial_pan", response.data);
              this.commonService.setStorage("from_pr_dashboard", "true");
              this.commonService.setStorage("pr_dashboard_show_comparison", "true");
              if (this.filtersffCFirstLevel) {
                this.commonService.setStorageAesEncryption("pr_dashboard_filters_comparison", JSON.stringify(this.filtersffCFirstLevel));
              }
              
              if (this.searchViewBySelection && this.searchViewBySelection.length > 0) {
                this.commonService.setStorage("pr_dashboard_search_view_by_selection", JSON.stringify(this.searchViewBySelection));
              }
              // Also save the option array with labels for restoration
              if (this.searchViewByOptions && this.searchViewByOptions.length > 0) {
                this.commonService.setStorage("pr_dashboard_search_view_by_options", JSON.stringify(this.searchViewByOptions));
              }
              this.router.navigate(['/hsbc/rmCommercialBureau'], { state: { data: pageData} });
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR getDecPan');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR getDecPan');
      }
    );
  }

   ngOnChanges(changes: SimpleChanges) {

    console.log('this.selectedUnitC',this.selectedUnitC);

    console.log('selectedViewBy: ', this.selectedViewBy);

    if (changes['isFilterApplied'] && this.isFilterApplied) {
      this.resetSortSearchValues();
      this.resetChildSortSearchValues();
      this.resetPaginationToDefault();
      this.clearSelectedCheckBoxForCampaign();
    }

    if (changes['isLoadingSecondLevel']) {
      this.isLoadingSecondLevel = changes['isLoadingSecondLevel'].currentValue;
    }

    if(changes['selectedUnitC'] && this.selectedUnitC) {
      this.resetSortSearchValues();
      this.resetChildSortSearchValues();
      this.resetPaginationToDefault();
    }

    if (changes['calculationOn'] && this.calculationOn) {
      this.setupTableHeaders(this.calculationOn,this.selectedUnitC);
    }
     if (changes['firstLevelDataC'] && this.firstLevelDataC) {
       this.firstLevelDataC.forEach(row => {
         this.collapseStates[row.group_by_column] = true;
       });
       this.isLoading = false;
      //  this.resetSortSearchValues();
     }
    if (changes['secendLevelViewData'] && this.secendLevelViewData) {
      console.log('second level data changed: ', this.secendLevelViewData);
      this.isLoadingSecondLevel = false;
    }
    if (changes['selectedViewBy'] && this.selectedViewBy) {
      this.nextLevelName = this.viewHierarchyConfig[this.selectedViewBy] || null;
      this.setupTableHeaders(this.calculationOn,this.selectedUnitC);
    }
    if (this.selectedUnitC) {
        this.moneyFormatTableHeader = this.selectedUnitC === 'Million' ? '(₹M)' : this.selectedUnitC === 'Billion' ? '(₹B)' : '(₹)'
        this.setupTableHeaders(this.calculationOn,this.selectedUnitC);
        this.updateColumnArrays();
    }
   }

      numericFields = [
        'latest_total_sanction',
        'selected_total_sanction',
        'latest_hsbc_sanction',
        'selected_hsbc_sanction',
        'latest_total_utilization',
        'selected_total_utilization',
        'latest_hsbc_utilization',
        'selected_hsbc_utilization',
        'change_wallet',
        'change_wallet_pct'
      ];

   resetSortSearchValues() {
      this.parentSearchFilters = {};
      this.parentTableSortOrderObj = {order_by_column: null, order_by_type: null};
   }

   resetChildSortSearchValues() {
      this.childSearchFilters = {};
      this.childTableSortOrderObj = {order_by_column: null, order_by_type: null};
   }

  resetPaginationToDefault() {
  this.pageSize = 10;
  this.page = 1;
  }

    clearSelectedCheckBoxForCampaign(){
      this.selectedCustomers.clear();
      this.selectedCustomerDetails.clear();
      this.deselectedCustomers.clear();
      this.selectAllAcrossPages = false;
  }

  get numberFormat(): string {
    if (this.selectedUnitC === 'Million') return '1.1-1';
    if (this.selectedUnitC === 'Billion') return '1.2-2';
    return '1.0-0';
  }

    getColumnFormat(columnName: string): string {
    const percentageColumns = ['change_wallet_pct'];
    if (this.selectedUnitC === 'Absolute' && percentageColumns.includes(columnName)) {
      return '1.2-2';
    }
    return this.numberFormat;
  }

  updateColumnArrays() {
      this.allColumns = [
      'Sr No',  
      'Customer Name',
      'Current Customer Level Classification',
      'Previous Customer Level Classification',
      'Cust ID',
      'PAN',
      'CIN',
      'RM Name',
      'RM PS ID',
      'Segment',
      'City',
      'CRR',
      'CMR Score',
      'Product',
      'Current Product Level Classification',
      'Previous Product Level Classification',
      `Total Sanction ${this.latestDateOfReportShowCom}`,
      `Previous Sanction ${this.selectedDateOfReportShowCom}`,
      `Bank Sanction ${this.latestDateOfReportShowCom}`,
      `Bank Previous Sanction ${this.selectedDateOfReportShowCom}`,
      `Change in Sanction Wallet ${this.moneyFormatTableHeader}`,
      `Change in Sanction Wallet(%)`,
      `Total Utilization ${this.latestDateOfReportShowCom}`,
      `Previous Utilization ${this.selectedDateOfReportShowCom}`,
      `Bank Utilization ${this.latestDateOfReportShowCom}`,
      `Bank Previous Utilization ${this.selectedDateOfReportShowCom}`,
      `Change in Utilization Wallet ${this.moneyFormatTableHeader}`,
      `Change in Utilization Wallet(%)`,
      `Product Level Wallet Category`
    ];
  }

  excelDownloadProductLevel(){
  this.emitComaprisonExcelDownload.emit({comaprisonExcelColumn : this.allColumns,prodOrCustlevel : 'Comparison'});
  }

  setupTableHeaders(calculationOn: '1' | '2', selectedUnitC : any) {
    const viewType = calculationOn === '2' ? 'Utilization' : 'Sanction';
    const suffix = calculationOn === '2' ? 'utilization' : 'sanction';
    const unitLabel = selectedUnitC === 'Million' ? '(₹M)' : selectedUnitC === 'Billion' ? '(₹B)' : '(₹)';
    const isCustomerLevel = this.selectedViewBy === 'Customer';
    const isCustomerLevelS = this.viewHierarchyConfig[this.selectedViewBy] ==='Customer';

    this.tableHeaders = [
      ...(!isCustomerLevel ? [
        { key: 'unique_cust_count', label: 'Unique Customers' }
      ] : []),
      { key: `latest_total_${suffix}`, label: `Total ${viewType} ${unitLabel}` },
      { key: `selected_total_${suffix}`, label: `Prev ${viewType} ${unitLabel}` },
      { key: `latest_hsbc_${suffix}`, label: `Bank ${viewType} ${unitLabel}` },
      { key: `selected_hsbc_${suffix}`, label: `Prev Bank ${viewType} ${unitLabel}` },
      { key: 'change_wallet', label: `Change In ${viewType} Wallet Value ${unitLabel}` },
      { key: 'change_wallet_pct', label: `Change In ${viewType} Wallet %` },
    ];

        this.tableHeadersS = [
      ...(!isCustomerLevelS ? [
        { key: 'unique_cust_count', label: 'Unique Customers' }
      ] : []),
      { key: `latest_total_${suffix}`, label: `Total ${viewType} ${unitLabel}` },
      { key: `selected_total_${suffix}`, label: `Prev ${viewType} ${unitLabel}` },
      { key: `latest_hsbc_${suffix}`, label: `Bank ${viewType} ${unitLabel}` },
      { key: `selected_hsbc_${suffix}`, label: `Prev Bank ${viewType} ${unitLabel}` },
      { key: 'change_wallet', label: `Change In ${viewType} Wallet Value ${unitLabel}` },
      { key: 'change_wallet_pct', label: `Change In ${viewType} Wallet %` },
      ...(isCustomerLevelS ? [
        { key: 'classification', label: 'Classification' }
      ] : []),
    ];

    // Update column mapping
    this.updateColumnMapping();
  }

  updateColumnMapping() {
    this.columnMap = {
      [this.selectedViewBy]: 'group_by_column',
      'Unique Customers': 'unique_cust_count',
      'City':'group_by_column',
      'RM':'group_by_column',
      'Customer':'group_by_column',
      'Classification': 'classification',
      ...this.tableHeaders.reduce((acc, header) => {
        acc[header.label] = header.key;
        return acc;
      }, {})
    };
  }

 filterCities(value: string) {
  const filter = value.toLowerCase();
  this.filteredCities = this.allCities.filter(city =>
    city.toLowerCase().includes(filter)
  );
}

getNextLevelName(): string | null {
  return this.viewHierarchyConfig[this.selectedViewBy] || null;
}

isCompanyLevel(): boolean {
  return this.getNextLevelName() === 'Customer';
}

 toggleCitySelection(city: string, checked: boolean) {
  if (checked) {
    this.selectedCities.push(city);
  } else {
    this.selectedCities = this.selectedCities.filter(c => c !== city);
  }
}

 getSelectedCitiesCount(): string {
  const count = this.selectedCities.length;
  return count === 0 ? 'Enter City' : `Selected city ${count}`;
}

isLastLevelView(): boolean {
  const lastLevels = ['Customer'];
  return lastLevels.includes(this.selectedViewBy);
}

  ComparisonAnalysisPopup(firstLevelSelectName, secondLevelSelectName: any, firstLevelColumnName: any) {
    // this.pageChangeThirdLevel.emit({firstLevelColumnName : firstLevelColumnName,
    //   secondLevelSelectName : secondLevelSelectName,pageSize: this.firstLevelPageSize, offset: this.firstLevelPageOffset});
    const currentKey = this.filterKeyMapping[firstLevelColumnName];
    const nextLevel = this.viewHierarchyConfig[firstLevelColumnName];
    const nextKey = this.filterKeyMapping[nextLevel];
    const nexttoNextLevel = this.viewHierarchyConfig[this.nextLevelName];
    const nextToNextKey = this.filterKeyMapping[nexttoNextLevel];

    const popupTitle = `${nextToNextKey} Level View`;

    this.filtersffC = {
      ...this.filtersffC,
      [currentKey]: firstLevelSelectName,
      [nextKey]: secondLevelSelectName,
      group_by_column: nextToNextKey,
      page_offset: 0,
      page_size: 5,
      column_search_filter :[]
    }

    const dialogRef = this.dialog.open(ComparisonAnalysisPopupComponent, {
      panelClass: ['popupMain_design', 'popup_width_90vw'],
            data: {
        title: popupTitle,
        currentView: nexttoNextLevel,
        firstLevelColumnName : firstLevelColumnName,
        firstLevelSelectName : firstLevelSelectName,
        secondLevelSelectName : secondLevelSelectName,
        nextLevel : nextLevel,
        dataSetIdCTRQ : this.dataSetIdCTRQ,
        dataSetIdCRQ : this.dataSetIdCRQ,
        calculationOn: this.calculationOn,
        filterReq: this.filtersffC,
        selectedUnitC: this.selectedUnitC,
        filtersffCFirstLevel: this.filtersffCFirstLevel,
        searchViewBySelection: this.searchViewBySelection,
        searchViewByOptions: this.searchViewByOptions
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Popup closed, got result:', result);
    });
  }

  onCollapseToggle(row: any) {
    const parentSelectName = row.group_by_column;
    const isCurrentlyCollapsed = this.collapseStates[parentSelectName];

    if (isCurrentlyCollapsed) {
      // Clear old data immediately and show loading
      this.secendLevelViewData = null;
      this.isLoadingSecondLevel = true;

      // Opening: First close others, then open current
      Object.keys(this.collapseStates).forEach(key => {
        this.collapseStates[key] = true;
      });

      console.log('inside the oncollapse toggle: ');

      setTimeout(() => {
        this.collapseStates[parentSelectName] = false;
        this.resetChildSortSearchValues();
        // Reset child pagination
        this.pageS = 1;
        this.pageSizeS =5;
        this.pageChangeSecondLevel.emit({parentSelectName : parentSelectName, pageSize: this.pageSizeS, offset: 0, sortSearchReq: { order_by_column: null, order_by_type: null, column_search_filter: [] }});
      }, 300);
    } else {
      // Closing: Just close current
      this.collapseStates[parentSelectName] = true;
    }

    this.firstLevelSelectName = parentSelectName;
  }

  get startRow(): number {
  return (this.page - 1) * this.pageSize + 1;
}

get endRow(): number {
  return Math.min(this.page * this.pageSize, this.totalRecordsFirstLevel);
}

onPageChange(pageNumber: number) {
  this.firstLevelDataC = null;
  this.isLoading = true;
  this.page = pageNumber;
  const offset = (this.page - 1) * this.pageSize;
  const searchReq = this.prepareSearchRequest(this.parentSearchFilters);
  this.pageChangeFirstLevel.emit({ pageSize: this.pageSize, offset, sortSearchReq: { ...this.parentTableSortOrderObj, ...searchReq } });
}

onPageSizeChange(size: number) {
  this.firstLevelDataC = null;
  this.isLoading = true;
  this.pageSize = size;
  this.page = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.parentSearchFilters);
  this.pageChangeFirstLevel.emit({ pageSize: this.pageSize, offset, sortSearchReq: { ...this.parentTableSortOrderObj, ...searchReq } });
}

get startRowS(): number {
  return (this.pageS - 1) * this.pageSizeS + 1;
}

get endRowS(): number {
  return Math.min(this.pageS * this.pageSizeS, this.totalRecordsSecondLevel);
}

onPageChangeS(pageNumber: number) {
  this.secendLevelViewData = null;
  this.isLoadingSecondLevel = true;
  this.pageS = pageNumber;
  const offset = (this.pageS - 1) * this.pageSizeS;
  const searchReq = this.prepareSearchRequest(this.childSearchFilters);
  this.pageChangeSecondLevel.emit({parentSelectName: this.firstLevelSelectName, pageSize: this.pageSizeS, offset, sortSearchReq: { ...this.childTableSortOrderObj, ...searchReq } });
}

onPageSizeChangeS(size: number) {
  this.secendLevelViewData = null;
  this.isLoadingSecondLevel = true;
  this.pageSizeS = size;
  this.pageS = 1;
  const offset = 0;
  const searchReq = this.prepareSearchRequest(this.childSearchFilters);
  this.pageChangeSecondLevel.emit({parentSelectName: this.firstLevelSelectName, pageSize: this.pageSizeS, offset, sortSearchReq: { ...this.childTableSortOrderObj, ...searchReq } });
}

// Search functionality
onParentSearch(column: string, event: any) {
  const cleanedValue = event.target.value.replace(/\./g, '');
  event.target.value = cleanedValue;
  this.parentSearchFilters[column] = cleanedValue;
  const isNumeric = /^[0-9]+$/.test(cleanedValue);
  if (cleanedValue === '') {
    this.parentSearchSubject.next(cleanedValue);
    return;
  }
    if (isNumeric) {
    this.parentSearchSubject.next(cleanedValue);
  } else {
    if (cleanedValue.length >= 3) {
      this.parentSearchSubject.next(cleanedValue);
    }
  }
}

onChildSearch(column: string, event: any, parentName: string = null) {
  const cleanedValue = event.target.value.replace(/\./g, '');
  event.target.value = cleanedValue;
  this.childSearchFilters[column] = cleanedValue;
    const isNumeric = /^[0-9]+$/.test(cleanedValue);
  if (cleanedValue === '') {
    this.childSearchSubject.next({value: cleanedValue, parentName});
    return;
  }
  if (isNumeric) {
    this.childSearchSubject.next({value: cleanedValue, parentName});
  } else {
    if (cleanedValue.length >= 3) {
      this.childSearchSubject.next({value: cleanedValue, parentName});
    }
  }

}

prepareSearchRequest(filters: any): any {
  const columnSearchFilter = Object.keys(filters)
    .filter(key => filters[key] && filters[key].trim())
    .map(key => ({ key: this.columnMap[key] || key, value: filters[key] }));

  return { column_search_filter: columnSearchFilter };
}

emitParentPagination() {
  const searchReq = this.prepareSearchRequest(this.parentSearchFilters);
  const offset = (this.page - 1) * this.pageSize;
  console.log('emittig the pagination even ');

  this.firstLevelDataC = null;
  this.isLoading = true;
  this.pageChangeFirstLevel.emit({  pageSize: this.pageSize, offset, sortSearchReq: { ...this.parentTableSortOrderObj, ...searchReq } });
}

emitChildPagination(parentName: string = null) {
  const searchReq = this.prepareSearchRequest(this.childSearchFilters);
  const offset = (this.pageS - 1) * this.pageSizeS;
  console.log('emittig the pagination even child ');

  this.secendLevelViewData = null;
  this.isLoadingSecondLevel = true;
  this.pageChangeSecondLevel.emit({parentSelectName: parentName || this.firstLevelSelectName, pageSize: this.pageSizeS, offset, sortSearchReq: { ...this.childTableSortOrderObj, ...searchReq } });
}

// Sorting functionality
onChangeOrder(columnName: string, isParentTable: boolean = true, parentName: string = null) {
  const currentSortObj = isParentTable ? this.parentTableSortOrderObj : this.childTableSortOrderObj;
  const currentCol = currentSortObj.order_by_column;
  const currentType = currentSortObj.order_by_type;
  const newCol = this.columnMap[columnName];

  if(currentCol !== newCol) {
    currentSortObj.order_by_column = newCol;
    currentSortObj.order_by_type = 'ASC';
  } else {
    currentSortObj.order_by_type = currentType === 'ASC' ? 'DESC' : 'ASC';
  }

  if (isParentTable) {
    this.firstLevelDataC = null;
    this.isLoading = true;
    this.emitParentPagination();
  } else {
    this.secendLevelViewData = null;
    this.isLoadingSecondLevel = true;
    this.emitChildPagination(parentName);
  }
}

// Toggle sort with specific direction (for new sort design)
toggleSort(sortField: string, direction: 'ASC' | 'DESC', isParentTable: boolean = true, parentName: string = null) {
  const currentSortObj = isParentTable ? this.parentTableSortOrderObj : this.childTableSortOrderObj;
  currentSortObj.order_by_column = sortField;
  currentSortObj.order_by_type = direction;

  if (isParentTable) {
    this.firstLevelDataC = null;
    this.isLoading = true;
    this.emitParentPagination();
  } else {
    this.secendLevelViewData = null;
    this.isLoadingSecondLevel = true;
    this.emitChildPagination(parentName);
  }
}

// ============ Customer Level Selection Methods ============

// Check if all customers are selected (header checkbox state)
isAllCustomersSelected(): boolean {
  if (this.selectAllAcrossPages && this.deselectedCustomers.size === 0) {
    return true;
  }
  if (this.firstLevelDataC && this.firstLevelDataC.length > 0) {
    const allCurrentPageSelected = this.firstLevelDataC.every(row => 
      this.selectedCustomers.has(row.group_by_column)
    );
    if (allCurrentPageSelected && this.firstLevelDataC.length === this.totalRecordsFirstLevel) {
      return true;
    }
  }
  
  return false;
}

isSomeCustomersSelected(): boolean {
  return false;
}

// Toggle all customers selection (header checkbox) - selects ALL across ALL pages
toggleAllCustomers(): void {
  if (this.isAllCustomersSelected()) {
    // All are selected, so deselect all
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.deselectedCustomers.clear();
    this.selectAllAcrossPages = false;
  } else {
    // Not all selected, so select ALL
    this.selectAllAcrossPages = true;
    this.deselectedCustomers.clear();
    // Add current page customers to the set with details
    this.firstLevelDataC?.forEach(row => {
      this.selectedCustomers.add(row.group_by_column);
      this.selectedCustomerDetails.set(row.group_by_column, {
        customerName: row.group_by_column,
        customerId: row.cust_id,
        pan: row.pan_no,
        rmId: row.rm_id,
        customerType: this.consValue.CustomerType.ETB,
      });
    });
  }
}

// Toggle individual customer selection
toggleCustomerSelection(row: any): void {
  if (this.isCustomerSelected(row)) {
    // Unselect this customer
    if (this.selectAllAcrossPages) {
      // When selectAll was active, add all current page customers except this one
      this.firstLevelDataC?.forEach(r => {
        if (r.group_by_column !== row.group_by_column) {
          this.selectedCustomers.add(r.group_by_column);
          this.selectedCustomerDetails.set(r.group_by_column, {
            customerName: r.group_by_column,
            customerId: r.cust_id,
            pan: r.pan_no,
            rmId: r.rm_id,
            customerType: this.consValue.CustomerType.ETB,
          });
        }
      });
      this.selectAllAcrossPages = false;
      this.deselectedCustomers.clear();
    }
    this.selectedCustomers.delete(row.group_by_column);
    this.selectedCustomerDetails.delete(row.group_by_column);
  } else {
    // Select this customer
    this.selectedCustomers.add(row.group_by_column);
    this.selectedCustomerDetails.set(row.group_by_column, {
      customerName: row.group_by_column,
      customerId: row.cust_id,
      pan: row.pan_no,
      rmId: row.rm_id,
      customerType: this.consValue.CustomerType.ETB,
    });
    this.deselectedCustomers.delete(row.group_by_column);
  }
}

// Check if a specific customer is selected
isCustomerSelected(row: any): boolean {
  if (this.selectAllAcrossPages) {
    return !this.deselectedCustomers.has(row.group_by_column);
  }
  return this.selectedCustomers.has(row.group_by_column);
}

// Get count of selected customers
getSelectedCustomersCount(): number {
  if (this.selectAllAcrossPages) {
    return (this.totalRecordsFirstLevel || 0) - this.deselectedCustomers.size;
  }
  return this.selectedCustomers.size;
}

// Clear all selections
clearCustomerSelections(): void {
  this.selectedCustomers.clear();
  this.selectedCustomerDetails.clear();
  this.deselectedCustomers.clear();
  this.selectAllAcrossPages = false;
}

// Create Campaign Popup
CreateCampaignPopup(): void {
  if (this.selectedCustomers && this.selectedCustomers?.size > 0) {
    // Build the dashboard request with filters
    const req = {
      dataset_id: this.dataSetIdCRQ,
      dashboard_id: 3,
      filters: this.filtersffC
    };

    const selectedCustomerDetailsArray = Array.from(this.selectedCustomerDetails.values());
    
    // Build filter data list when Create Campaign is clicked
    const filterDataList = this.buildAppliedFilterDataList();

    this.dialog.open(CreateCampaignPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
      data: {
        sourceName: 'PR',
        customerCount: this.selectAllAcrossPages ? this.totalRecordsFirstLevel : this.selectedCustomers?.size,
        selectedCustomers: selectedCustomerDetailsArray,
        filterDataList: filterDataList,
        isAssignedAllCustomer: this.selectAllAcrossPages,
        dashboardRequest: req
      }
    });
  } else {
    this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
  }
}

// Build flattened filter data list for Create Campaign
buildAppliedFilterDataList(): any[] {
  const flattenedData: any[] = [];
  const selectedFilters = this.filtersffC;
  
  if (!selectedFilters) {
    return flattenedData;
  }

  let walletMin: any = null;
  let walletMax: any = null;
  let walletRanges: string[] = [];
  
  // Map filter keys to display names
  const filterDisplayNames: { [key: string]: string } = {
    'selected_date_of_report': 'Selected Compare Date of Report',
    'product_type': 'Product Type',
    'product_sub_type': 'Product Sub Type',
    'utilization_wallet_pct': 'Utilization Wallet %',
    'calculation_on': 'Sanction/Utilization',
    'cmr': 'CMR',
    'psl_status': 'PSL Status',
    'segment': 'Segment',
    'city': 'City',
    'rm_name': 'RM Name',
    'customer_name': 'Customer Name',
    'gain_or_loss': 'Wallet Gain/Loss',
    'latest_date_of_report': 'Date of Report'
  };

  // Iterate through selected filters and build flattened list
  Object.keys(selectedFilters).forEach(key => {
    const value = selectedFilters[key];
    // Skip internal/system filters
    if (['role_id','date_of_report', 'role_type', 'latest_6_report_date', 'division_value', 'page_size', 'page_offset', 'order_by_type', 'global_primary_rm_id','group_by_column'].includes(key)) {
      return;
    }

        if (key === 'wallet_min') {
      walletMin = value;
      return;
    }

    if (key === 'wallet_max') {
      walletMax = value;
      return;
    }

    if (key === 'wallet') {
      if (Array.isArray(value)) {
        walletRanges = value.filter(v => v && v !== -1 && v !== 'all');
      }
      return;
    }

    const displayName = filterDisplayNames[key] || key;
    // Find the filter options for this filter key to map IDs to names
    const filterConfig = this.filterOptions?.find(f => f.filter_name === key);

    if (Array.isArray(value) && value.length > 0) {
      // For array values, add each item with its label
      value.forEach(item => {
        if (item !== -1 && item !== '-1' && item !== 'all') {
          const itemLabel = this.getFilterLabel(filterConfig, item, key);
          flattenedData.push({
            subFilterName: displayName,
            subFilterValue: itemLabel,
            type: key
          });
        }
      });
    } else if (value !== null && value !== undefined && value !== '' && value !== -1) {
      const itemLabel = this.getFilterLabel(filterConfig, value, key);
      flattenedData.push({
        subFilterName: displayName,
        subFilterValue: itemLabel,
        type: key
      });
    }
  });

    const walletGainLoss = flattenedData.find(f => f.type === 'gain_or_loss');

  if (walletGainLoss) {
    const suffixParts: string[] = [];

    if (walletRanges.length > 0) {
      suffixParts.push(walletRanges.join(', '));
    }

    if (this.isValidNumber(walletMin) || this.isValidNumber(walletMax)) {
      const minVal = this.isValidNumber(walletMin) ? walletMin : 'NA';
      const maxVal = this.isValidNumber(walletMax) ? walletMax : 'NA';
      suffixParts.push(`Wallet Min : ${minVal} , Wallet Max : ${maxVal}`);
    }


    if (suffixParts.length > 0) {
      walletGainLoss.subFilterValue =
        `${walletGainLoss.subFilterValue} ( ${suffixParts.join(' | ')} )`;
    }
  }

  return flattenedData;
}

private isValidNumber(value: any): boolean {
  return value !== null &&
         value !== undefined &&
         value !== '' &&
         !isNaN(value);
}


// Helper method to get label for a filter value
private getFilterLabel(filterConfig: any, value: any, filterKey: string): string {
  if (!filterConfig) {
    return String(value);
  }

  // Special handling for product_sub_type - raw options have nested structure
  if (filterKey === 'product_sub_type' && filterConfig.options) {
    for (const group of filterConfig.options || []) {
      if (group.options) {
        const option = group.options.find((opt: any) => opt.value === value);
        if (option) {
          return option.label || option.key || String(value);
        }
      }
    }
  }

  // Check if filter has grouped options
  if (filterConfig.groupedOptions || filterConfig.originalGroupedOptions) {
    const groupedOptions = filterConfig.originalGroupedOptions || filterConfig.groupedOptions;
    for (const group of groupedOptions || []) {
      const option = group.options?.find((opt: any) => opt.value === value);
      if (option) {
        return option.label || option.key || String(value);
      }
    }
  }

  // Check regular options array
  if (filterConfig.options) {
    const option = filterConfig.options.find((opt: any) => opt.value === value);
    if (option) {
      return option.label || option.key || String(value);
    }
  }

  // For date_of_report, format the date
  if (['selected_date_of_report'].includes(filterKey) && value) {
    const dateStr = String(value);
    if (dateStr.length === 6) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(month, 10) - 1] || month;
      return `${monthName} ${year}`;
    }
  }

  return String(value);
}

}
