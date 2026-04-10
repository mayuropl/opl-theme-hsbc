import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UseridPopupComponent } from 'src/app/Popup/HSBC/userid-popup/userid-popup.component';

@Component({
  selector: 'app-find-prospects-table', 
  templateUrl: './find-prospects-table.component.html',
  styleUrl: './find-prospects-table.component.scss'
})
export class FindProspectsTableComponent {


  
  constructor(
    public dialog: MatDialog) { 
   }
 // Products_ForeignCurrencies popup
 useridPopup(): void {
  const dialogRef = this.dialog.open(UseridPopupComponent,
    { panelClass: ['popupMain_design'], }
  );

  dialogRef.afterClosed().subscribe(result => {
  });
} 
}
