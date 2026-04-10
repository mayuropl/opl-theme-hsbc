import { Component, HostListener, OnDestroy, signal } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Console } from 'console';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ValidationsService } from 'src/app/CommoUtils/common-services/validations.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
// import { Constants } from 'src/app/commonUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders, saveActivity} from "../../../../../../CommoUtils/global-headers";
import { isActionAvailable, isSubpageExists } from 'src/app/CommoUtils/subpage-permission.helpers';
import { PaginationService } from 'src/app/services/pagination.service';
@Component({
  selector: 'app-rmgstanalysis-view',
  templateUrl: './rmgstanalysis-view.component.html',
  styleUrl: './rmgstanalysis-view.component.scss'
})
export class RMGSTAnalysisViewComponent implements OnDestroy {
  profileVersionData: any;
  qtrPurchaseTrendPrev: any;
  QtrPurchaseCompare: any;
  QtrGrossMargin: any;
  grossMarginKey: any;
  exportYearQuarterData:any;
  salesCurrentYr: any;
  salesPrevYr: any;
  salesQtrQtrCompare: any;
  saleWithMoreThan5sList: any;
  cateWiseTurnover: any;
  turnover: any;
  dialogRef: any;
  turnoverWithoutComa: any;
  orignalValue: any;
  years: string[];
  selectedgstin: any;
  isTopFiveBuyerCurrentYearSort = true;
  topFiveBuyerSorting: string = "DESC";
  isTopSelletCurrentYearSort = true;
  topSellerSorting: string = "DESC";
  isHsnCurrentYearSort = true;
  hsnDataSorting: string = "DESC";
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  currentTabInd: any;
  prevTabInd: any;
  activeClick(arg0: any, _t32: any) {
    throw new Error('Method not implemented.');
  }
  isFirstTimeCall = true;
  selectedTabIndex: number;
  tabValue: number;
  mstId: any;
  detailId: any;
  analysisData: any = []
  purchaseData: any = []
  basicDetailsList: any = []
  gstWiseSalesAndPurchase:any = [];
  gstSummary:any = [];
  gstr9Data:any=[];
  invoiceCreditNoteLists:any=[];
  buyerDataList:any=[];
  financialYearSales: any = []
  lastTwoFinancialYear: any = []
  financialYearPurchase: any = []
  buyersSalesData = {}
  topFiveBuyerPag : PaginationSignal= new PaginationSignal();
  topFiftySalesPag : PaginationSignal= new PaginationSignal();
  hsnDataPag : PaginationSignal= new PaginationSignal();
  invoiceCreditNotePage: PaginationSignal= new PaginationSignal();
  buyerDataListPage: PaginationSignal= new PaginationSignal();
  hsnData:any = []
  queryParams: any;
  gstin: any;
  gstInList: any = []
  activateGst: any;
  qtrpurchase: any = [];
  qtrPurchaseTrendCurr: any = [];
  qtrTot = 'Quater Total';
  tot = 'Year Total';
  exPagination: PaginationSignal = new PaginationSignal();
  pageOfItems: Array<any>;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  pages = 10;
  scrolled: boolean = false;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 },]
  pageData:any;
  constants:any;
  protected readonly consValue = Constants;
  gstinAnalysisMap = {};
  collapsedList: false;
  hidden:false;
  // top50sellerYear;
  // top50BuyerYear;
  // hsnTableYear;
  // buyerCurrentYear;
  // buyerPreviousYear;
  constructor(private router: Router,
    public dialog: MatDialog, private formBuilder: UntypedFormBuilder, private validationsService: ValidationsService,
    public msmeService: MsmeService, public commonService: CommonService, private loaderService: LoaderService, private route: ActivatedRoute) {
    //  this.queryParams = this.route.snapshot.queryParams;
    //  this.mstId =this.commonService.toATOB(this.queryParams.mstId)
    //  this.mstId =this.commonService.toATOB(this.queryParams.mstId)
  }

  toATOB(value: string) {
    try {
      return atob(value);
    } catch (err) {
      console.log('error while atob convert');
    }
  }
      // mat tab header fixed S
      @HostListener('window:scroll', [])
      onWindowScroll() {
        this.scrolled = window.scrollY > 100;
      }
      // mat tab header fixed S
  ngOnInit(): void {
    this.constants = Constants;
    if (history?.state?.data) {
       this.pageData = history?.state?.data;
      resetGlobalHeaders();
      GlobalHeaders['x-path-url'] = '/hsbc/rmGSTAnalysisView';
      GlobalHeaders['x-main-page'] = 'GST Analysis';
     }
     if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS,this.consValue.pageMaster.GST_ANALYSIS)
    }
    this.mstId = this.commonService.getStorage(Constants.httpAndCookies.ANALYSIS_MASTER_ID, true);
    this.getGSTINList();
    // this.getAnalysisData();
    console.log(this.financialYearSales);

  }

  extractFirstThreeYears(data: any): any[] {
    const keys = Object.keys(data).slice(0, 3);
    return keys.map(key => ({ key, value: data[key] }));
  }

  getGSTINList(isCalledFromInterval?) {
    let formData = {}
    formData['refId'] = this.mstId;
    let isAllFetched = true;
    this.msmeService.getGSTINListByMstID(formData, true, isCalledFromInterval).subscribe((response: any) => {
      console.log("gstin List is");
      this.gstInList = [];
      let isCons:boolean = false;
      if (response?.data?.length > 0) {
        let filteredList = [] ;
        response?.data.forEach(gst => {
          if(gst.gstin == "Consolidated GST Analysis" && this.commonService.isSubpageIsAvailable(this.pageData,this.consValue.pageMaster.CONSOLIDATED_GST)){
            filteredList.push(gst)
            isCons = true;
          }else if(gst.gstin != "Consolidated GST Analysis" && this.commonService.isSubpageIsAvailable(this.pageData,this.consValue.pageMaster.INDIVIDUAL_GST)){
            filteredList.push(gst);
            if(!isCons){
              this.selectedgstin = gst.gstin;
            }
          }
         });
        filteredList.forEach(gstinData => {
          if (gstinData.isConsolidate || (gstinData.isOtpVerified == true && gstinData.mstId && gstinData.detailId)) {
            this.gstInList.push(gstinData);
            if(((isCalledFromInterval == undefined || !isCalledFromInterval) && gstinData.gstin == "Consolidated GST Analysis" && gstinData.calculationStatus == "Success")
             || (gstinData.calculationStatus == undefined || gstinData.calculationStatus == "Fail")) {
              this.getAnalysisData(gstinData.gstin, gstinData.detailId, false, true,true);
         //   } else if(this.selectedgstin == gstinData.gstin && gstinData.calculationStatus == "Success") {
            } else if(this.selectedgstin == gstinData.gstin && gstinData.calculationStatus == "Success") {
              this.getAnalysisData(gstinData.gstin, gstinData.detailId, false, false,true);
            }
          }
        });
      } else {
        this.commonService.warningSnackBar('No Verified GSTIN available')
      }
      if ((isCalledFromInterval == undefined || !isCalledFromInterval) && this.gstInList?.length > 0) {
        this.callGetStatusApiInInterval();
      //  this.selectedgstin = "Consolidated GST Analysis";
      //  this.selectedgstin = gstinData.gstin;
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    });
  }

  isInterValAlreadyCalled = false;
  private progressIntervalCalculation: any;
  callGetStatusApiInInterval2(){
    if(this.isInterValAlreadyCalled) {
      return;
    }
    setTimeout(() => {
      this.progressIntervalCalculation = setInterval(() => {
        this.isInterValAlreadyCalled = true;
        let pendingCount = 0;
        this.gstInList.forEach(element => {
          if(element.calculationStatus == undefined || element.calculationStatus == "Pending"){
            pendingCount = pendingCount+1;
          }
        });
        if (pendingCount == 0) {
          clearInterval(this.progressIntervalCalculation);
          this.isInterValAlreadyCalled = false;
        } else {
          this.getGSTINList(true)
        }
      }, 3000);
    }, 3000);
  }

  callGetStatusApiInInterval(){
    if(this.isInterValAlreadyCalled) {
      return;
    }
    setTimeout(() => {
      this.progressIntervalCalculation = setInterval(() => {
        this.isInterValAlreadyCalled = true;
        let pendingCount = 0;
        this.gstInList.forEach(element => {
          if(element.calculationStatus == undefined || element.calculationStatus == "Pending"){
            pendingCount = pendingCount+1;
          }
        });
        if (pendingCount == 0) {
          clearInterval(this.progressIntervalCalculation);
          this.isInterValAlreadyCalled = false;
        } else {
          this.getGSTINList(true)
        }
      }, 10000);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.progressIntervalCalculation) {
      clearInterval(this.progressIntervalCalculation);
    }
  }

  checkStatusGstCalculationStatus(isFromCondition, gstin?: any, detailId?, i?){
    if(isSubpageExists(this.pageData,this.consValue.pageMaster.INDIVIDUAL_GST) || isSubpageExists(this.pageData,this.consValue.pageMaster.CONSOLIDATED_GST)){
      if(gstin) {
        this.selectedgstin = gstin;
      }
      let isFetched = false;
      this.gstInList.forEach(element => {
        if(this.selectedgstin == element.gstin && element.calculationStatus=="Success") {
          isFetched = true;
        }
      });

      if(!isFromCondition && isFetched) {
        if(i == 0){
          GlobalHeaders['x-sub-page'] = 'Consolidated GST Analysis';
        }else{
          GlobalHeaders['x-sub-page'] = 'GSTIN - '+gstin;
        }
        this.getAnalysisData(gstin,detailId);
        this.prevTabInd = this.currentTabInd;
        this.currentTabInd=i;
        console.log(this.prevTabInd);
        console.log(this.currentTabInd);
      }
      return isFetched;
    }else{
      return true;
    }


  }

  getAnalysisData(gstin?: any, detailId?: any,isSalesChange?:Boolean, isFirstCall?,dontUseMap?:Boolean ) {
    GlobalHeaders['x-page-action'] = 'Fetching Gst Data';
    // if (isSalesChange || isFirstCall) {
    //   this.selectedgstin = "Consolidated GST Analysis";
    // } else {
    //   this.selectedgstin = gstin;
    // }
    this.selectedgstin = gstin;

    if(isSalesChange ){
      this.gstinAnalysisMap = {};
    }else if(dontUseMap){
      this.gstinAnalysisMap[this.selectedgstin] = null;
    }
    // else if ( this.selectedgstin == "Consolidated GST Analysis" && isSalesChange== undefined && detailId==undefined
    //    && isFirstCall==undefined && dontUseMap==undefined){
    //     this.gstinAnalysisMap[this.selectedgstin] = null;
    // }

    if(!isSalesChange && this.gstinAnalysisMap[this.selectedgstin]  ){

      this.analysisData = this.gstinAnalysisMap[this.selectedgstin]["analysisData"];
      this.gstSummary = this.gstinAnalysisMap[this.selectedgstin]["gstSummary"];
      this.gstr9Data = this.gstinAnalysisMap[this.selectedgstin]["gstr9Data"];
      this.gstWiseSalesAndPurchase = this.gstinAnalysisMap[this.selectedgstin]["gstWiseSalesAndPurchase"];
      // this.gstSummary = this.gstinAnalysisMap[this.selectedgstin]["gstSummary"];

      this.basicDetailsList  = this.gstinAnalysisMap[this.selectedgstin]["basicDetailsList"];
      this.turnover  = this.gstinAnalysisMap[this.selectedgstin]["turnover"];
      this.salesCurrentYr  = this.gstinAnalysisMap[this.selectedgstin]["salesCurrentYr"];
      this.salesQtrQtrCompare  = this.gstinAnalysisMap[this.selectedgstin]["salesQtrQtrCompare"];
      this.salesPrevYr  = this.gstinAnalysisMap[this.selectedgstin]["QtrToQtrSalesPrev"];
      this.hsnData  = this.gstinAnalysisMap[this.selectedgstin]["hsnData"];
      if (this.analysisData?.hsnSalesData) {
      this.hsnDataPag.totalSize = this.hsnData.length;
      }

      this.buyersSalesData  = this.gstinAnalysisMap[this.selectedgstin]["buyersSalesData"];
      this.qtrpurchase  = this.gstinAnalysisMap[this.selectedgstin]["qtrpurchase"];
      this.qtrPurchaseTrendCurr  = this.gstinAnalysisMap[this.selectedgstin]["qtrPurchaseTrendCurr"];
      this.qtrPurchaseTrendPrev  = this.gstinAnalysisMap[this.selectedgstin]["qtrPurchaseTrendPrev"];
      this.QtrPurchaseCompare  = this.gstinAnalysisMap[this.selectedgstin]["QtrPurchaseCompare"];
      this.grossMarginKey  = this.gstinAnalysisMap[this.selectedgstin]["grossMarginKey"];
      this.saleWithMoreThan5sList  = this.analysisData.top50sellerYear ==0 ?  this.gstinAnalysisMap[this.selectedgstin]["saleWithMoreThan5sList"] : this.gstinAnalysisMap[this.selectedgstin]["saleWithMoreThan5sListPrev"];
      this.topFiftySalesPag.totalSize = this.saleWithMoreThan5sList != 'undefined' && this.saleWithMoreThan5sList != 'null'?this.saleWithMoreThan5sList.length:0
      this.purchaseData = this.analysisData.purchaseData;
      this.purchaseData.saleWithMoreThan5sList = this.saleWithMoreThan5sList;
      this.sortTopFiftySalesList(this.topSellerSorting,this.analysisData?.purchaseData,true,"concCY");
     
      this.invoiceCreditNoteLists  = this.gstinAnalysisMap[this.selectedgstin]["invoiceCreditNoteLists"];
      this.invoiceCreditNotePage.totalSize=this.invoiceCreditNoteLists.length
      this.buyerDataList  = this.gstinAnalysisMap[this.selectedgstin]["buyerDataList"];
      this.buyerDataListPage.totalSize = this.buyerDataList.length;
      this.exportYearQuarterData  = this.gstinAnalysisMap[this.selectedgstin]["exportYearQuarterData"];
    
      if (this.analysisData?.salesData?.monthlyCategoryWise) {
      this.cateWiseTurnover  = this.gstinAnalysisMap[this.selectedgstin]["cateWiseTurnover"];
      this.extractYears();
      }
      if(this.selectedgstin == 'Consolidated GST Analysis'){
        GlobalHeaders['x-sub-page'] = 'Consolidated GST Analysis';
      }else{
        GlobalHeaders['x-sub-page'] = 'GSTIN - '+gstin;
      }
      saveActivity(() => {});
      return ;
    }

    let formData = {}
    formData['refId'] = this.mstId;
    formData['detailId'] = detailId;
    formData['gstIn'] = gstin != 'Consolidated GST Analysis' ? gstin : null;
    formData['isCalledFromSalesChange'] = (isSalesChange!= undefined && isSalesChange) ? true : false;
    // this.gstInList = [];
    this.hsnData = [];
    this.buyersSalesData = [];
    this.lastTwoFinancialYear = [];
    this.msmeService.getgstAnalysisData(formData,isFirstCall).subscribe((response: any) => {
      console.log(response);
      if (response?.status === 200) {
        let gstAnalysis = {};
         // GstAnalysis ={searchValue:'', optionFilter:[], selectedFilter:[]};
        //searchByAnchorPagntn: GstAnalysis = new GstAnalysis();
        //  a = {};
        this.analysisData = response?.data?.map;
        gstAnalysis["analysisData"] = response?.data?.map
        this.basicDetailsList = response?.data?.basicDetailsList;
        gstAnalysis["basicDetailsList"] = response?.data?.basicDetailsList;
        console.log("Response ===",response?.data);
        this.gstWiseSalesAndPurchase = response?.data?.salesAndPurchaseTotal;
        gstAnalysis["gstWiseSalesAndPurchase"] = response?.data?.salesAndPurchaseTotal;

        console.log(this.gstWiseSalesAndPurchase);

        this.exPagination.totalSize = this.basicDetailsList.length;
        this.exPagination.totalSize = this.basicDetailsList.length;
        gstAnalysis["exPagination.totalSize"] =this.basicDetailsList.length;
        if(this.analysisData && this.analysisData.GSTInStatus && this.analysisData.GSTInStatus.noActiveGstIn){
          gstAnalysis["GSTInStatus.noOfCancelledGSTIN"] = Number(this.analysisData?.GSTInStatus?.noOfCancelledGSTIN);
          gstAnalysis["GSTInStatus.noActiveGstIn"] =  Number(this.analysisData?.GSTInStatus?.noActiveGstIn);
          this.analysisData.GSTInStatus.noOfCancelledGSTIN = Number(this.analysisData?.GSTInStatus?.noOfCancelledGSTIN);
          this.analysisData.GSTInStatus.noActiveGstIn = Number(this.analysisData?.GSTInStatus?.noActiveGstIn);
        }

        if(this.analysisData && this.analysisData.GSTInStatus && this.analysisData.GSTInStatus.noActiveGstIn){
          this.analysisData.GSTInStatus.noOfCancelledGSTIN = Number(this.analysisData?.GSTInStatus?.noOfCancelledGSTIN);
          this.analysisData.GSTInStatus.noActiveGstIn = Number(this.analysisData?.GSTInStatus?.noActiveGstIn);
        }

        if (this.analysisData?.salesData?.fYearAvailable) {
          this.financialYearSales = JSON.parse(this.analysisData?.salesData?.fYearAvailable);
          this.lastTwoFinancialYear.push({value:0,year:this.financialYearSales[0]});
          this.lastTwoFinancialYear.push({value:1,year:this.financialYearSales[1]});
          // this.financialYearSales = this.analysisData?.salesData?.fYearAvailable;
          console.log(this.financialYearSales);

        }

        this.analysisData['top50sellerYear']=0;
        this.analysisData['top50BuyerYear']=0;
        this.analysisData['hsnTableYear']=0;
        this.analysisData['buyerCurrentYear']=0;
        this.analysisData['buyerPreviousYear']=0;
        if (this.analysisData?.purchaseData?.fYearAvailable) {
         // this.financialYearPurchase = JSON.parse(this.analysisData?.purchaseData?.fYearAvailable);
          this.financialYearPurchase = this.analysisData?.purchaseData?.fYearAvailable;

        }
        if (this.analysisData?.salesData?.turnOver) {
          this.turnover = JSON.parse(this.analysisData?.salesData?.turnOver);
          gstAnalysis["turnover"] = JSON.parse(this.analysisData?.salesData?.turnOver);
        }
        if (this.analysisData?.salesData?.projQtrCompare) {
          this.salesCurrentYr = JSON.parse(this.analysisData?.salesData?.projQtrCompare);
          gstAnalysis["salesCurrentYr"] = JSON.parse(this.analysisData?.salesData?.projQtrCompare);
        }

        if (this.analysisData?.salesData?.monthlyCategoryWise) {
          this.cateWiseTurnover = JSON.parse(this.analysisData?.salesData?.monthlyCategoryWise);
          this.extractYears();

          gstAnalysis["cateWiseTurnover"] = JSON.parse(this.analysisData?.salesData?.monthlyCategoryWise);

        }

        if (this.analysisData?.salesData?.QtrToQtrSalesPrev) {
          this.salesPrevYr = JSON.parse(this.analysisData?.salesData?.QtrToQtrSalesPrev);
          gstAnalysis["QtrToQtrSalesPrev"] = JSON.parse(this.analysisData?.salesData?.QtrToQtrSalesPrev);
        }

        if (this.analysisData?.salesData?.QtrToQtrCompareSales) {
          this.salesQtrQtrCompare = JSON.parse(this.analysisData?.salesData?.QtrToQtrCompareSales)
          gstAnalysis["salesQtrQtrCompare"] = JSON.parse(this.analysisData?.salesData?.QtrToQtrCompareSales);

        }

        if (this.analysisData?.purchaseData) {
          this.qtrpurchase = JSON.parse(this.analysisData?.purchaseData.quaterlyPurchase);
          this.qtrPurchaseTrendCurr = JSON.parse(this.analysisData?.purchaseData?.qtrPurchaseTrendCurr)
          //    this.qtrPurchaseTrendPrev = JSON.parse(this.analysisData?.purchaseData?.qtrPurchaseTrendPrev)
          this.qtrPurchaseTrendPrev = JSON.parse(this.analysisData?.purchaseData?.qtrPurchaseTrendPrev)
          if(this.analysisData?.purchaseData?.QtrPurchaseCompare){

            this.QtrPurchaseCompare = JSON.parse(this.analysisData?.purchaseData?.QtrPurchaseCompare)
            gstAnalysis["QtrPurchaseCompare"] = JSON.parse(this.analysisData?.purchaseData?.QtrPurchaseCompare);
          }
          this.grossMarginKey = JSON.parse(this.analysisData?.purchaseData?.QtrlyGross);
          this.saleWithMoreThan5sList = JSON.parse(this.analysisData?.purchaseData?.saleWithMoreThan5sList);

          gstAnalysis["qtrpurchase"] = JSON.parse(this.analysisData?.purchaseData?.quaterlyPurchase);
          gstAnalysis["qtrPurchaseTrendCurr"] = JSON.parse(this.analysisData?.purchaseData?.qtrPurchaseTrendCurr);
          gstAnalysis["qtrPurchaseTrendPrev"] = JSON.parse(this.analysisData?.purchaseData?.qtrPurchaseTrendPrev);

          gstAnalysis["grossMarginKey"] = JSON.parse(this.analysisData?.purchaseData?.QtrlyGross);
          this.exportYearQuarterData=response?.data?.exportYearQuarterData;
          gstAnalysis["exportYearQuarterData"] = this.exportYearQuarterData;
          gstAnalysis["saleWithMoreThan5sList"] = JSON.parse(this.analysisData?.purchaseData?.saleWithMoreThan5sList);
          const rawData = this.analysisData?.purchaseData?.saleWithMoreThan5sListPrev;
           gstAnalysis["saleWithMoreThan5sListPrev"] = rawData ? JSON.parse(rawData) : [];
          gstAnalysis["purchaseData"]=this.analysisData?.purchaseData;

        }


        if (this.analysisData?.buyersSalesData) {
          var buyersSalesData = this.analysisData?.buyersSalesData;

          this.sortTopFiftyListInitial(this.topFiveBuyerSorting,buyersSalesData,true,"currentYearConcentration");
          // this.buyersSalesData['topFiveBuyer'] = JSON.parse(buyersSalesData['topFiveBuyer']);
          // let entries = Object.entries(this.buyersSalesData['topFiveBuyer']);
          // entries.sort(([, a], [, b]) => b["currentYearConcentration"] - a["currentYearConcentration"]);
          // this.buyersSalesData['topFiveBuyer'] = [];
          // for (const [key, value] of entries) {
          //   this.buyersSalesData['topFiveBuyer'].push(value);
          // }
          this.topFiveBuyerPag.totalSize=this.buyersSalesData['topFiveBuyer'].length;

          if(this.analysisData?.buyersSalesData?.BuyerWiseList){
            this.buyersSalesData['BuyerWiseList'] = JSON.parse(buyersSalesData['BuyerWiseList']);
          }
          this.buyersSalesData['currentYearTotalAmount'] = JSON.parse(buyersSalesData['currentYearTotalAmount']);
          if(buyersSalesData['previousYearTotalAmount']){

            this.buyersSalesData['previousYearTotalAmount'] = JSON.parse(buyersSalesData['previousYearTotalAmount']);
          }
          this.buyersSalesData['PreviousYearBuyerAvailable'] = JSON.parse(buyersSalesData['PreviousYearBuyerAvailable']);
          let previousYearBuyerEntries = Object.entries(this.buyersSalesData['PreviousYearBuyerAvailable']);
          previousYearBuyerEntries.sort(([, a], [, b]) => Number(b["ttlValLst"]) - Number(a["ttlValLst"]));
          this.buyersSalesData['PreviousYearBuyerAvailable'] = previousYearBuyerEntries.map(([key, value]) => value);

          // this.buyersSalesData['PreviousYearBuyerAvailablePrev'] = JSON.parse(buyersSalesData['PreviousYearBuyerAvailablePrev']);
          // let previousYearBuyerPrevEntries = Object.entries(this.buyersSalesData['PreviousYearBuyerAvailablePrev']);
          // previousYearBuyerPrevEntries.sort(([, a], [, b]) => Number(b["ttlValLst"]) - Number(a["ttlValLst"]));
          // this.buyersSalesData['PreviousYearBuyerAvailablePrev'] = previousYearBuyerPrevEntries.map(([key, value]) => value);
          const rawPrevYear = buyersSalesData['PreviousYearBuyerAvailablePrev'];
          this.buyersSalesData['PreviousYearBuyerAvailablePrev'] = rawPrevYear ? JSON.parse(rawPrevYear) : [];
        
          let previousYearBuyerPrevEntries = Object.entries(this.buyersSalesData['PreviousYearBuyerAvailablePrev'] || {});
          
          previousYearBuyerPrevEntries.sort(([, a], [, b]) => Number(b["ttlValLst"] || 0) - Number(a["ttlValLst"] || 0));
        
          this.buyersSalesData['PreviousYearBuyerAvailablePrev'] = previousYearBuyerPrevEntries.map(([_, value]) => value);
          this.buyersSalesData['PreviousYearBuyerAvailableList'] = this.buyersSalesData['PreviousYearBuyerAvailable'];

          // this.buyersSalesData['CurrentYearBuyerAvailable'] = JSON.parse(buyersSalesData['CurrentYearBuyerAvailable']);
          // let CurrentYearBuyerEntries = Object.entries(this.buyersSalesData['CurrentYearBuyerAvailable']);
          // CurrentYearBuyerEntries.sort(([, a], [, b]) => Number(b["ttlVal"]) - Number(a["ttlVal"]));
          // this.buyersSalesData['CurrentYearBuyerAvailable'] = [];
          // for (const [key, value] of CurrentYearBuyerEntries) {
          //   this.buyersSalesData['CurrentYearBuyerAvailable'].push(value);
          // }

          // this.buyersSalesData['CurrentYearBuyerAvailablePrev'] = JSON.parse(buyersSalesData['CurrentYearBuyerAvailablePrev']);
          // let CurrentYearBuyerPrevEntries = Object.entries(this.buyersSalesData['CurrentYearBuyerAvailablePrev']);
          // CurrentYearBuyerPrevEntries.sort(([, a], [, b]) => Number(b["ttlVal"]) - Number(a["ttlVal"]));
          // this.buyersSalesData['CurrentYearBuyerAvailablePrev'] = [];
          // for (const [key, value] of CurrentYearBuyerPrevEntries) {
          //   this.buyersSalesData['CurrentYearBuyerAvailablePrev'].push(value);
          // }
          this.buyersSalesData['CurrentYearBuyerAvailable'] = this.getSortedCurrBuyer(JSON.parse(buyersSalesData['CurrentYearBuyerAvailable']));
        ///  this.buyersSalesData['CurrentYearBuyerAvailablePrev'] = this.getSortedCurrBuyer(JSON.parse(buyersSalesData['CurrentYearBuyerAvailablePrev']));
        const rawCurrentYearBuyer = buyersSalesData['CurrentYearBuyerAvailablePrev'];
        const parsedCurrentYearBuyer = rawCurrentYearBuyer ? JSON.parse(rawCurrentYearBuyer) : [];
      
          this.buyersSalesData['CurrentYearBuyerAvailablePrev'] = this.getSortedCurrBuyer(parsedCurrentYearBuyer);
          this.buyersSalesData['newCurrentYearBuyerList']=this.buyersSalesData['CurrentYearBuyerAvailable'];

          this.buyersSalesData['topFiveBuyerList'] = this.buyersSalesData['topFiveBuyer'];
          gstAnalysis["buyersSalesData"] = this.buyersSalesData;
          this.gstSummary = response?.data?.gstSummary;
          gstAnalysis["gstSummary"] = response?.data?.gstSummary;

          this.gstr9Data=response?.data?.gstr9Data;
          gstAnalysis["gstr9Data"] = response?.data?.gstr9Data;

          this.invoiceCreditNoteLists=response?.data?.invoiceCreditNoteLists;
          this.invoiceCreditNotePage.totalSize=this.invoiceCreditNoteLists.length
          gstAnalysis["invoiceCreditNoteLists"] = this.invoiceCreditNoteLists;

          this.buyerDataList=response?.data?.buyerDataList;
          this.buyerDataListPage.totalSize=this.buyerDataList.length
          gstAnalysis["buyerDataList"] = this.buyerDataList;

          
      }
        if(this.analysisData?.purchaseData){
          var purchaseData = this.analysisData?.purchaseData;

          this.sortTopFiftySalesList(this.topSellerSorting,this.analysisData?.purchaseData,true,"concCY");
          // this.purchaseData['saleWithMoreThan5sList'] = JSON.parse(this.analysisData?.purchaseData?.saleWithMoreThan5sList);
          // let  saleWithMoreThan5sEntries = Object.entries(this.purchaseData['saleWithMoreThan5sList']);
          // saleWithMoreThan5sEntries.sort(([, a], [, b]) => b["concCY"] - a["concCY"]);
          // this.purchaseData['saleWithMoreThan5sList'] = [];
          // for (const [key, value] of saleWithMoreThan5sEntries) {
          //   this.purchaseData['saleWithMoreThan5sList'].push(value);
          // }
          this.topFiftySalesPag.totalSize = this.purchaseData['saleWithMoreThan5sList'].length;


        }

        // if (this.analysisData?.salesData?.fYearAvailable) {
        //   this.financialYearSales = JSON.parse(this.analysisData?.salesData?.fYearAvailable);
        // }
        // if (this.analysisData?.purchaseData?.fYearAvailable) {
        //   this.financialYearPurchase = JSON.parse(this.analysisData?.purchaseData?.fYearAvailable);
        // }

        if (this.analysisData?.hsnSalesData) {
          Object.keys(this.analysisData?.hsnSalesData).forEach((key) => {
            this.hsnData[key] = JSON.parse(this.analysisData?.hsnSalesData[key]);
          });
          this.hsnDataPag.totalSize = Object.keys(this.analysisData?.hsnSalesData).length;
        }
        let hsnDataEntries = Object.entries(this.hsnData);
        this.hsnData = [];
        for (const [key, value] of hsnDataEntries) {
          value["hsnCode"] = key;
          value["currentYearTotal"] = value["currentYearTotal"] ? value["currentYearTotal"] : 0;
          this.hsnData.push(value);
        }
        this.sortHsnData(this.hsnDataSorting,this.hsnData,"currentYearTotal");
        gstAnalysis["hsnData"] = this.hsnData;

        let hsnDataPrev = []
        if (this.analysisData?.hsnSalesDataPrev) {
          Object.keys(this.analysisData?.hsnSalesDataPrev).forEach((key) => {
            hsnDataPrev[key] = JSON.parse(this.analysisData?.hsnSalesDataPrev[key]);
          });
        }
        let hsnDataEntriesPrev = Object.entries(hsnDataPrev);
        hsnDataPrev = [];
        for (const [key, value] of hsnDataEntriesPrev) {
          value["hsnCode"] = key;
          value["currentYearTotal"] = value["currentYearTotal"] ? value["currentYearTotal"] : 0;
          hsnDataPrev.push(value);
        }
        this.sortHsnData(this.hsnDataSorting,hsnDataPrev,"currentYearTotal");
        gstAnalysis["hsnDataPrev"] = hsnDataPrev;

        //  this.turnover=this.extractFirstThreeYears(this.turnover);
        //  this.turnover=JSON.parse(this.turnover);
        console.log(this.turnover);

        this.gstinAnalysisMap[this.selectedgstin] = gstAnalysis;
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })
  }

  getSortedCurrBuyer(buyerList) {
    let CurrentYearBuyerEntries = Object.entries(buyerList);
    CurrentYearBuyerEntries.sort(([, a], [, b]) => Number(b["ttlVal"]) - Number(a["ttlVal"]));
    buyerList = [];
    for (const [key, value] of CurrentYearBuyerEntries) {
      buyerList.push(value);
    }
    return buyerList;
  }
  sortHsnData(sorting,data,sortField){
    if(sorting=='DESC'){
      this.hsnDataSorting = "DESC";
      data.sort((a, b) => b[sortField] - a[sortField]);
      // data.sort((a, b) => (b[sortField] ? Number(b[sortField]) : 0) - (a[sortField] ? Number(a[sortField]): 0));
    } else {
      this.hsnDataSorting = "ASC";
      data.sort((a, b) => a[sortField] - b[sortField]);
      // data.sort((a, b) => (a[sortField] ? Number(a[sortField]) : 0) - (b[sortField] ? Number(b[sortField]): 0));
    }
  }

  changeTableData(tableId) {
    // const gstinAnalysisMap:any = _.cloneDeep(this.gstinAnalysisMap);
    const gstinAnalysisMap = { ...this.gstinAnalysisMap };
    switch (tableId) {
      case 1:
        if (this.analysisData.top50BuyerYear==0) {
          this.buyersSalesData['topFiveBuyerList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['topFiveBuyer'];
        } else if (this.analysisData.top50BuyerYear==1) {
          this.buyersSalesData['topFiveBuyerList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['topFiveBuyerPrev'];
        }
        // this.isTopFiveBuyerCurrentYearSort=true;
        // this.topFiveBuyerSorting='DESC';
        this.sortTopFiftyList(this.topFiveBuyerSorting,this.buyersSalesData,false,this.isTopFiveBuyerCurrentYearSort ? 'currentYearConcentration' : 'previousYearConcentration');
        this.topFiveBuyerPag.totalSize=this.buyersSalesData['topFiveBuyerList'].length;
      break;
      case 2:
        if (this.analysisData.buyerCurrentYear==0) {
          this.buyersSalesData['newCurrentYearBuyerList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['CurrentYearBuyerAvailable'];
        } else if (this.analysisData.buyerCurrentYear==1) {
          this.buyersSalesData['newCurrentYearBuyerList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['CurrentYearBuyerAvailablePrev'];
        }
        this.toggleSort(this.currentSortField,true,this.currentTabInd, true);
      break;
      case 3:
        if (this.analysisData.buyerPreviousYear==0) {
          this.buyersSalesData['PreviousYearBuyerAvailableList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['PreviousYearBuyerAvailable'];
        } else if (this.analysisData.buyerPreviousYear==1) {
          this.buyersSalesData['PreviousYearBuyerAvailableList']=gstinAnalysisMap[this.selectedgstin].buyersSalesData['PreviousYearBuyerAvailablePrev'];
        }
        this.toggleSort(this.currentSortField,true,this.currentTabInd, true);
      break;
      case 4:
        if (this.analysisData.top50sellerYear==0) {
          this.purchaseData['saleWithMoreThan5sList']=gstinAnalysisMap[this.selectedgstin].saleWithMoreThan5sList;
        } else if (this.analysisData.top50sellerYear==1) {
          this.purchaseData['saleWithMoreThan5sList']=gstinAnalysisMap[this.selectedgstin].saleWithMoreThan5sListPrev;
        }
        this.sortTopFiftySalesList(this.topSellerSorting,this.purchaseData,false,this.isTopSelletCurrentYearSort ? 'concCY' : 'concPY');
        this.topFiftySalesPag.totalSize=this.purchaseData['saleWithMoreThan5sList'].length;
      break;
      case 5:
        if (this.analysisData.hsnTableYear==0) {
          this.hsnData=gstinAnalysisMap[this.selectedgstin].hsnData;
        } else if (this.analysisData.hsnTableYear==1) {
          this.hsnData=gstinAnalysisMap[this.selectedgstin].hsnDataPrev;
        }
        this.hsnDataPag.totalSize = this.hsnData.length;
        this.toggleSort(this.currentSortField,true,this.currentTabInd, true);
      break;
    }
  }
  sortTopFiftyListInitial(sorting,data,isParse,sortField){
    if(isParse){
      this.buyersSalesData['topFiveBuyer'] = JSON.parse(data['topFiveBuyer']);
      const rawTopFive = data['topFiveBuyerPrev'];
      this.buyersSalesData['topFiveBuyerPrev'] = rawTopFive ? JSON.parse(rawTopFive) : [];


    } else {
      this.buyersSalesData['topFiveBuyer'] = this.buyersSalesData['topFiveBuyer'];
      const rawTopFive = data['topFiveBuyerPrev'];
      this.buyersSalesData['topFiveBuyerPrev'] = rawTopFive ? JSON.parse(rawTopFive) : [];
    }
    let entries = Object.entries(this.buyersSalesData['topFiveBuyer']);
    if(sorting=='DESC'){
      this.topFiveBuyerSorting = "DESC";
      entries.sort(([, a], [, b]) => Number(b[sortField]) - Number(a[sortField]));
    } else {
      this.topFiveBuyerSorting = "ASC";
      entries.sort(([, a], [, b]) => Number(a[sortField]) - Number(b[sortField]));
    }

    this.buyersSalesData['topFiveBuyer'] = [];
    for (const [key, value] of entries) {
      this.buyersSalesData['topFiveBuyer'].push(value);
    }

    let entriesPrev = Object.entries(this.buyersSalesData['topFiveBuyerPrev']);
    if(sorting=='DESC'){
      this.topFiveBuyerSorting = "DESC";
      entriesPrev.sort(([, a], [, b]) => Number(b[sortField]) - Number(a[sortField]));
    } else {
      this.topFiveBuyerSorting = "ASC";
      entriesPrev.sort(([, a], [, b]) => Number(a[sortField]) - Number(b[sortField]));
    }

    this.buyersSalesData['topFiveBuyerPrev'] = [];
    for (const [key, value] of entriesPrev) {
      this.buyersSalesData['topFiveBuyerPrev'].push(value);
    }
  }

  sortTopFiftyList(sorting,data,isParse,sortField){
    if(isParse){
      this.buyersSalesData['topFiveBuyerList'] = JSON.parse(data['topFiveBuyerList']);
    } else {
      this.buyersSalesData['topFiveBuyerList'] = this.buyersSalesData['topFiveBuyerList'];
    }
    let entries = Object.entries(this.buyersSalesData['topFiveBuyerList']);
    if(sorting=='DESC'){
      this.topFiveBuyerSorting = "DESC";
      entries.sort(([, a], [, b]) => Number(b[sortField]) - Number(a[sortField]));
    } else {
      this.topFiveBuyerSorting = "ASC";
      entries.sort(([, a], [, b]) => Number(a[sortField]) - Number(b[sortField]));
    }

    this.buyersSalesData['topFiveBuyerList'] = [];
    for (const [key, value] of entries) {
      this.buyersSalesData['topFiveBuyerList'].push(value);
    }
  }

  // sortTopFiftySalesList(sorting,data,isParse,sortField){
  //   if (isParse) {
  //     this.purchaseData['saleWithMoreThan5sList'] = JSON.parse(data.saleWithMoreThan5sList);
  //   } else {
  //     this.purchaseData['saleWithMoreThan5sList'] = data.saleWithMoreThan5sList;
  //   }

  //   let saleWithMoreThan5sEntries = Object.entries(this.purchaseData['saleWithMoreThan5sList']);

  //   if(sorting=='DESC'){
  //     this.topSellerSorting = "DESC";
  //     saleWithMoreThan5sEntries.sort(([, a], [, b]) => Number(b[sortField]) - Number(a[sortField]));
  //   } else {
  //     this.topSellerSorting = "ASC";
  //     saleWithMoreThan5sEntries.sort(([, a], [, b]) => Number(a[sortField]) - Number(b[sortField]));
  //   }
  //   // saleWithMoreThan5sEntries.sort(([, a], [, b]) => b["concCY"] - a["concCY"]);
  //   this.purchaseData['saleWithMoreThan5sList'] = [];
  //   for (const [key, value] of saleWithMoreThan5sEntries) {
  //     this.purchaseData['saleWithMoreThan5sList'].push(value);
  //   }
  // }

  sortTopFiftySalesList(sorting, data, isParse, sortField) {
    let saleListRaw = data.saleWithMoreThan5sList;
  
    if (isParse && typeof saleListRaw === 'string') {
      try {
        this.purchaseData['saleWithMoreThan5sList'] = JSON.parse(saleListRaw);
      } catch (e) {
        console.error("Invalid JSON in saleWithMoreThan5sList:", e);
        this.purchaseData['saleWithMoreThan5sList'] = [];
      }
    } else if (Array.isArray(saleListRaw) || typeof saleListRaw === 'object') {
      this.purchaseData['saleWithMoreThan5sList'] = saleListRaw;
    } else {
      this.purchaseData['saleWithMoreThan5sList'] = [];
    }
  
    // Now it's always a valid array
    let saleWithMoreThan5sEntries = Object.entries(this.purchaseData['saleWithMoreThan5sList']);
  
    if (sorting === 'DESC') {
      this.topSellerSorting = "DESC";
      saleWithMoreThan5sEntries.sort(([, a], [, b]) => Number(b[sortField] || 0) - Number(a[sortField] || 0));
    } else {
      this.topSellerSorting = "ASC";
      saleWithMoreThan5sEntries.sort(([, a], [, b]) => Number(a[sortField] || 0) - Number(b[sortField] || 0));
    }
  
    this.purchaseData['saleWithMoreThan5sList'] = saleWithMoreThan5sEntries.map(([_, value]) => value);
  }
  

  // Nikul Add NGX-Slider Start
  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    dots: false,
    infinite: false,
    // initialSlide: 1,
    // "nextArrow": "<div class='nav-btn next-slide'></div>",
    // "prevArrow": "<div class='nav-btn prev-slide'></div>",
    arrows: true,
    margin: 10,
    mobileFirst: false,
    respondTo: 'window',
    swipeToSlide: false,
    rows: 1,
    // cssEase: 'linear',
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: true,
        }
      },
      {
        breakpoint: 620,
        settings: {
          slidesToShow: 2,
          arrows: true,
        }
        // settings: "unslick" // destroys slick
      },
      {
        breakpoint: 515,
        settings: {
          slidesToShow: 1,
          arrows: true,
        }
        // settings: "unslick" // destroys slick
      }
    ]

  };

  slickInit(e) {
    console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }
  // Nikul Add NGX-Slider End

  compareFn(a: { key: string }, b: { key: string }): number {
    return b.key.localeCompare(a.key); // Compare in descending order
  }

  extractPanFromGstin(gstin: string): string {
    if (gstin && gstin.length >= 12) {
      return gstin.substring(2, 12); // Extract characters 3 to 11 (0-based index)
    }
    return '';
  }

  isListIncludeItem(mainList, item) {
    return mainList.includes(item);
  }

  isNumber(myVar) {
    if (!isNaN(myVar) && myVar != 0) {
      return true;
    } else {
      return false;
    }
  }

  extractYears() {
    this.years = Object.keys(this.cateWiseTurnover)
      .reverse()
      .sort((a, b) => b.localeCompare(a)) // Sort years in descending order
      ; // Reverse to make it descending
    // Take only the top 3 years
  }

  getData(category: any, year: any): string {
    if (this.cateWiseTurnover && this.cateWiseTurnover[year]) {
      const turnoverForYear = this.cateWiseTurnover[year];
      let cat = category;
      let turnoverForCategory;
      // if (cat === "B2C") {
      //   turnoverForCategory = turnoverForYear.B2C;
      // } 
      if (cat === "B2B") {
        turnoverForCategory = turnoverForYear.B2B;
      } if (cat === "B2CL") {
        turnoverForCategory = turnoverForYear.B2CL;
      } if (cat === "Export") {
        turnoverForCategory = turnoverForYear.Export;
      } 
      if (cat === "B2CS") {
        turnoverForCategory = turnoverForYear.B2CS;
      }
      // if (cat === "B2ESS") {
      //   turnoverForCategory = turnoverForYear.B2ESS;
      // }
      // if (cat === "Export") {
      //   turnoverForCategory = turnoverForYear.Export;
      // }
      if (cat === "NonGst") {
        turnoverForCategory = turnoverForYear["NonGSTOutwardsupply"];
      }
      if (cat === "ExemptedGood") {
        turnoverForCategory = turnoverForYear["Exemptedgoods"];
      }
      if (cat === "NillRated") {
        turnoverForCategory = turnoverForYear["Nilratedgoods"];
      }

      if (turnoverForCategory !== undefined) {
        return parseFloat(turnoverForCategory).toFixed(2); 
      } else {
        return "0.00";
      }
    } else {
      return "0.00";
    }
  }

  toggleSort(column: string, dontCallApi?: boolean, currentTabIndex?: any, isFromTs?){
    if(!isFromTs) {
      if (this.currentSortField === column) {
        this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
      } else {
        this.currentSortField = column;
        this.sortDirection = 'ASC';
      }
    }
    
    if(dontCallApi && this.currentSortField==("regDt")){
      this.getSortedDataForRegDate();
    }
    else if(dontCallApi && this.currentSortField==("reportDate")){
      this.getSortedForreportedDate();
    }
    else if(dontCallApi && this.currentSortField==("previousYearTotalAvg")){
      this.getSortedForPreLastYear();
    }
    else if(dontCallApi && this.currentSortField==("currentYearTotalAvg")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForTotalAvg();
    }
    else if(dontCallApi && this.currentSortField==("previousYearTotal")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForPrevTotal();
    }
    else if(dontCallApi && this.currentSortField==("currentYearTotal")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForCurTotal();
    }
    else if(dontCallApi && this.currentSortField==("noOfInvoiceLst")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedFornoOfInvoiceLst();
    }
    else if(dontCallApi && this.currentSortField==("ttlValLst")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForttlValLst();
    }
    else if(dontCallApi && this.currentSortField==("noOfInvoice")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedFornoOfInvoice();
    }
    else if(dontCallApi && this.currentSortField==("ttlVal")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForttlVal();
    }
    else if(dontCallApi && this.currentSortField==("currentYearAvg")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForcurrentYearAvg();
    }
    else if(dontCallApi && this.currentSortField==("previousYearAvg")){
      this.prevTabInd = this.currentTabInd;
      this.getSortedForPrevYearAvg();
    }
  }

  getSortedForPrevYearAvg():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.buyersSalesData['PreviousYearBuyerAvailableList'] = this.buyersSalesData['PreviousYearBuyerAvailableList'].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForcurrentYearAvg():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.buyersSalesData['newCurrentYearBuyerList'] = this.buyersSalesData['newCurrentYearBuyerList'].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }


  getSortedForttlVal():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.buyersSalesData['newCurrentYearBuyerList'] = this.buyersSalesData['newCurrentYearBuyerList'].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });

  }

  getSortedFornoOfInvoice():void{
      const sortField = this.currentSortField;
      const sortDirection = this.sortDirection;
      this.buyersSalesData['newCurrentYearBuyerList'] = this.buyersSalesData['newCurrentYearBuyerList'].sort((a, b) => {
        const diff = a[sortField] - b[sortField];
        return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
      });
    }

  getSortedForttlValLst():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.buyersSalesData['PreviousYearBuyerAvailableList'] = this.buyersSalesData['PreviousYearBuyerAvailableList'].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedFornoOfInvoiceLst():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.buyersSalesData['PreviousYearBuyerAvailableList'] = this.buyersSalesData['PreviousYearBuyerAvailableList'].sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForCurTotal():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsnData = this.hsnData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForPrevTotal():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsnData = this.hsnData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForTotalAvg():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsnData = this.hsnData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForPreLastYear():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsnData = this.hsnData.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForreportedDate(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.basicDetailsList = this.basicDetailsList.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedDataForRegDate(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.basicDetailsList = this.basicDetailsList.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  downloadExcelFile(mstId?) {
    GlobalHeaders['x-page-action'] = 'Download Excel';
    let isAllFetched = true;
    this.gstInList.forEach(gstinData => {
        if(isAllFetched && (gstinData.calculationStatus == undefined || gstinData.calculationStatus != "Success")) {
          isAllFetched = false;
        }
    });

    if(!isAllFetched) {
      this.commonService.warningSnackBar("All data calculation is not done Please wait");
      return false;
    }

    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadGstAnalysisReport(mstId).subscribe(res => {
      //console.logres);
      if (res.status === 200 && res.contentInBytes) {
        this.downloadExcel(res.contentInBytes, 'GST Analysis Report_' + mstId);
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });
  }
  downloadExcel(byteData: string, fileName: string) {
    // Create a Blob from the base64 encoded byte data
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Create object URL from the Blob
    const url = window.URL.createObjectURL(blob);

    // Set the anchor element's properties
    a.href = url;
    a.download = fileName;

    // Simulate a click event to trigger the download
    a.click();

    // Revoke the object URL to free up resources
    window.URL.revokeObjectURL(url);

    // Remove the temporary anchor element
    a.remove();
  }

  base64toBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  saveProjectedSales() {
    GlobalHeaders['x-page-action'] = 'saving projected sales';
    // Regular expression to match only numbers
    const numberPattern = /^[0-9]+$/;

    if (this.commonService.isObjectNullOrEmpty(this.mstId)
      || this.commonService.isObjectNullOrEmpty(this.analysisData?.salesData?.projYearTurnover)) {
      return this.commonService.errorSnackBar('Please fill details')
    }
    if (this.analysisData?.salesData?.projYearTurnover && !numberPattern.test(this.analysisData?.salesData?.projYearTurnover)) {
      return this.commonService.errorSnackBar('only numeric characters are allow')
    }
    let formData = {}
    formData['refId'] = this.mstId;
    formData['projectedSale'] = this.analysisData?.salesData?.projYearTurnover;
    console.log(formData);
    this.loaderService.show();
    this.msmeService.gstAnalysisSubmit(formData).subscribe((response: any) => {
      if (response != null && response?.status == 200) {
        this.gstInList.forEach(gstinData => {
          this.isFirstTimeCall=false;
            this.getAnalysisData(gstinData.gstin, gstinData.detailId, true,false,true);
            gstinData.calculationStatus = "Pending";
        });
        if(this.isFirstTimeCall){
          this.callGetStatusApiInInterval();
        }
        else{
          this.callGetStatusApiInInterval2();
        }
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })

  }

  changeTurnover(newTurnover: Number) {
    this.analysisData.salesData.projYearTurnover = newTurnover;
    this.analysisData.salesData.projQtrTurnover = Number(newTurnover) / 4;
  }

  downloadPdfFile(mstId?) {
    GlobalHeaders['x-page-action'] = 'Download Pdf';
    //console.log"in method");
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadGstPdf(mstId).subscribe(res => {
      if (res.status === 200 && res?.data?.content) {
        console.log("Download GST Analysis PDF >>",res);
      if(res && res?.data && res?.data?.content){
        this.downloadBase64(res.data.content,"GST_Analysis_"+ this.mstId);
       }else{
        this.commonService.errorSnackBar("Not able to download");
       }
      } else {
        this.commonService.warningSnackBar(res.message);
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

  isActionAvail(actionId: string): boolean {
    let res = false;
    if (this.pageData?.subpageId == Constants.pageMaster.GST_ANALYSIS2 || this.pageData?.subpageId == Constants.pageMaster.GST_ANALYSIS) {
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
              if (page?.subpageId == Constants.pageMaster.GST_ANALYSIS) {
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


  formatValueInMillion(value?: number): string {
    if (value === undefined || value === null || isNaN(value) || (typeof value === 'string' && value === "")) {
      return "NA";
    } else if (value === 0 || value === 0.000) {
      return "-";
    }
  
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value); // Example: 2,560,406,712.00
  }
  
  
  
  formatValue2(value?: number, type?): string {
    // if (value === undefined || value === null || value === 0) {
    //   return (type ? "$" : "₹") + ' 0';
    // }
    if (value === undefined || value === null || isNaN(value)|| (typeof value === 'string' && value === "")) {
      return "NA";
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: type ? 'USD' : 'INR',
      minimumFractionDigits: 2
    }).format(value);
  }

navBack(){
  this.router.navigate(['/hsbc/rmGSTAnalysis'],{state: { data: this.pageData }});
}

tabChange(event:any){
  GlobalHeaders['x-page-action'] = event.tab.textLabel;
  saveActivity(() => {});
}


}
