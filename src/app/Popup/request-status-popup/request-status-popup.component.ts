import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ApproveRejectPopupComponent } from '../HSBC/approve-reject-popup/approve-reject-popup.component';

@Component({
  selector: 'app-request-status-popup',
  templateUrl: './request-status-popup.component.html',
  styleUrls: ['./request-status-popup.component.scss']
})
export class RequestStatusPopupComponent {
  showFields: boolean;
  isSelectAllcheckedForRecevier:boolean;
  cmpDetailsInRecevier:boolean;
  remarks: string = '';
  selectedStatus: string = ''; // Tracks Approve/Reject

  @Output() remarksChange = new EventEmitter<{ status: string; remarks: string }>();

  constructor(
    public dialogRef: MatDialogRef<RequestStatusPopupComponent>,
    private commonService: CommonService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.showFields = data.showFields;
     this.cmpDetailsInRecevier= data.cmpDetailsInRecevier // Receive the boolean value
     this.isSelectAllcheckedForRecevier = data.isSelectAllcheckedForRecevier
  }

submitRemarks() {
  if (this.showFields && (!this.selectedStatus || this.selectedStatus.trim() === '')) {
    this.commonService.warningSnackBar("Please select a status.");
    return;
  }

  if (!this.remarks || this.remarks.trim() === '') {
    this.commonService.warningSnackBar("Please enter remarks.");
    return;
  }

  const requestData = { status: this.selectedStatus, remarks: this.remarks };

  if (this.showFields && this.cmpDetailsInRecevier && this.isSelectAllcheckedForRecevier && this.selectedStatus==='Approved') {
    let message = '';
    if (this.selectedStatus === 'Approved') {
      message = `Non selected companies will be auto rejected.
                 \n\nDo you want to proceed?`;
    } 

    const confirmDialog = this.dialog.open(ApproveRejectPopupComponent, {
      width: '400px',
      data: { message }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.remarksChange.emit(requestData);
        console.log("REQUEST-STATUS ", requestData);
        this.dialogRef.close(requestData);
      }
    });

  } else {
    this.remarksChange.emit(requestData);
    console.log("REQUEST-STATUS (no dialog)", requestData);
    this.dialogRef.close(requestData);
  }
}


  closeDialog(): void {
    this.dialogRef.close();
  }
}
