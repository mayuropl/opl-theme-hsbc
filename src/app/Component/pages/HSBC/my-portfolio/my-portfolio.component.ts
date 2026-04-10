import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatSelect } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DaterangepickerDirective, LocaleConfig } from 'ngx-daterangepicker-material';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MyportfolioSubscribePopupComponent } from 'src/app/Popup/HSBC/myportfolio-subscribe-popup/myportfolio-subscribe-popup.component';


@Component({
  selector: 'app-my-portfolio',
  templateUrl: './my-portfolio.component.html',
  styleUrl: './my-portfolio.component.scss'
})
export class MyPortfolioComponent implements OnInit, AfterViewInit {
  @ViewChild('searchByTrigger') searchByTrigger: MatMenuTrigger;
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;
  @ViewChild('industrySelect') industrySelect: MatSelect;
  @ViewChild('sectorSelect') sectorSelect: MatSelect;
  @ViewChild('subSectorSelect') subSectorSelect: MatSelect;
  @ViewChild('developmentSelect') developmentSelect: MatSelect;
  @ViewChild('categorySelect') categorySelect: MatSelect;
  moment = moment;
  calendarLocale: LocaleConfig;
  selectedTab = 0;
  ranges: any;
  pickerRanges: any = {};
  calendarPlaceholder: string;
  selectedRange: any = null;
  corporateSelectedRange: any = null;
  calendarDisplayLabel: string = 'Last 7 Days';
  minDates: Moment;
  maxDateS: Moment;
  isActive = false;
  private _newsPickerSkipCount = 0;
  private _corporatePickerSkipCount = 0;

  // ── Corporate Announcements Data ──
  allParentCategories: string[] = [];
  statsData: any[] = [];
  categoryCounts: Map<string, number> = new Map();
  totalAnnouncementCount = 0;
  // Industry News data
  industries: any[] = [];
  developments: any[] = [];
  sectors: any[] = [];
  subSectors: any[] = [];
  categories: any[] = [];

  // Selected filters
  selectedIndustry: any = null;
  selectedIndustryIds: any[] = [];
  selectedSectorIds: any[] = [];
  selectedSubSectorIds: any[] = [];
  selectedDevelopmentIds: any[] = [];
  selectedCategoryIds: any[] = [];

  // Track whether ALL was previously selected for each dropdown
  private _prevAllIndustry = false;
  private _prevAllSector = false;
  private _prevAllSubSector = false;
  private _prevAllDevelopment = false;
  private _prevAllCategory = false;

  // News data
  newsCards: any[] = [];
  industryStats: any[] = [];
  totalCount = 0;
  newCount = 0;

  // Pagination
  newsPage = 0;       // 0-based for backend
  newsUiPage = 1;     // 1-based for ngb-pagination
  newsPageSize = 10;
  newsTotalElements = 0;
  newsTotalPages = 0;
  pageSizeOptions: number[] = [10, 20, 30, 40, 50];

  // Date range for Industry News (default last 7 days)
  newsStartDate: string = moment().subtract(6, 'days').format('YYYY-MM-DD');
  newsEndDate: string = moment().format('YYYY-MM-DD');

  // Saved articles
  savedArticlesCount = 0;
  savedArticleIds: Set<number> = new Set();
  userId: any = null;
  isDetailsVisible = false;
  isLoadingNews = false;
  isPageLoading = false;
  private _corporateDataLoaded = false;


  toggleDetails(): void {
    this.isDetailsVisible = !this.isDetailsVisible;
  }

  activateButton() {
    this.router.navigate(['/hsbc/my-saved-articles']);
  }

  isInvalidDate(date: any): boolean {
    return date.isAfter(moment(), 'day');
  }


  private deduplicateByName(items: any[], childKey?: string): any[] {
    const map = new Map<string, any>();
    for (const item of items) {
      const name = item.name;
      if (map.has(name)) {
        const existing = map.get(name);
        existing.allIds.push(item.id);
        existing.count = (existing.count || 0) + (item.count || 0);
        if (childKey && item[childKey]) {
          existing[childKey] = [...(existing[childKey] || []), ...item[childKey]];
        }
      } else {
        map.set(name, { ...item, allIds: [item.id] });
      }
    }
    if (childKey) {
      for (const entry of map.values()) {
        if (entry[childKey]) {
          entry[childKey] = this.deduplicateByName(entry[childKey]);
        }
      }
    }
    return Array.from(map.values());
  }


  private expandMergedIds(selectedIds: any[], items: any[]): any[] {
    const expanded: any[] = [];
    for (const id of selectedIds) {
      const item = items.find(i => i.id === id);
      if (item && item.allIds) {
        expanded.push(...item.allIds);
      } else {
        expanded.push(id);
      }
    }
    return expanded;
  }

  toggleTab(index: number): void {
    this.selectedTab = index;
    if (index === 0) {
      // Reset corporate date picker to default (Last 7 Days)
      this.corporateSelectedRange = null;
      this.corporateStartDate = null;
      this.corporateEndDate = null;

      if (!this._corporateDataLoaded) {
        this._corporateDataLoaded = true;
        this._corporatePickerSkipCount = 0;
        this.fetchCategoriesAndStats();
        this.getTopBarFilterForRM();
      } else {
        // Refresh data with default dates (last 7 days from backend)
        this.fetchStatsData();
        this.selectSubCategory(this.selectedSubCategory);
      }
    }
    if (index === 1) {
      this._newsPickerSkipCount = 1;
      this.isLoadingNews = true;
      this.loadMetadata(() => {
        this.fetchNews();
      });
   
      setTimeout(() => this.patchPickerClickApply(), 300);
    }
  }

  // Selected state
  selectedParentCategory = 'All';
  selectedSubCategory = 'All';
  corporateInnerTabLabels: string[] = [];
  corporateInnerSelectedIndex = 0;

  // Grid data
  corporateDetails: any[] = [];
  corporateTotalElements = 0;
  corporatePageNumber = 1;
  corporatePageSize = 10;

  // Row expand tracking
  expandedRowId: number | null = null;

  // Row selection tracking
  selectedAnnouncementIds: Set<number> = new Set();

  // Column sort state
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  // Date range
  corporateStartDate: string = null;
  corporateEndDate: string = null;

  // Subscription filter state
  subscriptionFilter: string = 'ALL';
  subscriptionCounts: any = { all: 0, subscribed: 0, unsubscribed: 0 };
  subscribedCategoriesMap: Set<string> = new Set();
  unsubscribedCategoriesMap: Set<string> = new Set();

  // User context
  constants: any = Constants;

  // Search By state
  selectedCustomerType: string = 'ALL';
  selectedCustomerTypeValue: number = 0;
  topBarFilters: any[] = [];
  searchByOptionsTopBar: any[] = [];
  rmUserFilter: any = { optionFilter: [], originalOptionFilter: [], selectedFilter: [], searchValue: '' };
  selectedItemsMap: { [key: string]: any[] } = {};
  selectedRmUsers: any[] = [];
  searchByDataHistory: { [key: number]: any } = {};
  activeFilterMenu: string | null = null;
  selectedFilterOption: any = null;
  selectedFilterType: string = '';
  selectedFilterIndex: number = -1;
  dependantFilters: any[] = [];
  isLoadingSearchBy: boolean = false;

  // Parent Company API search state
  parentCompanyPage: number = 0;
  parentCompanyPageSize: number = 50;
  parentCompanyHasMore: boolean = true;
  parentCompanyLoading: boolean = false;

  // Master Group ID → Name mapping (resolved by backend now)

  constructor(private msmeService: MsmeService, public commonService: CommonService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private cdr: ChangeDetectorRef) {
    this.calendarLocale = {
      customRangeLabel: 'Custom',
      applyLabel: 'APPLY',
      clearLabel: 'Reset',
      format: 'DD/MM/YYYY',
      daysOfWeek: ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'],
      monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      firstDay: 1
    };

    this.ranges = {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'Last week': [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
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

    this.calendarPlaceholder = 'Last 7 Days';
    this.minDates = moment();
    this.maxDateS = moment();
  }

  ngOnInit(): void {
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    const params = this.route.snapshot.queryParams;
    const tab = +params['tab'];
    if (tab) {
      // Coming back with a specific tab (e.g. from saved articles with ?tab=1)
      // Only load industry news APIs — skip corporate APIs entirely
      this.isPageLoading = true;
      this.selectedTab = tab;
      this.toggleTab(tab);
    } else {
      // Default: landing on corporate announcements tab (tab 0)
      this._corporateDataLoaded = true;
      this.fetchCategoriesAndStats();
      this.getTopBarFilterForRM();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // API PAYLOAD BUILDER
  // ─────────────────────────────────────────────────────────────────────────

  buildPayload(overrides: any = {}): any {
    const userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    const roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);

    const payload: any = {
      userId: userId,
      roleId: roleId ? Number(roleId) : null,
      startDate: this.corporateStartDate || null,
      endDate: this.corporateEndDate || null,
      customerType: this.selectedCustomerTypeValue,
      ...overrides
    };

    const cityIds = this.getCityIds();
    if (cityIds.length > 0) {
      payload.cityIds = cityIds;
    }

    const rmCodes = this.getRmCodes();
    if (rmCodes.length > 0) {
      payload.rmCodes = rmCodes;
    }

    const segmentIds = this.getSegmentIds();
    if (segmentIds.length > 0) {
      payload.segmentIds = segmentIds;
    }

    const parentCompanyIds = this.getParentCompanyValues();
    if (parentCompanyIds.length > 0) {
      payload.parentCompanyIds = parentCompanyIds;
    }

    const parentCountryIds = this.getParentCountryValues();
    if (parentCountryIds.length > 0) {
      payload.parentCountryIds = parentCountryIds;
    }

    return payload;
  }

  // ======================== Industry News Methods ========================

  loadMetadata(callback?: () => void): void {
    this.msmeService.getIndustryNewsMetadata().subscribe(
      (res: any) => {
        if (res && res.status === 200 && res.data) {
          const metadata = res.data;
          this.industries = metadata.industries || [];
          this.developments = metadata.developments || [];

          // Flatten all sectors from all industries for the Sector dropdown
          this.sectors = [];
          this.subSectors = [];
          this.industries.forEach(ind => {
            if (ind.sectors) {
              ind.sectors.forEach(sec => {
                this.sectors.push(sec);
                if (sec.subSectors) {
                  sec.subSectors.forEach(ss => this.subSectors.push(ss));
                }
              });
            }
          });
          this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
          this.subSectors = this.deduplicateByName(this.subSectors);

          // Flatten all categories from all developments for the Categories dropdown
          this.categories = [];
          this.developments.forEach(dev => {
            if (dev.categories) {
              dev.categories.forEach(cat => this.categories.push(cat));
            }
          });
          this.categories = this.deduplicateByName(this.categories);
        }
        if (callback) {
          callback();
        }
      },
      (err) => {
        console.error('Error loading metadata:', err);
        if (callback) {
          callback();
        }
      }
    );
  }

  fetchNews(resetPage: boolean = true): void {
    if (resetPage) {
      this.newsPage = 0;
      this.newsUiPage = 1;
    }
    const payload: any = {
      startDate: this.newsStartDate,
      endDate: this.newsEndDate,
      userId: this.userId,
      industryIds: this.selectedIndustry ? [this.selectedIndustry.id] : this.selectedIndustryIds.filter(v => v !== 'ALL'),
      sectorIds: this.expandMergedIds(this.selectedSectorIds.filter(v => v !== 'ALL'), this.sectors),
      subSectorIds: this.expandMergedIds(this.selectedSubSectorIds.filter(v => v !== 'ALL'), this.subSectors),
      developmentIds: this.selectedDevelopmentIds.filter(v => v !== 'ALL'),
      categoryIds: this.expandMergedIds(this.selectedCategoryIds.filter(v => v !== 'ALL'), this.categories),
      page: this.newsPage,
      size: this.newsPageSize
    };

    this.msmeService.fetchIndustryNews(payload).subscribe(
      (res: any) => {
        if (res && res.status === 200 && res.data) {
          const newsIndustries = res.data.industries || [];
          this.totalCount = res.data.totalCount || 0;
          this.newCount = res.data.newCount || 0;
          this.newsCards = res.data.news || [];

          // Build a map of news counts by industry name
          const countsMap: any = {};
          newsIndustries.forEach(ni => {
            countsMap[ni.name] = { totalCount: ni.totalCount || 0, newCount: ni.newCount || 0 };
          });

          // Merge metadata industries with news counts so sidebar always shows all industries
          this.industryStats = this.industries.map(ind => ({
            id: ind.id,
            name: ind.name,
            sectors: ind.sectors,
            totalCount: countsMap[ind.name]?.totalCount || 0,
            newCount: countsMap[ind.name]?.newCount || 0
          }));

          // Attach sector and subSector counts from backend to dropdown items
          const sectorCounts = res.data.sectorCounts || {};
          const subSectorCounts = res.data.subSectorCounts || {};
          this.sectors.forEach(s => {
            s.count = (s.allIds || [s.id]).reduce((sum, id) => sum + (sectorCounts[id] || 0), 0);
          });
          this.subSectors.forEach(ss => {
            ss.count = (ss.allIds || [ss.id]).reduce((sum, id) => sum + (subSectorCounts[id] || 0), 0);
          });

          // Pagination metadata
          this.newsTotalElements = res.data.totalElements || 0;
          this.newsTotalPages = res.data.totalPages || 0;
          this.newsPage = res.data.page || 0;
          this.newsUiPage = this.newsPage + 1;

          // Saved articles info from same response
          this.savedArticlesCount = res.data.savedArticlesCount || 0;
          const savedIds: number[] = res.data.savedArticleIds || [];
          this.savedArticleIds = new Set(savedIds);
        }
        this.isLoadingNews = false;
        this.isPageLoading = false;
      },
      (err) => {
        console.error('Error fetching industry news:', err);
        this.isLoadingNews = false;
        this.isPageLoading = false;
      }
    );
  }

  onIndustrySelect(industry: any): void {
    this.selectedIndustry = industry;
    // Reset industry dropdown when switching from All to specific industry
    this.selectedIndustryIds = [];
    this._prevAllIndustry = false;
    // Update sector/subSector dropdowns based on selected industry
    if (industry && industry.sectors) {
      this.sectors = industry.sectors;
      this.subSectors = [];
      industry.sectors.forEach(sec => {
        if (sec.subSectors) {
          sec.subSectors.forEach(ss => this.subSectors.push(ss));
        }
      });
    } else {
      // "All" selected — flatten from all industries
      this.sectors = [];
      this.subSectors = [];
      this.industries.forEach(ind => {
        if (ind.sectors) {
          ind.sectors.forEach(sec => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach(ss => this.subSectors.push(ss));
            }
          });
        }
      });
      this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
      this.subSectors = this.deduplicateByName(this.subSectors);
    }
    // Reset dependent filters
    this.selectedSectorIds = [];
    this.selectedSubSectorIds = [];
    this.fetchNews();
  }

  onIndustryDropdownSelectAll(event: any): void {
    const value: any[] = event.value;
    const allClicked = value.includes('ALL');
    if (allClicked && !this._prevAllIndustry) {
      this.selectedIndustryIds = ['ALL', ...this.industries.map(i => i.id)];
    } else if (!allClicked && this._prevAllIndustry) {
      this.selectedIndustryIds = [];
    } else {
      this.selectedIndustryIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllIndustry = this.selectedIndustryIds.includes('ALL');

    // Filter sectors based on selected industries
    const selectedIndIds = this.selectedIndustryIds.filter(v => v !== 'ALL');
    if (selectedIndIds.length > 0) {
      const selectedInds = this.industries.filter(ind => selectedIndIds.includes(ind.id));
      this.sectors = [];
      this.subSectors = [];
      selectedInds.forEach(ind => {
        if (ind.sectors) {
          ind.sectors.forEach(sec => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach(ss => this.subSectors.push(ss));
            }
          });
        }
      });
      this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
      this.subSectors = this.deduplicateByName(this.subSectors);
    } else {
      // No industry selected — show all sectors
      this.sectors = [];
      this.subSectors = [];
      this.industries.forEach(ind => {
        if (ind.sectors) {
          ind.sectors.forEach(sec => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach(ss => this.subSectors.push(ss));
            }
          });
        }
      });
      this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
      this.subSectors = this.deduplicateByName(this.subSectors);
    }
    // Reset dependent filters
    this.selectedSectorIds = [];
    this.selectedSubSectorIds = [];
    this._prevAllSector = false;
    this._prevAllSubSector = false;
    this.fetchNews();
    if (this.industrySelect) { this.industrySelect.close(); }
  }

  onSectorSelectAll(event: any): void {
    const value: any[] = event.value;
    const allClicked = value.includes('ALL');
    if (allClicked && !this._prevAllSector) {
      // User just checked "All" — select everything
      this.selectedSectorIds = ['ALL', ...this.sectors.map(s => s.id)];
    } else if (!allClicked && this._prevAllSector) {
      // User just unchecked "All" — deselect everything
      this.selectedSectorIds = [];
    } else {
      // Individual item toggled
      this.selectedSectorIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllSector = this.selectedSectorIds.includes('ALL');
    // Update subSectors based on selected sectors
    this.subSectors = [];
    const ids = this.selectedSectorIds.filter(v => v !== 'ALL');
    const selectedSectors = this.sectors.filter(s => ids.includes(s.id));
    selectedSectors.forEach(sec => {
      if (sec.subSectors) {
        sec.subSectors.forEach(ss => this.subSectors.push(ss));
      }
    });
    this.selectedSubSectorIds = [];
    this._prevAllSubSector = false;
    this.fetchNews();
    if (this.sectorSelect) { this.sectorSelect.close(); }
  }

  onSubSectorSelectAll(event: any): void {
    const value: any[] = event.value;
    const allClicked = value.includes('ALL');
    if (allClicked && !this._prevAllSubSector) {
      this.selectedSubSectorIds = ['ALL', ...this.subSectors.map(s => s.id)];
    } else if (!allClicked && this._prevAllSubSector) {
      this.selectedSubSectorIds = [];
    } else {
      this.selectedSubSectorIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllSubSector = this.selectedSubSectorIds.includes('ALL');
    this.fetchNews();
    if (this.subSectorSelect) { this.subSectorSelect.close(); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────────────────────────────────
  onDevelopmentSelectAll(event: any): void {
    const value: any[] = event.value;
    const allClicked = value.includes('ALL');
    if (allClicked && !this._prevAllDevelopment) {
      this.selectedDevelopmentIds = ['ALL', ...this.developments.map(d => d.id)];
    } else if (!allClicked && this._prevAllDevelopment) {
      this.selectedDevelopmentIds = [];
    } else {
      this.selectedDevelopmentIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllDevelopment = this.selectedDevelopmentIds.includes('ALL');
    // Update categories based on selected developments
    this.categories = [];
    const ids = this.selectedDevelopmentIds.filter(v => v !== 'ALL');
    const selectedDevs = this.developments.filter(d => ids.includes(d.id));
    selectedDevs.forEach(dev => {
      if (dev.categories) {
        dev.categories.forEach(cat => this.categories.push(cat));
      }
    });
    this.categories = this.deduplicateByName(this.categories);
    this.selectedCategoryIds = [];
    this._prevAllCategory = false;
    this.fetchNews();
    if (this.developmentSelect) { this.developmentSelect.close(); }
  }

  fetchCategoriesAndStats(): void {
    this.msmeService.getMyPortfolioCategories().subscribe({
      next: (res: any) => {
        if (res && res.status == 200 && res.data) {
          this.allParentCategories = res.data || [];
        }
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  onCategorySelectAll(event: any): void {
    const value: any[] = event.value;
    const allClicked = value.includes('ALL');
    if (allClicked && !this._prevAllCategory) {
      this.selectedCategoryIds = ['ALL', ...this.categories.map(c => c.id)];
    } else if (!allClicked && this._prevAllCategory) {
      this.selectedCategoryIds = [];
    } else {
      this.selectedCategoryIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllCategory = this.selectedCategoryIds.includes('ALL');
    this.fetchNews();
    if (this.categorySelect) { this.categorySelect.close(); }
  }

  resetIndustryFilter(event: Event, select: any): void {
    event.stopPropagation();
    this.selectedIndustryIds = [];
    this._prevAllIndustry = false;
    // Rebuild sectors/subSectors from all industries
    this.sectors = [];
    this.subSectors = [];
    this.industries.forEach(ind => {
      if (ind.sectors) {
        ind.sectors.forEach(sec => {
          this.sectors.push(sec);
          if (sec.subSectors) {
            sec.subSectors.forEach(ss => this.subSectors.push(ss));
          }
        });
      }
    });
    this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
    this.subSectors = this.deduplicateByName(this.subSectors);
    this.selectedSectorIds = [];
    this.selectedSubSectorIds = [];
    this._prevAllSector = false;
    this._prevAllSubSector = false;
    select.close();
    this.fetchNews();
  }

  resetSectorFilter(event: Event, select: any): void {
    event.stopPropagation();
    this.selectedSectorIds = [];
    this._prevAllSector = false;
    this.selectedSubSectorIds = [];
    this._prevAllSubSector = false;
    select.close();
    this.fetchNews();
  }

  resetSubSectorFilter(event: Event, select: any): void {
    event.stopPropagation();
    this.selectedSubSectorIds = [];
    this._prevAllSubSector = false;
    select.close();
    this.fetchNews();
  }

  resetDevelopmentFilter(event: Event, select: any): void {
    event.stopPropagation();
    this.selectedDevelopmentIds = [];
    this._prevAllDevelopment = false;
    this.selectedCategoryIds = [];
    this._prevAllCategory = false;
    select.close();
    this.fetchNews();
  }

  resetCategoryFilter(event: Event, select: any): void {
    event.stopPropagation();
    this.selectedCategoryIds = [];
    this._prevAllCategory = false;
    select.close();
    this.fetchNews();
  }

  ngAfterViewInit(): void {
    this.patchPickerClickApply();
  }

  private patchPickerClickApply(): void {
    if (this.pickerDirective && this.pickerDirective.picker) {
      const picker: any = this.pickerDirective.picker;
      // Patch getDateWithTime to handle missing timepickerVariables when timePicker is off
      const originalGetDateWithTime = picker.getDateWithTime.bind(picker);
      picker.getDateWithTime = (date: any, side: any) => {
        if (!picker.timepickerVariables || !picker.timepickerVariables[side]) {
          return date.clone();
        }
        return originalGetDateWithTime(date, side);
      };
    } else {
      setTimeout(() => this.patchPickerClickApply(), 300);
    }
  }

  onNewsDateRangeChange(event: any): void {
    // Skip the initial emission from daterangepicker when tab first renders
    if (this._newsPickerSkipCount > 0) {
      this._newsPickerSkipCount--;
      return;
    }
    if (event && event.startDate) {
      const start = event.startDate;
      const end = event.endDate || event.startDate;
      this.newsStartDate = start.format('YYYY-MM-DD');
      this.newsEndDate = end.format('YYYY-MM-DD');
      this.calendarDisplayLabel = this.getMatchingRangeLabel(start, end);
      this.fetchNews();
    } else {
      // Reset button clicked — restore only date to defaults, keep dropdown filters
      this.newsStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
      this.newsEndDate = moment().format('YYYY-MM-DD');
      this.selectedRange = { startDate: moment().subtract(6, 'days'), endDate: moment() };
      this.calendarDisplayLabel = 'Last 7 Days';

      // Reset pagination
      this.newsPage = 0;
      this.newsUiPage = 1;

      this.fetchNews();
    }
  }

  onRangeLabel(event: any): void {
    if (event && event.label) {
      this.calendarDisplayLabel = event.label;
      this.cdr.detectChanges();
    }
  }

  private getMatchingRangeLabel(start: any, end: any): string {
    for (const label of Object.keys(this.ranges)) {
      const [rangeStart, rangeEnd] = this.ranges[label];
      if (start.isSame(rangeStart, 'day') && end.isSame(rangeEnd, 'day')) {
        return label;
      }
    }
    return start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY');
  }

  onNewsPageChange(page: number): void {
    this.newsUiPage = page;
    this.newsPage = page - 1; // convert to 0-based for backend
    this.fetchNews(false);
  }

  onNewsPageSizeChange(size: number): void {
    this.newsPageSize = size;
    // Adjust current page if it would exceed new total pages
    const newTotalPages = Math.ceil(this.newsTotalElements / size);
    if (this.newsUiPage > newTotalPages && newTotalPages > 0) {
      this.newsUiPage = newTotalPages;
      this.newsPage = this.newsUiPage - 1;
    }
    this.fetchNews(false);
  }


  toggleSaveArticle(card: any): void {
    if (!this.userId) {
      console.warn('User not logged in, cannot save/unsave articles');
      return;
    }
    const articleId = card.id;
    if (card.isSaved) {
      this.msmeService.deleteIndustryNewsArticle({ userId: this.userId, articleId }).subscribe(
        (res: any) => {
          if (res && res.status === 200) {
            card.isSaved = false;
            this.savedArticleIds.delete(articleId);
            this.savedArticlesCount = Math.max(0, this.savedArticlesCount - 1);
          }
        },
        (err) => console.error('Error unsaving article:', err)
      );
    } else {
      this.msmeService.saveIndustryNewsArticle({ userId: this.userId, articleId }).subscribe(
        (res: any) => {
          if (res && res.status === 200) {
            card.isSaved = true;
            this.savedArticleIds.add(articleId);
            this.savedArticlesCount++;
          }
        },
        (err) => console.error('Error saving article:', err)
      );
    }
  }


  fetchStatsData(): void {
    const payload = this.buildPayload({ subscriptionFilter: this.subscriptionFilter });
    this.msmeService.getMyPortfolioStats(payload).subscribe({
      next: (res: any) => {
        if (res && res.status == 200 && res.data) {
          this.statsData = res.data || [];
          this.calculateCategoryCounts();
        }
      },
      error: (err) => console.error('Error fetching stats:', err)
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY / SUBCATEGORY LOGIC
  // ─────────────────────────────────────────────────────────────────────────

  calculateCategoryCounts(): void {
    this.categoryCounts.clear();
    this.totalAnnouncementCount = 0;
    for (const stat of this.statsData) {
      const count = stat.totalCount || 0;
      this.categoryCounts.set(stat.group, count);
      this.totalAnnouncementCount += count;
    }
  }

  getCategoryCount(category: string): number {
    return this.categoryCounts.get(category) || 0;
  }

  selectParentCategory(category: string): void {
    this.selectedParentCategory = category;
    this.corporatePageNumber = 1;
    this.corporateInnerSelectedIndex = 0;
    this.selectedAnnouncementIds.clear();

    if (category === 'All') {
      this.corporateInnerTabLabels = [];
      this.selectedSubCategory = 'All';
    } else {
      const stat = this.statsData.find(s => s.group === category);
      if (stat && stat.subgroups) {
        this.corporateInnerTabLabels = ['All', ...stat.subgroups.map((sg: any) => sg.subgroup)];
      } else {
        this.corporateInnerTabLabels = ['All'];
      }
      this.selectedSubCategory = 'All';
    }

    this.selectSubCategory(this.selectedSubCategory);
  }

  getSubcategoryCount(label: string): number {
    if (label === 'All') {
      return this.getCategoryCount(this.selectedParentCategory);
    }
    const stat = this.statsData.find(s => s.group === this.selectedParentCategory);
    if (stat && stat.subgroups) {
      const sg = stat.subgroups.find((s: any) => s.subgroup === label);
      return sg ? sg.count : 0;
    }
    return 0;
  }

  selectSubCategory(subCategory: string): void {
    this.selectedSubCategory = subCategory;
    const overrides: any = {
      group: this.selectedParentCategory,
      subgroup: subCategory,
      subscriptionFilter: this.subscriptionFilter,
      pageNumber: this.corporatePageNumber - 1,
      pageSize: this.corporatePageSize
    };

    // Pass sort params for DB-sortable columns
    if (this.sortColumn && this.sortDirection && this.dbSortableColumns.includes(this.sortColumn)) {
      overrides.sortColumn = this.sortColumn;
      overrides.sortDirection = this.sortDirection.toUpperCase();
    }

    const payload = this.buildPayload(overrides);

    this.msmeService.getMyPortfolioAnnouncements(payload).subscribe({
      next: (res: any) => {
        if (res && res.status == 200 && res.data) {
          this.corporateDetails = res.data?.content || [];
          this.corporateTotalElements = res.data?.totalElements || 0;
        } else {
          this.corporateDetails = [];
          this.corporateTotalElements = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching announcements:', err);
        this.corporateDetails = [];
        this.corporateTotalElements = 0;
      }
    });

    // Fetch subscription counts for the filter dropdown
    this.fetchSubscriptionCounts(payload);

    // Fetch subscription status for bell icons
    this.fetchSubscriptionStatus();
  }

  fetchSubscriptionCounts(basePayload: any): void {
    this.msmeService.getMyPortfolioSubscriptionCounts(basePayload).subscribe({
      next: (res: any) => {
        if (res && res.status === 200 && res.data) {
          this.subscriptionCounts = res.data;
        }
      },
      error: (err) => console.error('Error fetching subscription counts:', err)
    });
  }

  fetchSubscriptionStatus(): void {
    const payload = this.buildPayload();
    this.msmeService.getMyPortfolioSubscriptionStatus(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 200 && res.data) {
          this.subscribedCategoriesMap.clear();
          this.unsubscribedCategoriesMap.clear();

          const subscribed: string[] = res.data.subscribed || [];
          subscribed.forEach((key: string) => this.subscribedCategoriesMap.add(key.toUpperCase()));

          const unsubscribed: string[] = res.data.unsubscribed || [];
          unsubscribed.forEach((key: string) => this.unsubscribedCategoriesMap.add(key.toUpperCase()));
        }
      },
      error: (err) => {
        console.error('Error fetching subscription status:', err);
        this.subscribedCategoriesMap.clear();
        this.unsubscribedCategoriesMap.clear();
      }
    });
  }

  setSubscriptionFilter(filter: string): void {
    this.subscriptionFilter = filter;
    this.corporatePageNumber = 1;
    this.selectedAnnouncementIds.clear();
    this.fetchStatsData();
    this.selectSubCategory(this.selectedSubCategory);
  }

  getAnnouncementSubscriptionStatus(item: any): 'subscribed' | 'unsubscribed' | 'untouched' {
    if (!item) return 'untouched';
    const cin = (item.runCIN || '').trim().toUpperCase();

    if (this.subscribedCategoriesMap.has(cin)) {
      return 'subscribed';
    }

    if (this.unsubscribedCategoriesMap.has(cin)) {
      return 'unsubscribed';
    }

    return 'untouched';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  onCorporateInnerTabChange(event: MatTabChangeEvent): void {
    this.corporateInnerSelectedIndex = event.index;
    const label = this.corporateInnerTabLabels[event.index] || 'All';
    this.corporatePageNumber = 1;
    this.selectedAnnouncementIds.clear();
    this.selectSubCategory(label);
  }

  onCorporateDateChange(event: any): void {
    if (this._corporatePickerSkipCount > 0) {
      this._corporatePickerSkipCount--;
      return;
    }
    if (event && event.startDate && event.endDate) {
      this.corporateStartDate = event.startDate.format('YYYY-MM-DD');
      this.corporateEndDate = event.endDate.format('YYYY-MM-DD');
    } else {
      this.corporateStartDate = null;
      this.corporateEndDate = null;
    }
    this.corporatePageNumber = 1;
    this.selectedAnnouncementIds.clear();
    this.fetchStatsData();
    this.selectSubCategory(this.selectedSubCategory);
  }

  // ── Pagination ──

  onCorporatePageChange(page: number): void {
    this.corporatePageNumber = page;
    this.selectSubCategory(this.selectedSubCategory);
  }

  onCorporatePageSizeChange(event: any): void {
    this.corporatePageSize = event.value;
    this.corporatePageNumber = 1;
    this.selectedAnnouncementIds.clear();
    this.selectSubCategory(this.selectedSubCategory);
  }

  // ── Row Expand ──

  toggleRowExpand(id: number): void {
    this.expandedRowId = this.expandedRowId === id ? null : id;
  }

  isRowExpanded(id: number): boolean {
    return this.expandedRowId === id;
  }

  // ── Row Selection ──

  get isAllSelected(): boolean {
    return this.corporateDetails.length > 0 &&
      this.corporateDetails.every(item => this.selectedAnnouncementIds.has(item.id));
  }

  isRowSelected(id: number): boolean {
    return this.selectedAnnouncementIds.has(id);
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.corporateDetails.forEach(item => this.selectedAnnouncementIds.add(item.id));
    } else {
      this.corporateDetails.forEach(item => this.selectedAnnouncementIds.delete(item.id));
    }
  }

  toggleSelectRow(id: number): void {
    if (this.selectedAnnouncementIds.has(id)) {
      this.selectedAnnouncementIds.delete(id);
    } else {
      this.selectedAnnouncementIds.add(id);
    }
  }

  // ── Column Sorting ──

  // DB-sortable columns (sorted across all pages by backend)
  private dbSortableColumns = ['companyName', 'sourceDate'];

  toggleSort(column: string, direction: 'asc' | 'desc'): void {
    if (this.sortColumn === column && this.sortDirection === direction) {
      // Clicking the same arrow again — clear sort
      this.sortColumn = '';
      this.sortDirection = '';
    } else {
      this.sortColumn = column;
      this.sortDirection = direction;
    }

    // For DB-sortable columns, re-fetch from backend with sort params
    if (this.dbSortableColumns.includes(column) || !this.sortColumn) {
      this.corporatePageNumber = 1;
      this.selectSubCategory(this.selectedSubCategory);
    }
  }

  get sortedCorporateDetails(): any[] {
    // For DB-sortable columns or no sort, return as-is (backend already sorted)
    if (!this.sortColumn || !this.sortDirection || this.dbSortableColumns.includes(this.sortColumn)) {
      return this.corporateDetails;
    }

    // For enriched columns (city, segment, masterGroup), sort current page only
    return [...this.corporateDetails].sort((a, b) => {
      const valA = (a[this.sortColumn] || '').toString().toLowerCase();
      const valB = (b[this.sortColumn] || '').toString().toLowerCase();
      const comparison = valA.localeCompare(valB);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  // ── Formatting ──

  formatSubgroup(subgroup: string): string {
    if (!subgroup) return '';
    return subgroup
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }

  // ── Master Group Name Resolution (handled by backend) ──

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH BY FILTER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  getTopBarFilterForRM(): void {
    this.isLoadingSearchBy = true;
    this.msmeService.getTopBarFilter(this.selectedCustomerType, true).subscribe({
      next: (response: any) => {
        if (response && response.status == 200 && response.data) {
          this.rmUserFilter.optionFilter = response?.data?.rmUsers;
          this.rmUserFilter.originalOptionFilter = response?.data?.rmUsers;
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

          this.setupSearchByMenu();
        }
        this.isLoadingSearchBy = false;
      },
      error: (err) => {
        console.error('Error fetching top bar filters:', err);
        this.isLoadingSearchBy = false;
      }
    });
  }

  setupSearchByMenu(): void {
    const allowedFilters = ['City', 'Segment', 'Parent Company', 'Parent Country'];

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
        page_size: 50,
        data: opt.options || [],
        dataset_name: opt.dataset_name
      };

      // Initialize selectedItemsMap for each filter if not already set
      if (!this.selectedItemsMap[opt.filter_name]) {
        this.selectedItemsMap[opt.filter_name] = [];
      }
    });
  }

  onCustomerTypeChange(type: string): void {
    this.selectedCustomerType = type;

    // Map string type to numeric value
    switch (type) {
      case 'ALL':
        this.selectedCustomerTypeValue = 0;
        break;
      case 'ETB':
        this.selectedCustomerTypeValue = 1;
        break;
      case 'TARGET':
        this.selectedCustomerTypeValue = 2;
        break;
      default:
        this.selectedCustomerTypeValue = 0;
    }

    // Clear all City, Parent Company, RM selections
    this.selectedItemsMap = {};
    this.searchByOptionsTopBar.forEach(opt => {
      this.selectedItemsMap[opt.filter_name] = [];
    });
    this.rmUserFilter.selectedFilter = [];
    this.selectedRmUsers = [];

    // Reset active filter menu
    this.activeFilterMenu = null;

    // Fetch updated filter options for the new customer type
    this.getTopBarFilterForRM();
  }

  // ── Search By Menu Methods ──

  openFilterView(opt: any, index: number, event: any, filterType: string): void {
    this.activeFilterMenu = opt.key || filterType;
    this.selectedFilterOption = opt;
    this.selectedFilterType = filterType;
    this.selectedFilterIndex = index;

    if (event) {
      event.stopPropagation();
    }

    // For RM filter, set activeFilterMenu to 'RM' (uppercase) for consistent checks
    if (filterType === 'rm') {
      this.activeFilterMenu = 'RM';
    }

    if (filterType === 'topbar' && opt.dataset_id) {
      this.isLoadingSearchBy = true;
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      const existingSearchValue = this.searchByDataHistory[opt.dataset_id]?.searchValue || '';

      if (matchingFilter) {
        const allOptions = matchingFilter.optionFilter
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({
            key: item.name,
            value: item.value
          }));

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

  resetCurrentFilter(datasetId: number, dataSetName: string, filterName: string): void {
    if (filterName === 'RM') {
      this.rmUserFilter.selectedFilter = [];
      this.selectedRmUsers = [];
      this.rmUserFilter.searchValue = '';
      this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
    } else {
      // Resolve the actual filter_name key from the display name
      const matchingOpt = this.searchByOptionsTopBar.find(opt => opt.key === filterName);
      const actualFilterName = matchingOpt ? matchingOpt.filter_name : filterName;

      if (actualFilterName && this.selectedItemsMap[actualFilterName]) {
        this.selectedItemsMap[actualFilterName] = [];
      }

      const matchingFilter = this.topBarFilters.find(f => f.name === filterName);
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

      // If city was reset, also refresh RM options
      if (matchingOpt && matchingOpt.key === 'City') {
        this.getRmByCities();
      }
    }

    this.activeFilterMenu = null;
    this.applySearchByFilter();
  }

  resetAllSearchByFilters(): void {
    this.selectedCustomerType = 'ALL';
    this.selectedCustomerTypeValue = 0;

    this.selectedItemsMap = {};
    this.searchByOptionsTopBar.forEach(opt => {
      this.selectedItemsMap[opt.filter_name] = [];
    });

    this.rmUserFilter.selectedFilter = [];
    this.rmUserFilter.searchValue = '';
    this.selectedRmUsers = [];

    this.topBarFilters.forEach(filter => {
      filter.selectedFilter = [];
      filter.searchValue = '';
    });

    Object.keys(this.searchByDataHistory).forEach(key => {
      this.searchByDataHistory[key].searchValue = '';
      this.searchByDataHistory[key].isCalled = false;
    });

    this.activeFilterMenu = null;

    this.getTopBarFilterForRM();
    this.applySearchByFilter();
  }

  applySearchByFilter(): void {
    // Sync selectedItemsMap back into topBarFilters
    this.searchByOptionsTopBar.forEach(opt => {
      const matchingFilter = this.topBarFilters.find(f => f.name === opt.key);
      if (matchingFilter) {
        matchingFilter.selectedFilter = this.selectedItemsMap[opt.filter_name] || [];
      }
    });

    // Close the filter detail view
    this.activeFilterMenu = null;

    // Reset pagination to page 1
    this.corporatePageNumber = 1;

    // Refresh category stats and announcements table
    this.fetchStatsData();
    this.selectSubCategory(this.selectedSubCategory || 'All');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH BY HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extract city IDs from selectedItemsMap for the City filter.
   */
  getCityIds(): any[] {
    const cityFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'City');
    const filterName = cityFilter ? cityFilter.filter_name : null;
    if (!filterName) return [];
    return (this.selectedItemsMap[filterName] || []).map(item => item.value);
  }

  /**
   * Extract RM employee codes from rmUserFilter.selectedFilter.
   */
  getRmCodes(): string[] {
    return (this.rmUserFilter.selectedFilter || []).map((rm: any) => rm.empCode);
  }

  /**
   * Extract parent company IDs from selectedItemsMap for the Parent Company filter.
   */
  getParentCompanyIds(): any[] {
    const parentCompanyFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'Parent Company');
    const filterName = parentCompanyFilter ? parentCompanyFilter.filter_name : null;
    if (!filterName) return [];
    return (this.selectedItemsMap[filterName] || []).map(item => item.value);
  }

  getSegmentIds(): any[] {
    const segmentFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'Segment');
    const filterName = segmentFilter ? segmentFilter.filter_name : null;
    if (!filterName) return [];
    return (this.selectedItemsMap[filterName] || []).map(item => item.value);
  }

  getParentCountryValues(): any[] {
    const filter = this.searchByOptionsTopBar.find(opt => opt.key === 'Parent Country');
    const filterName = filter ? filter.filter_name : null;
    if (!filterName) return [];
    return (this.selectedItemsMap[filterName] || []).map(item => item.value);
  }

  getParentCompanyValues(): any[] {
    const filter = this.searchByOptionsTopBar.find(opt => opt.key === 'Parent Company');
    const filterName = filter ? filter.filter_name : null;
    if (!filterName) return [];
    return (this.selectedItemsMap[filterName] || []).map(item => item.value);
  }

  /**
   * Check if a specific filter should be hidden based on customer type.
   * In My Portfolio, all filters are always visible regardless of customer type.
   */
  shouldHideFilter(filterName: string): boolean {
    // City filter is only available when a specific customer type (ETB/TARGET) is selected
    if (filterName === 'City' && this.selectedCustomerType === 'ALL') {
      return true;
    }
    // Parent Company and Parent Country are only shown for ETB
    if (filterName === 'Parent Company' || filterName === 'Parent Country') {
      return this.selectedCustomerType !== 'ETB';
    }
    // Segment is available for ETB and TARGET
    if (filterName === 'Segment' && this.selectedCustomerType === 'ALL') {
      return true;
    }
    return false;
  }

  /**
   * Check if the RM filter should be hidden.
   * In My Portfolio, the RM filter is always visible.
   */
  isRmFilterHidden(): boolean {
    return false;
  }
  openMyportfolioSubscribePopup(): void {
    const userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    const roleId = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true);

    const parentCategory = this.selectedParentCategory || 'All';

    // Extract CINs of companies selected via table checkboxes
    const preSelectedCompanyCins: string[] = this.corporateDetails
      .filter(item => this.selectedAnnouncementIds.has(item.id))
      .map(item => item.runCIN)
      .filter((cin: string) => !!cin)
      .filter((cin: string, index: number, arr: string[]) => arr.indexOf(cin) === index); // deduplicate

    // Fetch subcategories from master mapping table
    const subcategoryCallback = (allSubcategories: string[]) => {
      // Fetch existing subscriptions
      this.msmeService.getMyPortfolioSubscriptions({ userId, category: parentCategory }).subscribe({
        next: (subsRes: any) => {
          const subscribedCompanies: string[] = subsRes?.data?.subscribedCompanies || [];
          const subscribedSubcategories: string[] = subsRes?.data?.subscribedSubcategories || [];
          const subscribedMap: { [cin: string]: string[] } = subsRes?.data?.subscribedMap || {};

          const dialogRef = this.dialog.open(MyportfolioSubscribePopupComponent, {
            data: {
              userId,
              roleId: roleId ? Number(roleId) : null,
              parentCategory,
              allSubcategories,
              subscribedCompanies,
              subscribedSubcategories,
              subscribedMap,
              preSelectedCompanyCins
            },
            panelClass: ['popupMain_design'],
            autoFocus: false,
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.fetchStatsData();
              this.fetchSubscriptionCounts(this.buildPayload());
              this.fetchSubscriptionStatus();
            }
          });
        },
        error: (err) => {
          console.error('Error fetching subscriptions:', err);
          const dialogRef = this.dialog.open(MyportfolioSubscribePopupComponent, {
            data: {
              userId,
              roleId: roleId ? Number(roleId) : null,
              parentCategory,
              allSubcategories,
              subscribedCompanies: [],
              subscribedSubcategories: [],
              subscribedMap: {},
              preSelectedCompanyCins
            },
            panelClass: ['popupMain_design'],
            autoFocus: false,
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.fetchStatsData();
              this.fetchSubscriptionCounts(this.buildPayload());
              this.fetchSubscriptionStatus();
            }
          });
        }
      });
    };

    // Call the master mapping API for subcategories
    if (parentCategory !== 'All') {
      this.msmeService.getSubcategoriesByParentCategory(parentCategory).subscribe({
        next: (subcatRes: any) => {
          const allSubcategories: string[] = subcatRes || [];
          subcategoryCallback(allSubcategories);
        },
        error: () => {
          subcategoryCallback([]);
        }
      });
    } else {
      subcategoryCallback([]);
    }
  }

  /**
   * Return the count of selected items for a given filter.
   * For the RM filter, returns the count from rmUserFilter.selectedFilter.
   * For topbar filters, returns the count from selectedItemsMap.
   */
  getSelectedCount(filterName: string): number {
    if (filterName === 'RM') {
      return this.rmUserFilter.selectedFilter.length;
    }
    return (this.selectedItemsMap[filterName] || []).length;
  }

  /**
   * Fetch RM users filtered by selected cities.
   * Called when city selection changes to update the RM filter options.
   */
  getRmByCities(): void {
    const cityFilter = this.searchByOptionsTopBar.find(opt => opt.key === 'City');
    const cityFilterName = cityFilter ? cityFilter.filter_name : null;
    const cityIds = cityFilterName ? (this.selectedItemsMap[cityFilterName] || []) : [];

    if (cityIds.length > 0) {
      this.msmeService.getRmByCities({ listOfCity: cityIds }).subscribe({
        next: (response: any) => {
          if (response && response.status == 200 && response.data) {
            this.rmUserFilter.optionFilter = response.data.rmUsers || [];
          }
        },
        error: (err) => {
          console.error('Error fetching RM by cities:', err);
        }
      });
    } else {
      // No cities selected — restore original RM list
      this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
    }
  }

  /**
   * Filter the checkbox list options in the detail view based on search text.
   * For RM filter, filters rmUserFilter.originalOptionFilter by firstName match.
   * For topbar filters, filters the current dependantFilters by key match.
   */
  searchFilterOptions(searchValue: string): void {
    if (this.activeFilterMenu === 'RM') {
      this.rmUserFilter.searchValue = searchValue;
      if (searchValue.trim().length > 0) {
        this.rmUserFilter.optionFilter = this.rmUserFilter.originalOptionFilter.filter(rm =>
          rm.firstName?.toLowerCase().includes(searchValue.toLowerCase())
        );
      } else {
        this.rmUserFilter.optionFilter = [...this.rmUserFilter.originalOptionFilter];
      }
    } else {
      const matchingFilter = this.topBarFilters.find(f => f.name === this.activeFilterMenu);

      // Parent Company: use API search
      if (matchingFilter && matchingFilter.name === 'Parent Company' && matchingFilter.isApiCallSearch) {
        if (this.selectedFilterOption?.dataset_id && this.searchByDataHistory[this.selectedFilterOption.dataset_id]) {
          this.searchByDataHistory[this.selectedFilterOption.dataset_id].searchValue = searchValue;
        }
        if (searchValue.trim().length >= 3 || searchValue.trim().length === 0) {
          this.handleParentCompanySearch(searchValue);
        }
        return;
      }

      // Other filters: client-side search
      if (matchingFilter) {
        const allOptions = matchingFilter.optionFilter
          .filter(item => item.name !== 'All' && item.value !== 'All')
          .map(item => ({ key: item.name, value: item.value }));

        if (searchValue.trim().length > 0) {
          this.dependantFilters = allOptions.filter(item =>
            item.key.toLowerCase().includes(searchValue.toLowerCase())
          );
        } else {
          this.dependantFilters = allOptions;
        }
      }

      if (this.selectedFilterOption?.dataset_id && this.searchByDataHistory[this.selectedFilterOption.dataset_id]) {
        this.searchByDataHistory[this.selectedFilterOption.dataset_id].searchValue = searchValue;
      }
    }
  }

  handleParentCompanySearch(searchText: string): void {
    this.isLoadingSearchBy = true;
    this.parentCompanyPage = 0;
    this.parentCompanyHasMore = true;
    this.dependantFilters = [];

    this.msmeService.searchParentCompany(searchText, 0, this.parentCompanyPageSize).subscribe({
      next: (response: any) => {
        this.isLoadingSearchBy = false;
        if (response && response.status === 200 && response.data) {
          const data = response.data;
          this.dependantFilters = (data.content || []).map((item: any) => ({
            key: item.name,
            value: item.value
          }));
          this.parentCompanyHasMore = data.hasMore || false;
          this.parentCompanyPage = 1;

          if (this.selectedFilterOption?.dataset_id && this.searchByDataHistory[this.selectedFilterOption.dataset_id]) {
            this.searchByDataHistory[this.selectedFilterOption.dataset_id].data = this.dependantFilters;
            this.searchByDataHistory[this.selectedFilterOption.dataset_id].isCalled = true;
          }
        }
      },
      error: (error) => {
        this.isLoadingSearchBy = false;
        console.error('Error searching Parent Company:', error);
      }
    });
  }

  /**
   * Check if an item is selected in selectedItemsMap for a given filter.
   */
  isItemSelected(item: any, filterName: string): boolean {
    if (!filterName || !this.selectedItemsMap[filterName]) return false;
    return this.selectedItemsMap[filterName].some(selected => selected.value === item.value);
  }

  /**
   * Toggle an item's selection in selectedItemsMap for a given filter.
   */
  toggleItemSelection(item: any, filterName: string): void {
    if (!filterName) return;
    if (!this.selectedItemsMap[filterName]) {
      this.selectedItemsMap[filterName] = [];
    }
    const index = this.selectedItemsMap[filterName].findIndex(selected => selected.value === item.value);
    if (index > -1) {
      this.selectedItemsMap[filterName].splice(index, 1);
    } else {
      this.selectedItemsMap[filterName].push(item);
    }
  }

  /**
   * Check if an RM is selected in rmUserFilter.selectedFilter.
   */
  isRmSelected(rm: any): boolean {
    return (this.rmUserFilter.selectedFilter || []).some((selected: any) => selected.empCode === rm.empCode);
  }

  /**
   * Toggle an RM's selection in rmUserFilter.selectedFilter.
   */
  toggleRmSelection(rm: any): void {
    if (!this.rmUserFilter.selectedFilter) {
      this.rmUserFilter.selectedFilter = [];
    }
    const index = this.rmUserFilter.selectedFilter.findIndex((selected: any) => selected.empCode === rm.empCode);
    if (index > -1) {
      this.rmUserFilter.selectedFilter.splice(index, 1);
    } else {
      this.rmUserFilter.selectedFilter.push(rm);
    }
    this.selectedRmUsers = this.rmUserFilter.selectedFilter.map((r: any) => r.empCode);
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

  // ── My Team button (placeholder for future use) ──

  openTeamStructurePopup(): void {
    // TODO: Wire up team structure popup when needed
    console.log('My Team popup - to be implemented');
  }
}
