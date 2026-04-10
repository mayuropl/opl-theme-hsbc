import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { CibilmarkPopupComponent } from '../cibilmark-popup/cibilmark-popup.component';

@Component({
  selector: 'app-prescreen-mark-popup',
  standalone: true,
  imports: [],
  templateUrl: './prescreen-mark-popup.component.html',
  styleUrl: './prescreen-mark-popup.component.scss'
})
export class PrescreenMarkPopupComponent implements OnInit {

  constructor(public dialog: MatDialog, private msmeService: MsmeService, @Inject(MAT_DIALOG_DATA) public data: any,
              public commonService: CommonService, private router: Router,  public dialogRef: MatDialogRef<PrescreenMarkPopupComponent>,
              public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
  }
  loadAfterDelay(): void {
    // this.isRLoaded = true;
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  callMarkCompleted(fileId:any, revertFlag:Boolean){
    this.msmeService.uploadStatusChange(fileId, revertFlag).subscribe((res: any) => {
      if (res.status === 200) {
        console.log('Response === > ', res);
        this.commonService.successSnackBar(res?.success);
        this.dialogRef.close(res);
        // this.fileDropdown = response?.listData;
      } else {
        console.log('Error getting while changing the file status');
      }
    }, error => {
      console.log('Error getting while changing the file status');
    });
  }

}
