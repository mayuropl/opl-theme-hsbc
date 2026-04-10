import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MsmeService } from 'src/app/services/msme.service';
import * as moment from 'moment';
import alasql from 'alasql';
import { MatDialog } from '@angular/material/dialog';
import { BulkUploadSuccessFullyComponent } from 'src/app/Popup/HSBC/bulk-upload-success-fully/bulk-upload-success-fully.component';
import { ReadInstructionBulkUploadComponent } from 'src/app/Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { SendLinkBorrowerPopupComponent } from 'src/app/Popup/HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import {Router} from "@angular/router";


@Component({
  selector: 'app-bulk-upload-pabl',
  templateUrl: './bulk-upload-pabl.component.html',
  styleUrls: ['./bulk-upload-pabl.component.scss']
})
export class BulkUploadPablComponent implements OnInit {


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

  bulkUploadHistory: any;
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private router: Router) { }

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);
  }

  onChangePage(page: any): void {
    // update current page of items
    // //console.log("Page number is : ");
    // //console.log(page);
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
    data.size = this.pageSize;

    data.pageIndex = this.page - 1;
    // this.data.tab = tabId;

    this.msmeService.getBulkUploadFile(data).subscribe((res: any) => {
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }

        this.bulkUploadHistory = res.listData;

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
      //this.Com_BulkUpload_popup();
    }
    this.uploadFilesSimulator(0);
  }

  Com_BulkUpload_popup() {
    const config = {
      windowClass: 'popup-650 popupMain_design',
    };
    const modalRef = this.modalService.open(BulkUploadSuccessFullyComponent, config);
    return modalRef;
  }

  Read_Instruction_BulkUpload_popup() {
    const config = {
      windowClass: 'popup-650 popupMain_design',
    };
    const modalRef = this.modalService.open(ReadInstructionBulkUploadComponent, config);
    return modalRef;
  }

  Com_SendLinkTo_Borrower_popup() {
    const config = {
      windowClass: 'popup-650 popupMain_design',
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
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be csv or xls or xlsx");
          return;
        }
        formData.append('file', this.files[0]);
      }
    }

    //console.log("formdata", formData);
    this.btnDisabled = true;
    this.msmeService.bulkUploadFile(formData).subscribe(res => {
      ////console.log("res=========",res);
      if (res.status === 200) {
        this.btnDisabled = false;
        // res.data.forEach(element => {
        //console.log(res.data);
        this.batchId = res.data.id
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        // this.failEntry = element.invalidEntryCount + element.failedEntryCount
        this.failEntry = res.data.fail
        // });
        this.commonService.successSnackBar("File uploaded successfully");
        this.FileUploadStatus_popup();
        //this.commonMethod.pageRefresh();
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
    const dialogRef = this.dialog.open(BulkUploadSuccessFullyComponent, {
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

  downloadTemplate() {
    //console.log("download Template functional called ..");
    const data: any = {};
    data.applicationId = 1;
    this.msmeService.downloadTemplate(data).subscribe(res => {
      const blob = new Blob([res], { type: res.type });
      //console.log(res.type);
      const a: any = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display:none";
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      var date = moment().format('YYYY-MM-DD:HH:mm:ss');
      var filename = "E-GST Express - Upload sheet - Sample file" + ".xlsx";
      a.download = filename
      a.click();
      a.remove();
    }, error => {
      this.commonService.errorSnackBar("Error in Downloading Smart Excel Template");
    });
  }

  getData(type, batchId) {
    if (type == 1) {
      this.msmeService.getValidData(batchId).subscribe((res: any) => {
        // //console.log("res=========",res.data);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    } else if (type == 2) {
      this.msmeService.getInValidData(batchId).subscribe(res => {
        ////console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading InValid data");
      });
    } else if (type == 3) {
      this.msmeService.getTotalData(batchId).subscribe(res => {
        ////console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading Total Data");
      });
    }
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
          'Pan Number': element.pan ? element.pan : '-',
          'Created Date ': element.createdDate ? element.createdDate : '-',
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
          'Pan Number': element.pan ? element.pan : '-',
          'Created Date ': element.createdDate ? element.createdDate : '-',
          'Failure Reason ': element.failureReason ? element.failureReason : '-',
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
          'Pan Number': element.pan ? element.pan : '-',
          'Created Date ': element.createdDate ? element.createdDate : '-',
          'Failure Reason ': element.failureReason ? element.failureReason : '-',
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

  isActionAvailforSubpage(subPageId: any, actionId: string): boolean {
    const matchedSubPage = this.pageData?.subpages?.find(sub => sub.subpageId === subPageId);
    const matchedSubPageAction = matchedSubPage?.actions?.find(action => action.actionId === actionId);
    if (matchedSubPageAction) {
      return true;
    }
    return false;
  }

  back() {
    this.router.navigate(['/hsbc/rmDashboard'], {state: { data: this.pageData }});
  }
}
