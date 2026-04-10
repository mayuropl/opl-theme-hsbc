import { filter } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { Component, OnInit } from '@angular/core';
import { MsmeService } from '../../../../services/msme.service';
import { CommonService } from '../../../../CommoUtils/common-services/common.service';
import { parseJson } from '@angular/cli/src/utilities/json-file';
import {Constants} from "../../../../CommoUtils/constants";
import {CommonMethods} from "../../../../CommoUtils/common-methods";
import {ActivatedRoute, Router} from "@angular/router";
import { report } from 'process';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-bank-statement-internal',
  templateUrl: './bank-statement-internal.component.html',
  styleUrl: './bank-statement-internal.component.scss',
})
export class BankStatementInternalComponent implements OnInit {
  cutomerId: any;
  supplierList: any = [];
  isCollapsedList: boolean[] = [];
  collapseStates = {
    supplier: [] as boolean[],
    customer: [] as boolean[],
    connectedPartyDebit: [] as boolean[],
    connectedPartyCredit: [] as boolean[],
    selfTransfers: [] as boolean[],
    statuatory: [] as boolean[],
  };
  PageSelectNumber:any[]=[{name:'5',value:5},{name:'10',value:10},{name:'15',value:15},{name:'20',value:20}]
  isCollapsed = true;
  connectedPartyCreditList: any = [];
  connectedPartyDebitList: any = [];
  customerList: any = [];
  selfTransfersList: any = [];
  selfTransfersListALL: any = [];
  statuatoryList: any = [];
  pagination = {
    supplier: { pageIndex: 1, pageSize: 5, partyType: '1' },
    customer: { pageIndex: 1, pageSize: 5, partyType: '2' },
    connectedPartyDebit: { pageIndex: 1, pageSize: 5, partyType: '3' },
    connectedPartyCredit: { pageIndex: 1, pageSize: 5, partyType: '4' },
    selfTransfers: { pageIndex: 1, pageSize: 5, partyType: '5' },
    statuatory: { pageIndex: 1, pageSize: 5, partyType: '5' },
    supplierTarget: { pageIndex: 1, pageSize: 5, partyType: '11' , reportType: '1'},
    customerTarget: { pageIndex: 1, pageSize: 5, partyType: '11', reportType: '2'}
  };


  pagination1 = {
    supplier: { pageIndex: 1, pageSize: 5, partyType: '1' },
    customer: { pageIndex: 1, pageSize: 5, partyType: '2' },
    connectedPartyDebit: { pageIndex: 1, pageSize: 5, partyType: '3' },
    connectedPartyCredit: { pageIndex: 1, pageSize: 5, partyType: '4' },
    selfTransfers: { pageIndex: 1, pageSize: 5, partyType: '5' },
  };


  currentAccountData: any;
  crilcCurrentAccountData: any;
  termDepositData: any;
  eefData: any;
  odcc:any;
  churnReport:any;
  currencyList:any;
  termCurrencyList:any;
  stateForHistory:any;
  userId:any;
  roleId:any;
  pageData:any;
  isCollapsed1: boolean = false;
  isFromTargetAndProspect: boolean = false;
  externalRoutData:any = null;
  hidden:false;
  panNo:any;
  customerType: any;

    // Child Company Analysis tab properties
  selectedTabIndex: number = 0;
  childCustomerList: any[] = [];
  selectedChildCustomer: any = null;
  childDataLoaded: boolean = false;
  childSupplierList: any = [];
  childCustomerListData: any = [];
  // childConnectedPartyCreditList: any = [];
  // childConnectedPartyDebitList: any = [];
  // childSelfTransfersList: any = [];
  // childSelfTransfersListALL: any = [];
  // childStatuatoryList: any = [];
  // childCurrentAccountData: any;
  // childTermDepositData: any;
  // childEefData: any;
  // childOdcc: any;
  // childChurnData: any;
  // childSelectedSelfTransfer: string = '1';
  childCollapseStates = {
    supplier: [] as boolean[],
    customer: [] as boolean[],
    connectedPartyDebit: [] as boolean[],
    connectedPartyCredit: [] as boolean[],
    selfTransfers: [] as boolean[],
    statuatory: [] as boolean[],
  };
  childPagination = {
    supplier: { pageIndex: 1, pageSize: 5, partyType: '1' },
    customer: { pageIndex: 1, pageSize: 5, partyType: '2' },
    // connectedPartyDebit: { pageIndex: 1, pageSize: 5, partyType: '3' },
    // connectedPartyCredit: { pageIndex: 1, pageSize: 5, partyType: '4' },
    // selfTransfers: { pageIndex: 1, pageSize: 5, partyType: '5' },
    // statuatory: { pageIndex: 1, pageSize: 5, partyType: '5' },
  };

  // currency-symbol.map.ts
CurrencySymbolMap = new Map<any, string>([
  ["INR", "₹"],
  ["USD", "$"],
  ["EUR", "€"],
  ["SGD", "S$"],
  ["CAD", "C$"],
  ["AUD", "A$"],
  ["GBP", "£"],
  ["AED", "د.إ"],
  ["JPY", "¥"],
  ["CHF", "CHF"],
  ["SEK", "kr"],
  ["HKD", "HK$"],
  ["NOK", "kr"],
  ["ZAR", "R"],
  ["DKK", "kr"]
]);

  eefcCurrencyList:any ;
  selectedTermCurrency: any;
  selectedEefcCurrency: any;
  projectedTurnover:any;
  churnData:any;
  protected readonly consValue = Constants;
  constructor(
    public msmeService: MsmeService,
    public commonService: CommonService,
    private commonMethod: CommonMethods,
    private router: Router, private activatedRoute: ActivatedRoute,
  ) {
   this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
   this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
  }

  ngOnInit() {
    this.cutomerId = this.commonService.getStorage('cutomerId', true);
    this.fetchCurrency();
    this.stateForHistory = history.state;
    this.pageData = this.stateForHistory?.data;
    this.panNo = this.stateForHistory?.routerData?.pan;
    const typeId = this.stateForHistory?.routerData?.customerType
            ?? this.stateForHistory?.routerData?.customerTypeTempId;

    this.customerType = typeId ? Constants.CustomerTypeById[typeId] : "NA";
    console.log(this.customerType);
    console.log(this.panNo);
    console.log(this.stateForHistory);
    console.log(this.cutomerId);

      if(this.customerType && this.customerType === "ETB"){
        if(!this.pageData || this.pageData === 'undefined') {
            this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.EXISTING_PORTFOLIO);
        }
      }else if(this.customerType && (this.customerType === "TARGET") || this.customerType === "PROSPECTS"){
        this.isFromTargetAndProspect = true;
         if(!this.pageData || this.pageData === 'undefined') {
            this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.TARGETS_AND_PROSPECTS);
         }
      }

    if(this.isFromTargetAndProspect){
      if (this.panNo) {
          this.fetchList('11', 1 , 5,"1");
          this.fetchList('11', 1 , 5,"2");
          this.fetchCrilcCurrentAccountBalance();
          // this.initialReportData()
        }
    }else{
        if (this.cutomerId) {
          this.getInitialData();
          this.fetchList('6', 1 , 5, '0');
          this.fetchList('7', 1 , 5, '0');
          this.fetchCrilcCurrentAccountBalance();
          // this.initialReportData()
        }
    }



    this.activatedRoute.queryParams.subscribe(params => {
      if(params?.externalRoutData) {
        this.externalRoutData = params?.externalRoutData;
      }
    });

  }

  getInitialData() {
    const request: InternalAnalysisRequest = {
      partyType: '1',
      size: '5',
      pageIndex: '0',
      sortingColumn: '2',
      sortingOrder: '1',
      custId: [this.cutomerId],
    };
    this.msmeService.getInternalBankStatementInitialData(request).subscribe(
      (response: any) => {
        // this.loaderService.subLoaderHide();
        if (response.status == 200 && response?.data) {
          console.log('response == ', response);
          this.supplierList = response?.data?.supplierList;
          if (this.supplierList) {
            this.supplierList.counterPartyList.forEach((_, index) => {
              this.collapseStates.supplier[index] = true; // all collapsed by default
            });
          }
          this.connectedPartyCreditList =
            response?.data?.connectedPartyCreditList;
          if (this.connectedPartyCreditList) {
            this.connectedPartyCreditList.connectedPartyList.forEach(
              (_, index) => {
                this.collapseStates.connectedPartyCredit[index] = true; // all collapsed by default
              }
            );
          }
          this.connectedPartyDebitList =
            response?.data?.connectedPartyDebitList;
          if (this.connectedPartyDebitList) {
            this.connectedPartyDebitList.connectedPartyList.forEach(
              (_, index) => {
                this.collapseStates.connectedPartyDebit[index] = true; // all collapsed by default
              }
            );
          }
          this.customerList = response?.data?.customerList;
          if (this.customerList) {
            this.customerList.counterPartyList.forEach((_, index) => {
              this.collapseStates.customer[index] = true; // all collapsed by default
            });
          }
          this.selfTransfersList = response?.data?.selfTransfersList?.debit;
          this.selfTransfersList.totalRows = response?.data?.selfTransfersList?.totalRowsDebit;
          this.selfTransfersListALL = response?.data?.selfTransfersList;
          if (this.selfTransfersList) {
            this.selfTransfersList.forEach((_, index) => {
              this.collapseStates.selfTransfers[index] = true; // all collapsed by default
            });
          }
          this.currentAccountData = response?.data?.currentAccount;
          this.termDepositData = response?.data?.termDeposit;
          if(this.termDepositData){
            this.selectedTermCurrency =   this.currencyList.find(item => item.id === this.termDepositData[0]?.currency);
            console.log("Term Currency === " , this.selectedTermCurrency);
          }
          this.eefData = response?.data?.eefc;
          if(this.eefData){
            this.selectedEefcCurrency = this.eefData?.currency;
          }
          this.odcc = response?.data?.['od/cc'];
        } else {
          this.commonService.warningSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        // this.loaderService.subLoaderHide();
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Upload failed', error);
      }
    );
  }

  monthList: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  getMonthData(
    monthWise: any[],
    monthName: string,
    key: 'totalCount' | 'totalAmount'
  ): number | null {
    const month = monthWise.find((m) => m.monthName === monthName);
    return month ? month[key] : null;
  }

  getTotal(monthWise: any[], key: 'totalCount' | 'totalAmount'): string {
    return monthWise
      .reduce((total, month) => total + parseFloat(month[key] || '0'), 0)
      .toFixed(2);
  }

  fetchList(
    partyType: string,
    pageIndex: number,
    pageSize: number,
    reportType: string,
    sortingColumn = '2',
    sortingOrder = '1'
  ) {
    let payload:any;
    if( partyType === '7'){
      payload = {
        partyType,
        size: pageSize.toString(),
        pageIndex: (Number(pageIndex)-1).toString(),
        sortingColumn,
        sortingOrder,
        custId: [this.cutomerId],
        cust_id: this.cutomerId,
        projected_turnover: this.projectedTurnover
      };
    }else if( partyType === '11'){
       payload = {
        partyType,
        size: pageSize.toString(),
        pageIndex: (Number(pageIndex)-1).toString(),
        sortingColumn,
        sortingOrder,
        reportType: reportType,
        custId: [this.cutomerId],
        entity_pan: this.panNo, // Replace with actual logic if needed
        is_super : this.roleId === "5" ? 1 : 0 // Assuming '1' for super admin, '0' for others
      };
    }
    else{
      payload = {
        partyType,
        size: pageSize.toString(),
        pageIndex: (Number(pageIndex)-1).toString(),
        sortingColumn,
        sortingOrder,
        custId: [this.cutomerId], // Replace with actual logic if needed
      };
    }
    console.log('Printing Request ==={}', payload);
    this.msmeService.getInternalBankStatementAnalysisData(payload).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          let json = JSON.parse(response?.data);
          console.log('response == ', json);
          if( partyType === '7'){
            this.churnData = json?.churn_data;
          }else{
            this.updateListByPartyType(partyType, json);
          }
        } else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Upload failed', error);
      }
    );
  }

  updateListByPartyType(partyType: string, data: any) {
    switch (partyType) {
      case '1':
        this.supplierList = data?.supplierList;
        if (this.supplierList) {
          this.supplierList.counterPartyList.forEach((_, index) => {
            this.collapseStates.supplier[index] = true; // all collapsed by default
          });
        }
        break;
      case '2':
        this.customerList = data?.customerList;
        if (this.customerList) {
          this.customerList.counterPartyList.forEach((_, index) => {
            this.collapseStates.customer[index] = true; // all collapsed by default
          });
        }
        break;
      case '3':
        this.connectedPartyDebitList = data?.connectedPartyDebitList;
        if (this.connectedPartyDebitList) {
          this.connectedPartyDebitList.connectedPartyList.forEach(
            (_, index) => {
              this.collapseStates.connectedPartyDebit[index] = true; // all collapsed by default
            }
          );
        }
        break;
      case '4':
        this.connectedPartyCreditList = data?.connectedPartyCreditList;
        if (this.connectedPartyCreditList) {
          this.connectedPartyCreditList.connectedPartyList.forEach(
            (_, index) => {
              this.collapseStates.connectedPartyCredit[index] = true; // all collapsed by default
            }
          );
        }
        break;
      case '5':
        this.selfTransfersListALL = data?.selfTransfersList;
        this.updateSelfTransferList('1');
        break;
      case '6':
        this.statuatoryList = data?.statutoryResults;
        if (this.statuatoryList) {
          this.statuatoryList.data.forEach((_, index) => {
            this.collapseStates.statuatory[index] = true; // all collapsed by default
          });
        }
        break;
         case '11':
        if(data?.reportType === "1"){
        this.supplierList = data?.supplierList;
        if (this.supplierList) {
          this.supplierList.counterPartyList.forEach((_, index) => {
            this.collapseStates.supplier[index] = true; // all collapsed by default
          });
        }
      }else if(data?.reportType === "2"){
        this.customerList = data?.customerList;
        if (this.customerList) {
          this.customerList.counterPartyList.forEach((_, index) => {
            this.collapseStates.customer[index] = true; // all collapsed by default
          });
        }
      }
        break;
    }
  }

  onPageChange(listKey: string,page?:any) {

    if(this.isFromTargetAndProspect){
      if(listKey === 'supplier'){
        this.pagination.supplierTarget.pageIndex = this.pagination.supplier.pageIndex;
        this.pagination.supplierTarget.pageSize = this.pagination.supplier.pageSize;
        listKey = 'supplierTarget';
      }
      if(listKey === 'customer'){
        this.pagination.customerTarget.pageIndex = this.pagination.customer.pageIndex;
        this.pagination.customerTarget.pageSize = this.pagination.customer.pageSize;
        listKey = 'customerTarget';
      }
    }

    console.log('Page Change from ui', page);
    console.log('Page Change', listKey);
    const config = this.pagination[listKey];
    console.log('Pagination Object === ', config);
    if(this.isFromTargetAndProspect){this.fetchList(config.partyType, config.pageIndex, config.pageSize,config?.reportType);}
    else{this.fetchList(config.partyType, config.pageIndex, config.pageSize,'');}
  }

  selectedSelfTransfer: string = '1';
  updateSelfTransferList(event:any){
     console.log(event)
    if(event === '1'){
      this.selfTransfersList = this.selfTransfersListALL?.debit;
      this.selfTransfersList.totalRows = this.selfTransfersListALL?.totalRowsDebit;
    } else if (event === '2') {
      this.selfTransfersList = this.selfTransfersListALL?.credit;
      this.selfTransfersList.totalRows = this.selfTransfersListALL?.totalRowsCredit;
    }
    if (this.selfTransfersList) {
      this.selfTransfersList.forEach((_, index) => {
        this.collapseStates.selfTransfers[index] = true; // all collapsed by default
      });
    }
  }





  fetchDatabasedYearwise(reportType?, currency?) {
    const payload = {
      reportType: reportType,
      currency: currency,
      custId: [this.cutomerId],
    };
    this.msmeService.getYearWiseData(payload).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          let object = JSON.parse(response?.data);
          if(object?.currentAccount?.length > 0){
            this.currentAccountData = object?.currentAccount;
          }

          if(reportType === 1 ){
            if( object?.termDeposit?.length > 0){
              this.termDepositData = object?.termDeposit;
            }else{
              this.termDepositData= undefined;
            }
          }

          if(reportType === 3 ){
            if(object?.eefc.length>0){
              this.eefData = object?.eefc;
            }
            else{
              this.eefData = undefined
            }
          }

        } else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }


  initialReportData(){
    this.fetchDatabasedYearwise(1, 1);
    this.fetchDatabasedYearwise(2, 1);
    this.fetchDatabasedYearwise(3, 2);
  }

  fetchCrilcCurrentAccountBalance() {
    const request = {
      pan: this.panNo
    };

    this.msmeService.getBalanceCurrentAccountCrilc(request).subscribe(
      (response: any) => {
        if (response.status === 200 && response.data && response.data.status === 200) {
          const rawData = response.data.data;
          this.crilcCurrentAccountData = this.transformCrilcData(rawData);
        } else {
          console.error('Error fetching CRILC current account balance', response.message);
        }
      },
      (error) => {
        console.error('Error fetching CRILC current account balance', error);
      }
    );
  }

  transformCrilcData(rawData: any[]): any[] {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    // Group data by year
    const yearGroups = rawData.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = [];
      }
      acc[item.year].push(item);
      return acc;
    }, {});

    // Transform to match existing table structure
    return Object.keys(yearGroups).map(year => {
      const yearData = yearGroups[year];
      const monthWise = this.monthList.map(monthName => {
        const monthData = yearData.find(item => item.month === monthName);
        return {
          monthName: monthName,
          totalAmount: monthData ? monthData.amount : null
        };
      });

      return {
        year: parseInt(year),
        monthWise: monthWise
      };
    });
  }

  fetchCurrency(){
    const payload = {
      cust_ids: [this.cutomerId]
    };
    this.msmeService.getCurrency(payload).subscribe(
      (response: any) => {
        // response = {"id":null,"message":null,"data":{"term_currencies_list":[{"id":1,"name":"INR"},{"id":2,"name":"USD"}],"eefc_currencies_list":[{"id":2,"name":"USD"}],"currency_list":[{"id":1,"name":"INR"},{"id":2,"name":"USD"},{"id":3,"name":"EUR"},{"id":4,"name":"SGD"},{"id":5,"name":"CAD"},{"id":6,"name":"AUD"},{"id":7,"name":"GBP"},{"id":8,"name":"AED"},{"id":9,"name":"JPY"},{"id":10,"name":"CHF"},{"id":11,"name":"SEK"},{"id":12,"name":"HKD"},{"id":13,"name":"NOK"},{"id":14,"name":"ZAR"},{"id":15,"name":"DKK"},{"id":16,"name":"ASD"},{"id":17,"name":"SAD"},{"id":18,"name":"SAR"}]},"listData":[],"dataList":null,"mapData":null,"map":null,"contentInBytes":null,"bucketReferenceId":null,"flag":null,"success":null,"response_code":null,"response_code_message":null,"status":200,"displayStatus":null,"fileName":null,"response":null}
        let json2 = (response?.data);
        this.currencyList = json2?.currency_list;
        this.termCurrencyList = json2?.term_currencies_list;
        this.eefcCurrencyList = json2?.eefc_currencies_list;

        // for (let i = 0; i < this.currencyList?.length; i++) {
        //   if (this.currencyList[i].id != '1') {
        //     this.eefcCurrencyList.push(this.currencyList[i]);
        //   }
        // }
        if (response.status == 200 && response?.data) {
        } else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }

  onTermCurrencySelected(event, reportType) {
    this.selectedTermCurrency = event?.id;
    this.fetchDatabasedYearwise(reportType, this.selectedTermCurrency);
  }

  compareCurrencies(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }


  onEefcCurrencySelected(event, reportType) {
    this.selectedEefcCurrency = event?.id;
    this.fetchDatabasedYearwise(reportType, this.selectedEefcCurrency);
  }


  getCurrencyName(id): string{
    const currency = this.currencyList.find(item => item.id == id);
    return currency?.name;
  }

  getCurrencySymbol(id): string{
    const currency = this.currencyList.find(item => item.id == id);
    const symbol = CurrencySymbolDict[currency.name];
    return symbol;
  }

  navigateToViewComponent() {
    this.stateForHistory.routerData.selectedTabIndex = 5
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {state: this.stateForHistory, queryParams: {externalRoutData: this.externalRoutData} }, );
  }

  cleanupChildData() {
    this.selectedChildCustomer = null;
    this.childDataLoaded = false;
    this.childSupplierList = [];
    this.childCustomerListData = [];
    this.childCollapseStates = {
      supplier: [],
      customer: [],
      connectedPartyDebit: [],
      connectedPartyCredit: [],
      selfTransfers: [],
      statuatory: [],
    };
    this.childPagination = {
      supplier: { pageIndex: 1, pageSize: 5, partyType: '1' },
      customer: { pageIndex: 1, pageSize: 5, partyType: '2' },
    };
  }
  // ===== Child Company Analysis Tab Methods =====

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    if (this.selectedTabIndex === 1 && this.childCustomerList.length === 0) {
      this.fetchChildCustomers();
    }
  }

  fetchChildCustomers() {
    const payload = { pan: this.panNo };
    this.msmeService.getChildCustomerIds(payload).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          this.childCustomerList = response.data;
          console.log('Child Customers:', this.childCustomerList);
        } else {
          this.commonService.warningSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Error fetching child customers', error);
      }
    );
  }

  onChildCustomerSelected(event: any) {
    this.selectedChildCustomer = event;
    if (this.selectedChildCustomer) {
      this.childDataLoaded = false;
      this.resetChildData();
      this.getChildInitialData();
      this.fetchChildList('6', 1, 5, '0');
      this.fetchChildList('7', 1, 5, '0');
    }
  }

  resetChildData() {
    this.childSupplierList = [];
    this.childCustomerListData = [];
    // this.childConnectedPartyCreditList = [];
    // this.childConnectedPartyDebitList = [];
    // this.childSelfTransfersList = [];
    // this.childSelfTransfersListALL = [];
    // this.childStatuatoryList = [];
    // this.childCurrentAccountData = undefined;
    // this.childTermDepositData = undefined;
    // this.childEefData = undefined;
    // this.childOdcc = undefined;
    // this.childChurnData = undefined;
    // this.childSelectedSelfTransfer = '1';
    this.childCollapseStates = {
      supplier: [],
      customer: [],
      connectedPartyDebit: [],
      connectedPartyCredit: [],
      selfTransfers: [],
      statuatory: [],
    };
    this.childPagination = {
      supplier: { pageIndex: 1, pageSize: 5, partyType: '1' },
      customer: { pageIndex: 1, pageSize: 5, partyType: '2' },
      // connectedPartyDebit: { pageIndex: 1, pageSize: 5, partyType: '3' },
      // connectedPartyCredit: { pageIndex: 1, pageSize: 5, partyType: '4' },
      // selfTransfers: { pageIndex: 1, pageSize: 5, partyType: '5' },
      // statuatory: { pageIndex: 1, pageSize: 5, partyType: '5' },
    };
  }

  getChildInitialData() {
    const childCustId = this.selectedChildCustomer?.childCustomerId;

    const request: InternalAnalysisRequest = {
      partyType: '1',
      size: '5',
      pageIndex: '0',
      sortingColumn: '2',
      sortingOrder: '1',
      custId: [childCustId],
    };
    this.msmeService.getInternalBankStatementInitialData(request).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          this.childDataLoaded = true;
          this.childSupplierList = response?.data?.supplierList;
          if (this.childSupplierList) {
            this.childSupplierList.counterPartyList.forEach((_, index) => {
              this.childCollapseStates.supplier[index] = true;
            });
          }
          // this.childConnectedPartyCreditList = response?.data?.connectedPartyCreditList;
          // if (this.childConnectedPartyCreditList) {
          //   this.childConnectedPartyCreditList.connectedPartyList.forEach((_, index) => {
          //     this.childCollapseStates.connectedPartyCredit[index] = true;
          //   });
          // }
          // this.childConnectedPartyDebitList = response?.data?.connectedPartyDebitList;
          // if (this.childConnectedPartyDebitList) {
          //   this.childConnectedPartyDebitList.connectedPartyList.forEach((_, index) => {
          //     this.childCollapseStates.connectedPartyDebit[index] = true;
          //   });
          // }
          this.childCustomerListData = response?.data?.customerList;
          if (this.childCustomerListData) {
            this.childCustomerListData.counterPartyList.forEach((_, index) => {
              this.childCollapseStates.customer[index] = true;
            });
          }
          // this.childSelfTransfersList = response?.data?.selfTransfersList?.debit;
          // if (this.childSelfTransfersList) {
          //   this.childSelfTransfersList.totalRows = response?.data?.selfTransfersList?.totalRowsDebit;
          // }
          // this.childSelfTransfersListALL = response?.data?.selfTransfersList;
          // if (this.childSelfTransfersList) {
          //   this.childSelfTransfersList.forEach((_, index) => {
          //     this.childCollapseStates.selfTransfers[index] = true;
          //   });
          // }
          // this.childCurrentAccountData = response?.data?.currentAccount;
          // this.childTermDepositData = response?.data?.termDeposit;
          // this.childEefData = response?.data?.eefc;
          // this.childOdcc = response?.data?.['od/cc'];
        } else {
          this.commonService.warningSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Error fetching child initial data', error);
      }
    );
  }

  fetchChildList(
    partyType: string,
    pageIndex: number,
    pageSize: number,
    reportType: string,
    sortingColumn = '2',
    sortingOrder = '1'
  ) {
    const childCustId = this.selectedChildCustomer?.childCustomerId;
    let payload: any;
    if (partyType === '7') {
      payload = {
        partyType,
        size: pageSize.toString(),
        pageIndex: (Number(pageIndex) - 1).toString(),
        sortingColumn,
        sortingOrder,
        custId: [childCustId],
        cust_id: childCustId,
        projected_turnover: this.projectedTurnover
      };
    } else {
      payload = {
        partyType,
        size: pageSize.toString(),
        pageIndex: (Number(pageIndex) - 1).toString(),
        sortingColumn,
        sortingOrder,
        custId: [childCustId],
      };
    }
    this.msmeService.getInternalBankStatementAnalysisData(payload).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          let json = JSON.parse(response?.data);
          if (partyType === '7') {
            // this.childChurnData = json?.churn_data;
          } else {
            this.updateChildListByPartyType(partyType, json);
          }
        } else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Error fetching child list data', error);
      }
    );
  }

  updateChildListByPartyType(partyType: string, data: any) {
    switch (partyType) {
      case '1':
        this.childSupplierList = data?.supplierList;
        if (this.childSupplierList) {
          this.childSupplierList.counterPartyList.forEach((_, index) => {
            this.childCollapseStates.supplier[index] = true;
          });
        }
        break;
      case '2':
        this.childCustomerListData = data?.customerList;
        if (this.childCustomerListData) {
          this.childCustomerListData.counterPartyList.forEach((_, index) => {
            this.childCollapseStates.customer[index] = true;
          });
        }
        break;
      // case '3':
      //   this.childConnectedPartyDebitList = data?.connectedPartyDebitList;
      //   if (this.childConnectedPartyDebitList) {
      //     this.childConnectedPartyDebitList.connectedPartyList.forEach((_, index) => {
      //       this.childCollapseStates.connectedPartyDebit[index] = true;
      //     });
      //   }
      //   break;
      // case '4':
      //   this.childConnectedPartyCreditList = data?.connectedPartyCreditList;
      //   if (this.childConnectedPartyCreditList) {
      //     this.childConnectedPartyCreditList.connectedPartyList.forEach((_, index) => {
      //       this.childCollapseStates.connectedPartyCredit[index] = true;
      //     });
      //   }
      //   break;
      // case '5':
      //   this.childSelfTransfersListALL = data?.selfTransfersList;
      //   this.updateChildSelfTransferList('1');
      //   break;
      // case '6':
      //   this.childStatuatoryList = data?.statutoryResults;
      //   if (this.childStatuatoryList) {
      //     this.childStatuatoryList.data.forEach((_, index) => {
      //       this.childCollapseStates.statuatory[index] = true;
      //     });
      //   }
      //   break;
    }
  }

  // updateChildSelfTransferList(event: any) {
  //   if (event === '1') {
  //     this.childSelfTransfersList = this.childSelfTransfersListALL?.debit;
  //     if (this.childSelfTransfersList) {
  //       this.childSelfTransfersList.totalRows = this.childSelfTransfersListALL?.totalRowsDebit;
  //     }
  //   } else if (event === '2') {
  //     this.childSelfTransfersList = this.childSelfTransfersListALL?.credit;
  //     if (this.childSelfTransfersList) {
  //       this.childSelfTransfersList.totalRows = this.childSelfTransfersListALL?.totalRowsCredit;
  //     }
  //   }
  //   if (this.childSelfTransfersList) {
  //     this.childSelfTransfersList.forEach((_, index) => {
  //       this.childCollapseStates.selfTransfers[index] = true;
  //     });
  //   }
  // }

  onChildPageChange(listKey: string) {
    const config = this.childPagination[listKey];
    this.fetchChildList(config.partyType, config.pageIndex, config.pageSize, '');
  }
    protected readonly isNaN = isNaN;
}
export interface InternalAnalysisRequest {
  partyType: string;
  size: string;
  pageIndex: string;
  sortingColumn: string;
  sortingOrder: string;
  custId: string[];
}

export const CurrencySymbolDict: { [key: string]: string } = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  SGD: "S$",
  CAD: "C$",
  AUD: "A$",
  GBP: "£",
  AED: "د.إ",
  JPY: "¥",
  CHF: "CHF",
  SEK: "kr",
  HKD: "HK$",
  NOK: "kr",
  ZAR: "R",
  DKK: "kr"
};


