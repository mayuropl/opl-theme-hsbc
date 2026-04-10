import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { SharedService } from 'src/app/services/SharedService';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-unique-popup',
  templateUrl: './unique-popup.component.html',
  styleUrls: ['./unique-popup.component.scss']
})
export class UniquePopupComponent implements OnInit {
  pageSize = 5;
  startIndex = 0;
  endIndex = 10;
  page = 1;
  totalSize = 0;
  currentJobId: any;

  bulkUploadHistory: any[] = [];
  selectedOption: string | null = null;

  PageSelectNumber: any[] = [{ name: '5', value: 5 }, { name: '10', value: 10 }, { name: '15', value: 15 }, { name: '20', value: 20 },]
  id;
  batchId;

  private subscription: Subscription;
  constructor(public dialog: MatDialog, private msmeService: MsmeService, private commonService: CommonService, private sharedService: SharedService, private dialogRef: MatDialogRef<UniquePopupComponent>) {


    this.initialize();
  }

  private initialize() {
    this.sharedService.getBankPortfolioUniqueIFSCReportStatusClickEvent().subscribe((message) => {
      console.log("Message recieved");
      console.log(message);
      this.handleWebSocketMessage(message);
    })
  }

  private debounceTimer: any;

  handleWebSocketMessage(message: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      console.log('this.debounceTimer: ', this.debounceTimer);
      this.fetchDataFromWebSocket(message);
    }, 1000);
  }

  onOkClick(): void {
    console.log("Ok clicked");
    this.dialogRef.close();
  }
  onTabChange(event: MatTabChangeEvent) {
    if (event.tab.textLabel === 'Status') {
      this.fetchBulkUploadHistory();
    }
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory();
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory();
  }

  fetchDataFromWebSocket(responseFromWebSocket) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchHistory(responseFromWebSocket?.response?.response);
  }

  fetchHistory(res) {
    if (res?.listData) {
      // this.fetchBulkUploadHistory();
      this.bulkUploadHistory = res.listData;
      if (res?.listData && res.listData.length > 0) {
        let jobId = this.bulkUploadHistory[0].job_id;

        this.downloadExcel(jobId);
      }
    }
  }


  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  ngOnInit(): void {
    // If you want to auto-load Status tab data on init:
    this.fetchBulkUploadHistory();
  }

  goToStatusTab() {
    const data = {
      callback_url: "Java webhook URL"  // or build dynamically if needed
    };

    this.msmeService.submitExportUniqueIFSC(data).subscribe(
      (res: any) => {
        if (res && res.status === 200) {
          let response = JSON.parse(res.data);
          this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly...");
          this.currentJobId = response.job_id;
          this.tabGroup.selectedIndex = 1;
          this.fetchBulkUploadHistory();
        } else {
          this.commonService.warningSnackBar(res.message || 'No data found');
        }
      },
      (err) => {
        this.commonService.errorSnackBar('Error while submitting job');
      }
    );
  }

  fetchBulkUploadHistory(): void {
    const data: any = {
      size: this.pageSize,
      pageIndex: (this.page) - 1,

    };

    this.msmeService.getAllBankUploadUniqueData(data).subscribe(
      (res: any) => {
        if (res && res.status === 200) {
          this.totalSize = res.data ?? 0;
          this.bulkUploadHistory = res.listData;
        } else {
          this.commonService.warningSnackBar(res.message || 'No data found');
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );
  }


  downloadCSVFromBase64(base64Data: string, fileName: string) {
    const byteCharacters = atob(base64Data);
    const byteLength = byteCharacters.length;
    const byteArray = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    let mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }



  downloadExcel(jobId: string) {
  this.msmeService.downloadExcelBankPortfolioIFSC(jobId).subscribe((response: any) => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months start at 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0'); // <-- ensures 2 digits

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const fileName = `acc_ifsc_export_${timestamp}.xlsx`;

    this.downloadCSVFromBase64(response?.data, fileName);
  });
}

}
