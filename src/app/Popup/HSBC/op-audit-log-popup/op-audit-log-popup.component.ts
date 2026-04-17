import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-op-audit-log-popup',
  templateUrl: './op-audit-log-popup.component.html',
  styleUrl: './op-audit-log-popup.component.scss'
})
export class OpAuditLogPopupComponent implements OnInit {
  customerData: any;
  auditData: any;
  displayAuditData: any[] = [];
  currentPage = 1;
  startIndex = 1;
  selectedRowsPerPage = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(private dialogRef: MatDialogRef<OpAuditLogPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private msmeService: MsmeService, private commonService: CommonService,) {
    this.customerData = data?.customerData || {};
  }

  ngOnInit(): void {
    this.getAuditStatusDataForCustomer(this.customerData);
  }

  getStatusValue(campaignData: any) {
    if (campaignData?.convertRejectStatus == 'Rejected') {
      return 'blue_text';
    } else if (campaignData?.convertRejectStatus == 'Converted') {
      return 'darkgreen_text';
    } else if (campaignData?.convertRejectStatus == 'Work In Progress') {
      return 'yellow_text';
    } else {
      return 'NA';
    }
  }

  getUpdatedDate(date: any) {
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    } as const;

    return new Date(date).toLocaleDateString('en-GB', options)
  }

  getAuditStatusDataForCustomer(customerData: any) {
    const data = {
      campaignIds: customerData?.campaignData?.map(item => item.campaignId),
      pan: customerData?.pan,
    }

    this.msmeService.getAuditStatusDataForCustomer(data).subscribe((res: any) => {
      if (res && res?.data && res?.data?.length > 0 && res?.status == 200) {
        this.auditData = res?.data[0];
        this.displayAuditData = this.auditData?.customerCampaignData;
      }

      else if (res && res?.status == 404) {
        this.commonService.warningSnackBar(res?.message)
      }

      else if (res && res?.status == 500) {
        this.commonService.errorSnackBar(res?.message);
      }
    });
  }

  get paginatedDisplayAuditData(): any[] {
    this.startIndex = (this.currentPage - 1) * this.selectedRowsPerPage;
    return this.displayAuditData.slice(this.startIndex, this.startIndex + this.selectedRowsPerPage);
  }

  changePageSize(newSize: number) {
    this.selectedRowsPerPage = newSize;
    this.currentPage = 1;
  }
}
