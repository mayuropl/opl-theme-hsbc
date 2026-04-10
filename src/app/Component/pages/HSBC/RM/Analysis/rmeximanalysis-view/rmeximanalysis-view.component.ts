import { Location } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { BuyerSellerPeer, SearchByAnchor } from 'src/app/CommoUtils/model/BuyerSellerPeer';
import { CompanyDetail } from 'src/app/CommoUtils/model/CompanyDetail';
import { ExportImportCountryExposure } from 'src/app/CommoUtils/model/ExportImportCountryExposure';
import { HsnCodeDetail } from 'src/app/CommoUtils/model/HsnCodeDetail';
import { ProductExportImport } from 'src/app/CommoUtils/model/ProductExportImport';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { HSBCHSNCodeComponent } from 'src/app/Popup/HSBC/hsbchsncode/hsbchsncode.component';
import { HSNdetailsPopupComponent } from 'src/app/Popup/HSBC/hsndetails-popup/hsndetails-popup.component';
import { ProductsHSNcodePopupComponent } from 'src/app/Popup/HSBC/products-hsncode-popup/products-hsncode-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import * as _ from 'lodash';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../../CommoUtils/global-headers";
import { isSubpageExists } from 'src/app/CommoUtils/subpage-permission.helpers';
import {Constants} from "../../../../../../CommoUtils/constants";
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/SharedService';
import { event } from 'jquery';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
// import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-rmeximanalysis-view',
  templateUrl: './rmeximanalysis-view.component.html',
  styleUrl: './rmeximanalysis-view.component.scss'
})
export class RMEXIMAnalysisViewComponent implements OnInit {

  // @ViewChild('tabGroup') tabGroup: MatTabGroup;
  searchAnchorForm: FormGroup;
  searchProductForm: FormGroup;
  searchModel = "";
  scrolled: boolean = false;
  isLoading = false;
  sanctionFiltersForExport: string[] = [];
  sanctionFiltersForImport: string[] = [];
  sanctionPercentageForExport: number = 0;
  selectiveSanctionPercentageForExport: number = 0;
  sanctionPercentageForImport: number = 0;
  selectiveSanctionPercentageForImport: number = 0;
  isDownload: boolean = false;
  totalSanctionValueForExport: number = 0; 
  totalSelectiveSanctionValueForExport: number = 0;
  totalSanctionValueForImport: number = 0; 
  totalSelectiveSanctionValueForImport: number = 0;

  //data pass from prevous page
  routerData: any;
  eximId: number | undefined;
  summaryInfo: EximAnalysisSumRes = null;
  eximWalletData = [];
  totalExportImport = [];
  shipperCompanyCcnIdList = [];
  consigneeCompanyCcnIdList = [];
  importAnalysis: ExportAnalysis[] = [];
  exportAnalysis: ExportAnalysis[] = [];
  exportShiYear: any = [];
  exportShipShortYear: any = [];
  isBuyerPeerFetched :boolean;
  buyerPeerSorting: string = "DESC";
  buyerPeers: BuyerSellerPeer[] = [];
  sellerPeerSorting: string = "DESC";
  sellerPeers: BuyerSellerPeer[] = [];
  productExPeersSorting: string = "DESC";
  productExPeers: ProductExportImport[] = [];
  productExPeersSortingField: string = "totalShipmentValue";
  productImPeersSorting: string = "DESC";
  productImPeersSortingField: string = "totalShipmentValue";
  productImPeers: ProductExportImport[] = [];
  newBuyers: BuyerSellerPeer[] = [];
  newSellers: BuyerSellerPeer[] = [];
  companyDetails: CompanyDetail[] = [];
  companyDetailsFiltered: CompanyDetail[] = [];
  searchByAnchors: SearchByAnchor[] = [];
  selectedCcn: String = null;

  searchByProducts: BuyerSellerPeer[] = [];
  eximCountryMasterList = [];
  eximCountryMasterListFilter = [];
  searchByAnchorCounryMasterList = [];

  searchProductSorting: string = "DESC";
  hsnCodeData:any;
  currentSortField: string = 'id';
  sortDirection: 'ASC' | 'DESC' = 'DESC';
  exportWalletSortField: string = 'totalWalletCy';
  exportWalletSortDirection: 'ASC' | 'DESC' = 'DESC';
  importWalletSortField: string = 'totalWalletCy';
  importWalletSortDirection: 'ASC' | 'DESC' = 'DESC';
  exportCountryExposureSortField: string = 'exposurePercent';
  exportCountryExposureSortDirection: 'ASC' | 'DESC' = 'DESC';
  importCountryExposureSortField: string = 'exposurePercent';
  importCountryExposureSortDirection: 'ASC' | 'DESC' = 'DESC';
  //export Country exposure
  exCntryExposures: ExportImportCountryExposure[] = [];

  //import Country exposure
  imCntryExposures: ExportImportCountryExposure[] = [];

  selectedTabIndex: number;
  tabValue: number;
  isCollapsed = true;
  LODASH = _;

  exPagination: PaginationSignal = new PaginationSignal();
  imPagination: PaginationSignal = new PaginationSignal();
  buyerPeerPagntn: PaginationSignal = new PaginationSignal();
  sellerPeerPagntn: PaginationSignal = new PaginationSignal();
  productExPagntn: PaginationSignal = new PaginationSignal();
  productImPagntn: PaginationSignal = new PaginationSignal();
  newBuyerPagntn: PaginationSignal = new PaginationSignal();
  newSellerPagntn: PaginationSignal = new PaginationSignal();
  searchByAnchorPagntn: PaginationSignal = new PaginationSignal();
  searchByProductPagntn: PaginationSignal = new PaginationSignal();
  exCntryExposurePagntn: PaginationSignal = new PaginationSignal();
  imCntryExposurePagntn: PaginationSignal = new PaginationSignal();

  private tabWithIndex: Record<string, any> = {
    "Summary Info":0,
    "Export Wallet":1,
    "Import Wallet":2,
    "Same Buyer Peer":3,
    "Same Seller Peer":4,
    "Product Export Peer":5,
    "Product Import Peer":6,
    "New buyer":7,
    "New seller":8,
    "Search by Anchor":9,
    "Export Country Exposure":10,
    "Import country exposure":11,
    "Corridor-wise-analysis":12,
  }

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
  ]
  DataStatus = [
    { value: 'Imports from Indian exporters', viewValue: 'someData', tab: '10' },
    { value: 'Exports to Indian importers', viewValue: 'someData', tab: '11' },
  ];
   pageData: any;
  protected readonly consValue = Constants;
  apiService: any;
  messageSubscription: any;
  websocketMessages: any;
  isProductExportPeerFetched: boolean;
  isSellerPeerFetched: boolean;
  isProductImportPeerFetched: boolean;
    isNewBuyerFetched: boolean;
  isNewSellerFetched: boolean;
  isExportCountryExposureFetched: boolean;
  isImportCountryExposureFetched: boolean;
  constructor(private msmeService: MsmeService, protected commonService: CommonService, private route: ActivatedRoute, private dialog: MatDialog,
    private location: Location, private fb: FormBuilder , private sharedService:SharedService, private loaderService: LoaderService) {
    this.clickEventsubscription = this.sharedService.getClickEvent().subscribe((message)=>{
        console.log("Message recieved");
        console.log(message);
        this.apiId(message);  
    })

  }

  apiId(responseFromWebsocket){

    responseFromWebsocket = JSON.parse(responseFromWebsocket);
    
    const reqType = responseFromWebsocket.reqType;
    let response = responseFromWebsocket.response;
    if(response?.apiStatus=='Success') {
      switch (reqType) {
        // case 0:
        //   this.callApiForTab1();
        //   break;
        case "EXIM_SAME_BUYER":
          if (this.isBuyerPeerFetched == null || this.isBuyerPeerFetched == false) {
            this.isBuyerPeerFetched = true
            this.getEximBuyerData(this.buyerPeerSorting, true);
          }
  
          break;
        case "EXIM_SAME_SELLER":
          if (this.isSellerPeerFetched == null || this.isSellerPeerFetched == false) {
            this.isSellerPeerFetched = true
            this.getEximSellerData(this.sellerPeerSorting, true);
          }
  
          break;
        case "EXIM_PRODUCT_EXPORT":
          if (this.isProductExportPeerFetched == null || this.isProductExportPeerFetched == false) {
            this.isProductExportPeerFetched = true;
            this.getProductExportData(this.productExPeersSorting, this.productExPeersSortingField, true);
          }
  
          break;
        case "EXIM_PRODUCT_IMPORT":
          if (this.isProductImportPeerFetched == null || this.isProductImportPeerFetched == false) {
            this.isProductImportPeerFetched = true;
            this.getProductImportData(this.productImPeersSorting, this.productImPeersSortingField, true);
          }
          break;
        case "EXIM_NEW_BUYER":
          if (this.isNewBuyerFetched == null || this.isNewBuyerFetched == false) {
            this.isNewBuyerFetched = true;
            this.getNewBuyerData(true);
          }
  
          break;
        case "EXIM_NEW_SELLER":
          if (this.isNewSellerFetched == null || this.isNewSellerFetched == false) {
            this.isNewSellerFetched = true;
            this.getNewSellerData(true);
          }
  
          break;
        case "EXIM_COUNTRY_EXPOSURE_EXPORT":
          if (this.isExportCountryExposureFetched == null || this.isExportCountryExposureFetched == false) {
            this.isExportCountryExposureFetched = true;
            (this.currentSortField = "exposurePercent") && this.getExCntryExposureData(true);
          }
  
          break;
        case "EXIM_COUNTRY_EXPOSURE_IMPORT":
          if (this.isImportCountryExposureFetched == null || this.isImportCountryExposureFetched == false) {
            this.isImportCountryExposureFetched = true;
            (this.currentSortField = "exposurePercent") && this.getImCntryExposureData(true);
          }
          break;
        default:
          break;
      }
    } else {
      let msg = "Something went wrong !!!";
      switch (reqType) {
        case "EXIM_SAME_BUYER":
          this.isBuyerPeerFetched = true;
          msg = "Error while fetch same buyer data";
          break;
        case "EXIM_SAME_SELLER":
          this.isSellerPeerFetched = true;
          msg = "Error while fetch same seller data";
          break;
        case "EXIM_PRODUCT_EXPORT":
          this.isProductExportPeerFetched = true;
          msg = "Error while fetch product export data";
          break;
        case "EXIM_PRODUCT_IMPORT":
          this.isProductImportPeerFetched = true;
          msg = "Error while fetch product import data";
          break;
        case "EXIM_NEW_BUYER":
          this.isNewBuyerFetched = true;
          msg = "Error while fetch new buyer data";
          break;
        case "EXIM_NEW_SELLER":
          this.isNewSellerFetched=true;
          msg = "Error while fetch new seller data";
          break;
        case "EXIM_COUNTRY_EXPOSURE_EXPORT":
          this.isExportCountryExposureFetched = true;
          msg = "Error while fetch export country exposure data";
          break;
        case "EXIM_COUNTRY_EXPOSURE_IMPORT":
          this.isImportCountryExposureFetched = true;
          msg = "Error while fetch import country exposure data";
          break;
        default:
          break;
      }
      this.commonService.errorSnackBar(msg);
    }
  }

  // mat tab header fixed S
    @HostListener('window:scroll', [])
    onWindowScroll() {
      this.scrolled = window.scrollY > 100;
    }

    clickEventsubscription:Subscription;
  // mat tab header fixed S
  ngOnInit(): void {
    // this.tabGroup.selectedIndex = 2;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.ANALYTICS,this.consValue.pageMaster.EXIM_ANALYSIS)
    }
    this.routerData = history.state.routerData;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmEXIMAnalysisView';
    GlobalHeaders['x-main-page'] = 'EXIM Analysis';
    GlobalHeaders['x-sub-page'] = 'Summary Info';
    if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      this.eximId = this.routerData?.eximId;
      this.getData();
      // console.log(this.routerData); // Access the passed data
    }


    this.initForm();
  }


  ngAfterViewInit() {
  }
  initForm(value?: any) {
    this.searchAnchorForm = this.fb.group({
      anchorName: '',
      direction: '',
      searchType:'',
      searchBy:'',
    });

    this.searchProductForm = this.fb.group({

      fromCountry:[{value: "India", disabled: true}, Validators.compose([Validators.required])],
      searchType:['', Validators.compose([Validators.required])],
      toCountry:['', Validators.compose([Validators.required])],
      productName: ['', Validators.compose([Validators.required])],
      searchBy:['', Validators.compose([Validators.required])]
    });
  }
  getData() {
    this.msmeService.getEximAnalysisReport(this.eximId).subscribe((response: any) => {
      // console.log(response);
      if (response.status == 200) {
        this.summaryInfo = response.data;
        console.log("summaryInfo:::> ", this.summaryInfo)
        this.totalExportImport = response.listData;
        this.consigneeCompanyCcnIdList = response?.data?.consigneeCompanyCcnIdList;
        this.shipperCompanyCcnIdList = response?.data?.shipperCompanyCcnIdList;
        // this.getEximWalletData();
        this.getEximWalletDataFromFilter();

        // this.getImCntryExposureData(true);
        // this.getExCntryExposureData(true);
        // this.getNewBuyerData(true);
        // this.getNewSellerData(true);
        // this.getEximSellerData(this.sellerPeerSorting, true);
        // this.getEximBuyerData(this.buyerPeerSorting, true);
        // this.getProductExportData(this.productExPeersSorting, this.productExPeersSortingField, true);
        // this.getProductImportData(this.productImPeersSorting, this.productImPeersSortingField, true);
        // this.getEximImportData();
        // this.getEximExportData();

      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Error', error);
    });

  }

  getEximWalletData(){
    var json = {};
    json["eximId"] = this.summaryInfo?.eximId;
    json["pan"] = this.summaryInfo?.pan;
    console.log("json =======>",json)
    this.msmeService.getEximWalletData(json).subscribe((response: any) => {
      if(response.status == 200){
        this.eximWalletData = response.data || [];
      }else{
        this.eximWalletData = [];
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.eximWalletData = [];
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Error', error);
    });
  }

  getEximWalletDataFromFilter() {
    var json = {};
    json["pan"] = this.summaryInfo?.pan;
    console.log("json =======>",json)
    this.msmeService.getEximWalletDataFromFilter(json).subscribe((response: any) => {
      if(response.status == 200){
        this.eximWalletData = response.data || [];
      }else{
        this.eximWalletData = [];
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.eximWalletData = [];
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Error', error);
    });
  }

  getEximImportData() {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    var json = {};
    this.isLoading = true;
    this.loaderService.subLoaderShow();
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 1;
    json["pageIndex"] = this.imPagination.page() - 1;
    json["size"] = this.imPagination.pageSize();
    // if(this.importWalletSortField != "totalWalletPy" && this.importWalletSortField != "totalWalletCy") {
    //   this.importWalletSortField = "totalWalletCy";
    // }
    json["sortField"] = this.importWalletSortField;
    json["sortDirection"] = this.importWalletSortDirection;

    this.msmeService.getEximImportReport(json).subscribe((response: any) => {
      this.isLoading = false;
      this.loaderService.subLoaderHide();
      console.log(response);
      if (response.status == 200) {
        this.importAnalysis = response.listData;
        console.log(this.importAnalysis);
        this.imPagination.totalSize = response?.data;
        if (this.importAnalysis) {
          this.importAnalysis.forEach(val => {
            val.isCollapsed = true;
          });
          for (let val of this.importAnalysis[0].eximFYearResList) {
            let finyear = val.financialYear;
            this.exportShiYear.push(finyear);
            let [startYear, endYear] = finyear.split('-');
            let shortEndYear = endYear.slice(-2);
            let formattedYear = `${startYear}-${shortEndYear}`;
            this.exportShipShortYear.push(formattedYear);
          }
        }
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Upload failed', error);
    });
  }

  getEximExportData() {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    var json = {};
    this.isLoading = true;
    this.loaderService.subLoaderShow();
    json["eximId"] = this.summaryInfo?.eximId;
    // json["eximId"] = 26;
    json["tabId"] = 2;
    json["pageIndex"] = this.exPagination.page() - 1;
    json["size"] = this.exPagination.pageSize();
    json["sortDirection"] = this.exportWalletSortDirection;
    // if(this.exportWalletSortField != "noOfShipmentsPy" && this.exportWalletSortField != "noOfShipmentsCy" && this.exportWalletSortField != "totalWalletPy" && this.exportWalletSortField != "totalWalletCy") {
    //   this.currentSortField = "totalWalletCy";
    // }
    json["sortField"] = this.exportWalletSortField;

    this.msmeService.getEximExportReport(json).subscribe((response: any) => {
      this.isLoading = false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.exportAnalysis = response.listData;
        if (this.exportAnalysis) {
          this.exportAnalysis.forEach(val => {
            val.isCollapsed = true;
          });
          for (let val of this.exportAnalysis[0].eximFYearResList) {
            let finyear = val.financialYear;
            this.exportShiYear.push(finyear);
            let [startYear, endYear] = finyear.split('-');
            let shortEndYear = endYear.slice(-2);
            let formattedYear = `${startYear}-${shortEndYear}`;
            this.exportShipShortYear.push(formattedYear);
          }
        }
        this.exPagination.totalSize = response?.data;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getEximBuyerData(sorting, isIgnoreLoader?) {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    
    this.buyerPeerSorting = sorting;
    var json = {};
      this.isLoading=true;
      this.loaderService.subLoaderShow();
  
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 4;
    json["size"] = this.buyerPeerPagntn.pageSize();
    json["pageIndex"] = this.buyerPeerPagntn.page() - 1;
    json["sorting"] = sorting;
    this.buyerPeers = [];
    this.msmeService.getEximBuyerSellerData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.isBuyerPeerFetched = true;
        let buyerPeersList = response.listData;
        buyerPeersList.forEach(element => {
          // element = JSON.parse(element);
          element.isCollapsed = true;
          element.sorting = "DESC";
          element.internalPagination = new PaginationSignal();
          element.internalPagination.totalSize = element.mappingDataList.length;
          this.buyerPeers.push(element);
        });
        this.buyerPeerPagntn.totalSize = response?.data;
      } else if (response.status == 208){
        this.isBuyerPeerFetched = false;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.isLoading = false;
      this.loaderService.subLoaderHide();
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getEximSellerData(sorting, isIgnoreLoader?) {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    this.sellerPeerSorting = sorting;
    var json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 5;
    json["size"] = this.sellerPeerPagntn.pageSize();
    json["pageIndex"] = this.sellerPeerPagntn.page() - 1;
    json["sorting"] = sorting;
    this.sellerPeers = [];
    this.msmeService.getEximBuyerSellerData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.isSellerPeerFetched = true;
        let sellerPeersList = response.listData;
        sellerPeersList.forEach(element => {
          // element = JSON.parse(element);
          element.isCollapsed = true;
          element.sorting = "DESC";
          element.internalPagination = new PaginationSignal();
          element.internalPagination.totalSize = element.mappingDataList.length;
          this.sellerPeers.push(element);
        });
        this.sellerPeerPagntn.totalSize = response?.data;
      } else if(response.status == 208){
        this.isSellerPeerFetched = false;
      }else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  // fromTab 1 = same buyer 2 = same seller 3 = Search by Product
  sortSameBuyerSellerList(sellerPeer: BuyerSellerPeer,fromTab) {
    // Separate the object(s) that should stay on top
    let mainCompanyList = [];
    if(fromTab == 1) {
      mainCompanyList = this.shipperCompanyCcnIdList;
    } else if(fromTab == 2) {
      mainCompanyList = this.consigneeCompanyCcnIdList;
    }
    const withMainCompanyList = sellerPeer.mappingDataList.filter(item => mainCompanyList.includes(item.ccnId));
    const withoutMainCompanyList  = sellerPeer.mappingDataList.filter(item => !mainCompanyList.includes(item.ccnId));
    if (sellerPeer.sorting == "DESC") {
      sellerPeer.sorting = "ASC";
      // sellerPeer.mappingDataList = sellerPeer.mappingDataList.sort((a, b) => a.valueUsd - b.valueUsd);
      sellerPeer.mappingDataList = [
        ...withMainCompanyList,
        ...withoutMainCompanyList.sort((a, b) => a.valueUsd - b.valueUsd)
      ];
    } else {
      sellerPeer.sorting = "DESC"
      // sellerPeer.mappingDataList = sellerPeer.mappingDataList.sort((a, b) => b.valueUsd - a.valueUsd);
      sellerPeer.mappingDataList = [
        ...withMainCompanyList,
        ...withoutMainCompanyList.sort((a, b) => b.valueUsd - a.valueUsd)
      ];
    }
    
  }


  getProductExportData(sorting, sortField, isIgnoreLoader?) {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    var json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 6;
    json["size"] = this.productExPagntn.pageSize();
    json["pageIndex"] = this.productExPagntn.page() - 1;
    json["sorting"] = sorting;
    json["sortField"] = sortField;
    this.productExPeersSortingField = sortField;
    this.productExPeersSorting = sorting;
    this.productExPeers = [];
    this.msmeService.getProductExportData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.isProductExportPeerFetched = true;
        let resList = response.listData;
        resList.forEach(element => {
          // element = JSON.parse(element);
          element.isCollapsed = true;
          element.sorting = "DESC";
          element.internalPagination = new PaginationSignal();
          // element.companyDataList = element.companyDataList.sort((a, b) => b.totalShipmentValue - a.totalShipmentValue);
          element.internalPagination.totalSize = element.companyDataList.length;
          this.productExPeers.push(element);
        });
        this.productExPagntn.totalSize = response?.data;
      }else if(response.status==208){
        this.isProductExportPeerFetched=false;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getProductImportData(sorting, sortField, isIgnoreLoader?) {
    if (!this.summaryInfo?.eximId) {
      return;
    }
    var json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 7;
    json["size"] = this.productImPagntn.pageSize();
    json["pageIndex"] = this.productImPagntn.page() - 1;
    json["sorting"] = sorting;
    json["sortField"] = sortField;
    this.productImPeersSortingField = sortField;
    this.productImPeersSorting = sorting;
    this.productImPeers = [];

    this.msmeService.getProductImportData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.isProductImportPeerFetched = true;
        let resList = response.listData;
        resList.forEach(element => {
          // element = JSON.parse(element);
          element.isCollapsed = true;
          element.sorting = "DESC";
          element.internalPagination = new PaginationSignal();
          // element.companyDataList = element.companyDataList.sort((a, b) => b.totalShipmentValue - a.totalShipmentValue);
          element.internalPagination.totalSize = element.companyDataList.length;
          this.productImPeers.push(element);
        });
        this.productImPagntn.totalSize = response?.data;
      } else if(response.status == 208){
        this.isProductImportPeerFetched = false;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  sortProductImportExportList(productExportImport: ProductExportImport,fromTab) {
    let mainCompanyList = [];
    if(fromTab == 1) {
      mainCompanyList = this.shipperCompanyCcnIdList;
    } else if(fromTab == 2) {
      mainCompanyList = this.consigneeCompanyCcnIdList;
    }

    const withMainCompanyList = productExportImport.companyDataList.filter(item => mainCompanyList.includes(item.ccnId));
    const withoutMainCompanyList  = productExportImport.companyDataList.filter(item => !mainCompanyList.includes(item.ccnId));
    if (productExportImport.sorting == "DESC") {
      productExportImport.sorting = "ASC";
      productExportImport.companyDataList = [
        ...withMainCompanyList,
        ...withoutMainCompanyList.sort((a, b) => a.totalShipmentValue - b.totalShipmentValue)
      ];
      // productExportImport.companyDataList = productExportImport.companyDataList.sort((a, b) => a.totalShipmentValue - b.totalShipmentValue);
    } else {
      productExportImport.sorting = "DESC"
      productExportImport.companyDataList = [
        ...withMainCompanyList,
        ...withoutMainCompanyList.sort((a, b) => b.totalShipmentValue - a.totalShipmentValue)
      ];
      // productExportImport.companyDataList = productExportImport.companyDataList.sort((a, b) => b.totalShipmentValue - a.totalShipmentValue);
    }
    return productExportImport.companyDataList;
  }

  getNewBuyerData(isIgnoreLoader?) {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    const json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 8;
    json["size"] = this.newBuyerPagntn.pageSize();
    json["pageIndex"] = this.newBuyerPagntn.page() - 1;
    json["sortDirection"] = this.sortDirection;
    if (this.currentSortField != "noOfShipments" && this.currentSortField != "valueUsd") {
      this.currentSortField = "valueUsd";
      json["sortField"] = "valueUsd";
    } else {
      json["sortField"] = this.currentSortField;
    }
    console.log(this.currentSortField);
    

    this.msmeService.getNewBuyerData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      console.log(response);
      if (response.status == 200) {
        this.isNewBuyerFetched = true;
        this.newBuyers = response.listData;
        this.newBuyerPagntn.totalSize = response?.data;
      } else if(response.status == 208){
        this.isNewBuyerFetched = false;
      }else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getNewSellerData(isIgnoreLoader?) {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    const json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 9;
    json["size"] = this.newSellerPagntn.pageSize();
    json["pageIndex"] = this.newSellerPagntn.page() - 1;
    json["sortDirection"] = this.sortDirection;
    if (this.currentSortField != "noOfShipments" && this.currentSortField != "valueUsd") {
      this.currentSortField = "valueUsd";
      json["sortField"] = "valueUsd";
    } else {
      json["sortField"] = this.currentSortField;
    }

    this.msmeService.getNewSellerData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      console.log(response);
      if (response.status == 200) {
        this.isNewSellerFetched = true;
        this.newSellers = response.listData;
        this.newSellerPagntn.totalSize = response?.data;
      }else if(response.status == 208){
        this.isNewSellerFetched = false;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  searchByAnchor() {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    const json = {};
    json["eximId"] = this.summaryInfo?.eximId;
    json["anchorName"] = this.getControlValue("anchorName");
    json["tabId"] = this.getControlValue("direction");
    json["size"] = this.searchByAnchorPagntn.pageSize();
    json["pageIndex"] = this.searchByAnchorPagntn.page() - 1;

    this.msmeService.getAnchor(json).subscribe((response: any) => {
      
      console.log(response);
      if (response.status == 200) {

        this.companyDetails = response.listData;
        this.companyDetailsFiltered = _.cloneDeep(this.companyDetails);
        this.searchByAnchorCounryMasterList = _.cloneDeep(this.eximCountryMasterListFilter);
        this.searchByAnchorPagntn.totalSize = response?.data;

      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  // Method to get value of a specific control
  getControlValue(controlName: string) {
    return this.searchAnchorForm.get(controlName)?.value;
  }


  anchorCcnSelected(event: MatSelectChange) {
    this.selectedCcn = event.value;
    this.searchByAnchorCcn();
  }

  searchByAnchorCcn() {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    const json = {};
    json["eximId"] = this.summaryInfo?.eximId;
    json["ccnId"] = this.selectedCcn;
    json["tabId"] = this.getControlValue("direction");
    json["size"] = this.searchByAnchorPagntn.pageSize();
    json["pageIndex"] = this.searchByAnchorPagntn.page() - 1;
    json["sortDirection"] = this.sortDirection;
    json["sortField"] = this.currentSortField;

    this.msmeService.getAnchorData(json).subscribe((response: any) => {
      console.log(response);
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {

        // this.companyDetails = response.listData;

        this.searchByAnchors = response.listData;
        this.searchByAnchorPagntn.totalSize = response?.data;

      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getEximCountryMasterList() {
    this.msmeService.getEximCountryMasterList().subscribe((response: any) => {
      if (response.status == 200) {
        this.eximCountryMasterList = response.data.filter((c: any) => c.countryName?.toLowerCase() !== 'india');
        console.log("getCountry list============>", this.eximCountryMasterList);
        this.eximCountryMasterListFilter = _.cloneDeep(this.eximCountryMasterList);
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  getHsnCodeData() {
    this.msmeService.getHsnCodeDataByEximId(this.summaryInfo?.eximId).subscribe((response: any) => {
      if (response.status == 200 && response.data) {
        this.hsnCodeData = response.data;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  productMasterId;
  searchByProduct(isFromSearchButton,sorting,currentSortField) {
    console.log(this.searchProductForm);
    if(isFromSearchButton && this.searchProductForm.invalid){
      this.commonService.warningSnackBar("Please fill valid details")
      return;
    }

    const json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    console.log('Form Value:', this.searchProductForm.get('searchBy').value);

    json["eximId"] = this.summaryInfo?.eximId;
    json["searchByProductId"] = this.productMasterId;
    json["productName"] = this.searchProductForm.value.productName;
    json["searchBy"] = this.searchProductForm.value.searchBy;
    json["country"] = this.searchProductForm.value.toCountry;
    json["searchType"] = this.searchProductForm.value.searchType;
    json["isFromSearchButton"] = isFromSearchButton;
    json["size"] = this.searchByProductPagntn.pageSize();
    json["pageIndex"] = this.searchByProductPagntn.page() - 1;
    json["sorting"] = sorting;
    json["sortField"] = currentSortField;

    this.searchProductSorting = sorting;
    this.searchByProducts = [];
    this.msmeService.getEximSearchByProduct(json).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        let searchByProductList = response.listData;
        searchByProductList.forEach(element => {
          element = JSON.parse(element);
          element.isCollapsed = true;
          element.sorting = "DESC";
          element.internalPagination = new PaginationSignal();
          element.internalPagination.totalSize = element.mappingDataList.length;
          this.searchByProducts.push(element);
        });
        if(searchByProductList.length > 0){
          this.productMasterId = this.searchByProducts[0].searchByProductId;
        }
        this.searchByProductPagntn.totalSize = response?.data;
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  searchBy = '1';
  allowOnlyNumbers(event: KeyboardEvent){
    if (this.searchBy === '1') {
      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
      }
    }
  }

  getExCntryExposureData(isIgnoreLoader?) {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    const json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 12;
    json["size"] = this.exCntryExposurePagntn.pageSize();
    json["pageIndex"] = this.exCntryExposurePagntn.page() - 1;
    json["sortDirection"] = this.exportCountryExposureSortDirection;
    // if(this.currentSortField != "exposurePercent" && this.currentSortField != "valueUsd" && this.currentSortField != "noOfShipments") {
    //   this.currentSortField = "exposurePercent";
    // }
    json["sortField"] = this.exportCountryExposureSortField;
    json["sanctionFilters"] = this.sanctionFiltersForExport;

    console.log("json======>",json);
    this.msmeService.getExCntryExposureData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      console.log(response);
      if (response.status == 200) {
        console.log("=======>",response);
        this.isExportCountryExposureFetched=true;
        this.exCntryExposures = response.listData;
        this.exCntryExposurePagntn.totalSize = response?.data;

        if(response.response){
          this.sanctionPercentageForExport = response.response.exportSanctionPercentage;
          this.selectiveSanctionPercentageForExport = response.response.exportSelectiveSanctionPercentage;
          this.totalSanctionValueForExport = response.response.totalExportSanctionValue;
          this.totalSelectiveSanctionValueForExport = response.response.totalExportSelectiveSanctionValue;
        }

      } else if(response.status == 208){
        this.isExportCountryExposureFetched=false;
      }else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }

  downloadCountryExposure(isIgnoreLoader?){
    const json={};
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabIds"] = [12,13];
    json["size"] = this.exCntryExposurePagntn.pageSize();
    json["pageIndex"] = this.exCntryExposurePagntn.page() - 1;
    json["sortDirection"] = this.exportCountryExposureSortDirection;
    json["sortField"] = this.exportCountryExposureSortField;

    console.log("json =======>", json);
    this.msmeService.downloadCountryExposure(json).subscribe((response: any)=>{
      console.log("response==========>", response);
      if(response?.status == 200){
        this.downloadExcel(response.data, response.fileName || 'CountryExposure.xlsx');
      }else{
        console.error("File download failed", response);
      }
    });
  }

  downloadExcel(byteData: string, fileName: string) {
    
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
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

  toggleSortExport(column: string, dontCallApi?: boolean){
    if(this.exportWalletSortField === column){
      this.exportWalletSortDirection = this.exportWalletSortDirection === 'ASC'?'DESC':'ASC';
    }else{
      this.exportWalletSortField = column;
      this.exportWalletSortDirection = 'ASC';
    }
    if(dontCallApi){
    this.getEximExportData();
    }
  }

  toggleSortImport(column: string, dontCallApi?: boolean){
    if(this.importWalletSortField === column){
      this.importWalletSortDirection = this.importWalletSortDirection === 'ASC'?'DESC':'ASC';
    }else{
      this.importWalletSortField = column;
      this.importWalletSortDirection = 'ASC'; 
    }
    if(dontCallApi){
      this.getEximImportData();
      }
  }

  toggleSort(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    // if(dontCallApi && this.currentSortField==("noOfShipmentsPy")){
    // this.getEximExportData();
    // }
    // if(dontCallApi && this.currentSortField==("noOfShipmentsCy")){
    //   this.getEximExportData();
    // }
    // if(dontCallApi && this.currentSortField==("totalWalletCy")){
    //   this.getEximExportData();
    //   }
    // if(dontCallApi && this.currentSortField==("totalWalletPy")){
    //     this.getEximExportData();
    // }
    if(dontCallApi && this.currentSortField==("noOfShipments")){
      this.getNewBuyerData();
    }
    if(dontCallApi && this.currentSortField==("valueUsd")){
      this.getNewBuyerData();
    }
  }

  toggleSort2(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    // if(dontCallApi && this.currentSortField==("totalWalletCy")){
    //   this.getEximImportData();
    //   }
    // if(dontCallApi && this.currentSortField==("totalWalletPy")){
    //     this.getEximImportData();
    // }
    if(dontCallApi && this.currentSortField==("noOfShipments")){
      this.getNewSellerData();
    }
    if(dontCallApi && this.currentSortField==("valueUsd")){
      this.getNewSellerData();
    }
  }

  toggleSort3(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if(dontCallApi && this.currentSortField==("noOfShipment")){
      this.searchByAnchorCcn();
    }
    if(dontCallApi && this.currentSortField==("valueUsd")){
      this.searchByAnchorCcn();
    }
  }

  toogleSortExportCountryExposure(column: string, dontCallApi?: boolean){
    if (this.exportCountryExposureSortField === column) {
      this.exportCountryExposureSortDirection = this.exportCountryExposureSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.exportCountryExposureSortField = column;
      this.exportCountryExposureSortDirection = 'ASC';
    }if(dontCallApi){
      this.getExCntryExposureData();
    }
    // if(dontCallApi && this.currentSortField==("noOfShipments")){
    //   this.getExCntryExposureData();
    // }
    // if(dontCallApi && this.currentSortField==("valueUsd")){
    //   this.getExCntryExposureData();
    // }
    // if(dontCallApi && this.currentSortField==("exposurePercent")){
    //   this.getExCntryExposureData();
    // }
  }


  toogleSortImportCountryExposure(column: string, dontCallApi?: boolean){
    if (this.importCountryExposureSortField === column) {
      this.importCountryExposureSortDirection = this.importCountryExposureSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.importCountryExposureSortField = column;
      this.importCountryExposureSortDirection = 'ASC';
    } if(dontCallApi){
      this.getImCntryExposureData();
    }
  }

  toggleSort5(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    // if(dontCallApi && this.currentSortField==("noOfShipments")){
    //   this.getImCntryExposureData();
    // }
    // if(dontCallApi && this.currentSortField==("valueUsd")){
    //   this.getImCntryExposureData();
    // }
    // if(dontCallApi && this.currentSortField==("exposurePercent")){
    //   this.getImCntryExposureData();
    // }
    if(dontCallApi && this.currentSortField==("no_of_shipments")){
      this.searchByProduct(false,this.sortDirection,this.currentSortField);
    }
    if(dontCallApi && this.currentSortField==("value_usd")){
      this.searchByProduct(false,this.sortDirection,this.currentSortField);
    }
  }

  getImCntryExposureData(isIgnoreLoader?) {
    // return;
    if (!this.summaryInfo?.eximId) {
      return;
    }
    const json = {};
    this.isLoading=true;
    this.loaderService.subLoaderShow();
    json["eximId"] = this.summaryInfo?.eximId;
    json["tabId"] = 13;
    json["size"] = this.imCntryExposurePagntn.pageSize();
    json["pageIndex"] = this.imCntryExposurePagntn.page() - 1;
    json["sortDirection"] = this.importCountryExposureSortDirection;
    // if(this.currentSortField != "exposurePercent" && this.currentSortField != "valueUsd" && this.currentSortField != "noOfShipments") {
    //   this.currentSortField = "exposurePercent";
    // }
    json["sortField"] = this.importCountryExposureSortField;
    json["sanctionFilters"] = this.sanctionFiltersForImport;

    this.msmeService.getImCntryExposureData(json, true).subscribe((response: any) => {
      this.isLoading=false;
      this.loaderService.subLoaderHide();
      console.log(response);
      if (response.status == 200) {
        this.isImportCountryExposureFetched = true;
        this.imCntryExposures = response.listData||[];
        this.imCntryExposurePagntn.totalSize = response?.data;
        if(response.response){
          this.sanctionPercentageForImport = response.response.importSanctionPercentage;
          this.selectiveSanctionPercentageForImport = response.response.importSelectiveSanctionPercentage;
          this.totalSanctionValueForImport = response.response.totalImportSanctionValue; 
          this.totalSelectiveSanctionValueForImport = response.response.totalImportSelectiveSanctionValue;
        }
      } else if(response.status==208){
        this.isImportCountryExposureFetched = false;
      }else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Something Went Wrong', error);
    });
  }
  // onPageChange(page: any): void {
  //   console.log("onPageChange");
  //   //console.logpage);
  //   this.startIndex = (page - 1) * this.pageSize;
  //   this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  // }


  HSNCodePopup(eximId: Number, mappingId: Number) {
    // let hsnCode:HsnCodeDetail[];
    this.msmeService.getEximAnalysisHsnCode(eximId, mappingId).subscribe((response: any) => {
      // console.log(response);
      if (response.status == 200) {
        // hsnCode = response.data;
        const dialog = this.dialog.open(HSBCHSNCodeComponent, {
          panelClass: ['popupMain_design'],
          autoFocus: false,
          data: { hsnCodes: response.data }
        });
        dialog.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Error', error);
    });

    // const dialog = this.dialog.open(HSBCHSNCodeComponent, {
    //   panelClass: ['w-550px'],
    //   autoFocus: false,
    //   data:{hsnCodes: hsnCode}
    // });
    // dialog.afterClosed().subscribe(result => {
    //   console.log(`Dialog result: ${result}`);
    // });
  }
  goBack() {
    this.location.back(); // Navigates back to the previous page
  }

  onTabChange(event: MatTabChangeEvent) {
    GlobalHeaders['x-sub-page'] = event.tab.textLabel;
    const selectedIndex = event.index;
    this.isDownload = false;
    // const selectedIndex = this.tabWithIndex[event.tab.textLabel]
    // this.selectedTabIndex = selectedIndex;
    switch (selectedIndex) {
      // case 0:
      //   this.callApiForTab1();
      //   break;
      case 1:
        (!this.exportAnalysis || this.exportAnalysis.length == 0) && this.getEximExportData();
        break;
      case 2:
        (!this.importAnalysis || this.importAnalysis.length == 0) && this.getEximImportData();
        break;
      case 3:
        (!this.isBuyerPeerFetched) && this.getEximBuyerData(this.buyerPeerSorting);
        break;
      case 4:
        (!this.isSellerPeerFetched) && this.getEximSellerData(this.sellerPeerSorting);
        break;
      case 5:
        (!this.isProductExportPeerFetched) && this.getProductExportData(this.productExPeersSorting, this.productExPeersSortingField);
        break;
      case 6:
        (!this.isProductImportPeerFetched) &&this.getProductImportData(this.productImPeersSorting, this.productImPeersSortingField);
        break;
      case 7:
        (!this.isNewBuyerFetched) && this.getNewBuyerData();
        break;
      case 8:
        (!this.isNewSellerFetched) && this.getNewSellerData();
        break;
      case 10:
        (!this.isExportCountryExposureFetched) && (this.currentSortField = "exposurePercent") && this.getExCntryExposureData();
        this.isDownload = true
        break;
      case 11:
        (!this.isImportCountryExposureFetched) && (this.currentSortField = "exposurePercent") && this.getImCntryExposureData();
        this.isDownload = true
        break;
      case 12:
        this.getEximCountryMasterList();
        this.getHsnCodeData();
        // this.searchByProduct();
        break;
      default:
        break;
    }
  }

  // HSN details popup
  HSNdetails_popup(hsnData): void {
    const dialogRef = this.dialog.open(HSNdetailsPopupComponent,
      { panelClass: ['popupMain_design'], data: hsnData }
    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // PRODUCTS HSN CODES details popup
  products_hsncode_popup(): void {
    const dialogRef = this.dialog.open(ProductsHSNcodePopupComponent,
      { panelClass: ['popupMain_design'],data:this.hsnCodeData }
    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  isSubpageIsAvailable(page:any){
    return isSubpageExists(this.pageData,page);
  }

  protected readonly Constants = Constants;
}

// interface EximAnalysisData {
//   bsId?: number;
//   acId?: number;

//   summaryInfo?: SummaryInfo;
//   exportAnalysis?: ExportAnalysis[];
//   accountList?: ExportAnalysis[];
//   importAnalysis?: ExportAnalysis[];
//   // monthWiseDetails: KeyValuePair[];
//   // topTransaction: TopTransaction;
//   // eodBalances: EODBalance;
// }


interface EximAnalysisSumRes {
  eximId: number;
  pan: string;
  companyName: string;
  address: string;
  reportFetchedDate: Date;
}

// interface ExportAnalysis {
//   isCollapsed:boolean;
//   supplierName: string;
//   supplierSince: string;
//   country: string;


//   noOfShipment:number;
//   noOfShipmentValue:number;

//   currency: string;
//   address: string;
//   parentCompany: string;
//   parentCompanyAddress: string;
//   dunsId: string;
//   hsbcPresence: boolean;
//   hsbcBanking: string;
//   walletShareLast3Month:number;
//   hsn:string;
//   yearWiseAnalysis?:YearWiseAnalysis[];

// }

interface ExportAnalysis {
  isCollapsed?: boolean;
  eximId: number;
  mappingId: number;
  buyerName: string;
  country: string;
  currency: string;
  address: string;
  parentCompany: string;
  parentCompanyAddress: string;
  dunsId: string;
  isHsbcPresence: true;
  hsbcBanking: string;
  walletShareLast3M: number;
  hsnCodeList: HsnCodeDetail[];
  eximFYearResList: YearWiseAnalysis[]
}


interface YearWiseAnalysis {
  financialYear: string;
  totalShipmentValue: number;
  totalNumberOfShipments: number;
  eximMonthlyAnalysis: MonthWiseDetail[];
}

interface MonthWiseDetail {
  month: string;
  numberOfShipments: number;
  shipmentValue: number;
}

