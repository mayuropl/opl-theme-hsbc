import {MatDialog} from '@angular/material/dialog';
import {Component, NgZone, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MsmeService} from 'src/app/services/msme.service';
import {CommonService} from 'src/app/CommoUtils/common-services/common.service';
import {UntypedFormBuilder} from '@angular/forms';
import {CommonMethods} from 'src/app/CommoUtils/common-methods';
import {HttpClient} from '@angular/common/http';
import {ExcelDownloadService} from 'src/app/CommoUtils/common-services/excel-download.service';
import {DatePipe} from '@angular/common';
import {CurrencySymbolDict} from '../bank-statement-internal/bank-statement-internal.component';
import {Constants} from 'src/app/CommoUtils/constants';
import {BalanceDepositPopupComponent} from 'src/app/Popup/HSBC/balance-deposit-popup/balance-deposit-popup.component';
import {LoaderService} from '../../../../CommoUtils/common-services/LoaderService';
import {Subject} from 'rxjs';
import {MatSelect, MatSelectChange} from '@angular/material/select';
import _ from 'lodash';
import {OverlayContainer} from '@angular/cdk/overlay';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-average-bank-balance-analysis',
  templateUrl: './average-bank-balance-analysis.component.html',
  styleUrl: './average-bank-balance-analysis.component.scss',
})
export class AverageBankBalanceAnalysisComponent {



  constructor(
    public dialog: MatDialog,
    private msmeService: MsmeService,
    private commonService: CommonService,
    private loaderService: LoaderService
  ) {
  }

  pagination = {pageIndex: 1, pageSize: 5, totalSize: 0};

  reportType: any;
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  pages = 10;

  categoryDataList: any;
  categoryDataFinalList: any;

  collapsedList: boolean[] = [];

  PageSelectNumber: any[] = [
    {name: '5', value: 5},
    {name: '10', value: 10},
    {name: '15', value: 15},
    {name: '20', value: 20},
  ];
  accountType = [
    {id: '1', name: 'Term Deposit'},
    {id: '2', name: 'Current Account'},
    {id: '3', name: 'EEFC'},
    {id: '4', name: 'OD/CC Account'},

  ];

  fieldVar = [
    {
      id: '1',
      listVarName: 'segment_name',
      listName: 'segmentWise',
      innerListName: 'cityWise',
      innerListVarName: 'city_name',
      parentId: 'segment',
      childId: 'city'
    },
    {
      id: '2',
      listVarName: 'city_name',
      listName: 'cityWise',
      innerListName: 'rmWise',
      innerListVarName: 'rm_name',
      parentId: 'city',
      childId: 'rmId'
    },
    {
      id: '3',
      listVarName: 'rm_name',
      listName: 'rmWise',
      innerListName: 'custIdWise',
      innerListVarName: 'cust_name',
      parentId: 'rmId',
      childId: ''
    },
    {id: '4', listVarName: 'cust_name', listName: 'custIdWise', innerListName: '', innerListVarName: '', parentId: '', childId: ''},

  ];

  trendBy = [
    {id: '1', name: 'Segment Wise', columnName: 'Segment', innerColumnName: 'City Name'},
    {id: '2', name: 'City Wise', columnName: 'City Name', innerColumnName: 'Relationship Manger'},
    {id: '3', name: 'Relationship Manger Wise', columnName: 'Relationship Manger Name', innerColumnName: 'Customer'},
    {id: '4', name: 'Customer Wise', columnName: 'Name', innerColumnName: ''},
  ];

  parentRequest: any;
  childRequest: any;


  selectedAccountType: any;
  selectedYearOption: any = '1';
  selectedViewOption: any = '1';
  currencyList = [];
  selectedCurrency;
  criteria1Total;
  criteria2Total;
  changePctTotal;
  customerId;
  isPresent = false;
  custmerData = [];
  customerMap = new Map<string, string>();

  yearOption: { name: string; value: number }[] = [];
  selectedCriteria1Year: number;
  selectedCriteria2Year: number;

  quarterOptions = ['Q1', 'Q2', 'Q3', 'Q4'];

  selectedCriteria1Quarters: string[] = [];
  selectedQuarter: string[] = [];
  selectedCriteria2Quarters: string[] = [];
  selected2Quarter: string[] = [];
  selectedMonth: string[] = [];
  selected2Months: number[] = [];

  sortingColumnId = '1';
  currentSortValue = '1';
  sortStates = {
    column: '1',
    order: '1' as '1' | '2',
    innerColumn: '3',
    innerOrder: '1' as '1' | '2'
  };
  currency = '4';
  roleId: any;
  filteredCurrencyList: any;
  abbMasterList: any;
  initialDisplayCount = 20;
  rmUserList: any;
  rmIdList: any;
  filteredAbbMasterList: any;
  trendChange: any;
  dataList: any;
  // segmentList: any = {};
  // customerList: any = {};
  // cityList: any = {};

  segmentList: any[] = [];
  cityList: any[] = [];
  customerList: any[] = [];

  months = [
    {name: 'January', value: 1},
    {name: 'February', value: 2},
    {name: 'March', value: 3},
    {name: 'April', value: 4},
    {name: 'May', value: 5},
    {name: 'June', value: 6},
    {name: 'July', value: 7},
    {name: 'August', value: 8},
    {name: 'September', value: 9},
    {name: 'October', value: 10},
    {name: 'November', value: 11},
    {name: 'December', value: 12}
  ];

  protected readonly Number = Number;
  searchText = '';
  selectedQuarters: any = [];
  newSelectedQuarters: any = []; // bound to mat-select

  allValue = 'All';
  isTableSubLoading: any = false;
  isSubTableSubLoading: any = false;
  allseelcted = false;

  allOption = {
    name: 'All',
    selected: false,
    sno: -1,
    value: 'All'
  };

  selectedView: '1' | '2' = '1';
  selectedMonths: number[] = [];
  blankSelected = false;
   minChangePct: number;
   maxChangePct: number;
  ngOnInit(): void {
    this.customerId = this.commonService.getStorage('cutomerId', true);
    this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    this.fetchCurrency();
    this.initializeYearOptions();
    this.fetchRmList();
    this.fetchAnyMasterList(1);
    this.fetchAnyMasterList(2);
    this.fetchAnyMasterList(4);

    this.searchValueChanged
      .pipe(debounceTime(300)) // Adjust delay as needed
      .subscribe(({ searchText }) => {
        this.filterSerachDebounce(searchText);
      });
  }

  filterSerachDebounce(filter) {
    if (filter && filter.length < 3) {
      return;
    }
    this.pageNo = 0;
    this.pageSizeMaster = 20;
   this.fetchAnyMasterList(this.selectedMasterType , 0, 20 , filter);
  }

  fetchRmList() {
    const data = {
      roleTypeId: this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true),
      roleId: this.roleId,
    };
    this.msmeService.getRmUserList(data).subscribe(
      (res: any) => {
        if (res && res.status === 200) {
          if (res.data != null) {
            this.rmUserList = res?.data;
            this.rmIdList = this.rmUserList.map(o => o.value);
            // this.rmIdList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 100200, 123789]
          }
        } else {
          console.error;
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );
  }

  fetchCurrency() {
    const data = {};
    this.msmeService.getCurrency(data).subscribe(
      (res: any) => {
        if (res && res.status === 200) {
          if (res.data != null) {
            this.currencyList = res?.data?.currency_list;
            this.filteredCurrencyList = this.currencyList;
          }
        } else {
          console.error;
          this.commonService.warningSnackBar(res.message);
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );
  }

  submit() {
    let json1:any;
    let json2:any;
    if(this.selectedViewOption === '1'){
      json1 = JSON.parse(JSON.stringify(this.selectedCriteria2Quarters));
      json2 = JSON.parse(JSON.stringify(this.selectedCriteria1Quarters));
    }else{
      json2 = JSON.parse(JSON.stringify(this.selectedMonths));
      json1 = JSON.parse(JSON.stringify(this.selected2Months));
    }
    if (this.selectedCriteria1Year === this.selectedCriteria2Year && this.isSameArray( json1, json2)) {
      if(this.selectedViewOption === '1'){
        this.commonService.warningSnackBar('Please select different criteria or different quarters.');
      }else{
        this.commonService.warningSnackBar('Please select different criteria or different months.');
      }
      return false;
    } else {
      this.getParentfetchedreport();
    }
  }

  isSameArray(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    // Sort both arrays and compare each element
    arr1 = [...arr1].sort();
    arr2 = [...arr2].sort();

    return arr1.every((value, index) => value === arr2[index]);
  }

  handleSort(column: string, order: '1' | '2', isInner: boolean, parentId?: any) {
    if (isInner) {
        if (parentId) {
          if (this.categoryDataFinalList) {
            this.categoryDataFinalList.forEach((data: any) => {
              const keyName = this.fieldVar[this.trendChange - 1].parentId;
              if (data?.[keyName] === parentId) {
                data.custPagination.page = 1;
                data.custPagination.sortCol = column;
                data.custPagination.sortOrder = order;
                this.childPagination(1, data.custPagination.pageSize, parentId, column, order);
              }
            });
          }
        }
      } else {
        this.sortingColumnId = column;
        this.currentSortValue = order;
        this.sortStates.column = column;
        this.sortStates.order = order;
        this.pagination.pageIndex = 1;
        this.getParentfetchedreport();
      }
    }

  fetchAbbReport(page?, isLoader?): boolean {
    const json1 = JSON.parse(JSON.stringify(this.selectedCriteria2Quarters));
    const json2 = JSON.parse(JSON.stringify(this.selectedCriteria1Quarters));
    if (this.selectedCriteria1Year === this.selectedCriteria2Year && this.isSameArray(json1, json2)) {
      this.commonService.warningSnackBar('Please select different criteria or different quators.');
      return false;
    } else {
      const data = {
        customerId: this.roleId,
        accountType: this.selectedAccountType,
        currency: this.selectedCurrency == null ? '1' : this.selectedCurrency,
        size: this.pageSize,
        pageIndex: this.page - 1,
        sortingColumn: this.sortStates.column,
        sortingOrder: this.sortStates.order,
        criteria1Year: this.selectedCriteria1Year,
        criteria1Quartars: this.selectedCriteria1Quarters,
        criteria2Year: this.selectedCriteria2Year,
        criteria2Quartars: this.selectedCriteria2Quarters,
        yearType: this.selectedYearOption,
      };
      this.msmeService.getAbbReport(data, isLoader).subscribe(
        (res: any) => {
          if (res && res.status === 200) {
            if (res.data != null && JSON.parse(res?.data)?.statusCode === 200) {
              console.log('res: ', res);
              this.custmerData = JSON.parse(res?.data)?.customerData;
              this.currency = JSON.parse(res?.data)?.currency;
              this.customerMap = new Map(Object.entries(res?.map || {}));
              this.totalSize = JSON.parse(res?.data)?.totalRows;
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          } else {
            console.error;
            this.commonService.warningSnackBar(res.message);
          }
        },
        (err) => {
          this.commonService.errorSnackBar(err);
        }
      );
      return true;
    }
  }

  onAccountTypeSelected(event: any) {
    this.isPresent = false;
    this.resetPagination();
    this.selectedAccountType = event?.value;
    if (this.selectedAccountType === '2' || this.selectedAccountType === '4') {
      this.filteredCurrencyList = this.currencyList.filter(currency => currency.id === 1);
    } else if (this.selectedAccountType === '3') {
      this.filteredCurrencyList = this.currencyList.filter(currency => currency.id !== 1);
    } else {
      this.filteredCurrencyList = this.currencyList;
    }
  }

  getParentfetchedreport() {
    const rmId: any = this.rmIdList.filter(id => id !== 'All');
    let monthView:number;
    let minChnage:any;
    let maxChnage:any;
    minChnage = this.minChangePct;
    maxChnage = this.maxChangePct;
    if (this.selectedViewOption === '2'){
      monthView = 1;
    }else{
      monthView = 0;
    }
    // let rmId:any = [1,2,3,4,5,6,7,8,9,10];
    const abbRequest: AbbRequest = {
      userRmId: rmId,
      reportType: this.reportType,
      accountType: this.selectedAccountType,
      currency: this.selectedCurrency == null ? '1' : this.selectedCurrency,
      criteria1Year: this.selectedCriteria1Year,
      criteria1Quartars: this.selectedCriteria1Quarters,
      criteria1Months: this.selectedMonths,
      criteria2Months: this.selected2Months,
      criteria2Year: this.selectedCriteria2Year,
      criteria2Quartars: this.selectedCriteria2Quarters,
      yearType: this.selectedYearOption,
      outerPageIndex: this.pagination.pageIndex - 1,
      outerSize: this.pagination.pageSize,
      innerPageIndex: 0,
      innerSize: 5,
      innerSortingColumn: Number(this.sortStates.innerColumn),
      outerSortingColumn: Number(this.sortStates.column),
      innerSortingOrder: Number(this.sortStates.innerOrder),
      outerSortingOrder: Number(this.sortStates.order),
      cityId: [],
      segmentId: [],
      dataRmId: [],
      custId: [],
      minChangePct: minChnage != null &&  minChnage !== ''  ? minChnage : null,
      maxChangePct: maxChnage != null &&  maxChnage !== ''  ? maxChnage : null,
      isMonthView: monthView
    };
    const allSelected = this.selectedQuarters.includes('All');

    const selectedData = (this.selectedQuarters || []).filter(
      id => id && id !== 'All'
    );
    switch (this.trendChange) {
      case 1:
        if (allSelected) {
          abbRequest.reportType = Constants.ReportType.SEGMENT_WISE_ALL;
        } else {
          abbRequest.reportType = Constants.ReportType.SEGMENT_WISE_SEGMENT_SELECTED;
          abbRequest.segmentId = selectedData;
        }

        break;
      case 2:
        if (allSelected) {
          abbRequest.reportType = Constants.ReportType.CITY_WISE_OVERALL;
        } else {
          abbRequest.reportType = Constants.ReportType.CITY_WISE_CITY_SELECTED;
          abbRequest.cityId = selectedData;
        }

        break;
      case 3:
        if (allSelected) {
          abbRequest.reportType = Constants.ReportType.RM_WISE_OVERALL;
        } else {
          abbRequest.reportType = Constants.ReportType.RM_WISE_RM_SELECTED;
          abbRequest.dataRmId = selectedData;
        }

        break;
      case 4:
        if (allSelected) {
          abbRequest.reportType = Constants.ReportType.CUSTID_WISE_OVERALL;
        } else {
          abbRequest.reportType = Constants.ReportType.CUSTID_WISE_SELECTED;
          abbRequest.custId = selectedData;
        }

        break;
      default:
        // Optional: handle unknown trend
        break;
    }
    const request = {
      request: JSON.stringify(abbRequest),
    };
    this.parentRequest = _.cloneDeep(abbRequest);
    this.childRequest = _.cloneDeep(abbRequest);
    this.msmeService.getAbbLevelReport(request).subscribe(
      (res: any) => {
        console.log('Response for level report == ', res);
        if (res && res?.status === 200) {

          const json = JSON.parse(res?.data);
          this.categoryDataList = json?.data;
          this.pagination.totalSize = json?.data?.totalRows;
          this.criteria1Total = json?.data?.overallCriteria1Total;
          this.criteria2Total = json?.data?.overallCriteria2Total;
          this.changePctTotal = json?.data?.overallChangePct;
          const key = this.fieldVar[this.trendChange - 1].listName;
          const innerKey = this.fieldVar[this.trendChange - 1].innerListName;
          if (this.categoryDataList) {
            this.categoryDataFinalList = this.categoryDataList?.[key].map(bank => ({
              ...bank,
              custPagination: {
                page: 1,
                pageSize: 5,
                sortCol: '3',
                sortOrder: '1',
                value: '',
                totalItems: bank.totalRows,
                displayedCustList: bank[innerKey]
              }
            }));
            this.categoryDataFinalList.forEach((_, index) => {
              this.collapsedList[index] = true; // all collapsed by default
            });
            this.isPresent = true;
          }
          console.log(this.categoryDataFinalList);
        } else {
          this.isPresent = false;
          this.resetPagination();
          this.commonService.warningSnackBar((res?.message));
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );

  }

  onYearOptionSelected(event: any) {
    this.selectedYearOption = event.value;
    this.isPresent = false;
    this.resetPagination();
  }

  onViewOptionSelected(event: any) {
    this.selectedMonths = [];
    this.selected2Months = [];
    this.selectedQuarter = [];
    this.selected2Quarter = [];
    this.selectedViewOption = event.value;
    this.isPresent = false;
    this.resetPagination();
  }

  onQuarterSelectionChange(selectedQuarters: string[]) {
    this.isPresent = false;
    this.resetPagination();
    if (selectedQuarters.length === 0) {
      this.selectedQuarter = [];
      this.selectedCriteria1Quarters = [];
      return;
    }
    const sortedQuarters = [...selectedQuarters].sort((a, b) =>
      this.quarterOptions.indexOf(a) - this.quarterOptions.indexOf(b)
    );

    const firstQuarter = sortedQuarters[0];
    const lastQuarter = sortedQuarters[sortedQuarters.length - 1];
    const firstIndex = this.quarterOptions.indexOf(firstQuarter);
    const lastIndex = this.quarterOptions.indexOf(lastQuarter);

    const allQuartersInRange = this.quarterOptions.slice(firstIndex, lastIndex + 1);

    const mergedQuarters = [...new Set([...selectedQuarters, ...allQuartersInRange])];

    this.selectedQuarter = mergedQuarters.sort((a, b) =>
      this.quarterOptions.indexOf(a) - this.quarterOptions.indexOf(b)
    );
    this.selectedCriteria1Quarters = [...this.selectedQuarter];
  }

  initializeYearOptions() {
    const currentYear = new Date().getFullYear();
    this.yearOption = [
      {name: currentYear.toString(), value: currentYear},
      {name: (currentYear - 1).toString(), value: currentYear - 1},
      {name: (currentYear - 2).toString(), value: currentYear - 2},
    ];

    this.selectedCriteria1Year = currentYear;
  }

  onCriteria1Selection(event: any) {
    this.isPresent = false;
    this.resetPagination();
    this.selectedCriteria1Year = event.value.value;
  }

  onCriteria2Selection(event: any) {
    this.isPresent = false;
    this.resetPagination();
    this.selectedCriteria2Year = event.value.value;
  }

  onQuarterSelection2Change(selectedQuarters: string[]) {
    this.isPresent = false;
    this.resetPagination();
    if (selectedQuarters.length === 0) {
      this.selected2Quarter = [];
      this.selectedCriteria2Quarters = [];
      return;
    }

    const sortedQuarters = [...selectedQuarters].sort((a, b) =>
      this.quarterOptions.indexOf(a) - this.quarterOptions.indexOf(b)
    );

    const firstQuarter = sortedQuarters[0];
    const lastQuarter = sortedQuarters[sortedQuarters.length - 1];
    const firstIndex = this.quarterOptions.indexOf(firstQuarter);
    const lastIndex = this.quarterOptions.indexOf(lastQuarter);

    const allQuartersInRange = this.quarterOptions.slice(firstIndex, lastIndex + 1);

    const mergedQuarters = [...new Set([...selectedQuarters, ...allQuartersInRange])];

    this.selected2Quarter = mergedQuarters.sort((a, b) =>
      this.quarterOptions.indexOf(a) - this.quarterOptions.indexOf(b)
    );
    this.selectedCriteria2Quarters = [...this.selected2Quarter];
  }

//   onMonthSelectionChange(selectedMont: any ,type : any){
//
// }

  onCurrencySelection(event: any) {
    this.selectedCurrency = event?.value;
    this.isPresent = false;
    this.resetPagination();
  }

  onChangePage(page: any): void {
    console.log('Changed page ', page);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchAbbReport(page, true);
  }

  sortingColumn(value) {
    this.sortingColumnId = value;
    this.parentPagination();
  }

  toggleSort() {
    this.currentSortValue = this.currentSortValue === '1' ? '2' : '1';
    this.parentPagination();
    return this.currentSortValue;
  }

  childSortingColumn(value, parentId, data) {
    data.custPagination.sortCol = value;
    this.sortStates.innerColumn = value;
    this.childPagination(data.custPagination.page, data.custPagination.pageSize, parentId, data.custPagination.sortCol, data.custPagination.sortOrder);
  }

  childToggleSort(parentId, data) {
    data.custPagination.sortOrder = data.custPagination.sortOrder == 1 ? 2 : 1;
    this.sortStates.innerOrder = data.custPagination.sortOrder.toString() as '1' | '2';
    this.childPagination(data.custPagination.page, data.custPagination.pageSize, parentId, data.custPagination.sortCol, data.custPagination.sortOrder);
  }

  getCurrencyName(id): string {
    const currency = this.currencyList.find((item) => item.id === id);
    return currency?.name;
  }

  getYearPrefix(): string {
    return this.selectedYearOption === '1' ? 'CY' : 'FY';
  }

  getCurrencySymbol(id): string {
    const currency = this.currencyList.find(item => item.id === id);
    return CurrencySymbolDict[currency.name];
  }

  balancedepositDialog(chilId: any, parentId, rmName?: any): void {
    this.isTableSubLoading = false;
    this.isSubTableSubLoading = false;
    console.log('::::::::::::loader', this.isTableSubLoading);
    const childs: any = [chilId];
    const parents: any = [parentId];
    const rmId: any = this.rmIdList.filter(id => id !== 'All');
    let monthView:number;
    let minChnage:any;
    let maxChnage:any;
    minChnage = this.minChangePct;
    maxChnage = this.maxChangePct;
    if (this.selectedViewOption === '2'){
      monthView = 1;
    }else{
      monthView = 0;
    }
    // let rmId:any = [1,2,3,4,5,6,7,8,9,10];
    const abbRequest: AbbRequest = {
      userRmId: rmId,
      reportType: this.reportType,
      accountType: this.selectedAccountType,
      currency: this.selectedCurrency == null ? '1' : this.selectedCurrency,
      criteria1Year: this.selectedCriteria1Year,
      criteria1Quartars: this.selectedCriteria1Quarters,
      criteria2Year: this.selectedCriteria2Year,
      criteria2Quartars: this.selectedCriteria2Quarters,
      criteria1Months: this.selectedMonths,
      criteria2Months: this.selected2Months,
      yearType: this.selectedYearOption,
      outerPageIndex: 0,
      outerSize: 5,
      innerPageIndex: 0,
      innerSize: 5,
      innerSortingColumn: Number(this.sortStates.innerColumn),
      outerSortingColumn: Number(this.sortStates.column),
      innerSortingOrder: Number(this.sortStates.innerOrder),
      outerSortingOrder: Number(this.sortStates.order),
      cityId: [],
      segmentId: [],
      dataRmId: [],
      custId: [],
      minChangePct: minChnage != null &&  minChnage !== ''  ? minChnage : null,
      maxChangePct: maxChnage != null &&  maxChnage !== ''  ? maxChnage : null,
      isMonthView: monthView
    };

    switch (this.trendChange) {
      case 1:
        abbRequest.reportType = Constants.ReportType.SEGMENT_WISE_SEGMENT_CITY_SELECTED;
        abbRequest.cityId = childs;
        abbRequest.segmentId = parents;
        break;
      case 2:
        abbRequest.reportType = Constants.ReportType.CITY_WISE_RM_SELECTED;
        abbRequest.dataRmId = childs;
        abbRequest.cityId = parents;
        break;
      default:
        break;
    }

    const request = {
      request: JSON.stringify(abbRequest),
    };
    this.msmeService.getAbbLevelReport(request).subscribe(
      (res: any) => {
        console.log('Response for level report == ', res);
        if (res && res?.status === 200) {
          const json = JSON.parse(res?.data);
          console.log('req ===', abbRequest);
          json.request = abbRequest;
          json.c1Name = this.getYearPrefix() + this.selectedCriteria1Year + this.selectedQuarter + '(' + this.getCurrencyName(this.selectedCurrency) + ')';
          json.c2Name = this.getYearPrefix() + this.selectedCriteria2Year + this.selected2Quarter + '(' + this.getCurrencyName(this.selectedCurrency) + ')';
          json.trendChange = this.trendChange;
          json.cityList = this.cityList;
          json.segmentList = this.segmentList;
          if (this.trendChange === 2) {
            json.rmName = rmName;
          }
          if(this.selectedCurrency === 1){
            json.currencySymbol = this.getCurrencySymbol(this.selectedCurrency);
          }
          this.dialog.open(BalanceDepositPopupComponent, {
            panelClass: ['popupMain_design', 'right-side-modal'],
            data: json,
            disableClose: true,
            autoFocus: true
          });
          console.log('::::::::::::loader', this.isTableSubLoading);
          console.log('::::::::::::loader', this.isSubTableSubLoading);
        } else {
          this.commonService.warningSnackBar(res?.message);
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );


  }

  onSelectionChange(event: MatSelectChange): void {
    const selected = event.value;

    // Update `selected` state for each item
    this.filteredAbbMasterList.forEach(option => {
      option.selected = selected.includes(option.value);
    });

    // Handle "All" logic
    const allOption = this.filteredAbbMasterList.find(o => o.value === this.allValue);
    if (allOption) {
      const others = this.filteredAbbMasterList.filter(o => o.value !== this.allValue);
      const allSelected = others.every(o => selected.includes(o.value));

      if (selected.includes(this.allValue) && !allSelected) {
        // User selected "All", so select all
        this.selectedQuarters = this.filteredAbbMasterList.map(o => o.value);
      } else if (!selected.includes(this.allValue) && allSelected) {
        // Remove "All" if others selected manually
        this.selectedQuarters = selected.filter(v => v !== this.allValue);
      } else if (!allSelected) {
        this.selectedQuarters = selected.filter(v => v !== this.allValue);
      }
    }
  }
  searchValueChanged: Subject<{ searchText: any }> = new Subject();
  onNewSearchInput(value: string) {
    if(this.selectedMasterType !== 3){
    this.pageNo = 0;
    this.searchText = value.trim();
    this.searchValueChanged.next({searchText: this.searchText });
    }else{
      this.onSearchInput(this.searchText);
    }}

  onSearchInput(value: string) {
    this.pageNo = 0;
    this.searchText = value;

    const selectedValueSet = new Set(this.selectedQuarters);

    // Get selected items from the master list
    const selectedOptions = this.abbMasterList.filter(option =>
      selectedValueSet.has(option.value)
    );

    let filteredResults: any[] = [];

    if (!value || value.length <= 2) {
      filteredResults = this.abbMasterList;
    } else {
      filteredResults = this.abbMasterList.filter(option =>
        option.name?.toLowerCase()?.includes(value.toLowerCase())
      );
    }

    // Filter out selected items from search results
    const unselectedFiltered = filteredResults.filter(
      option => !selectedValueSet.has(option.value)
    );

    // Take up to 20 unselected items
    const limitedResults = unselectedFiltered.slice(0, 20);

    // Combine selected + limited filtered results
    const combined = [...selectedOptions, ...limitedResults];

    // Remove any accidental duplicates using a Map (based on unique value)
    const uniqueByValue = new Map();
    for (const item of combined) {
      if (!uniqueByValue.has(item.value)) {
        uniqueByValue.set(item.value, item);
      }
    }

    this.filteredAbbMasterList = Array.from(uniqueByValue.values());
  }


  toggleOption(option: any, event?: Event): void {
    this.isPresent = false;
    this.resetPagination();
    if (this.allOption?.value === option?.value) {
      const isAllAlreadySelected = this.newSelectedQuarters.includes(option.value);
      if (!isAllAlreadySelected) {
        this.allseelcted = true;
        this.selectedQuarters = this.filteredAbbMasterList.map(o => o.value);
        this.selectedQuarters.push(this.allOption.value);
        this.newSelectedQuarters = this.selectedQuarters;
      } else {
        this.allseelcted = false;
        this.newSelectedQuarters = this.selectedQuarters = [];
      }
    } else {
      this.allseelcted = false;
      const valueInclude = this.newSelectedQuarters.includes(option.value);
      if (!valueInclude) {
        this.selectedQuarters.push(option.value);
        this.newSelectedQuarters = this.selectedQuarters;
      } else {
        this.selectedQuarters = this.newSelectedQuarters.filter(val => val !== option.value && val?.value !== 'All');
        this.newSelectedQuarters = this.selectedQuarters;
      }
    }
  }


  fetchMasterList(reqe: any) {
    this.selectedQuarters = [''];
    this.isPresent = false;
    this.resetPagination();
    this.trendChange = reqe;
    this.selectedMasterType = reqe;
    let list: any;
    if (reqe === 3) {
      list = this.rmUserList;
    } else if (reqe === 2) {
      list = this.cityList;
    } else if (reqe === 1) {
      list = this.segmentList;
    } else if (reqe === 4) {
      list = this.customerList;
    }
    if (list) {
      this.abbMasterList = list.filter(val => val?.value !== 'All' && val?.value !== null && val?.value !== '');
      this.filteredAbbMasterList = this.abbMasterList;
    }


  }

  pageNo = 0;
  pageSizeMaster = 20;
  totalPages = 0;
  selectedMasterType: number | null = null;

  onScroll(event: any) {
    const panel = event.target;
    const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight;

    if (atBottom && this.pageNo + 1 < this.totalPages && this.selectedMasterType != 3) {
      this.pageNo++;
      this.fetchAnyMasterList(this.selectedMasterType, this.pageNo, this.pageSizeMaster);
    }
  }


  fetchAnyMasterList(reqType: number, pageNo: number = 0, pageSize: number = 20 , searchValue?: any) {
    const req = { masterType: reqType, pageNo, pageSize, searchValue };

    this.msmeService.getAbbMasterList(req).subscribe(
      (res: any) => {
        if (res?.status === 200 && res?.data) {
          const innerData = res.data;
          const list = Array.isArray(innerData.data) ? innerData.data : [];

          if (pageNo === 0) {
            // fresh search → reset list
            if (reqType === 2) this.cityList = list;
            else if (reqType === 1) this.segmentList = list;
            else if (reqType === 4) this.customerList = list;
          } else {
            // scroll → append
            if (reqType === 2) this.cityList = [...(this.cityList || []), ...list];
            else if (reqType === 1) this.segmentList = [...(this.segmentList || []), ...list];
            else if (reqType === 4) this.customerList = [...(this.customerList || []), ...list];
          }

          // ✅ Directly update filtered list
          this.updateFilteredList(reqType);

          this.totalPages = innerData.totalPages ?? 0;
        }
      },
      (err) => {
        console.error('Error while fetching master list', err);
      }
    );
  }

  updateFilteredList(reqType: number) {
    let list: any = [];
    if (reqType === 3) list = this.rmUserList;
    else if (reqType === 2) list = this.cityList;
    else if (reqType === 1) list = this.segmentList;
    else if (reqType === 4) list = this.customerList;

    this.abbMasterList = list.filter(val => val?.value !== 'All' && val?.value !== null && val?.value !== '');
    this.filteredAbbMasterList = this.abbMasterList;
  }
  getSelectedQuarterNames(): string {
    if (!this.selectedQuarters || this.selectedQuarters.length === 0) {
      return 'Select';
    }

    const names = this.abbMasterList
      .filter(item => this.selectedQuarters.includes(item.value))
      .map(item => item.name);

    // If no matching names found
    return names.length > 0 ? names.join(', ') : 'Select';
  }




  parentPagination() {
    console.log('Parent Pagination Calling');
    this.isTableSubLoading = true;
    this.isSubTableSubLoading = false;
    this.loaderService.subLoaderShow();
    this.parentRequest.outerPageIndex = this.pagination.pageIndex - 1;
    this.parentRequest.outerSize = this.pagination.pageSize;
    this.parentRequest.outerSortingColumn = Number(this.sortingColumnId);
    this.parentRequest.outerSortingOrder = Number(this.currentSortValue);
    this.parentRequest.innerPageIndex = 0;
    this.parentRequest.innerSize = 5;
    this.parentRequest.outerSortingColumn = Number(this.sortStates.column);
    this.parentRequest.outerSortingOrder = Number(this.sortStates.order);
    this.parentRequest.innerSortingColumn = Number(this.sortStates.innerColumn);
    this.parentRequest.innerSortingOrder = Number(this.sortStates.innerOrder);
    const request = {
      request: JSON.stringify(this.parentRequest),
    };
    this.msmeService.getAbbLevelReport(request).subscribe(
      (res: any) => {
        console.log('Response for level report == ', res);
        if (res && res?.status == 200) {

          const json = JSON.parse(res?.data);
          this.categoryDataList = json?.data;
          this.pagination.totalSize = json?.data?.totalRows;
          const key = this.fieldVar[this.trendChange - 1].listName;
          const innerKey = this.fieldVar[this.trendChange - 1].innerListName;
          if (this.categoryDataList) {
            this.categoryDataFinalList = this.categoryDataList?.[key].map(bank => ({
              ...bank,
              custPagination: {
                page: 1,
                pageSize: 5,
                sortCol: '3',
                sortOrder: '1',
                value: '',
                totalItems: bank.totalRows,
                displayedCustList: bank[innerKey]
              }
            }));
            this.categoryDataFinalList.forEach((_, index) => {
              this.collapsedList[index] = true; // all collapsed by default
            });
            this.isPresent = true;
          }
          console.log(this.categoryDataFinalList);
          this.isTableSubLoading = false;
          this.loaderService.subLoaderHide();
        } else {
          this.isPresent = false;
          this.resetPagination();
          this.isTableSubLoading = false;
          this.commonService.warningSnackBar(JSON.parse(res?.message));
          this.loaderService.subLoaderHide();
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
        this.loaderService.subLoaderHide();
      }
    );
  }

  childPagination(pageIndex, pageSize, parentId, sortingColumn?, sortingOrder?) {
    console.log('Child Pagination Calling');
    this.isSubTableSubLoading = true;
    this.isTableSubLoading = false;
    this.loaderService.subLoaderShow();
    this.childRequest.innerPageIndex = pageIndex - 1;
    this.childRequest.innerSize = pageSize;
    if (sortingColumn) {
      this.childRequest.innerSortingColumn = Number(sortingColumn);
    }
    if (sortingOrder) {
      this.childRequest.innerSortingOrder = Number(sortingOrder);
    }
    this.childRequest.outerSortingColumn = Number(this.sortingColumnId);
    this.childRequest.outerSortingOrder = Number(this.currentSortValue);
    if (this.trendChange === 1) {
      this.childRequest.segmentId = [parentId];
      this.childRequest.reportType = Constants.ReportType.SEGMENT_WISE_SEGMENT_SELECTED;
    } else if (this.trendChange === 2) {
      this.childRequest.cityId = [parentId];
      this.childRequest.reportType = Constants.ReportType.CITY_WISE_CITY_SELECTED;
    } else if (this.trendChange === 3) {
      this.childRequest.dataRmId = [parentId];
      this.childRequest.reportType = Constants.ReportType.RM_WISE_RM_SELECTED;
    }


    const request = {
      request: JSON.stringify(this.childRequest),
    };
    this.msmeService.getAbbLevelReport(request, true).subscribe(
      (res: any) => {
        console.log('Response for level report == ', res);
        if (res && res?.status == 200) {

          const json = JSON.parse(res?.data);
          const key = this.fieldVar[this.trendChange - 1].listName;
          const innerKey = this.fieldVar[this.trendChange - 1].innerListName;
          const keyName = this.fieldVar[this.trendChange - 1].parentId;
          let dataList: any = [];
          let totalRows;
          dataList = json?.data?.[key]?.[0]?.[innerKey];
          totalRows = json?.data?.[key]?.[0]?.totalRows;
          if (this.categoryDataFinalList) {

            this.categoryDataFinalList.forEach((data: any) => {
              const itemParentId = (data?.[keyName]);
              console.log(parentId);
              if (itemParentId === parentId) {
                data.custPagination.displayedCustList = [...dataList];
                data.custPagination.totalItems = totalRows;
              }
            });
          }
          console.log(this.categoryDataFinalList);
          this.isSubTableSubLoading = false;
          this.loaderService.subLoaderHide();
        } else {
          this.commonService.warningSnackBar(JSON.parse(res?.message));
          this.isSubTableSubLoading = false;
          this.loaderService.subLoaderHide();
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
        this.isSubTableSubLoading = false;
        this.loaderService.subLoaderHide();
      }
    );
  }

  resetPagination() {
    this.pagination = {pageIndex: 1, pageSize: 5, totalSize: 0};
  }

  onViewChange(view: string): void {
    this.blankSelected = false;
    this.selectedMonths = [];
    this.selectedQuarter = null;
  }

  onMonthSelectionChange(currentSelection: number[] , type:any) {
    this.isPresent = false;
    const newSelection = [...currentSelection];

    // Sort the selected months
    newSelection.sort((a, b) => a - b);

    // Loop through the selection and auto-fill in-between months
    for (let i = 0; i < newSelection.length - 1; i++) {
      const start = newSelection[i];
      const end = newSelection[i + 1];

      if (end - start > 1) {
        for (let j = start + 1; j < end; j++) {
          if (!newSelection.includes(j)) {
            newSelection.push(j);
          }
        }
      }
    }

    if(type === '1'){
      this.selectedMonths = [...new Set(newSelection)].sort((a, b) => a - b);
    }else{
      this.selected2Months = [...new Set(newSelection)].sort((a, b) => a - b);
    }
  }

  getMonthShortNames(values: number[]): string {
    return values
      .map(val => this.months.find(m => m.value === val)?.name.substring(0, 3))
      .filter(Boolean)
      .join(', ');
  }

  onMinMaxImpactChange(){
    this.isPresent = false;
    this.pagination.pageIndex = 1;
    this.pagination.pageSize = 5;
  }


}


export interface AbbRequest {
  userRmId: [];
  reportType: number;
  accountType: number;
  currency: number;
  criteria1Year: number;
  criteria1Quartars: string[];
  criteria2Months: number[];
  criteria1Months: number[];
  criteria2Year: number;
  criteria2Quartars: string[];
  yearType: any;
  outerPageIndex: number;
  outerSize: number;
  innerPageIndex: number;
  innerSize: number;
  innerSortingColumn: number;
  outerSortingColumn: number;
  innerSortingOrder: number;
  outerSortingOrder: number;
  cityId: [];
  segmentId: [];
  dataRmId: [];
  custId: [];
  minChangePct: number;
  maxChangePct: number;
  isMonthView: number;

}
