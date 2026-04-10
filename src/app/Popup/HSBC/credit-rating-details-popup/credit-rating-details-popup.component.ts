import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { RatingDetail } from 'src/app/Component/pages/HSBC/existingPortfolio/rm-exisiting-portfolio-view/firmDetailsModel';

@Component({
  selector: 'app-credit-rating-details-popup',
  templateUrl: './credit-rating-details-popup.component.html',
  styleUrl: './credit-rating-details-popup.component.scss'
})
export class CreditRatingDetailsPopupComponent {

  creditRatingProxyPag: PaginationSignal = new PaginationSignal();
  crisilBankerLevelRatingPage :PaginationSignal = new PaginationSignal();
  crisilCompanyLevelRatingPage :PaginationSignal = new PaginationSignal();

  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  amountUnit: String;
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
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
  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  creditRatingProxy : RatingDetail[] = [];

  crisilCompanyCIN:any;
  crisilCompanyPAN:any;
  crisilCompanyLevelRatingData: any =[];
  crisilBankerLevelRatingData: any =[];

  // Add sorted data arrays
  sortedCompanyData: any[] = [];
  sortedBankerData: any[] = [];

  companySortField: string = null;
  companySortDirection: 'ASC' | 'DESC' = 'ASC';
  bankerSortField: string = null;
  bankerSortDirection: 'ASC' | 'DESC' = 'ASC';
  pageData: any = {};
  constants: any = [];
  psgeGstList: any = [];
  protected readonly consValue = Constants;

  constructor(public dialogRef: MatDialogRef<CreditRatingDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RatingDetail[],private router:Router, public commonService:CommonService, private datePipe: DatePipe) { }

  ngOnInit(): void {
    if(history?.state?.data) {
      this.commonService.setStorage('historyState', JSON.stringify(history?.state));
      this.pageData = history?.state?.data;
    }
    this.creditRatingProxy = this.data;
    this.creditRatingProxyPag.totalSize = this.creditRatingProxy.length;

    this.commonService.currentBankerData.subscribe(data => {
      if (data && !this.commonService.isObjectNullOrEmpty(data)) {
        this.crisilBankerLevelRatingData = data;
        this.sortedBankerData = [...this.filteredCrisilBankerLevelRatingData];

        // Update totalSize with filtered data count
        if(!this.commonService.isObjectNullOrEmpty(this.filteredCrisilBankerLevelRatingData))
        this.crisilBankerLevelRatingPage.totalSize = this.filteredCrisilBankerLevelRatingData.length;
      }
    });

     // Company Level Data Subscription
    this.commonService.currentCompanyData.subscribe(response => {
      if (response && !this.commonService.isObjectNullOrEmpty(response)) {
        this.crisilCompanyLevelRatingData = response.data;
        this.crisilCompanyCIN = response.cin;
        this.crisilCompanyPAN = response.pan;
        this.sortedCompanyData = [...this.filteredCrisilCompanyLevelRatingData];

        // Update totalSize with filtered data count
        if(!this.commonService.isObjectNullOrEmpty(this.filteredCrisilCompanyLevelRatingData))
        this.crisilCompanyLevelRatingPage.totalSize = this.filteredCrisilCompanyLevelRatingData.length;
      }
    });
  }

  toggleSort(column: string,direction:string, dontCallApi?: boolean){
    // if (this.currentSortField === column) {
    //   this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.currentSortField = column;
    //   this.sortDirection = 'ASC';
    // }
    if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    if(dontCallApi && this.currentSortField==("Amount")){
      this.getSortedData();
    }

    if(dontCallApi && this.currentSortField==("ratingDate")){
      this.getSortedData2();
    }
  }

  toggleCompanySort(column: string,direction:string) {
    // if (this.companySortField === column) {
    //   this.companySortDirection = this.companySortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.companySortField = column;
    //   this.companySortDirection = 'ASC';
    // }
    if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    this.crisilCompanyLevelRatingPage.page.set(1);
  }

  toggleBankerSort(column: string,direction:string) {
    // if (this.bankerSortField === column) {
    //   this.bankerSortDirection = this.bankerSortDirection === 'ASC' ? 'DESC' : 'ASC';
    // } else {
    //   this.bankerSortField = column;
    //   this.bankerSortDirection = 'ASC';
    // }
    if(this.currentSortField != column){
      this.currentSortField=column;
    }
    this.sortDirection = direction === 'ASC' ? 'ASC' : 'DESC';
    this.crisilBankerLevelRatingPage.page.set(1);
  }

  get sortedFilteredCrisilBankerData() {
    const data = this.filteredCrisilBankerLevelRatingData;

    if (!this.bankerSortField) return data;

    const direction = this.bankerSortDirection === 'ASC' ? 1 : -1;

    return [...data].sort((a, b) => {
      let valA: any, valB: any;

      switch (this.bankerSortField) {
        case 'Amount':
          valA = this.parseAmount(a.ratedBankerAmount);
          valB = this.parseAmount(b.ratedBankerAmount);
          break;
        case 'ratingDate':
          valA = this.parseDate(a.prDate);
          valB = this.parseDate(b.prDate);
          break;
        default:
          valA = a[this.bankerSortField];
          valB = b[this.bankerSortField];
      }

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  get sortedFilteredCrisilCompanyData() {
    const data = this.filteredCrisilCompanyLevelRatingData;

    if (!this.companySortField) return data;

    const direction = this.companySortDirection === 'ASC' ? 1 : -1;

    return [...data].sort((a, b) => {
      let valA: any, valB: any;

      switch (this.companySortField) {
        case 'Amount (INR)':
          valA = this.parseAmount(a.amount);
          valB = this.parseAmount(b.amount);
          break;
        case 'ratingDate':
          valA = this.parseDate(a.PR_DATE);
          valB = this.parseDate(b.PR_DATE);
          break;
        default:
          valA = a[this.companySortField];
          valB = b[this.companySortField];
      }

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  // Helper method to parse amounts (handles null, undefined, and string values)
  private parseAmount(value: any): number {
    if (this.commonService.isObjectNullOrEmpty(value) || value === undefined) {
      return 0;
    }
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  // Helper method to parse dates (handles null, undefined, and various date formats)
  private parseDate(value: any): number {
    if (!value) {
      return 0;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  }

  getSortedData2(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;

    this.creditRatingProxy = this.data.sort((a, b) => {
      const dateA = this.parseDate(a[sortField]);
      const dateB = this.parseDate(b[sortField]);

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

    this.creditRatingProxy = this.data.sort((a, b) => {
      const amountA = this.parseAmount(a[sortField]);
      const amountB = this.parseAmount(b[sortField]);
      const diff = amountA - amountB;
      return sortDirection === 'ASC' ? diff : -diff;
    });
  }

  //  getSortedData2(): void {
  //   const sortField = this.currentSortField;
  //   const sortDirection = this.sortDirection;

  //   this.creditRatingProxy = this.data.sort((a, b) => {
  //     const dateA = new Date(a[sortField]).getTime();
  //     const dateB = new Date(b[sortField]).getTime();

  //     if (sortDirection === 'ASC') {
  //       return dateA - dateB;
  //     } else {
  //       return dateB - dateA;
  //     }
  //   });
  // }

  // getSortedData(): void {
  //   const sortField = this.currentSortField;
  //   const sortDirection = this.sortDirection;

  //   this.creditRatingProxy = this.data.sort((a, b) => {
  //     const diff = a[sortField] - b[sortField];
  //     return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
  //   });
  // }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  getCleanedLink(url): string {
    // Fix URL scheme by adding colon
    if(url){
      if (url.startsWith('https ')) {
        url = url.replace('https ', 'https://');
      } else if (url.startsWith('http ')) {
        url = url.replace('http ', 'http://');
      }
    }

    // Return the corrected URL
    return url;
  }

  get filteredCrisilBankerLevelRatingData() {
    if (!this.commonService.isObjectNullOrEmpty(this.crisilBankerLevelRatingData)) {
      const splitData = [];

      // for (const record of this.crisilBankerLevelRatingData) {
      //   const hasLT = !!record['longTermRating'];
      //   const hasST = !!record['shortTermRating'];

      //   if (hasLT) {
      //     splitData.push({...record, type: 'LT', rating: record['longTermRating'], amount: record['ltAmount'],});
      //   }

      //   if (hasST) {
      //     splitData.push({...record, type: 'ST', rating: record['shortTermRating'], amount: record['stAmount'],});
      //   }
      // }

      for (const record of this.crisilBankerLevelRatingData) {
        splitData.push({...record});
      }

      return splitData;

      // return splitData.sort((a, b) =>
      //   new Date(b['prDate']).getTime() - new Date(a['prDate']).getTime()
      // );
    }
    return [];
  }

  get paginatedFilteredData() {
    const dataToUse = this.sortedFilteredCrisilBankerData;
    if (!this.commonService.isObjectNullOrEmpty(dataToUse)) {
      const startIndex = (this.crisilBankerLevelRatingPage.page() - 1) * this.crisilBankerLevelRatingPage.pageSize();
      const endIndex = startIndex + this.crisilBankerLevelRatingPage.pageSize();
      return dataToUse.slice(startIndex, endIndex);
    }
    return [];
  }

  get filteredCrisilCompanyLevelRatingData() {
    if (!this.commonService.isObjectNullOrEmpty(this.crisilCompanyLevelRatingData)) {
      const splitData = [];

      for (const data of this.crisilCompanyLevelRatingData) {
        const matchesCINorPAN = data?.['CIN'] === this.crisilCompanyCIN || data?.['PAN'] === this.crisilCompanyPAN;
        if (!matchesCINorPAN) continue;

        const hasLT = !!data?.['LT_RATING_ALL'];
        const hasST = !!data?.['ST_RATING_ALL'];

        if (hasLT) {
          splitData.push({...data, type: 'LT', rating: data['LT_RATING_ALL'], amount: data['LT_AMOUNT'],});
        }

        if (hasST) {
          splitData.push({...data, type: 'ST', rating: data['ST_RATING_ALL'], amount: data['ST_AMOUNT'],});
        }
      }
      return splitData;

      // return splitData.sort((a, b) =>
      //   new Date(b?.['PR_DATE']).getTime() - new Date(a?.['PR_DATE']).getTime()
      // );
    }
    return [];
  }

  get paginatedFilteredCompanyData() {
    const dataToUse = this.sortedFilteredCrisilCompanyData;
    if (!this.commonService.isObjectNullOrEmpty(dataToUse)) {
      const startIndex = (this.crisilCompanyLevelRatingPage.page() - 1) * this.crisilCompanyLevelRatingPage.pageSize();
      const endIndex = startIndex + this.crisilCompanyLevelRatingPage.pageSize();
      return dataToUse.slice(startIndex, endIndex);
    }
    return [];
  }
  isActionAvailforSubpage(subPageId: any, actionId: string): boolean {
    const matchedSubPage = this.pageData?.subpages?.find(sub => sub.subpageId === subPageId);
    const matchedSubPageAction = matchedSubPage?.actions?.find(action => action.actionId === actionId);
    if (matchedSubPageAction) {
      return true;
    }
    return false;
  }

  dateConvert(date:any){
    return this.datePipe.transform(date, 'dd MMM yyyy');
  }
}
