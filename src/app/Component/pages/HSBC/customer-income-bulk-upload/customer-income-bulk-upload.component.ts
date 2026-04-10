import { CustomerIncomeBulkUploadSuccessComponent } from './../../../../Popup/HSBC/customer-income-bulk-upload-success/customer-income-bulk-upload-success.component';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Component({
  selector: 'app-customer-income-bulk-upload',
  templateUrl: './customer-income-bulk-upload.component.html',
  styleUrl: './customer-income-bulk-upload.component.scss'
})
export class CustomerIncomeBulkUploadComponent {

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

  regSegementBulkUploadHistory: any;
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;
  userName: string;
  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient) { }

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    // this.fetchBulkUploadHistory(null, false);
    this.fetchHistoryCustomerIncomeData();
    this.getUserDetails();
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
    data.tableType = 'CUSTOMER-INCOME';

    this.msmeService.getHistoryCustomerIncomeBulkUpload(data).subscribe((res)=>{
      console.log("History data =>",res)

      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }

        this.custIncomeBulkUploadHistory = res.listData;

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


  files: any[] = [];

  //create a form
  createBulkUploadForm(bulkUploadDetails) {
    this.bulkUploadDetailsForm = this.formBuilder.group({
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
    }
    this.uploadFilesSimulator(0);
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
      }
    }

    this.btnDisabled = true;
    this.msmeService.uploadCustomerIncome(formData,this.userName).subscribe(res => {
      console.log("customer income res=========",res);
      if (res.status === 200) {
        this.btnDisabled = false;
        //console.log(res.data);
        this.batchId = res.data.id;
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        this.failEntry = res.data.fail;
        this.userName = res.data.userName;
        this.commonService.successSnackBar("File uploaded successfully");
        this.FileUploadStatus_popup();
      } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar("Error in Uploading file");
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar("Error in Uploading file");
    });
    return true;
  }


  FileUploadStatus_popup(): void {
    const dialogRef = this.dialog.open(CustomerIncomeBulkUploadSuccessComponent, {
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

    const fileUrl = 'assets\files\Region_Master_Bulk_Upload.xlsx';  // Path to the file in the assets folder
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Region_Master_Bulk_Upload.xlsx';  // Update with the actual file name and extension
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }


  downloadDataInExcel(excelData:any, type, reqType) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
  
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = [{
          Sr_no: index,
          'Year': element.year !== null && element.year !== undefined ? element.year : '-',
          'Customer ID': element.custId !== null && element.custId !== undefined ? element.custId : '-',
          'GPS': element.gps !== null && element.gps !== undefined ? element.gps : '-',
          'GTS': element.gts !== null && element.gts !== undefined ? element.gts : '-',
          'Lending': element.lending !== null && element.lending !== undefined ? element.lending : '-',
          'Global Markets': element.globalMarkets !== null && element.globalMarkets !== undefined ? element.globalMarkets : '-',
          'Gb - Capital markets': element.gbCapitalMarkets !== null && element.gbCapitalMarkets !== undefined ? element.gbCapitalMarkets : '-',
          'Securities services': element.securitiesServices !== null && element.securitiesServices !== undefined ? element.securitiesServices : '-',
          'Other': element.others !== null && element.others !== undefined ? element.others : '-',
          'Grand total': element.grandTotal !== null && element.grandTotal !== undefined ? element.grandTotal : '-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = [{
          Sr_no: index,
          'Year': element.year !== null && element.year !== undefined ? element.year : '-',
          'Customer ID': element.custId !== null && element.custId !== undefined ? element.custId : '-',
          'GPS': element.gps !== null && element.gps !== undefined ? element.gps : '-',
          'GTS': element.gts !== null && element.gts !== undefined ? element.gts : '-',
          'Lending': element.lending !== null && element.lending !== undefined ? element.lending : '-',
          'Global Markets': element.globalMarkets !== null && element.globalMarkets !== undefined ? element.globalMarkets : '-',
          'Gb - Capital markets': element.gbCapitalMarkets !== null && element.gbCapitalMarkets !== undefined ? element.gbCapitalMarkets : '-',
          'Securities services': element.securitiesServices !== null && element.securitiesServices !== undefined ? element.securitiesServices : '-',
          'Other': element.others !== null && element.others !== undefined ? element.others : '-',
          'Grand total': element.grandTotal !== null && element.grandTotal !== undefined ? element.grandTotal : '-',
          'Failure Reason': element.failureReason !== null && element.failureReason !== undefined ? element.failureReason : '-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = [{
          Sr_no: index,
          'Year': element.year !== null && element.year !== undefined ? element.year : '-',
          'Customer ID': element.custId !== null && element.custId !== undefined ? element.custId : '-',
          'GPS': element.gps !== null && element.gps !== undefined ? element.gps : '-',
          'GTS': element.gts !== null && element.gts !== undefined ? element.gts : '-',
          'Lending': element.lending !== null && element.lending !== undefined ? element.lending : '-',
          'Global Markets': element.globalMarkets !== null && element.globalMarkets !== undefined ? element.globalMarkets : '-',
          'Gb - Capital markets': element.gbCapitalMarkets !== null && element.gbCapitalMarkets !== undefined ? element.gbCapitalMarkets : '-',
          'Securities services': element.securitiesServices !== null && element.securitiesServices !== undefined ? element.securitiesServices : '-',
          'Other': element.others !== null && element.others !== undefined ? element.others : '-',
          'Grand total': element.grandTotal !== null && element.grandTotal !== undefined ? element.grandTotal : '-',
          'Is Failed': element.isFailed !== null && element.isFailed !== undefined ? element.isFailed : '-',
          'Failure Reason': element.failureReason !== null && element.failureReason !== undefined ? element.failureReason : '-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }
  
    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }
  

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
            return true; // Return true if found
        }
    }
    return false; // Return false if not found
}

custIncomeBulkUploadHistory:[];

fetchHistoryCustomerIncomeData(){

  console.log("fetch History called...")

  const data: any = {};

    console.log(this.pageSize);

    data.size = this.pageSize;

    data.pageIndex = this.page - 1;
    data.tableType = 'INCOME';

  this.msmeService.getHistoryCustomerIncomeBulkUpload(data).subscribe((res)=>{
    console.log("History data =>",res)

    if (res && res.status == 200) {
      if (res.data != null) {
        this.counts = res.data;
        console.log("count", this.counts)

        this.totalSize = res.data;
        console.log("totalSize", this.totalSize)
      }

      this.custIncomeBulkUploadHistory = res.listData;
      console.log("custIncomeBulkUploadHistory  final ", this.custIncomeBulkUploadHistory)

    } else {
      console.error
      this.commonService.warningSnackBar(res.message);
    }
  }, err => {
    this.commonService.errorSnackBar(err);
  });

}

getData(type, batchId) {
  let createMasterJson: any = {}
  createMasterJson["mstId"] = batchId;
  createMasterJson.tableType = 'CUSTOMER-INCOME';
  if (type == 1) {
    createMasterJson["isFailed"] = false;
    // createMasterJson["isSuccess"] = true;
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.getCusIncomeData(createMasterJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.downloadDataInExcel(res.data, 2, type);
      }
    }, error => {
      this.commonService.errorSnackBar("Error in Downloading validData");
    });
  } else if (type == 2) {
    createMasterJson["isFailed"] = true;
    // createMasterJson["isSuccess"] = false;
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.getCusIncomeData(createMasterJson).subscribe(res => {
      if (res.status == 200) {
        this.downloadDataInExcel(res.data, 2, type);
      }
    }, error => {
      this.commonService.errorSnackBar("Error in Downloading InValid data");
    });
  } else if (type == 3) {
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.getCusIncomeData(createMasterJson).subscribe(res => {
      if (res.status == 200) {
        this.downloadDataInExcel(res.data, 2, type);
      }
    }, error => {
      this.commonService.errorSnackBar("Error in Downloading Total Data");
    });
  }
}
//  isDownloading = false
// downloadAllIncomeFile(){
//   this.isDownloading = true
//   this.msmeService.downLoadAllRegion().subscribe(res=>{
//     this.downloadExcel(res.file,"ALL_Region");
//     this.isDownloading = false
//     if (res.status == 204) {
//       this.commonService.warningSnackBar('Data Not Found');
//       this.isDownloading = false 
//     }
//   }, error => {
//     this.commonService.warningSnackBar('Data Not Found');
//     this.isDownloading = false
//   });
// }
// downloadExcel(byteData: string, fileName: string) {

//   const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   const a = document.createElement('a');
//   document.body.appendChild(a);
//   a.style.display = 'none';
//   const url = window.URL.createObjectURL(blob);
//   a.href = url;
//   a.download = fileName;
//   a.click();
//   window.URL.revokeObjectURL(url);
//   a.remove();
// }

// base64toBlob(base64Data: string, contentType: string) {
//   const byteCharacters = atob(base64Data);
//   const byteNumbers = new Array(byteCharacters.length);
//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i);
//   }
//   const byteArray = new Uint8Array(byteNumbers);
//   return new Blob([byteArray], { type: contentType });
// }

getUserDetails() {
  this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
}

}

