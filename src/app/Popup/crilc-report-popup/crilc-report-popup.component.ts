import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';

@Component({
  selector: 'app-crilc-report-popup', 
  templateUrl: './crilc-report-popup.component.html',
  styleUrl: './crilc-report-popup.component.scss'
})
export class CrilcReportPopupComponent {
  modelDate = new Date();
  maxDate: Date;
  pan: string;

  constructor(
    private msmeService: MsmeService,
    private commonService: CommonService,
    public dialogRef: MatDialogRef<CrilcReportPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.pan = data?.pan || '';
  }

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

  downloadOriginalFile(): void {
    if (!this.modelDate) {
      this.commonService.warningSnackBar('Please select a month');
      return;
    }

    if (!this.pan) {
      this.commonService.warningSnackBar('PAN number is required');
      return;
    }

    // Format month to MMYYYY
    const month = (this.modelDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.modelDate.getFullYear().toString();
    const monthYear = month + year;

    const requestData = {
      pan: this.pan,
      monthYear: monthYear
    };

    this.msmeService.downloadCrilcOriginalFile(requestData).subscribe(
      (response: any) => {
        if (response && response.status === 200 && response.data) {
          const fileData = response.data[0];
          if (fileData && fileData.file_data) {
            this.downloadBase64File(fileData.file_data, fileData.filename || `CRILC_Report_${this.pan}_${monthYear}.xlsx`);
            this.commonService.successSnackBar(response.message || 'Report downloaded successfully');
            this.dialogRef.close();
          } else {
            this.commonService.warningSnackBar('No file data received');
          }
        } else {
          this.commonService.warningSnackBar(response?.message || 'Failed to download report');
        }
      },
      (error) => {
        console.error('Error downloading CRILC original file:', error);
        this.commonService.errorSnackBar(error);
      }
    );
  }

  private downloadBase64File(base64Data: string, fileName: string): void {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error decoding base64 file:', error);
      this.commonService.errorSnackBar('Failed to process file data');
    }
  }

}
