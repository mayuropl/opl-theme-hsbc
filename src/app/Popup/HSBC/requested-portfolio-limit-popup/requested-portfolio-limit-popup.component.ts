import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-requested-portfolio-limit-popup',
  templateUrl: './requested-portfolio-limit-popup.component.html',
  styleUrl: './requested-portfolio-limit-popup.component.scss'
})
export class RequestedPortfolioLimitPopupComponent {

  constructor(
    public dialogRef: MatDialogRef<RequestedPortfolioLimitPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onProceed(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
