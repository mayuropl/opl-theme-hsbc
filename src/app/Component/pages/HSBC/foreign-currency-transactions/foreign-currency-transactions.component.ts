import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { SharedService } from 'src/app/services/SharedService';


@Component({
  selector: 'app-foreign-currency-transactions', 
  templateUrl: './foreign-currency-transactions.component.html',
  styleUrl: './foreign-currency-transactions.component.scss'
})
export class ForeignCurrencyTransactionsComponent implements OnInit {
  btnDisabled = false;
  files: any[] = [];
  uploadDetailsForm: UntypedFormGroup;

  bulkUploadHistory: any;
  counts: any = [];
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }];
  
  // Download state management
  downloadingFiles: Set<string> = new Set();

  constructor(
    protected commonService: CommonService,
    private formBuilder: UntypedFormBuilder,
    private msmeService: MsmeService,
    private sharedService: SharedService
  ) { 
    this.sharedService.getForeignCurrencyTransactionsStatusSubjectChangeEvent().subscribe((message) => {
      console.log('Message received for Foreign Currency');
      console.log(message);
      this.fetchDataFromWebSocket(message);
    });
  }

   fetchDataFromWebSocket(responseFromWebSocket) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchBulkUploadHistory(null, false);
  }

  ngOnInit(): void {
    this.createBulkUploadForm();
    this.fetchBulkUploadHistory();
  }

  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean): void {
    const data: any = {};
    data.size = this.pageSize;
    data.pageIndex = this.page - 1;

    this.msmeService.getHistoryForeignCurrency(data).subscribe((res: any) => {
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }
        this.bulkUploadHistory = res.listData || res.data; 
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }

  getStatus(stageId: any): string {
    switch (Number(stageId)) {
      case 1:
        return 'Pending';
      case 2:
        return 'Success';
      case 3:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  createBulkUploadForm() {
    this.uploadDetailsForm = this.formBuilder.group({
      prdataBoolean: new UntypedFormControl('1', [Validators.required]),
      fileUpload: new UntypedFormControl('', [Validators.required]),
    });
  }

  onFileDropped(files: any) {
    this.prepareFilesList(files);
  }

  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileUpload) {
      fileUpload.value = '';
    }
  }

  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index]?.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            if (this.files && this.files.length > 0) {
              this.files[index].progress += 5;
            }
          }
        }, 200);
      }
    }, 1000);
  }

  prepareFilesList(files: Array<any>) {
    if (files && files.length > 0) {
      if (!this.files) {
        this.files = [];
      }
      for (const item of files) {
        if (item && item.name) {
          item.progress = 0;
          this.files.push(item);
        }
      }
      if (this.files.length > 0) {
        this.uploadFilesSimulator(0);
      }
    }
  }

  onClickManual(event: any) {
    const fileUpload = event.target as HTMLInputElement;
    if (fileUpload.files && fileUpload.files.length > 0) {
      for (let i = 0; i < fileUpload.files.length; i++) {
        const file = fileUpload.files[i];
        if (file && file.name) {
          this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true, name: file.name, progress: 0 });
        }
      }
      this.uploadFilesSimulator(0);
    }
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  submit() {
    if (!this.files || this.files.length === 0) {
      this.commonService.errorSnackBar('Please upload a file');
      return false;
    }

    let fileNames: any = [];

    for (let file of this.files) {
      if (!file) continue;

      let extension = this.getFileExtension(file.name);
      if (extension !== 'xls' && extension !== 'xlsx' && extension !== 'csv') {
        this.commonService.errorSnackBar("File format of the upload should be csv, xls or xlsx");
        return false;
      }
      fileNames.push(file.name);
    }
    const uploadType = this.uploadDetailsForm.value.prdataBoolean;
    

    // Build FormData
    const formData = new FormData();
    formData.append('fileNames', fileNames);
    formData.append('uploadType', uploadType);
    
    // Append actual file(s) (take first file and pass its actual raw data)
    if (this.files.length > 0) {
       // using the raw blob data
      formData.append('file', this.files[0].data ? this.files[0].data : this.files[0]);
    }

    this.btnDisabled = true;

    this.msmeService.uploadForeignCurrency(formData).subscribe({
      next: (res: any) => {
        this.btnDisabled = false;
        if (res.status === 200 || res.status === 201 || res.status === 202) {
          this.commonService.successSnackBar(res.message || 'File uploaded successfully');
          this.files = [];
          const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
          if (fileUpload) {
            fileUpload.value = '';
          }
          this.fetchBulkUploadHistory();
        } else {
          this.commonService.errorSnackBar(res.message || 'Error in uploading file');
        }
      },
      error: err => {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in uploading file');
      }
    });

    return true;
  }

  downloadCSVFromBase64(base64Data: string, fileName: string) {
    const byteCharacters = atob(base64Data);
    const byteLength = byteCharacters.length;
    const byteArray = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generates a timestamped filename for downloads
   * @param type - Download type (0 = successful, 1 = failed, 2 = total)
   * @param fileId - File ID to include in filename
   * @returns Formatted filename with timestamp
   */
  generateDownloadFilename(type: number, fileId: any): string {
    const prefixMap = {
      0: 'FCT_Successful_Entries',
      1: 'FCT_Failed_Entries',
      2: 'FCT_Total_Entries'
    };
    
    const prefix = prefixMap[type] || 'FCT_Entries';
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    return `${prefix}_${fileId}_${timestamp}.xlsx`;
  }

  /**
   * Checks if a specific download is in progress
   * @param fileId - File ID
   * @param type - Download type (0, 1, or 2)
   * @returns true if download is in progress
   */
  isDownloading(fileId: any, type: number): boolean {
    return this.downloadingFiles.has(`${fileId}_${type}`);
  }

  /**
   * Downloads file data based on type and file ID
   * @param typeFlag - 'isSuccess' | 'isFailed' | 'isTotal'
   * @param fileId - The ID of the uploaded file
   * @param fileName - Original filename for naming the download
   */
  getData(typeFlag: string, fileId: any, fileName: string): void {
    // Validation
    if (!fileId) {
      this.commonService.errorSnackBar('File ID is required for download');
      return;
    }

    // Type mapping: isSuccess -> 1, isFailed -> 2, isTotal -> 3
    const typeMap = { 
      'isSuccess': 1, 
      'isFailed': 2, 
      'isTotal': 3 
    };
    
    const type = typeMap[typeFlag];
    
    if (type === undefined) {
      this.commonService.errorSnackBar('Invalid download type');
      return;
    }

    // Set loading state
    const downloadKey = `${fileId}_${type}`;
    this.downloadingFiles.add(downloadKey);

    // Prepare API payload
    const payload = { 
      fileId: fileId.toString(), 
      type: type 
    };
    
    // Call API
    this.msmeService.downloadForeignCurrencyFile(payload).subscribe({
      next: (res: any) => {
        this.downloadingFiles.delete(downloadKey);
        
        if (res && res.status === 200 && res.contentInBytes) {
          try {
            const filename = this.generateDownloadFilename(type, fileId);
            this.downloadCSVFromBase64(res.contentInBytes, filename);
            this.commonService.successSnackBar('File downloaded successfully');
          } catch (error) {
            console.error('Base64 decoding error:', error);
            this.commonService.errorSnackBar('File download failed. The file may be corrupted.');
          }
        } else {
          this.commonService.errorSnackBar(res.message || 'Failed to download file');
        }
      },
      error: (err) => {
        this.downloadingFiles.delete(downloadKey);
        console.error('Download error:', err);
        this.commonService.errorSnackBar('Network error occurred. Please check your connection and try again.');
      }
    });
  }

  



}
