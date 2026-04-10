import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HSNData } from 'src/app/CommoUtils/model/BuyerSellerPeer';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { HSNdetailsPopupComponent } from '../hsndetails-popup/hsndetails-popup.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products-hsncode-popup',
  templateUrl: './products-hsncode-popup.component.html',
  styleUrl: './products-hsncode-popup.component.scss'
})
export class ProductsHSNcodePopupComponent {


  exportHsnPage: PaginationSignal = new PaginationSignal();
  importHsnPage: PaginationSignal = new PaginationSignal();
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  exportHsnCodeList = [];
  importHsnCodeList = [];
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
  constructor(public dialogRef: MatDialogRef<HSNdetailsPopupComponent>, @Inject(MAT_DIALOG_DATA) public data, private router: Router) { }


  ngOnInit(): void {
    this.exportHsnCodeList = this.data?.exportHsnData;
    this.importHsnCodeList = this.data?.importHsnData;
    this.exportHsnPage.totalSize = this.exportHsnCodeList.length;
    this.importHsnPage.totalSize = this.importHsnCodeList.length;
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }
  
}
