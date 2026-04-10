import { Component, Inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-profile-details-popup',
  templateUrl: './profile-details-popup.component.html',
  styleUrl: './profile-details-popup.component.scss'
})
export class ProfileDetailsPopupComponent {
  creditRatingProxyPag:any
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
  joinLocation:any;
  investorBusinessDetailsAndCoverageAreaList:any = [];
  listOfInvestorProfileDetails :any = [];
  tracxnInvestorProfileDetailsPage:PaginationSignal = new PaginationSignal();

  constructor(public dialogRef: MatDialogRef<ProfileDetailsPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: any,public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router,
              public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
          console.log("data",this.data); 
        this.tracxnInvestorProfileDetailsPage.totalSize = this.data?.profileDetails?.pageSize;
  }

  ngOnInit(): void { 
        console.log("Profile Data::::",this.data);
        const locations = this.data?.profileDetails?.tracxnInvestorProfileReq?.map(x => x.location).filter(Boolean);
        this.joinLocation = locations.length ? locations.join('  | ') : 'NA';
        this.tracxnInvestorProfileDetailsPage.totalSize = this.data?.pageSize;
        this.data?.profileDetails?.tracxnInvestorProfileReq?.forEach(profile => {
          if (profile.tracxnInvestorBusinessModelAndCoverageAreaDetailsReq?.length) {
            this.investorBusinessDetailsAndCoverageAreaList.push(profile.tracxnInvestorBusinessModelAndCoverageAreaDetailsReq);
          }            
        });
        console.log("investorBusinessDetailsAndCoverageAreaList::::",this.investorBusinessDetailsAndCoverageAreaList);

  }
     
  
  getInnovateProfileBasicDetails(){
    let reqJson;
    if(this.data?.relatedData?.isFrom  == 1){
      reqJson = {
        domain: this.data?.relatedData?.investorDomain,
        cin:this.data?.relatedData?.cinnumber,
        selectedDomain:this.data?.relatedData?.selectedDomain,
        isFrom:this.data?.relatedData?.isFrom,
        pageSize : this.tracxnInvestorProfileDetailsPage.pageSize(),
        pageIndex : this.tracxnInvestorProfileDetailsPage.page() - 1,
      };
    }else{
      reqJson = {
        domain: this.data?.relatedData?.domainName,
        cin:this.data?.relatedData?.cinnumber,
        selectedDomain:this.data?.relatedData?.selectedDomain,
        isFrom:this.data?.relatedData?.isFrom,
        pageSize : this.tracxnInvestorProfileDetailsPage.pageSize(),
        pageIndex : this.tracxnInvestorProfileDetailsPage.page() - 1,
      };
    }
    this.msmeService.getInvestorProfileDetails(reqJson).subscribe((res: any) => {
      if (res.status == 200 && res?.data) {
        if(res?.listData && res?.listData.length != 0){
          this.investorBusinessDetailsAndCoverageAreaList = res?.listData;
          this.tracxnInvestorProfileDetailsPage.totalSize = res?.data?.pageSize;
          console.log("investorBusinessDetailsAndCoverageAreaList::::",this.investorBusinessDetailsAndCoverageAreaList);
        }
      } else {
        this.commonService.errorSnackBar(res.message)
      }
    });
  }

  closeDialog(): void {
        this.dialogRef.close();
  }
}
