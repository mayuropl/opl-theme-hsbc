import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tooltip-detail-popup', 
  templateUrl: './tooltip-detail-popup.component.html',
  styleUrl: './tooltip-detail-popup.component.scss'
})
export class TooltipDetailPopupComponent {
  showOthersTable: boolean = false;
  tooltipType: string = '';
  filterName: string = '';
  filterLabel: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data) {
      this.tooltipType = data.tooltipType || '';
      this.filterName = data.filterName || '';
      this.filterLabel = data.filterLabel || '';
    }
  }

  toggleOthersTable(): void {
    this.showOthersTable = !this.showOthersTable;
  }

  isProductType(): boolean {
    return this.filterName === 'product_type' || (!this.tooltipType && this.filterName !== 'psl_status' && this.filterName !== 'date_of_report' && this.filterName !== 'utilization_wallet_pct' && this.filterName !== 'cmr');
  }

  isPslStatus(): boolean {
    return this.filterName === 'psl_status' || this.tooltipType === 'psl_tooltips';
  }

  isDateReport(): boolean {
    return this.filterName === 'date_of_report' || this.tooltipType === 'date_report_popup';
  }

  isUtilizationWallet(): boolean {
    return this.filterName === 'utilization_wallet_pct' || this.tooltipType === 'utilization_wallet_popup';
  }

  isCmr(): boolean {
    return this.filterName === 'cmr' || this.tooltipType === 'cmr_popup';
  }
}
