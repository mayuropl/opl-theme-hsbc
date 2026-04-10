
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-approve-reject-popup',
  templateUrl: './approve-reject-popup.component.html',
  styleUrl: './approve-reject-popup.component.scss'
})
export class ApproveRejectPopupComponent {
     constructor(
    public dialogRef: MatDialogRef<ApproveRejectPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
