import { Component, Optional, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-country-bulk-upload-success',
  templateUrl: './country-bulk-upload-success.component.html',
  styleUrl: './country-bulk-upload-success.component.scss'
})
export class CountryBulkUploadSuccessComponent {

  constructor(
    public dialogRef: MatDialogRef<CountryBulkUploadSuccessComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,private msmeService: MsmeService,private commonService: CommonService
  ) {}

  ngOnInit(): void {
    console.log(this.data.totalEntry);
    console.log("batchId",this.data.batchId);
  }
  reload(): void {
    window.location.reload();
    this.data.fetchBulkUploadHistory(null, true);
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  procced(){
    this.closePopup();
    window.location.reload();
  }

}
