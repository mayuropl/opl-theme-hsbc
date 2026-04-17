import {Component, OnInit} from '@angular/core';
import {InternalAnalysisRequest} from '../bank-statement-internal/bank-statement-internal.component';
import {MsmeService} from '../../../../services/msme.service';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {Constants} from '../../../../CommoUtils/constants';
import {Router} from '@angular/router';
import {CommonMethods} from '../../../../CommoUtils/common-methods';
import {GlobalHeaders, saveActivity} from '../../../../CommoUtils/global-headers';
import {LoaderService} from '../../../../CommoUtils/common-services/LoaderService';

@Component({
  selector: 'app-bank-statement-analysis',
  templateUrl: './bank-statement-analysis.component.html',
  styleUrl: './bank-statement-analysis.component.scss'
})
export class BankStatementAnalysisComponent implements OnInit {

  constructor(
      public msmeService: MsmeService,
      public commonService: CommonService,
      private router: Router,
      private commonMethod: CommonMethods,
      private loaderService: LoaderService
  ) {
  }
  collapseStates = {
    supplier: [] as boolean[],
    customer: [] as boolean[],
    selfTransfers: [] as boolean[],
    statutoryReport: [] as boolean[],
    netSelfTransfer: [] as boolean[],
    opportunity: [] as boolean[],
    };
  selectSnC = '1';
  // threeCustData = [{"bank":"Canara Bank","bank_total_amount":21722844225960,"bank_total_rows":543,"custIdWise":[{"cust_id":"463-70689","cust_total_amount":52146183460,"cust_total_rows":19,"nameWise":[{"name":"Ekbal Choudhary","total_amount":2917930240},{"name":"Janya Manne","total_amount":2820771150}],"cust_name":null,"pan":null},{"cust_id":"219-70941","cust_total_amount":50887068960,"cust_total_rows":20,"nameWise":[{"name":"Oscar Srivastava","total_amount":2702069200},{"name":"Meghana Mammen","total_amount":2675964690}],"cust_name":null,"pan":null}]},{"bank":"Punjab National Bank","bank_total_amount":21169218659440,"bank_total_rows":528,"custIdWise":[{"cust_id":"797-25507","cust_total_amount":51925351250,"cust_total_rows":20,"nameWise":[{"name":"Urvashi Hari","total_amount":2807047030},{"name":"Aachal Virk","total_amount":2786318200}],"cust_name":null,"pan":null},{"cust_id":"806-02867","cust_total_amount":51022080490,"cust_total_rows":20,"nameWise":[{"name":"Jyoti Bath","total_amount":2784232410},{"name":"Advaith Dhar","total_amount":2734236070}],"cust_name":null,"pan":null}]}];
  threeCustData: any;
  collapseMap: { [key: string]: boolean } = {};
  pageMap: { [key: string]: {} } = {};



  isLoading = {
    supplier: false,
    customer: false,
    selfTransfers: false,
    statutoryReport: false,
    netSelfTransfer: false,
    customerSupplier: false,
    opportunity: false
  };




  customerIdList: any;
  customerMap: { [key: string]: string };
  customerPanMap: { [key: string]: string };
  pagination = {
    selfTransfers: {pageIndex: 1, pageSize: 5, reportType: '1' , filterApplied: false},
    supplier: {pageIndex: 1, pageSize: 5, reportType: '2', filterApplied: false},
    customer: {pageIndex: 1, pageSize: 5, reportType: '3', filterApplied: false},
    statutoryReport: {pageIndex: 1, pageSize: 5, reportType: '4', filterApplied: false},
    netSelfTransfer: {pageIndex: 1, pageSize: 5, reportType: '5', filterApplied: false},
    customerSupplier: {pageIndex: 1, pageSize: 5, reportType: this.selectSnC , filterApplied: false},
    opportunity: {pageIndex: 1, pageSize: 5, reportType: '6' , filterApplied: false}
  };

  sortStates: { [key: string]: { column: string, order: '1' | '2', innerColumn: string, innerOrder: '1' | '2' } } = {
    selfTransfers: { column: '2', order: '1', innerColumn: '2', innerOrder: '1' },
    supplier: { column: '2', order: '1', innerColumn: '2', innerOrder: '1' },
    customer: { column: '2', order: '1', innerColumn: '2', innerOrder: '1' },
    statutoryReport: { column: '1', order: '1', innerColumn: '2', innerOrder: '1' },
    netSelfTransfer: { column: '2', order: '1', innerColumn: '2', innerOrder: '1' },
    customerSupplier: { column: '1', order: '1', innerColumn: '2', innerOrder: '1' },
    opportunity: { column: '1', order: '1', innerColumn: '2', innerOrder: '1' }
  };

  filter = {
    supplier: {amountMinInput: null, amountMaxInput: null, interactionMinInput: null, interactionMaxInput: null},
    customer: {amountMinInput: null, amountMaxInput: null, interactionMinInput: null, interactionMaxInput: null},
    netSelfTransfer: {amountMinInput: null, amountMaxInput: null, interactionMinInput: null, interactionMaxInput: null }
  };
  PageSelectNumber: any[] = [{name: '5', value: 5}, {name: '10', value: 10}, {name: '15', value: 15}, {name: '20', value: 20}];
  PageSelectNumberChild: any[] = [{name: '3', value: 3}, {name: '6', value: 6}, {name: '9', value: 9}];
  selectedSelfTransfer = '1';

  fullSelfTransfersList: any;
  fullSupplierList: any;
  fullCustomerList: any;
  fullStatReportList: any;
  fullThreeCustDataList: any;
  selfTransfersList: any;
  netTransfersList: any;
  statReportList: any;
  supplierList: any;
  customerList: any;
  selfTransfersListALL: any;
  response: any = [];
  role: any;
  userId:any ;
  private pageData: any;
  isLoadingTable: any = false;
  isLoadingSubTable: any = false;
  passRouteData:any;
  targetAndProspect: any;
  opportunityId:any = '1';
  opportunityList: any;
  fullOpportunityList: any;
  protected readonly consValue = Constants;



  initializeCollapseMap(): void {
    if (this.threeCustData) {
      this.threeCustData?.data?.forEach((bank, bankIndex) => {
        const bankKey = `bank-${bankIndex}`;
        this.collapseMap[bankKey] = true; // Initially collapsed
        bank.custIdWise.forEach((cust, custIndex) => {
          const custKey = `bank-${bankIndex}-cust-${custIndex}`;
          this.collapseMap[custKey] = true; // Initially collapse
        });
      });
    }
  }

  ngOnInit(): void {
    this.pageData = history.state.data;
     if(!this.pageData || this.pageData === 'undefined'){
        this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS,this.consValue.pageMaster.BANK_STATEMENT_ANALYSIS)
      }
    this.role = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);

    const st: any = history.state || {};
    const idsFromState = st.customerIdList ?? st.data?.customerIdList;
    if (Array.isArray(idsFromState) && idsFromState.length > 0) {
      this.customerIdList = idsFromState;
      this.customerMap = st.customerMap ?? st.data?.customerMap ?? {};
      this.customerPanMap = st.customerPanMap ?? st.data?.customerPanMap ?? {};
      this.ensureCustomerContextDefaults();
      this.loadAllPortfolioTables();
    } else {
      this.msmeService.getPortfolioBankInitialData({ role: this.role, userId: this.userId }).subscribe({
        next: (response: any) => {
          if (response?.status == 200 && response?.data) {
            this.applyPortfolioInitData(response.data);
          }
          this.ensureCustomerContextDefaults();
          this.loadAllPortfolioTables();
        },
        error: () => {
          this.ensureCustomerContextDefaults();
          this.loadAllPortfolioTables();
        },
      });
    }

    let routeData:any = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
    for (const element of routeData) {
      if(element.pageId === 320) {
        for(const subPageData of element?.subpages) {
          if (subPageData.subpageId === 1) {
            this.passRouteData = subPageData;
          }else if (subPageData.subpageId === 23){
            this.targetAndProspect = subPageData;
          }
        }
      }
    }
    // this.passRouteData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.EXISTING_PORTFOLIO)
    // this.getInitialData();
    // this.initializeCollapseMap();

  }

  private ensureCustomerContextDefaults(): void {
    if (!Array.isArray(this.customerIdList)) {
      this.customerIdList = [];
    }
    if (!this.customerMap) {
      this.customerMap = {};
    }
    if (!this.customerPanMap) {
      this.customerPanMap = {};
    }
  }

  private applyPortfolioInitData(data: any): void {
    if (!data || typeof data !== 'object') {
      return;
    }
    if (Array.isArray(data.customerIdList)) {
      this.customerIdList = data.customerIdList;
    } else if (Array.isArray(data.custIdList)) {
      this.customerIdList = data.custIdList;
    } else if (Array.isArray(data.custIds)) {
      this.customerIdList = data.custIds;
    }
    if (data.customerMap && typeof data.customerMap === 'object') {
      this.customerMap = data.customerMap;
    }
    if (data.customerPanMap && typeof data.customerPanMap === 'object') {
      this.customerPanMap = data.customerPanMap;
    }
  }

  private loadAllPortfolioTables(): void {
    this.fetchList(this.pagination.selfTransfers);
    this.fetchList(this.pagination.supplier);
    this.fetchList(this.pagination.customer);
    this.fetchList(this.pagination.netSelfTransfer);
    this.fetchList(this.pagination.statutoryReport);
    this.fetchCustList(this.pagination.customerSupplier);
    this.fetchList(this.pagination.opportunity);
  }

  getCustomerName(customerId: any, reqBool?): string {
    if (reqBool){
      return this.customerMap[customerId] || '';
    }else{
      return this.customerMap[customerId] || '-';
    }}

  getCustomerPan(customerId: any, reqBool?): string {
    if (reqBool){
      return this.customerPanMap[customerId] || '';
    }else{
      return this.customerPanMap[customerId] || '-';
    }}

  updateOpportunityId(){
    this.pagination.opportunity =  {pageIndex: 1, pageSize: 5, reportType: '6' , filterApplied: false};
    this.sortStates.opportunity = { column: '1', order: '1', innerColumn: '2', innerOrder: '1' };
    this.fetchList(this.pagination.opportunity);
  }

  updateSelfTransferList(event: any, partyType?: any) {
    console.log(event);
    console.log(this.selfTransfersListALL);
    if (event === '1') {
      this.selfTransfersList = this.selfTransfersListALL.debit;
      this.selfTransfersList.totalRows = this.selfTransfersListALL.totalRowsDebit;
    } else if (event === '2') {
      this.selfTransfersList = this.selfTransfersListALL.credit;
      this.selfTransfersList.totalRows = this.selfTransfersListALL.totalRowsCredit;
    }

    if (this.selfTransfersList) {
      this.fullSelfTransfersList = this.selfTransfersList.map(bank => ({
        ...bank,
        custPagination: {
          page: 1,
          pageSize: 5,
          totalItems: bank.totalRows,
          displayedCustList: bank.custIdList
        }
      }));
      if (this.fullSelfTransfersList.length === 0){
        this.loadingSwitch(partyType, false);
      }else{
        this.fullSelfTransfersList.forEach((_, index) => {
          this.collapseStates.selfTransfers[index] = true; // all collapsed by default

          if ((this.fullSelfTransfersList.length - 1) === index){
            this.loadingSwitch(partyType, false);
          }
        });
      }
    }else{
      this.fullSelfTransfersList = [];
      this.loadingSwitch(partyType, false);
    }
  }


  getTotalAmount(bank) {
    let total = 0;
    bank.custIdList.forEach(cust => {
      total += cust.totalAmount;
    });
    return total;
  }

  getTotalAmountO(bank) {
    let total = 0;
    bank.custIdWise.forEach(cust => {
      total += cust.totalAmount;
    });
    return total;
  }


  updateChildList(bank: any) {
    const start = (bank.custPagination.page - 1) * bank.custPagination.pageSize;
    const end = start + bank.custPagination.pageSize;
    // bank.custPagination.displayedCustList = bank.custIdList.slice(start, end);
  }



  onPageChange(reportype: any, pageNo?: any, pageSize?: any) {
    console.log('pageNo === ', pageNo , 'PageSize === ', pageSize);
    const config = this.pagination[reportype];
    if (reportype === 'customerSupplier'){
      this.fetchCustList(config);
    }else{
      this.fetchList(config);
    }
  }

  onChildPageChange(config: any, bank: any, name?: any){
    this.fetchChildList(config, bank, name);
  }

  toggleOpportunity(i: number, bank: any) {
    // toggle state
    this.collapseStates.opportunity[i] = !this.collapseStates.opportunity[i];

    // call method ONLY when expanding
    if (!this.collapseStates.opportunity[i]) {
      this.fetchChildList(this.pagination.opportunity, bank, bank?.company_name);
    }
  }

  handleSort(tableKey: string, column: string, order: '1' | '2', isInner: boolean = false, bank?: any, level?: number, cust?: any) {
    if (isInner) {
      if (tableKey === 'customerSupplier') {
        if (level === 1) {
          this.sortStates[tableKey].innerColumn = column;
          this.sortStates[tableKey].innerOrder = order;
          this.fetchChildCustList(this.pagination[tableKey], bank, null, 1, bank.bank, null);
        } else if (level === 2) {
          // You can add level3 sorting state if needed, for now using inner sorting for both levels if they are both "inner"
          // However, to be more precise, level 3 could use its own state. 
          // For now, let's treat innerColumn/Order as the target for level 1 inner.
          // If sorting level 2 inner (Name list), we might need a separate state or just use current.
          this.fetchChildCustList(this.pagination[tableKey], bank, cust, 2, bank.bank, cust.cust_id);
        }
      } else {
        this.sortStates[tableKey].innerColumn = column;
        this.sortStates[tableKey].innerOrder = order;
        if (bank) {
          bank.custPagination.page = 1;
          this.fetchChildList(this.pagination[tableKey], bank, bank.bankName || bank.partyName || bank.category_name || bank.company_name);
        }
      }
    } else {
      this.sortStates[tableKey].column = column;
      this.sortStates[tableKey].order = order;
      this.pagination[tableKey].pageIndex = 1;

      if (tableKey === 'customerSupplier') {
        this.fetchCustList(this.pagination[tableKey]);
      } else {
        this.fetchList(this.pagination[tableKey]);
      }
    }
  }

  fetchChildList(config: any, bank: any, name?: any) {
    this.loadingSwitch(config.reportType, true);
    const payload: Partial <PortfolioAnalysisRequest> = {
      reportType: config.reportType,
      outerSize: config.pageSize,
      innerSize: bank.custPagination.pageSize,
      outerPageIndex: (config.pageIndex - 1).toString(),
      innerPageIndex: (bank.custPagination.page - 1).toString(),
      outerSortingColumn: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '') 
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].column 
                       : '1',
      outerSortingOrder: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].order
                       : '1',
      innerSortingColumn: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].innerColumn
                       : '1',
      innerSortingOrder: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].innerOrder
                       : '1',
      subDataValue: name || '',
      isSubData: 1,
      custId: this.customerIdList,
      role: this.role,
      userId: this.userId,
      ...(config.reportType === '6' && {
        opportunityId: Number(this.opportunityId)
      }),
    };

    console.log('Printing Request ==={}', payload);
    this.msmeService.getPortfolioBankData(payload).subscribe(
        (response: any) => {
          if (response.status == 200 && response?.data) {
            console.log('response == ', response?.data);
            this.updateChildListByPartyType(config.reportType, response.data, bank);
          } else {
            this.loadingSwitch(config.reportType, false);
            this.commonService.warningSnackBar(response.message);
            console.log(response.message);
          }
        },
        (error) => {
          this.loadingSwitch(config.reportType, false);
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Upload failed', error);
        }
    );
  }

  fetchList(config: any ) {
    this.loadingSwitch(config.reportType, true);
    const isCustomer = config.reportType === '3';
    const isSupplier = config.reportType === '2';
    const isNetTransfer = config.reportType === '5';
    const filterData = isCustomer ? this.filter.customer : isSupplier ? this.filter.supplier : isNetTransfer ? this.filter.netSelfTransfer : null;

    const payload: Partial<PortfolioAnalysisRequest> = {
      reportType: config.reportType,
      outerSize: config.pageSize,
      innerSize: '5',
      outerPageIndex: `${+config.pageIndex - 1}`,
      innerPageIndex: '0',
      outerSortingColumn: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '') 
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].column 
                       : '1',
      outerSortingOrder: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].order
                        : '1',
      innerSortingColumn: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].innerColumn
                       : '1',
      innerSortingOrder: (config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : '')
                       ? this.sortStates[config.reportType === '1' ? 'selfTransfers' : config.reportType === '2' ? 'supplier' : config.reportType === '3' ? 'customer' : config.reportType === '4' ? 'statutoryReport' : config.reportType === '5' ? 'netSelfTransfer' : config.reportType === '6' ? 'opportunity' : ''].innerOrder
                       : '1',
      subDataValue: '',
      isSubData: 0,
      custId: this.customerIdList,
      role: this.role,
      userId: this.userId,
      ...(config.reportType === '6' && {
        opportunityId: Number(this.opportunityId)
      }),
      ...(config.filterApplied && filterData && {
        ...(filterData.amountMaxInput && { maxAmount: Number(filterData.amountMaxInput) }),
        ...(filterData.amountMinInput && { minAmount: Number(filterData.amountMinInput) }),
        ...(filterData.interactionMaxInput && { maxCount: Number(filterData.interactionMaxInput) }),
        ...(filterData.interactionMinInput && { minCount: Number(filterData.interactionMinInput) }),
      })
    };

    // console.log('Printing Request ==={}', payload);
    this.msmeService.getPortfolioBankData(payload).subscribe(
        (response: any) => {
          if (response.status == 200 && response?.data) {
            console.log('response == ', response?.data);
            this.updateListByPartyType(config.reportType, response?.data);
          } else {
            this.updateListByPartyType(config.reportType, response?.data);
            this.loadingSwitch(config.reportType, false);
            // this.commonService.warningSnackBar(response.message);
            console.log(response.message);
          }
        },
        (error) => {
          this.loadingSwitch(config.reportType, false);
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Upload failed', error);
        }
    ); // 10,000 ms = 10 seconds
    // this.msmeService.getPortfolioBankData(payload).subscribe(
    //   (response: any) => {
    //     if (response.status == 200 && response?.data) {
    //       console.log('response == ', response?.data);
    //       this.updateListByPartyType(config.reportType, response.data);
    //     } else {
    //       this.loadingSwitch(config.reportType,false)
    //       this.commonService.warningSnackBar(response.message);
    //       console.log(response.message);
    //     }
    //   },
    //   (error) => {
    //     this.loadingSwitch(config.reportType,false)
    //     this.commonService.errorSnackBar('Something Went Wrong');
    //     console.error('Upload failed', error);
    //   }
    // );
  }

  filterfetchList(config: any , type?: any) {
    this.loadingSwitch(config.reportType, true);
    const isCustomer = config.reportType === '3';
    const isSupplier = config.reportType === '2';
    const isNetTransfer = config.reportType === '5';
    const filterData = isCustomer ? this.filter.customer : isSupplier ? this.filter.supplier : isNetTransfer ? this.filter.netSelfTransfer : null;
    this.pagination[type].pageIndex = 1;
    const payload: Partial<PortfolioAnalysisRequest> = {
      reportType: config.reportType,
      outerSize: config.pageSize,
      innerSize: '5',
      outerPageIndex: `0`,
      innerPageIndex: '0',
      outerSortingOrder: '1',
      innerSortingOrder: '1',
      subDataValue: '',
      isSubData: 0,
      custId: this.customerIdList,
      role: this.role,
      userId: this.userId,
      ...(config.filterApplied && filterData && {
        ...(filterData.amountMaxInput && { maxAmount: filterData.amountMaxInput }),
        ...(filterData.amountMinInput && { minAmount: filterData.amountMinInput }),
        ...(filterData?.interactionMaxInput && { maxCount: filterData.interactionMaxInput }),
        ...(filterData?.interactionMinInput && { minCount: filterData.interactionMinInput }),
      })
    };
    // console.log('Printing Request ==={}', payload);
    this.msmeService.getPortfolioBankData(payload).subscribe(
        (response: any) => {
          if (response.status == 200 && response?.data) {
            console.log('response == ', response?.data);
            this.updateListByPartyType(config.reportType, response?.data);
          } else {
            this.loadingSwitch(config.reportType, false);
            this.commonService.warningSnackBar(response.message);
            console.log(response.message);
          }
        },
        (error) => {
          this.loadingSwitch(config.reportType, false);
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Upload failed', error);
        }
    ); // 10,000 ms = 10 seconds
    // this.msmeService.getPortfolioBankData(payload).subscribe(
    //   (response: any) => {
    //     if (response.status == 200 && response?.data) {
    //       console.log('response == ', response?.data);
    //       this.updateListByPartyType(config.reportType, response.data);
    //     } else {
    //       this.loadingSwitch(config.reportType,false)
    //       this.commonService.warningSnackBar(response.message);
    //       console.log(response.message);
    //     }
    //   },
    //   (error) => {
    //     this.loadingSwitch(config.reportType,false)
    //     this.commonService.errorSnackBar('Something Went Wrong');
    //     console.error('Upload failed', error);
    //   }
    // );
  }

  fetchChildCustList(config: any, chilData?: any, inChildData?: any, type?: any, childvalue?: any, inChildvalue?: any) {
    this.loadingSwitch('7', true);
    const childData: any = {};
    const innerChildData: any = {};
    childData.level2PageIndex = chilData?.custPagination?.page;
    childData.level2PageSize = chilData?.custPagination?.pageSize;
    childData.value = childvalue;
    innerChildData.level3PageIndex = inChildData?.namePagination?.page;
    innerChildData.level3PageSize = inChildData?.namePagination?.pageSize;
    innerChildData.value = inChildvalue;
    childData.isLevel1SubData = 1;
    if (type === 1) {
      innerChildData.level2SubDataValue = 0;
      innerChildData.level3PageIndex = 1;
      innerChildData.level3PageSize = 5;
    } else {
      innerChildData.level2SubDataValue = 1;
    }
    const isCustomer = config.reportType === '2';
    const isSupplier = config.reportType === '1';

    const payload: GetSupplierCustomerRequest = {
      reportType: config.reportType,
      level1PageIndex: (config.pageIndex - 1),
      level1PageSize: (config.pageSize),
      level2PageIndex: (childData.level2PageIndex - 1) ,
      level2PageSize: childData.level2PageSize,
      level3PageIndex: (innerChildData.level3PageIndex - 1) ,
      level3PageSize: innerChildData.level3PageSize,
      level1SortingColumn: this.sortStates.customerSupplier.column,
      level1SortingOrder: Number(this.sortStates.customerSupplier.order),
      level2SortingColumn: this.sortStates.customerSupplier.innerColumn,
      level2SortingOrder: Number(this.sortStates.customerSupplier.innerOrder),
      level3SortingColumn: this.sortStates.customerSupplier.innerColumn,
      level3SortingOrder: Number(this.sortStates.customerSupplier.innerOrder),
      isLevel1SubData:  childData.isLevel1SubData,
      isLevel2SubData: innerChildData.level2SubDataValue,
      level1SubDataValue:  childData.value,
      level2SubDataValue: innerChildData.value,
      custId: this.customerIdList,
      role: this.role,
      userId: this.userId
    };
    console.log('Printing Request ==={}', payload);
    this.msmeService.getSupplierCustomerLevelReport(payload).subscribe(
        (response: any) => {
          if (response.status === 200 && response?.data) {
            const json: any = {};
            let dataList: any = {};
            if (isCustomer) {
              dataList = JSON.parse(response?.data?.customerList);
              json.data = (dataList?.customerList);
              json.totalRows = dataList.totalRows;
            } else if (isSupplier) {
              dataList = JSON.parse(response?.data?.supplierList);
              json.data = (dataList?.supplierList);
              json.totalRows = dataList.totalRows;
            }
            console.log('response == ', response?.data);
            this.updateThreeCustChildDataList(config, json, chilData, inChildData, type, childvalue, inChildvalue );
          } else {
            this.loadingSwitch('7', false);
            this.commonService.warningSnackBar(response.message);
            console.log(response.message);
          }
        },
        (error) => {
          this.loadingSwitch('7', false);
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Upload failed', error);
        }
    );
  }

  fetchCustList(config: any ) {
    this.loadingSwitch('7', true);
    const isCustomer = config.reportType === '2';
    const isSupplier = config.reportType === '1';

    const payload: GetSupplierCustomerRequest = {
      reportType: config.reportType,
      level1PageIndex: (this.pagination.customerSupplier.pageIndex - 1),
      level1PageSize: this.pagination.customerSupplier.pageSize,
      level2PageIndex: 0,
      level2PageSize: 5,
      level3PageIndex: 0,
      level3PageSize: 3,
      level1SortingColumn: this.sortStates.customerSupplier.column,
      level1SortingOrder: Number(this.sortStates.customerSupplier.order),
      level2SortingColumn: this.sortStates.customerSupplier.innerColumn,
      level2SortingOrder: Number(this.sortStates.customerSupplier.innerOrder),
      level3SortingColumn: this.sortStates.customerSupplier.innerColumn,
      level3SortingOrder: Number(this.sortStates.customerSupplier.innerOrder),
      isLevel1SubData: 0,
      isLevel2SubData: 0,
      level1SubDataValue: null,
      level2SubDataValue: null,
      custId: this.customerIdList,
      role: this.role,
      userId : this.userId
    };
    console.log('Printing Request ==={}', payload);
    this.msmeService.getSupplierCustomerLevelReport(payload).subscribe(
        (response: any) => {
          if (response.status === 200 && response?.data) {
            const json: any = {};
            let dataList: any = {};
            if (isCustomer){
              dataList =  JSON.parse(response?.data?.customerList);
              json.data = (dataList?.customerList);
              json.totalRows = dataList.totalRows;
            }else if (isSupplier){
              dataList =  JSON.parse(response?.data?.supplierList);
              json.data =  (dataList?.supplierList);
              json.totalRows = dataList.totalRows;
            }
            console.log('response == ', response?.data);
            this.updateThreeCustDataList(json);
          } else {
            this.loadingSwitch('7', false);
            // this.commonService.warningSnackBar(response.message);
            console.log(response.message);
          }
        },
        (error) => {
          this.loadingSwitch('7', false);
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Upload failed', error);
        }
    );
  }

  updateThreeCustChildDataList(config: any,data :any, chilData?: any, inChildData?: any, type?: any, childvalue?: any, inChildvalue?: any ){
    console.log(data?.data);
    let dataInResponse:any =  data?.data[0];
    if (this.fullThreeCustDataList && type === 1) {
      this.fullThreeCustDataList.forEach((bankData: any, bankIndex: number) => {
        if (bankData.bank === childvalue) {
          // Update custIdWise with pagination metadata
          const updatedCustList = dataInResponse.custIdWise.map((cust: any) => ({
            ...cust,
            namePagination: {
              page: 1,
              pageSize: 3,
              value: '',
              totalItems: cust.cust_total_rows,
              displayedNameList: cust.nameWise
            }
          }));

          // Assign updated list and update custPagination
          bankData.custIdWise = updatedCustList;
          bankData.custPagination = {
            ...bankData.custPagination,
            page: chilData?.custPagination?.page,
            pageSize: chilData?.custPagination?.pageSize,
            value: '',
            totalItems: dataInResponse.bank_total_rows,
            displayedCustList: updatedCustList
          };
        }
      });

      this.fullThreeCustDataList?.forEach((bank, bankIndex) => {
        if (bank.bank === childvalue) {
          bank.custIdWise.forEach((cust, custIndex) => {
            const custKey = `bank-${bankIndex}-cust-${custIndex}`;
            this.collapseMap[custKey] = true; // Initially collapse
          });
        }});
    }else{
      this.fullThreeCustDataList.forEach((bankData: any, bankIndex: number) => {
        if (bankData.bank === childvalue) {
          bankData.custIdWise.forEach((custData: any, custIndex: number) => {
            if (custData.cust_id === inChildvalue) {
              const updatedCustList = dataInResponse.custIdWise.map((cust: any) => ({
                ...cust,
                namePagination: {
                  page: custData?.namePagination?.page,
                  pageSize: custData?.namePagination?.pageSize,
                  value: '',
                  totalItems: cust.cust_total_rows,
                  displayedNameList: cust.nameWise
                }
              }));

              // ✅ Update the array element directly
              bankData.custIdWise[custIndex] = updatedCustList[0];
              console.log(bankData.custIdWise[custIndex]);
            }
          });
        }
      });

    }

    console.log(this.fullThreeCustDataList);

    this.loadingSwitch('7', false);
  }

  updateThreeCustDataList(data: any){
    console.log(data?.data);
    this.threeCustData = data;
    this.initializeCollapseMap();
    if (this.threeCustData) {
      this.fullThreeCustDataList = this.threeCustData?.data?.map((bank: any) => ({
        ...bank,
        custPagination: {
          page: 1,
          pageSize: 5,
          value: '',
          totalItems: bank.bank_total_rows,
          displayedCustList: bank.custIdWise
        },
        custIdWise: bank.custIdWise.map((cust: any) => ({
          ...cust,
          namePagination: {
            page: 1,
            pageSize: 3,
            value: '',
            totalItems: cust.cust_total_rows,  // Adjust this if needed
            displayedNameList: cust.nameWise
          }
        }))
      }));
      console.log(this.fullThreeCustDataList);
    }
    this.loadingSwitch('7', false);
  }

  updateChildListByPartyType(partyType: string, data: any, banke?: any) {
    this.loadingSwitch(partyType, true);
    switch (partyType) {
      case '2':
        const supplierList = data?.supplierList?.counterPartyList?.[0];
        if (this.fullSupplierList && supplierList) {
          this.fullSupplierList.forEach((supplier: any) => {
            if (supplier.partyName === banke.partyName){
              supplier.custPagination.displayedCustList = supplierList.custIdWise;
            }
          });
        }
        this.loadingSwitch('2', false);
        break;
      case '3':
        const customerList = data?.customerList?.counterPartyList?.[0];
        if (this.fullCustomerList && customerList) {
          this.fullCustomerList.forEach((customer: any) => {
            if (customer.partyName === banke.partyName){
              customer.custPagination.displayedCustList = customerList.custIdWise;
            }
          });
        }
        this.loadingSwitch('3', false);
        break;
      case '1':
        const selfTransfersList = data?.selfTransfer;
        let bankList: any = [];
        if (this.selectedSelfTransfer === '1') {
          bankList = selfTransfersList?.debit?.[0]?.custIdList || [];
        } else if (this.selectedSelfTransfer === '2') {
          bankList = selfTransfersList?.credit?.[0]?.custIdList || [];
        }
        if (this.fullSelfTransfersList) {
          this.fullSelfTransfersList.forEach((supplier: any) => {
            if (supplier.bankName === banke.bankName){
              supplier.custPagination.displayedCustList = bankList;
            }
          });
        }
        this.loadingSwitch('1', false);
        break;

      case '4':
        const statutoryReportList = data?.statutoryReport;
        // this.statReportList = statutoryReportList;
        if (this.fullStatReportList && statutoryReportList?.data?.[0]) {
          this.fullStatReportList.forEach((supplier: any) => {
            if (supplier.category_name === banke.category_name){
              supplier.custPagination.displayedCustList = statutoryReportList?.data[0]?.custIdWise || [];
            }
          });
        }
        this.loadingSwitch('4', false);
        break;

      case '6':
        const oppList = data?.opportunityReport;
        if (this.opportunityList && oppList) {
          const childCustRows = Array.isArray(oppList?.data?.[0]?.custIdWise) ? oppList.data[0].custIdWise : [];
          this.fullOpportunityList.forEach((supplier: any) => {
            if (supplier.company_name === banke.company_name) {
              supplier.custPagination.displayedCustList = childCustRows;
              supplier.custPagination.totalItems = oppList?.totalRows ?? childCustRows.length ?? 0;
            }
          });
        }
        this.loadingSwitch('6', false);
        break;
      default:
        this.loadingSwitch(partyType, false);
        break;
    }
  }

  updateListByPartyType(partyType: string, data: any) {
    switch (partyType) {
      case '2':
        this.supplierList = data?.supplierList;
        if (this.supplierList) {
          this.fullSupplierList = this.supplierList?.counterPartyList.map(bank => ({
            ...bank,
            custPagination: {
              page: 1,
              pageSize: 5,
              value: '',
              totalItems: bank.totalRows,
              displayedCustList: bank.custIdWise
            }
          }));
          if (this.fullSupplierList.length === 0){
            this.loadingSwitch(partyType, false);
          }else{
            this.fullSupplierList.forEach((_, index) => {
              this.collapseStates.supplier[index] = true; // all collapsed by default

              if ((this.fullSupplierList.length - 1) === index){
                this.loadingSwitch(partyType, false);
              }
            });
          }
        }else{
          this.fullSupplierList = [];
        }

        break;
      case '3':
        this.customerList = data?.customerList;
        if (this.customerList) {
          this.fullCustomerList = this.customerList?.counterPartyList.map(bank => ({
            ...bank,
            custPagination: {
              page: 1,
              pageSize: 5,
              value: '',
              totalItems: bank.totalRows,
              displayedCustList: bank.custIdWise
            }
          }));
          if (this.fullCustomerList.length === 0){
            this.loadingSwitch(partyType, false);
          }else{
            this.fullCustomerList.forEach((_, index) => {
              this.collapseStates.customer[index] = true;
              if ((this.fullCustomerList.length - 1) === index){
                this.loadingSwitch(partyType, false);
              }// all collapsed by default
            });
          }
        }else{
          this.fullCustomerList = [];
        }
        break;
      case '1':
        this.selfTransfersList = data?.selfTransfer;
        this.selfTransfersListALL = data?.selfTransfer;
        this.updateSelfTransferList(this.selectedSelfTransfer, partyType);
        break;

      case '5':
        this.netTransfersList = data?.netSelfTransfer;
        if (this.netTransfersList?.data?.length === 0){
          this.loadingSwitch(partyType, false);
        }else{
          this.netTransfersList?.data?.forEach((_, index) => {
            this.collapseStates.netSelfTransfer[index] = true;
            if ((this.netTransfersList?.data?.length - 1) === index){
              this.loadingSwitch(partyType, false);
            }// all collapsed by default
          });
        }
        this.loadingSwitch(partyType, false);

        break;
      case '4':
        this.statReportList = data?.statutoryReport;
        if (this.statReportList?.data) {
          this.fullStatReportList = this.statReportList?.data?.map(bank => ({
            ...bank,
            custPagination: {
              page: 1,
              pageSize: 5,
              value: '',
              totalItems: bank.totalRows,
              displayedCustList: bank.custIdWise
            }
          }));
          if (this.fullStatReportList.length === 0){
            this.loadingSwitch(partyType, false);
          }else{
            this.fullStatReportList.forEach((_, index) => {
              this.collapseStates.statutoryReport[index] = true;
              if ((this.fullStatReportList.length - 1) === index){
                this.loadingSwitch(partyType, false);
              }// all collapsed by default
            });
          }
        }else{
          this.fullStatReportList = [];
          this.loadingSwitch(partyType, false);
        }
        break;


      case '6':
        this.opportunityList = data?.opportunityReport;
        if (this.opportunityList?.data) {
          this.fullOpportunityList = this.opportunityList?.data?.map(bank => ({
            ...bank,
            custPagination: {
              page: 1,
              pageSize: 5,
              value: '',
              totalItems: bank?.totalRows,
              displayedCustList: bank?.custIdWise
            }
          }));
          if (this.fullOpportunityList.length === 0) {
            this.loadingSwitch(partyType, false);
          } else {
            this.fullOpportunityList.forEach((_, index) => {
              this.collapseStates.opportunity[index] = true;
              if ((this.fullOpportunityList.length - 1) === index) {
                this.loadingSwitch(partyType, false);
              }// all collapsed by default
            });
          }
        } else {
          this.fullOpportunityList = [];
          this.loadingSwitch(partyType, false);
        }
        break;
      default:
        this.loadingSwitch(partyType, false);
        break;
    }
  }

  navigateToViewComponent(panUi: any, customerId?: any) {
    const pan = panUi;
    console.log(pan);
    if (pan !== '-' && pan !== '' && pan !== null && pan !== 'null' && pan !== undefined) {
      const userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
      const roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
      if (customerId) {
        this.commonService.setStorage('cutomerId', customerId);
        const routerData = {pan, tabId: 1};
        GlobalHeaders['x-main-page'] = 'BankStatement Analysis in Portfolio Analysis';
        if (routerData.pan) {
          GlobalHeaders['x-page-data'] = routerData.pan;
        }
        GlobalHeaders['x-page-action'] = 'View  Portfolio';
        saveActivity(() => {
        });
        this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {state: {routerData, data: this.passRouteData, dataFrom : this.pageData, isFromParentPage: true}});
      } else {
        this.commonService.warningSnackBar('No CustomerId Found');
      }
    } else {
      this.commonService.warningSnackBar('Pan is not available');
    }
  }

  loadingSwitch(reportType: any, isApplicable: boolean) {
    if (reportType === '2'){
      this.isLoading.supplier = isApplicable;
      console.log('loader:::::supplier', this.isLoading.supplier);
    }else if (reportType === '3'){
      this.isLoading.customer = isApplicable;
      console.log('loader:::::customer', this.isLoading.customer);
    }else if (reportType === '1'){
      this.isLoading.selfTransfers = isApplicable;
      console.log('loader:::::selfTransfers', this.isLoading.selfTransfers);
    }else if (reportType === '4'){
      this.isLoading.statutoryReport = isApplicable;
      console.log('loader:::::statutoryReport', this.isLoading.statutoryReport);
    }else if (reportType === '5'){
      this.isLoading.netSelfTransfer = isApplicable;
      console.log('loader:::::netSelfTransfer', this.isLoading.netSelfTransfer);
    }else if (reportType === '6'){
      this.isLoading.opportunity = isApplicable;
      console.log('loader:::::customerSupplier', this.isLoading.opportunity);
    }else if (reportType === '7'){
      this.isLoading.customerSupplier = isApplicable;
      console.log('loader:::::customerSupplier', this.isLoading.customerSupplier);
    }
    console.log('loader:::::shoin', isApplicable);
    if (isApplicable === true){
      this.loaderService.subLoaderShow();
    }else{
      this.loaderService.subLoaderHide();
    }
  }

  viewProspect(compName?: any, type?: any) {
    this.loadingSwitch(type?.reportType, true);
    const userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    const roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    GlobalHeaders['x-main-page'] = 'BankStatement Analysis in Portfolio Analysis';
    GlobalHeaders['x-page-action'] = 'View  Prospect';

    let pageDatas: any = [];
    saveActivity(() => {
    });

    if (this.targetAndProspect){
      for (const subpage of this.targetAndProspect?.subSubpages) {
        if (subpage.subpageId === Constants.pageMaster.FIND_PROSPECT) {
          pageDatas = subpage;
          this.router.navigate([pageDatas?.routeLink], {state: {data: pageDatas, companyName: compName}});
          this.loadingSwitch(type?.reportType, false);
        }
      }
    }else{
      this.loadingSwitch(type?.reportType, false);
    }
  }

  applyFilter(type: any, minInter?: any, maxInter?: any, minAmount?: any, maxAmount?: any): void {
    const minInt = Number(this.filter[type].interactionMinInput);
    const maxInt =  Number(this.filter[type].interactionMaxInput);
    const minAmt =  Number(this.filter[type].amountMinInput);
    const maxAmt = Number(this.filter[type].amountMaxInput);

    const errors: string[] = [];

    if (minInt !== null && maxInt !== null && maxInt !== 0 && minInt > maxInt) {
      errors.push('• Min Interaction value should not be greater than Max Interaction value.');
    }

    if (minAmt !== null && maxAmt !== null && maxAmt !== 0 && minAmt > maxAmt && maxAmt > 0) {
      errors.push('• Min Amount value should not be greater than Max Amount value.');
    }

    if (errors.length > 0) {
      this.commonService.warningSnackBar('Please Check  \n' + errors.join('\n'));
      return;
    }

    const config = this.pagination[type];
    config.filterApplied = true;
    config.pageIndex = 1;
    config.pageSize = 5;
    this.fetchList(config);
  }


  clearFilter(type: any){
    this.filter[type] = {amountMinInput: '', amountMaxInput: '' , interactionMinInput : '' , interactionMaxInput : '' };
    const config = this.pagination[type];
    config.pageIndex = 1;
    config.pageSize = 5;
    config.filterApplied = false;
    this.fetchList(config);
  }

  getAmountTypePlaceholder(type: any, variant: any): string {
    let min: any ;
    let max: any ;
    if ( variant === 'amount'){
      min = this.filter[type].amountMinInput;
      max = this.filter[type].amountMaxInput;
    }else{
      min = this.filter[type].interactionMinInput;
      max = this.filter[type].interactionMaxInput;
    }
    if (min && max) {
      return `(${min} - ${max})`;
    } else if (min) {
      return `(Min: ${min})`;
    } else if (max) {
      return `(Max: ${max})`;
    } else {
      if ( variant === 'amount'){ return 'Amount'; }
      else{return 'Interactions Type'; }
    }
  }

  snpRadioChange(event: any) {
    console.log(event);
    this.pagination.customerSupplier.reportType = event;
    this.pagination.customerSupplier.pageIndex = 1;
    this.sortStates.customerSupplier = { column: '1', order: '1', innerColumn: '2', innerOrder: '1' };
    this.fetchCustList(this.pagination.customerSupplier);
  }

}



export interface PortfolioAnalysisRequest {
  reportType: string;
  outerSize: string;
  innerSize: string;
  outerPageIndex: string;
  innerPageIndex: string;
  outerSortingOrder: string;
  outerSortingColumn: string;
  innerSortingColumn: string;
  innerSortingOrder: string;
  subDataValue: string;
  isSubData: number;
  custId: string[];
  customerMap: any;
  role: number;
  customerPanMap: any;
  minCount: number;
  maxCount: number;
  minAmount: number;
  maxAmount: number;
  userId: any;
  opportunityId: number;
}


export interface GetSupplierCustomerRequest {
  reportType: string;
  custId: string[];
  role: number;
  level1PageIndex: number;
  level1PageSize: number;
  level2PageIndex: number;
  level2PageSize: number;
  level3PageIndex: number;
  level3PageSize: number;
  level1SortingOrder: number;
  level1SortingColumn: string;
  level2SortingColumn: string;
  level2SortingOrder: number;
  level3SortingColumn: string;
  level3SortingOrder: number;
  isLevel1SubData: number;
  isLevel2SubData: number;
  level1SubDataValue: string;
  level2SubDataValue: string;
  userId:any;
}
