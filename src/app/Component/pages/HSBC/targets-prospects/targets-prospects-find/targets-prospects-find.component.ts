import { MatCheckboxChange } from '@angular/material/checkbox';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, delay, distinctUntilChanged, map, skip, startWith, takeUntil, filter } from 'rxjs/operators';
import { MsmeService } from 'src/app/services/msme.service';
import * as _ from 'lodash';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Constants, CUSTOMIZE_COLUMN } from "../../../../../CommoUtils/constants";
import { GlobalHeaders, resetGlobalHeaders, saveActivity } from "../../../../../CommoUtils/global-headers";
import { AuditAPIType } from "../../../../../CommoUtils/constants";
import { DropdownOption } from 'src/app/CommoUtils/model/drop-down-option';
import { CustomerList } from 'src/app/CommoUtils/model/CustomerList';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { UseridPopupComponent } from 'src/app/Popup/HSBC/userid-popup/userid-popup.component';
import { InactiveCsemCompanyPopupComponent } from '../../../../../Popup/HSBC/inactive-csem-company-popup/inactive-csem-company-popup.component';
import { ExportExcelPopupComponent } from 'src/app/Popup/HSBC/export-excel-popup/export-excel-popup.component';
import { TopBarFilter } from 'src/app/CommoUtils/model/top-bar-filter';
import { CommonMethods } from "../../../../../CommoUtils/common-methods";
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { NewIncorporationViewPopupComponent } from 'src/app/Popup/new-incorporation-view-popup/new-incorporation-view-popup.component';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DatePipe, Location } from '@angular/common';
import { ProspectsFilterStorageService } from 'src/app/services/prospect-filter-storage.service';
import { RejectedPopupComponent } from 'src/app/Popup/HSBC/rejected-popup/rejected-popup.component';
import alasql from 'alasql';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { ReportStatusPopupComponent } from 'src/app/Popup/HSBC/report-status-popup/report-status-popup.component';
import { FilterMasterService } from 'src/app/services/filter-master.service';
import { CreateCampaignProspectPopupComponent } from 'src/app/Popup/create-campaign-prospect-popup/create-campaign-prospect-popup.component';
import { CustomizeColumnsPopupComponent } from 'src/app/Popup/customize-columns-popup/customize-columns-popup.component';
import { FilterSidebarNewComponent } from 'src/app/Popup/filter-sidebar-new/filter-sidebar-new.component';
import { FilterListItem } from 'src/app/models/user-filter.model';
import { SaveFilterPopupComponent } from 'src/app/Popup/save-filter-popup/save-filter-popup.component';

export interface Company {
  name: string;
  cin: string,
  companyName: string,
  pan: string,
  searchedOn: string,
  searchType: string
}

export interface PopupData {
  scope: string;
  rmName: string;
  type: string;
}

export interface DashboardResponse {
  aggregateTurnoverFromGst: string;
  companyName: string,
  address: string,
  lendingBankersCount: Number,
  cmr: string,
  pan: string,
  cin: string,
  charges: string,
  creditRating: Number,
  city: string,
  pinCode: Number,
  fullBureauConsent: Boolean,
  partialBureauConsent: Boolean,
  downloadFinancialConsent: Boolean,
  contactNo: string,
  personal: string,
  turnOver: string,
  prioritySectorLendind: string,
  employeeCode: string;
  customerType: any;
  rmId: string;
  rmUserName: string;
  customerIdList: any
  previousRmId: String;
  isRmAssign: boolean;
  isTarget: boolean;
  assignmentRemarks: string;
}
@Component({
  selector: 'app-targets-prospects-find',
  templateUrl: './targets-prospects-find.component.html',
  styleUrl: './targets-prospects-find.component.scss'
})
export class TargetsProspectsFindComponent implements OnInit, OnDestroy {

  isNewFilter = true;
  cin: String;
  pan: String;
  companySearch: string = null;
  selectSearchType: string = 'COMPANY';
  companyNameList: Company[];
  dashboardResponse: DashboardResponse;
  isTyping = false;
  isProcessing = false;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  constants: any = Constants;
  customerType = this.constants.CustomerType.PROSPECTS;
  selectedTabIndex: number = 0;
  entityType: string = 'MCA';
  isSearchCompany: boolean = false;
  isCustomerTypeInActiveForSage: Boolean = false;
  isCustomerTypeInActiveForNewFdi: Boolean = false;
  isCustomerTypeInActiveForNewOdi: Boolean = false;
  isCustomerTypeInActiveForNewEcb: Boolean = false;
  customerInactiveForSage: Boolean = false;
  customerInactiveForNewFdi: Boolean = false;
  customerInactiveForNewOdi: Boolean = false;
  customerInactiveForNewEcb: Boolean = false;
  pincodeMaster = [];
  pageData: any = {};
  personaMap = {};
  isProspect: boolean = false;
  personaAllOptions: DropdownOption[];
  totalOpportunities: DropdownOption[];
  previousCitySelection: string[] = [];
  previousLocationSelection: string[] = [];
  isAssignedAllCustomerForCampaign: Boolean = false;
  isManualAllPagesSelected = false;
  // filterListMaster: any[] = [];
  private destroy$ = new Subject<void>();
  PageSelectNumber: any[] = [10, 20, 50, 100]
  private searchSubject = new Subject<string>();  // RxJS Subject for emitting search queries
  private panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  private mcaPanRegex = /^.{3}[CF].*/;
  private nonMcaPanRegex = /^.{3}[^C].*/;

  // PROSPECT
  page = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  totalSizeTemp = 0;
  searchForm: FormGroup;
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  customerList: CustomerList[] = [];
  customerListTemp: CustomerList[] = [];

  // In Corporation
  isInCorporation: boolean = false;
  inCorporationList: any = [];
  inCorporationPageNumber = 1
  inCorporationStartIndex = 0;
  inCorporationTotalSize: number = 0;
  inCorporationPageSize: number = 10;
  inCorporationTotalPages: number = 0;
  inCorporationPage: number = 0;

  // cityOptions: Observable<string[]>;
  // citySearchOptions: string[] = [];

  // stateOptions: Observable<string[]>;
  // stateSearchOptions: string[] = [];

  // for new incorporation
  citySearchOptions: string[] = [];
  fullCityOptions: string[] = [];
  stateSearchOptions: string[] = [];
  fullStateOptions: string[] = [];

  private typingTimer: any;


  // FDI
  isFDI: boolean = false;
  fdiPage = 1;
  fdiPageSize = 10;
  fdiStartIndex = 0;
  fdiEndIndex = 10;
  fdiTotalSize = 0;
  fdiCurrentSortField: string = null;
  fdiSortDirection: 'ASC' | 'DESC' = 'DESC';
  fdiSearchForm: FormGroup;
  fdiList: CustomerList[] = [];
  citiesList: any = [];  // Master cities list for FDI, ODI, ECB
  filteredCitiesList: any = [];  // Filtered cities list for search
  countriesFdiList: any = [];
  countriesFdiMainList: any = [];
  dateFdiList: any = [];
  dateFdiMainList: any = [];

  // ODI
  isODI: boolean = false;
  odiPage = 1;
  odiPageSize = 10;
  odiStartIndex = 0;
  odiEndIndex = 10;
  odiTotalSize = 0;
  odiCurrentSortField: string = null;
  odiSortDirection: 'ASC' | 'DESC' = 'DESC';
  odiSearchForm: FormGroup;
  odiList: CustomerList[] = [];
  countriesOdiList: any = [];
  countriesOdiMainList: any = [];
  dateOdiList: any = [];
  dateOdiMainList: any = [];
  // ECB
  isECB: boolean = false;
  ecbPage = 1;
  ecbPageSize = 10;
  ecbStartIndex = 0;
  ecbEndIndex = 10;
  ecbTotalSize = 0;
  ecbCurrentSortField: string = null;
  ecbSortDirection: 'ASC' | 'DESC' = 'DESC';
  ecbSearchForm: FormGroup;
  ecbList: CustomerList[] = [];
  dateEcbList: any = [];
  dateEcbMainList: any = [];

  // new gcc
  isNewGcc: boolean = false;
  newGccList: any = [];
  newGccPageNumber = 1
  newGccStartIndex = 0;
  newGccTotalSize: number = 0;
  newGccPageSize: number = 10;
  newGccTotalPages: number = 0;
  newGccPage: number = 0;


  topBarFilters: TopBarFilter[] = [];
  /** When loading from storage with empty optionFilter for Category/Countries/SubsidiaryCountry, merge selectedFilter after API refresh */
  private storedTopBarFiltersForMerge: TopBarFilter[] | null = null;
  filterJson = null;
  searchCompanyFound: boolean = false;
  allAreaData: any[] = [];
  originalAreaData: any[] = [];

  // Sage Prospects city dropdown
  sageProspectsCityList: any[] = [];
  sageProspectsCitySearchValue: string = '';

  // FDI dropdown search values
  fdiCitySearchValue: string = '';
  fdiDateSearchValue: string = '';

  // ODI dropdown search values
  odiCitySearchValue: string = '';
  odiDateSearchValue: string = '';

  // ECB dropdown search values
  ecbCitySearchValue: string = '';
  ecbDateSearchValue: string = '';

  // New GCC Announcement dropdown search values
  gccAnnouncementDateSearchValue: string = '';
  gccHqSearchValue: string = '';
  gccLocationSearchValue: string = '';

  // Search By Menu State
  searchByOptionsTopBar: any[] = [];
  activeFilterMenu: string | null = null;
  selectedFilterOption: any = null;
  selectedFilterType: 'topbar' | 'rm' | null = null;
  selectedFilterIndex: number | null = null;
  searchByDataHistory: {
    [key: number]: {
      'searchValue': string,
      'isCalled': boolean,
      'dataset_name': string,
      'data': any[],
      'page_size': number,
      'page_offset': number
    }
  } = {};
  dependantFilters: any[] = [];
  isLoadingSearchBy: boolean = false;
  selectedItemsMap: { [key: string]: any[] } = {};
  /** Cache of display label by filter and value so Location/Area selection stays visible when reopening after Apply */
  selectedOptionLabels: { [filterName: string]: { [value: string]: string } } = {};
  /** Backup of applied Location selection so it survives clearDependentFilters and shows when reopening */
  appliedLocationSelection: any[] = [];
  /** Backup of applied Area selection so it survives clearDependentFilters and shows when reopening */
  appliedAreaSelection: any[] = [];
  searchByOptPageSize = 50;
  currentAreaIndex = 0;
  locationBatchSize = 20;
  pageNumber = 0;
  pageSizeLocation = 100;
  allLocationData: any[] = [];
  originalLocationData: any[] = [];
  currentLocationIndex = 0;

  // for multipale RM assign
  isAssignedAllCustomer = false;
  disableAssignButton = true; // Initially, button is disabled
  selectedCustomers: Set<number> = new Set(); // To store selected customer IDs
  selectedCustomerDetails: Map<number, { customerName: string, customerId: string, pan: string, rmId: string, customerType: number }> = new Map();
  appliedFilterDataList: any[] = [];
  // filteredKeyValueList: any[] = [];
  ignoreKeys = ["paginationFROM", "paginationTO", "role", "sortDirection", "type", "subPersona", "opportunity", "personaUpper",
    "mainPersona", "preApproved", "sortField", "code", "name", "hsbcwallet", "share", "cities", "segments", "rmUsers", "catOrAnd", "location",
    "Area", "Category", "Countries", "Subsidiarycountry"];
  requestedFieldsProspect = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm","parentCompanyName","customerSegmentId","crr","city","country","subsidiary","subsidiaryCountry","segment"];
  requestedFieldsFdi = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm","parentCompanyName","customerSegmentId","crr","city","period","foreignCollaborator","countryName","route","usdAmount"];
  requestedFieldsOdi = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm","parentCompanyName","customerSegmentId","crr","city","period","entityName","type","countryName","total"];
  requestedFieldsEcb = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm","parentCompanyName","customerSegmentId","crr","city","month","purpose","maturityPeriod","route","usdAmount","lenderCategory"];

  // Filter chips properties
  activeChipDropdown: number | null = null;
  private hideDropdownTimeout: any;
  groupedAppliedFilters: any[] = [];
  showAllFilters: boolean = false;

  // Customer Type toggle properties
  isCustomerTypeActive: boolean = true; // For the toggle (opposite of isCustomerTypeInActive)
  isCustomerTypeActiveSage: Boolean = true;
  isCustomerTypeActiveNewFdi: Boolean = true;
  isCustomerTypeActiveNewOdi: Boolean = true;
  isCustomerTypeActiveNewEcb: Boolean = true;

  // Search object for in corporation.
  searchCriteria = {
    cin: '',
    companyName: '',
    city: [],
    state: [],
    dateOfIncorporation: '',
    etb: '',
    mnc: '',
    reportType: ''
  };

  // sorting object for new gcc
  sortingDirectionIncorporation = {
    'companyNameSortingOrder': null as 'ASC' | 'DESC' | null,
    'citySortingOrder': null as 'ASC' | 'DESC' | null,
    'stateSortingOrder': null as 'ASC' | 'DESC' | null,
    'dateOfIncSortingOrder': null as 'ASC' | 'DESC' | null,
    'myPortfolioCompanyNameSortingOrder': null as 'ASC' | 'DESC' | null,
    'relatedMncCompanyNameSortingOrder': null as 'ASC' | 'DESC' | null
  }

  // Search object for new Gcc.
  searchCriteriaNewGcc = {
    announcementDateValues: [],
    announcementDateFinalValues: [],
    gccNameValue: '',
    hqValues: [],
    hqFinalValues: [],
    locationValues: [],
    locationFinalValues: [],
    parentNameValue: '',
    etbValues: 'All',
    grmValue: '',
    industryVertical: ''
  };

  // sorting object for new gcc
  sortingDirectionNewGcc = {
    'announcementDateSortingOrder': null as 'ASC' | 'DESC' | null,
    'gccNameSortingOrder': null as 'ASC' | 'DESC' | null,
    'parentNameSorting': null as 'ASC' | 'DESC' | null,
    'industryVerticalSortingOrder': null as 'ASC' | 'DESC' | null,
    'grmSorting': null as 'ASC' | 'DESC' | null,
    'etbSorting': null as 'ASC' | 'DESC' | null,
    'hqSorting': null as 'ASC' | 'DESC' | null,
    'locationSorting': null as 'ASC' | 'DESC' | null,
  }
  newGccSortingOrder: 'ASC' | 'DESC' = 'DESC';
  newGccCurrentSortField: string = null;
  // for new gcc
  locationSearchOptions: string[] = [];
  fullLocationOptions: string[] = [];

  hqSearchOptions: string[] = [];
  fullHqOptions: string[] = [];

  etbOptions: Observable<string[]>;
  etbSearchOptions: string[] = [];

  announcementDateSearchOptions: string[] = [];
  fullannouncementDateOptions: string[] = [];


  hqCtrl = new FormControl('');
  locationCtrl = new FormControl('');
  empCode: any;

  userId: any = null;
  roleId: any = null;
  roleTypeId: any = null;
  catOrAnd: any = '2';

  readonly RADIO_BUTTON_VALUE_MAP: any = {
    "Availed From": {
      "1": "None",
      "2": "Only Competition",
      "3": "Only HSBC",
      "4": "Both HSBC & Competition"
    },
    "Sanction/Utilization": {
      "1": "Sanction",
      "0": "Utilization"
    },
    "Listing Status": {
      "1": "Listed",
      "0": "Unlisted",
      "1,2": "All"
    },
    "Financial Year": {
      "1": "Previous Financial Year",
      "0": "Current Financial Year"
    }
  };

  customerTypes: any[] = [this.constants.CustomerType.ETB, this.constants.CustomerType.TARGET];
  customerTypesFdiOdiEcb: any[] = [this.constants.CustomerType.FDI, this.constants.CustomerType.ODI, this.constants.CustomerType.ECB];
  // customerTypesList:any[] = [{ label: 'All', value: 0 }, ...Object.entries( this.constants.CustomerType).map( ([key, value]) => ({label: key, value: value}))];
  customerTypesListTemp: any[] = [{ label: 'All', value: 0 }, { label: 'ETB', value: 1 }, { label: 'TARGET', value: 2 }, { label: 'SAGE Prospects', value: 3 }, { label: 'FDI Prospects', value: 4 }, { label: 'ODI Prospects', value: 5 }, { label: 'ECB Prospects', value: 6 }];

  debounceEventForFilter = _.debounce((event) => this.getSaveRiskSearchDetails(event), 600, {});
  filterStates: FilterState = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };
  protected readonly consValue = Constants;
  constructor(public dialog: MatDialog, private service: MsmeService, public commonService: CommonService, private router: Router, private msmeService: MsmeService,
    private existingProspectsDropDownService: ExistingProspectsDropDownService, private fb: FormBuilder, private commonMethod: CommonMethods,
    private loaderService: LoaderService, private datePipe: DatePipe, private prospectsfilterStorageService: ProspectsFilterStorageService, private excelDownload: ExcelDownloadService,
    private filterMasterService: FilterMasterService, private cd: ChangeDetectorRef, private route: ActivatedRoute) {

    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    this.empCode = Number(this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true));
    this.roleTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true));

  }

  // CreateCampaignPopup(): void {
  //   if(this.selectedCustomers && this.selectedCustomers?.size>0){
  //     const selectedCustomerDetailsArray = Array.from(this.selectedCustomerDetails.values());
  //     const dialogRef = this.dialog.open(CreateCampaignProspectPopupComponent, {
  //       panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
  //       data: {
  //         customerCount: this.selectedCustomers?.size,
  //         selectedCustomers: selectedCustomerDetailsArray,
  //         filterDataList: this.appliedFilterDataList,
  //         // filteredKeyValueList: this.filteredKeyValueList,
  //         isNTB: true,
  //       }
  //     });

  //     dialogRef.afterClosed().subscribe(result => {
  //       if (result?.payload) {
  //         this.assignCustomerToRmAndSaveCampaign(true, result?.payload);
  //       }
  //     });
  //   }else{
  //     this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
  //   }
  // }


  CreateCampaignPopup(): void {

    let totalSizeForPagination = this.totalSize;
    if (this.customerType === this.constants.CustomerType.FDI) {
      totalSizeForPagination = this.fdiTotalSize;
    } else if (this.customerType === this.constants.CustomerType.ODI) {
      totalSizeForPagination = this.odiTotalSize;
    } else if (this.customerType === this.constants.CustomerType.ECB) {
      totalSizeForPagination = this.ecbTotalSize;
    }
    const isAllPagesSelected = this.isManualAllPagesSelected === true && totalSizeForPagination > 0;
    console.log("isAllPagesSelected:::> ", isAllPagesSelected)
    if ((this.selectedCustomers && this.selectedCustomers.size > 0) || isAllPagesSelected) {
      const selectedCustomerDetailsArray = Array.from(this.selectedCustomerDetails.values());
      console.log("selectedCustomerDetailsArray :::", selectedCustomerDetailsArray)
      let request: any = {};
      request["type"] = 'Prospects';
      request["customerType"] = this.customerType;
      var json = this.applyFilter(null);
      json["paginationFROM"] = 0;
      json["paginationTO"] = totalSizeForPagination;
      request.filterJson = JSON.stringify(json);
      const customerCount = isAllPagesSelected ? totalSizeForPagination : this.selectedCustomers.size;
      console.log("customerCount:::> ", customerCount)
      const dialogRef = this.dialog.open(CreateCampaignProspectPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
        data: {
          // customerCount: this.isAssignedAllCustomer ? totalSizeForPagination : this.selectedCustomers?.size,
          customerCount: customerCount,
          selectedCustomers: selectedCustomerDetailsArray,
          filterDataList: this.appliedFilterDataList,
          // filteredKeyValueList: this.filteredKeyValueList,
          isNTB: true,
          getCustomerPayload: request,
          isAssignedAllCustomer: isAllPagesSelected,
          customerTypeId: this.customerType,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.payload) {
          // Skip addToTargetCustomers for TARGET customerType (2) — directly save campaign
          if (this.customerType === this.constants.CustomerType.TARGET) {
            this.saveCampaign(result.payload);
          } else {
            this.assignCustomerToRmAndSaveCampaign(true, result?.payload);
          }
        }
      });
    } else {
      this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
    }
  }



  assignCustomerToRmAndSaveCampaign(isForSaveCampaign?: Boolean, payloadToSave?: any): void {
    this.dashboardResponse = {
      aggregateTurnoverFromGst: '',
      companyName: null,
      address: '',
      lendingBankersCount: null,
      cmr: '',
      pan: null,
      cin: null,
      charges: '',
      creditRating: null,
      city: '',
      pinCode: null,
      fullBureauConsent: null,
      partialBureauConsent: null,
      downloadFinancialConsent: null,
      contactNo: '',
      personal: '',
      turnOver: '',
      prioritySectorLendind: '',
      employeeCode: '',
      customerType: this.constants.CustomerType.PROSPECTS,
      rmId: this.empCode,
      rmUserName: null,
      customerIdList: [...this.selectedCustomers],
      previousRmId: null,
      isRmAssign: true,
      isTarget: false,
      assignmentRemarks: 'Assigned under Campaign'
    };

    console.log('this.dashboardResponse: ', this.dashboardResponse);
    this.addToTarget(isForSaveCampaign, payloadToSave);
  }

  saveCampaign(payload: any) {
    this.msmeService.saveOrUpdateCampaignDetails(payload, false).subscribe((response: any) => {
      if (response && response.status == 200) {
        this.commonService.successSnackBar(response.message);
        const permissionData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
        // const pageData = permissionData
        //   ?.find(page => page.pageId == this.consValue.pageMaster.PORTFOLIO_ANALYSIS)
        //   ?.subpages?.find(subpage => subpage.subpageId == this.consValue.pageMaster.CAMPAIGN_DASHBOARD)
        //   ?.subSubpages?.find(subSubpage => subSubpage.subpageId == this.consValue.pageMaster.NTB_CAMPAIGN_DASHBOARD);
        const portfolioAnalysis = permissionData?.find(page => page.pageId == this.consValue.pageMaster.PORTFOLIO_ANALYSIS);
        const campaignDashboard = portfolioAnalysis?.subpages?.find(sub => sub.subpageId == this.consValue.pageMaster.CAMPAIGN_DASHBOARD);
        const pageData = campaignDashboard?.subSubpages?.find(sub => sub.subpageId == this.consValue.pageMaster.NTB_CAMPAIGN_DASHBOARD);
        this.router.navigate(['hsbc/opportunity-dashboard-ntb'], { state: { data: pageData } });
      } else if (response && response.status == 400) {
        this.commonService.warningSnackBar(response.message);
      } else if (response && response.status == 500) {
        this.commonService.errorSnackBar(response.message);
      }
    }, (error) => {
      this.commonService.errorSnackBar('Something Went Wrong');
    });
  }

  ngOnInit() {
    // Hide main loader immediately - we'll use subloader for table data
    this.loaderService.hide();
    if (history?.state?.companyName) {
      this.companySearch = history?.state?.companyName;
    }
    this.pageData = history.state.data;
    if (history.state) {
      if (history.state.data && history.state.data.isNewFilter != null && history.state.data.isNewFilter != undefined) {
        this.isNewFilter = history.state.data.isNewFilter;
      } else if (history.state.isNewFilter != null && history.state.isNewFilter != undefined) {
        this.isNewFilter = history.state.isNewFilter;
      }
    }
    
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmTargetsProspectsFind';
    GlobalHeaders['x-main-page'] = 'Find Prospect';
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('with_pageTitle_searchForm');

    this.initializeAllFromModel();

    this.personaAllOptions = this.existingProspectsDropDownService.getPersonaAllOptions();
    this.personaMap = this.existingProspectsDropDownService.getPersonaMap();
    this.initializeColumnArrays();

    let topBarMasterJson = this.commonService.getStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT);
    if (topBarMasterJson && topBarMasterJson !== undefined && topBarMasterJson !== "undefined") {
      let filterListMasterTemp = JSON.parse(JSON.parse(topBarMasterJson));
      if (filterListMasterTemp) {
        this.topBarFilters = filterListMasterTemp.topBarFilters;
        this.pincodeMaster = this.commonService.getStorageAesEncryption("pincodeMaster");
        const keyFilterNames = ['Category', 'Countries', 'SubsidiaryCountry'];
        const hasEmptyOptions = (this.topBarFilters || []).some(
          f => keyFilterNames.includes(f.name) && (!f.optionFilter || f.optionFilter.length === 0)
        );
        if (hasEmptyOptions) {
          this.storedTopBarFiltersForMerge = filterListMasterTemp.topBarFilters || [];
          this.getTopBarFilter(true);
        } else {
          this.setupSearchByMenu();
        }
      } else {
        this.getTopBarFilter(true);
      }
    } else {
      this.getTopBarFilter(true);
    }
    // Robust parsing for filterJson
    const storedFilter = this.commonService.getStorageAesEncryption(this.constants.FILTER_JSON_FIND_PROSPECT);
    console.log("Raw Stored Filter:", storedFilter);
    if (storedFilter && storedFilter !== "undefined") {
      try {
        let parsed = JSON.parse(storedFilter);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        this.filterJson = parsed;
        console.log("Parsed FilterJson:", this.filterJson);
      } catch (e) {
        console.error("Error parsing stored filter json", e);
      }
    }
    else {
      // Fallback or empty init
      this.filterJson = null;
    }

    if (this.filterJson) {
      this.applySavedFilter(this.filterJson);
    }

    if (this.pageData?.findProspectTabIndex) {
      this.selectedTabIndex = this.pageData?.findProspectTabIndex;
    }
    // this.onTableTabChange(this.selectedTabIndex);

    this.getCitiesAndStates(true);
    this.getLocationsAndHqs(true);
    this.getAllCities(true);

    if (this.selectedTabIndex === 0) {
      this.isCustomerTypeInActiveForSage = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.PROSPECTS - 1];
    }

    if (this.selectedTabIndex === 2) {
      this.isCustomerTypeInActiveForNewFdi = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.FDI - 1];
    }

    if (this.selectedTabIndex === 3) {
      this.isCustomerTypeInActiveForNewOdi = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ODI - 1];
    }

    if (this.selectedTabIndex === 4) {
      this.isCustomerTypeInActiveForNewEcb = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ECB - 1];
    }

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(result => {
      this.getCustomerList();
    })


    // Load all filter states from storage
    this.loadAllFilterStates();
    // Start with customer list immediately, don't wait for filters
    this.onTableTabChange(this.selectedTabIndex);
    // Check if current tab needs clean master
    if (!this.hasValidFilterData(this.selectedTabIndex)) {
      this.getInsightFilterMaster(true);
    }

    this.searchValueChanged
      .pipe(debounceTime(300)) // Adjust delay as needed
      .subscribe(({ filter, filterName }) => {
        this.filterlocationDebounce(filter, filterName);
      });

    // Clear Area on initial load and when navigating back from another component (same as TargetsProspectsComponent)
    this.subscribeToRouteAndResetArea();
  }

  /** On initial load and when navigating back to this page: reset Area filter and show all records (same as TargetsProspectsComponent). */
  private subscribeToRouteAndResetArea(): void {
    this.router.events.pipe(
      filter((e: any): e is NavigationEnd => e instanceof NavigationEnd),
      filter((e: NavigationEnd) => (e.urlAfterRedirects || e.url || '').includes('rmTargetsProspectsFind')),
      takeUntil(this.destroy$)
    ).subscribe(() => this.resetAreaFilterOnPageLoad());
  }

  /** Reset Area filter on page load so after Apply → navigate away → back, Area is cleared and all records show (same as TargetsProspectsComponent). */
  private resetAreaFilterOnPageLoad(): void {
    this.clearDependentFilters(['Area']);
    this.clearLocationAreaSelectionFromMenu('Area');
    this.appliedAreaSelection = [];
    const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
    if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
      this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
      this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
    }
    this.allAreaData = [];
    this.originalAreaData = [];
    this.onTableTabChange(this.selectedTabIndex);
  }

  private loadAllFilterStates(): void {

    for (let tabIndex = 0; tabIndex < 5; tabIndex++) {
      if (tabIndex === 1) continue; // Skip unused index 1
      const masterJson = this.commonService.getStorageAesEncryption(
        this.prospectsfilterStorageService.getFilterStorageKey(tabIndex)
      );

      if (masterJson && masterJson !== "undefined") {
        try {
          const cleanedJson = masterJson.replace(/[\x00-\x1F\x7F]/g, '');
          const filterListMasterTemp = JSON.parse(JSON.parse(cleanedJson));

          if (filterListMasterTemp && filterListMasterTemp.length > 0) {
            // Use existing setFilterState method for consistency
            this.setFilterState(filterListMasterTemp, tabIndex);
          }
        } catch (error) {
          console.error(`Error loading filter state for tab ${tabIndex}:`, error);
        }
      }
    }
  }

  private hasValidFilterData(tabIndex: number): boolean {
    return this.filterStates[tabIndex] &&
      Array.isArray(this.filterStates[tabIndex]) &&
      this.filterStates[tabIndex].length > 0;
  }

  //For Subsidries Country
  getFirstCountry(countries: string | null | undefined): string {
    if (!countries) return '-';
    const countryList = this.getCountryList(countries);
    return countryList[0] || '-';
  }

  hasMultipleCountries(countries: string | null | undefined): boolean {
    if (!countries) return false;
    return this.getCountryList(countries).length > 1;
  }

  getAdditionalCountriesCount(countries: string | null | undefined): number {
    if (!countries) return 0;
    const countryList = this.getCountryList(countries);
    return countryList.length > 1 ? countryList.length - 1 : 0;
  }

  getCountryList(countries: string | null | undefined): string[] {
    if (!countries) return [];
    return countries.split(',')
      .map(country => country.trim())
      .filter(country => country !== '');
  }

  getAllCountries(countries: string | null | undefined): string[] {
    return this.getCountryList(countries);
  }

  showCountriesPopup = false;

  toggleCountriesPopup(): void {
    this.showCountriesPopup = !this.showCountriesPopup;
  }

  //For Subsidories
  getFirstSubsidory(subsidories: string | null | undefined): string {
    if (!subsidories) return '';
    const subsidoryList = this.getSubsidoryList(subsidories);
    return subsidoryList[0] || '';
  }

  hasMultipleSubsidories(subsidories: string | null | undefined): boolean {
    if (!subsidories) return false;
    return this.getSubsidoryList(subsidories).length > 1;
  }

  getAdditionalSubsidoriesCount(subsidories: string | null | undefined): number {
    if (!subsidories) return 0;
    const subsidoryList = this.getSubsidoryList(subsidories);
    return subsidoryList.length > 1 ? subsidoryList.length - 1 : 0;
  }

  getSubsidoryList(subsidories: string | null | undefined): string[] {
    if (!subsidories) return [];
    return subsidories.split(',')
      .map(subsidory => subsidory.trim())
      .filter(subsidory => subsidory !== '');
  }

  getAllSubsidories(subsidories: string | null | undefined): string[] {
    return this.getSubsidoryList(subsidories);
  }

  showPersonasPopup = false;

  togglePersonasPopup(): void {
    this.showPersonasPopup = !this.showPersonasPopup;
  }

  setFilterState(filterListMaster: any[], tabIndex?: number) {
    if (tabIndex !== undefined) {
      // Set for specific tab only
      // this.filterStates[tabIndex] = _.cloneDeep(filterListMaster);
      this.filterStates[tabIndex] = filterListMaster;
    } else {
      // Set for all tabs (default behavior for clean master)
      for (let index = 0; index < 5; index++) {
        if (index !== 1) { // Skip unused index 1 completely
          this.filterStates[index] = _.cloneDeep(filterListMaster);
          this.saveAppliedFilter(index);
        }
      }
    }
  }

  getSaveRiskSearchDetails(event: KeyboardEvent) {
    if (event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    if (this.companySearch.charAt(this.companySearch.length - 1) === " ") {
      return;
    }

    if (!this.commonService.isObjectNullOrEmpty(this.companySearch) && this.companySearch.length <= 3) {
      return;
    }
    // if (typeof this.companySearch != 'string' || this.companySearch.length <= 3) {
    //   this.companyNameList = [];
    //   this.clearFilterFormValue();
    //   return;
    // }

    this.getCustomerList('prospectSearch');
  }

  onSearchTypeChange(event: any) {
    this.companyNameList = [];
    this.companySearch = '';
    this.clearFilterFormValue();
  }

  saveIndividualGstUdhyamSaveRiskApi() {
    GlobalHeaders['x-page-action'] = 'Search By Selected Company';

    // Persist search state
    let filterJson: any = {};
    this.onProspectSearch(filterJson);
    console.log("Saving Search State:", JSON.stringify(filterJson));
    this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_FIND_PROSPECT, JSON.stringify(filterJson));

    let reqData: any = {}
    reqData['isMcaEntity'] = (this.entityType === 'MCA') ? true : false;
    if (this.selectSearchType == 'PAN') {
      if (this.companySearch.length >= 10 && !this.panRegex.test(this.companySearch)) {
        this.commonService.warningSnackBar('Please Enter Valid Pan');
        return;
      } else if (this.entityType === 'MCA' && !this.mcaPanRegex.test(this.companySearch)) {
        this.commonService.warningSnackBar('Please Enter Valid Pan Format For Selected Search Type');
        return;
      } else if (this.entityType === 'NON-MCA' && !this.nonMcaPanRegex.test(this.companySearch)) {
        this.commonService.warningSnackBar('Please Enter Valid Pan Format For Selected Search Type');
        return;
      }
      reqData['pan'] = this.companySearch;
      reqData['tabType'] = 'PAN';
    }
    else if (this.selectSearchType == 'CIN') {
      reqData['cin'] = this.companySearch;
      reqData['tabType'] = 'CIN';
    }
    else {
      const selectedCompany = this.companyNameList.filter(a => a.companyName == this.companySearch || a.cin == this.companySearch || a.pan == this.companySearch);
      if (selectedCompany.length <= 0) {
        this.commonService.warningSnackBar('Select company name from given list');
        return;
      }
      reqData['cin'] = selectedCompany[0].cin;
      reqData['pan'] = selectedCompany[0].pan;
      reqData['name'] = selectedCompany[0].companyName;
      reqData['tabType'] = 'COMPANY';
      this.pan = selectedCompany[0].pan;
    }

    reqData['roleId'] = this.roleId;
    reqData['roleTypeId'] = this.roleTypeId;
    console.log('request saveIndividualGstUdhyamSaveRiskApi::::::::::> ', reqData);

    this.service.saveIndividualGstUdhyamSaveRiskApi(reqData).subscribe(
      (res: any) => {
        console.log('saveIndividualGstUdhyamSaveRiskApi::::::::::> ', res.data);
        if (res.status == 200 && res.data) {

          // if(this.commonService.isObjectNullOrEmpty(res.data?.pan)) {
          //   this.commonService.warningSnackBar('Selected company Pan Or Cin not found');
          //   return;
          // }
          const customer = {
            panNo: res.data?.pan,
            cin: res.data?.cin
          }

          this.navigateToViewComponent(customer, "BySearch");
        }
        else if (res.status === 208) {
          // if (res.flag) {
          //     this.commonService.warningSnackBar('Entity is already added to Target');
          //   }
          if (res.data.type.toLowerCase() === 'etb' || res.data.type.toLowerCase() === 'target') {
            res.data.isDiffCompanyName = this.selectSearchType == 'COMPANY' && !this.commonService.isObjectNullOrEmpty(res?.data?.companyName) && res?.data?.companyName.toLowerCase() !== reqData['name'].toLowerCase();
            if (res.data.isDiffCompanyName) {
              res.data.diffCompanyName = res?.data.companyName;
            }
            this.InactiveActiveCSEM_Popup(res.data);
          }
          else {
            // if(this.selectSearchType == 'COMPANY' && !this.commonService.isObjectNullOrEmpty(res?.data?.companyName) && res?.data?.companyName.toLowerCase() !== reqData['name'].toLowerCase()) {
            //   this.commonService.warningSnackBar('Customer is already available in '+ res?.data?.type+ ' dashboard and componay name is '+ res?.data.companyName);
            // }
            // else{
            //   this.commonService.warningSnackBar('Customer is already available in '+ res?.data?.type+ ' dashboard');
            // }
            res.data.isDiffCompanyName = this.selectSearchType == 'COMPANY' && !this.commonService.isObjectNullOrEmpty(res?.data?.companyName) && res?.data?.companyName.toLowerCase() !== reqData['name'].toLowerCase();
            if (res.data.isDiffCompanyName) {
              res.data.diffCompanyName = res?.data.companyName;
            }
            if (res.data.customerTypeId) {
              res.data.customerTypeId = res?.data.customerTypeId;
            }

            this.InactiveActiveCSEM_Popup(res.data);
          }
        }
        else {
          this.commonService.warningSnackBar(res.message ?? 'Something went Wrong')
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      });
  }


  InactiveActiveCSEM_Popup(popuData: any): void {
    this.dialog.open(InactiveCsemCompanyPopupComponent, { panelClass: ['popupMain_design'], data: popuData || [] }).afterClosed().subscribe(result => {
      if (result == 'Yes') {
        let isRMSame = popuData.rmId == this.empCode ? true : popuData.relatedRmSame;

        let hitType: string = 'ByVieiw';

        if (popuData?.customerTypeId == Constants.CustomerType.PROSPECTS || popuData?.customerTypeId == Constants.CustomerType.FDI
          || popuData?.customerTypeId == Constants.CustomerType.ODI || popuData?.customerTypeId == Constants.CustomerType.ECB) {
          hitType = 'BySearch';
        }

        const customer = {
          name: popuData?.companyName,
          panNo: popuData?.pan,
          cin: popuData?.cin,
          rmId: popuData?.rmId,
          customerType: popuData?.customerTypeId,
          isRMSame: isRMSame
        }
        this.navigateToViewComponent(customer, hitType);
        console.log('result:::::::: ', result, "Customer::::::::::::>", customer);
      }
    });
  }

  addToTarget(isForSaveCampaign?: Boolean, payloadToSave?: any) {
    if (this.commonService.isObjectIsEmpty(this.dashboardResponse.pan) || this.commonService.isObjectIsEmpty(this.dashboardResponse.cin)) {
      this.commonService.warningSnackBar('Pan Or cin not found from  customer');
      return;
    }
    GlobalHeaders['x-page-action'] = 'Add To Target';
    const empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
    if (empCode) {
      this.dashboardResponse.employeeCode = empCode;
    }
    this.service.addToTargetIndvidualCustomer(this.dashboardResponse).subscribe((res: any) => {
      if (res.status == 200) {
        if (!isForSaveCampaign)
          this.commonService.successSnackBar('given RM assign successfully');

        if (isForSaveCampaign) {
          this.saveCampaign(payloadToSave);
        }
        else {
          if (this.disableAssignButton) {
            // let pageDatas: any = [];

            const routerData = { pan: this.dashboardResponse.pan, tabId: 2, isFromFindProspect: true }; // Data to pass
            // this.commonMethod.getUserPermissionData(
            //   this.userId, this.roleId, Constants.pageMaster.TARGETS_AND_PROSPECTS,
            //   (pageData: any) => {
            //     pageDatas = pageData?.[0];
            //     // console.log('pageData::::::::::> ', pageData);
            //     this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: pageDatas, dataFrom: this.pageData, isFromParentPage: true } });
            //   }
            // );
            const pageDatas = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.EXISTING_PORTFOLIO)
            this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: pageDatas, dataFrom: this.pageData, isFromParentPage: true } });
          }

          this.getCustomerList();
          this.selectedCustomers.clear();
          this.selectedCustomerDetails.clear();
          this.isAssignedAllCustomer = false;
        }
      }
      else if (res.status == 208) {
        this.commonService.warningSnackBar('Customer is already available in ' + res?.data?.type + ' dashboard');
      } else {
        this.commonService.warningSnackBar('Something went Wrong')
      }
    });
  }

  // Filter Sidebar Toggle
  isFilterSidebarOpen: boolean = false;

  openAdvancedFilter(isFromSaveFilterPopup?,savedFilter?:FilterListItem, filterName?): void {
    let categoryIndex = (filterName != undefined || filterName != null) ? this.filterStates[this.selectedTabIndex].findIndex(filter1 => filter1.filterName === filterName) : undefined;
    const dialogRef = this.dialog.open(FilterSidebarNewComponent, {
      panelClass: ['popupMain_design', 'advanced_filter_dialog', 'right_side_popup'],
      data: {
        filterListMaster: this.filterStates[this.selectedTabIndex] || [],
        isProcessing: this.isLoadingSubject.asObservable(),
        customerTypeInActive: this.getCustomerTypeInActive(),
        customerType: this.customerType,
        isFromSaveFilterPopup : isFromSaveFilterPopup,
        savedFilter : savedFilter,
        selectedCategoryIndex: categoryIndex >= 0 ? categoryIndex : undefined // Pass the category index
      }
    });

    dialogRef.componentInstance.close.subscribe(() => {
      dialogRef.close();
    });

    dialogRef.componentInstance.apply.subscribe((data: any) => {
      // Update the local filterListMaster with the changes from the popup
      this.filterStates[this.selectedTabIndex] = data.filterListMaster;

      switch (this.selectedTabIndex) {
        case 0:
          this.isCustomerTypeInActiveForSage = data.customerTypeInActive;
          this.isCustomerTypeActiveSage = !data.customerTypeInActive;
          break;
        case 2:
          this.isCustomerTypeInActiveForNewFdi = data.customerTypeInActive;
          this.isCustomerTypeActiveNewFdi = !data.customerTypeInActive;
          break;
        case 3:
          this.isCustomerTypeInActiveForNewOdi = data.customerTypeInActive;
          this.isCustomerTypeActiveNewOdi = !data.customerTypeInActive;
          break;
        case 4:
          this.isCustomerTypeInActiveForNewEcb = data.customerTypeInActive;
          this.isCustomerTypeActiveNewEcb = !data.customerTypeInActive;
          break;
      }


      // Save to storage
      this.saveAppliedFilter(this.selectedTabIndex);

      // Update applied filters list for display
      const finalFilterJson = this.applyFilter(null);
      this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);

      // Trigger the customer list refresh with updated filters
      this.getCustomerList();
      dialogRef.close();
    });

    dialogRef.componentInstance.reset.subscribe(() => {
      console.log('Reset filters');
      // Reset filters and reload data
      this.removeFilter();
      dialogRef.close();
    });
  }

  private getCustomerTypeInActive(): boolean {
    switch (this.selectedTabIndex) {
      case 0:
        return !!this.isCustomerTypeInActiveForSage;
      case 2:
        return !!this.isCustomerTypeInActiveForNewFdi;
      case 3:
        return !!this.isCustomerTypeInActiveForNewOdi;
      case 4:
        return !!this.isCustomerTypeInActiveForNewEcb;
      default:
        return false;
    }
  }

  toggleFilterSidebar(): void {
    this.openAdvancedFilter();
  }

  // Customize Columns
  selectedColumns: string[] = [];
  allColumns: string[] = [];
  defaultColumns: string[] = [];
  mandatoryColumns: string[] = [];

  selectedColumnsFdi: string[] = [];
  allColumnsFdi: string[] = [];
  defaultColumnsFdi: string[] = [];
  mandatoryColumnsFdi: string[] = [];

  selectedColumnsOdi: string[] = [];
  allColumnsOdi: string[] = [];
  defaultColumnsOdi: string[] = [];
  mandatoryColumnsOdi: string[] = [];

  selectedColumnsEcb: string[] = [];
  allColumnsEcb: string[] = [];
  defaultColumnsEcb: string[] = [];
  mandatoryColumnsEcb: string[] = [];

  CustomizeColumn_popup() {
    let data;
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
       data = {
        allColumns: this.allColumns,
        selectedColumns: this.selectedColumns,
        defaultColumns: this.defaultColumns,
        mandatoryColumns: this.mandatoryColumns
      };
    } else if(this.customerType == this.constants.CustomerType.FDI) {
      data = {
        allColumns: this.allColumnsFdi,
        selectedColumns: this.selectedColumnsFdi,
        defaultColumns: this.defaultColumnsFdi,
        mandatoryColumns: this.mandatoryColumnsFdi
      }
    } else if(this.customerType == this.constants.CustomerType.ODI) {
      data = {
        allColumns: this.allColumnsOdi,
        selectedColumns: this.selectedColumnsOdi,
        defaultColumns: this.defaultColumnsOdi,
        mandatoryColumns: this.mandatoryColumnsOdi
      }
    } else if(this.customerType == this.constants.CustomerType.ECB) {
      data = {
        allColumns: this.allColumnsEcb,
        selectedColumns: this.selectedColumnsEcb,
        defaultColumns: this.defaultColumnsEcb,
        mandatoryColumns: this.mandatoryColumnsEcb
      }
    }
    const dialogRef = this.dialog.open(CustomizeColumnsPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2'],
      data: data,
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.customerType == this.constants.CustomerType.PROSPECTS) {
          this.selectedColumns = result;
          this.selectedColumns.forEach(element => {
            let columnName = CUSTOMIZE_COLUMN[element];
            if (columnName != undefined && !this.requestedFieldsProspect.includes(columnName)) {
              this.requestedFieldsProspect.push(columnName);
            }
          });
        } else if(this.customerType == this.constants.CustomerType.FDI) {
          this.selectedColumnsFdi = result;
          this.selectedColumns.forEach(element => {
            let columnName = CUSTOMIZE_COLUMN[element];
            if (columnName != undefined && !this.requestedFieldsFdi.includes(columnName)) {
              this.requestedFieldsFdi.push(columnName);
            }
          });
        } else if(this.customerType == this.constants.CustomerType.ODI) {
          this.selectedColumnsOdi = result;
          this.selectedColumns.forEach(element => {
            let columnName = CUSTOMIZE_COLUMN[element];
            if (columnName != undefined && !this.requestedFieldsOdi.includes(columnName)) {
              this.requestedFieldsOdi.push(columnName);
            }
          });
        } else if(this.customerType == this.constants.CustomerType.ECB) {
          this.selectedColumnsEcb = result;
          this.selectedColumns.forEach(element => {
            let columnName = CUSTOMIZE_COLUMN[element];
            if (columnName != undefined && !this.requestedFieldsEcb.includes(columnName)) {
              this.requestedFieldsEcb.push(columnName);
            }
          });
        }
        this.getCustomerList();
      }
    });
  }

  openCustomizeColumnsPopup(): void {
    this.CustomizeColumn_popup();
  }

  private initializeColumnArrays(): void {
    this.allColumns = [
      'PAN',
      'Name Of Customer',
      'City',
      'Country',
      'Subsidiary Country',
      'Global RM',
      'Parent Company Name',
      'Subsidiary Company',
      'Segment',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Customer type","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    this.defaultColumns = [
      'PAN',
      'Name Of Customer',
      'City',
      'Country',
      'Subsidiary Country',
      'Global RM',
      'Parent Company Name',
      'Subsidiary Company',
      'Segment'
    ];

    this.mandatoryColumns = [
      'Name Of Customer',
      'PAN'
    ]

    this.allColumnsFdi = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'Period',
      'USD in Million',
      'country',
      'Foreign Collaborator',
      'Route',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Segment","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    this.defaultColumnsFdi = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'Period',
      'USD in Million',
      'country',
      'Foreign Collaborator',
      'Route'
    ];

    this.mandatoryColumnsFdi = [
      'Name Of Customer',
      'PAN'
    ]

    this.allColumnsOdi = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'Period',
      'USD In Million',
      'country',
      'Entity Name',
      'Type',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Segment","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    this.defaultColumnsOdi = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'Period',
      'USD In Million',
      'country',
      'Entity Name',
      'Type'
    ];

    this.mandatoryColumnsOdi = [
      'Name Of Customer',
      'PAN'
    ]
    
    this.allColumnsEcb = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'period',
      'Amount USD M',
      'Lender Category',
      'Purpose',
      'Maturity',
      'Route',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Segment","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    this.defaultColumnsEcb = [
      'PAN',
      'Name Of Customer',
      'Customer type',
      'City',
      'period',
      'Amount USD M',
      'Lender Category',
      'Purpose',
      'Maturity',
      'Route',
    ];

    this.mandatoryColumnsEcb = [
      'Name Of Customer',
      'PAN'
    ]

    let selectedColumnsString = this.commonService.getStorageAesEncryption(this.constants.SELECTED_COLUMNS_FIND_PROSPECT);
    
    if (selectedColumnsString != null && selectedColumnsString != undefined) {
      let selectedColumns = JSON.parse(JSON.parse(selectedColumnsString));
      this.selectedColumnsJson = selectedColumns;
      if (this.selectedColumnsJson.selectedColumns) {
        this.selectedColumns = selectedColumns.selectedColumns;
        this.selectedColumns.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFieldsProspect.includes(columnName)) {
            this.requestedFieldsProspect.push(columnName);
          }
        });
      } else {
        this.selectedColumns = [...this.selectedColumns];
      }
      if (this.selectedColumnsJson.selectedColumnsFdi) {
        this.selectedColumnsFdi = selectedColumns.selectedColumnsFdi;
        this.selectedColumnsFdi.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFieldsProspect.includes(columnName)) {
            this.requestedFieldsFdi.push(columnName);
          }
        });
      } else {
        this.selectedColumnsFdi = [...this.defaultColumnsFdi];
      }
      if (this.selectedColumnsJson.selectedColumnsOdi) {
        this.selectedColumnsOdi = selectedColumns.selectedColumnsOdi;
        this.selectedColumnsOdi.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFieldsProspect.includes(columnName)) {
            this.requestedFieldsOdi.push(columnName);
          }
        });
      } else {
        this.selectedColumnsOdi = [...this.defaultColumnsOdi];
      }
      if (this.selectedColumnsJson.selectedColumnsEcb) {
        this.selectedColumnsEcb = selectedColumns.selectedColumnsEcb;
        this.selectedColumnsEcb.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFieldsProspect.includes(columnName)) {
            this.requestedFieldsEcb.push(columnName);
          }
        });
      } else {
        this.selectedColumnsEcb = [...this.defaultColumnsEcb];
      }
    } else {
      this.selectedColumns = [...this.defaultColumns];
      this.selectedColumnsFdi = [...this.defaultColumnsFdi];
      this.selectedColumnsOdi = [...this.defaultColumnsOdi];
      this.selectedColumnsEcb = [...this.defaultColumnsEcb];
    }
  }


  // Active Filter Chips Methods
  hasActiveFilters(): boolean {
    // Check search form filters
    const hasSearchFilters = Object.keys(this.searchForm.controls).some(key => {
      const value = this.searchForm.get(key)?.value;
      return value && value !== '' && value !== null && value !== undefined;
    });

    // Check top bar filters
    const hasTopBarFilters = this.topBarFilters?.some(filter =>
      filter.selectedFilter && filter.selectedFilter.length > 0
    );

    // Check sidebar filters
    const hasSidebarFilters = this.getActiveSidebarFilters().length > 0;

    return hasSearchFilters || hasTopBarFilters || hasSidebarFilters;
  }

  removeFilterChip(controlName: string): void {
    this.searchForm.get(controlName)?.setValue('');
    this.getCustomerList();
  }

  removeTopBarFilterChip(topBarFilter: any, value: any): void {
    const index = topBarFilter.selectedFilter.indexOf(value);
    if (index >= 0) {
      topBarFilter.selectedFilter.splice(index, 1);
    }
    this.getCustomerList(null, topBarFilter.name);
  }

  removeSidebarFilterChip(filter: any): void {
    // Find and clear the specific sidebar filter
    if (filter.filterKey && filter.filterIndex !== undefined) {
      const filterGroup = this.filterStates[this.selectedTabIndex]?.[filter.filterIndex];
      if (filterGroup) {
        filterGroup.insightTwoFilter.forEach((f2: any) => {
          if (f2.keyName === filter.filterKey) {
            if (f2.type === 'checkbox') {
              f2.selected = [];
              if (f2.json && f2.json.keys) {
                f2.json.keys.forEach((key: any) => {
                  key.selected = false;
                  if (key.subKeys) {
                    key.subKeys.forEach((subKey: any) => {
                      subKey.selected = false;
                    });
                  }
                });
              }
            } else if (f2.type === 'radioButton') {
              f2.json.value = 'All';
            } else if (f2.type === 'minMax') {
              f2.json.min = '';
              f2.json.max = '';
              f2.json.minRaw = null;
              f2.json.maxRaw = null;
            } else if (f2.type === 'date') {
              f2.json.fromDate = '';
              f2.json.toDate = '';
            }
            f2.json.count = 0;
          }
        });
        filterGroup.count = 0;
      }
    }
    this.getCustomerList();
  }

  clearAllFilters(): void {
    // Clear search form
    this.removeValueFromControl();

    // Clear top bar filters
    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
    });

    // Clear sidebar filters
    if (this.filterStates && this.filterStates[this.selectedTabIndex]) {
      this.filterStates[this.selectedTabIndex].forEach((filterGroup: any) => {
        filterGroup.count = 0;
        filterGroup.insightTwoFilter.forEach((f2: any) => {
          if (f2.type === 'checkbox') {
            f2.selected = [];
            if (f2.json && f2.json.keys) {
              f2.json.keys.forEach((key: any) => {
                key.selected = false;
                if (key.subKeys) {
                  key.subKeys.forEach((subKey: any) => {
                    subKey.selected = false;
                  });
                }
              });
            }
          } else if (f2.type === 'radioButton') {
            f2.json.value = null;
          } else if (f2.type === 'minMax') {
            f2.json.min = '';
            f2.json.max = '';
            f2.json.minRaw = null;
            f2.json.maxRaw = null;
          } else if (f2.type === 'date') {
            f2.json.fromDate = '';
            f2.json.toDate = '';
          }
          f2.json.count = 0;
        });
      });
    }

    // Clear applied filters list
    this.appliedFilterDataList = [];

    // Regenerate grouped filters list
    this.generateGroupedAppliedFilters();

    this.getCustomerList();
  }

  getActiveSidebarFilters(): any[] {
    const activeFilters: any[] = [];

    if (!this.filterStates || !this.filterStates[this.selectedTabIndex]) {
      return activeFilters;
    }

    this.filterStates[this.selectedTabIndex].forEach((filterGroup: any, groupIndex: number) => {
      if (filterGroup.count > 0) {
        filterGroup.insightTwoFilter.forEach((f2: any) => {
          if (f2.json && f2.json.count > 0) {
            if (f2.type === 'checkbox' && f2.selected && f2.selected.length > 0) {
              f2.selected.forEach((value: any) => {
                activeFilters.push({
                  label: f2.name,
                  value: this.getCheckboxLabel(f2, value),
                  filterKey: f2.keyName,
                  filterIndex: groupIndex
                });
              });
            } else if (f2.type === 'radioButton' && f2.json.value !== 'All') {
              activeFilters.push({
                label: f2.name,
                value: f2.json.value,
                filterKey: f2.keyName,
                filterIndex: groupIndex
              });
            } else if (f2.type === 'minMax') {
              const min = f2.json.min || f2.json.minRaw;
              const max = f2.json.max || f2.json.maxRaw;
              if (min || max) {
                activeFilters.push({
                  label: f2.name,
                  value: `${min || 'Min'} - ${max || 'Max'}`,
                  filterKey: f2.keyName,
                  filterIndex: groupIndex
                });
              }
            } else if (f2.type === 'date') {
              if (f2.json.fromDate || f2.json.toDate) {
                activeFilters.push({
                  label: f2.name,
                  value: `${f2.json.fromDate || 'Start'} to ${f2.json.toDate || 'End'}`,
                  filterKey: f2.keyName,
                  filterIndex: groupIndex
                });
              }
            }
          }
        });
      }
    });

    return activeFilters;
  }

  getCheckboxLabel(filter: any, value: any): string {
    if (filter.json && filter.json.keys) {
      for (const key of filter.json.keys) {
        if (key.value === value) {
          return key.name;
        }
        if (key.subKeys) {
          for (const subKey of key.subKeys) {
            if (subKey.value === value) {
              return subKey.name;
            }
          }
        }
      }
    }
    return value;
  }

  getFilterOptionName(topBarFilter: any, value: any): string {
    const option = topBarFilter.optionFilter?.find((opt: any) => opt.value === value);
    return option ? option.name : value;
  }

  getPersonaLabel(value: string): string {
    const option = this.personaAllOptions?.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('with_pageTitle_searchForm');
  }

  displayFn(user: Company): string {
    return user && user.name ? user.name : '';
  }

  onSearchParamChange(searchValue: any): void {
    if (searchValue.length <= 3) {
      this.clearFilterFormValue();
    }
  }

  clearFilterFormValue() {
    this.page = 1;
    this.customerList = this.customerListTemp;
    this.totalSize = this.totalSizeTemp;
  }

  toggleSort(column: string,direction:string, tabType) {
    if (tabType == 'PROSPECT') {
      // if (this.currentSortField === column) {
      //   this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
      // }
      // else {
      //   this.currentSortField = column;
      //   this.sortDirection = 'ASC';
      // }
         if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    }
    else if (tabType == 'FDI') {
      // if (this.fdiCurrentSortField === column) {
      //   this.fdiSortDirection = this.fdiSortDirection === 'ASC' ? 'DESC' : 'ASC';
      // }
      // else {
      //   this.fdiCurrentSortField = column;
      //   this.fdiSortDirection = 'ASC';
      // }
         if(this.fdiCurrentSortField != column){
      this.fdiCurrentSortField=column;
    }
    this.fdiSortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    }
    else if (tabType == 'ODI') {
      // if (this.odiCurrentSortField === column) {
      //   this.odiSortDirection = this.odiSortDirection === 'ASC' ? 'DESC' : 'ASC';
      // }
      // else {
      //   this.odiCurrentSortField = column;
      //   this.odiSortDirection = 'ASC';
      // }
         if(this.odiCurrentSortField != column){
      this.odiCurrentSortField=column;
    }
    this.odiSortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    }
    else if (tabType == 'ECB') {
      // if (this.ecbCurrentSortField === column) {
      //   this.ecbSortDirection = this.ecbSortDirection === 'ASC' ? 'DESC' : 'ASC';
      // }
      // else {
      //   this.ecbCurrentSortField = column;
      //   this.ecbSortDirection = 'ASC';
      // }
      if(this.ecbCurrentSortField != column){
      this.ecbCurrentSortField=column;
      }
    this.ecbSortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    }

    this.getCustomerList();
  }

  getControl(controlName: string) {
    return this.searchForm.get(controlName);
  }

  getControlValue(controlName: string) {
    return this.searchForm.get(controlName)?.value;
  }

  initializeAllFromModel() {
    this.initForm();
    this.fdiInitForm();
    this.odiInitForm();
    this.ecbInitForm();
  }

  initForm() {
    this.searchForm = this.fb.group({
      applicationCode: [''],
      name: [''],
      persona: "ALL",
      region: [''],
      city: [[]],  // Changed to array for multi-select
      country: [''],
      countries: [[]],
      subsidiaryCountry: [''],
      subsidiary: [''],
      globalRm: [''],
      parentCompanyName: [''],
      segment: ['']
    });
    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.searchForm.valueChanges.pipe(
      // skip(1),
      debounceTime(600),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(currentFormValue => {
      const currentName = currentFormValue.name;
      const isNameChanged = (currentName !== previousNameValue);
      previousNameValue = currentName;
      if (isNameChanged) {
        if (!this.commonService.isObjectNullOrEmpty(currentName) && currentName.length <= 3) {
          return;
        }
        else {
          this.getCustomerList();
        }
      }
      else {
        this.getCustomerList();
      }
    })
  };

  fdiInitForm() {
    this.fdiSearchForm = this.fb.group({
      name: [''],
      applicationCode: [''],
      // persona: "ALL",
      // opportunity: 'CUA',
      period: [''],
      city: [''],
      cities: [[]],
      route: [''],
      foreignCollab: [''],
      country: [''],
      countries: [[]],
      dates: [[]],
      customerTypes: [[]],
      fdiAmount: [''],
    });

    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.fdiSearchForm.valueChanges.pipe(
      // skip(1),
      debounceTime(700),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(currentFormValue => {
      const currentName = currentFormValue.name;
      const isNameChanged = (currentName !== previousNameValue);
      previousNameValue = currentName;
      if (isNameChanged) {
        if (!this.commonService.isObjectNullOrEmpty(currentName) && currentName.length <= 3) {
          return;
        }
        else {
          this.getCustomerList();
        }
      }
      else {
        this.getCustomerList();
      }
    });
  };

  odiInitForm() {
    this.odiSearchForm = this.fb.group({
      name: [''],
      applicationCode: [''],
      // persona: "ALL",
      // opportunity: 'CUA',
      period: [''],
      city: [''],
      cities: [[]],
      country: [''],
      odiAmount: [''],
      countries: [[]],
      entityName: [''],
      type: [''],
      dates: [[]],
      customerTypes: [[]]

    });

    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.odiSearchForm.valueChanges.pipe(
      // skip(1),
      debounceTime(700),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(currentFormValue => {
      const currentName = currentFormValue.name;
      const isNameChanged = (currentName !== previousNameValue);
      previousNameValue = currentName;
      if (isNameChanged) {
        if (!this.commonService.isObjectNullOrEmpty(currentName) && currentName.length <= 3) {
          return;
        }
        else {
          this.getCustomerList();
        }
      }
      else {
        this.getCustomerList();
      }
    });
  };

  ecbInitForm() {
    this.ecbSearchForm = this.fb.group({
      name: [''],
      applicationCode: [''],
      // persona: "ALL",
      // opportunity: 'CUA',
      period: [''],
      city: [''],
      cities: [[]],
      route: [''],
      purpose: [''],
      dates: [[]],
      maturityPeriod: [''],
      ecbAmount: [''],
      lenderCategory: [''],
      customerTypes: [[]]
    });

    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.ecbSearchForm.valueChanges.pipe(
      // skip(1),
      debounceTime(700),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(currentFormValue => {
      const currentName = currentFormValue.name;
      const isNameChanged = (currentName !== previousNameValue);
      previousNameValue = currentName;
      if (isNameChanged) {
        if (!this.commonService.isObjectNullOrEmpty(currentName) && currentName.length <= 3) {
          return;
        }
        else {
          this.getCustomerList();
        }
      }
      else {
        this.getCustomerList();
      }
    });
  };

  getPeriodDateFormat(date: any): string {
    let tempDate = "";
    if (this.customerType == this.constants.CustomerType.ODI) {
      tempDate = this.datePipe.transform(date, 'MMM yyyy');
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      tempDate = this.datePipe.transform(date, 'MMM -yy');
    }
    else {
      tempDate = this.datePipe.transform(date, 'MMM d yyyy');
    }
    if (tempDate?.startsWith('Sept')) {
      tempDate = tempDate.replace('Sept', 'Sep');
    }
    return tempDate;
  }

  applyFilter(searchType?: string, isCallApi?: boolean, flType?: any) {

    let finalFilterJson = {};
    finalFilterJson["type"] = this.customerType;

    if (!this.commonService.isObjectNullOrEmpty(this.companySearch)) {
      searchType = 'prospectSearch';
    }
    else {
      searchType = 'tableSearch';
    }

    finalFilterJson["catOrAnd"] = this.catOrAnd;

    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      if (searchType == 'prospectSearch') {
        this.onProspectSearch(finalFilterJson);
      }
      else {
        const formValues = this.searchForm.value;
        if (formValues.name) {
          finalFilterJson['name'] = formValues.name;
        }
        if (formValues.applicationCode) {
          finalFilterJson['code'] = formValues.applicationCode;
        }
        if (formValues.region) {
          finalFilterJson['region'] = formValues.region;
        }
        // City is now an array from multi-select dropdown
        if (formValues.city != null && Array.isArray(formValues.city) && formValues.city.length > 0) {
          finalFilterJson['cities'] = formValues.city;
          console.log('Adding cities to request:', formValues.city);
        }

        if (formValues.country) {
          finalFilterJson['countriess'] = formValues.country;
        }

        if (formValues.subsidiaryCountry) {
          finalFilterJson['subsidiaryCountry'] = formValues.subsidiaryCountry;
        }

        if (formValues.subsidiary) {
          finalFilterJson['subsidiary'] = formValues.subsidiary;
        }

        if (formValues.globalRm) {
          finalFilterJson['globalRm'] = formValues.globalRm;
        }
        if (formValues.parentCompanyName) {
          finalFilterJson['parentCompanyName'] = formValues.parentCompanyName;
        }
        if (formValues.segment) {
          finalFilterJson['segmentss'] = formValues.segment;
        }
      }

      if (this.currentSortField) {
        finalFilterJson["sortField"] = this.currentSortField;
      }
      if (this.sortDirection) {
        finalFilterJson["sortDirection"] = this.sortDirection;
      }

      this.customerInactiveForSage = false;
      if (this.isCustomerTypeInActiveForSage) {
        finalFilterJson["CustomerType"] = [Constants.INACTIVE_CUSTOMER];
        this.customerInactiveForSage = true;
      }

      finalFilterJson["paginationFROM"] = (this.page - 1) * this.pageSize;
      finalFilterJson["paginationTO"] = this.pageSize;

      this.topBarFilters.forEach(f1 => {
        if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
          if (f1.name == 'City' && flType === 'City') {
            const hasChanged = !this.arraysEqual(f1.selectedFilter, this.previousCitySelection);
            if (isCallApi && f1.isCallApi && f1.isApiCalled == false) {
              this.isCityApiCalled = true;
              if (hasChanged) {
                this.clearDependentFilters(['Location', 'Area']);
                this.clearLocationAreaSelectionFromMenu('Location');
                this.clearLocationAreaSelectionFromMenu('Area');
                this.appliedLocationSelection = [];
                this.appliedAreaSelection = [];
                // Clear Location and Area search box when city selection changes
                const locOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
                const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
                if (locOpt?.dataset_id != null && this.searchByDataHistory[locOpt.dataset_id]) {
                  this.searchByDataHistory[locOpt.dataset_id].searchValue = '';
                  this.searchByDataHistory[locOpt.dataset_id].isCalled = false;
                }
                if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
                  this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
                  this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
                }
              }
              this.getLocation(f1?.selectedFilter, null, f1.name);
              f1.isApiCalled = true;
              this.previousCitySelection = [...f1.selectedFilter];
            } else {
              this.isCityApiCalled = false;
            }
          }
          if (f1.name == 'Location' && this.isCityApiCalled) {
            f1.selectedFilter = [];
          } else {
            if (flType === 'Location') {
              const hasLocationChanged = !this.arraysEqual(f1.selectedFilter, this.previousLocationSelection);
              if (hasLocationChanged) {
                this.clearDependentFilters(['Area']);
                this.clearLocationAreaSelectionFromMenu('Area');
                this.appliedAreaSelection = [];
                // Clear Area search box when location selection changes
                const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
                if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
                  this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
                  this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
                }
              }
              this.getLocation(f1?.selectedFilter, null, f1.name);
              f1.isApiCalled = true;
              this.previousLocationSelection = [...f1.selectedFilter];
            }
          }
          if (f1.selectedFilter.length > 0) {
            const filteredValues = f1.selectedFilter.filter(val => val !== 'All');
            if (filteredValues.length > 0) {
              finalFilterJson[f1?.spKeyName] = filteredValues;
            }
          }
        }
      });
    }
    else if (this.customerType == this.constants.CustomerType.FDI) {
      if (searchType == 'prospectSearch') {
        this.onProspectSearch(finalFilterJson);
      }
      else {
        const formValues = this.fdiSearchForm.value;
        if (formValues.name) {
          finalFilterJson['name'] = formValues.name;
        }
        if (formValues.applicationCode) {
          finalFilterJson['code'] = formValues.applicationCode;
        }
        // if(formValues.city) {
        //   finalFilterJson['city'] = formValues.city;
        // }
        if (formValues.cities != null && !this.commonService.isObjectIsEmpty(formValues.cities)) {
          finalFilterJson['cities'] = formValues.cities;
        }
        if (formValues.foreignCollab) {
          finalFilterJson['foreignCollab'] = formValues.foreignCollab;
        }
        if (formValues.countries != null && !this.commonService.isObjectIsEmpty(formValues.countries)) {
          finalFilterJson['countriess'] = formValues.countries;
        }
        if (formValues.route) {
          finalFilterJson['fdiRoute'] = formValues.route;
        }

        if (formValues.dates != null && !this.commonService.isObjectIsEmpty(formValues.dates)) {
          finalFilterJson['fdiPeriod'] = formValues.dates;
        }

        if (formValues.customerTypes != null && !this.commonService.isObjectIsEmpty(formValues.customerTypes)) {
          finalFilterJson['customerTypes'] = formValues.customerTypes.filter((temp: any) => temp !== 0);
        }

        if (formValues.fdiAmount) {
          finalFilterJson['fdiAmount'] = formValues.fdiAmount;
        }

      }

      this.customerInactiveForNewFdi = false;
      if (this.isCustomerTypeInActiveForNewFdi) {
        finalFilterJson["CustomerType"] = [Constants.INACTIVE_CUSTOMER];
        this.customerInactiveForNewFdi = true;
      }

      finalFilterJson["paginationFROM"] = (this.fdiPage - 1) * this.fdiPageSize;
      finalFilterJson["paginationTO"] = this.fdiPageSize;

      if (this.fdiCurrentSortField) {
        finalFilterJson["sortField"] = this.fdiCurrentSortField;
      }
      if (this.fdiSortDirection) {
        finalFilterJson["sortDirection"] = this.fdiSortDirection;
      }
    }
    else if (this.customerType == this.constants.CustomerType.ODI) {

      if (searchType == 'prospectSearch') {
        this.onProspectSearch(finalFilterJson);
      }
      else {
        const formValues = this.odiSearchForm.value;
        if (formValues.name) {
          finalFilterJson['name'] = formValues.name;
        }
        if (formValues.applicationCode) {
          finalFilterJson['code'] = formValues.applicationCode;
        }
        // if(formValues.city) {
        //   finalFilterJson['city'] = formValues.city;
        // }
        if (formValues.cities != null && !this.commonService.isObjectIsEmpty(formValues.cities)) {
          finalFilterJson['cities'] = formValues.cities;
        }

        if (formValues.foreignCollab) {
          finalFilterJson['fdiAmount'] = formValues.foreignCollab;
        }
        if (formValues.countries != null && !this.commonService.isObjectIsEmpty(formValues.countries)) {
          finalFilterJson['countriess'] = formValues.countries;
        }
        if (formValues.entityName) {
          finalFilterJson['entityName'] = formValues.entityName;
        }
        if (formValues.type) {
          finalFilterJson['odiType'] = formValues.type;
        }

        if (formValues.dates != null && !this.commonService.isObjectIsEmpty(formValues.dates)) {
          finalFilterJson['odiPeriod'] = formValues.dates;
        }

        if (formValues.odiAmount) {
          finalFilterJson['odiAmount'] = formValues.odiAmount;
        }

        if (formValues.customerTypes != null && !this.commonService.isObjectIsEmpty(formValues.customerTypes)) {
          finalFilterJson['customerTypes'] = formValues.customerTypes.filter((temp: any) => temp !== 0);
        }
      }

      this.customerInactiveForNewOdi = false;
      if (this.isCustomerTypeInActiveForNewOdi) {
        finalFilterJson["CustomerType"] = [Constants.INACTIVE_CUSTOMER];
        this.customerInactiveForNewOdi = true;
      }

      finalFilterJson["paginationFROM"] = (this.odiPage - 1) * this.odiPageSize;
      finalFilterJson["paginationTO"] = this.odiPageSize;
      if (this.odiCurrentSortField) {
        finalFilterJson["sortField"] = this.odiCurrentSortField;
      }
      if (this.odiSortDirection) {
        finalFilterJson["sortDirection"] = this.odiSortDirection;
      }
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      if (searchType == 'prospectSearch') {
        this.onProspectSearch(finalFilterJson);
      }
      else {
        const formValues = this.ecbSearchForm.value;
        if (formValues.name) {
          finalFilterJson['name'] = formValues.name;
        }
        if (formValues.applicationCode) {
          finalFilterJson['code'] = formValues.applicationCode;
        }

        if (formValues.cities != null && !this.commonService.isObjectIsEmpty(formValues.cities)) {
          finalFilterJson['cities'] = formValues.cities;
        }
        if (formValues.purpose) {
          finalFilterJson['ecbPurpose'] = formValues.purpose;
        }
        if (formValues.route) {
          finalFilterJson['ecbRoute'] = formValues.route;
        }
        if (formValues.dates != null && !this.commonService.isObjectIsEmpty(formValues.dates)) {
          finalFilterJson['ecbPeriod'] = formValues.dates;
        }
        if (formValues.maturityPeriod) {
          finalFilterJson['ecbMaturityPeriod'] = formValues.maturityPeriod;
        }

        if (formValues.foreignCollab) {
          finalFilterJson['ecbAmount'] = formValues.foreignCollab;
        }
        if (formValues.lenderCategory) {
          finalFilterJson['ecbLenderCategory'] = formValues.lenderCategory;
        }

        if (formValues.ecbAmount) {
          finalFilterJson['ecbAmount'] = formValues.ecbAmount;
        }

        if (formValues.customerTypes != null && !this.commonService.isObjectIsEmpty(formValues.customerTypes)) {
          finalFilterJson['customerTypes'] = formValues.customerTypes.filter((temp: any) => temp !== 0);
        }

      }

      this.customerInactiveForNewEcb = false;
      if (this.isCustomerTypeInActiveForNewEcb) {
        finalFilterJson["CustomerType"] = [Constants.INACTIVE_CUSTOMER];
        this.customerInactiveForNewEcb = true;
      }

      finalFilterJson["paginationFROM"] = (this.ecbPage - 1) * this.ecbPageSize;
      finalFilterJson["paginationTO"] = this.ecbPageSize;
      if (this.ecbCurrentSortField) {
        finalFilterJson["sortField"] = this.ecbCurrentSortField;
      }
      if (this.ecbSortDirection) {
        finalFilterJson["sortDirection"] = this.ecbSortDirection;
      }
    }

    let role = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    if (role) {
      finalFilterJson["role"] = role;
    }
    let role_type = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true));
    if (role_type) {
      finalFilterJson["role_type"] = role_type;
    }

    // finalFilterJson["persona"]= this.getControlValue("persona");
    if (this.getControlValue("persona")) {
      finalFilterJson["mainPersona"] = this.personaMap[this.getControlValue("persona")]?.group,
        finalFilterJson["subPersona"] = this.personaMap[this.getControlValue("persona")]?.option
    }

    this.filterStates[this.selectedTabIndex]?.forEach(f1 => {
      if (f1.count > 0) {
        f1.insightTwoFilter.forEach(f2 => {
          if (f2?.json?.count > 0) {
            if (f2?.type == "checkbox") {
              if (f2?.keyName === "businessLine") {
                const distinctParents: any[] = [];
                const distinctChildren: any[] = [];
                if (f2.json && f2.json.keys) {
                  f2.json.keys.forEach((parent: any) => {
                    if (parent.selected) distinctParents.push(parent.value);
                    if (parent.subKeys) {
                      parent.subKeys.forEach((child: any) => {
                        if (child.selected) distinctChildren.push(child.value);
                      });
                    }
                  });
                }
                if (distinctParents.length > 0) finalFilterJson["businessLine"] = distinctParents;
                if (distinctChildren.length > 0) finalFilterJson["masterGroupProduct"] = distinctChildren;
              } else {
                finalFilterJson[f2?.keyName] = f2?.selected;
              }
            } else if (f2?.type == "radioButton") {
              if (f2.filterTwoName == 'Listing Status' && !Array.isArray(f2.json.value) && this.isNewFilter) {
                f2.json.value = JSON.parse(f2.json.value);
              }
              if (f2?.json?.value != "All") {
                finalFilterJson[f2?.keyName] = f2?.json?.value;
              }
            } else if (f2?.type == "minMax") {
              finalFilterJson[f2?.keyName] = {};
              // Use raw values (without commas) for backend - minRaw/maxRaw contain numeric values
              // Only include minValue/maxValue if they have actual values (not null, undefined, empty, or NaN)
              const minVal = f2?.json?.minRaw ?? (f2?.json?.min ? parseFloat(f2?.json?.min.toString().replace(/,/g, '')) : null);
              const maxVal = f2?.json?.maxRaw ?? (f2?.json?.max ? parseFloat(f2?.json?.max.toString().replace(/,/g, '')) : null);
              if (minVal !== null && minVal !== undefined && !isNaN(minVal)) {
                finalFilterJson[f2?.keyName]["minValue"] = minVal;
              }
              if (maxVal !== null && maxVal !== undefined && !isNaN(maxVal)) {
                finalFilterJson[f2?.keyName]["maxValue"] = maxVal;
              }
            } else if (f2?.type == "date") {
              finalFilterJson[f2?.keyName] = {};
              finalFilterJson[f2?.keyName]["fromDate"] = f2?.json?.fromDate;
              finalFilterJson[f2?.keyName]["toDate"] = f2?.json?.toDate;
            }
          }
        });
      }
    });

    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        if (f1.name == 'City') {
          if (f1.isCallApi && f1.isApiCalled == false) {
            this.isCityApiCalled = true;
            //  this.getPincodeFromCity(f1?.selectedFilter);
            f1.isApiCalled = true;
          } else {
            this.isCityApiCalled = false;
          }
        }
        if (f1.name == 'Pincode' && this.isCityApiCalled) {
          f1.selectedFilter = [];
        }
        if (f1.selectedFilter.length > 0) {
          const filteredValues = f1.selectedFilter.filter(val => val !== 'All');
          if (filteredValues.length > 0) {
            finalFilterJson[f1?.spKeyName] = filteredValues;
          }
        }
      }
    });

    this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
    // this.createFilteredList(finalFilterJson);

    return finalFilterJson;
  }

  onProspectSearch(finalFilterJson: any) {
    console.log("Saving Prospect Search:", { selectSearchType: this.selectSearchType, entityType: this.entityType, companySearch: this.companySearch });
    if (this.selectSearchType == 'PAN') {
      this.companySearch = this.companySearch.toUpperCase();
      finalFilterJson['code'] = this.companySearch;
    }
    else if (this.selectSearchType == 'CIN') {
      finalFilterJson['cin'] = this.companySearch;
    }
    else if (this.selectSearchType == 'COMPANY') {
      finalFilterJson['name'] = this.companySearch;
      this.getSaveRiskSearchData();
    }
    finalFilterJson['isSearchCompany'] = true;
    finalFilterJson['entityType'] = this.entityType;
    finalFilterJson['selectSearchType'] = this.selectSearchType;
  }

  isCityApiCalled: boolean = false;
  isLocationApiCalled: boolean = false;
  getPincodeFromCity(cityList) {
    let req: any = { cityList: cityList };
    this.msmeService.getPincodeByCity(req).subscribe(
      (response: any) => {
        if (response && response.status == 200 && response.data) {
          const i = this.topBarFilters.findIndex((x) => x.name === "Pincode");
          this.topBarFilters[i].optionFilter = response.data;;
          this.topBarFilters[i].selectedFilter = [];
        } else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }

  selectedColumnsJson:any = {};
  getCustomerList(searchType?: string, fltype?: any): void {
    let request: any = {};
    var json = this.applyFilter(searchType, true, fltype);
    this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_FIND_PROSPECT, JSON.stringify(json));
    // delete json["persona"];
    request["type"] = 'Prospects';
    request["customerType"] = this.customerType;
    request.filterJson = JSON.stringify(json);
    this.saveAppliedFilter(this.selectedTabIndex);
    this.isProcessing = true;
    this.isLoadingSubject.next(true);
    this.loaderService.subLoaderShow();
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      request.requestedFields = this.requestedFieldsProspect
      this.selectedColumnsJson.selectedColumns = this.selectedColumns;
      this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_FIND_PROSPECT, JSON.stringify(this.selectedColumnsJson));
    } else if(this.customerType == this.constants.CustomerType.FDI) {
      request.requestedFields = this.requestedFieldsFdi
      this.selectedColumnsJson.selectedColumnsFdi = this.selectedColumnsFdi;
      this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_FIND_PROSPECT, JSON.stringify(this.selectedColumnsJson));
    } else if(this.customerType == this.constants.CustomerType.ODI) {
      request.requestedFields = this.requestedFieldsOdi
      this.selectedColumnsJson.selectedColumnsOdi = this.selectedColumnsOdi;
      this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_FIND_PROSPECT, JSON.stringify(this.selectedColumnsJson));
    } else if(this.customerType == this.constants.CustomerType.ECB) {
      request.requestedFields = this.requestedFieldsEcb
      this.selectedColumnsJson.selectedColumnsEcb = this.selectedColumnsEcb;
      this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_FIND_PROSPECT, JSON.stringify(this.selectedColumnsJson));
    }

    request.isNewFilter = this.isNewFilter;
    console.log('getCustomerList request:::::::> ', request);
    this.msmeService.getCustomer(request, true).subscribe((response: any) => {
      this.loaderService.subLoaderHide();
      this.isProcessing = false;
      this.isLoadingSubject.next(false);
      if (response.status == 200 && response?.data) {

        let checkCustomerType = this.customerType;
        let parseResponse: any;
        let customerContains: any;
        if (this.isNewFilter) {
          parseResponse = JSON.parse(response?.data);
          customerContains = parseResponse.data
        } else {
          parseResponse = JSON.parse(response?.data?.result);
          customerContains = JSON.parse(parseResponse.data);
        }
        checkCustomerType = response.map?.customerType ?? this.customerType;

        // const customerTypeValueToName = (value: number): string | undefined => {
        //   return Object.keys(this.customerTypesListTemp).find(
        //     key => this.constants.CustomerType[key as keyof typeof this.constants.CustomerType] === value
        //   );
        // };

        const customerTypeValueToName = (value: number): string | undefined => {
          return this.customerTypesListTemp.find(item => item.value === value)?.label;
        };

        if (!this.commonService.isObjectNullOrEmpty(customerContains)) {
          customerContains.forEach(element => {
            element.customerTypeStr = customerTypeValueToName(element.customerType);
          });
        }

        if (checkCustomerType == this.constants.CustomerType.PROSPECTS) {
          this.customerList = customerContains;
          this.totalSize = parseResponse.counts;
          this.isProspect = true;
          //
          if (this.customerListTemp.length <= 0) {
            this.customerListTemp = this.customerList;
            this.totalSizeTemp = this.totalSize;
          }
        }
        else if (checkCustomerType == this.constants.CustomerType.FDI) {
          this.fdiList = customerContains;
          this.fdiTotalSize = parseResponse.counts;
          this.isFDI = true;

        }
        else if (checkCustomerType == this.constants.CustomerType.ODI) {
          this.odiList = customerContains;
          this.odiTotalSize = parseResponse.counts;
          this.isODI = true;

        }
        else if (checkCustomerType == this.constants.CustomerType.ECB) {
          this.ecbList = customerContains;
          this.ecbTotalSize = parseResponse.counts;
          this.isECB = true;

        }

        this.updateTransformedCustomer();
      }
      else {
        this.commonService.errorSnackBar(response.message)

      }
    }, error => {
      this.loaderService.subLoaderHide();
      this.isProcessing = false;
      this.isLoadingSubject.next(false);
      this.commonService.errorSnackBar('Something Went Wrong')
    });
  };



  saveAppliedFilter(tabIndex: number) {
    this.commonService.setStorageAesEncryption(
      this.prospectsfilterStorageService.getFilterStorageKey(tabIndex),
      JSON.stringify(this.filterStates[tabIndex]));
  }

  isActionAvail(actionId: string): boolean {
    if (!this.pageData) {
      return true
    }
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true;
      }
    }
    return false;
  }

  removeValueFromControl() {
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      this.sortDirection = 'DESC';
      this.currentSortField = null;
      this.searchForm.reset();
    }
    else if (this.customerType == this.constants.CustomerType.FDI) {
      this.fdiSortDirection = 'DESC';
      this.fdiCurrentSortField = null;
      this.fdiSearchForm.reset();
    }
    else if (this.customerType == this.constants.CustomerType.ODI) {
      this.odiSortDirection = 'DESC';
      this.odiCurrentSortField = null;
      this.odiSearchForm.reset();
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      this.ecbSortDirection = 'DESC';
      this.ecbCurrentSortField = null;
      this.ecbSearchForm.reset();
    }
    else {
      this.searchForm.reset();
    }

    this.commonService.removeStorage(this.constants.FILTER_JSON_FIND_PROSPECT);
    this.commonService.removeStorage(this.constants.SELECTED_COLUMNS_FIND_PROSPECT);
    // this.searchForm.valueChanges.pipe(
    //   debounceTime(300),
    //   distinctUntilChanged(),
    //   takeUntil(this.destroy$),
    // ).subscribe(value => {
    //   this.getCustomerList();
    // });
    // setTimeout(() => {
    //   this.getCustomerList();
    // }, 300);
  }

  navigateToViewComponent(customer: any, hitType?: string, otherProp?: any) {
    let topBarFiler: any = {};
    // Do not persist Area so when user navigates to another component and back, Area is reset (same as TargetsProspectsComponent)
    const filtersToSave = (this.topBarFilters || []).map(f =>
      f.name === 'Area' ? { ...f, selectedFilter: [], optionFilter: [] } : f
    );
    topBarFiler["topBarFilters"] = filtersToSave;
    this.commonService.setStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT, JSON.stringify(topBarFiler));
    const routerData = { pan: customer.panNo, tabId: 1, cin: customer.cin, customerType: customer?.customerType ?? null, customerTypeStr: customer?.customerTypeStr};

    let externalRoutData: any = {};
    externalRoutData.hitType = hitType
    externalRoutData.companyName = customer.name
    if (hitType == "BySearch") {
      externalRoutData.isFindProspects = true;
      externalRoutData.isFdiOdiEcbType = this.customerTypesFdiOdiEcb.includes(this.customerType);
    }
    else {
      if (this.roleId != Constants.Role.HEAD_OFFICER) {
        externalRoutData.isFindETB = true;
        externalRoutData.isFindSameRm = customer.isRMSame ?? false;
      }
    }

    // if(!this.commonService.isObjectNullOrEmpty(customer?.rmId)){
    //   let isFindSameRm = false;
    //   isFindSameRm = customer.rmId == this.empCode;
    //   externalRoutData = {hitType: 'ByVieiw', isFindETB: true, isFindSameRm: isFindSameRm, companyName: customer.name};
    // }
    //  else{
    //   externalRoutData = {hitType: hitType, isFindProspects: true, isFdiOdiEcbType: this.customerTypesFdiOdiEcb.includes(this.customerType)}
    // }

    if (routerData.pan) {
      GlobalHeaders['x-page-data'] = routerData.pan;
    } else if (routerData.cin) {
      GlobalHeaders['x-page-data'] = routerData.cin;
    }
    GlobalHeaders['x-page-action'] = 'View  Portfolio';

    this.pageData.findProspectTabIndex = this.selectedTabIndex;
    this.pageData.isFindProspects = true;
    this.pageData.routeLink = "/hsbc/rmTargetsProspectsFind"
    this.pageData.isNewFilter = this.isNewFilter;
    if (this.selectedTabIndex === 0) {
      this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActiveForSage;
    }

    if (this.selectedTabIndex === 2) {
      this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActiveForNewFdi;
    }

    if (this.selectedTabIndex === 3) {
      this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActiveForNewOdi;
    }

    if (this.selectedTabIndex === 4) {
      this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActiveForNewEcb;
    }

    let routeData: any = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
    console.log('routeData::::::::> ', routeData);

    let passRouteData: any = this.pageData;
    routeData.forEach(element => {
      // if (element.pageId == 23) {
      //   passRouteData = element;
      //   // break;
      // }
      if (element.pageId == Constants.pageMaster.PORTFOLIO_NEW) {
        element?.subpages?.forEach((subpage: any) => {
          if (subpage.subpageId == Constants.pageMaster.TARGETS_AND_PROSPECTS) {
            passRouteData = subpage;
          }
        });
      }
    });

    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: passRouteData, dataFrom: this.pageData, otherProspect: otherProp, isFromParentPage: true }, queryParams: { externalRoutData: this.commonService.toBTOA(JSON.stringify(externalRoutData)) } });
    // saveActivity(() => {});
    // this.commonMethod.getUserPermissionData(
    //   this.userId, this.roleId, Constants.pageMaster.TARGETS_AND_PROSPECTS,
    //   (pageData: any) => {
    //     pageDatas = pageData?.[0];
    //     console.log('navigateToViewComponent pageDatas:::::::::> ', pageDatas);
    //     this.router.navigate([`/hsbc/rmExisitingPortfolioView`], {state: {routerData, data: pageDatas ,dataFrom : this.pageData, otherProspect:otherProp} , queryParams: {externalRoutData: this.commonService.toBTOA(JSON.stringify(externalRoutData)) }});
    //   }
    // );

  }

  viewAuditPage(customer: any, type: any) {
    this.commonService.setStorage('auditType', type);
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXISTING_TARGET");
    const routerData = { pan: customer.panNo, tabId: 2, apiType: AuditAPIType.API_AUDIT };
    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
  }

  pageAndSizeChange(page: any, isPageChange: boolean, size?: any) {

    // if(isPageChange == true){
    //   this.isAssignedAllCustomer = false;
    // }

    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      this.pageSize = size ?? this.pageSize;
      this.startIndex = (page - 1) * this.pageSize;
      this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    }
    else if (this.customerType == this.constants.CustomerType.FDI) {
      this.fdiPageSize = size ?? this.fdiPageSize;
      this.fdiStartIndex = (page - 1) * this.fdiPageSize;
    }
    else if (this.customerType == this.constants.CustomerType.ODI) {
      this.odiPageSize = size ?? this.odiPageSize;
      this.odiStartIndex = (page - 1) * this.odiPageSize;
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      this.ecbPageSize = size ?? this.ecbPageSize;
      this.ecbStartIndex = (page - 1) * this.ecbPageSize;
    }
    this.getCustomerList();
  }

  // onPageChange(page: any): void {

  //   this.startIndex = (page - 1) * this.pageSize;
  //   this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  //   this.getCustomerList();
  // }

  inCorporationPageSizeChange(pageSize: number, page: number) {
    this.inCorporationPageSize = pageSize;
    this.inCorporationPage = page;
    this.getInCorporation();
  }

  inCorporationOnPageChange(pageNumber: number): void {
    this.inCorporationPage = pageNumber;
    this.inCorporationStartIndex = (pageNumber - 1) * this.inCorporationPageSize;
    this.getInCorporation();
  }

  getSaveRiskSearchData() {

    if (this.companySearch == "") {
      this.companyNameList = [];
      return;
    }

    const data = {
      "searchName": this.companySearch
    }
    this.searchCompanyFound = true;
    this.service.getSaveRiskCompanySearchDetails(data).subscribe((res: any) => {
      this.searchCompanyFound = false;
      if (res.status == 200 && !this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
        this.companyNameList = res.data;
      }
      else {
        this.companyNameList = [];
        if (this.commonService.isObjectNullOrEmpty(this.customerList)) {
          this.commonService.warningSnackBar('Its seems we have not found any Company.')
        }
      };
    });
  }

  onExportExcelPopup(): void {
    GlobalHeaders['x-page-action'] = 'Export Data';
    saveActivity(() => { });
    let request: any = {};
    request["type"] = 'Prospects';
    var filterjson = this.applyFilter();
    filterjson["paginationFROM"] = 0
    filterjson["paginationTO"] = this.totalSize
    // delete filterjson["persona"];
    request.filterJson = JSON.stringify(filterjson);
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      request.requestedFields = this.requestedFieldsProspect
    } else if(this.customerType == this.constants.CustomerType.FDI) {
      request.requestedFields = this.requestedFieldsFdi
    } else if(this.customerType == this.constants.CustomerType.ODI) {
      request.requestedFields = this.requestedFieldsOdi
    } else if(this.customerType == this.constants.CustomerType.ECB) {
      request.requestedFields = this.requestedFieldsEcb
    }
    request.isNewFilter = this.isNewFilter;
    this.dialog.open(ExportExcelPopupComponent, { panelClass: ['popupMain_design'], data: request, disableClose: true, autoFocus: true });
  }

  onExportExcelPopupByTotalSize(totalSize?, reqType?): void {
    GlobalHeaders['x-page-action'] = 'Export Data';
    saveActivity(() => { });
    let request: any = {};
    request["type"] = reqType;
    var filterjson = this.applyFilter();
    filterjson["paginationFROM"] = 0
    filterjson["paginationTO"] = totalSize
    // delete filterjson["persona"];
    request.filterJson = JSON.stringify(filterjson);

    this.dialog.open(ExportExcelPopupComponent, { panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true });
  }

  getTopBarFilter(ignoreLoader?: boolean) {
    this.msmeService.getTopBarFilter("Prospect", ignoreLoader).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {

        for (let index = 0; index < response?.data?.filters.length; index++) {

          if (response?.data?.filters[index].name == 'Pincode') {
            this.pincodeMaster = response?.data?.filters[index].options;
            this.commonService.setStorageAesEncryption("pincodeMaster", JSON.stringify(this.pincodeMaster));
          }
          this.topBarFilters[index] = {
            isCallApi: response?.data?.filters[index].isCallApi,
            name: response?.data?.filters[index].name,
            spKeyName: response?.data?.filters[index].spKeyName,
            searchValue: '',
            optionFilter: response?.data?.filters[index].options,
            selectedFilter: [],
            isApiCallSearch: response?.data?.filters[index].isApiCallSearch
          };

        }
        // Default Location and Area empty; only populate when city/location selected (same as TargetsProspectsComponent)
        const locIdx = this.topBarFilters.findIndex((x) => x.name === 'Location');
        const areaIdx = this.topBarFilters.findIndex((x) => x.name === 'Area');
        if (locIdx !== -1) {
          this.topBarFilters[locIdx].optionFilter = [];
          this.topBarFilters[locIdx].selectedFilter = [];
        }
        if (areaIdx !== -1) {
          this.topBarFilters[areaIdx].optionFilter = [];
          this.topBarFilters[areaIdx].selectedFilter = [];
        }
        if (this.topBarFilters && this.pageData) {
          let topbarFilter = [];
          for (const filter of this.topBarFilters) {
            for (const action of this.pageData.actions) {
              if (typeof action.actionName === 'string') {  // Ensure action is a string
                let act = action.actionName.split('_');
                if (act.length > 1) {
                  if (filter.name.toUpperCase() === act[act.length - 1].toUpperCase()) {
                    topbarFilter.push(filter);
                  }
                }
              } else {
                // Debugging
              }
            }
          }
          this.topBarFilters = topbarFilter;
        }

        if (this.storedTopBarFiltersForMerge && this.storedTopBarFiltersForMerge.length > 0) {
          this.topBarFilters.forEach(apiFilter => {
            const stored = this.storedTopBarFiltersForMerge!.find(s => s.name === apiFilter.name);
            if (stored && Array.isArray(stored.selectedFilter) && stored.selectedFilter.length > 0) {
              apiFilter.selectedFilter = [...stored.selectedFilter];
            }
          });
          this.storedTopBarFiltersForMerge = null;
        }
        // Restore applied filter from storage when filter list was loaded async (e.g. no cached master)
        if (this.filterJson) {
          this.restoreTopBarFiltersFromSavedJson(this.filterJson);
        }
        // Setup Search By Menu Options
        this.setupSearchByMenu();
        // Initialize Sage Prospects city list
        this.sageProspectsCityList = this.getSageProspectsCityList();
      } else {
        this.commonService.errorSnackBar(response.message)

      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
    })
  }

  // Setup Search By Menu from topBarFilters
  setupSearchByMenu() {
    this.searchByOptionsTopBar = this.topBarFilters.map((filter, index) => ({
      key: filter.name,
      filter_name: filter.spKeyName || filter.name.toLowerCase(),
      dataset_id: index + 1,
      dataset_name: filter.spKeyName || filter.name.toLowerCase(),
      options: filter.optionFilter
    }));

    // Initialize searchByDataHistory for each option
    this.searchByOptionsTopBar.forEach(opt => {
      this.searchByDataHistory[opt.dataset_id] = {
        searchValue: '',
        isCalled: false,
        page_offset: 0,
        page_size: this.searchByOptPageSize,
        data: opt.options || [],
        dataset_name: opt.dataset_name
      };
    });

    (this.topBarFilters || []).forEach(filter => {
      const key = filter.spKeyName || filter.name?.toLowerCase?.() || '';
      if (key) {
        this.selectedItemsMap[key] = Array.isArray(filter.selectedFilter) ? [...filter.selectedFilter] : [];
      }
    });
  }

  // Search By Menu Methods
  openFilterView(opt: any, index: number, event: Event, filterType: 'topbar' | 'rm'): void {
    event.stopPropagation();
    this.activeFilterMenu = opt.key;
    this.selectedFilterOption = opt;
    this.selectedFilterType = filterType;
    this.selectedFilterIndex = index;

    if (filterType === 'topbar' && opt.dataset_id) {
      this.isLoadingSearchBy = true;
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter) {
        // Location: show options when city selected; when no city, keep applied selection visible (search → select → Apply → reopen)
        if (matchingFilter.name === 'Location') {
          const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
          const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;
          if (hasCitySelected) {
            const fromBackup = [...this.appliedLocationSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const existing = this.selectedItemsMap[opt.filter_name] || [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter, ...existing])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            if (mergedIds.length > 0) matchingFilter.selectedFilter = [...mergedIds];
            // Always load full location list when opening (no search) so after search+select+apply, unselected options stay visible.
            this.dependantFilters = [];
            this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
            this.searchByDataHistory[opt.dataset_id].searchValue = '';
            this.searchByDataHistory[opt.dataset_id].isCalled = false;
            this.getLocation(this.topBarFilters[cityIndex].selectedFilter, '', 'City');
          } else {
            // No city selected: show full location list (selected + unselected) when reopening, like TargetsProspectsComponent
            const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
            const fromBackup = [...this.appliedLocationSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            if (locationIndex !== -1 && mergedIds.length > 0) {
              this.topBarFilters[locationIndex].selectedFilter = [...mergedIds];
            }
            if (this.allLocationData && this.allLocationData.length > 0) {
              // Use existing list from previous search so selected + unselected locations all show
              this.dependantFilters = (this.allLocationData || [])
                .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                .map((item: any) => ({ key: item.name, value: item.value }));
              const labels = this.selectedOptionLabels[opt.filter_name] || {};
              mergedIds.forEach((selectedId: any) => {
                if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                  const found = this.allLocationData.find((item: any) => item.value === selectedId || item.value == selectedId);
                  const key = found ? found.name : (labels[selectedId] ?? labels[String(selectedId)] ?? 'Selected');
                  this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                }
              });
              this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
              this.searchByDataHistory[opt.dataset_id].searchValue = '';
              this.searchByDataHistory[opt.dataset_id].isCalled = false;
              this.isLoadingSearchBy = false;
            } else {
              // No previous list: load full location list (API may return all when cityList is empty)
              this.dependantFilters = [];
              this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
              this.searchByDataHistory[opt.dataset_id].searchValue = '';
              this.searchByDataHistory[opt.dataset_id].isCalled = false;
              this.getLocation([], '', 'City');
            }
          }
        } else if (matchingFilter.name === 'Area') {
          const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
          const locationOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
          const locationFilterName = locationOpt?.filter_name || 'location';
          const pendingLocation = this.selectedItemsMap[locationFilterName] || [];
          const appliedLocation = (locationIndex !== -1 ? this.topBarFilters[locationIndex].selectedFilter : []) || [];
          const hasLocationSelected = pendingLocation.length > 0 || appliedLocation.length > 0;
          const locationListToUse = pendingLocation.length > 0 ? pendingLocation : appliedLocation;
          if (hasLocationSelected) {
            const fromBackup = [...this.appliedAreaSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const existing = this.selectedItemsMap[opt.filter_name] || [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter, ...existing])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            if (mergedIds.length > 0) matchingFilter.selectedFilter = [...mergedIds];
            // Always load full area list when opening (no search) so after search+select+apply, unselected options stay visible.
            this.dependantFilters = [];
            this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
            this.searchByDataHistory[opt.dataset_id].searchValue = '';
            this.searchByDataHistory[opt.dataset_id].isCalled = false;
            this.getLocation(locationListToUse, '', 'Location');
          } else {
            // No location selected: show full area list (selected + unselected) when reopening, like TargetsProspectsComponent
            const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
            const fromBackup = [...this.appliedAreaSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const existing = this.selectedItemsMap[opt.filter_name] || [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter, ...existing])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            if (areaIndex !== -1 && mergedIds.length > 0) {
              this.topBarFilters[areaIndex].selectedFilter = [...mergedIds];
            }
            if (this.allAreaData && this.allAreaData.length > 0) {
              // Use existing list from previous search so selected + unselected areas all show
              this.dependantFilters = (this.allAreaData || [])
                .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                .map((item: any) => ({ key: item.name, value: item.value }));
              const labels = this.selectedOptionLabels[opt.filter_name] || {};
              mergedIds.forEach((selectedId: any) => {
                if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                  const found = this.allAreaData.find((item: any) => item.value === selectedId || item.value == selectedId);
                  const key = found ? found.name : (labels[selectedId] ?? labels[String(selectedId)] ?? 'Selected');
                  this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                }
              });
              this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
              this.searchByDataHistory[opt.dataset_id].searchValue = '';
              this.searchByDataHistory[opt.dataset_id].isCalled = false;
              this.isLoadingSearchBy = false;
            } else {
              // No previous list: load full area list
              this.dependantFilters = [];
              this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
              this.searchByDataHistory[opt.dataset_id].searchValue = '';
              this.searchByDataHistory[opt.dataset_id].isCalled = false;
              this.getLocation([], '', 'Location');
            }
          }
        } else {
          const rawOptions = matchingFilter.optionFilter || [];
          const validOptions = rawOptions.filter(
            item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
          );
          this.dependantFilters = validOptions
            .filter(item => item.name !== 'All' && item.value !== 'All')
            .map(item => ({ key: item.name, value: item.value }));
          if (this.dependantFilters.length === 0 && this.searchByDataHistory[opt.dataset_id]?.data?.length > 0) {
            const cached = this.searchByDataHistory[opt.dataset_id].data;
            this.dependantFilters = cached.map((item: any) =>
              item.key != null ? { key: item.key, value: item.value } : { key: item.name, value: item.value }
            ).filter((item: any) => item.key !== 'All' && item.value !== 'All');
          }
          this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
        }
      }
      this.isLoadingSearchBy = false;
    }
  }

  goBackToMenu(event: Event): void {
    event.stopPropagation();
    this.activeFilterMenu = null;
    this.selectedFilterOption = null;
    this.selectedFilterType = null;
    this.selectedFilterIndex = null;
  }

  getSearchByIcon(key: string): string {
    if (!key) return 'fas fa-map-marker-alt';
    const iconMap: { [key: string]: string } = {
      'City': 'fas fa-map-marker-alt',
      'Location': 'fas fa-location-arrow',
      'Area': 'fi fi-rr-land-location',
      'Category': 'fas fa-tags',
      'Countries': 'fas fa-globe',
      'Customer': 'fas fa-layer-group',
      'Company Name': 'fas fa-layer-group',
      'RM': 'fas fa-user',
      'Segment': 'fas fa-cube'
    };
    return iconMap[key] || 'fas fa-filter';
  }

  getSelectedCount(filter_name: string): number {
    return this.selectedItemsMap[filter_name]?.length || 0;
  }

  /** Ensures selected Location/Area options are in dependantFilters so they show when reopening after search+select+Apply. */
  private mergeSelectedOptionsIntoDependantFilters(filterName: string): void {
    const selectedIds = this.selectedItemsMap[filterName] || [];
    const labels = this.selectedOptionLabels[filterName] || {};
    const matchingFilter = this.topBarFilters.find(f => (f.spKeyName || f.name?.toLowerCase?.()) === filterName);
    const optionFilter = (matchingFilter && matchingFilter.optionFilter) || [];
    selectedIds.forEach((selectedId: any) => {
      const alreadyInList = this.dependantFilters.some(
        (d: any) => d.value === selectedId || d.value == selectedId || String(d.value) === String(selectedId)
      );
      if (!alreadyInList) {
        let key = labels[selectedId] ?? labels[String(selectedId)];
        if (!key && optionFilter.length > 0) {
          const opt = optionFilter.find((o: any) => o && (o.value === selectedId || o.value == selectedId || String(o.value) === String(selectedId)));
          if (opt && opt.name != null) key = String(opt.name);
        }
        if (!key && this.activeFilterMenu === 'Location' && this.allLocationData?.length > 0) {
          const opt = this.allLocationData.find((o: any) => o && (o.value === selectedId || o.value == selectedId));
          if (opt && opt.name != null) key = String(opt.name);
        }
        if (!key && this.activeFilterMenu === 'Area' && this.allAreaData?.length > 0) {
          const opt = this.allAreaData.find((o: any) => o && (o.value === selectedId || o.value == selectedId));
          if (opt && opt.name != null) key = String(opt.name);
        }
        if (!key) key = 'Selected';
        this.dependantFilters = [{ key: String(key), value: selectedId }, ...this.dependantFilters];
      }
    });
  }

  isFilterValueSelected(filterName: string, value: any): boolean {
    const list = this.selectedItemsMap[filterName];
    if (!list || !Array.isArray(list)) return false;
    return list.some((v: any) => v === value || v == value);
  }

  hasAnyTopBarFilterSelection(): boolean {
    return (this.searchByOptionsTopBar || []).some(opt => this.getSelectedCount(opt.filter_name) > 0);
  }

  onSearchChangeBy(searchValue: string, datasetId: number, datasetName: string) {
    this.searchByDataHistory[datasetId].searchValue = searchValue;
    this.searchByDataHistory[datasetId].isCalled = false;

    const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
    if (matchingFilter) {
      // Location: when empty (no city), search with 3+ chars shows list from API (same as TargetsProspectsComponent)
      if (matchingFilter.name === 'Location') {
        const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
        const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;

        if (!hasCitySelected) {
          if (!searchValue || searchValue.trim().length < 3) {
            this.dependantFilters = [];
            const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
            if (locationIndex !== -1) {
              this.topBarFilters[locationIndex].optionFilter = [];
            }
            return;
          }
          const cityList = cityIndex !== -1 ? (this.topBarFilters[cityIndex].selectedFilter || []) : [];
          this.getLocation(cityList, searchValue, 'City');
          return;
        }
      }

      // Area: when empty (no location), search with 3+ chars shows list from API
      if (matchingFilter.name === 'Area') {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
        const locationOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
        const locationFilterName = locationOpt?.filter_name || 'location';
        const pendingLocation = this.selectedItemsMap[locationFilterName] || [];
        const appliedLocation = (locationIndex !== -1 ? this.topBarFilters[locationIndex].selectedFilter : []) || [];
        const hasLocationSelected = pendingLocation.length > 0 || appliedLocation.length > 0;
        const locationListToUse = pendingLocation.length > 0 ? pendingLocation : appliedLocation;

        if (!hasLocationSelected) {
          if (!searchValue || searchValue.trim().length < 3) {
            this.dependantFilters = [];
            const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
            if (areaIndex !== -1) {
              this.topBarFilters[areaIndex].optionFilter = [];
            }
            return;
          }
          this.getLocation(locationListToUse, searchValue, 'Location');
          return;
        }
      }

      const validOptions = (matchingFilter.optionFilter || []).filter(
        item => item && (item.name != null || item.label != null) && (item.value != null || item.id != null) &&
          String(item.name || item.label || '').trim() !== ''
      );
      const allOptions = validOptions
        .filter(item => (item.name !== 'All' && item.value !== 'All'))
        .map(item => ({
          key: item.name != null ? String(item.name) : String(item.label || ''),
          value: item.value != null ? item.value : item.id
        }))
        .filter(item => item.key !== '');

      if (searchValue.trim().length > 0) {
        this.dependantFilters = allOptions.filter(item =>
          item.key && item.key.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else {
        this.dependantFilters = allOptions;
      }
    } else {
      // Fallback: use cached data when matchingFilter not found so options still show
      const cached = this.searchByDataHistory[datasetId]?.data;
      if (cached && Array.isArray(cached) && cached.length > 0) {
        if (searchValue.trim().length > 0) {
          this.dependantFilters = cached.filter((item: any) =>
            item && item.key && String(item.key).toLowerCase().includes(searchValue.toLowerCase())
          );
        } else {
          this.dependantFilters = [...cached];
        }
      }
    }
  }

  onSelectField(event: any, filterName: string, selectId: any, datasetId: number, itemLabel?: string) {
    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }
    if (event.checked) {
      if (!this.selectedItemsMap[filterName].includes(selectId)) {
        this.selectedItemsMap[filterName].push(selectId);
      }
      if (itemLabel != null && itemLabel !== undefined) {
        if (!this.selectedOptionLabels[filterName]) this.selectedOptionLabels[filterName] = {};
        const label = String(itemLabel);
        this.selectedOptionLabels[filterName][selectId] = label;
        this.selectedOptionLabels[filterName][String(selectId)] = label;
      }
    } else {
      this.selectedItemsMap[filterName] = this.selectedItemsMap[filterName].filter(id => id !== selectId);
      if (this.selectedOptionLabels[filterName]) {
        delete this.selectedOptionLabels[filterName][selectId];
        delete this.selectedOptionLabels[filterName][String(selectId)];
      }
    }
  }

  // Show "All" only when search box is empty. When user types (e.g. "ahme"), hide "All" and show only filtered options.
  shouldShowAllOption(): boolean {
    const searchValue = (this.searchByDataHistory[this.selectedFilterOption?.dataset_id]?.searchValue || '').trim();
    if (searchValue.length > 0) return false;
    const key = this.selectedFilterOption?.key;
    if (key === 'Location' || key === 'Area') {
      return this.dependantFilters != null && this.dependantFilters.length > 0;
    }
    return true;
  }

  // Check if all items are selected
  isAllSelected(filterName: string): boolean {
    if (!filterName) return false;
    const selectedItems = this.selectedItemsMap[filterName] || [];
    if (!this.dependantFilters || this.dependantFilters.length === 0) {
      return selectedItems.includes('All');
    }
    const validSelectedItems = selectedItems.filter(item => item !== 'All' && item !== -1 && item !== null && item !== undefined);
    if (validSelectedItems.length === 0) {
      return false;
    }
    const hasValue = (v: any, val: any) => v === val || v == val;
    return this.dependantFilters.every(item => validSelectedItems.some(v => hasValue(v, item.value)));
  }

  // Check if some but not all items are selected (indeterminate state)
  isIndeterminate(filterName: string): boolean {
    if (!filterName || !this.dependantFilters || this.dependantFilters.length === 0) {
      return false;
    }
    const selectedItems = this.selectedItemsMap[filterName] || [];
    const validSelectedItems = selectedItems.filter(item => item !== 'All' && item !== -1 && item !== null && item !== undefined);
    if (validSelectedItems.length === 0) {
      return false;
    }
    const hasValue = (v: any, val: any) => v === val || v == val;
    const selectedVisibleCount = this.dependantFilters.filter(item => validSelectedItems.some(v => hasValue(v, item.value))).length;
    return selectedVisibleCount > 0 && selectedVisibleCount < this.dependantFilters.length;
  }

  // Select/Deselect all items
  onSelectAll(event: any, filterName: string, datasetId: number) {
    if (!filterName) return;

    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }

    if (event.checked) {
      // Select all visible items
      this.dependantFilters.forEach(item => {
        if (!this.selectedItemsMap[filterName].includes(item.value)) {
          this.selectedItemsMap[filterName].push(item.value);
        }
      });
    } else {
      // Deselect all visible items
      const visibleValues = this.dependantFilters.map(item => item.value);
      this.selectedItemsMap[filterName] = this.selectedItemsMap[filterName].filter(
        value => !visibleValues.includes(value)
      );
    }
  }

  applySearchByFilter() {
    // Determine if city changed using current selection (order-independent: avoid clearing Location when City unchanged)
    const cityOpt = this.searchByOptionsTopBar.find(o => o.key === 'City');
    const cityFilter = this.topBarFilters.find(f => f.name === 'City');
    const currentCitySelection = (cityOpt && this.selectedItemsMap[cityOpt.filter_name]) ? this.selectedItemsMap[cityOpt.filter_name] : [];
    const citySelectionChanged = cityFilter && !this.arraysEqual(currentCitySelection, this.previousCitySelection);

    // If city changed, clear Location and Area (filters + menu state + backups) so user picks location/area for new city
    if (citySelectionChanged) {
      this.clearDependentFilters(['Location', 'Area']);
      this.clearLocationAreaSelectionFromMenu('Location');
      this.clearLocationAreaSelectionFromMenu('Area');
      this.appliedLocationSelection = [];
      this.appliedAreaSelection = [];
      this.previousLocationSelection = [];
      // Clear Location and Area search box when city selection changes
      const locOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
      const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
      if (locOpt?.dataset_id != null && this.searchByDataHistory[locOpt.dataset_id]) {
        this.searchByDataHistory[locOpt.dataset_id].searchValue = '';
        this.searchByDataHistory[locOpt.dataset_id].isCalled = false;
      }
      if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
        this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
        this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
      }
    }

    this.searchByOptionsTopBar.forEach(opt => {
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter && this.selectedItemsMap[opt.filter_name]) {
        matchingFilter.selectedFilter = this.selectedItemsMap[opt.filter_name];

        if (matchingFilter.name === 'City') {
          if (matchingFilter.isCallApi) {
            this.isCityApiCalled = true;
            if (citySelectionChanged) {
              this.getLocation(matchingFilter.selectedFilter, null, matchingFilter.name);
            }
            matchingFilter.isApiCalled = true;
            this.previousCitySelection = [...matchingFilter.selectedFilter];
          } else {
            this.isCityApiCalled = false;
          }
        }

        if (matchingFilter.name === 'Location') {
          if (citySelectionChanged) {
            matchingFilter.selectedFilter = [];
          } else {
            const hasLocationChanged = !this.arraysEqual(matchingFilter.selectedFilter, this.previousLocationSelection);
            if (hasLocationChanged) {
              this.clearDependentFilters(['Area']);
              this.clearLocationAreaSelectionFromMenu('Area');
              this.appliedAreaSelection = [];
              // Clear Area search box when location selection changes
              const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
              if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
                this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
                this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
              }
            }
            this.getLocation(matchingFilter.selectedFilter, null, matchingFilter.name);
            matchingFilter.isApiCalled = true;
            this.previousLocationSelection = [...matchingFilter.selectedFilter];
          }
        }
      }
    });

    // Re-apply Location/Area from menu and set backup so selection shows after Apply → close → open (including when user unchecks all)
    this.searchByOptionsTopBar.forEach(opt => {
      if (opt.key === 'Location') {
        const menuSelection = this.selectedItemsMap[opt.filter_name] ?? [];
        const locFilter = this.topBarFilters.find(f => f.name === 'Location');
        if (locFilter) locFilter.selectedFilter = [...menuSelection];
        this.appliedLocationSelection = [...menuSelection];
      } else if (opt.key === 'Area') {
        const menuSelection = this.selectedItemsMap[opt.filter_name] ?? [];
        const areaFilter = this.topBarFilters.find(f => f.name === 'Area');
        if (areaFilter) areaFilter.selectedFilter = [...menuSelection];
        this.appliedAreaSelection = [...menuSelection];
      }
    });

    this.getCustomerList();

    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
    // Do not clear search box values so user's search text persists after Apply
  }

  resetCurrentFilter(datasetId: number, dataSetName: any, filterName: string) {
    if (filterName && this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];

      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
      if (matchingFilter) {
        matchingFilter.selectedFilter = [];
        matchingFilter.searchValue = '';

        // When City is reset, clear Location and Area (menu selection, search boxes, and data) - same as TargetsProspectsComponent
        if (matchingFilter.name === 'City') {
          this.clearDependentFilters(['Location', 'Area']);
          this.clearLocationAreaSelectionFromMenu('Location');
          this.clearLocationAreaSelectionFromMenu('Area');
          this.appliedLocationSelection = [];
          this.appliedAreaSelection = [];
          this.allLocationData = [];
          this.originalLocationData = [];
          this.allAreaData = [];
          this.originalAreaData = [];
          this.isCityApiCalled = false;
          this.previousCitySelection = [];
          const locOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
          const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
          if (locOpt?.dataset_id != null && this.searchByDataHistory[locOpt.dataset_id]) {
            this.searchByDataHistory[locOpt.dataset_id].searchValue = '';
            this.searchByDataHistory[locOpt.dataset_id].isCalled = false;
          }
          if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
            this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
            this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
          }
        }

        // When Location is reset, clear Area and also clear Location search cache so reopen shows empty (not previous search)
        if (matchingFilter.name === 'Location') {
          this.clearDependentFilters(['Area']);
          this.clearLocationAreaSelectionFromMenu('Area');
          this.appliedLocationSelection = [];
          this.appliedAreaSelection = [];
          this.allLocationData = [];
          this.originalLocationData = [];
          this.allAreaData = [];
          this.originalAreaData = [];
          this.previousLocationSelection = [];
          matchingFilter.optionFilter = [];
          const areaOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Area');
          if (areaOpt?.dataset_id != null && this.searchByDataHistory[areaOpt.dataset_id]) {
            this.searchByDataHistory[areaOpt.dataset_id].searchValue = '';
            this.searchByDataHistory[areaOpt.dataset_id].isCalled = false;
            this.searchByDataHistory[areaOpt.dataset_id].data = [];
          }
        }
        if (matchingFilter.name === 'Area') {
          this.appliedAreaSelection = [];
          this.allAreaData = [];
          this.originalAreaData = [];
          matchingFilter.optionFilter = [];
        }
      }

      if (datasetId && this.searchByDataHistory[datasetId]) {
        this.searchByDataHistory[datasetId].searchValue = '';
        this.searchByDataHistory[datasetId].isCalled = false;
        this.searchByDataHistory[datasetId].data = [];
      }

      if (matchingFilter) {
        const validOptions = (matchingFilter.optionFilter || []).filter(
          item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
        );
        this.dependantFilters = validOptions
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({ key: item.name, value: item.value }));
      }
    }

    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
    this.getCustomerList();
  }

  resetAllSearchByFilters() {
    this.selectedItemsMap = {};
    this.appliedLocationSelection = [];
    this.appliedAreaSelection = [];

    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    this.allLocationData = [];
    this.originalLocationData = [];
    this.allAreaData = [];
    this.originalAreaData = [];
    this.isCityApiCalled = false;
    this.previousCitySelection = [];
    this.previousLocationSelection = [];

    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });

    this.getCustomerList();
  }

  onCheckboxChangeTopBar(event: any, segment: string, topBarFilters: TopBarFilter) {
    this.existingProspectsDropDownService.onCheckboxChangeTopBar(event, segment, topBarFilters);

    if (topBarFilters.name == 'City') {
      if (topBarFilters.selectedFilter && topBarFilters.selectedFilter.length == 0) {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
        if (locationIndex !== -1) {
          this.topBarFilters[locationIndex].optionFilter = [];
          this.topBarFilters[locationIndex].selectedFilter = [];
          this.allLocationData = [];
          this.originalLocationData = [];
        }
        if (areaIndex !== -1) {
          this.topBarFilters[areaIndex].optionFilter = [];
          this.topBarFilters[areaIndex].selectedFilter = [];
          this.allAreaData = [];
          this.originalAreaData = [];
        }
      }
    }

    if (topBarFilters.name == 'Location') {
      if (topBarFilters.selectedFilter && topBarFilters.selectedFilter.length == 0) {
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
        if (areaIndex !== -1) {
          this.topBarFilters[areaIndex].optionFilter = [];
          this.topBarFilters[areaIndex].selectedFilter = [];
          this.allAreaData = [];
          this.originalAreaData = [];
        }
      }
    }
    if (topBarFilters.name == 'City') {
      topBarFilters.isApiCalled = false;
      this.isCityApiCalled = false;
      if (topBarFilters.selectedFilter && topBarFilters.selectedFilter.length == 0) {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
        if (locationIndex !== -1) {
          this.topBarFilters[locationIndex].optionFilter = [];
          this.topBarFilters[locationIndex].selectedFilter = [];
        }
        if (areaIndex !== -1) {
          this.topBarFilters[areaIndex].optionFilter = [];
          this.topBarFilters[areaIndex].selectedFilter = [];
        }
        const i = this.topBarFilters.findIndex((x) => x.name === "Pincode");
        this.topBarFilters[i].optionFilter = this.pincodeMaster;
        this.topBarFilters[i].selectedFilter = [];
      }
    }

    if (topBarFilters.name == 'Location') {
      if (topBarFilters.selectedFilter && topBarFilters.selectedFilter.length == 0) {
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
        if (areaIndex !== -1) {
          this.topBarFilters[areaIndex].optionFilter = [];
          this.topBarFilters[areaIndex].selectedFilter = [];
        }
      }
    }

    // Clear selected customers when top bar filters change
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
  }

  filterCheckBoxTopBar(topBarFilter: TopBarFilter, filterType?: string) {
    if (topBarFilter.isApiCallSearch) {
      if (!topBarFilter.searchValue || topBarFilter.searchValue.length == 0) {
        topBarFilter.optionFilter = [];
      } else if (topBarFilter.searchValue.length > 2) {
        this.getTopbarSearchListFromApi(topBarFilter);
      }
    } else {
      if (filterType === 'Location') {
        const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
        const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;

        if (hasCitySelected) {
          if (!topBarFilter.searchValue || topBarFilter.searchValue.trim() === '') {
            this.allLocationData = [...this.originalLocationData];
          } else {
            const searchLower = topBarFilter.searchValue.toLowerCase();
            this.allLocationData = this.originalLocationData.filter(item =>
              item.name.toLowerCase().includes(searchLower)
            );
          }
          this.currentLocationIndex = this.locationBatchSize;
          topBarFilter.optionFilter = this.allLocationData.slice(0, this.locationBatchSize);
        } else {
          if (topBarFilter.searchValue && topBarFilter.searchValue.length < 3) {
            topBarFilter.optionFilter = [];
            return;
          }
          this.onSearchInputChange(topBarFilter, filterType);
        }
      } else if (filterType === 'Area') {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
        const hasLocationSelected = locationIndex !== -1 && this.topBarFilters[locationIndex].selectedFilter?.length > 0;

        if (hasLocationSelected) {
          if (!topBarFilter.searchValue || topBarFilter.searchValue.trim() === '') {
            this.allAreaData = [...this.originalAreaData];
          } else {
            const searchLower = topBarFilter.searchValue.toLowerCase();
            this.allAreaData = this.originalAreaData.filter(item =>
              item?.name && item.name.toLowerCase().includes(searchLower)
            );
          }
          this.currentAreaIndex = this.locationBatchSize;
          topBarFilter.optionFilter = this.allAreaData.slice(0, this.locationBatchSize);
        } else {
          if (topBarFilter.searchValue && topBarFilter.searchValue.length < 3) {
            topBarFilter.optionFilter = [];
            return;
          }
          this.onSearchInputChange(topBarFilter, filterType);
        }
      } else {
        this.existingProspectsDropDownService.filterCheckBoxTopBar(topBarFilter, filterType);
      }
    }
  }

  /** Restore topBarFilters[].selectedFilter and selectedItemsMap from saved filter JSON (e.g. after navigation). */
  private restoreTopBarFiltersFromSavedJson(filterJson: any): void {
    if (!filterJson || !this.topBarFilters || this.topBarFilters.length === 0) return;

    // Don't restore top bar filters if the data is from table filters (not company search)
    // This applies to all tabs: Prospects, FDI, ODI, ECB
    const isCompanySearch = filterJson.isSearchCompany === true;

    if (!isCompanySearch) {
      // Skip restoration of top bar filters when using table filters
      // This prevents table filter cities from being added to top bar filter
      console.log('Skipping top bar filter restoration for table filters');
      return;
    }

    this.topBarFilters.forEach(f => {
      const key = f.spKeyName || f.name?.toLowerCase?.();
      if (!key) return;
      const val = filterJson[key];
      if (val !== undefined && val !== null) {
        f.selectedFilter = Array.isArray(val) ? [...val] : [val];
      }
    });
    (this.topBarFilters || []).forEach(filter => {
      const key = filter.spKeyName || filter.name?.toLowerCase?.() || '';
      if (key) {
        this.selectedItemsMap[key] = Array.isArray(filter.selectedFilter) ? [...filter.selectedFilter] : [];
      }
    });
    const cityFilter = this.topBarFilters.find(f => f.name === 'City');
    if (cityFilter?.selectedFilter?.length) {
      this.previousCitySelection = [...cityFilter.selectedFilter];
    }
    const locationFilter = this.topBarFilters.find(f => f.name === 'Location');
    if (locationFilter?.selectedFilter?.length) {
      this.previousLocationSelection = [...locationFilter.selectedFilter];
    }
  }

  applySavedFilter(filterJson) {
    console.log("Applying Saved Filter:", filterJson);
    if (filterJson.persona) {
      this.searchForm.controls.persona.patchValue(filterJson.persona, { emitEvent: false });
    }

    if (filterJson?.isSearchCompany) {
      console.log("Restoring Company Search:", filterJson);
      this.selectSearchType = filterJson?.selectSearchType;
      this.entityType = filterJson?.entityType;
      this.isSearchCompany = true;
      if (this.selectSearchType == 'PAN') {
        this.companySearch = filterJson.code;
      }
      else if (this.selectSearchType == 'CIN') {
        this.companySearch = filterJson.cin;
      }
      else if (this.selectSearchType == 'COMPANY') {
        this.companySearch = filterJson.name;
        this.getSaveRiskSearchData(); // Ensure company list is populated
      }
    } else {
      // Restore table filters if not company search
      // Check for type to apply to correct form
      if (filterJson.type == this.constants.CustomerType.FDI) {
        if (filterJson.name) this.fdiSearchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
        if (filterJson.code) this.fdiSearchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });

        if (filterJson.cities) this.fdiSearchForm.controls.cities.patchValue(filterJson.cities, { emitEvent: false });
        if (filterJson.countriess) this.fdiSearchForm.controls.countries.patchValue(filterJson.countriess, { emitEvent: false });
        if (filterJson.fdiRoute) this.fdiSearchForm.controls.route.patchValue(filterJson.fdiRoute, { emitEvent: false });
        if (filterJson.fdiPeriod) this.fdiSearchForm.controls.dates.patchValue(filterJson.fdiPeriod, { emitEvent: false });
        if (filterJson.customerTypes) this.fdiSearchForm.controls.customerTypes.patchValue(filterJson.customerTypes, { emitEvent: false });
        if (filterJson.foreignCollab) this.fdiSearchForm.controls.foreignCollab.patchValue(filterJson.foreignCollab, { emitEvent: false });
        if (filterJson.fdiAmount) this.fdiSearchForm.controls.fdiAmount.patchValue(filterJson.fdiAmount, { emitEvent: false });
      }
      else if (filterJson.type == this.constants.CustomerType.ODI) {
        if (filterJson.name) this.odiSearchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
        if (filterJson.code) this.odiSearchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });

        if (filterJson.cities) this.odiSearchForm.controls.cities.patchValue(filterJson.cities, { emitEvent: false });
        if (filterJson.countriess) this.odiSearchForm.controls.countries.patchValue(filterJson.countriess, { emitEvent: false });
        if (filterJson.entityName) this.odiSearchForm.controls.entityName.patchValue(filterJson.entityName, { emitEvent: false });
        if (filterJson.odiType) this.odiSearchForm.controls.type.patchValue(filterJson.odiType, { emitEvent: false });
        if (filterJson.odiPeriod) this.odiSearchForm.controls.dates.patchValue(filterJson.odiPeriod, { emitEvent: false });
        if (filterJson.customerTypes) this.odiSearchForm.controls.customerTypes.patchValue(filterJson.customerTypes, { emitEvent: false });
        if (filterJson.odiAmount) this.odiSearchForm.controls.odiAmount.patchValue(filterJson.odiAmount, { emitEvent: false });
        if (filterJson.fdiAmount) this.odiSearchForm.controls.foreignCollab.patchValue(filterJson.fdiAmount, { emitEvent: false });
      }
      else if (filterJson.type == this.constants.CustomerType.ECB) {
        if (filterJson.name) this.ecbSearchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
        if (filterJson.code) this.ecbSearchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });

        if (filterJson.cities) this.ecbSearchForm.controls.cities.patchValue(filterJson.cities, { emitEvent: false });
        if (filterJson.ecbPurpose) this.ecbSearchForm.controls.purpose.patchValue(filterJson.ecbPurpose, { emitEvent: false });
        if (filterJson.ecbRoute) this.ecbSearchForm.controls.route.patchValue(filterJson.ecbRoute, { emitEvent: false });
        if (filterJson.ecbPeriod) this.ecbSearchForm.controls.dates.patchValue(filterJson.ecbPeriod, { emitEvent: false });
        if (filterJson.ecbMaturityPeriod) this.ecbSearchForm.controls.maturityPeriod.patchValue(filterJson.ecbMaturityPeriod, { emitEvent: false });
        if (filterJson.ecbAmount) this.ecbSearchForm.controls.ecbAmount.patchValue(filterJson.ecbAmount, { emitEvent: false });
        if (filterJson.ecbLenderCategory) this.ecbSearchForm.controls.lenderCategory.patchValue(filterJson.ecbLenderCategory, { emitEvent: false });
        if (filterJson.customerTypes) this.ecbSearchForm.controls.customerTypes.patchValue(filterJson.customerTypes, { emitEvent: false });
      }
      else {
        // Default to Prospects
        if (filterJson.name) this.searchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
        if (filterJson.code) this.searchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });
        if (filterJson.region) this.searchForm.controls.region.patchValue(filterJson.region, { emitEvent: false });
        if (filterJson.cities) this.searchForm.controls.city.patchValue(filterJson.cities, { emitEvent: false });
        if (filterJson.countriess) this.searchForm.controls.country.patchValue(filterJson.countriess, { emitEvent: false });
        if (filterJson.subsidiaryCountry) this.searchForm.controls.subsidiaryCountry.patchValue(filterJson.subsidiaryCountry, { emitEvent: false });
        if (filterJson.subsidiary) this.searchForm.controls.subsidiary.patchValue(filterJson.subsidiary, { emitEvent: false });
        if (filterJson.globalRm) this.searchForm.controls.globalRm.patchValue(filterJson.globalRm, { emitEvent: false });
        if (filterJson.parentCompanyName) this.searchForm.controls.parentCompanyName.patchValue(filterJson.parentCompanyName, { emitEvent: false });
        if (filterJson.segmentss) this.searchForm.controls.segment.patchValue(filterJson.segmentss, { emitEvent: false });
      }
    }

    // Restore Search By (top bar) filter selections so they show after navigation
    this.restoreTopBarFiltersFromSavedJson(filterJson);

    // Force UI update
    this.cd.detectChanges();

    // this.pageSize = filterJson.paginationTO;
    // this.page = (filterJson.paginationFROM / this.pageSize) + 1;
    // this.currentSortField = filterJson["sortField"];
    // this.sortDirection = filterJson["sortDirection"];
  }

  removeFilter() {
    this.loaderService.subLoaderShow(); // Show loader immediately
    // Clear all filter state so both reset buttons fully reset filters (same as TargetsProspectsComponent)
    this.selectedItemsMap = {};
    this.appliedLocationSelection = [];
    this.appliedAreaSelection = [];
    this.previousCitySelection = [];
    this.previousLocationSelection = [];
    this.allLocationData = [];
    this.originalLocationData = [];
    this.allAreaData = [];
    this.originalAreaData = [];
    this.topBarFilters.forEach(f => {
      f.selectedFilter = [];
      f.searchValue = '';
    });
    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });
    setTimeout(() => {
      this.resetFilters();
      this.reloadData();

      this.getTopBarFilter(true);

    }, 0); // push everything to next JS event loop tick

  }

  onTableTabChange(event: any) {
    // this.customerInactiveForSage=false;
    // this.customerInactiveForNewOdi=false;
    // this.customerInactiveForNewFdi=false;
    // this.customerInactiveForNewEcb=false;

    // this.isCustomerTypeInActiveForSage = false;
    // this.isCustomerTypeInActiveForNewOdi = false;
    // this.isCustomerTypeInActiveForNewFdi = false;
    // this.isCustomerTypeInActiveForNewEcb = false;

    const selectedIndex = event?.index ?? event;

    this.isAssignedAllCustomer = false;
    this.disableAssignButton = true;
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    // Update applied filters list for display
    const finalFilterJson = this.applyFilter(null);
    switch (selectedIndex) {
      case 0:
        this.customerType = this.constants.CustomerType.PROSPECTS;
        this.isCustomerTypeInActiveForSage = this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.PROSPECTS - 1];
        console.log("isCustomerTypeInActiveForSage::::> ", this.isCustomerTypeInActiveForSage);
        if (!this.isProspect) {
          this.getCustomerList();
        }
        this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
        break;
      case 1:
        this.customerType = 7;
        if (!this.isInCorporation) {
          this.getInCorporation();
        }
        break;
      case 2:
        this.customerType = this.constants.CustomerType.FDI;
        this.isCustomerTypeInActiveForNewFdi = this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.FDI - 1];
        console.log("isCustomerTypeInActiveForNewFdi::::> ", this.isCustomerTypeInActiveForNewFdi)
        if (!this.isFDI) {
          this.getCustomerList();
        }
        this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
        break;
      case 3:
        this.customerType = this.constants.CustomerType.ODI;
        this.isCustomerTypeInActiveForNewOdi = this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ODI - 1];
        console.log("isCustomerTypeInActiveForNewOdi::::> ", this.isCustomerTypeInActiveForNewOdi)
        if (!this.isODI) {
          this.getCustomerList();
        }
        this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
        break;
      case 4:
        this.customerType = this.constants.CustomerType.ECB;
        this.isCustomerTypeInActiveForNewEcb = this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ECB - 1];
        console.log("isCustomerTypeInActiveForNewEcb::::> ", this.isCustomerTypeInActiveForNewEcb)
        if (!this.isECB) {
          this.getCustomerList();
        }
        this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
        break;
      case 5:
        if (!this.isNewGcc) {
          this.getNewGcc();
        }
        break;
    }
  }

  getInCorporation() {
    let request: any = {};
    request["pageNumber"] = this.inCorporationPage;
    request["pageSize"] = this.inCorporationPageSize;


    request["cinValue"] = this.searchCriteria.cin;
    request["companyValue"] = this.searchCriteria.companyName;
    request["cityValue"] = this.searchCriteria.city;
    request["stateValue"] = this.searchCriteria.state;
    request["dateOfIncValue"] = this.searchCriteria.dateOfIncorporation;
    request["myPortfolioCompanyNameValue"] = this.searchCriteria.etb;
    request["relatedMncCompanyNameValue"] = this.searchCriteria.mnc;
    request["companyNameSortingOrder"] = this.sortingDirectionIncorporation.companyNameSortingOrder;
    request["citySortingOrder"] = this.sortingDirectionIncorporation.citySortingOrder;
    request["stateSortingOrder"] = this.sortingDirectionIncorporation.stateSortingOrder;
    request["dateOfIncSortingOrder"] = this.sortingDirectionIncorporation.dateOfIncSortingOrder;
    request["myPortfolioCompanyNameSortingOrder"] = this.sortingDirectionIncorporation.myPortfolioCompanyNameSortingOrder;
    request["relatedMncCompanyNameSortingOrder"] = this.sortingDirectionIncorporation.relatedMncCompanyNameSortingOrder;



    this.loaderService.subLoaderShow();
    this.msmeService.getInCorporationDetails(request, true).subscribe((response: any) => {
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.inCorporationList = response.data;

        this.inCorporationPageSize = response.pageSize;
        this.inCorporationTotalPages = response.totalPage;
        this.inCorporationTotalSize = response.totalSize;

        this.isInCorporation = true;

      }
      else {
        this.commonService.errorSnackBar(response.message)

      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')

    })
  }

  NewIncorporationView_popup(corporation: any): void {
    const dialogRef = this.dialog.open(NewIncorporationViewPopupComponent, {
      data: corporation,  // Passing the corporation data to the dialog
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }


  selectAllProspect(checked: any) {
    this.isManualAllPagesSelected = checked;
    this.isAssignedAllCustomerForCampaign = checked;
    this.isAssignedAllCustomer = checked;
    // this.isAssignedAllCustomer = !this.isAssignedAllCustomer;
    if (checked) {
      if (this.customerType == this.constants.CustomerType.PROSPECTS) {
        this.customerList.forEach(customer => {
          this.selectedCustomers.add(customer.id);
          this.selectedCustomerDetails.set(customer.id, {
            customerName: customer.name,
            customerId: customer.customerId,
            pan: customer.panNo,
            rmId: customer.rmId,
            customerType: this.customerType,
          });
        });
      }
      else if (this.customerType == this.constants.CustomerType.FDI) {
        this.fdiList.forEach(customer => {
          if (!this.customerTypes.includes(customer.customerType)) {
            this.selectedCustomers.add(customer.id);
            this.selectedCustomerDetails.set(customer.id, {
              customerName: customer.name,
              customerId: customer.customerId,
              pan: customer.panNo,
              rmId: customer.rmId,
              customerType: this.customerType,
            });
          }
        });
      }
      else if (this.customerType == this.constants.CustomerType.ODI) {
        this.odiList.forEach(customer => {
          if (!this.customerTypes.includes(customer.customerType)) {
            this.selectedCustomers.add(customer.id);
            this.selectedCustomerDetails.set(customer.id, {
              customerName: customer.name,
              customerId: customer.customerId,
              pan: customer.panNo,
              rmId: customer.rmId,
              customerType: this.customerType,
            });
          }
        });
      }
      else if (this.customerType == this.constants.CustomerType.ECB) {
        this.ecbList.forEach(customer => {
          if (!this.customerTypes.includes(customer.customerType)) {
            this.selectedCustomers.add(customer.id);
            this.selectedCustomerDetails.set(customer.id, {
              customerName: customer.name,
              customerId: customer.customerId,
              pan: customer.panNo,
              rmId: customer.rmId,
              customerType: this.customerType,
            });
          }
        });
      }
    }
    else {
      this.isManualAllPagesSelected = false;
      if (this.customerType == this.constants.CustomerType.PROSPECTS) {
        this.customerList.forEach(customer => {
          this.selectedCustomers.delete(customer.id);
          this.selectedCustomerDetails.delete(customer.id);
        });
      }
      else if (this.customerType == this.constants.CustomerType.FDI) {
        this.fdiList.forEach(customer => {
          this.selectedCustomers.delete(customer.id);
          this.selectedCustomerDetails.delete(customer.id);
        });
      }
      else if (this.customerType == this.constants.CustomerType.ODI) {
        this.odiList.forEach(customer => {
          this.selectedCustomers.delete(customer.id);
          this.selectedCustomerDetails.delete(customer.id);
        });
      }
      else if (this.customerType == this.constants.CustomerType.ECB) {
        this.ecbList.forEach(customer => {
          this.selectedCustomers.delete(customer.id);
          this.selectedCustomerDetails.delete(customer.id);
        });
      }
    }
    this.updateTransformedCustomer();
  }

  toggleSelection(customerId: number) {
    this.isManualAllPagesSelected = false;
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
      this.selectedCustomerDetails.delete(customerId);
    }
    else {
      this.selectedCustomers.add(customerId);
      const customer = this.getCustomerById(customerId);
      if (customer) {
        this.selectedCustomerDetails.set(customerId, {
          customerName: customer.name,
          customerId: customer.customerId,
          pan: customer.panNo,
          rmId: customer.rmId,
          customerType: this.customerType,
        });
      }
    }
    this.updateTransformedCustomer();
  }

  updateTransformedCustomer() {
    // console.log('this.selectedCustomers:::::::::::> ', this.selectedCustomers);
    this.disableAssignButton = this.selectedCustomers.size === 0;
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      this.isAssignedAllCustomer = this.customerList?.every(customer => this.selectedCustomers.has(customer.id));
    }
    else if (this.customerType == this.constants.CustomerType.FDI) {
      this.isAssignedAllCustomer = this.selectedCustomers.size !== 0 && this.fdiList?.filter(customer => !this.customerTypes.includes(customer.customerType))
        .every(customer => this.selectedCustomers.has(customer.id));
    }
    else if (this.customerType == this.constants.CustomerType.ODI) {
      this.isAssignedAllCustomer = this.selectedCustomers.size !== 0 && this.odiList?.filter(customer => !this.customerTypes.includes(customer.customerType))
        .every(customer => this.selectedCustomers.has(customer.id));
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      this.isAssignedAllCustomer = this.selectedCustomers.size !== 0 && this.ecbList?.filter(customer => !this.customerTypes.includes(customer.customerType))
        .every(customer => this.selectedCustomers.has(customer.id));
    }
  }

  assignCustomerToRm(customer?: any): void {
    const customers: any = [];
    if (!this.commonService.isObjectNullOrEmpty(customer)) {
      customers.push(customer.id);
    }
    else {
      customers.push(...this.selectedCustomers);
    }

    const dialogRef = this.dialog.open(UseridPopupComponent, { panelClass: ['popupMain_design'], });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.isAssign && result.userId) {
        this.dashboardResponse = {
          aggregateTurnoverFromGst: '',
          companyName: customer?.companyName,
          address: '',
          lendingBankersCount: null,
          cmr: '',
          pan: customer?.panNo,
          cin: customer?.cin,
          charges: '',
          creditRating: null,
          city: '',
          pinCode: null,
          fullBureauConsent: null,
          partialBureauConsent: null,
          downloadFinancialConsent: null,
          contactNo: '',
          personal: '',
          turnOver: '',
          prioritySectorLendind: '',
          employeeCode: this.empCode,
          customerType: this.constants.CustomerType.PROSPECTS,
          rmId: result.userId,
          rmUserName: result.userName,
          customerIdList: customers,
          previousRmId: customer?.rmId,
          isRmAssign: true,
          isTarget: false,
          assignmentRemarks: result.assignmentRemark
        };

        console.log('this.dashboardResponse: ', this.dashboardResponse);
        this.addToTarget();
      }

    });
  }

  // Function to handle column and value search
  onNewIncorporationSearch(searchTypr?: string) {

    if (searchTypr == 'companyName' && !this.commonService.isObjectNullOrEmpty(this.searchCriteria.companyName) && this.searchCriteria.companyName.length <= 3) {
      return;
    }
    else {
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
      }
      this.typingTimer = setTimeout(() => {
        this.getInCorporation();
      }, 400);
    }

  }

  onCityAndStateInputErase(value: string): void {
    if (!value || value.trim() === '') {
      this.getInCorporation(); // API call to fetch all records
    }
  }

  // Method to fetch Cities and States from the API new inCorporation
  getCitiesAndStates(ignoreLoader?: boolean) {
    this.msmeService.getCitiesAndStates(ignoreLoader).subscribe(
      (response: any) => {
        if (response.status === 200) {
          this.citySearchOptions = [...new Set(response.data.cities?.filter((city: string) => city && city.trim() !== '') || [])] as string[];
          this.fullCityOptions = this.citySearchOptions;
          this.stateSearchOptions = [...new Set(response.data.states?.filter((state: string) => state && state.trim() !== '') || [])] as string[];
          this.fullStateOptions = this.stateSearchOptions;


          if (!this.commonService.isObjectIsEmpty(response.data.fdiCountries)) {
            this.countriesFdiList = response.data.fdiCountries;
            this.countriesFdiMainList = this.countriesFdiList;
          }

          if (!this.commonService.isObjectIsEmpty(response.data.odiCountries)) {
            this.countriesOdiList = response.data.odiCountries;
            this.countriesOdiMainList = this.countriesOdiList;
          }
          if (!this.commonService.isObjectIsEmpty(response.data.fdiDates)) {
            this.dateFdiList = response.data.fdiDates;
            this.dateFdiMainList = this.dateFdiList;
          }
          if (!this.commonService.isObjectIsEmpty(response.data.odiDates)) {
            this.dateOdiList = response.data.odiDates;
            this.dateOdiMainList = this.dateOdiList;
          }
          if (!this.commonService.isObjectIsEmpty(response.data.ecbDates)) {
            this.dateEcbList = response.data.ecbDates;
            this.dateEcbMainList = this.dateEcbList;
          }
        }
        else {
          this.commonService.errorSnackBar('Failed to fetch city and state data');

        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something went wrong while fetching cities and states');

      }
    );
  }

  // Method to fetch all cities for FDI, ODI, ECB filters
  getAllCities(ignoreLoader?: boolean) {
    this.msmeService.getAllCities(ignoreLoader).subscribe(
      (response: any) => {
        if (response && response.status === 200 && response.data) {
          this.citiesList = response.data;
          this.filteredCitiesList = response.data;
        } else {
          this.citiesList = [];
          this.filteredCitiesList = [];
          this.commonService.warningSnackBar('No cities found');
        }
      },
      (error) => {
        this.citiesList = [];
        this.filteredCitiesList = [];
        this.commonService.errorSnackBar('Something went wrong while fetching cities');
      }
    );
  }

  // filterInCorporationFiled(value, type) {
  //   if(type == 1){
  //     this.cityOptions = of(this.citySearchOptions.filter(item => item.toLowerCase().includes(value.toLowerCase())));
  //     return this.cityOptions;
  //   }
  //   else if(type == 2){
  //     this.stateOptions = of(this.stateSearchOptions.filter(item => item.toLowerCase().includes(value.toLowerCase())));
  //     return this.stateOptions;
  //   }
  // }

  getInsightFilterMaster(ignoreLoader?: boolean) {

    this.filterMasterService.getInsightFilterMaster(ignoreLoader).subscribe({
      next: (filterListMaster) => {
        this.setFilterState(filterListMaster);
      },
      error: (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Filter master error:', error);
      }
    });
  }

  handleApply(filterListMaster: any[]) {
    // this.filterListMaster = filterListMaster;
    this.filterStates[this.selectedTabIndex] = filterListMaster;

    // Clear selected customers when filters are applied
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;

    this.getCustomerList()
  }

  handleReset() {

    this.totalSize = 0;
    this.fdiTotalSize = 0;
    this.odiTotalSize = 0;
    this.ecbTotalSize = 0;

    this.isProcessing = true;
    this.isLoadingSubject.next(true);
    this.removeFilter()
    setTimeout(() => {
      this.isProcessing = false;
      this.isLoadingSubject.next(false);
    }, 1500);
    // Clear selected customers when filters are applied to avoid showing incorrect count
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
  }

  resetFilters() {
    this.commonService.removeStorage(this.constants.FILTER_JSON_FIND_PROSPECT);
    this.prospectsfilterStorageService.clearAllFilterStates();
    this.commonService.removeStorage(this.constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT);
    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        f1.selectedFilter.length = 0;
      }
      if (f1?.searchValue) {
        f1.searchValue = '';
      }
    });
    this.selectedItemsMap = {};
    this.previousCitySelection = [];
    this.previousLocationSelection = [];
    this.allLocationData = [];
    this.originalLocationData = [];
    this.allAreaData = [];
    this.originalAreaData = [];
    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });
  }

  reloadData() {

    this.filterMasterService.getInsightFilterMaster(true).subscribe({
      next: (filterListMaster) => {
        // 1. Assign received data to component property
        this.setFilterState(filterListMaster, this.selectedTabIndex);
        this.getCustomerList();
      },
      error: (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Filter master error:', error);
      }
    });

    //     let masterJson = this.commonService.getStorageAesEncryption(this.constants.CLEAN_FILTER_LIST_MASTER);
    //     if (masterJson && masterJson !== undefined && masterJson !== "undefined") {
    //       masterJson = masterJson.replace(/[\x00-\x1F\x7F]/g, '');
    //       let filterListMasterTemp = JSON.parse(JSON.parse(masterJson));
    //       if (filterListMasterTemp) {
    // //        this.filterListMaster = filterListMasterTemp;
    //         this.filterStates[this.selectedTabIndex] = filterListMasterTemp;

    //         this.getCustomerList();
    //       } else {
    //         this.getInsightFilterMaster();
    //       }
    //     } else {
    //       this.getInsightFilterMaster();
    //     }
  }

  getTopbarSearchListFromApi(topBarFilter: TopBarFilter) {
    this.existingProspectsDropDownService.getTopbarSearchListFromApi(topBarFilter);
  }

  citySearchInputVal: string = '';
  stateSearchInputVal: string = '';

  clearFilterInCorporation() {
    let request: any = {};
    request["pageNumber"] = this.inCorporationPage;
    request["pageSize"] = this.inCorporationPageSize;
    this.searchCriteria.cin = '';
    this.searchCriteria.companyName = '';
    this.searchCriteria.city = null;
    this.searchCriteria.state = null;
    this.searchCriteria.dateOfIncorporation = '';
    this.searchCriteria.etb = '';
    this.searchCriteria.mnc = '';
    this.searchCriteria.city = [];
    this.searchCriteria.state = [];

    this.citySearchInputVal = '';
    this.stateSearchInputVal = '';

    this.citySearchOptions = [...this.fullCityOptions];
    this.stateSearchOptions = [...this.fullStateOptions];

    this.sortingDirectionIncorporation.citySortingOrder = null;
    this.sortingDirectionIncorporation.stateSortingOrder = null;
    this.sortingDirectionIncorporation.companyNameSortingOrder = null;
    this.sortingDirectionIncorporation.dateOfIncSortingOrder = null;
    this.sortingDirectionIncorporation.myPortfolioCompanyNameSortingOrder = null;
    this.sortingDirectionIncorporation.relatedMncCompanyNameSortingOrder = null;

    this.getInCorporation();
  }

  // getLocation(cityList?:any, searchValue? , type?:any){
  //   const types:any = type.toLowerCase();
  //   let req:any = {};
  //   if (types === 'city'){
  //     this.pageNumber = 0;
  //     req = {cityList: cityList};
  //   }else if (types === 'location'){
  //     req = {locationList: cityList};
  //   }
  //   req.pageIndex=this.pageNumber;
  //   req.size=this.pageSizeLocation;
  //   if (searchValue) {
  //     req.searchValue=searchValue;
  //   }

  //   this.msmeService.getCityLocationPincode(req).subscribe(
  //     (response: any) => {
  //       if (response && response.status == 200 && response.data) {
  //         let i:any;
  //         if (types === 'city'){
  //           i = this.topBarFilters.findIndex((x) => x.name === "Location");
  //           this.topBarFilters[i].optionFilter = [...this.topBarFilters[i].optionFilter, ...response.data.location];
  //         }else if (types === 'location'){
  //           i = this.topBarFilters.findIndex((x) => x.name === "Area");
  //           this.topBarFilters[i].optionFilter = [...this.topBarFilters[i].optionFilter, ...response.data.area];
  //         }
  //         /*let list  = [];
  //         response.data.forEach(element => {
  //           let req:any= {};
  //           req.name = element;
  //           req.name = element;
  //           req.selected = false;
  //           list.push(req);
  //         });
  //         topBarFilters[i].optionFilter = response.data;*/
  //         if(this.topBarFilters[i].optionFilter == undefined) {
  //           this.topBarFilters[i].selectedFilter = [];
  //           this.topBarFilters[i].optionFilter = [];
  //         }
  //         // this.topBarFilters[i].optionFilter = [...this.topBarFilters[i].optionFilter, ...response.data.location];
  //         this.topBarFilters[i].loadBatchSize = 20;
  //         // this.topBarFilters[i].optionFilter = [];
  //         // this.loadInitialOptions(i);
  //       } else {
  //         this.commonService.errorSnackBar(response.message);
  //       }
  //     },
  //     (error) => {
  //       this.commonService.errorSnackBar('Something Went Wrong');
  //     }
  //   );
  // }

  getLocation(cityList?: any, searchValue?, type?: any) {
    const types: any = type.toLowerCase();
    let req: any = {};
    const filteredList = cityList?.filter(val => val !== 'All') || [];

    if (types === 'city') {
      this.pageNumber = 0;
      req = { cityList: filteredList };
    } else if (types === 'location') {
      this.pageNumber = 0;
      req = { locationList: filteredList };
    }

    req.pageIndex = this.pageNumber;
    req.size = this.pageSizeLocation;
    req.requestType = Constants.CustomerType.PROSPECTS
    if (searchValue) {
      req.searchValue = searchValue;
    }

    this.msmeService.getCityLocationPincode(req).subscribe(
      (response: any) => {
        if (response && response.status == 200 && response.data) {
          let i: any;

          if (types === 'city') {
            i = this.topBarFilters.findIndex((x) => x.name === "Location");

            if (i !== -1 && this.topBarFilters[i]) {
              this.topBarFilters[i].optionFilter = [];
              const rawLocation = (response.data.location || []).filter(
                item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
              );
              if (rawLocation.length > 0) {
                this.allLocationData = rawLocation;
                this.originalLocationData = [...this.allLocationData];
              }
              this.currentLocationIndex = this.locationBatchSize;
              this.topBarFilters[i].optionFilter = this.allLocationData.slice(0, this.locationBatchSize);
              if (this.activeFilterMenu === 'Location' && this.selectedFilterOption) {
                this.dependantFilters = (this.allLocationData || [])
                  .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                  .map((item: any) => ({ key: item.name, value: item.value }));
                const selectedFilter = this.topBarFilters[i].selectedFilter || [];
                selectedFilter.forEach((selectedId: any) => {
                  if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                    const found = this.allLocationData.find((item: any) => item.value === selectedId || item.value == selectedId);
                    const key = found ? found.name : 'Selected';
                    this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                  }
                });
                const locKey = this.topBarFilters[i].spKeyName || this.topBarFilters[i].name?.toLowerCase() || 'location';
                this.selectedItemsMap[locKey] = Array.isArray(this.topBarFilters[i].selectedFilter) ? [...this.topBarFilters[i].selectedFilter] : [];
                if (this.selectedFilterOption.dataset_id) {
                  this.searchByDataHistory[this.selectedFilterOption.dataset_id].data = this.dependantFilters;
                }
                this.isLoadingSearchBy = false;
              }
            }
          } else if (types === 'location') {
            i = this.topBarFilters.findIndex((x) => x.name === "Area");

            if (i !== -1 && this.topBarFilters[i]) {
              const rawArea = (response.data.area || []).filter(
                item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
              );
              if (rawArea.length > 0) {
                this.allAreaData = rawArea;
                this.originalAreaData = [...this.allAreaData];
              }
              this.currentAreaIndex = this.locationBatchSize;
              this.topBarFilters[i].optionFilter = this.allAreaData.slice(0, this.locationBatchSize);
              if (this.activeFilterMenu === 'Area' && this.selectedFilterOption) {
                this.dependantFilters = (this.allAreaData || [])
                  .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                  .map((item: any) => ({ key: item.name, value: item.value }));
                const selectedFilter = this.topBarFilters[i].selectedFilter || [];
                selectedFilter.forEach((selectedId: any) => {
                  if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                    const found = this.allAreaData.find((item: any) => item.value === selectedId || item.value == selectedId);
                    const key = found ? found.name : 'Selected';
                    this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                  }
                });
                const areaKey = this.topBarFilters[i].spKeyName || this.topBarFilters[i].name?.toLowerCase() || 'area';
                this.selectedItemsMap[areaKey] = Array.isArray(this.topBarFilters[i].selectedFilter) ? [...this.topBarFilters[i].selectedFilter] : [];
                if (this.selectedFilterOption.dataset_id) {
                  this.searchByDataHistory[this.selectedFilterOption.dataset_id].data = this.dependantFilters;
                }
                this.isLoadingSearchBy = false;
              }
            }
          }
          if (this.topBarFilters[i]) {
            if (this.topBarFilters[i].optionFilter == undefined) {
              this.topBarFilters[i].selectedFilter = [];
              this.topBarFilters[i].optionFilter = [];
            }

            this.topBarFilters[i].loadBatchSize = 20;
          }
        } else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }

  onScroll(event: Event, filter: any) {
    const element = event.target as HTMLElement;
    const threshold = 1;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
    const atTop = element.scrollTop <= threshold;

    if (atBottom) {
      if (filter?.name === 'Location') {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === 'Location');
        if (locationIndex !== -1 && this.currentLocationIndex < this.allLocationData.length) {
          const nextBatch = this.allLocationData.slice(
            this.currentLocationIndex,
            this.currentLocationIndex + this.locationBatchSize
          );
          this.topBarFilters[locationIndex].optionFilter = [...this.topBarFilters[locationIndex].optionFilter, ...nextBatch];
          this.currentLocationIndex += this.locationBatchSize;
        }
      }
      else if (filter?.name === 'Area') {
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === 'Area');
        if (areaIndex !== -1 && this.currentAreaIndex < this.allAreaData.length) {
          const nextBatch = this.allAreaData.slice(
            this.currentAreaIndex,
            this.currentAreaIndex + this.locationBatchSize
          );
          this.topBarFilters[areaIndex].optionFilter = [...this.topBarFilters[areaIndex].optionFilter, ...nextBatch];
          this.currentAreaIndex += this.locationBatchSize;
        }
      }
    }

    if (atTop) {
      if (filter?.name === 'Location') {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === 'Location');
        if (locationIndex !== -1 && this.topBarFilters[locationIndex]?.optionFilter.length > this.locationBatchSize) {
          this.topBarFilters[locationIndex].optionFilter = this.topBarFilters[locationIndex].optionFilter.slice(0, this.locationBatchSize);
          this.currentLocationIndex = this.locationBatchSize;
        }
      }
      else if (filter?.name === 'Area') {
        const areaIndex = this.topBarFilters.findIndex((x) => x.name === 'Area');
        if (areaIndex !== -1 && this.topBarFilters[areaIndex]?.optionFilter.length > this.locationBatchSize) {
          this.topBarFilters[areaIndex].optionFilter = this.topBarFilters[areaIndex].optionFilter.slice(0, this.locationBatchSize);
          this.currentAreaIndex = this.locationBatchSize;
        }
      }
    }
  }

  loadInitialOptions(i) {
    this.topBarFilters[i].optionFilter = this.topBarFilters[i].optionFilter.slice(0, this.topBarFilters[i].loadBatchSize);
  }

  loadMoreOptions() {
    const i = this.topBarFilters.findIndex((x) => x.name === "Location");
    const currentLength = this.topBarFilters[i].optionFilter.length;
    const nextItems = this.topBarFilters[i].optionFilter.slice(currentLength, currentLength + this.topBarFilters[i].loadBatchSize);
    this.topBarFilters[i].optionFilter = [...this.topBarFilters[i].optionFilter, ...nextItems];
  }

  searchValueChanged: Subject<{ filter: any; filterName: string }> = new Subject();

  onSearchInputChange(filter: any, filterName: string) {
    filter.searchValue = filter.searchValue?.trim(); // optional
    this.searchValueChanged.next({ filter, filterName });
  }

  filterlocationDebounce(filter, filterName) {
    if (filter.searchValue && filter.searchValue.length < 3) {
      filter.optionFilter = [];
      return;
    }

    this.pageNumber = 0;
    filter.optionFilter = [];

    if (filterName === 'Location') {
      const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
      const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;
      if (!hasCitySelected) {
        this.currentLocationIndex = 0;
        this.allLocationData = [];
        this.getLocation(this.topBarFilters[cityIndex].selectedFilter, filter.searchValue, 'City');
      }
    } else if (filterName === 'Area') {
      const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
      const locationOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
      const locationFilterName = locationOpt?.filter_name || 'location';
      const pendingLocation = this.selectedItemsMap[locationFilterName] || [];
      const appliedLocation = (locationIndex !== -1 ? this.topBarFilters[locationIndex].selectedFilter : []) || [];
      const hasLocationSelected = pendingLocation.length > 0 || appliedLocation.length > 0;
      const locationListToUse = pendingLocation.length > 0 ? pendingLocation : appliedLocation;
      if (!hasLocationSelected) {
        this.currentAreaIndex = 0;
        this.allAreaData = [];
        this.getLocation(locationListToUse, filter.searchValue, 'Location');
      } else {
        this.getLocation(locationListToUse, filter.searchValue, 'Location');
      }
    }
  }

  rejectCustomer(customer?: any) {
    console.log("reject customer ", customer);

    const dialogRef = this.dialog.open(RejectedPopupComponent, {
      panelClass: ['popupMain_design'],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("resilt:::::::::::::: ", result);
      if (!this.commonService.isObjectNullOrEmpty(result.remarks) && !this.commonService.isObjectNullOrEmpty(customer?.panNo)) {
        const rejectedPortfolioReqDto = {
          pan: customer?.panNo,
          remarks: result.remarks,
          portfolio: 'PROSPECTS'
        };

        this.msmeService.rejectedCustomer(rejectedPortfolioReqDto).subscribe(
          (response) => {
            this.commonService.successSnackBar(response.message);
            // this.router.navigate(['/hsbc/rejected-portfolio']);
          },
          (error) => {
            console.error("Error in rejectedCustomer API:", error);
          }
        );
      } else {
        console.log("Remarks not provided, not calling API.");
      }
    });
  }

  onCityOrCountrySelectionChange(option: any, event: MatCheckboxChange, columnType: string) {

    if (this.customerType == this.constants.CustomerType.FDI) {
      if (columnType == 'CITY') {
        const citiesControl = this.fdiSearchForm.get('cities');
        let currentCities = citiesControl?.value || [];
        if (event.checked) {
          currentCities.push(option.value);
        }
        else {
          currentCities = currentCities.filter((cityTemp: any) => cityTemp !== option.value);
        }
        citiesControl?.setValue(currentCities);
        // Re-sort city list to show selected cities at the top
        this.sortFdiCitiesWithSelectedFirst();
      }
      else if (columnType == 'COUNTRY') {
        const control = this.fdiSearchForm.get('countries');
        let currentValue = control?.value || [];
        if (event.checked) {
          currentValue.push(option);
        }
        else {
          currentValue = currentValue.filter((temp: any) => temp !== option);
        }
        control?.setValue(currentValue);
        // Re-sort country list to show selected countries at the top
        this.sortFdiCountriesWithSelectedFirst();
      }
      else if (columnType == 'DATE') {
        const control = this.fdiSearchForm.get('dates');
        let currentValue = control?.value || [];
        if (event.checked) {
          currentValue.push(option);
        }
        else {
          currentValue = currentValue.filter((temp: any) => temp !== option);
        }
        control?.setValue(currentValue);
        // Re-sort date list to show selected dates at the top
        this.sortFdiDatesWithSelectedFirst();
      }

      else if (columnType == 'CUSTOMER_TYPE') {
        const control = this.fdiSearchForm.get('customerTypes');
        this.onChangesDropDownValue(option, event, control);
      }

    }
    else if (this.customerType == this.constants.CustomerType.ODI) {
      if (columnType == 'CITY') {
        const citiesControl = this.odiSearchForm.get('cities');
        let currentCities = citiesControl?.value || [];
        if (event.checked) {
          currentCities.push(option.value);
        }
        else {
          currentCities = currentCities.filter((cityTemp: any) => cityTemp !== option.value);
        }
        citiesControl?.setValue(currentCities);
        // Re-sort city list to show selected cities at the top
        this.sortOdiCitiesWithSelectedFirst();
      }
      else if (columnType == 'COUNTRY') {
        const control = this.odiSearchForm.get('countries');
        let currentValue = control?.value || [];
        if (event.checked) {
          currentValue.push(option);
        }
        else {
          currentValue = currentValue.filter((temp: any) => temp !== option);
        }
        control?.setValue(currentValue);
        // Re-sort country list to show selected countries at the top
        this.sortOdiCountriesWithSelectedFirst();
      }
      else if (columnType == 'DATE') {
        const control = this.odiSearchForm.get('dates');
        let currentValue = control?.value || [];
        if (event.checked) {
          currentValue.push(option);
        }
        else {
          currentValue = currentValue.filter((temp: any) => temp !== option);
        }
        control?.setValue(currentValue);
        // Re-sort date list to show selected dates at the top
        this.sortOdiDatesWithSelectedFirst();
      }

      else if (columnType == 'CUSTOMER_TYPE') {
        const control = this.odiSearchForm.get('customerTypes');
        this.onChangesDropDownValue(option, event, control);
      }

    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      if (columnType == 'CITY') {
        const citiesControl = this.ecbSearchForm.get('cities');
        let currentCities = citiesControl?.value || [];
        if (event.checked) {
          currentCities.push(option.value);
        }
        else {
          currentCities = currentCities.filter((cityTemp: any) => cityTemp !== option.value);
        }
        citiesControl?.setValue(currentCities);
        // Re-sort city list to show selected cities at the top
        this.sortEcbCitiesWithSelectedFirst();
      }
      else if (columnType == 'DATE') {
        const datesControl = this.ecbSearchForm.get('dates');
        let currentDates = datesControl?.value || [];
        if (event.checked) {
          currentDates.push(option);
        }
        else {
          currentDates = currentDates.filter((cityTemp: any) => cityTemp !== option);
        }
        datesControl?.setValue(currentDates);
        // Re-sort date list to show selected dates at the top
        this.sortEcbDatesWithSelectedFirst();
      }

      else if (columnType == 'CUSTOMER_TYPE') {
        const control = this.ecbSearchForm.get('customerTypes');
        this.onChangesDropDownValue(option, event, control);
      }

    }
    else if (this.customerType == 7) {
      if (columnType == 'CITY') {
        if (event.checked) {
          this.searchCriteria.city.push(option);
        }
        else {
          this.searchCriteria.city = this.searchCriteria.city.filter((location: any) => location !== option);
        }
        // Re-sort city list to show selected cities at the top
        this.sortCityOptionsWithSelectedFirst();
      }
      else if (columnType == 'STATE') {
        if (event.checked) {
          this.searchCriteria.state.push(option);
        }
        else {
          this.searchCriteria.state = this.searchCriteria.state.filter((location: any) => location !== option);
        }
        // Re-sort state list to show selected states at the top
        this.sortStateOptionsWithSelectedFirst();
      }
      this.onNewIncorporationSearch();
    }
    else if (columnType == 'LOCATION') {
      if (event.checked) {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.locationValues = this.locationSearchOptions;
        } else if (this.searchCriteriaNewGcc.locationValues.length == (this.locationSearchOptions.length - 2)) {
          this.searchCriteriaNewGcc.locationValues.push(option);
          this.searchCriteriaNewGcc.locationValues.push('ALL');
        } else {
          this.searchCriteriaNewGcc.locationValues.push(option);
        }

      }
      else {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.locationValues = [];
        } else if (this.searchCriteriaNewGcc.locationValues.length == this.locationSearchOptions.length) {
          this.searchCriteriaNewGcc.locationValues = this.searchCriteriaNewGcc.locationValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.locationValues = this.searchCriteriaNewGcc.locationValues.filter((location: any) => location !== 'ALL');
        } else {
          this.searchCriteriaNewGcc.locationValues = this.searchCriteriaNewGcc.locationValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.locationValues = this.searchCriteriaNewGcc.locationValues.filter((location: any) => location !== 'ALL');
          if (this.searchCriteriaNewGcc.locationValues.length == 0) {
            this.searchCriteriaNewGcc.locationValues = [];
          }
        }
      }
      if (this.searchCriteriaNewGcc.locationValues.length == 0) {
        this.searchCriteriaNewGcc.locationFinalValues = ['-1'];
      } else {
        this.searchCriteriaNewGcc.locationFinalValues = this.searchCriteriaNewGcc.locationValues;
      }
      // Re-sort location list to show selected locations at the top
      this.sortNewGccLocationsWithSelectedFirst();
      this.onNewGccSearch();
    }
    else if (columnType == 'HQ') {
      if (event.checked) {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.hqValues = this.hqSearchOptions;
        } else if (this.searchCriteriaNewGcc.hqValues.length == (this.hqSearchOptions.length - 2)) {
          this.searchCriteriaNewGcc.hqValues.push(option);
          this.searchCriteriaNewGcc.hqValues.push('ALL');
        } else {
          this.searchCriteriaNewGcc.hqValues.push(option);
        }

      }
      else {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.hqValues = [];
        } else if (this.searchCriteriaNewGcc.hqValues.length == this.hqSearchOptions.length) {
          this.searchCriteriaNewGcc.hqValues = this.searchCriteriaNewGcc.hqValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.hqValues = this.searchCriteriaNewGcc.hqValues.filter((location: any) => location !== 'ALL');
        } else {
          this.searchCriteriaNewGcc.hqValues = this.searchCriteriaNewGcc.hqValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.hqValues = this.searchCriteriaNewGcc.hqValues.filter((location: any) => location !== 'ALL');
          if (this.searchCriteriaNewGcc.hqValues.length == 0) {

          }
        }
      }
      if (this.searchCriteriaNewGcc.hqValues.length == 0) {
        this.searchCriteriaNewGcc.hqFinalValues = ['-1'];
      } else {
        this.searchCriteriaNewGcc.hqFinalValues = this.searchCriteriaNewGcc.hqValues;
      }
      // Re-sort HQ list to show selected HQs at the top
      this.sortNewGccHqWithSelectedFirst();
      this.onNewGccSearch();
    }
    else if (columnType == 'ACCDATE') {
      if (event.checked) {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.announcementDateValues = this.announcementDateSearchOptions;
        } else if (this.searchCriteriaNewGcc.announcementDateValues.length == (this.announcementDateSearchOptions.length - 2)) {
          this.searchCriteriaNewGcc.announcementDateValues.push(option);
          this.searchCriteriaNewGcc.announcementDateValues.push('ALL');
        } else {
          this.searchCriteriaNewGcc.announcementDateValues.push(option);
        }

      }
      else {
        if (option == 'ALL') {
          this.searchCriteriaNewGcc.announcementDateValues = [];
        } else if (this.searchCriteriaNewGcc.announcementDateValues.length == this.announcementDateSearchOptions.length) {
          this.searchCriteriaNewGcc.announcementDateValues = this.searchCriteriaNewGcc.announcementDateValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.announcementDateValues = this.searchCriteriaNewGcc.announcementDateValues.filter((location: any) => location !== 'ALL');
        } else {
          this.searchCriteriaNewGcc.announcementDateValues = this.searchCriteriaNewGcc.announcementDateValues.filter((location: any) => location !== option);
          this.searchCriteriaNewGcc.announcementDateValues = this.searchCriteriaNewGcc.announcementDateValues.filter((location: any) => location !== 'ALL');
          if (this.searchCriteriaNewGcc.hqValues.length == 0) {

          }
        }
      }
      if (this.searchCriteriaNewGcc.announcementDateValues.length == 0) {
        this.searchCriteriaNewGcc.announcementDateFinalValues = ['-1'];
      } else {
        this.searchCriteriaNewGcc.announcementDateFinalValues = this.searchCriteriaNewGcc.announcementDateValues;
      }
      // Re-sort announcement date list to show selected dates at the top
      this.sortNewGccAnnouncementDatesWithSelectedFirst();
      this.onNewGccSearch();
    }
    // else if (columnType=='ETB'){
    //   if (event.checked) {
    //     this.searchCriteriaNewGcc.etbValues.push(option);
    //   }
    //   else {
    //     this.searchCriteriaNewGcc.etbValues = this.searchCriteriaNewGcc.etbValues.filter((location: any) => location !== option);
    //   }
    //   this.onNewGccSearch();
    // }
  }

  onChangesDropDownValue(option: any, event: MatCheckboxChange, control: any) {
    let currentValue = control?.value || [];
    if (event.checked) {
      if (option == 0) {
        currentValue = this.customerTypesListTemp.map(type => type.value);
      }
      else {
        currentValue.push(option);
        this.customerTypesListTemp.length - 1 == currentValue.length ? currentValue.push(0) : null;
      }
    }
    else {
      if (option == 0) {
        currentValue = [];
      }
      else {
        currentValue = currentValue.filter((temp: any) => temp !== 0 && temp !== option);
      }
    }
    control?.setValue(currentValue);
  }

  // Method for the selected citry or country get first
  onSortSelectedFirst(mainList: any[], selectedValue: [any]) {
    if (!this.commonService.isObjectIsEmpty(selectedValue)) {
      const tempList = mainList;
      const sortedList = [
        ...tempList.filter(city => selectedValue.includes(city.value)),
        ...tempList.filter(city => !selectedValue.includes(city.value))
      ];
      mainList.splice(0, mainList.length, ...sortedList);
    }
  }

  onSearchCityOrCountryCommon(value: string, type: string): void {
    console.log('this.topBarFilters: ', this.topBarFilters);
    if (type == 'CITY') {
      if (this.customerType == this.constants.CustomerType.FDI ||
        this.customerType == this.constants.CustomerType.ODI ||
        this.customerType == this.constants.CustomerType.ECB) {
        const filteredCities = this.citiesList.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected cities first, then unselected cities
        if (this.customerType == this.constants.CustomerType.FDI) {
          const selectedCityValues = this.fdiSearchForm.get('cities')?.value || [];
          const selectedCities = filteredCities.filter(city => selectedCityValues.includes(city.value));
          const unselectedCities = filteredCities.filter(city => !selectedCityValues.includes(city.value));
          this.filteredCitiesList = [...selectedCities, ...unselectedCities];
        } else if (this.customerType == this.constants.CustomerType.ODI) {
          const selectedCityValues = this.odiSearchForm.get('cities')?.value || [];
          const selectedCities = filteredCities.filter(city => selectedCityValues.includes(city.value));
          const unselectedCities = filteredCities.filter(city => !selectedCityValues.includes(city.value));
          this.filteredCitiesList = [...selectedCities, ...unselectedCities];
        } else if (this.customerType == this.constants.CustomerType.ECB) {
          const selectedCityValues = this.ecbSearchForm.get('cities')?.value || [];
          const selectedCities = filteredCities.filter(city => selectedCityValues.includes(city.value));
          const unselectedCities = filteredCities.filter(city => !selectedCityValues.includes(city.value));
          this.filteredCitiesList = [...selectedCities, ...unselectedCities];
        } else {
          this.filteredCitiesList = filteredCities;
        }
      }
      else if (this.customerType == 7) {
        const filteredCities = this.fullCityOptions.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected cities first, then unselected cities
        const selectedCities = filteredCities.filter(city => this.searchCriteria.city?.includes(city));
        const unselectedCities = filteredCities.filter(city => !this.searchCriteria.city?.includes(city));
        this.citySearchOptions = [...selectedCities, ...unselectedCities];
      }
    }
    else if (type == 'COUNTRY') {
      // const tempCountries:any[] = this.topBarFilters[4].optionFilter.;
      if (this.customerType == this.constants.CustomerType.FDI) {
        const filteredCountries = this.countriesFdiMainList.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected countries first, then unselected countries
        const selectedCountryValues = this.fdiSearchForm.get('countries')?.value || [];
        const selectedCountries = filteredCountries.filter(country => selectedCountryValues.includes(country));
        const unselectedCountries = filteredCountries.filter(country => !selectedCountryValues.includes(country));
        this.countriesFdiList = [...selectedCountries, ...unselectedCountries];
      }
      else if (this.customerType == this.constants.CustomerType.ODI) {
        const filteredCountries = this.countriesOdiMainList.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected countries first, then unselected countries
        const selectedCountryValues = this.odiSearchForm.get('countries')?.value || [];
        const selectedCountries = filteredCountries.filter(country => selectedCountryValues.includes(country));
        const unselectedCountries = filteredCountries.filter(country => !selectedCountryValues.includes(country));
        this.countriesOdiList = [...selectedCountries, ...unselectedCountries];
      }
    }
    else if (type == 'STATE') {
      if (this.customerType == 7) {
        const filteredStates = this.fullStateOptions.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected states first, then unselected states
        const selectedStates = filteredStates.filter(state => this.searchCriteria.state?.includes(state));
        const unselectedStates = filteredStates.filter(state => !this.searchCriteria.state?.includes(state));
        this.stateSearchOptions = [...selectedStates, ...unselectedStates];
      }
    }
    else if (type == 'LOCATION') {
      const filteredLocations = this.fullLocationOptions.filter(item => item.toLowerCase().includes(value.toLowerCase()));
      // Sort: selected locations first, then unselected locations
      const selectedLocations = filteredLocations.filter(location =>
        this.searchCriteriaNewGcc.locationValues?.includes(location)
      );
      const unselectedLocations = filteredLocations.filter(location =>
        !this.searchCriteriaNewGcc.locationValues?.includes(location)
      );
      this.locationSearchOptions = [...selectedLocations, ...unselectedLocations];
    }
    else if (type == 'HQ') {
      const filteredHqs = this.fullHqOptions.filter(item => item.toLowerCase().includes(value.toLowerCase()));
      // Sort: selected HQs first, then unselected HQs
      const selectedHqs = filteredHqs.filter(hq =>
        this.searchCriteriaNewGcc.hqValues?.includes(hq)
      );
      const unselectedHqs = filteredHqs.filter(hq =>
        !this.searchCriteriaNewGcc.hqValues?.includes(hq)
      );
      this.hqSearchOptions = [...selectedHqs, ...unselectedHqs];
    } else if (type == 'ACCDATE') {
      const filteredDates = this.fullannouncementDateOptions.filter(item => item.toLowerCase().includes(value.toLowerCase()));
      // Sort: selected dates first, then unselected dates
      const selectedDates = filteredDates.filter(date =>
        this.searchCriteriaNewGcc.announcementDateValues?.includes(date)
      );
      const unselectedDates = filteredDates.filter(date =>
        !this.searchCriteriaNewGcc.announcementDateValues?.includes(date)
      );
      this.announcementDateSearchOptions = [...selectedDates, ...unselectedDates];
    }
    else if (type == 'DATE') {
      if (this.customerType == this.constants.CustomerType.FDI) {
        const filteredDates = this.dateFdiMainList.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected dates first, then unselected dates
        const selectedDateValues = this.fdiSearchForm.get('dates')?.value || [];
        const selectedDates = filteredDates.filter(date => selectedDateValues.includes(date));
        const unselectedDates = filteredDates.filter(date => !selectedDateValues.includes(date));
        this.dateFdiList = [...selectedDates, ...unselectedDates];
      }
      else if (this.customerType == this.constants.CustomerType.ODI) {
        const filteredDates = this.dateOdiMainList.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected dates first, then unselected dates
        const selectedDateValues = this.odiSearchForm.get('dates')?.value || [];
        const selectedDates = filteredDates.filter(date => selectedDateValues.includes(date));
        const unselectedDates = filteredDates.filter(date => !selectedDateValues.includes(date));
        this.dateOdiList = [...selectedDates, ...unselectedDates];
      }
      else if (this.customerType == this.constants.CustomerType.ECB) {
        const filteredDates = this.dateEcbMainList.filter(item => item.toLowerCase().includes(value.toLowerCase()));
        // Sort: selected dates first, then unselected dates
        const selectedDateValues = this.ecbSearchForm.get('dates')?.value || [];
        const selectedDates = filteredDates.filter(date => selectedDateValues.includes(date));
        const unselectedDates = filteredDates.filter(date => !selectedDateValues.includes(date));
        this.dateEcbList = [...selectedDates, ...unselectedDates];
      }
    }
    else if (type == 'SAGE_CITY'){
      const allCities = this.getSageProspectsCityList();
      const filteredCities = allCities.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );

      // Sort: selected cities first, then unselected cities
      const selectedCityValues = this.searchForm.get('city')?.value || [];
      const selectedCities = filteredCities.filter(city => selectedCityValues.includes(city.value));
      const unselectedCities = filteredCities.filter(city => !selectedCityValues.includes(city.value));
      this.sageProspectsCityList = [...selectedCities, ...unselectedCities];
    }

  }

  // Helper method to sort city options with selected cities at the top
  sortCityOptionsWithSelectedFirst(): void {
    console.log('Sorting cities. Selected:', this.searchCriteria.city);
    console.log('Current citySearchOptions:', this.citySearchOptions);
    // Reset search input and show all cities
    this.citySearchInputVal = '';
    this.citySearchOptions = [...this.fullCityOptions];
    // Sort: selected cities first, then unselected cities
    const selectedCities = this.citySearchOptions.filter(city => this.searchCriteria.city?.includes(city));
    const unselectedCities = this.citySearchOptions.filter(city => !this.searchCriteria.city?.includes(city));
    this.citySearchOptions = [...selectedCities, ...unselectedCities];
    console.log('After sorting:', this.citySearchOptions);
  }

  // Helper method to sort state options with selected states at the top
  sortStateOptionsWithSelectedFirst(): void {
    console.log('Sorting states. Selected:', this.searchCriteria.state);
    // Reset search input and show all states
    this.stateSearchInputVal = '';
    this.stateSearchOptions = [...this.fullStateOptions];
    // Sort: selected states first, then unselected states
    const selectedStates = this.stateSearchOptions.filter(state => this.searchCriteria.state?.includes(state));
    const unselectedStates = this.stateSearchOptions.filter(state => !this.searchCriteria.state?.includes(state));
    this.stateSearchOptions = [...selectedStates, ...unselectedStates];
  }

  // Helper method to sort FDI city options with selected cities at the top
  sortFdiCitiesWithSelectedFirst(): void {
    console.log('Sorting FDI cities');
    // Clear search input when dropdown opens
    this.fdiCitySearchValue = '';
    // Reset to show all cities
    this.filteredCitiesList = [...this.citiesList];
    // Sort: selected cities first, then unselected cities
    const selectedCityValues = this.fdiSearchForm.get('cities')?.value || [];
    const selectedCities = this.filteredCitiesList.filter(city => selectedCityValues.includes(city.value));
    const unselectedCities = this.filteredCitiesList.filter(city => !selectedCityValues.includes(city.value));
    this.filteredCitiesList = [...selectedCities, ...unselectedCities];
  }

  // Helper method to sort FDI country options with selected countries at the top
  sortFdiCountriesWithSelectedFirst(): void {
    console.log('Sorting FDI countries');
    // Reset to show all countries
    this.countriesFdiList = [...this.countriesFdiMainList];
    // Sort: selected countries first, then unselected countries
    const selectedCountryValues = this.fdiSearchForm.get('countries')?.value || [];
    const selectedCountries = this.countriesFdiList.filter(country => selectedCountryValues.includes(country));
    const unselectedCountries = this.countriesFdiList.filter(country => !selectedCountryValues.includes(country));
    this.countriesFdiList = [...selectedCountries, ...unselectedCountries];
  }

  // Helper method to sort FDI date options with selected dates at the top
  sortFdiDatesWithSelectedFirst(): void {
    console.log('Sorting FDI dates');
    // Clear search input when dropdown opens
    this.fdiDateSearchValue = '';
    // Reset to show all dates
    this.dateFdiList = [...this.dateFdiMainList];
    // Sort: selected dates first, then unselected dates
    const selectedDateValues = this.fdiSearchForm.get('dates')?.value || [];
    const selectedDates = this.dateFdiList.filter(date => selectedDateValues.includes(date));
    const unselectedDates = this.dateFdiList.filter(date => !selectedDateValues.includes(date));
    this.dateFdiList = [...selectedDates, ...unselectedDates];
  }

  // Helper method to sort ODI city options with selected cities at the top
  sortOdiCitiesWithSelectedFirst(): void {
    console.log('Sorting ODI cities');
    // Clear search input when dropdown opens
    this.odiCitySearchValue = '';
    // Reset to show all cities
    this.filteredCitiesList = [...this.citiesList];
    // Sort: selected cities first, then unselected cities
    const selectedCityValues = this.odiSearchForm.get('cities')?.value || [];
    const selectedCities = this.filteredCitiesList.filter(city => selectedCityValues.includes(city.value));
    const unselectedCities = this.filteredCitiesList.filter(city => !selectedCityValues.includes(city.value));
    this.filteredCitiesList = [...selectedCities, ...unselectedCities];
  }

  // Helper method to sort ODI country options with selected countries at the top
  sortOdiCountriesWithSelectedFirst(): void {
    console.log('Sorting ODI countries');
    // Reset to show all countries
    this.countriesOdiList = [...this.countriesOdiMainList];
    // Sort: selected countries first, then unselected countries
    const selectedCountryValues = this.odiSearchForm.get('countries')?.value || [];
    const selectedCountries = this.countriesOdiList.filter(country => selectedCountryValues.includes(country));
    const unselectedCountries = this.countriesOdiList.filter(country => !selectedCountryValues.includes(country));
    this.countriesOdiList = [...selectedCountries, ...unselectedCountries];
  }

  // Helper method to sort ODI date options with selected dates at the top
  sortOdiDatesWithSelectedFirst(): void {
    console.log('Sorting ODI dates');
    // Clear search input when dropdown opens
    this.odiDateSearchValue = '';
    // Reset to show all dates
    this.dateOdiList = [...this.dateOdiMainList];
    // Sort: selected dates first, then unselected dates
    const selectedDateValues = this.odiSearchForm.get('dates')?.value || [];
    const selectedDates = this.dateOdiList.filter(date => selectedDateValues.includes(date));
    const unselectedDates = this.dateOdiList.filter(date => !selectedDateValues.includes(date));
    this.dateOdiList = [...selectedDates, ...unselectedDates];
  }

  // Helper method to sort ECB city options with selected cities at the top
  sortEcbCitiesWithSelectedFirst(): void {
    console.log('Sorting ECB cities');
    // Clear search input when dropdown opens
    this.ecbCitySearchValue = '';
    // Reset to show all cities
    this.filteredCitiesList = [...this.citiesList];
    // Sort: selected cities first, then unselected cities
    const selectedCityValues = this.ecbSearchForm.get('cities')?.value || [];
    const selectedCities = this.filteredCitiesList.filter(city => selectedCityValues.includes(city.value));
    const unselectedCities = this.filteredCitiesList.filter(city => !selectedCityValues.includes(city.value));
    this.filteredCitiesList = [...selectedCities, ...unselectedCities];
  }

  // Helper method to sort ECB date options with selected dates at the top
  sortEcbDatesWithSelectedFirst(): void {
    console.log('Sorting ECB dates');
    // Clear search input when dropdown opens
    this.ecbDateSearchValue = '';
    // Reset to show all dates
    this.dateEcbList = [...this.dateEcbMainList];
    // Sort: selected dates first, then unselected dates
    const selectedDateValues = this.ecbSearchForm.get('dates')?.value || [];
    const selectedDates = this.dateEcbList.filter(date => selectedDateValues.includes(date));
    const unselectedDates = this.dateEcbList.filter(date => !selectedDateValues.includes(date));
    this.dateEcbList = [...selectedDates, ...unselectedDates];
  }

  // Helper method to sort New GCC announcement date options with selected dates at the top
  sortNewGccAnnouncementDatesWithSelectedFirst(): void {
    console.log('Sorting New GCC announcement dates');
    // Clear search input when dropdown opens
    this.gccAnnouncementDateSearchValue = '';
    // Reset to show all dates
    this.announcementDateSearchOptions = [...this.fullannouncementDateOptions];
    const allOption = this.announcementDateSearchOptions.filter(date => date === 'ALL');
    // Sort: selected dates first, then unselected dates
    const selectedDates = this.announcementDateSearchOptions.filter(date =>
      date !== 'ALL' &&
      this.searchCriteriaNewGcc.announcementDateValues?.includes(date)
    );
    const unselectedDates = this.announcementDateSearchOptions.filter(date =>
      date !== 'ALL' &&
      !this.searchCriteriaNewGcc.announcementDateValues?.includes(date)
    );
    this.announcementDateSearchOptions = [...allOption,...selectedDates, ...unselectedDates];
  }

  // Helper method to sort New GCC HQ options with selected HQs at the top
  sortNewGccHqWithSelectedFirst(): void {
    console.log('Sorting New GCC HQ');
    // Clear search input when dropdown opens
    this.gccHqSearchValue = '';
    // Reset to show all HQs
    this.hqSearchOptions = [...this.fullHqOptions];
    const allOption = this.hqSearchOptions.filter(hq => hq === 'ALL');
    // Sort: selected HQs first, then unselected HQs
    const selectedHqs = this.hqSearchOptions.filter(hq =>
      hq !== 'ALL' &&
      this.searchCriteriaNewGcc.hqValues?.includes(hq)
    );
    const unselectedHqs = this.hqSearchOptions.filter(hq =>
      hq !== 'ALL' &&
      !this.searchCriteriaNewGcc.hqValues?.includes(hq)
    );
    this.hqSearchOptions = [...allOption,...selectedHqs, ...unselectedHqs];
  }

  // Helper method to sort New GCC location options with selected locations at the top
  sortNewGccLocationsWithSelectedFirst(): void {
    console.log('Sorting New GCC locations');
    // Clear search input when dropdown opens
    this.gccLocationSearchValue = '';
    // Reset to show all locations
    this.locationSearchOptions = [...this.fullLocationOptions];
    const allOption = this.locationSearchOptions.filter(location => location === 'ALL');
    // Sort: selected locations first, then unselected locations
    const selectedLocations = this.locationSearchOptions.filter(location =>
      location !== 'ALL' &&
      this.searchCriteriaNewGcc.locationValues?.includes(location)
    );
    const unselectedLocations = this.locationSearchOptions.filter(location =>
      location !== 'ALL' &&
      !this.searchCriteriaNewGcc.locationValues?.includes(location)
    );
    this.locationSearchOptions = [...allOption,...selectedLocations, ...unselectedLocations];
  }

  // Get city list for Sage Prospects dropdown from topBarFilters
  getSageProspectsCityList(): any[] {
    const cityFilter = this.topBarFilters.find(f => f.name === 'City');
    if (cityFilter && cityFilter.optionFilter) {
      return cityFilter.optionFilter.filter(opt => opt.name && opt.name !== 'All');
    }
    return [];
  }

  // Search cities for Sage Prospects dropdown
  onSearchSageProspectsCity(searchValue: string): void {
    const allCities = this.getSageProspectsCityList();
    const selectedCityValues = this.searchForm.get('city')?.value || [];

    if (!searchValue || searchValue.trim() === '') {
      this.sageProspectsCityList = allCities;
    } else {
      // Filter cities based on search
      const filteredCities = allCities.filter(city =>
        city.name.toLowerCase().includes(searchValue.toLowerCase())
      );

      // Always include selected cities even if they don't match the search
      const selectedCities = allCities.filter(city =>
        selectedCityValues.includes(city.value) &&
        !filteredCities.some(fc => fc.value === city.value)
      );

      this.sageProspectsCityList = [...selectedCities, ...filteredCities];
    }
    // Sort to show selected cities at top after filtering
    this.sortSageProspectsCitiesInPlace();
  }

  // Sort Sage Prospects cities with selected cities at the top (in-place sorting)
  sortSageProspectsCitiesInPlace(): void {
    const selectedCityValues = this.searchForm.get('city')?.value || [];
    const selectedCities = this.sageProspectsCityList.filter(city =>
      selectedCityValues.includes(city.value)
    );
    const unselectedCities = this.sageProspectsCityList.filter(city =>
      !selectedCityValues.includes(city.value)
    );
    this.sageProspectsCityList = [...selectedCities, ...unselectedCities];
  }

  // Sort Sage Prospects cities when dropdown opens
  sortSageProspectsCitiesWithSelectedFirst(): void {
    console.log('Sorting Sage Prospects cities');
    // Clear search input when dropdown opens
    this.sageProspectsCitySearchValue = '';
    // Reset to show all cities
    this.sageProspectsCityList = this.getSageProspectsCityList();
    // Sort: selected cities first, then unselected cities
    this.sortSageProspectsCitiesInPlace();
  }

  // Handle city selection change for Sage Prospects (checkbox-based)
  onSageProspectsCitySelectionChange(option: any, event: MatCheckboxChange): void {
    const citiesControl = this.searchForm.get('city');
    let currentCities = citiesControl?.value || [];

    if (event.checked) {
      currentCities.push(option.value);
    } else {
      currentCities = currentCities.filter((cityValue: any) => cityValue !== option.value);
    }

    citiesControl?.setValue(currentCities);
    // Re-sort city list to show selected cities at the top (this also clears search)
    this.sortSageProspectsCitiesWithSelectedFirst();
    // Trigger API call when city selection changes
    this.getCustomerList();
  }

  // Get placeholder text for Sage Prospects city dropdown showing selected count
  getSageProspectsCityPlaceholder(): string {
    const selectedCities = this.searchForm.get('city')?.value || [];
    const count = selectedCities.length;
    return count > 0 ? `Selected cities: ${count}` : 'Select City';
  }

  getSelectedCitiesOrCountriesCount(type: string): string {
    if (this.customerType == this.constants.CustomerType.FDI) {
      if (type == 'CITY') {
        const tempVar = (this.fdiSearchForm.get('cities')?.value || []).length;
        return tempVar != 0 ? ('Selected cities: ' + tempVar) : 'Select city';
      }
      else if (type == 'COUNTRY') {
        const tempVar = (this.fdiSearchForm.get('countries')?.value || []).length;
        return tempVar != 0 ? ('Selected Countries: ' + tempVar) : 'Select Countries';
      }
      else if (type == 'DATE') {
        const tempVar = (this.fdiSearchForm.get('dates')?.value || []).length;
        return tempVar != 0 ? ('Selected Dates: ' + tempVar) : 'Select Period';
      }

      else if (type == 'CUSTOMER_TYPE') {
        const tempVar = (this.fdiSearchForm.get('customerTypes')?.value || []).length;
        return tempVar != 0 ? ('Selected types: ' + tempVar) : 'Select Customer Type';
      }

    }

    else if (this.customerType == this.constants.CustomerType.ODI) {
      if (type == 'CITY') {
        const tempVar = (this.odiSearchForm.get('cities')?.value || []).length;
        return tempVar != 0 ? ('Selected cities: ' + tempVar) : 'Select city';
      }
      else if (type == 'COUNTRY') {
        const tempVar = (this.odiSearchForm.get('countries')?.value || []).length;
        return tempVar != 0 ? ('Selected Countries: ' + tempVar) : 'Select Countries';
      }
      else if (type == 'DATE') {
        const tempVar = (this.odiSearchForm.get('dates')?.value || []).length;
        return tempVar != 0 ? ('Selected Dates: ' + tempVar) : 'Select Period';
      }

      else if (type == 'CUSTOMER_TYPE') {
        const tempVar = (this.odiSearchForm.get('customerTypes')?.value || []).length;
        return tempVar != 0 ? ('Selected types: ' + tempVar) : 'Select Customer Type';
      }

    }

    else if (this.customerType == this.constants.CustomerType.ECB) {
      if (type == 'CITY') {
        const tempVar = (this.ecbSearchForm.get('cities')?.value || []).length;
        return tempVar != 0 ? ('Selected cities: ' + tempVar) : 'Select city';
      }
      else if (type == 'DATE') {
        const tempVar = (this.ecbSearchForm.get('dates')?.value || []).length;
        return tempVar != 0 ? ('Selected Dates: ' + tempVar) : 'Select Period';
      }

      else if (type == 'CUSTOMER_TYPE') {
        const tempVar = (this.ecbSearchForm.get('customerTypes')?.value || []).length;
        return tempVar != 0 ? ('Selected types: ' + tempVar) : 'Select Customer Type';
      }

    }

    else if (this.customerType == 7) {
      if (type == 'CITY') {
        const tempVar = (this.searchCriteria.city || []).length;
        return tempVar != 0 ? ('Selected cities: ' + tempVar) : 'Select city';
      }
      if (type == 'STATE') {
        const tempVar = (this.searchCriteria.state || []).length;
        return tempVar != 0 ? ('Selected state: ' + tempVar) : 'Select state';
      }
    }

    if (type == 'NEWGCCLOCATION') {

      const tempVar = (this.searchCriteriaNewGcc.locationValues || []).length;
      return tempVar != 0 ? ('Selected Location: ' + tempVar) : 'Select Location';
    }
    if (type == 'NEWGCCHQ') {
      const tempVar = (this.searchCriteriaNewGcc.hqValues || []).length;
      return tempVar != 0 ? ('Selected HQ: ' + tempVar) : 'Select HQ';
    }
    if (type == 'NEWGCCETB') {
      const tempVar = (this.searchCriteriaNewGcc.etbValues || []).length;
      return tempVar != 0 ? ('Selected values: ' + tempVar) : 'Select (Y/N)';
    }
    if (type == 'ANNCDATE') {
      const tempVar = (this.searchCriteriaNewGcc.announcementDateValues || []).length;
      return tempVar != 0 ? ('Selected values: ' + tempVar) : 'Select Month Year';
    }

    return 'Select Values';
  }


  getNewGcc() {
    let request: any = {};
    request["pageNumber"] = this.newGccPage;
    request["pageSize"] = this.newGccPageSize;


    request["announcementDateValues"] = this.searchCriteriaNewGcc.announcementDateValues;
    request["gccNameValue"] = this.searchCriteriaNewGcc.gccNameValue;
    request["hqValues"] = this.searchCriteriaNewGcc.hqFinalValues;
    request["locationValues"] = this.searchCriteriaNewGcc.locationFinalValues;
    request["parentNameValue"] = this.searchCriteriaNewGcc.parentNameValue;
    request["etbValues"] = this.searchCriteriaNewGcc.etbValues;
    request["grmValue"] = this.searchCriteriaNewGcc.grmValue;
    request["announcementDateSortingOrder"] = this.sortingDirectionNewGcc.announcementDateSortingOrder;
    request["gccNameSortingOrder"] = this.sortingDirectionNewGcc.gccNameSortingOrder;
    request["parentNameSorting"] = this.sortingDirectionNewGcc.parentNameSorting;
    request["industryVertical"] = this.searchCriteriaNewGcc.industryVertical;
    request["industryVerticalSortingOrder"] = this.sortingDirectionNewGcc.industryVerticalSortingOrder;
    request["grmSorting"] = this.sortingDirectionNewGcc.grmSorting;
    request["hqSorting"] = this.sortingDirectionNewGcc.hqSorting;
    request["locationSorting"] = this.sortingDirectionNewGcc.locationSorting;
    request["etbSorting"] = this.sortingDirectionNewGcc.etbSorting;


    this.loaderService.subLoaderShow();
    this.msmeService.getNewGcc(request, true).subscribe((response: any) => {
      this.loaderService.subLoaderHide();
      if (response.status == 200) {
        this.newGccList = response.data;

        this.newGccPageSize = response.pageSize;
        this.newGccTotalPages = response.totalPage;
        this.newGccTotalSize = response.totalSize;

        this.isNewGcc = true;

      }
      else {
        this.commonService.errorSnackBar(response.message)

      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')

    })
  }

  newGccPageSizeChange(pageSize: number, page: number) {
    this.newGccPageSize = pageSize;
    this.newGccPage = page;
    this.getNewGcc();
  }

  newGccOnPageChange(pageNumber: number): void {
    this.newGccPage = pageNumber;
    this.newGccStartIndex = (pageNumber - 1) * this.newGccPageSize;
    this.getNewGcc();
  }

  // Function to handle column and value search

  onNewGccSearch() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.typingTimer = setTimeout(() => {
      this.getNewGcc();
    }, 500);
  }

  // Method to fetch Cities and States from the API new inCorporation
  getLocationsAndHqs(ignoreLoader?: boolean) {
    this.msmeService.getLocationAndHQ(ignoreLoader).subscribe(
      (response: any) => {
        if (response.status === 200) {

          this.locationSearchOptions = response.data.location;
          this.fullLocationOptions = this.locationSearchOptions;

          this.hqSearchOptions = response.data.hq;
          this.fullHqOptions = this.hqSearchOptions;

          this.etbOptions = of(response.data.etb);
          this.etbSearchOptions = response.data.etb;

          this.announcementDateSearchOptions = response.data.annDates;
          this.fullannouncementDateOptions = this.announcementDateSearchOptions;

          this.searchCriteriaNewGcc.locationValues = this.locationSearchOptions;
          this.searchCriteriaNewGcc.hqValues = this.hqSearchOptions;
          this.searchCriteriaNewGcc.announcementDateValues = this.announcementDateSearchOptions;


        }
        else {
          this.commonService.errorSnackBar('Failed to fetch Location and HQ data');

        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something went wrong while fetching Location and HQ');

      }
    );
  }

  filterNewGccFiled(value, type) {
    if (type == 1) {
      this.etbOptions = of(this.etbSearchOptions.filter(item => item.toLowerCase().includes(value.toLowerCase())));
      return this.etbOptions;
    }
  }

  onEtbErase(value: any): void {
    if (!value || value.trim() === '') {
      this.getNewGcc();
    }
  }


  toggleSortingOrder(field: string,direction:string): void {
    const keyMap = {
      parentName: 'parentNameSorting',
      announcementDate: 'announcementDateSortingOrder',
      gccName: 'gccNameSortingOrder',
      industryVertical: 'industryVerticalSortingOrder',
      grm: 'grmSorting',
      etb: 'etbSorting',
      hq: 'hqSorting',
      location: 'locationSorting'
    };

    const sortKey = keyMap[field];

    if (!sortKey) return;

    const currentOrder = this.sortingDirectionNewGcc[sortKey];

    // Toggle the sort order: null -> ASC -> DESC -> null
    // if (currentOrder === null) {
    //   this.sortingDirectionNewGcc[sortKey] = 'ASC';
    // } else if (currentOrder === 'ASC') {
    //   this.sortingDirectionNewGcc[sortKey] = 'DESC';
    // } else if (currentOrder === 'DESC') {
    //   this.sortingDirectionNewGcc[sortKey] = 'ASC';
    // }
    this.sortingDirectionNewGcc[sortKey] =   direction === 'ASC' ? 'ASC' : 'DESC';
    this.onNewGccSearch(); // Pass sortingDirectionNewGcc to API
  }


  toggleSortingOrderIncorporation(field: string, direction:string): void {
    const keyMap = {
      companyNameSortingOrder: 'companyNameSortingOrder',
      citySortingOrder: 'citySortingOrder',
      stateSortingOrder: 'stateSortingOrder',
      dateOfIncSortingOrder: 'dateOfIncSortingOrder',
      myPortfolioCompanyNameSortingOrder: 'myPortfolioCompanyNameSortingOrder',
      relatedMncCompanyNameSortingOrder: 'relatedMncCompanyNameSortingOrder'
    };

    const sortKey = keyMap[field];

    if (!sortKey) return;

    const currentOrder = this.sortingDirectionIncorporation[sortKey];
    this.sortingDirectionIncorporation.citySortingOrder = null;
    this.sortingDirectionIncorporation.stateSortingOrder = null;
    this.sortingDirectionIncorporation.companyNameSortingOrder = null;
    this.sortingDirectionIncorporation.dateOfIncSortingOrder = null;
    this.sortingDirectionIncorporation.myPortfolioCompanyNameSortingOrder = null;
    this.sortingDirectionIncorporation.relatedMncCompanyNameSortingOrder = null;

    // Toggle the sort order: null -> ASC -> DESC -> null
    // if (currentOrder === null) {
    //   this.sortingDirectionIncorporation[sortKey] = 'ASC';
    // } else if (currentOrder === 'ASC') {
    //   this.sortingDirectionIncorporation[sortKey] = 'DESC';
    // } else {
    //   this.sortingDirectionIncorporation[sortKey] = 'ASC';
    // }
    this.sortingDirectionIncorporation[sortKey] =   direction === 'ASC' ? 'ASC' : 'DESC';
    this.onNewIncorporationSearch();
  }
  removeNewGccFilter() {
    this.searchCriteriaNewGcc.announcementDateValues = [];
    this.searchCriteriaNewGcc.announcementDateValues = this.fullannouncementDateOptions;
    this.searchCriteriaNewGcc.gccNameValue = '';
    this.searchCriteriaNewGcc.locationValues = this.fullLocationOptions;
    this.searchCriteriaNewGcc.hqValues = this.fullHqOptions;
    this.searchCriteriaNewGcc.hqFinalValues = [];
    this.searchCriteriaNewGcc.locationFinalValues = [];
    this.searchCriteriaNewGcc.parentNameValue = '';
    this.searchCriteriaNewGcc.etbValues = 'All';
    this.searchCriteriaNewGcc.grmValue = '';
    this.sortingDirectionNewGcc.announcementDateSortingOrder = null;
    this.sortingDirectionNewGcc.gccNameSortingOrder = null;
    this.sortingDirectionNewGcc.parentNameSorting = null;
    this.searchCriteriaNewGcc.industryVertical = '';
    this.sortingDirectionNewGcc.industryVerticalSortingOrder = null;
    this.sortingDirectionNewGcc.grmSorting = null;
    this.sortingDirectionNewGcc.hqSorting = null;
    this.sortingDirectionNewGcc.locationSorting = null;
    this.sortingDirectionNewGcc.etbSorting = null;



    this.onNewGccSearch();

  }

  onDropdownChange(): void {
    this.onNewGccSearch();
  }


  downloadExcelFile() {
    let request: any = {};
    request["pageNumber"] = 0;
    request["pageSize"] = this.inCorporationTotalSize;


    request["cinValue"] = this.searchCriteria.cin;
    request["companyValue"] = this.searchCriteria.companyName;
    request["cityValue"] = this.searchCriteria.city;
    request["stateValue"] = this.searchCriteria.state;
    request["dateOfIncValue"] = this.searchCriteria.dateOfIncorporation;
    request["myPortfolioCompanyNameValue"] = this.searchCriteria.etb;
    request["relatedMncCompanyNameValue"] = this.searchCriteria.mnc;
    request["companyNameSortingOrder"] = this.sortingDirectionIncorporation.companyNameSortingOrder;
    request["citySortingOrder"] = this.sortingDirectionIncorporation.citySortingOrder;
    request["stateSortingOrder"] = this.sortingDirectionIncorporation.stateSortingOrder;
    request["reportType"] = "NEW_INCORPORATION_STATUS";

    this.dialog.open(ReportStatusPopupComponent, { panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true });

  }

  onEntityTypeChange(value: string) {
    this.entityType = value;

    if (value === 'NON-MCA') {
      this.selectSearchType = 'PAN';
      this.companySearch = '';
    } else if (value === 'MCA') {
      this.selectSearchType = 'COMPANY';
      this.companySearch = '';
    }
  }
  onToggleChange(isInactive: boolean, type: string) {
    console.log(`Toggle changed for ${type}: ${isInactive}`);
    switch (type) {
      case 'SAGE':
        this.isCustomerTypeInActiveForSage = isInactive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.PROSPECTS - 1, isInactive);
        this.getCustomerList();
        break;
      case 'FDI':
        this.isCustomerTypeInActiveForNewFdi = isInactive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.FDI - 1, isInactive);
        this.getCustomerList();
        break;
      case 'ODI':
        this.isCustomerTypeInActiveForNewOdi = isInactive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.ODI - 1, isInactive);
        this.getCustomerList();
        break;
      case 'ECB':
        this.isCustomerTypeInActiveForNewEcb = isInactive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.ECB - 1, isInactive);
        this.getCustomerList();
        break;
    }
  }

  prepareNewGccReq() {
    let request: any = {};
    request["pageNumber"] = this.newGccPage;
    request["pageSize"] = this.newGccPageSize;


    request["announcementDateValues"] = this.searchCriteriaNewGcc.announcementDateValues;
    request["gccNameValue"] = this.searchCriteriaNewGcc.gccNameValue;
    request["hqValues"] = this.searchCriteriaNewGcc.hqFinalValues;
    request["locationValues"] = this.searchCriteriaNewGcc.locationFinalValues;
    request["parentNameValue"] = this.searchCriteriaNewGcc.parentNameValue;
    request["etbValues"] = this.searchCriteriaNewGcc.etbValues;
    request["grmValue"] = this.searchCriteriaNewGcc.grmValue;
    request["announcementDateSortingOrder"] = this.sortingDirectionNewGcc.announcementDateSortingOrder;
    request["gccNameSortingOrder"] = this.sortingDirectionNewGcc.gccNameSortingOrder;
    request["parentNameSorting"] = this.sortingDirectionNewGcc.parentNameSorting;
    request["industryVertical"] = this.searchCriteriaNewGcc.industryVertical;
    request["industryVerticalSortingOrder"] = this.sortingDirectionNewGcc.industryVerticalSortingOrder;
    request["grmSorting"] = this.sortingDirectionNewGcc.grmSorting;
    request["hqSorting"] = this.sortingDirectionNewGcc.hqSorting;
    request["locationSorting"] = this.sortingDirectionNewGcc.locationSorting;
    request["etbSorting"] = this.sortingDirectionNewGcc.etbSorting;

    return request;

  }

  getNewGccExcel() {
    let request = this.prepareNewGccReq();
    request["reportType"] = "NEW_GCC_STATUS";
    this.msmeService.getNewGccExcel(request, true).subscribe(
      (response: any) => {
        console.log('response: ', response);
        if (response.status == 200) {

        } else {
          this.commonService.errorSnackBar(response.message || 'Failed to download New GCC data');
        }
      },
      error => {
        this.commonService.errorSnackBar('Something went wrong while downloading New Gcc data');
      }
    );

    this.dialog.open(ReportStatusPopupComponent, { panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true });
  }

  onMenuClosed(filter: any) {
    if (filter.name === 'Area' && this.allAreaData?.length > 0) {
      this.locationBatchSize = 20;
      filter.optionFilter = this.allAreaData.slice(0, this.locationBatchSize);
      this.currentAreaIndex = this.locationBatchSize;
    }
  }

  getCustomerById(customerId: number): any {
    if (this.customerType == this.constants.CustomerType.PROSPECTS) {
      return this.customerList.find(c => c.id === customerId);
    }
    else if (this.customerType == this.constants.CustomerType.FDI) {
      return this.fdiList.find(c => c.id === customerId);
    }
    else if (this.customerType == this.constants.CustomerType.ODI) {
      return this.odiList.find(c => c.id === customerId);
    }
    else if (this.customerType == this.constants.CustomerType.ECB) {
      return this.ecbList.find(c => c.id === customerId);
    }
    return null;
  }


  filterDataList(filterListMaster: any[], appliedFilters: any) {
    const flattenedData: any[] = [];

    filterListMaster.forEach(group => {
      group.insightTwoFilter.forEach((f: any) => {
        if (f.filterTwoName=='Customer Type' && (f.selected == null || f.selected?.length==0)) {
          return;
        }

        const key =
          f.keyName ||
          (f.filterTwoName ? f.filterTwoName.replace(/\s+/g, '') : null);

        if (!key || this.ignoreKeys.includes(key)) return;

        const isSubCheckBox = ("masterGroupProduct" in appliedFilters) || ("AvailingProducts" in appliedFilters);
        if (!(key in appliedFilters)) {
          if (key == 'businessLine' && !isSubCheckBox) {
            return;
          } else if (key != 'businessLine'){
            return;
          }
        }

        const appliedValue = appliedFilters[key == 'businessLine' && isSubCheckBox ? 'masterGroupProduct' : key];

        if (f.type === "checkbox") {
          let selectedKeys = [];
          if (isSubCheckBox) {
           // Check if the main value matches
            let checkboxList = f.json.keys;
              selectedKeys = checkboxList
              ?.filter(k => {
                  // Check if the main value matches
                  const mainMatch = appliedValue?.includes(k.value);

                  // Check if any value in the subKey list matches (if subKey exists)
                  const subMatch = k.subKeys?.some(sub => appliedValue?.includes(sub.value));

                  return mainMatch || subMatch;
              })
             .flatMap(k => {
                const matchedSubNames = k.subKeys
                  ?.filter(sub => appliedValue?.includes(sub.value))
                  .map(sub => sub.name) || [];
                if (matchedSubNames.length > 0) {
                  return matchedSubNames;
                }
                return [k.name];
              });
          } else {
            let checkboxList = f.json.keys;
            selectedKeys = checkboxList
              ?.filter(k => {
                  // Check if the main value matches
                  const mainMatch = appliedValue?.includes(k.value);
                  return mainMatch;
              })
              .map(k => k.name);
          }

          selectedKeys.forEach(name => {
            flattenedData.push({
              filterName: group.filterName,
              subFilterName: f.filterTwoName,
              subFilterValue: name,
              type: f.type
            });
          });
        }

        else if (f.type === "radioButton") {
         const selectedKeys = f.json.keys
            .filter(k => f.filterTwoName == 'Listing Status' ? (JSON.stringify(appliedValue)==k.value) : (appliedValue?.toString()==k.value.toString()))
            .map(k => k.name);

          flattenedData.push({
            filterName: group.filterName,
            subFilterName: f.filterTwoName,
            subFilterValue: selectedKeys,
            type: f.type
          });
        }

        else if (f.type === "minMax") {
          let subFilterValue = '';
          const hasMin = appliedValue?.minValue !== null && appliedValue?.minValue !== undefined;
          const hasMax = appliedValue?.maxValue !== null && appliedValue?.maxValue !== undefined;

          if (hasMin && hasMax) {
            subFilterValue = `Min ${appliedValue.minValue} - Max ${appliedValue.maxValue}`;
          } else if (hasMin) {
            subFilterValue = `Min ${appliedValue.minValue}`;
          } else if (hasMax) {
            subFilterValue = `Max ${appliedValue.maxValue}`;
          }

          if (subFilterValue) {
            flattenedData.push({
              filterName: group.filterName,
              subFilterName: f.filterTwoName,
              subFilterValue: subFilterValue,
              type: f.type
            });
          }
        }

        else if (f.type === "dateRange" || (appliedValue.fromDate && appliedValue.toDate)) {
          flattenedData.push({
            filterName: group.filterName,
            subFilterName: f.filterTwoName,
            subFilterValue: `${appliedValue.fromDate} to ${appliedValue.toDate}`,
            type: "dateRange"
          });
        }

      });
    });

    this.appliedFilterDataList = flattenedData;

    // Regenerate grouped filters list
    this.generateGroupedAppliedFilters();
  }

  // Clear dependent filters
  clearDependentFilters(filterNames: string[]) {
    filterNames.forEach(name => {
      const index = this.topBarFilters.findIndex(x => x.name === name);
      if (this.topBarFilters[index]) {
        this.topBarFilters[index].optionFilter = [];
        this.topBarFilters[index].selectedFilter = [];
      }
    });
  }

  /** Clear selectedItemsMap for Location or Area when City/Location changes so dependent filter resets in menu too. */
  private clearLocationAreaSelectionFromMenu(filterKey: 'Location' | 'Area') {
    const opt = this.searchByOptionsTopBar?.find(o => o.key === filterKey);
    if (opt?.filter_name) {
      this.selectedItemsMap[opt.filter_name] = [];
    }
  }

  // Compare arrays
  arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }

  // createFilteredList(finalFilterJson: any) {
  //   this.filteredKeyValueList = Object.entries(finalFilterJson)
  //     .filter(([key]) => !this.ignoreKeys.includes(key))
  //     .map(([key, value]) => ({ key, value }));
  // }

  // Handle Customer Type toggle from top bar
  onCustomerTypeToggle(event: any): void {
    const isActive = event.checked;
    const isCustomerTypeInActive = !isActive;
    console.log('Customer Type Toggle - isActive:', isActive, 'isCustomerTypeInActive:', isCustomerTypeInActive);
    this.isCustomerTypeActive = isActive;
    switch (this.selectedTabIndex) {
      case 0:
        this.isCustomerTypeInActiveForSage = isCustomerTypeInActive;
        this.isCustomerTypeActiveSage = isActive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.PROSPECTS - 1, isCustomerTypeInActive);
        break;
      case 2:
        this.isCustomerTypeInActiveForNewFdi = isCustomerTypeInActive;
        this.isCustomerTypeActiveNewFdi = isActive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.FDI - 1, isCustomerTypeInActive);
        break;
      case 3:
        this.isCustomerTypeInActiveForNewOdi = isCustomerTypeInActive;
        this.isCustomerTypeActiveNewOdi = isActive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.ODI - 1, isCustomerTypeInActive);
        break;
      case 4:
        this.isCustomerTypeInActiveForNewEcb = isCustomerTypeInActive;
        this.isCustomerTypeActiveNewEcb = isActive;
        this.commonService.updateCustomerInActive(this.constants.CustomerType.ECB - 1, isCustomerTypeInActive);
        break;
    }

    // Refresh customer list
    this.getCustomerList();
  }

  toggleShowAllFilters(): void {
    this.showAllFilters = !this.showAllFilters;
  }

  // Get total count of applied filters
  getTotalAppliedFiltersCount(): number {
    return this.appliedFilterDataList.length;
  }

  // Get count of additional filters (beyond the first one)
  getAdditionalFiltersCount(): number {
    return Math.max(0, this.groupedAppliedFilters.length - 4);
  }

  // Remove individual applied filter
    removeAppliedFilter(filterItem: any): void {
      // Find and remove the filter from filterListMaster
      this.filterStates[this.selectedTabIndex].forEach(filter1 => {
        if (filter1.filterName === filterItem.filterName) {
          filter1.insightTwoFilter.forEach(filter2 => {
            if (filter2.filterTwoName === filterItem.subFilterName) {
                if (filter2.type === 'checkbox') {
                // Find the key being removed
                let checkboxList = filter2.json.keys;
                const key = checkboxList.find(k => k.name === filterItem.subFilterValue);

                if (key) {
                  // Check if this is the "All" option (sNo === -1)
                  const isAllOption = key.sNo === -1 || key.value === 'All' || key.name.toLowerCase() === 'all';

                  if (isAllOption) {
                    // If removing "All", remove all other options too
                    checkboxList.forEach(k => {
                      k.selected = false;
                      if (k.subKeys) {
                        k.subKeys.forEach(subKey => subKey.selected = false);
                      }
                    });
                    filter2.selected = [];
                    // Update counts - remove all selections
                    const totalCount = filter2.json.count || 0;
                    filter1.count = Math.max(0, (filter1.count || 0) - totalCount);
                    filter2.json.count = 0;
                  } else {
                    // If removing a regular option, also remove "All" if it exists
                    const allOption = checkboxList.find(k => k.sNo === -1 || k.value === 'All' || k.name.toLowerCase() === 'all');

                    // Unselect the specific key
                    key.selected = false;
                    const index = filter2.selected?.indexOf(key.value);
                    if (index !== undefined && index > -1) {
                      filter2.selected.splice(index, 1);
                    }
                    filter1.count = Math.max(0, (filter1.count || 0) - 1);
                    filter2.json.count = Math.max(0, (filter2.json.count || 0) - 1);

                    // If "All" was selected, unselect it too
                    if (allOption && allOption.selected) {
                      allOption.selected = false;
                      const allIndex = filter2.selected?.indexOf(allOption.value);
                      if (allIndex !== undefined && allIndex > -1) {
                        filter2.selected.splice(allIndex, 1);
                      }
                      filter1.count = Math.max(0, (filter1.count || 0) - 1);
                      filter2.json.count = Math.max(0, (filter2.json.count || 0) - 1);
                    }
                  }
                }
              } else if (filter2.type === 'radioButton') {
                filter2.json.value = null;
                filter1.count = Math.max(0, (filter1.count || 0) - 1);
                filter2.json.count = 0;
              } else if (filter2.type === 'minMax') {
                filter2.json.min = null;
                filter2.json.max = null;
                filter2.json.minRaw = null;
                filter2.json.maxRaw = null;
                filter1.count = Math.max(0, (filter1.count || 0) - 1);
                filter2.json.count = 0;
              } else if (filter2.type === 'date' || filter2.type === 'dateRange') {
                filter2.json.fromDate = null;
                filter2.json.toDate = null;
                filter1.count = Math.max(0, (filter1.count || 0) - 1);
                filter2.json.count = 0;
              }
            }
          });
        }
      });

      // Update applied filters list for display
      const finalFilterJson = this.applyFilter(null);
      this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);

      // Refresh the data
      this.getCustomerList();
    }

    // Remove all filters for a specific sub-filter
    removeFilterGroup(filterName: string, subFilterName: string): void {
      this.filterStates[this.selectedTabIndex].forEach(filter1 => {
        if (filter1.filterName === filterName) {
          filter1.insightTwoFilter.forEach(filter2 => {
            if (filter2.filterTwoName === subFilterName) {
              // Clear all selections for this filter
              if (filter2.type === 'checkbox') {
                if (filter2.json.keys) {
                  filter2.json.keys.forEach(key => {
                    key.selected = false;
                    if (key.subKeys) {
                      key.subKeys.forEach(subKey => subKey.selected = false);
                    }
                  });
                }
                filter2.selected = [];
              } else if (filter2.type === 'radioButton') {
                filter2.json.value = null;
              } else if (filter2.type === 'minMax') {
                filter2.json.min = null;
                filter2.json.max = null;
                filter2.json.minRaw = null;
                filter2.json.maxRaw = null;
              } else if (filter2.type === 'date' || filter2.type === 'dateRange') {
                filter2.json.fromDate = null;
                filter2.json.toDate = null;
              }

              const oldCount = filter2.json.count || 0;
              filter1.count = Math.max(0, (filter1.count || 0) - oldCount);
              filter2.json.count = 0;
            }
          });
        }
      });

      // Update applied filters list for display
      const finalFilterJson = this.applyFilter(null);
      this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);

      // Refresh the data
      this.getCustomerList();
    }

  showChipDropdown(filterId: number): void {
    console.log('🎯 showChipDropdown called with filterId:', filterId);
    // Clear any pending hide timeout
    if (this.hideDropdownTimeout) {
      clearTimeout(this.hideDropdownTimeout);
      this.hideDropdownTimeout = null;
    }
    this.activeChipDropdown = filterId;
  }

  hideChipDropdown(): void {
    console.log('🎯 hideChipDropdown called');
    // Add a small delay to allow moving to the dropdown
    this.hideDropdownTimeout = setTimeout(() => {
      this.activeChipDropdown = null;
    }, 200);
  }

  private generateGroupedAppliedFilters(): void {
    const grouped = new Map<string, any>();

    this.appliedFilterDataList.forEach(item => {
      const key = `${item.filterName}|${item.subFilterName}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          filterName: item.filterName,
          subFilterName: item.subFilterName,
          type: item.type,
          values: []
        });
      }
      grouped.get(key).values.push(item.subFilterValue);
    });

    this.groupedAppliedFilters = Array.from(grouped.values());
  }

  // Check if column has special rendering (like badge)
    hasSpecialRendering(columnName: string): boolean {
      return columnName === 'PAN';
    }
  
    // Get CSS class for column
    getColumnClass(columnName: string): string {
      switch (columnName) {
        case 'Customer ID':
          return '';
        case 'Name Of Customer':
          return '';
        case 'Persona':
          return 'red_text';
        default:
          return '';
      }
    }
  
    // Get column value for a customer based on column name
    getColumnValue(customer: any, columnName: string): any {
      switch (columnName) {
        case 'Customer ID':
          return customer?.customerId || '-';
        case 'Name Of Customer':
          return customer?.name || '-';
        case 'Customer type':
          return customer?.customerTypeStr || '-';
        case 'PAN':
          return !this.isActionAvail(this.constants.PageActions.MASK_PAN)? (customer.panNo? this.commonService.formatPan(customer.panNo) : "NA") : customer.panNo;
        default:
          return Object.keys(CUSTOMIZE_COLUMN).includes(columnName) ? customer[CUSTOMIZE_COLUMN[columnName]]==0 ? '0': (customer[CUSTOMIZE_COLUMN[columnName]] || '-') : '-';
      }
    }
    saveFilterPopup(): void {
      const dialogRef = this.dialog.open(SaveFilterPopupComponent, {
        panelClass: ['popupMain_design'],
        data: {
          filterListMaster: this.filterStates[this.selectedTabIndex] || [],
          customerTypeId:this.customerType,
          userId : this.userId,
          isAnyFilterApplied:this.appliedFilterDataList.length > 0
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.action === 'apply' && result.filterConfig) {
          this.filterStates[this.selectedTabIndex] = result.filterConfig;
          const finalFilterJson = this.applyFilter(null);
          this.filterDataList(this.filterStates[this.selectedTabIndex], finalFilterJson);
          this.saveAppliedFilter(this.selectedTabIndex);
          this.getCustomerList();
        } else if(result && result.action === 'update' && result.filterConfig) {
          this.filterStates[this.selectedTabIndex] = result.filterConfig;
          this.openAdvancedFilter(true,result.filter);
        }
      });
    }
}

type FilterState = {
  [tabIndex: number]: any[]; // Replace `any` with a proper filter model if you have one
};

