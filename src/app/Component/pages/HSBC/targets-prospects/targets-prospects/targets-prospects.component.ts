import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, viewChild } from '@angular/core';
import { UntypedFormBuilder, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith, takeUntil } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuditAPIType, Constants, CUSTOMIZE_COLUMN } from 'src/app/CommoUtils/constants';
import { DropdownOption } from 'src/app/CommoUtils/model/drop-down-option';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import * as _ from 'lodash';
import { GlobalHeaders, resetGlobalHeaders, saveActivity } from "../../../../../CommoUtils/global-headers";
import { TopBarFilter } from 'src/app/CommoUtils/model/top-bar-filter';
import { CustomerList } from 'src/app/CommoUtils/model/CustomerList';
import { ExportExcelPopupComponent } from 'src/app/Popup/HSBC/export-excel-popup/export-excel-popup.component';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { MatAccordion } from '@angular/material/expansion';
import { DashboardResponse } from '../targets-prospects-find/targets-prospects-find.component';
import { UseridPopupComponent } from 'src/app/Popup/HSBC/userid-popup/userid-popup.component';
import { RequestStatusPopupComponent } from 'src/app/Popup/request-status-popup/request-status-popup.component';
import { RejectedPopupComponent } from 'src/app/Popup/HSBC/rejected-popup/rejected-popup.component';
import { error, log } from "console";
import { TargetUserdeletePopupComponent } from 'src/app/Popup/HSBC/target-userdelete-popup/target-userdelete-popup.component';
import { SucessfullyDeletePopupComponent } from 'src/app/Popup/HSBC/sucessfully-delete-popup/sucessfully-delete-popup.component';
import { AddMultiRmPopupComponent } from 'src/app/Popup/HSBC/add-multi-rm-popup/add-multi-rm-popup.component';
import { ApproveRejectPopupComponent } from 'src/app/Popup/HSBC/approve-reject-popup/approve-reject-popup.component';
import { ViewAllrmPopupComponent } from 'src/app/Popup/HSBC/view-allrm-popup/view-allrm-popup.component';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { FilterMasterService } from 'src/app/services/filter-master.service';
import { CustomizeColumnsPopupComponent } from 'src/app/Popup/customize-columns-popup/customize-columns-popup.component';
import { FilterSidebarNewComponent } from 'src/app/Popup/filter-sidebar-new/filter-sidebar-new.component';
import { TeamStructurePopupComponent, TeamStructureDialogData } from 'src/app/Popup/team-structure-popup/team-structure-popup.component';
import { HierarchyFilterState } from 'src/app/CommoUtils/model/hierarchy-node';
import { HierarchyService } from 'src/app/services/hierarchy.service';
import { PanFormatPipe } from 'src/app/CommoUtils/pipe/pan-format.pipe';
import { FilterListItem } from 'src/app/models/user-filter.model';
import { SaveFilterPopupComponent } from 'src/app/Popup/save-filter-popup/save-filter-popup.component';
import { CreateCampaignProspectPopupComponent } from 'src/app/Popup/create-campaign-prospect-popup/create-campaign-prospect-popup.component';

export interface User {
  name: string;
}
@Component({
  selector: 'app-targets-prospects',
  templateUrl: './targets-prospects.component.html',
  styleUrl: './targets-prospects.component.scss'
})
export class TargetsProspectsComponent implements OnInit, OnDestroy {

  // Track the current sorted field and direction
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  currentSortField: string = null;
  isNewFilter = true;
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  // tab: number =1;

  totalCount;
  userId: any;
  customerList: CustomerList[] = [];
  filterListMaster: any[] = [];
  searchForm: FormGroup;
  subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();
  accordion = viewChild.required(MatAccordion);
  isCustomerTypeInActive: boolean = false;
  isCustomerTypeActive: boolean = true; // For the toggle (opposite of isCustomerTypeInActive)
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

  gsinList: any = [];
  psgeGstList: any = [];
  totalOpportunities: DropdownOption[];
  personaGroups: DropdownOption[];
  personaAllOptions: DropdownOption[];
  personaMap = {};
  opportuniySortMap = {};

  topBarFilters: TopBarFilter[] = [];
  pincodeMaster = [];
  rmUserFilter: TopBarFilter = { searchValue: '', optionFilter: [], selectedFilter: [] };
  inCatFilter: TopBarFilter = { searchValue: '', optionFilter: [], selectedFilter: [] };
  previousCitySelection: string[] = [];

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
  /** Cache of display label by filter and value so Location selection stays visible when reopening after Apply */
  selectedOptionLabels: { [filterName: string]: { [value: string]: string } } = {};
  /** Backup of applied Location selection so it survives clearDependentFilters and shows when reopening */
  appliedLocationSelection: any[] = [];
  /** Backup of applied Area selection so it survives clearDependentFilters and shows when reopening */
  appliedAreaSelection: any[] = [];
  searchByOptPageSize = 50;
  previousLocationSelection: string[] = [];
  customerTypesListTemp: any[] = [{ label: 'All', value: 0 }, { label: 'ETB', value: 1 }, { label: 'TARGET', value: 2 }, { label: 'SAGE Prospects', value: 3 }, { label: 'FDI Prospects', value: 4 }, { label: 'ODI Prospects', value: 5 }, { label: 'ECB Prospects', value: 6 }];

  selectedRmUsers: string[] = [];
  toggleHide: boolean = false;
  toggleHidePreApp: boolean = false;
  allAreaData: any[] = [];
  originalAreaData: any[] = [];
  currentAreaIndex = 0;
  locationBatchSize = 20;
  pageNumber = 0;
  pageSizeLocation = 100;
  allLocationData: any[] = [];
  originalLocationData: any[] = [];
  currentLocationIndex = 0;

  preApprovedDatas: DropdownOption[];

  // Team Structure Hierarchy Filter State
  hierarchyFilterState: HierarchyFilterState = null;

  // Assignment Source Filter Properties
  assignmentSourceType: string = '';
  assignmentSourceFilter: any = { type: null, selectedValues: [] };
  campaignFilter: TopBarFilter = { searchValue: '', optionFilter: [], selectedFilter: [], name: 'Campaign' };
  peerFilter: TopBarFilter = { searchValue: '', optionFilter: [], selectedFilter: [], name: 'RM' };
  showAssignmentSourceColumn: boolean = false;
  campaignList: any[] = []; // To store fetched campaigns if needed explicitly
  peerList: any[] = [];     // To store fetched peers

  // Autocomplete
  myControl = new FormControl<string | User>('');
  options: User[] = [{ name: 'ABC Innovations' }, { name: 'ABC Solutions' }, { name: 'ABC Ventures' }, { name: 'ABC Tech' }, { name: 'ABC Success' }];
  filteredOptions: Observable<User[]>;
  pageData: any;
  constants: any;
  filterJson = null;

  // isLoading is used to disable the buttons after applying the filter.
  isLoading = false;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  isAssignedAllCustomer = false;
  isManualAllPagesSelected = false;
  selectedCustomers: Set<number> = new Set(); // To store selected customer IDs
  transformedMap: any
  dashboardResponse: DashboardResponse;
  disableAssignButton = true; // Initially, button is disabled
  disableDeleteButton = true;
  empCode: any;
  catOrAnd: any = '2';
  disableRejectButton: any;
  disableAssignButtonForSharedrm = false;// Initially, button is disabled
  disableDeleteButtonForSharedrm = false;
  disableRejectButtonForSharedrm = false;
  isBulkSharing = false;
  bulkShare = false;
  roleId: any;
  userType: any;
  clientReasonMap: any = {};
  appliedFilterDataList: any[] = [];
  groupedAppliedFilters: any[] = [];
  ignoreKeys = ["paginationFROM", "paginationTO", "role", "sortDirection", "type", "subPersona", "opportunity", "personaUpper",
    "mainPersona", "preApproved", "sortField", "code", "name", "hsbcwallet", "share", "cities", "segments", "rmUsers", "catOrAnd", "location",
    "Area", "Category", "Countries", "Subsidiarycountry"];
  requestedFields = ["id","panNo","name","customerId","region","rmId","isMcaFetched","customerType","cin","globalRm","parentCompanyName",
    "customerSegmentId","crr","preApproved","share","totalOpportunity","city","country"];
  protected readonly consValue = Constants;
  roleType: any;
  ngOnInit() {
    // Hide main loader immediately - we'll use subloader for table data
    this.loaderService.hide();
    if (this.route.snapshot.data['isNewFilter'] != null && this.route.snapshot.data['isNewFilter'] != undefined) {
      this.isNewFilter = this.route.snapshot.data['isNewFilter'];
    }

    // Restore hierarchy filter state from service (preserves across navigation)
    this.restoreHierarchyFilterState();

    if (!this.isNewFilter) {
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.TARGETS_AND_PROSPECTS)
    } else {
      this.pageData = history.state.data;
    }
    this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    console.log("roleId===>", this.roleId);

    this.constants = Constants;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmTargetsProspects';

    if (this.commonService.isObjectNullOrEmpty(this.pageData)) {
      this.pageData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true))[1];
    }
    if (!this.pageData || this.pageData === 'undefined') {
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.TARGETS_AND_PROSPECTS)
    }

    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    console.log('Received data:', this.pageData);

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );
    this.initForm();
    this.initTableColumnOptions();
    this.initializeColumnArrays();

    try {
      const storedFilterJson = this.commonService.getStorageAesEncryption(this.constants.FILTER_JSON_TARGET);
      if (storedFilterJson && storedFilterJson !== undefined && storedFilterJson !== 'undefined') {
        this.filterJson = JSON.parse(JSON.parse(storedFilterJson));
        if (this.filterJson) {
          this.applySavedFilter(this.filterJson);
        }
      }
    } catch (e) {
      this.filterJson = null;
    }

    this.initializeFilters();
    this.getClientReasonMaster();

    this.searchValueChanged
      .pipe(debounceTime(300))
      .subscribe(({ filter, filterName }) => {
        this.filterlocationDebounce(filter, filterName);
      });

    this.initializeLocationData();

    // Clear Area on initial load and when navigating back from another component
    this.subscribeToRouteAndResetArea();
  }

  /** On initial load and when navigating back to this page: reset Area filter and show all records. */
  private subscribeToRouteAndResetArea(): void {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      filter((e: NavigationEnd) => e.urlAfterRedirects?.includes('rmTargetsProspects') ?? false),
      takeUntil(this.destroy$)
    ).subscribe(() => this.resetAreaFilterOnPageLoad());
  }

  /** Reset Area filter on page load so after Apply → navigate away → back, Area is cleared and all records show. */
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
    this.getCustomerList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Filter state is preserved in service for navigation to record view and back
    // Only cleared on explicit reset
  }

  private initTableColumnOptions(): void {
    this.totalOpportunities = this.existingProspectsDropDownService.getTotalOpportunityDropdownOptions();
    this.personaAllOptions = this.existingProspectsDropDownService.getPersonaAllOptions();
    this.opportuniySortMap = this.existingProspectsDropDownService.getOpportunitySortMap();
    this.preApprovedDatas = this.existingProspectsDropDownService.getPreApprovedDropdownOptions();
    this.personaMap = this.existingProspectsDropDownService.getPersonaMap();

  }
  private initializeFilters(): void {

    let needsTopBarFilter = true;
    let needsFilterMaster = true;
    let topBarMasterJson = this.commonService.getStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_TARGET);
    if (topBarMasterJson && topBarMasterJson !== undefined && topBarMasterJson !== "undefined") {
      let filterListMasterTemp = JSON.parse(JSON.parse(topBarMasterJson));
      if (filterListMasterTemp) {

        this.topBarFilters = filterListMasterTemp.topBarFilters;
        this.rmUserFilter = filterListMasterTemp.rmUserFilter;
        this.inCatFilter = filterListMasterTemp.inCatFilter;
        this.pincodeMaster = this.commonService.getStorageAesEncryption("pincodeMaster");
        // Restore RM selections so Search By menu count and state show correctly when returning to page
        this.selectedRmUsers = Array.isArray(this.rmUserFilter?.selectedFilter) ? [...this.rmUserFilter.selectedFilter] : [];
        needsTopBarFilter = false;
        // Setup search menu when loading from storage (syncs selectedItemsMap from topBarFilters)
        if (this.topBarFilters && this.topBarFilters.length > 0) {
          this.setupSearchByMenu();
        }
      }
    }

    let masterJson = this.commonService.getStorageAesEncryption(this.constants.FILTER_LIST_MASTER_TARGET);
    if (masterJson && masterJson !== undefined && masterJson !== "undefined"
    ) {
      masterJson = masterJson.replace(/[\x00-\x1F\x7F]/g, '');
      let filterListMasterTemp = JSON.parse(JSON.parse(masterJson));
      if (filterListMasterTemp) {
        this.filterListMaster = filterListMasterTemp;
        needsFilterMaster = false;

        // If we have saved filters, update the applied filters list
        if (this.filterJson) {
          this.filterDataList(this.filterListMaster, this.filterJson);
        }
      }
    }

    this.isCustomerTypeInActive = this.pageData.isCustomerTypeInActive || this.commonService.customerInActiveForCurrPage[this.constants.CustomerType.TARGET - 1];

    // Initialize toggle state (opposite of isCustomerTypeInActive)
    this.isCustomerTypeActive = !this.isCustomerTypeInActive;

    // Call customer list immediately - independent of filter masters
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
      opportunity: 'CUA',
      personaUpper: "ALL",
      preApproved: "ALL",
      country: [''],
      globalRm: [''],
      parentCompanyName: [''],
      campaignName: ['']
    });

    let previousNameValue = this.searchForm.get('name')?.value || '';
    this.searchForm.valueChanges.pipe(
      debounceTime(300),// Wait for 300ms pause in events
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
    // )
    if (!this.commonService.isObjectNullOrEmpty(value)) {
      this.getCustomerList();
    }
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router, private http: HttpClient,
    public commonMethod: CommonMethods, private loaderService: LoaderService, private formBuilder: UntypedFormBuilder,
    private datepipe: DatePipe, private fb: FormBuilder, private existingProspectsDropDownService: ExistingProspectsDropDownService, private service: MsmeService,
    private filterMasterService: FilterMasterService, private route: ActivatedRoute, private hierarchyService: HierarchyService,private decimalPipe: DecimalPipe) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.getEmpCode();

  }

  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getCustomerList();
  }


  // Assignment Source API Pagination Variables
  assignmentSourcePage = 0;
  assignmentSourceSize = 10;
  assignmentSourceTotal = 0;
  assignmentSourceLoading = false;
  assignmentSourceSearchValue = '';

  getCampaignList() {
    this.fetchAssignmentSources(true, false);
  }

  getPeerList() {
    this.fetchAssignmentSources(true, false);
  }

  onAssignmentSourceTypeChange(type: string) {
    this.assignmentSourceType = type;

    // Reset selections when switching types
    this.campaignFilter.selectedFilter = [''];
    this.peerFilter.selectedFilter = [''];
    this.assignmentSourceSearchValue = '';
    this.campaignFilter.searchValue = '';
    this.campaignFilter.searchValue = '';
    if (type === 'Self-Assigned') {
      this.applyAssignmentSourceFilter();
    } else {
      this.fetchAssignmentSources(true, true);
    }
  }

  fetchAssignmentSources(reset: boolean = false, selectAll: boolean = false) {
    const fakeEvent = { checked: true };
    if (reset) {
      this.assignmentSourcePage = 0;
      this.assignmentSourceTotal = 0;
      if (this.assignmentSourceType === 'Campaign Assigned') {
        this.campaignFilter.optionFilter = [];
      } else if (this.assignmentSourceType === 'Assigned by Peer' || this.assignmentSourceType === 'Shared by RM') {
        this.peerFilter.optionFilter = [];
      }
    }

    const request: any = {};
    request.roleId = Number(this.roleId);
    request.userId = this.userId;
    request.pageIndex = this.assignmentSourcePage;
    request.size = this.assignmentSourceSize;
    request.searchValue = this.assignmentSourceSearchValue;
    request.roleType = (this.roleType);

    if (this.assignmentSourceType === 'Campaign Assigned') {
      request.requestType = 3;
    } else if (this.assignmentSourceType === 'Shared by RM') {
      request.requestType = 1;
    } else if (this.assignmentSourceType === 'Assigned by Peer') {
      request.requestType = 2;
    } else {
      return;
    }

    this.assignmentSourceLoading = true;
    this.msmeService.getAssignmentSource(request).subscribe(res => {
      this.assignmentSourceLoading = false;
      if (res && res.status === 200 && res.data) {
        this.assignmentSourceTotal = res.data.totalRecords;

        if (this.assignmentSourceType === 'Campaign Assigned') {
          const newOptions = res.data.filterOptions.map(opt => ({ name: opt.name, value: opt.value }));
          this.campaignFilter.optionFilter = reset ? newOptions : [...this.campaignFilter.optionFilter, ...newOptions];
          this.campaignFilter.optionFilter = Array.from(
            new Map(this.campaignFilter.optionFilter.map(item => [item.value, item])).values()
          );
          if (selectAll) {
            this.onAssignmentSourceCampaignChange(fakeEvent, '-1');
          }
        } else {
          // Map for Peer/Shared
          const mappedOptions = res.data.filterOptions.map(opt => ({
            empCode: opt.value,
            firstName: opt.name,
            value: opt.value,
            name: opt.name
          }));
          this.peerFilter.optionFilter = reset ? mappedOptions : [...this.peerFilter.optionFilter, ...mappedOptions];
          this.peerFilter.optionFilter = Array.from(
            new Map(this.peerFilter.optionFilter.map(item => [item.value, item])).values()
          );
          if (selectAll) {
            this.onAssignmentSourcePeerChange(fakeEvent, '-1');
          }

        }
      }
    }, err => {
      this.assignmentSourceLoading = false;
      console.error("Error fetching assignment sources", err);
    });
  }

  onAssignmentSourceScroll(event: any) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 5; // buffer
    if (atBottom && !this.assignmentSourceLoading) {
      const currentCount = (this.assignmentSourceType === 'Campaign Assigned')
        ? this.campaignFilter.optionFilter.length
        : this.peerFilter.optionFilter.length;

      if (currentCount < this.assignmentSourceTotal) {
        this.assignmentSourcePage++;
        this.fetchAssignmentSources(false, false);
      }
    }
  }

  onAssignmentSourceSearch(searchValue: string) {
    this.assignmentSourceSearchValue = searchValue;

    if (!searchValue || searchValue.trim() === '') {
      if (this.assignmentSourceType === 'Campaign Assigned') {
        this.campaignFilter.selectedFilter = [];
      } else if (this.assignmentSourceType === 'Assigned by Peer' || this.assignmentSourceType === 'Shared by RM') {
        this.peerFilter.selectedFilter = [];
      }
      // Also apply to clear the grid immediately
      this.applyAssignmentSourceFilter();
    } else {
      if (this.assignmentSourceType === 'Campaign Assigned') {
        this.campaignFilter.selectedFilter = [];
      } else if (this.assignmentSourceType === 'Assigned by Peer' || this.assignmentSourceType === 'Shared by RM') {
        this.peerFilter.selectedFilter = [];
      }
    }

    // Debounce is ideal, but for now direct call or relies on ngModelChange debounce if implemented.
    // Since this is triggered by ngModelChange, we might want to manually debounce if not controlled by subject.
    // But for simplicity/requirement "handle search", we'll call reset.
    // Ideally put this in a subject like 'searchValueChanged' but distinguishing from the TopBar ones.
    this.fetchAssignmentSources(true, false);
  }

  onAssignmentSourceCampaignChange(event: any, value: any) {
    const stringVal = String(value);
    if (stringVal === '-1' || stringVal === 'All') {
      if (event.checked) {
        this.campaignFilter.selectedFilter = ['All'];
      } else {
        this.campaignFilter.selectedFilter = [];
      }
    }
    if (this.campaignFilter.selectedFilter.includes('-1') || this.campaignFilter.selectedFilter.includes('All')) {
      // this.campaignFilter.selectedFilter = [];
      this.campaignFilter.selectedFilter = this.campaignFilter.optionFilter
        .map(opt => opt.value)
        .filter(val => String(val) !== '-1' && String(val) !== 'All');
    }
    this.onCheckboxChangeTopBar(event, value, this.campaignFilter);

    const allValues = this.campaignFilter.optionFilter
      .map(opt => opt.value)
      .filter(val => String(val) !== '-1' && String(val) !== 'All');
    const selectedValues = this.campaignFilter.selectedFilter
      .filter(val => String(val) !== '-1' && String(val) !== 'All');

    if (allValues.length > 0 && allValues.length === selectedValues.length) {
      if (!this.campaignFilter.selectedFilter.includes('All')) {
        this.campaignFilter.selectedFilter = ['-1', ...selectedValues];
      }
    }
    this.applyAssignmentSourceFilter();
  }

  onAssignmentSourcePeerChange(event: any, empCode: any) {
    const stringVal = String(empCode);
    if (stringVal === '-1' || stringVal === 'All') {
      if (event.checked) {
        this.peerFilter.selectedFilter = ['-1'];
      } else {
        this.peerFilter.selectedFilter = [];
      }
    }
    if (this.peerFilter.selectedFilter.includes('-1') || this.peerFilter.selectedFilter.includes('All')) {
      // this.peerFilter.selectedFilter = [];
      this.peerFilter.selectedFilter = this.peerFilter.optionFilter
        .map(opt => opt.empCode)
        .filter(val => String(val) !== '-1' && String(val) !== 'All');
    }
    this.onCheckboxChangeRmUsers(event, empCode, this.peerFilter, this.peerFilter.selectedFilter);

    const allValues = this.peerFilter.optionFilter
      .map(opt => opt.empCode)
      .filter(val => String(val) !== '-1' && String(val) !== 'All');
    const selectedValues = this.peerFilter.selectedFilter
      .filter(val => String(val) !== '-1' && String(val) !== 'All');

    if (allValues.length > 0 && allValues.length === selectedValues.length) {
      if (!this.peerFilter.selectedFilter.includes('-1')) {
        this.peerFilter.selectedFilter = ['-1', ...selectedValues];
      }
    }
    this.applyAssignmentSourceFilter();
  }

  applyAssignmentSourceFilter() {
    this.assignmentSourceFilter.type = this.assignmentSourceType;
    this.assignmentSourceFilter.selectedValues = [];

    if (this.assignmentSourceType === 'Campaign Assigned') {
      this.assignmentSourceFilter.selectedValues = this.campaignFilter.selectedFilter;
    } else if (this.assignmentSourceType === 'Assigned by Peer' || this.assignmentSourceType === 'Shared by RM') {
      this.assignmentSourceFilter.selectedValues = this.peerFilter.selectedFilter;
    }
    this.getCustomerList();
  }

  resetAssignmentSourceFilter() {
    this.assignmentSourceType = '';
    this.assignmentSourceFilter = { type: null, selectedValues: [] };
    this.campaignFilter = { searchValue: '', optionFilter: [], selectedFilter: [], name: 'Campaign' };
    this.peerFilter = { searchValue: '', optionFilter: [], selectedFilter: [], name: 'RM' };
    // this.getCustomerList();
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getCustomerList(page, true);
  }

  // Method to get value of a specific control
  getControlValue(controlName: string) {
    return this.searchForm.get(controlName)?.value;
  }

  getCustomerList(page?, onPageChangeFlag?: boolean, type?: any, skipGlobalLoader?: boolean): void {
    this.totalSize = 0;
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    const formValues = this.searchForm.value;
    let request: any = {};
    request["type"] = 'TARGET';
    var json = this.applyFilter(true, type);
    this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_TARGET, JSON.stringify(json));
    this.commonService.setStorageAesEncryption(this.constants.SELECTED_COLUMNS_TARGET, JSON.stringify(this.selectedColumns));
    // delete json["persona"];
    request.filterJson = JSON.stringify(json);
    request.isNewFilter = this.isNewFilter;
    console.log(request)
    this.saveAppliedFilter();
    request.requestedFields = this.requestedFields;
    // Always show table subloader (app-sub-loader listens to LoaderService)
    this.loaderService.subLoaderShow();
    this.msmeService.getCustomer(request, true).subscribe((response: any) => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      this.isLoadingSubject.next(false);
      console.log(response);
      if (response.status == 200) {
        if (this.isNewFilter) {
          let parseResponse = JSON.parse(response?.data);
          this.customerList = parseResponse.data
          this.totalSize = parseResponse.counts;
        } else {
          let parseResponse = JSON.parse(response?.data?.result);
          this.customerList = JSON.parse(parseResponse.data);
          this.totalSize = parseResponse.counts;
        }

        this.empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
        console.log("empcode===>", this.empCode)

        this.userType = this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true);
        console.log("userType===>", this.userType)

         const customerTypeValueToName = (value: number): string | undefined => {
          return this.customerTypesListTemp.find(item => item.value === value)?.label;
        };


        this.customerList = this.customerList.map((cust: any) => {
          if (cust.rmId == this.empCode) {
            cust.disableAssignButtonForSharedrm = false;
          }
          else {
            cust.disableAssignButtonForSharedrm = true;
          }
          cust.customerTypeStr = customerTypeValueToName(cust.customerType);

          return cust;
        })

        console.log("updated customer list ===>", this.customerList);

        this.showAssignmentSourceColumn = this.customerList.some(cust =>
          (cust.assignmentSource) ||
          (cust.campaignName) ||
          (cust.rmId && cust.rmId !== this.empCode)
        );


        console.log("updated customer list ===>", this.customerList);

        this.updateTransformedCustomer();

      }
      else {
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
    // this.isSubPersonaSelected = false;
  }

  isDisabled(customer: any): boolean {
    if (this.roleId == 5) return false;  // Super Admin → always enabled
    return customer.disableAssignButtonForSharedrm === true;
    // true → User is NOT primary RM → disable
  }

  viewAuditPage(customer: any, type: any) {
    this.commonService.setStorage('auditType', type);
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXISTING_TARGET");
    const routerData = { pan: customer.panNo, tabId: 2, apiType: AuditAPIType.API_AUDIT }; // Data to pass

    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
  }

  saveAppliedFilter() {
    this.saveFilterListMaster();
    if (this.topBarFilters && this.topBarFilters.length > 0) {
      let topBarFiler = {};
      // Do not persist Area so when user navigates to another tab and back, Area is reset and all records show
      const filtersToSave = this.topBarFilters.map(f => {
        if (f.name === 'Area') {
          return { ...f, selectedFilter: [], optionFilter: [] };
        }
        return f;
      });
      topBarFiler["topBarFilters"] = filtersToSave;
      topBarFiler["rmUserFilter"] = this.rmUserFilter;
      topBarFiler["inCatFilter"] = this.inCatFilter;
      this.commonService.setStorageAesEncryption(this.constants.TOP_BAR_FILTER_LIST_TARGET, JSON.stringify(topBarFiler));
    }

  }

  saveFilterListMaster() {
    // Only save if filterListMaster has data
    if (this.filterListMaster && this.filterListMaster.length > 0) {
      this.commonService.setStorageAesEncryption(this.constants.FILTER_LIST_MASTER_TARGET, JSON.stringify(this.filterListMaster));
    }
  }

  navigateToViewComponent(panNo: string, cin: string) {
    GlobalHeaders['x-page-data'] = panNo;
    GlobalHeaders['x-page-action'] = 'View Portfolio';
    this.pageData.isCustomerTypeInActive = this.isCustomerTypeInActive;
    saveActivity(() => { });
    // Tab id 1 for existing tab, 2 for targer prospect
    // const routerData = { pan: panNo,tabId:2 , pageDetails:this.pageData }; // Data to pass
    const routerData = { pan: panNo, tabId: 2, cin: cin, pageDetails: this.pageData, customerTypeTempId: Constants.CustomerType.TARGET };// Data to pass
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: this.pageData, dataFrom: this.pageData, isFromParentPage: true } });
  }

  navigateToFindProspectComponent() {
    let pageData;
    for (const subpage of this.pageData?.subSubpages) {
      if (subpage.subpageId === Constants.pageMaster.FIND_PROSPECT) {
        pageData = subpage;
      }
    }
    this.router.navigate([pageData?.routeLink], { state: { data: pageData, isNewFilter: this.isNewFilter } });
  }

  deleteCustomer(id: number) {
    this.disableDeleteButton = true;
    this.msmeService.deleteCustomer(id, Number(this.roleId)).subscribe((response: any) => {
      if (response.status == 200) {
        this.getCustomerList();
        this.commonService.successSnackBar('Customer deleted Successfully');
      } else {
        this.commonService.errorSnackBar(response.message)
      }
      this.disableDeleteButton = false;
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
      this.disableDeleteButton = false;
    })
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
    if (this.currentSortField != column) {
      this.currentSortField = column;
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
    this.resetAssignmentSourceFilter();
    this.currentSortField = null;
    this.searchForm.reset({
      applicationCode: '',
      name: '',
      opportunity: '',
      personaUpper: '',
      preApproved: ''
    });
    // Manually trigger change detection
    console.log(this.searchForm);
    this.commonService.removeStorage(this.constants.FILTER_JSON_TARGET);
    this.commonService.removeStorage(this.constants.SELECTED_COLUMNS_TARGET);
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

  getTopbarSearchListFromApi(topBarFilter: TopBarFilter) {
    this.existingProspectsDropDownService.getTopbarSearchListFromApi(topBarFilter);
  }

  applySavedFilter(filterJson) {
    // Use emitEvent: false to prevent triggering valueChanges subscription
    this.searchForm.controls.applicationCode.patchValue(filterJson.code, { emitEvent: false });
    if (filterJson.personaUpper) {
      this.searchForm.controls.personaUpper.patchValue(filterJson.personaUpper, { emitEvent: false });
    }
    this.searchForm.controls.name.patchValue(filterJson.name, { emitEvent: false });
    this.searchForm.controls.opportunity.patchValue(filterJson.opportunity, { emitEvent: false });
    this.searchForm.controls.preApproved.patchValue(filterJson.preApproved, { emitEvent: false });
    this.pageSize = filterJson.paginationTO;
    this.page = (filterJson.paginationFROM / this.pageSize) + 1;
    this.currentSortField = filterJson["sortField"];
    this.sortDirection = filterJson["sortDirection"];

    if (filterJson.rmUsers && filterJson.rmUsers.length > 0) {
      this.selectedRmUsers = filterJson.rmUsers;
    }

    if (filterJson.assignmentSourceType) {
      this.assignmentSourceType = filterJson.assignmentSourceType;
      this.assignmentSourceFilter.type = filterJson.assignmentSourceType;

      if (this.assignmentSourceType === 'Campaign Assigned' && filterJson.campaigns) {
        this.campaignFilter.selectedFilter = filterJson.campaigns;
        this.assignmentSourceFilter.selectedValues = filterJson.campaigns;
      } else if ((this.assignmentSourceType === 'Assigned by Peer' || this.assignmentSourceType === 'Shared by RM') && filterJson.peers) {
        this.peerFilter.selectedFilter = filterJson.peers;
        this.assignmentSourceFilter.selectedValues = filterJson.peers;
      }

      if (this.assignmentSourceType !== 'Self-Assigned') {
        this.fetchAssignmentSources(true);
      }
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
    this.commonService.removeStorage(this.constants.TOP_BAR_FILTER_LIST_TARGET);
    // Clear all applied and pending filter selections so both reset buttons fully reset filters
    this.selectedItemsMap = {};
    this.appliedLocationSelection = [];
    this.appliedAreaSelection = [];
    this.selectedRmUsers = [];
    this.previousCitySelection = [];
    this.previousLocationSelection = [];
    this.allLocationData = [];
    this.originalLocationData = [];
    this.allAreaData = [];
    this.originalAreaData = [];
    this.isCityApiCalled = false;

    this.topBarFilters.forEach(f1 => {
      f1.selectedFilter = [];
      f1.searchValue = '';
    });
    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';

    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });
    this.getTopBarFilter(true); // true = ignoreLoader, avoid main loader
    this.getCustomerList();
  }

  applyFilter(isCallApi?, type?: any,totalSize?: any) {
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
    // this.filterJson = JSON.parse(JSON.parse(this.commonService.getStorageAesEncryption(this.constants.FILTER_JSON_TARGET)));
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

    finalFilterJson["catOrAnd"] = this.catOrAnd;

    if (this.getControlValue("parentCompanyName") != null && this.getControlValue("parentCompanyName") != undefined && this.getControlValue("parentCompanyName") != "") {
      this.toggleHide = false;
      finalFilterJson["parentCompanyName"] = this.getControlValue("parentCompanyName");
    }
    if (this.getControlValue("globalRm") != null && this.getControlValue("globalRm") != undefined && this.getControlValue("globalRm") != "") {
      this.toggleHide = false;
      finalFilterJson["globalRm"] = this.getControlValue("globalRm");
    }
    if (this.getControlValue("country") != null && this.getControlValue("country") != undefined && this.getControlValue("country") != "") {
      this.toggleHide = false;
      finalFilterJson["countriess"] = this.getControlValue("country");
    }
    if (this.getControlValue("campaignName") != null && this.getControlValue("campaignName") != undefined && this.getControlValue("campaignName") != "") {
      this.toggleHide = false;
      finalFilterJson["campaignName"] = this.getControlValue("campaignName");
    }

    if (this.getControlValue("personaUpper")) {
      finalFilterJson["mainPersona"] = this.personaMap[this.getControlValue("personaUpper")].group,
        finalFilterJson["subPersona"] = this.personaMap[this.getControlValue("personaUpper")].option
    }
    finalFilterJson["personaUpper"] = this.getControlValue("personaUpper");
    const formValues = this.searchForm.value;
    if (formValues.name) {
      finalFilterJson['name'] = formValues.name;
    }
    if (formValues.applicationCode) {
      finalFilterJson['code'] = formValues.applicationCode;
    }
    if (formValues.preApproved != null && formValues.preApproved != undefined && formValues.preApproved != "") {
      this.toggleHidePreApp = false;
      finalFilterJson['preApproved'] = formValues.preApproved;
    }
    finalFilterJson["type"] = this.constants.CustomerType.TARGET;
    finalFilterJson["paginationTO"] = (totalSize != null) ? totalSize : this.pageSize;
    finalFilterJson["paginationFROM"] = (totalSize != null) ? 0 : (this.page - 1) * this.pageSize;
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
        if (f1.name == 'City' && type === 'City') {
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
          if (type === 'Location') {
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

    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        if (f1.name == 'City') {
          if (isCallApi && f1.isCallApi && f1.isApiCalled == false) {
            this.isCityApiCalled = true;
            // this.getPincodeFromCity(f1?.selectedFilter);
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



    if (this.assignmentSourceFilter.type) {
      finalFilterJson["assignmentSourceType"] = this.assignmentSourceFilter.type;
      if (this.assignmentSourceFilter.selectedValues && this.assignmentSourceFilter.selectedValues.length > 0) {
        const filteredValues = this.assignmentSourceFilter.selectedValues.includes('-1') && !this.assignmentSourceSearchValue?.length
          ? [-1]
          : this.assignmentSourceFilter.selectedValues.filter(val => val !== '-1');
        // const filteredValues = this.assignmentSourceFilter.selectedValues.filter(val => val !== 'All');
        if (filteredValues.length > 0) {
          if (this.assignmentSourceFilter.type === 'Campaign Assigned') {
            finalFilterJson["campaigns"] = filteredValues;
          } else if (this.assignmentSourceFilter.type === 'Assigned by Peer' || this.assignmentSourceFilter.type === 'Shared by RM') {
            finalFilterJson["peers"] = filteredValues;
          }
        }
      }
    }

    console.log(finalFilterJson);
    return finalFilterJson;
  }


  isCityApiCalled: boolean = false;
  isLocationApiCalled: boolean = false;
  getPincodeFromCity(cityList) {
    let req: any = { cityList: cityList };
    this.msmeService.getPincodeByCity(req).subscribe(
      (response: any) => {
        if (response && response.status == 200 && response.data) {
          const i = this.topBarFilters.findIndex((x) => x.name === "Pincode");
          /*let list  = [];
          response.data.forEach(element => {
            let req:any= {};
            req.name = element;
            req.name = element;
            req.selected = false;
            list.push(req);
          });
          topBarFilter.optionFilter = response.data;*/
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

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }
    return false; // Return false if not found
  }

  onCheckboxChangeRmUsers(event: any, rmEmpCode: string, rmUserFilter: TopBarFilter, selectedList?: any[]) {
    const targetList = selectedList || this.selectedRmUsers;
    this.existingProspectsDropDownService.onCheckboxChangeRmUsers(event, rmEmpCode, rmUserFilter, targetList);

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
  getTopBarFilter(ignoreLoader?: boolean) {
    this.msmeService.getTopBarFilter("Target", ignoreLoader).subscribe((response: any) => {
      // response = {"message":"Processed successfully","data":{"filters":[{"topBarFilterType":"CITY","name":"City","spKeyName":"cities","isCallApi":true,"isApiCallSearch":false,"options":[{"name":"Agra","value":47,"selected":false,"sno":1},{"name":"Ahmedabad HQ","value":12,"selected":false,"sno":2},{"name":"Ajmer","value":40,"selected":false,"sno":3},{"name":"Ambala HQ","value":15,"selected":false,"sno":4},{"name":"Aurangabad","value":28,"selected":false,"sno":5},{"name":"Bangalore HQ","value":19,"selected":false,"sno":6},{"name":"Bareilly","value":49,"selected":false,"sno":7},{"name":"Calcutta","value":54,"selected":false,"sno":8},{"name":"Chandigarh HQ","value":38,"selected":false,"sno":9},{"name":"Chandigarh Region","value":39,"selected":false,"sno":10},{"name":"Chennai Region","value":43,"selected":false,"sno":11},{"name":"Coimbatore","value":44,"selected":false,"sno":12},{"name":"Delhi","value":11,"selected":false,"sno":13},{"name":"Goa-Panaji","value":29,"selected":false,"sno":14},{"name":"Gorakhpur","value":50,"selected":false,"sno":15},{"name":"Guwahati HQ","value":7,"selected":false,"sno":16},{"name":"Hyderabad","value":1,"selected":false,"sno":17},{"name":"Hyderabad City","value":2,"selected":false,"sno":18},{"name":"Indore","value":27,"selected":false,"sno":19},{"name":"Jaipur HQ","value":41,"selected":false,"sno":20},{"name":"Kanpur","value":51,"selected":false,"sno":21},{"name":"Kochi","value":23,"selected":false,"sno":22},{"name":"Lucknow HQ","value":52,"selected":false,"sno":23},{"name":"Mumbai","value":30,"selected":false,"sno":24},{"name":"Nagpur","value":31,"selected":false,"sno":25},{"name":"North Eastern","value":33,"selected":false,"sno":26},{"name":"North Karnataka","value":20,"selected":false,"sno":27},{"name":"Pune","value":32,"selected":false,"sno":28},{"name":"Raipur","value":10,"selected":false,"sno":29},{"name":"Rajkot","value":13,"selected":false,"sno":30},{"name":"Ranchi","value":18,"selected":false,"sno":31},{"name":"Sambalpur","value":37,"selected":false,"sno":32},{"name":"Shimla HQ","value":16,"selected":false,"sno":33},{"name":"South Bengal","value":57,"selected":false,"sno":34},{"name":"Srinagar HQ","value":17,"selected":false,"sno":35},{"name":"Tiruchy","value":46,"selected":false,"sno":36},{"name":"Trivandrum HQ","value":24,"selected":false,"sno":37},{"name":"Vadodara","value":14,"selected":false,"sno":38},{"name":"Vijayawada","value":4,"selected":false,"sno":39},{"name":"Visakhapatnam","value":5,"selected":false,"sno":40}]},{"topBarFilterType":"LOCATION","name":"Location","spKeyName":"location","isCallApi":false,"isApiCallSearch":false,"options":[]},{"topBarFilterType":"AREA","name":"Area","spKeyName":"Area","isCallApi":false,"isApiCallSearch":false,"options":null},{"topBarFilterType":"CATEGORY","name":"Category","spKeyName":"Category","isCallApi":false,"isApiCallSearch":false,"options":[{"name":"All","value":"All","selected":false,"sno":-1},{"name":"not_categorized","value":"not_categorized","selected":false,"sno":1},{"name":"AGRI","value":"AGRI","selected":false,"sno":2},{"name":"FPO","value":"FPO","selected":false,"sno":3},{"name":"GCC","value":"GCC","selected":false,"sno":4},{"name":"PEVC","value":"PEVC","selected":false,"sno":5},{"name":"mnc-etg","value":"mnc-etg","selected":false,"sno":6},{"name":"SEZ","value":"SEZ","selected":false,"sno":7},{"name":"mnc-ntg","value":"mnc-ntg","selected":false,"sno":8},{"name":"anchor-relationship","value":"anchor-relationship","selected":false,"sno":9},{"name":"EXIM","value":"EXIM","selected":false,"sno":10},{"name":"ITITES","value":"ITITES","selected":false,"sno":11},{"name":"FCRN","value":"FCRN","selected":false,"sno":12},{"name":"STPI","value":"STPI","selected":false,"sno":13}]},{"topBarFilterType":"COUNTRY","name":"Countries","spKeyName":"Countries","isCallApi":false,"isApiCallSearch":false,"options":[{"name":"All","value":"All","selected":false,"sno":-1},{"name":"Afghanistan","value":0,"selected":false,"sno":14},{"name":"Aland Islands","value":74,"selected":false,"sno":15},{"name":"Albania","value":2,"selected":false,"sno":16},{"name":"Algeria","value":4,"selected":false,"sno":17},{"name":"American Samoa","value":5,"selected":false,"sno":18},{"name":"Andorra","value":6,"selected":false,"sno":19},{"name":"Angola","value":7,"selected":false,"sno":20},{"name":"Anguilla","value":189,"selected":false,"sno":21},{"name":"Antarctica","value":3,"selected":false,"sno":22},{"name":"Antigua and Barbuda","value":8,"selected":false,"sno":23},{"name":"Argentina","value":10,"selected":false,"sno":24},{"name":"Armenia","value":16,"selected":false,"sno":25},{"name":"Aruba","value":153,"selected":false,"sno":26},{"name":"Australia","value":11,"selected":false,"sno":27},{"name":"Austria","value":12,"selected":false,"sno":28},{"name":"Azerbaijan","value":9,"selected":false,"sno":29},{"name":"Bahamas","value":13,"selected":false,"sno":30},{"name":"Bahrain","value":14,"selected":false,"sno":31},{"name":"Bangladesh","value":15,"selected":false,"sno":32},{"name":"Barbados","value":17,"selected":false,"sno":33},{"name":"Belarus","value":34,"selected":false,"sno":34},{"name":"Belgium","value":18,"selected":false,"sno":35},{"name":"Belize","value":26,"selected":false,"sno":36},{"name":"Benin","value":59,"selected":false,"sno":37},{"name":"Bermuda","value":19,"selected":false,"sno":38},{"name":"Bhutan","value":20,"selected":false,"sno":39},{"name":"Bolivia (Plurinational State of)","value":21,"selected":false,"sno":40},{"name":"Bonaire, Sint Eustatius and Saba","value":155,"selected":false,"sno":41},{"name":"Bosnia and Herzegovina","value":22,"selected":false,"sno":42},{"name":"Botswana","value":23,"selected":false,"sno":43},{"name":"Bouvet Island","value":24,"selected":false,"sno":44},{"name":"Brazil","value":25,"selected":false,"sno":45},{"name":"British Indian Ocean Territory","value":27,"selected":false,"sno":46},{"name":"Brunei Darussalam","value":30,"selected":false,"sno":47},{"name":"Bulgaria","value":31,"selected":false,"sno":48},{"name":"Burkina Faso","value":241,"selected":false,"sno":49},{"name":"Burundi","value":33,"selected":false,"sno":50},{"name":"Cabo Verde","value":38,"selected":false,"sno":51},{"name":"Cambodia","value":35,"selected":false,"sno":52},{"name":"Cameroon","value":36,"selected":false,"sno":53},{"name":"Canada","value":37,"selected":false,"sno":54},{"name":"Cayman Islands","value":39,"selected":false,"sno":55},{"name":"Central African Republic","value":40,"selected":false,"sno":56},{"name":"Chad","value":42,"selected":false,"sno":57},{"name":"Chile","value":43,"selected":false,"sno":58},{"name":"China","value":44,"selected":false,"sno":59},{"name":"Christmas Island","value":46,"selected":false,"sno":60},{"name":"Cocos (Keeling) Islands","value":47,"selected":false,"sno":61},{"name":"Colombia","value":48,"selected":false,"sno":62},{"name":"Comoros","value":49,"selected":false,"sno":63},{"name":"Congo","value":51,"selected":false,"sno":64},{"name":"Congo (the Democratic Republic of the)","value":52,"selected":false,"sno":65},{"name":"Cook Islands","value":53,"selected":false,"sno":66},{"name":"Costa Rica","value":54,"selected":false,"sno":67},{"name":"Cote d'Ivoire","value":110,"selected":false,"sno":68},{"name":"Croatia","value":55,"selected":false,"sno":69},{"name":"Cuba","value":56,"selected":false,"sno":70},{"name":"Curacao","value":152,"selected":false,"sno":71},{"name":"Cyprus","value":57,"selected":false,"sno":72},{"name":"Czechia","value":58,"selected":false,"sno":73},{"name":"Denmark","value":60,"selected":false,"sno":74},{"name":"Djibouti","value":79,"selected":false,"sno":75},{"name":"Dominica","value":61,"selected":false,"sno":76},{"name":"Dominican Republic","value":62,"selected":false,"sno":77},{"name":"Ecuador","value":63,"selected":false,"sno":78},{"name":"Egypt","value":233,"selected":false,"sno":79},{"name":"El Salvador","value":64,"selected":false,"sno":80},{"name":"Equatorial Guinea","value":65,"selected":false,"sno":81},{"name":"Eritrea","value":67,"selected":false,"sno":82},{"name":"Estonia","value":68,"selected":false,"sno":83},{"name":"Eswatini","value":214,"selected":false,"sno":84},{"name":"Ethiopia","value":66,"selected":false,"sno":85},{"name":"Falkland Islands [Malvinas]","value":70,"selected":false,"sno":86},{"name":"Faroe Islands","value":69,"selected":false,"sno":87},{"name":"Fiji","value":72,"selected":false,"sno":88},{"name":"Finland","value":73,"selected":false,"sno":89},{"name":"France","value":75,"selected":false,"sno":90},{"name":"French Guiana","value":76,"selected":false,"sno":91},{"name":"French Polynesia","value":77,"selected":false,"sno":92},{"name":"French Southern Territories","value":78,"selected":false,"sno":93},{"name":"Gabon","value":80,"selected":false,"sno":94},{"name":"Gambia","value":82,"selected":false,"sno":95},{"name":"Georgia","value":81,"selected":false,"sno":96},{"name":"Germany","value":84,"selected":false,"sno":97},{"name":"Ghana","value":85,"selected":false,"sno":98},{"name":"Gibraltar","value":86,"selected":false,"sno":99},{"name":"Greece","value":88,"selected":false,"sno":100},{"name":"Greenland","value":89,"selected":false,"sno":101},{"name":"Grenada","value":90,"selected":false,"sno":102},{"name":"Guadeloupe","value":91,"selected":false,"sno":103},{"name":"Guam","value":92,"selected":false,"sno":104},{"name":"Guatemala","value":93,"selected":false,"sno":105},{"name":"Guernsey","value":235,"selected":false,"sno":106},{"name":"Guinea","value":94,"selected":false,"sno":107},{"name":"Guinea-Bissau","value":179,"selected":false,"sno":108},{"name":"Guyana","value":95,"selected":false,"sno":109},{"name":"Haiti","value":96,"selected":false,"sno":110},{"name":"Heard Island and McDonald Islands","value":97,"selected":false,"sno":111},{"name":"Holy See","value":98,"selected":false,"sno":112},{"name":"Honduras","value":99,"selected":false,"sno":113},{"name":"Hong Kong","value":100,"selected":false,"sno":114},{"name":"Hungary","value":101,"selected":false,"sno":115},{"name":"Iceland","value":102,"selected":false,"sno":116},{"name":"India","value":103,"selected":false,"sno":117},{"name":"Indonesia","value":104,"selected":false,"sno":118},{"name":"Iran (Islamic Republic of)","value":105,"selected":false,"sno":119},{"name":"Iraq","value":106,"selected":false,"sno":120},{"name":"Ireland","value":107,"selected":false,"sno":121},{"name":"Isle of Man","value":237,"selected":false,"sno":122},{"name":"Israel","value":108,"selected":false,"sno":123},{"name":"Italy","value":109,"selected":false,"sno":124},{"name":"Jamaica","value":111,"selected":false,"sno":125},{"name":"Japan","value":112,"selected":false,"sno":126},{"name":"Jersey","value":236,"selected":false,"sno":127},{"name":"Jordan","value":114,"selected":false,"sno":128},{"name":"Kazakhstan","value":113,"selected":false,"sno":129},{"name":"Kenya","value":115,"selected":false,"sno":130},{"name":"Kiribati","value":87,"selected":false,"sno":131},{"name":"Korea (the Democratic People's Republic of)","value":116,"selected":false,"sno":132},{"name":"Korea (the Republic of)","value":117,"selected":false,"sno":133},{"name":"Kuwait","value":118,"selected":false,"sno":134},{"name":"Kyrgyzstan","value":119,"selected":false,"sno":135},{"name":"Lao People's Democratic Republic","value":120,"selected":false,"sno":136},{"name":"Latvia","value":123,"selected":false,"sno":137},{"name":"Lebanon","value":121,"selected":false,"sno":138},{"name":"Lesotho","value":122,"selected":false,"sno":139},{"name":"Liberia","value":124,"selected":false,"sno":140},{"name":"Libya","value":125,"selected":false,"sno":141},{"name":"Liechtenstein","value":126,"selected":false,"sno":142},{"name":"Lithuania","value":127,"selected":false,"sno":143},{"name":"Luxembourg","value":128,"selected":false,"sno":144},{"name":"Macao","value":129,"selected":false,"sno":145},{"name":"Madagascar","value":130,"selected":false,"sno":146},{"name":"Malawi","value":131,"selected":false,"sno":147},{"name":"Malaysia","value":132,"selected":false,"sno":148},{"name":"Maldives","value":133,"selected":false,"sno":149},{"name":"Mali","value":134,"selected":false,"sno":150},{"name":"Malta","value":135,"selected":false,"sno":151},{"name":"Marshall Islands","value":168,"selected":false,"sno":152},{"name":"Martinique","value":136,"selected":false,"sno":153},{"name":"Mauritania","value":137,"selected":false,"sno":154},{"name":"Mauritius","value":138,"selected":false,"sno":155},{"name":"Mayotte","value":50,"selected":false,"sno":156},{"name":"Mexico","value":139,"selected":false,"sno":157},{"name":"Micronesia (Federated States of)","value":167,"selected":false,"sno":158},{"name":"Moldova (the Republic of)","value":142,"selected":false,"sno":159},{"name":"Monaco","value":140,"selected":false,"sno":160},{"name":"Mongolia","value":141,"selected":false,"sno":161},{"name":"Montenegro","value":143,"selected":false,"sno":162},{"name":"Montserrat","value":144,"selected":false,"sno":163},{"name":"Morocco","value":145,"selected":false,"sno":164},{"name":"Mozambique","value":146,"selected":false,"sno":165},{"name":"Myanmar","value":32,"selected":false,"sno":166},{"name":"Namibia","value":148,"selected":false,"sno":167},{"name":"Nauru","value":149,"selected":false,"sno":168},{"name":"Nepal","value":150,"selected":false,"sno":169},{"name":"Netherlands (Kingdom of the)","value":151,"selected":false,"sno":170},{"name":"New Caledonia","value":156,"selected":false,"sno":171},{"name":"New Zealand","value":158,"selected":false,"sno":172},{"name":"Nicaragua","value":159,"selected":false,"sno":173},{"name":"Niger","value":160,"selected":false,"sno":174},{"name":"Nigeria","value":161,"selected":false,"sno":175},{"name":"Niue","value":162,"selected":false,"sno":176},{"name":"Norfolk Island","value":163,"selected":false,"sno":177},{"name":"North Macedonia","value":232,"selected":false,"sno":178},{"name":"Northern Mariana Islands","value":165,"selected":false,"sno":179},{"name":"Norway","value":164,"selected":false,"sno":180},{"name":"Oman","value":147,"selected":false,"sno":181},{"name":"Other","value":99999,"selected":false,"sno":182},{"name":"Pakistan","value":170,"selected":false,"sno":183},{"name":"Palau","value":169,"selected":false,"sno":184},{"name":"Palestine, State of","value":83,"selected":false,"sno":185},{"name":"Panama","value":171,"selected":false,"sno":186},{"name":"Papua New Guinea","value":172,"selected":false,"sno":187},{"name":"Paraguay","value":173,"selected":false,"sno":188},{"name":"Peru","value":174,"selected":false,"sno":189},{"name":"Philippines","value":175,"selected":false,"sno":190},{"name":"Pitcairn","value":176,"selected":false,"sno":191},{"name":"Poland","value":177,"selected":false,"sno":192},{"name":"Portugal","value":178,"selected":false,"sno":193},{"name":"Puerto Rico","value":181,"selected":false,"sno":194},{"name":"Reunion","value":182,"selected":false,"sno":195},{"name":"Romania","value":183,"selected":false,"sno":196},{"name":"Russian Federation","value":184,"selected":false,"sno":197},{"name":"Rwanda","value":185,"selected":false,"sno":198},{"name":"Saint Barthelemy","value":186,"selected":false,"sno":199},{"name":"Saint Helena, Ascension and Tristan da Cunha","value":187,"selected":false,"sno":200},{"name":"Saint Kitts and Nevis","value":188,"selected":false,"sno":201},{"name":"Saint Lucia","value":190,"selected":false,"sno":202},{"name":"Saint Martin (French part)","value":191,"selected":false,"sno":203},{"name":"Saint Pierre and Miquelon","value":192,"selected":false,"sno":204},{"name":"Saint Vincent and the Grenadines","value":193,"selected":false,"sno":205},{"name":"Samoa","value":246,"selected":false,"sno":206},{"name":"San Marino","value":194,"selected":false,"sno":207},{"name":"Sao Tome and Principe","value":195,"selected":false,"sno":208},{"name":"Saudi Arabia","value":196,"selected":false,"sno":209},{"name":"Senegal","value":197,"selected":false,"sno":210},{"name":"Serbia","value":198,"selected":false,"sno":211},{"name":"Seychelles","value":199,"selected":false,"sno":212},{"name":"Sierra Leone","value":200,"selected":false,"sno":213},{"name":"Singapore","value":201,"selected":false,"sno":214},{"name":"Sint Maarten (Dutch part)","value":154,"selected":false,"sno":215},{"name":"Slovakia","value":202,"selected":false,"sno":216},{"name":"Slovenia","value":204,"selected":false,"sno":217},{"name":"Solomon Islands","value":28,"selected":false,"sno":218},{"name":"Somalia","value":205,"selected":false,"sno":219},{"name":"South Africa","value":206,"selected":false,"sno":220},{"name":"South Georgia and the South Sandwich Islands","value":71,"selected":false,"sno":221},{"name":"South Sudan","value":209,"selected":false,"sno":222},{"name":"Spain","value":208,"selected":false,"sno":223},{"name":"Sri Lanka","value":41,"selected":false,"sno":224},{"name":"Sudan","value":210,"selected":false,"sno":225},{"name":"Suriname","value":212,"selected":false,"sno":226},{"name":"Svalbard and Jan Mayen","value":213,"selected":false,"sno":227},{"name":"Sweden","value":215,"selected":false,"sno":228},{"name":"Switzerland","value":216,"selected":false,"sno":229},{"name":"Syrian Arab Republic","value":217,"selected":false,"sno":230},{"name":"Taiwan (Province of China)","value":45,"selected":false,"sno":231},{"name":"Tajikistan","value":218,"selected":false,"sno":232},{"name":"Tanzania, the United Republic of","value":238,"selected":false,"sno":233},{"name":"Thailand","value":219,"selected":false,"sno":234},{"name":"Timor-Leste","value":180,"selected":false,"sno":235},{"name":"Togo","value":220,"selected":false,"sno":236},{"name":"Tokelau","value":221,"selected":false,"sno":237},{"name":"Tonga","value":222,"selected":false,"sno":238},{"name":"Trinidad and Tobago","value":223,"selected":false,"sno":239},{"name":"Tunisia","value":225,"selected":false,"sno":240},{"name":"Turkiye","value":226,"selected":false,"sno":241},{"name":"Turkmenistan","value":227,"selected":false,"sno":242},{"name":"Turks and Caicos Islands","value":228,"selected":false,"sno":243},{"name":"Tuvalu","value":229,"selected":false,"sno":244},{"name":"Uganda","value":230,"selected":false,"sno":245},{"name":"Ukraine","value":231,"selected":false,"sno":246},{"name":"United Arab Emirates","value":224,"selected":false,"sno":247},{"name":"United Kingdom of Great Britain and Northern Ireland","value":234,"selected":false,"sno":248},{"name":"United States","value":239,"selected":false,"sno":249},{"name":"United States Minor Outlying Islands","value":166,"selected":false,"sno":250},{"name":"Uruguay","value":242,"selected":false,"sno":251},{"name":"Uzbekistan","value":243,"selected":false,"sno":252},{"name":"Vanuatu","value":157,"selected":false,"sno":253},{"name":"Venezuela (Bolivarian Republic of)","value":244,"selected":false,"sno":254},{"name":"Viet Nam","value":203,"selected":false,"sno":255},{"name":"Virgin Islands (British)","value":29,"selected":false,"sno":256},{"name":"Virgin Islands (U.S.)","value":240,"selected":false,"sno":257},{"name":"Wallis and Futuna","value":245,"selected":false,"sno":258},{"name":"Western Sahara*","value":211,"selected":false,"sno":259},{"name":"Yemen","value":247,"selected":false,"sno":260},{"name":"Zambia","value":248,"selected":false,"sno":261},{"name":"Zimbabwe","value":207,"selected":false,"sno":262}]},{"topBarFilterType":"PINCODE","name":"Pincode","spKeyName":"pincodes","isCallApi":false,"isApiCallSearch":false,"options":[]},{"topBarFilterType":"SUBSIDIARYCOUNTRY","name":"SubsidiaryCountry","spKeyName":"Subsidiarycountry","isCallApi":false,"isApiCallSearch":false,"options":[{"name":"All","value":"All","selected":false,"sno":0},{"name":"UK","value":"UK","selected":false,"sno":1},{"name":"USA","value":"USA","selected":false,"sno":2},{"name":"Russia","value":"Russia","selected":false,"sno":3},{"name":"INDIA","value":"INDIA","selected":false,"sno":4},{"name":"West India","value":"West India","selected":false,"sno":5},{"name":"London","value":"London","selected":false,"sno":6},{"name":"South India","value":"South India","selected":false,"sno":7},{"name":"India","value":"India","selected":false,"sno":8},{"name":"Urop","value":"Urop","selected":false,"sno":9},{"name":"123","value":"123","selected":false,"sno":10},{"name":"133","value":"133","selected":false,"sno":11},{"name":"DDS","value":"DDS","selected":false,"sno":12},{"name":"A#$%^","value":"A#$%^","selected":false,"sno":13},{"name":"-","value":"-","selected":false,"sno":14}]},{"topBarFilterType":"SEGMENT","name":"Segment","spKeyName":"segments","isCallApi":false,"isApiCallSearch":false,"options":[{"name":"All","value":"All","selected":false,"sno":-1},{"name":"qa4-test4","value":13,"selected":false,"sno":1},{"name":"qa5-test5","value":14,"selected":false,"sno":2},{"name":"qa6-test6","value":15,"selected":false,"sno":3},{"name":"qa7-test7","value":16,"selected":false,"sno":4},{"name":"qa8-test8","value":17,"selected":false,"sno":5},{"name":"qa9-test9","value":18,"selected":false,"sno":6},{"name":"11-11","value":21,"selected":false,"sno":7},{"name":"789-vastrapur","value":22,"selected":false,"sno":8},{"name":"krunal-krunal1","value":23,"selected":false,"sno":9},{"name":"cmb-bb","value":24,"selected":false,"sno":10},{"name":"-testing","value":27,"selected":false,"sno":11},{"name":"business-business","value":29,"selected":false,"sno":12},{"name":"cb-adad","value":30,"selected":false,"sno":13},{"name":"bb-bb","value":31,"selected":false,"sno":14},{"name":"cb-isb","value":32,"selected":false,"sno":15},{"name":"automation-automation","value":36,"selected":false,"sno":16},{"name":"manual-manual","value":37,"selected":false,"sno":17},{"name":"-qa","value":40,"selected":false,"sno":18},{"name":"cb-dp","value":41,"selected":false,"sno":19},{"name":"-dp1","value":42,"selected":false,"sno":20},{"name":"-d@","value":43,"selected":false,"sno":21},{"name":"-seg1","value":49,"selected":false,"sno":22},{"name":"-seg2","value":50,"selected":false,"sno":23},{"name":"-seg3","value":51,"selected":false,"sno":24},{"name":"-mme","value":52,"selected":false,"sno":25},{"name":"iihkjk-hhg","value":54,"selected":false,"sno":26},{"name":"business-na","value":59,"selected":false,"sno":27},{"name":"docu-ment","value":60,"selected":false,"sno":28},{"name":"tehbdh-segment","value":61,"selected":false,"sno":29},{"name":"deeeeeep-deeeeeeep","value":67,"selected":false,"sno":30},{"name":"testing-testing qa","value":71,"selected":false,"sno":31},{"name":"business1-segment1","value":73,"selected":false,"sno":32},{"name":"hsbc-hsbc","value":81,"selected":false,"sno":33},{"name":"qa555-test555","value":82,"selected":false,"sno":34},{"name":"3-vastrapur12","value":83,"selected":false,"sno":35},{"name":"qa7-test7tetst","value":84,"selected":false,"sno":36},{"name":"aaa-qa4-test4","value":86,"selected":false,"sno":37},{"name":"bar-char","value":89,"selected":false,"sno":38},{"name":"aa-aa","value":91,"selected":false,"sno":39},{"name":"jgudkas-asksdgf","value":93,"selected":false,"sno":40},{"name":"abcdhj-jhcdva","value":94,"selected":false,"sno":41}]}],"rmUsers":[{"firstName":"All","empCode":"All"},{"firstName":"darshitho","empCode":"10020030"},{"firstName":"sahil Patel","empCode":"7676"}],"cityPinCodes":null},"status":200,"flag":null,"isDisplayStatus":null,"isDisplayMessage":null,"isNameMatchFound":null,"isNameMatchTriedExceedMaxLimit":null,"fileBytes":null,"contentInBytes":null,"otherData":null,"statusCode":null};
      if (response && response.status == 200 && response.data) {
        this.rmUserFilter.optionFilter = response?.data?.rmUsers;
        this.inCatFilter.optionFilter = response?.data?.incategory;
        for (let index = 0; index < response?.data?.filters.length; index++) {
          // if (response?.data?.filters[index].name == 'Pincode') {
          //   this.pincodeMaster = response?.data?.filters[index].options;
          //   this.commonService.setStorageAesEncryption("pincodeMaster", JSON.stringify(this.pincodeMaster));
          // }
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
        // Default Location and Area empty; only populate when city/location selected
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
        let index = this.topBarFilters.length;
        // this.getCityLocationPincode(index,null,null);
        console.log('topbar === ', this.topBarFilters);
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
                console.error('Invalid action type:', action);  // Debugging
              }
            }
          }
          this.topBarFilters = topbarFilter;
        }
        console.log(this.topBarFilters);

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
      let topbarFilter = [];
      for (const filter of this.topBarFilters) {
        for (const action of this.pageData.actions) {
          if (typeof action.actionName === 'string') {
            let act = action.actionName.split('_');
            if (act.length > 1) {
              if (filter.name.toUpperCase() === act[act.length - 1].toUpperCase()) {
                topbarFilter.push(filter);
                break; // Found match, move to next filter
              }
            }
          }
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

    // Sync selectedItemsMap from topBarFilters so menu counts and checkboxes show after load (e.g. when returning to page)
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
        // Old logic: Initialize Location data if City is selected
        if (matchingFilter.name === 'Location') {
          const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
          const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;
          // City selected → show list of locations for that city; same pattern as Location → Area below
          if (hasCitySelected) {
            // Restore selection from backup + filter so selected location shows after search → select → Apply → open again
            const fromBackup = [...this.appliedLocationSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const existing = this.selectedItemsMap[opt.filter_name] || [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter, ...existing])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            // Always load full location list when opening (no search) so after search+select+apply, unselected options stay visible.
            this.dependantFilters = [];
            this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
            this.searchByDataHistory[opt.dataset_id].searchValue = '';
            this.searchByDataHistory[opt.dataset_id].isCalled = false;
            this.getLocation(this.topBarFilters[cityIndex].selectedFilter, '', 'City');
          } else {
            // No city selected: show full location list (selected + unselected) when reopening, so user sees all options; when city is selected later, Location clears as usual
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
          // Location selected → show list of areas for that location (same as City → Location)
          if (hasLocationSelected) {
            const fromBackup = [...this.appliedAreaSelection];
            const fromFilter = Array.isArray(matchingFilter.selectedFilter) ? [...matchingFilter.selectedFilter].filter((v: any) => v !== 'All' && v != null) : [];
            const existing = this.selectedItemsMap[opt.filter_name] || [];
            const mergedIds = [...new Set([...fromBackup, ...fromFilter, ...existing])];
            this.selectedItemsMap[opt.filter_name] = mergedIds;
            // Always load full area list when opening (no search) so after search+select+apply, unselected options stay visible.
            this.dependantFilters = [];
            this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
            this.searchByDataHistory[opt.dataset_id].searchValue = '';
            this.searchByDataHistory[opt.dataset_id].isCalled = false;
            this.getLocation(locationListToUse, '', 'Location');
          } else {
            // No location selected: show full area list (selected + unselected) when reopening; when location is selected then Area clears
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
              this.dependantFilters = [];
              this.searchByDataHistory[opt.dataset_id].data = this.dependantFilters;
              this.searchByDataHistory[opt.dataset_id].searchValue = '';
              this.searchByDataHistory[opt.dataset_id].isCalled = false;
              this.getLocation([], '', 'Location');
            }
          }
        } else {
          // Other filters (City, Segment, etc.): Filter out null/undefined; exclude "All" from list
          const validOptions = (matchingFilter.optionFilter || []).filter(
            item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
          );
          this.dependantFilters = validOptions
            .filter(item => item.name !== 'All' && item.value !== 'All')
            .map(item => ({
              key: item.name,
              value: item.value
            }));
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

  /** Ensures selected Location options are in dependantFilters so they show when reopening after search+select+Apply. */
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

  getSelectedCount(filter_name: string): number {
    return this.selectedItemsMap[filter_name]?.length || 0;
  }

  /** Whether the item is selected (uses loose equality so number/string IDs match). */
  isItemSelected(filterName: string, itemValue: any): boolean {
    const list = this.selectedItemsMap[filterName];
    if (!list || !list.length) return false;
    return list.some(id => id === itemValue || id == itemValue || String(id) === String(itemValue));
  }

  /** True if any top bar filter or RM has at least one selection (for enabling Reset button). */
  hasAnyTopBarFilterSelection(): boolean {
    if (this.selectedRmUsers?.length > 0) return true;
    return (this.searchByOptionsTopBar || []).some(opt => this.getSelectedCount(opt.filter_name) > 0);
  }

  onSearchChangeBy(searchValue: string, datasetId: number, datasetName: string) {
    this.searchByDataHistory[datasetId].searchValue = searchValue;
    this.searchByDataHistory[datasetId].isCalled = false;

    const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
    if (matchingFilter) {
      // Old logic: when location null but search 3 letter bottom all list visible
      if (matchingFilter.name === 'Location') {
        const cityIndex = this.topBarFilters.findIndex((x) => x.name === "City");
        const hasCitySelected = cityIndex !== -1 && this.topBarFilters[cityIndex].selectedFilter?.length > 0;


        // If city is not selected
        if (!hasCitySelected) {
          // If search is less than 3 characters, clear the list
          if (!searchValue || searchValue.trim().length < 3) {
            this.dependantFilters = [];
            const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
            if (locationIndex !== -1) {
              this.topBarFilters[locationIndex].optionFilter = [];
            }
            return;
          }
          // If search is 3+ characters, call API to get locations
          const cityList = cityIndex !== -1 ? (this.topBarFilters[cityIndex].selectedFilter || []) : [];
          this.getLocation(cityList, searchValue, 'City');
          return; // Exit early, getLocation will update dependantFilters
        }
      } else if (matchingFilter.name === 'Area') {
        const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
        const locationOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
        const locationFilterName = locationOpt?.filter_name || 'location';
        const pendingLocation = this.selectedItemsMap[locationFilterName] || [];
        const appliedLocation = (locationIndex !== -1 ? this.topBarFilters[locationIndex].selectedFilter : []) || [];
        const hasLocationSelected = pendingLocation.length > 0 || appliedLocation.length > 0;
        const locationListToUse = pendingLocation.length > 0 ? pendingLocation : appliedLocation;


        // If location is not selected
        if (!hasLocationSelected) {
          // If search is less than 3 characters, clear the list
          if (!searchValue || searchValue.trim().length < 3) {
            this.dependantFilters = [];
            const areaIndex = this.topBarFilters.findIndex((x) => x.name === "Area");
            if (areaIndex !== -1) {
              this.topBarFilters[areaIndex].optionFilter = [];
            }
            return;
          }
          // If search is 3+ characters, call API to get areas
          this.getLocation(locationListToUse, searchValue, 'Location');
          return; // Exit early, getLocation will update dependantFilters
        }
      }


      // Filter out null/undefined names so "null" is never displayed; support both name/value and label/id
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

  // No "All" at bottom; "All" is only at top when options available.
  shouldShowAllOptionAtBottom(): boolean {
    return false;
  }

  // Check if all items are selected
  isAllSelected(filterName: string): boolean {
    if (!filterName) return false;
    const selectedItems = this.selectedItemsMap[filterName] || [];
    // When list is empty (e.g. Location with no city), show "All" as selected by default if user has All
    if (!this.dependantFilters || this.dependantFilters.length === 0) {
      return selectedItems.includes('All');
    }
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
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    let citySelectionChanged = false;
    this.searchByOptionsTopBar.forEach(opt => {
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter && this.selectedItemsMap[opt.filter_name]) {
        matchingFilter.selectedFilter = this.selectedItemsMap[opt.filter_name];

        // When City changes: reset Location and Area so user must pick location/area for the new city
        if (matchingFilter.name === 'City') {
          const hasChanged = !this.arraysEqual(matchingFilter.selectedFilter, this.previousCitySelection);
          citySelectionChanged = hasChanged;

          if (matchingFilter.isCallApi) {
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

            this.getLocation(matchingFilter.selectedFilter, null, matchingFilter.name);
            matchingFilter.isApiCalled = true;
            this.previousCitySelection = [...matchingFilter.selectedFilter];
          } else {
            this.isCityApiCalled = false;
          }
        }

        // When Location changes: reset Area so user must pick area for the new location
        if (matchingFilter.name === 'Location') {
          if (citySelectionChanged) {
            matchingFilter.selectedFilter = [];
            this.previousLocationSelection = [];
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
        if (locFilter) {
          locFilter.selectedFilter = [...menuSelection];
        }
        this.appliedLocationSelection = [...menuSelection];
      } else if (opt.key === 'Area') {
        const menuSelection = this.selectedItemsMap[opt.filter_name] ?? [];
        const areaFilter = this.topBarFilters.find(f => f.name === 'Area');
        if (areaFilter) {
          areaFilter.selectedFilter = [...menuSelection];
        }
        this.appliedAreaSelection = [...menuSelection];
      }
    });

    // Skip global loader so filter menu stays open (same as TargetsProspectsFindComponent - table shows loading via isLoading/subloaderShowing)
    this.getCustomerList(undefined, undefined, undefined, true);

    this.selectedCustomers.clear();
    this.isAssignedAllCustomer = false;
    this.isManualAllPagesSelected = false;
    // Do not clear search box values so user's search text persists after Apply
  }

  resetCurrentFilter(datasetId: number, dataSetName: any, filterName: string) {
    if (this.selectedFilterType === 'rm') {
      this.selectedRmUsers = [];
      this.rmUserFilter.selectedFilter = [];
      this.rmUserFilter.searchValue = '';
    } else if (filterName && this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];

      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
      if (matchingFilter) {
        matchingFilter.selectedFilter = [];
        matchingFilter.searchValue = '';


        // When City is reset, clear Location and Area (menu selection, search boxes, and data)
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
        // Filter out null/undefined names so "null" is never displayed
        const validOptions = (matchingFilter.optionFilter || []).filter(
          item => item && item.name != null && item.value != null && String(item.name).trim() !== ''
        );
        this.dependantFilters = validOptions
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({ key: item.name, value: item.value }));
      }
    }

    // Refresh list with cleared filter and clear table selection
    this.selectedCustomers.clear();
    this.isAssignedAllCustomer = false;
    this.isManualAllPagesSelected = false;
    this.getCustomerList();
  }

  resetAllSearchByFilters() {
    this.selectedItemsMap = {};
    this.appliedLocationSelection = [];
    this.appliedAreaSelection = [];
    this.selectedRmUsers = [];

    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';

    // Old logic: Reset location and area data when all filters are reset
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
      topBarFilters.isApiCalled = false;
      this.isCityApiCalled = false;
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
        const i = this.topBarFilters.findIndex((x) => x.name === "Pincode");
        if (this.topBarFilters[i]) {
          this.topBarFilters[i].optionFilter = this.pincodeMaster;
          this.topBarFilters[i].selectedFilter = [];
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
          // Old logic: when city is null but search 3 letter list visible
          if (!topBarFilter.searchValue || topBarFilter.searchValue.length < 3) {
            topBarFilter.optionFilter = [];
            return;
          }
          // Call search API even when city is not selected
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
          // Old logic: when location is null but search 3 letter list visible
          if (!topBarFilter.searchValue || topBarFilter.searchValue.length < 3) {
            topBarFilter.optionFilter = [];
            return;
          }
          // Call search API even when location is not selected
          this.onSearchInputChange(topBarFilter, filterType);
        }
      } else {
        this.existingProspectsDropDownService.filterCheckBoxTopBar(topBarFilter, filterType);
      }
    }
  }

  onExportExcelPopup(): void {
    let request: any = {};
    request["type"] = 'TARGET';
    var filterjson = this.applyFilter();
    filterjson["paginationFROM"] = 0
    filterjson["paginationTO"] = this.totalSize
    // delete filterjson["persona"];
    request.filterJson = JSON.stringify(filterjson);
    request.requestedFields = this.requestedFields;
    request.isNewFilter = this.isNewFilter;
    // if(this.commonService.isObjectNullOrEmpty(request.filterJson)){
    // }
    // this.commonService.setStorageAesEncryption(this.constants.FILTER_JSON_EXISTING,JSON.stringify(filterjson));
    this.dialog.open(ExportExcelPopupComponent, { panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true });
  }




  selectAllProspect() {

    this.isAssignedAllCustomer = !this.isAssignedAllCustomer;
    this.isManualAllPagesSelected = this.isAssignedAllCustomer;
    if (this.isAssignedAllCustomer) {
      this.bulkShare = true;
      this.customerList.forEach(customer => this.selectedCustomers.add(customer.id));
    }
    else {
      this.bulkShare = false;
      this.isManualAllPagesSelected = false;
      this.customerList.forEach(customer => this.selectedCustomers.delete(customer.id));
    }
    this.updateTransformedCustomer();
  }

  toggleSelection(customerId: number) {
    this.isManualAllPagesSelected = false;
    this.bulkShare = false;
    if (this.selectedCustomers.has(customerId)) {
      this.selectedCustomers.delete(customerId);
    } else {
      this.selectedCustomers.add(customerId);
    }

    // this.isAssignedAllCustomer = this.selectedCustomers.size === this.customerList.length;
    this.updateTransformedCustomer();
  }

  updateTransformedCustomer() {
    this.disableAssignButton = this.selectedCustomers.size === 0;
    this.disableDeleteButton = this.selectedCustomers.size === 0;
    if (this.customerList) {
      this.isAssignedAllCustomer = this.customerList.every(customer => this.selectedCustomers.has(customer.id));
    }
  }

  addToTarget() {
    if (this.dashboardResponse.rmId === this.dashboardResponse.previousRmId) {
      this.commonService.warningSnackBar('cannot assign customer at yourself');
      return;
    }
    if (this.dashboardResponse.customerType && this.dashboardResponse.customerType == this.constants.CustomerType.PROSPECTS) {
      if (this.commonService.isObjectIsEmpty(this.dashboardResponse.pan) || this.commonService.isObjectIsEmpty(this.dashboardResponse.cin)) {
        this.commonService.warningSnackBar('Pan Or cin not found from  customer');
        return;
      }
    }
    else if (!this.dashboardResponse.pan) {
      this.commonService.warningSnackBar('Pan number not found from  customer');
      return;
    }

    GlobalHeaders['x-page-action'] = 'Add To Target';
    const empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
    if (empCode !== undefined && empCode !== "undefined") {
      this.dashboardResponse.employeeCode = empCode;
    }
    this.service.addToTargetIndvidualCustomer(this.dashboardResponse).subscribe((res: any) => {
      if (res.status == 200) {

        if (this.dashboardResponse.customerType == this.constants.CustomerType.PROSPECTS) {
          this.commonService.successSnackBar('given RM assign successfully');
        }

        if (this.disableAssignButton) {
          // let pageDatas: any = [];
          let userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
          let roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
          const routerData = { pan: this.dashboardResponse.pan, tabId: 2 }; // Data to pass
          // this.commonMethod.getUserPermissionData(
          //   userId, roleId, Constants.pageMaster.TARGETS_AND_PROSPECTS,
          //   (pageData: any) => {
          //     pageDatas = pageData?.[0];
          //     this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: pageDatas, dataFrom: this.pageData } });
          //   }
          // );
          const pageDatas = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.EXISTING_PORTFOLIO)
          this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: pageDatas, dataFrom: this.pageData, isFromParentPage: true } });
        }

        this.selectedCustomers.clear();
        this.isAssignedAllCustomer = false;
        this.isManualAllPagesSelected = false;

      }
      else if (res.status == 208) {
        this.commonService.warningSnackBar('Customer is already available in ' + res?.data?.type + ' dashboard');
      } else {
        this.commonService.warningSnackBar('Something went Wrong')
      }
    });
  }

  CreateCampaignPopup(): void {
    const isAllPagesSelected = this.isManualAllPagesSelected === true && this.totalSize > 0;
    if ((this.selectedCustomers && this.selectedCustomers.size > 0) || isAllPagesSelected) {
      const selectedCustomerDetailsArray = this.customerList
        .filter(customer => this.selectedCustomers.has(customer.id))
        .map(customer => ({
          customerName: customer.name,
          customerId: customer.customerId,
          pan: customer.panNo,
          rmId: customer.rmId,
          customerType: this.constants.CustomerType.TARGET,
        }));
      let request: any = {};
      request["type"] = 'Prospects';
      request["customerType"] = this.constants.CustomerType.TARGET;
      var json = this.applyFilter(null);
      json["paginationFROM"] = 0;
      json["paginationTO"] = this.totalSize;
      request.filterJson = JSON.stringify(json);
      const customerCount = isAllPagesSelected ? this.totalSize : this.selectedCustomers.size;

      const dialogRef = this.dialog.open(CreateCampaignProspectPopupComponent, {
        panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'],
        data: {
          customerCount: customerCount,
          selectedCustomers: selectedCustomerDetailsArray,
          filterDataList: this.appliedFilterDataList,
          isNTB: true,
          getCustomerPayload: request,
          isAssignedAllCustomer: isAllPagesSelected,
          customerTypeId: this.constants.CustomerType.TARGET,
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.payload) {
          this.saveCampaign(result.payload);
        }
      });
    } else {
      this.commonService.warningSnackBar('Please select at least one customer to create campaign.');
    }
  }

  saveCampaign(payload: any) {
    this.service.saveOrUpdateCampaignDetails(payload, false).subscribe((response: any) => {
      if (response && response.status == 200) {
        this.commonService.successSnackBar(response.message);
        this.selectedCustomers.clear();
        this.isAssignedAllCustomer = false;
        this.isManualAllPagesSelected = false;
        const permissionData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
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

  assignCustomerToRm(customer?: any): void {

    const customers: any = [];
    if (!this.commonService.isObjectNullOrEmpty(customer)) {
      customers.push(customer.id);
    }
    else {
      customers.push(...this.selectedCustomers);
    }

    let dialogRef;
    if (!this.disableAssignButton) {
      dialogRef = this.dialog.open(UseridPopupComponent, { data: "Bulk Assign", panelClass: ['popupMain_design'], });
    }
    else {
      dialogRef = this.dialog.open(UseridPopupComponent, { panelClass: ['popupMain_design'], });
    }
    dialogRef.afterClosed().subscribe(result => {
      if (result.isAssign && result.userId) {
        this.dashboardResponse = {
          aggregateTurnoverFromGst: '',
          companyName: customer?.companyName,
          address: '',
          lendingBankersCount: undefined,
          cmr: '',
          pan: customer?.panNo,
          cin: customer?.cin,
          charges: '',
          creditRating: undefined,
          city: '',
          pinCode: undefined,
          fullBureauConsent: undefined,
          partialBureauConsent: undefined,
          downloadFinancialConsent: undefined,
          contactNo: '',
          personal: '',
          turnOver: '',
          prioritySectorLendind: '',
          employeeCode: '',
          customerType: this.constants.CustomerType.PROSPECTS,
          rmId: result.userId,
          rmUserName: result.userName,
          customerIdList: customers,
          previousRmId: customer?.rmId,
          isRmAssign: true,
          isTarget: true,
          assignmentRemarks: result.assignmentRemark
        };
        console.log('this.dashboardResponse: ', this.dashboardResponse);
        this.addToTarget();
      }

    });
  }

  handleApply(filterListMaster: any[]) {
    this.filterListMaster = filterListMaster;
    console.log('Data received from child:', filterListMaster);
    this.getCustomerList()
  }

  handleReset() {
    this.totalSize = 0
    this.removeFilter();
    this.isLoading = true;
    this.isLoadingSubject.next(true);
    setTimeout(() => {
      this.isLoading = false;
      this.isLoadingSubject.next(false);
    }, 1500);
  }

  resetFilters() {
    this.commonService.removeStorage(this.constants.FILTER_LIST_MASTER_TARGET);
    this.commonService.removeStorage(this.constants.TOP_BAR_FILTER_LIST_TARGET);
    this.selectedRmUsers.length = 0;
    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        f1.selectedFilter.length = 0
      }
    });
    // Clear hierarchy filter state
    this.hierarchyFilterState = null;
    this.hierarchyService.clearFilterState(this.constants.HIERARCHY_FILTER_TARGET);
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

  getClientReasonMaster(): void {
    this.msmeService.getClientUpdateReasonsMaster(true).subscribe(res => {
      if (res?.status === 200 && res?.data) {

        // store full backend map
        this.clientReasonMap = res.data;
      }
    });
  }

  rejectCustomer(customer?: any) {
    console.log("reject customer ", customer);

    const dialogRef = this.dialog.open(RejectedPopupComponent, {
      panelClass: ['popupMain_design'],
      autoFocus: false,
      data: {
        clientStatus: this.clientReasonMap
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("result::: ", result);
      const clientStatusLabelMap: any = {
        work_in_progress: 'Work In Progress',
        reject: 'Reject'
      };

      if (!this.commonService.isObjectNullOrEmpty(result.remarks) && !this.commonService.isObjectNullOrEmpty(customer?.panNo)) {
        const rejectedPortfolioReqDto = {
          pan: customer?.panNo,
          remarks: result.remarks,
          clientStatus: clientStatusLabelMap[result.clientStatus] || result.clientStatus,
          reason: result.reasons,
          portfolio: 'TARGET',
          empCode: this.empCode
        };
        console.log(rejectedPortfolioReqDto);

        this.msmeService.rejectedCustomer(rejectedPortfolioReqDto).subscribe(
          (response) => {
            this.commonService.successSnackBar(response.message);

            this.getCustomerList();
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

  getEmpCode() {
    this.empCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
  }

  getCityLocationPincode(index?: any, locationList?: any, cityList?: any): any {
    console.log(index);
    const request = {
      locationList: locationList,
      cityList: cityList,
      requestType: Constants.CustomerType.TARGET
    }
    this.msmeService.getCityLocationPincode(request).subscribe(
      (response) => {
        // this.commonService.successSnackBar(response.message);
        if (response && response?.status === 200) {
          if (response?.data?.city.length > 0) {
            this.topBarFilters[index] = {
              isCallApi: false,
              name: 'City',
              spKeyName: 'city',
              searchValue: '',
              optionFilter: response?.data?.city,
              selectedFilter: [],
              isApiCallSearch: false
            };
          } else if (response?.data?.location.length > 0) {
            this.topBarFilters[index] = {
              isCallApi: false,
              name: 'Location',
              spKeyName: 'location',
              searchValue: '',
              optionFilter: response?.data?.location,
              selectedFilter: [],
              isApiCallSearch: false
            };
          } else if (response?.data?.pincode.length > 0) {
            this.topBarFilters[index] = {
              isCallApi: false,
              name: 'Pincode',
              spKeyName: 'pincode',
              searchValue: '',
              optionFilter: response?.data?.pincode,
              selectedFilter: [],
              isApiCallSearch: false
            };
          }
        }
      },
      (error) => {
        console.error("Error in getting list from getCityLocationPincode API:", error);
      }
    );
  }

  // getLocation(cityList?:any, searchValue? , type?:any){
  //   const types:any = type.toLowerCase();
  //   let req:any = {};
  //   if (types === 'city'){
  //     this.pageNumber = 0;
  //      req = {cityList: cityList};
  //   }else if (types === 'location'){
  //      req = {locationList: cityList};
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

  // onScroll(event: Event) {
  //   const element = event.target as HTMLElement;
  //   const threshold = 1;
  //   const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight-threshold;
  //   if (atBottom) {
  //     this.pageNumber=this.pageNumber+1;
  //     const i = this.topBarFilters.findIndex((x) => x.name === 'Location');
  //     const i1 = this.topBarFilters.findIndex((x) => x.name === 'Area');
  //     this.getLocation(this.topBarFilters[i].selectedFilter,this.topBarFilters[i1].searchValue,'Location');
  //     // this.loadMoreOptions();
  //   }
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
    req.requestType = Constants.CustomerType.TARGET
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
              // If API returns empty (e.g. when no search), keep previous list so unselected options stay visible after apply
              if (rawLocation.length > 0) {
                this.allLocationData = rawLocation;
                this.originalLocationData = [...this.allLocationData];
              }
              this.currentLocationIndex = this.locationBatchSize;
              this.topBarFilters[i].optionFilter = this.allLocationData.slice(0, this.locationBatchSize);


              // Update dependantFilters with FULL list so after search+select+apply, all unselected options stay visible
              if (this.activeFilterMenu === 'Location' && this.selectedFilterOption) {
                this.dependantFilters = (this.allLocationData || [])
                  .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                  .map((item: any) => ({ key: item.name, value: item.value }));
                const selectedIds = this.selectedItemsMap[this.selectedFilterOption.filter_name] || [];
                const labels = this.selectedOptionLabels[this.selectedFilterOption.filter_name] || {};
                selectedIds.forEach((selectedId: any) => {
                  if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                    const found = this.allLocationData.find((item: any) => item.value === selectedId || item.value == selectedId);
                    const key = found ? found.name : (labels[selectedId] ?? labels[String(selectedId)] ?? 'Selected');
                    this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                  }
                });
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


              // Update dependantFilters with FULL area list so after search+select+apply, all unselected options stay visible
              if (this.activeFilterMenu === 'Area' && this.selectedFilterOption) {
                this.dependantFilters = (this.allAreaData || [])
                  .filter((item: any) => item && item.name !== 'All' && item.value !== 'All')
                  .map((item: any) => ({ key: item.name, value: item.value }));
                const selectedIds = this.selectedItemsMap[this.selectedFilterOption.filter_name] || [];
                const labels = this.selectedOptionLabels[this.selectedFilterOption.filter_name] || {};
                selectedIds.forEach((selectedId: any) => {
                  if (!this.dependantFilters.some((d: any) => d.value === selectedId || d.value == selectedId)) {
                    const found = this.allAreaData.find((item: any) => item.value === selectedId || item.value == selectedId);
                    const key = found ? found.name : (labels[selectedId] ?? labels[String(selectedId)] ?? 'Selected');
                    this.dependantFilters = [{ key, value: selectedId }, ...this.dependantFilters];
                  }
                });
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
    filter.searchValue = filter.searchValue?.trim();
    this.searchValueChanged.next({ filter, filterName });
  }

  initializeLocationData() {
    const i = this.topBarFilters.findIndex((x) => x.name === "City");

    if (!this.commonService.isObjectIsEmpty(i))
      this.getLocation(this.topBarFilters[i].selectedFilter, '', 'City');
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
      // Old logic: when city is null but search 3 letter list visible - show all matching locations
      if (!hasCitySelected) {
        this.currentLocationIndex = 0;
        this.allLocationData = [];
        // Pass empty array for cityList when city is not selected, but pass searchValue
        const cityList = cityIndex !== -1 ? (this.topBarFilters[cityIndex].selectedFilter || []) : [];
        this.getLocation(cityList, filter.searchValue, 'City');
      }
    } else if (filterName === 'Area') {
      const locationIndex = this.topBarFilters.findIndex((x) => x.name === "Location");
      const locationOpt = this.searchByOptionsTopBar?.find(o => o.key === 'Location');
      const locationFilterName = locationOpt?.filter_name || 'location';
      const pendingLocation = this.selectedItemsMap[locationFilterName] || [];
      const appliedLocation = (locationIndex !== -1 ? this.topBarFilters[locationIndex].selectedFilter : []) || [];
      const hasLocationSelected = pendingLocation.length > 0 || appliedLocation.length > 0;
      const locationListToUse = pendingLocation.length > 0 ? pendingLocation : appliedLocation;
      // Old logic: when location is null but search 3 letter list visible - show all matching areas
      if (!hasLocationSelected) {
        this.currentAreaIndex = 0;
        this.allAreaData = [];
        this.getLocation(locationListToUse, filter.searchValue, 'Location');
      } else {
        this.getLocation(locationListToUse, filter.searchValue, 'Location');
      }
    }
  }



  onToggleChange(isCustomerTypeInActive: boolean) {
    this.isCustomerTypeInActive = isCustomerTypeInActive;
    this.isCustomerTypeActive = !isCustomerTypeInActive; // Update the toggle state
    console.log("this.constants.CustomerType.TARGET - 1::::> ", this.constants.CustomerType.TARGET - 1)
    this.commonService.updateCustomerInActive(this.constants.CustomerType.TARGET - 1, isCustomerTypeInActive);
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
    this.commonService.updateCustomerInActive(this.constants.CustomerType.TARGET - 1, isCustomerTypeInActive);

    // Refresh customer list
    this.getCustomerList();
  }
  TargetUserdelete_popup(customer?: any): void {
    const customers: Number[] = [];

    if (!this.commonService.isObjectNullOrEmpty(customer)) {
      customers.push(customer);
    } else {
      customers.push(...this.selectedCustomers);
      console.log("Ids To delete", customers);
    }

    let dialogRef;
    if (!this.disableDeleteButton) {
      dialogRef = this.dialog.open(TargetUserdeletePopupComponent, { data: { customerIds: customers, count: customers.length }, panelClass: ['popupMain_design'] });
    } else {
      dialogRef = this.dialog.open(TargetUserdeletePopupComponent, { panelClass: ['popupMain_design'] });
    }
    dialogRef.afterClosed().subscribe((result) => {
      console.log("result======>", result);
      if (result?.isDelete) {
        this.getCustomerList();
        this.selectedCustomers = new Set();

        this.dialog.open(SucessfullyDeletePopupComponent, { data: { count: result.count }, panelClass: ['popupMain_design'] });
      }
    });
  }

  onMenuClosed(filter: any) {
    if (filter.name === 'Area' && this.allAreaData?.length > 0) {
      this.locationBatchSize = 20;
      filter.optionFilter = this.allAreaData.slice(0, this.locationBatchSize);
      this.currentAreaIndex = this.locationBatchSize;
    }
  }

  // Clear dependent filters (topBar state only)
  clearDependentFilters(filterNames: string[]) {
    filterNames.forEach(name => {
      const index = this.topBarFilters.findIndex(x => x.name === name);
      if (this.topBarFilters[index]) {
        this.topBarFilters[index].optionFilter = [];
        this.topBarFilters[index].selectedFilter = [];
      }
    });
  }

  /** Clear selectedItemsMap for Location or Area (used when City/Location changes so dependent filter resets in menu too). */
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

  AddRmpopup(customer: any) {

    const payload = {
      pan: customer?.panNo
    };

    // First fetch already shared RM list
    this.msmeService.getAllSharedRm(payload).subscribe({
      next: (res: any) => {

        const alreadySharedRms = res?.data || [];

        //Open popup
        const dialogRef = this.dialog.open(AddMultiRmPopupComponent, {
          panelClass: ['popupMain_design'],
          autoFocus: false,
          data: {
            alreadySharedRms: alreadySharedRms,
            customer: customer
          }
        });

        dialogRef.afterClosed().subscribe(result => {

          if (result && result.sharedToRmList?.length) {

            //  Prepare API payload
            const payload = {
              pan: customer?.panNo,
              sharedToRmList: result.sharedToRmList
            };

            // Call Share API
            this.msmeService.shareToRm(payload).subscribe((res: any) => {
              if (res.status == 200) {
                this.commonService.successSnackBar(res.message);
              } else {
                this.commonService.errorSnackBar(res.message);
              }
            });

          }
        });

      },
      error: (error) => {
        console.error("Error in getAllSharedRm API:", error);
      }
    });
  }

  bulkAddRmpopup() {

      // Get selected customers' PAN numbers
      const selectedCustomersList = this.customerList.filter(
        (customer: any) => this.selectedCustomers.has(customer.id)
      );

      if (selectedCustomersList.length === 0) {
        this.commonService.warningSnackBar('Please select at least one customer to share');
        this.isBulkSharing = false;
        return;
      }

      // Open popup without fetching already shared RMs (bulk mode)
      const dialogRef = this.dialog.open(AddMultiRmPopupComponent, {
        panelClass: ['popupMain_design'],
        autoFocus: false,
        data: {
          alreadySharedRms: [],
          customer: null,
          isBulk: true,
          selectedCount: selectedCustomersList.length
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.sharedToRmList?.length) {
          const panList = selectedCustomersList.map((c: any) => c.panNo);

          const proceedWithShare = () => {
            let payload: any;
            if (this.bulkShare) {
              payload = {};
              payload['type'] = 'TARGET';
              const json = this.applyFilter(true, null, this.totalSize);
              payload.filterJson = JSON.stringify(json);
              payload.isNewFilter = this.isNewFilter;
              payload.requestedFields = ["panNo"];
              payload.saveCustomerProxy = {
                sharedToRmList: result.sharedToRmList
              };
            } else {
              payload = {
                saveCustomerProxy: {
                  panList: panList,
                  sharedToRmList: result.sharedToRmList
                }
              };
            }

            this.msmeService.shareToRmBulk(payload).subscribe((res: any) => {
              if (res.status == 200) {
                this.commonService.successSnackBar(res.message);
                this.selectedCustomers.clear();
                this.isAssignedAllCustomer = false;
                this.updateTransformedCustomer();
              } else {
                this.commonService.errorSnackBar(res.message);
              }
              this.isBulkSharing = false;
            });
          };

          if (this.bulkShare) {
            // Show confirmation dialog for bulk share
            const confirmRef = this.dialog.open(ApproveRejectPopupComponent, {
              width: '450px',
              data: { message: 'Selecting all Targets will share all the targets with respective RM(s). Are you sure?' }
            });

            confirmRef.afterClosed().subscribe(confirmed => {
              if (confirmed === true) {
                this.commonService.successSnackBar('Note: Sharing of Targets will take approx. 15 mins. Targets already shared earlier to RM or exists in hierarchy will not be re-shared.');
                proceedWithShare();
              }
            });
          } else {
            proceedWithShare();
          }
        }
      });
    }


  Rmdetailpopup(customer: any) {
    const payload = {
      pan: customer?.panNo,
      employeeCode: this.empCode
    };

    console.log(payload);
    this.msmeService.getAllSharedRm(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.status === 200 && res.data) {
          const data = res.data;
          console.log("data=====>", data);
          // open popup and pass backend data
          const dialogRef = this.dialog.open(ViewAllrmPopupComponent, {
            panelClass: ['popupMain_design'],
            autoFocus: false,
            data: {
              rmList: res.data,
              panNo: customer?.panNo
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            console.log('Popup closed:', result);
          });
        }
      },
      error: (error) => {
        console.error("Error in getAllSharedRm API:", error);
      }
    });
  }

  // Filter sidebar toggle
  isFilterSidebarOpen: boolean = false;

  openAdvancedFilter(isFromSaveFilterPopup?,savedFilter?:FilterListItem, filterName?): void {

    let categoryIndex = (filterName != undefined || filterName != null) ? this.filterListMaster.findIndex(filter1 => filter1.filterName === filterName) : undefined;
    const dialogRef = this.dialog.open(FilterSidebarNewComponent, {
      panelClass: ['popupMain_design', 'advanced_filter_dialog', 'right_side_popup'],
      data: {
        filterListMaster: this.filterListMaster,
        isProcessing: this.isLoadingSubject.asObservable(),
        customerTypeInActive: this.isCustomerTypeInActive,
        customerType: this.constants.CustomerType.TARGET,
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

  toggleFilterSidebar() {
    this.openAdvancedFilter();
  }

  // Customize columns
  selectedColumns: string[] = [];
  allColumns: string[] = [];
  mandatoryColumns: string[] = [];
  defaultColumns: string[] = [];
  columnMap: { [key: string]: string } = {};

  CustomizeColumn_popup() {
    const dialogRef = this.dialog.open(CustomizeColumnsPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2'],
      data: {
        allColumns: this.allColumns,
        selectedColumns: this.selectedColumns,
        defaultColumns: this.defaultColumns,
        mandatoryColumns: this.mandatoryColumns
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedColumns = result;
        this.selectedColumns.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFields.includes(columnName)) {
            this.requestedFields.push(columnName);
          }
        });

        this.getCustomerList();
      }
    });
  }

  openCustomizeColumnsPopup() {
    this.CustomizeColumn_popup();
  }

  private initializeColumnArrays(): void {
    this.columnMap = {
      'Customer Name': 'customerName',
      'PAN': 'pan',
      'CIN': 'cin',
      'Opportunity': 'opportunity',
      'Pre-Approved': 'preApproved',
      'Assignment Source': 'assignmentSource'
    };

    this.allColumns = [
      'PAN',
      'Name Of Customer',
      'Total Opportunity',
      'Pre-Qualified',
      'Country',
      'Global RM',
      'Parent Company Name',
      'Assignment Source',
      "Constitution as per MCA","Constitution as per GST","GST Status","Date of Incorporation","CIN","IEC","LEI Number","LEI Expiry","Industry","Sector","Listing status","No. of employees","GST Turnover slab","PSL status","Agri PSL","Udyam","Udyam status","Udyam category","RM name","RM PS ID","Business","Segment","City","Customer type","CRR","Last approved date","Next review date","CDD Date","CDD risk rating","Time With HSBC","Latest credit rating","Rating Type","Rating agency","Date of rating","Latest audited year","Name of auditor","Auditor Turnover","IT/ITES Turnover","EBIDTA","EBIDTA%","PAT","PAT%","Trade receivables","Inventories","Non current assets","Total Asset","Net worth","Trade Payable","Long term borrowings","Short term borrowings","Leverage","Net debt/EBITDA","Working capital cycle","Payable Days(Sales Basis)","Days Of Sales Outstanding","Inventory Days(Sales Basis)","Current ratio","DSCR","Interest coverage ratio","Cash and Bank","Current investments","Annual Tax","Annual Salary","Unbilled Revenue (Rs. in Cr.)","Dividend paid (Rs. in Cr.)","Dividend Payable (Rs. in Cr.)","CSR obligation (Rs. in Cr.)","CSR Amount Spent (Rs. in Cr.)","Transfer to unspent CSR A/c (Rs. in Cr.)","Credit Churn(Current FY)","Credit Churn(Previous FY)","Open charges","MCA open charge(Rs. in Lacs)","Date of bureau report","Data Source","Sole/Multiple lending","CMR score","Total Sanction","Total Utilization","HSBC Sanction","HSBC Utilization","Facilities from Private & Foreign Banks","Facilities from NBFC & Others","Facilities from NBFC and Other (O/S)","Bureau Vintage","Exports last 12 months (Units in $)","No. of Export shipment","Total Imports last 12 months (Units in $)","No. of Import shipment","ECB (Units in $)","FDI (Units in $)","ODI (Units in $)","No. of directors","Director remuneration","LAP Loans","Home Loans","Cards"
    ];

    this.defaultColumns = [
      'PAN',
      'Name Of Customer',
      'Total Opportunity',
      'Pre-Qualified',
      'Country',
      'Global RM',
      'Parent Company Name',
      'Assignment Source',
    ];
    this.mandatoryColumns = [
      'Name Of Customer',
      'PAN'
    ]

    let selectedColumnsString = this.commonService.getStorageAesEncryption(this.constants.SELECTED_COLUMNS_TARGET);
    if (selectedColumnsString != null && selectedColumnsString != undefined) {
      let selectedColumns = JSON.parse(JSON.parse(selectedColumnsString));
      if (selectedColumns) {
        this.selectedColumns = selectedColumns;
        this.selectedColumns.forEach(element => {
          let columnName = CUSTOMIZE_COLUMN[element];
          if (columnName != undefined && !this.requestedFields.includes(columnName)) {
            this.requestedFields.push(columnName);
          }
        });
      }
    } else {
      this.selectedColumns = [...this.defaultColumns];
    }
  }

  getTableColumns() {
    return this.allColumns.map(col => ({
      name: col,
      key: this.columnMap[col],
      visible: this.selectedColumns.includes(col)
    }));
  }

  applyColumnCustomization(selectedColumns: string[]) {
    this.selectedColumns = selectedColumns;
  }

  isColumnVisible(columnKey: string): boolean {
    if (this.selectedColumns.length === 0) return true;
    const columnName = Object.keys(this.columnMap).find(key => this.columnMap[key] === columnKey);
    return columnName ? this.selectedColumns.includes(columnName) : true;
  }

  // Active filter chips methods
  hasActiveFilters(): boolean {
    // Check search form filters
    const formValues = this.searchForm.value;
    if (formValues.name || formValues.applicationCode) return true;
    if (formValues.opportunity && formValues.opportunity !== 'CUA') return true;
    if (formValues.personaUpper && formValues.personaUpper !== 'ALL') return true;
    if (formValues.preApproved && formValues.preApproved !== 'ALL') return true;
    if (formValues.country || formValues.globalRm || formValues.parentCompanyName || formValues.campaignName) return true;

    // Check RM users filter
    if (this.selectedRmUsers && this.selectedRmUsers.length > 0) return true;

    // Check top bar filters
    if (this.topBarFilters && this.topBarFilters.some(f => f.selectedFilter && f.selectedFilter.length > 0)) return true;

    // Check assignment source filter
    if (this.assignmentSourceFilter.type && this.assignmentSourceFilter.selectedValues && this.assignmentSourceFilter.selectedValues.length > 0) return true;

    // Check sidebar filters
    if (this.filterListMaster && this.filterListMaster.some(f => f.count > 0)) return true;

    return false;
  }

  removeFilterChip(filterType: string, filterKey?: string) {
    if (filterType === 'name' || filterType === 'applicationCode' || filterType === 'opportunity' ||
        filterType === 'personaUpper' || filterType === 'preApproved' || filterType === 'country' ||
        filterType === 'globalRm' || filterType === 'parentCompanyName' || filterType === 'campaignName') {
      this.searchForm.patchValue({ [filterType]: '' });
      if (filterType === 'opportunity') {
        this.searchForm.patchValue({ opportunity: 'CUA' });
      } else if (filterType === 'personaUpper') {
        this.searchForm.patchValue({ personaUpper: 'ALL' });
      } else if (filterType === 'preApproved') {
        this.searchForm.patchValue({ preApproved: 'ALL' });
      }
      this.getCustomerList();
    }
  }

  removeTopBarFilterChip(filterName: string, value: any) {
    const filter = this.topBarFilters.find(f => f.name === filterName);
    if (filter) {
      const index = filter.selectedFilter.indexOf(value);
      if (index > -1) {
        filter.selectedFilter.splice(index, 1);
      }
      this.getCustomerList();
    }
  }

  removeRmUserChip(empCode: string) {
    const index = this.selectedRmUsers.indexOf(empCode);
    if (index > -1) {
      this.selectedRmUsers.splice(index, 1);
    }
    this.getCustomerList();
  }

  removeAssignmentSourceChip(value: any) {
    if (this.assignmentSourceFilter.type === 'Campaign Assigned') {
      const index = this.campaignFilter.selectedFilter.indexOf(value);
      if (index > -1) {
        this.campaignFilter.selectedFilter.splice(index, 1);
      }
    } else if (this.assignmentSourceFilter.type === 'Assigned by Peer' || this.assignmentSourceFilter.type === 'Shared by RM') {
      const index = this.peerFilter.selectedFilter.indexOf(value);
      if (index > -1) {
        this.peerFilter.selectedFilter.splice(index, 1);
      }
    }
    this.applyAssignmentSourceFilter();
  }

  removeSidebarFilterChip(filterKey: string, subFilterKey?: string, value?: any) {
    this.filterListMaster.forEach(f1 => {
      f1.insightTwoFilter.forEach(f2 => {
        if (f2.keyName === filterKey) {
          if (f2.type === 'checkbox') {
            if (filterKey === 'businessLine') {
              // Handle business line parent/child structure
              if (f2.json && f2.json.keys) {
                f2.json.keys.forEach((parent: any) => {
                  if (subFilterKey === 'parent' && parent.value === value) {
                    parent.selected = false;
                  }
                  if (parent.subKeys) {
                    parent.subKeys.forEach((child: any) => {
                      if (subFilterKey === 'child' && child.value === value) {
                        child.selected = false;
                      }
                    });
                  }
                });
              }
            } else {
              const index = f2.selected.indexOf(value);
              if (index > -1) {
                f2.selected.splice(index, 1);
              }
            }
          } else if (f2.type === 'radioButton') {
            f2.json.value = 'All';
          } else if (f2.type === 'minMax') {
            f2.json.min = null;
            f2.json.max = null;
            f2.json.minRaw = null;
            f2.json.maxRaw = null;
          } else if (f2.type === 'date') {
            f2.json.fromDate = null;
            f2.json.toDate = null;
          }
          f2.json.count = 0;
        }
      });
      // Recalculate parent count
      f1.count = f1.insightTwoFilter.reduce((sum, f2) => sum + (f2.json?.count || 0), 0);
    });
    this.getCustomerList();
  }

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

  getActiveSidebarFilters() {
    const activeFilters: any[] = [];
    this.filterListMaster.forEach(f1 => {
      f1.insightTwoFilter.forEach(f2 => {
        if (f2.json?.count > 0) {
          if (f2.type === 'checkbox') {
            if (f2.keyName === 'businessLine') {
              if (f2.json && f2.json.keys) {
                f2.json.keys.forEach((parent: any) => {
                  if (parent.selected) {
                    activeFilters.push({
                      filterKey: f2.keyName,
                      subFilterKey: 'parent',
                      value: parent.value,
                      label: parent.name,
                      displayName: f2.displayName
                    });
                  }
                  if (parent.subKeys) {
                    parent.subKeys.forEach((child: any) => {
                      if (child.selected) {
                        activeFilters.push({
                          filterKey: f2.keyName,
                          subFilterKey: 'child',
                          value: child.value,
                          label: child.name,
                          displayName: f2.displayName
                        });
                      }
                    });
                  }
                });
              }
            } else {
              f2.selected.forEach((value: any) => {
                activeFilters.push({
                  filterKey: f2.keyName,
                  value: value,
                  label: this.getFilterOptionName(f2, value),
                  displayName: f2.displayName
                });
              });
            }
          } else if (f2.type === 'radioButton' && f2.json.value !== 'All') {
            activeFilters.push({
              filterKey: f2.keyName,
              value: f2.json.value,
              label: f2.json.value,
              displayName: f2.displayName
            });
          } else if (f2.type === 'minMax') {
            const minVal = f2.json.minRaw ?? f2.json.min;
            const maxVal = f2.json.maxRaw ?? f2.json.max;
            if (minVal !== null && minVal !== undefined || maxVal !== null && maxVal !== undefined) {
              activeFilters.push({
                filterKey: f2.keyName,
                value: `${minVal || 0} - ${maxVal || '∞'}`,
                label: `${minVal || 0} - ${maxVal || '∞'}`,
                displayName: f2.displayName
              });
            }
          } else if (f2.type === 'date') {
            if (f2.json.fromDate || f2.json.toDate) {
              activeFilters.push({
                filterKey: f2.keyName,
                value: `${f2.json.fromDate || ''} - ${f2.json.toDate || ''}`,
                label: `${f2.json.fromDate || ''} - ${f2.json.toDate || ''}`,
                displayName: f2.displayName
              });
            }
          }
        }
      });
    });
    return activeFilters;
  }

  getCheckboxLabel(filter: any, value: any): string {
    if (!filter || !filter.json || !filter.json.keys) return value;
    const option = filter.json.keys.find((k: any) => k.value === value);
    return option ? option.name : value;
  }

  getFilterOptionName(filter: any, value: any): string {
    if (!filter || !filter.json || !filter.json.keys) return value;
    const option = filter.json.keys.find((k: any) => k.value === value);
    return option ? option.name : value;
  }

  getRmUserName(empCode: string): string {
    if (!this.rmUserFilter || !this.rmUserFilter.optionFilter) return empCode;
    const user = this.rmUserFilter.optionFilter.find((u: any) => u.empCode === empCode);
    return user ? user.firstName : empCode;
  }

  getPersonaLabel(value: string): string {
    if (!value || value === 'ALL') return 'All';
    const persona = this.personaAllOptions.find(p => p.value === value);
    return persona ? persona.label : value;
  }

  getOpportunityLabel(value: string): string {
    if (!value) return '';
    const opp = this.totalOpportunities.find(o => o.value === value);
    return opp ? opp.label : value;
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

  // Chip Dropdown Methods
  activeChipDropdown: number | null = null;
  private hideDropdownTimeout: any;

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

    // Update applied filters list for display
    const finalFilterJson = this.applyFilter(null);
    this.filterDataList(this.filterListMaster, finalFilterJson);

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
    this.filterDataList(this.filterListMaster, finalFilterJson);

    // Refresh the data
    this.getCustomerList();
  }

  openTeamStructurePopup(): void {
    const dialogData: TeamStructureDialogData = {
      previousFilterState: this.hierarchyFilterState,
      customerTypeId: this.constants.CustomerType.TARGET,
      pageKey: this.constants.HIERARCHY_FILTER_TARGET,
      primaryOnly: true
    };

    const dialogRef = this.dialog.open(TeamStructurePopupComponent, {
      panelClass: ['popupMain_design'],
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.isReset) {
          this.hierarchyFilterState = null;
          this.hierarchyService.clearFilterState(this.constants.HIERARCHY_FILTER_TARGET);
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

      /**
   * Restore hierarchy filter state from service (for preserving across navigation)
   */
  private restoreHierarchyFilterState(): void {
    const savedState = this.hierarchyService.getSavedFilterState(Constants.HIERARCHY_FILTER_TARGET);
    if (savedState) {
      this.hierarchyFilterState = savedState;
    }
  }

  saveFilterPopup(): void {
    const dialogRef = this.dialog.open(SaveFilterPopupComponent, {
      panelClass: ['popupMain_design'],
      data: {
        filterListMaster: this.filterListMaster,
        customerTypeId:this.constants.CustomerType.TARGET,
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

}

