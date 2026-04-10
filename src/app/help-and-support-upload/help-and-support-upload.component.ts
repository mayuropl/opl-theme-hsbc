import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, booleanAttribute } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import alasql from 'alasql';
import { log } from 'console';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { CustomerBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import { ReadInstructionBulkUploadComponent } from 'src/app/Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { SendLinkBorrowerPopupComponent } from 'src/app/Popup/HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "src/app/CommoUtils/global-headers";
import { MatSelectChange } from '@angular/material/select';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { SharedService } from 'src/app/services/SharedService';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-help-and-support-upload',
  templateUrl: './help-and-support-upload.component.html',
  styleUrls: ['./help-and-support-upload.component.scss']
})
export class  HelpAndSupportUploadComponent implements OnInit {

  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;

  //formgroup
  bulkUploadDetailsForm: UntypedFormGroup;

  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  pages = 10;

  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 },]
  id;
  batchId;

  custMastBulkUploadHistory: any;
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;
  userName: string;
  customerStatus: string = 'active';
  requestPayloadStatus: boolean;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient,private sharedService: SharedService) {

      this.sharedService.getHelpAndSupportUploadStatusClickEvent().subscribe((message) => {
        console.log("1message Recived");
        this.fetchDataFromWebSocket(message);
         })
    }
    fetchDataFromWebSocket(responseFromWebSocket?){
      responseFromWebSocket = JSON.parse(responseFromWebSocket);
      if (responseFromWebSocket?.status === 'FAILED') {
        this.commonService.errorSnackBar(responseFromWebSocket?.message || 'File processing failed');
      }
      this.fetchHelpAndSupportHistory();
    }

protected readonly consValue = Constants;
  ngOnInit(): void {
    console.log('=== Component ngOnInit ===');
    this.constants = Constants;
    this.pageData = history.state.data;
     if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.HELP_AND_SUPPORT_UPLOAD)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/Help-And-Support-Upload';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Help & Support', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.getUserDetails();
    
    // Initialize with empty array to prevent undefined issues
    this.custMastBulkUploadHistory = [];
    this.totalSize = 0;
    
    console.log('Calling fetchHelpAndSupportHistory from ngOnInit');
    this.fetchHelpAndSupportHistory(null, false);
    this.requestPayloadStatus = true;
  }

    pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchHelpAndSupportHistory(page, true);
  }
  onChangePage(page: any): void {
    // update current page of items
    // console.log("Page number is : ");
    // console.log(this.pageSize);
    // this.approvalStatus = approvalStatus;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchHelpAndSupportHistory(page, true);
    // this.fetchAllRecord();
  }
  fetchHelpAndSupportHistory(page?, onPageChangeFlag?: boolean): void {

    if (page) {
      this.page = page;
    }
    
    const data: any = {
      size: this.pageSize,
      pageIndex: this.page - 1  // Backend expects 0-based index
    };


    this.msmeService.getHelpAndSupportFiles(data).subscribe({
      next: (res: any) => {
  
        
        if (res?.status === 200) {
          // Backend returns: { allFiles: [], completedFiles: [], totalCount: number }
          this.custMastBulkUploadHistory = res.data.allFiles || [];
          this.totalSize = res.data.totalCount || 0;
          
          console.log(' Data loaded:', {
            currentPageItems: this.custMastBulkUploadHistory.length,
            totalSize: this.totalSize,
            page: this.page,
            pageSize: this.pageSize,
            startIndex: this.startIndex,
            endIndex: this.endIndex
          });
          
        } else {
          this.custMastBulkUploadHistory = [];
          this.totalSize = 0;
          this.commonService.warningSnackBar(res?.message || 'API returned error status');
        }
      },
      error: (err) => {
        console.error('❌ Error loading data:', err);
        this.custMastBulkUploadHistory = [];
        this.totalSize = 0;
        this.commonService.errorSnackBar('Failed to load data from backend');
      }
    });
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  // file upload @Nikul
  files: any[] = [];
  fileDescription: string = '';

  //create a form
  createBulkUploadForm(bulkUploadDetails) {
    this.bulkUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      //fileUpload: []
    });
  }
  /**
   * on file drop handler - accept only one file
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing - accept only one file
   */
  fileBrowseHandler(files) {
    // allow only single file
    if (files.length > 1) {
      this.commonService.errorSnackBar('Please upload only one file at a time');
      return;
    }
    const file = files[0];
    if (!file) return;
    
    // Check file size (250MB = 250 * 1024 * 1024 bytes)
    const maxSize = 250 * 1024 * 1024; // 250MB in bytes
    if (file.size > maxSize) {
      this.commonService.warningSnackBar('Cannot upload file more than 250 MB');
      return;
    }
    
    // Check file extension - only .mp4 and .pdf allowed
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.mp4', '.pdf'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      this.commonService.warningSnackBar('Only .mp4 and .pdf files are allowed');
      return;
    }
    
    file.progress = 0;
    this.files = []; // reset any previous selection
    this.files.push(file);
    this.uploadFilesSimulator(0);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (!this.files[index]) {
            clearInterval(progressInterval);
            return;
          }
          if(this.files.length == 0){
            return;
          }
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    // ensure single file and valid type
    if (!files || files.length === 0) {
      return;
    }
    if (files.length > 1) {
      this.commonService.warningSnackBar('Please upload only one file at a time');
      return;
    }
    const item = files[0];
    
    // Check file size (250MB = 250 * 1024 * 1024 bytes)
    const maxSize = 250 * 1024 * 1024; // 250MB in bytes
    if (item.size > maxSize) {
      this.commonService.warningSnackBar('Cannot upload file more than 250 MB');
      return;
    }
    
    // Check file extension - only .mp4 and .pdf allowed
    const fileName = item.name.toLowerCase();
    const allowedExtensions = ['.mp4', '.pdf'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      this.commonService.warningSnackBar('Only mp4 and pdf files are allowed');
      return;
    }
    
    item.progress = 0;
    this.files = [item];
    this.uploadFilesSimulator(0);
  }

  Com_BulkUpload_popup() {
    const config = {
      windowClass: 'popupMain_design',
    };
    const modalRef = this.modalService.open(CustomerBulkUploadSuccessComponent, config);
    return modalRef;
  }

  // Read_Instruction_BulkUpload_popup() {
  //   const config = {
  //     windowClass: 'popupMain_design',
  //   };
  //   const modalRef = this.modalService.open(ReadInstructionBulkUploadComponent, config);
  //   return modalRef;
  // }

  // Com_SendLinkTo_Borrower_popup() {
  //   const config = {
  //     windowClass: 'popupMain_design',
  //   };
  //   const modalRef = this.modalService.open(SendLinkBorrowerPopupComponent, config);
  //   return modalRef;
  // }
  
  getUserDetails() {

  this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
}
   isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
}
  // submit() {
  //   console.log('Submit called');
  //   // Add your submit implementation here
  // }

  // getFileExtension(filename: string): string {
  //   return filename.split('.').pop()?.toLowerCase() || '';
  // }
  //   for (let i = 0; i < uploadFiles.length; i++) {
  //     let extension = this.getFileExtension(uploadFiles[0].name);
  //     if (uploadFiles[i].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //       && uploadFiles[i].type != "application/vnd.ms-excel.sheet.binary.macroEnabled.12"
  //       && extension != "enc") {
  //       this.commonService.errorSnackBar("File format of the upload should be xlsx");
  //       return;
  //     }
  //     const file = uploadFiles[i];
  //     this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
  //     // //console.log(this.files);
  //   }
  // }

  submit() {
    if (this.files.length === 0) {
      this.commonService.warningSnackBar('Please upload a mp4 or pdf file');
      return false;
    }

    const file = this.files[0];
    if (!file) {
      this.commonService.warningSnackBar('Please upload a file.');
      return false;
    }
    
    // Check file size (250MB = 250 * 1024 * 1024 bytes)
    const maxSize = 250 * 1024 * 1024; // 250MB in bytes
    if (file.size > maxSize) {
      this.commonService.warningSnackBar('Cannot upload file more than 250 MB');
      return false;
    }
    
    // Check file extension - only .mp4 and .pdf allowed
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.mp4', '.pdf'];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      this.commonService.errorSnackBar('Only .mp4 and .pdf files are allowed');
      return false;
    }

    GlobalHeaders['x-page-action'] = 'Uploading help/support file';
    const formData: any = new FormData();
    formData.append('file', file);
    if (this.fileDescription) {
      formData.append('description', this.fileDescription);
    }

    this.btnDisabled = true;
    this.msmeService.uploadHelpAndSupport(formData, this.userName).subscribe({
      next: (res) => {
        this.btnDisabled = false;
        if (res && res.status=== 200) {
          this.commonService.successSnackBar("File processing has been initialized.");
          this.files = [];
          this.bulkUploadDetailsForm.get('fileUpload').reset();
          this.fileDescription = '';
          this.fetchHelpAndSupportHistory(null, false);
        } else {
          this.commonService.errorSnackBar('Error in uploading file');
        }
      },
      error: (error) => {
        this.btnDisabled = false;
        let errorMessage = 'Error in uploading file';
        if (error?.status === 413) {
          errorMessage = 'File size too large. Please choose a smaller file.';
        } else if (error?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }
        this.commonService.errorSnackBar(errorMessage);
      }
    });
    return true;
  }

  isUploadDisabled(): boolean {
    if (this.files.length === 0) {
      return true;
    }
    const file = this.files[0];
    const maxSize = 250 * 1024 * 1024; // 250MB in bytes
    return file.size > maxSize || this.btnDisabled;
  }

  syncingBucket: boolean = false;

  syncWithBucket(): void {
    console.log('🔄 Starting bucket sync...');
    this.syncingBucket = true;

    GlobalHeaders['x-page-action'] = 'Syncing bucket files';

    this.msmeService.syncBucketFiles().subscribe({
      next: (res) => {
        this.syncingBucket = false;
        console.log('✅ Sync response:', res);

        if (res?.status === 200) {
          const syncedCount = res.data?.syncedCount || 0;
          
          if (syncedCount > 0) {
            this.commonService.successSnackBar(`${syncedCount} new file(s) synced successfully from bucket`);
            // Refresh the file list
            this.fetchHelpAndSupportHistory(null, false);
          } else {
            this.commonService.infoSnackBar('No new files found in bucket to sync');
          }
        } else {
          this.commonService.warningSnackBar(res?.message || 'Sync completed with warnings');
        }
      },
      error: (err) => {
        this.syncingBucket = false;
        console.error('❌ Sync error:', err);
        this.commonService.errorSnackBar(err?.error?.message || 'Failed to sync bucket files');
      }
    });
  }


  FileUploadStatus_popup(): void {
    const dialogRef = this.dialog.open(CustomerBulkUploadSuccessComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onClickManual() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let i = 0; i < fileUpload.files.length; i++) {
        //console.log("File format is : ");
        //console.log(fileUpload.files[i].type);
        let extension = this.getFileExtension(fileUpload.files[0].name);
        if (fileUpload.files[0]
          && fileUpload.files[0].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          && fileUpload.files[0].type != "application/vnd.ms-excel.sheet.binary.macroEnabled.12"
          && extension != "enc") {
          this.commonService.errorSnackBar("File format of the upload should be xlsx");
          return;
        }
        const file = fileUpload.files[i];
        this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
        //console.log(this.files.length);
      }

    };
    fileUpload.click();
  }

  getFileExtension(filename) {
    // get file extension
    const extension = filename.split('.').pop();
    return extension;
  }

  // downloadFile(fileUrl: string): Observable<Blob> {
  //   return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
  //     map((res: Blob) => {
  //       return new Blob([res], { type: res.type });
  //     })
  //   );
  // }

  // downloadTemplate() {
  //   GlobalHeaders['x-page-action'] = 'Download Template';
  //   alert('ALL')
  //   const fileUrl = 'assets/files/Customer_master_bulk upload_template.xlsx';  // Path to the file in the assets folder
  //   this.downloadFile(fileUrl).subscribe(blob => {
  //     const a = document.createElement('a');
  //     const objectUrl = URL.createObjectURL(blob);
  //     a.href = objectUrl;
  //     a.download = 'Customer_master_bulk upload.xlsx';  // Update with the actual file name and extension
  //     a.click();
  //     URL.revokeObjectURL(objectUrl);
  //   });
  // }


  // getData(type, batchId) {
  //   let createMasterJson: any = {}
  //   createMasterJson["mstId"] = batchId;
  //   if (type == 1) {
  //     createMasterJson["isFailed"] = false;
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getCustomerBulkDataByMstId(createMasterJson).subscribe((res: any) => {
  //       console.log("res=========", res.contentInBytes);
  //       if (res.status == 200) {
  //         this.downloadExcel(res.contentInBytes,"Successful_Entries_"+ new Date().toDateString());
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading validData");
  //     });
  //   } else if (type == 2) {
  //     createMasterJson["isFailed"] = true;
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getCustomerBulkDataByMstId(createMasterJson).subscribe(res => {
  //       if (res.status == 200) {
  //         // this.downloadDataInExcel(res.data, 2, type);
  //         this.downloadExcel(res.contentInBytes,"Failed_Entries_"+ new Date().toDateString())

  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading InValid data");
  //     });
  //   } else if (type == 3) {
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getCustomerBulkDataByMstId(createMasterJson).subscribe(res => {
  //       if (res.status == 200) {
  //         // this.downloadDataInExcel(res.data, 2, type);
  //         this.downloadExcel(res.contentInBytes,"Total_Entries_"+ new Date().toDateString())

  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading Total Data");
  //     });
  //   }
  // }

//   isActionAvail(actionId: string): boolean {
//     for (let page of this.pageData?.actions) {
//         if (page?.actionId === actionId) {
//             return true; // Return true if found
//         }
//     }
//     return false; // Return false if not found
// }
// isDownloading = false;

// getAllCustomers(): void {
//   GlobalHeaders['x-page-action'] = 'Get All Customer Data';
//   this.isDownloading = true;

//   if (this.customerStatus === 'active') {
//     this.requestPayloadStatus = true;
//   } else if (this.customerStatus === 'inactive') {
//     this.requestPayloadStatus = false;
//   } else {
//     this.requestPayloadStatus = null;
//   }

//   this.msmeService.getAllCustomerMasterData(this.requestPayloadStatus).subscribe(res=>{
//     console.log("response=========", res)
//     // this.downloadExcel(res.file,"AllCutomers")
//     this.passRefershIDCallToBucket(res.bucketReferenceId,"All-Customer");
//     this.isDownloading = false
//   })
  // this.msmeService.getAllCustomerMasterData().subscribe({
  //   next: (res: any) => {
  //     if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
  //       this.downloadExcelForCustomers(res.data, 1);
  //     } else {
  //       this.commonService.warningSnackBar('No customer data found to download.')
  //     }
  //   },
  //   error: (err: any) => {
  //     console.error('Error fetching customer data:', err);
  //   }
  // });




  



}
