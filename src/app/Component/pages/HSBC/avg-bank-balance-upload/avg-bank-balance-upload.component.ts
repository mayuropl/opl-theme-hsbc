import { data } from 'jquery';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { map } from 'rxjs/operators';
import alasql from 'alasql';
import { CommercialCibilUploadSuccessComponent } from 'src/app/Popup/HSBC/commercial-cibil-upload-success/commercial-cibil-upload-success.component';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import {Constants} from "../../../../CommoUtils/constants";
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-avg-bank-balance-upload',
  templateUrl: './avg-bank-balance-upload.component.html',
  styleUrl: './avg-bank-balance-upload.component.scss'
})

export class AvgBankBalanceUploadComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;
  fileName: any;

  //formgroup
  commCibilUploadDetailsForm: UntypedFormGroup;

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
  constants:any = [];

  options = [
    { value: '2', label: 'Current Account' },
    { value: '1', label: 'Term Deposit' },
    { value: '3', label: 'One Time' }
  ];

  selectedFileType:string
  disableOtherOptions: boolean = false;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private  msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private downloadExcelService : ExcelDownloadService,
    private datePipe: DatePipe, private router: Router, private sharedService:SharedService) {
      this.initializeDatepickerConfig();

      this.sharedService.getAbbReportStatusClickEvent().subscribe((message)=>{
        console.log("Message recieved");
        console.log(message);
        this.fetchDataFromWebSocket(message);
    })
    }

  ngOnInit(): void {
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(Constants.pageMaster.BULK_UPLOAD,Constants.pageMaster.ABB_OF_CURRENT_ACCOUNT_AND_TD)
    }
    this.constants = Constants;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/Commercial-Cibil-Bulk-Upload';
    GlobalHeaders['x-main-page'] = this.pageData?.pageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);
  }

  fetchDataFromWebSocket(responseFromWebSocket){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchHistory(responseFromWebSocket?.response?.response)
  }

  fetchHistory(res){
    if (res.data != null) {
      this.counts = res?.data;
      this.totalSize = res?.data;
    }
    this.bulkUploadHistory = res?.listData;
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

  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    const data: any = {};
    console.log(this.pageSize);
    data.size = this.pageSize;
    data.pageIndex = this.page - 1;

    this.msmeService.getAbbUploadHistory(data).subscribe((res: any) => {
      if (res && res.status == 200) {
        this.fetchHistory(res);
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
  files: any[] = [];
  createBulkUploadForm(bulkUploadDetails) {
    this.commCibilUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
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
        if(!this.commonService.isObjectNullOrEmpty(this.files)){
          const progressInterval = setInterval(() => {
            if (this.files[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1);
            } else {
              this.files[index].progress += 5;
            }
          }, 200);
        }
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

  uploadata() {

    if (this.files.length == 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }
    if(this.commonService.isObjectNullOrEmpty(this.selectedFileType)){
      this.commonService.warningSnackBar('Please select the file type.');
      return;
    }
    for (let i = 0; i < this.files.length; i++) {
      if (this.commonService.isObjectIsEmpty(this.files)) {
        this.commonService.errorSnackBar('Please upload a file.');
        return false;
      } else {
        let extension = this.getFileExtension(this.files[i].name);
        if (extension != 'xls' && extension != 'xlsx' && extension != 'XLS' && extension != 'XLSX' ) {
          this.commonService.errorSnackBar("File format of the upload should be csv or xls or xlsx");
          return;
        }
      }
    }
    this.btnDisabled = true;

    const formData: any = new FormData();
    // formData.append('filetype', this.selectedFileType == '3' ? "" : this.selectedFileType)

    formData.append('filetype', this.selectedFileType)
    formData.append('file', this.files[0])
    formData.append('year', this.modelDate.toLocaleString('default', { year: 'numeric' }))
    formData.append('month', this.modelDate.toLocaleString('default', { month: '2-digit' }))

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    this.msmeService.uploadAbbAccountData(formData).subscribe(res => {
      // this.btnDisabled = false;
      // this.fetchBulkUploadHistory(null, false);
      if (res.status === 200) {
        this.commonService.successSnackBar("File uploaded successfully");
        this.fetchBulkUploadHistory(null, false);
        // this.files.splice(0, 1);
        // this.FileUploadStatus_popup();
        this.files.splice(0, 1);
        this.selectedFileType = "2"
        // this.commonMethod.pageRefresh();
      } else {
        this.btnDisabled = false;
        // this.commonService.warningSnackBar(res.message);
        // this.fetchBulkUploadHistory(null, false);
        // this.files.splice(0, 1);
        this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar("Error in Uploading file");
      //this.commonMethod.pageRefresh();
    });
    return true;
  }



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


  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }
    return false; // Return false if not found
  }

  getData(type, customer) {
    let createMasterJson: any = {}
    createMasterJson["fileId"] = customer.fileId;
    if (type == 1) {
      createMasterJson["type"] = type;
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.downloadAbbDataById(createMasterJson).subscribe(res => {
        if (res.status == 200) {
          this.downloadExcelService.downloadExcel(res.data, 'Successful_Entries_'+ customer.fileName);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading InValid data");
      });
    } else if (type == 2) {
      createMasterJson["type"] = type;
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.downloadAbbDataById(createMasterJson).subscribe(res => {
        if (res.status == 200) {
          this.downloadExcelService.downloadExcel(res.data, 'Failed_Entries_' + customer.fileName);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading InValid data");
      });
    } else if (type == 3) {
      createMasterJson["type"] = type;
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.downloadAbbDataById(createMasterJson).subscribe(res => {
        if (res.status == 200) {
          this.downloadExcelService.downloadExcel(res.data, 'Total_Entries_' + customer.fileName);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading InValid data");
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

  getLabelByValue(value: string): string {
    const foundOption = this.options.find(option => option.value === value);
    return foundOption ? foundOption.label : '';
  }


  onFileTypeChange(event: any) {
    this.selectedFileType = event.value;
    this.disableOtherOptions = (event.value === '3');
  }

  modelDate = new Date();

  onOpenCalendar(container) {
    container.monthSelectHandler = (event: any): void => {
      container._store.dispatch(container._actions.select(event.date > new Date() ? new Date() : event.date));
    }
    container.setViewMode('month');
  }

  getMonthName(month: number): string {
    const date = new Date(2000, month - 1, 1);
    return this.datePipe.transform(date, 'MMMM')!;
  }

  resetDate(){
    this.modelDate = new Date();
  }

  bsConfig: Partial<BsDatepickerConfig>;

  initializeDatepickerConfig(): void {
    const currentDate = new Date();
    const maxDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    this.bsConfig = {
      dateInputFormat: 'MM/YYYY',
      adaptivePosition: true,
      maxDate: maxDate,
      minMode: 'month'
    };
  }

  getStatus(stageId: any): string {
    if (stageId === 1) {
      return 'PENDING';
    } else if (stageId === 2) {
      return 'COMPLETED';
    } else if (stageId === 3) {
      return 'FAILED';
    }
  }

}

