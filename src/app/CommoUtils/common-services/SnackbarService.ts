import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../common-components/snackbar/snackbar.component';


@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Open snackbar
   */
  public openSnackBar(message: string, action: string, snackType: any) {
    const sType = snackType !== undefined ? snackType : '';
    this.snackBar.openFromComponent(SnackbarComponent, {
      duration: 8000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [sType + '-snackbar'],
      data: { message, snackType: sType },
    });
    
  }

  /**
   * Close snackbar
   */
  public dismiss() {
    this.snackBar.dismiss();
  }
}
