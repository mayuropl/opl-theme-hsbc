import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';

@Component({
  selector: 'app-bureau-report-refresh-popup',
  templateUrl: './bureau-report-refresh-popup.component.html',
  styleUrl: './bureau-report-refresh-popup.component.scss'
})
export class BureauReportRefreshPopupComponent implements OnInit{

  XdaysForCibilPing: any;
  userId: any;
  basicDetails: any;
  isDetailFetched: Boolean = false;
  panNumber : any;
  lastReportFetchDate : any;
  dynamicTimeText: string = '2 months';

  constructor(public dialogRef: MatDialogRef<BureauReportRefreshPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ,private router:Router,
    private msmeService: MsmeService,private commonService: CommonService,
    private commonMethods: CommonMethods) { 
      this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    }

    ngOnInit(): void {
      console.log(this.data);
      if (typeof this.data === 'object' && this.data.lastReportFetchDate && this.data.XdaysForCibilPing) {
        this.lastReportFetchDate = this.data.lastReportFetchDate;
        this.XdaysForCibilPing = this.data.XdaysForCibilPing;
        this.dynamicTimeText = this.commonMethods.convertDaysToReadableFormat(this.XdaysForCibilPing);
      } else {
        this.lastReportFetchDate = this.data;
      }
    }

    onYes(): void {
      this.dialogRef.close('Yes');
    }
  
    onNo(): void {
      this.dialogRef.close('No');
    }

}
