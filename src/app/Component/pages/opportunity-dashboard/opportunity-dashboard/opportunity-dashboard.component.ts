import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { GlobalHeaders, saveActivity } from 'src/app/CommoUtils/global-headers';
import { OpChangeStatusPopupComponent } from 'src/app/Popup/HSBC/op-change-status-popup/op-change-status-popup.component';
import { CreateCampaignPopupComponent } from 'src/app/Popup/create-campaign-popup/create-campaign-popup.component';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import * as _ from 'lodash';
import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
import { OpExportPopupComponent } from 'src/app/Popup/HSBC/op-export-popup/op-export-popup.component';
import { OpAuditLogPopupComponent } from 'src/app/Popup/HSBC/op-audit-log-popup/op-audit-log-popup.component';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { SharedService } from 'src/app/services/SharedService';
import { AssignTargetPopupComponent } from 'src/app/Popup/assign-target-popup/assign-target-popup.component';

@Component({
  selector: 'app-opportunity-dashboard',
  templateUrl: './opportunity-dashboard.component.html',
  styleUrl: './opportunity-dashboard.component.scss'
})
export class OpportunityDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('scrollButtons', { static: false }) scrollButtons!: ScrollButtonsDirective;
  includeInactiveCampaigns = true;
  showLeftButton: boolean = false;
  showRightButton: boolean = true;
  pageData: any;
  constants: any;
  allCampaignData: any[] = [];
  pmNameList: any[] = [];
  selectedCampaignIndex: number = 0;
  opportunityData: any;
  campaignData: any[] = [];
  selectedPreApproved: string | null = null;
  selectedExim: string = '';
  selectedCampaigns: any[] = [];
  campaignSearchText: string = '';
  menuCampaignSearchText: string = '';
  menuPmNameSearchText: string = '';
  selectedMenuCampaigns: string | null = null;
  activeFilterMenu: string | null = null;
  activeCitySegmentMenu: string | null = null;
  selectedMenuPmNames: { [key: string]: boolean } = {};
  filteredMenuPmNames: any[] = [];
  filteredMenuCampaigns: any[] = [];
  allCampaignDataComplete: any[] = [];
  pmNameListComplete: any[] = [];
  filterDataList: any[] = [];
  cityFilterList: any[] = [];
  segmentFilterList: any[] = [];
  categoryFilterList: any[] = [];
  countryFilterList: any[] = [];

  // Filtered lists for search
  filteredCityList: string[] = [];
  filteredSegmentList: string[] = [];
  filteredCategoryList: string[] = [];
  filteredCountryList: string[] = [];
  segmentOptions: any[] = [];
  cityOptions: any[] = [];

  // Parent Company filter state
  parentCompanyOptions: any[] = [];
  filteredParentCompanyList: any[] = [];
  selectedParentCompanies: { [key: string]: boolean } = {};
  selectedParentCompanyOptions: any[] = []; // Store selected options with their IDs
  parentCompanySearchText: string = '';
  parentCompanyPage: number = 0;
  parentCompanyHasMore: boolean = true;
  parentCompanyLoading: boolean = false;
  parentCompanyTotalElements: number = 0;
  parentCompanyPageSize: number = 50;
  parentCompanySearchSubject = new Subject<string>();

  // Parent Country filter state
  parentCountryOptions: any[] = [];
  filteredParentCountryList: any[] = [];
  selectedParentCountries: { [key: string]: boolean } = {};
  selectedParentCountryOptions: any[] = []; // Store selected options with their IDs
  parentCountrySearchText: string = '';

  // Search text properties
  citySearchText: string = '';
  segmentSearchText: string = '';
  categorySearchText: string = '';
  countrySearchText: string = '';

  // Selected items
  selectedCities: { [key: string]: boolean } = {};
  selectedSegments: { [key: string]: boolean } = {};
  selectedCategories: { [key: string]: boolean } = {};
  selectedCountries: { [key: string]: boolean } = {};
  rmNameFilterList: any[] = [];
  rmNameFilter: string = '';
  revenueFilter: string = '';
  allProductList: any[] = [];
  filteredCampaignOptions: any[] = [];
  filteredProductList: any[] = [];
  customerNameFilter: string = '';
  customerIdFilter: string = '';
  sortField: string = '';
  sortDirection: string = 'asc';
  currentSortField: string = ''; // Track which field is being sorted
  pageDataDetails: any;
  // pagination code
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  convertedCustomerCount: number = 0;
  rejectedCustomerCount: number = 0;
  inProcessCustomerCount: number = 0;
  selectedStatus: string = 'Awaiting Action';
  convertedCustomerRevenue: number = 0;
  rejectedCustomerRevenue: number = 0;
  inProcessCustomerRevenue: number = 0;
  awaitingActionCustomerCount: number = 0;
  awaitingActionCustomerRevenue: number = 0;
  roleId: any;
  rmExistingPortfolioPageData: any;
  campaignIdList: any;
  private socketSub: Subscription | null = null;
  private intervalId: any = null;
  userId: any;
  isCampaignFlag: boolean;
  userRoleCampaign = false;
  isLoading = false;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '50', value: 50 }, { name: '100', value: 100 }, { name: '500', value: 500 }];
  roleType: any;
  private subscription: Subscription;
  private opportunitySubscription: Subscription | null = null;
  private campaignUpdateDebouncer: any = null;
  private isInitialLoadComplete = false;
  private socketDataReceived = false;
  private apiCallInProgress = false;
  empCode: number;
  private componentId = 'ETB_OPPORTUNITY_DASHBOARD'; // Unique identifier for this component
  private componentInstanceId: string; // Unique ID for each component instance

  debouncedSearch = _.debounce(() => {
    const hasMinChars = this.customerIdFilter.length >= 3 || this.customerNameFilter.length >= 3 ||
      this.rmNameFilter.length >= 3 || this.revenueFilter.length >= 3;
    const hasEmptyFields = !this.customerIdFilter && !this.customerNameFilter &&
      !this.rmNameFilter && !this.revenueFilter;

    if (hasMinChars || hasEmptyFields) {
      this.onSearchOnOpportunityData();
    }
  }, 300);

  constructor(public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private sanitizer: DomSanitizer,
    private existingProspectsDropDownService: ExistingProspectsDropDownService, private router: Router, private ws: WebSocketService, private loaderService: LoaderService, private sharedService: SharedService,
    private viewportScroller: ViewportScroller, private elementRef: ElementRef,
  ) {
    // Generate unique instance ID for this component instance
    this.componentInstanceId = `${this.componentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[${this.componentInstanceId}] Component instance created`);
  }

  /** Scroll page to top (e.g. after redirect from create campaign popup). */
  private scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    // Layout may use a scrollable content wrapper
    const contentPage = document.querySelector('.content-page');
    const content = document.querySelector('.content-page .content');
    [contentPage, content].forEach((el) => {
      if (el && (el as HTMLElement).scrollTop !== undefined) {
        (el as HTMLElement).scrollTop = 0;
      }
    });
  }

  ngOnInit() {
    console.log(`[${this.componentInstanceId}] ngOnInit called`);
    this.scrollToTop();
    // Reset flags for new component instance
    this.socketDataReceived = false;
    this.isInitialLoadComplete = false;
    this.apiCallInProgress = false;

    // Setup Parent Company search debounce - minimum 3 characters, 400ms delay
    this.parentCompanySearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((searchText: string) => {
      if (searchText.trim().length >= 3 || searchText.trim().length === 0) {
        this.handleParentCompanySearch();
      }
    });

    this.roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.empCode = Number(this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true));
    console.log(this.roleType);
    this.constants = Constants;
    this.pageData = history.state.data;
    const payload = {
      campaignIds: this.getSelectedCampaignIds(),
      pmNames: this.getSelectedPmNames(),
      isActive: this.includeInactiveCampaigns,
      roleId: this.roleId,
      customerTypeIds: [this.constants.CustomerType.ETB],
      roleType: this.roleType,
      isForNtb: false,
      empCode: String(this.empCode)
    }
    this.ws.sendFilterViaSocketClient3(payload, this.constants.SocketFilterRequestTypeForDS.GET_CAMPAIGN_DETAILS);
    this.getAllCampaignDetails(null, null, null);
    const data = { campaignId: 0, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus, pageSize: this.pageSize, pageIndex: this.page - 1, roleId: this.roleId, customerTypeIds: [this.constants.CustomerType.ETB]?.join(','), roleType: this.roleType, empCode: String(this.empCode) }
    this.loadOpportunityDashboardData(data);
    // this.allProductList = this.existingProspectsDropDownService.getPreApprovedDropdownOptions();
    // this.filteredProductList = this.allProductList.filter(product => product.value !== 'All');
    if (!this.pageData || this.pageData === 'undefined' || this.pageData === undefined) {
      const parentPage = this.consValue.pageMaster.CAMPAIGN_DASHBOARD ?? this.consValue.pageMaster.PORTFOLIO_ANALYSIS ?? this.consValue.pageMaster.PRODUCT_APPROVAL_JOURNEY;
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS, this.consValue.pageMaster.CAMPAIGN_DASHBOARD, this.consValue.pageMaster.ETB_CAMPAIGN_DASHBOARD);
    }
    this.rmExistingPortfolioPageData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true))?.find(
      (data) => data.pageId === Constants.pageMaster.PORTFOLIO_NEW
    )?.subpages.find(
      (data) => data.subpageId === Constants.pageMaster.EXISTING_PORTFOLIO
    );
    this.fetchFilterDataList();

    // Set a timeout to mark initial load as complete if no socket data received
    setTimeout(() => {
      if (!this.socketDataReceived) {
        console.log('No socket data received within timeout, marking initial load complete');
        this.isInitialLoadComplete = true;
      }
    }, 3000); // 3 second timeout

    this.intervalId = setInterval(() => {
      this.onFilterApply();
    }, 5000);

    this.socketSub = this.ws.messages$.subscribe((messages: any[]) => {
      const data = messages[messages.length - 1];

      // Only process if component is still active (not destroyed)
      if (!this.socketSub) {
        console.log(`[${this.componentInstanceId}] Component destroyed, ignoring message`);
        return;
      }

      switch (data?.reqType) {
        // case 'OPPORTUNITY_DASHBOARD_PRE_APPROVED_STATUS':
        //   console.log(`[${this.componentInstanceId}] Processing OPPORTUNITY_DASHBOARD_PRE_APPROVED_STATUS`);
        //   this.applyAllFiltersForSocketData(data.response);
        //   break;

        case 'GET_CAMPAIGN_DETAILS_STATUS_ETB':
          console.log(`[${this.componentInstanceId}] Processing GET_CAMPAIGN_DETAILS_STATUS`);
          this.handleCampaignDetailsUpdate(data);
          break;

        default:
          return;
      }
    });
  }
  // private initialize() {
  //   this.subscription = this.sharedService.getGetCampaignDetailsSubject().subscribe((message)=>{
  //     console.log("Message recieved from socket");
  //     this.handleWebSocketMessage(message);
  //   })
  // }
  // private debounceTimer: any;

  // handleWebSocketMessage(message: any) {
  //     clearTimeout(this.debounceTimer);
  //     this.debounceTimer = setTimeout(() => {
  //       console.log('this.debounceTimer: ', this.debounceTimer);
  //       const parsedMessage = JSON.parse(message);
  //       if (parsedMessage?.reqType === "GET_CAMPAIGN_DETAILS_STATUS") {
  //         this.fetchDataFromWebSocket(message);
  //       }
  //     }, 1000);
  // }

  fetchDataFromWebSocket(responseFromWebSocket?) {
    // responseFromWebSocket = JSON.parse(responseFromWebSocket);
    console.log("responseFromWebSocket", responseFromWebSocket);
    // this.responseStatusList = responseFromWebSocket?.response?.responseStatusList;

    if (responseFromWebSocket?.response && responseFromWebSocket?.response?.data) {
      this.applyCampaignFilterData(responseFromWebSocket?.response?.data);
    }
  }

  handleCampaignDetailsUpdate(data: any) {
    // if(!this.isMessageForThisComponent(data)) {
    //   console.log(`[${this.componentInstanceId}] Message is not for ETB.`)
    //   return;
    // }
    console.log(`[${this.componentInstanceId}] Socket data received, prioritizing socket response`);

    // Mark that socket data was received
    this.socketDataReceived = true;
    this.isInitialLoadComplete = true;

    // Clear existing debouncer
    if (this.campaignUpdateDebouncer) {
      clearTimeout(this.campaignUpdateDebouncer);
    }

    // Process socket data immediately (prioritized)
    this.campaignUpdateDebouncer = setTimeout(() => {
      console.log(`[${this.componentInstanceId}] Processing prioritized socket campaign update`);
      this.fetchDataFromWebSocket(data);
    }, 100); // Very short delay just to batch rapid updates
  }

  // private isMessageForThisComponent(data: any): boolean {
  //   if (data?.response && data?.response?.status === 200 && data?.response?.data) {
  //     return !data?.response?.data[0]?.isForNtb;
  //   }
  // }

  ngAfterViewInit(): void {
    this.scrollToTop();
    setTimeout(() => this.scrollToTop(), 0);
    setTimeout(() => this.scrollToTop(), 150);
    this.updateScrollButtons();
  }
  ngOnDestroy() {
    console.log(`[${this.componentInstanceId}] Component destroying, cleaning up`);

    if (this.socketSub) {
      this.socketSub.unsubscribe();
      this.socketSub = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.opportunitySubscription) {
      this.opportunitySubscription.unsubscribe();
    }
    if (this.campaignUpdateDebouncer) {
      clearTimeout(this.campaignUpdateDebouncer);
      this.campaignUpdateDebouncer = null;
    }

    // Reset flags to prevent stale data on re-initialization
    this.socketDataReceived = false;
    this.isInitialLoadComplete = false;
    this.apiCallInProgress = false;
  }

  applyCampaignFilterData(data: any) {
    const response = data;

    this.allCampaignData = response;
    this.userRoleCampaign = this.allCampaignData.some((item: any) => item.isCampaign === true);
    this.isCampaignFlag = this.allCampaignData.some((campaign: any) => campaign.isCampaign === true);
    if (this.getSelectedCampaignIds() === null && this.getSelectedPmNames() === null) {
      this.allCampaignDataComplete = response;
      // this.pmNameListComplete = [...new Set(this.allCampaignData.filter(campaign => !campaign.campaignName.toLowerCase().trim().startsWith('all')).map(obj => obj.pmName).filter(id => id))];
      this.pmNameListComplete = [...new Set(this.allCampaignData.filter(campaign => campaign.campaignId != 0).map(obj => obj.pmName).filter(id => id))];
    }

    this.filteredMenuCampaigns = this.allCampaignData.filter(campaign => campaign?.processingStatus === 'Completed');
    this.pmNameList = this.pmNameListComplete;
    this.filteredMenuPmNames = this.pmNameListComplete;
    this.updateFilteredCampaignOptions();

    if (this.selectedCampaignIndex == 0)
      this.selectCampaign(0, true);
  }

  applyAllFiltersForSocketData(payload: any) {
    const rows = Array.isArray(payload.data) ? payload.data : [];

    this.opportunityData = rows;
    this.totalSize = Number(payload.totalElements || 0);

    this.convertedCustomerCount = Number(payload.convertedCustomerCount ?? 0);
    this.rejectedCustomerCount = Number(payload.rejectedCustomerCount ?? 0);
    this.inProcessCustomerCount = Number(payload.inProcessCustomerCount ?? 0);
    this.awaitingActionCustomerCount = Number(payload.awaitingActionCustomerCount ?? 0);

    this.convertedCustomerRevenue = Number(payload.convertedCustomerRevenue ?? 0);
    this.rejectedCustomerRevenue = Number(payload.rejectedCustomerRevenue ?? 0);
    this.inProcessCustomerRevenue = Number(payload.inProcessCustomerRevenue ?? 0);
    this.awaitingActionCustomerRevenue = Number(payload.awaitingActionCustomerRevenue ?? 0);

    this.page = (payload.pageIndex != null) ? (Number(payload.pageIndex) + 1) : this.page;
    this.pageSize = Number(payload.pageSize || this.pageSize);

    console.log('Socket payload applied: rows=', this.opportunityData.length, 'total=', this.totalSize);
  }

  onFilterApply() {
    // const data = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId,
    //   preApprovedStatus: this.selectedPreApproved,
    //   exim: this.selectedExim,
    //   pmName: this.rmNameFilter,
    //   revenue: this.revenueFilter,
    //   customerId: this.customerIdFilter,
    //   customerName: this.customerNameFilter,
    //   campaignIds: this.selectedCampaigns,
    //   pageSize: this.pageSize,
    //   pageIndex: this.page - 1,
    //   includeInactiveCampaigns: this.includeInactiveCampaigns,
    //   convertRejectStatus: this.selectedStatus, roleId: this.roleId
    // };

    const data = {
      campaignIds: this.getSelectedCampaignIds(),
      pmNames: this.getSelectedPmNames(),
      isActive: this.includeInactiveCampaigns,
      roleId: this.roleId,
      customerTypeIds: [this.constants.CustomerType.ETB],
      roleType: this.roleType,
      isForNtb: false,
      empCode: String(this.empCode)
    }

    // console.log("onFilterApply method called::::> ", this.getloadOpportunityPayload())
    // this.ws.sendFilterViaSocketClient3(this.getloadOpportunityPayload(), this.constants.SocketFilterRequestTypeForDS.GET_OPPORTUNITY_DASHBOARD_DATA);
    this.ws.sendFilterViaSocketClient3(data, this.constants.SocketFilterRequestTypeForDS.GET_CAMPAIGN_DETAILS);
  }

  scrollLeft(): void {
    this.scrollContainer.nativeElement.scrollBy({
      left: -300,
      behavior: 'smooth'
    });

    setTimeout(() => this.updateScrollButtons(), 300);
  }

  scrollRight(): void {
    this.scrollContainer.nativeElement.scrollBy({
      left: 300,
      behavior: 'smooth'
    });

    setTimeout(() => this.updateScrollButtons(), 300);
  }

  onScroll(): void {
    this.updateScrollButtons();
  }

  private updateScrollButtons(): void {
    if (!this.scrollContainer?.nativeElement) return;

    const container = this.scrollContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    this.showLeftButton = scrollLeft > 0;
    this.showRightButton = scrollLeft + clientWidth < scrollWidth;
  }

  /**
   * Scroll to show the active campaign in the stepper-list
   */
  scrollToActiveCampaign(): void {
    if (!this.scrollContainer?.nativeElement) return;
    if (this.selectedCampaignIndex === null || this.selectedCampaignIndex < 0) return;

    const container = this.scrollContainer.nativeElement;
    const stepperList = container.querySelector('.stepper-list');
    if (!stepperList) return;

    const listItems = stepperList.querySelectorAll('li');
    if (listItems.length === 0 || this.selectedCampaignIndex >= listItems.length) return;

    const activeItem = listItems[this.selectedCampaignIndex] as HTMLElement;
    if (!activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    // Check if the active item is already fully visible
    const isFullyVisible = itemRect.left >= containerRect.left && itemRect.right <= containerRect.right;

    if (!isFullyVisible) {
      // Calculate the position of the item relative to the stepper-list
      let itemPosition = 0;
      for (let i = 0; i < this.selectedCampaignIndex; i++) {
        itemPosition += (listItems[i] as HTMLElement).offsetWidth;
      }

      // Calculate the scroll position to center the item
      const containerWidth = container.clientWidth;
      const itemWidth = activeItem.offsetWidth;
      const scrollLeft = itemPosition - (containerWidth / 2) + (itemWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });

      // Update scroll buttons after scrolling
      setTimeout(() => this.updateScrollButtons(), 300);
    }
  }

  CreateCampaignPopup(): void {
    const dialogRef = this.dialog.open(CreateCampaignPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2', 'right_side_popup'], data: { edit: true, allCampaignData: this.allCampaignData, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus, roleId: this.roleId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updatedCampaignData) {
        const selectedCampaignIds = this.getSelectedCampaignIds();
        if (!this.commonService.isObjectNullOrEmpty(selectedCampaignIds))
          this.getAllCampaignDetails(selectedCampaignIds, this.getSelectedPmNames(), 'Campaign');
        else
          this.getAllCampaignDetails(null, this.getSelectedPmNames(), 'PM');
      }
    });
  }

  selectCampaign(index: number, forceReload: boolean = false): void {
    if (!forceReload && this.selectedCampaignIndex === index) {
      return;
    }

    // Reset scroll to start if at end
    if (this.scrollButtons) {
      this.scrollButtons.resetToStartIfAtEnd();
    }

    this.selectedCampaignIndex = index;
    this.campaignIdList = this.allCampaignData.filter(item => item.campaignId !== 0).map(item => item.campaignId);
    // const data = {
    //   campaignId: this.allCampaignData[index].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus,
    //   ...(index === 0 ? { campaignIds: this.campaignIdList } : {})
    // };
    const data = this.getloadOpportunityPayload();
    data.campaignIds = this.campaignIdList;
    this.loadOpportunityDashboardData(data);
    this.sortField = '';
    this.sortDirection = 'asc';
    this.clearAllFilters(false);

    // Scroll to show the selected campaign
    setTimeout(() => {
      this.scrollToActiveCampaign();
    }, 100);
  }

  // selectCampaign(index: number): void {
  //   this.selectedCampaignIndex = index;
  //    const filterPmNames = [
  //         ...new Set(
  //           this.allCampaignData
  //             .filter(item => item.campaignId !== 0 && item.pmName)
  //             .map(item => item.pmName.trim())
  //         )
  //       ];    const data = {
  //     campaignId: this.allCampaignData[index].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus,
  //     ...(index === 0 ? { campaignIds: filterPmNames } : {}) // add campaignIds only if index==0
  //   };
  //   this.loadOpportunityDashboardData(data);
  //   this.sortField = '';
  //   this.sortDirection = 'asc';
  //   this.clearAllFilters(false);
  // }

  getDaysText(dueDays: number): string {
    if (!dueDays && dueDays !== 0) return 'N/A';

    if (dueDays < 0) {
      const absDays = Math.abs(dueDays);
      return `${absDays} ${absDays === 1 ? 'day' : 'days'} overdue`;
    }

    if (dueDays === 0) return 'Due today';

    return `${dueDays} ${dueDays === 1 ? 'day' : 'days'} to go`;
  }

  formatRevenue(amount: number): string {
    if (!amount && amount !== 0) return '$ 0';

    const absAmount = Math.abs(amount);

    const units = [
      { value: 1e18, suffix: ' Qi' }, // Quintillion
      { value: 1e15, suffix: ' Qa' }, // Quadrillion
      { value: 1e12, suffix: ' T' },  // Trillion
      { value: 1e9, suffix: ' B' },   // Billion
      { value: 1e6, suffix: ' M' },   // Million
      { value: 1e3, suffix: ' K' },   // Thousand
    ];

    for (const unit of units) {
      if (absAmount >= unit.value) {
        return `$ ${(amount / unit.value).toFixed(2)}${unit.suffix}`;
      }
    }

    return `$ ${amount}`;
  }

  // getAllCampaignDetails(campaignIds?: any[], pmNames?: any[], isApiCall?: String, inEditMode:Boolean = true) {
  getAllCampaignDetails(campaignIds?: any[], pmNames?: any[], isApiCall?: String) {
    // Don't make API call if socket data already received and processed
    if (this.socketDataReceived && !campaignIds && !pmNames && !isApiCall) {
      console.log('Socket data already received, skipping redundant API call');
      return;
    }

    this.apiCallInProgress = true;
    const data = {
      campaignIds: campaignIds,
      pmNames: pmNames,
      isActive: this.includeInactiveCampaigns,
      roleId: this.roleId,
      customerTypeIds: [this.constants.CustomerType.ETB],
      roleType: this.roleType,
      isForNtb: false,
      empCode: String(this.empCode)
    }

    this.msmeService.getCampaignDetails(data).subscribe((response: any) => {
      this.apiCallInProgress = false;

      // Only process API response if no socket data received yet, or if this is a specific filter call
      if (!this.socketDataReceived || campaignIds || pmNames || isApiCall) {
        console.log('Processing API response for campaign details');

        if (response && response.status == 200) {
          this.allCampaignData = response.data;
          this.userRoleCampaign = this.allCampaignData.some((item: any) => item.isCampaign === true);
          this.isCampaignFlag = this.allCampaignData.some((campaign: any) => campaign.isCampaign === true);
          if (campaignIds === null && pmNames === null) {
            this.allCampaignDataComplete = response.data;
            // this.pmNameListComplete = [...new Set(this.allCampaignData.filter(campaign => !campaign.campaignName.toLowerCase().trim().startsWith('all')).map(obj => obj.pmName).filter(id => id))];
            this.pmNameListComplete = [...new Set(this.allCampaignData.filter(campaign => campaign.campaignId != 0).map(obj => obj.pmName).filter(id => id))];
          }

          // if(inEditMode){
          this.filteredMenuCampaigns = this.allCampaignData.filter(campaign => campaign?.processingStatus === 'Completed');
          // }
          this.pmNameList = this.pmNameListComplete;
          this.filteredMenuPmNames = this.pmNameListComplete;
          this.updateFilteredCampaignOptions();

          if (isApiCall === 'Campaign') {
            // Find the index of the selected campaign in the filtered list
            if (this.selectedMenuCampaigns) {
              const selectedIndex = this.allCampaignData.findIndex(
                c => c.campaignName === this.selectedMenuCampaigns
              );
              if (selectedIndex !== -1) {
                this.selectCampaign(selectedIndex, true);
              } else {
                // If not found, select the first non-"All" campaign or index 0
                const firstNonAllIndex = this.allCampaignData.findIndex(
                  c => !this.isAllCampaignData(c.campaignName)
                );
                this.selectCampaign(firstNonAllIndex !== -1 ? firstNonAllIndex : 0, true);
              }
            } else {
              // If no campaign selected, select index 1 (first campaign after "All")
              this.selectCampaign(1, true);
            }
          } else if (isApiCall === 'PM') {
            this.selectCampaign(0, true);
          }

          setTimeout(() => {
            this.updateScrollButtons();
            this.scrollToActiveCampaign();
          }, 150);

          // Mark initial load complete if this was the initial call
          if (!campaignIds && !pmNames && !isApiCall) {
            this.isInitialLoadComplete = true;
          }
        }
      } else {
        console.log('Socket data already processed, ignoring API response');
      }
    }, (error) => {
      this.apiCallInProgress = false;
      this.commonService.errorSnackBar("Something went wrong!!");

      // Mark initial load complete even on error
      if (!campaignIds && !pmNames && !isApiCall) {
        this.isInitialLoadComplete = true;
      }
    });
  }

  isAllCampaignData(campaignId: any) {
    return campaignId === 0;
  }

  loadOpportunityDashboardData(campaignData: any) {
    // const requestData = { ...campaignData, pageSize: this.pageSize, pageIndex: this.page - 1, roleId: this.roleId };
    if (this.opportunitySubscription) {
      this.opportunitySubscription.unsubscribe();
    }
    this.isLoading = true;
    this.loaderService.subLoaderShow();
    this.opportunitySubscription = this.msmeService.fetchOpportunityDashboardData(campaignData, true).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loaderService.subLoaderHide();
        if (response.data.data && response.data.data.length > 0) {
          this.opportunityData = response?.data?.data || [];
          this.totalSize = response?.data?.totalElements;
          this.allProductList = response?.data?.productNames;
          const auditData = response?.data;

          this.convertedCustomerCount = auditData?.convertedCustomerCount;
          this.rejectedCustomerCount = auditData?.rejectedCustomerCount;
          this.inProcessCustomerCount = auditData?.inProcessCustomerCount;
          this.awaitingActionCustomerCount = auditData?.awaitingActionCustomerCount;
          this.convertedCustomerRevenue = auditData?.convertedCustomerRevenue;
          this.rejectedCustomerRevenue = auditData?.rejectedCustomerRevenue;
          this.inProcessCustomerRevenue = auditData?.inProcessCustomerRevenue;
          this.awaitingActionCustomerRevenue = auditData?.awaitingActionCustomerRevenue;

        } else if (response.data.data.length == 0) {
          this.opportunityData = [];
          this.totalSize = 0
          const auditData = response?.data;

          this.convertedCustomerCount = auditData?.convertedCustomerCount;
          this.rejectedCustomerCount = auditData?.rejectedCustomerCount;
          this.inProcessCustomerCount = auditData?.inProcessCustomerCount;
          this.awaitingActionCustomerCount = auditData?.awaitingActionCustomerCount;
          this.convertedCustomerRevenue = auditData?.convertedCustomerRevenue;
          this.rejectedCustomerRevenue = auditData?.rejectedCustomerRevenue;
          this.inProcessCustomerRevenue = auditData?.inProcessCustomerRevenue;
          this.awaitingActionCustomerRevenue = auditData?.awaitingActionCustomerRevenue;

        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loaderService.subLoaderHide();
        console.error("Error fetching data:", err);
        this.opportunityData = [];
        this.totalSize = 0;
      }
    });
  }

  updateFilteredCampaignOptions() {
    const campaignOptions = this.allCampaignData?.filter(campaign => campaign.campaignId != 0)
      ?.map((campaign) => ({ id: campaign.campaignId, campaignName: campaign.campaignName })) || [];

    if (!this.campaignSearchText) {
      this.filteredCampaignOptions = campaignOptions;
    } else {
      this.filteredCampaignOptions = campaignOptions.filter(campaign =>
        campaign.campaignName.toLowerCase().trim().includes(this.campaignSearchText.toLowerCase().trim())
      );
    }
  }

  onCampaignSearchChange() {
    this.updateFilteredCampaignOptions();
  }

  onToggleChange() {
    this.getAllCampaignDetails(null, null, 'PM');
    this.menuPmNameSearchText = '';
    this.filteredMenuPmNames = this.pmNameListComplete;
    this.selectedMenuPmNames = {};
    this.selectedStatus = 'Awaiting Action'
    this.menuCampaignSearchText = '';
    this.filteredMenuCampaigns = this.allCampaignDataComplete.filter(campaign => campaign?.processingStatus === 'Completed');
    this.selectedMenuCampaigns = null;
  }


  onCampaignChange(campaignId: number, event: any) {
    if (event.isUserInput) {
      if (event.source.selected) {
        if (!this.selectedCampaigns.includes(campaignId)) {
          this.selectedCampaigns.push(campaignId);
        }
      } else {
        const index = this.selectedCampaigns.indexOf(campaignId);
        if (index > -1) {
          this.selectedCampaigns.splice(index, 1);
        }
      }
      this.onSearchOnOpportunityData();
    }
  }

  onSearchOnOpportunityData() {
    // Don't reset sorting - preserve current sort state when filtering
    // this.sortField = '';
    // this.sortDirection = 'asc';

    // let data: any = {};
    // data.pageSize = this.pageSize,
    //   data.pageIndex = this.page - 1,

    //   data.campaignId = this.allCampaignData[this.selectedCampaignIndex].campaignId;
    // if (this.selectedPreApproved) data.preApprovedStatus = this.selectedPreApproved;
    // if (this.selectedExim) data.productName = this.selectedExim;
    // if (this.rmNameFilter) data.pmName = this.rmNameFilter;
    // if (this.revenueFilter) data.revenue = this.revenueFilter;
    // if (this.customerIdFilter) data.customerId = this.customerIdFilter;
    // if (this.customerNameFilter) data.customerName = this.customerNameFilter;
    // if (this.selectedCampaigns?.length > 0) {
    //   data.campaignIds = this.selectedCampaigns;
    // }
    // if (this.includeInactiveCampaigns !== null && this.includeInactiveCampaigns !== undefined)
    //   data.includeInactiveCampaigns = this.includeInactiveCampaigns;
    // if (this.selectedStatus) data.convertRejectStatus = this.selectedStatus;
    // if (this.roleId) data.roleId = this.roleId;

    let data = this.getloadOpportunityPayload();

    if (this.currentSortField && this.sortDirection) {
      data.sortBy = this.currentSortField;
      data.sortOrder = this.sortDirection;
    }

    this.loadOpportunityDashboardData(data);
    // this.msmeService.fetchOpportunityDashboardData(this.getloadOpportunityPayload()).subscribe({
    //   next: (response) => {
    //     const resData = response?.data?.data || [];
    //     this.opportunityData = resData;
    //     this.totalSize = response?.data?.totalElements || 0;
    //   },
    //   error: (err) => {
    //     console.error("Error fetching data:", err);
    //     this.opportunityData = [];
    //     this.totalSize = 0;
    //   }
    // });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'unfold_more';
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting() {
    if (!this.opportunityData || !this.sortField) return;

    this.opportunityData.sort((a: any, b: any) => {
      let aValue = this.getSortValue(a, this.sortField);
      let bValue = this.getSortValue(b, this.sortField);

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getSortValue(item: any, field: string): any {
    switch (field) {
      case 'customerId':
        return item.customerId?.toLowerCase() || '';
      case 'customerName':
        return item.customerName?.toLowerCase() || '';
      case 'rmName':
        return item.pmName?.toLowerCase() || '';
      case 'revenue':
        if (item.campaignId === 0) {
          return parseFloat(item.allConvertedValue) || 0;
        } else {
          const totalRevenue = item.campaignData?.reduce((sum: number, campaign: any) =>
            sum + (parseFloat(campaign.convertedValue) || 0), 0) || 0;
          return totalRevenue;
        }
      case 'preApproved':
        return item.preApprovedStatus?.toLowerCase() || '';
      case 'exim':
        return item.limitApproved ? String(item.limitApproved).toLowerCase() : '';
      case 'campaign':
        return item.campaignData?.[0]?.campaignName?.toLowerCase() || '';
      default:
        return '';
    }
  }

  OpchangestatusPopup(customerData: any) {
    const dialogRef = this.dialog.open(OpChangeStatusPopupComponent, {
      panelClass: ['popupMain_design'],
      data: { customerData: customerData, currentTabStatus: this.selectedStatus, empCode: String(this.empCode) },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.updatedCustomerData) {
        // old payload: { campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId, convertRejectStatus: this.selectedStatus, includeInactiveCampaigns: this.includeInactiveCampaigns }
        this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
      }
    });
  }
  opExportPopup() {
    const dialogRef = this.dialog.open(OpExportPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2', 'exportNew_popup'],
      data: {
        campaignNameList: this.allCampaignData?.filter(campaign => campaign.campaignId != 0)
          ?.map((campaign) => ({ id: campaign.campaignId, campaignName: campaign.campaignName })),
        customerTypeIds: [this.constants.CustomerType.ETB],
        roleType: this.roleType,
        prospectType: 1
      },
      autoFocus: false,
    });
  }

  navigateToView(pan: String) {
    let panData: any = pan.toString();
    GlobalHeaders['x-page-data'] = panData;
    GlobalHeaders['x-page-action'] = 'View Exisiting Portfolio';
    const routerData = { pan: pan, tabId: 1 };
    saveActivity(() => { });
    this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData, data: this.rmExistingPortfolioPageData, dataFrom: this.pageData, isFromParentPage: true } });
  }

  getSelectedCampaignText(): string {
    const selectedCount = this.selectedCampaigns ? this.selectedCampaigns.length : 0;
    return selectedCount > 0 ? `Selected Campaign: ${selectedCount}` : "Select Campaign Name";
  }

  filterCampaignOptions() {
    this.updateFilteredCampaignOptions();
  }

  filterMenuCampaigns() {
    if (!this.menuCampaignSearchText) {
      this.filteredMenuCampaigns = this.allCampaignData.filter(campaign => campaign?.processingStatus === 'Completed');
    } else {
      this.filteredMenuCampaigns = this.allCampaignData.filter(campaign =>
        campaign.campaignName.toLowerCase().trim().includes(this.menuCampaignSearchText.toLowerCase().trim()) && campaign?.processingStatus === 'Completed'
      );
    }
  }

  filterMenuPmNames() {
    if (!this.menuPmNameSearchText) {
      this.filteredMenuPmNames = this.pmNameListComplete;
    } else {
      this.filteredMenuPmNames = this.pmNameListComplete.filter(pmName =>
        pmName.toLowerCase().trim().includes(this.menuPmNameSearchText.toLowerCase().trim())
      );
    }
  }

  getSelectedCampaignIds(): number[] | null {
    if (!this.selectedMenuCampaigns) {
      return null;
    }

    const campaign = this.allCampaignData.find(c => c.campaignName === this.selectedMenuCampaigns);
    return campaign?.campaignId ? [campaign.campaignId] : null;
  }

  getSelectedPmNames(): string[] | null {
    const selectedNames = Object.keys(this.selectedMenuPmNames)
      .filter(pmName => this.selectedMenuPmNames[pmName]);

    return selectedNames.length > 0 ? selectedNames : null;
  }

  resetCampaignNameFilter(isApiCall: Boolean = true) {
    this.menuCampaignSearchText = '';
    this.filteredMenuCampaigns = this.allCampaignDataComplete.filter(campaign => campaign?.processingStatus === 'Completed');
    this.selectedMenuCampaigns = null;

    this.getAllCampaignDetails(null, this.getSelectedPmNames(), "PM");
  }

  resetPmNameFilter() {
    this.menuPmNameSearchText = '';
    this.filteredMenuPmNames = this.pmNameListComplete;
    this.selectedMenuPmNames = {};

    this.menuCampaignSearchText = '';
    this.filteredMenuCampaigns = this.allCampaignDataComplete.filter(campaign => campaign?.processingStatus === 'Completed');
    this.selectedMenuCampaigns = null;

    this.getAllCampaignDetails(this.getSelectedCampaignIds(), null, "PM");
  }

  resetCampaignAndPmNameFilter() {
    this.menuCampaignSearchText = '';
    this.filteredMenuCampaigns = this.allCampaignDataComplete.filter(campaign => campaign?.processingStatus === 'Completed');
    this.selectedMenuCampaigns = null;

    this.menuPmNameSearchText = '';
    this.filteredMenuPmNames = this.pmNameListComplete;
    this.selectedMenuPmNames = {};

    this.getAllCampaignDetails(null, null, "PM");
  }

  applyPmNameAndCampaignNameFilter(isApiCall: String = "Campaign") {
    this.menuCampaignSearchText = '';
    this.menuPmNameSearchText = '';

    if (isApiCall === "PM" && this.selectedMenuCampaigns) {
      this.filteredMenuCampaigns = this.allCampaignDataComplete.filter(campaign => campaign?.processingStatus === 'Completed');
      this.selectedMenuCampaigns = null;
      this.getAllCampaignDetails(null, this.getSelectedPmNames(), isApiCall);
    } else {
      this.getAllCampaignDetails(this.getSelectedCampaignIds(), this.getSelectedPmNames(), isApiCall);
    }
  }

  clearAllFilters(isApiCall: Boolean = true) {
    this.sortField = '';
    this.sortDirection = '';
    this.currentSortField = '';
    this.customerIdFilter = '';
    this.customerNameFilter = '';
    this.rmNameFilter = '';
    this.revenueFilter = '';
    this.selectedPreApproved = null;
    this.selectedExim = '';
    this.selectedCampaigns = [];
    this.campaignSearchText = '';
    this.updateFilteredCampaignOptions();

    if (isApiCall)
      this.onSearchOnOpportunityData();
  }

  pageSizeChange(size: any, page: any) {
    this.page = page;
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;

    if (this.selectedCampaignIndex !== null && this.selectedCampaignIndex >= 0) {
      let data = this.getloadOpportunityPayload();


      if (this.currentSortField && this.sortDirection) {
        data.sortBy = this.currentSortField;
        data.sortOrder = this.sortDirection;
      }

      if (this.selectedCampaigns && this.selectedCampaigns.length > 0) {
        data.campaignIds = this.selectedCampaigns;
      }
      if (this.campaignIdList && this.campaignIdList.length > 0) {
        data.campaignIds = this.campaignIdList;
      }
      this.loadOpportunityDashboardData(data);
    } else {
      console.warn('No campaign selected');
    }
  }

  onChangePage(page: any): void {
    this.page = page;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.selectedCampaignIndex !== null && this.selectedCampaignIndex >= 0) {
      let data = this.getloadOpportunityPayload();

      if (this.currentSortField && this.sortDirection) {
        data.sortBy = this.currentSortField;
        data.sortOrder = this.sortDirection;
      }

      if (this.selectedCampaigns && this.selectedCampaigns.length > 0) {
        data.campaignIds = this.selectedCampaigns;
      }
      if (this.campaignIdList && this.campaignIdList.length > 0) {
        data.campaignIds = this.campaignIdList;
      }
      this.loadOpportunityDashboardData(data);

    } else {
      console.warn('No campaign selected');
    }
  }


  toggleSort(sortField: string, direction: 'ASC' | 'DESC') {
    this.currentSortField = sortField;
    this.sortDirection = direction.toLowerCase();

    let data = this.getloadOpportunityPayload();
    data.sortBy = sortField;
    data.sortOrder = direction.toLowerCase();

    if (this.selectedCampaigns && this.selectedCampaigns.length > 0) {
      data.campaignIds = this.selectedCampaigns;
    }
    if (this.campaignIdList && this.campaignIdList.length > 0) {
      data.campaignIds = this.campaignIdList;
    }

    this.loadOpportunityDashboardData(data);
  }




  fetchFilterDataList() {
    this.msmeService.fetchFilterDataList("ETB").subscribe({
      next: (response: any) => {
        if (response?.status === 200 || response?.message === 'Success' || response?.message === 'Processed successfully' || response?.data) {
          // console.log('fetchFilterDataList response (ETB):', response);
          this.filterDataList = response.data || response;

          //Robust extraction of loanTopBarData
          let rootData = response;
          if (rootData?.loanTopBarData) {
            // Found at root
          } else if (rootData?.data?.loanTopBarData) {
            rootData = rootData.data;
          } else if (rootData?.data?.data?.loanTopBarData) {
            rootData = rootData.data.data;
          }

          const loanTopBarData = rootData?.loanTopBarData;
          // Note: response might have filters directy or inside another filters object as per previous code
          const filters = loanTopBarData?.filters?.filters // original code had this double nesting
            ?? loanTopBarData?.filters
            ?? [];

          // console.log('Extracted filters (ETB):', filters);

          if (filters.length > 0) {
            filters.forEach((filter: any) => {
              if (filter.topBarFilterType === 'CITY') {
                // Handle potential nesting in options too
                this.cityOptions = filter.options?.options || filter.options || [];
                this.cityFilterList = this.cityOptions.map((o: any) => o.name);
              }
              if (filter.topBarFilterType === 'SEGMENT') {
                this.segmentOptions = filter.options?.options || filter.options || [];
                this.segmentFilterList = this.segmentOptions.map((o: any) => o.name);
              }
            });
          }

          this.filteredCityList = [...this.cityFilterList];
          this.filteredSegmentList = [...this.segmentFilterList];

          // console.log('City List (ETB):', this.cityFilterList);
          // console.log('Segment List (ETB):', this.segmentFilterList);
        }
      },
      error: () => {
        this.commonService.errorSnackBar("Something went wrong!!");
      }
    });

    // Load Parent Company and Parent Country options
    this.loadParentCompanyOptions();
    this.loadParentCountryOptions();
  }

  // Load Parent Company options with pagination
  loadParentCompanyOptions(searchValue: string = '', page: number = 0, append: boolean = false) {
    if (this.parentCompanyLoading) return;

    this.parentCompanyLoading = true;
    this.msmeService.searchParentCompanyDashboard(searchValue, page, this.parentCompanyPageSize).subscribe({
      next: (response: any) => {
        this.parentCompanyLoading = false;
        console.log('Parent Company API response:', response);
        if (response && response.status === 200) {
          // Response has content with fields: sNo, name, value, selected
          const newOptions = (response.content || []).map((item: any) => ({
            id: item.value,  // value contains the actual ID
            name: item.name,
            value: item.value
          }));

          if (append) {
            this.parentCompanyOptions = [...this.parentCompanyOptions, ...newOptions];
          } else {
            this.parentCompanyOptions = newOptions;
          }

          this.filteredParentCompanyList = this.parentCompanyOptions.map(o => o.name);

          // When loading fresh data (not appending), restore selection state from selectedParentCompanyOptions
          // Don't auto-select based on "All" checkbox - only preserve explicitly selected items
          if (!append) {
            // Clear "All" checkbox when loading fresh data after search clear
            // Only keep individual selections that were explicitly made
            this.selectedParentCompanies['All'] = false;

            // Restore checkboxes for items that are in selectedParentCompanyOptions
            this.filteredParentCompanyList.forEach(companyName => {
              const isInSelectedOptions = this.selectedParentCompanyOptions.some(o => o.name === companyName);
              this.selectedParentCompanies[companyName] = isInSelectedOptions;
            });
          } else if (this.selectedParentCompanies['All']) {
            // Only auto-select on append (infinite scroll) if "All" is checked
            newOptions.forEach((option: any) => {
              this.selectedParentCompanies[option.name] = true;
            });
          }

          this.parentCompanyHasMore = response.hasMore || false;
          this.parentCompanyTotalElements = response.totalElements || 0;
          this.parentCompanyPage = page + 1;
        }
      },
      error: (error) => {
        this.parentCompanyLoading = false;
        console.error('Error loading Parent Company options:', error);
      }
    });
  }

  // Handle Parent Company search
  handleParentCompanySearch() {
    this.parentCompanyPage = 0;
    this.parentCompanyHasMore = true;
    this.loadParentCompanyOptions(this.parentCompanySearchText, 0, false);
  }

  // Load more Parent Company options for infinite scroll
  loadMoreParentCompany() {
    if (this.parentCompanyLoading || !this.parentCompanyHasMore) return;
    this.loadParentCompanyOptions(this.parentCompanySearchText, this.parentCompanyPage, true);
  }

  // Handle scroll event for Parent Company infinite scroll
  onParentCompanyScroll(event: any) {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.loadMoreParentCompany();
    }
  }

  // Load Parent Country options (no pagination needed)
  loadParentCountryOptions() {
    this.msmeService.getParentCountryOptions().subscribe({
      next: (response: any) => {
        console.log('Parent Country API response:', response);
        if (response && response.status === 200 && response.data) {
          // Response data has fields: sNo, name, value, selected
          this.parentCountryOptions = (response.data || []).map((item: any) => ({
            id: item.value,  // value contains the actual ID
            name: item.name,
            value: item.value
          }));
          this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);
          console.log('Parent Country options loaded:', this.parentCountryOptions.length);
        }
      },
      error: (error) => {
        console.error('Error loading Parent Country options:', error);
      }
    });
  }

  // Filter Parent Company list based on search
  filterParentCompanyList() {
    if (!this.parentCompanySearchText) {
      this.filteredParentCompanyList = this.parentCompanyOptions.map(o => o.name);
      // Also trigger API to reset to initial data
      this.parentCompanySearchSubject.next('');
    } else {
      // Trigger debounced API search for Parent Company
      this.parentCompanySearchSubject.next(this.parentCompanySearchText);
    }
  }

  // Filter Parent Country list based on search
  filterParentCountryList() {
    if (!this.parentCountrySearchText) {
      this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);
      // When search is cleared, reset "All" checkbox and restore only explicitly selected items
      this.selectedParentCountries['All'] = false;
      // Restore checkboxes for items that are in selectedParentCountryOptions
      this.filteredParentCountryList.forEach(countryName => {
        const isInSelectedOptions = this.selectedParentCountryOptions.some(o => o.name === countryName);
        this.selectedParentCountries[countryName] = isInSelectedOptions;
      });
    } else {
      this.filteredParentCountryList = this.parentCountryOptions
        .filter(o => o.name.toLowerCase().includes(this.parentCountrySearchText.toLowerCase()))
        .map(o => o.name);
    }
  }

  // Handle Parent Company selection change
  onParentCompanyChange(index: number) {
    const companyName = this.filteredParentCompanyList[index];
    const isSelected = this.selectedParentCompanies[companyName];

    // Update selectedParentCompanyOptions array
    if (isSelected) {
      // Add to selected options if not already present
      const option = this.parentCompanyOptions.find(o => o.name === companyName);
      if (option && !this.selectedParentCompanyOptions.find(o => o.name === companyName)) {
        this.selectedParentCompanyOptions.push(option);
      }
    } else {
      // Remove from selected options
      this.selectedParentCompanyOptions = this.selectedParentCompanyOptions.filter(o => o.name !== companyName);
      // If user unchecks any item, "All" should be unchecked
      this.selectedParentCompanies['All'] = false;
    }

    // Auto-select "All" when all items in the filtered list are selected
    // This handles the case when there's a single search result and user selects it
    const allSelected = this.filteredParentCompanyList.length > 0 &&
      this.filteredParentCompanyList.every(company => this.selectedParentCompanies[company] === true);
    this.selectedParentCompanies['All'] = allSelected;
  }

  // Handle Parent Company "All" checkbox change
  onParentCompanyAllChange() {
    const allSelected = this.selectedParentCompanies['All'];
    // Update all items in the options list (not just filtered)
    this.parentCompanyOptions.forEach(option => {
      this.selectedParentCompanies[option.name] = allSelected;
      if (allSelected) {
        // Add to selected options if not already present
        if (!this.selectedParentCompanyOptions.find(o => o.name === option.name)) {
          this.selectedParentCompanyOptions.push(option);
        }
      }
    });
    // If unselecting all, clear the selected options
    if (!allSelected) {
      this.selectedParentCompanyOptions = [];
    }
  }

  // Handle Parent Country selection change
  onParentCountryChange(index: number) {
    const countryName = this.filteredParentCountryList[index];
    const isSelected = this.selectedParentCountries[countryName];

    // Update selectedParentCountryOptions array
    if (isSelected) {
      // Add to selected options if not already present
      const option = this.parentCountryOptions.find(o => o.name === countryName);
      if (option && !this.selectedParentCountryOptions.find(o => o.name === countryName)) {
        this.selectedParentCountryOptions.push(option);
      }
    } else {
      // Remove from selected options
      this.selectedParentCountryOptions = this.selectedParentCountryOptions.filter(o => o.name !== countryName);
    }

    // Check if all individual items are selected
    const allSelected = this.filteredParentCountryList.every(country => this.selectedParentCountries[country] === true);
    this.selectedParentCountries['All'] = allSelected;
  }

  // Handle Parent Country "All" checkbox change
  onParentCountryAllChange() {
    const allSelected = this.selectedParentCountries['All'];
    // Update only the filtered items (visible in the current search)
    this.filteredParentCountryList.forEach(countryName => {
      this.selectedParentCountries[countryName] = allSelected;
      const option = this.parentCountryOptions.find(o => o.name === countryName);
      if (option) {
        if (allSelected) {
          // Add to selected options if not already present
          if (!this.selectedParentCountryOptions.find(o => o.name === countryName)) {
            this.selectedParentCountryOptions.push(option);
          }
        } else {
          // Remove from selected options
          this.selectedParentCountryOptions = this.selectedParentCountryOptions.filter(o => o.name !== countryName);
        }
      }
    });
  }

  // Get selected Parent Company count
  get selectedParentCompanyCount(): number {
    // Use selectedParentCompanyOptions as the source of truth for count
    // This ensures count remains accurate when search text is cleared
    return this.selectedParentCompanyOptions.length;
  }

  // Get selected Parent Country count
  get selectedParentCountryCount(): number {
    // Use selectedParentCountryOptions as the source of truth for count
    // This ensures count remains accurate when search text is cleared
    return this.selectedParentCountryOptions.length;
  }

  // Reset Parent Company filter
  resetParentCompanyFilter() {
    this.parentCompanySearchText = '';
    this.selectedParentCompanies = {};
    this.selectedParentCompanies['All'] = false;
    this.selectedParentCompanyOptions = []; // Clear stored selections
    this.parentCompanyPage = 0;
    this.parentCompanyHasMore = true;
    this.loadParentCompanyOptions();
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  // Reset Parent Country filter
  resetParentCountryFilter() {
    this.parentCountrySearchText = '';
    this.selectedParentCountries = {};
    this.selectedParentCountries['All'] = false;
    this.selectedParentCountryOptions = []; // Clear stored selections
    this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  // Apply Parent filters
  applyParentFilters() {
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  singleSelect(campaignName: string) {
    this.selectedMenuCampaigns = campaignName;
  }

  filterCityList() {
    if (!this.citySearchText) {
      this.filteredCityList = [...this.cityFilterList];
    } else {
      this.filteredCityList = this.cityFilterList.filter(city =>
        city.toLowerCase().includes(this.citySearchText.toLowerCase())
      );
    }
  }

  onCityChange(index: number) {
    const allOption = this.cityFilterList[0];
    const clickedCity = this.filteredCityList[index];

    // Ensure index=0 is 'All' ONLY when filtered list includes real 'All'
    if (index === 0 && clickedCity === allOption) {
      const allSelected = this.selectedCities[allOption];
      this.cityFilterList.slice(1).forEach(city => {
        this.selectedCities[city] = allSelected;
      });
      return;
    }

    const allSelected = this.cityFilterList
      .slice(1)
      .every(city => this.selectedCities[city] === true);

    this.selectedCities[allOption] = allSelected;
  }


  onSegmentChange(index: number) {
    const allOption = this.segmentFilterList[0];  // ALWAYS from FULL list
    const clickedSegment = this.filteredSegmentList[index];

    // Ensure index=0 is 'All' ONLY if actual 'All' is clicked
    if (index === 0 && clickedSegment === allOption) {
      const allSelected = this.selectedSegments[allOption];

      // Update ALL segments in FULL list (not filtered one)
      this.segmentFilterList.slice(1).forEach(seg => {
        this.selectedSegments[seg] = allSelected;
      });
      return;
    }
    const allSelected = this.segmentFilterList
      .slice(1)
      .every(seg => this.selectedSegments[seg] === true);

    this.selectedSegments[allOption] = allSelected;
  }

  get selectedCityCount(): number {
    return Object.keys(this.selectedCities).filter(key => this.selectedCities[key]).length;
  }

  get selectedSegmentCount(): number {
    return Object.keys(this.selectedSegments).filter(key => this.selectedSegments[key]).length;
  }

  private getSelectedValues(
    selectedMap: any,
    filteredList: string[],
    fullList: string[],
    options: { name: string; value: number }[]
  ) {
    const allOptionName = fullList[0];
    const allOptionValue = options.find(o => o.name === allOptionName)?.value;

    const selectedNames = Object.keys(selectedMap).filter(n => selectedMap[n]);

    if (selectedNames.includes(allOptionName)) {
      return fullList.slice(1).map(name => {
        const obj = options.find(o => o.name === name);
        return obj?.value;
      });
    }

    return selectedNames
      .map(name => {
        const obj = options.find(o => o.name === name);
        return obj?.value;
      })
      .filter(v => v != null && v !== allOptionValue);
  }


  applyAllFilters() {
    const selectedCityValues = this.getSelectedValues(
      this.selectedCities,
      this.filteredCityList,
      this.cityFilterList,
      this.cityOptions
    );

    const selectedSegmentValues = this.getSelectedValues(
      this.selectedSegments,
      this.filteredSegmentList,
      this.segmentFilterList,
      this.segmentOptions
    );

    // const data = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId,
    //   includeInactiveCampaigns: this.includeInactiveCampaigns,
    //   convertRejectStatus: this.selectedStatus,
    //   segmentIds: selectedSegmentValues,
    //   cityIds: selectedCityValues
    // };

    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }


  sendFilterRequest(selectedSegmentValues: any[]) {
    // const selectedCityNames = Object.keys(this.selectedCities)
    //   .filter(key => this.selectedCities[key]);

    // const selectedCityValues = selectedCityNames.map(name => {
    //   const cityOption = this.cityOptions.find(o => o.name === name);
    //   return cityOption?.value;
    // }).filter(v => v !== null);

    // const data = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId,
    //   includeInactiveCampaigns: this.includeInactiveCampaigns,
    //   convertRejectStatus: this.selectedStatus,
    //   segmentIds: selectedSegmentValues,
    //   cityIds: selectedCityValues
    // };
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  resetAllFilters() {
    this.citySearchText = '';
    this.segmentSearchText = '';

    this.filteredCityList = [...this.cityFilterList];
    this.filteredSegmentList = [...this.segmentFilterList];

    this.selectedCities = {};
    this.selectedSegments = {};

    // Reset Parent Company and Parent Country filters
    this.parentCompanySearchText = '';
    this.selectedParentCompanies = {};
    this.selectedParentCompanyOptions = []; // Clear stored selections
    this.parentCompanyPage = 0;
    this.parentCompanyHasMore = true;

    this.parentCountrySearchText = '';
    this.selectedParentCountries = {};
    this.selectedParentCountryOptions = []; // Clear stored selections
    this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);

    // const data = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId,
    //   includeInactiveCampaigns: this.includeInactiveCampaigns,
    //   convertRejectStatus: this.selectedStatus,
    //   cityIds: [],
    //   segmentIds: []
    // };

    // const data = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus,
    //   ...(this.selectedCampaignIndex === 0 ? { campaignIds: this.campaignIdList } : {})
    // };

    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  resetCityFilter() {
    this.citySearchText = '';
    this.filteredCityList = [...this.cityFilterList];
    // this.selectedCities = {};
    this.selectedSegments = {};
    // const data = { campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus, cityIds: [] }
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }

  filterSegmentList() {
    if (!this.segmentSearchText) {
      this.filteredSegmentList = [...this.segmentFilterList];
    } else {
      this.filteredSegmentList = this.segmentFilterList.filter(segment =>
        segment.toLowerCase().includes(this.segmentSearchText.toLowerCase())
      );
    }
  }

  resetSegmentFilter() {
    this.segmentSearchText = '';
    this.filteredSegmentList = [...this.segmentFilterList];
    this.selectedSegments = {};
    // const data = { campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: this.selectedStatus, segmentIds: [] }
    this.loadOpportunityDashboardData(this.getloadOpportunityPayload());
  }


  // loadCustomerConvertedRejectedData(){
  //   console.log('loadCustomerConvertedRejectedData called.')
  //   const campaigns = this.opportunityData?.flatMap(item => item?.campaignData || []) || [];
  //   console.log(this.opportunityData)

  //   const { converted, rejected, inProcess } = campaigns.reduce((acc, campaign) => {
  //     const value = campaign?.convertedValue || 0;
  //     switch(campaign?.convertRejectStatus) {
  //       case 'Converted':
  //         acc.converted.count++;
  //         acc.converted.value += value;
  //         break;
  //       case 'Rejected':
  //         acc.rejected.count++;
  //         acc.rejected.value += value;
  //         break;
  //       case 'In Process':
  //         acc.inProcess.count++;
  //         acc.inProcess.value += value;
  //         break;
  //     }
  //     return acc;
  //   }, {
  //     converted: { count: 0, value: 0 },
  //     rejected: { count: 0, value: 0 },
  //     inProcess: { count: 0, value: 0 }
  //   });

  //   this.convertedCustomerCount = converted.count;
  //   this.convertedValue = converted.value;
  //   this.rejectedCustomerCount = rejected.count;
  //   this.rejectedValue = rejected.value;
  //   this.inProcessCustomerCount = inProcess.count;
  //   this.inProcessValue = inProcess.value;
  // }

  hasInProcessCampaigns(item: any): boolean {
    return item?.campaignData?.some(campaign =>
      campaign.convertRejectStatus?.toLowerCase() === 'work in progress' || campaign.convertRejectStatus?.toLowerCase() === 'awaiting action'
    ) || false;
  }

  viewAuditPage(customer: any, type: any) {
    this.commonService.setStorage('auditType', type);
    this.commonService.setStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, "EXISTING_TARGET");
    const routerData = { pan: customer.pan, tabId: 1, apiType: AuditAPIType.API_AUDIT };

    this.router.navigate(["/hsbc/apiAuditLog"], { state: { routerData } });
  }

  convertRejectStatusBasedFiltering(status: any) {
    if (this.selectedStatus === status)
      return;

    this.selectedStatus = status;

    // const data2: any = {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId, includeInactiveCampaigns: this.includeInactiveCampaigns, convertRejectStatus: status,
    //   ...(this.campaignIdList?.length > 0 ? { campaignIds: this.campaignIdList } : {})
    // };
    // let data: any = {};
    // // Add only when value exists
    // data.campaignId = this.allCampaignData[this.selectedCampaignIndex].campaignId;
    // if (this.selectedStatus) data.convertRejectStatus = this.selectedStatus;
    // if (this.includeInactiveCampaigns !== null && this.includeInactiveCampaigns !== undefined)
    //   data.includeInactiveCampaigns = this.includeInactiveCampaigns;
    // if (this.selectedPreApproved) data.preApprovedStatus = this.selectedPreApproved;
    // if (this.selectedExim) data.productName = this.selectedExim;
    // if (this.rmNameFilter) data.pmName = this.rmNameFilter;
    // if (this.revenueFilter) data.revenue = this.revenueFilter;
    // if (this.customerIdFilter) data.customerId = this.customerIdFilter;
    // if (this.customerNameFilter) data.customerName = this.customerNameFilter;
    // if (this.roleId) data.roleId = this.roleId;
    let data = this.getloadOpportunityPayload();
    if (this.campaignIdList?.length > 0) {
      data.campaignIds = this.campaignIdList;
    }
    this.loadOpportunityDashboardData(data);
  }


  isApplyAndResetButtonDisabled(selectedMenu: any): boolean {
    // For radio buttons (campaign), check if it's null or empty string
    if (typeof selectedMenu === 'string' || selectedMenu === null) {
      return !selectedMenu;
    }
    // For checkboxes (PM names), check if any value is true
    return !Object.values(selectedMenu).some(value => value === true);
  }



  isApplyAndResetButtonDisabledForCity(selectedMenu: any): boolean {
    // For radio buttons (campaign), check if it's null or empty string
    if (typeof selectedMenu === 'string' || selectedMenu === null) {
      return !selectedMenu;
    }
    // For checkboxes (PM names), check if any value is true
    return Object.keys(selectedMenu).filter(key => selectedMenu[key]).length === 0;

  }

  getFilteredCampaignCount(): number {
    return this.selectedMenuCampaigns ? 1 : 0;
  }

  getSelectedPmNamesCount(): number {
    return Object.values(this.selectedMenuPmNames).filter(selected => selected === true).length;
  }
  isResetDisabled(): boolean {
    const hasCity = Object.keys(this.selectedCities).some(key => this.selectedCities[key]);
    const hasSegment = Object.keys(this.selectedSegments).some(key => this.selectedSegments[key]);
    const hasParentCompany = Object.keys(this.selectedParentCompanies).some(key => this.selectedParentCompanies[key]);
    const hasParentCountry = Object.keys(this.selectedParentCountries).some(key => this.selectedParentCountries[key]);
    return !(hasCity || hasSegment || hasParentCompany || hasParentCountry);
  }

  protected readonly consValue = Constants;


  auditLogPopup(customerData: any) {
    const dialogRef = this.dialog.open(OpAuditLogPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2'],
      data: { customerData: customerData },
      autoFocus: false,
    });
  }
  hasAnyFiltersApplied(): boolean {
    return !!(this.customerIdFilter || this.customerNameFilter || this.rmNameFilter ||
      this.revenueFilter || this.selectedPreApproved || this.selectedExim ||
      this.selectedCampaigns.length > 0);
  }

  truncateText(text: string): string {
    if (!text) return '';
    return text.length > 20 ? text.substring(0, 20) + '...' : text;
  }

  shouldShowNoCampaignRecords(): boolean {
    return this.filteredMenuCampaigns.length === 0 ||
      this.filteredMenuCampaigns.every(c => this.isAllCampaignData(c.campaignId));
  }

  canShowActions(item: any): boolean {
    // Show actions when includeInactiveCampaigns is true and status is Converted or Rejected or Work In Progress
    if (this.includeInactiveCampaigns &&
      (this.selectedStatus === 'Converted' || this.selectedStatus === 'Rejected' || this.selectedStatus === 'Work In Progress')) {
      return true;
    }

    return (!!item?.isSetStatusAllowed && !this.canShowAudit() && this.includeInactiveCampaigns) || (!this.includeInactiveCampaigns && this.canShowAudit());
  }

  canShowAudit(): boolean {
    // Show audit log when includeInactiveCampaigns is true and status is Converted or Rejected
    if (this.includeInactiveCampaigns &&
      (this.selectedStatus === 'Converted' || this.selectedStatus === 'Rejected' || this.selectedStatus === 'Work In Progress')) {
      return true;
    }

    return this.selectedStatus !== 'Awaiting Action';
  }

  clearSearchValues() {
    this.menuCampaignSearchText = '';
    this.menuPmNameSearchText = '';
    this.parentCountrySearchText = '';
    this.filteredMenuCampaigns = this.allCampaignData.filter(campaign => campaign?.processingStatus === 'Completed');
    this.filteredMenuPmNames = this.pmNameListComplete;
    this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);
    this.activeFilterMenu = null;

    // Reset Parent Company search and reload initial data
    if (this.parentCompanySearchText) {
      this.parentCompanySearchText = '';
      this.parentCompanyPage = 0;
      this.parentCompanyHasMore = true;
      this.loadParentCompanyOptions('', 0, false);
    }
  }

  openFilterView(filterName: string, event: Event) {
    event.stopPropagation();
    this.activeFilterMenu = filterName;
  }

  goBackToMenu(event: Event) {
    event.stopPropagation();
    this.activeFilterMenu = null;
  }

  clearCitySegmentSearchValues() {
    this.citySearchText = '';
    this.segmentSearchText = '';
    this.parentCountrySearchText = '';
    this.filteredCityList = [...this.cityFilterList];
    this.filteredSegmentList = [...this.segmentFilterList];
    this.filteredParentCountryList = this.parentCountryOptions.map(o => o.name);
    this.activeCitySegmentMenu = null;

    // Reset Parent Company search and reload initial data
    if (this.parentCompanySearchText) {
      this.parentCompanySearchText = '';
      this.parentCompanyPage = 0;
      this.parentCompanyHasMore = true;
      this.loadParentCompanyOptions('', 0, false);
    }
  }

  openCitySegmentView(filterName: string, event: Event) {
    event.stopPropagation();
    this.activeCitySegmentMenu = filterName;
  }

  goBackToCitySegmentMenu(event: Event) {
    event.stopPropagation();
    this.activeCitySegmentMenu = null;
  }

  getloadOpportunityPayload() {
    const selectedCityValues = this.getSelectedValues(
      this.selectedCities,
      this.filteredCityList,
      this.cityFilterList,
      this.cityOptions
    );

    const selectedSegmentValues = this.getSelectedValues(
      this.selectedSegments,
      this.filteredSegmentList,
      this.segmentFilterList,
      this.segmentOptions
    );

    // Get selected Parent Company IDs from stored selections
    const selectedParentCompanyIds = this.selectedParentCompanyOptions
      .map(option => option?.value || option?.id)
      .filter(id => id != null);

    // Get selected Parent Country IDs (exclude 'All' option)
    const selectedParentCountryIds = Object.keys(this.selectedParentCountries)
      .filter(name => name !== 'All' && this.selectedParentCountries[name])
      .map(name => {
        const option = this.parentCountryOptions.find(o => o.name === name);
        return option?.value || option?.id;
      })
      .filter(id => id != null);

    let data: any = {};
    data.pageSize = this.pageSize,
      data.pageIndex = this.page - 1,

      data.campaignId = this.allCampaignData[this.selectedCampaignIndex].campaignId;
    if (this.selectedPreApproved) data.preApprovedStatus = this.selectedPreApproved;
    if (this.selectedExim) data.productName = this.selectedExim;
    if (this.rmNameFilter) data.pmName = this.rmNameFilter;
    if (this.revenueFilter) data.revenue = this.revenueFilter;
    if (this.customerIdFilter) data.customerId = this.customerIdFilter;
    if (this.customerNameFilter) data.customerName = this.customerNameFilter;
    if (this.selectedCampaigns?.length > 0) {
      data.campaignIds = this.selectedCampaigns;
    }
    if (this.includeInactiveCampaigns !== null && this.includeInactiveCampaigns !== undefined)
      data.includeInactiveCampaigns = this.includeInactiveCampaigns;
    if (this.selectedStatus) data.convertRejectStatus = this.selectedStatus;
    if (this.roleId) data.roleId = this.roleId;
    if (selectedCityValues) data.cityIds = selectedCityValues;
    if (selectedSegmentValues) data.segmentIds = selectedSegmentValues;

    // Add Parent Company and Parent Country filter values
    if (selectedParentCompanyIds.length > 0) data.parentCompanyIds = selectedParentCompanyIds;
    if (selectedParentCountryIds.length > 0) data.parentCountryIds = selectedParentCountryIds;

    data.customerTypeIds = [this.constants.CustomerType.ETB].join(',');
    data.roleType = this.roleType;
    data.isForNtb = false;
    data.empCode = String(this.empCode);

    return data;
    // return {
    //   campaignId: this.allCampaignData[this.selectedCampaignIndex].campaignId,
    //   preApprovedStatus: this.selectedPreApproved,
    //   exim: this.selectedExim,
    //   pmName: this.rmNameFilter,
    //   revenue: this.revenueFilter,
    //   customerId: this.customerIdFilter,
    //   customerName: this.customerNameFilter,
    //   campaignIds: this.selectedCampaigns,
    //   pageSize: this.pageSize,
    //   pageIndex: this.page - 1,
    //   includeInactiveCampaigns: this.includeInactiveCampaigns,
    //   convertRejectStatus: this.selectedStatus,
    //   roleId: this.roleId,
    //   segmentIds: selectedSegmentValues,
    //   cityIds: selectedCityValues
    // };
  }

  // downloadPreapprovedReport(){

  //   this.msmeService.downloadPreapproved().subscribe((res) => {
  //     if (res && res.status === 200) {
  //       this.downloadExcel(res.contentInBytes, "Report");
  //     } else if (res && res.status === 202) {
  //       this.commonService.warningSnackBar('No Data Found');
  //     } else {
  //       this.commonService.errorSnackBar('Something Went Wrong');
  //     }
  //   });
  // }
  //  downloadExcel(byteData: string, fileName: string) {
  //   const blob = this.base64toBlob(
  //     byteData,
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  //   );
  //   const a = document.createElement('a');
  //   document.body.appendChild(a);
  //   a.style.display = 'none';
  //   const url = window.URL.createObjectURL(blob);
  //   a.href = url;
  //   a.download = fileName;
  //   a.click();
  //   window.URL.revokeObjectURL(url);
  //   a.remove();
  // }

  // base64toBlob(base64Data: string, contentType: string) {
  //   const byteCharacters = atob(base64Data);
  //   const byteNumbers = new Array(byteCharacters.length);
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }
  //   const byteArray = new Uint8Array(byteNumbers);
  //   return new Blob([byteArray], { type: contentType });
  // }
  assignTargetPopup() {
    const dialogRef = this.dialog.open(AssignTargetPopupComponent, {
      panelClass: ['popupMain_design', 'popupMain_design2'],
      data: {},
      autoFocus: false,
    });
  }
}
