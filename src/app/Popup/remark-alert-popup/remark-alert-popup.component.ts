import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-remark-alert-popup', 
  templateUrl: './remark-alert-popup.component.html',
  styleUrl: './remark-alert-popup.component.scss'
})
export class RemarkAlertPopupComponent {
  alertData;
  userName;
  userId;
  constructor(public dialogRef: MatDialogRef<RemarkAlertPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: RemarkAlertPopupComponent,
  private router:Router,private msmeService: MsmeService,private commonService: CommonService) { }

  ngOnInit(): void {
    this.alertData = this.data;
    this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
  }

  remarks;

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  updateAlert(alertData){
    alertData.status = alertData.status == undefined ? 1 : alertData.status;
    if (alertData.status == 1) {
      alertData.submittedBy=this.userId;
      alertData.submittedByName=this.userName;
      alertData.submittedRemark=this.remarks;
    } else {
      alertData.completedBy=this.userId;
      alertData.completedByName=this.userName;
      alertData.completedRemark=this.remarks;
    }
    this.msmeService.updateAlert(alertData).subscribe(
      (response: any) => {
        if (response.status == 200) {
          this.commonService.successSnackBar(response.message);
          this.closePopup(1);
        } else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
          this.closePopup(2);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }
}
