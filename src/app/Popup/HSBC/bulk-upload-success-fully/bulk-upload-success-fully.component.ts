import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HSBCBusinessPANComponent } from '../../HSBC/hsbc-business-pan/hsbc-business-pan.component';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
@Component({
  selector: 'app-bulk-upload-success-fully',
  templateUrl: './bulk-upload-success-fully.component.html',
  styleUrls: ['./bulk-upload-success-fully.component.scss'],
})
export class BulkUploadSuccessFullyComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<HSBCBusinessPANComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,private msmeService: MsmeService,private commonService: CommonService
  ) {}

  ngOnInit(): void {
    console.log(this.data.totalEntry);
    console.log("batchId",this.data.batchId);
  }
  reload(): void {
    window.location.reload();
    this.data.this.fetchBulkUploadHistory(null, true);
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  procced(){
    if(this.data.successfullEntry && this.data.successfullEntry >0){
    const dataset: any = {};
    dataset.batchId = this.data.batchId;
    dataset.userId = parseInt(atob(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, false)));
    this.msmeService.proccedData(dataset).subscribe((res:any) => {
      console.log("res=========",res.data);
      if (res.status==200) {
        this.commonService.successSnackBar("File uploaded successfully");
        this.closePopup();
        this.router.navigate(['/hsbc/rmDashboard']);
      }
    }, error => {
        this.commonService.errorSnackBar("Error in Proccessing data");
      });
  }else{
    this.commonService.warningSnackBar("PAN data is not uploaded. Please check the failed entries to know the reason.");
    this.closePopup();
    window.location.reload();
  }}

}
