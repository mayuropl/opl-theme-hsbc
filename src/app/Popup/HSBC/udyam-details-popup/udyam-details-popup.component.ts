import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-udyam-details-popup',

  templateUrl: './udyam-details-popup.component.html',
  styleUrl: './udyam-details-popup.component.scss'
})
export class UdyamDetailsPopupComponent {

  udyamData;
  constructor(public dialogRef: MatDialogRef<UdyamDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UdyamDetailsPopupComponent,private router:Router,private msmeService: MsmeService,private commonService: CommonService) { }

  ngOnInit(): void {
    this.udyamData = this.data;
    if (!this.udyamData?.udhyamCertificateRefId) {
      this.commonService.warningSnackBar("Udyam certificate is not available.");
    }
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  downloadUdyamCertificate(udhyamCertificateRefId:String){

    this.msmeService.downloadUdyamCertificate(udhyamCertificateRefId).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {
          this.commonService.successSnackBar(response.message);
          this.downloadBase64(window.atob(response.data),"Udyam certificate.pdf")
        } else {
          this.commonService.errorSnackBar(response.message);
          console.log(response.message);
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
        console.error('Something Went Wrong', error);
      }
    );
  }

  isDownloadDisabled(): boolean {
    return !this.udyamData?.udhyamCertificateRefId;
  }

  getFormattedFetchDate(): string {
    if (!this.udyamData?.udyamFetchDate) {
      return 'N/A';
    }
    
    try {
      let date: Date;
      if (typeof this.udyamData.udyamFetchDate === 'string') {
        date = new Date(this.udyamData.udyamFetchDate);
      } else {
        date = new Date(this.udyamData.udyamFetchDate);
      }
      
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      // Format date as "DD MMM YYYY, HH:MM AM/PM"
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleDateString('en-GB', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }

  downloadBase64(data: any, fileName: string) {
    const blob = new Blob([this.base64ToArrayBuffer(data)], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = downloadUrl;
    anchor.click();
}

  private base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }
}
