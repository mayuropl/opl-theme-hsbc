import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsmeService } from '../../../../../services/msme.service';
import { CommonService } from '../../../../../CommoUtils/common-services/common.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonMethods } from '../../../../../CommoUtils/common-methods';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../../../../../services/SharedService';
import { GlobalHeaders, resetGlobalHeaders } from '../../../../../CommoUtils/global-headers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Constants } from '../../../../../CommoUtils/constants';

@Component({
  selector: 'app-crilic-data-upload', 
  templateUrl: './crilic-data-upload.component.html',
  styleUrl: './crilic-data-upload.component.scss'
})
export class CrilicDataUploadComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;
  fileName: any;

  uploadDetailsForm: UntypedFormGroup;

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

  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }];
  id;
  batchId;

  bulkUploadHistory: any;
  dragDropFlag: any = false;
  counts: any = [];
  userId :any;
  pageData: any;
  constants: any = [];

  files: any[] = [];
  protected readonly consValue = Constants;

  modelDate = new Date();
  maxDate: Date;
  isDetailsVisible = false;
  fileType: string = '1';

  constructor(
    public dialog: MatDialog,
    private msmeService: MsmeService,
    protected commonService: CommonService,
    private formBuilder: UntypedFormBuilder,
    private commonMethod: CommonMethods,
    private http: HttpClient,
    private sharedService: SharedService
  ) {
    this.sharedService.getCRILCStatusSubjectChangeEvent().subscribe((message) => {
      console.log('Message received for CRILC');
      console.log(message);
      this.fetchDataFromWebSocket(message);
    });
  }

  fetchDataFromWebSocket(responseFromWebSocket) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchBulkUploadHistory(null, false);
  }

  fetchHistory(res) {
    if (res.data != null) {
      this.counts = res?.data;
      this.totalSize = res?.data;
    }
    console.log('Websocket response for CRILC upload ===> ', res?.listData);
    this.bulkUploadHistory = res?.listData;
  }

  ngOnInit(): void {
    this.maxDate = new Date();
    this.pageData = history.state.data;
    this.constants = Constants;
    userId: this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true)
    if (!this.pageData || this.pageData === 'undefined') {
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD, this.consValue.pageMaster.CRILC_DATA_UPLOAD);
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/CRILC-Data-Upload';
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);
  }

onOpenCalendar(event: any) {
  const today = new Date();

  setTimeout(() => {
    const months = document.querySelectorAll('.bs-datepicker-months span');

    months.forEach((month: any, index: number) => {
      const currentYear = event.view?.date?.getFullYear() || today.getFullYear();

      if (
        currentYear > today.getFullYear() ||
        (currentYear === today.getFullYear() && index > today.getMonth())
      ) {
        month.classList.add('disabled');
        month.style.pointerEvents = 'none';
      }
    });
  });
}

  getAlertsSubTabData(_index: number): void {
    if (this.modelDate > this.maxDate) {
    this.modelDate = this.maxDate;
    return;
  }
    // Optional: load data for selected month when needed
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.page = 1;
    this.startIndex = 0;
    this.endIndex = this.pageSize;
    this.fetchBulkUploadHistory(this.page, true);
  }

  onChangePage(page: any): void {
    this.page = page;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory(page, true);
  }

  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: string): void {
    const data: any = {};
    console.log(this.pageSize);
    data.size = this.pageSize;
    data.pageIndex = this.page - 1;
    data.fileType = this.fileType;

    this.msmeService.crilcDashboardUploadHistory(data).subscribe((res: any) => {
      console.log('res: ', res);
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res?.data?.total_records;
          this.totalSize = res?.data?.total_records;
          this.pages = res?.data?.total_pages;
        }
        // Directly assign the data array - backend already has all fields mapped
        this.bulkUploadHistory = res?.data?.data || [];
        console.log('this.bulkUploadHistory: ', this.bulkUploadHistory);
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });

  }

  mapStatusToStageId(status: string): number {
    // Map status strings to stage IDs for display
    // 1 = Pending, 2 = Success/Completed, 3 = Failed
    if (!status) return 1;
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending' || statusLower === 'processing') {
      return 1;
    } else if (statusLower === 'success' || statusLower === 'completed') {
      return 2;
    } else if (statusLower === 'failed' || statusLower === 'error') {
      return 3;
    }
    return 1; // Default to pending
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  createBulkUploadForm(bulkUploadDetails) {
    this.uploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
    });
  }

  onFileDropped($event) {
    // Validate month is selected before allowing file drop
    if (!this.modelDate) {
      this.commonService.errorSnackBar('Please select a month before uploading files');
      return;
    }
    this.prepareFilesList($event);
  }

  fileBrowseHandler(files) {
    // Validate month is selected before allowing file selection
    if (!this.modelDate) {
      this.commonService.errorSnackBar('Please select a month before uploading files');
      // Reset file input
      const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
      if (fileUpload) {
        fileUpload.value = '';
      }
      return;
    }
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
        // Only add files that have a name (filter out empty/undefined files)
        if (item && item.name) {
          item.progress = 0;
          this.files.push(item);
        }
      }
      // Only start upload simulator if we have valid files
      if (this.files.length > 0) {
        this.uploadFilesSimulator(0);
      }
    }
  }

  onClick(uploadFiles: FileList) {
    for (let i = 0; i < uploadFiles.length; i++) {
      let extension = this.getFileExtension(uploadFiles[0].name);
      if (uploadFiles[i].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        && uploadFiles[i].type != 'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
        && extension != 'enc') {
        this.commonService.errorSnackBar('File format of the upload should be xlsx');
        return;
      }
      if (uploadFiles[i].size > 100 * 1024 * 1024) {
        this.commonService.warningSnackBar('File size should not exceed 100 MB');
        return;
      }
      const file = uploadFiles[i];
      this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
    }
  }

  submit() {
    // Validate month is selected
    if (!this.modelDate) {
      this.commonService.errorSnackBar('Please select a month before uploading');
      return false;
    }

    const selectedDate = new Date(this.modelDate);
   

    if (!this.files || this.files.length === 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }

    // Format month to MMYYYY - Ensure proper zero-padding for single digit months
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const monthYear = month + year;

    console.log('Selected Date:', selectedDate);
    console.log('Formatted Month-Year:', monthYear);

    for (let file of this.files) {
      if (!file) {
        continue;
      }

      if (file.size > 100 * 1024 * 1024) {
        this.commonService.warningSnackBar('File size should not exceed 100 MB');
        return false;
      }

      let extension = this.getFileExtension(file.name);
      if (extension !== 'xls' && extension !== 'xlsx' && extension !== 'csv') {
        this.commonService.errorSnackBar('File format of the upload should be csv, xls or xlsx');
        return false;
      }
    }

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add each file to FormData (filter out any invalid files)
    for (let file of this.files) {
      if (file && file.name) {
        formData.append('file', file);
      }
    }
    
    // Add month_year to FormData
    formData.append('month_year', monthYear);
    formData.append('file_type', this.fileType);
    formData.append('user_id', this.userId);

    console.log('Submitting with month_year:', monthYear);

    this.btnDisabled = true;

    this.msmeService.crilcDashboardUploadWithFile(formData).subscribe({
      next: res => {
        this.btnDisabled = false;
        if (res.status === 200 || res.status === 201 || res.status === 202) {
          this.commonService.successSnackBar(res.message || 'File uploaded successfully');
          this.fetchBulkUploadHistory(null, false);
          this.files = [];
          
          // Reset file input
          const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
          if (fileUpload) {
            fileUpload.value = '';
          }
        } else {
          this.commonService.errorSnackBar(res.message || 'Error in uploading file');
          this.fetchBulkUploadHistory(null, false);
        }
      },
      error: err => {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in uploading file');
      }
    });

    return true;
  }

  onClickManual() {
    // Validate month is selected before allowing file selection
    if (!this.modelDate) {
      this.commonService.errorSnackBar('Please select a month before uploading files');
      return;
    }

    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let i = 0; i < fileUpload.files.length; i++) {
        let extension = this.getFileExtension(fileUpload.files[0].name);
        if (fileUpload.files[0]
          && fileUpload.files[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          && fileUpload.files[0].type != 'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
          && extension != 'enc') {
          this.commonService.errorSnackBar('File format of the upload should be xlsx');
          return;
        }
        const file = fileUpload.files[i];
        // Only add files that have a name (filter out empty/undefined files)
        if (file && file.name) {
          this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
        }
      }
    };
    fileUpload.click();
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
    const fileUrl = 'assets/files/CRILC_Data_Template.xlsx';
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'CRILC_Data_Template.xlsx';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  isActionAvail(actionId: string): boolean {
    for (let page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true;
      }
    }
    return false;
  }

  getStatus(stageId: any): string {
    switch (Number(stageId)) {
      case 1:
        return 'Pending';
      case 2:
        return 'completed';
      case 3:
        return 'Failed';
      default:
        return 'Unknown';
    }
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

  getData(typeFlag: string, detailId: any, fileName: any) {
    // Map type flags to numeric type values
    // isSuccess -> 1, isFailed -> 2, isTotal -> 3
    let typeValue: string;
    if (typeFlag === 'isSuccess') {
      typeValue = '1';
    } else if (typeFlag === 'isFailed') {
      typeValue = '2';
    } else if (typeFlag === 'isTotal') {
      typeValue = '3';
    } else {
      this.commonService.errorSnackBar('Invalid download type');
      return;
    }

    const requestPayload = {
      type: typeValue,
      detail_id: detailId.toString(),
      file_type: this.fileType.toString()
    };

    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');

    this.msmeService.crilcDashboardFileDownload(requestPayload).subscribe((res: any) => {
      console.log('res: ', res);
      if (res && res.status == 200) {
        this.downloadCSVFromBase64(res?.data[0]?.file_data, fileName);
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
  }

  onFileTypeChange(event: any) {
    this.fileType = event.value;
    this.resetStartIndex();
    this.fetchBulkUploadHistory(null, false);
  }
}
