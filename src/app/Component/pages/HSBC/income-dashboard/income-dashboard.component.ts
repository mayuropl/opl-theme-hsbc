import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IncomeDashboardService } from 'src/app/services/income-dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { IdmviewDetailPopupComponent } from '../../../../Popup/HSBC/idmview-detail-popup/idmview-detail-popup.component';

@Component({
  selector: 'app-income-dashboard',
  templateUrl: './income-dashboard.component.html',
  styleUrl: './income-dashboard.component.scss'
})
export class IncomeDashboardComponent implements OnInit {
  // isCollapsed: boolean = true; // Removed global state
  viewType: 'month' | 'quarter' = 'quarter';
  hasData: boolean = false;
  tableHeaderText: string = '';
  tableHeaderText1: string = '';
  tableHeaderText2: string = '';
  segmentData: any[] = [];
  businessLineData: any[] = [];

  // Pagination Table 1
  page1: number = 1;
  pageSize1: number = 5; // default as per requirement/convention
  totalRecords1: number = 0;
  totalFooter1: any;

  // Pagination Table 2
  page2: number = 1;
  pageSize2: number = 5;
  totalRecords2: number = 0;
  totalFooter2: any;

  years: string[] = [];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  quarters: string[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  criteria1 = {
    year: '',
    months: [] as string[],
    quarter: [] as string[]
  };

  criteria2 = {
    year: '',
    months: [] as string[],
    quarter: [] as string[]
  };

  selectedDurationLabel: string = 'Select Year & Period';

  constructor(private incomeService: IncomeDashboardService, private cdr: ChangeDetectorRef, private dialog: MatDialog) { }

  ngOnInit() {
    console.log('IncomeDashboardComponent initialized');
    this.initializeDefaults();
  }

  initializeDefaults() {
    console.log('Initializing defaults...');
    const today = new Date();
    const currentMonthIndex = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    // 1. Setup Month defaults (background fallback for Month view)
    let endMonthIdx = currentMonthIndex;
    let startMonthIdx = currentMonthIndex - 2;
    if (startMonthIdx < 0) startMonthIdx = 0;
    const selectedMonths = [];
    for (let i = startMonthIdx; i <= endMonthIdx; i++) {
      selectedMonths.push(this.months[i]);
    }
    this.criteria1.months = [...selectedMonths];
    this.criteria2.months = [...selectedMonths];

    // 2. Setup Quarter Defaults (The Active View)
    const currentQIdx = Math.floor(currentMonthIndex / 3);
    const prevQIdx = currentQIdx === 0 ? 3 : currentQIdx - 1;

    // Years Logic
    const year1 = currentYear.toString();
    const year2 = (currentQIdx === 0) ? (currentYear - 1).toString() : currentYear.toString();

    this.criteria1.quarter = [this.quarters[currentQIdx]];
    this.criteria2.quarter = [this.quarters[prevQIdx]];

    // Fetch Dynamic Years
    this.incomeService.getFilterOptions().subscribe({
      next: (res) => {
        const years = res?.data?.years || [];
        if (years.length > 0) {
          this.years = years.sort((a: string, b: string) => parseInt(b) - parseInt(a));

          if (this.years.includes(year1)) {
            this.criteria1.year = year1;
            this.criteria2.year = year2;
          } else {
            const latestYear = this.years[0];
            this.criteria1.year = latestYear;
            this.criteria2.year = latestYear;
            this.criteria1.quarter = ['Q4'];
            this.criteria2.quarter = ['Q3'];
          }
        } else {
          this.fallbackYears();
          this.criteria1.year = year1;
          this.criteria2.year = year2;
        }

        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching filter options', err);
        this.fallbackYears();
        // Ensure defaults override fallback
        this.criteria1.year = year1;
        this.criteria2.year = year2;
        this.applyFilter();
        this.cdr.detectChanges();
      }
    });

    console.log('Defaults initialized:', this.criteria1, this.criteria2);
  }

  fallbackYears() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const prevYear = currentYear - 1;
    this.years = [currentYear.toString(), prevYear.toString()];
    this.criteria1.year = currentYear.toString();
    this.criteria2.year = prevYear.toString();
  }


  onViewTypeChange(type: 'month' | 'quarter') {
    this.viewType = type;
    this.resetSelections();
  }

  resetSelections() {
    this.criteria1 = { year: '', months: [], quarter: [] };
    this.criteria2 = { year: '', months: [], quarter: [] };
    this.hasData = false;
    this.selectedDurationLabel = 'Select Year & Period';
    this.tableHeaderText1 = '';
    this.tableHeaderText2 = '';
  }

  onMonthChange(criteriaKey: 'criteria1' | 'criteria2') {
    const selectedMonths = this[criteriaKey].months;
    if (!selectedMonths || selectedMonths.length < 2) return;

    // Get indices of selected months
    const indices = selectedMonths.map(m => this.months.indexOf(m)).sort((a, b) => a - b);

    // Check if we need to fill gaps
    const start = indices[0];
    const end = indices[indices.length - 1];

    // If range size > selected count, we have gaps
    if ((end - start + 1) > indices.length) {
      const newSelection: string[] = [];
      for (let i = start; i <= end; i++) {
        newSelection.push(this.months[i]);
      }
      this[criteriaKey].months = newSelection;
    }
  }

  onQuarterChange(criteriaKey: 'criteria1' | 'criteria2') {
    const selectedQuarters = this[criteriaKey].quarter;
    if (!selectedQuarters || selectedQuarters.length < 2) return;

    const indices = selectedQuarters.map(q => this.quarters.indexOf(q)).sort((a, b) => a - b);

    const start = indices[0];
    const end = indices[indices.length - 1];

    if ((end - start + 1) > indices.length) {
      const newSelection: string[] = [];
      for (let i = start; i <= end; i++) {
        newSelection.push(this.quarters[i]);
      }
      this[criteriaKey].quarter = newSelection;
    }
  }

  getLabel(criteria: any): string {
    const yearSuffix = criteria.year ? `'${criteria.year.substr(2)}` : '\'XX';

    if (this.viewType === 'month') {
      if (criteria.months.length === 0) return '';
      const start = `${criteria.months[0].substr(0, 3)}${yearSuffix}`;
      if (criteria.months.length > 1) {
        const end = `${criteria.months[criteria.months.length - 1].substr(0, 3)}${yearSuffix}`;
        return `${start} - ${end}`;
      }
      return start;
    } else {
      if (criteria.quarter.length === 0) return '';
      const start = `${criteria.quarter[0]}${yearSuffix}`;
      if (criteria.quarter.length > 1) {
        const end = `${criteria.quarter[criteria.quarter.length - 1]}${yearSuffix}`;
        return `${start} - ${end}`;
      }
      return start;
    }
  }

  isLoading = {
    segment: false,
    businessLine: false
  };

  applyFilter() {
    this.hasData = false;

    // Determine header texts
    this.tableHeaderText1 = this.getLabel(this.criteria1);
    this.tableHeaderText2 = this.getLabel(this.criteria2);

    // Update button placeholder
    this.selectedDurationLabel = `${this.tableHeaderText1} vs ${this.tableHeaderText2}`;

    // Reset Pagination
    this.page1 = 1;
    this.page2 = 1;

    this.hasData = true; // Show tables structure (will show "No Data" or "Loading" based on array length)
    this.loadData1(true);
    this.loadData2(true);
  }

  loadData1(ignoreLoader?) {
    this.isLoading.segment = true;
    // Subtract 1 from page1 for backend (0-indexed)
    const request = this.getPayload('SEGMENT', {}, this.page1 - 1, this.pageSize1);

    this.incomeService.getIncomeData(request, ignoreLoader).subscribe({
      next: (res) => {
        // Updated to match response structure: { data: { content: [], totalElements: number } }
        const content = res?.data?.content?.content || [];
        this.totalFooter1 = res?.data?.totals;
        this.segmentData = content.map((item: any) => this.mapResponseToModel(item));
        this.totalRecords1 = res?.data?.content?.totalElements || 0;

        this.segmentData.forEach(item => {
          item.isExpanded = false;
          item.childData = [];
          item.childPage = 1; // Initialize to 1 for UI
          item.childPageSize = 5;
          item.childTotal = 0;
          // Metadata for drilldown
          item.level = 'SEGMENT';
          item.filters = {}; // Root has no parent filters
        });
        this.isLoading.segment = false;
      },
      error: (err) => {
        console.error('Error fetching segment data', err);
        this.segmentData = [];
        this.totalRecords1 = 0;
        this.isLoading.segment = false;
      }
    });
  }

  loadData2(ignoreLoader?: any) {
    this.isLoading.businessLine = true;
    // Subtract 1 from page2 for backend (0-indexed)
    const request = this.getPayload('BUSINESS_LINE', {}, this.page2 - 1, this.pageSize2);

    this.incomeService.getIncomeData(request, ignoreLoader).subscribe({
      next: (res) => {
        const content = res?.data?.content?.content || [];
        this.businessLineData = content.map((item: any) => this.mapResponseToModel(item));
        this.totalRecords2 = res?.data?.content?.totalElements || 0;
        this.totalFooter2 = res?.data?.totals;
        this.businessLineData.forEach(item => {
          item.isExpanded = false;
          item.childData = [];
          item.childPage = 1; // Initialize to 1 for UI
          item.childPageSize = 5;
          item.childTotal = 0;
          item.level = 'BUSINESS_LINE';
          item.filters = {};
        });
        this.isLoading.businessLine = false;
      },
      error: (err) => {
        console.error('Error fetching business line data', err);
        this.businessLineData = [];
        this.totalRecords2 = 0;
        this.isLoading.businessLine = false;
      }
    });
  }

  // Parent Pagination Events
  onPageChange1(page: number) {
    this.page1 = page;
    this.loadData1(true);
  }

  onPageChange2(page: number) {
    this.page2 = page;
    this.loadData2(true);
  }

  // Child Logic
  toggleRow(item: any) {
    const isOpening = !item.isExpanded;

    // Close all other expanded rows before opening new one
    if (isOpening) {
      this.segmentData.forEach((row: any) => {
        if (row !== item) row.isExpanded = false;
      });
      this.businessLineData.forEach((row: any) => {
        if (row !== item) row.isExpanded = false;
      });
    }

    item.isExpanded = !item.isExpanded;
    if (item.isExpanded && (!item.childData || item.childData.length === 0)) {
      this.loadChildData(item);
    }
    // When row is expanded, reset parent scroll and set box width
    if (item.isExpanded) {
      setTimeout(() => {
        // Reset parent table scroll to left so inner table shows all columns
        const parentTables = document.querySelectorAll('.tableResponsive');
        parentTables.forEach((table: Element) => {
          (table as HTMLElement).scrollLeft = 0;
        });

        // Set dynamic width for box_design inside intable_td
        const screenWidth = window.innerWidth;
        const boxWidth = screenWidth - 120;
        const boxDesigns = document.querySelectorAll('.intable_td .box_design');
        boxDesigns.forEach((box: Element) => {
          (box as HTMLElement).style.width = `${boxWidth}px`;
        });
      }, 100);
    }
  }

  loadChildData(item: any) {
    // Identify which table we are in to toggle correct loader
    // A heuristic: if item is in segmentData, use segment loader.
    // However, segmentData might be large.
    // Simpler: Check if the item's level starts with SEGMENT (or if we can pass context).
    // For now we can infer or set both? No, that's bad.
    // Let's pass context or check existence.
    // Actually, `item.level` is available.
    // SEGMENT -> child is in Segment table.
    // BUSINESS_LINE -> child is in Business Line table.

    const isSegment = item.level === 'SEGMENT' || item.level === 'REGION';
    // 'BUSINESS_LINE' is the other root.
    // Note: If we drill down further, we need to know the root.
    // But currently drill down beyond L2 goes to Popup. So L1 -> L2 is all we handle here inline.

    // if (isSegment) this.isLoading.segment = true;
    // else this.isLoading.businessLine = true;
    item.isLoading = true;

    // Construct filters for next level
    // 1. Inherit parent filters
    const nextFilters = { ...item.filters };
    // 2. Add current level filter
    const currentKey = this.getFilterKey(item.level);
    if (currentKey) {
      nextFilters[currentKey] = item.id || item.label; // Use ID if available
    }

    // Subtract 1 from childPage for backend (0-indexed)
    const request = this.getPayload(item.nextLevel, nextFilters, item.childPage - 1, item.childPageSize);

    this.incomeService.getChildIncomeData(request, true).subscribe({
      next: (res) => {
        const content = res?.data?.content?.content || [];
        item.childData = content.map((child: any) => this.mapResponseToModel(child));
        item.childTotal = res?.data?.content?.totalElements || 0;

        // Propagate metadata to children
        item.childData.forEach((child: any) => {
          child.isExpanded = false;
          child.childData = [];
          child.childPage = 1;
          child.childPageSize = 10;
          child.childTotal = 0;
          child.level = item.nextLevel; // The level of *this* child
          child.filters = nextFilters; // Inherit the filters used to fetch this child
          child.isLoading = false;
        });

        // if (isSegment) this.isLoading.segment = false;
        // else this.isLoading.businessLine = false;
        item.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching child data', err);
        item.childData = [];
        item.childTotal = 0;
        // if (isSegment) this.isLoading.segment = false;
        // else this.isLoading.businessLine = false;
        item.isLoading = false;
      }
    });
  }

  onChildPageChange(item: any, page: number) {
    item.childPage = page;
    this.loadChildData(item);
  }

  // --- Helpers for Payload Construction ---

  mapResponseToModel(item: any): any {
    return {
      ...item, // Keep original properties
      name: item.label,
      rmName: item.label, // Map label to rmName for child rows if needed
      inCountry1: item.range1Incountry,
      inBound1: item.range1Inbound,
      outBound1: item.range1Outbound,
      total1: item.range1Total,
      inCountry2: item.range2Incountry,
      inBound2: item.range2Inbound,
      outBound2: item.range2Outbound,
      total2: item.range2Total,
      growthTotal: item.growthTotal
      // Add other mappings if strictly needed by template, but these cover the main columns
    };
  }

  getPayload(level: string, filters: any, page: number, size: number) {
    let r1Start = '', r1End = '', r2Start = '', r2End = '';

    // Date formatting helper: 'August', '2025' -> 'AUG-25'
    const fmt = (m: string, y: string) => {
      if (!m || !y) return '';
      const shortM = m.substring(0, 3).toUpperCase();
      const shortY = y.slice(-2);
      return `${shortM}-${shortY}`;
    };

    if (this.viewType === 'month') {
      if (this.criteria1.months && this.criteria1.months.length > 0) {
        r1Start = fmt(this.criteria1.months[0], this.criteria1.year);
        r1End = fmt(this.criteria1.months[this.criteria1.months.length - 1], this.criteria1.year);
      }
      if (this.criteria2.months && this.criteria2.months.length > 0) {
        r2Start = fmt(this.criteria2.months[0], this.criteria2.year);
        r2End = fmt(this.criteria2.months[this.criteria2.months.length - 1], this.criteria2.year);
      }
    } else {
      // Quarter Logic: Q1 -> Jan-Mar, etc.
      const qMap: any = { 'Q1': ['January', 'March'], 'Q2': ['April', 'June'], 'Q3': ['July', 'September'], 'Q4': ['October', 'December'] };

      if (this.criteria1.quarter && this.criteria1.quarter.length > 0) {
        const startQ = this.criteria1.quarter[0];
        const endQ = this.criteria1.quarter[this.criteria1.quarter.length - 1];
        r1Start = fmt(qMap[startQ][0], this.criteria1.year);
        r1End = fmt(qMap[endQ][1], this.criteria1.year);
      }
      if (this.criteria2.quarter && this.criteria2.quarter.length > 0) {
        const startQ = this.criteria2.quarter[0];
        const endQ = this.criteria2.quarter[this.criteria2.quarter.length - 1];
        r2Start = fmt(qMap[startQ][0], this.criteria2.year);
        r2End = fmt(qMap[endQ][1], this.criteria2.year);
      }
    }

    return {
      currentLevel: level,
      range1Start: r1Start,
      range1End: r1End,
      range2Start: r2Start,
      range2End: r2End,
      page: page,
      size: size,
      filters: filters
    };
  }

  getFilterKey(level: string): string | null {
    // Map Level -> Filter Key expected by Backend
    // SEGMENT -> 'SEGMENT'
    // REGION -> 'REGION'
    // GRO -> 'GRO'
    // MASTER_GROUP -> 'MASTER_GROUP'
    // BUSINESS_LINE -> 'BUSINESS_LINE'
    return level;
  }

  openDrillDownPopup(item: any) {
    // Logic to determine Level for Popup
    // Global Corporates Path: SEGMENT -> REGION -> [POPUP: GRO] -> [POPUP: MASTER_GROUP]
    // Other Path: SEGMENT -> GRO -> [POPUP: MASTER_GROUP]

    let nextLevel = '';

    // Safety check / Logic based on current item level
    if (item.level === 'REGION') {
      nextLevel = 'GRO';
    } else if (item.level === 'GRO') {
      nextLevel = 'MASTER_GROUP';
    } else if (item.level === 'SEGMENT' && item.nextLevel === 'GRO') {
      // Direct to Master Group if clicked on RM row (table L1)
      // This case might not be hit if we only click View on child rows,
      // but if table structure allows clicking segment...
      // Assuming we only click 'View' on Child Rows:
      nextLevel = 'MASTER_GROUP';
    } else {
      // Fallback or specific logic
      nextLevel = item.nextLevel || 'GRO';
    }

    // Construct Context Filters
    // We need to pass the cumulative filters to the popup
    const popupFilters = { ...item.filters };

    // Add the clicked item's ID/Label to the filter for the next level
    const currentFilterKey = this.getFilterKey(item.level);
    if (currentFilterKey) {
      popupFilters[currentFilterKey] = item.id || item.label;
    }

    const dialogRef = this.dialog.open(IdmviewDetailPopupComponent, {
      panelClass: ['popupMain_design'],
      // Pass all necessary context data
      data: {
        currentLevel: nextLevel, // The level the popup should LOAD
        filters: popupFilters,
        title: `Income Distribution by ${nextLevel === 'GRO' ? 'RM' : 'Master Group'}`,
        // Pass payload helpers or raw values if needed to reconstruct payload in popup
        viewType: this.viewType,
        criteria1: this.criteria1,
        criteria2: this.criteria2
      },
      autoFocus: false,
    });
  }

}

