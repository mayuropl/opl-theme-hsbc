import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants, ShareholdingTypeDisplay } from 'src/app/CommoUtils/constants';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { ActiveGstDetailsPopupComponent } from 'src/app/Popup/HSBC/active-gst-details-popup/active-gst-details-popup.component';
import { CreditRatingDetailsPopupComponent } from 'src/app/Popup/HSBC/credit-rating-details-popup/credit-rating-details-popup.component';
import { FdiOpportunitydataComponent } from 'src/app/Popup/HSBC/fdi-opportunitydata/fdi-opportunitydata.component';
import { InactiveDisableGstDetailsPopupComponent } from 'src/app/Popup/HSBC/inactive-disable-gst-details-popup/inactive-disable-gst-details-popup.component';
import { LenderMcaChargesPopupComponent } from 'src/app/Popup/HSBC/lender-mca-charges-popup/lender-mca-charges-popup.component';
import { SectorHSNDetailsComponent } from 'src/app/Popup/HSBC/sector-hsn-details/sector-hsn-details.component';
import { UdyamDetailsPopupComponent } from 'src/app/Popup/HSBC/udyam-details-popup/udyam-details-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import { FinancialDataModel } from './McaFinancialModel';
import { HsbcPreApprovedProd, Opportunity } from './OpportunityModel';
import { NonFinancialData, master } from './RiskAlerts';
import { ContactPerson, firmDatailsModel } from './firmDetailsModel';
import { ApiTypeList, ConnectedLendingDetails, CustomData, DetailedShareHoldingEntities, DirectorDetails, EximTop5Parties, IndustryPeer, RelatedEntities, Shareholding } from './networkDetailsModels';
import { SpreadOrderPopupComponent } from 'src/app/Popup/HSBC/spread-order-popup/spread-order-popup.component';
import { GlobalHeaders, resetGlobalHeaders, saveActivity } from "../../../../../CommoUtils/global-headers";
import { DashboardResponse } from '../../targets-prospects/targets-prospects-find/targets-prospects-find.component';
import { WarningPopupComponent } from 'src/app/Popup/HSBC/warning-popup/warning-popup.component';
import { environment } from 'src/environments/environment';
import { RemarkAlertPopupComponent } from 'src/app/Popup/remark-alert-popup/remark-alert-popup.component';
// Use Highcharts 12.4.0 for this component (highcharts-v12 alias in package.json)
import * as HighchartsNS from 'highcharts-v12';
const Highcharts = (HighchartsNS as any).default ?? HighchartsNS;
import { MillionFormatPipe } from 'src/app/CommoUtils/pipe/million-format.pipe';
import { debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ProfileDetailsPopupComponent } from 'src/app/Popup/HSBC/profile-details-popup/profile-details-popup.component';
import { InvesteeCompaniesPopupComponent } from 'src/app/Popup/HSBC/investee-companies-popup/investee-companies-popup.component';
import { CustomDateheaderComponent } from '../../custom-dateheader/custom-dateheader.component';
import { log } from 'console';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { InvesteeCompanyDetailsComponent } from './investee-company-details/investee-company-details.component';
import { FundingRoundPopupComponent } from 'src/app/Popup/HSBC/funding-round-popup/funding-round-popup.component';
import { AssociatedLegalEntitiesPopupComponent } from 'src/app/Popup/HSBC/associated-legal-entities-popup/associated-legal-entities-popup.component';
import { AgriHsnDetailPopupComponent } from 'src/app/Popup/HSBC/agri-hsn-detail-popup/agri-hsn-detail-popup.component';
import { stringify } from 'querystring';
import { forkJoin } from 'rxjs';
import { NewAgeEconomySubTab } from 'src/app/CommoUtils/constants';
import { PortfolioAnalysisRequest } from '../../bank-statement-analysis/bank-statement-analysis.component';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';
import { Clipboard } from '@angular/cdk/clipboard';
import * as dayjs from 'dayjs/esm';
import * as moment from 'moment';
import { LocaleConfig } from 'ngx-daterangepicker-material';
import { Moment } from 'moment';
import { CorporateSubscribePopupComponent } from 'src/app/Popup/HSBC/corporate-subscribe-popup/corporate-subscribe-popup.component';
import { CrilcReportPopupComponent } from 'src/app/Popup/crilc-report-popup/crilc-report-popup.component';
 
@Component({
  selector: 'app-rm-exisiting-portfolio-view',
  templateUrl: './rm-exisiting-portfolio-view.component.html',
  styleUrl: './rm-exisiting-portfolio-view.component.scss',
})
export class RmExisitingPortfolioViewComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading: boolean = false;
  hidden: boolean = false;
  customerType: any = null;
  customerTypeStr: string;
  prescreenData: prescreenData[] = [];
  isPreScreen: boolean = false;
  preScreeCheckInTab: boolean = false;
  pageOfItems: Array<any>;
  selectedTabIndex: number;
  tabValue: number;
  selectedbsDetails: any;
  activatebs: any;
  pageSize = 10;
  crilcNoDataMessage: string = '';
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: number = 0;
  totalCount;
  userId: any;
  panVerified: boolean = false;
  cin: string;
  pan: string;
  // Tab id 1 for existing tab, 2 for targer prospect
  tabId: Number;
  routerData: any;
  isCollapsed1?: boolean;
  isClick: Boolean = false;

  speedScore = 0;
  riskScoreGraphClass = 'norisk_box';
  readingSpeed: Number;
  niddleSpeed: Number;

  // For Crisil Integration
  isRetry: Boolean = false;
  retryOptionEnabled: Boolean = true;
  lastRefreshedDate: any;
  newOrderAvailableDate: any;
  tooltipMessage: any;
  crisilData: any = [];
  hsbcBankersData: any = [];
  hsbcRatingsData: any = [];
  hsbcIrsData: any = [];
  isHsbcIrsDataFetched: Boolean = false;
  IsCheckHsbcIrsScoreDate: any;
  hsbcIndustryBenchmarkRatings: any = [];
  isHsbcIndustryBenchmarkRatingsFetched: Boolean = false;
  hsbcIndustryBenchmark: any = [];
  isHsbcIndustryBenchmarkFetched: Boolean = false;
  peerComparisonData: any = [];
  isPeerComparisonDataFetched: Boolean = false;
  irsFirstObject: any;
  industryNames: string[] = [];
  selectedIndustry: string | null = null;

  // Firm details page
  isFirmDataFetched: Boolean = false;
  firmDatailsModel: firmDatailsModel;
  tradingName: String;
  industry: String;
  sector: String;
  turnOver: String;
  latestCreditRating: String;
  businessAddress: String;
  constitutions: String;
  contactInfo: ContactPerson;
  isLatestCreditRatingFromMca: Boolean = false;
  isLatestCreditRatingFromExternal: Boolean = true;
  isContactInfoFromMca: Boolean = false;
  isBusinessAddressFromMca: Boolean = false;
  isConstitutionsFromGst: Boolean = false;
  isTradingNameFromMca: Boolean = false;
  isTurnOverFromMca: Boolean = false;
  currentSortField: string = null;
  currentSortField2: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  valueA: any;
  valueB: any;
  bankTabInd: any;

  // Corporate Announcements Pagination
  corporatePageNumber: number = 1;
  corporatePageSize: number = 5;
  corporateTotalElements: number = 0;

  // CRILC Lender Details
  crilcLenderData: any[] = [];
  crilcLenderPageNumber: number = 1;
  crilcLenderPageSize: number = 10;
  crilcLenderTotalElements: number = 0;
  isCrilcLenderDataLoading: boolean = false;
  selectedMonthForMenu: any = null;

  // Opportunity tab
  isOpportunityDataFetched: Boolean = false;
  opportunityData: Opportunity;

  // MCA financial tab
  isMcaFinacialDataFetched: Boolean = false;
  mcaFinancialData: FinancialDataModel;

  // Alerts tab
  nonFinancialFetched: Boolean = false;
  nonFinancialData: NonFinancialData[] = [];
  nonFinancialDataDump: NonFinancialData[] = [];
  alertSelectedMonth: string;
  nonFinancialDataDumpForAH: NonFinancialData[] = [];
  alertCategoryMasterList: master[] = [];
  alertSeverityMasterList: master[] = [];
  alertStatusMaster: master[] = [{ id: 4, type: "No Status" }, { id: 1, type: "Pending" }, { id: 2, type: "Submitted" }, { id: 3, type: "Completed" }];
  dateFilterMaster: master[] = [{ id: 0, type: "All" }, { id: 1, type: "Last 30 Days" }, { id: 2, type: "Last 60 Days" }, { id: 3, type: "Last 90 Days" }];
  alertTagsMasterList: String[] = [];
  activeAlertCount: String;
  activeAlertCountFromTab1: String;
  inActiveAlertCount: String;
  alertSearchForm: FormGroup;
  fdiOdiAndEcbWallet: any;
  fdiOdiAndEcbWalletYears: [] = [];
  private destroy$ = new Subject<void>();

  monthShortName = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  }

  alerPag: PaginationSignal = new PaginationSignal();

  // Network tab
  isDirectorAndConnectingLenderFetched: Boolean = false;
  connectedLendingDetailsList: ConnectedLendingDetails[] = [];
  connectedLendingDetailsPag: PaginationSignal = new PaginationSignal();
  directorDetailsList: DirectorDetails[] = [];
  customData: CustomData;

  directorDetailsPag: PaginationSignal = new PaginationSignal();
  directorDetailsPag2: PaginationSignal = new PaginationSignal();
  childCustomerPag: PaginationSignal = new PaginationSignal();
  isShareHoldingDataFetched: Boolean = false;
  isDetailShareHoldingDataFetched: Boolean = false;
  shareHoldingList: Shareholding[] = [];
  shareHoldingYear: number;
  detailedShareHoldingList: DetailedShareHoldingEntities[] = [];
  relatedTypeList = [];
  riskAlertsModuleList = ["Bureau", "Saverisk - News", "GST", "EXIM"];
  relatedEntitiesListMain: RelatedEntities[] = [];
  relatedEntitiesList: RelatedEntities[] = [];
  fyYear: string;
  fynoOfShareYear: string;

  shareHoldingPag: PaginationSignal = new PaginationSignal();
  detailShareHoldingPag: PaginationSignal = new PaginationSignal();
  relatedEntitiesPage: PaginationSignal = new PaginationSignal();

  hsbcPreApprovedProdList: HsbcPreApprovedProd[] = [];
  hsbcPreAppProductPage: PaginationSignal = new PaginationSignal();
  clientHistoryPage: PaginationSignal = new PaginationSignal();
  firstClientStatus: string = '';
  firstClientReason: string = '';

  assignHistoryPage: PaginationSignal = new PaginationSignal();

  isIndustryPeerDataFetched: Boolean = false;
  industryPeerList: IndustryPeer[] = [];
  isCounterPartyDataFetched: Boolean = false;
  top5ExportParties: EximTop5Parties[] = [];
  top5ImportParties: EximTop5Parties[] = [];
  selectedNetworkTabIndex: number;

  selectedAlertsTabIndex: number = 0;

  topFiveBuyersList: any = [];
  topFiveSalesList: any = [];
  bankDetailsListRes: any = [];
  apiRefresh: boolean = false;
  shareLink = '';
  email: any = {};
  customerTypeId;

  relatedEntCountry: string = 'All';
  relatedEntRelationType: string = 'All';
  selectedDomainDetails: any;

  domainList: any = [];
  isShowLess = false;
  mainList: any = [];
  alreadyFetchdomainList: any = [];
  fetchDomainList: any = [];
  removeDomainList: any = [];
  refreshDomainList: any = [];
  MAIN_TAB_TYPE = {
    0: 'FIRM_PROFILE',
    1: 'OPPORTUNITY',
    2: 'FINANCIALS',
    3: 'RISK_ALERTS',
    4: 'NETWOTK',
    5: 'ANALYTICS',
    7: 'INNOVATION_BANKING_INSIGHTS'
  };


  PageSelectNumber: any[] = [
    {
      name: '5',
      value: 5,
    },
    {
      name: '10',
      value: 10,
    },
    {
      name: '20',
      value: 20,
    },
    {
      name: '50',
      value: 50,
    },
    {
      name: '100',
      value: 100,
    },
  ];

  OpPageSelectNumber: any[] = [
    {
      name: '5',
      value: 5,
    },
    {
      name: '10',
      value: 10,
    },
    {
      name: '20',
      value: 20,
    }
  ];
  pageData: any = {};
  state: any = {};
  analyticsSubpage: any = [];
  cominsoonSubpage: any;
  constants: any = [];
  psgeGstList: any = [];
  protected readonly consValue = Constants;
  DataStatus = [
    { value: 'Buys from India', viewValue: 'someData', tab: '1' },
    { value: 'Sales to India', viewValue: 'someData', tab: '1' },
  ];
  apiTypeList: ApiTypeList[] = [];
  orderFinancialStatus: any = {};
  isOrderFinancial: boolean = false;

  ShareholdingTypeDisplay = ShareholdingTypeDisplay; // Expose this to the template
  isMCAFinancialActive: boolean;
  isFirmProfileActive: boolean = false;
  isNetworkActive: boolean = false;
  isIndustryBenchmarkSubTabActive: boolean = false;
  isPeerComparisonTabActive: boolean = false;
  isApiStatusFind: boolean = false;
  isFindProspects: boolean = false;
  isFindETB: boolean = false;
  isFindSameRm: boolean = true;

  scrolled: boolean = false;
  findProspectsHitType: boolean = false;
  dashboardResponse: DashboardResponse;
  roleId: any;
  historyStateData: boolean = false;
  private apiRefTimeout: any;
  newDomain: string = '';
  errorDomainMessage: string = '';
  innovateBankingDetails: any;
  showGetDetailsButton: boolean = true;
  showDropdown: boolean = false;
  selectedDomain: string = '';
  getDomain: any = [];
  customerTypeFdiOdiEcbList: any[] = [Constants.CustomerType.FDI, Constants.CustomerType.ODI, Constants.CustomerType.ECB];
  validDomainExtensions: string[] = [
    '.com', '.org', '.in', '.ai', '.net', '.edu', '.gov', '.mil',
    '.co.in', '.info', '.biz', '.tech', '.io', '.co', '.cc', '.app',
    '.dev', '.eco', '.cloud', '.technology', '.xyz', '.host'
  ];
  listOfEmployeeDetailsData: any = [];
  listOfinvestorDetailsData: any = [];
  listOfFacilitorsData: any = [];
  listOfCompetitor: any = [];
  listOfAquiredCompanies: any = [];
  listOfPartOfCompanies: any = [];
  litOfBusinessAndCoverageDetails: any = [];
  listOfFundingRoundListdetails: any = [];
  listOfAssociatedEntitiesDetails: any = [];
  listOfFundingRoundVentureDebtListdetails: any = [];
  listOfFundingRoundBuyOutListdetails: any = [];


  tracxnEmployeePage: PaginationSignal = new PaginationSignal();
  tracxnInvestorPage: PaginationSignal = new PaginationSignal();
  tracxnFacilitorPage: PaginationSignal = new PaginationSignal();
  tracxnCompetitorPage: PaginationSignal = new PaginationSignal();
  tracxnAquiredPage: PaginationSignal = new PaginationSignal();
  tracxnPartofPage: PaginationSignal = new PaginationSignal();
  tracxnBusinessAndCoveragePage: PaginationSignal = new PaginationSignal();
  tracxnInvestorProfileDetailsPage: PaginationSignal = new PaginationSignal();
  tracxnFundingRoundListDetailsPage: PaginationSignal = new PaginationSignal();
  tracxnAssociatedEntitiesPage: PaginationSignal = new PaginationSignal();
  tracxnFundingVentureDebtPage: PaginationSignal = new PaginationSignal();
  tracxnFundingBuyOutPage: PaginationSignal = new PaginationSignal();


  investorProfileProgressMap: { [id: number]: boolean } = {};
  investorProfileSuccessMap: { [id: number]: boolean } = {};

  investorCompanyProgressMap: { [id: number]: boolean } = {};
  investorCompanySuccessMap: { [id: number]: boolean } = {};

  partOfCompanyProgressMap: { [id: number]: boolean } = {};
  partCompanySuccessMap: { [id: number]: boolean } = {};

  associatedEntitiesProgressMap: { [id: number]: boolean } = {};
  associatedEntitieSuccessMap: { [id: number]: boolean } = {};

  innovateProfileDetails: any = [];
  joinLocation: any;
  investorBusinessDetailsAndCoverageAreaList: any = [];

  activeAlertCountWithStatus: any;
  severityTimelineGraph: any;
  categoryTimelineGraph: any;
  activeAlertCountWithType: any = [];
  riskScoreGraph: any;
  otherProspect: boolean = false;
  indicators: any;
  selectedDays: string = 'All';
  filteredIndicators: any[];
  commercialData: any;
  cmrScore: any;
  bureauVintage: any;
  totalLenders: any;
  borrowerInformation: any;
  additionalDetails: any;
  numberOfInquiriesOutsideInstitution: any;
  outStandingBalanceBasedOnAssetsClassification: any;
  outStandingBalanceBasedOnAssetsClassificationNew: any;
  productWiseDetailsNew6: any;
  productWiseDetailsOld6: any;
  productWisePagination: any;
  defaultData: any;
  defaultDataPagination: any;
  dpdDetail: any;
  totalYourInstitution: any;
  totalOtherInstitution: any;
  totalHSBCPercentage: number;
  totalnoOfCreditFacility: any;
  totalsanctionedAmountOther: any;
  totalsanctionedAmountHsbc: any;
  totalutilizationOther: any;
  totalutilizationHsbc: any;
  totaloutStandingAmountHsbc: any;
  totaloutStandingAmountOther: any;
  totalOtherUtiPercentage: number;
  totalHsbcUtiPercentage: number;
  productWisePaginationData: any;
  paginationService: any;
  defaultDataPaginationData: any;
  domainName: any;
  selectedDate: string;
  isValidAddToTarget: boolean = true;

  isNewAgeEconomyAvailable: boolean = false;

  externalRoutData: any;
  rejectedPorfolioDataHistory = [];
  assignHistoryData = [];
  clientUpdateHistoryData = [];
  rejectedCustomer: FormGroup;
  showRejectionDetails: boolean = false;
  isRejectionDetailsExpanded: boolean = false;

  NewAgeEconomySubTab = NewAgeEconomySubTab;
  isTracxnRefreshing: boolean = false;
  newAgeEconomySelectedSubTab: string = NewAgeEconomySubTab.KEY_INSIGHTS;

  pagination: any = { pageIndex: 1, pageSize: 5, reportType: '6', filterApplied: false };
  opportunityList: any;
  isOppLoading: any = { opportunity: false };
  opportunityOption: any = "1";
  copyTooltipText = 'Copy';

  moment = moment;
  calendarLocale: LocaleConfig;
  ranges: any;
  calendarPlaceholder: string;
  selectedRange: null;
  minDates: Moment;
  maxDateS: Moment;

  // Corporate inner tab (visible tabs + More dropdown)
  // Corporate Announcements Logic
  allAnnouncements: any[] = [];
  allParentCategories: string[] = []; // Master list of all possible categories
  categoriesWithCounts: { name: string, count: number }[] = [];
  selectedParentCategory: string = 'All'; // Default

  // Subscription Filter State
  subscriptionFilter: string = 'ALL'; // Current filter ("ALL", "SUBSCRIBED", "UNSUBSCRIBED")
  subscriptionCounts: any = {
    all: 0,
    subscribed: 0,
    unsubscribed: 0
  };

  // Dynamic Tabs
  corporateInnerTabLabels: string[] = [];
  corporateDetails: any[] = []; // Data for the grid
  corporateInnerSelectedIndex: number = 0;
  selectedSubCategoryStr: string = 'All';
  corporateStartDate: string | null = null;
  corporateEndDate: string | null = null;
  subscribedSubcategoriesList: string[] = [];
  
  // Subscription status maps for bell icon display
  subscribedCategoriesMap: Set<string> = new Set(); // "CATEGORY||SUBCATEGORY"
  unsubscribedCategoriesMap: Set<string> = new Set(); // "CATEGORY||SUBCATEGORY"

  // Manage Subscription Modal
  @ViewChild('subscribeModal') subscribeModal!: any;
  manageModalRef: any;
  searchSubcategoryText: string = '';
  manageSubcategories: { name: string, selected: boolean }[] = [];
  isAllSubcategoriesSelected: boolean = false;

  public categorySubcategoryMap: any = {};
  // The categoriesWithCounts property is already declared above, so we don't duplicate it here.

  // New Method: Fetch Data
  fetchAnnouncements() {
    if (!this.cin && !this.pan) {
      console.warn('No CIN or PAN found for this customer');
      return;
    }

    // First ensure we have the master list of all categories
    if (this.allParentCategories.length === 0) {
      this.msmeService.getAllParentCategories().subscribe(masterList => {
        this.allParentCategories = masterList || [];
        this.fetchStatsData();
      }, error => {
        console.error("Error fetching master category list", error);
        this.fetchStatsData(); // Fallback to fetching just stats if master list fails
      });
    } else {
      this.fetchStatsData(); // We already have the master list, just get the numbers
    }
  }

  // Fetch CRILC Lender Details
  fetchCrilcLenderDetails() {
    if (!this.pan) {
      console.warn('No PAN found for this customer');
      return;
    }

    this.isCrilcLenderDataLoading = true;
    const payload = {
      pan: this.pan,
      page: this.crilcLenderPageNumber,
      limit: this.crilcLenderPageSize
    };

    this.msmeService.getCrilcLenderDetails(payload).subscribe({
      next: (response: any) => {
        console.log('CRILC Lender Details Response:', response);
        if (response && response.status === 200) {
          const rawData = response.data || [];
          this.crilcNoDataMessage = response.message;
          this.crilcLenderData = rawData.map((item: any) => {
            const data = item.months?.data || {};
            const existingBanks = data.existing_banks || [];
            const includedBanks = data.included_banks || [];
            const excludedBanks = data.excluded_banks || [];
            
            const allBanksArray = [...includedBanks, ...existingBanks];
            
            const allBanksObjs = allBanksArray.map(b => ({
              bankName: b,
              status: includedBanks.includes(b) ? 'NEW' : 'EXISTING'
            }));
            const newBanksArray = includedBanks.map((b: string) => ({ bankName: b }));
            const removedBanksArray = excludedBanks.map((b: string) => ({ bankName: b }));
            
            let displayBanks = [...allBanksArray];
            let moreCount = 0;
            if (displayBanks.length > 2) {
              moreCount = displayBanks.length - 2;
              displayBanks = displayBanks.slice(0, 2);
            }
            
            return {
              calendarYear: item.calendar_year || item.calendarYear,
              monthName: item.month_name || item.monthName,
              months: {
                displayData: {
                  count: data.count || 0,
                  displayBanks: displayBanks,
                  moreCount: moreCount,
                  allBanks: allBanksObjs,
                  newBanks: newBanksArray,
                  removedBanks: removedBanksArray
                }
              }
            };
          });
          this.crilcLenderTotalElements = response.totalCount || 0;
          console.log('CRILC Lender Data:', this.crilcLenderData);
        } else {
          console.error('Failed to fetch CRILC lender details:', response.message);
          this.crilcLenderData = [];
          this.crilcNoDataMessage = response.message;
        }
        this.isCrilcLenderDataLoading = false;
      },
      error: (error) => {
        console.error('Error fetching CRILC lender details:', error);
        this.crilcLenderData = [];
        this.isCrilcLenderDataLoading = false;
      }
    });
  }

  searchBankText: string = '';
  getFilteredBanks(banks: any[]): any[] {
    if (!banks || banks.length === 0) return [];
    if (!this.searchBankText) return banks;
    const searchText = this.searchBankText.toLowerCase();
    return banks.filter(bank => bank.bankName.toLowerCase().includes(searchText));
  }

  onCrilcLenderPageChange(page: number): void {
    this.crilcLenderPageNumber = page;
    this.fetchCrilcLenderDetails();
  }

  getBankDisplayText(monthData: any): string {
    if (!monthData || !monthData.months || !monthData.months.displayData) {
      return 'NA';
    }
    
    const displayData = monthData.months.displayData;
    const displayBanks = displayData.displayBanks || [];
    const moreCount = displayData.moreCount || 0;
    
    let text = displayBanks.join(', ');
    if (moreCount > 0) {
      text += ` (+${moreCount} more)`;
    }
    
    return text || 'NA';
  }

  getAllBanksForMonth(monthData: any): any[] {
    if (!monthData || !monthData.months || !monthData.months.displayData) {
      return [];
    }
    return monthData.months.displayData.allBanks || [];
  }

  getNewBanksForMonth(monthData: any): any[] {
    if (!monthData || !monthData.months || !monthData.months.displayData) {
      return [];
    }
    return monthData.months.displayData.newBanks || [];
  }

  getRemovedBanksForMonth(monthData: any): any[] {
    if (!monthData || !monthData.months || !monthData.months.displayData) {
      return [];
    }
    return monthData.months.displayData.removedBanks || [];
  }

  getMonthCount(monthData: any): number {
    if (!monthData || !monthData.months || !monthData.months.displayData) {
      return 0;
    }
    return monthData.months.displayData.count || 0;
  }

  getGroupedByYear(data: any[]): any[] {
    const grouped = new Map<number, any>();
    
    data.forEach(item => {
      const year = item.calendarYear;
      if (!grouped.has(year)) {
        grouped.set(year, {
          year: year,
          months: new Array(12).fill(null)
        });
      }
      
      const monthIndex = this.getMonthIndex(item.monthName);
      if (monthIndex !== -1) {
        grouped.get(year).months[monthIndex] = item;
      }
    });
    
    return Array.from(grouped.values()).sort((a, b) => b.year - a.year);
  }

  getMonthIndex(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let idx = months.indexOf(monthName);
    if (idx === -1) {
      idx = shortMonths.indexOf(monthName);
    }
    return idx;
  }

  isNewBank(newBanks: any[], bankName: string): boolean {
    if (!newBanks || !Array.isArray(newBanks)) {
      return false;
    }
    return newBanks.some(b => b.bankName === bankName);
  }

  openBankMenu(month: any) {
    this.selectedMonthForMenu = month;
    this.searchBankText = ''; // <-- ADD THIS LINE
    console.log('=== Bank Menu Opened ===');
    console.log('Selected month:', this.selectedMonthForMenu);
    console.log('All banks:', this.selectedMonthForMenu?.months?.displayData?.allBanks);
    console.log('New banks:', this.selectedMonthForMenu?.months?.displayData?.newBanks);
  }

  /**
   * Determines if the active banks section should be visible
   * @returns true if there are filtered active banks or search is empty
   */
  hasFilteredActiveBanks(): boolean {
    if (!this.selectedMonthForMenu?.months?.displayData?.allBanks) return false;
    if (!this.searchBankText) return true; // Show when no search
    return this.getFilteredBanks(this.selectedMonthForMenu.months.displayData.allBanks).length > 0;
  }

  /**
   * Determines if the removed banks section should be visible
   * @returns true if there are filtered removed banks or search is empty
   */
  hasFilteredRemovedBanks(): boolean {
    if (!this.selectedMonthForMenu?.months?.displayData?.removedBanks) return false;
    if (!this.searchBankText) return true; // Show when no search
    return this.getFilteredBanks(this.selectedMonthForMenu.months.displayData.removedBanks).length > 0;
  }

  private fetchStatsData() {
    const payload: any = this.cin ? { cin: this.cin } : { pan: this.pan };
    if (this.corporateStartDate) payload.startDate = this.corporateStartDate;
    if (this.corporateEndDate) payload.endDate = this.corporateEndDate;

    this.msmeService.getCorporateAnnouncementsStats(payload).subscribe(data => {
      console.log("Raw announcements stats received:", data);
      this.allAnnouncements = data || [];
      this.calculateCategoryCounts();

      // Ensure 'All' is selected by default to load the full unfiltered view when first clicking the tab
      this.selectParentCategory('All');
    }, error => {
      console.error("Error fetching announcement stats", error);
    });
  }

  calculateCategoryCounts() {
    // 1. Initialize our return list with the master parent categories, all set to 0 initially.
    let mergedCategories: { name: string, count: number }[] = [];

    // Create base 0 counts for everything in the master list
    if (this.allParentCategories && this.allParentCategories.length > 0) {
      mergedCategories = this.allParentCategories.map(cat => ({ name: cat, count: 0 }));
    }

    // 2. Map over the actual active stats from the DB
    const activeStats = this.allAnnouncements.map(item => ({
      name: item.group,
      count: item.totalCount
    }));

    // 3. Merge them: if a category from the active stats exists in our master list, update its count.
    // If we didn't get any master list from the API for some reason, just fallback to using activeStats directly.
    if (mergedCategories.length > 0) {
      activeStats.forEach(stat => {
        const found = mergedCategories.find(c => c.name === stat.name);
        if (found) {
          found.count = stat.count;
        } else {
          // Edge case: A category exists in DB stats but wasn't in the master categories list
          mergedCategories.push(stat);
        }
      });
      this.categoriesWithCounts = mergedCategories;
    } else {
      this.categoriesWithCounts = activeStats;
    }
  }

  selectParentCategory(category: string) {
    this.selectedParentCategory = category;

    if (category === 'All') {
      this.corporateInnerTabLabels = [];
      this.allAnnouncements.forEach(groupItem => {
        if (groupItem.subgroups) {
          groupItem.subgroups.forEach(sub => {
            if (!this.corporateInnerTabLabels.includes(sub.subgroup)) {
              this.corporateInnerTabLabels.push(sub.subgroup);
            }
          });
        }
      });
    } else {
      const dataForParent = this.allAnnouncements.find(item => item.group === category);
      if (dataForParent && dataForParent.subgroups) {
        this.corporateInnerTabLabels = dataForParent.subgroups.map(sub => sub.subgroup);
      } else {
        this.corporateInnerTabLabels = [];
      }
    }

    this.corporateInnerTabLabels.sort();

    // Always ensure "All" is at the front of subcategories
    if (!this.corporateInnerTabLabels.includes('All')) {
      this.corporateInnerTabLabels.unshift('All');
    }

    // Reset Tab Selection
    this.corporateInnerSelectedIndex = 0;
    if (this.corporateInnerTabLabels.length > 0) {
      this.selectSubCategory(this.corporateInnerTabLabels[0], true);
    } else {
      this.corporateDetails = [];
      this.corporateTotalElements = 0;
    }
  }

  getSubcategoryCount(subCategoryName: string): number {
    let count = 0;

    // 1. If the tab is "All", return the total count for the current view
    if (subCategoryName === 'All') {
      if (this.selectedParentCategory === 'All') {
        // Sum everything
        this.allAnnouncements.forEach(group => {
          count += (group.totalCount || 0);
        });
      } else {
        // Return total for the specific parent category
        const parent = this.allAnnouncements.find(g => g.group === this.selectedParentCategory);
        if (parent) count = parent.totalCount || 0;
      }
      return count;
    }

    // 2. If it's a specific subcategory
    if (this.selectedParentCategory === 'All') {
      // If we are viewing "All" categories, find this subcategory inside all groups and sum it
      this.allAnnouncements.forEach(group => {
        if (group.subgroups) {
          const sub = group.subgroups.find((s: any) => s.subgroup === subCategoryName);
          if (sub) count += (sub.count || 0);
        }
      });
    } else {
      // If we are viewing a specific parent category, look only inside that parent
      const parent = this.allAnnouncements.find(g => g.group === this.selectedParentCategory);
      if (parent && parent.subgroups) {
        const sub = parent.subgroups.find((s: any) => s.subgroup === subCategoryName);
        if (sub) count = sub.count || 0;
      }
    }

    return count;
  }

  selectSubCategory(subCategory: string, resetPagination: boolean = true) {
    if (resetPagination) {
      this.corporatePageNumber = 1;
    }

    this.selectedSubCategoryStr = subCategory;
    this.corporateDetails = [];
    if (!this.cin && !this.pan) return;

    // Payload for actual fetch API
    const payload: any = {
      group: this.selectedParentCategory === 'All' ? 'ALL' : this.selectedParentCategory,
      subgroup: subCategory === 'All' ? 'ALL' : subCategory,
      userId: this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true),
      subscriptionFilter: this.subscriptionFilter,
      pageNumber: this.corporatePageNumber - 1, // API is 0-indexed
      pageSize: this.corporatePageSize
    };
    if (this.cin) payload.cin = this.cin;
    if (this.pan) payload.pan = this.pan;
    if (this.corporateStartDate) payload.startDate = this.corporateStartDate;
    if (this.corporateEndDate) payload.endDate = this.corporateEndDate;

    // Fetch announcements based on filter
    this.msmeService.fetchFilteredAnnouncements(payload).subscribe(data => {
      // Check for PaginatedResponse structure returned from backend
      if (data && typeof data.content !== 'undefined') {
        this.corporateDetails = data.content || [];
        this.corporateTotalElements = data.totalElements || 0;
      } else {
        // Fallback or empty state handling
        this.corporateDetails = data || [];
        this.corporateTotalElements = this.corporateDetails.length;
      }
    }, error => {
      console.error("Error fetching filtered announcements", error);
    });

    // Also fetch the filter counts parallelly
    this.fetchSubscriptionCounts(payload);

    // Fetch ALL subscriptions (both subscribed and unsubscribed) to drive the bell icon UI
    const requestCategory = this.selectedParentCategory === 'All' ? 'ALL' : this.selectedParentCategory;
    const subPayload: any = {
      userId: this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true),
      category: requestCategory
    };
    if (this.cin) subPayload.cin = this.cin;
    if (this.pan) subPayload.pan = this.pan;

    console.log("Fetching UI subscriptions for category:", requestCategory, "Payload:", subPayload);

    this.msmeService.getCorporateAnnouncementSubscriptions(subPayload).subscribe({
      next: (res: any) => {
        if (res && res.status === 200 && res.data) {
          // Backend returns: { subscribed: ["CAT||SUBCAT"], unsubscribed: ["CAT||SUBCAT"] }
          const subscriptionData = res.data;

          // Clear previous data
          this.subscribedCategoriesMap.clear();
          this.unsubscribedCategoriesMap.clear();

          // Populate subscribed map
          if (subscriptionData.subscribed && Array.isArray(subscriptionData.subscribed)) {
            subscriptionData.subscribed.forEach((key: string) => {
              this.subscribedCategoriesMap.add(key.toUpperCase());
            });
          }

          // Populate unsubscribed map
          if (subscriptionData.unsubscribed && Array.isArray(subscriptionData.unsubscribed)) {
            subscriptionData.unsubscribed.forEach((key: string) => {
              this.unsubscribedCategoriesMap.add(key.toUpperCase());
            });
          }

          // Keep old format for backward compatibility
          this.subscribedSubcategoriesList = subscriptionData.subscribed || [];

          console.log("Subscribed categories:", Array.from(this.subscribedCategoriesMap));
          console.log("Unsubscribed categories:", Array.from(this.unsubscribedCategoriesMap));
        } else {
          this.subscribedCategoriesMap.clear();
          this.unsubscribedCategoriesMap.clear();
          this.subscribedSubcategoriesList = [];
        }
      },
      error: (err: any) => {
        console.error("Failed to fetch subscriptions for UI:", err);
        this.subscribedCategoriesMap.clear();
        this.unsubscribedCategoriesMap.clear();
        this.subscribedSubcategoriesList = [];
      }
    });
  }

  fetchSubscriptionCounts(basePayload: any) {
    // Counts API expects the same payload layout essentially
    this.msmeService.getSubscriptionCounts(basePayload).subscribe(counts => {
      if (counts) {
        this.subscriptionCounts = counts;
      }
    }, error => {
      console.error("Error fetching subscription counts", error);
    });
  }

  setSubscriptionFilter(filter: string) {
    this.subscriptionFilter = filter;
    this.selectSubCategory(this.selectedSubCategoryStr, true); // Re-fetch the table and counts using the newly selected filter
  }

  getCorporateActionCapsules(item: any): string[] {
    const capsules: string[] = [];

    // We purposefully omit item.corporateAction from the capsules array
    // per the user's latest request to only show group/subgroup here.


    const category = item.group || item.category || '';
    const subCategory = item.subgroup || item.subCategory || '';

    if (this.selectedParentCategory === 'All' && this.selectedSubCategoryStr === 'All') {
      if (category) capsules.push(category);
      if (subCategory) capsules.push(subCategory);
    } else if (this.selectedParentCategory === 'All' && this.selectedSubCategoryStr !== 'All') {
      if (category) capsules.push(category);
    } else if (this.selectedParentCategory !== 'All' && this.selectedSubCategoryStr === 'All') {
      if (subCategory) capsules.push(subCategory);
    }
    return capsules;
  }

  getCapsuleStyle(index: number): any {
    const baseStyle = {
      'border-radius': '12px',
      'padding': '4px 12px',
      'font-size': '12px',
      'font-weight': '500',
      'display': 'inline-block',
      'background-color': '#fff'
    };

    if (index === 0) {
      return { ...baseStyle, 'border': '1px solid #DCDFE0', 'color': '#333' }; // Grey color for first tag (Group)
    } else {
      return { ...baseStyle, 'border': '1px solid #1e88e5', 'color': '#1e88e5' }; // Blue color for second tag (Subgroup)
    }
  }

  isAnnouncementSubscribed(item: any): boolean {
    const subCategory = item.subgroup || item.subCategory || '';
    return this.subscribedSubcategoriesList.includes(subCategory);
  }

  /**
   * Get subscription status for an announcement based on its group and subgroup.
   * Backend returns composite keys as "CATEGORY||SUBCATEGORY".
   * Returns: 'subscribed' | 'unsubscribed' | 'untouched'
   */
  getAnnouncementSubscriptionStatus(item: any): 'subscribed' | 'unsubscribed' | 'untouched' {
    const group = (item.group || '').toUpperCase();
    const subgroup = (item.subgroup || item.subCategory || '').toUpperCase();
    const compositeKey = group + '||' + subgroup;

    if (this.subscribedCategoriesMap.has(compositeKey)) {
      return 'subscribed';
    }

    if (this.unsubscribedCategoriesMap.has(compositeKey)) {
      return 'unsubscribed';
    }

    return 'untouched';
  }

  onCorporateInnerTabChange(event: MatTabChangeEvent): void {
    this.corporateInnerSelectedIndex = event.index;
    if (this.corporateInnerTabLabels[event.index]) {
      this.selectSubCategory(this.corporateInnerTabLabels[event.index], true);
    }
  }

  onCorporateDateChange(event: any): void {
    if (event && event.startDate && event.endDate) {
      this.corporateStartDate = event.startDate.format('YYYY-MM-DD');
      this.corporateEndDate = event.endDate.format('YYYY-MM-DD');
    } else {
      this.corporateStartDate = null;
      this.corporateEndDate = null;
    }
    // Re-fetch category counts AND announcements based on the new dates
    this.fetchStatsData();
  }

  onCorporatePageChange(page: number): void {
    this.corporatePageNumber = page;
    this.selectSubCategory(this.selectedSubCategoryStr, false); // Don't reset pagination when explicitly paging
  }

  onCorporatePageSizeChange(event: any): void {
    this.corporatePageSize = event.value;
    this.corporatePageNumber = 1; // Reset to page 1 on size change
    this.selectSubCategory(this.selectedSubCategoryStr, false);
  }

  openManageSubscriptionModal(): void {
    // 1. Fetch the master list of subcategories for this parent
    this.msmeService.getSubcategoriesByParentCategory(this.selectedParentCategory).subscribe({
      next: (allCategoriesRes: any) => {
        const allCategories = Array.isArray(allCategoriesRes) ? allCategoriesRes : [];

        // 2. Fetch the user's current subscriptions
        const payload: any = {
          userId: this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true),
          category: this.selectedParentCategory
        };

        if (this.cin) payload.cin = this.cin;
        if (this.pan) payload.pan = this.pan;

        this.msmeService.getCorporateAnnouncementSubscriptions(payload).subscribe({
          next: (res: any) => {
            let subscribedNames: string[] = [];
            if (res && res.status === 200 && res.data) {
              // Backend returns: { subscribed: ["CAT||SUBCAT"], unsubscribed: ["CAT||SUBCAT"] }
              // Extract just the subcategory names from the composite keys
              if (res.data.subscribed && Array.isArray(res.data.subscribed)) {
                subscribedNames = res.data.subscribed.map((key: string) => {
                  // Split "CATEGORY||SUBCATEGORY" and take the subcategory part
                  const parts = key.split('||');
                  return parts.length > 1 ? parts[1] : key;
                });
              }
            }

            // 3. Open the Dialog with the master list, not the UI list
            const dialogRef = this.dialog.open(CorporateSubscribePopupComponent, {
              panelClass: 'popupMain_design',
              data: {
                parentCategory: this.selectedParentCategory,
                allSubcategories: allCategories,
                subscribedList: subscribedNames,
                cin: this.cin,
                pan: this.pan,
                userId: this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true)
              }
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                // Re-fetch the tab content and counts after successful subscription update
                this.fetchAnnouncements();
              }
            });
          },
          error: (err: any) => {
            console.error("Failed to fetch subscriptions:", err);
            this.commonService.errorSnackBar("Failed to fetch current subscriptions.");
          }
        });
      },
      error: (err: any) => {
        console.error("Failed to fetch master subcategories:", err);
        this.commonService.errorSnackBar("Failed to load subcategories. Please try again.");
      }
    });
  }

  constructor(public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router, private clipboard: Clipboard,
    public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute, private fb: FormBuilder, private datePipe: DatePipe, private loaderService: LoaderService, private decimalPipe: DecimalPipe) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    const userData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true));
    this.email = atob(userData.ur_cu);
    this.commonService.removeStorage("previous_company_pan");
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    //last days calendar S
    this.calendarLocale = {
      applyLabel: 'APPLY',
      customRangeLabel: 'Custom',
      clearLabel: 'RESET',
      format: 'DD/MM/YYYY',
      daysOfWeek: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
      monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      firstDay: 1
    };

    this.ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last week': [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
      'Last month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
      'Last quarter': (() => {
        const m = moment();
        const month = m.month();
        const prevQStartMonth = ((Math.floor(month / 3) + 3) % 4) * 3;
        const prevQYear = month < 3 ? m.year() - 1 : m.year();
        const start = moment().year(prevQYear).month(prevQStartMonth).startOf('month');
        const end = moment().year(prevQYear).month(prevQStartMonth + 2).endOf('month');
        return [start, end];
      })()
    };

    this.calendarPlaceholder = 'Last 30 Days';

    this.minDates = moment();
    //last days calendar E

  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 100;
  }

  // custom range picker
  readonly CustomDateheaderComponent = CustomDateheaderComponent;
  isTouchUIActivated = false;
  range = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(),
  });

  // mat select date range S
  @ViewChild('picker') dateRangePicker: MatDateRangePicker<Date>;

  onSelectionChange(value: any): void {
    let endDate = new Date();
    let startDate = new Date(endDate);
    if (value === 4) {
      this.dateRangePicker.open();
      return;
    } else if (value == 1) {
      startDate.setDate(endDate.getDate() - 29);
    } else if (value == 2) {
      startDate.setDate(endDate.getDate() - 59);
    } else if (value == 3) {
      startDate.setDate(endDate.getDate() - 89);
    } else if (value == 0) {
      startDate = undefined;
      endDate = undefined;
    }
    this.alertRedirectFilterType = 5;

    this.alertSearchForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
  }

  getSelectedType(id: number): string | null {
    const match = this.dateFilterMaster.find(item => item.id === id);
    return match ? match.type : null;
  }

  //Last days Calendar S
  private getNextSaturday() {
    const dayINeed = 6; // for Saturday
    const today = moment().isoWeekday();
    if (today <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }

  private getNextSunday() {
    const dayINeed = 7; // for Sunday
    const today = moment().isoWeekday();
    if (today <= dayINeed) {
      return moment().isoWeekday(dayINeed);
    } else {
      return moment().add(1, 'weeks').isoWeekday(dayINeed);
    }
  }
  //Last days Calendar E


  // mat select date range E
  // Month select S
  modelDate = new Date();
  maxDate;
  twelveMonthsAgo: String;
  // twelveMonthsAgo.setMonth(modelDate.getMonth() - 12);

  onOpenCalendar(container) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date));
    };
    container.setViewMode('month');
  }

  ngOnInit(): void {


    this.maxDate = new Date();
    this.modelDate.setMonth(this.modelDate.getMonth() - 1);
    const modelDate = new Date(this.modelDate);
    modelDate.setFullYear(this.modelDate.getFullYear(), this.modelDate.getMonth() - 11);
    this.twelveMonthsAgo = this.monthShortName[modelDate.getMonth() + 1] + " " + modelDate.getFullYear();

    this.constants = Constants;
    this.alertSelectedMonth = this.monthShortName[this.modelDate.getMonth() + 1] + " " + this.modelDate.getFullYear();
    this.state = JSON.parse(this.commonService.getStorage('historyState', true));
    if (history?.state?.isFromParentPage) {
      this.commonService.setStorage('routerLink', JSON.stringify(history?.state));
    }
    if (history?.state?.otherProspect) {
      this.otherProspect = history?.state?.otherProspect;
    }
    if (history?.state?.data) {
      this.historyStateData = true;
      this.commonService.setStorage('historyState', JSON.stringify(history?.state));
      this.pageData = history?.state?.data;
    }
    else if (this.state?.data && !this.historyStateData) {
      this.pageData = this.state?.data;
    }

    if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      this.pan = this.routerData?.pan;
      this.cin = this.routerData?.cin;
      this.customerType = this.routerData?.customerType;
      this.customerTypeStr = this.routerData?.customerTypeStr;
      this.isValidAddToTarget = !([this.consValue.CustomerType.TARGET, this.consValue.CustomerType.ETB].includes(this.customerType));
      this.preScreeCheckInTab = [this.consValue.CustomerType.TARGET, this.consValue.CustomerType.PROSPECTS].includes(this.customerType);
      this.fetchAnnouncements();
      this.fetchCrilcLenderDetails();

      resetGlobalHeaders();
      GlobalHeaders['x-path-url'] = '/hsbc/rmExisitingPortfolioView';
      GlobalHeaders['x-main-page'] = this.pageData.pageName;
      GlobalHeaders['x-sub-page'] = 'Firm Profile';
      this.tabId = this.routerData?.tabId;
      this.selectedTabIndex = this.routerData?.selectedTabIndex ? this.routerData?.selectedTabIndex : 0;
      this.getNetworkSubTabData(1);
      if (this.selectedTabIndex === 4) {
        this.getMcaTabDetails(this.MAIN_TAB_TYPE[0]);
        // this.getNetworkSubTabData(1);
      } else if (this.selectedTabIndex === 6) {
        this.getMcaTabDetails(this.MAIN_TAB_TYPE[0]);
        // this.getDomainList();
        // this.getLeadingIndicatorsDetails();
        // this.getCommercialData();
      } else {
        this.getMcaTabDetails(this.MAIN_TAB_TYPE[0]);
      }
    }
    else if (this.state?.routerData) {
      this.routerData = this.state?.routerData;
      this.pan = this.routerData?.pan;
      this.cin = this.routerData?.cin;
      this.fetchAnnouncements();

      resetGlobalHeaders();
      GlobalHeaders['x-path-url'] = '/hsbc/rmExisitingPortfolioView';
      GlobalHeaders['x-main-page'] = this.pageData.pageName;
      GlobalHeaders['x-sub-page'] = 'Firm Profile';
      this.tabId = this.routerData?.tabId;
      this.selectedTabIndex = this.routerData?.selectedTabIndex ? this.routerData?.selectedTabIndex : 0;
      this.getNetworkSubTabData(1);
      if (this.selectedTabIndex === 4) {
        this.getMcaTabDetails(this.MAIN_TAB_TYPE[0]);
        // this.getNetworkSubTabData(1);
      } else {
        this.getMcaTabDetails(this.MAIN_TAB_TYPE[0]);
      }
    }

    this.activatedRoute.queryParams.subscribe(params => {
      if (params?.externalRoutData) {
        this.externalRoutData = params?.externalRoutData;
        const externalRoutData = JSON.parse(this.commonService.toATOB(params.externalRoutData));
        if (!this.commonService.isObjectNullOrEmpty(externalRoutData)) {
          if (externalRoutData?.hitType === 'BySearch') {
            // if(externalRoutData.isFdiOdiEcbType && this.customerType == this.consValue.CustomerType.PROSPECTS) {
            //   this.isValidAddToTarget = false;
            // }
            this.getIndividualGstUdhyamSaveRiskApi({ pan: this.pan, cin: this.cin });
          }
          this.isFindProspects = externalRoutData?.isFindProspects ?? this.isFindProspects;
          this.isFindETB = externalRoutData?.isFindETB ?? this.isFindETB;
          if (this.isFindETB) {
            this.isFindSameRm = externalRoutData?.isFindSameRm ?? this.isFindSameRm;
          }
        }
      }
    });

    if (this.pageData) {
      this.setSubsubpage(this.pageData);
    }
    if (this.isActionAvailforSubpage(Constants.pageMaster.FIRM_PROFILE, this.constants.PageActions.DOWNLOAD)) {
      this.isFirmProfileActive = true;
    }
    this.initAlertSearchForm();
    this.checkPanInCibilMaster();
    this.onDateFilterChange('All');
    // this.getRejectionHistory();
    this.getAssignHistory();
    this.getClientUpdateHistory();

    // For Crisil Call
    this.getCrisilDataFromDB();

    if ((!this.customerTypeFdiOdiEcbList.includes(this.customerType)) && this.isTabAvailable(this.constants.pageMaster.NEW_AGE_ECONOMY_TAB)) {
      this.isNewAgeEconomyAvailable = true;
      this.selectDefaultNewAgeEconomySubTab();

      if (this.routerData.tabName === 'New-age Economy Insights') {
        this.getDomainList();
      }
    }

    if (this.routerData?.tabLabel) {
      console.log('found text label, redirecting');
      this.handlerRedirects(this.routerData?.tabLabel);
    }
  }

  handlerRedirects(lable: string) {
    if (lable === 'Risk Alerts') {
      console.log('risk alert redirect event');

      this.selectedTabIndex = 3;

      const event = {
        index: 3,
        tab: {
          textLabel: lable
        }
      } as MatTabChangeEvent;

      this.onMainTabChange(event);
    }
  }

  copyToClipboard(value: any): void {
    if (value) {
      this.clipboard.copy(value);
    }
  }

  selectDefaultNewAgeEconomySubTab() {
    if (this.commonService.isSubpageIsAvailable(this.pageData, this.consValue.pageMaster.KEY_INSIGHTS_TAB)) {
      this.newAgeEconomySelectedSubTab = NewAgeEconomySubTab.KEY_INSIGHTS;
    } else if (this.commonService.isSubpageIsAvailable(this.pageData, this.consValue.pageMaster.COMPETITION_AND_ECOSYSTEM_TAB)) {
      this.newAgeEconomySelectedSubTab = NewAgeEconomySubTab.COMPETITION_AND_ECOSYSTEM;
    } else if (this.commonService.isSubpageIsAvailable(this.pageData, this.consValue.pageMaster.LEADING_IDICATORS)) {
      this.newAgeEconomySelectedSubTab = NewAgeEconomySubTab.LEADING_INDICATORS;
    } else {
      this.newAgeEconomySelectedSubTab = '';
    }
  }

  toggleRejectionDetails(): void {
    this.isRejectionDetailsExpanded = !this.isRejectionDetailsExpanded;
  }


  getRejectionHistory(): void {
    const data = {
      pan: this.pan
    };
    this.msmeService.getRejectionHistory(data).subscribe((res) => {
      if (res && res.status == 200) {
        if (!this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
          this.rejectedPorfolioDataHistory = res.data.map(item => ({
            ...item,
            date: this.formatDate(item.date)
          }));
        } else {
          this.rejectedPorfolioDataHistory = [];
        }
      } else {
        //this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });

  }

  getAssignHistory(): void {
    const data = {
      pan: this.pan
    };
    this.msmeService.getAssignHistory(data).subscribe((res) => {
      if (res && res.status == 200) {
        if (!this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
          console.log("res====>>>", res)
          this.assignHistoryData = res.data.map(item => ({
            ...item,
            date: this.formatDate(item.createdDate)
          }));
          this.assignHistoryPage.totalSize = this.assignHistoryData?.length;
          this.assignHistoryPage.pageSize = signal(5);
          const firstItem = this.assignHistoryData[0];

        } else {
          this.assignHistoryData = [];
          this.assignHistoryPage.totalSize = 0;
        }
      } else {
        // this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar(error);
    });
  }

  getClientUpdateHistory(): void {
    const data = {
      pan: this.pan
    };
    this.msmeService.getClientUpdateHistory(data).subscribe((res) => {
      if (res && res.status == 200) {
        if (!this.commonService.isObjectNullOrEmpty(res.data) && res.data.length > 0) {
          console.log("res====>>>", res)
          this.clientUpdateHistoryData = res.data.map(item => ({
            ...item,
            date: this.formatDate(item.createdDate)
          }));
          this.clientHistoryPage.totalSize = this.clientUpdateHistoryData?.length;
          this.clientHistoryPage.pageSize = signal(5);
          const firstItem = this.clientUpdateHistoryData[0];
          this.firstClientStatus = firstItem?.clientStatus || '';
          this.firstClientReason = firstItem?.reason || '';

        } else {
          this.clientUpdateHistoryData = [];
          this.clientHistoryPage.totalSize = 0;
        }
      } else {
        // this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar(error);
    });
  }


  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  }

  ngOnDestroy(): void {
    this.onApiRefTimeoutClear();
    this.commonService.getBankerData(null);
    this.commonService.getCompanyData(null, null, null);
    // this.commonService.removeStorage('routerLink');
  }

  isRefreshDisabled(api: any): boolean {
    return (api.status === 'Inprogress' && api.apiId != 19) || api.apiId === 2 || (api.apiId === 19 && !this.retryOptionEnabled) || api.apiId === 39;
  }

  getTooltipMessage(api: any): string {
    if (api.apiId === 19 && !this.retryOptionEnabled) {
      return this.tooltipMessage || 'NA';
    }
    return '';
  }

  setSubsubpage(data: any) {
    for (let data of this.pageData?.subSubpages) {
      if (data?.subpageId === Constants.pageMaster.ANALYTICS) {
        if (this.isFindProspects) {
          data.subSubpages.forEach(element => {
            console.log('element::::> ', element);
            if (element.subpageName == 'Exim Analysis') {
              this.analyticsSubpage.push(element);
            };
          });
        }
        else if (this.isFindETB && !this.isFindSameRm) {
          data.subSubpages.forEach(element => {
            console.log('element::::> ', element);
            if (element.subpageName == 'Exim Analysis' || element.subpageName == 'Bank Statement - Internal') {
              this.analyticsSubpage.push(element);
            };
          });
        }

        else {
          this.analyticsSubpage = data.subSubpages || []; // Initialize as empty array if undefined
        }
      }
      if (data?.subpageId === Constants.pageMaster.COMING_SOON) {
        this.cominsoonSubpage = data.subSubpages || []; // Initialize as empty array if undefined
      }
    }
  }

  isTabAvailable(pageId: number): boolean {
    return history?.state?.data?.subSubpages?.filter(subpage => subpage.subpageId === pageId).length > 0;
  }

  isTabVisible(pageId: number): boolean {
    for (let page of this.pageData.subSubpages) {
      if (page?.subpageId === pageId) {
        for (let action of page.actions) {
          if (action.actionId === Constants.PageActions.REFRESH) {
            this.apiRefresh = true;
          }
        }

        if (this.isFindProspects) {
          if (Constants.pageMaster.FIRM_PROFILE === pageId || Constants.pageMaster.OPPORTUNITY === pageId || Constants.pageMaster.MCA_FINANCIAL === pageId || Constants.pageMaster.NETWORK === pageId || Constants.pageMaster.PRE_SCREEN === pageId || Constants.pageMaster.ANALYTICS === pageId) {
            if (Constants.pageMaster.MCA_FINANCIAL === pageId) {
              this.isMCAFinancialActive = false;
            }
            if (Constants.pageMaster.FIRM_PROFILE === pageId && !this.isApiStatusFind) {
              if (this.apiTypeList.length != 0) {
                let idsToRemove: any[] = [2, 3];
                // if(this.customerTypeList.includes(this.customerType)){
                idsToRemove.push(6, 7);
                // }
                this.apiTypeList = this.apiTypeList.filter(api => !idsToRemove.includes(api.apiId));
                this.isApiStatusFind = true;
              }
            }
            return true;
          }
          return false;
        }

        if (this.isFindETB && !this.isFindSameRm) {
          if (Constants.pageMaster.RISK_ALERTS === pageId) {
            return false;
          }
        }

        return true;
      }
    }

    // if(this.pageData.isFindETB && pageId == Constants.pageMaster.PRE_SCREEN && (!(Constants.CustomerType.ETB == this.customerType) )) {
    //   return true;
    // }

    return false;
  }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
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

  isActionAvailforSubSubpage(subSubPageId: any, subPageId: any, actionId: string): boolean {
    const matchedSubPage = this.pageData?.subSubpages?.find(sub => sub.subpageId === subPageId);
    const matchedSubSubPage = matchedSubPage?.subSubpages.find(sub => sub.subpageId === subSubPageId);
    const matchedSubSubPageAction = matchedSubSubPage?.actions?.find(action => action.actionId === actionId);
    if (matchedSubSubPageAction) {
      return true;
    }
    return false;
  }

  onMainTabChange(event: MatTabChangeEvent) {
    this.isMCAFinancialActive = event.tab.textLabel === 'MCA-Financial';
    this.isFirmProfileActive = event.tab.textLabel === 'Firm Profile';
    this.isNetworkActive = event.tab.textLabel === 'Network';
    const selectedIndex = event.index;
    const selectedType = this.MAIN_TAB_TYPE[selectedIndex];
    GlobalHeaders['x-sub-page'] = event.tab.textLabel;

    console.log('label ==========>', event.tab.textLabel);
    console.log('tab id => ', event.index);

    if (event.tab.textLabel === 'New-age Economy Insights')
      this.getDomainList();

    if (this.isFirmProfileActive)
      this.getApiAuditData(true);

    switch (selectedIndex) {
      case 0:
        if (!this.isFirmDataFetched) {
          this.getMcaTabDetails(selectedType);
        }
        break;
      case 1:
        if (!this.isOpportunityDataFetched) {
          this.getMcaTabDetails(selectedType);
          this.getFdiOdiEcbWalletDataByCin();
          this.fetchList();
        }

        break;
      case 2:
        if (!this.isMcaFinacialDataFetched) {
          this.getMcaTabDetails(selectedType);
        }
        break;
      case 3:
        if (this.isFindProspects && !this.isDirectorAndConnectingLenderFetched) {
          this.getNetworkSubTabData(1);
        }
        else if (!this.isAlertTabOneDataFetched) {
          this.onAlertsTabChange(0);
        }
        break;
      case 4:
        if (!this.isDirectorAndConnectingLenderFetched) {
          this.getNetworkSubTabData(1);
        }
        // if (!this.isFindProspects) {
        //   this.getDomainList();
        // }
        break;
      // case 6:
      //   this.getDomainList();
      // this.getLeadingIndicatorsDetails();
      // this.getCommercialData();
      default:
        break;
    }

    if (event.tab.textLabel == "Pre-Screen") {
      this.getPreScreenData();
    }


  }

  onNetworkSubTabChange(event: MatTabChangeEvent, tabId) {
    console.log("onNetworkSubTabChange", event)
    console.log("Tabid:", tabId)
    GlobalHeaders['x-page-action'] = event.tab.textLabel;
    this.isIndustryBenchmarkSubTabActive = event.tab.textLabel === 'Industry Outlook & Benchmark'
    this.isPeerComparisonTabActive = event.tab.textLabel === 'Peer Comparison'
    const selectedIndex = event ? (event.index + 1) : tabId;
    switch (selectedIndex) {
      case 1:
        if (!this.isDirectorAndConnectingLenderFetched) {
          this.getNetworkSubTabData(selectedIndex);
        }
        break;
      case 2:
        if (!this.isShareHoldingDataFetched) {
          this.getNetworkSubTabData(selectedIndex);
        }
        break;
      case 3:
        // if (!this.isCrisilDataFromDBFetched || !this.isCrisilDataFetched) {
        // this.getNetworkSubTabData(selectedIndex);
        // }
        break;
      case 4:
        // if (
        //   (!this.isCrisilDataFromDBFetched || !this.isCrisilDataFetched) &&
        //   !this.isIndustryPeerDataFetched
        // ) {
        this.getNetworkSubTabData(selectedIndex);
        // }
        break;
      case 5:
        if (!this.isCounterPartyDataFetched) {
          this.getNetworkSubTabData(selectedIndex);
        }
        break;

      default:
        break;
    }

  }

  onNewAgeEconomySubTabChange(tabName: any) {
    this.newAgeEconomySelectedSubTab = tabName;

    switch (tabName) {
      case NewAgeEconomySubTab.KEY_INSIGHTS:
        this.getInnovateBasicDetails(this.selectedDomain);
        break;

      case NewAgeEconomySubTab.COMPETITION_AND_ECOSYSTEM:
        this.isLoading = true;
        this.loaderService.subLoaderShow();

        forkJoin([
          this.getAllCompetitor(),
          this.getAllAquiredCompanies(),
          this.getAllParOfCompanies()
        ])
          .pipe(
            finalize(() => {
              this.loaderService.subLoaderHide();
              this.isLoading = false;
            })
          )
          .subscribe({
            next: () => { },
            error: (error) => {
              console.error('Error in COMPETITION_AND_ECOSYSTEM tab:', error);
              this.loaderService.subLoaderHide();
              this.isLoading = false;
            }
          });
        break;

      case NewAgeEconomySubTab.LEADING_INDICATORS:
        this.getLeadingIndicatorsDetails();
        break;

      default:
        break;
    }
  }

  getNetworkSubTabData(tabId) {
    if (!this.pan) {
      return;
    }
    var json = {};
    json['cin'] = this.cin;
    json['pan'] = this.pan;
    json['tabType'] = tabId;
    this.msmeService.getMcaNetworkTabDetais(json).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {

          console.log("response data : ", response.data);

          if (Array.isArray(response.data.directorDetails) && response.data.directorDetails.length > 0) {
            console.log("Start iterating directorDetails");
            response.data.directorDetails.forEach((director: any) => {
              console.log("Processing director:", director);
              if (director.pan) {

                if (director.pan.length >= 4 && director.pan[3] === 'P' && !this.isActionAvail(this.constants.PageActions.MASK_PAN)) {
                  director.displayPan = director.pan.substring(0, director.pan.length - 4) + 'XXXX';
                } else {
                  director.displayPan = director.pan;
                }
              } else {
                director.displayPan = "NA";
              }
            });
          } else {
            console.log("No director details available or empty array.");
          }
          console.log("Response data after pan processing:", response.data);

          switch (tabId) {
            case 1:
              this.isDirectorAndConnectingLenderFetched = true;
              this.connectedLendingDetailsList = response?.data?.connectedLendingDetails;
              this.connectedLendingDetailsPag.totalSize = this.connectedLendingDetailsList.length;
              this.directorDetailsList = response?.data?.directorDetails;
              this.customData = response?.data?.customData;
              if (this.directorDetailsList) {
                this.directorDetailsList.forEach((val) => {
                  val.isCollapsed = true;
                  let pagination = new PaginationSignal();
                  pagination.totalSize = val.directorships ? val.directorships.length : 0;
                  pagination.pageSize = signal(5);
                  val.otherDirectorPagination = pagination;
                });
              }
              this.directorDetailsPag.totalSize = this.directorDetailsList.length;
              this.directorDetailsPag2.totalSize = this.directorDetailsList.length;
              break;
            case 2:
              this.isShareHoldingDataFetched = true;
              this.shareHoldingList = response.data?.shareholding;
              this.shareHoldingYear = response.data?.shareHoldingYear;
              this.isDetailShareHoldingDataFetched = true;
              this.detailedShareHoldingList = response.data?.detailedShareholdingProxies;
              if (this.detailedShareHoldingList != null && this.detailedShareHoldingList.length != 0) {
                const fyUnit = this.detailedShareHoldingList[0]?.FY;
                this.fyYear = fyUnit.slice(2, 4);
                this.fynoOfShareYear = fyUnit.slice(0, 4);
              }

              this.relatedEntitiesListMain = response.data?.relatedEntities;
              this.relatedEntitiesList = response.data?.relatedEntities;
              // console.log('relatedEntitiesListMain::::::> ', this.relatedEntitiesListMain);

              if (this.relatedEntitiesListMain != null && this.relatedEntitiesListMain.length != 0) {
                // this.relatedTypeList = ['All', ...Array.from(new Set(this.relatedEntitiesListMain.map(item => item.Relation_Source)))];
                this.relatedTypeList = ['All', 'By Address', 'By Directors', 'Email', 'Investments', 'Joint Venture', 'Major Investor', 'Parent', 'Shareholder', 'Subsidiary', 'Transactions'];
              }

              this.shareHoldingPag.totalSize = this.shareHoldingList?.length;
              this.detailShareHoldingPag.totalSize = this.detailedShareHoldingList?.length;
              this.relatedEntitiesPage.totalSize = this.relatedEntitiesList?.length;

              break;
            case 3:
              // this.isCrisilDataFromDBFetched = true;
              // this.isCrisilDataFetched = true;
              // this.getCrisilDataFromDB();
              break;
            case 4:
              // this.isCrisilDataFetched = true;
              // this.isCrisilDataFromDBFetched = true;
              this.isIndustryPeerDataFetched = true;
              this.industryPeerList = response.data?.industryPeers;
              // this.getCrisilDataFromDB();
              break;
            case 5:
              this.isCounterPartyDataFetched = true;
              this.top5ExportParties = response.data?.counterparties?.top5ExportParties;
              this.top5ImportParties = response.data?.counterparties?.top5ImportParties;

              this.topFiveBuyersList = response.data?.topFiveBuyersList;
              this.topFiveSalesList = response.data?.topFiveSalesList;
              this.bankDetailsListRes = response.data?.counterpartiesFromBs?.bankDetailsListRes;
              // this.topFundsReceipts = response.data?.counterpartiesFromBs?.bankDetailsListRes?.topFundsReceipts;
              // this.topFundPayments = response.data?.counterpartiesFromBs?.bankDetailsListRes?.topFundPayments;

              break;
            default:
              break;
          }
        } else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  dintoPanForDirectorProccedd(din: String) {
    if (!din) {
      this.commonService.warningSnackBar("API can not be triggered as DIN is not available!");
      return;
    }
    this.msmeService.getPanFromDinForDirector(din).subscribe(
      (response: any) => {
        if (response.status == 200) {
          console.log("response data : ", response.data);
          this.commonService.successSnackBar(response.message);
          this.getNetworkSubTabData(1);
        }
        else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  hasDateRange(): boolean {
    return (this.alertSearchForm?.value.startDate || this.alertSearchForm?.value.endDate);
  }

  isValueChangedManually = false;
  onAlertsTabChange(event: any) {
    if (event == 0) {
      this.activeAlertCount = this.activeAlertCountFromTab1;
      this.alertRedirectFilterType = undefined;
      this.alertRedirectfilterValue = undefined;
      this.isCalledFromGraph = false;
      this.isValueChangedManually = true;
      this.alertSearchForm.patchValue({
        dateFilter: 0,
        category: [],
        tag: [],
        severity: [],
        status: [],
        moduleId: [],
        startDate: undefined,
        endDate: undefined,
      });
    }
    if ((event == 0 && !this.isAlertTabOneDataFetched) || (event == 1 && !this.nonFinancialFetched)) {
      this.getAlertsSubTabData(event);
    } else {
      let modeldate = this.datePipe.transform(this.modelDate, 'MM-yyyy');
      if (event == 0) {
        if (this.previousAlertRedirectDate == undefined || this.previousAlertRedirectDate != modeldate) {
          this.previousAlertRedirectDate = modeldate;
          this.getAlertsSubTabData(event);
        }
      } else {
        this.getAlertsSubTabData(event);
      }
      // else {
      //   this.alertSearchForm?.get('severity').setValue(this.alertRedirectFilterType==3 ? [this.alertRedirectfilterValue] :[0,...this.alertSeverityMasterList.map(x=>x.id)]);
      //   this.alertSearchForm?.get('status').setValue(this.alertRedirectFilterType==4 ? [this.alertRedirectfilterValue] : [0,1,2,3]);
      //   this.alertSearchForm?.get('tag').setValue(this.alertRedirectFilterType==2 ? [this.alertRedirectfilterValue] : ['All',...this.alertTagsMasterList]);
      //   this.alertSearchForm?.get('category').setValue(this.alertRedirectFilterType == 1 ? [this.alertRedirectfilterValue] : [0,...this.alertCategoryMasterList.map(x=>x.id)]);
      //   this.alertSearchForm?.get('moduleId').setValue(['All',...this.riskAlertsModuleList]);
      //   this.onAlertFilterChange(true);
      // }
    }
  }
  // for Alerts sub tabs----------->
  isCategoryPieChartFetched = false;
  isSeverityPieChartfetched = false;
  isRiskTimelineChartfetched = false;
  isSeverityTimelineChartfetched = false;
  isCategoryTimelineChartfetched = false;
  isAlertTabOneDataFetched = false;
  previousSelectedMonth;
  getAlertsSubTabData(event: any) {
    const selectedIndex = event;
    if (!this.pan) {
      return;
    }
    var json = {};
    json['cin'] = this.cin;
    json['pan'] = this.pan;
    json['tabType'] = selectedIndex;
    json['dateFilter'] = this.alertSearchForm.value.dateFilter;

    if (!this.isCalledFromGraph && (this.alertRedirectFilterType == undefined || this.alertRedirectFilterType == null)) {
      let startDate = new Date(this.modelDate.getFullYear(), this.modelDate.getMonth(), 1);
      let endDate = new Date(this.modelDate.getFullYear(), this.modelDate.getMonth() + 1, 0);
      this.alertSearchForm.patchValue({
        startDate: startDate,
        endDate: endDate,
        dateFilter: 4
      });
      this.isValueChangedManually = true;
    }
    let startDate = this.datePipe.transform(this.alertSearchForm.value.startDate, 'dd-MM-yyyy');
    let endDate = this.datePipe.transform(this.alertSearchForm.value.endDate, 'dd-MM-yyyy');
    json['startDate'] = startDate;
    json['endDate'] = endDate;
    let modeldate = this.datePipe.transform(this.modelDate, 'MM-yyyy');
    switch (selectedIndex) {
      case 0:
        if (this.modelDate > new Date()) {
          this.modelDate = new Date();
          return;
        }
        if (this.previousSelectedMonth != undefined && this.previousSelectedMonth == modeldate) {
          return;
        }
        this.isCategoryPieChartFetched = false;
        this.isSeverityPieChartfetched = false;
        this.isRiskTimelineChartfetched = false;
        this.isSeverityTimelineChartfetched = false;
        this.isCategoryTimelineChartfetched = false;
        this.RiskCategory_Highcharts.series = [];
        this.speedScore = 0;
        this.riskScoreGraph = undefined;


        this.updateSpeed();

        json['monthDate'] = modeldate;
        const twelveMonthsAgo = new Date(this.modelDate);
        twelveMonthsAgo.setMonth(this.modelDate.getMonth() - 11);
        this.twelveMonthsAgo = this.monthShortName[twelveMonthsAgo.getMonth() + 1] + " " + twelveMonthsAgo.getFullYear();
        this.alertSelectedMonth = this.monthShortName[this.modelDate.getMonth() + 1] + " " + this.modelDate.getFullYear();
        this.isAlertTabOneDataFetched = false;
        break;
      case 1:
        this.previousStartDate = startDate;
        this.previousEndDate = endDate;
        this.nonFinancialData = [];
        this.nonFinancialDataDump = [];
        this.alerPag.totalSize = 0;
        this.alertTagsMasterList = [];
        break;
    }

    this.msmeService.getAlertsSubTabData(json).subscribe(
      (response: any) => {
        console.log(response);
        if (response.status == 200 && response.data) {
          switch (selectedIndex) {
            case 0:
              this.previousSelectedMonth = modeldate;
              this.activeAlertCountWithStatus = response?.data?.activeAlertCountWithStatus;
              this.activeAlertCountWithType = response?.data?.activeAlertCountWithType || [];
              this.riskScoreGraph = response?.data?.riskScoreGraph;
              // this.speedScore = (this.riskScoreGraph.percentage / 5);
              let riskTimeLineGraph = response?.data?.riskTimeLineGraph;
              let riskTimeLineCategories = [];
              let riskTimeLineData = [];
              let isAnyRiskAvailble = false;
              riskTimeLineGraph.forEach(e => {
                riskTimeLineCategories.push(e.displayValue);
                riskTimeLineData.push({
                  y: Number(e.percentage),
                  color: this.getColorForRisk(e.percentage),
                  marker: {
                    fillColor: this.getColorForRisk(e.percentage)
                  }
                });
                if (e.percentage > 0) {
                  isAnyRiskAvailble = true;
                }
              });

              this.Risk_Score_Timeline.xAxis.categories = riskTimeLineCategories;
              const gradientStops = this.generateGradientStops(riskTimeLineGraph);
              this.Risk_Score_Timeline.series = [
                {
                  data: riskTimeLineData,
                  name: 'Risk Score',
                  color: isAnyRiskAvailble ? {
                    linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 1,
                      y2: 0,
                    },
                    stops: gradientStops,
                  } : "#047500",
                }
              ]

              this.isRiskTimelineChartfetched = true;

              const lowAlertSeries: any[] = [];
              const mediumAlertSeries: any[] = [];
              const highAlertSeries: any[] = [];
              const criticalAlertSeries: any[] = [];
              let severityTimelineGraphCategories = [];
              this.severityTimelineGraph = response?.data?.severityTimelineGraph;
              response?.data?.severityTimelineGraph.forEach((entry, index) => {
                severityTimelineGraphCategories.push(entry.month);
                lowAlertSeries.push(Number(entry?.lowAlert || 0));
                mediumAlertSeries.push(Number(entry?.mediumAlert || 0));
                highAlertSeries.push(Number(entry?.highAlert || 0));
                criticalAlertSeries.push(Number(entry?.criticalAlert || 0));
              });
              this.RiskSeverityTimeline_Highcharts.custom = {};
              this.RiskSeverityTimeline_Highcharts.custom.severityTimelineGraph = this.severityTimelineGraph;
              this.RiskSeverityTimeline_Highcharts.xAxis.categories = severityTimelineGraphCategories;
              this.RiskSeverityTimeline_Highcharts.series = [
                {
                  data: criticalAlertSeries,
                  name: 'Critical',
                  color: '#872000',
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, 'rgba(135, 32, 0, 0.4)'],
                      [1, 'rgba(135, 32, 0, 0)']
                    ]
                  },
                  dataLabels: {
                    borderColor: '#872000',
                  }
                },
                {
                  data: highAlertSeries,
                  name: 'High',
                  color: '#FF6961',
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, 'rgba(254, 105, 97, 0.4)'],
                      [1, 'rgba(254, 105, 97, 0)']
                    ]
                  },
                  dataLabels: {
                    borderColor: '#FF6961',
                  }
                },
                {
                  data: mediumAlertSeries,
                  name: 'Medium',
                  color: '#F8D66E',
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, 'rgba(248, 214, 110, 0.4)'],
                      [1, 'rgba(248, 214, 110, 0)']
                    ]
                  },
                  dataLabels: {
                    borderColor: '#F8D66E',
                  }
                },

                {
                  data: lowAlertSeries,
                  name: 'Low',
                  color: '#7ABD7E',
                  fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                      [0, 'rgba(122, 189, 126, 0.4)'],
                      [1, 'rgba(122, 189, 126, 0)']
                    ]
                  },
                  dataLabels: {
                    borderColor: '#7ABD7E',
                  }
                },
              ];

              this.isSeverityTimelineChartfetched = true;
              let categoryTimelineGraphCategories = [];
              const creditFinancial = [];
              const opportunity = [];
              const businessOperations = [];
              const legalCompliance = [];
              const regulatory = [];
              const reputation = [];
              const mediaNews = [];
              this.categoryTimelineGraph = response?.data?.categoryTimelineGraph;
              this.categoryTimelineGraph.forEach((entry, index) => {
                categoryTimelineGraphCategories.push(entry.month);
                creditFinancial.push(Number(entry["Credit&Financial"] || 0))
                opportunity.push(Number(entry["Opportunity"] || 0))
                businessOperations.push(Number(entry["Business&Operations"] || 0))
                legalCompliance.push(Number(entry["Legal&Compliance"] || 0))
                regulatory.push(Number(entry["Regulatory"] || 0))
                reputation.push(Number(entry["Reputation"] || 0))
                mediaNews.push(Number(entry["Media&News"] || 0))
              });


              this.RiskCategoryTimeline_Highcharts.custom = {};
              this.RiskCategoryTimeline_Highcharts.custom.categoryTimelineGraph = this.categoryTimelineGraph;
              this.RiskCategoryTimeline_Highcharts.xAxis.categories = categoryTimelineGraphCategories;
              this.RiskCategoryTimeline_Highcharts.series = [
                {
                  data: creditFinancial,
                  color: '#008684',
                  dataLabels: {
                    borderColor: '#008684',
                  }
                },
                {
                  data: opportunity,
                  color: '#C59AFF',
                  dataLabels: {
                    borderColor: '#C59AFF',
                  }
                },
                {
                  data: businessOperations,
                  color: '#0095FF',
                  dataLabels: {
                    borderColor: '#0095FF',
                  }
                },
                {
                  data: legalCompliance,
                  color: '#FC3E9D',
                  dataLabels: {
                    borderColor: '#FC3E9D',
                  }
                },
                {
                  data: regulatory,
                  color: '#6C5498',
                  dataLabels: {
                    borderColor: '#6C5498',
                  }
                },
                {
                  data: reputation,
                  color: '#F8D66E',
                  dataLabels: {
                    borderColor: '#F8D66E',
                  }
                },
                {
                  data: mediaNews,
                  color: '#FF6961',
                  dataLabels: {
                    borderColor: '#FF6961',
                  }
                },
              ]
              this.isCategoryTimelineChartfetched = true;

              this.speedScore = Number(this.riskScoreGraph?.percentage || 0);
              if (this.speedScore == 0) {
                this.riskScoreGraphClass = 'norisk_box';
              } else if (this.speedScore == 25) {
                this.riskScoreGraphClass = 'low_box';
              } else if (this.speedScore == 50) {
                this.riskScoreGraphClass = 'medium_box';
              } else if (this.speedScore == 75) {
                this.riskScoreGraphClass = 'high_box';
              } else if (this.speedScore == 100) {
                this.riskScoreGraphClass = 'critical_box';
              }

              this.updateSpeed();
              // const transformedCategoryData = response?.data?.categoryWiseAlert.map(item => [
              //   item.displayValue,
              //   item.count,
              //   item.typeId
              // ]);
              const transformedCategoryData = response?.data?.categoryWiseAlert.map(item => ({
                name: item.displayValue,
                y: item.count,
                typeId: item.typeId
              }));
              let categoryColors = [];
              response?.data?.categoryWiseAlert.forEach(element => {
                categoryColors.push(this.getCategoryColorByTypeId(element.typeId));
              });
              this.RiskCategory_Highcharts.custom = {};
              this.RiskCategory_Highcharts.custom.alertSelectedMonth = this.alertSelectedMonth;
              this.RiskCategory_Highcharts.series = [
                {
                  type: 'pie',
                  colors: categoryColors,
                  data: transformedCategoryData,
                  borderWidth: 0
                }
              ];
              this.isCategoryPieChartFetched = transformedCategoryData.length > 0;

              let colors = [];
              response?.data?.severityWiseAlert.forEach(element => {
                if (element.typeId == 1) {
                  colors.push('#7ABD7E');
                } else if (element.typeId == 2) {
                  colors.push('#F8D66E');
                } else if (element.typeId == 3) {
                  colors.push('#FF6961');
                } else if (element.typeId == 4) {
                  colors.push('#872000');
                }
              });
              // const transformedSeverityData = response?.data?.severityWiseAlert.map(item => [
              //   item.displayValue,
              //   item.count,
              //   item.typeId
              // ]);
              const transformedSeverityData = response?.data?.severityWiseAlert.map(item => ({
                name: item.displayValue,
                y: item.count,
                typeId: item.typeId
              }));
              this.RiskSeverity_Highcharts.custom = {};
              this.RiskSeverity_Highcharts.custom.alertSelectedMonth = this.alertSelectedMonth;
              this.RiskSeverity_Highcharts.series = [
                {
                  type: 'pie',
                  colors: colors,
                  data: transformedSeverityData,
                  borderWidth: 0
                }
              ];
              this.isSeverityPieChartfetched = transformedSeverityData.length > 0;
              this.isAlertTabOneDataFetched = true;
              this.activeAlertCount = response?.data?.alertsCount;
              this.activeAlertCountFromTab1 = response?.data?.alertsCount;
              break;
            case 1:
              this.nonFinancialFetched = true;
              this.nonFinancialData = response?.data?.nonFinancialData;
              this.nonFinancialDataDump = response?.data?.nonFinancialData;
              this.alertCategoryMasterList = response?.data?.alertCategoryMasterList;
              this.alertSeverityMasterList = response?.data?.alertSeverityMasterList;
              this.activeAlertCount = response?.data?.activeAlertCount;
              this.inActiveAlertCount = response?.data?.inActiveAlertCount;
              this.alerPag.totalSize = this.nonFinancialData?.length;
              this.alertTagsMasterList = [...new Set(this.nonFinancialDataDump.map(a => a.Type))];

              this.alertSearchForm?.get('severity').setValue(this.alertRedirectFilterType == 3 ? [this.alertRedirectfilterValue] : [0, ...this.alertSeverityMasterList.map(x => x.id)]);
              this.alertSearchForm?.get('status').setValue(this.alertRedirectFilterType == 4 ? [this.alertRedirectfilterValue] : [0, 1, 2, 3, 4]);
              this.alertSearchForm?.get('tag').setValue(this.alertRedirectFilterType == 2 ? (this.alertTagsMasterList.length > 1 ? [this.alertRedirectfilterValue] : ['All', ...this.alertTagsMasterList]) : ['All', ...this.alertTagsMasterList]);
              this.alertSearchForm?.get('category').setValue(this.alertRedirectFilterType == 1 ? [this.alertRedirectfilterValue] : [0, ...this.alertCategoryMasterList.map(x => x.id)]);
              this.alertSearchForm?.get('moduleId').setValue(['All', ...this.riskAlertsModuleList]);
              this.onAlertFilterChange(false);
              break;
            default:
              break;
          }
        } else if (response.status == 204) {
          switch (selectedIndex) {
            case 0:
              this.activeAlertCountWithStatus = [];
              this.activeAlertCountWithType = [];
              this.RiskCategory_Highcharts.series = [];
              this.isCategoryPieChartFetched = false;
              this.speedScore = 0;
              this.updateSpeed();
              break;
            case 1:
              this.nonFinancialData = [];
              this.nonFinancialDataDump = [];
              this.activeAlertCount = '0';
          }
        }
        else {
          this.previousStartDate = undefined;
          this.previousEndDate = undefined;
          this.previousSelectedMonth = undefined;
          this.previousAlertRedirectDate = undefined;
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  getCategoryColorByTypeId(typeId: number): string {
    switch (typeId) {
      case 1: return '#008684';
      case 2: return '#C59AFF';
      case 3: return '#0095FF';
      case 4: return '#FC3E9D';
      case 5: return '#6C5498';
      case 6: return '#F8D66E';
      case 7: return '#FF6961';
      default: return '#CCCCCC';
    }
  }
  alertRedirectFilterType;
  alertRedirectfilterValue;
  previousAlertRedirectDate;
  isCalledFromGraph = false;
  redirectToAlertTabWithFilter(filterType, filterValue, selectedDate?) {
    this.alertRedirectFilterType = filterType;
    this.alertRedirectfilterValue = filterValue;
    this.alertSearchForm?.get('severity').setValue(this.alertRedirectFilterType == 3 ? [this.alertRedirectfilterValue] : [0, ...this.alertSeverityMasterList.map(x => x.id)]);
    this.alertSearchForm?.get('status').setValue(this.alertRedirectFilterType == 4 ? [this.alertRedirectfilterValue] : [0, 1, 2, 3]);
    this.alertSearchForm?.get('tag').setValue(this.alertRedirectFilterType == 2 ? (this.alertTagsMasterList.length > 1 ? [this.alertRedirectfilterValue] : ['All', ...this.alertTagsMasterList]) : ['All', ...this.alertTagsMasterList]);
    this.alertSearchForm?.get('category').setValue(this.alertRedirectFilterType == 1 ? [this.alertRedirectfilterValue] : [0, ...this.alertCategoryMasterList.map(x => x.id)]);
    this.alertSearchForm?.get('moduleId').setValue(['All', ...this.riskAlertsModuleList]);
    let startDate;
    let endDate;
    if (selectedDate) {
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    } else {
      startDate = new Date(this.modelDate.getFullYear(), this.modelDate.getMonth(), 1);
      endDate = new Date(this.modelDate.getFullYear(), this.modelDate.getMonth() + 1, 0);
    }
    this.alertSearchForm.patchValue({
      startDate: startDate,
      endDate: endDate,
      dateFilter: 4
    });
    this.selectedAlertsTabIndex = 1;
  }

  generateGradientStops(data: any[]): [number, string][] {
    const total = data.length;
    return data.map((item, index) => {
      const offset = +(index / (total - 1)).toFixed(3); // Normalize between 0–1
      return [offset, this.getColorForRisk(item.percentage)];
    });
  }

  getColorForRisk(riskStr: string): string {
    const risk = parseFloat(riskStr);
    if (risk > 3.26) return "#842002"; // Critical
    if (risk > 2.5) return "#FF6961";  // High
    if (risk > 1.75) return "#F8D66E"; // Medium
    if (risk >= 1) return "#7ABD7E";   // Low
    return "#047500";                  // No Risk
  }

  submitAlerts(tabId?: number) {
    if (tabId == 1) {
      var json = {};
      json['pan'] = this.pan;
      json['trackITs'] = this.nonFinancialData;
      this.msmeService.updateAlertsTrackit(json).subscribe(
        (response: any) => {
          this.isCalledFromGraph = false;
          this.onAlertsTabChange(0);
          this.commonService.successSnackBar(response.message);
        },
        (error) => {
          this.commonService.errorSnackBar('Something Went Wrong');
          console.error('Something Went Wrong', error);
        }
      )
    }
  }

  onRelatedEntitiesChange(event: any, type: string) {
    if (this.relatedEntCountry == "All" && this.relatedEntRelationType == "All") {
      this.relatedEntitiesList = this.relatedEntitiesListMain;
    }
    else if (this.relatedEntCountry != "All" && this.relatedEntRelationType == "All") {
      let countryTemp = this.relatedEntCountry == 'Domestic' ? 'INDIA' : 'OTHER'
      this.relatedEntitiesList = this.relatedEntitiesListMain.filter(item => (!this.commonService.isObjectNullOrEmpty(item.country) && (countryTemp == 'INDIA' ? item.country.trim().toUpperCase().includes(countryTemp.trim()) : !item.country.trim().toUpperCase().includes('INDIA'))));
    }
    else if (this.relatedEntCountry == "All" && this.relatedEntRelationType != "All") {
      this.relatedEntitiesList = this.relatedEntitiesListMain.filter(item => item.Relation_Source.trim().includes(this.relatedEntRelationType.trim()));
    }
    else {
      let countryTemp = this.relatedEntCountry == 'Domestic' ? 'INDIA' : 'OTHER'
      this.relatedEntitiesList = this.relatedEntitiesListMain.filter(item => {
        return (
          (!this.commonService.isObjectNullOrEmpty(item.country) && (countryTemp == 'INDIA' ? item.country.trim().toUpperCase().includes(countryTemp.trim()) : !item.country.trim().toUpperCase().includes('INDIA')))
          &&
          (item.Relation_Source.trim().includes(this.relatedEntRelationType.trim()))
        );
      });
    }
    this.relatedEntitiesPage.totalSize = this.relatedEntitiesList?.length;
  }

  initAlertSearchForm(value?: any) {
    // let endDate = new Date();
    // let startDate = new Date(endDate);
    // startDate.setDate(startDate.getDate()-29);
    this.alertSearchForm = this.fb.group({
      dateFilter: 0,
      category: [],
      tag: [],
      severity: [],
      status: [],
      moduleId: [],
      startDate: undefined,
      endDate: undefined,
    });
    // Manually trigger change detection
    let previousStartDate = this.alertSearchForm.get('startDate')?.value;
    let previousEndDate = this.alertSearchForm.get('endDate')?.value;
    // this.alertSearchForm.valueChanges.pipe(
    //   debounceTime(300),// Wait for 300ms pause in events
    //   distinctUntilChanged(), // Only emit when the value has changed
    //   takeUntil(this.destroy$),
    //   ).subscribe(value => {
    //   this.onAlertFilterChange(true);

    // })

    this.alertSearchForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(currentValue => {
      const currentStartDate = currentValue.startDate;
      const currentEndDate = currentValue.endDate;

      const startDateChanged = !this.datesEqual(previousStartDate, currentStartDate);
      const endDateChanged = !this.datesEqual(previousEndDate, currentEndDate);

      const isDateChanged = startDateChanged || endDateChanged;
      if (!this.isValueChangedManually) {
        this.onAlertFilterChange(isDateChanged);
      } else {
        this.isValueChangedManually = false;
      }


      // update previous values for next comparison
      previousStartDate = currentStartDate;
      previousEndDate = currentEndDate;
    });
  }

  private datesEqual(d1: Date, d2: Date): boolean {
    if (!d1 || !d2) return d1 === d2;
    return new Date(d1).getTime() === new Date(d2).getTime();
  }

  alertFilterDropdownValue;
  previousStartDate;
  previousEndDate

  onAlertFilterChange(isPlaceApiCall) {
    this.nonFinancialDataDump = this.nonFinancialData;
    if (isPlaceApiCall) {
      if (this.alertSearchForm.value.startDate && this.alertSearchForm.value.endDate) {
        let startDate = this.datePipe.transform(this.alertSearchForm.value.startDate, 'dd-MM-yyyy');
        let endDate = this.datePipe.transform(this.alertSearchForm.value.endDate, 'dd-MM-yyyy');
        if ((startDate != this.previousStartDate) || (endDate != this.previousEndDate)) {
          this.getAlertsSubTabData(1);
        }
      } else if (!this.alertSearchForm.value.startDate && !this.alertSearchForm.value.endDate) {
        this.getAlertsSubTabData(1);
      }
    }



    if (this.alertSearchForm.value.severity && this.alertSearchForm.value.severity?.length > 0) {
      if (this.alertSearchForm.value.severity.findIndex((x) => x == 0) == -1) {
        this.nonFinancialDataDump = this.nonFinancialDataDump.filter(
          (item) => this.alertSearchForm.value.severity.findIndex((x) => x == item.severityId) != -1
        );
      }
    }

    if (this.alertSearchForm.value.category && this.alertSearchForm.value.category?.length > 0) {
      let index = this.alertSearchForm.value.category.findIndex((x) => x == 0)
      if (index == -1) {
        this.nonFinancialDataDump = this.nonFinancialDataDump.filter(
          (item) => this.alertSearchForm.value.category.findIndex((x) => x == item.categoryId) != -1
        );
      }
    }

    if (this.alertSearchForm.value.tag && this.alertSearchForm.value.tag?.length > 0) {
      if (this.alertSearchForm.value.tag.findIndex((x) => x == 'All') == -1) {
        this.nonFinancialDataDump = this.nonFinancialDataDump.filter(
          (item) => this.alertSearchForm.value.tag.findIndex((x) => x == item.Type) != -1
        );
      }
    }
    if (this.alertSearchForm.value.status && this.alertSearchForm.value.status?.length > 0) {
      if (this.alertSearchForm.value.status.findIndex((x) => x == 0) == -1) {
        this.nonFinancialDataDump = this.nonFinancialDataDump.filter(
          (item) => this.alertSearchForm.value.status.findIndex((x) => (x == 4 ? (item.status == null) : (x == item.status))) != -1
        );
      }
    }

    if (this.alertSearchForm.value.moduleId && this.alertSearchForm.value.moduleId?.length > 0) {
      if (this.alertSearchForm.value.moduleId.findIndex((x) => x == 'All') == -1) {
        this.nonFinancialDataDump = this.nonFinancialDataDump.filter(
          (item) => this.alertSearchForm.value.moduleId.findIndex((x) => x == item.alertModuleMasterName) != -1
        );
      }
    }
    this.activeAlertCount = String(this.nonFinancialDataDump?.length);
    this.alerPag.totalSize = this.nonFinancialDataDump?.length;
  }

  selectAllValue = 'SELECT_ALL';
  isAllSelected(field, masterList): boolean {
    const selected = this.alertSearchForm?.value[field] || [];
    let selectAllValue = "All";
    if (field != 'tag' && field != 'moduleId') {
      selectAllValue = '0';
    } else {
      selectAllValue = 'All';
    }

    if (this.alertSearchForm.value[field].findIndex((x) => x == selectAllValue) == -1) {
      return selected.length === masterList.length;
    } else {
      return selected.length - 1 === masterList.length;
    }
  }

  toggleAllSelection(field, masterList): void {
    if (this.isAllSelected(field, masterList)) {
      this.alertSearchForm?.get(field).setValue([]);
    } else {
      if (field != 'tag' && field != 'moduleId') {
        this.alertSearchForm?.get(field).setValue([0, ...masterList.map(x => x.id)]);
      } else {
        this.alertSearchForm?.get(field).setValue(['All', ...masterList]);
      }
    }
  }

  toggleSelection(field, masterList): void {
    let selected = this.alertSearchForm?.value[field] || [];
    if (field != 'tag' && field != 'moduleId') {
      const index = selected.findIndex(x => x == 0);
      if (index != -1 && selected.length == masterList.length) {
        selected.splice(index, 1);
        this.alertSearchForm?.get(field).setValue(selected)
      } else if (index == -1 && selected.length == masterList.length) {
        this.alertSearchForm?.get(field).setValue([0, ...masterList.map(x => x.id)]);
      } else {
        this.alertSearchForm?.get(field).setValue(selected);
      }
    } else {
      const index = selected.findIndex(x => x == 'All');
      if (index != -1 && selected.length == masterList.length) {
        selected.splice(index, 1);
        this.alertSearchForm?.get(field).setValue(selected)
      } else if (index == -1 && selected.length == masterList.length) {
        this.alertSearchForm?.get(field).setValue(['All', ...masterList]);
      } else {
        this.alertSearchForm?.get(field).setValue(selected);
      }
    }

  }

  onAlertModuleChange(event: any) {
    if (event == undefined || event == "All") {
      this.nonFinancialDataDump = this.nonFinancialData;
    }
    else {
      this.nonFinancialDataDump = this.nonFinancialData.filter(item => item.alertModuleMasterName.trim().includes(event.trim()));
    }
    this.alertFilterDropdownValue = event;
    this.alerPag.totalSize = this.nonFinancialDataDump?.length;
  }

  onAlertModuleChangeForAH(event: any) {
    if (event == undefined || event == "All") {
      this.nonFinancialDataDumpForAH = this.nonFinancialData;
    }
    else {
      this.nonFinancialDataDumpForAH = this.nonFinancialData.filter(item => item.alertModuleMasterName.trim().includes(event.trim()));
    }
    this.alertFilterDropdownValue = event;
    this.alerPag.totalSize = this.nonFinancialDataDumpForAH?.length;
  }

  getMcaTabDetails(tabType) {
    if (!this.pan) {
      return;
    }
    var json = {};
    json['cin'] = this.cin;
    json['pan'] = this.pan;
    json['tabType'] = tabType;

    this.msmeService.getMcaTabDetails(json).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {
          this.cin = response.data.cin ?? this.cin;
          switch (tabType) {
            case 'FIRM_PROFILE':
              this.customerTypeId = response?.data?.customerTypeId;
              this.isFirmDataFetched = true;
              this.firmDatailsModel = response?.data;
              if (this.firmDatailsModel?.turnover && this.firmDatailsModel?.turnover.length > 0) {
                this.sortByName(this.firmDatailsModel?.turnover, 'optionName');
                this.firmDatailsModel?.turnover.forEach(element => {
                  if (element.optionName == 'MCA') {
                    element.optionValue = element.optionValue == null ? "0" : this.formatValue(Number(element.optionValue)).concat(this.firmDatailsModel.mcaTurnoverFY);
                    this.turnOver = element.optionValue;
                    this.isTurnOverFromMca = true;
                    element.selected = true;
                  } else {
                    element.selected = false;
                  }
                });
              }

              if (this.firmDatailsModel.alertCountData) {
                this.firmDatailsModel.alertCountData = JSON.parse(this.firmDatailsModel.alertCountData);
              }

              if (this.firmDatailsModel?.industry && this.firmDatailsModel?.industry.length > 0) {
                this.sortByName(this.firmDatailsModel?.industry, 'optionName');
                this.firmDatailsModel?.industry.forEach(element => {
                  if (element.optionName == 'MCA') {
                    element.optionValue = element.optionValue == null ? "NA" : element.optionValue
                    this.industry = element.optionValue;
                  }
                });
              }
              if (this.firmDatailsModel?.sector && this.firmDatailsModel?.sector.length > 0) {
                this.sortByName(this.firmDatailsModel?.sector, 'optionName');
                this.firmDatailsModel?.sector.forEach(element => {
                  if (element.optionName == 'MCA') {
                    element.optionValue = element.optionValue == null ? "NA" : element.optionValue
                    this.sector = element.optionValue;
                  }
                });
              }

              if (this.firmDatailsModel?.tradingNames && this.firmDatailsModel?.tradingNames.length > 0) {
                this.sortByName(this.firmDatailsModel?.tradingNames, 'optionName');
                this.firmDatailsModel?.tradingNames.forEach(element => {
                  if (element.optionName == 'MCA') {
                    element.optionValue = element.optionValue == null ? "NA" : element.optionValue
                    this.isTradingNameFromMca = true;
                    this.tradingName = element.optionValue;
                  }
                });
              }
              if (this.firmDatailsModel?.businessAddress && this.firmDatailsModel?.businessAddress.length > 0) {
                this.sortByName(this.firmDatailsModel?.businessAddress, 'optionName');
                this.firmDatailsModel?.businessAddress.forEach(element => {
                  if (element.optionName == 'MCA') {
                    element.optionValue = element.optionValue == null ? "NA" : element.optionValue
                    this.isBusinessAddressFromMca = true;
                    this.businessAddress = element.optionValue;
                  }
                });
              }
              if (this.firmDatailsModel?.constitutions && this.firmDatailsModel?.constitutions.length > 0) {
                this.sortByAlp(this.firmDatailsModel?.constitutions, 'optionName');
                this.firmDatailsModel?.constitutions.forEach(element => {
                  if (element.optionName == 'GST') {
                    element.optionValue = element.optionValue == null ? "NA" : element.optionValue
                    this.isConstitutionsFromGst = true;
                    this.constitutions = element.optionValue;
                  }
                });
              }
              if (this.firmDatailsModel?.contactPersonName && this.firmDatailsModel?.contactPersonName.length > 0) {
                this.sortByName(this.firmDatailsModel?.contactPersonName, 'selectType');
                this.firmDatailsModel?.contactPersonName.forEach(element => {
                  if (element.selectType == 'MCA') {
                    this.isContactInfoFromMca = true;
                    this.contactInfo = element;
                  }
                });
              }
              this.commonService.setStorage("cutomerId", this.firmDatailsModel?.customerId);
              this.childCustomerPag.totalSize = this.firmDatailsModel?.childCustomers?.length || 0;
              break;
            case 'OPPORTUNITY':
              this.opportunityData = response.data;
              this.hsbcPreAppProductPage.totalSize = this.opportunityData?.hsbcPreApprovedProd?.length;
              this.hsbcPreAppProductPage.pageSize = signal(5);
              this.hsbcPreApprovedProdList = this.opportunityData?.hsbcPreApprovedProd;
              this.isOpportunityDataFetched = true;
              // this.fetchList();
              break;
            case 'FINANCIALS':
              this.isMcaFinacialDataFetched = true;
              this.mcaFinancialData = response.data;
              break;
            default:
              break;
          }

          if (tabType == "FIRM_PROFILE") {
            this.apiTypeList = [];
            this.getApiAuditData(false)
          }
          if (tabType == "FINANCIALS") {
            this.getStatusForOrderFinancial(false);
          }
        }
        else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  sortByAlp(array: any[], property?: string) {
    array.sort((a, b) => {
      // For arrays of objects, check if property exists
      const aName = property ? a[property] : a;
      const bName = property ? b[property] : b;
      return aName.localeCompare(bName);
    });
  }

  sortByName(array: any[], property?: string) {
    array.sort((a, b) => {
      // For arrays of objects, check if property exists
      const aName = property ? a[property] : a;
      const bName = property ? b[property] : b;

      // Check if 'name' starts with 'M'
      const aStartsWithM = aName.startsWith('M');
      const bStartsWithM = bName.startsWith('M');

      if (aStartsWithM && !bStartsWithM) {
        return -1; // 'a' should come before 'b'
      } else if (!aStartsWithM && bStartsWithM) {
        return 1; // 'b' should come before 'a'
      } else {
        // Both or neither start with 'M'; sort alphabetically
        return aName.localeCompare(bName);
      }
    });
  }

  toggleSort4(column: string, dontCallApi?: boolean, bAnkTabInd?: any) {
    this.bankTabInd = bAnkTabInd;
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if (dontCallApi && this.currentSortField == ("amountTop5FP")) {
      this.getSortedDataForNtCoPartiesBankPaymentFirst(this.bankTabInd);
    }
    else if (dontCallApi && this.currentSortField == ("percentageTop5FP")) {
      this.getSortedDataForNtCoPartiesBankReceiptPayment(this.bankTabInd);
    }
    else if (dontCallApi && this.currentSortField == ("amountTop5Rec")) {
      this.getSortedDataForNtCoPartiesBankReceipt(this.bankTabInd);
    }
    else if (dontCallApi && this.currentSortField == ("percentageTop5Rec")) {
      this.getSortedDataForNtCoPartiesBankReceiptPer(this.bankTabInd);
    }

    if (this.bankTabInd == 0) {
      this.isClick = true;
      this.currentSortField == 'amount'
    }
  }

  toggleSort2(column: string, direction: string, dontCallApi?: boolean) {
    // if (this.currentSortField === column) {
    //   this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.currentSortField = column;
    //   this.sortDirection = 'ASC';
    // }
    if (this.currentSortField != column) {
      this.currentSortField = column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    if (dontCallApi && this.currentSortField == ("DateAlertHistory")) {
      this.getSortedDateForAlertHistory();
    }
    if (dontCallApi && this.currentSortField == ("dateOfAppointmentCL")) {
      this.getSortedDateForConnectedLending();
    }
  }

  toggleSort(column: string, direction: string, dontCallApi?: boolean) {
    // if (this.currentSortField === column) {
    //    this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.currentSortField = column;
    //   this.sortDirection = 'ASC';
    // }
    if (this.currentSortField != column) {
      this.currentSortField = column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    if (dontCallApi && this.currentSortField == ("amount")) {
      this.getSortedData();
    }
    if (dontCallApi && this.currentSortField == ("dateOfApproval")) {
      this.getSortedData2();
    }
    if (dontCallApi && this.currentSortField == ("Date")) {
      this.getSortedDateForAlert();
    }
    if (dontCallApi && this.currentSortField == ("dateOfAppointment")) {
      this.getSortedDateForDirectorDetails();
    }
    if (dontCallApi && this.currentSortField == ("stakePercent")) {
      this.getSortedDateForStakePer();
    }
    if (dontCallApi && this.currentSortField == ("Value")) {
      this.getSortedForFy();
    }
    if (dontCallApi && this.currentSortField == ("Value2")) {
      this.getSortedForFyNoShare();
    }
    if (dontCallApi && this.currentSortField == ("noOfInvoice")) {
      this.getSortedForNoOfInvoice();
    }
    if (dontCallApi && this.currentSortField == ("currentYearConcentration")) {
      this.getSortedForcurrentYearConc();
    }
    if (dontCallApi && this.currentSortField == ("invoiceCY")) {
      this.getSortedForinvoiceCY();
    }
    if (dontCallApi && this.currentSortField == ("concCY")) {
      this.getSortedForconcCY();
    }
    if (dontCallApi && this.currentSortField == ("FY")) {
      this.getSortedFY();
    }
    if (dontCallApi && this.currentSortField == ("revenue")) {
      this.getSortedrevenue();
    }
  }

  getSortedDataForNtCoPartiesBankReceiptPer(bankTabIndex): void {
    const sortField = 'percentage';
    const sortDirection = this.sortDirection;
    if (this.bankDetailsListRes && this.bankDetailsListRes.length > 0) {
      const firstBankData = this.bankDetailsListRes[bankTabIndex];
      if (firstBankData && Array.isArray(firstBankData.topFundsReceipts)) {
        firstBankData.topFundsReceipts.sort((a, b) => {
          const diff = a[sortField] - b[sortField];
          return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
        });
      }
    }
  }

  getSortedDataForNtCoPartiesBankReceipt(bankTabIndex): void {
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    if (this.bankDetailsListRes && this.bankDetailsListRes.length > 0) {
      const firstBankData = this.bankDetailsListRes[bankTabIndex];
      if (firstBankData && Array.isArray(firstBankData.topFundsReceipts)) {
        firstBankData.topFundsReceipts.sort((a, b) => {
          const diff = a[sortField] - b[sortField];
          return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
        });
      }
    }
  }

  getSortedDataForNtCoPartiesBankPaymentFirst(bankTabIndex): void {
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    if (this.bankDetailsListRes && this.bankDetailsListRes.length > 0) {
      const firstBankData = this.bankDetailsListRes[bankTabIndex];
      if (firstBankData && Array.isArray(firstBankData.topFundPayments)) {
        firstBankData.topFundPayments.sort((a, b) => {
          const diff = a[sortField] - b[sortField];
          return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
        });
      }
    }
  }

  getSortedDataForNtCoPartiesBankReceiptPayment(bankTabIndex) {
    const sortField = 'percentage';
    const sortDirection = this.sortDirection;
    if (this.bankDetailsListRes && this.bankDetailsListRes.length > 0) {
      const firstBankData = this.bankDetailsListRes[bankTabIndex];
      if (firstBankData && Array.isArray(firstBankData.topFundPayments)) {
        firstBankData.topFundPayments.sort((a, b) => {
          const diff = a[sortField] - b[sortField];
          return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
        });
      }
    }
  }

  getSortedDataForNtCoPartiesBankPayment() {
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    this.bankDetailsListRes.forEach(bankData => {
      bankData.topFundPayments.sort((a, b) => {
        const diff = a[sortField] - b[sortField];
        return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
      })
    });
  }

  getSortedrevenue(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.relatedEntitiesList = this.relatedEntitiesList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedFY(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.relatedEntitiesList = this.relatedEntitiesList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForPer(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.bankDetailsListRes = this.bankDetailsListRes.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForAmt(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.bankDetailsListRes = this.bankDetailsListRes.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForinvoiceCY(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.topFiveSalesList = this.topFiveSalesList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForconcCY(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.topFiveSalesList = this.topFiveSalesList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForcurrentYearConc(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.topFiveBuyersList = this.topFiveBuyersList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForNoOfInvoice(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.topFiveBuyersList = this.topFiveBuyersList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedForFyNoShare(): void {
    const sortDirection = this.sortDirection;
    this.detailedShareHoldingList = this.detailedShareHoldingList.sort((a, b) => {
      if (a.Shareholder.toUpperCase() != 'TOTAL') {
        let diff = 0;
        this.valueA = a.FY2?.length >= 8 ? a.Value : a.Value2;
        this.valueB = b.FY2?.length >= 8 ? b.Value : b.Value2;
        diff = this.valueA - this.valueB;
        return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
      }
    });
  }

  getSortedForFy(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.detailedShareHoldingList = this.detailedShareHoldingList.sort((a, b) => {
      if (a.Shareholder.toUpperCase() != 'TOTAL') {
        let diff = 0;
        this.valueA = a.FY?.length <= 8 ? a.Value : a.Value2;
        this.valueB = b.FY?.length <= 8 ? b.Value : b.Value2;
        diff = this.valueA - this.valueB;
        return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
      }
    });
  }

  getSortedDateForConnectedLending(): void {
    const sortField = 'dateOfAppointment';
    const sortDirection = this.sortDirection;
    this.connectedLendingDetailsList = this.connectedLendingDetailsList.sort((a, b) => {
      const dateA = this.getValidDate(a[sortField]);
      const dateB = this.getValidDate(b[sortField]);
      if (dateA === null && dateB === null) {
        return 0;
      }
      if (dateA === null) {
        return sortDirection === 'ASC' ? 1 : -1;
      }
      if (dateB === null) {
        return sortDirection === 'ASC' ? -1 : 1;
      }
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getValidDate(value: any): number | null {
    if (!value || value === '') {
      return null;
    }
    return new Date(value).getTime();
  }

  getSortedDateForStakePer(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.directorDetailsList = this.directorDetailsList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedDateForDirectorDetails(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.directorDetailsList = this.directorDetailsList.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedDateForAlertHistory(): void {
    const sortField = 'Date';
    const sortDirection = this.sortDirection;
    this.nonFinancialDataDumpForAH = this.nonFinancialDataDumpForAH.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedDateForAlert(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.nonFinancialDataDump = this.nonFinancialDataDump.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedData2(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsbcPreApprovedProdList = this.hsbcPreApprovedProdList.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedData(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsbcPreApprovedProdList = this.hsbcPreApprovedProdList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  selectOption(selectedOption: string) {
    if (selectedOption === 'external') {
      this.isLatestCreditRatingFromExternal = true;
    }
    else {
      this.isLatestCreditRatingFromExternal = false;
    }
  }

  getApiAuditData(isFromRefresh: boolean) {
    const json = {
      "pan": this.pan,
      "cin": this.cin ?? this.firmDatailsModel.cin
    }
    this.msmeService.getApiAuditData(json, true).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {
          this.apiTypeList = [];
          this.apiTypeList.push(...response.data);
          const orderFiancial = this.apiTypeList.filter(api => api.apiName === 'MCA Order Financial' && api.status === 'Inprogress');
          if (orderFiancial.length > 0) {
            this.isOrderFinancial = true;
          }
          else {
            this.isOrderFinancial = false;
          }

          if (isFromRefresh) {
            const orderFiancialRefresh = this.apiTypeList.filter(api => api.apiName !== 'MCA Order Financial' && api.status === 'Inprogress');
            console.log('orderFiancialRefresh: ', orderFiancialRefresh);
            if (orderFiancialRefresh.length == 0) {
              this.onApiRefTimeoutClear();
              this.isFirmDataFetched = false;
              this.isOpportunityDataFetched = false;
              this.isMcaFinacialDataFetched = false;
              this.nonFinancialFetched = false;
              this.isDirectorAndConnectingLenderFetched = false;
              this.getMcaTabDetails(this.MAIN_TAB_TYPE[this.selectedTabIndex]);
            }
          }

        }
        else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  callApiWithDelay() {
    if (this.apiRefTimeout) return;
    this.apiRefTimeout = setInterval(() => {
      console.log("Calling API with delay...");
      this.getApiAuditData(true);
    }, 8000);
  }

  onApiRefTimeoutClear() {
    if (this.apiRefTimeout) {
      clearInterval(this.apiRefTimeout);
      this.apiRefTimeout = null;
    }
  }

  refreshDataApiWise(apiId) {
    GlobalHeaders['x-page-action'] = 'Refresh Api for ' + apiId;
    const json = {
      // "apiTypeId": refreshMaping[apiId],
      "apiTypeId": apiId,
      "pan": this.pan,
      "cin": this.cin ?? this.firmDatailsModel.cin,
      "companyName": this.firmDatailsModel?.tradingNameFromCustomer
    }
    console.log('refreshDataApiWise Req::::::> ', json);

    const tempForMca: any = this.apiTypeList.filter(api => api.apiId === apiId)[0];
    if ((tempForMca.apiName === 'MCA' || tempForMca.apiName === 'MCA Order Financial') && this.commonService.isObjectNullOrEmpty(json.cin)) {
      this.commonService.warningSnackBar("Customer CIN is not available");
      return;
    }

    if (tempForMca.apiName === 'MCA' && !this.commonService.isObjectNullOrEmpty(tempForMca.lastFetchedDate)) {

      const formattedDate = this.datePipe.transform(tempForMca.lastFetchedDate, 'yyyy-MM-dd');
      let currentDate = new Date(); // gets current date and time
      let futureDate = new Date(formattedDate);
      futureDate.setDate(futureDate.getDate() + 3);

      currentDate = this.resetTime(currentDate);
      futureDate = this.resetTime(futureDate);
      if (currentDate < futureDate) {
        const futureDatetemp = this.datePipe.transform(futureDate, 'dd-MM-yyyy');
        this.commonService.warningSnackBar("Please try again to hit API on " + futureDatetemp);
        return;
      }
    }

    this.msmeService.refreshApisBasedOnId(json).subscribe(
      (response: any) => {
        if (response.status == 200) {
          this.commonService.successSnackBar("Request send successfully");

          if (apiId === 19) {
            this.retryOptionEnabled = false;
            this.tooltipMessage = "Please, Check after 5 minutes."
          }
          if (tempForMca.apiName === 'MCA') {
            this.apiTypeList.forEach(api => {
              if (api.apiId === apiId || api.apiName == 'MCA Order Financial') {
                api.status = 'Inprogress';
              }
            });
            this.callApiWithDelay();
          }
          else {
            this.getApiAuditData(true);
          }
        }
        else if (response.status == 208) {
          this.commonService.warningSnackBar(response.message);
        }
        else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  redirectToAlertsTabs(tabId) {
    this.selectedTabIndex = 3;
    this.selectedAlertsTabIndex = tabId - 1;
    this.onAlertsTabChange(this.selectedAlertsTabIndex);
  }

  redirectToNetworkTabs(tabId) {
    this.selectedTabIndex = 4;
    this.selectedNetworkTabIndex = tabId - 1;
    this.onNetworkSubTabChange(null, tabId);
  }

  goToFirmProfile() {
    this.selectedTabIndex = 0;
  }

  onPageChange(page: any, type: any): void {

    if (type == 1) {
      this.startIndex = (page - 1) * this.pageSize;
      this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    }
  }

  UdyamDetails_popup(): void {
    if (!this.firmDatailsModel.udyamNoCertificate) {
      return;
    }
    let udyamData = {
      udyamCategory: this.firmDatailsModel.udyamCategory,
      udyamMsmeStatus: this.firmDatailsModel.udyamMsmeStatus,
      udyamNoCertificate: this.firmDatailsModel.udyamNoCertificate,
      udhyamCertificateRefId: this.firmDatailsModel.udhyamCertificateRefId,
      udyamFetchDate: this.firmDatailsModel.udyamFetchDate
    };
    this.firmDatailsModel.udyamMsmeStatus;
    const dialogRef = this.dialog.open(UdyamDetailsPopupComponent, {
      panelClass: ['popupMain_design'],
      data: udyamData,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  Active_GSTDetails_popup(): void {
    if (this.firmDatailsModel?.activeGstInList == null || this.firmDatailsModel?.activeGstInList.length == 0) {
      return;
    }
    const dialogRef = this.dialog.open(ActiveGstDetailsPopupComponent, {
      panelClass: ['popupMain_design'],
      data: this.firmDatailsModel?.activeGstInList || [],
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  InActive_disable_GSTDetails_popup(): void {
    if (this.firmDatailsModel?.inAtiveGstInList == null || this.firmDatailsModel?.inAtiveGstInList.length == 0) {
      return;
    }
    const dialogRef = this.dialog.open(InactiveDisableGstDetailsPopupComponent, {
      panelClass: ['popupMain_design'],
      data: this.firmDatailsModel?.inAtiveGstInList || [],
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  CreditRatingDetails_popup(): void {
    const dialogRef = this.dialog.open(CreditRatingDetailsPopupComponent, {
      panelClass: ['popupMain_design'],
      data: this.firmDatailsModel?.creditRatingProxy || [],
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  formatValue(value?: number, type?): string {
    if (value === undefined || value === null || (typeof value === 'string' && value === "")) {
      return "NA";
    }
    else if (value === 0 || value == 0.00) {
      return "-";
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: type ? 'USD' : 'INR',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatValueFor(value?: number, type?): string {
    if (value === undefined || value === null || (typeof value === 'string' && value === "")) {
      return "0";
    }
    else if (value === 0 || value == 0.00) {
      return "0";
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: type ? 'USD' : 'INR',
      minimumFractionDigits: 2
    }).format(value);
  }

  checkformatValue(value) {
    if (value === null || value === undefined) {
      return "NA";
    }
    else if (value === 0 || value == 0.00) {
      return "-";
    }
    else {
      return value;
    }
  }

  decimalValue(value?: number, type?): string {
    if (value === undefined || value === null || (typeof value === 'string' && value === "")) {
      return "NA";
    } else if (value === 0 || value === 0.00) {
      return "-";
    }
    return value.toFixed(2);
  }

  LenderMcaCharges_popup(): void {
    const dialogRef = this.dialog.open(LenderMcaChargesPopupComponent, {
      data: { pan: this.pan },
      panelClass: ['popupMain_design'],
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  SectorHSNdetails_popup(): void {
    const dialogRef = this.dialog.open(SectorHSNDetailsComponent,
      {
        panelClass: ['popupMain_design'],
        data: { pan: this.pan },
      }
    );

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  fDI_ODI_ECB_opportunityPopup(type: string, dataObj: any): void {
    if (!dataObj)
      return;
    this.dialog.open(FdiOpportunitydataComponent, { data: { type: type, opportunityData: dataObj }, panelClass: ['popupMain_design'], });
  }

  goToAnalysis(path: any, pan?: any, din?: any) {
    let panNo = '';
    this.commonService.removeStorage("pr_commercial_pan");
    this.commonService.removeStorage("from_pr_dashboard");
    if (pan) {
      this.commonService.setStorage("existing_pan", pan.toString());
      panNo = pan.toString();
    } else {
      this.commonService.setStorage("existing_pan", this.pan.toString());
      panNo = this.pan.toString();
    }
    this.commonService.setStorage("borrower_pan", this.pan.toString());
    const routerData = {
      ...this.routerData,
      din
    };
    this.router.navigate([path], { state: { routerData, data: this.pageData, rmView: true }, queryParams: { externalRoutData: this.externalRoutData ?? null } });
    // this.router.navigate([path], { state: { routerData, rmView: true }, queryParams: { externalRoutData: this.externalRoutData ?? null } });
  }

  downloadExcelFile(applicationId?) {
    const req: any = {};
    req.applicationId = applicationId;
    this.msmeService.downloadExcelFile(req).subscribe(res => {
      if (res.status === 200 && res.contentInBytes) {
        this.downloadExcel(res.contentInBytes, 'CAM Report_' + req.applicationId);
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

  downloadBGPdfFile(pan?: any, name?: any) {
    var json = {};
    json['pan'] = pan;
    json['searchName'] = this.selectedIndustry;
    json['name'] = name;
    json['maskContactNumber'] = this.isActionAvailforSubpage(this.constants.pageMaster.NETWORK, this.constants.PageActions.UN_MASK_CONTACT_NO)
    //console.log"in method");
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadBGPdf(json).subscribe(res => {
      if (res.status === 200 && res?.data?.content) {
        console.log("Download Back Ground Analysis PDF >>", res);
        if (res && res?.data && res?.data?.content) {
          this.downloadBase64(res.data.content, "BG_Analysis_" + pan);
        } else {
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

  addToOrderFinancial() {
    GlobalHeaders['x-page-action'] = 'Order Financial';
    if (this.orderFinancialStatus.status == 'Inprogress') {
      return;
    }

    if (!this.pan || !this.firmDatailsModel.cin) {
      this.commonService.warningSnackBar('Pan Or cin not found');
      return;
    }
    const reqJson = {
      pan: this.pan,
      cin: this.cin ?? this.firmDatailsModel.cin,
      fullBureauConsent: false,
      downloadFinancialConsent: true
    };
    this.msmeService.addToOrderFinancial(reqJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.commonService.successSnackBar(res.message);
        this.getStatusForOrderFinancial(false);
      }
      else if (res.status == 208) {
        this.commonService.warningSnackBar("Api already called inside 30 days");
      }
      else {
        this.commonService.warningSnackBar('Something went Wrong')
      }
    });
  }

  getStatusForOrderFinancial(isByFirmProfile: boolean) {
    const json = {
      "pan": this.pan,
      "cin": this.cin ?? this.firmDatailsModel.cin
    }
    this.msmeService.getStatusForOrderFinancial(json).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {
          this.orderFinancialStatus = response.data;

          if (this.orderFinancialStatus.status === 'Inprogress') {
            this.isOrderFinancial = true;
          }
          if (isByFirmProfile) {
            if (this.apiTypeList.length != 0) {
              this.apiTypeList.splice(2, 0, this.orderFinancialStatus);
              this.isApiStatusFind = false;
            } else {
              this.apiTypeList.push(this.orderFinancialStatus);
            }
          }
        }
        else {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  getIndividualGstUdhyamSaveRiskApi(data) {
    this.msmeService.getIndividualGstUdhyamSaveRiskApi(data).subscribe((res: any) => {
      if (res.status == 200 && res.data) {
        this.findProspectsHitType = true;
        this.dashboardResponse = res.data;
        console.log('getIndividualGstUdhyamSaveRiskApi() :::::::::> ', this.dashboardResponse);
      }
      else {
        console.log('getIndividualGstUdhyamSaveRiskApi() ::::> ', res);
        this.commonService.warningSnackBar('Something went wrong When fetch details')
      }
    });
  }

  addToTarget() {
    this.dashboardResponse.employeeCode = this.commonService.getStorage(Constants.httpAndCookies.EMP_CODE, true);
    this.dashboardResponse.customerType = this.customerType;
    this.dashboardResponse.isRmAssign = false;
    this.dashboardResponse.pan = this.dashboardResponse.pan ?? this.pan;
    this.dashboardResponse.cin = this.dashboardResponse.cin ?? this.cin
    this.dashboardResponse.companyName = this.dashboardResponse.companyName ?? this.firmDatailsModel?.tradingNameFromCustomer

    if (this.commonService.isObjectNullOrEmpty(this.dashboardResponse.pan)) {
      this.commonService.warningSnackBar('Pan not found from customer');
      return;
    }

    if (!this.commonService.isObjectNullOrEmpty(this.dashboardResponse.downloadFinancialConsent) && this.dashboardResponse.downloadFinancialConsent) {
      if (this.commonService.isObjectNullOrEmpty(this.dashboardResponse.cin)) {
        this.commonService.warningSnackBar('You can not place Financial Order as CIN is not available');
        return;
      }
      const tempMca = this.apiTypeList.find(api => api.apiName === "MCA");
      if (!this.commonService.isObjectNullOrEmpty(tempMca) && tempMca.status === 'Inprogress') {
        this.commonService.warningSnackBar("Financial order has been already placed");
        return;
      }
    }

    console.log("prospect respommse ", this.dashboardResponse)
    this.msmeService.addToTargetIndvidualCustomer(this.dashboardResponse).subscribe((res: any) => {
      if (res.status == 200) {
        this.isFindProspects = false;
        this.findProspectsHitType = false;
        this.otherProspect = false;
        this.externalRoutData = null;
        this.getApiAuditData(false);
        this.setSubsubpage(this.pageData);
        this.router.navigate([`/hsbc/rmExisitingPortfolioView`], { state: { routerData: this.routerData, data: this.pageData, dataFrom: this.pageData, isFromParentPage: true } });
        this.commonService.successSnackBar('Customer added successfully');
      }
      else if (res.status == 208) {
        this.commonService.warningSnackBar('Customer is already available in ' + res?.data?.type + ' dashboard');
      }
      else {
        this.commonService.warningSnackBar('Something went Wrong')
      }
    });
  }

  setOnFullBureauConsent(e, key, openPopUp) {
    this.dashboardResponse[key] = e.checked
    if (e.checked && openPopUp) {
      this.onBureauConsentPopup(key);
    }
  }

  onBureauConsentPopup(key): void {
    const dialogRef = this.dialog.open(WarningPopupComponent, {
      panelClass: ['popupMain_design'], disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('onBureauConsentPopup: ', result);
      if (key == 'fullBureauConsent' && result == 'close') {
        this.dashboardResponse.partialBureauConsent = false;
      }
    });
  }

  getSpreadOrderStatus() {
    GlobalHeaders['x-page-action'] = 'Spread Order';
    if (!this.pan || !this.firmDatailsModel.cin) {
      this.commonService.warningSnackBar('Pan or cin not available');
      return;
    }
    this.dialog.open(SpreadOrderPopupComponent, { data: { pan: this.pan, cin: this.firmDatailsModel.cin, email: this.email }, panelClass: ['popupMain_design'] });
  }

  backToTheMain() {
    let pageData: any = [];
    const routerLinkStr = this.commonService.getStorage('routerLink', true);
    if (routerLinkStr) {
      const routerLink = JSON.parse(routerLinkStr);
      const parentData = routerLink?.dataFrom || routerLink?.data;
      if (parentData && parentData?.routeLink) {
        pageData = parentData;
      }
    } else if (history?.state?.dataFrom) {
      pageData = history?.state?.dataFrom;
    } else if (this.state && !this.historyStateData) {
      pageData = this.state?.data;
    } else {
      pageData = history?.state?.data;
    }
    if (pageData)
      this.router.navigate([pageData.routeLink], {
        state: { data: pageData }
      });
  }

  redirectToPreApproved() {
    this.commonMethod.getUserPermissionData(
      this.userId,
      this.roleId,
      Constants.pageMaster.PRE_APPROVED_PRODUCTS,
      (pageData: any) => {
        pageData = pageData?.[0];
        console.log(pageData);
        if (pageData?.routeLink) {
          this.routerData.oppurtunity = true;
          this.router.navigate([pageData?.routeLink], {
            state: { data: pageData, routerData: this.routerData, dataFrom: this.pageData },
          });
        }
      }
    );
  }

  redirectToBorrowerModule(applicationId?, panNo?, redirectUrl?) {
    GlobalHeaders['x-page-action'] = 'Start Pre-Qualified';
    saveActivity(() => {
      console.log('Activity saved callback executed.');
    });

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
    if (this.pan) {
      cookiesObje.panNo = this.pan;
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
    this.routerData.oppurtunity = true;
    this.routerData.selectedTabIndex = 1;
    const state = {
      data: this.pageData,
      routerData: this.routerData
    }
    this.commonService.setStorage('historyState', JSON.stringify(state));
    if (Constants.IS_LOCAL) {
      window.location.href = 'http://localhost:4500/redirect?data=' + this.commonService.toBTOA(cookieString);;
    } else {
      let UUID = crypto.randomUUID();
      this.commonService.setStorage(UUID, cookieString)
      window.location.href = Constants.LOCATION_URL + '/hsbc/application' + '/redirect?data=' + this.commonService.toBTOA(UUID);
    }
  }

  getPreScreenData() {
    this.msmeService.getPreScreenDataByPan(this.pan).subscribe((res) => {
      if (res?.data?.data) {
        this.prescreenData = res.data.data;
        console.log("pre-screen response ", this.prescreenData);
      } else {
        console.log("Data is missing: ", res);
      }
    });
  }

  get latestPrescreen(): prescreenData | null {
    return this.prescreenData.length > 0 ? this.prescreenData[0] : null;
  }

  getDisplayValue(value: any): number {
    if (value === " " || value === 'NULL' || Number(value) === -1 || Number(value) === -4) {
      return 0;
    }
    return Number(value);
  }

  checkPanInCibilMaster() {
    const pan = history?.state?.routerData?.pan;
    if (!pan) {
      console.warn('PAN not found in router data');
      return;
    }

    this.msmeService.checkPanInCibilMaster(pan).subscribe({
      next: (res) => {
        console.log('CIBIL response:', res);
        this.isPreScreen = res?.data?.flag ?? false;
      },
      error: (err) => {
        console.error('CIBIL API error:', err);
      }
    });
  }

  isObjectNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  onCopy(email: any, tooltip: any) {
    this.copyToClipboard(email);

    this.copyTooltipText = 'Copied';
    tooltip.show();

    setTimeout(() => {
      tooltip.hide();
      this.copyTooltipText = 'Copy';
    }, 1500);
  }


  remarkPopup(data) {
    const dialogRef = this.dialog.open(RemarkAlertPopupComponent, {
      panelClass: ['popupMain_design'],
      data: data,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 1) {
        this.getAlertsSubTabData(1);
      }
    });
  }



  // Risk score Time line chart S
  // Highcharts = Highcharts;  // Reference Highcharts in the template
  Highcharts: typeof Highcharts = Highcharts;

  Risk_Score_Timeline: any = {
    chart: {
      type: 'spline',
      height: 300,
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
      allowDecimals: false,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'Risk Score',
      },

      labels: {
        useHTML: true,
        formatter: function () {
          switch (this.value) {
            case 0:
              return 'No Risk';
            case 1:
              return 'Low';
            case 1.76:
              return 'Medium';
            case 2.51:
              return 'High';
            case 3.26:
              return 'Critical';
            case 4:
              return '';
            default:
              return '';
          }
          // if (this.value > 3.25 && this.value <= 4) {
          //   return 'Critical';
          // } else if (this.value > 2.5 && this.value <= 3.25) {
          //   return 'High';
          // } else if (this.value > 1.75 && this.value <= 2.5) {
          //   return 'Medium';
          // } else if (this.value >= 1 && this.value <= 1.75) {
          //   return 'Low';
          // } else {
          //   return 'No Risk';
          // }
        }
      },
      gridLineDashStyle: 'longdash',
      tickPositions: [0, 1, 1.76, 2.51, 3.26, 4],
      // plotBands: [
      //   { from: 0, to: 1,},
      //   { from: 1, to: 1.75,},
      //   { from: 1.751, to: 2.5,},
      //   { from: 2.51, to: 3.25,},
      //   { from: 3.251, to: 4,}
      // ],
    },
    plotOptions: {
      areaspline: {
        marker: {
          enabled: true,
          symbol: 'circle',
          radius: 0,
          fillColor: '#fff',
          lineWidth: 1,
          lineColor: null,
        },
      },
      series: {
        animation: {
          duration: 2000,
        },
        lineWidth: 4, // For a thicker line if necessary
      },
    },
    legend: {
      enabled: false,
      align: 'right',
      verticalAlign: 'top',
      itemMarginTop: 10,
      itemMarginBottom: 20,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        let y = "";
        let designClass = "";
        if (this.y > 3.25) {
          y = 'Critical';
          designClass = 'darkred_label';
        } else if (this.y > 2.5 && this.y <= 3.25) {
          y = 'High';
          designClass = 'orange_label';
        } else if (this.y > 1.75 && this.y <= 2.5) {
          y = 'Medium';
          designClass = 'yellow_label';
        } else if (this.y >= 1 && this.y <= 1.75) {
          y = 'Low';
          designClass = 'green_label';
        } else {
          y = 'No Risk';
          designClass = 'darkgreen_label';
        }
        return `
            <div class="custom-long-tooltip">
              <p>${this.point.category}</p>
              <div class="tooltip-row">
                <span class="label ${designClass}">${y + " (Score:" + this.y + ")"}</span>
              </div>
              <div class="tooltip-row">
                <span class="value view-link tooltip-action-risk-score-timeline cursor_pointer ${this.point.category}">View Alerts</span>
              </div>
            </div>
          `;
      }

    },
    series: [

    ],
  };
  // Risk score Time line chart E

  //  Speed meter chart S

  redirectClicked() {
    console.log("Clicked from tool tip");

  }

  ngAfterViewInit() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;

      if (target) {
        if (target.classList.contains('tooltip-action-risk-score-timeline')) {
          let classList = target.classList;
          let title = classList[classList.length - 1];
          let month = classList[classList.length - 2];
          let [categoryDate, filterType, severityValue]: any = title.split('|');
          categoryDate = month + " " + categoryDate + " ";
          let date = new Date(categoryDate);
          this.isCalledFromGraph = true;
          this.redirectToAlertTabWithFilter(5, severityValue, date);
        } else if (target.classList.contains('tooltip-action-risk-severity-timeline') ||
          target.classList.contains('tooltip-action-risk-severity-pie') ||
          target.classList.contains('tooltip-action-risk-category-timeline') ||
          target.classList.contains('tooltip-action-risk-category-pie')) {
          let classList = target.classList;
          let title = classList[classList.length - 1];
          let month = classList[classList.length - 2];
          let [categoryDate, filterType, severityValue]: any = title.split('|');
          categoryDate = month + " " + categoryDate + " ";
          let date = new Date(categoryDate);
          severityValue = severityValue ? Number(severityValue) : undefined;
          filterType = severityValue ? (filterType ? Number(filterType) : undefined) : undefined;
          this.isCalledFromGraph = true;
          this.redirectToAlertTabWithFilter(filterType, severityValue, date);
        }
        //  else if(target.classList.contains('tooltip-action-risk-severity-timeline')) {
        //   let classList =  target.classList;
        //   let title = classList[classList.length-1];
        //   let month = classList[classList.length-2];
        //   let [categoryDate,filterType,severityValue] : any = title.split('|');
        //   categoryDate = month + " " +categoryDate + " ";
        //   let date = new Date(categoryDate);
        //   severityValue = severityValue ?  Number(severityValue) : undefined;
        //   filterType = severityValue ? (filterType ? Number(filterType) : undefined) : undefined;
        //   this.redirectToAlertTabWithFilter(filterType ,severityValue ,date);
        // } else if(target.classList.contains('tooltip-action-risk-severity-pie')) {
        //   let classList =  target.classList;
        //   let title = classList[classList.length-1];
        //   let month = classList[classList.length-2];
        //   let [categoryDate,filterType,severityValue] : any = title.split('|');
        //   categoryDate = month + " " +categoryDate + " ";
        //   let date = new Date(categoryDate);
        //   severityValue = severityValue ?  Number(severityValue) : undefined;
        //   filterType = severityValue ? (filterType ? Number(filterType) : undefined) : undefined;
        //   this.redirectToAlertTabWithFilter(filterType ,severityValue ,date);
        // } else if(target.classList.contains('tooltip-action-risk-category-timeline')) {
        //   let classList =  target.classList;
        //   let title = classList[classList.length-1];
        //   let month = classList[classList.length-2];
        //   let [categoryDate,filterType,severityValue] : any = title.split('|');
        //   categoryDate = month + " " +categoryDate + " ";
        //   let date = new Date(categoryDate);
        //   severityValue = severityValue ?  Number(severityValue) : undefined;
        //   filterType = severityValue ? (filterType ? Number(filterType) : undefined) : undefined;
        //   this.redirectToAlertTabWithFilter(filterType ,severityValue ,date);
        // } else if(target.classList.contains('tooltip-action-risk-category-pie')) {
        //   let classList =  target.classList;
        //   let title = classList[classList.length-1];
        //   let month = classList[classList.length-2];
        //   let [categoryDate,filterType,severityValue] : any = title.split('|');
        //   categoryDate = month + " " +categoryDate + " ";
        //   let date = new Date(categoryDate);
        //   severityValue = severityValue ?  Number(severityValue) : undefined;
        //   filterType = severityValue ? (filterType ? Number(filterType) : undefined) : undefined;
        //   this.redirectToAlertTabWithFilter(filterType ,severityValue ,date);
        // }
      }
    });
  }

  updateSpeed() {
    this.readingSpeed = Math.round((this.speedScore * 180) / 100) - 45;
    this.niddleSpeed = Math.round((this.speedScore * 180) / 100) - 90;
  }

  getSpeed() {
    this.speedScore = this.speedScore;
    this.updateSpeed();
  }
  //  Speed meter chart E

  // Risk Severity chart option S

  RiskSeverity_Highcharts: any = {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      height: 300,
    },
    title: {
      text: '',
      align: 'center',
      verticalAlign: 'middle',
      y: 0,
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E7E7E7',
      borderRadius: 4,
      borderWidth: 1,
      pointFormat: '<b>{point.percentage:}</b>',
      useHTML: true,
      followPointer: false,
      outside: true,
      zIndex: 100,
      formatter: function () {
        const alertSelectedMonth = this.series.chart.options.custom.alertSelectedMonth;
        const typeId = (this.point as any).typeId;
        let color;
        if (typeId == 1) {
          color = "#7ABD7E";
        } else if (typeId == 2) {
          color = "#F8D66E";
        } else if (typeId == 3) {
          color = "#FF6961";
        } else if (typeId == 4) {
          color = "#872000";
        }

        return `<div class="custom-tooltip" style="pointer-events: auto;">
                   <span class="date_txt">${alertSelectedMonth}</span><br>
                   <div class="title_wrap">
                   <span>
                   <i class="fas fa-circle" style="color: ${color}"></i> ${this.name}
                   </span>
                     <span class="green_text ml-2 tooltip-action-risk-severity-pie cursor_pointer ${alertSelectedMonth + '|' + 3 + '|' + typeId}" style="text-decoration: underline">${this.y} alerts</span>
                   </div>
                </div>`;
      }
    },
    plotOptions: {
      pie: {
        shadow: false,
        allowPointSelect: true,
        center: ['50%', '50%'],
        size: '100%',
        innerSize: '80%',
        dataLabels: {
          enabled: true,
          useHTML: true,
          distance: -10,
          zIndex: 1,
          formatter: function () {
            return `<div class="custom-chart-label">
                      <strong>${this.name} (${this.y})</strong><br/>
                     </div>`;
          }
        },
      },
      series: {
        animation: {
          duration: 2000,
        },
        states: {
          hover: {
            enabled: true, // ✅ disables hover effect
          },
        },
      },
    },
    // series: [
    //   {
    //     type: 'pie',
    //     colors: ['#7ABD7E', '#F8D66E', '#FF6961','#872000'],
    //     // data: [
    //     //   ['50% Low (10)', 10],
    //     //   ['14% Medium (4)', 50],
    //     //   ['14% Medium (4)', 10],
    //     //   ['15% Severe (5)', 50],
    //     // ],
    //     borderWidth: 0,
    //   },
    // ],
  }
  // Risk Severity chart option E



  // Risk Severity Timeline chart S

  RiskSeverityTimeline_Highcharts: any = {
    chart: {
      type: 'areaspline',
      height: 300,
      zooming: {
        type: 'y',
        enabled: true,
        mouseWheel: {
          enabled: true,
          type: 'scroll'
        }
      },
      events: {
        load: function () {
          const chart = this;

          chart.series.forEach(series => {
            series.points.forEach(point => {
              const label = point.dataLabel?.element;

              if (label) {
                label.style.cursor = 'pointer';

                label.addEventListener('mouseover', () => {
                  const xIndex = point.x;

                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.x === xIndex && p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      } else if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 0.1;
                      }
                    });
                  });
                });

                label.addEventListener('mouseout', () => {
                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      }
                    });
                  });
                });
              }
            });
          });
        }
      }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [

      ],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,
      allowDecimals: true,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'No. of Alerts',
      },
      gridLineDashStyle: 'longdash',
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false
          }
        },
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        },
        dataLabels: {
          enabled: true,
          borderRadius: 5,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#AAA',
          padding: 4,
          inside: true,
          verticalAlign: 'middle',
          crop: false,
          overflow: 'justify',
          align: 'center',
          allowOverlap: false,
        },
        animation: {
          duration: 100,
        },

      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        const index = this.point.x;
        const alert = this.series.chart.options.custom.severityTimelineGraph[index] || {
          criticalAlert: 0,
          highAlert: 0,
          mediumAlert: 0,
          lowAlert: 0
        };

        return `
            <div class="custom-long-tooltip">
              <p>${this.point.category}</p>
              <div class="tooltip-row">
                <span class="label darkred_label">Critical Risk</span>
                <span class="value tooltip-action-risk-severity-timeline cursor_pointer ${this.point.category + '|' + 3 + '|' + 4}">${alert.criticalAlert || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label orange_label">High Risk</span>
                <span class="value tooltip-action-risk-severity-timeline cursor_pointer ${this.point.category + '|' + 3 + '|' + 3}">${alert.highAlert || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label yellow_label">Medium Risk</span>
                <span class="value tooltip-action-risk-severity-timeline cursor_pointer ${this.point.category + '|' + 3 + '|' + 2}">${alert.mediumAlert || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label green_label">Low Risk</span>
                <span class="value tooltip-action-risk-severity-timeline cursor_pointer ${this.point.category + '|' + 3 + '|' + 1}">${alert.lowAlert || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="value view-link tooltip-action-risk-severity-timeline cursor_pointer ${this.point.category + '|' + 3}">View Alerts</span>
              </div>
            </div>
          `;
      }
    },
    series: [

      // {
      //   data: [7, 7, 7, 9, 9, 8, 8, 8,8,8,7,8],
      //   name: 'Critical',
      //   color: '#872000',
      //   fillColor: '#ebd9d3',
      // },
      // {
      //   data: [6.5, 6, 6, 6, 6, 6, 6, 5,5,5,6,5],
      //   name: 'High',
      //   color: '#FE6961',
      //   fillColor: '#ffdad8',
      // },
      // {
      //   data: [6, 5, 5, 5, 5, 5, 5, 4,4,4,4,4],
      //   name: 'Medium',
      //   color: '#F8D66E',
      //   fillColor: '#feefe1',
      // },
      // {
      //   data: [4, 4, 4, 4, 4, 4, 3, 2,2,2,2,2],
      //   name: 'Low',
      //   color: '#7ABD7E',
      //   fillColor: '#f1f8f1',
      // },
    ],
  };
  // Risk Severity Timeline chart E


  // Risk Category chart option S

  RiskCategory_Highcharts: any = {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      height: 300,
    },
    title: {
      text: '',
      align: 'center',
      verticalAlign: 'middle',
      y: 0,
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#FFFFFF',
      borderColor: '#E7E7E7',
      borderRadius: 4,
      borderWidth: 1,
      pointFormat: '<b>{point.percentage:}</b>',
      useHTML: true,
      followPointer: false,
      outside: true,
      zIndex: 100,
      formatter: function () {
        const alertSelectedMonth = this.series.chart.options.custom.alertSelectedMonth;
        const typeId = (this.point as any).typeId;
        let color;
        if (typeId == 1) {
          color = '#008684';
        } else if (typeId == 2) {
          color = '#C59AFF';
        } else if (typeId == 3) {
          color = '#0095FF';
        } else if (typeId == 4) {
          color = '#FC3E9D';
        } else if (typeId == 5) {
          color = '#6C5498';
        } else if (typeId == 6) {
          color = '#F8D66E';
        } else if (typeId == 7) {
          color = '#FF6961';
        }
        return `<div class="custom-tooltip" style="pointer-events: auto;">
                      <span class="date_txt">${alertSelectedMonth}</span><br>
                      <div class="title_wrap">
                      <span>
                      <i class="fas fa-circle" style="color: ${color}"></i> ${this.name}
                      </span>
                        <span class="green_text ml-2 tooltip-action-risk-category-pie cursor_pointer ${alertSelectedMonth + '|' + 1 + '|' + typeId}" style="text-decoration: underline">${this.y} alerts</span>
                      </div>
                    </div>`;
      }
    },
    plotOptions: {
      pie: {
        shadow: false,
        allowPointSelect: true,
        center: ['50%', '50%'],
        size: '100%',
        innerSize: '80%',
        dataLabels: {
          enabled: true,
          useHTML: true,
          distance: -10,
          zIndex: 1,
          formatter: function () {
            return `<div class="custom-chart-label">
                        <strong>${this.name}  (${this.y})</strong><br/>
                       </div>`;
          }
        },
      },
      series: {
        animation: {
          duration: 2000,
        },
        states: {
          hover: {
            enabled: true, // ✅ disables hover effect
          },
        },
      },
    },
    // series: [
    //   {
    //     type: 'pie',
    //     colors: ['#008684', '#C59AFF', '#F93D9B','#6C5498', '#0095FF'],
    //     data: [
    //       // ['50% Regulatory (10)', 10],
    //       // ['20% Operational & Governance (7)', 50],
    //       // ['10% Legal Violation (10)', 10],
    //       // ['10% Financial Distress (10)', 50],
    //       // ['10% Compliance (10)', 10],
    //     ],
    //     borderWidth: 0,
    //   },
    // ],
  }
  // Risk Category option E


  // Risk Category Timeline chart S

  RiskCategoryTimeline_Highcharts: any = {
    chart: {
      type: 'spline',
      height: 300,
      zooming: {
        type: 'y',
        enabled: true,
        mouseWheel: {
          enabled: true,
          type: 'scroll'
        }
      },
      events: {
        load: function () {
          const chart = this;

          chart.series.forEach(series => {
            series.points.forEach(point => {
              const label = point.dataLabel?.element;

              if (label) {
                label.style.cursor = 'pointer';

                label.addEventListener('mouseover', () => {
                  const xIndex = point.x;

                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.x === xIndex && p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      } else if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 0.1;
                      }
                    });
                  });
                });

                label.addEventListener('mouseout', () => {
                  chart.series.forEach(s => {
                    s.points.forEach(p => {
                      if (p.dataLabel) {
                        p.dataLabel.element.style.opacity = 1;
                      }
                    });
                  });
                });
              }
            });
          });
        }
      }
    },
    title: {
      text: null,
    },
    xAxis: {
      categories: [],
      lineWidth: 0,
      lineColor: 'transparent',
      minorTickLength: 0,
      tickLength: 0,

      allowDecimals: true,
      accessibility: {
        rangeDescription: 'Range: 07 Sep to 18 Sep.',
      },
    },
    yAxis: {
      title: {
        text: 'No. of Alerts',
      },
      gridLineDashStyle: 'longdash',
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: false
          }
        },
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: false
            }
          }
        },
        dataLabels: {
          enabled: true,
          borderRadius: 5,
          backgroundColor: 'rgba(252, 255, 197, 0.7)',
          borderWidth: 2,
          padding: 4,
          y: -1,
          inside: true,
          verticalAlign: 'middle',
          crop: false,
          overflow: 'justify',
          align: 'center',
          allowOverlap: false,
        },
        animation: {
          duration: 5000,
        },

      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      useHTML: true,
      shared: true,
      stickOnContact: true,
      formatter: function () {
        const index = this.point.x;
        const alert = this.series.chart.options.custom.categoryTimelineGraph[index];
        return `
          <div class="custom-long-tooltip">
              <p>${this.point.category}</p>
              <div class="tooltip-row">
                <span class="label darkgreen_label">Credit & Financial</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 1}">${alert["Credit&Financial"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label lightpink_label">Opportunity</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 2}">${alert["Opportunity"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label skyblue_label">Business & Operations</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 3}">${alert["Business&Operations"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label pink_label">Legal & Compliance</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 4}">${alert["Legal&Compliance"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label darkblue_label">Regulatory</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 5}">${alert["Regulatory"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label yellow_label">Reputation</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 6}">${alert["Reputation"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                <span class="label orange_label">Media & News</span>
                <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1 + '|' + 7}">${alert["Media&News"] || 0} alerts</span>
              </div>
              <div class="tooltip-row">
                 <span class="value tooltip-action-risk-category-timeline cursor_pointer ${this.point.category + '|' + 1}">View Alerts</span>
              </div>
            </div>`;
      }
    },
    series: [
      // {
      //   data: [7, 7, 7, 9, 9, 8, 8, 8, 8,7,8,8],
      //   color: '#008684',
      // },
      // {
      //   data: [6.5, 6, 6, 6, 6, 6, 6, 5,5,5,5,5],
      //   color: '#C59AFF',
      // },
      // {
      //   data: [6, 5, 5, 5, 5, 5, 5, 4,4,4,4,4],
      //   color: '#0095FF',
      // },
      // {
      //   data: [4, 4, 4, 4, 4, 4, 3, 2,3,3,3,3],
      //   color: '#FC3E9D',
      // },
      // {
      //   data: [2, 1, 2, 3, 2, 2, 2, 2,2,3,2,2],
      //   color: '#6C5498',
      // },
      // {
      //   data: [4, 4, 4, 4, 4, 4, 3, 2,3,3,3,3],
      //   color: '#F8D66E',
      // },
      // {
      //   data: [2, 1, 2, 3, 2, 2, 2, 2,2,3,2,2],
      //   color: '#FF6961',
      // },
    ]
  };
  // Risk Category Timeline chart E

  fetchedDomainMap: { [domain: string]: boolean } = {};

  callTracxnApis(reqType: any, isIgnoarloader: any) {
    console.log("domainList::::", this.domainList);
    console.log("alreadyFetchdomainList::::", this.alreadyFetchdomainList);

    this.domainList.forEach(domain => {
      if (!this.mainList.includes(domain)) {
        this.mainList.push(domain);
      }
    });

    this.domainList = this.domainList.filter(domain => !this.alreadyFetchdomainList.includes(domain));

    if (this.domainList.length == 0) {
      this.domainList = this.alreadyFetchdomainList;
    }

    this.fetchDomainList = this.mainList.filter(domain => !this.fetchedDomainMap[domain]);

    if (this.fetchDomainList.length == 0) {
      this.fetchDomainList = this.mainList;
    }

    let reqJson;
    if (reqType == 1) {
      if (isIgnoarloader == true) {
        this.isTracxnRefreshing = true;
        this.isLoading = true;
        console.log("this.isLoading:::::::", this.isLoading);
        this.loaderService.subLoaderShow();
        this.refreshDomainList.length = 0;
        this.refreshDomainList.push(this.selectedDomain);

        reqJson = {
          requestApiType: reqType,
          userId: this.userId,
          refValue: this.pan,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          refType: 'TRACXN_ANALYSIS',
          isRefresh: true,
          alreadyFetchDomainList: this.fetchDomainList,
          pan: this.firmDatailsModel?.pan,
          isfromScheduler: 0,
          isCallFromPartOf: false,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              domain: this.refreshDomainList
            }
          }
        };
      } else {
        if (this.domainList.length == 0) {
          return this.commonService.errorSnackBar("Please add domain");
        }
        reqJson = {
          requestApiType: reqType,
          userId: this.userId,
          refValue: this.pan,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          refType: 'TRACXN_ANALYSIS',
          isRefresh: false,
          removeDomainList: this.removeDomainList,
          alreadyFetchDomainList: this.fetchDomainList,
          isCallFromPartOf: false,
          pan: this.firmDatailsModel?.pan,
          isfromScheduler: 0,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              domain: this.domainList
            }
          }
        };
      }



    } else if (reqType == 2) {
      reqJson = {
        requestApiType: reqType,
        userId: this.userId,
        refValue: this.pan,
        cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
        refType: 'TRACXN_ANALYSIS',
        isRefresh: false,
        pan: this.firmDatailsModel?.pan,
        isfromScheduler: 0,
        isCallFromPartOf: false,
        tracxnReqProxy: {
          filter: {
            entityId: [
              this.firmDatailsModel?.cin
            ]
          }
        }
      };
    }
    this.msmeService.callTracxnApis(reqJson, isIgnoarloader).subscribe((res: any) => {
      this.isTracxnRefreshing = false;
      if (res.status == 200) {
        this.showGetDetailsButton = false;
        this.showDropdown = true;
        if (res.data != null) {
          this.getDomain = res.data;
          if (this.getDomain?.length != 0) {
            console.log('');
            // this.domainList = this.getDomain;
            // this.alreadyFetchdomainList = [...this.getDomain];
            this.selectedDomain = this.alreadyFetchdomainList[0];
            this.alreadyFetchdomainList = Array.from(new Set([...this.alreadyFetchdomainList, ...this.getDomain]));
            this.domainList = [];
            this.mainList = [];
            this.domainList = Array.from(new Set([...this.alreadyFetchdomainList, ...this.getDomain]));
          } else {
            if (isIgnoarloader == true) {
              this.selectedDomain = this.refreshDomainList[0];
            } else {
              if (this.removeDomainList.length != 0) {
                this.selectedDomain = this.alreadyFetchdomainList[0];
                this.alreadyFetchdomainList = Array.from(new Set([...this.alreadyFetchdomainList, ...this.domainList]));
                this.domainList = Array.from(new Set([...this.alreadyFetchdomainList, ...this.domainList]));
              } else {
                this.selectedDomain = this.mainList[0];
                this.domainList = [...this.mainList];
                this.alreadyFetchdomainList = [...this.mainList];
              }

            }
          }
        }
        // else{
        //   if(isIgnoarloader == true){
        //     this.selectedDomain = this.refreshDomainList[0];
        //   }else{
        //     this.selectedDomain = this.mainList[0];
        //     this.domainList = [...this.mainList];
        //     this.alreadyFetchdomainList = [...this.mainList];
        //   }
        // }
        setTimeout(() => {
          this.onDomainSelected({ value: this.selectedDomain });
        });
        this.commonService.successSnackBar(res.isDisplayMessage);
      } else {
        this.commonService.errorSnackBar(res.isDisplayMessage)
      }
    });
  }

  toggleIsShowLess() {
    this.isShowLess = !this.isShowLess;
  }

  getDomainList() {
    console.log("Cin:::", this.firmDatailsModel?.cin);
    console.log("Pan:::", this.firmDatailsModel?.pan);
    let reqJson;
    if (this.firmDatailsModel?.cin == undefined) {
      reqJson = {
        cin: this.cin != null ? this.cin : this.pan,
      };
    } else {
      reqJson = {
        cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
      };
    }

    this.msmeService.getDomainList(reqJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.domainList = [...res.listData];
        this.alreadyFetchdomainList = [...res.listData];
        console.log("domainList::::", this.alreadyFetchdomainList);
        if (Number(res?.data) > 0) {
          this.showGetDetailsButton = false;
          this.showDropdown = true;
          this.selectedDomain = this.alreadyFetchdomainList[0];
          this.alreadyFetchdomainList.forEach(domain => {
            this.fetchedDomainMap[domain] = true;
          });
          setTimeout(() => {
            this.onDomainSelected({ value: this.selectedDomain });
          });
        } else if (this.alreadyFetchdomainList.length == 0) {
          this.commonService.warningSnackBar("No Domain Found.");
        } else {
          this.alreadyFetchdomainList.forEach(domain => {
            this.fetchedDomainMap[domain] = false;
          });
        }
      } else if (res.status == 400) {
        this.commonService.warningSnackBar("No Domain Found.");
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  getInnovateBasicDetails(selectedDomain: any) {
    const data: any = {};
    data.domain = selectedDomain;
    if (this.firmDatailsModel?.cin == undefined) {
      data.cin = this.cin != null ? this.cin : this.pan;
    } else {
      data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    }
    data.isCompany = 0;
    this.isLoading = true;
    console.log("this.isLoading:::::::", this.isLoading);
    this.loaderService.subLoaderShow();
    this.msmeService.getInnovateBankingDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.data) {
        this.innovateBankingDetails = res.data;
        this.tracxnBusinessAndCoveragePage.totalSize = this.innovateBankingDetails?.tracxnBusinessModelAndCoverageAreaDetails?.length;
        console.log("innovateBankingDetails::::", this.innovateBankingDetails);
        this.tracxnEmployeePage.pageSize = signal(5);
        this.tracxnFacilitorPage.pageSize = signal(5);
        this.tracxnInvestorPage.pageSize = signal(5);
        this.tracxnBusinessAndCoveragePage.pageSize = signal(5);
        this.tracxnInvestorProfileDetailsPage.pageSize = signal(5);

        // Parallel calls
        forkJoin([
          this.getAllBusinessAndCoverageDetails(),
          this.getAllEmployeeDetails(),
          this.getAllInvestorDetails(),
          this.getAllFacilitors(),
          this.getAllFundingRoundListDetails(),
          this.getAllTracxnFundingVentureDebtDetails(),
          this.getAllTracxnFundingBuyOutDetails()
        ]).subscribe({
          next: () => {
            this.loaderService.subLoaderHide();
            this.isLoading = false;
          },
          error: (err) => {
            console.error(err);
            this.loaderService.subLoaderHide();
            this.isLoading = false;
          }
        });

      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  getAllBusinessAndCoverageDetails() {
    const data: any = {};
    data.pageSize = this.tracxnBusinessAndCoveragePage.pageSize();
    data.pageIndex = this.tracxnBusinessAndCoveragePage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    this.msmeService.getAllBusinessandCoverageDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.litOfBusinessAndCoverageDetails = res.listData;
          this.tracxnBusinessAndCoveragePage.totalSize = res.data;
          console.log("litOfBusinessAndCoverageDetails::::", this.litOfBusinessAndCoverageDetails);
        } else {
          this.litOfBusinessAndCoverageDetails = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllEmployeeDetails() {
    const data: any = {};
    data.pageSize = this.tracxnEmployeePage.pageSize();
    data.pageIndex = this.tracxnEmployeePage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllEmployeeDetails(data).subscribe((res: any) => {
      if (res.status == 200) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfEmployeeDetailsData = res.listData;
          this.tracxnEmployeePage.totalSize = res.data;
          console.log("listOfEmployeeDetailsData::::", this.listOfEmployeeDetailsData);
        } else {
          this.listOfEmployeeDetailsData = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllInvestorDetails() {
    const data: any = {};
    data.pageSize = this.tracxnInvestorPage.pageSize();
    data.pageIndex = this.tracxnInvestorPage.page() - 1;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.domain = this.selectedDomain;
    data.isCompany = 0;
    this.msmeService.getAllInvestorDetails(data).subscribe((res: any) => {
      if (res.status == 200) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfinvestorDetailsData = res.listData;
          this.tracxnInvestorPage.totalSize = res.data;
          console.log("listOfinvestorDetailsData::::", this.listOfinvestorDetailsData);
        } else {
          this.listOfinvestorDetailsData = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message);
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllFacilitors() {
    const data: any = {};
    data.pageSize = this.tracxnFacilitorPage.pageSize();
    data.pageIndex = this.tracxnFacilitorPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllFacilitorsDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfFacilitorsData = res.listData;
          this.tracxnFacilitorPage.totalSize = res.data;
          console.log("listOfFacilitorsData::::", this.listOfFacilitorsData);
        } else {
          this.listOfFacilitorsData = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllFundingRoundListDetails() {
    const data: any = {};
    data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
    data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllFundingRoundListDetailsDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfFundingRoundListdetails = res.listData;
          this.tracxnFundingRoundListDetailsPage.totalSize = res.data;
          console.log("listOfFundingRoundListdetails::::", this.listOfFundingRoundListdetails);
        } else {
          this.listOfFundingRoundListdetails = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllTracxnFundingVentureDebtDetails() {
    const data: any = {};
    data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
    data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllTracxnFundingVentureDebtDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfFundingRoundVentureDebtListdetails = res.listData;
          this.tracxnFundingVentureDebtPage.totalSize = res.data;
          console.log("listOfFundingRoundVentureDebtListdetails::::", this.listOfFundingRoundVentureDebtListdetails);
        } else {
          this.listOfFundingRoundVentureDebtListdetails = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllTracxnFundingBuyOutDetails() {
    const data: any = {};
    data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
    data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllTracxnFundingBuyOutDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfFundingRoundBuyOutListdetails = res.listData;
          this.tracxnFundingBuyOutPage.totalSize = res.data;
          console.log("listOfFundingRoundBuyOutListdetails::::", this.listOfFundingRoundBuyOutListdetails);
        } else {
          this.listOfFundingRoundBuyOutListdetails = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  Funding_Round_popup(): void {
    const dialogRef = this.dialog.open(FundingRoundPopupComponent, {
      data: {
        pageSize: this.tracxnFundingRoundListDetailsPage.totalSize,
        listData: this.listOfFundingRoundListdetails,
        pageSizeVenturesize: this.tracxnFundingVentureDebtPage.totalSize,
        ventureDebtListData: this.listOfFundingRoundVentureDebtListdetails,
        pageSizeBuyOutsize: this.tracxnFundingBuyOutPage.totalSize,
        buyOutListData: this.listOfFundingRoundBuyOutListdetails,
        domain: this.selectedDomain,
        cinnumber: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
        isFrom: 0,
      },
      panelClass: ['popupMain_design', 'export_popup'],
    });
  }

  getAllCompetitor() {
    const data: any = {};
    data.pageSize = this.tracxnCompetitorPage.pageSize();
    data.pageIndex = this.tracxnCompetitorPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllCompetitor(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfCompetitor = res.listData;
          this.tracxnCompetitorPage.totalSize = res.data;
          console.log("listOfCompetitor::::", this.listOfCompetitor);
        } else {
          this.listOfCompetitor = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllAquiredCompanies() {
    const data: any = {};
    data.pageSize = this.tracxnAquiredPage.pageSize();
    data.pageIndex = this.tracxnAquiredPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllAquiredCompanies(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData && res?.listData?.length != 0) {
          this.listOfAquiredCompanies = res.listData;
          this.tracxnAquiredPage.totalSize = res.data;
          console.log("listOfAquiredCompanies::::", this.listOfAquiredCompanies);
          this.loaderService.subLoaderHide();
          this.isLoading = false;
        } else {
          this.listOfAquiredCompanies = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  getAllAssociatedEntities(type: any, fetchDetails: any) {
    const data: any = {};
    data.pageSize = this.tracxnAssociatedEntitiesPage.pageSize();
    data.pageIndex = this.tracxnAssociatedEntitiesPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    data.isFrom = type;
    data.id = fetchDetails.id;
    this.msmeService.getAllTracxnAssociatedEntitiesDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if (res?.listData) {
          this.listOfAssociatedEntitiesDetails = res.listData;
          this.tracxnAssociatedEntitiesPage.totalSize = res.data;
          console.log("listOfPartOfCompanies::::", this.listOfAssociatedEntitiesDetails);
          if (this.dialog.openDialogs.length === 0) {
            const dialogRef = this.dialog.open(AssociatedLegalEntitiesPopupComponent, {
              data: {
                pageSize: this.tracxnAssociatedEntitiesPage.totalSize,
                listData: this.listOfAssociatedEntitiesDetails,
                domain: this.selectedDomain,
                cinnumber: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
                isFrom: type
              },
              panelClass: ['popupMain_design'],
            });
          }
        } else {
          this.listOfAssociatedEntitiesDetails = [];
        }
        this.getAllParOfCompanies();
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      console.log(error);
    };
  }

  getAllParOfCompanies() {
    const data: any = {};
    data.pageSize = this.tracxnPartofPage.pageSize();
    data.pageIndex = this.tracxnPartofPage.page() - 1;
    data.domain = this.selectedDomain;
    data.cin = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
    data.isCompany = 0;
    this.msmeService.getAllPartOfCompanies(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        if (res?.listData && res?.listData.length != 0) {
          this.listOfPartOfCompanies = res.listData;
          this.tracxnPartofPage.totalSize = res.data;
          console.log("listOfPartOfCompanies::::", this.listOfPartOfCompanies);
        } else {
          this.listOfPartOfCompanies = [];
        }
      } else {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      this.loaderService.subLoaderHide();
      this.isLoading = false;
      console.log(error);
    };
  }

  refreshTracxnApis() {
    const data: any = {};
    data.domain = this.selectedDomain;
    this.msmeService.refreshTracxnApi(data).subscribe((res: any) => {
      if (res.status == 200 && res?.flag == true) {
        this.callTracxnApis(1, true);
      } else if (res.status == 208 && res?.flag == false) {
        this.commonService.warningSnackBar("Api already called inside 30 days");
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error => {
      console.log(error);
    };
  }


  removeDomain(index: number): void {
    if (this.domainList?.length > index) {
      const domain = this.domainList[index];
      this.domainList.splice(index, 1);
      this.alreadyFetchdomainList.splice(index, 1);
      this.removeDomainList.push(domain);
      if (this.domainList.length != 0) {
        this.onDomainSelected({ value: this.domainList[0] });
      } else {
        this.showDropdown = false;
        this.selectedDomain = '';
      }
    }
  }

  addDomain(): void {
    const domain = this.newDomain?.trim().toLowerCase();
    this.errorDomainMessage = '';


    if (!domain) {
      this.errorDomainMessage = 'Domain cannot be empty.';
      return;
    }

    const inputDomains = this.newDomain.split(',').map(domain => domain.trim().toLowerCase()).filter(domain => domain);

    for (const domain of inputDomains) {
      if (domain.includes('https') || domain.includes('/') || domain.includes('www')) {
        this.newDomain = '';
        this.errorDomainMessage = `Please enter a clean domain (no https, www, or slashes) for domain: ${domain}.`;
        return;
      }

      const isValid = this.validDomainExtensions.some(ext => domain.endsWith(ext));
      if (!isValid) {
        this.newDomain = '';
        this.errorDomainMessage = `Domain must end with a valid extension (e.g., .com, .org, .io) for domain: ${domain}.`;
        return;
      }

      if (this.domainList.includes(domain)) {
        this.newDomain = '';
        this.errorDomainMessage = `This domain is already added: ${domain}.`;
        return;
      }

      this.domainList.push(domain);
      this.newDomain = '';
    }
  }

  onDomainSelected(event: any) {
    const selectedDomain = event.value;
    this.selectedDomain = selectedDomain;
    // this.selectedDomainDetails= this.getInnovateBasicDetails(selectedDomain);
    this.onNewAgeEconomySubTabChange(this.newAgeEconomySelectedSubTab);
    // this.getCommercialData();
  }


  //As per Old Investor Api calling
  profileDetailsDialog(selectDomain: any, type: any) {

    if (selectDomain?.investorProfileStatus === 'Success') {
      this.investorProfileSuccessMap[selectDomain.id] = true;
    }
    if (selectDomain?.investorProfileStatus === 'Pending' || selectDomain?.investorProfileStatus == null || Object.keys(this.investorProfileSuccessMap).length === 0) {
      let reqJson;

      if (type == 1) {
        this.investorProfileProgressMap[selectDomain.id] = true;
        reqJson = {
          requestApiType: 4,
          userId: this.userId,
          refValue: this.pan,
          refType: 'TRACXN_ANALYSIS',
          domain: selectDomain.investorDomain,
          selectedDomain: this.selectedDomain,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          isFrom: 1,
          tracxnReqProxy: {
            filter: {
              investorDomainName: [
                selectDomain.investorDomain
              ]
            }
          }
        };
      } else if (type == 2) {
        this.investorProfileProgressMap[selectDomain.id] = true;
        reqJson = {
          requestApiType: 4,
          userId: this.userId,
          refValue: this.pan,
          refType: 'TRACXN_ANALYSIS',
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          domain: selectDomain.domainName,
          selectedDomain: this.selectedDomain,
          isFrom: 2,
          tracxnReqProxy: {
            filter: {
              investorDomainName: [
                selectDomain.domainName
              ]
            }
          }
        };
      }
      this.msmeService.callInvestorApi(reqJson).subscribe((res: any) => {
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            this.investorProfileProgressMap[selectDomain.id] = true;
          } if (res?.isDisplayMessage === 'Success') {
            this.investorProfileProgressMap[selectDomain.id] = false;
            this.investorProfileSuccessMap[selectDomain.id] = true;
            selectDomain.investorProfileStatus = "Success";

          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
        }
      });
    }

    if (selectDomain?.investorProfileStatus === 'Success' || this.investorProfileSuccessMap[selectDomain.id]) {
      selectDomain.isFrom = type;
      selectDomain.selectedDomain = this.selectedDomain
      selectDomain.cinnumber = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
      this.getInnovateProfileBasicDetails(selectDomain);
    }
  }



  clickonDomainDialog(investCompaniesData: any, type: any) {
    console.log("investorCompanySuccessMap:::", this.investorCompanySuccessMap);
    if (investCompaniesData?.investorCompanyStatus === 'Success') {
      this.investorCompanySuccessMap[investCompaniesData.id] = true;
      investCompaniesData.isFrom = type;
      investCompaniesData.selectedDomain = this.selectedDomain
      investCompaniesData.cinnumber = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
      investCompaniesData.pan = this.firmDatailsModel?.pan;
      investCompaniesData.userId = this.userId;
      investCompaniesData.isPage = 1;
      investCompaniesData.selectedDomainId = this.innovateBankingDetails?.id;
      investCompaniesData.isPage = 1;
      this.router.navigate(['/hsbc/investeeCompanyDetails'], { queryParams: investCompaniesData, state: { routerData: this.routerData, data: history?.state?.data } });
    }

    if (investCompaniesData?.investorCompanyStatus === 'Pending' || investCompaniesData?.investorCompanyStatus == null || Object.keys(this.investorCompanySuccessMap).length === 0) {
      let reqJson;
      this.investorCompanyProgressMap[investCompaniesData.id] = true;
      reqJson = {
        requestApiType: 1,
        userId: this.userId,
        refValue: this.pan,
        cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
        refType: 'TRACXN_ANALYSIS',
        domain: investCompaniesData?.domain,
        selectedDomain: this.selectedDomain,
        isCallFromPartOf: false,
        isFrom: type,
        isMainInvesteeCompanyCall: 1,
        isInvestorProfile: 2,
        tracxnReqProxy: {
          sort: [
            {
              sortField: 'relevance',
              order: 'DEFAULT'
            }
          ],
          filter: {
            domain: [investCompaniesData?.domain]
          }
        }
      };
      this.msmeService.callCompanyApi(reqJson).subscribe((res: any) => {
        this.investorCompanyProgressMap[investCompaniesData.id] = false;
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            investCompaniesData.investorCompanyStatus = "Pending";
          } if (res?.isDisplayMessage === 'Success') {
            this.investorCompanySuccessMap[investCompaniesData.id] = true;
            investCompaniesData.investorCompanyStatus = "Success";
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
          investCompaniesData.investorCompanyStatus = "Pending";
        }
      })
    }
  }

  investeeCompaniesDialogNew(investCompaniesData: any, type: any) {
    console.log("investorCompanySuccessMap:::", this.investorCompanySuccessMap);
    if (investCompaniesData?.investorCompanyStatus === 'Success') {
      this.investorCompanySuccessMap[investCompaniesData.id] = true;
      investCompaniesData.isFrom = type;
      investCompaniesData.selectedDomain = this.selectedDomain
      investCompaniesData.cinnumber = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
      investCompaniesData.pan = this.firmDatailsModel?.pan;
      investCompaniesData.userId = this.userId;
      investCompaniesData.isPage = 1;
      investCompaniesData.selectedDomainId = this.innovateBankingDetails?.id;
      this.router.navigate(['/hsbc/investee-companies'], { queryParams: investCompaniesData, state: { routerData: this.routerData, data: history?.state?.data } });
    }

    if (investCompaniesData?.investorCompanyStatus === 'Pending' || investCompaniesData?.investorCompanyStatus == null || Object.keys(this.investorCompanySuccessMap).length === 0) {
      let reqJson;
      if (type == 1) {
        this.investorCompanyProgressMap[investCompaniesData.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.userId,
          refValue: this.pan,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          refType: 'TRACXN_ANALYSIS',
          domain: investCompaniesData?.investorDomain,
          selectedDomain: this.selectedDomain,
          isCallFromPartOf: false,
          isFrom: type,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              institutionalInvestorDomain: [investCompaniesData?.investorDomain],
              companyStage: ["Unfunded All", "Funded", "Public", "Acquisition"],
              country: ["India"]
            },
            from: 0,
            size: 100
          }
        };
      } else if (type == 2) {
        this.investorCompanyProgressMap[investCompaniesData.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.userId,
          refValue: this.pan,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          refType: 'TRACXN_ANALYSIS',
          domain: investCompaniesData?.domainName,
          selectedDomain: this.selectedDomain,
          isCallFromPartOf: false,
          isFrom: type,
          tracxnReqProxy: {
            sort: [
              {
                sortField: 'relevance',
                order: 'DEFAULT'
              }
            ],
            filter: {
              fundingRoundFacilitators: [investCompaniesData?.domainName],
              companyStage: ["Unfunded All", "Funded", "Public", "Acquisition"],
              country: ["India"]
            },
            from: 0,
            size: 100
          }
        };
      }
      this.msmeService.callTracxnInvesteeCompaniesApi(reqJson, true).subscribe((res: any) => {
        this.investorCompanyProgressMap[investCompaniesData.id] = false;
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            investCompaniesData.investorCompanyStatus = "Pending";
          } if (res?.isDisplayMessage === 'Success') {
            this.investorCompanySuccessMap[investCompaniesData.id] = true;
            investCompaniesData.investorCompanyStatus = "Success";
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
          investCompaniesData.investorCompanyStatus = "Pending";
        }
      })
    }
  }


  investeeProfileDialog(selectDomain: any, type: any) {

    if (selectDomain?.investorProfileStatus === 'Success') {
      this.investorProfileSuccessMap[selectDomain.id] = true;
    }
    if (selectDomain?.investorProfileStatus === 'Pending' || selectDomain?.investorProfileStatus == null || Object.keys(this.investorProfileSuccessMap).length === 0) {
      let reqJson;

      if (type == 1) {
        this.investorProfileProgressMap[selectDomain.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.userId,
          refValue: this.pan,
          refType: 'TRACXN_ANALYSIS',
          domain: selectDomain.investorDomain,
          selectedDomain: this.selectedDomain,
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          isFrom: 1,
          isCallFromPartOf: false,
          isInvestorProfile: 1,
          isMainInvesteeCompanyCall: 1,
          tracxnReqProxy: {
            filter: {
              domain: [
                selectDomain.investorDomain
              ]
            }
          }
        };
      } else if (type == 2) {
        this.investorProfileProgressMap[selectDomain.id] = true;
        reqJson = {
          requestApiType: 1,
          userId: this.userId,
          refValue: this.pan,
          refType: 'TRACXN_ANALYSIS',
          cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
          domain: selectDomain.domainName,
          selectedDomain: this.selectedDomain,
          isFrom: 2,
          isCallFromPartOf: false,
          isInvestorProfile: 1,
          isMainInvesteeCompanyCall: 1,
          tracxnReqProxy: {
            filter: {
              domain: [
                selectDomain.domainName
              ]
            }
          }
        };
      }
      this.msmeService.callCompanyApi(reqJson).subscribe((res: any) => {
        this.investorProfileProgressMap[selectDomain.id] = false;
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            selectDomain.investorProfileStatus = "Pending";
          } if (res?.isDisplayMessage === 'Success') {
            this.investorProfileSuccessMap[selectDomain.id] = true;
            selectDomain.investorProfileStatus = "Success";
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
          selectDomain.investorProfileStatus = "Pending";
        }
      });
    }

    if (selectDomain?.investorProfileStatus === 'Success' || this.investorProfileSuccessMap[selectDomain.id]) {
      selectDomain.isFrom = type;
      selectDomain.selectedDomain = this.selectedDomain
      selectDomain.cinnumber = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
      selectDomain.pan = this.firmDatailsModel?.pan;
      selectDomain.isPage = 1;
      this.router.navigate(['/hsbc/investeeCompanyDetails'], { queryParams: selectDomain, state: { routerData: this.routerData, data: history?.state?.data } });

    }

  }

  partofDetailsDialog(partOfdetails: any) {
    if (partOfdetails?.investorCompanyStatus === 'Success') {
      this.partCompanySuccessMap[partOfdetails.id] = true;
    }
    if (partOfdetails?.investorCompanyStatus === 'Pending' || partOfdetails?.investorCompanyStatus == null || Object.keys(this.partOfCompanyProgressMap).length === 0) {
      this.partOfCompanyProgressMap[partOfdetails.id] = true;
      const reqJson = {
        requestApiType: 1,
        userId: this.userId,
        selectedDomain: this.selectedDomain,
        domain: partOfdetails?.domain,
        refValue: this.pan,
        cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
        refType: 'TRACXN_ANALYSIS',
        isCallFromPartOf: true,
        isMainInvesteeCompanyCall: 1,
        tracxnReqProxy: {
          sort: [
            {
              sortField: 'relevance',
              order: 'DEFAULT'
            }
          ],
          filter: {
            domain: [partOfdetails?.domain]
          }
        }
      };
      this.msmeService.callCompanyApi(reqJson).subscribe((res: any) => {
        this.partOfCompanyProgressMap[partOfdetails.id] = false;
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            partOfdetails.investorCompanyStatus = 'Pending'
          } if (res?.isDisplayMessage === 'Success') {
            this.getAllParOfCompanies();
            this.partCompanySuccessMap[partOfdetails.id] = true;
            partOfdetails.investorCompanyStatus = 'Success'
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
          partOfdetails.investorCompanyStatus = 'Pending'
        }
      });
    }

    if (partOfdetails?.investorProfileStatus === 'Success' || this.partCompanySuccessMap[partOfdetails.id]) {
      partOfdetails.selectedDomain = this.selectedDomain
      partOfdetails.cinnumber = this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan;
      partOfdetails.pan = this.firmDatailsModel?.pan;
      partOfdetails.isFrom = 5;
      partOfdetails.isPage = 1;
      this.router.navigate(['/hsbc/investeeCompanyDetails'], { queryParams: partOfdetails, state: { routerData: this.routerData, data: history?.state?.data } });
    }
  }

  associated_Entities_popup(fetchDetails: any, type: any) {

    if (fetchDetails?.associatedEntitiesStatus === 'Success') {
      this.associatedEntitieSuccessMap[fetchDetails.id] = true;
    }

    if (fetchDetails?.associatedEntitiesStatus === 'Pending' || fetchDetails?.associatedEntitiesStatus == null || Object.keys(this.associatedEntitieSuccessMap).length === 0) {

      this.associatedEntitiesProgressMap[fetchDetails.id] = true;
      const reqJson = {
        requestApiType: 2,
        userId: this.userId,
        refValue: this.pan,
        selectedDomain: this.selectedDomain,
        cin: this.firmDatailsModel?.cin != null ? this.firmDatailsModel?.cin : this.firmDatailsModel?.pan,
        refType: 'TRACXN_ANALYSIS',
        domain: fetchDetails?.domain,
        id: fetchDetails?.id,
        isFrom: type,
        tracxnReqProxy: {
          filter: {
            associationsName: [
              fetchDetails?.domain
            ]
          }
        }
      };

      this.msmeService.callTracxnAssociatedEntitiesApi(reqJson, true).subscribe((res: any) => {
        if (res.status == 200) {
          if (res?.isDisplayMessage === 'Pending') {
            this.associatedEntitiesProgressMap[fetchDetails.id] = false;
          } if (res?.isDisplayMessage === 'Success') {
            if (type == 3) {
              this.getAllCompetitor();
            } else if (type == 4) {
              this.getAllParOfCompanies();
            }
            this.associatedEntitiesProgressMap[fetchDetails.id] = false;
            this.associatedEntitieSuccessMap[fetchDetails.id] = true;
          }
        } else {
          this.commonService.errorSnackBar(res.isDisplayMessage)
        }
      });
    }

    if (fetchDetails?.associatedEntitiesStatus === 'Success' || this.associatedEntitieSuccessMap[fetchDetails.id]) {
      this.getAllAssociatedEntities(type, fetchDetails);
    }
  }

  getPartOfInnovateBasicDetails(selectDomain: any) {
    const reqJson = {
      domain: this.selectedDomain,
      cin: this.firmDatailsModel?.cin,
      isCompany: 0
    };
    this.msmeService.getPartOfInnovateBankingDetails(reqJson).subscribe((res: any) => {
      if (res.status == 200 && res?.data) {
        this.innovateBankingDetails = res.data;
        console.log("innovateBankingDetails::::", this.innovateBankingDetails);
        this.domainList.push(selectDomain);
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  formatToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '-';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr; // fallback
    const [month, day, year] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }

  getInnovateProfileBasicDetails(profileData: any) {
    let reqJson;
    if (profileData?.isFrom == 1) {
      reqJson = {
        domain: profileData?.investorDomain,
        cin: profileData?.cinnumber,
        selectedDomain: profileData?.selectedDomain,
        isFrom: profileData?.isFrom,
        pageSize: this.tracxnInvestorProfileDetailsPage.pageSize(),
        pageIndex: this.tracxnInvestorProfileDetailsPage.page() - 1,
      };
    } else {
      reqJson = {
        domain: profileData?.domainName,
        cin: profileData?.cinnumber,
        selectedDomain: profileData?.selectedDomain,
        isFrom: profileData?.isFrom,
        pageSize: this.tracxnInvestorProfileDetailsPage.pageSize(),
        pageIndex: this.tracxnInvestorProfileDetailsPage.page() - 1,
      };
    }
    this.msmeService.getInvestorProfileDetails(reqJson).subscribe((res: any) => {
      if (res.status == 200 && res?.data) {
        this.innovateProfileDetails = res.data;
        if (this.dialog.openDialogs.length === 0) {
          const dialogRef = this.dialog.open(ProfileDetailsPopupComponent, {
            panelClass: 'popupMain_design',
            data: {
              profileDetails: this.innovateProfileDetails,
              relatedData: profileData,
            }
          });
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  parseFloatValue(value: any): number {
    return parseFloat(value);
  }


  getLeadingIndicatorsDetails() {

    const data: any = {};
    data.cin = this.cin;
    data.pan = this.pan;
    data.domainName = this.selectedDomain;
    data.fromDate = this.selectedDate;
    data.pageIndex = this.page - 1;
    data.size = this.pageSize;
    console.log("========>", this.cin);
    this.isLoading = true;
    this.loaderService.subLoaderShow()
    this.msmeService.getLeadingIndicator(data).subscribe(res => {
      console.log("=====>", res);
      this.loaderService.subLoaderHide();
      this.isLoading = false
      if (res?.status == 200) {
        if (res?.listData && res?.listData?.length > 0) {
          this.indicators = res.listData;
          this.totalSize = res?.data
        }
        else {
          this.totalSize = 0;
          this.indicators = [];
        }
      } else {
        this.indicators = [];
        this.commonService.errorSnackBar(res.message);
      }
    });
    // this.applyDateFilters(this.selectedDays);
  }

  dateFilters = [
    { label: 'All', value: 'All' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 60 days', value: '60' },
    { label: 'Last 90 days', value: '90' }
  ];

  onDateFilterChange(value) {
    console.log("Value ", value);

    this.selectedDays = value;

    const daysToSubtract = value == 'All' ? 90 : +value;
    console.log("daysToSubtract  ", daysToSubtract);
    const pastDate = this.getPastDateAsDate(daysToSubtract);
    this.selectedDate = this.formatDate1(pastDate.getDate()) + "/" + this.formatDate1(pastDate.getMonth() + 1) + "/" + pastDate.getFullYear();
    this.getLeadingIndicatorsDetails();

    this.getCommercialData();
  }

  getPastDateAsDate(days: number): Date {
    const currentDate = new Date();
    const pastDate = new Date(currentDate);
    pastDate.setDate(currentDate.getDate() - days);
    return pastDate;
  }


  formatDate1(val) {
    if (val.toString().length < 2) {
      return "0" + val;
    } else {
      return val;
    }
  }

  getCommercialData() {
    const data: any = {};
    if (this.pan && typeof this.pan === 'string') {
      data.pan = this.pan.toUpperCase();
    } else {
      console.warn('PAN is missing or invalid:', this.pan);
      return;
    }

    this.msmeService.getcommercialData(data).subscribe(response => {
      if (response) {
        this.commercialData = response;
        // this.callTracxnApis(1,true);
        console.log("This commercial Data :: {} ", this.commercialData)

        console.log("Get Commerical Data {} :: ", response);
      } else {
        console.log();
      }

      this.cmrScore = this.commercialData?.cmrScore;
      this.bureauVintage = this.commercialData?.bureauVintage;
      this.totalLenders = this.commercialData?.totalLenders;

      this.borrowerInformation = this.commercialData?.borrowerInformation;
      this.additionalDetails = this.commercialData?.additionalDetails;
      this.numberOfInquiriesOutsideInstitution = this.commercialData?.numberOfInquiriesOutsideInstitution;
      this.outStandingBalanceBasedOnAssetsClassification = this.commercialData?.outStandingBalanceBasedOnAssetsClassification;
      this.outStandingBalanceBasedOnAssetsClassificationNew = this.commercialData?.outStandingBalanceBasedOnAssetsClassificationNew;
      if (this.outStandingBalanceBasedOnAssetsClassification) {
        this.calculateTotals()
      }
      this.productWiseDetailsNew6 = this.commercialData?.productWiseDetaResponcesLatest6Months;
      this.productWiseDetailsOld6 = this.commercialData?.productWiseDetaResponcesOld6Months;
      if (this.productWiseDetailsNew6) {
        this.calculateTotalForProductWiseDetails()
      }
      // this.productWisePagination.totalSize = this.productWiseDetailsNew6?.length;
      // Initialize pagination
      // if (!this.commonService.isObjectNullOrEmpty(this.productWiseDetailsNew6)) {
      //   this.updatePaginatedData();
      // }


      this.defaultData = this.commercialData?.defaultData;
      // this.defaultDataPagination.totalSize = this.defaultData?.length;
      // if (!this.commonService.isObjectNullOrEmpty(this.defaultData)) {
      //   this.updatePaginatedDataDefaultData();
      //       }
      this.dpdDetail = this.commercialData?.dpdDetail;

      // console.log("")
      // console.log("")
      // console.log("")
      console.log("DPD DETAILS ::: ", this.dpdDetail)
      // console.log("")
      // console.log("")
      // console.log("")
    });
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

    console.log("this.productWiseDetailsNew6", this.productWiseDetailsNew6);


    for (let item of this.productWiseDetailsNew6) {
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

  // updatePaginatedData(): void {
  //   // this.productWisePaginationData = this.paginationService.paginate(this.productWiseDetailsNew6, this.productWisePagination?.pageSize, this.productWisePagination?.page);
  // }

  // updatePaginatedDataDefaultData(): void {
  //   // this.defaultDataPaginationData = this.paginationService.paginate(this.defaultData, this.defaultDataPagination?.pageSize, this.defaultDataPagination?.page);
  // }

  // DefaultDataChangePage(page: number): void {
  //   this.defaultDataPagination.startIndex = (page - 1) * this.defaultDataPagination.pageSize;
  //   this.defaultDataPagination.endIndex = (page - 1) * this.defaultDataPagination.pageSize + this.defaultDataPagination.pageSize;
  //   this.defaultDataPagination.page = page;
  //   this.updatePaginatedDataDefaultData();
  // }


  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getLeadingIndicatorsDetails();
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getLeadingIndicatorsDetails();
  }

  resetTime(date: Date): Date {
    const resetDate = new Date(date);
    resetDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
    return resetDate;
  }


  orderCrisilData() {
    const data = {
      cin: this.cin,
      pan: this.pan,
      isRetry: this.isRetry,
    };

    console.log('Crisil Request Data: ', data);

    this.msmeService.orderCrisilData(data).subscribe((response) => {
      console.log('Crisil api response: ', response);

      if (response) {
        const fetchDateTime = response?.fetchDateTime;
        if (!this.commonService.isObjectNullOrEmpty(fetchDateTime) || fetchDateTime != undefined) {
          const date = new Date(fetchDateTime);

          const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          } as const;

          // Set lastRefreshedDate
          this.lastRefreshedDate = date.toLocaleDateString('en-GB', options);

          // Calculate new order available date (+30 days)
          const newOrderDate = new Date(date);
          newOrderDate.setDate(newOrderDate.getDate() + 30);
          this.newOrderAvailableDate = newOrderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        this.retryOptionEnabled = response?.retryOptionEnabled;

        // if(response?.statusCode==404){
        //   this.tooltipMessage="Your order is under process, please check-in after 2 days";
        //   this.commonService.infoSnackBar("Company not in CRISIL Coverage, Your Order is placed");
        // }

        if (response?.statusCode == 404) {
          const currentDate = new Date();
          let days = this.isRetryOptionalEnabledExcludeNWD(fetchDateTime, currentDate, 2);

          if (days <= 0) {
            this.tooltipMessage = "Order Now!";
          } else {
            const dayText = days === 1 ? "working day" : "working days";
            this.tooltipMessage = "Your order is under process, please check-in after " + days + " " + dayText;
          }
          this.commonService.infoSnackBar("Company not in CRISIL Coverage, Your Order is placed");
        }

        else if (response?.statusCode == 400) {
          this.tooltipMessage = "Order cannot be placed: product subscription is missing or CRISIL data not found.";
          this.commonService.infoSnackBar("Product Subscription not present");
          this.isRetry = true;
        }

        else if (response?.statusCode == 204) {
          this.tooltipMessage = "Invalid CIN/PAN";
          this.commonService.infoSnackBar("Crisil Data Not Found for provided CIN/PAN number");
          this.isRetry = false;
        }

        else if (response?.statusCode == 500) {
          this.tooltipMessage = "Try again after some time";
          this.commonService.errorSnackBar("Failed");
          this.isRetry = false;
        }

        else if (response?.statusCode == 200 || response?.statusCode == 206) {
          if (response?.statusCode == 206) {
            this.isRetry = true;
          }

          this.crisilData = response?.tpApiResponse;
          this.processCrisilResponse(this.crisilData);
          this.tooltipMessage = "You can place a new order on or after " + (this.newOrderAvailableDate || "NA");
          this.commonService.successSnackBar("Data received successfully");
        }
      }
    });
  }

  getCrisilDataFromDB() {
    const data = {
      cin: this.cin,
      pan: this.pan,
      isRetry: false,
    };

    console.log('Crisil Request Data From DB: ', data);

    this.msmeService.getCrisilDataFromDB(data).subscribe((response) => {
      console.log('Crisil api response from db: ', response);

      if (response) {
        const fetchDateTime = response?.fetchDateTime;
        if (!this.commonService.isObjectNullOrEmpty(fetchDateTime) || fetchDateTime != undefined) {
          const date = new Date(fetchDateTime);

          const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          } as const;

          this.lastRefreshedDate = date.toLocaleDateString('en-GB', options);

          // Calculate new order available date (+30 days)
          const newOrderDate = new Date(date);
          newOrderDate.setDate(newOrderDate.getDate() + 30);
          this.newOrderAvailableDate = newOrderDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        this.retryOptionEnabled = response?.retryOptionEnabled;
        // this.retryOptionEnabled=true;

        if (response?.statusCode == 404) {
          const currentDate = new Date();
          let days = this.isRetryOptionalEnabledExcludeNWD(fetchDateTime, currentDate, 2);

          if (days <= 0) {
            this.tooltipMessage = "Order Now!";
          } else {
            const dayText = days === 1 ? "working day" : "working days";
            this.tooltipMessage = "Your order is under process, please check-in after " + days + " " + dayText;
          }
        }

        else if (response?.statusCode == 204) {
          this.tooltipMessage = "Invalid CIN/PAN";
          this.isRetry = false;
        }

        else if (response?.statusCode == 500) {
          this.tooltipMessage = "Try again after some time";
          this.isRetry = false;
        }

        else if (response?.statusCode == 200 || response?.statusCode == 206) {

          if (response?.statusCode == 206) {
            this.isRetry = true;
          }

          this.crisilData = response?.tpApiResponse;
          this.processCrisilResponse(this.crisilData);
          this.tooltipMessage = "You can place a new order on or after " + (this.newOrderAvailableDate || "NA");
        }
      }
    });
  }


  private processCrisilResponse(data: any[]) {
    console.log('Crisil Response Data: ', data);

    if (!this.commonService.isObjectNullOrEmpty(data)) {
      for (const item of data) {
        if (
          item?.statusCode === 200
          // && item?.statusMessage?.startsWith('Data Found')
        ) {
          const productCode = item?.productCode;
          const crisilApiMainResponse = item?.crisilApiMainResponse;
          const responseData = item?.crisilApiMainResponse?.data;

          if (crisilApiMainResponse && responseData) {
            switch (productCode) {
              case 'Bankers Data':
                this.hsbcBankersData = responseData?.HSBC_BANKERS;
                this.commonService.getBankerData(this.hsbcBankersData);
                break;

              case 'Ratings Data':
                this.hsbcRatingsData = responseData?.HSBC_RATINGS;
                this.commonService.getCompanyData(
                  this.hsbcRatingsData,
                  this.cin,
                  this.pan
                );
                break;

              case 'Irs':
                this.processIrsData(responseData);
                break;

              case 'Industry Benchmark Ratings':
                this.hsbcIndustryBenchmarkRatings = responseData?.HSBC_INDUSTRYBENCHMARK_RATINGS;

                // Filter here once to check if filtered data is present
                // const filtered = this.hsbcIndustryBenchmarkRatings?.filter(data =>
                //   (data?.['cin'] === this.cin || (!data?.['cin'] && data?.['pan'] === this.pan))
                // ) || [];

                if (!this.commonService.isObjectNullOrEmpty(this.hsbcIndustryBenchmarkRatings))
                  this.isHsbcIndustryBenchmarkRatingsFetched = this.hsbcIndustryBenchmarkRatings.length > 0;
                break;

              case 'Industry Benchmark':
                this.hsbcIndustryBenchmark =
                  responseData?.HSBC_INDUSTRYBENCHMARK;

                if (!this.commonService.isObjectNullOrEmpty(this.hsbcIndustryBenchmark))
                  this.isHsbcIndustryBenchmarkFetched = this.hsbcIndustryBenchmark.length > 0;
                break;

              case 'Peer Comparison':
                this.peerComparisonData = responseData?.HSBC_PEER_COMPARISON;

                if (!this.commonService.isObjectNullOrEmpty(this.peerComparisonData)) {
                  this.isPeerComparisonDataFetched = this.peerComparisonData.length > 0;
                  this.preparePeerData();
                }
                break;
            }
          }
        }
      }
    }
  }

  // Call this after you set responseData?.HSBC_IRS
  processIrsData(responseData: any) {
    this.hsbcIrsData = responseData?.HSBC_IRS || [];

    if (this.hsbcIrsData?.length) {
      this.IsCheckHsbcIrsScoreDate = this.hsbcIrsData[0]?.SCORE_DATE ?? null;

      // Build unique industry list
      this.industryNames = Array.from<string>(
        new Set<string>(
          this.hsbcIrsData
            .map(r => (r?.IRS_INDUSTRY_NAME ?? '').toString().trim())
            .filter(v => v.length > 0)
        )
      );
      //).sort();

      // Select first industry by default
      this.selectedIndustry = this.industryNames[0] ?? null;
      this.irsFirstObject = this.selectedIndustry ?? 'NA';
      this.isHsbcIrsDataFetched = this.hsbcIrsData.length > 0;
    } else {
      this.industryNames = [];
      this.selectedIndustry = null;
      this.irsFirstObject = 'NA';

      this.IsCheckHsbcIrsScoreDate = "NA";
    }
  }

  onIndustryChange(name: string) {
    this.selectedIndustry = name;
    this.irsFirstObject = name || 'NA';
  }

  private dataForSelectedIndustry(): any[] {
    const industry = (this.selectedIndustry ?? this.irsFirstObject ?? '').toString().trim();

    return (this.hsbcIrsData || []).filter(r => {
      const ind = (r?.IRS_INDUSTRY_NAME ?? '').toString().trim();
      const cinOk = this.cin ? r?.CIN === this.cin : true;
      const panOk = this.pan ? r?.PAN === this.pan : true;
      return ind === industry && (cinOk || panOk);
    });
  }

  getStaticIndustryRisk(): { weight: string; score: string; volatility: string } {
    const rows = this
      .dataForSelectedIndustry()
      .filter(r => r?.RISKENT_NAME === 'Industry Risk');

    if (!rows.length) return { weight: '-', score: '-', volatility: '-' };

    const latest = rows.sort(
      (a, b) => new Date(b.SCORE_DATE).getTime() - new Date(a.SCORE_DATE).getTime()
    )[0];

    return {
      weight: latest?.IND_WEIGHTS ?? '-',
      score: latest?.CURR_SCORE ?? '-',
      volatility: latest?.INDUSTRY_VOLATILITY ?? '-'
    };
  }

  getIndustryParamData(label: string): { weight: string; score: string; volatility: string } {
    const rows = this
      .dataForSelectedIndustry()
      .filter(r => r?.RISKENT_NAME === label); // NOTE: use RISKENT_NAME (not PARAM_LABEL)

    if (!rows.length) return { weight: '-', score: '-', volatility: '-' };

    const latest = rows.sort(
      (a, b) => new Date(b.SCORE_DATE).getTime() - new Date(a.SCORE_DATE).getTime()
    )[0];

    return {
      weight: latest?.IND_WEIGHTS ?? '-',
      score: latest?.CURR_SCORE ?? '-',
      volatility: latest?.INDUSTRY_VOLATILITY ?? '-'
    };
  }


  industryParams = [
    { label: 'Industry Characteristics' },
    { label: 'Demand Supply Gap' },
    { label: 'Government Policy' },
    { label: 'Input Related Risk' },
    { label: 'Extent of Competition' },
    { label: 'Industry Financials' },
    { label: 'Operating Margin of Industry' },
    { label: 'ROCE of Industry' },
  ];

  // get filteredHsbcIndustryBenchmarkRatings() {
  //   if (!this.commonService.isObjectNullOrEmpty(this.hsbcIndustryBenchmarkRatings)) {
  //     return this.hsbcIndustryBenchmarkRatings;
  //     // return this.hsbcIndustryBenchmarkRatings.filter(data =>
  //     //   (data?.['cin'] === this.cin || (!data?.['cin'] && data?.['pan'] === this.pan))
  //     // );
  //   }
  //   return [];
  // }

  // getStaticIndustryRisk(): { weight: number;  score: number; volatility: string } {

  //   const entry = this.hsbcIrsData?.find(
  //     (item) =>
  //       item.RISKENT_NAME === 'Industry Risk'
  //       && item.IRS_INDUSTRY_NAME === this.irsFirstObject
  //   );

  //   return {
  //     weight: entry?.IND_WEIGHTS ?? "-",
  //     score: entry?.CURR_SCORE ?? "-",
  //     volatility: entry?.INDUSTRY_VOLATILITY ?? '-',
  //   };
  // }

  // getIndustryParamData(param: string): {
  //   weight: string;
  //   score: string;
  //   volatility: string;
  // } {
  //   const entries = this.hsbcIrsData?.filter(
  //     (item) => item.RISKENT_NAME === param
  //     && (item.CIN === this.cin || item.PAN === this.pan)
  //     && (item.IRS_INDUSTRY_NAME === this.irsFirstObject)
  //   );

  //   if (!entries || entries.length === 0)
  //     return { weight: '-', score: '-', volatility: '-' };

  //   const latest = entries.sort(
  //     (a, b) =>
  //       new Date(b.SCORE_DATE).getTime() - new Date(a.SCORE_DATE).getTime()
  //   )[0];

  //   return {
  //     weight: latest.IND_WEIGHTS ?? "-",
  //     score: latest.CURR_SCORE ?? "-",
  //     volatility: latest.INDUSTRY_VOLATILITY ?? '-',
  //   };
  // }

  mappingTable1 = [
    // { label: 'Executive Summary', riskEntName: 'Industry Risk' },
    { label: 'Industry Characteristics', riskEntName: 'Industry Characteristics' },
    { label: 'Industry Financials', riskEntName: 'Industry Financials' },
    { label: 'Demand Supply Gap', riskEntName: 'Demand Supply Gap' },
    { label: 'Government Policy', riskEntName: 'Government Policy' },
    { label: 'Input Related Risk', riskEntName: 'Input Related Risk' },
    { label: 'Extent of Competition', riskEntName: 'Extent of Competition' },
    { label: 'Operating Margin of Industry', riskEntName: 'Operating Margin of Industry' },
    { label: 'ROCE of Industry', riskEntName: 'ROCE of Industry' },
  ];

  mappingTable2 = [
    { label: 'Executive Summary', riskEntName: 'Industry Risk' },
  ];

  getIRSComment(riskEntLabel: string, mappingTable: any): string {
    const riskEntry = mappingTable.find((m) => m.label === riskEntLabel);
    if (!riskEntry) return '-';

    const data = this.hsbcIrsData?.find(
      (item) =>
        (item.CIN === this.cin || item.PAN === this.pan) &&
        item.RISKENT_NAME === riskEntry.riskEntName
        && item.IRS_INDUSTRY_NAME === this.irsFirstObject
    );

    return data?.IND_COMMENTS || '-';
  }

  getMatchingData(parameterName: string) {
    return this.hsbcIndustryBenchmark.find(data =>
      data?.PARAMETER_NAME === parameterName
      &&
      (data?.CIN === this.cin || data?.PAN === this.pan)
    );
  }

  getPeerCount(): number {
    if (!this.peerComparisonData) return 0;
    return this.peerComparisonData.filter(item => item?.companyType !== "BASE").length;
  }

  // Also add this for the Array creation in template
  Array = Array;

  columns = Array(12);

  peerDataRows = [];
  allComparisonCols = [];

  preparePeerData() {
    const maxPeers = 3;

    const base = this.peerComparisonData.find(c => c.companyType === 'BASE');
    const peers = this.peerComparisonData.filter(c => c.companyType !== 'BASE');

    const paddedPeers = [...peers.slice(0, maxPeers), ...Array(Math.max(0, maxPeers - peers.length)).fill(null)];

    // Column order: base first, then peers
    const allCols = [base, ...paddedPeers];

    this.peerDataRows = [
      { label: 'Company', field: c => c?.companyName || c?.baseCompanyName || '-' },
      { label: 'Credit Rating', field: c => { const ratingAgency = c?.ratingAgency || ''; const ltrating = c?.ltrating || ''; return (ratingAgency || ltrating) ? `${ratingAgency} ${ltrating}`.trim() : '-'; } },
      { label: 'Market Capital (Rs Crore)', field: c => this.formatValueForWN(c?.marketcap, false, true, true) ?? '-' },
      { label: 'Share price as on Date (Rs Per share)', field: c => { const val = this.decimalValue(c?.sharepriceasondate); return val === 'NA' ? '-' : val; } },
      { label: 'Year Ending', field: c => this.datePipe.transform(c?.periodendson, 'dd/MM/yyyy') ?? '-' },
      { label: 'Sales Revenue', field: c => this.formatValueForWN(c?.salesRevenue, false, true, true) ?? '-' },
      // { label: 'Sales Revenue', field: c => this.decimalPipe.transform(c?.salesRevenue, '1.0-2', 'en-IN') ?? '-' },
      { label: 'EBITDA %', field: c => { const val = this.decimalValue(c?.opbditmargin); return val === 'NA' ? '-' : val; } },
      { label: 'Net Profit %', field: c => { const val = this.decimalValue(c?.netProfitMargin); return val === 'NA' ? '-' : val; } },
      { label: 'Tangible Net Worth', field: c => this.formatValueForWN(c?.tangibleNetworth, false, true, true) ?? '-' },
      { label: 'Total Debts', field: c => this.formatValueForWN(c?.totalDebt, false, true, true) ?? '-' },
      { label: 'Net Cash at End', field: c => this.formatValueForWN(c?.netCashAtTheEnd, false, true, true) ?? '-' },
      { label: 'Net Operating Cash Flow (NOCF)', field: c => this.formatValueForWN(c?.cashflowfrops, false, true, true) ?? '-' },
      { label: 'Working Capital Days', field: c => { const val = this.decimalValue(c?.cashConversionCyslyByWorkingCapitalDays); return val === 'NA' ? '-' : val; } },
      { label: 'Debtor Days', field: c => { const val = this.decimalValue(c?.DEBTORDAYS); return val === 'NA' ? '-' : val; } },
      { label: 'Stock Days', field: c => { const val = this.decimalValue(c?.INVENTORYDAYS); return val === 'NA' ? '-' : val; } },
      { label: 'Creditor Days', field: c => { const val = this.decimalValue(c?.creditorDays); return val === 'NA' ? '-' : val; } },
      { label: 'Gross Leverage (Debt/EBITDA)', field: c => { const val = this.decimalValue(c?.grossLeverage); return val === 'NA' ? '-' : val; } },
      { label: 'Debt Service Coverage Ratio', field: c => { const val = this.decimalValue(c?.dscr); return val === 'NA' ? '-' : val; } },
      { label: 'Debt/Equity Ratio', field: c => { const val = this.decimalValue(c?.debtByEquity); return val === 'NA' ? '-' : val; } },
      { label: 'Current Ratio', field: c => { const val = this.decimalValue(c?.currentratio); return val === 'NA' ? '-' : val; } },
    ];
    this.allComparisonCols = allCols; // used in HTML

  }

  // isRetryOptionalEnabledExcludeNWD(createDateTime: Date, currentTime: Date, xDays: number): any {
  //   const start = new Date(createDateTime);
  //   const end = new Date(currentTime);

  //   let workingDays = 0;

  //   // Iterate from start to end date
  //   while (start <= end) {
  //     const day = start.getDay(); // 0 = Sunday, 6 = Saturday
  //     if (day !== 0 && day !== 6) {
  //       workingDays++;
  //     }
  //     start.setDate(start.getDate() + 1);
  //   }

  //   return xDays-workingDays+1;
  // }


  isRetryOptionalEnabledExcludeNWD(createDateTime: Date, currentTime: Date, numberOfWorkingDaysToWait: number): number {
    const start = new Date(createDateTime);
    start.setHours(0, 0, 0, 0);
    const current = new Date(currentTime);
    current.setHours(0, 0, 0, 0);

    if (current <= start) {
      return numberOfWorkingDaysToWait;
    }

    let daysPassed = 0;
    let dateToCheck = new Date(start);
    dateToCheck.setDate(dateToCheck.getDate() + 1); // start from day after creation

    while (dateToCheck < current) {
      const dayOfWeek = dateToCheck.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Mon-Fri
        daysPassed++;
      }
      dateToCheck.setDate(dateToCheck.getDate() + 1);
    }

    const remainingDays = Math.max(numberOfWorkingDaysToWait - daysPassed, 0);
    return remainingDays;
  }

  AgrihsnDetail_popup(): void {
    const dialogRef = this.dialog.open(AgriHsnDetailPopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  formatValueForWN(value?: number, type: boolean = false, showSymbol: boolean = true, useCommas: boolean = true, roundToInteger: boolean = false): string {
    if (value === undefined || value === null || (typeof value === 'string' && value === '')) {
      return '-';
    } else if (value === 0 || value === 0.00) {
      return '-';
    }

    const finalValue = roundToInteger ? Math.round(value) : value;

    const fractionDigits = roundToInteger ? 0 : (Number.isInteger(finalValue) ? 0 : 2);

    if (useCommas) {
      return new Intl.NumberFormat('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: type ? 'USD' : 'INR',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      }).format(finalValue);
    } else {
      const formatted = finalValue.toFixed(fractionDigits);
      if (!showSymbol) return formatted;

      const symbol = type ? '$' : '₹';
      return `${symbol}${formatted}`;
    }
  }

  getSafeFormattedValue(value: any, type: number): string | number {
    const formatted = this.formatValue(value, type);
    return (formatted === 'NA' || formatted === '-') ? 0 : formatted;
  }

  getFdiOdiEcbWalletDataByCin() {
    if (this.cin || this.cin.trim() !== '') {
      this.msmeService.getFdiOdiEcbWalletDataByCin(this.cin).subscribe(
        (response: any) => {
          if (response.status === 200 && response.data) {
            this.fdiOdiAndEcbWallet = response.data.walletData;
            this.fdiOdiAndEcbWalletYears = response.data.years;
          }
          else {
            this.commonService.errorSnackBar(response.message);
          }
        },
        (error) => {
          console.error('Upload failed:', error);
          this.commonService.errorSnackBar('Something went wrong. Please try again.');
        });
    }
  };

  onOpportunityOptionChange() {
    this.pagination = { pageIndex: 1, pageSize: 5, reportType: '6', filterApplied: false };
    this.fetchList();
  }

  fetchList() {
    this.isOppLoading.opportunity = true;
    const payload: any = {
      reportType: this.pagination?.reportType,
      outerSize: this.pagination.pageSize.toString(),
      innerSize: '5',
      outerPageIndex: `${+this.pagination.pageIndex - 1}`,
      innerPageIndex: '0',
      outerSortingOrder: '1',
      innerSortingOrder: '1',
      subDataValue: '',
      isSubData: 0,
      userId: this.userId,
      opportunityId: Number(this.opportunityOption),
      custId: [this.commonService.getStorage('cutomerId', true)],
    };

    // console.log('Printing Request ==={}', payload);
    this.msmeService.getPortfolioBankData(payload).subscribe(
      (response: any) => {
        if (response.status == 200 && response?.data) {
          console.log('response == ', response?.data);
          this.opportunityList = response?.data?.opportunityReport;
          this.isOppLoading.opportunity = false;
        } else {
          this.isOppLoading.opportunity = false;
          console.log(response.message);
        }
      },
      (error) => {
        this.isOppLoading.opportunity = false;
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Upload failed', error);
      }
    );
  }

  getDirectorContactByDin(directorDetails: any) {
    if (!directorDetails.din || directorDetails.din === 'NA') {
      this.commonService.warningSnackBar("API can not be triggered as DIN is not available!");
      return;
    }
    this.msmeService.getDirectorContactByDin(directorDetails.din).subscribe(
      (response: any) => {
        if (response.status == 200) {
          console.log("response data : ", response.data);
          this.commonService.successSnackBar(response.message);
          if (response.data) {
            directorDetails.contactNo = response.data;
          }
          this.getNetworkSubTabData(1);
        }
        else {
          this.commonService.warningSnackBar(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  maskContactNo(contact: string): string {
    if (!contact) return "NA";

    contact = contact.trim();
    if (contact.length <= 7) {
      return "*".repeat(contact.length);
    }
    const masked = "*".repeat(7);
    const rest = contact.slice(7);
    return masked + rest;
  }

  // sso login for save risk in downalod financials (CORPCARD-5303)
  callSaveRiskFlogin() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action =
      'https://www.saverisk.com/sso_v1/login/company/0xA9446CD2C31E61BB082A155AD059BA7778C59E842DC985470BA04177C13456/direct/idpsp';
    form.enctype = 'application/x-www-form-urlencoded';
    form.target = '_blank';

    // CIN
    const cinInput = document.createElement('input');
    cinInput.type = 'hidden';
    cinInput.name = 'cin';
    cinInput.value = this.cin;
    form.appendChild(cinInput);

    // Dashboard
    const dashboardInput = document.createElement('input');
    dashboardInput.type = 'hidden';
    dashboardInput.name = 'dashboard';
    dashboardInput.value = 'overview';
    form.appendChild(dashboardInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }


  corporateSubscribePopup(): void {
    const dialogRef = this.dialog.open(CorporateSubscribePopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openCrilcReportPopup(): void {
    const dialogRef = this.dialog.open(CrilcReportPopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
  }
}

interface prescreenData {
  reportOrderNumber: string;
  contactNo: string;
  borrowerAddress: string;
  reportDate: string;
  borrowerPan: string;
  borrowerName: string;
  totalLenders: string;
  cmr: string;
  createdDate: Date;
  totalActiveAccounts: String;
  totalBalanceOfOpenTradesReportedInPast12Months: String;
  numberOfBankInquiriesInPast3Months: String;
  monthsSinceMostRecentInquiry: String;
  totalBalanceOfOpenTermLoanTradesReportedInPast12Months: String;
  totalBalanceOfOpenWcTradesReportedInPast12Months: String;
  totalBalanceOfAllRevolvingTradesReportedInPast12Months: String;
  totalBalanceOfAllExportFinanceTradesReportedInPast12Months: String;
  totalDpdAmountOfCurrently90OrMoreDaysPastDueTrades: string;
  numberOfWillfulDefaultTrades: string;
  totalPastDueAmountOfSuitFiledTradesReportedInPast12Months: string;
  totalPastDueAmountOfRestructuredTradesReportedInPast12Months: String;
  totalPastDueAmountOfInvokedDevolvedTradesReportedInPast12Months: String;
  totalPastDueAmountOfSettledTradesReportedInPast12Months: String;
}
