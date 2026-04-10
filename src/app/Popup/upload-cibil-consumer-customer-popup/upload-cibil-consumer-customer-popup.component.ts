import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {MatAnchor, MatButton} from '@angular/material/button';
import {MatCard} from '@angular/material/card';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatOption} from '@angular/material/autocomplete';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatSelect} from '@angular/material/select';
import {NgbModal, NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';
import {ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {UiSwitchModule} from 'ngx-ui-switch';
import {MsmeService} from '../../services/msme.service';
import {CommonService} from '../../CommoUtils/common-services/common.service';
import {CommonMethods} from '../../CommoUtils/common-methods';
import {HttpClient} from '@angular/common/http';
import {SharedService} from '../../services/SharedService';
import {CibilDownloadUrls, CibilUploadTypes, Constants, ConsumerCibilDownloadUrls} from '../../CommoUtils/constants';
import {GlobalHeaders, resetGlobalHeaders} from '../../CommoUtils/global-headers';
import {CommercialCibilUploadSuccessComponent} from '../HSBC/commercial-cibil-upload-success/commercial-cibil-upload-success.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import alasql from 'alasql';
import {UploadCustomerPopupComponent} from '../upload-customer-popup/upload-customer-popup.component';

@Component({
  selector: 'app-upload-cibil-customer-popup',
  templateUrl: './upload-cibil-consumer-customer-popup.component.html',
  styleUrl: './upload-cibil-consumer-customer-popup.component.scss'
})
export class UploadCibilConsumerCustomerPopupComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;
  fileName: any;

  //formgroup
  commCibilUploadCustomerForm: UntypedFormGroup;

  pageOfItems: Array<any>;
  pageSize = 2;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  totalCount;
  pages = 10;

  PageSelectNumber: any[] = [{name: '2', value: 2}, {name: '4', value: 4}, {name: '8', value: 8}, {name: '10', value: 10},]
  id;
  batchId;

  bulkUploadHistory: any;
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any = [];
  isFullPr: any;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
              private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private sharedService: SharedService) {

    this.sharedService.getConsumerCibilCustomerUploadStatusClickEvent().subscribe((message) => {
      console.log("Message recieved");
      console.log(message);
      this.fetchDataFromWebSocket(message);
    })
  }

  fetchDataFromWebSocket(responseFromWebSocket) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchHistory(responseFromWebSocket?.response?.response);
  }

  fetchHistory(res) {
    if(res?.data  != null ){
      let json = JSON.parse(res?.data);
      if (json && json.status == 200) {
        if (res.data != null) {
          this.counts = json.data;
          this.totalSize = json.data;
        }
      }
      this.bulkUploadHistory = json.listData;
    }
  }

  ngOnInit(): void {
    this.isFullPr = 2;
    this.pageData = history.state.data;
    this.constants = Constants;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/Commercial-Cibil-Bulk-Upload';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.breadCrumbItems = [{label: 'Dashboard'}, {label: 'Upload', path: '/', active: true}];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);
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
    // if (!onPageChangeFlag) {
    //   //console.log("onPageChangeFlag is : " + onPageChangeFlag);
    //  this.resetStartIndex();
    // } else {
    //   data.pageIndex = page - 1
    // }
    console.log(this.pageSize);

    data.size = this.pageSize;

    data.pageIndex = this.page - 1;
    // this.data.tab = tabId;
    const filterJson = {
      filterJson : JSON.stringify(data),
      tab: 2
    };
    // this.data.tab = tabId;

    this.msmeService.getConsumCibilUploadedFileData(filterJson).subscribe((res: any) => {
      if(res?.data){
        let json = JSON.parse(res?.data);
        if (json && json.statusCode == 200) {
          if (res.data != null) {
            this.counts = json.data;
            this.totalSize = json.data;
          }
        }
        this.bulkUploadHistory = json.listData;

        // //console.log("Bulkuplod  list is : ");
        // //console.log(this.bulkUploadHistory)

      } else {
        console.error
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

  // file upload @Nikul
  files: any[] = [];

  //create a form
  createBulkUploadForm(bulkUploadDetails) {
    this.commCibilUploadCustomerForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      prdataBoolean: new UntypedFormControl(
        2, // default value
        []
      )
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

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    if (files && files.length > 0) {
      if (!this.files) {
        this.files = [];
      }
      for (const item of files) {
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0);
    }
  }


  // Com_BulkUpload_popup() {
  //   const config = {
  //     windowClass: 'popupMain_design',
  //   };
  //   const modalRef = this.modalService.open(CustomerBulkUploadSuccessComponent, config);
  //   return modalRef;
  // }

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


  UploadCustomer_popup(): void {
    const dialogRef = this.dialog.open(UploadCustomerPopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
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
      this.files.push({data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true});
      // //console.log(this.files);
    }
  }

  submit() {
    // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
    //   //console.log("upload data", this.bulkUploadDetailsForm.value);
    // const formData: any = new FormData();
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
        if (extension != 'xls' && extension != 'xlsx' && extension != 'csv') {
          this.commonService.errorSnackBar("File format of the upload should be csv or xls or xlsx");
          return;
        }
        // formData.append('file', this.files[0]);
      }
    }

    this.btnDisabled = true;
    const req: any = {};
    req.fileName = this.files[0].name;
    req.uploadType = CibilUploadTypes.UPLOAD_SELECTED_CUSTOMER;
    console.log(req);
    this.msmeService.consumerCibilBulkExcelUpload(req).subscribe(res => {
      ////console.log("res=========",res);
      this.btnDisabled = false;
      // this.fetchBulkUploadHistory(null, false);
      if (res.status === 200) {
        // res.data.forEach(element => {
        //console.log(res.data);
        this.batchId = res.data.fileId
        this.totalEntry = res.data.totalEntries;
        this.successfullEntry = res.data.successEntries;
        // this.failEntry = element.invalidEntryCount + element.failedEntryCount
        this.failEntry = res.data.failEntries;
        // });
        this.commonService.successSnackBar("File uploaded successfully");
        this.fetchBulkUploadHistory(null, false);
        this.files = [];
        // this.FileUploadStatus_popup();
        // this.commonMethod.pageRefresh();
      } else {
        this.btnDisabled = false;
        this.commonService.warningSnackBar(res.message);
        // this.fetchBulkUploadHistory(null, false);
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar("Error in Uploading file");
      //this.commonMethod.pageRefresh();
    });
    return true;
  }

  // ExcelUploadFromName(){
  //   this.btnDisabled = true;
  //   const req: any = {};
  //   req.fileName = this.files[0].name;
  //   console.log(req);
  //   this.msmeService.commercialCibilBulkExcelUpload(req).subscribe(res => {
  //     ////console.log("res=========",res);
  //     if (res.status === 200) {
  //       this.btnDisabled = false;
  //       this.commonService.successSnackBar("Request is successfully completed");
  //     }
  //   }
  //   , error => {
  //     this.btnDisabled = false;
  //     // this.commonService.errorSnackBar("Error in Uploading file");
  //     //this.commonMethod.pageRefresh();
  //   });
  //   return true;
  // }


  FileUploadStatus_popup(): void {
    const dialogRef = this.dialog.open(CommercialCibilUploadSuccessComponent, {
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
        this.files.push({data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true});
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
    return this.http.get(fileUrl, {responseType: 'blob'}).pipe(
      map((res: Blob) => {
        return new Blob([res], {type: res.type});
      })
    );
  }

  downloadTemplate() {
    alert('ALL')
    const fileUrl = 'assets/files/Customer_EXIM_data.xlsx';  // Path to the file in the assets folder
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Customer_EXIM_data.xlsx';  // Update with the actual file name and extension
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  // downloadTemplate(){
  //   //console.log("download Template functional called ..");
  //   const data: any = {};
  //   data.applicationId = 1;
  //   this.msmeService.downloadTemplate(data).subscribe(res => {
  //     const blob = new Blob([res], { type: res.type });
  //     //console.log(res.type);
  //     const a: any = document.createElement("a");
  //     document.body.appendChild(a);
  //     a.style = "display:none";
  //     var url = window.URL.createObjectURL(blob);
  //     a.href = url;
  //     var date = moment().format('YYYY-MM-DD:HH:mm:ss');
  //     var filename = "E-GST Express - Upload sheet - Sample file" + ".xlsx";
  //     a.download = filename
  //     a.click();
  //     a.remove();
  //   }, error => {
  //     this.commonService.errorSnackBar("Error in Downloading Smart Excel Template");
  //   });
  // }


  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }
    return false; // Return false if not found
  }

  getData(type, url, fileId: any ,name?:any) {
    const filename = name + '-' + new Date();
    let createMasterJson: any = {};
    createMasterJson.url = url + fileId + '&type=' + type;
    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
    this.msmeService.getConsumerCibilUploadedDataByFileId(createMasterJson).subscribe((res: any) => {
      console.log('res=========', res.data);
      if (res.status === 200) {
        this.downloadCSVFromBase64(res.data, filename);
        // this.downloadDataInExcel(res.data, 2, type);
      }
    }, error => {
      this.commonService.errorSnackBar('Error in Downloading validData');
    });

  }

  downloadCSVFromBase64(base64Data: string, fileName: string ) {
    const byteCharacters = atob(base64Data);
    const byteLength = byteCharacters.length;
    const byteArray = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadDataInExcel(excelData, type, reqType) {
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
          'Borrower Pan': element.borrowerPan ? element.borrowerPan : '-',
          'Report Order Number': element.reportOrderNumber ? element.reportOrderNumber : '-',
          'Borrower Name': element.borrowerName ? element.borrowerName : '-',
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
          'Borrower Pan': element.borrowerPan ? element.borrowerPan : '-',
          'Report Order Number': element.reportOrderNumber ? element.reportOrderNumber : '-',
          'Failure Reason': element.failureReason ? element.failureReason : '-'

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
          'Borrower Pan': element.borrowerPan ? element.borrowerPan : '-',
          'Report Order Number': element.reportOrderNumber ? element.reportOrderNumber : '-',
          'Borrower Name': element.borrowerName ? element.borrowerName : '-',
          'Failure Reason': element.failureReason ? element.failureReason : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }


    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  getStatus(stageId: any): string {
    switch (Number(stageId)) {
      case 1:
        return 'Pending';
      case 2:
        return 'Completed';
      case 3:
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  openFileDialog(fileInput: HTMLInputElement) {
    setTimeout(() => {
      fileInput.click();
    }, 0);
  }

  protected readonly CibilDownloadUrls = CibilDownloadUrls;
  protected readonly ConsumerCibilDownloadUrls = ConsumerCibilDownloadUrls;
}

