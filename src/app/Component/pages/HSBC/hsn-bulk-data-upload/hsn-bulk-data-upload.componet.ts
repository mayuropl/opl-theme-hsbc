import { signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';
import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-hsn-bulk-data-upload',
  templateUrl: './hsn-bulk-data-upload.componet.html',
  styleUrl: './hsn-bulk-data-upload.componet.scss'
})
export class HsnBulkDataUploadComponent implements OnInit {
 pagination: PaginationSignal;
  isLoading=false;
  PageSelectNumber: any[] = [
    {
      name: '5',
      value: 5
    },
    {
      name: '10',
      value: 10
    },
    {
      name: '20',
      value: 20
    },
    {
      name: '50',
      value: 50
    },
    {
      name: '100',
      value: 100
    },
  ]
  uploadForm: FormGroup;
  uploadedFiles: any[] = [];
  uploadAuditList: Audit[] = [];

  constructor(private fb: UntypedFormBuilder, private commonService: CommonService, private msmeService: MsmeService, private http: HttpClient, private sharedService: SharedService) {
    this.sharedService.getHsnUploadFileStatusChangeEvent().subscribe((message)=>{
        console.log("message recieved for audit change");
        setTimeout(() => {
          this.updateStatus(message);
        }, 1000);
    })
    this.initForm();
  }

  ngOnInit(): void {
    this.pagination = new PaginationSignal();
    this.pagination.pageSize = signal(5);
    this.getAudit();
  }


  initForm() {
    this.uploadForm = this.fb.group({
        vendorName: ['hsn'], // Fixed vendor for HSN component
        fileType: ['import'], // Fixed file type for HSN component
        fileUpload: ['']
      });
  }

  getAcceptedFileTypes(): string {
    // HSN component accepts Excel files
    return 'xlsx or xls';
  }

  getFileTypeText(): string {
    // HSN component uses Excel format
    return 'Excel';
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  onSubmit() {
    if (this.uploadForm.valid) {
      console.log('Form Data:', this.uploadForm.value);
      console.log('Files:', this.uploadedFiles);
      let fArray = [];
      if (this.uploadedFiles.length == 0) {
        this.commonService.errorSnackBar('Please upload a file xls or xlsx');
        return false;
      }
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        let extension = this.getFileExtension(this.uploadedFiles[0].name);
        if (extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be xls or xlsx");
          return;
        }
      }
      for (const obj of this.uploadedFiles) {
        fArray.push(obj.name);
      }

      const req: any = {};
      req.fileType = this.uploadForm?.value.fileType;
      req.vendorName = this.uploadForm?.value.vendorName;
      req.fileNameList = fArray;
      console.log("req ::::::::::::: ", req);

      this.msmeService.hsnBulkDataUpload(req).subscribe(res => {
        if (res.status === 200) {
          this.commonService.successSnackBar("File processing started in background");
          this.uploadedFiles = [];
          this.getAudit();
        } else {
          this.commonService.warningSnackBar(res.message);
          this.uploadedFiles = [];
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Uploading file");
      });

    }
  }

  retryUpload(uuid) {
    const req: any = {};
    req.uuid = uuid;
    console.log("req ::::::::::::: ", req);
    this.msmeService.hsnBulkDataRetryUpload(req).subscribe(res => {
      if (res.status === 200) {
        this.commonService.successSnackBar(res.message);
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar("Error in Uploading file");
    });
  }

  getAudit() {
    this.isLoading=true;
    let page = this.pagination.page() - 1;
    let pageSize = this.pagination.pageSize();
    this.msmeService.hsnBulkDataAudit(page, pageSize).subscribe(res => {
      if (res.status === 200) {
        this.isLoading = false;
        this.uploadAuditList = res.listData;
        this.pagination.totalSize = res?.data ? res?.data : 0;
      } else {
        this.isLoading = false;
        this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.isLoading = false;
      this.commonService.errorSnackBar("Error in fetch history");
    });
  }

  openFileDialog(fileInput: HTMLInputElement) {
    setTimeout(() => {
      fileInput.click();
    }, 0);
  }

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  prepareFilesList(files: Array<any>) {
    let alreadyUploadedFileName = '';
    if (files && files.length > 0) {
      if (!this.uploadedFiles) {
        this.uploadedFiles = [];
      }
      for (const item of files) {
        item.progress = 0;
        this.uploadedFiles.findIndex((f) => f.name == item.name) == -1 ? (this.uploadedFiles = [...this.uploadedFiles, item]) : (alreadyUploadedFileName == '' ? alreadyUploadedFileName = item.name : alreadyUploadedFileName + ',' + item.name);
      }
      console.log(this.uploadedFiles);
      if (alreadyUploadedFileName != '') {
        this.commonService.warningSnackBar("This file is already uploaed : " + alreadyUploadedFileName);
        alreadyUploadedFileName = '';
      }
      this.uploadForm.controls.fileUpload.patchValue(null);
      this.uploadFilesSimulator(0);
    }
  }

  getFileExtension(filename) {
    // get file extension
    const extension = filename.split('.').pop();
    return extension;
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.uploadedFiles.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.uploadedFiles[index]?.progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            if (this.uploadedFiles && this.uploadedFiles.length > 0) {
              this.uploadedFiles[index].progress += 10;
            }
          }
        }, 200);
      }
    }, 1000);
  }

  downloadTemplate() {
    const fileUrl = 'assets/files/HSNDashboard/HSN_Bulk_Upload_Template.xlsx';
    const fileName = 'HSN_Bulk_Upload_Template.xlsx';

    this.downloadFileByUrl(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  downloadFileByUrl(fileUrl: string): Observable<Blob> {
    return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
  }

  updateStatus(responseFromWebsocket) {
    responseFromWebsocket = JSON.parse(responseFromWebsocket);
    console.log("responseFromWebsocket ::::::::::::: ", responseFromWebsocket);
    let updatedAudit = responseFromWebsocket.response;
    let index = this.uploadAuditList.findIndex((f) => f.uuid == updatedAudit.uuid);
    if(index != -1) {
      this.uploadAuditList[index].status = updatedAudit.status;
      this.uploadAuditList[index].successCount = updatedAudit.successCount;
      this.uploadAuditList[index].uploadFailedCount = updatedAudit.uploadFailedCount;
      this.uploadAuditList[index].uploadFailedFilePath = updatedAudit.uploadFailedFilePath;
      this.uploadAuditList[index].validationFailedFilePath = updatedAudit.validationFailedFilePath;
      this.uploadAuditList[index].validationFailedCount = updatedAudit.validationFailedCount;
      this.uploadAuditList[index].failureReason = updatedAudit.failureReason;
    }
  }

  downloadFile(actualFileName, filePath:String){
    if (!filePath) {
      return;
    }
    let req = {fileName : filePath}
    this.msmeService.hsnBulkDataDownloadFile(req).subscribe(
      (response: any) => {
        if (response.status == 200 && response.data) {
          this.commonService.successSnackBar(response.message);
          // this.downloadBase64(window.atob(response.data),"Udyam certificate.pdf")
          this.downloadCSV(response?.data, actualFileName)
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

  downloadByBucketRef(type, actualFileName :string, filePath:string) {
    this.startLoading(type, filePath);
    const formData = new FormData();
    formData.append('fileName', filePath);

    this.msmeService
      .hsnBulkDataDownloadFile(formData)
      .subscribe(
        (resp) => {
          const blob = resp.body as Blob;

          if (!blob || blob.size === 0) {
            this.stopLoading(type, filePath);
            console.error('Received empty blob');
            this.commonService.warningSnackBar(
              'File is empty or could not be downloaded'
            );
            return;
          }
          const cd =
            resp.headers.get('content-disposition') ||
            resp.headers.get('Content-Disposition') ||
            '';
          let filename = (() => {
            const star = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(cd);
            if (star && star[1]) {
              try {
                return decodeURIComponent(star[1]);
              } catch {}
            }
            const quoted = /filename\s*=\s*"([^"]+)"/i.exec(cd);
            if (quoted && quoted[1]) return quoted[1];

            const unquoted = /filename\s*=\s*([^;]+)/i.exec(cd);
            if (unquoted && unquoted[1]) return unquoted[1].trim();

            return '';
          })();
          if (!actualFileName) {
            const ct = resp.headers.get('content-type') || blob.type || '';
            if (ct.includes('zip')) actualFileName = name + '.zip';
            else if (ct.includes('json')) actualFileName = name + '.json';
            else if (ct.includes('text')) actualFileName = name + '.txt';
            else actualFileName = name + '.bin';
          }

          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = actualFileName.split(".")[0]+".xlsx";
          a.click();
          URL.revokeObjectURL(objectUrl);

          this.stopLoading(type, filePath);
        },
        (error) => {
          this.stopLoading(type, filePath);
          console.error('Failed to download file', error);
          this.commonService.warningSnackBar('Failed to download file');
        }
      );
  }

  startLoading(type, bucketRefId: String) {
    const item = this.uploadAuditList.find((i) => type==1 ? i.uploadFailedFilePath === bucketRefId : i.validationFailedFilePath === bucketRefId);
    if (item) {
      type == 1 ? item.isUploadFailLoading = true : item.isValidationFailLoading = true;
    }
  }

  stopLoading(type, bucketRefId: String) {
    const item = this.uploadAuditList.find((i) => type==1 ? i.uploadFailedFilePath === bucketRefId : i.validationFailedFilePath === bucketRefId);
    if (item) {
      type == 1 ? item.isUploadFailLoading = false : item.isValidationFailLoading = false;
    }
  }
  // downloadBase64(data: any, fileName: string) {
  //   const blob = new Blob([this.base64ToArrayBuffer(data)], { type: 'application/pdf' });
  //   const downloadUrl = window.URL.createObjectURL(blob);
  //   const anchor = document.createElement('a');
  //   anchor.download = fileName;
  //   anchor.href = downloadUrl;
  //   anchor.click();
  // }

  // private base64ToArrayBuffer(base64) {
  //   var binaryString = window.atob(base64);
  //   var binaryLen = binaryString.length;
  //   var bytes = new Uint8Array(binaryLen);
  //   for (var i = 0; i < binaryLen; i++) {
  //     var ascii = binaryString.charCodeAt(i);
  //     bytes[i] = ascii;
  //   }
  //   return bytes;
  // }

  downloadCSV(byteData: string, fileName: string) {
    // Create a Blob from the base64 encoded byte data
    const blob = this.base64toBlob(byteData, 'text/csv;charset=utf-8;');

    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Create object URL from the Blob
    const url = window.URL.createObjectURL(blob);

    // Set the anchor element's properties
    a.href = url;
    fileName = fileName.endsWith('.csv') ? fileName.replace('.csv', '') : (fileName.endsWith('.xlsx') ? fileName.replace('.xlsx','') : fileName);
    a.download =  fileName + ' Insertion Failed' + '.csv';

    // Trigger the download
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  base64toBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}

export interface Audit {
  id: number;
  uuid: string;
  fileName: string;
  fileType: 'Export' | 'Import';
  vendorName: 'Panjiva' | 'Volza';
  status: 'Pending' | 'Processing' | 'Success' | 'Fail';
  createdDate: Date | string;
  successCount: number;
  successFilePath?: string;
  uploadFailedCount: number;
  uploadFailedFilePath?: string;
  validationFailedCount: number;
  validationFailedFilePath?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedDate?: Date | string;
  isUploadFailLoading?: boolean;
  isValidationFailLoading?: boolean;
  failureReason?:string;
}