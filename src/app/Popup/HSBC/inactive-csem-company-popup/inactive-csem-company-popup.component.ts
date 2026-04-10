import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-inactive-csem-company-popup',
  templateUrl: './inactive-csem-company-popup.component.html',
  styleUrl: './inactive-csem-company-popup.component.scss'
})
export class InactiveCsemCompanyPopupComponent implements OnInit{

  XdaysForCibilPing: any;
  userId: any;
  basicDetails: any;
  isDetailFetched: Boolean = false;
  isETBData: Boolean = false;
  panNumber : any;
  lastReportFetchDate : any
  scope:any;
  rmName:any;
  customerType:any;

  isDiffCompanyName:boolean = false;
  diffCompanyName:any;
  customerTypeId:any = null;

  constructor(public dialogRef: MatDialogRef<InactiveCsemCompanyPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ,private router:Router,
    private msmeService: MsmeService,private commonService: CommonService) {
      this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    }

    ngOnInit(): void {
      console.log(this.data);
      if(this.data?.type){
        this.customerType = this.data.type;
      }
      if(this.data?.scope){
        if(this.data.scope.toLowerCase() === 'inactive' || this.data.scope.toLowerCase() === 'csem'){
          this.scope = this.data.scope;
        }else{
          this.scope = 'Active';
        }
      }else{
        this.scope = 'Active';
      }
      if(this.data.rmName){
        this.rmName = this.data.rmName;
      }

      if(this.data?.isETBData){
        this.isETBData = this.data.isETBData;
      }

      if(this.data?.isDiffCompanyName){
        this.isDiffCompanyName = this.data.isDiffCompanyName;
      }

      if(this.data?.diffCompanyName){
        this.diffCompanyName = this.data.diffCompanyName;
      }

      if(this.data?.customerTypeId){
        this.customerTypeId = this.data.customerTypeId;
      }

      this.lastReportFetchDate= this.data;
      // this.getXdaysForCibilPings();
      
    }

    onYes(): void {
      this.dialogRef.close('Yes');
    }

    onNo(): void {
      this.dialogRef.close('No');
    }

}
