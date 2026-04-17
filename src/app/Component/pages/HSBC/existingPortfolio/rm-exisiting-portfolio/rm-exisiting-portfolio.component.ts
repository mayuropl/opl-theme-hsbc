import { DatePipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuditAPIType, Constants, CUSTOMIZE_COLUMN } from 'src/app/CommoUtils/constants';
import { DropdownOption } from 'src/app/CommoUtils/model/drop-down-option';
import { TopBarFilter } from 'src/app/CommoUtils/model/top-bar-filter';
import { TopBarFilterMain } from 'src/app/CommoUtils/model/top-bar-filter-main';
import { ExportExcelPopupComponent } from 'src/app/Popup/HSBC/export-excel-popup/export-excel-popup.component';

import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import * as _ from 'lodash';
import { AesGcmEncryptionService } from 'src/app/CommoUtils/common-services/aes-gcm-encryption.service';
import { GlobalHeaders, resetGlobalHeaders, saveActivity } from '../../../../../CommoUtils/global-headers';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { MatAccordion } from '@angular/material/expansion';
import { Company } from '../../targets-prospects/targets-prospects-find/targets-prospects-find.component';
import { InactiveCsemCompanyPopupComponent } from 'src/app/Popup/HSBC/inactive-csem-company-popup/inactive-csem-company-popup.component';
import { CreateCampaignPopupComponent } from 'src/app/Popup/create-campaign-popup/create-campaign-popup.component';
import { FilterMasterService } from 'src/app/services/filter-master.service';
import { FilterSidebarNewComponent } from 'src/app/Popup/filter-sidebar-new/filter-sidebar-new.component';
import { CustomizeColumnsPopupComponent } from 'src/app/Popup/customize-columns-popup/customize-columns-popup.component';
import { TeamStructurePopupComponent, TeamStructureDialogData } from 'src/app/Popup/team-structure-popup/team-structure-popup.component';
import { HierarchyFilterState } from 'src/app/CommoUtils/model/hierarchy-node';
import { HierarchyService } from 'src/app/services/hierarchy.service';
import { SaveFilterPopupComponent } from 'src/app/Popup/save-filter-popup/save-filter-popup.component';
import { FilterListItem } from 'src/app/models/user-filter.model';


@Component({
  selector: 'app-rm-exisiting-portfolio',
  templateUrl: './rm-exisiting-portfolio.component.html',
  styleUrl: './rm-exisiting-portfolio.component.scss'
})
export class RmExisitingPortfolioComponent implements OnInit {
  hidden: boolean = true;
  isslideToogle: boolean = false;
  // Track the current sorted field and direction
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;

  data: any = { batchId: null, businessTypeId: 1 }
  filteredDate: any;
  selectedDate: any;
  searchForm: FormGroup;
  topbar: TopBarFilter;
  // tab: number =1;
  customerList: CustomerList[] = [];
  filterListMaster: any[] = [];
  subscriptions: Subscription[] = [];
  totalCount;
  userId: any;
  isCSEM: boolean = false;
  isInActive: boolean = false;
  panVerified: boolean = false;
  toggleHide: boolean = false;
  toggleHidePreApp: boolean = false;
  private destroy$ = new Subject<void>();

  selectedCheckboxesForApply: any[] = [];
  accordion = viewChild.required(MatAccordion);
  isCustomerTypeInActive: Boolean = false;
  isCustomerTypeActive: boolean = true; // For the toggle (opposite of isCustomerTypeInActive)
  // searchByAnchorPagntn: PaginationSignal = new PaginationSignal();
  requestSelectFields = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm",
    "parentCompanyName","customerSegmentId","crr","preApproved","share","hsbcwallet","totalOpportunity"];
  ignoreKeys = ["paginationFROM", "paginationTO", "role", "sortDirection", "type", "subPersona", "opportunity", "personaUpper",
    "mainPersona", "preApproved", "sortField", "code", "name", "hsbcwallet", "share", "cities", "segments", "rmUsers"];

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

  totalOpportunities: DropdownOption[];
  preApprovedDatas: DropdownOption[];
  personaGroups: DropdownOption[];
  personaAllOptions: DropdownOption[];
  personaMap = {};
  opportuniySortMap = {};

  showGroup: boolean = false;
  pageData: any;
  constants: any;
  filterJson = null;

  topBarFilters: TopBarFilter[] = [];
  rmUserFilter: TopBarFilter = { searchValue: '', optionFilter: [], selectedFilter: [] };

  selectedRmUsers: string[] = [];
  isShowfilter = false;

  // Search By Menu State
  searchByOptionsTopBar: any[] = [];
  activeFilterMenu: string | null = null;
  selectedFilterOption: any = null;
  selectedFilterType: 'topbar' | 'rm' | null = null;
  selectedFilterIndex: number | null = null;
  searchByDataHistory: { [key: number]: {
    'searchValue': string,
    'isCalled': boolean,
    'dataset_name': string,
    'data': any[],
    'page_size': number,
    'page_offset': number
  }} = {};
  dependantFilters: any[] = [];
  isLoadingSearchBy: boolean = false;
  searchSubject = new Subject<{ searchText: string, datasetId: number, datasetName: string }>();
  selectedItemsMap: { [key: string]: any[] } = {};
  searchByOptPageSize = 50;
  page_offset_search = 0;

    // Parent Company infinite scroll state
  parentCompanyPage = 0;
  parentCompanyHasMore = true;
  parentCompanyLoading = false;
  parentCompanyTotalElements = 0;
  parentCompanySelectAllActive: { [filterName: string]: boolean } = {}; // Track if "Select All" is active

  //  Start Copmany Search  Feature ----------------->
  pan: string;
  empCode: any;
  userRoleId: any;
  roleTypeId: any = null;
  entityType: string = 'MCA';
  companySearch: string = null;
  selectSearchType: string = 'COMPANY';
  isSearchCompany: boolean = false;
  searchCompanyFound: boolean = false;
  selectedCustomers: Set<number> = new Set();
  isAssignedAllCustomer = false;
  appliedFilterDataList: any[] = [];
  // filteredKeyValueList: any[] = [];
  isManualAllPagesSelected = false;

  debounceEventForFilter = _.debounce((event) => this.getSaveRiskSearchDetails(event), 600, {});
  companyNameList: Company[];
  private panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  private mcaPanRegex = /^.{3}[CF].*/;
  private nonMcaPanRegex = /^.{3}[^C].*/;

  //  Ending Copmany Search  Feature

  // Team Structure Hierarchy Filter State
  hierarchyFilterState: HierarchyFilterState = null;

  filterShowhide() {
    this.isShowfilter = !this.isShowfilter;
  }

  // isLoading is used to disable the buttons after applying the filter.
  isLoading = false;
  // Define a Subject to stream the loading state
  private isLoadingSubject = new BehaviorSubject<boolean>(false);



  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router, private http: HttpClient,
    public commonMethod: CommonMethods, private loaderService: LoaderService, private formBuilder: UntypedFormBuilder,
    private datepipe: DatePipe, private fb: FormBuilder, private existingProspectsDropDownService: ExistingProspectsDropDownService,
    private excelDownload: ExcelDownloadService, private filterMasterService: FilterMasterService, private route: ActivatedRoute,
    private hierarchyService: HierarchyService,private decimalPipe: DecimalPipe
  ) {

    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.empCode = Number(this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true));
    this.userRoleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.roleTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true));
    }
  selectedCustomerDetails: Map<number, { customerName: string, customerId: string, pan: string, rmId: string, customerType: number, }> = new Map();
  isNewFilter = true;
  protected readonly consValue = Constants;
  ngOnInit(): void {
    // Hide main loader immediately - we'll use subloader for table data
    this.loaderService.hide();
    if (this.route.snapshot.data['isNewFilter'] != null && this.route.snapshot.data['isNewFilter'] != undefined) {
      this.isNewFilter = this.route.snapshot.data['isNewFilter'];
    }
    

    // Restore hierarchy filter state from service (preserves across navigation)
    this.restoreHierarchyFilterState();

    this.constants = Constants;
    this.pageData = history.state.data;
    if (!this.pageData || this.pageData === 'undefined') {
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.EXISTING_PORTFOLIO)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmExisitingPortfolio';

    if (this.commonService.isObjectNullOrEmpty(this.pageData)) {
      this.pageData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true))[0];
    }

    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.initForm();
    this.initTableColumnOptions();
    // Initialize customize columns
    this.initializeColumnArrays();
    this.filterJson = JSON.parse(JSON.parse(this.commonService.getStorageAesEncryption(this.constants.FILTER_JSON_EXISTING)));
    if (this.filterJson) {
      this.applySavedFilter(this.filterJson);
      if (this.filterJson?.cities != null) {
        console.log(this.filterJson?.cities);
        this.filterJson?.cities.forEach(element => {
          this.selectedCheckboxesForApply.push(element);
        });
        if (this.selectedCheckboxesForApply.length > 0) {
          this.getFilterWiseRMByCity();
        }
      }
    }

    this.rmUserFilter.searchValue = '';  // reset rm for search values
    this.topBarFilters.forEach(filter => filter.searchValue = '');  // reset segement or city for search value
    // this method call for when if no city selected then call..
    // if(this.selectedCheckboxesForApply.length == 0){
    //   this.getTopBarFilter();
    // }

    this.initializeFilters();

    // Search By Subject subscription
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.searchText === curr.searchText)
    ).subscribe(({ searchText, datasetId, datasetName }) => {
           // Check if this is Parent Company filter
      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
      if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
        // Call API for Parent Company search - minimum 3 characters required
        if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        this.handleParentCompanySearch(searchText, datasetId);
        }
      } else if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        this.page_offset_search = 0;
        this.callDashboardApi(datasetId, datasetName, false);
      }
    });

  }

  private initTableColumnOptions(): void {
    this.totalOpportunities = this.existingProspectsDropDownService.getTotalOpportunityDropdownOptionsEtb();
    this.preApprovedDatas = this.existingProspectsDropDownService.getPreApprovedDropdownOptions();
    this.personaAllOptions = this.existingProspectsDropDownService.getPersonaAllOptions();
    this.opportuniySortMap = this.existingProspectsDropDownService.getOpportunitySortMap();
    this.personaMap = this.existingProspectsDropDownService.getPersonaMap();
  }
  private initializeFilters(): void {

    let needsTopBarFilter = true;
    let needsFilterMaster = true;
    let topBarMasterJson = this.commonService.getStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_EXISTING);
    if (topBarMasterJson && topBarMasterJson !== undefined && topBarMasterJson !== "undefined") {
      const filterListMasterTemp1 = JSON.parse(JSON.parse(topBarMasterJson));
      if (filterListMasterTemp1) {
        this.topBarFilters = filterListMasterTemp1.topBarFilters;
        this.rmUserFilter = filterListMasterTemp1.rmUserFilter;
        needsTopBarFilter = false;
        // Setup search menu when loading from storage
        if (this.topBarFilters && this.topBarFilters.length > 0) {
          this.setupSearchByMenu();
          // Sync topBarFilters.selectedFilter into selectedItemsMap so City/Segment checkboxes show correct state when user returns to page
          this.syncSelectedItemsMapFromTopBarFilters();
        }
      }
    }

    let masterJson = this.commonService.getStorageAesEncryption(this.constants.FILTER_LIST_MASTER_EXISTING);
    if (masterJson && masterJson !== undefined && masterJson !== "undefined") {
      const cleanedJson = masterJson.replace(/[\x00-\x1F\x7F]/g, '');
      const filterListMasterTemp = JSON.parse(JSON.parse(cleanedJson));
      if (filterListMasterTemp) {
        this.filterListMaster = filterListMasterTemp;
        needsFilterMaster = false;
      }
    }

    console.log("etb index::::> ", this.constants.CustomerType.ETB - 1);
    console.log('customerInActiveForCurrPage in ETB:::> ', this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ETB - 1])
    this.isCustomerTypeInActive = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.ETB - 1];

    // Initialize toggle state (opposite of isCustomerTypeInActive)
    this.isCustomerTypeActive = !this.isCustomerTypeInActive;

    // Call customer list immediately - no dependency on filter masters
    this.getCustomerList();
    // Load filter masters in parallel (with ignoreLoader to prevent main loader)
    if (needsTopBarFilter) {
      this.getTopBarFilter(true);
    }
    if (needsFilterMaster) {
      this.getInsightFilterMaster(true);
    }
  }

  initForm(value?: any) {
    this.searchForm = this.fb.group({
      applicationCode: [''],
      name: [''],
      hsbcwallet: this.fb.group({
        min: [''],
        max: ['']
      }),
      share: this.fb.group({
        min: [''],
        max: ['']
      }),
      opportunity: 'CUACY',
      personaUpper: "ALL",
      preApproved: "ALL"
    });

    const hsbcwalletGroup = this.searchForm.get('hsbcwallet') as FormGroup;
    this.syncMinMaxControls(hsbcwalletGroup, 'min', 'max');

    const shareGroup = this.searchForm.get('share') as FormGroup;
    this.syncMinMaxControls(shareGroup, 'min', 'max');

    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.searchForm.valueChanges.pipe(
      debounceTime(700),// Wait for 700ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(currentFormValue => {
      const currentName = currentFormValue.name;
      const isNameChanged = (currentName !== previousNameValue);
      previousNameValue = currentName;

      const hsbcMin = currentFormValue.hsbcwallet.min;
      const hsbcMax = currentFormValue.hsbcwallet.max;
      const shareMin = currentFormValue.share.min;
      const shareMax = currentFormValue.share.max;

      const invalidNumberInput = !this.isNumericOrEmpty(hsbcMin) ||
        !this.isNumericOrEmpty(hsbcMax) ||
        !this.isNumericOrEmpty(shareMin) ||
        !this.isNumericOrEmpty(shareMax);

      if (invalidNumberInput) {
        return;
      }

      if (isNameChanged) {
        if (!this.commonService.isObjectNullOrEmpty(currentName) && currentName.length <= 3) {
          return;
        }
        else {
          // Clear selected customers when search is performed
          // this.selectedCustomers.clear();
          // this.selectedCustomerDetails.clear();
          // this.isAssignedAllCustomer = false;
          this.getCustomerList();
        }
      }
      else {
        // Clear selected customers when other form fields change
        // this.selectedCustomers.clear();
        // this.selectedCustomerDetails.clear();
        // this.isAssignedAllCustomer = false;
        this.getCustomerList(this.isSearchCompany ? 'prospectSearch' : null);
      }
    });

    if (!this.commonService.isObjectNullOrEmpty(value)) {
      this.getCustomerList();
    }
  }


  isNumericOrEmpty(value: any): boolean {
    return value === '' || !isNaN(Number(value));
  }

  onNumberInput(groupName: string, controlName: string) {
    const group = this.searchForm.get(groupName) as FormGroup;
    const value = group.get(controlName)?.value || '';
    let cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');

    if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }

    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    group.get(controlName)?.setValue(cleaned, { emitEvent: false });
  }


  syncMinMaxControls(group: FormGroup, minKey: string, maxKey: string) {
    const minControl = group.get(minKey);
    const maxControl = group.get(maxKey);

    if (!minControl || !maxControl) return;

    minControl.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.destroy$)
    ).subscribe(minVal => {
      const minNum = parseFloat(minVal);
      const maxNum = parseFloat(maxControl.value);

      if (!isNaN(minNum) && !isNaN(maxNum) && maxNum < minNum) {
        minControl.setValue(maxNum);
      }
    });

    maxControl.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.destroy$)
    ).subscribe(maxVal => {
      const maxNum = parseFloat(maxVal);
      const minNum = parseFloat(minControl.value);

      if (!isNaN(maxNum)) {
        if (!isNaN(minNum) && maxNum < minNum) {
          minControl.setValue(maxNum);
        }
      }

    });
  }


  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getCustomerList();
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getCustomerList();
  }

  // Method to get value of a specific control
  getControlValue(controlName: string, subControlName?: string) {
    const control = this.searchForm.get(controlName);
    if (subControlName) {
      return control?.get(subControlName)?.value;
    }
    return control?.value;
  }

  isHsbcWalletAndShareShow(): boolean {
    const value = this.searchForm.get('opportunity')?.value;
    return ['CUACY', 'CUAPY'].includes(value);
  }

  getCustomerList(searchType?: string, skipGlobalLoader?: boolean): void {
    this.totalSize = 0;
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    let request: any = {};
    request["type"] = 'ETB';
    var json = this.applyFilter(searchType);
    this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_EXISTING, JSON.stringify(json));
    this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_EXISTING, JSON.stringify(this.selectedColumns));
    request.filterJson = JSON.stringify(json);
    request.isNewFilter = this.isNewFilter;
    request.requestedFields = this.requestSelectFields;
    console.log("getCustomerList request::::::::::::::::::::>", request)
    this.saveAppliedFilter();
    // Always show table subloader (app-sub-loader listens to LoaderService)
    this.loaderService.subLoaderShow();
    this.msmeService.getCustomer(request, true).subscribe((response: any) => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      this.isLoadingSubject.next(false);
      console.log(response);
      if (response.status == 200) {
        if(this.isNewFilter) {
          let parseResponse = JSON.parse(response?.data);
          this.customerList = parseResponse.data
          this.totalSize = parseResponse.counts;
        } else {
          let parseResponse = JSON.parse(response?.data?.result);
          this.customerList = JSON.parse(parseResponse.data);
          this.totalSize = parseResponse.counts;
        }

        if (!this.commonService.isObjectNullOrEmpty(this.customerList)) {
          this.customerList.forEach(element => {
            element.customerTypeId = element.customerType;
            element.customerType = Constants.CustomerTypeById[element.customerType];
          });
        }
        this.updateTransformedCustomer()
        console.log(response);
      } else {
        this.commonService.errorSnackBar(response.message)
        console.log(response.message);
      }
    }, error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      this.isLoadingSubject.next(false);
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    })

  }

  getFilteredFormValue() {
    const formValue = this.searchForm.value;

    const filteredFormValue: any = {};

    Object.keys(formValue).forEach(key => {
      const value = formValue[key];
      if (value !== '' && value !== undefined) {
        filteredFormValue[key] = value;
      }
    });

    filteredFormValue.paginationFROM = this.page - 1
    filteredFormValue.paginationTO = this.pageSize
    return filteredFormValue;
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  viewAuditPage(customer: any, type: any) {
    this.commonService.setStorage('auditType', type);
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXISTING_TARGET");
    const routerData = { pan: customer.panNo, tabId: 1, apiType: AuditAPIType.API_AUDIT }; // Data to pass

    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
  }

  saveAppliedFilter() {
    this.saveFilterListMaster();
    if (this.topBarFilters && this.topBarFilters.length > 0) {
      let topBarFiler = {};
      topBarFiler["topBarFilters"] = this.topBarFilters;
      topBarFiler["rmUserFilter"] = this.rmUserFilter;
      this.commonService.setStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_EXISTING, JSON.stringify(topBarFiler));
    }

  }

  saveFilterListMaster() {
    // Only save if filterListMaster has data
    if (this.filterListMaster && this.filterListMaster.length > 0) {
      this.commonService.setStorageAesEncryption(this.constants.FILTER_LIST_MASTER_EXISTING, JSON.stringify(this.filterListMaster));
    }
  }

  navigateToView(customer: any, event?: MouseEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!customer?.panNo) {
      this.commonService.warningSnackBar('Customer PAN is not available.');
      return;
    }
    const panData: any = customer.panNo.toString();
    GlobalHeaders['x-page-data'] = panData;
    GlobalHeaders['x-page-action'] = 'View Exisiting Portfolio';
    const customerTypeNumeric = customer.customerTypeId ?? this.consValue.CustomerType.ETB;
    const routerData = {
      pan: customer.panNo,
      tabId: 1,
      cin: customer.cin,
      customerType: customerTypeNumeric,
      customerTypeStr: typeof customer.customerType === 'string' ? customer.customerType : (Constants.CustomerTypeById[customerTypeNumeric] ?? 'ETB'),
    };
    this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActive;
    saveActivity(() => { });
    if (customer.customerId) {
      this.commonService.setStorage('cutomerId', customer.customerId);
    }
    this.router.navigate(['/hsbc/rmExisitingPortfolioView'], { state: { routerData, data: this.pageData, dataFrom: this.pageData, isFromParentPage: true } });
  }

  // Function to toggle sorting based on the column clicked
  toggleSort(column: string, direction: string, dontCallApi?: boolean) {
    // if (this.currentSortField === column) {
    //   // Toggle the sort direction if the same column is clicked again
    //   this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   // Set the new column and reset to ascending sort for the new column
    //   this.currentSortField = column;
    //   this.sortDirection = 'ASC'; // You can default to 'asc' for new columns
    // }
    if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    if (dontCallApi) {
      return;
    }
    this.getCustomerList();
    // Call the sorting function with the new criteria
    // this.sortData();
  }

  removeValueFromControl(value?: any) {
    this.currentSortField = null;
    this.searchForm.reset({
      applicationCode: '',
      name: '',
      hsbcwallet: '',
      share: '',
      opportunity: '',
      personaUpper: '',
      preApproved: ''
    });
    this.commonService.removeStorage(this.constants.FILTER_JSON_EXISTING);
    this.commonService.removeStorage(this.constants.SELECTED_COLUMNS_EXISTING);
    this.initForm();
    this.initTableColumnOptions();
    this.searchForm.valueChanges.pipe(
      debounceTime(300),// Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      takeUntil(this.destroy$),
    ).subscribe(value => {
      this.getCustomerList();
      // console.log(this.searchForm);
    })
    // )
    if (!this.commonService.isObjectNullOrEmpty(value)) {
      this.getCustomerList();
    }
    this.toggleHide = true;
    this.toggleHidePreApp = true;
  }

  getInsightFilterMaster(ignoreLoader?: boolean) {
    this.filterMasterService.getInsightFilterMaster(ignoreLoader).subscribe({
      next: (filterListMaster) => {
        // 1. Assign received data to component property
        this.filterListMaster = filterListMaster;

        // 2. AFTER getting response, save to encrypted storage
        this.saveFilterListMaster();
        console.log(this.filterListMaster);
      },
      error: (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Filter master error:', error);
      }
    });
  }

  isActionAvail(actionId: string): boolean {
    if (this.pageData) {
      for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
          return true; // Return true if found
        }
      }
    }
    return false; // Return false if not found
  }

  applySavedFilter(filterJson) {
    // Use emitEvent: false to prevent triggering valueChanges subscription
    if (filterJson.personaUpper) {
      this.searchForm.controls.personaUpper.patchValue(filterJson.personaUpper, { emitEvent: false });
    }
    this.searchForm.controls.preApproved.patchValue(filterJson.preApproved, { emitEvent: false });
    this.searchForm.controls.opportunity.patchValue(filterJson.opportunity, { emitEvent: false });
    this.pageSize = filterJson.paginationTO;
    this.page = (filterJson.paginationFROM / this.pageSize) + 1;
    this.currentSortField = filterJson["sortField"];
    this.sortDirection = filterJson["sortDirection"];

    if (filterJson?.isSearchCompany) {
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
      }
    }
    else {
      this.searchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
      this.searchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });
    }

    // top bar filter

    if (filterJson.rmUsers && filterJson.rmUsers.length > 0) {
      this.selectedRmUsers = filterJson.rmUsers;
    }
  }

  removeFilter() {

    this.loaderService.subLoaderShow(); // Show loader immediately
    setTimeout(() => {
      this.resetFilters();
      this.reloadData();
      this.getTopBarFilter(true);
    }, 0); // push everything to next JS event loop tick

  }

  removeTopBarFilter() {
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    this.loaderService.subLoaderShow(); // Only table subloader, no main loader
    this.rmUserFilter.searchValue = '';  // reset rm for search values
    this.rmUserFilter.selectedFilter = [];
    this.topBarFilters.forEach(filter => filter.searchValue = '');  // reset segement or city for search value

    this.commonService.removeStorage(this.constants.TOP_BAR_FILTER_LIST_EXISTING);
    this.selectedRmUsers.length = 0;
    this.selectedItemsMap = {};  // clear in-menu selections (city, segment) so checkboxes show unchecked
    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        f1.selectedFilter.length = 0
      }
    });
    this.getTopBarFilter(true); // true = ignoreLoader, avoid main loader
    this.getCustomerList();

    this.selectedCheckboxesForApply = [];
    // Reset search-by menu search inputs
    if (this.searchByDataHistory && typeof this.searchByDataHistory === 'object') {
      Object.keys(this.searchByDataHistory).forEach(key => {
        this.searchByDataHistory[key].searchValue = '';
        this.searchByDataHistory[key].isCalled = false;
      });
    }
  }

  applyFilter(searchType: string) {
    let finalFilterJson = {};
    let role = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));

    if (this.isCustomerTypeInActive) {
      finalFilterJson["CustomerType"] = [Constants.INACTIVE_CUSTOMER];
    }
    if (role) {
      finalFilterJson["role"] = role;
    }
    let role_type = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true));
    if (role_type) {
      finalFilterJson["role_type"] = role_type;
    }
    // if (this.selectedRmUsers && this.selectedRmUsers.length > 0) {
    //   finalFilterJson["rmUsers"] = this.selectedRmUsers;
    // }

    // Add hierarchy filter - selected employee codes from Team Structure popup
    if (this.hierarchyFilterState && this.hierarchyFilterState.isApplied &&
        this.hierarchyFilterState.selectedEmployeeCodes && this.hierarchyFilterState.selectedEmployeeCodes.length > 0) {
      finalFilterJson["rmUsers"] = this.hierarchyFilterState.selectedEmployeeCodes;
    }

    // Add RM role type ID from hierarchy filter if available
    if (this.hierarchyFilterState && this.hierarchyFilterState.isApplied &&
        this.hierarchyFilterState.rmRoleId && this.hierarchyFilterState.rmRoleId > 0) {
      finalFilterJson["rmRoleTypeId"] = this.hierarchyFilterState.rmRoleId;
    }

    if (this.getControlValue("opportunity") != null && this.getControlValue("opportunity") != undefined && this.getControlValue("opportunity") != "") {
      this.toggleHide = false;
      finalFilterJson["opportunity"] = this.getControlValue("opportunity");
    }
    const hsbcwalletValue = this.getControlValue("hsbcwallet");
    if (hsbcwalletValue && ((hsbcwalletValue.min !== "" && hsbcwalletValue.min !== null && hsbcwalletValue.min !== undefined) ||
      (hsbcwalletValue.max !== "" && hsbcwalletValue.max !== null && hsbcwalletValue.max !== undefined))) {
      finalFilterJson["hsbcwallet"] = hsbcwalletValue;
    }

    const shareValue = this.getControlValue("share");
    if (shareValue && ((shareValue.min !== "" && shareValue.min !== null && shareValue.min !== undefined) ||
      (shareValue.max !== "" && shareValue.max !== null && shareValue.max !== undefined))) {
      finalFilterJson["share"] = shareValue;
    }

    if (this.getControlValue("personaUpper")) {
      finalFilterJson["mainPersona"] = this.personaMap[this.getControlValue("personaUpper")].group,
        finalFilterJson["subPersona"] = this.personaMap[this.getControlValue("personaUpper")].option
    }

    finalFilterJson["personaUpper"] = this.getControlValue("personaUpper");
    const formValues = this.searchForm.value;

    if (formValues.applicationCode) {
      finalFilterJson['code'] = formValues.applicationCode;
    }

    // Changes for the Search Customer By Prospect
    if (!this.commonService.isObjectNullOrEmpty(this.companySearch) && searchType == 'prospectSearch') {
      this.isSearchCompany = true;
      this.onProspectSearch(finalFilterJson);
    }
    else {
      this.isSearchCompany = false;
      if (formValues.name) {
        finalFilterJson['name'] = formValues.name;
        finalFilterJson['isSearchCompany'] = false;
      }
    }
    // // Changes for the Search Customer By Prospect

    if (formValues.preApproved != null && formValues.preApproved != undefined && formValues.preApproved != "") {
      this.toggleHidePreApp = false;
      finalFilterJson['preApproved'] = formValues.preApproved;
    }
    finalFilterJson["type"] = this.constants.CustomerType.ETB;
    finalFilterJson["paginationTO"] = this.pageSize;
    finalFilterJson["paginationFROM"] = (this.page - 1) * this.pageSize;
    if (this.currentSortField) {
      finalFilterJson["sortField"] = this.currentSortField;
    }
    if (this.sortDirection) {
      finalFilterJson["sortDirection"] = this.sortDirection;
    }
    this.filterListMaster.forEach(f1 => {
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
        finalFilterJson[f1?.spKeyName] = f1?.selectedFilter;
      }
    });
    console.log(finalFilterJson);
    this.filterDataList(this.filterListMaster, finalFilterJson);
    // this.createFilteredList(finalFilterJson);
    return finalFilterJson;
  }

  onExportExcelPopup(): void {
    GlobalHeaders['x-page-action'] = 'Export Data';
    saveActivity(() => { });
    let request: any = {};
    request["type"] = 'ETB';
    var filterjson = this.applyFilter(null); // ---------------------> Changes for Prospect
    filterjson["paginationFROM"] = 0
    filterjson["paginationTO"] = this.totalSize
    // delete filterjson["persona"];
    request.filterJson = JSON.stringify(filterjson);
    request.requestedFields = this.requestSelectFields;
    request.isNewFilter = this.isNewFilter;
    // if(this.commonService.isObjectNullOrEmpty(request.filterJson)){
    // }
    // this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_EXISTING,JSON.stringify(filterjson));
    this.dialog.open(ExportExcelPopupComponent, { panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true });
  }

  getTopBarFilter(ignoreLoader?: boolean) {
    this.msmeService.getTopBarFilter("ETB", ignoreLoader).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {
        this.rmUserFilter.optionFilter = response?.data?.rmUsers;
        this.rmUserFilter.checkboxListTemp = undefined; // so RM search uses current list
        for (let index = 0; index < response?.data?.filters.length; index++) {

          this.topBarFilters[index] = {
            name: response?.data?.filters[index].name,
            spKeyName: response?.data?.filters[index].spKeyName,
            searchValue: '',
            optionFilter: response?.data?.filters[index].options || [],
            selectedFilter: [],
            isApiCallSearch: response?.data?.filters[index].isApiCallSearch || false
          };

        }
        if (this.topBarFilters && this.pageData) {
          // Build set of allowed filter names from actions first
          const allowedFilterNames = new Set<string>();
          for (const action of this.pageData.actions) {
            if (typeof action.actionName === 'string') {
              const act = action.actionName.split('_');
                if (act.length > 1) {
                allowedFilterNames.add(act[act.length - 1].toUpperCase());
                  }
                }
              }
          // Now filter topBarFilters - this preserves API order
          let topbarFilter = [];
          for (const filter of this.topBarFilters) {
            if (allowedFilterNames.has(filter.name.toUpperCase())) {
              topbarFilter.push(filter);
            }
          }
          this.topBarFilters = topbarFilter;
        }

        // Setup Search By Menu Options
        this.setupSearchByMenu();
      } else {
        this.commonService.errorSnackBar(response.message)
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
    })
  }

  // Setup Search By Menu from topBarFilters
  setupSearchByMenu() {
    // Ensure topBarFilters is filtered by permissions before setting up menu
    if (this.topBarFilters && this.pageData && this.topBarFilters.length > 0) {
      // Build set of allowed filter names from actions first
      const allowedFilterNames = new Set<string>();
      for (const action of this.pageData.actions) {
          if (typeof action.actionName === 'string') {
          const act = action.actionName.split('_');
            if (act.length > 1) {
            allowedFilterNames.add(act[act.length - 1].toUpperCase());
              }
            }
          }
      // Now filter topBarFilters - this preserves API order
      let topbarFilter = [];
      for (const filter of this.topBarFilters) {
        if (allowedFilterNames.has(filter.name.toUpperCase())) {
          topbarFilter.push(filter);
        }
      }
      // Only update if we have matching filters
      if (topbarFilter.length > 0) {
        this.topBarFilters = topbarFilter;
      }
    }

    this.searchByOptionsTopBar = (this.topBarFilters || []).map((filter, index) => ({
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
  }

  /**
   * Sync topBarFilters.selectedFilter into selectedItemsMap and selectedCheckboxesForApply.
   * Call when restoring from storage so City/Segment checkboxes show correct state when user returns to page.
   */
  syncSelectedItemsMapFromTopBarFilters(): void {
    if (!this.topBarFilters || this.topBarFilters.length === 0) return;
    this.selectedItemsMap = {};
    this.topBarFilters.forEach(filter => {
      const filterName = filter.spKeyName || filter.name?.toLowerCase();
      if (filterName && filter.selectedFilter && filter.selectedFilter.length > 0) {
        this.selectedItemsMap[filterName] = [...filter.selectedFilter];
      }
    });
    const cityFilter = this.topBarFilters.find(f => f.name === 'City');
    if (cityFilter && cityFilter.selectedFilter && cityFilter.selectedFilter.length > 0) {
      this.selectedCheckboxesForApply = [...cityFilter.selectedFilter];
    } else {
      this.selectedCheckboxesForApply = [];
    }
  }

  onCheckboxChangeTopBar(event: any, segment: string, topBarFilters: TopBarFilter) {
    if (segment === "All" && topBarFilters.name === 'City') {
      if (event.checked) {
        if (topBarFilters?.optionFilter && topBarFilters.optionFilter.length > 0) {
          topBarFilters.optionFilter.forEach((element, i) => {
            this.selectedCheckboxesForApply.push(element.value);
          });
        }
        // remove first element
        this.selectedCheckboxesForApply.shift();
      } else {
        this.selectedCheckboxesForApply = [];
      }
    } else {
      if (event.checked && topBarFilters.name === 'City') {
        this.selectedCheckboxesForApply.push(segment);
      } else {
        const index = this.selectedCheckboxesForApply.indexOf(segment);
        if (index >= 0) {
          this.selectedCheckboxesForApply.splice(index, 1);
        }
      }
    }
    this.existingProspectsDropDownService.onCheckboxChangeTopBar(event, segment, topBarFilters);
  }
  applyFilterForCity(filterName: any) {
    this.getCustomerList();
    if (filterName === 'City') {
      if (this.selectedCheckboxesForApply.length > 0) {
        this.getFilterWiseRMByCity();
      } else {
        // When city unselected, reset RM list to show all RMs
        this.selectedRmUsers = [];
        this.rmUserFilter.selectedFilter = [];
        this.getTopBarFilter(true);
      }
    }
    // Clear selected customers when top bar filters are applied
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
  }

  isAllSelectedRm(): boolean {
    const list = this.rmUserFilter?.optionFilter || [];
    const visibleRms = list.filter((item: any) => item.empCode !== 'All');
    if (visibleRms.length === 0) return false;
    return visibleRms.every((item: any) => this.selectedRmUsers?.includes(item.empCode));
  }

  isIndeterminateRm(): boolean {
    const list = this.rmUserFilter?.optionFilter || [];
    const visibleRms = list.filter((item: any) => item.empCode !== 'All');
    if (visibleRms.length === 0) return false;
    const selectedCount = visibleRms.filter((item: any) => this.selectedRmUsers?.includes(item.empCode)).length;
    return selectedCount > 0 && selectedCount < visibleRms.length;
  }

  onCheckboxChangeRmUsers(event: any, rmEmpCode: string, rmUserFilter: TopBarFilter) {
    // Handle "All" in component so we use visible list and new array for change detection
    if (rmEmpCode === 'All') {
      const list = rmUserFilter?.optionFilter || [];
      const visibleRms = list.filter((item: any) => item && item.empCode !== 'All');
      if (event.checked) {
        this.selectedRmUsers = visibleRms.map((item: any) => item.empCode);
        rmUserFilter.selectedFilter = [...this.selectedRmUsers];
      } else {
        this.selectedRmUsers = [];
        rmUserFilter.selectedFilter = [];
      }
    } else {
      this.existingProspectsDropDownService.onCheckboxChangeRmUsers(event, rmEmpCode, rmUserFilter, this.selectedRmUsers);
    }
    // Clear selected customers when RM filter changes
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
    // if (event.checked) {
    //   if (!this.selectedRmUsers.includes(rmEmpCode)) {
    //     this.selectedRmUsers.push(rmEmpCode);
    //   }

    // } else {
    //   const index = this.selectedRmUsers.indexOf(rmEmpCode);
    //   if (index >= 0) {
    //     this.selectedRmUsers.splice(index, 1);
    //   }
    // }



  }

  filterCheckBoxTopBar(filter2: TopBarFilter, filterType?: string) {
    this.existingProspectsDropDownService.filterCheckBoxTopBar(filter2, filterType);
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
      // Load data from existing topBarFilters
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
            // Check if this is Parent Company (uses API pagination)
      if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
        const cachedData = this.searchByDataHistory[opt.dataset_id]?.data;
        const hasValidCachedData = cachedData && cachedData.length > 0 && cachedData[0]?.key;

        if (hasValidCachedData) {
          this.dependantFilters = cachedData;
          this.parentCompanyPage = Math.ceil(cachedData.length / this.searchByOptPageSize);
        } else {
          this.dependantFilters = matchingFilter.optionFilter
            .filter(item => item.name !== 'All' && item.value !== 'All')
            .map(item => ({
              key: item.name,
              value: item.value
            }));
          this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
          this.parentCompanyPage = 1;
          this.parentCompanyHasMore = true;
        }
        this.parentCompanyTotalElements = this.dependantFilters.length;
      } else if (matchingFilter) {
        const existingSearchValue = this.searchByDataHistory[opt.dataset_id]?.searchValue || '';
        const rawOptions = matchingFilter.optionFilter
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({
            key: item.name,
            value: item.value
          }));

        // If search text exists, filter the options for all filters
        if (existingSearchValue.trim().length > 0) {
          this.dependantFilters = rawOptions.filter(item =>
            item.key && item.key.toLowerCase().includes(existingSearchValue.toLowerCase())
          );
        } else {
          this.dependantFilters = rawOptions;
        }
        this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
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
      'Customer': 'fas fa-layer-group',
      'Company Name': 'fas fa-layer-group',
      'RM': 'fas fa-user',
      'Segment': 'fas fa-cube',
      'Region': 'fas fa-globe-americas',
      'Parent Company': 'fas fa-building',
      'Parent Country': 'fas fa-globe'
    };

    return iconMap[key] || 'fas fa-filter';
  }

  getSelectedCount(filter_name: string): number {
    return this.selectedItemsMap[filter_name]?.length || 0;
  }

  /** True when at least one Search By filter (City, Segment, or RM) has a selection - used to enable Apply/Reset. */
  hasSearchByFilterSelection(): boolean {
    const hasTopBarSelection = (this.searchByOptionsTopBar || []).some(
      opt => (this.selectedItemsMap[opt.filter_name]?.length || 0) > 0
    );
    const hasRmSelection = (this.selectedRmUsers?.length || 0) > 0;
    return hasTopBarSelection || hasRmSelection;
  }

  onSearchChange(searchValue: string, datasetId: number, datasetName: string) {
    this.searchByDataHistory[datasetId].searchValue = searchValue;
    this.searchByDataHistory[datasetId].isCalled = false;

    // Filter the dependant filters based on search
    const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
    if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
      // Use debounced API call for Parent Company search
      this.searchSubject.next({ searchText: searchValue, datasetId, datasetName });
    } else if (matchingFilter) {
      const rawOptions = (matchingFilter.optionFilter || []).filter(
        item => item && (item.name !== 'All' && item.value !== 'All')
      );
      const allOptions = rawOptions
        .map(item => ({
          key: item.name != null ? String(item.name) : (item.label != null ? String(item.label) : ''),
          value: item.value != null ? item.value : item.id
        }))
        .filter(item => item.key !== '');

      if (searchValue.trim().length > 0) {
        this.dependantFilters = allOptions.filter(item =>
          item.key && item.key.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else {
        this.dependantFilters = allOptions;
        // When search is cleared, reset "Select All" state so checkbox reflects actual selection
        const filterName = this.selectedFilterOption?.filter_name;
        if (filterName && this.parentCompanySelectAllActive[filterName]) {
          this.parentCompanySelectAllActive[filterName] = false;
        }
      }
    } else {
      // Fallback: use cached data when matchingFilter not found (e.g. menu key mismatch)
      const cached = this.searchByDataHistory[datasetId]?.data;
      if (cached && Array.isArray(cached) && cached.length > 0) {
        if (searchValue.trim().length > 0) {
          this.dependantFilters = cached.filter((item: any) =>
            item && item.key && String(item.key).toLowerCase().includes(searchValue.toLowerCase())
          );
        } else {
          this.dependantFilters = [...cached];
          // When search is cleared, reset "Select All" state
          const filterName = this.selectedFilterOption?.filter_name;
          if (filterName && this.parentCompanySelectAllActive[filterName]) {
            this.parentCompanySelectAllActive[filterName] = false;
          }
        }
      }
    }
  }

  callDashboardApi(dataSetid: number, dataSetName: any, append: boolean = false, filterName: string = null) {
    // For this component, we use local filtering from topBarFilters
    // No API call needed as data is already loaded
    const matchingFilter = this.topBarFilters.find(f => f.spKeyName === dataSetName || f.name.toLowerCase() === dataSetName);
    if (matchingFilter) {
      const searchValue = this.searchByDataHistory[dataSetid]?.searchValue || '';
      const rawOptions = (matchingFilter.optionFilter || []).filter(item => item && (item.name !== 'All' && item.value !== 'All'));
      let filteredOptions = rawOptions
        .map(item => ({
          key: item.name != null ? String(item.name) : (item.label != null ? String(item.label) : ''),
          value: item.value != null ? item.value : item.id
        }))
        .filter(item => item.key !== '');

      if (searchValue.trim().length > 0) {
        filteredOptions = filteredOptions.filter(item =>
          item.key && item.key.toLowerCase().includes(searchValue.toLowerCase())
        );
      }

      this.dependantFilters = filteredOptions;
      this.searchByDataHistory[dataSetid].data = filteredOptions;
      this.searchByDataHistory[dataSetid].isCalled = true;
    }
    this.isLoadingSearchBy = false;
  }

  onSelectField(event: any, filterName: string, selectId: any, datasetId: number) {
    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }
    if (event.checked) {
      if (!this.selectedItemsMap[filterName].includes(selectId)) {
        this.selectedItemsMap[filterName].push(selectId);
      }
    } else {
      this.selectedItemsMap[filterName] = this.selectedItemsMap[filterName].filter(id => id !== selectId);
    }
  }

  /** Show "All" checkbox always - even when searching */
  shouldShowAllOptionInFilter(): boolean {
    return true;
  }

  // Check if all items are selected
  isAllSelected(filterName: string): boolean {
    if (!filterName || !this.dependantFilters || this.dependantFilters.length === 0) {
      return false;
    }
    const selectedItems = this.selectedItemsMap[filterName] || [];
    const validSelectedItems = selectedItems.filter(item => item !== 'All' && item !== -1 && item !== null && item !== undefined);
    if (validSelectedItems.length === 0) {
      return false;
    }
    return this.dependantFilters.every(item => validSelectedItems.includes(item.value));
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
    const selectedVisibleCount = this.dependantFilters.filter(item => validSelectedItems.includes(item.value)).length;
    return selectedVisibleCount > 0 && selectedVisibleCount < this.dependantFilters.length;
  }

  // Select/Deselect all items
  onSelectAll(event: any, filterName: string, datasetId: number) {
    if (!filterName) return;

    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }

    if (event.checked) {
      // Track that "Select All" is active for this filter
      this.parentCompanySelectAllActive[filterName] = true;
      // Select all visible items
      this.dependantFilters.forEach(item => {
        if (!this.selectedItemsMap[filterName].includes(item.value)) {
          this.selectedItemsMap[filterName].push(item.value);
        }
      });
    } else {
      // "Select All" is no longer active
      this.parentCompanySelectAllActive[filterName] = false;
      // Deselect all visible items
      const visibleValues = this.dependantFilters.map(item => item.value);
      this.selectedItemsMap[filterName] = this.selectedItemsMap[filterName].filter(
        value => !visibleValues.includes(value)
      );
    }
  }

  applySearchByFilter() {
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    this.searchByOptionsTopBar.forEach(opt => {
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter && this.selectedItemsMap[opt.filter_name]) {
        matchingFilter.selectedFilter = this.selectedItemsMap[opt.filter_name];
      }
    });

    // Also update selectedCheckboxesForApply for City filter
    const cityFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'City');
    const afterApply = () => {
      this.selectedCustomers.clear();
      this.selectedCustomerDetails.clear();
      this.isAssignedAllCustomer = false;
      // Skip global loader so filter menu stays open
      this.getCustomerList(undefined, true);
    };
    if (cityFilter) {
      this.selectedCheckboxesForApply = this.selectedItemsMap[cityFilter.filter_name]
        ? [...this.selectedItemsMap[cityFilter.filter_name]]
        : [];
      if (this.selectedCheckboxesForApply.length > 0) {
        // Refresh RM list by selected city; preserve user's RM selection (getFilterWiseRMByCity keeps only RMs in the city list)
        this.getFilterWiseRMByCity(null, afterApply);
        return;
      }
    }
    afterApply();
    // Do not clear search box values so user's search text persists after Apply
  }

  resetCurrentFilter(datasetId: number, dataSetName: any, filterName: string) {
    if (this.selectedFilterType === 'rm') {
      this.selectedRmUsers = [];
      this.rmUserFilter.selectedFilter = [];
      this.rmUserFilter.searchValue = '';
    } else if (filterName && this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];

      // Reset "Select All" state for this filter
      if (this.parentCompanySelectAllActive[filterName]) {
        this.parentCompanySelectAllActive[filterName] = false;
      }

      // Reset the matching topBarFilter
      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
      if (matchingFilter) {
        matchingFilter.selectedFilter = [];
        matchingFilter.searchValue = '';

        // Old logic: when city is reset, reset RM list to show all RMs
        if (matchingFilter.name === 'City') {
          this.selectedCheckboxesForApply = [];
          this.getTopBarFilter(true);
        }
        // Reset Parent Company pagination and use existing data
        if (matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
          this.parentCompanyPage = 1; // Next page to load (first page already in optionFilter)
          this.parentCompanyHasMore = true;
          if (datasetId) {
            this.searchByDataHistory[datasetId].searchValue = '';
          }
          // Use existing data from optionFilter
          this.dependantFilters = matchingFilter.optionFilter
            .filter(item => item.name !== 'All' && item.value !== 'All')
            .map(item => ({
              key: item.name,
              value: item.value
            }));
          return;
        }

      }

      if (datasetId && this.searchByDataHistory[datasetId]) {
        this.searchByDataHistory[datasetId].searchValue = '';
        this.searchByDataHistory[datasetId].isCalled = false;
      }

      // Reset dependantFilters to show all options
      if (matchingFilter) {
        this.dependantFilters = matchingFilter.optionFilter
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({
            key: item.name,
            value: item.value
          }));
      }
    }
  }

  resetAllSearchByFilters() {
    this.selectedItemsMap = {};
    this.selectedRmUsers = [];
    this.selectedCheckboxesForApply = [];

    // Reset all topBarFilters
    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';

    // Reset searchByDataHistory
    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });

    // Old logic: when all filters reset, reset RM list to show all RMs
    this.getTopBarFilter(true);

    this.getCustomerList();
  }

  onScroll(event: Event, dataSetid: number, dataSetName: any, filterName: string) {
    // For local filtering, no pagination needed
    // This is kept for compatibility with the template
        const element = event.target as HTMLElement;
    const threshold = 50; // pixels from bottom to trigger load

    // Check if scrolled near bottom
    if (element.scrollHeight - element.scrollTop - element.clientHeight < threshold) {
      // Check if this is Parent Company filter (uses API pagination)
      const matchingFilter = this.topBarFilters.find(f => f.spKeyName === dataSetName || f.name.toLowerCase() === dataSetName);
      if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
        this.loadMoreParentCompany();
      }
    }
  }

  // Load more Parent Company data for infinite scroll
  loadMoreParentCompany() {
    if (this.parentCompanyLoading || !this.parentCompanyHasMore) {
      return;
    }

    this.parentCompanyLoading = true;
    const searchValue = this.searchByDataHistory[this.selectedFilterOption?.dataset_id]?.searchValue || '';
    const filterName = this.selectedFilterOption?.filter_name;

    this.msmeService.searchParentCompany(searchValue, this.parentCompanyPage, this.searchByOptPageSize).subscribe({
      next: (response: any) => {
        this.parentCompanyLoading = false;
        if (response && response.status === 200 && response.data) {
          const data = response.data;
          const newItems = (data.content || []).map((item: any) => ({
            key: item.name,
            value: item.value
          }));

          // Append new items to existing list, filtering out duplicates by key
          const existingKeys = new Set(this.dependantFilters.map((f: any) => f.key));
          const uniqueNewItems = newItems.filter((item: any) => !existingKeys.has(item.key));
          this.dependantFilters = [...this.dependantFilters, ...uniqueNewItems];

          // Auto-select new items if "Select All" is active
          const isSelectAllActive = filterName && this.parentCompanySelectAllActive[filterName];
          if (isSelectAllActive && uniqueNewItems.length > 0) {
            if (!this.selectedItemsMap[filterName]) {
              this.selectedItemsMap[filterName] = [];
            }
            uniqueNewItems.forEach(item => {
              if (!this.selectedItemsMap[filterName].includes(item.value)) {
                this.selectedItemsMap[filterName].push(item.value);
              }
            });
          }

          // Update pagination state
          this.parentCompanyHasMore = data.hasMore || false;
          this.parentCompanyTotalElements = data.totalElements || 0;
          this.parentCompanyPage++;

          // Update searchByDataHistory
          if (this.selectedFilterOption?.dataset_id) {
            this.searchByDataHistory[this.selectedFilterOption.dataset_id].data = this.dependantFilters;
          }
        }
      },
      error: (error) => {
        this.parentCompanyLoading = false;
        console.error('Error loading more Parent Company data:', error);
      }
    });
  }
  /**
   * @param onComplete Optional callback invoked after RM list and filters are updated (e.g. to call getCustomerList so city data shows on first Apply click).
   */
  getFilterWiseRMByCity(Data?: any, onComplete?: () => void) {
    // if no city select then all rm will be untick
    if (this.selectedCheckboxesForApply.length === 0) {
      this.selectedRmUsers = [];
      onComplete?.();
      return;
    }
    this.msmeService.getFilterWiseRMByCity(this.selectedCheckboxesForApply).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {
        this.rmUserFilter.optionFilter = response?.data?.rmUsers;
        this.rmUserFilter.checkboxListTemp = undefined; // so RM search uses current (city) list
        // When user had selected RM and then selects city: keep only selected RMs that belong to the selected city (don't clear if API returns empty/different list)
        const cityRmList = response?.data?.rmUsers || [];
        const cityRmEmpCodes = cityRmList
          .filter((r: any) => r && r.empCode && r.empCode !== 'All')
          .map((r: any) => r.empCode);
        const validSet = new Set(cityRmEmpCodes.map((c: any) => String(c)));
        const previousSelected = this.selectedRmUsers || [];
        if (validSet.size > 0) {
          this.selectedRmUsers = previousSelected.filter((empCode: string) => validSet.has(String(empCode)));
        }
        // else: keep previousSelected so RM is not cleared when city API returns no RMs or different format
        this.rmUserFilter.selectedFilter = [...this.selectedRmUsers];
        for (let index = 0; index < response?.data?.filters.length; index++) {
          const fromApi = response?.data?.filters[index];
          const existing = this.topBarFilters.find(f => f.name === fromApi?.name || f.spKeyName === fromApi?.spKeyName);
          const preservedSelected = existing?.selectedFilter && existing.selectedFilter.length > 0 ? [...existing.selectedFilter] : [];
          this.topBarFilters[index] = {
            name: fromApi.name,
            spKeyName: fromApi.spKeyName,
            searchValue: existing?.searchValue || '',
            optionFilter: fromApi.options,
            selectedFilter: preservedSelected
          };
        }
        if (this.topBarFilters && this.pageData) {
          // Build set of allowed filter names from actions first
          const allowedFilterNames = new Set<string>();
          for (const action of this.pageData.actions) {
            if (typeof action.actionName === 'string') {
              const act = action.actionName.split('_');
                if (act.length > 1) {
                allowedFilterNames.add(act[act.length - 1].toUpperCase());
                  }
                }
              }
          // Now filter topBarFilters - this preserves API order
          let topbarFilter = [];
          for (const filter of this.topBarFilters) {
            if (allowedFilterNames.has(filter.name.toUpperCase())) {
              topbarFilter.push(filter);
            }
          }
          this.topBarFilters = topbarFilter;
        }
        onComplete?.();
      } else {
        this.commonService.errorSnackBar(response.message)
        console.log(response.message);
        onComplete?.();
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      onComplete?.();
    })
  }


  handleApply(filterListMaster: any[]) {
    this.filterListMaster = filterListMaster;
    // Update applied filter chips
    // if (this.isNewFilter) {
    //   const finalFilterJson = this.applyFilter(null);
    //   this.filterDataList(this.filterListMaster, finalFilterJson);
    // }
    this.getCustomerList();
    // Clear selected customers when filters are applied to avoid showing incorrect count
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
  }

  handleReset() {
    this.totalSize = 0;
    this.removeFilter()
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingSubject.next(false);
    }, 1500);
    // Clear selected customers when filters are applied to avoid showing incorrect count
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
  }


  resetFilters() {
    this.commonService.removeStorage(this.constants.FILTER_LIST_MASTER_EXISTING);
    this.commonService.removeStorage(this.constants.TOP_BAR_FILTER_LIST_EXISTING);
    this.selectedRmUsers.length = 0;
    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        f1.selectedFilter.length = 0
      }
    });
    // Clear hierarchy filter state
    this.hierarchyFilterState = null;
    this.hierarchyService.clearFilterState(this.constants.HIERARCHY_FILTER_EXISTING);
  }

  reloadData() {

    this.filterMasterService.getInsightFilterMaster(true).subscribe({
      next: (filterListMaster) => {
        // 1. Assign received data to component property
        this.filterListMaster = filterListMaster;
        this.getCustomerList();
      },
      error: (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Filter master error:', error);
      }
    });
  }


  //  Start Copmany Search  Feature -------------------------->
  onEntityTypeChange(value: string) {
    this.entityType = value;

    if (value === 'NON-MCA') {
      this.selectSearchType = 'PAN';
      this.companySearch = '';
    }
    else if (value === 'MCA') {
      this.selectSearchType = 'COMPANY';
      this.companySearch = '';
    }
  }

  onSearchTypeChange(event: any) {
    this.companyNameList = [];
    this.companySearch = '';
    this.getCustomerList();
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
    if (this.commonService.isObjectNullOrEmpty(this.companySearch)) {
      this.companyNameList = [];
    }

    // Clear selected customers when company search is performed
    this.selectedCustomers.clear();
    this.selectedCustomerDetails.clear();
    this.isAssignedAllCustomer = false;
    this.getCustomerList('prospectSearch');
  }

  onProspectSearch(finalFilterJson: any) {
    if (this.selectSearchType == 'PAN') {
      this.companySearch = this.companySearch.toUpperCase();
      finalFilterJson['pan'] = this.companySearch;
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

  getSaveRiskSearchData() {

    if (this.companySearch == "") {
      this.companyNameList = [];
      return;
    }

    const data = {
      "searchName": this.companySearch
    }
    this.searchCompanyFound = true;
    this.msmeService.getSaveRiskCompanySearchDetails(data).subscribe((res: any) => {
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

  saveIndividualGstUdhyamSaveRiskApi() {
    GlobalHeaders['x-page-action'] = 'Search By Selected Company';

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
      // this.pan = selectedCompany[0].pan;
    }
    reqData['roleId'] = this.userRoleId;
    reqData['roleTypeId'] = this.roleTypeId;
    this.msmeService.saveIndividualGstUdhyamSaveRiskApi(reqData).subscribe(
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
          if (res.data.type.toLowerCase() === 'etb') { //||  res.data.type.toLowerCase() === 'target'

            if (this.userRoleId != Constants.Role.HEAD_OFFICER && (res.data?.rmId != this.empCode)) {
              this.InactiveActiveCSEM_Popup(res.data);
            }
            else if (this.selectSearchType == 'COMPANY' && !this.commonService.isObjectNullOrEmpty(res?.data?.companyName) && res?.data?.companyName.toLowerCase() !== reqData['name'].toLowerCase()) {
              this.commonService.warningSnackBar('Customer is already available in ' + res?.data?.type + ' dashboard and componay name is ' + res?.data.companyName);
            }
            else {
              if (res.data.scope == "inactive") {
                res.data.isETBData = true;
                this.InactiveActiveCSEM_Popup(res.data);
              }
              else {
                this.commonService.warningSnackBar('Customer is already available in ' + res?.data?.type + ' dashboard');
              }
            }
          }
          else {
            res.data.isETBData = true;
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
  };

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

  navigateToViewComponent(customer: any, hitType: string) {
    let topBarFiler = {};
    topBarFiler["topBarFilters"] = this.topBarFilters;
    this.commonService.setStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT, JSON.stringify(topBarFiler));
    const routerData = { pan: customer.panNo, tabId: 1, cin: customer.cin, customerType: customer?.customerType ?? null };
    let externalRoutData: any = {};   // = {hitType: hitType, isFindETB: true, isFindSameRm: isFindSameRm, companyName: customer.name} // isFindETB -----------> use for ETB redirect
    externalRoutData.hitType = hitType
    externalRoutData.companyName = customer.name
    if (hitType == "BySearch") {
      externalRoutData.isFindProspects = true
    }
    else {
      if (this.userRoleId != Constants.Role.HEAD_OFFICER) {
        externalRoutData.isFindETB = true;
        externalRoutData.isFindSameRm = customer?.isRMSame ?? false;
      }
    }

    if (routerData.pan) {
      GlobalHeaders['x-page-data'] = routerData.pan;
    } else if (routerData.cin) {
      GlobalHeaders['x-page-data'] = routerData.cin;
    }
    GlobalHeaders['x-page-action'] = 'View  Portfolio';

    this.pageData.isFindETB = true;
    this.pageData.routeLink = "/hsbc/rmExisitingPortfolio"
    saveActivity(() => { });

    let passRouteData: any = this.pageData;
    if (!(Constants.CustomerType.ETB == customer?.customerType)) {
      let routeData: any = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
      for (const element of routeData) {
        if (element.pageId === 23) {
          passRouteData = element;
          break;
        }
      }
    }

    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: passRouteData, dataFrom: this.pageData, isFromParentPage: true }, queryParams: { externalRoutData: this.commonService.toBTOA(JSON.stringify(externalRoutData)) } });
  }

  onToggleChange(isCustomerTypeInActive: boolean) {
    this.isCustomerTypeInActive = isCustomerTypeInActive;
    this.isCustomerTypeActive = !isCustomerTypeInActive; // Update the toggle state
    console.log("this.constants.CustomerType.ETB - 1::::> ", this.constants.CustomerType.ETB - 1)
    this.commonService.updateCustomerInActive(this.constants.CustomerType.ETB - 1, isCustomerTypeInActive);
    this.getCustomerList();
  }

  // Handle Customer Type toggle from top bar
  onCustomerTypeToggle(event: any): void {
    const isActive = event.checked;
    const isCustomerTypeInActive = !isActive;

    console.log('Customer Type Toggle - isActive:', isActive, 'isCustomerTypeInActive:', isCustomerTypeInActive);

    this.isCustomerTypeInActive = isCustomerTypeInActive;
    this.isCustomerTypeActive = isActive;

    // Update the global state
    this.commonService.updateCustomerInActive(this.constants.CustomerType.ETB - 1, isCustomerTypeInActive);

    // Refresh customer list
    this.getCustomerList();
  }

  CreateCampaignPopup(): void {
    if (this.selectedCustomers && this.selectedCustomers?.size > 0) {
      const selectedCustomerDetailsArray = Array.from(this.selectedCustomerDetails.values());

      let request: any = {};
      request["type"] = 'ETB';
      request["customerType"] = this.constants.CustomerType.ETB;
      var json = this.applyFilter(null);
      json["paginationFROM"] = 0
      json["paginationTO"] = this.totalSize
      request.filterJson = JSON.stringify(json);

      this.dialog.open(CreateCampaignPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
        data: {
          // customerCount: this.selectedCustomers?.size,
          // customerCount: this.isAssignedAllCustomer ? this.totalSize : this.selectedCustomers?.size,
          customerCount: this.isManualAllPagesSelected ? this.totalSize : this.selectedCustomers?.size,
          selectedCustomers: selectedCustomerDetailsArray,
          filterDataList: this.appliedFilterDataList,
          getCustomerPayload: request,
          isAssignedAllCustomer: this.isManualAllPagesSelected,
          // isAssignedAllCustomer: this.isAssignedAllCustomer,
          // filteredKeyValueList: this.filteredKeyValueList,
        }
      });
    } else {
      this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
    }
  }


  // Open Advanced Filter Popup S
  openAdvancedFilter(isFromSaveFilterPopup?,savedFilter?:FilterListItem,filterName?): void {
    let categoryIndex = (filterName != undefined || filterName != null) ? this.filterListMaster.findIndex(filter1 => filter1.filterName === filterName) : undefined;
    const dialogRef = this.dialog.open(FilterSidebarNewComponent, {
      panelClass: ['popupMain_design', 'advanced_filter_dialog', 'right_side_popup'],
      data: {
        filterListMaster: this.filterListMaster,
        isProcessing: this.isLoadingSubject.asObservable(),
        customerTypeInActive: this.isCustomerTypeInActive,
        customerType: this.constants.CustomerType.ETB,
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
      this.filterListMaster = data.filterListMaster;
      this.isCustomerTypeInActive = data.customerTypeInActive;
      this.isCustomerTypeActive = !data.customerTypeInActive;

      // Update applied filters list for display
      const finalFilterJson = this.applyFilter(null);
      this.filterDataList(this.filterListMaster, finalFilterJson);

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
  // Open Advanced Filter Popup E

  // Chip Dropdown Methods
  activeChipDropdown: number | null = null;
  private hideDropdownTimeout: any;

  // Cached grouped filters list
  groupedAppliedFilters: any[] = [];

  // Customize Columns properties
  allColumns: string[] = [];
  selectedColumns: string[] = [];
  defaultColumns: string[] = [];
  mandatoryColumns: string[] = [];
  columnMap: Record<string, string> = {};

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

  // Show/hide expanded filters
  showAllFilters: boolean = false;

  toggleShowAllFilters(): void {
    this.showAllFilters = !this.showAllFilters;
  }

  // Generate grouped filters list (call this when filters change)
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

  // Get total count of applied filters
  getTotalAppliedFiltersCount(): number {
    return this.appliedFilterDataList.length;
  }

  // Get count of additional filters (beyond the first one)
  getAdditionalFiltersCount(): number {
    return Math.max(0, this.groupedAppliedFilters.length - 4);
  }

  // Clear all applied filters
  clearAllFilters(): void {
    // Reset all filters in filterListMaster
    this.filterListMaster.forEach(filter1 => {
      if (filter1.insightTwoFilter) {
        filter1.insightTwoFilter.forEach(filter2 => {
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
          filter2.json.count = 0;
        });
      }
      filter1.count = 0;
    });

    // Clear applied filters list
    this.appliedFilterDataList = [];

    // Regenerate grouped filters list
    this.generateGroupedAppliedFilters();

    // Refresh the customer list
    this.getCustomerList();
  }

  // Remove individual applied filter
  removeAppliedFilter(filterItem: any): void {
    // Find and remove the filter from filterListMaster
    this.filterListMaster.forEach(filter1 => {
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

    // Refresh the data
    this.getCustomerList();
  }

  // Remove all filters for a specific sub-filter
  removeFilterGroup(filterName: string, subFilterName: string): void {
    this.filterListMaster.forEach(filter1 => {
      if (filter1.filterName === filterName) {
        filter1.insightTwoFilter.forEach(filter2 => {
          if (filter2.filterTwoName === subFilterName) {
            // Clear all selections for this filter
            if (filter2.type === 'checkbox') {

              let checkboxList = filter2.json.keys;
              if (checkboxList) {
                checkboxList.forEach(key => {
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

    // Refresh the data
    this.getCustomerList();
  }

  // Group applied filters by filterName and subFilterName
  // DEPRECATED: Use groupedAppliedFilters property instead
  getGroupedAppliedFilters(): any[] {
    return this.groupedAppliedFilters;
  }
  toggleSelection(customerId: number) {
    this.isManualAllPagesSelected = false;
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
      this.selectedCustomerDetails.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
      const customer = this.customerList.find(c => c.id === customerId);
      if (customer) {
        this.selectedCustomerDetails.set(customerId, {
          customerName: customer.name,
          customerId: customer.customerId,
          pan: customer.panNo,
          rmId: customer.rmId,
          customerType: this.constants.CustomerType.ETB,
        });
      }
    }
    this.updateTransformedCustomer();
  }

  selectAllProspect(event: any) {
    // this.isAssignedAllCustomer = !this.isAssignedAllCustomer;
    this.isAssignedAllCustomer = event.checked;
    this.isManualAllPagesSelected = event.checked;
    if (this.isAssignedAllCustomer) {
      this.customerList.forEach(customer => {
        this.selectedCustomers.add(customer.id);
        this.selectedCustomerDetails.set(customer.id, {
          customerName: customer.name,
          customerId: customer.customerId,
          pan: customer.panNo,
          rmId: customer.rmId,
          customerType: this.constants.CustomerType.ETB,
        });
      });
    }
    else {
      this.isManualAllPagesSelected = false;
      this.customerList.forEach(customer => {
        this.selectedCustomers.delete(customer.id);
        this.selectedCustomerDetails.delete(customer.id);
      });
    }
    this.updateTransformedCustomer();
  }

  updateTransformedCustomer() {
    if (this.customerList) {
      this.isAssignedAllCustomer = this.customerList.every(customer => this.selectedCustomers.has(customer.id));
    }
  }

  // filterDataList(filterListMaster: any[], appliedFilters: any) {
  //   const ignoreKeys = ["paginationFROM", "paginationTO", "role", "sortDirection", "type", "subPersona"];

  //   const flattenedData: any[] = [];

  //   filterListMaster.forEach(group => {
  //     group.insightTwoFilter.forEach((f: any) => {
  //       const key = f.keyName || f.filterTwoName?.replace(/\s+/g, '');
  //       if (ignoreKeys.includes(key)) return;
  //       if (!(key in appliedFilters)) return;

  //       const appliedValue = appliedFilters[key];

  //       // ✅ Checkbox
  //       if (f.type === "checkbox" && Array.isArray(appliedValue)) {
  //         const selectedKeys = f.json.keys
  //           .filter(k => appliedValue.includes(k.sNo) || appliedValue.includes(k.value))
  //           .map(k => k.name);

  //         selectedKeys.forEach(name => {
  //           flattenedData.push({
  //             filterName: group.filterName,
  //             subFilterName: f.filterTwoName,
  //             subFilterValue: name,
  //             type: f.type,
  //           });
  //         });
  //       }

  //       // ✅ Radio Button
  //       else if (f.type === "radioButton" && typeof appliedValue === "string") {
  //         if (appliedValue !== "All" && appliedValue !== "ALL") {
  //           flattenedData.push({
  //             filterName: group.filterName,
  //             subFilterName: f.filterTwoName,
  //             subFilterValue: appliedValue,
  //             type: f.type,
  //           });
  //         }
  //       }

  //       // ✅ Range
  //       else if (f.type === "minMax" && typeof appliedValue === "object" && appliedValue.minValue !== undefined) {
  //         const min = Number(appliedValue.minValue);
  //         const max = Number(appliedValue.maxValue);
  //         const minDefault = Number(f.json.minTemp ?? f.json.min);
  //         const maxDefault = Number(f.json.maxTemp ?? f.json.max);

  //         if (min !== minDefault || max !== maxDefault) {
  //           flattenedData.push({
  //             filterName: group.filterName,
  //             subFilterName: f.filterTwoName,
  //             subFilterValue: `${min} - ${max}`,
  //             type: f.type,
  //           });
  //         }
  //       }
  //     });
  //   });

  //   this.appliedFilterDataList = flattenedData;
  //   console.log("Flattened Filter Data:", flattenedData);
  // }

  // createFilteredList(finalFilterJson: any) {
  //   this.filteredKeyValueList = Object.entries(finalFilterJson)
  //     .filter(([key]) => !this.ignoreKeys.includes(key))
  //     .map(([key, value]) => ({ key, value }));
  // }

  filterDataList(filterListMaster: any[], appliedFilters: any) {
    const flattenedData: any[] = [];

    filterListMaster.forEach(group => {
      group.insightTwoFilter.forEach((f: any) => {
        if (f.filterTwoName === 'Customer Type' && (f.selected == null || f.selected == undefined || f.selected?.length==0)) {
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

  CustomizeColumn_popup() {
    const dialogRef = this.dialog.open(CustomizeColumnsPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2'],
      data: {
        allColumns: this.allColumns,
        selectedColumns: this.selectedColumns,
        defaultColumns: this.defaultColumns,
        mandatoryColumns:this.mandatoryColumns
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedColumns = result;
        this.selectedColumns.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestSelectFields.includes(columnName)) {
            this.requestSelectFields.push(columnName);
          }
        });

        this.getCustomerList();
      }
    });
  }

  // Initialize column arrays for customize columns functionality
  private initializeColumnArrays(): void {
    this.columnMap = {
      'Customer ID': 'customerId',
      'Name Of Customer': 'customerName',
      'HSBC Wallet': 'hsbcwallet',
      'Total Opportunity': 'totalOpportunity',
      'Share (%)': 'share',
      'Pre-Qualified': 'preQualified'
    };

    this.allColumns = [
      'Customer ID',
      'Name Of Customer',
      // 'Persona',
      'HSBC Wallet',
      'Total Opportunity',
      'Share (%)',
      'Pre-Qualified',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","PAN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Segment","Customer City","Customer type","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    
    this.defaultColumns = [
      'Customer ID',
      'Name Of Customer',
      'HSBC Wallet',
      'Total Opportunity',
      'Share (%)',
      'Pre-Qualified'
    ];

    this.mandatoryColumns = [
      'Customer ID',
      'Name Of Customer'
    ];

    let selectedColumnsString = this.commonService.getStorageAesEncryption(this.constants.SELECTED_COLUMNS_EXISTING);
    if (selectedColumnsString != null && selectedColumnsString != undefined) {
      let selectedColumns = JSON.parse(JSON.parse(selectedColumnsString));
      if (selectedColumns) {
        this.selectedColumns = selectedColumns;
        this.selectedColumns.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestSelectFields.includes(columnName)) {
            this.requestSelectFields.push(columnName);
          }
        });
      }
    } else {
      this.selectedColumns = [
        'Customer ID',
        'Name Of Customer',
        // 'Persona',
        'HSBC Wallet',
        'Total Opportunity',
        'Share (%)',
        'Pre-Qualified'
      ];
    }
  }

  // Check if a column should be displayed
  isColumnVisible(columnName: string): boolean {
    return this.selectedColumns.includes(columnName);
  }

  // Get column value for a customer based on column name
  getColumnValue(customer: any, columnName: string): any {
    switch (columnName) {
      case 'Customer ID':
        return customer?.customerId || '-';
      case 'Name Of Customer':
        return customer?.name || '-';
      case 'Persona':
        return customer?.persona || '-';
      case 'HSBC Wallet':
        return !this.commonService.isObjectNullOrEmpty(customer?.hsbcwallet) ? '₹' + this.decimalPipe.transform(customer?.hsbcwallet, '1.2-2') : '-';
      case 'Total Opportunity':
        if (this.searchForm.get("opportunity")?.value == 'NO_OF_PRODUCTS_NOT_WITH_HSBC') {
          return customer?.totalOpportunity ? this.decimalPipe.transform(customer?.totalOpportunity, '1.2-2') : 0;
        } else {
          const prefix = (this.searchForm.get("opportunity")?.value == "EXPORT" || this.searchForm.get("opportunity")?.value == "IMPORT") ? "$ " : "₹ ";
          return prefix + this.decimalPipe.transform(customer?.totalOpportunity || 0, '1.2-2');
        }
      case 'Share (%)':
        return customer?.share ? this.decimalPipe.transform(customer?.share || 0, '1.2-2') : '-';
      case 'Pre-Qualified':
        if (this.searchForm.get("preApproved")?.value !== '3') {
          return '₹' + this.decimalPipe.transform(customer?.preApproved || 0, '1.2-2');
        } else {
          const prefix = (this.searchForm.get("preApproved")?.value == "3") ? "$ " : "₹ ";
          return prefix + this.decimalPipe.transform(customer?.preApproved || 0, '1.2-2');
        }
      default:
        return Object.keys(CUSTOMIZE_COLUMN).includes(columnName) ? customer[CUSTOMIZE_COLUMN[columnName]]==0 ? '0': (customer[CUSTOMIZE_COLUMN[columnName]] || '-') : '-';
    }
  }

  // Get CSS class for column
  getColumnClass(columnName: string): string {
    switch (columnName) {
      case 'Customer ID':
        return '';
      case 'Name Of Customer':
        return '';
      case 'Persona':
        return 'blue_text';
      default:
        return '';
    }
  }

  // Check if column has special rendering (like badge)
  hasSpecialRendering(columnName: string): boolean {
    return columnName === 'Customer ID';
  }

    // Handle Parent Company search from searchSubject
  handleParentCompanySearch(searchText: string, datasetId: number) {
    this.isLoadingSearchBy = true;
    // Reset pagination for new search
    this.parentCompanyPage = 0;
    this.parentCompanyHasMore = true;
    this.dependantFilters = [];

    // Get filter name for Parent Company
    const filterOpt = this.searchByOptionsTopBar.find(opt => opt.key === 'Parent Company');
    const filterName = filterOpt?.filter_name;

    // When search is cleared, reset "Select All" state so it doesn't auto-select all items
    if (searchText.trim().length === 0 && filterName && this.parentCompanySelectAllActive[filterName]) {
      this.parentCompanySelectAllActive[filterName] = false;
    }

    this.msmeService.searchParentCompany(searchText, 0, this.searchByOptPageSize).subscribe({
      next: (response: any) => {
        this.isLoadingSearchBy = false;
        //debugger;
        if (response && response.status === 200 && response.data) {
          const data = response.data;
          this.dependantFilters = (data.content || []).map((item: any) => ({
            key: item.name,
            value: item.value
          }));

          this.parentCompanyHasMore = data.hasMore || false;
          this.parentCompanyTotalElements = data.totalElements || 0;
          this.parentCompanyPage = 1;

          this.searchByDataHistory[datasetId].data = this.dependantFilters;
          this.searchByDataHistory[datasetId].isCalled = true;

          // Auto-select filtered results if "Select All" is active for Parent Company
          // This only applies when user is actively searching (not when search is cleared)
          if (filterName && this.parentCompanySelectAllActive[filterName] && this.dependantFilters.length > 0) {
            if (!this.selectedItemsMap[filterName]) {
              this.selectedItemsMap[filterName] = [];
            }
            this.dependantFilters.forEach(item => {
              if (!this.selectedItemsMap[filterName].includes(item.value)) {
                this.selectedItemsMap[filterName].push(item.value);
              }
            });
          }
        }
      },
      error: (error) => {
        this.isLoadingSearchBy = false;
        console.error('Error searching Parent Company:', error);
      }
    });
  }
  openTeamStructurePopup(): void {
    const dialogData: TeamStructureDialogData = {
      previousFilterState: this.hierarchyFilterState,
      customerTypeId: this.constants.CustomerType.ETB,
      pageKey: this.constants.HIERARCHY_FILTER_EXISTING
    };

    const dialogRef = this.dialog.open(TeamStructurePopupComponent, {
      panelClass: ['popupMain_design'],
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.isReset) {
          // Reset: clear hierarchy filter and reload with default view
          this.hierarchyFilterState = null;
          this.hierarchyService.clearFilterState(this.constants.HIERARCHY_FILTER_EXISTING);
          this.getCustomerList();
        } else if (result.filterState) {
          this.hierarchyFilterState = result.filterState;
          if (result.filterState.isApplied) {
            this.getCustomerList();
          }
        }
      }
    });
  }
  saveFilterPopup(): void {
    const dialogRef = this.dialog.open(SaveFilterPopupComponent, {
      panelClass: ['popupMain_design'],
      data: {
        filterListMaster: this.filterListMaster,
        customerTypeId:this.constants.CustomerType.ETB,
        userId : this.userId,
        isAnyFilterApplied:this.appliedFilterDataList.length > 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'apply' && result.filterConfig) {
        this.filterListMaster = result.filterConfig;
        const finalFilterJson = this.applyFilter(null);
        this.filterDataList(this.filterListMaster, finalFilterJson);
        this.saveAppliedFilter();
        this.getCustomerList();
      } else if(result && result.action === 'update' && result.filterConfig) {
        this.filterListMaster = result.filterConfig;
        this.openAdvancedFilter(true,result.filter);
      }
    });
  }

   /**
   * Restore hierarchy filter state from service (for preserving across navigation)
   */
  private restoreHierarchyFilterState(): void {
    const savedState = this.hierarchyService.getSavedFilterState(Constants.HIERARCHY_FILTER_EXISTING);
    if (savedState) {
      this.hierarchyFilterState = savedState;
    }
  }
}



interface CustomerList {
  id: number
  customerId: string;
  panNo: string;
  name: string;
  persona: string;
  hsbcwallet: string;
  totalOpportunity: string;
  share: string;
  preApproved: string;
  scope: string;
  cin: string;
  rmId: string;
  /** Numeric id from API before display mapping */
  customerTypeId?: number;
  customerType: any;
}


