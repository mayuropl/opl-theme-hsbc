import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MsmeService } from '../../../../services/msme.service';
import { CommonService } from '../../../../CommoUtils/common-services/common.service';
import { CommonMethods } from '../../../../CommoUtils/common-methods';
import { HttpClient } from '@angular/common/http';
import {
  CustomerBulkUploadSuccessComponent
} from '../../../../Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import {
  ReadInstructionBulkUploadComponent
} from '../../../../Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import {
  SendLinkBorrowerPopupComponent
} from '../../../../Popup/HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import { GlobalHeaders, resetGlobalHeaders } from "../../../../CommoUtils/global-headers";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import alasql from 'alasql';
import { Constants, TracxnFileAndTabCategory } from '../../../../CommoUtils/constants';


@Component({
  selector: 'app-tracxn-lending-indicators',
  // standalone: true,
  // imports: [],
  templateUrl: './tracxn-lending-indicators.component.html',
  styleUrl: './tracxn-lending-indicators.component.scss'
})
export class TracxnLendingIndicatorsComponent implements OnInit {

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient) { }


  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;

  // formgroup
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

  // tslint:disable-next-line:max-line-length
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 },];
  id;
  batchId;

  bulkUploadHistory: any;
  // tslint:disable-next-line:ban-types
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;
  userName: string;
  // file upload @Nikul
  files: any[] = [];

  ngOnInit() {
    this.constants = Constants;
    this.pageData = history.state.data;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/tracxn-lending-indicators-upload';
    GlobalHeaders['x-main-page'] = this.pageData?.pageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory();
    this.getUserDetails();
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
    // this.fetchAllRecord();
  }

  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    
    const data: any = {};
    console.log(this.pageSize);

    data.size = this.pageSize;

    data.pageIndex = this.page - 1;

    data.tracxnFileCategory = TracxnFileAndTabCategory.LEADING_INDICATOR;

    this.msmeService.getTracxnUploadedFileData(data).subscribe((res: any) => {
      // tslint:disable-next-line:triple-equals
      console.log("response ", res)
      if (res && res.status == 200) {
        if (res.data != null) {
          // this.counts = res.data;
          this.totalSize = res?.data[0]?.totalData;
        }

        this.bulkUploadHistory = res.data;
        console.log("========>")

        // //console.log("Bulkuplod  list is : ");
        // //console.log(this.bulkUploadHistory)

      } else {
        // tslint:disable-next-line:no-unused-expression
        console.error;
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  // create a form
  createBulkUploadForm(bulkUploadDetails) {
    this.bulkUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      // fileUpload: []
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
      // this.Com_BulkUpload_popup();
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
      const extension = this.getFileExtension(uploadFiles[0].name);
      if (uploadFiles[i].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        && uploadFiles[i].type != 'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
        && extension != 'enc') {
        this.commonService.errorSnackBar('File format of the upload should be xlsx');
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
        // console.log("filesss...",this.files[0].type);
        const extension = this.getFileExtension(this.files[0].name);
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
          return;
        }
        formData.append('file', this.files[0]);
      }
    }

    // console.log("formdata", formData);
    this.btnDisabled = true;
    this.msmeService.tracxnBulkUpload(formData, TracxnFileAndTabCategory.LEADING_INDICATOR, this.userName).subscribe(res => {
      //// console.log("res=========",res);
      if (res.status === 200) {
        this.btnDisabled = false;
        // res.data.forEach(element => {
        // console.log(res.data);
        this.batchId = res.data.id;
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        // this.failEntry = element.invalidEntryCount + element.failedEntryCount
        this.failEntry = res.data.fail;
        this.userName = res.data.userName;
        // });
        this.commonService.successSnackBar('File uploaded successfully');
        this.fetchBulkUploadHistory();
        this.files = [];
        // this.FileUploadStatus_popup();
        // this.commonMethod.pageRefresh();
      } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar('Error in Uploading file');
      this.files = [];
      // this.commonMethod.pageRefresh();
    });
    return true;
  }

  FileUploadStatus_popup(): void {
    // const dialogRef = this.dialog.open(PreScreenBulkUploadSuccessComponent, {
    //   data: this,
    //   panelClass: ['popupMain_design'],
    //   autoFocus: false,
    // });
    // dialogRef.afterClosed().subscribe(result => {
    // });
  }

  onClickManual() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let i = 0; i < fileUpload.files.length; i++) {
        // console.log("File format is : ");
        // console.log(fileUpload.files[i].type);
        const extension = this.getFileExtension(fileUpload.files[0].name);
        if (fileUpload.files[0]
          && fileUpload.files[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          && fileUpload.files[0].type != 'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
          && extension != 'enc') {
          this.commonService.errorSnackBar('File format of the upload should be xlsx');
          return;
        }
        const file = fileUpload.files[i];
        this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
        // console.log(this.files.length);
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
    const fileUrl = 'assets/files/.xlsx';
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = '.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  getData(type, batchId) {
    if (type === 1) { GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
    if (type === 2) { GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
    if (type === 3) { GlobalHeaders['x-page-action'] = 'Donwload All file'; }
    console.log("<===========================>");
    let createMasterJson: any = {}
    createMasterJson["mstId"] = batchId;
    createMasterJson['tracxnFileCategory'] = TracxnFileAndTabCategory.LEADING_INDICATOR;

    // createMasterJson.tableType = 'Tracxn-Lending-Indicators';
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");

    if (type == 1) {
      createMasterJson.isFailed = false;
      createMasterJson.isSuccess = true;
      this.msmeService.getTracxnExcelData(createMasterJson).subscribe((res: any) => {
        console.log('res=========', res.data);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading validData');
      });
    } else if (type == 2) {
      createMasterJson.isFailed = true;
      createMasterJson.isSuccess = false;
      this.msmeService.getTracxnExcelData(createMasterJson).subscribe(res => {
        //// console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading InValid data');
      });
    } else if (type == 3) {
      this.msmeService.getTracxnExcelData(createMasterJson).subscribe(res => {
        //// console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading Total Data');
      });
    }
  }

  downloadDataInExcel(excelData: any, type, reqType) {

    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          Sr_no: index,
          'Date of Indicators' : element.dateOfIndicator ? element.dateOfIndicator : '-',
          'Domain Name of the Company' : element.companyDomainName ? element.companyDomainName : '-',
          'City' : element.city ? element.city : '-',
          'Type of Indicator' : element.indicatorType ? element.indicatorType : '-',
          'Indicator Description' : element.indicatorDescription ? element.indicatorDescription : '-',
          'Link for more details' : element.linkForMoreDetails ? element.linkForMoreDetails : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          Sr_no: index,
          'Date of Indicators' : element.dateOfIndicator ? element.dateOfIndicator : '-',
          'Domain Name of the Company' : element.companyDomainName ? element.companyDomainName : '-',
          'City' : element.city ? element.city : '-',
          'Type of Indicator' : element.indicatorType ? element.indicatorType : '-',
          'Indicator Description' : element.indicatorDescription ? element.indicatorDescription : '-',
          'Link for more details' : element.linkForMoreDetails ? element.linkForMoreDetails : '-',
          'Failure Reason' : element.failureReason ? element.failureReason : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          Sr_no: index,
          'Date of Indicators' : element.dateOfIndicator ? element.dateOfIndicator : '-',
          'Domain Name of the Company' : element.companyDomainName ? element.companyDomainName : '-',
          'City' : element.city ? element.city : '-',
          'Type of Indicator' : element.indicatorType ? element.indicatorType : '-',
          'Indicator Description' : element.indicatorDescription ? element.indicatorDescription : '-',
          'Link for more details' : element.linkForMoreDetails ? element.linkForMoreDetails : '-',
          'Failure Reason' : element.failureReason ? element.failureReason : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);

  }

  isActionAvail(actionId: string): boolean {
    for (const page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }
    return false; // Return false if not found
  }

  isDownloading = false

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

  getUserDetails() {
    this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }

  isDownloadingTracxnLendingIndicators = false;

  // downloadTracxnLendingIndicatorsExcel(): void {
  //   const timestamp = this.getFormattedTimestamp();
  //   let fileName = 'PRE-SCREEN_ACTIVE_DATA';
  //   this.isDownloadingTracxnLendingIndicators = true
  //   this.msmeService.downloadTracxnLendingIndicatorsExcel().subscribe(res => {
  //     this.downloadExcel(res.file, fileName);
  //     this.isDownloadingTracxnLendingIndicators = false
  //   });
  // }

  private getFormattedTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
