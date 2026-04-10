import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
@Component({
  selector: 'app-portfolio-remark-popup',
  templateUrl: './portfolio-remark-popup.component.html',
  styleUrl: './portfolio-remark-popup.component.scss'
})
export class PortfolioRemarkPopupComponent {


    showFields: boolean= false;
    remarks: string = '';
    selectedStatus: string = ''; // Tracks Approve/Reject

  constructor(
    public dialogRef: MatDialogRef<PortfolioRemarkPopupComponent>,private commonService:CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  submit() {
    if (!this.remarks.trim()) {
    this.commonService.warningSnackBar('Please enter remark here');
      return;
    }
    this.dialogRef.close(this.remarks); // pass data to another component
  }

  close() {
    this.dialogRef.close();
  }
}
