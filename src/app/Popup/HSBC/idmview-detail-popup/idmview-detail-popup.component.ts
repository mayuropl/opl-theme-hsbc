import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IncomeDashboardService } from 'src/app/services/income-dashboard.service';

@Component({
  selector: 'app-idmview-detail-popup',
  templateUrl: './idmview-detail-popup.component.html',
  styleUrl: './idmview-detail-popup.component.scss'
})
export class IdmviewDetailPopupComponent implements OnInit {

  tableData: any[] = [];
  totalRecords: number = 0;
  page: number = 1;
  pageSize: number = 5;
  loading: boolean = false;

  currentLevel: string = '';
  filters: any = {};
  title: string = '';
  viewType: 'month' | 'quarter' = 'month';
  criteria1: any;
  criteria2: any;

  tableHeaderText1: string = '';
  tableHeaderText2: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<IdmviewDetailPopupComponent>,
    private incomeService: IncomeDashboardService,
    private dialog: MatDialog // For recursive/nested popup if needed, or self-update
  ) {
    this.currentLevel = data.currentLevel;
    this.filters = data.filters;
    this.title = data.title;
    this.viewType = data.viewType;
    this.criteria1 = data.criteria1;
    this.criteria2 = data.criteria2;
  }

  ngOnInit() {
    this.calheaders();
    this.loadData();
  }

  calheaders() {
    // Re-use header logic or pass it in from parent if simpler.
    // Implementing simplified version here for self-containment
    const getLabel = (criteria: any) => {
      const yearSuffix = criteria.year ? `'${criteria.year.substr(2)}` : '\'XX';
      if (this.viewType === 'month') {
        if (!criteria.months || criteria.months.length === 0) return '';
        const start = `${criteria.months[0].substring(0, 3).toUpperCase()}${yearSuffix}`;
        if (criteria.months.length > 1) {
          const end = `${criteria.months[criteria.months.length - 1].substring(0, 3).toUpperCase()}${yearSuffix}`;
          return `${start} - ${end}`;
        }
        return start;
      } else {
        if (!criteria.quarter || criteria.quarter.length === 0) return '';
        return `${criteria.quarter[0]}${yearSuffix} - ${criteria.quarter[criteria.quarter.length - 1]}${yearSuffix}`;
      }
    };
    this.tableHeaderText1 = getLabel(this.criteria1);
    this.tableHeaderText2 = getLabel(this.criteria2);
  }

  loadData() {
    this.loading = true;
    const request = this.getPayload(this.currentLevel, this.filters, this.page - 1, this.pageSize);

    this.incomeService.getChildIncomeData(request, true).subscribe({
      next: (res) => {
        const content = res?.data?.content?.content || [];
        this.tableData = content.map((item: any) => this.mapResponseToModel(item));
        this.totalRecords = res?.data?.content?.totalElements || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching popup data', err);
        this.tableData = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadData();
  }

  history: any[] = [];

  // Drill-down within Popup (e.g. List of RMs -> Click View -> List of Master Groups)
  onDrillDown(item: any) {
    if (this.currentLevel === 'GRO') {
      // Save current state before navigating
      this.history.push({
        currentLevel: this.currentLevel,
        filters: { ...this.filters }, // Deep copy filters
        title: this.title,
        page: this.page,
        pageSize: this.pageSize
      });

      // We are viewing RMs, drilling down to Master Groups
      const nextFilters = { ...this.filters };
      // Add RM ID/Label to filters
      // GRO -> 'GRO' key
      nextFilters['GRO'] = item.id || item.label;

      this.currentLevel = 'MASTER_GROUP';
      this.filters = nextFilters;
      this.title = 'Income Distribution by Master Group';
      this.page = 1;
      this.loadData();
    }
  }

  onBack() {
    if (this.history.length > 0) {
      const prevState = this.history.pop();
      this.currentLevel = prevState.currentLevel;
      this.filters = prevState.filters;
      this.title = prevState.title;
      this.page = prevState.page;
      this.pageSize = prevState.pageSize;
      this.loadData();
    }
  }

  // Reuse helper
  mapResponseToModel(item: any): any {
    return {
      ...item,
      label: item.label, // Keep original label
      name: item.label,  // For common display
      inCountry1: item.range1Incountry,
      inBound1: item.range1Inbound,
      outBound1: item.range1Outbound,
      total1: item.range1Total,
      inCountry2: item.range2Incountry,
      inBound2: item.range2Inbound,
      outBound2: item.range2Outbound,
      total2: item.range2Total,
      growthTotal: item.growthTotal
    };
  }

  getPayload(level: string, filters: any, page: number, size: number) {
    // Duplicate payload logic from parent or move to shared service.
    // For now duplicating for speed/independence.
    let r1Start = '', r1End = '', r2Start = '', r2End = '';

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
      // Limited support for quarter here or copy full map from parent.
      // Assuming simple string passing might be better but let's try to be consistent.
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

}
