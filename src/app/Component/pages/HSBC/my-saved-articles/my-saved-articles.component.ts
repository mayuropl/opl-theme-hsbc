import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DaterangepickerDirective, LocaleConfig } from 'ngx-daterangepicker-material';
import { MsmeService } from '../../../../services/msme.service';
import { CommonService } from '../../../../CommoUtils/common-services/common.service';
import { Constants } from '../../../../CommoUtils/constants';

@Component({
  selector: 'app-my-saved-articles',
  templateUrl: './my-saved-articles.component.html',
  styleUrl: './my-saved-articles.component.scss'
})
export class MySavedArticlesComponent implements OnInit, AfterViewInit {
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;
  @ViewChild('industrySelect') industrySelect: MatSelect;
  @ViewChild('sectorSelect') sectorSelect: MatSelect;
  @ViewChild('subSectorSelect') subSectorSelect: MatSelect;
  @ViewChild('developmentSelect') developmentSelect: MatSelect;
  @ViewChild('categorySelect') categorySelect: MatSelect;

  userId: any = null;

  // News data from backend
  newsCards: any[] = [];
  industryStats: any[] = [];
  totalCount = 0;
  newCount = 0;
  selectedIndustry: any = null;

  // Metadata for dropdowns
  industries: any[] = [];
  sectors: any[] = [];
  developments: any[] = [];
  categories: any[] = [];
  subSectors: any[] = [];

  // Selected filter values
  selectedIndustryIds: any[] = [];
  selectedSectorIds: any[] = [];
  selectedDevelopmentIds: any[] = [];
  selectedCategoryIds: any[] = [];
  selectedSubSectorIds: any[] = [];

  // "All" toggle tracking
  private _prevAllIndustry = false;
  private _prevAllSector = false;
  private _prevAllDevelopment = false;
  private _prevAllCategory = false;
  private _prevAllSubSector = false;

  // Date range
  calendarLocale: LocaleConfig;
  calendarPlaceholder: string;
  selectedRange: any = { startDate: moment().subtract(6, 'days'), endDate: moment() };
  calendarDisplayLabel: string = 'Last 7 Days';
  ranges: any;
  minDates: Moment;
  maxDateS: Moment;
  newsStartDate: string;
  newsEndDate: string;
  private _pickerSkipCount = 1;

  constructor(
    private msmeService: MsmeService,
    public commonService: CommonService,
    private router: Router
  ) {
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
      'Last month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')]
    };
    this.calendarPlaceholder = 'Last 7 Days';
    this.minDates = moment();
    this.maxDateS = moment();
    this.newsEndDate = moment().format('YYYY-MM-DD');
    this.newsStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    this._pickerSkipCount = 1;
    this.loadMetadata(() => {
      this.fetchNews();
    });
  }

  goBack(): void {
    this.router.navigate(['/hsbc/my-portfolio'], { queryParams: { tab: 1 } });
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



  loadMetadata(callback?: () => void): void {
    this.msmeService.getIndustryNewsMetadata().subscribe(
      (res: any) => {
        if (res && res.status === 200 && res.data) {
          const metadata = res.data;
          this.industries = metadata.industries || [];
          this.developments = metadata.developments || [];
          this.sectors = [];
          this.subSectors = [];
          this.industries.forEach((ind: any) => {
            if (ind.sectors) {
              ind.sectors.forEach((sec: any) => {
                this.sectors.push(sec);
                if (sec.subSectors) {
                  sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
                }
              });
            }
          });
          this.sectors = this.deduplicateByName(this.sectors, 'subSectors');
          this.subSectors = this.deduplicateByName(this.subSectors);
          this.categories = [];
          this.developments.forEach((dev: any) => {
            if (dev.categories) {
              dev.categories.forEach((cat: any) => this.categories.push(cat));
            }
          });
          this.categories = this.deduplicateByName(this.categories);
        }
        if (callback) { callback(); }
      },
      (err) => {
        console.error('Error loading metadata:', err);
        if (callback) { callback(); }
      }
    );
  }



  fetchNews(): void {
    const payload: any = {
      startDate: this.newsStartDate,
      endDate: this.newsEndDate,
      userId: this.userId,
      savedOnly: true,
      industryIds: this.selectedIndustry ? [this.selectedIndustry.id] : this.selectedIndustryIds.filter(v => v !== 'ALL'),
      sectorIds: this.expandMergedIds(this.selectedSectorIds.filter(v => v !== 'ALL'), this.sectors),
      subSectorIds: this.expandMergedIds(this.selectedSubSectorIds.filter(v => v !== 'ALL'), this.subSectors),
      developmentIds: this.selectedDevelopmentIds.filter(v => v !== 'ALL'),
      categoryIds: this.expandMergedIds(this.selectedCategoryIds.filter(v => v !== 'ALL'), this.categories)
    };

    this.msmeService.fetchIndustryNews(payload).subscribe(
      (res: any) => {
        if (res && res.status === 200 && res.data) {
          const newsIndustries = res.data.industries || [];
          this.totalCount = res.data.totalCount || 0;
          this.newCount = res.data.newCount || 0;
          this.newsCards = res.data.news || [];

          // Only show industries that have saved articles
          this.industryStats = newsIndustries.map((ni: any) => ({
            id: (this.industries.find((ind: any) => ind.name === ni.name) || {}).id,
            name: ni.name,
            sectors: (this.industries.find((ind: any) => ind.name === ni.name) || {}).sectors,
            totalCount: ni.totalCount || 0,
            newCount: ni.newCount || 0
          }));

          // Attach sector and subSector counts from backend to dropdown items
          const sectorCounts = res.data.sectorCounts || {};
          const subSectorCounts = res.data.subSectorCounts || {};
          this.sectors.forEach((s: any) => {
            s.count = (s.allIds || [s.id]).reduce((sum, id) => sum + (sectorCounts[id] || 0), 0);
          });
          this.subSectors.forEach((ss: any) => {
            ss.count = (ss.allIds || [ss.id]).reduce((sum, id) => sum + (subSectorCounts[id] || 0), 0);
          });
        }
      },
      (err) => console.error('Error fetching saved articles:', err)
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
      industry.sectors.forEach((sec: any) => {
        if (sec.subSectors) {
          sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
        }
      });
    } else {
      // "All" selected — flatten from all industries
      this.sectors = [];
      this.subSectors = [];
      this.industries.forEach((ind: any) => {
        if (ind.sectors) {
          ind.sectors.forEach((sec: any) => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
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

  onDateRangeChange(event: any): void {
    if (this._pickerSkipCount > 0) {
      this._pickerSkipCount--;
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
  
      this.newsStartDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
      this.newsEndDate = moment().format('YYYY-MM-DD');
      this.selectedRange = { startDate: moment().subtract(6, 'days'), endDate: moment() };
      this.calendarDisplayLabel = 'Last 7 Days';

      this.fetchNews();
    }
  }

  onRangeLabel(event: any): void {
    if (event && event.label) {
      this.calendarDisplayLabel = event.label;
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
    const selectedIndIds = this.selectedIndustryIds.filter((v: any) => v !== 'ALL');
    if (selectedIndIds.length > 0) {
      const selectedInds = this.industries.filter((ind: any) => selectedIndIds.includes(ind.id));
      this.sectors = [];
      this.subSectors = [];
      selectedInds.forEach((ind: any) => {
        if (ind.sectors) {
          ind.sectors.forEach((sec: any) => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
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
      this.industries.forEach((ind: any) => {
        if (ind.sectors) {
          ind.sectors.forEach((sec: any) => {
            this.sectors.push(sec);
            if (sec.subSectors) {
              sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
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
      this.selectedSectorIds = ['ALL', ...this.sectors.map(s => s.id)];
    } else if (!allClicked && this._prevAllSector) {
      this.selectedSectorIds = [];
    } else {
      this.selectedSectorIds = value.filter(v => v !== 'ALL');
    }
    this._prevAllSector = this.selectedSectorIds.includes('ALL');
    this.subSectors = [];
    const ids = this.selectedSectorIds.filter(v => v !== 'ALL');
    const selectedSectors = this.sectors.filter(s => ids.includes(s.id));
    selectedSectors.forEach((sec: any) => {
      if (sec.subSectors) {
        sec.subSectors.forEach((ss: any) => this.subSectors.push(ss));
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
    this.categories = [];
    const ids = this.selectedDevelopmentIds.filter(v => v !== 'ALL');
    const selectedDevs = this.developments.filter(d => ids.includes(d.id));
    selectedDevs.forEach((dev: any) => {
      if (dev.categories) {
        dev.categories.forEach((cat: any) => this.categories.push(cat));
      }
    });
    this.categories = this.deduplicateByName(this.categories);
    this.selectedCategoryIds = [];
    this._prevAllCategory = false;
    this.fetchNews();
    if (this.developmentSelect) { this.developmentSelect.close(); }
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


  unsaveArticle(card: any): void {
    if (!this.userId) return;
    const articleId = card.id;
    this.msmeService.deleteIndustryNewsArticle({ userId: this.userId, articleId }).subscribe(
      (res: any) => {
        if (res && res.status === 200) {
          this.fetchNews();
        }
      },
      (err) => console.error('Error unsaving article:', err)
    );
  }
}
