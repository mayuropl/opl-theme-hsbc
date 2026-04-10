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
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import { MatSelectChange } from '@angular/material/select';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { SharedService } from 'src/app/services/SharedService';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-customer-master',
  templateUrl: './customer-master.component.html',
  styleUrl: './customer-master.component.scss'
})
export class CustomerMasterComponent implements OnInit {

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

      this.sharedService.getCustomerUploadClickEvent().subscribe((message) => {
        console.log("1message Recived");
        this.fetchDataFromWebSocket(message);
         })
    }
    fetchDataFromWebSocket(responseFromWebSocket?){
      responseFromWebSocket = JSON.parse(responseFromWebSocket);
       this.fetchBulkUploadHistory();
    }

protected readonly consValue = Constants;
  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
     if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.CUSTOMER_MASTER)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/Customer-Master-Bulk-Upload';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.getUserDetails();
    this.fetchBulkUploadHistory(null, false);
    this.requestPayloadStatus = true;
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }
  onChangePage(page: any): void {
    // update current page of items
    // console.log("Page number is : ");
    // console.log(this.pageSize);
    // this.approvalStatus = approvalStatus;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
    // this.fetchAllRecord();
  }
  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    const data: any = {};

    console.log(this.pageSize);

    data.size = this.pageSize;

    data.pageIndex = this.page - 1;
    data.uploadType = this.fileType;
    // this.data.tab = tabId;

    this.msmeService.getCustMasterUploadedFileData(data).subscribe((res: any) => {
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }

        this.custMastBulkUploadHistory = res.listData;

      } else {
        console.error
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
  }

  onFileTypeChange(): void {
    this.resetStartIndex();
    this.fetchBulkUploadHistory(null, false);
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  // file upload @Nikul
  files: any[] = [];

  //create a form
  createBulkUploadForm(bulkUploadDetails) {
    this.bulkUploadDetailsForm = this.formBuilder.group({
      fileType:['CUSTOMER', Validators.required],
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      //fileUpload: []
    });
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
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
      //this.Com_BulkUpload_popup();
    }
    this.uploadFilesSimulator(0);
  }

  Com_BulkUpload_popup() {
    const config = {
      windowClass: 'popupMain_design',
    };
    const modalRef = this.modalService.open(CustomerBulkUploadSuccessComponent, config);
    return modalRef;
  }

  Read_Instruction_BulkUpload_popup() {
    const config = {
      windowClass: 'popupMain_design',
    };
    const modalRef = this.modalService.open(ReadInstructionBulkUploadComponent, config);
    return modalRef;
  }

  Com_SendLinkTo_Borrower_popup() {
    const config = {
      windowClass: 'popupMain_design',
    };
    const modalRef = this.modalService.open(SendLinkBorrowerPopupComponent, config);
    return modalRef;
  }
  onClick(uploadFiles: FileList) {
    for (let i = 0; i < uploadFiles.length; i++) {
      let extension = this.getFileExtension(uploadFiles[0].name);
      if (uploadFiles[i].type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        && uploadFiles[i].type != "application/vnd.ms-excel.sheet.binary.macroEnabled.12"
        && extension != "enc") {
        this.commonService.errorSnackBar("File format of the upload should be xlsx");
        return;
      }
      const file = uploadFiles[i];
      this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
      // //console.log(this.files);
    }
  }

  submit() {
    GlobalHeaders['x-page-action'] = 'Uploading file';
    // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
    //   //console.log("upload data", this.bulkUploadDetailsForm.value);
    const formData: any = new FormData();
    if (this.files.length == 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }
    for (let i = 0; i < this.files.length; i++) {
      if (this.commonService.isObjectIsEmpty(this.files)) {
        this.commonService.errorSnackBar('Please upload a file.');
        return false;
      } else {
        //console.log("filesss...",this.files[0].type);
        let extension = this.getFileExtension(this.files[0].name);
        if (extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be xls or xlsx");
          return;
        }
        formData.append('file', this.files[0]);
        formData.append('fileType', this.fileType);
      }
    }

    this.btnDisabled = true;
    this.msmeService.uploadCustomerMaster(formData, this.userName).subscribe(res => {
      ////console.log("res=========",res);
      if (res.status === 200) {
        console.log("SUCEEEEESSSSSSSSS")
        this.btnDisabled = false;
        // res.data.forEach(element => {
        //console.log(res.data);
        this.batchId = res.data.id
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        // this.failEntry = element.invalidEntryCount + element.failedEntryCount
        this.failEntry = res.data.fail
        // });
        this.commonService.successSnackBar("File processing has been initialized.");
        this.files=[];
        this.bulkUploadDetailsForm.get('fileUpload').reset();
        //this.FileUploadStatus_popup();
        //this.commonMethod.pageRefresh();
        this.fetchBulkUploadHistory(null, false);
      } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar("Error in Uploading file");
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar("Error in Uploading file");
      //this.commonMethod.pageRefresh();
    });
    return true;
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

  downloadFile(fileUrl: string): Observable<Blob> {
    return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
  }

  downloadTemplate() {
    GlobalHeaders['x-page-action'] = 'Download Template';
    alert('ALL')
    const fileUrl = 'assets/files/Customer_master_bulk upload_template.xlsx';  // Path to the file in the assets folder
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Customer_master_bulk upload.xlsx';  // Update with the actual file name and extension
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }


  getData(type, batchId) {
    let createMasterJson: any = {}
    createMasterJson["mstId"] = batchId;
    createMasterJson["downloadType"] = this.fileType;

    // Prevent multiple clicks — track per batchId+type
    const downloadKey = batchId + '_' + type;
    if (this.activeDownloads.has(downloadKey)) {
      this.commonService.warningSnackBar('Download is already in progress for this entry.');
      return;
    }
    this.activeDownloads.add(downloadKey);

    let fileName = '';
    if (type == 1) {
      createMasterJson["isFailed"] = false;
      fileName = "Successful_Entries_" + new Date().toDateString();
    } else if (type == 2) {
      createMasterJson["isFailed"] = true;
      fileName = "Failed_Entries_" + new Date().toDateString();
    } else if (type == 3) {
      fileName = "Total_Entries_" + new Date().toDateString();
    }

    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.streamCustomerBulkDataByMstId(createMasterJson).subscribe(
      (blob: Blob) => {
        this.activeDownloads.delete(downloadKey);
        if (blob && blob.size > 0) {
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.style.display = 'none';
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName + '.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        } else {
          this.commonService.warningSnackBar("No data found.");
        }
      },
      (error) => {
        this.activeDownloads.delete(downloadKey);
        this.commonService.errorSnackBar("Error in downloading data");
      }
    );
  }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
}
isDownloading = false;
isChildDownloading = false;
activeDownloads = new Set<string>();

isDownloadActive(batchId: any, type: number): boolean {
  return this.activeDownloads.has(batchId + '_' + type);
}

getAllCustomers(): void {
  GlobalHeaders['x-page-action'] = 'Get All Customer Data';
  this.isDownloading = true;

  if (this.customerStatus === 'active') {
    this.requestPayloadStatus = true;
  } else if (this.customerStatus === 'inactive') {
    this.requestPayloadStatus = false;
  } else {
    this.requestPayloadStatus = null;
  }

  this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
  this.msmeService.getAllCustomerMasterData(this.requestPayloadStatus).subscribe(
    (blob: Blob) => {
      this.isDownloading = false;
      if (blob && blob.size > 0) {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'All-Customer.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        this.commonService.warningSnackBar('No data found.');
      }
    },
    (error) => {
      this.isDownloading = false;
      this.commonService.errorSnackBar('Error in downloading data');
    }
  );
}

getAllChildCustomers(): void {
  GlobalHeaders['x-page-action'] = 'Get All Child Customer Data';
  this.isChildDownloading = true;
  this.msmeService.getAllChildCustomerData().subscribe(res => {
    this.passRefershIDCallToBucket(res.bucketReferenceId, "All-Child-Customer");
    this.isChildDownloading = false;
  }, err => {
    console.error('Error fetching child customer data:', err);
    this.isChildDownloading = false;
  });
}

onStatusChange(event: MatSelectChange) {
  this.customerStatus = event.value;
}

downloadExcelForCustomers(excelData:any, type:any){
  let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";

      fileName = 'AllCutomers ' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          'SR. NO.': index,
          'CUST_NAME': element.name ? element.name : '-',
          'PAN_NUMBER': element.panNo ? element.panNo : '-',
          'IEC': element.ieCode ? element.ieCode : '-',
          'CUST_ID':element.customerId ? element.customerId : '-',
          'Customer CIN': element.cin ? element.cin : '-',
          'Scope': element.scope ? element.scope : '-',
          'Business': element.business ? element.business : '-',
          'Segment': element.segment ? element.segment : '-',
          'Region': element.region ? element.region : '-',
          'CUSTOMER TYPE': element.customerType ? element.customerType : '-',
          //modify
          'PRIMARY RM PS ID*': element.rmId ? element.rmId : '-',
          'CRR ': element.crr ? element.crr : '-',
          'DATE OF ONBOARDING':element.dateOfOnboarding ? element.dateOfOnboarding:'-',
          'LIMIT REVIEW DATE':element.limitReviewDate ? element.limitReviewDate: '-',
          'CDD REVIEW DATE':element.cddReviewDate ? element.cddReviewDate : '-',
          'CDD RATING':element.cddRating ? element.cddRating : '-',
          'CUSTOMER REVENUE LAST YEAR':element.revenueLastYear ? element.revenueLastYear : '-',
          'CUSTOMER REVENUE CURRENT YEAR':element.revenueCurrentYear ? element.revenueCurrentYear : '-',
          'CALL SAVERISK ASYNC APIS':element.isCallAsyncApi ? element.isCallAsyncApi : '-',
          'Last Approved Date':element.lastApprovalDate ? element.lastApprovalDate : '-',
          'Active Customer or not':element.isActive ? element.isActive :'-',
          "EXIM": element.exim ? element.exim : '-',
          "ITITES": element.itites ? element.itites : '-',
          "PEVC": element.pevc ? element.pevc : '-',
          "AGRI": element.agri ? element.agri : '-',
          "FCRN": element.fcrn ? element.fcrn : '-',
          "FPO": element.fpo ? element.fpo : '-',
          "SEZ": element.sez ? element.sez : '-',
          "STPI": element.stpi ? element.stpi : '-',
          "GCC": element.gcc ? element.gcc : '-',
          "ANCHOR_RELATIONSHIP": element.anchorRelationship ? element.anchorRelationship : '-',
          "NOT_CATEGORIZED": element.notCategorized ? element.notCategorized : '-',
          "PARENT_COMPANY_NAME": element.parentCompanyName ? element.parentCompanyName : '-',
          "COUNTRY": element.country ? element.country : '-',
          "GLOBAL_RM_NAME": element.globalRmName ? element.globalRmName : '-',
          "MNC_NTG": element.mncNtg ? element.mncNtg : '-',
          "MNC_ETG": element.mncEtg ? element.mncEtg : '-'

        }];
        downloadData = downloadData.concat(allApplications);
      });
      alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);

}
getUserDetails() {

  this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
}

  downloadExcel(byteData: string, fileName: string) {

    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
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

  passRefershIDCallToBucket(docReferenceId,reportName) {
     this.downloadFileFromBucket(docReferenceId, 'txt').subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = reportName+'.xlsx';  // Update with the actual file name and extension
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

    encryptedObject(data) {
      return { data: AesGcmEncryptionService.getEncPayload(data) };
    }

    downloadFileFromBucket(fileName: string, extension: string): Observable<Blob> {
      let createMasterJson: any = {};
      createMasterJson["fileName"] = fileName;
      createMasterJson["extension"] = extension;
      return this.http.post(RestUrl.GET_FILE_FROM_BUCKET, this.encryptedObject(createMasterJson), { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
    }

    get fileType() {
  return this.bulkUploadDetailsForm.get('fileType')?.value;
}
}
