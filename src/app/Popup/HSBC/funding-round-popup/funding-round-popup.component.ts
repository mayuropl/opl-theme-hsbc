import { Component, Inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';
import { MillionFormatPipe } from 'src/app/CommoUtils/pipe/million-format.pipe';


@Component({
  selector: 'app-funding-round-popup', 
  templateUrl: './funding-round-popup.component.html',
  styleUrl: './funding-round-popup.component.scss'
})
export class FundingRoundPopupComponent {

  page = 1;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  PageSelectNumber: any[] = [
    {
      name: '5',
      value: 5,
    },
    {
      name: '10',
      value: 10,
    },
    {
      name: '20',
      value: 20,
    },
    {
      name: '50',
      value: 50,
    },
    {
      name: '100',
      value: 100,
    },
  ];
  tracxnFundingRoundListDetailsPage:PaginationSignal = new PaginationSignal();
  tracxnFundingVentureDebtPage: PaginationSignal = new PaginationSignal();
  tracxnFundingBuyOutPage: PaginationSignal = new PaginationSignal();

  listOfFundingRoundListdetails:any =[];
  listOfFundingRoundVentureDebtListdetails:any =[];
  listOfFundingRoundBuyOutListdetails:any =[];

  constructor(public dialogRef: MatDialogRef<FundingRoundPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: any,public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router,
                public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
            console.log("data",this.data); 
    this.tracxnFundingRoundListDetailsPage.totalSize = this.data?.pageSize;

  }

  ngOnInit(): void { 
    this.tracxnFundingRoundListDetailsPage.totalSize = this.data?.pageSize;
    this.listOfFundingRoundListdetails = this.data?.listData;

    this.tracxnFundingVentureDebtPage.totalSize = this.data?.pageSizeVenturesize;
    this.listOfFundingRoundVentureDebtListdetails = this.data?.ventureDebtListData;

    this.tracxnFundingBuyOutPage.totalSize = this.data?.pageSizeBuyOutsize;
    this.listOfFundingRoundBuyOutListdetails = this.data?.buyOutListData;

  }

  getAllFundingRoundListDetails(){
    const data: any = {};
    if(this.data?.isFrom == 0){
      data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
      data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=0;
    }else if(this.data?.isFrom == 1){
      data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
      data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
      data.domain = this.data?.investorDomain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 2){
      data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
      data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
      data.domain =this.data?.domainName;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4){
      data.pageSize = this.tracxnFundingRoundListDetailsPage.pageSize();
      data.pageIndex = this.tracxnFundingRoundListDetailsPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    } 
    this.msmeService.getAllFundingRoundListDetailsDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if(res?.listData && res?.listData?.length != 0){
          this.listOfFundingRoundListdetails = res.listData;
          this.tracxnFundingRoundListDetailsPage.totalSize = res.data;
          console.log("listOfFundingRoundListdetails::::",this.listOfFundingRoundListdetails);
        }else{
          this.listOfFundingRoundListdetails = [];
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error=>{
      console.log(error);
    };
  }

  getAllTracxnFundingVentureDebtDetails(){
    const data: any = {};
    if(this.data?.isFrom == 0){
      data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
      data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=0;
    }else if(this.data?.isFrom == 1){
      data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
      data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
      data.domain = this.data?.investorDomain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 2){
      data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
      data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
      data.domain =this.data?.domainName;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4){
      data.pageSize = this.tracxnFundingVentureDebtPage.pageSize();
      data.pageIndex = this.tracxnFundingVentureDebtPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    } 
    this.msmeService.getAllTracxnFundingVentureDebtDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if(res?.listData && res?.listData?.length != 0){
          this.listOfFundingRoundVentureDebtListdetails = res.listData;
          this.tracxnFundingVentureDebtPage.totalSize = res.data;
          console.log("listOfFundingRoundVentureDebtListdetails::::",this.listOfFundingRoundVentureDebtListdetails);
        }else{
          this.listOfFundingRoundVentureDebtListdetails = [];
        }
      } else { 
        this.commonService.errorSnackBar(res.message)
      }
    }), error=>{
      console.log(error);
    };
  }

  getAllTracxnFundingBuyOutDetails(){
    const data: any = {};
    if(this.data?.isFrom == 0){
      data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
      data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=0;
    }else if(this.data?.isFrom == 1){
      data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
      data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
      data.domain = this.data?.investorDomain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 2){
      data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
      data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
      data.domain =this.data?.domainName;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    }else if(this.data?.isFrom == 3 || this.data?.isFrom == 4){
      data.pageSize = this.tracxnFundingBuyOutPage.pageSize();
      data.pageIndex = this.tracxnFundingBuyOutPage.page() - 1;
      data.domain =this.data?.domain;
      data.cin=this.data?.cinnumber;
      data.isCompany=1;
      data.id = this.data?.id;
    } 
    this.msmeService.getAllTracxnFundingBuyOutDetails(data).subscribe((res: any) => {
      if (res.status == 200 && res?.listData) {
        if(res?.listData && res?.listData?.length != 0){
          this.listOfFundingRoundBuyOutListdetails = res.listData;
          this.tracxnFundingBuyOutPage.totalSize = res.data;
          console.log("listOfFundingRoundBuyOutListdetails::::",this.listOfFundingRoundBuyOutListdetails);
        }else{
          this.listOfFundingRoundBuyOutListdetails = [];
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    }), error=>{
      console.log(error);
    };
  }


  closeDialog(): void {
    this.dialogRef.close();
}
}
