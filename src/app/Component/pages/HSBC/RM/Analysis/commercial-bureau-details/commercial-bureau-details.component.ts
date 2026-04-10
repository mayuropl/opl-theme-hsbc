import { MatCheckboxChange } from '@angular/material/checkbox';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Component, HostListener } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { ValidationsService } from 'src/app/CommoUtils/common-services/validations.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { Pagination } from 'src/app/CommoUtils/model/pagination';
import { FacilitiesFromLendersComponent } from 'src/app/Popup/HSBC/facilities-from-lenders/facilities-from-lenders.component';
import { ProductsForeignCurrenciesComponent } from 'src/app/Popup/HSBC/products-foreign-currencies/products-foreign-currencies.component';
import { MsmeService } from 'src/app/services/msme.service';
import { PaginationService } from 'src/app/services/pagination.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../../CommoUtils/global-headers";
import { SharedService } from 'src/app/services/SharedService';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MainTypeWiseLatestSixMonthProductDetail } from 'src/app/CommoUtils/model/CommercialBureau';

@Component({
  selector: 'app-commercial-bureau-details',
  // standalone: true,
  // imports: [],
  templateUrl: './commercial-bureau-details.component.html',
  styleUrl: './commercial-bureau-details.component.scss'
})
export class CommercialBureauDetailsComponent {
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  selectedTabIndex: number;
  tabValue: number;
  scrolled: boolean = false;
  userId: any;
  applicationId: any;
  cibilId: any;
  pan: any;
  checkAnalysisExistOrNot:boolean;
  commercialData: any;
  isPrORCir: boolean = false;

  cmrScore: any;
  bureauVintage: any;
  totalLenders: any;
  bureauHistoryMessage: any;

  defaultData: any;
  dpdDetail: any = [];

  docId: any;
  fromBureauType: any;

  borrowerInformation: any;
  additionalDetails: any;
  numberOfInquiriesOutsideInstitution: any;
  outStandingBalanceBasedOnAssetsClassification: any;
  outStandingBalanceBasedOnAssetsClassificationNew: any;
  productWiseDetailsNew6: any;
  productWiseDetailsOld6: any;
  mainTypeWiseLatestSixMonthProductDetails :  MainTypeWiseLatestSixMonthProductDetail[] = [];
  mainTypeWiseBelowSixMonthProductDetails: MainTypeWiseLatestSixMonthProductDetail[] = [];

  totalYourInstitution = 0;
  totalOtherInstitution = 0;
  totalHSBCPercentage = 0;

  totalnoOfCreditFacility = 0;
  totalsanctionedAmountOther = 0;
  totalutilizationOther = 0;
  totalsanctionedAmountHsbc = 0;
  totalutilizationHsbc = 0;
  totalOtherUtiPercentage = 0;
  totalHsbcUtiPercentage = 0;
  totaloutStandingAmountHsbc = 0;
  totaloutStandingAmountOther = 0;
  currentSortField: string = null;
  currentSortField1: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';

  PageSelectNumber: any[] = [
    {
      name: '10',
      value: 10
    },
    {
      name: '20',
      value: 20
    },
    {
      name: '50',
      value: 50
    },
    {
      name: '100',
      value: 100
    },
  ];

  //  transaction pagination
  productWisePagination:Pagination;
  defaultDataPagination:Pagination;
  productWisePaginationData :  MainTypeWiseLatestSixMonthProductDetail[] = [];
  defaultDataPaginationData: any[] = [];
  byDefaultDataPaginationData: byDefaultDataPaginationData[] = [];
   routerData: any;

   status:any;
  constants: any;
  pageData: any; // This will hold the current page data

  originalData: any[] = [];
  filteredData: any[] = [];
  newDefaultDataPaginationData: any[] = [];
  newDefaultTableData:any

  newDefaultDataPagination = {
    page: 1,
    pageSize: 10,
    totalSize: 0,
    startIndex: 0,
    endIndex : 0
  };

  totalOverdue = 0;
  totalsuitfiled = 0;
  totalWrittenOff = 0;
  totalSettled = 0;

  // searchControls = {
  //   cfType: new FormControl([]),
  //   member: new FormControl([]),
  //   assetClassificationDpdDays: new FormControl(''),
  //   fullStatus: new FormControl([]),
  //   dateOfReport: new FormControl(''),
  //   overdue: new FormControl(''),
  //   suitFiled: new FormControl(''),
  //   writtenOff: new FormControl(''),
  //   settled: new FormControl(''),
  //   acDpdUpto24Months: new FormControl('')
  // };


  searchControls = new FormGroup({
    cfType: new FormControl([]),
    member: new FormControl([]),
    assetClassificationDpdDays: new FormControl(''),
    fullStatus: new FormControl([]),
    dateOfReport: new FormControl([]),
    overdue: new FormControl(''),
    suitFiled: new FormControl(''),
    writtenOff: new FormControl(''),
    settled: new FormControl(''),
    acDpdUpto24Months: new FormControl('')
  });


  statusOptions: string[] = [
    "All",
    "Not a Suit Filed Case,Open,Not Wilful Defaulter",
    "Closed",
    "Settled,Open,Not Wilful Defaulter",
    "Suit Filed,Open,Wilful Defaulter",
    "NULL",
    "Not a Suit Filed Case,Closed By Payment,Not Wilful Defaulter",
    "NotaSuitFiledCase,Open,NotWilfulDefaulter",
    "NotaSuitFiledCase,ClosedByPayment,NotWilfulDefaulter",
    "Suit Filed,Open,Not Wilful Defaulter",
    "Not a Suit Filed Case,Restructured,Not Wilful Defaulter",
    "Trial in Progress,Open,Not Wilful Defaulter",
    "Suit Filed,Written Off,Not Wilful Defaulter",
    "Not a Suit Filed Case,Written Off,Not Wilful Defaulter",
    "Not a Suit Filed Case,Settled & Closed,Not Wilful Defaulter",
    "Not a Suit Filed Case,Purchase from Bank,Not Wilful Defaulter",
    "Suit Filed,Closed By Payment,Not Wilful Defaulter",
    "Not a Suit Filed Case,Settled Post Write Off,Not Wilful Defaulter",
    "Not a Suit Filed Case,Close,Not Wilful Defaulter",
    "WRITTEN-OFF",
    "Suit Filed",
    "Suit Filed Case,Open,Wilful Defaulter",
    "Suit Filed Case,Open,Not Wilful Defaulter",
    "Not a Suit Filed Case,Open,Wilful Defaulter",
    "Not a Suit Filed Case,Suit Filed,Not Wilful Defaulter",
    "Not Suit Filed,Open,Not Wilful Defaulter",
    "Not a Suit Filed Case,Settled,Closed By Payment,Not Wilful Defaulter"
  ];

  constructor(private router: Router,
    public dialog: MatDialog, private formBuilder: UntypedFormBuilder, private validationsService: ValidationsService,
    public msmeService: MsmeService, public commonService: CommonService, private loaderService: LoaderService, public commonMethod: CommonMethods,
    private paginationService: PaginationService, private sharedService : SharedService) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.applicationId = this.commonService.getStorage(Constants.httpAndCookies.APPLICATION_ID, true);
    this.cibilId = this.commonService.getStorage(Constants.httpAndCookies.CIBIL_ID, true);
    this.pan = this.commonService.getStorage("commrcial_pan", true);

    console.log("This cibilId Data :: {} ", this.cibilId);
       this.initialize();
  }

    private initialize() {
    console.log("Message recieved from Cibil Bureau Fetch Status ");
    this.sharedService.getCibilBureauFetchStatusClickEvent().subscribe((message)=>{
      // this.fetchDataFromWebSocket(message);
      this.fetchDataFromWebSocket(message);
  })
  }

fetchDataFromWebSocket(responseFromWebSocket?){
  responseFromWebSocket = JSON.parse(responseFromWebSocket);
  console.log(responseFromWebSocket);
  // this.checkAnalysisExistOrNot = true;
  console.log(this.checkAnalysisExistOrNot)
  this.commercialData = responseFromWebSocket?.response;
  this.setCibilData(this.commercialData);
        if(this.commercialData?.checkAnalysisExistOrNot  == false){
          // this.viewCommercialDetailPage(this.pan.toUpperCase());
          this.navBack();
      }

    // this.fetchHistory(responseFromWebSocket?.response)
}
      // mat tab header fixed S
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 100;
  }
  // mat tab header fixed S
  byDefaultData: byDefaultDataPaginationData[] = [
    {
      status: "Wilful Default",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Suit Filed",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Written Off",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Settled",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Invoked/Devolvement",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Overdue",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Sub-standard",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Doubtful",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    },
    {
      status: "Loss",
      date: "-",
      cfType: "NA",
      amount: "-",
      member: "NA"
    }
  ];

    checkIsAll = true;
    isMemberCheckedAll = true;
    isStatusCheckedAll = true;
    isYearCheckedAll = true;
    isFromCrif = false;

    cfTypeArray: any[] = [];
    memberArray: any[] = [];
    fullStatusArray: any[] = [];
    yearArray: any[] = [];

    cfTypeMasterArray: any[] = [];
    memberMasterArray: any[] = [];
    fullStatusMasterArray: any[] = [];
    filteredYearArray: any[] = [];

  ngOnInit(): void {

    this.generateYearList();
    this.filteredYearArray = [...this.yearArray];

    this.constants = Constants;
    this.pageData = history.state.data;
    console.log(this.pageData?.status);
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmCommercialBureauDetails';
    GlobalHeaders['x-main-page'] = 'Commercial Bureau';
    this.productWisePagination = new Pagination();
    this.defaultDataPagination = new Pagination();
    this.newDefaultDataPagination = new Pagination();

    if (this.pageData?.status == 1) {
          this.checkAnalysisExistOrNot = true;
    }else{
       this.checkAnalysisExistOrNot = undefined;
    }
    if (this.pageData?.bureayType == 'Crif PR') {
          this.isFromCrif = true;
    }else{
       this.isFromCrif = false;
    }

    this.getCommercialData();

    Object.keys(this.searchControls.controls).forEach(key => {
      this.searchControls.controls[key].valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.applyFilters();
        });
    });


    setTimeout(() => {
      this.toggleStatusSelectAll()
      this.toggleMemberSelectAll()
      this.toggleSelectAll()
      this.toggleYearSelectAll();
    }, 1500);

  }

  generateYearList() {
  const currentYear = 2025;
  const startYear = 1990;
    for (let year = currentYear; year >= startYear; year--) {
      this.yearArray.push(year);
    }
  }

  applyFilters(): void {
    this.filteredData = this.newDefaultTableData.filter(item => {
      return Object.keys(this.searchControls.controls).every(key => {
        const controlValue = this.searchControls.get(key).value;

        if (!controlValue || (Array.isArray(controlValue) && controlValue.length === 0)) {
          return true;
        }

        const itemValue = item[key]?.toString().toLowerCase() || '';

        if (Array.isArray(controlValue)) {
          if (controlValue.includes('All') ||
              controlValue.length === this.getOptionsArray(key).length) {
            return true;
          }
          return controlValue.some(val =>
            itemValue.includes(val.toString().toLowerCase()));
        }

        return itemValue.includes(controlValue.toString().toLowerCase());
      });
    });

    this.updatePagination();
    this.calculateTotalsForOverdue();
  }


  getOptionsArray(controlName: string): any[] {
    switch (controlName) {
      case 'cfType': return this.cfTypeArray;
      case 'member': return this.memberArray;
      case 'fullStatus': return this.fullStatusArray;
      case 'dateOfReport': return this.yearArray;
      default: return [];
    }
  }

  updatePagination(): void {
    this.newDefaultDataPagination.totalSize = this.filteredData.length;
    this.newDefaultDataPagination.startIndex = (this.newDefaultDataPagination.page - 1) * this.newDefaultDataPagination.pageSize;

    this.newDefaultDataPaginationData = this.filteredData.slice(
      this.newDefaultDataPagination.startIndex,
      this.newDefaultDataPagination.startIndex + this.newDefaultDataPagination.pageSize
    );
  }

  newDefaultDataChangePage(page: number): void {
    if (page < 1 || page > Math.ceil(this.filteredData.length / this.newDefaultDataPagination.pageSize)) {
      return;
    }
    this.newDefaultDataPagination.page = page;
    this.updatePagination();
    this.toggleSortNewDefaultData(this.currentSortField1,true,'value');
  }


  clearAllFilters(): void {

    this.checkIsAll = false;
    this.isMemberCheckedAll = false;
    this.isStatusCheckedAll = false;
    this.isYearCheckedAll = false;

    Object.keys(this.searchControls.controls).forEach(key => {
      if (Array.isArray(this.searchControls.get(key).value)) {
        this.searchControls.get(key).setValue([]);
      } else {
        this.searchControls.get(key).setValue('');
      }
    });
    this.applyFilters();
  }


onStatusSelectionChange2(selected: string[]): void {
  const allOptionIndex = selected.indexOf('All');
  const currentSelection = this.searchControls.get('fullStatus').value;

  if (allOptionIndex > -1) {
    if (currentSelection.includes('All')) {
      this.searchControls.get('fullStatus').setValue(['All', ...this.statusOptions.filter(opt => opt !== 'All')]);
    }
    else{
      this.searchControls.get('fullStatus').setValue([]);
    }
  }
  else if (currentSelection.includes('All')) {
    this.searchControls.get('fullStatus').setValue([]);
  }
  const selectedWithoutAll = selected.filter(opt => opt !== 'All');
  if (selectedWithoutAll.length === this.statusOptions.length - 1) {
    // this.searchControls.fullStatus.setValue(['All', ...selectedWithoutAll]);
    this.searchControls.get('fullStatus').setValue([]);
  }else{
    this.searchControls.get('fullStatus').setValue([ ...selectedWithoutAll]);
  }

  this.applyFilters();
}


onStatusSelectionChange(selected: string[]): void {
  const allOptionIndex = selected.indexOf('All');
  const currentSelection = this.searchControls.get('fullStatus').value;
  const selectedWithoutAll = selected.filter(opt => opt !== 'All');

  if (allOptionIndex > -1) {
    if (currentSelection.includes('All')) {
      this.searchControls.get('fullStatus').setValue(['All', ...this.statusOptions.filter(opt => opt !== 'All')]);
    }
    else{
      this.searchControls.get('fullStatus').setValue([ ...selectedWithoutAll]);
    }
  }
  else {
    this.searchControls.get('fullStatus').setValue([ ...selectedWithoutAll]);
  }

  this.applyFilters();
}

onFacilityTypeSelectionChange(selected: string[]): void {
  const allOptionIndex = selected.indexOf('All');
  const currentSelection = this.searchControls.get('cfType').value;
  const selectedWithoutAll = selected.filter(opt => opt !== 'All');

  if (allOptionIndex > -1) {
    if (currentSelection.includes('All')) {
      this.searchControls.get('cfType').setValue(['All', ...this.cfTypeArray.filter(opt => opt !== 'All')]);
    }
    else{
      this.searchControls.get('cfType').setValue([ ...selectedWithoutAll]);
    }
  }
  else {
    this.searchControls.get('cfType').setValue([ ...selectedWithoutAll]);
  }

  this.applyFilters();
}

onMemberSelectionChange(selected: string[]): void {
  const allOptionIndex = selected.indexOf('All');
  const currentSelection = this.searchControls.get('member').value;
  const selectedWithoutAll = selected.filter(opt => opt !== 'All');

  if (allOptionIndex > -1) {
    if (currentSelection.includes('All')) {
      this.searchControls.get('member').setValue(['All', ...this.memberArray.filter(opt => opt !== 'All')]);
    }
    else{
      this.searchControls.get('member').setValue([ ...selectedWithoutAll]);
    }
  }
  else {
    this.searchControls.get('member').setValue([ ...selectedWithoutAll]);
  }

  this.applyFilters();
}



  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  calculateTotals(): any {

    for (let item of this.outStandingBalanceBasedOnAssetsClassification) {
      if (!this.commonService.isObjectNullOrEmpty(item.yourInstitution)) {
        this.totalYourInstitution += item.yourInstitution;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.otherInstitution)) {
        this.totalOtherInstitution += item.otherInstitution;
      }
      // if (!this.commonService.isObjectNullOrEmpty(item.hsbcCompareToOtherInPercentage)) {
      //   this.totalHSBCPercentage += item.hsbcCompareToOtherInPercentage;
      // }
      if ((!this.commonService.isObjectNullOrEmpty(this.totalYourInstitution) && this.totalYourInstitution > 0)
        && (!this.commonService.isObjectNullOrEmpty(this.totalOtherInstitution) && this.totalOtherInstitution > 0)) {
        this.totalHSBCPercentage = (this.totalYourInstitution / this.totalOtherInstitution) * 100;
      }
    }
  }

  calculateTotalForProductWiseDetails(): any {

    console.log("this.mainTypeWiseLatestSixMonthProductDetails", this.mainTypeWiseLatestSixMonthProductDetails);


    for (let item of this.mainTypeWiseLatestSixMonthProductDetails) {
      if (!this.commonService.isObjectNullOrEmpty(item.noOfCreditFacility)) {
        this.totalnoOfCreditFacility += item.noOfCreditFacility;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.sanctionedAmountOther)) {
        this.totalsanctionedAmountOther += item.sanctionedAmountOther;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.sanctionedAmountHsbc)) {
        this.totalsanctionedAmountHsbc += item.sanctionedAmountHsbc;
      }

      if (!this.commonService.isObjectNullOrEmpty(item.utilizationOther)) {
        this.totalutilizationOther += item.utilizationOther;
      }

      if (!this.commonService.isObjectNullOrEmpty(item.utilizationHsbc)) {
        this.totalutilizationHsbc += item.utilizationHsbc;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.outStandingAmountHsbc)) {
        this.totaloutStandingAmountHsbc += item.outStandingAmountHsbc;
      }
      if (!this.commonService.isObjectNullOrEmpty(item.outStandingAmountOther)) {
        this.totaloutStandingAmountOther += item.outStandingAmountOther;
      }
    }
    if ((!this.commonService.isObjectNullOrEmpty(this.totaloutStandingAmountOther) && this.totaloutStandingAmountOther > 0)
      && (!this.commonService.isObjectNullOrEmpty(this.totalsanctionedAmountOther) && this.totalsanctionedAmountOther > 0)) {
      this.totalOtherUtiPercentage = this.totaloutStandingAmountOther / this.totalsanctionedAmountOther * 100;
    }
    if ((!this.commonService.isObjectNullOrEmpty(this.totaloutStandingAmountHsbc) && this.totaloutStandingAmountHsbc > 0)
      && (!this.commonService.isObjectNullOrEmpty(this.totalsanctionedAmountHsbc) && this.totalsanctionedAmountHsbc > 0)) {
      this.totalHsbcUtiPercentage = this.totaloutStandingAmountHsbc / this.totalsanctionedAmountHsbc * 100;
    }
  }

  getCommercialData() {
    const data = {
      cibilId: this.cibilId,
      pan: this.pan.toUpperCase(),
      userId: this.userId,
      isFromCrif : this.isFromCrif
    }
    this.msmeService.getcommercialData(data).subscribe(response => {
      if (response) {
        this.commercialData = response;

        console.log("This commercial Data :: {} ", this.commercialData)

        console.log("Get Commerical Data {} :: ", response);
      } else {
        console.log();
      }
      this.setCibilData(this.commercialData);

      // if(this.commercialData?.checkAnalysisExistOrNot  == false){
      //     // this.viewCommercialDetailPage(this.pan.toUpperCase());
      //     this.navBack();
      // }
      // this.cmrScore = this.commercialData?.cmrScore;
      // this.bureauVintage = this.commercialData?.bureauVintage;
      // this.totalLenders = this.commercialData?.totalLenders;
      // console.log("bureauHistoryMessage :::: ",this.commercialData?.bureauHistoryMessage);
      // if(!this.commonService.isObjectNullOrEmpty(this.commercialData?.bureauHistoryMessage)){

      //   if(this.commercialData?.bureauHistoryMessage == "No Credit Facilities Reported"){
      //     this.bureauHistoryMessage = "Non borrowing client. No Credit Facilities Reported by bureau"
      //   }
      //   console.log("after bureauHistoryMessage :::: ",this.bureauHistoryMessage);
      // }

      // this.borrowerInformation = this.commercialData?.borrowerInformation;
      // this.additionalDetails = this.commercialData?.additionalDetails;
      // this.numberOfInquiriesOutsideInstitution = this.commercialData?.numberOfInquiriesOutsideInstitution;
      // this.outStandingBalanceBasedOnAssetsClassification = this.commercialData?.outStandingBalanceBasedOnAssetsClassification;
      // this.outStandingBalanceBasedOnAssetsClassificationNew = this.commercialData?.outStandingBalanceBasedOnAssetsClassificationNew;
      // if (this.outStandingBalanceBasedOnAssetsClassification) {
      //   this.calculateTotals()
      // }
      // this.productWiseDetailsNew6 = this.commercialData?.productWiseDetaResponcesLatest6Months;
      // this.productWiseDetailsOld6 = this.commercialData?.productWiseDetaResponcesOld6Months;
      // if (this.productWiseDetailsNew6) {
      //   this.calculateTotalForProductWiseDetails()
      // }
      // this.productWisePagination.totalSize = this.productWiseDetailsNew6?.length;
      // // Initialize pagination
      // if (!this.commonService.isObjectNullOrEmpty(this.productWiseDetailsNew6)) {
      //   this.updatePaginatedData();
      // }


      // this.defaultData = this.commercialData?.defaultData;
      // this.defaultDataPagination.totalSize = this.defaultData?.length;
      // if (!this.commonService.isObjectNullOrEmpty(this.defaultData)) {
      //   this.updatePaginatedDataDefaultData();
      //       }
      // this.dpdDetail = this.commercialData?.dpdDetail;
      // this.checkAnalysisExistOrNot = this.commercialData?.checkAnalysisExistOrNot;


      // console.log("")
      // console.log("")
      // console.log("")
      // console.log("DPD DETAILS ::: ", this.dpdDetail)
      // console.log("")
      // console.log("")
      // console.log("")
    })
  }



  setCibilData(commercialData : any){
      this.docId = commercialData?.docId;
      this.fromBureauType = commercialData?.fromBureauType;
      this.cmrScore = commercialData?.cmrScore;
      this.bureauVintage = commercialData?.bureauVintage;
      this.totalLenders = commercialData?.totalLenders;
      console.log("bureauHistoryMessage :::: ",commercialData?.bureauHistoryMessage);
      if(!this.commonService.isObjectNullOrEmpty(commercialData?.bureauHistoryMessage)){

        if(commercialData?.bureauHistoryMessage == "No Credit Facilities Reported"){
          this.bureauHistoryMessage = "Non borrowing client. No Credit Facilities Reported by bureau"
        }
        console.log("after bureauHistoryMessage :::: ",this.bureauHistoryMessage);
      }
      this.isPrORCir = commercialData?.isPrORCir == 1 ? true : false;
      console.log("this.isPrORCir ::: ", this.isPrORCir);
      this.borrowerInformation = commercialData?.borrowerInformation;
      this.additionalDetails = commercialData?.additionalDetails;
      this.numberOfInquiriesOutsideInstitution = commercialData?.numberOfInquiriesOutsideInstitution;
      this.outStandingBalanceBasedOnAssetsClassification = commercialData?.outStandingBalanceBasedOnAssetsClassification;
      this.outStandingBalanceBasedOnAssetsClassificationNew = commercialData?.outStandingBalanceBasedOnAssetsClassificationNew;
      this.newDefaultTableData = commercialData?.newDefaultTableData
      console.log('this.newDefaultTableData : ', this.newDefaultTableData );
      if (this.outStandingBalanceBasedOnAssetsClassification) {
        this.calculateTotals()
      }
      // this.productWiseDetailsNew6 = commercialData?.productWiseDetaResponcesLatest6Months;
      // this.productWiseDetailsOld6 = commercialData?.productWiseDetaResponcesOld6Months;
      // if (this.productWiseDetailsNew6) {
      //   this.calculateTotalForProductWiseDetails()
      // }
      // this.productWisePagination.totalSize = this.productWiseDetailsNew6?.length;
      // Initialize pagination
      // if (!this.commonService.isObjectNullOrEmpty(this.productWiseDetailsNew6)) {
      //   this.updatePaginatedData();
      // }

      this.mainTypeWiseLatestSixMonthProductDetails = commercialData?.mainTypeWiseLatestSixMonthProductDetails;
      this.mainTypeWiseBelowSixMonthProductDetails = commercialData?.mainTypeWiseBelowSixMonthProductDetails;
      if (this.mainTypeWiseLatestSixMonthProductDetails) {
        this.calculateTotalForProductWiseDetails()
      }
      if (this.mainTypeWiseLatestSixMonthProductDetails) {
          this.mainTypeWiseLatestSixMonthProductDetails.forEach(element => {
          element.internalPagination = new PaginationSignal();
          element.internalPagination.totalSize = element.subTypeOfProductDetails.length;
        });
      }
      this.productWisePagination.totalSize = this.mainTypeWiseLatestSixMonthProductDetails?.length;
      // Initialize pagination
      if (!this.commonService.isObjectNullOrEmpty(this.mainTypeWiseLatestSixMonthProductDetails)) {
        this.updatePaginatedData();
      }


      this.defaultData = commercialData?.defaultData;
      this.defaultDataPagination.totalSize = this.defaultData?.length;

      this.newDefaultDataPagination.totalSize = this.newDefaultTableData?.length;

      if (!this.commonService.isObjectNullOrEmpty(this.newDefaultTableData)) {
        console.log('this.newDefaultTableData: ', this.newDefaultTableData);

        this.cfTypeMasterArray = [... new Set(this.newDefaultTableData.map(item => item.cfType))];
        this.cfTypeArray=  [...this.cfTypeMasterArray];
        this.memberMasterArray = [... new Set(this.newDefaultTableData.map(item => item.member))];
        this.memberArray = [...this.memberMasterArray]
        this.fullStatusMasterArray = [...new Set(this.newDefaultTableData.map(item => item.fullStatus))];
        this.fullStatusArray = [...this.fullStatusMasterArray]
        this.yearArray = [...this.filteredYearArray]

        this.updatePaginatedNewDataDefaultData();
        this.filteredData = this.newDefaultTableData;
        this.updatePagination()
        this.calculateTotalsForOverdue();
      }

      if (!this.commonService.isObjectNullOrEmpty(this.defaultData)) {
        this.updatePaginatedDataDefaultData();
            }
      this.dpdDetail = commercialData?.dpdDetail;
      this.checkAnalysisExistOrNot = commercialData?.checkAnalysisExistOrNot;
      if( this.checkAnalysisExistOrNot == true){
          this.pageData.status = 1;
      }
      if(this.checkAnalysisExistOrNot == false){
          this.checkAnalysisExistOrNot= null;
      }

      console.log("")
      console.log("")
      console.log("")
      console.log("DPD DETAILS ::: ", this.dpdDetail)
      console.log("")
      console.log("")
      console.log("")
  }

  getSelectedElementsCount(type:string) {
      if(type == 'cfType'){
        const tempVar = (this.searchControls.get('cfType')?.value || []).length;
        return tempVar != 0 ? ('Selected facility: '+ tempVar) : 'Select facility';
      }
      else if(type == 'member'){
        const tempVar = (this.searchControls.get('member')?.value || []).length;
        return tempVar != 0 ? ('Selected Members: '+ tempVar) : 'Select Members';
      }
      else if(type == 'fullStatus'){
        const tempVar = (this.searchControls.get('fullStatus')?.value || []).length;
        return tempVar != 0 ? ('Selected status: '+ tempVar) : 'Select status';
      }else if(type == 'dateOfReport'){
        const tempVar = (this.searchControls.get('dateOfReport')?.value || []).length;
        return tempVar != 0 ? ('Selected year: '+ tempVar) : 'Select year';
      }

    }


      onCommonSearch(value: string, type: string): void {
        const searchValue = value.toLowerCase().trim();

        switch (type) {
          case 'cfType':
            if (!searchValue) {
              this.cfTypeArray = [...this.cfTypeMasterArray];
            } else {
              this.cfTypeArray = this.cfTypeMasterArray.filter(item =>
                item.toLowerCase().includes(searchValue)
              );
            }
            this.applyFilters();
            break;

          case 'member':
            if (!searchValue) {
              this.memberArray = [...this.memberMasterArray];
            } else {
              this.memberArray = this.memberMasterArray.filter(item => item?.toLowerCase().includes(searchValue));
            }
            this.applyFilters();
            break;

          case 'fullStatus':
            if (!searchValue) {
              this.fullStatusArray = [...this.fullStatusMasterArray];
            } else {
              this.fullStatusArray = this.fullStatusMasterArray.filter(item => item?.toLowerCase().includes(searchValue));
            }
            this.applyFilters();
            break;

            case 'dateOfReport':
            if (!searchValue) {
              this.yearArray = [...this.filteredYearArray];
            } else {
              this.yearArray = this.filteredYearArray.filter(year =>
                year.toString().includes(searchValue)
              );
            }
            this.applyFilters();
            break;
        }
      }

    isAllSelected(): boolean {
      const selected = this.searchControls.get('cfType')?.value || [];
      const checked=  this.cfTypeArray.length > 0 && this.cfTypeArray.every(item => selected.includes(item));
      return checked;
    }



    toggleSelectAll(): void {
      // const selected = this.searchControls.get('cfType')?.value || [];
      // const containAll = selected.includes('ALL');
      this.checkIsAll = !this.checkIsAll
      if (this.checkIsAll) {
        const selected = this.searchControls.get('cfType')?.value || [];
        const newSelection = Array.from(new Set([...selected, ...this.cfTypeArray]));
        this.searchControls.get('cfType').setValue(newSelection);
      } else {
        const selected = this.searchControls.get('cfType')?.value || [];
        const newSelection = selected.filter(item => !this.cfTypeArray.includes(item));
        this.searchControls.get('cfType').setValue(newSelection);
      }
    }

    toggleMemberSelectAll(){
      this.isMemberCheckedAll  = !this.isMemberCheckedAll
      if (this.isMemberCheckedAll) {
        const selected = this.searchControls.get('member')?.value || [];
        const newSelection = Array.from(new Set([...selected, ...this.memberArray]));
        this.searchControls.get('member').setValue(newSelection);
      } else {
        const selected = this.searchControls.get('member')?.value || [];
        const newSelection = selected.filter(item => !this.memberArray.includes(item));
        this.searchControls.get('member').setValue(newSelection);
      }
    }

    toggleStatusSelectAll(){
      this.isStatusCheckedAll  = !this.isStatusCheckedAll
      if (this.isStatusCheckedAll) {
        const selected = this.searchControls.get('fullStatus')?.value || [];
        const newSelection = Array.from(new Set([...selected, ...this.fullStatusArray]));
        this.searchControls.get('fullStatus').setValue(newSelection);
      } else {
        const selected = this.searchControls.get('fullStatus')?.value || [];
        const newSelection = selected.filter(item => !this.fullStatusArray.includes(item));
        this.searchControls.get('fullStatus').setValue(newSelection);
      }
    }

     toggleYearSelectAll() {
      this.isYearCheckedAll = !this.isYearCheckedAll;

      if (this.isYearCheckedAll) {
        const selected = this.searchControls.get('dateOfReport')?.value || [];
        const newSelection = Array.from(new Set([...selected, ...this.yearArray]));
        this.searchControls.get('dateOfReport')?.setValue(newSelection);
      } else {
        const selected = this.searchControls.get('dateOfReport')?.value || [];
        const newSelection = selected.filter(item => !this.yearArray.includes(item));
        this.searchControls.get('dateOfReport')?.setValue(newSelection);
      }
    }


      onSearchSelection(option: any, event: MatCheckboxChange, columnType:string) {

        if(columnType == 'cfType'){
          this.checkIsAll = false;
          const control = this.searchControls.get('cfType');
          let currentValue = control?.value || [];
          if (event.checked) {
            currentValue.push(option);
          }
          else {
            currentValue = currentValue.filter((temp: any) => temp !== option);
          }
          control?.setValue(currentValue);
          this.applyFilters();
        }
        else if(columnType == 'member'){
          this.isMemberCheckedAll = false;
          const control = this.searchControls.get('member');
          let currentValue = control?.value || [];
          if (event.checked) {
            currentValue.push(option);
          }
          else {
            currentValue = currentValue.filter((temp: any) => temp !== option);
          }
          control?.setValue(currentValue);
          this.applyFilters();
        }
        else if(columnType == 'fullStatus'){
          this.isStatusCheckedAll = false;
          const control = this.searchControls.get('fullStatus');
          let currentValue = control?.value || [];
          if (event.checked) {
            currentValue.push(option);
          }
          else {
            currentValue = currentValue.filter((temp: any) => temp !== option);
          }
          control?.setValue(currentValue);
          this.applyFilters();
        }
         else if(columnType == 'dateOfReport'){
          this.isYearCheckedAll = false;
          const control = this.searchControls.get('dateOfReport');
          let currentValue = control?.value || [];
          if (event.checked) {
            currentValue.push(option);
          }
          else {
            currentValue = currentValue.filter((temp: any) => temp !== option);
          }
          control?.setValue(currentValue);
          this.applyFilters();
        }

      }


      isAllOptionsSelected(controlName: string, options: string[]): boolean {
        const selected = this.searchControls.get(controlName)?.value || [];
        return options.length > 0 && options.every(opt => selected.includes(opt));
      }

      onSelectionChange(controlName: string, options: any[], isAll): void {
        console.log("Element ", isAll)
        const selected = [...this.searchControls.get('cfType').value, isAll];
        const currentSelection = this.searchControls.get(controlName).value || [];
        const allOptionSelected = selected.includes('All');


        if (allOptionSelected) {
          this.searchControls.get(controlName).setValue(['All', ...options]);
        } else if (currentSelection.includes('All') && selected.length < currentSelection.length) {
          const newSelection = selected.filter(opt => opt !== 'All');
          this.searchControls.get(controlName).setValue(newSelection);
        } else {
          const selectedWithoutAll = selected.filter(opt => opt !== 'All');

          if (selectedWithoutAll.length === options.length) {
            this.searchControls.get(controlName).setValue(['All', ...options]);
          } else {
            this.searchControls.get(controlName).setValue(selectedWithoutAll);
          }
        }

        this.applyFilters();
      }

      // This method is used to download file by bucket ref id when file type is html and uploaded from LAYER 7
      downloadByBucketRef(bucketRef,name) {
          if(this.commonService.isObjectNullOrEmpty(bucketRef)){
            this.commonService.warningSnackBar("File Not Found");
            return;
          }
          var formData = new FormData();
          formData.append('bucketRefId', bucketRef)
          formData.append('fileType','html')
          console.info('inside file download');
           this.msmeService.getByBucketRef(formData).subscribe((blob: Blob) => {
             if (blob.size > 0) {
              const a = document.createElement('a');
              const objectUrl = URL.createObjectURL(blob);
              a.href = objectUrl;
              a.download = name + ".html";
              a.click();
              URL.revokeObjectURL(objectUrl);
            } else {
              console.error('Received empty blob');
              this.commonService.warningSnackBar('File is empty or could not be downloaded');
            }
          },
          (error) => {
            console.error('Failed to download file', error);
            this.commonService.warningSnackBar('Failed to download file');
          }
        );
      }

  downloadCommercialReport() {
    GlobalHeaders['x-page-action'] = 'Download Report';
    if(!this.isPrORCir){
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    }else{
      this.commonService.warningSnackBar("This is pre-populate bureau report to help you with instant wallet-gap analysis and alerts. To download the entire bureau report - please go back and trigger fresh commercial bureau pull");
      return;
    }
    if(this.isFromCrif){
      this.commonService.warningSnackBar("This is pre-populate bureau report to help you with instant wallet-gap analysis and alerts. To download the entire bureau report - please go back and trigger fresh commercial bureau pull");
      return;
    }


    if(this.fromBureauType == '2' && !this.commonService.isObjectNullOrEmpty(this.docId)){
        this.downloadByBucketRef('COMPANY_REPORT'+this.docId,this.cibilId);
        return;
    }


    var formData = new FormData();
    formData.append('cibilId', this.cibilId)
    formData.append('type',"2")
    console.info('inside file download');
     this.msmeService.downloadCibilReport2(formData).subscribe((blob: Blob) => {
       if (blob.size > 0) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.cibilId + ".html";
        a.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        this.commonService.warningSnackBar("File Not Found.") ;
        // console.error('Received empty blob');
        // this.commonService.warningSnackBar('File is empty or could not be downloaded');
      }
    },
    (error) => {
      console.error('Failed to download file bcz latest report is uploaded from PR', error);
      this.commonService.warningSnackBar("Not able to download");
    }
  );

    // this.msmeService.downloadCibilReport(this.cibilId, 2).subscribe(res => {
    //   if (res && res?.data) {
    //     this.blobToFile(atob(res.data), "text/html", this.cibilId);
    //   } else {
    //     this.dpdDetail[0]?.prOrCir != "CIR" ? this.commonService.warningSnackBar("This is pre-populate bureau report to help you with instant wallet-gap analysis and alerts. To download the entire bureau report - please go back and trigger fresh commercial bureau pull")
    //     :this.commonService.warningSnackBar("File Not Found.") ;
    //   }
    // }, error => {
    //   this.commonService.errorSnackBar(error.message);
    // })
  }

  downloadCommercialPdf() {
    GlobalHeaders['x-page-action'] = 'Download Pdf';
    const data = {
      cibilId: this.cibilId,
      templateId: 1,
      pan: this.pan.toUpperCase(),
      isFromCrif : this.isFromCrif
    }
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadCibilPdf(data).subscribe(res => {
      console.log("Download Cibil Commercial PDF >>", res);
      if (res && res?.data && res?.data?.content) {
        this.downloadBase64(res.data.content, "Commercial_Analysis_" + this.cibilId);
      } else {
        this.commonService.errorSnackBar("Not able to download");
      }
    }, error => {
      this.commonService.errorSnackBar(error.message);
    })
  }

  downloadBase64(data: any, fileName: string) {
    const blob = new Blob([this.base64ToArrayBuffer(data)], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = downloadUrl;
    anchor.click();
  }
  private base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }
  blobToFile(data: any, type: string, fileName: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    a.href = url; a.download = fileName; a.click();
    window.URL.revokeObjectURL(url);
  }

  updatePaginatedData(): void {
    this.productWisePaginationData = this.paginationService.paginate(this.mainTypeWiseLatestSixMonthProductDetails, this.productWisePagination?.pageSize, this.productWisePagination?.page);
  }

  producWiseChangePage(page: number): void {
    this.productWisePagination.startIndex = (page - 1) * this.productWisePagination.pageSize;
    this.productWisePagination.endIndex = (page - 1) * this.productWisePagination.pageSize + this.productWisePagination.pageSize;
    this.productWisePagination.page = page;
    this.updatePaginatedData();
  }
  updatePaginatedDataDefaultData(): void {
    this.defaultDataPaginationData = this.paginationService.paginate(this.defaultData, this.defaultDataPagination?.pageSize, this.defaultDataPagination?.page);
  }

  DefaultDataChangePage(page: number): void {
    this.defaultDataPagination.startIndex = (page - 1) * this.defaultDataPagination.pageSize;
    this.defaultDataPagination.endIndex = (page - 1) * this.defaultDataPagination.pageSize + this.defaultDataPagination.pageSize;
    this.defaultDataPagination.page = page;
    this.updatePaginatedDataDefaultData();
  }


  updatePaginatedNewDataDefaultData(): void {
    this.newDefaultDataPaginationData = this.paginationService.paginate(this.newDefaultTableData, this.newDefaultDataPagination?.pageSize, this.newDefaultDataPagination?.page);
  }

  // Facilities_FromLenders popup
  Facilities_FromLenders_popup(): void {
    const dialogRef = this.dialog.open(FacilitiesFromLendersComponent,
      { data: this.mainTypeWiseBelowSixMonthProductDetails, panelClass: ['popupMain_design'],autoFocus: false }
    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  // FileUploadStatus_popup(): void {
  //   const dialogRef = this.dialog.open(BulkUploadSuccessFullyComponent, {
  //     data: this,
  //     panelClass: ['popupMain_design'],
  //     autoFocus: false,
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }

  toggleSortNewDefaultData(column: string, dontCallApi?: boolean,pagination?:any) {
    this.currentSortField1 = column;
    // Toggle sort direction if same column, otherwise set to ASC
    if (this.currentSortField === column) {
      if(!pagination){
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
      }
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }

    // Only sort locally if dontCallApi is true
    if (dontCallApi) {
      this.sortLocalData();
    }
  }

  sortLocalData(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;

    const dataToSort = this.isProductWiseField(sortField)
      ? this.productWisePaginationData
      // : this.newDefaultTableData;
      : this.filteredData;

    dataToSort.sort((a, b) => {
      const valueA = a[sortField] ?? '';
      const valueB = b[sortField] ?? '';

      if (this.isNumericField(sortField)) {
        const numA = typeof valueA === 'string' ? parseFloat(valueA.replace(/[^0-9.-]/g, '')) || 0 : valueA;
        const numB = typeof valueB === 'string' ? parseFloat(valueB.replace(/[^0-9.-]/g, '')) || 0 : valueB;
        return sortDirection === 'ASC' ? numA - numB : numB - numA;
      }

      if (this.isDateField(sortField)) {
        const dateA = new Date(valueA).getTime();
        const dateB = new Date(valueB).getTime();
        return sortDirection === 'ASC' ? dateA - dateB : dateB - dateA;
      }

      const comparison = valueA.toString().localeCompare(valueB.toString());
      return sortDirection === 'ASC' ? comparison : -comparison;
    });

    // Update the view
    if (this.isProductWiseField(sortField)) {
      this.productWisePaginationData = [...dataToSort];
    } else {
      //  if (!this.commonService.isObjectNullOrEmpty([...dataToSort])) {
        // this.newDefaultDataPaginationData = this.paginationService.paginate([...dataToSort], this.newDefaultDataPagination?.pageSize, this.newDefaultDataPagination?.page);
        // this.filteredData = [...dataToSort];
        this.updatePagination()
        this.calculateTotalsForOverdue();
      // }
      // this.newDefaultDataPaginationData = [...dataToSort];
    }
  }

  private isNumericField(field: string): boolean {
    const numericFields = [
      'noOfCreditFacility', 'utilizationOther', 'utilizationHsbc',
      'sanctionedAmountHsbc', 'sanctionedAmountOther', 'overdue',
      'writtenOff', 'settled', 'suitFiled'
    ];
    return numericFields.includes(field);
  }

  private isDateField(field: string): boolean {
    return field === 'dateOfReport';
  }

  private isProductWiseField(field: string): boolean {
    const productWiseFields = [
      'sanctionedAmountHsbc', 'sanctionedAmountOther'
    ];
    return productWiseFields.includes(field);
  }

  toggleSort(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if (dontCallApi && this.currentSortField === 'product') {
      this.getSortedProduct();
    }
    if(dontCallApi && this.currentSortField==("noOfCreditFacility")){
      this.getSortednoOfCreditFacility();
    }
    if(dontCallApi && this.currentSortField==("utilizationOther")){
      this.getSortedutilizationOther();
    }
    if(dontCallApi && this.currentSortField==("utilizationHsbc")){
      this.getSortedutilizationHsbc();
    }
    if(dontCallApi && this.currentSortField==("sanctionedAmountHsbc")){
      this.getSortedsanctionedAmountHsbc();
    }
    if(dontCallApi && this.currentSortField==("sanctionedAmountOther")){
      this.getSortedsanctionedAmountOther();
    }
    if(dontCallApi && this.currentSortField==("sanctionBy")){
      this.getSortedSanctionBy();
    }
    if(dontCallApi && this.currentSortField==("utilizationBy")){
      this.getSortedUtilizationBy();
    }
  }  

  getSortedProduct(): void {
  const sortField = this.currentSortField;
  const sortDirection = this.sortDirection;

  this.productWisePaginationData.sort((a, b) => {
    const valueA = (a[sortField] || '').toLowerCase();
    const valueB = (b[sortField] || '').toLowerCase();
    return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  }

  getSortednoOfCreditFacility():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedutilizationOther():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedutilizationHsbc():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedsanctionedAmountHsbc():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedsanctionedAmountOther():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.productWisePaginationData = this.productWisePaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }


  getSortedFacilityType():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedMember():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedAssetClassification():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedStatus():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedLastRepotedDate():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedOverdue():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedSuitField():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedWrittenOff():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedSettled():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedDerogInfo():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.newDefaultDataPaginationData = this.newDefaultDataPaginationData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }
  getSortedSanctionBy(): void {
  const sortField = this.currentSortField;
  const sortDirection = this.sortDirection;

  this.productWisePaginationData.sort((a, b) => {
    const valueA = (a[sortField] || '').toLowerCase();
    const valueB = (b[sortField] || '').toLowerCase();
    return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  }
  getSortedUtilizationBy(): void {
  const sortField = this.currentSortField;
  const sortDirection = this.sortDirection;

  this.productWisePaginationData.sort((a, b) => {
    const valueA = (a[sortField] || '').toLowerCase();
    const valueB = (b[sortField] || '').toLowerCase();
    return sortDirection === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  }

  // Products_ForeignCurrencies popup
  Products_ForeignCurrencies_popup(): void {
    const dialogRef = this.dialog.open(ProductsForeignCurrenciesComponent,
      { panelClass: ['popupMain_design'], }
    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  navBack(){
    this.router.navigate(['/hsbc/rmCommercialBureau'],{state: { data: this.pageData }});
  }

  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.COMMERCIAL_BUREAU2 || this.pageData?.subpageId == Constants.pageMaster.COMMERCIAL_BUREAU) {
      for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
          res = true; // Return true if found
        }
      }
    } else {
      if (!res) {
        this.pageData?.subSubpages.forEach(masterPage => {
          if (masterPage?.subpageId == Constants.pageMaster.ANALYTICS) {
            masterPage?.subSubpages.forEach(page => {
              if (page?.subpageId == Constants.pageMaster.COMMERCIAL_BUREAU) {
                for (let subpage of page?.actions) {
                  if (subpage?.actionId === actionId) {
                    res = true; // Return true if found
                  }
                }
              }
            });
          }
        })
      }
    }
    return res; // Return false if not found
  }

  protected readonly consValue = Constants;

  calculateTotalsForOverdue(): void {
    this.totalOverdue = this.filteredData.reduce((sum, item) => {
      const overdueValue = typeof item?.overdue === 'number' ? item?.overdue : 0;
      return sum + overdueValue;
    }, 0);

    this.totalsuitfiled = this.filteredData.reduce((sum, item) => {
      const suitfiled = typeof item?.suitFiled === 'number' ? item?.suitFiled : 0;
      return sum + suitfiled;
    }, 0);

    this.totalWrittenOff = this.filteredData.reduce((sum, item) => {
      const wirttenOff = typeof item?.writtenOff === 'number' ? item?.writtenOff : 0;
      return sum + wirttenOff;
    }, 0);

    this.totalSettled = this.filteredData.reduce((sum, item) => {
      const settled = typeof item?.settled === 'number' ? item?.settled : 0;
      return sum + settled;
    }, 0);

  }


}

export interface byDefaultDataPaginationData {
  status: string;
  date: string;
  cfType: string;
  amount: string;
  member: string;
}

