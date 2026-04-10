import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { environment } from 'src/environments/environment';

export const DD_MM_YYYY_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export class AppDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'DD/MM/YYYY') {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    if (displayFormat === 'MMM YYYY') {
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    return date.toDateString();
  }
}
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import alasql from 'alasql';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
import { HSBCBusinessPANComponent } from 'src/app/Popup/HSBC/hsbc-business-pan/hsbc-business-pan.component';
import { MsmeService } from 'src/app/services/msme.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { GlobalHeaders, resetGlobalHeaders } from "../../../../CommoUtils/global-headers";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PreQulifiedCommonPopupComponent } from 'src/app/Popup/pre-qulified-common-popup/pre-qulified-common-popup.component';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';

@Component({
  selector: 'app-hsbc-rm-dashboard',
  templateUrl: './hsbc-rm-dashboard.component.html',
  styleUrls: ['./hsbc-rm-dashboard.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMAT },
  ],
})
export class HSBCRMDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  @ViewChild('scroll') scroll!: ScrollButtonsDirective;
  selectedTabIndex: number = 0; // Track selected tab for UI
  tabValue: number = 0; // Default to Approved tab
  isLoading = false;
  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  // tab: number =1;
  customerList: any = [];
  totalCount;
  enteredName;
  data: any = { batchId: null, businessTypeId: 1 }
  hidden:boolean = true;
  stageauditList: any = [];
  activeCard: string = '';
  // Dashboard Summary Data
  dashboardSummary: any = null;
  isSummaryLoading: boolean = true; // Loading state for summary boxes
  isInitialLoad: boolean = true; // Track if this is the first load to fetch summary
  isSubFilterSearch: boolean = false; // Track if current search is from sub-filters (text inputs in table)
  
  /**
   * Refresh dashboard summary by forcing includeSummary=true on next API call
   * Call this when filters change significantly (customer type, city, RM users, date range)
   */
  refreshSummary(): void {
    console.log('Refreshing dashboard summary on next API call');
    this.isInitialLoad = true; // Force summary refresh
    this.isSummaryLoading = true; // Show loading state
  }

  /**
   * Apply default selectedOption based on current tab.
   * Ensures correct proposal statuses are always filtered per tab.
   * Tab 0: Approved (6), Tab 1: Rejected (7), Tab 2: In-Process (1,2,3,5), Tab 3: Disabled (15)
   */
  applyDefaultSelectedOption(): void {
    if (this.tabValue === 0) {
      this.selectedOption = '6';
    } else if (this.tabValue === 1) {
      this.selectedOption = '7';
    } else if (this.tabValue === 2) {
      this.selectedOption = '1,2,3,5';
    } else if (this.tabValue === 3) {
      this.selectedOption = '15';
    }
    this.selectedOptionIds = [];
  }

  /**
   * Handle click on summary card to filter dashboard and switch view
   * @param filterType - Type of filter to apply (approved, rejected, inProcess, disabled, stage)
   * @param stageId - Optional stage ID for in-process breakdown
   */
  onSummaryCardClick(filterType: string, stageId?: number): void {
    console.log('Summary card clicked:', filterType, stageId);
    this.activeCard = filterType;
    // Reset pagination to first page
    this.resetPaginationForFilter();
    
    // PRESERVE text search filters across tab switches (name, applicationCode, pan, etc.)
    // Only clear proposal status filters and sort state

    // Clear existing proposal status filters
    this.selectedOption = null;
    this.selectedOptionItem = null;
    this.selectedOptionItems = [];
    this.selectedOptionIds = [];
    this.isAllSelected = false;
    this.isIndeterminate = false;
    
    // Reset sort state when switching tabs via summary card
    this.sortColumn = '';
    this.currentSortField = '';
    this.sortDirection = 'asc';
    
    // Apply filter and set tab based on card type
    // Frontend tabs: 0=Approved, 1=Rejected, 2=In-Process, 3=Disabled
    // Backend tabs: 0=In-Process view, 1=Completed view
    switch (filterType) {
      case 'approved':
        // Filter to show only approved applications (proposalStatus = 6)
        this.selectedOption = '6';
        // FIX: selectedOptionItems should contain objects, not strings
        this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '6');
        this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');
        this.tabValue = 0; // Frontend: Approved tab
        this.selectedTabIndex = 0;
        break;
        
      case 'approved_with_risk':
        // Filter to show approved with risk flags
        this.selectedOption = '6';
        this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '6');
        this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');
        this.isRiskFlag = '1'; // Yes
        this.tabValue = 0; // Frontend: Approved tab
        this.selectedTabIndex = 0;
        break;
        
      case 'approved_without_risk':
        // Filter to show approved without risk flags
        this.selectedOption = '6';
        this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '6');
        this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');
        this.isRiskFlag = '2'; // No
        this.tabValue = 0; // Frontend: Approved tab
        this.selectedTabIndex = 0;
        break;
        
      case 'rejected':
        // Filter to show only rejected applications (proposalStatus = 7)
        this.selectedOption = '7';
        this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '7');
        this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '7');
        this.tabValue = 1; // Frontend: Rejected tab
        this.selectedTabIndex = 1;
        break;
        
      case 'inProcess':
        // Filter to show all in-process applications (proposalStatus IN (1,2,3,4,5))
        this.selectedOption = '1,2,3,4,5';
        // FIX: Update filteredProposalStatus to show only in-process stages (1,2,3,5) - excluding 4
        this.filteredProposalStatus = this.proposalStatus.filter(item => ['1', '2', '3', '5'].includes(item.value));
        this.selectedOptionItems = [...this.filteredProposalStatus];
        this.tabValue = 2; // Frontend: In-Process tab
        this.selectedTabIndex = 2;
        break;
        
      case 'stage':
        // Filter to show specific stage
        if (stageId) {
          this.selectedOption = stageId.toString();
          this.selectedOptionItems = this.proposalStatus.filter(item => item.value === stageId.toString());
          this.filteredProposalStatus = this.proposalStatus.filter(item => ['1', '2', '3', '5'].includes(item.value));
          this.tabValue = 2; // Frontend: In-Process tab
          this.selectedTabIndex = 2;
        }
        break;
        
      case 'disabled':
        // Filter to show only disabled applications (proposalStatus = 15)
        this.selectedOption = '15';
        this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '15');
        this.filteredProposalStatus = []; // No dropdown for disabled
        this.tabValue = 3; // Frontend: Disabled tab
        this.selectedTabIndex = 3;
        break;
    }
    
    // Update GlobalHeaders based on tab
    if (this.tabValue === 0) {
      GlobalHeaders['x-sub-page'] = 'Approved Applications';
    } else if (this.tabValue === 1) {
      GlobalHeaders['x-sub-page'] = 'Rejected Applications';
    } else if (this.tabValue === 2) {
      GlobalHeaders['x-sub-page'] = 'In-Process Applications';
    } else if (this.tabValue === 3) {
      GlobalHeaders['x-sub-page'] = 'Disabled Applications';
    }
    
    // Update select all state
    this.updateSelectAllState();
    
    // Save filter state
    this.saveFilterState();
    
    // Map frontend tab to backend tab
    // Frontend: 0=Approved, 1=Rejected → Backend: 1 (Completed view)
    // Frontend: 2=In-Process, 3=Disabled → Backend: 0 (In-Process view)
    const backendTab = (this.tabValue === 0 || this.tabValue === 1) ? 1 : 0;
    
    // Fetch filtered data with backend tab value
    this.getHSBCHODashboardDetails(backendTab);
  }

  // Sorting properties
  sortColumn: string = ''; // Column to sort by
  currentSortField: string = ''; // Alias for sortColumn (for template compatibility)
  sortDirection: 'asc' | 'desc' = 'asc'; // Sort direction

  // for search
  applicationCode: string;
  name: string;
  campaign: string;
  selectedDate: any;
  filteredDate: any;
  pan: string;
  selectedProduct: any;
  selectedOption: any;
  selectedOptionItem:any;
  selectedOptionItems: any[] = [];
  selectedOptionId : any;
  selectedOptionIds: any[] = [];
  isAllSelected = false;
  isIndeterminate = false;
  filteredProposalStatus: any[] = [];
  isRiskFlag: any;
  finalEligibleAmount: any;

  downloadFromDate: any;
  downloadToDate: any;

   // Customer Type Selection
  selectedCustomerType: string = 'ALL'; // Default to ALL
  selectedCustomerTypeValue: any = 0; // Numeric value(s) for API: 0=ALL, 1=ETB, 2=Target, [3,4,5,6]=Prospect, 10=NTB

  // Search By filter properties from rm-existing-portfolio
  topBarFilters: any[] = [];
  rmUserFilter: any = { searchValue: '', optionFilter: [], selectedFilter: [], originalOptionFilter: [] };
  selectedRmUsers: string[] = [];
  selectedCheckboxesForApply: any[] = [];

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
  selectedItemsMap: { [key: string]: any[] } = {};

  // Parent Company infinite scroll state
  parentCompanyPage = 0;
  parentCompanyHasMore = true;
  parentCompanyLoading = false;
  parentCompanyTotalElements = 0;
  parentCompanySearchSubject = new Subject<{ searchValue: string, datasetId: number }>();
  parentCompanySelectAllActive: { [filterName: string]: boolean } = {}; // Track if "Select All" is active
  // Separate filter storage for each tab (0=Approved, 1=Rejected, 2=In-Process, 3=Disabled)
  selectedItemsMapByTab: { [tabId: number]: { [key: string]: any[] } } = { 0: {}, 1: {}, 2: {}, 3: {} };
  selectedRmUsersByTab: { [tabId: number]: string[] } = { 0: [], 1: [], 2: [], 3: [] };
  // Customer type per tab
  selectedCustomerTypeByTab: { [tabId: number]: string } = { 0: 'ALL', 1: 'ALL', 2: 'ALL', 3: 'ALL' };
  selectedCustomerTypeValueByTab: { [tabId: number]: any } = { 0: 0, 1: 0, 2: 0, 3: 0 };
  // RM search value per tab
  rmSearchValueByTab: { [tabId: number]: string } = { 0: '', 1: '', 2: '', 3: '' };
  // City/TopBar search value per tab (keyed by dataset_id)
  citySearchValueByTab: { [tabId: number]: { [datasetId: number]: string } } = { 0: {}, 1: {}, 2: {}, 3: {} };
  // Sort state per tab
  sortColumnByTab: { [tabId: number]: string } = { 0: '', 1: '', 2: '', 3: '' };
  sortDirectionByTab: { [tabId: number]: 'asc' | 'desc' } = { 0: 'asc', 1: 'asc', 2: 'asc', 3: 'asc' };
  searchByOptPageSize = 50;

  roleId: any;
  userTypeId: any;
  fromOpportunity: Boolean = false;
  selectPreApprovedType =1;
  isShowAuditAPI = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, true);
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

  proposalStatus = [
    { value: '1', viewValue: 'GST Validation', tab: '1' },
    { value: '2', viewValue: 'Bureau Profile', tab: '1' },
    { value: '3', viewValue: 'Additional Information', tab: '1' },
    { value: '5', viewValue: 'Final Assessment', tab: '1' },
    { value: '6', viewValue: 'Eligible', tab: '2' },
    { value: '7', viewValue: 'Reject', tab: '2' },
    { value: '15', viewValue: 'Disabled', tab: '1' },
  ];
  Flag = [
    { value: '1', viewValue: 'Yes' },
    { value: '2', viewValue: 'No' }
  ];
  pageData: any = [];
  subPages: any;
  constants: any;



  constructor(
    public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private router: Router,
    public commonMethod: CommonMethods, private formBuilder: UntypedFormBuilder, private datepipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {

    this.constants = Constants;
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.userTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true));
  }
  collapseEligible: boolean = true;
  
  /**
   * Check if should show In-Process table view
   * In-Process view is shown for: In-Process (tab=2) and Disabled (tab=3) tabs
   */
  showInProcessView(): boolean {
    return this.tabValue === 2 || this.tabValue === 3;
  }
  
  /**
   * Check if should show Completed table view
   * Completed view is shown for: Approved (tab=0) and Rejected (tab=1) tabs
   */
  showCompletedView(): boolean {
    return this.tabValue === 0 || this.tabValue === 1;
  }
  
  /**
   * Helper method to map frontend tab to backend tab and call API
   * Frontend: 0=Approved, 1=Rejected, 2=In-Process, 3=Disabled
   * Backend: 0=In-Process view, 1=Completed view
   */
  private getBackendTabValue(frontendTab?: number): number {
    const tab = frontendTab !== undefined ? frontendTab : this.tabValue;
    // Map: Approved(0) & Rejected(1) → Backend 1, In-Process(2) & Disabled(3) → Backend 0
    return (tab === 0 || tab === 1) ? 1 : 0;
  }

  /**
   * Toggle sort direction for a column
   * @param column - Column name to sort by
   * @param direction - Optional direction ('asc' or 'desc'). If not provided, toggles direction.
   */
  toggleSort(column: string, direction?: 'asc' | 'desc'): void {
    if (direction) {
      // Explicit direction provided (from icon click)
      this.sortColumn = column;
      this.currentSortField = column;
      this.sortDirection = direction;
    } else {
      // No direction provided, toggle (legacy behavior)
      if (this.sortColumn === column) {
        // Toggle direction if same column
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // New column, default to ascending
        this.sortColumn = column;
        this.currentSortField = column;
        this.sortDirection = 'asc';
      }
    }
    
    // Reset to first page when sorting changes
    this.resetPaginationForFilter();
    
    // Fetch data with new sort
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  /**
   * Get sort icon class for a column
   * @param column - Column name
   * @returns CSS class for sort icon
   */
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'fas fa-sort'; // Default unsorted icon
    }
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  /**
   * Check if column is currently sorted
   * @param column - Column name
   * @returns true if column is sorted
   */
  isSorted(column: string): boolean {
    return this.sortColumn === column;
  }

  onPageChange(page: any): void {
    console.log("onPageChange");
    this.page = page;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;

    // Don't reset filterJson - preserve existing filters
    // this.data.filterJson = {};

    // Apply filters with new pagination
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  // New method to handle page size changes
  onPageSizeChange(newPageSize: any): void {
    console.log("onPageSizeChange", newPageSize);
    this.pageSize = newPageSize;

    // Reset to first page when page size changes
    this.resetPaginationForFilter();

    // Apply filters with new page size
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }
protected readonly consValue = Constants;
  ngOnInit(): void {
    console.log('RM Dashboard ngOnInit - checking saved filters');

    // Restore the active tab from saved state before clearing filters
    // This preserves the tab when navigating back from audit/trail log
    const savedFilterRaw = localStorage.getItem('rm_dashboard_filters');
    let restoredTabValue: number | null = null;
    if (savedFilterRaw) {
      try {
        const parsed = JSON.parse(savedFilterRaw);
        if (parsed.tabValue !== undefined && parsed.tabValue !== null) {
          restoredTabValue = parsed.tabValue;
        }
      } catch (e) { /* ignore */ }
    }

    // Clear saved filters on fresh load to prevent stale filter values
    localStorage.removeItem('rm_dashboard_filters');
    const savedFilters = null; // Force fresh load
    console.log('Cleared saved filters for fresh load');

    this.pageData = history.state.data;
        if(!this.pageData || this.pageData === undefined || this.pageData === 'undefined'){
        // this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.HSBC_PRE_QUALIFIED_PRODUCTS)
        this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_NEW, this.consValue.pageMaster.PRE_APPROVED_PRODUCTS);
      }
    let routerData = history.state.routerData;
    if (routerData) {
      if (routerData.oppurtunity) {
        this.fromOpportunity = true;
      }
    }
    if (!this.pageData) {
      this.pageData = JSON.parse(this.commonService.getStorage('pageData', true));
      if (!this.pageData) {
        let pageDatas:any = [];
        let userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
        let roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
        this.commonMethod.getUserPermissionData(
          userId, roleId, Constants.pageMaster.PRE_APPROVED_PRODUCTS,
          (pageData: any) => {
            pageDatas = pageData?.[0];
           this.pageData = pageDatas;
          }
        );
      }
      console.log('pageData == >', this.pageData);
    } else {
      console.log('Data by pd');
      this.commonService.setStorage('pageData', JSON.stringify(this.pageData));
      this.subPages = this.pageData?.subpages;
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmDashboard';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    console.log('Received data:', this.pageData);
    this.commonService.removeStorage("commrcial_pan");
    this.commonService.removeStorage("consumer_pan");
    this.commonService.removeStorage("gst_pan");
    this.commonService.removeStorage("refType");

    this.isCollapsed1 = false;
    this.data.pageIndex = 0;
    this.data.size = this.pageSize;
    this.data.forDownload = false;

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth() - 3, date.getDate() + 1);
    this.data.fromDate = firstDay.getFullYear() + '-' + this.formatDate1(firstDay.getMonth() + 1) + '-' + this.formatDate1(firstDay.getDate());
    var todat = date.getFullYear() + '-' + this.formatDate1(date.getMonth() + 1) + '-' + this.formatDate1(date.getDate());
    this.data.toDate = todat;

    let filterJson: any = {};
    filterJson.paginationFROM = this.page - 1
    filterJson.originatedBy=this.selectPreApprovedType
    filterJson.paginationTO = this.pageSize
    filterJson.fromDate = this.data.fromDate;
    filterJson.toDate = this.data.toDate;
    // FIX: By default, show only Approved applications (selectedOption: "6")
    filterJson.selectedOption = "6";
    this.downloadFromDate = this.data.fromDate;
    this.downloadToDate = this.data.toDate;
    this.data.filterJson = filterJson;
    this.createFilterForm();
    // Set filteredProposalStatus based on default tab (Approved)
    // Default tab is Approved (tab 0), so show only Approved status
    this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');

    // Set default sorting to modifiedDate descending (most recent first)
    if (!savedFilters) {
      this.sortColumn = 'modifiedDate';
      this.currentSortField = 'modifiedDate';
      this.sortDirection = 'desc';
      
      // FIX: Set default filter values for Approved tab on fresh load
      this.isRiskFlag = null;
      this.selectedOption = '6'; // Default to Approved
      this.selectedOptionItem = null;
      // FIX: selectedOptionItems should contain objects, not strings
      this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '6'); // Default to Approved
      this.selectedOptionId = null;
      this.selectedOptionIds = [];
      this.applicationCode = '';
      this.name = '';
      this.pan = '';
      this.campaign = '';
      this.finalEligibleAmount = null;
      this.selectedDate = null;
      this.filteredDate = null;
    }

    // Restore customer type FIRST - before calling getTopBarFilterForRM
    // This ensures selectedCustomerType is restored before API call
    if (savedFilters) {
      try {
        const filterState = JSON.parse(savedFilters);
        // Restore customer type early so API call uses correct value
        this.selectedCustomerType = filterState.selectedCustomerType || 'ALL';
        this.selectedCustomerTypeValue = filterState.selectedCustomerTypeValue || 0;
      } catch (e) {
        console.error('Error parsing saved filters for customer type:', e);
      }
    }

    // Initialize Search By filter options - now uses restored selectedCustomerType
    this.getTopBarFilterForRM();


    // Setup Parent Company search debounce - minimum 3 characters, 400ms delay
    this.parentCompanySearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => prev.searchValue === curr.searchValue)
    ).subscribe(({ searchValue, datasetId }) => {
      if (searchValue.trim().length >= 3 || searchValue.trim().length === 0) {
        this.handleParentCompanySearch(searchValue, datasetId);
      }
    });
    // Restore filter state if available - do this before changeTab
    const hasRestoredFilters = this.restoreFilterState();
    console.log('Has restored filters:', hasRestoredFilters);

    // Use restored tab value or default to 0 (Approved)
    // restoredTabValue comes from saveFilterState which stores tabValue + 1
    // so we use it directly (it maps: 1=Approved, 2=Rejected/InProcess, 3=InProcess, 4=Disabled)
    // But restoreFilterState defaults to 2 if tabValue is present, so just subtract 1 if > 0
    const tabToShow = restoredTabValue != null ? Math.max(restoredTabValue - 1, 0) : 0;
    console.log('Tab to show:', tabToShow);

    // Update form controls with restored dates if available
    if (hasRestoredFilters && this.filterForm) {
      const filterState = JSON.parse(savedFilters);
      if (filterState.fromDate) {
        this.filterForm.controls.fromDate.patchValue(new Date(filterState.fromDate));
      }
      if (filterState.toDate) {
        this.filterForm.controls.toDate.patchValue(new Date(filterState.toDate));
      }
    }

    this.changeTab(tabToShow);

    // If filters were restored, trigger data load immediately without setTimeout
    if (hasRestoredFilters) {
      console.log('Restoring filters and fetching data...');
      this.getHSBCHODashboardDetails(this.getBackendTabValue());

      // Update UI state after a brief delay
      setTimeout(() => {
        this.updateSelectAllState();
        this.cdr.detectChanges();
      }, 100);
    }
  }

  isCollapsed1: boolean = false;
  filterForm: UntypedFormGroup;
  forArray;

  isTabVisible(pageId: string): boolean {
    if (this.pageData && Array.isArray(this.pageData.subSubpages)) {
      for (let page of this.pageData?.subSubpages) {
        if (page?.subpageId === pageId) {
          return true; // Return true if found
        }
      }
    }
    return false; // Return false if not found
  }

  formatValue(value?: number, type?): string {
    // if (value === undefined || value === null || value === 0) {
    //   return (type ? "$" : "₹") + ' 0';
    // }
    if (value === undefined || value === null || (typeof value === 'string' && value === "")) {
      return "NA";
    }
    // else if (value === 0 || value == 0.00) {
    //   return "-";
    // }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: type ? 'USD' : 'INR',
      minimumFractionDigits: 2
    }).format(value);
  }

  // Helper method to filter and return only valid products
  getValidProducts(products: any[]): any[] {
    if (!products || !Array.isArray(products)) {
      return [];
    }
    // Use reference filtering pattern: (item.isReject == undefined || item.isReject==0) && item.finalEligibleAmount !=null
    return products.filter(product =>
      (product.isReject === undefined || product.isReject === 0) &&
      product.finalEligibleAmount != null
    );
  }

  // Collapse state management for individual rows
  collapseStates: { [key: string]: boolean } = {};

  // Toggle collapse for individual customer row
  toggleCollapse(applicationId: string): void {
    this.collapseStates[applicationId] = !this.collapseStates[applicationId];
  }

  // Check if a specific row is collapsed
  isCollapsed(applicationId: string): boolean {
    return this.collapseStates[applicationId] !== false; // Default to collapsed (true)
  }

  // Application-level risk flag: true if ANY product has isRiskFlag = true
  hasAnyProductRiskFlag(breDashboardResList: any[]): boolean {
    if (!breDashboardResList || breDashboardResList.length === 0) return false;
    return breDashboardResList.some(item => item.isRiskFlag === true || item.isRiskFlag === 1);
  }

  // Helper method to parse nonMatchedCriteria (handles both string and array)
  getNonMatchedCriteria(criteria: any): string[] {
    if (!criteria) {
      return [];
    }

    // If it's already an array, return it
    if (Array.isArray(criteria)) {
      return criteria;
    }

    // If it's a string, try to parse it
    if (typeof criteria === 'string') {
      // First try to parse as JSON array
      try {
        const parsed = JSON.parse(criteria);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not a JSON array, continue to string splitting
      }

      // If it's a comma-separated or pipe-separated string, split it
      // Handle formats like: "criteria1, criteria2" or "criteria1 | criteria2"
      if (criteria.includes(',')) {
        return criteria.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else if (criteria.includes('|')) {
        return criteria.split('|').map(c => c.trim()).filter(c => c.length > 0);
      } else if (criteria.trim().length > 0) {
        // If it's a single string without delimiters, return it as a single-item array
        return [criteria.trim()];
      }
    }

    return [];
  }

  createFilterForm(flag?) {
    var date = new Date();
    this.isCollapsed1 = !this.isCollapsed1;
    this.filterForm = this.formBuilder.group({
      fromDate: new UntypedFormControl(new Date(date.getFullYear(), date.getMonth() - 3, date.getDate() + 1)),
      toDate: new UntypedFormControl(new Date())
    });
    this.forArray = Object.keys(this.filterForm.controls);
  }
  formatDate1(val) {
    if (val.toString().length < 2) {
      return "0" + val;
    } else {
      return val;
    }
  }
  changeTab(tabId) {
    console.log("changeTab", tabId);
    this.selectedTabIndex = tabId;

    // Set active card based on tab so the border/highlight shows correctly
    const tabToCardMap = { 0: 'approved', 1: 'rejected', 2: 'inProcess', 3: 'disabled' };
    this.activeCard = tabToCardMap[tabId] || 'approved';

    // Update GlobalHeaders and filteredProposalStatus based on new 4-tab structure
    // Tab 0: Approved (proposalStatus = 6) - uses Completed view
    // Tab 1: Rejected (proposalStatus = 7) - uses Completed view
    // Tab 2: In-Process (proposalStatus = 1,2,3,4,5) - uses In-process view
    // Tab 3: Disabled (proposalStatus = 15) - uses In-process view
    
    if (tabId === 0) {
      GlobalHeaders['x-sub-page'] = 'Approved Applications';
      this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');
    } else if (tabId === 1) {
      GlobalHeaders['x-sub-page'] = 'Rejected Applications';
      this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '7');
    } else if (tabId === 2) {
      GlobalHeaders['x-sub-page'] = 'In-Process Applications';
      // In-Process tab should show: GST Validation (1), Bureau Profile (2), Additional Information (3), Final Assessment (5)
      this.filteredProposalStatus = this.proposalStatus.filter(item => ['1', '2', '3', '5'].includes(item.value));
    } else if (tabId === 3) {
      GlobalHeaders['x-sub-page'] = 'Disabled Applications';
      // Disabled tab should NOT show any stage filter options
      this.filteredProposalStatus = [];
    }

    const hasSavedFilters = localStorage.getItem('rm_dashboard_filters');

    if (tabId != this.tabValue) {
      // Save current tab's Search By filters before switching
      if (this.tabValue !== undefined && this.tabValue !== null) {
        this.selectedItemsMapByTab[this.tabValue] = { ...this.selectedItemsMap };
        this.selectedRmUsersByTab[this.tabValue] = [...this.selectedRmUsers];
        // Save current tab's customer type
        this.selectedCustomerTypeByTab[this.tabValue] = this.selectedCustomerType;
        this.selectedCustomerTypeValueByTab[this.tabValue] = this.selectedCustomerTypeValue;
        // Save current tab's RM search value
        this.rmSearchValueByTab[this.tabValue] = this.rmUserFilter.searchValue || '';
        // Save current tab's City search values
        const citySearchValues: { [datasetId: number]: string } = {};
        Object.keys(this.searchByDataHistory).forEach(key => {
          citySearchValues[Number(key)] = this.searchByDataHistory[Number(key)]?.searchValue || '';
        });
        this.citySearchValueByTab[this.tabValue] = citySearchValues;
        // Save current tab's sort state
        this.sortColumnByTab[this.tabValue] = this.sortColumn;
        this.sortDirectionByTab[this.tabValue] = this.sortDirection;
      }

      this.customerList = [];
      this.tabValue = tabId;

      // PRESERVE text search filters across tab switches (name, applicationCode, pan, etc.)
      // Only clear risk flag since it's tab-specific (Approved tab only)
      this.isRiskFlag = null;

      // Restore new tab's Search By filters
      this.selectedItemsMap = this.selectedItemsMapByTab[tabId] ? { ...this.selectedItemsMapByTab[tabId] } : {};
      this.selectedRmUsers = this.selectedRmUsersByTab[tabId] ? [...this.selectedRmUsersByTab[tabId]] : [];

      // Restore new tab's customer type
      this.selectedCustomerType = this.selectedCustomerTypeByTab[tabId] || 'ALL';
      this.selectedCustomerTypeValue = this.selectedCustomerTypeValueByTab[tabId] || 0;

      // Restore new tab's RM search value and reset filter list
      this.rmUserFilter.searchValue = this.rmSearchValueByTab[tabId] || '';
      // Reset RM option filter to show all or filtered based on search value
      if (this.rmUserFilter.searchValue) {
        this.rmUserFilter.optionFilter = this.rmUserFilter.originalOptionFilter.filter(rm =>
          rm.firstName.toLowerCase().includes(this.rmUserFilter.searchValue.toLowerCase())
        );
      } else {
        this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
      }

      // Restore new tab's City search values
      const restoredCitySearch = this.citySearchValueByTab[tabId] || {};
      Object.keys(this.searchByDataHistory).forEach(key => {
        if (this.searchByDataHistory[Number(key)]) {
          this.searchByDataHistory[Number(key)].searchValue = restoredCitySearch[Number(key)] || '';
        }
      });

      // Update topBarFilters with restored selections using spKeyName directly
      this.topBarFilters.forEach(filter => {
        // Use spKeyName directly as the key for selectedItemsMap
        filter.selectedFilter = this.selectedItemsMap[filter.spKeyName] || [];
      });

      // ALWAYS restore new tab's sort state when switching tabs
      // Check if new tab has saved sort state
      console.log("this.sortColumnByTab[tabId]",this.sortColumnByTab[tabId]);
      
      if (this.sortColumnByTab[tabId]) {
        this.sortColumn = this.sortColumnByTab[tabId];
        this.currentSortField = this.sortColumnByTab[tabId];
        this.sortDirection = this.sortDirectionByTab[tabId];
      } else {
        // Reset to default: no sorting (empty sort column)
        this.sortColumn = '';
        this.currentSortField = '';
        this.sortDirection = 'asc';
      }

      // Only call API if no saved filters (normal flow)
      if (!hasSavedFilters) {
        var date = new Date();
        this.filterForm.controls.fromDate.patchValue(new Date(date.getFullYear(), date.getMonth() - 3, date.getDate() + 1));
        this.filterForm.controls.toDate.patchValue(new Date());

        let filterJson: any = {};
        filterJson.paginationFROM = this.page - 1
        filterJson.paginationTO = this.pageSize
        filterJson.fromDate = this.data.fromDate;
        filterJson.toDate = this.data.toDate;
        filterJson.originatedBy=this.selectPreApprovedType
        
        // FIX: Add default selectedOption based on tab
        // Tab 0: Approved (6), Tab 1: Rejected (7), Tab 2: In-Process (1,2,3,5), Tab 3: Disabled (15)
        if (tabId === 0) {
          filterJson.selectedOption = "6"; // Approved
          this.selectedOption = '6';
          // FIX: selectedOptionItems should contain objects, not strings
          this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '6');
        } else if (tabId === 1) {
          filterJson.selectedOption = "7"; // Rejected
          this.selectedOption = '7';
          this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '7');
        } else if (tabId === 2) {
          filterJson.selectedOption = "1,2,3,5"; // In-Process
          this.selectedOption = '1,2,3,5';
          this.selectedOptionItems = this.proposalStatus.filter(item => ['1', '2', '3', '5'].includes(item.value));
        } else if (tabId === 3) {
          filterJson.selectedOption = "15"; // Disabled
          this.selectedOption = '15';
          this.selectedOptionItems = this.proposalStatus.filter(item => item.value === '15');
        }
        
        this.data.filterJson = filterJson;
      }
      
      // Map frontend tab to backend tab
      // Frontend: 0=Approved, 1=Rejected → Backend: 1 (Completed view)
      // Frontend: 2=In-Process, 3=Disabled → Backend: 0 (In-Process view)
      const backendTab = (tabId === 0 || tabId === 1) ? 1 : 0;
      
      this.getHSBCHODashboardDetails(backendTab);
    } else {
      // Even if tab hasn't changed, we still need to call API on initial load
      const backendTab = (tabId === 0 || tabId === 1) ? 1 : 0;
      this.getHSBCHODashboardDetails(backendTab);
    }

    this.saveFilterState();
  }
  
  resetStartIndex(): void {
    //console.log"in reset");
    this.startIndex = 0;
    this.page = 1;
    this.pageSize = 10;

    this.applicationCode = null;
    this.name = null;
    this.selectedDate = null;
    this.filteredDate = null;
    this.pan = null;
    this.selectedProduct = null;
    this.selectedOption = null;
    this.selectedOptionId = null;
    this.selectedOptionItem = null;
    this.selectedOptionItems = [];
    this.selectedOptionIds = [];
    this.isAllSelected = false;
    this.isIndeterminate = false;
    this.campaign=null;
  }
  
  AddBusinessPANPopup() {
    const dialog = this.dialog.open(HSBCBusinessPANComponent, {
      panelClass: ['w-500px'],
      autoFocus: false,

    });
    dialog.afterClosed().subscribe(result => {
      //console.log`Dialog result: ${result}`);
    });
  }
  public hideRuleContent: boolean[] = [];
  toggle(index) {
    this.hideRuleContent[index] = !this.hideRuleContent[index];
  }

  getHSBCHODashboardDetails(tabId?, forDownload?) {
    console.log('API call started with tabId:', tabId, 'forDownload:', forDownload);
    this.isLoading = true;
    if (!forDownload) {
      this.isSummaryLoading = true;
    }

    if (forDownload == true) {
      let filterJson: any = {};
      this.data.filterJson = filterJson;
    }

    // Always reset filterJson to empty object to avoid stale data
    this.data.filterJson = {};

    let req: any = {};
    req = this.data;
    req = this.getFilterJson(req, forDownload)
    
    // Include summary with data in a single call
    if (!forDownload) {
      let filterJsonObj = typeof req.filterJson === 'string' ? JSON.parse(req.filterJson) : req.filterJson;
      filterJsonObj.includeSummary = true;
      req.filterJson = JSON.stringify(filterJsonObj);
    } else {
      req.filterJson = JSON.stringify(req.filterJson);
    }
    
    req.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);

    if (tabId !== undefined && tabId !== null) {
      req.tab = tabId;
    } else {
      req.tab = this.getBackendTabValue();
    }

    req.forDownload = forDownload;

    this.msmeService.getHSBCHODashboardDetails(req, true).subscribe(res => {
      this.isLoading = false;
      this.isSummaryLoading = false;

      if (res.status === 200) {

        if (forDownload == true) {
          if (req.tab == 0) {
            this.downloadInprocessDataInExcel(res.listData, 1);
          } else {
            this.downloadCompletedDataInExcel(res.listData, 1);
          }
        } else {
          // Parse breDashboardResList if it's a string
          if (res.listData && Array.isArray(res.listData)) {
            res.listData.forEach(customer => {
              if (customer.breDashboardResList && typeof customer.breDashboardResList === 'string') {
                try {
                  customer.breDashboardResList = JSON.parse(customer.breDashboardResList);
                } catch (e) {
                  customer.breDashboardResList = [];
                }
              }
            });
          }
          this.customerList = res.listData || [];
          const apiTotalSize = res.data || 0;
          const listLength = res.listData?.length || 0;
          this.totalSize = apiTotalSize > 0 ? apiTotalSize : listLength;
          
          if (res.summary) {
            this.updateDashboardSummary(res.summary);
          }
          
          this.isSubFilterSearch = false;
          
          if (this.isInitialLoad) {
            this.isInitialLoad = false;
          }

          this.saveFilterState();
        }

      } else {
        this.isSubFilterSearch = false;
        this.customerList = [];
        this.totalSize = 0;
        this.commonService.warningSnackBar(res.message);
      }
    }, (error: any) => {
      this.isLoading = false;
      this.isSummaryLoading = false;
      this.isSubFilterSearch = false;
      this.customerList = [];
      this.totalSize = 0;
      this.commonService.errorSnackBar(error);
    });
  }

  /**
   * Update dashboard summary with merge logic
   */
  private updateDashboardSummary(summary: any) {
    if (!this.dashboardSummary) {
      this.dashboardSummary = summary;
    } else {
      if (summary.approved != null) {
        this.dashboardSummary.approved = summary.approved;
      }
      if (summary.rejected != null) {
        this.dashboardSummary.rejected = summary.rejected;
      }
      if (summary.inProcess != null) {
        this.dashboardSummary.inProcess = summary.inProcess;
      }
      if (summary.disabled != null) {
        this.dashboardSummary.disabled = summary.disabled;
      }
    }
  }
  downloadCompletedDataInExcel(excelData, type) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    const fileName = 'Completed_Applications_' + new Date().toDateString() + a;
    excelData.forEach((element, i) => {
      const index = i + 1;
      var allApplications = null;
      let productNameArray = [];
      let limitArray = [];
      let isRiskFlag = ""
      if (element.breDashboardResList && element.breDashboardResList.length > 0) {
        element.breDashboardResList.forEach((breData, i) => {
          if (breData.isMatched) {
            productNameArray.push(breData.fpProductName);
            limitArray.push(this.commonMethod.currencyMaskForObject(breData.finalEligibleAmount));
            if (i == 0) {
              isRiskFlag = breData.isRiskFlag;
            }
          }
        });
      }

      allApplications = [{
        Sr_no: index,
        'Application Code': element.applicationCode ? element.applicationCode : '-',
        'Name Of Borrower': element.borrowerName ? element.borrowerName : '-',
        'PAN': element.pan ? element.pan : '-',
        'Product': productNameArray.join(" / "),
        'Proposal status': element.displayName ? element.displayName : '-',
        'Reject/Susspend Reason': element.terminateReason ? element.terminateReason : '-',
        'Limit Approved': limitArray.join(" / "),
        'Risk Flag': isRiskFlag ? 'Yes' : 'No',
        'Application Start Date ': element.createdDate ? element.createdDate : '-',
        'Last Modified Date ': element.modifiedDate ? element.modifiedDate : '-',
      }];
      downloadData = downloadData.concat(allApplications);
    });
    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  downloadInprocessDataInExcel(excelData, type) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    const fileName = 'In-process_Applications_' + new Date().toDateString() + a;
    excelData.forEach((element, i) => {
      const index = i + 1;
      var allApplications = null;
      allApplications = [{
        Sr_no: index,
        'Application Code': element.applicationCode ? element.applicationCode : '-',
        'Name Of Borrower': element.borrowerName ? element.borrowerName : '-',
        'PAN': element.pan ? element.pan : '-',
        'Product': 'Corporate Cards',
        'Proposal status': element.displayName ? element.displayName : '-',
        'Application Start Date ': element.createdDate ? element.createdDate : '-',
        'Last Modified Date ': element.modifiedDate ? element.modifiedDate : '-',
      }];
      downloadData = downloadData.concat(allApplications);
    });
    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  downloadExcelFile(applicationId?) {
    //console.log"in method");
    const req: any = {};
    req.applicationId = applicationId;
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadExcelFile(req).subscribe(res => {
      //console.logres);
      if (res.status === 200 && res.contentInBytes) {
        this.downloadExcel(res.contentInBytes, 'CAM Report_' + applicationId);
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


  getFilterJson(req, forDownload?) {
    // Ensure filterJson is always an object, not a string
    let filterJson: any;
    if (typeof req.filterJson === 'string') {
      try {
        filterJson = JSON.parse(req.filterJson);
      } catch (e) {
        filterJson = {};
      }
    } else {
      filterJson = req.filterJson || {};
    }

    if (this.filterForm.controls.fromDate.value) {
      var fromDate1 = this.filterDateFormat(this.filterForm.controls.fromDate.value).split("-");
      var fromDate = this.formatDate1(fromDate1[2]) + '-' + this.formatDate1(fromDate1[1]) + '-' + this.formatDate1(fromDate1[0]);
      filterJson.fromDate = fromDate;
      this.downloadFromDate = fromDate;
      localStorage.setItem("fromDate", fromDate);
    }
    if (this.filterForm.controls.toDate.value) {
      var toDate1 = this.filterDateFormat(this.filterForm.controls.toDate.value).split("-");
      var todate = this.formatDate1(toDate1[2]) + '-' + this.formatDate1(toDate1[1]) + '-' + this.formatDate1(toDate1[0]);
      filterJson.toDate = todate
      this.downloadToDate = todate
      localStorage.setItem("toDate", todate);
    }

    // filterJson.fromDate = this.data.fromDate;
    // filterJson.toDate = this.data.toDate;
    filterJson.originatedBy=this.selectPreApprovedType
    
    // PERFORMANCE OPTIMIZATION: Only include summary on initial load or when explicitly requested
    // This reduces API response time significantly by skipping 4 COUNT queries
    if (!forDownload) {
      filterJson.paginationFROM = this.startIndex
      filterJson.paginationTO = this.pageSize
      
      // includeSummary is controlled by the caller (getHSBCHODashboardDetails / fetchSummaryInBackground)
      // Default to false here - caller will override as needed
      filterJson.includeSummary = false;
      // Send frontend tab (0=Approved, 1=Rejected, 2=In-Process, 3=Disabled) so backend
      // knows which specific tab the sub-filters apply to
      filterJson.frontendTab = this.tabValue;
    } else {
      filterJson.paginationFROM = this.startIndex
      filterJson.paginationTO = this.totalSize
      filterJson.includeSummary = false; // Never include summary for download
    }

    // Handle text filters - add if they have values, remove if they're empty
    if (this.applicationCode && this.applicationCode.trim()) {
      filterJson.applicationCode = this.applicationCode;
    } else {
      delete filterJson.applicationCode; // Remove if empty
    }

    if (this.name && this.name.trim()) {
      filterJson.name = this.name;
    } else {
      delete filterJson.name; // Remove if empty
    }

    if (this.finalEligibleAmount && this.finalEligibleAmount.toString().trim()) {
      filterJson.finalEligibleAmount = this.finalEligibleAmount;
    } else {
      delete filterJson.finalEligibleAmount; // Remove if empty
    }

    if (this.pan && this.pan.trim()) {
      filterJson.pan = this.pan;
    } else {
      delete filterJson.pan; // Remove if empty
    }

    if (this.campaign && this.campaign.trim()) {
      filterJson.campaign_name = this.campaign;
    } else {
      delete filterJson.campaign_name; // Remove if empty
    }

    // Handle other filters
    if (this.isRiskFlag) {
      filterJson.isRiskFlag = this.isRiskFlag;
    } else {
      delete filterJson.isRiskFlag; // Remove if not selected
    }

    if (this.selectedOption) {
      filterJson.selectedOption = this.selectedOption;
    } else {
      delete filterJson.selectedOption; // Remove if not selected
    }

    if (this.selectedOptionIds && this.selectedOptionIds.length > 0) {
      filterJson.selectedOptionId = this.selectedOptionIds.join(',');
    } else {
      delete filterJson.selectedOptionId; // Remove if empty
    }

    if (this.filteredDate) {
      filterJson.selectedDate = this.formatDateSafe(this.filteredDate);
    } else {
      delete filterJson.selectedDate; // Remove if not selected
    }
    // Handle Search By filters from topBarFilters
    this.topBarFilters.forEach(f1 => {
      if (f1?.selectedFilter && f1.selectedFilter.length > 0) {
        filterJson[f1?.spKeyName] = f1?.selectedFilter;
      } else {
        // Remove the filter key if nothing is selected
        delete filterJson[f1?.spKeyName];
      }
    });

    if (this.selectedRmUsers && this.selectedRmUsers.length > 0) {
      filterJson.rmUsers = this.selectedRmUsers;
    } else {
      delete filterJson.rmUsers;
    }

        // Add customer type to filter (numeric value: 1=ETB, 2=Target, [3,4,5,6]=Prospect, 10=NTB)
    if (this.selectedCustomerTypeValue) {
      filterJson.customerType = this.selectedCustomerTypeValue;
    }else {
      delete filterJson.customerType;
    }

    // Add NTB specific filter to exclude existing customers
    if (this.selectedCustomerType === 'NTB') {
      filterJson.excludeExistingCustomers = true;
    } else {
      delete filterJson.excludeExistingCustomers;
    }

    // Add sorting parameters
    if (this.sortColumn) {
      filterJson.sortColumn = this.sortColumn;
      filterJson.sortDirection = this.sortDirection;
    } else {
      delete filterJson.sortColumn;
      delete filterJson.sortDirection;
    }

    filterJson.roleId =  this.roleId;

    req.filterJson = filterJson;
    return req;
  }
  formateDate(date) {
    var date1 = date.toLocaleDateString().split('/');
    let day = date1[1];
    date1[1] = date1[0];
    date1[0] = date1[2];
    date1[2] = day;
    return date1.join('-');
  }
  filterDateFormat(date) {
    var date1 = date.toLocaleDateString('en-US').split('/');
    let day = date1[1];
    date1[1] = date1[0];
    date1[0] = day;
    date1[2] = date1[2];
    return date1.join('-');
  }
  formatDateSafe(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

  getDateRangeDisplay(): string {
    const from = this.filterForm?.controls?.fromDate?.value;
    const to = this.filterForm?.controls?.toDate?.value;
    if (from && to) {
      const fd = new Date(from);
      const td = new Date(to);
      const fmt = (d: Date) => d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getFullYear();
      return fmt(fd) + ' - ' + fmt(td);
    }
    return 'For Period';
  }

  onSelectionChange(event: any) {
    setTimeout(() => {
      // Update the select all state based on current selection
      this.updateSelectAllState();
      this.saveFilterState();
      this.onNameInput();
    });
  }

  getSelectedLabels(): string {
    return this.selectedOptionItems
      .filter(item => item !== 'all' && typeof item === 'object')
      .map(item => item.viewValue)
      .join(', ');
  }

  getDisplayText(): string {
    if (this.isAllSelected) {
      return 'All';
    }
    if (this.selectedOptionItems.length === 0) {
      return '';
    }
    return this.getSelectedLabels();
  }


  toggleSelectAll() {
    // Remove any 'all' string values that might have been added
    const actualSelectedItems = this.selectedOptionItems.filter(item => item !== 'all' && typeof item === 'object');

    if (actualSelectedItems.length === this.filteredProposalStatus.length) {
      // Deselect all
      this.selectedOptionItems = [];
    } else {
      // Select all - only add the actual items from filteredProposalStatus
      this.selectedOptionItems = [...this.filteredProposalStatus];
    }

    this.updateSelectAllState();
    this.saveFilterState();
    this.onNameInput();
  }

  updateSelectAllState() {
    const actualSelectedItems = this.selectedOptionItems.filter(item => item !== 'all' && typeof item === 'object');
    const totalItems = this.filteredProposalStatus.length;

    this.isAllSelected = actualSelectedItems.length === totalItems && totalItems > 0;
    this.isIndeterminate = actualSelectedItems.length > 0 && actualSelectedItems.length < totalItems;

    if (this.selectedOptionItems.some(item => item === 'all' || typeof item !== 'object')) {
      this.selectedOptionItems = actualSelectedItems;
    }

    this.cdr.detectChanges();
  }

  private searchDebounceTimer: any;

  onNameInput(event?: KeyboardEvent, type?, events?) {

    if (this.selectedOptionItems && this.selectedOptionItems.length > 0) {
      const filteredItems = this.selectedOptionItems.filter(item => item !== 'all');
      const uniqueValues = [...new Set(filteredItems.map(item => item.value))];
      const uniqueIds = [...new Set(filteredItems.map(item => item.selectedOptionId).filter(id => id))];

      this.selectedOption = uniqueValues.length > 0 ? uniqueValues.join(',') : null;
      // For In-Process tab, always include status 4 in the query even though it's not in the dropdown
      if (this.tabValue === 2 && this.selectedOption && !this.selectedOption.includes('4')) {
        this.selectedOption = this.selectedOption + ',4';
      }
      this.selectedOptionIds = uniqueIds;
    }
    
    // If no specific stage filter is selected, apply default based on current tab
    // This prevents showing wrong statuses (e.g., Disabled in In-Process tab)
    if (!this.selectedOption) {
      this.applyDefaultSelectedOption();
    }

    this.resetPaginationForFilter();

    if(this.selectedDate){
      this.filteredDate = new Date(this.selectedDate);
    }
    if (type == 3) {
      this.selectedDate = events.value;
      this.filteredDate = new Date(this.selectedDate);
      // Save state immediately when date changes
      this.saveFilterState();
    }

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    const areAllTextFieldsEmpty = (
      (!this.applicationCode || this.applicationCode.trim() === '') &&
      (!this.name || this.name.trim() === '') &&
      (!this.pan || this.pan.trim() === '') &&
      (!this.campaign || this.campaign.trim() === '') &&
      (!this.finalEligibleAmount || this.finalEligibleAmount.toString().trim() === '') &&
      !this.selectedOption &&
      !this.isRiskFlag &&
      !this.filteredDate
    );

    if (event?.keyCode === 8 || type === 3 || areAllTextFieldsEmpty) {
      this.checkAndTriggerSearch(event);
    } else {
      this.searchDebounceTimer = setTimeout(() => {
        this.checkAndTriggerSearch(event);
      }, 300); // 300ms debounce
    }
  }

  // New method to handle search logic more comprehensively
  checkAndTriggerSearch(event?: KeyboardEvent) {
    // Trigger API call if:
    // 1. Backspace key is pressed (user is deleting)
    // 2. Any field has sufficient length (>3 characters) for search
    // 3. Any non-text filter is applied (dropdown selections, etc.)
    // 4. All text fields are empty AND no other filters are applied (show all data)

    const hasTextFilters = (
      (this.applicationCode && this.applicationCode.trim().length > 0) ||
      (this.name && this.name.trim().length > 0) ||
      (this.pan && this.pan.trim().length > 0) ||
      (this.campaign && this.campaign.trim().length > 0) ||
      (this.finalEligibleAmount && this.finalEligibleAmount.toString().trim().length > 0)
    );

    const hasNonTextFilters = (
      this.isRiskFlag ||
      this.filteredDate
    );

    const hasLongTextFilters = (
      (this.applicationCode && this.applicationCode.length >= 4) ||
      (this.name && this.name.length >= 4) ||
      (this.pan && this.pan.length >= 4) ||
      (this.campaign && this.campaign.length >= 4) ||
      (this.finalEligibleAmount && this.finalEligibleAmount.toString().length >= 4)
    );

    // Trigger API call in these scenarios:
    if (event?.keyCode === 8 ||  // Backspace pressed
        hasLongTextFilters ||     // Text fields have enough characters
        hasNonTextFilters ||      // Non-text filters are applied
        (!hasTextFilters && !hasNonTextFilters)) { // No filters at all (show all data)

      console.log('Triggering search with conditions:', {
        backspace: event?.keyCode === 8,
        hasLongTextFilters,
        hasNonTextFilters,
        noFilters: (!hasTextFilters && !hasNonTextFilters),
        currentValues: {
          applicationCode: this.applicationCode,
          name: this.name,
          pan: this.pan,
          campaign: this.campaign,
          finalEligibleAmount: this.finalEligibleAmount
        }
      });

      // Save current filter state before triggering search
      this.saveFilterState();
      // Sub-filter search: only update current tab's count
      this.isSubFilterSearch = true;
      this.getHSBCHODashboardDetails(this.getBackendTabValue());
    }
  }

  // Method to explicitly handle field clearing
  onFieldClear(fieldName: string) {
    // Only trigger refresh if the field is actually empty
    const fieldValue = this[fieldName];
    if (!fieldValue || fieldValue.toString().trim() === '') {
      console.log(`Field ${fieldName} is empty, refreshing data`);
      this.resetPaginationForFilter();
      this.isSubFilterSearch = true;
      this.getHSBCHODashboardDetails(this.getBackendTabValue());
    }
  }

  // Method to explicitly clear all text filters
  clearAllTextFilters() {
    this.applicationCode = null;
    this.name = null;
    this.pan = null;
    this.campaign = null;
    this.finalEligibleAmount = null;

    console.log('All text filters cleared, refreshing data');
    this.resetPaginationForFilter();
    this.isSubFilterSearch = true;
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  // New method to reset pagination when filters are applied
  resetPaginationForFilter(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  viewTeaser(applicationId, type: any) {
    // Save current filter state before navigation
    this.saveFilterState();

    this.commonService.setStorage('applicationId', applicationId);
    this.commonService.setStorage('auditType', type);
    this.commonService.setStorage('tab', type);
    let routerData = {};
    if (type == 1) {
      routerData["apiType"] = AuditAPIType.PRE_APPROVED_API_AUDIT;
    } else if (type == 3) {
      routerData["apiType"] = AuditAPIType.CIBIL_ADUIT;
    }

    this.router.navigate(['/hsbc/apiAuditLog'], { state: { routerData } });
    // }
  }

  viewTrailLog(applicationId: any) {
    // Save current filter state before navigation
    this.saveFilterState();

    let routerData = {
      applicationId: applicationId
    };
    this.router.navigate(['/hsbc/trailLog'], { state: { routerData } });
  }

  getMCAStageAuditData(applicationId, auditType) {
    this.stageauditList = []

    const data = {
      applicationId: applicationId,
      auditType: auditType,
      pageIndex: this.startIndex,
      size: this.pageSize,
    };

    this.msmeService.getStageAuditListfORaPPLICATION(data).subscribe(res => {
      this.stageauditList = [];
      this.totalSize = 0;
      if (res && res.data) {
        if (auditType != 4) {
          this.stageauditList = res.data;
          // if(this.isShowAuditAPI === 'false' || this.isShowAuditAPI === 'null'){
          this.stageauditList = JSON.parse(res.data[0]?.response);
          console.log("this.stageauditList", this.stageauditList.data?.companyHistory);
          this.downloadTxtFile(JSON.parse(this.stageauditList.data?.companyHistory), applicationId);
          // this.totalSize=this.stageauditList.length;
          // }

        }

      }
    });
  }
  downloadTxtFile(jsonData?, applicationId?) {
    const jsonDataStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonDataStr], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MCA_COMPANY_HISTORY_' + applicationId + '.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  removeValueFromControl(isCalledFromSelect?, skipDataRefresh = false) {
    this.applicationCode = null;
    this.name = null;
    this.selectedDate = null;
    this.filteredDate = null;
    this.pan = null;
    this.campaign = null;
    this.selectedProduct = null;
    this.selectedOptionId = null;
    this.selectedOptionItem = null;
    this.selectedOptionItems = [];
    this.selectedOptionIds = [];
    this.isAllSelected = false;
    this.isIndeterminate = false;
    this.finalEligibleAmount = null;
    this.isRiskFlag = null;

    // Re-apply default selectedOption based on current tab
    // This ensures the correct proposal statuses are filtered after clearing
    this.applyDefaultSelectedOption();

    // NOTE: Search By filters (City, Parent Company, Parent Country, RM) are PRESERVED
    // when radio button changes - they are NOT cleared here
    // Only clear them when explicitly calling resetAllSearchByFilters()

    // Clear saved filter state
    localStorage.removeItem('rm_dashboard_filters');

    // Reset pagination when clearing filters
    this.resetPaginationForFilter();

    if (isCalledFromSelect) {
      return;
    }

    // Reset date filters to default
    var date = new Date();
    this.filterForm.controls.fromDate.patchValue(new Date(date.getFullYear(), date.getMonth() - 3, date.getDate() + 1));
    this.filterForm.controls.toDate.patchValue(new Date());

    // Update data object with reset dates
    var firstDay = new Date(date.getFullYear(), date.getMonth() - 3, date.getDate() + 1);
    this.data.fromDate = firstDay.getFullYear() + '-' + this.formatDate1(firstDay.getMonth() + 1) + '-' + this.formatDate1(firstDay.getDate());
    var todat = date.getFullYear() + '-' + this.formatDate1(date.getMonth() + 1) + '-' + this.formatDate1(date.getDate());
    this.data.toDate = todat;

    // Refresh data unless explicitly skipped
    if (!skipDataRefresh) {
      this.getHSBCHODashboardDetails(this.getBackendTabValue());
    }
  }

  callMethodBasesOnTab(data, isFirst: boolean) {

    data.forDownload = false;

    if (isFirst) {
      this.resetPaginationForFilter();
    }
    if (this.filterForm && (this.filterForm.controls.fromDate.value || this.filterForm.controls.toDate.value)) {
      this.callFilterOnTab();
    } else {
      // data.tab = this.tab;
      this.getHSBCHODashboardDetails(this.getBackendTabValue());
    }

  }
  callFilterOnTab() {

    let filterJson: any = {};

    if (this.filterForm.controls.fromDate.value) {
      var fromDate1 = this.filterDateFormat(this.filterForm.controls.fromDate.value).split("-");
      var fromDate = this.formatDate1(fromDate1[2]) + '-' + this.formatDate1(fromDate1[1]) + '-' + this.formatDate1(fromDate1[0]);
      filterJson.fromDate = fromDate;
      this.downloadFromDate = fromDate;
      localStorage.setItem("fromDate", fromDate);
    }
    if (this.filterForm.controls.toDate.value) {
      var toDate1 = this.filterDateFormat(this.filterForm.controls.toDate.value).split("-");
      var todate = this.formatDate1(toDate1[2]) + '-' + this.formatDate1(toDate1[1]) + '-' + this.formatDate1(toDate1[0]);
      filterJson.toDate = todate
      this.downloadToDate = todate
      localStorage.setItem("toDate", todate);
    }
    const from = new Date(fromDate)
    const to = new Date(todate)
    if (from > to) {
      this.commonService.warningSnackBar("Start Date cannot be more than the end Date");
      return false;
    }
    var curr = new Date();
    var toDate1 = this.filterDateFormat(this.filterForm.controls.toDate.value).split("-");
    if (curr.getFullYear() < to.getFullYear()) {
      this.commonService.warningSnackBar("End date cannot be more than the current date");
      return false;
    }
    filterJson.originatedBy=this.selectPreApprovedType

    // Reset pagination when date filters are applied
    this.resetPaginationForFilter();

    filterJson.paginationFROM = this.startIndex
    filterJson.paginationTO = this.pageSize
    this.data.filterJson = filterJson
    // Save current filter state before applying date filter
    this.saveFilterState();
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  closeFilter(menuTrigger: MatMenuTrigger) {
    menuTrigger.closeMenu();
  }

  PageResetcont() {
    this.resetPaginationForFilter();
    // default page size
    this.pageSize = 10;
  }

  getAllDocuments(cibilId,indCibilidList) {
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…"); // type 1 for CIBIL 2 for CRIF
    this.msmeService.downloadCommercialReport(cibilId).subscribe(res => {
      if (res && res?.data) {
        this.blobToFile(atob(res.data), "text/html", cibilId);
      }

    }, error => {
      this.commonService.errorSnackBar(error.message);
    });

    const cibilIds = indCibilidList?.map(item => item.cibil_id).join(",");
    if(indCibilidList!= null){
      this.msmeService.downloadConsumerZipReport(cibilIds).subscribe(resp => {
        if (resp != null && resp?.zipBase64) {
          this.downloadFile(resp.zipBase64, ("CIBIL_Consumer_") + indCibilidList + ".zip");
        }
      }, (error: any) => {
        this.commonService.errorSnackBar(error);
      });
    }

  }

  downloadFile(base64String, fileName) {
    const source = `data:application/zip;base64,${base64String}`;
    const a: any = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display:none';
    const url = source;
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
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
  navigateToBulkUpload() {
    this.router.navigate(['/hsbc/Bulk-Upload'], { state: { data: this.pageData } });
  }

  /**
   * Navigate to firm profile (Existing Portfolio View) by PAN.
   * If PAN is not available, show error and stay on current page.
   */
  navigateToFirmProfile(pan: string, borrowerName?: string): void {
    if (!pan) {
      this.commonService.warningSnackBar('Company profile not available. This company does not currently have a profile in the system.');
      return;
    }

    this.msmeService.checkCustomerProfileExists(pan).subscribe(res => {
      if (res && res.status === 200 && res.data === true) {
        this.saveFilterState();
        const portfolioPageData = this.commonService.getPageData(
          this.consValue.pageMaster.PORTFOLIO_NEW,
          this.consValue.pageMaster.EXISTING_PORTFOLIO
        );
        if (!portfolioPageData) {
          this.commonService.warningSnackBar('Company profile not available. This company does not currently have a profile in the system.');
          return;
        }
        const routerData = { pan: pan, tabId: 1 };
        this.router.navigate(['/hsbc/rmExisitingPortfolioView'], {
          state: { routerData, data: portfolioPageData, dataFrom: this.pageData, isFromParentPage: true }
        });
      } else {
        this.commonService.warningSnackBar('Company profile not available. This company does not currently have a profile in the system.');
      }
    }, () => {
      this.commonService.warningSnackBar('Company profile not available. This company does not currently have a profile in the system.');
    });
  }

  redirectToBorrowerModule(applicationId?, panNo?, redirectUrl?) {
     this.commonService.removeStorage('historyState');
    console.log("roleId => ", this.roleId)
    let cookiesObje: any = this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
    cookiesObje = JSON.parse(cookiesObje);
    cookiesObje.token = cookiesObje.tk_lg;
    cookiesObje.orgId = this.commonService.getStorage(Constants.httpAndCookies.ORGID, true)
    cookiesObje.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    cookiesObje.userType = this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true);
    cookiesObje.campaignCode = this.commonService.getStorage(Constants.httpAndCookies.CAMPIGN_CODE, true);
    cookiesObje.type = 1;
    cookiesObje.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);

    cookiesObje.businessTypeId = this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true);
    cookiesObje.roleId = this.roleId;
    cookiesObje.isShowAuditView = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, true);
    cookiesObje.isShowNewCAMKFSButton = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_NEW_CAM_KFS_BTN, true);

    this.commonService.setStorage(Constants.httpAndCookies.ENV_ORG_ID, environment.orgId.toString());
    cookiesObje.environmentOrgId = environment.orgId;
    cookiesObje.platForm_id = environment.platFormId;
    if (applicationId) {
      cookiesObje.applicationId = applicationId;
    }
    if (panNo) {
      cookiesObje.panNo = panNo;
    }

    if (this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true)) {
      cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
      console.log("msalAccessToken string=", true);
    }

    if (this.roleId == 9) {
      cookiesObje.branchId = this.commonService.getStorage('branchId', true);
    }
    this.commonService.setStorage(Constants.httpAndCookies.NEW_ROLE_ID, this.roleId);
    let cookieString = JSON.stringify(cookiesObje);
    if (Constants.IS_LOCAL) {
      window.location.href = 'http://localhost:4500/redirect?data=' + this.commonService.toBTOA(cookieString);;
    } else {
      let UUID = crypto.randomUUID();
      this.commonService.setStorage(UUID, cookieString)
      window.location.href = Constants.LOCATION_URL + '/hsbc/application' + '/redirect?data=' + this.commonService.toBTOA(UUID);
    }
  }

  isActionAvail(actionId: string): boolean {
    if (this.pageData && Array.isArray(this.pageData.actions)) {
      // Loop through actions and check for actionId
      for (let page of this.pageData.actions) {
        if (page?.actionId === actionId) {
          return true; // Return true if actionId matches
        }
      }
    }
    return false; // Return false if not found
  }

  isActionAvailforSubpage(subPageId: any, actionId: string): boolean {
    const matchedSubPage = this.pageData?.subSubpages?.find(sub => sub.subpageId === subPageId);
    const matchedSubPageAction = matchedSubPage?.actions?.find(action => action.actionId === actionId);
    if (matchedSubPageAction) {
      return true;
    }
    return false;
  }

  redirectToExisitingPortfolio() {
    history.state.routerData.selectedTabIndex = 1;
    this.router.navigate(['hsbc/rmExisitingPortfolioView'], {
      state: { data: history.state.dataFrom, routerData: history.state.routerData },
    });
  }
  getHoDashBroadDataDownloandWithExcel() {
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    let req: any = {};
    req = this.data;
    req.filterJson = JSON.parse(req.filterJson);
    req = this.getFilterJson(req, true)
    req.filterJson['paginationFROM'] = 0

    req.filterJson = JSON.stringify(req.filterJson);
    req.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);

    // Set tab to current active tab so backend returns correct data
    req.tab = this.getBackendTabValue();
    req.forDownload = true;

    this.msmeService.getHSBCHODashboardDetails(req, true).subscribe((res) => {
      console.log('download ', res.listData)
      this.downloadDataInExcel(res.listData, 1);
    })
  }
onJourneyTypeChange(value: number) {
  this.selectPreApprovedType = value;

  // Clear all filters but preserve the journey type
  this.removeValueFromControl(false, true);

  // Update filterJson with new journey type
  if (this.data && this.data.filterJson) {
    let filterJson =
      typeof this.data.filterJson === 'string'
        ? JSON.parse(this.data.filterJson)
        : this.data.filterJson;

    filterJson.originatedBy = value;
    this.data.filterJson = filterJson;
  }

  // Reset pagination when journey type changes
  this.resetPaginationForFilter();

  // Refresh data with new journey type
  this.getHSBCHODashboardDetails(this.getBackendTabValue());
}

  resetFilter() {
    this.removeValueFromControl(false, false);
  }

  downloadDataInExcel(excelData: any, type) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
    // Check if current tab shows In-Process view (tabs 2 & 3) or Completed view (tabs 0 & 1)
    if (this.showInProcessView()) {
      fileName = 'Pre Approved-In-process Applications';
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        const [date, time] = element.createdDate?.split(' ') ?? ['-', '-'];

        let applicationData: any = {
          'Sr_no': index,
          'Application code': element.applicationCode ?? '-',
          'Name of borrower': element.borrowerName ?? '-',
          'PAN': element.pan ?? '-',
          'Date of Application': element.createdDate ?? '-',
          'Time of Application':  element.createdTime ?? '-',
          'RM Name': element.rmName ?? '-',
          'PSID': element.psId ?? '-',
          'City': element.city ?? '-',
          'Segment': element.segment ?? '-',
          'CIN': element.cin ?? '-',
          'CMR': element.cmr ?? '-',
          'Credit Rating': element.creditRating ?? '-',
          'CRR': element.crr ?? '-',
          'Customer Type': element.customerType ?? '-',
          'Stage': element.displayName ?? '-'
        };

        allApplications = [applicationData];
        downloadData = downloadData.concat(allApplications);
      });
    } else {
      fileName = 'Pre Approved-Completed Applications';
      let serialNumber = 1;
      excelData.forEach((element, i) => {
        // let productNameArray = [];
        // let limitArray = [];
        let isRiskFlag = "";


  // ✅ FIX: Normalize breDashboardResList
  if (element.breDashboardResList) {
    if (typeof element.breDashboardResList === 'string') {
      try {
        element.breDashboardResList = JSON.parse(element.breDashboardResList);
      } catch (e) {
        element.breDashboardResList = [];
      }
    } else if (!Array.isArray(element.breDashboardResList)) {
      element.breDashboardResList = [element.breDashboardResList];
    }
  } else {
    element.breDashboardResList = [];
  }

  // 👇 existing logic continues

        if (element.breDashboardResList && element.breDashboardResList.length > 0) {
          element.breDashboardResList.forEach((breData, i) => {
            console.log(breData);

            // if (breData.isMatched) {
              // productNameArray.push(breData.fpProductName);
              // limitArray.push(this.commonMethod.currencyMaskForObject(breData.finalEligibleAmount));
              if (i == 0) {
                isRiskFlag = breData.isRiskFlag;
              }
              var allApplications = null;
              // const [date, time] = element.createdDate?.split(' ') ?? ['-', '-'];

            let applicationData: any = {
              'Sr_no': serialNumber,
              'Application code': element.applicationCode ?? '-',
              'Name of borrower': element.borrowerName ?? '-',
              'Date of Application': element.createdDate ?? '-',
              'Time of Application': element.createdTime ?? '-',
              'PAN': element.pan ?? '-',
              'RM Name': element.rmName ?? '-',
              'PSID': element.psId ?? '-',
              'City': element.city ?? '-',
              'Segment': element.segment ?? '-',
              'CIN': element.cin ?? '-',
              'CMR': element.cmr ?? '-',
              'Credit Rating': element.creditRating ?? '-',
              'CRR': element.crr ?? '-',
              'Customer Type': element.customerType ?? '-',
              'Product': breData.fpProductName ?? '-',
              'Product Version': breData.productVersion ?? '-',
              'Product Version Status': breData.productStatus ?? '-',
              'Status': (breData.isReject === 1 || breData.isReject === true) && (breData.finalEligibleAmount == null || breData.finalEligibleAmount == undefined || breData.finalEligibleAmount === 0 || breData.finalEligibleAmount === '0') ? 'Ineligible' : (element.displayName ?? '-'),
              'Limit Approved': this.formatValue(
                  breData.finalEligibleAmount == null ? 0 : breData.finalEligibleAmount,
                  breData.eligibilityType === 3 ? 2 : null
              ),
              'Risk Flag': breData.isRiskFlag == true ? 'Yes' : 'No',
              'Count of Risk Flags': breData.isRiskFlag == true ? (breData.riskFlagCount)  : 'NA'
            };
              allApplications = [applicationData];
              serialNumber++
              downloadData = downloadData.concat(allApplications);
            // }
          });
        } else {
          var allApplications = null;
          const [date, time] = element.createdDate?.split(' ') ?? ['-', '-'];

          let applicationData: any = {
            'Sr_no': serialNumber,
            'Application code': element.applicationCode ?? '-',
            'Name of borrower': element.borrowerName ?? '-',
            'Date of Application': element.createdDate ?? '-',
            'Time of Application': element.createdTime ?? '-',
            'PAN': element.pan ?? '-',
            'RM Name': element.rmName ?? '-',
            'PSID': element.psId ?? '-',
            'City': element.city ?? '-',
            'Segment': element.segment ?? '-',
            'CIN': element.cin ?? '-',
            'CMR': element.cmr ?? '-',
            'Credit Rating': element.creditRating ?? '-',
            'CRR': element.crr ?? '-',
            'Customer Type': element.customerType ?? '-',
            'Product':  '-',
            'Product Version': element.productVersion ?? '-',
            'Product Version Status': element.productStatus ?? '-',
            'Status': element.displayName ?? '-',
            'Limit Approved':'-',
            'Risk Flag': 'No',
            'Count of Risk Flags': 'NA'
          };

          allApplications = [applicationData];
          serialNumber++;
          downloadData = downloadData.concat(allApplications);
        }
      });
    }
    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }


  ngOnDestroy(): void {
    this.saveFilterState();

    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  saveFilterState(): void {
    const filterState = {
      applicationCode: this.applicationCode,
      name: this.name,
      pan: this.pan,
      campaign: this.campaign,
      finalEligibleAmount: this.finalEligibleAmount,
      selectedOption: this.selectedOption,
      selectedOptionIds: this.selectedOptionIds,
      selectedOptionItems: this.selectedOptionItems,
      // DO NOT save isRiskFlag - it should not persist across sessions
      // isRiskFlag: this.isRiskFlag,
      filteredDate: this.filteredDate,
      selectedDate: this.selectedDate,
      selectedRmUsers: this.selectedRmUsers,
      selectedCheckboxesForApply: this.selectedCheckboxesForApply,
      topBarFilters: this.topBarFilters,
      fromDate: this.filterForm?.controls?.fromDate?.value,
      toDate: this.filterForm?.controls?.toDate?.value,
      tabValue: this.tabValue + 1,
      page: this.page,
      pageSize: this.pageSize,
      selectPreApprovedType: this.selectPreApprovedType,
      selectedCustomerType: this.selectedCustomerType,
      selectedCustomerTypeValue: this.selectedCustomerTypeValue,
      // Save tab-specific customer types
      selectedCustomerTypeByTab: this.selectedCustomerTypeByTab,
      selectedCustomerTypeValueByTab: this.selectedCustomerTypeValueByTab,
      // Save Search By filter selections (Parent Company, City, etc.)
      selectedItemsMap: this.selectedItemsMap,
      selectedItemsMapByTab: this.selectedItemsMapByTab,
      selectedRmUsersByTab: this.selectedRmUsersByTab,
      // Save sort state per tab
      sortColumnByTab: this.sortColumnByTab,
      sortDirectionByTab: this.sortDirectionByTab
    };

    localStorage.setItem('rm_dashboard_filters', JSON.stringify(filterState));
  }


  restoreFilterState(): boolean {
    try {
      const savedState = localStorage.getItem('rm_dashboard_filters');

      if (savedState) {
        const filterState = JSON.parse(savedState);

        this.applicationCode = filterState.applicationCode || null;
        this.name = filterState.name || null;
        this.pan = filterState.pan || null;
        this.campaign = filterState.campaign || null;
        this.finalEligibleAmount = filterState.finalEligibleAmount || null;

        this.selectedOption = filterState.selectedOption || null;
        this.selectedOptionIds = filterState.selectedOptionIds || [];
        this.selectedOptionItems = filterState.selectedOptionItems || [];
        // DO NOT restore isRiskFlag - always start with null
        this.isRiskFlag = null;
        this.selectedDate = filterState.selectedDate || null;

        // Restore selected date if available
        // if (filterState.filteredDate) {
        //   this.filteredDate = filterState.filteredDate;
        //   this.selectedDate = new Date(filterState.filteredDate);
        // }
        if (filterState.selectedDate) {
          this.selectedDate = new Date(filterState.selectedDate);
          if (!this.filteredDate) {
            this.filteredDate = new Date(filterState.selectedDate);
          }
        }

        if (this.selectedOptionItems && this.selectedOptionItems.length > 0) {
          const validItems = this.selectedOptionItems.filter(item => item !== 'all' && typeof item === 'object');
          if (validItems.length > 0) {
            this.selectedOptionItems = validItems;
          } else {
            this.selectedOptionItems = [];
          }
        }

        this.selectedRmUsers = filterState.selectedRmUsers || [];
        this.selectedCheckboxesForApply = filterState.selectedCheckboxesForApply || [];

        if (filterState.topBarFilters && filterState.topBarFilters.length > 0) {
          setTimeout(() => {
            this.restoreTopBarFilters(filterState.topBarFilters);
          }, 100);
        }


        this.tabValue = filterState.tabValue || 2; // Default to In-Process tab (2)
        this.selectedTabIndex = this.tabValue;
        this.page = filterState.page || 1;
        this.pageSize = filterState.pageSize || 10;
        this.selectPreApprovedType = filterState.selectPreApprovedType || 1;
        this.selectedCustomerType = filterState.selectedCustomerType || 'ALL';
        this.selectedCustomerTypeValue = filterState.selectedCustomerTypeValue || 0;

        // Restore tab-specific customer types
        if (filterState.selectedCustomerTypeByTab) {
          this.selectedCustomerTypeByTab = filterState.selectedCustomerTypeByTab;
        }
        if (filterState.selectedCustomerTypeValueByTab) {
          this.selectedCustomerTypeValueByTab = filterState.selectedCustomerTypeValueByTab;
        }

        // Restore sort state per tab
        if (filterState.sortColumnByTab) {
          this.sortColumnByTab = filterState.sortColumnByTab;
        }
        if (filterState.sortDirectionByTab) {
          this.sortDirectionByTab = filterState.sortDirectionByTab;
        }
        
        // Restore current tab's sort state
        if (this.sortColumnByTab[this.tabValue]) {
          this.sortColumn = this.sortColumnByTab[this.tabValue];
          this.currentSortField = this.sortColumnByTab[this.tabValue];
          this.sortDirection = this.sortDirectionByTab[this.tabValue] || 'asc';
        }

        this.startIndex = (this.page - 1) * this.pageSize;
        this.endIndex = this.startIndex + this.pageSize;

        this.updateSelectAllState();

        // Update filteredProposalStatus based on tab
        if (this.tabValue === 0) {
          // Approved tab
          this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '6');
        } else if (this.tabValue === 1) {
          // Rejected tab
          this.filteredProposalStatus = this.proposalStatus.filter(item => item.value === '7');
        } else if (this.tabValue === 2) {
          // In-Process tab - show GST Validation (1), Bureau Profile (2), Additional Information (3), Final Assessment (5)
          this.filteredProposalStatus = this.proposalStatus.filter(item => ['1', '2', '3', '5'].includes(item.value));
        } else if (this.tabValue === 3) {
          // Disabled tab - no stage filter options
          this.filteredProposalStatus = [];
        }

        if (filterState.selectedOptionItems && filterState.selectedOptionItems.length > 0) {
          setTimeout(() => {
            const savedItems = filterState.selectedOptionItems.filter(item => item !== 'all' && typeof item === 'object');
            this.selectedOptionItems = [];

            savedItems.forEach(savedItem => {
              const matchingItem = this.filteredProposalStatus.find(item =>
                item.value === savedItem.value && item.viewValue === savedItem.viewValue
              );
              if (matchingItem) {
                this.selectedOptionItems.push(matchingItem);
              }
            });

            // Don't add 'all' to the array - the checkbox state is managed by isAllSelected
            this.updateSelectAllState();
            this.cdr.detectChanges();
          }, 100);
        }

        console.log('Filter state restored from localStorage');
        return true;
      }
    } catch (error) {
      console.error('Error restoring filter state:', error);
    }
    return false;
  }

  restoreTopBarFilters(savedTopBarFilters: any[]): void {
    if (this.topBarFilters && this.topBarFilters.length > 0) {
      savedTopBarFilters.forEach(savedFilter => {
        const matchingFilter = this.topBarFilters.find(f => f.name === savedFilter.name);
        if (matchingFilter && savedFilter.selectedFilter) {
          matchingFilter.selectedFilter = [...savedFilter.selectedFilter];
          matchingFilter.searchValue = savedFilter.searchValue || '';
        }
      });
    }
  }

  // Search By filter methods from rm-existing-portfolio
  getTopBarFilterForRM(): void {
    this.msmeService.getTopBarFilter(this.selectedCustomerType, true).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {
        this.rmUserFilter.optionFilter = response?.data?.rmUsers;
        this.rmUserFilter.originalOptionFilter = response?.data?.rmUsers; // Store original list
        for (let index = 0; index < response?.data?.filters.length; index++) {
          this.topBarFilters[index] = {
            name: response?.data?.filters[index].name,
            spKeyName: response?.data?.filters[index].spKeyName,
            searchValue: '',
            optionFilter: response?.data?.filters[index].options,
            selectedFilter: [],
            isApiCallSearch: response?.data?.filters[index].isApiCallSearch || false
          };
        }

        // Setup Search By Menu Options
        this.setupSearchByMenu();
      }
    });
  }

  // Setup Search By Menu from topBarFilters
  setupSearchByMenu() {
    // Include City, Parent Company, and Parent Country filters - visibility controlled by shouldHideFilter
    const allowedFilters = ['City', 'Parent Company', 'Parent Country'];

    this.searchByOptionsTopBar = this.topBarFilters
      .filter(filter => allowedFilters.includes(filter.name))
      .map((filter, index) => ({
        key: filter.name,
        filter_name: filter.spKeyName || filter.name.toLowerCase(),
        dataset_id: index + 1,
        dataset_name: filter.spKeyName || filter.name.toLowerCase(),
        options: filter.optionFilter,
        isApiCallSearch: filter.isApiCallSearch || false
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
      const existingSearchValue = this.searchByDataHistory[opt.dataset_id]?.searchValue || '';

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

        // If there's an existing search value >= 3 chars, trigger API search to get filtered results
        if (existingSearchValue.trim().length >= 3) {
          this.handleParentCompanySearch(existingSearchValue, opt.dataset_id);
        }
      } else if (matchingFilter) {
        const allOptions = matchingFilter.optionFilter
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({
            key: item.name,
            value: item.value
          }));

        // If there's an existing search value, filter the options
        if (existingSearchValue.trim().length > 0) {
          this.dependantFilters = allOptions.filter(item =>
            item.key.toLowerCase().includes(existingSearchValue.toLowerCase())
          );
        } else {
          this.dependantFilters = allOptions;
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
      'RM': 'fas fa-user',
      'Segment': 'fas fa-cube',
      'Parent Company': 'fas fa-building',
      'Parent Country': 'fas fa-globe'
    };
    return iconMap[key] || 'fas fa-filter';
  }


  // Handle Customer Type Change
  onCustomerTypeChange(customerType: string): void {
    console.log('Customer Type changed to:', customerType);
    this.selectedCustomerType = customerType;

    // Map customer type to numeric value(s) for API
    switch(customerType) {
      case 'ALL':
        this.selectedCustomerTypeValue = 0;
        break;
      case 'ETB':
        this.selectedCustomerTypeValue = 1;
        break;
      case 'TARGET':
        // Target sends single value: 2
        this.selectedCustomerTypeValue = 2;
        break;
      case 'PROSPECT':
        // Prospect includes values: 3, 4, 5, 6
        this.selectedCustomerTypeValue = [3, 4, 5, 6];
        break;
      case 'NTB':
        // NTB: value 10 + records that don't exist in customer table
        this.selectedCustomerTypeValue = 10;
        break;
      default:
        this.selectedCustomerTypeValue = 0;
    }

    console.log('Customer Type numeric value(s):', this.selectedCustomerTypeValue);

    // Clear existing City and RM filters when customer type changes
    this.selectedItemsMap = {};
    this.selectedRmUsers = [];
    this.selectedCheckboxesForApply = [];

    // Reset topBarFilters (City filter)
    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    // Reset RM filter
    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';
    // Restore original RM list
    if (this.rmUserFilter.originalOptionFilter) {
      this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
    }

    // Clear City and RM filters from data.filterJson
    if (this.data && this.data.filterJson) {
      let filterJson = typeof this.data.filterJson === 'string'
        ? JSON.parse(this.data.filterJson)
        : this.data.filterJson;

      // Remove City filter keys
      this.topBarFilters.forEach(f1 => {
        if (f1?.spKeyName) {
          delete filterJson[f1.spKeyName];
        }
      });

      // Remove RM filter key
      delete filterJson.rmUsers;

      // Add NTB specific filter flag to exclude existing customers
      if (customerType === 'NTB') {
        filterJson.excludeExistingCustomers = true;
      } else {
        delete filterJson.excludeExistingCustomers;
      }

      this.data.filterJson = filterJson;
    }

    // Fetch new filter data based on selected customer type
    this.getTopBarFilterForRM();

    // Reset pagination and refresh data
    this.resetPaginationForFilter();

    // Save filter state with new customer type
    this.saveFilterState();

    // Refresh data with new customer type
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  // Check if City filter should be disabled
  isCityFilterDisabled(): boolean {
    // City filter is only hidden for NTB, enabled for all others including ALL
    return false;
  }

  // Check if City filter should be hidden
  isCityFilterHidden(): boolean {
    return this.selectedCustomerType === 'NTB' || this.selectedCustomerType === 'ALL';
  }

  // Check if RM filter should be hidden
  isRmFilterHidden(): boolean {
    return this.selectedCustomerType === 'PROSPECT' || this.selectedCustomerType === 'NTB';
  }

  // Check if a specific filter should be hidden based on filter name and customer type
  shouldHideFilter(filterKey: string): boolean {
    if (filterKey === 'City') {
      return this.isCityFilterHidden();
    }
    // Parent Company and Parent Country are only shown for ETB
    if (filterKey === 'Parent Company' || filterKey === 'Parent Country') {
      return this.selectedCustomerType !== 'ETB';
    }
    return false;
  }


  getSelectedCount(filter_name: string): number {
    return this.selectedItemsMap[filter_name]?.length || 0;
  }

  onSearchChangeBy(searchValue: string, datasetId: number, datasetName: string) {
    this.searchByDataHistory[datasetId].searchValue = searchValue;
    this.searchByDataHistory[datasetId].isCalled = false;

    const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);

    // Check if this is Parent Company (uses API search)
    if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
      // When search is cleared, immediately reset "Select All" state before API call
      if (searchValue.trim().length === 0) {
        const filterName = this.selectedFilterOption?.filter_name;
        if (filterName && this.parentCompanySelectAllActive[filterName]) {
          this.parentCompanySelectAllActive[filterName] = false;
        }
      }
      // Use debounced API search for Parent Company - minimum 3 characters
      this.parentCompanySearchSubject.next({ searchValue, datasetId });
    } else if (matchingFilter) {
      const allOptions = matchingFilter.optionFilter
        .filter(item => item.name !== 'All' && item.value !== 'All')
        .map(item => ({
          key: item.name,
          value: item.value
        }));

      if (searchValue.trim().length > 0) {
        this.dependantFilters = allOptions.filter(item =>
          item.key.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else {
        this.dependantFilters = allOptions;
        // When search is cleared, reset "Select All" state so checkbox reflects actual selection
        const filterName = this.selectedFilterOption?.filter_name;
        if (filterName && this.parentCompanySelectAllActive[filterName]) {
          this.parentCompanySelectAllActive[filterName] = false;
        }
      }
    }
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

  // Check if all items are selected in Search By menu
  isAllSelectedSearchBy(filterName: string): boolean {
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

  // Check if some but not all items are selected (indeterminate state) in Search By menu
  isIndeterminateSearchBy(filterName: string): boolean {
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

  // Select/Deselect all items in Search By menu
  onSelectAllSearchBy(event: any, filterName: string, datasetId: number) {
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
    // Apply selected filters to topBarFilters
    this.searchByOptionsTopBar.forEach(opt => {
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter) {
        // Always update - set empty array if nothing selected
        matchingFilter.selectedFilter = this.selectedItemsMap[opt.filter_name] || [];
      }
    });

    // Update selectedCheckboxesForApply for City filter
    const cityFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'City');
    if (cityFilter) {
      this.selectedCheckboxesForApply = this.selectedItemsMap[cityFilter.filter_name] || [];
    }

    // Update tab-specific storage immediately
    this.selectedItemsMapByTab[this.tabValue] = { ...this.selectedItemsMap };
    this.selectedRmUsersByTab[this.tabValue] = [...this.selectedRmUsers];

    this.resetPaginationForFilter();
    // Save current filter state before applying search
    this.saveFilterState();
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  resetCurrentFilter(datasetId: number, dataSetName: any, filterName: string) {
    if (this.selectedFilterType === 'rm') {
      this.selectedRmUsers = [];
      this.rmUserFilter.selectedFilter = [];
      this.rmUserFilter.searchValue = '';
      // Restore original RM list
      this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
    } else if (filterName && this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];

      // Reset "Select All" state for this filter
      if (this.parentCompanySelectAllActive[filterName]) {
        this.parentCompanySelectAllActive[filterName] = false;
      }

      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);
      if (matchingFilter) {
        matchingFilter.selectedFilter = [];
        matchingFilter.searchValue = '';
      }

      if (datasetId && this.searchByDataHistory[datasetId]) {
        this.searchByDataHistory[datasetId].searchValue = '';
        this.searchByDataHistory[datasetId].isCalled = false;
      }

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
    // Reset Customer Type to ALL
    this.selectedCustomerType = 'ALL';
    this.selectedCustomerTypeValue = 0;

    // Reset Search By filters
    this.selectedItemsMap = {};
    this.selectedRmUsers = [];
    this.selectedCheckboxesForApply = [];

    // Also update the tab-specific storage
    this.selectedItemsMapByTab[this.tabValue] = {};
    this.selectedRmUsersByTab[this.tabValue] = [];
    this.selectedCustomerTypeByTab[this.tabValue] = 'ALL';
    this.selectedCustomerTypeValueByTab[this.tabValue] = 0;

    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';

    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });

    // Save updated filter state (with cleared Search By filters)
    this.saveFilterState();

    // Reset pagination and reload data
    this.resetPaginationForFilter();
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
  }

  onCheckboxChangeTopBar(event: any, segment: string, topBarFilters: any) {
    if (segment === "All" && topBarFilters.name === 'City') {
      if (event.checked) {
        if (topBarFilters?.optionFilter && topBarFilters.optionFilter.length > 0) {
          topBarFilters.optionFilter.forEach((element, i) => {
            this.selectedCheckboxesForApply.push(element.value);
          });
        }
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

    if (event.checked) {
      if (!topBarFilters.selectedFilter.includes(segment)) {
        topBarFilters.selectedFilter.push(segment);
      }
    } else {
      const index = topBarFilters.selectedFilter.indexOf(segment);
      if (index >= 0) {
        topBarFilters.selectedFilter.splice(index, 1);
      }
    }
  }

  applyFilterForCity(filterName: any) {
    this.resetPaginationForFilter();
    // Save current filter state before applying city filter
    this.saveFilterState();
    this.getHSBCHODashboardDetails(this.getBackendTabValue());
    if (filterName === 'City') {
      this.getFilterWiseRMByCity();
    }
  }

  onCheckboxChangeRmUsers(event: any, rmEmpCode: string, rmUserFilter: any) {
    if (event.checked) {
      if (!this.selectedRmUsers.includes(rmEmpCode)) {
        this.selectedRmUsers.push(rmEmpCode);
      }
    } else {
      const index = this.selectedRmUsers.indexOf(rmEmpCode);
      if (index >= 0) {
        this.selectedRmUsers.splice(index, 1);
      }
    }
  }

  filterCheckBoxTopBar(filter2: any, filterType?: string) {
    if (filterType === 'rm') {
      if (!filter2.searchValue) {
        filter2.optionFilter = [...this.rmUserFilter.originalOptionFilter];
      } else {
        filter2.optionFilter = this.rmUserFilter.originalOptionFilter.filter(rm =>
          rm.firstName.toLowerCase().includes(filter2.searchValue.toLowerCase())
        );
      }
    } else {
      const originalFilter = this.topBarFilters.find(f => f.name === filter2.name);
      if (originalFilter) {
        if (!filter2.searchValue) {
          filter2.optionFilter = [...originalFilter.optionFilter];
        } else {
          filter2.optionFilter = originalFilter.optionFilter.filter(item =>
            item.name.toLowerCase().includes(filter2.searchValue.toLowerCase())
          );
        }
      }
    }
  }

  getFilterWiseRMByCity() {
    if (this.selectedCheckboxesForApply.length === 0) {
      this.selectedRmUsers = [];
      return;
    }
    this.msmeService.getFilterWiseRMByCity(this.selectedCheckboxesForApply).subscribe((response: any) => {
      if (response && response.status == 200 && response.data) {
        this.rmUserFilter.optionFilter = response?.data?.rmUsers;
      }
    });
  }

  // Select All functionality for top bar filters
  isAllSelectedForFilter(filter: any): boolean {
    return filter.optionFilter?.length > 0 && filter.selectedFilter?.length === filter.optionFilter.length;
  }

  isIndeterminateForFilter(filter: any): boolean {
    return filter.selectedFilter?.length > 0 && filter.selectedFilter.length < filter.optionFilter?.length;
  }

  toggleSelectAllForFilter(filter: any): void {
    if (this.isAllSelectedForFilter(filter)) {
      filter.selectedFilter = [];
    } else {
      filter.selectedFilter = filter.optionFilter?.map(item => item.value) || [];
    }
  }

  // Select All functionality for RM filter
  isAllSelectedForRm(): boolean {
    return this.rmUserFilter.optionFilter?.length > 0 && this.selectedRmUsers.length === this.rmUserFilter.optionFilter.length;
  }

  isIndeterminateForRm(): boolean {
    return this.selectedRmUsers.length > 0 && this.selectedRmUsers.length < this.rmUserFilter.optionFilter?.length;
  }

  toggleSelectAllForRm(): void {
    if (this.isAllSelectedForRm()) {
      this.selectedRmUsers = [];
    } else {
      this.selectedRmUsers = this.rmUserFilter.optionFilter?.map(rm => rm.empCode) || [];
    }
  }

  // Handle scroll for infinite loading (Parent Company)
  onScroll(event: any, datasetId: number, datasetName: string, filterName: string) {
    const element = event.target;
    const threshold = 50;

    if (element.scrollHeight - element.scrollTop - element.clientHeight < threshold) {
      // Check if current filter is Parent Company
      if (this.selectedFilterOption && this.selectedFilterOption.key === 'Parent Company') {
        const matchingFilter = this.topBarFilters.find(f => f.name === 'Parent Company');
        if (matchingFilter && matchingFilter.isApiCallSearch) {
          this.loadMoreParentCompany();
        }
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

    // Check if "Select All" is active for this filter
    const filterName = this.selectedFilterOption?.filter_name;
    const isSelectAllActive = filterName && this.parentCompanySelectAllActive[filterName];

    this.msmeService.searchParentCompany(searchValue, this.parentCompanyPage, this.searchByOptPageSize).subscribe({
      next: (response: any) => {
        this.parentCompanyLoading = false;
        // Response structure: { status, data: { content, hasMore, totalElements, page, size } }
        if (response && response.status === 200 && response.data) {
          const data = response.data;
          const newItems = (data.content || []).map((item: any) => ({
            key: item.name,
            value: item.value
          }));

          // Filter out duplicates by key before appending
          const existingKeys = new Set(this.dependantFilters.map((f: any) => f.key));
          const uniqueNewItems = newItems.filter((item: any) => !existingKeys.has(item.key));
          this.dependantFilters = [...this.dependantFilters, ...uniqueNewItems];

          // Auto-select new items if "Select All" is active
          if (isSelectAllActive && filterName && uniqueNewItems.length > 0) {
            if (!this.selectedItemsMap[filterName]) {
              this.selectedItemsMap[filterName] = [];
            }
            uniqueNewItems.forEach(item => {
              if (!this.selectedItemsMap[filterName].includes(item.value)) {
                this.selectedItemsMap[filterName].push(item.value);
              }
            });
          }

          this.parentCompanyHasMore = data.hasMore || false;
          this.parentCompanyTotalElements = data.totalElements || 0;
          this.parentCompanyPage++;

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

  // Handle Parent Company search
  handleParentCompanySearch(searchText: string, datasetId: number) {
    this.isLoadingSearchBy = true;
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
        // Response structure: { status, data: { content, hasMore, totalElements, page, size } }
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
  openPreQulifiedCommonPopup(popupType: 'approved' | 'rejected' | 'inProcess' | 'disabled'): void {
    const dialogRef = this.dialog.open(PreQulifiedCommonPopupComponent, {
      data: { popupType },
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
  }
}