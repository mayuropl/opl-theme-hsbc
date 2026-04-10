import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CrilicOpportunityPopupComponent } from 'src/app/Popup/HSBC/crilic-opportunity-popup/crilic-opportunity-popup.component';

@Component({
  selector: 'app-liquidity-opportunity-dashboard', 
  templateUrl: './liquidity-opportunity-dashboard.component.html',
  styleUrl: './liquidity-opportunity-dashboard.component.scss'
})
export class LiquidityOpportunityDashboardComponent {
  isCollapsed = true;  
  modelDate = new Date();
  maxDate: Date;

  constructor(private dialog: MatDialog) {}
 
 
   ngOnInit(): void {
     this.maxDate = new Date();
   }
 
   onOpenCalendar(container: any): void {
     container.monthSelectHandler = (event: any): void => {
       container._store.dispatch(container._actions.select(event.date));
     };
     container.setViewMode('month');
   }
 
   getAlertsSubTabData(_index: number): void {
     // Optional: load data for selected month when needed
   }
 
 
  openCrilicOpportunityPopup(): void {
    const dialogRef = this.dialog.open(CrilicOpportunityPopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
  }
}
