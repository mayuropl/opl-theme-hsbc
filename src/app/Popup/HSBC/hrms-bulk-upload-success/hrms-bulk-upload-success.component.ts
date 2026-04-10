import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { HSBCBusinessPANComponent } from '../../HSBC/hsbc-business-pan/hsbc-business-pan.component';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';

@Component({
  selector: 'app-hrms-bulk-upload-success',
  templateUrl: './hrms-bulk-upload-success.component.html',
  styleUrl: './hrms-bulk-upload-success.component.scss'
})
export class HrmsBulkUploadSuccessComponent implements OnInit {
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
    this.closePopup();
    window.location.reload();
  }

}
