import { Component, OnInit } from '@angular/core';
import { Location, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { GlobalHeaders } from "../../../../CommoUtils/global-headers";

@Component({
  selector: 'app-hsbc-trail-log',
  templateUrl: './hsbc-trail-log.component.html',
  styleUrls: ['./hsbc-trail-log.component.scss']
})
export class HSBCTrailLogComponent implements OnInit {

  routerData: any;
  breadCrumbItems: Array<{}>;

  // page number
  page = 1;
  // default page size
  pageSize = 10;

  // start and end index
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  PageSelectNumber: any[] = [
    { name: '10', value: 10 },
    { name: '20', value: 20 },
    { name: '50', value: 50 },
    { name: '100', value: 100 },
  ];

  trailLogList: any = [];
  allTrails: any = []; // Store all trails for pagination
  isLoading = false;
  applicationId: any;
  
  // Additional data from API
  pan: string;
  companyName: string;
  totalTrails: number;
  firstTrailDate: string;
  lastTrailDate: string;
  journeyDurationMinutes: number;

  constructor(
    private msmeService: MsmeService,
    private commonService: CommonService,
    private location: Location,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', path: '/' },
      { label: 'Trail Log', path: '/', active: true }
    ];

    GlobalHeaders['x-page-action'] = '';
    GlobalHeaders['x-path-url'] = 'hsbc/trailLog';
    GlobalHeaders['x-main-page'] = 'Trail Log';

    // Get data from router state
    if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      this.applicationId = this.routerData?.applicationId;
    }

    if (this.applicationId) {
      this.getTrailLogData();
    } else {
      this.commonService.errorSnackBar('Application ID not found');
    }
  }

  getTrailLogData() {
    this.isLoading = true;

    this.msmeService.getTrailLogData(this.applicationId).subscribe(
      (res) => {
        this.isLoading = false;
        if (res && res.status === 200) {
          if (res.data) {
            const data = res.data;
            
            // Store header information
            this.pan = data.pan || '-';
            this.companyName = data.companyName || '-';
            this.totalTrails = data.totalTrails || 0;
            this.firstTrailDate = data.firstTrailDate || '-';
            this.lastTrailDate = data.lastTrailDate || '-';
            this.journeyDurationMinutes = data.journeyDurationMinutes || 0;
            
            // Store all trails
            this.allTrails = data.trails || [];
            this.totalSize = this.allTrails.length;
            
            // Apply pagination
            this.updateDisplayedTrails();
          } else {
            // No data available
            this.resetTrailData();
            this.commonService.warningSnackBar('No trail data available for this application');
          }
        } else {
          // API returned error status
          this.resetTrailData();
          this.commonService.warningSnackBar(res?.message || 'Failed to load trail data');
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.resetTrailData();
        // Silently handle API errors - don't show error message for missing trail data
      }
    );
  }

  resetTrailData() {
    this.pan = '-';
    this.companyName = '-';
    this.totalTrails = 0;
    this.firstTrailDate = '-';
    this.lastTrailDate = '-';
    this.journeyDurationMinutes = 0;
    this.allTrails = [];
    this.trailLogList = [];
    this.totalSize = 0;
  }

  updateDisplayedTrails() {
    const start = this.startIndex;
    const end = this.startIndex + this.pageSize;
    this.trailLogList = this.allTrails.slice(start, end);
  }

  onPageChange(page: any): void {
    this.page = page;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.updateDisplayedTrails();
  }

  onPageSizeChange(newPageSize: any): void {
    this.pageSize = newPageSize;
    this.page = 1;
    this.startIndex = 0;
    this.updateDisplayedTrails();
  }

  goBack() {
    // Get the saved tab value to navigate back to correct tab
    const savedFilters = localStorage.getItem('rm_dashboard_filters');
    let fragment = '';
    
    if (savedFilters) {
      try {
        const filterState = JSON.parse(savedFilters);
        // Set fragment based on saved tab value (1=In-process, 2=Completed)
        fragment = filterState.tabValue === 2 ? '#completed' : '#inprocess';
      } catch (error) {
        console.error('Error parsing saved filters:', error);
      }
    }
    
    // Navigate back to RM Dashboard with fragment
    this.router.navigate(['/hsbc/rmDashboard'], { fragment: fragment.replace('#', '') });
  }

  formatTimestamp(dateString: string): string {
    if (!dateString) return '-';
    try {
      return this.datePipe.transform(dateString, Constants.DATE_FORMAT.TRAIL_TIMESTAMP) || '-';
    } catch (error) {
      return dateString; // Return original if formatting fails
    }
  }
}
