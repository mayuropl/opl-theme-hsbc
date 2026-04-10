import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MsmeService} from '../../../services/msme.service';
import {CommonService} from '../../../CommoUtils/common-services/common.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonMethods} from '../../../CommoUtils/common-methods';
import {FormBuilder} from '@angular/forms';
import {Constants} from '../../../CommoUtils/constants';

@Component({
  selector: 'app-cibilmark-popup',
  templateUrl: './cibilmark-popup.component.html',
  styleUrl: './cibilmark-popup.component.scss'
})
export class CibilmarkPopupComponent implements OnInit{
  private userId: any;
  type: any;

  constructor(public dialog: MatDialog, private msmeService: MsmeService, @Inject(MAT_DIALOG_DATA) public data: any,
              public commonService: CommonService, private router: Router,  public dialogRef: MatDialogRef<CibilmarkPopupComponent>,
              public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
  }
  loadAfterDelay(): void {
    // this.isRLoaded = true;
  }

  ngOnInit(): void {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    console.log(this.data);
    this.type = this.data?.type;
  }

  callMarkCompleted(file:any){
    let filterJson = {};
    if (this.type === 'CONSUMER') {
      filterJson = {
        fileId: file,
        userId: this.userId,
        type: this.type
      };
    } else {
      filterJson = {
        fileId: file,
        userId: this.userId
      };
    }
    this.msmeService.callMarkFileCompleted(filterJson).subscribe((res: any) => {
      if (res.status === 200) {
        console.log('Response === > ', res);
        let response = JSON.parse(res?.data);
        this.dialogRef.close(response?.listData);
        // this.fileDropdown = response?.listData;
      } else {
        console.log('Error in getting file list');
      }
    }, error => {
      console.log('Error in getting file list');
    });
  }

}
