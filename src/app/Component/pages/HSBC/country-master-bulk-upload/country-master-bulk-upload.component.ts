import { CountryBulkUploadSuccessComponent } from './../../../../Popup/HSBC/country-bulk-upload-success/country-bulk-upload-success.component';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import alasql from 'alasql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { ReadInstructionBulkUploadComponent } from 'src/app/Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-country-master-bulk-upload',
  templateUrl: './country-master-bulk-upload.component.html',
  styleUrl: './country-master-bulk-upload.component.scss'
})

export class CountryMasterBulkUploadComponent {
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

  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;
  userName: string;
  custCountryBulkUploadHistory: any;
  isDownloading = false;
  uploadFailed = false;
  failureReason = '';

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private location: Location) { }

  protected readonly consValue = Constants;

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    if (!this.pageData || this.pageData === 'undefined') {
      this.pageData = this.getCountryMasterPageData();
    }
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Country Master Upload', path: '/', active: true }];
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
  }

  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean): void {
    const data: any = {};
    data.size = this.pageSize;
    data.pageIndex = (page || this.page) - 1;

    this.msmeService.getHistoryCountryBulkUpload(data).subscribe((res) => {
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data.length !== 0 ? res.data[0].totalData : 0;
        }
        this.custCountryBulkUploadHistory = res.data;
      } else {
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
    this.bulkUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
    });
  }

  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

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
        }, 50);
      }
    }, 100);
  }

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

  submit() {
    const formData: any = new FormData();
    if (this.files.length == 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }

    let extension = this.getFileExtension(this.files[0].name);
    if (extension != 'xls' && extension != 'xlsx') {
      this.commonService.errorSnackBar("File format of the upload should be xls or xlsx");
      return;
    }
    formData.append('file', this.files[0]);

    this.btnDisabled = true;
    this.msmeService.uploadCountryMaster(formData, this.userName).subscribe(res => {
      if (res.status === 200) {
        this.btnDisabled = false;
        this.batchId = res.data.mstId || res.data.id;
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        this.failEntry = res.data.fail;

        if (res.data.status === 'Failed') {
          this.uploadFailed = true;
          this.failureReason = res.data.fileUploadFailureReason || 'File upload failed';
          this.commonService.errorSnackBar('Invalid File Format');
        } else {
          this.uploadFailed = false;
          this.failureReason = '';
          this.commonService.successSnackBar("File uploaded successfully");
        }
        this.FileUploadStatus_popup();
        this.files = [];
        this.bulkUploadDetailsForm.reset();
        this.fetchBulkUploadHistory();
        this.getUserDetails();
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
    const dialogRef = this.dialog.open(CountryBulkUploadSuccessComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getFileExtension(filename) {
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
    const fileUrl = 'assets/files/Country Master_Download Template.xlsx';
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Country Master_Download Template.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  downloadSampleFile() {
    const fileUrl = 'assets/files/Country Master_Sample File.xlsx';
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'Country Master_Sample File.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  getData(type, batchId) {
    let createMasterJson: any = {}
    createMasterJson["mstId"] = batchId;
    if (type == 1) {
      createMasterJson["isFailed"] = false;
      createMasterJson["isSuccess"] = true;
    } else if (type == 2) {
      createMasterJson["isFailed"] = true;
      createMasterJson["isSuccess"] = false;
    } else if (type == 3) {
      createMasterJson["isFailed"] = false;
      createMasterJson["isSuccess"] = false;
    }

    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.getCountryDataById(createMasterJson).subscribe((res: any) => {
      if (res.status == 200) {
        this.downloadDataInExcel(res.data, 2, type);
      }
    }, error => {
      this.commonService.errorSnackBar("Error in Downloading data");
    });
  }

  downloadDataInExcel(excelData: any, type, reqType) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
    } else if (reqType == 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
    }

    if (!excelData || excelData.length == 0) {
      if (reqType == 1) {
        downloadData = [{
          'Country Full Name': '',
          'HSBC Internal': '',
          '2 alpha code': '',
          '3 alpha code': '',
          'EXIM PANJIVA (2 digit)': '',
          'EXIM VOLZA (3 digit)': '',
          'MCA Subsidaries': '',
          'ODI DATA': '',
        }];
      } else {
        downloadData = [{
          'Country Full Name': '',
          'HSBC Internal': '',
          '2 alpha code': '',
          '3 alpha code': '',
          'EXIM PANJIVA (2 digit)': '',
          'EXIM VOLZA (3 digit)': '',
          'MCA Subsidaries': '',
          'ODI DATA': '',
          'Is Failed': '',
          'Failure Reason': '',
        }];
      }
    } else {
      excelData.forEach((element, i) => {
        let row: any = {
          'Country Full Name': element.countryName ? element.countryName : '',
          'HSBC Internal': element.hsbcInternal ? element.hsbcInternal : '',
          '2 alpha code': element.alpha2Code ? element.alpha2Code : '',
          '3 alpha code': element.alpha3Code ? element.alpha3Code : '',
          'EXIM PANJIVA (2 digit)': element.eximPanjiva ? element.eximPanjiva : '',
          'EXIM VOLZA (3 digit)': element.eximVolza ? element.eximVolza : '',
          'MCA Subsidaries': element.mcaSubsidiaries ? element.mcaSubsidiaries : '',
          'ODI DATA': element.odiData ? element.odiData : '',
        };

        if (reqType != 1) {
          row['Is Failed'] = element.isFailed ? 'Yes' : 'No';
          row['Failure Reason'] = element.failureReason ? element.failureReason : '';
        }

        downloadData.push(row);
      });
    }

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  downloadAllCountry() {
    this.isDownloading = true
    this.msmeService.downLoadAllCountry().subscribe(res => {
      this.downloadExcel(res.file, "ALL_Country.xlsx");
      this.isDownloading = false
      if (res.status == 204) {
        this.commonService.warningSnackBar('Data Not Found');
        this.isDownloading = false
      }
    }, error => {
      this.commonService.warningSnackBar('Data Not Found');
      this.isDownloading = false
    });
  }

  downloadExcel(byteData: string, fileName: string) {
    const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
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

  isActionAvail(actionId: any): boolean {
    if (!this.pageData || !this.pageData.actions) return false;
    return this.pageData.actions.some((action: any) => action.actionId === actionId);
  }

  getCountryMasterPageData(): any {
    const storedData = this.commonService.getStorage(Constants.httpAndCookies.US_PR, true);
    if (storedData) {
      try {
        const routeData = JSON.parse(storedData);
        const bulkUploadPage = routeData.find((el: any) => el?.pageId === this.consValue.pageMaster.BULK_UPLOAD);
        if (bulkUploadPage && bulkUploadPage.subpages) {
          return bulkUploadPage.subpages.find((el: any) => el?.subpageName === 'Country Master');
        }
      } catch (error) {
        console.error('Error parsing permission data:', error);
      }
    }
    return null;
  }

  back() {
    this.location.back();
  }
}
