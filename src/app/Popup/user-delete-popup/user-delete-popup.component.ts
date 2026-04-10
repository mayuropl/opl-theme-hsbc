import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-delete-popup', 
  templateUrl: './user-delete-popup.component.html',
  styleUrl: './user-delete-popup.component.scss'
})
export class UserDeletePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<UserDeletePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string } 
  ) {}
  onConfirm(): void {
    this.dialogRef.close('confirm');  // Close and return 'confirm'
  }
  onCancel(): void {
    this.dialogRef.close('cancel');  // Close and return 'cancel'
  }
}
