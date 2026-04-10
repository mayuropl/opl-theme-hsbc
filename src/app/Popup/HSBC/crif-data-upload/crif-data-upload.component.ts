import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsmeService } from '../../../services/msme.service';
import { CommonService } from '../../../CommoUtils/common-services/common.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonMethods } from '../../../CommoUtils/common-methods';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../services/SharedService';
import { GlobalHeaders, resetGlobalHeaders } from '../../../CommoUtils/global-headers';
import { CommercialCibilUploadSuccessComponent } from '../commercial-cibil-upload-success/commercial-cibil-upload-success.component';
import { UploadCibilCustomerPopupComponent } from '../../upload-cibil-customer-popup/upload-cibil-customer-popup.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import alasql from 'alasql';
import { CibilUploadTypes, Constants } from '../../../CommoUtils/constants';

@Component({
    selector: 'app-crif-data-upload',
    templateUrl: './crif-data-upload.component.html',
    styleUrl: './crif-data-upload.component.scss'
})
export class CrifDataUploadComponent implements OnInit {
    
    
      // History data
      uploadHistory: any[] = [];
      expandedFileId: number | null = null;
    
      // Pagination
      page = 1;
      pageSize = 10;
      totalSize = 0;
      startIndex = 0;
      endIndex = 10;
      PageSelectNumber: any[] = [
        { name: '10', value: 10 },
        { name: '20', value: 20 },
        { name: '50', value: 50 },
        { name: '100', value: 100 }
      ];
    
      // Dropdowns
      moduleDropdown: any[] = [];
      fileIdDropdown: any[] = [];
      filteredFileIdDropdown: any[] = [];
      selectedModule: string = '';
      selectedFileId: string = '';
    
      // File upload
      accountFile: File | null = null;
      summaryFile: File | null = null;
      ioiFile: File | null = null;
      inquiryFile: File | null = null;
    
      // Flags
      isLoading = false;
      btnDisabled = false;
    
      constructor(
        private msmeService: MsmeService,
        public commonService: CommonService,
        public dialog: MatDialog,
        private sharedService: SharedService
  ) {
     this.sharedService.getCommercialCRIFPRStatusSubjectChangeEvent().subscribe((message) => {
      console.log('Message received for CRLF');
      console.log(message);
      this.fetchDataFromWebSocket(message);
    });
  }
    
     fetchDataFromWebSocket(responseFromWebSocket) {
      responseFromWebSocket = JSON.parse(responseFromWebSocket);
      this.fetchInputMasterIds();
      this.fetchUploadHistory();
    }

      ngOnInit(): void {
        this.fetchInputMasterIds();
        this.fetchUploadHistory();
      }
    
      // Fetch file ID dropdown
      fetchInputMasterIds(): void {
        this.msmeService.getCrifInputMasterIds().subscribe(
          (res: any) => {
            console.log('getCrifInputMasterIds response:', res);
            if (res.status === 200) {
              let response = res.data;
              if (typeof response === 'string') {
                response = JSON.parse(response);
              }
              console.log('Parsed input master response:', response);
              this.fileIdDropdown = response.listData || response.data || [];
              this.filteredFileIdDropdown = this.fileIdDropdown;
              console.log('fileIdDropdown:', this.fileIdDropdown);
            }
          },
          (err) => {
            console.error('Error fetching file IDs:', err);
            this.commonService.errorSnackBar('Error fetching file IDs');
          }
        );
      }
    
      // Fetch upload history from API
      fetchUploadHistory(): void {
        this.isLoading = true;
        this.msmeService.getCrifFileHistory(this.page, this.pageSize).subscribe(
          (res: any) => {
            this.isLoading = false;
            console.log('getCrifFileHistory response:', res);
            if (res.status === 200) {
              let response = res.data;
              if (typeof response === 'string') {
                response = JSON.parse(response);
              }
              console.log('Parsed history response:', response);
              this.uploadHistory = response.data || [];
              this.totalSize = response.totalRecords || 0;
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          },
          () => {
            this.isLoading = false;
            this.commonService.errorSnackBar('Error fetching history');
          }
        );
      }
    
      // Toggle expand/collapse for a row
      toggleDetails(fileId: number): void {
        this.expandedFileId = this.expandedFileId === fileId ? null : fileId;
      }
    
      // Pagination
      onChangePage(page: number): void {
        this.page = page;
        this.startIndex = (page - 1) * this.pageSize;
        this.endIndex = this.startIndex + this.pageSize;
        this.fetchUploadHistory();
      }
    
      pageSizeChange(size: any): void {
        this.pageSize = size;
        this.page = 1;
        this.startIndex = 0;
        this.endIndex = this.pageSize;
        this.fetchUploadHistory();
      }
    
      // File selection handlers
      onFileSelected(event: any, type: string): void {
        const file = event.target.files?.[0];
        if (!file) return;
        switch (type) {
          case 'account': this.accountFile = file; break;
          case 'summary': this.summaryFile = file; break;
          case 'ioi': this.ioiFile = file; break;
          case 'inquiry': this.inquiryFile = file; break;
        }
      }
    
      removeFile(type: string): void {
        switch (type) {
          case 'account': this.accountFile = null; break;
          case 'summary': this.summaryFile = null; break;
          case 'ioi': this.ioiFile = null; break;
          case 'inquiry': this.inquiryFile = null; break;
        }
      }
    
        // Submit upload
      procced(): void {
        if (!this.selectedFileId) {
          this.commonService.errorSnackBar('Please select a File ID');
          return;
        }
    
        if (!this.accountFile && !this.inquiryFile && !this.summaryFile && !this.ioiFile) {
          this.commonService.errorSnackBar('Please upload at least one file');
          return;
        }
    
        this.btnDisabled = true;
    
        const req: any = {
          createdBy: this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true),
          fileid: this.selectedFileId.toString(),
          requestType: this.selectedModule ? parseInt(this.selectedModule) : 1,
          accountFileName: this.accountFile ? this.accountFile.name : null,
          inquiryFileName: this.inquiryFile ? this.inquiryFile.name : null,
          summaryFileName: this.summaryFile ? this.summaryFile.name : null,
          ioiFileName: this.ioiFile ? this.ioiFile.name : null,
          accountFilepath: this.accountFile ? this.accountFile.name : null,
          inquiryFilepath: this.inquiryFile ? this.inquiryFile.name : null,
          summaryFilepath: this.summaryFile ? this.summaryFile.name : null,
          ioiFilepath: this.ioiFile ? this.ioiFile.name : null
        };
    
        console.log('Upload request:', req);
    
        this.msmeService.uploadCrifFiles(req).subscribe(
          (res: any) => {
            this.btnDisabled = false;
            if (res.status === 200) {
              this.commonService.successSnackBar('Files uploaded successfully');
              this.clearFiles();
              this.fetchUploadHistory();
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          },
          (error) => {
            this.btnDisabled = false;
            console.error('Upload error:', error);
            this.commonService.errorSnackBar('Error uploading files');
          }
        );
      }

      // Submit upload - same pattern as CommercialCibilBulkUploadComponent
      submit(uploadType?: any): void {
        let fArray = [];
    
        if (!uploadType) {
          if (!this.selectedFileId) {
            this.commonService.errorSnackBar('Please select a File ID');
            return;
          }
    
          if (!this.accountFile && !this.inquiryFile && !this.summaryFile && !this.ioiFile) {
            this.commonService.errorSnackBar('Please upload at least one file');
            return;
          }
    
          if (this.accountFile) fArray.push(this.accountFile.name);
          if (this.inquiryFile) fArray.push(this.inquiryFile.name);
          if (this.summaryFile) fArray.push(this.summaryFile.name);
          if (this.ioiFile) fArray.push(this.ioiFile.name);
        }
    
        this.btnDisabled = true;
    
        const req: any = {};
        req.isFull = this.selectedModule ? parseInt(this.selectedModule) : 0;
        req.fileId = this.selectedFileId;
        req.fileName = JSON.stringify(fArray);
    
        if (!uploadType) {
          req.uploadType = CibilUploadTypes.UPLOAD_PR;
        } else {
          req.uploadType = CibilUploadTypes.UPLOAD_ALL_CUSTOMER;
        }
    
        console.log('CRIF submit req:', req);
    
        this.msmeService.crifUploadCibilFileFromFileName(req).subscribe(
          (res: any) => {
            this.btnDisabled = false;
            if (res.status === 200) {
              if (!uploadType) {
                this.commonService.successSnackBar('File uploaded successfully');
                this.clearFiles();
                this.fetchUploadHistory();
              } else {
                this.commonService.successSnackBar('File is being prepared. You can download it from the PR Upload Status if required.');
              }
            } else {
              this.btnDisabled = false;
              if (!uploadType) {
                this.commonService.warningSnackBar(res.message);
              }
            }
          },
          () => {
            this.btnDisabled = false;
            if (!uploadType) {
              this.commonService.errorSnackBar('Error in Uploading file');
            }
          }
        );
      }
    
      clearFiles(): void {
        this.accountFile = null;
        this.inquiryFile = null;
        this.summaryFile = null;
        this.ioiFile = null;
        this.selectedFileId = '';
        this.selectedModule = '';
      }
    
      // Mark file as complete
      markFileComplete(fileId: number): void {
        this.msmeService.markCrifFileComplete(fileId).subscribe(
          (res: any) => {
            if (res.status === 200) {
              this.commonService.successSnackBar('File marked as complete');
              this.fetchUploadHistory();
              this.fetchInputMasterIds();
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          },
          () => {
            this.commonService.errorSnackBar('Error marking file as complete');
          }
        );
      }
    
      // Download Customers handlers - same as commercial cibil pattern
      downloadAllCustomer(): void {
        this.submit(4);
      }
    
      UploadCustomer_popup(): void {
        const dialogRef = this.dialog.open(UploadCibilCustomerPopupComponent, {
          data: { isCrif: true },
          panelClass: ['popupMain_design'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      }
    
      onModuleChange(): void {
        this.selectedFileId = '';
        if (this.selectedModule) {
          const reqType = parseInt(this.selectedModule);
          this.filteredFileIdDropdown = this.fileIdDropdown.filter(f => f.reqType === reqType);
        } else {
          this.filteredFileIdDropdown = this.fileIdDropdown;
        }
      }
    
      // Download handlers
      downloadData(fileId: number, type: number, fileName: string): void {
        this.commonService.successSnackBar('Your file is being prepared. Download will begin shortly…');
        this.msmeService.downloadCrifData(fileId, type).subscribe(
          (res: any) => {
            if (res.status === 200) {
               let response = res.data;
                response = JSON.parse(response);
              this.downloadFromBase64(response?.data, fileName);
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          },
          () => {
            this.commonService.errorSnackBar('Error downloading file');
          }
        );
      }

      downloadSubListData(fileId: number, isSuccess: number, fileName: string): void {
        this.commonService.successSnackBar('Your file is being prepared. Download will begin shortly…');
        const req: any = {};
        req.url = '/download_file?file_id=' + fileId + '&is_success=' + isSuccess;
        this.msmeService.downloadCrifDataByFileId(req).subscribe(
          (res: any) => {
            if (res.status === 200) {
              this.downloadFromBase64(res.contentInBytes, fileName);
            } else {
              this.commonService.warningSnackBar(res.message);
            }
          },
          () => {
            this.commonService.errorSnackBar('Error downloading file');
          }
        );
      }
    
      private downloadFromBase64(base64Data: string, filename: string): void {
        try {
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `${filename}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(link.href);
        } catch {
          this.commonService.errorSnackBar('Error processing download');
        }
      }

      // downloadSubListData(fileId: number, isSuccess: number, fileName: string): void {
      //   this.commonService.successSnackBar('Your file is being prepared. Download will begin shortly…');
      //   const req: any = {};
      //   req.url = '/download_file?file_id=' + fileId + '&is_success=' + isSuccess;
      //   this.msmeService.getCrifDataByFileId(req).subscribe(
      //     (res: any) => {
      //       if (res.status === 200) {
      //         this.downloadFromBase64(res.data, fileName);
      //       } else {
      //         this.commonService.warningSnackBar(res.message);
      //       }
      //     },
      //     () => {
      //       this.commonService.errorSnackBar('Error downloading file');
      //     }
      //   );
      // }

    
      // Get status label
      getStatusLabel(statusCode: number): string {
        switch (statusCode) {
          case 1: return 'Pending';
          case 2: return 'Completed';
          case 3: return 'Failed';
          default: return 'Unknown';
        }
      }
    
      getStatusClass(statusCode: number): string {
        switch (statusCode) {
          case 1: return 'yellow_badge';
          case 2: return 'green_badge';
          case 3: return 'red_badge';
          default: return '';
        }
      }
}
