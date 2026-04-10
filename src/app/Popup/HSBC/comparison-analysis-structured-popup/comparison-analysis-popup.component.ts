import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-comparison-analysis-popup', 
  templateUrl: './comparison-analysis-popup.component.html',
  styleUrl: './comparison-analysis-popup.component.scss'
})
export class ComparisonAnalysisstructuredPopupComponent implements OnInit{
  showDetails: boolean = false;
  companyType: string = '';
  companyTypes = [
    { value: 'mnc', label: 'MNC' },
    { value: 'domestic', label: 'Domestic' },
    { value: 'foreign', label: 'Foreign Entity' },
    { value: 'startup', label: 'Start Up' }
  ];
  thirdLevelViewData: any[];
  fourLevelViewData: any[];
  filtersffC: any;
  filtersffCFour: any;
  fourLevelSelectName : any;
  totalRecordsThirdLevel : 0;
  totalRecordsFourLevel: 0;
  isLoadingThirdLevel: boolean = false;
  isLoadingFourthLevel: boolean = false;
  pageSize = 5;
  page = 1;
  pageSizeF = 5;
  pageF = 1;  
  tableHeaders: { key: string; label: string; width?: string }[] = [];
  tableHeadersF: { key: string; label: string; width?: string }[] = [];
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
  
  // Search and Sort functionality
  thirdLevelSearchFilters: any = {};
  fourthLevelSearchFilters: any = {};
  private thirdLevelSearchSubject = new Subject<string>();
  private fourthLevelSearchSubject = new Subject<string>();
  thirdLevelSortOrderObj = {order_by_column: null, order_by_type: null};
  fourthLevelSortOrderObj = {order_by_column: null, order_by_type: null};
  
  columnMap: Record<string, string> = {};

    constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ComparisonAnalysisstructuredPopupComponent>, public msmeService: MsmeService, 
    public commonService: CommonService
  ) {
    // Setup debounced search for third level table
    this.thirdLevelSearchSubject.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitThirdLevelPagination();
    });

    // Setup debounced search for fourth level table
    this.fourthLevelSearchSubject.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitFourthLevelPagination();
    });
  }

  ngOnInit() {
    console.log('Received data:', this.data);
    this.setupTableHeaders(this.data.calculationOn,this.data.selectedUnitC);
    this.isLoadingThirdLevel = true;
    this.onFetchThirdLevelView(this.data?.filterReq)  
  }

  setupTableHeaders(calculationOn: '1' | '2',selectedUnitC : any) {
    const viewType = calculationOn === '2' ? 'Utilization' : 'Sanction';
    const suffix = calculationOn === '2' ? 'utilization' : 'sanction';
    const unitLabel = selectedUnitC === 'Million' ? '(₹M)' : selectedUnitC === 'Billion' ? '(₹B)' : '(₹)';
    const isCustomerLevel = this.data.currentView === 'Customer';
    // const isCustomerLevelS = this.viewHierarchyConfig[this.selectedViewBy] ==='Customer';

    this.tableHeaders = [
      ...(!isCustomerLevel ? [
        { key: 'unique_cust_count', label: 'Unique Customers' }
      ] : []),
      { key: `latest_total_${suffix}`, label: `Total ${viewType} ${unitLabel}` },
      { key: `selected_total_${suffix}`, label: `Prev ${viewType} ${unitLabel}` },
      { key: `latest_hsbc_${suffix}`, label: `HSBC ${viewType} ${unitLabel}` },
      { key: `selected_hsbc_${suffix}`, label: `Prev HSBC ${viewType} ${unitLabel}` },
      { key: 'change_wallet', label: `Change In ${viewType} Wallet Value ${unitLabel}` },
      { key: 'change_wallet_pct', label: `Change In ${viewType} Wallet %` },
      ...(isCustomerLevel ? [
        { key: 'classification', label: 'Classification' }
      ] : []),
    ];

        this.tableHeadersF = [
      { key: `latest_total_${suffix}`, label: `Total ${viewType} ${unitLabel}` },
      { key: `selected_total_${suffix}`, label: `Prev ${viewType} ${unitLabel}` },
      { key: `latest_hsbc_${suffix}`, label: `HSBC ${viewType} ${unitLabel}` },
      { key: `selected_hsbc_${suffix}`, label: `Prev HSBC ${viewType} ${unitLabel}` },
      { key: 'change_wallet', label: `Change In ${viewType} Wallet Value ${unitLabel}` },
      { key: 'change_wallet_pct', label: `Change In ${viewType} Wallet %` },
    ];
    
    this.updateColumnMapping();
  }
  
  updateColumnMapping() {
    this.columnMap = {
      [this.data.currentView]: 'group_by_column',
      'Company Name': 'group_by_column',
      'Classification': 'classification',
      ...this.tableHeaders.reduce((acc, header) => {
        acc[header.label] = header.key;
        return acc;
      }, {})
    };
  }

  get numberFormat(): string {
    if (this.data.selectedUnitC === 'Million') return '1.1-1';
    if (this.data.selectedUnitC === 'Billion') return '1.2-2';
    return '1.0-0';
  }

    getColumnFormat(columnName: string): string {
    const percentageColumns = ['change_wallet_pct'];
    if (this.data.selectedUnitC === 'Absolute' && percentageColumns.includes(columnName)) {
      return '1.2-2';
    }
    return this.numberFormat;
  }


  onFetchThirdLevelView(thirdLevelReq: any) {
    console.log("this.data?.dataSetIdCRQ",this.data?.dataSetIdCRQ);
    
    this.filtersffC = thirdLevelReq;
    const req = {
      // dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_query')?.dataset_id || null,
      dataset_id: this.data?.dataSetIdCRQ,
      dashboard_id: 3,
      source_id : 3,
      filters : this.filtersffC
    }

    console.log('requesting product level customers ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe((response) => {
      console.log('response => ', response);
      this.thirdLevelViewData = response.data.data;
      this.isLoadingThirdLevel = false;
    })
    this.getThirdLevelViewTotalRecord();
}
    onFetchFourLevelView(pageSize : any,offset : any) {
    const searchReq = this.prepareSearchRequest(this.fourthLevelSearchFilters);
    this.filtersffCFour = {
      ...this.filtersffC,
      group_by_column: 'c.name',
      employee_name : this.fourLevelSelectName,
      page_size: pageSize,
      page_offset: offset,
      ...this.fourthLevelSortOrderObj,
      ...searchReq
    };
    const req = {
      // dataset_id: this.datasetsC.find(d => d.dataset_name === 'report_query')?.dataset_id || null,
      dataset_id: this.data?.dataSetIdCRQ,
      dashboard_id: 3,
      source_id : 3,
      filters : this.filtersffCFour
    }

    console.log('requesting product level customers ', req);
    
    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe((response) => {
      console.log('response => ', response);
      this.fourLevelViewData = response.data.data;
      this.isLoadingFourthLevel = false;
    })
    this.getFourLevelViewTotalRecord();
}

    getFourLevelViewTotalRecord() {
    const req = {
      dataset_id: this.data?.dataSetIdCTRQ,
      dashboard_id: 3,
      source_id : 3,
      filters : this.filtersffCFour
    }

    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsFourLevel = response.data.data[0].total_rows; 
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }

    getThirdLevelViewTotalRecord() {
    const req = {
      dataset_id: this.data?.dataSetIdCTRQ,
      dashboard_id: 3,
      source_id : 3,
      filters : this.filtersffC
    }

    this.msmeService.getPrDashboardLendingAnalysisData(req).subscribe(
      (response) => {
        if (response) {
          if (response && response.data?.data) {
            this.totalRecordsThirdLevel = response.data.data[0].total_rows; 
          }
        } else {
          this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonService.errorSnackBar('Error while getting PR Dashboard Filter');
      }
    );
  }

  goBack() {
  this.isLoadingFourthLevel = true;
  this.fourLevelViewData = null;
  this.showDetails = !this.showDetails;
}


  closePopup() {
    this.dialogRef.close({ status: 'done' });
  }

  onSelectFourthlevel(fourthlevelSelectName) {
   this.showDetails = !this.showDetails;
   this.isLoadingFourthLevel = true;
   this.fourLevelSelectName = fourthlevelSelectName;
   this.onFetchFourLevelView(5,0);
  }

  get startRow(): number {
    return (this.page - 1) * this.pageSize + 1;
  }

  get endRow(): number {
    return Math.min(this.page * this.pageSize, this.totalRecordsThirdLevel);
  }

  onPageChange(pageNumber: number) {
    this.thirdLevelViewData = null;
    this.isLoadingThirdLevel = true;
    this.page = pageNumber;
    const offset = (this.page - 1) * this.pageSize;
    const searchReq = this.prepareSearchRequest(this.thirdLevelSearchFilters);
    this.filtersffC = {
      ...this.filtersffC,
      page_offset: offset,
      page_size: this.pageSize,
      ...this.thirdLevelSortOrderObj,
      ...searchReq
    }
    this.onFetchThirdLevelView(this.filtersffC);
  }

  onPageSizeChange(size: number) {
    this.thirdLevelViewData = null;
    this.isLoadingThirdLevel = true;
    this.pageSize = size;
    this.page = 1;
    const offset = 0;
    const searchReq = this.prepareSearchRequest(this.thirdLevelSearchFilters);
    this.filtersffC = {
      ...this.filtersffC,
      page_offset: offset,
      page_size: this.pageSize,
      ...this.thirdLevelSortOrderObj,
      ...searchReq
    }
    this.onFetchThirdLevelView(this.filtersffC);
  }

  get startRowF(): number {
    return (this.pageF - 1) * this.pageSizeF + 1;
  }

  get endRowF(): number {
    return Math.min(this.pageF * this.pageSizeF, this.totalRecordsFourLevel);
  }

  onPageChangeF(pageNumber: number) {
    this.fourLevelViewData = null;
    this.isLoadingFourthLevel = true;
    this.pageF = pageNumber;
    const offset = (this.pageF - 1) * this.pageSizeF;
    this.onFetchFourLevelView(this.pageSizeF,offset);
  }

  onPageSizeChangeF(size: number) {
    this.fourLevelViewData = null;
    this.isLoadingFourthLevel = true;
    this.pageSizeF = size;
    this.pageF = 1;
    const offset = 0;
    this.onFetchFourLevelView(this.pageSizeF,offset);
  }
  
  // Search functionality
  onThirdLevelSearch(column: string, event: any) {
  const cleanedValue = event.target.value.replace(/\./g, '');
  event.target.value = cleanedValue;
    this.thirdLevelSearchFilters[column] = cleanedValue;
  const isNumeric = /^[0-9]+$/.test(cleanedValue);
  if (cleanedValue === '') {
    this.thirdLevelSearchSubject.next(cleanedValue);
    return;
  }
  if (isNumeric) {
    this.thirdLevelSearchSubject.next(cleanedValue);
  } else {
    if (cleanedValue.length >= 3) {
      this.thirdLevelSearchSubject.next(cleanedValue);
    }
  }
    
  }

  onFourthLevelSearch(column: string, event: any) {
    const cleanedValue = event.target.value.replace(/\./g, '');
    event.target.value = cleanedValue;
    this.fourthLevelSearchFilters[column] = cleanedValue;
    const isNumeric = /^[0-9]+$/.test(cleanedValue);
    if (cleanedValue === '') {
      this.fourthLevelSearchSubject.next(cleanedValue);
      return;
    }
    if (isNumeric) {
      this.fourthLevelSearchSubject.next(cleanedValue);
    } else {
      if (cleanedValue.length >= 3) {
        this.fourthLevelSearchSubject.next(cleanedValue);
      }
    }
  }

  prepareSearchRequest(filters: any): any {
    const columnSearchFilter = Object.keys(filters)
      .filter(key => filters[key] && filters[key].trim())
      .map(key => ({ key: this.columnMap[key] || key, value: filters[key] }));
    
    return { column_search_filter: columnSearchFilter };
  }

  emitThirdLevelPagination() {
    const searchReq = this.prepareSearchRequest(this.thirdLevelSearchFilters);
    const offset = (this.page - 1) * this.pageSize;
    this.thirdLevelViewData = null;
    this.isLoadingThirdLevel = true;
    this.filtersffC = {
      ...this.filtersffC,
      page_offset: offset,
      page_size: this.pageSize,
      ...this.thirdLevelSortOrderObj,
      ...searchReq
    }
    this.onFetchThirdLevelView(this.filtersffC);
  }

  emitFourthLevelPagination() {
    const searchReq = this.prepareSearchRequest(this.fourthLevelSearchFilters);
    const offset = (this.pageF - 1) * this.pageSizeF;
    this.fourLevelViewData = null;
    this.isLoadingFourthLevel = true;
    this.filtersffC = {
      ...this.filtersffC,
      page_offset: offset,
      page_size: this.pageSizeF,
      ...this.fourthLevelSortOrderObj,
      ...searchReq
    }
    this.onFetchFourLevelView(this.pageSizeF, offset);
  }

  // Sorting functionality
  onChangeOrder(columnName: string, isThirdLevel: boolean = true) {
    const currentSortObj = isThirdLevel ? this.thirdLevelSortOrderObj : this.fourthLevelSortOrderObj;
    const currentCol = currentSortObj.order_by_column;
    const currentType = currentSortObj.order_by_type;
    const newCol = this.columnMap[columnName];

    if(currentCol !== newCol) {
      currentSortObj.order_by_column = newCol;
      currentSortObj.order_by_type = 'ASC';
    } else {
      currentSortObj.order_by_type = currentType === 'ASC' ? 'DESC' : 'ASC';
    }

    if (isThirdLevel) {
      this.thirdLevelViewData = null;
      this.isLoadingThirdLevel = true;
      this.emitThirdLevelPagination();
    } else {
      this.fourLevelViewData = null;
      this.isLoadingFourthLevel = true;
      this.emitFourthLevelPagination();
    }
  }
}
