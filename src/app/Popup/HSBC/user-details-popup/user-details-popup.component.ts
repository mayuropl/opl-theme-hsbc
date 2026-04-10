import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HSNData } from 'src/app/CommoUtils/model/BuyerSellerPeer';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
@Component({
  selector: 'app-user-details-popup', 
  templateUrl: './user-details-popup.component.html',
  styleUrl: './user-details-popup.component.scss'
})
export class UserDetailsPopupComponent {
  hsndetailsPage: PaginationSignal = new PaginationSignal();
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  hsnCodeList :HSNData[] = [];
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

  // creditRatingProxy : RatingDetail[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: HSNData[], private router: Router) { }


  ngOnInit(): void {
    this.hsnCodeList = this.data;
    this.hsndetailsPage.totalSize = this.hsnCodeList.length;
  }
 

  getCleanedLink(url): string {
    // Fix URL scheme by adding colon
    if (url) {
      if (url.startsWith('https ')) {
        url = url.replace('https ', 'https://');
      } else if (url.startsWith('http ')) {
        url = url.replace('http ', 'http://');
      }
    }

    // Return the corrected URL
    return url;
  }
}
