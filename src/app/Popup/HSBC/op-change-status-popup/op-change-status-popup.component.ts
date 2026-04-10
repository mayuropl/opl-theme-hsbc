import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-op-change-status-popup',
  templateUrl: './op-change-status-popup.component.html',
  styleUrl: './op-change-status-popup.component.scss'
})
export class OpChangeStatusPopupComponent {
  hidden: boolean = false;
  customerData: any = {};
  rejectionReasonList: any[] = [];
  filteredRejectionReasonList: { [key: string]: any[] } = {};
  rejectionSearchText: { [key: string]: string } = {};
  workInProgressReasonList: any[] = [];
  filteredWorkInProgressReasonList: { [key: string]: any[] } = {};
  wipSearchText: { [key: string]: string } = {};
  campaignNames: any[] = [];
  campaignStatuses: { [key: string]: { convert: boolean, reject: boolean, workInProgress: boolean } } = {};
  campaignRemarks: { [key: string]: string } = {};
  campaignWipReasons: { [key: string]: string } = {};
  campaignRevenues: { [key: string]: string } = {};
  campaignRadioSelection: { [key: string]: string } = {};
  currentTabStatus: string = '';
  empCode: string = '';
  constructor(private dialogRef: MatDialogRef<OpChangeStatusPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private msmeService: MsmeService, private commonService: CommonService,) {
    this.getRejectionReasonList();
    this.customerData = data?.customerData || {};
    this.currentTabStatus = data?.currentTabStatus || '';
    this.hidden = this.currentTabStatus.toLowerCase() === 'work in progress';
    this.campaignNames = this.customerData?.campaignData?.filter(obj => obj.convertRejectStatus === this.currentTabStatus).map(campaign => campaign.campaignName) || [];
    this.empCode = data?.empCode || ''
    this.campaignNames.forEach(name => {
      const campaign = this.customerData?.campaignData?.find(c => c.campaignName === name);
      this.campaignStatuses[name] = { convert: false, reject: false, workInProgress: false };
      this.campaignRemarks[name] = '';
      this.campaignWipReasons[name] = '';
      this.campaignRadioSelection[name] = '';
      this.rejectionSearchText[name] = '';
      this.wipSearchText[name] = '';
      this.filteredRejectionReasonList[name] = [...this.rejectionReasonList];
      this.filteredWorkInProgressReasonList[name] = [...this.workInProgressReasonList];
      this.campaignRevenues[name] = campaign?.convertedValue ? this.formatRevenue(campaign.convertedValue, true) : '';
    });
  }

  onConvertChange(campaignName: string, event: any) {
    if (event.checked) {
      this.campaignStatuses[campaignName].convert = true;
      this.campaignStatuses[campaignName].reject = false;
      this.campaignStatuses[campaignName].workInProgress = false;
      this.campaignRemarks[campaignName] = '';
      const campaign = this.customerData?.campaignData?.find(c => c.campaignName === campaignName);
      if (campaign?.convertedValue) {
        this.campaignRevenues[campaignName] = this.formatRevenue(campaign.convertedValue, true);
      }
    } else {
      this.campaignStatuses[campaignName].convert = false;
      this.campaignRevenues[campaignName] = '';
    }
  }

  onRejectChange(campaignName: string, event: any) {
    if (event.checked) {
      this.campaignStatuses[campaignName].reject = true;
      this.campaignStatuses[campaignName].convert = false;
      this.campaignStatuses[campaignName].workInProgress = false;
      const campaign = this.customerData?.campaignData?.find(c => c.campaignName === campaignName);
      if (campaign?.remark) {
        this.campaignRemarks[campaignName] = campaign.remark;
      }
    } else {
      this.campaignStatuses[campaignName].reject = false;
      this.campaignRemarks[campaignName] = '';
    }
  }

  onWorkInProgressChange(campaignName: string, event: any) {
    if (event.checked) {
      this.campaignStatuses[campaignName].workInProgress = true;
      this.campaignStatuses[campaignName].convert = false;
      this.campaignStatuses[campaignName].reject = false;
      this.campaignRemarks[campaignName] = '';
      this.campaignRevenues[campaignName] = '';
    } else {
      this.campaignStatuses[campaignName].workInProgress = false;
    }
  }

  onRadioChange(campaignName: string, event: any) {
    const value = event.value;
    this.campaignStatuses[campaignName].workInProgress = value === 'work_in_progress';
    this.campaignStatuses[campaignName].convert = value === 'convert';
    this.campaignStatuses[campaignName].reject = value === 'reject';

    if (value !== 'reject') {
      this.campaignRemarks[campaignName] = '';
      this.rejectionSearchText[campaignName] = '';
      this.filterRejectionReasons(campaignName);
    }
    if (value !== 'work_in_progress') {
      this.campaignWipReasons[campaignName] = '';
      this.wipSearchText[campaignName] = '';
      this.filterWipReasons(campaignName);
    }
  }

  isFormValid(): boolean {
    const hasSelectedCampaigns = this.campaignNames.some(name =>
      this.campaignStatuses[name].convert || this.campaignStatuses[name].reject || this.campaignStatuses[name].workInProgress
    );

    if (!hasSelectedCampaigns) return false;

    return this.campaignNames.every(name => {
      if (this.campaignStatuses[name].workInProgress) {
        return this.hidden ? this.campaignWipReasons[name]?.trim() : true;
      }
      if (this.campaignStatuses[name].convert) {
        return this.campaignRevenues[name]?.trim();
      } else if (this.campaignStatuses[name].reject) {
        return this.campaignRemarks[name]?.trim();
      }
      return true;
    });
  }

  preventMultipleDots(event: KeyboardEvent, campaignName: string) {
    const char = event.key;
    const currentValue = this.getRevenueValue(campaignName) || '';

    if (/[0-9]/.test(char)) {
      return true;
    }

    if (char === '.' && currentValue.indexOf('.') === -1) {
      return true;
    }

    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) {
      return true;
    }

    event.preventDefault();
    return false;
  }

  formatRevenue(amount: any, convertIntoFormatted: Boolean): any {
    if (convertIntoFormatted) {
      const formatted = new Intl.NumberFormat('en-IN').format(amount);
      return `$ ${formatted}`;
    }
    else {
      const numericValue = amount.replace(/[$,\s]/g, '');
      return parseFloat(numericValue) || 0;
    }
  }

  onRevenueInput(campaignName: string, event: any) {
    let value = event.target.value || '';
    let cleaned = value.replace(/[^0-9.]/g, '');

    if (cleaned.startsWith('.')) {
      cleaned = '0' + cleaned;
    }

    if (cleaned) {
      const parts = cleaned.split('.');
      const integerPart = parts[0] ? new Intl.NumberFormat('en-IN').format(Number(parts[0])) : '0';
      const decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';
      const formattedValue = `$ ${integerPart}${decimalPart}`;
      event.target.value = formattedValue;
      this.campaignRevenues[campaignName] = formattedValue;
    } else {
      event.target.value = '';
      this.campaignRevenues[campaignName] = '';
    }
  }

  getRevenueValue(campaignName: string): string {
    const input = document.querySelector(`input[data-campaign="${campaignName}"]`) as HTMLInputElement;
    return input ? input.value : '';
  }

  getOldConvertedValue(campaignName: string): string {
    const campaign = this.customerData?.campaignData?.find(c => c.campaignName === campaignName);
    return campaign?.convertedValue ? this.formatRevenue(campaign.convertedValue, true) : 'No previous value';
  }

  shouldShowConvertReject(): boolean {
    return this.currentTabStatus.toLowerCase() === 'work in progress';
  }

  shouldShowWorkInProgress(): boolean {
    return this.currentTabStatus.toLowerCase() === 'awaiting action';
  }

  prepareCustomerData(): any[] {
    return this.campaignNames.filter(campaignName =>
      this.campaignStatuses[campaignName].convert || this.campaignStatuses[campaignName].reject || this.campaignStatuses[campaignName].workInProgress
    )
      .map(campaignName => {
        const status = this.campaignStatuses[campaignName];
        let statusText = '';
        let value = null;
        let remark = null;

        if (status.workInProgress) {
          statusText = 'Work In Progress';
          remark = this.hidden ? this.campaignWipReasons[campaignName] : null;
        } else if (status.convert) {
          statusText = 'Converted';
          value = this.formatRevenue(this.campaignRevenues[campaignName], false);
        } else if (status.reject) {
          statusText = 'Rejected';
          remark = this.campaignRemarks[campaignName];
        }

        return {
          campaignName: campaignName,
          campaignId: this.customerData?.campaignData?.find(campaign => campaign.campaignName === campaignName)?.campaignId,
          status: statusText,
          value: value,
          remark: remark
        };
      });
  }

  filterRejectionReasons(campaignName: string): void {
    if (!this.rejectionSearchText[campaignName]) {
      this.filteredRejectionReasonList[campaignName] = [...this.rejectionReasonList];
    } else {
      this.filteredRejectionReasonList[campaignName] = this.rejectionReasonList.filter(reason =>
        reason.reasonName.toLowerCase().includes(this.rejectionSearchText[campaignName].toLowerCase())
      );
    }
  }

  filterWipReasons(campaignName: string): void {
    if (!this.wipSearchText[campaignName]) {
      this.filteredWorkInProgressReasonList[campaignName] = [...this.workInProgressReasonList];
    } else {
      this.filteredWorkInProgressReasonList[campaignName] = this.workInProgressReasonList.filter(reason =>
        reason.reasonName.toLowerCase().includes(this.wipSearchText[campaignName].toLowerCase())
      );
    }
  }

  getRejectionReasonList() {

    //   this.msmeService.getRejectionReasonList().subscribe((response: any) => {
    //   if (response && response.status == 200) {
    //     this.rejectionReasonList=response.data;
    //     this.filteredRejectionReasonList = [...this.rejectionReasonList];

    //   } else if(response && response.status == 500) {
    //     this.commonService.errorSnackBar(response.message);
    //   }
    // }, (error) => {
    //   this.commonService.errorSnackBar('Something Went Wrong');
    // });

    this.msmeService.getClientUpdateReasonsMaster(true).subscribe(res => {
      if (res?.status === 200 && res?.data) {

        this.rejectionReasonList = res.data?.reject || [];
        this.workInProgressReasonList = res.data?.work_in_progress || [];

        this.campaignNames.forEach(name => {
          this.filteredRejectionReasonList[name] = [...this.rejectionReasonList];
          this.filteredWorkInProgressReasonList[name] = [...this.workInProgressReasonList];
        });
      }
    });
  }

  onSubmit() {
    if (!this.isFormValid()) {
      return;
    }

    const data = {
      customerData: this.prepareCustomerData(),
      pan: this.customerData?.pan,
      empCode: this.empCode
    }

    this.msmeService.updateCustomerConvertedRejectedStatus(data).subscribe((response: any) => {
      if (response && response.status == 200) {
        this.commonService.successSnackBar(response.message);
        this.dialogRef.close({ updatedCustomerData: true });
      } else if (response && response.status == 500) {
        this.commonService.errorSnackBar(response.message);
      }
    }, (error) => {
      this.commonService.errorSnackBar('Something Went Wrong');
    });
  }
}
