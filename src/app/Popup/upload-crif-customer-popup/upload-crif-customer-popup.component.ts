import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MsmeService } from '../../services/msme.service';
import { CommonService } from '../../CommoUtils/common-services/common.service';
import { CibilUploadTypes, CrifDownloadUrls } from '../../CommoUtils/constants';

@Component({
  selector: 'app-upload-crif-customer-popup',
  templateUrl: './upload-crif-customer-popup.component.html',
  styleUrl: './upload-crif-customer-popup.component.scss'
})
export class UploadCrifCustomerPopupComponent implements OnInit {

  btnDisabled = false;
  crifUploadCustomerForm: UntypedFormGroup;

  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;

  PageSelectNumber: any[] = [
    { name: '2', value: 2 },
    { name: '4', value: 4 },
    { name: '8', value: 8 },
    { name: '10', value: 10 }
  ];

  bulkUploadHistory: any[] = [];
  files: any[] = [];

  CrifDownloadUrls = CrifDownloadUrls;

  constructor(
    public dialog: MatDialog,
    private msmeService: MsmeService,
    private commonService: CommonService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.crifUploadCustomerForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl('', [Validators.required])
    });
    this.fetchBulkUploadHistory();
  }

  pageSizeChange(size: any, page: any): void {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory();
  }

  onChangePage(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.fetchBulkUploadHistory();
  }

  fetchBulkUploadHistory(): void {
    const data: any = {};
    data.size = this.pageSize;
    data.pageIndex = this.page - 1;

    const filterJson = {
      filterJson: JSON.stringify(data),
      tab: 2
    };

    this.msmeService.getCrifCustomerUploadHistory(filterJson).subscribe(
      (res: any) => {
        if (res?.data) {
          let json = res.data;
          if (typeof json === 'string') {
            json = JSON.parse(json);
          }
          if (json && (json.statusCode === 200 || json.status === 200)) {
            this.totalSize = json.data || 0;
          }
          this.bulkUploadHistory = json.listData || [];
        } else {
          this.commonService.warningSnackBar(res?.message);
        }
      },
      (err) => {
        this.commonService.errorSnackBar('Error fetching history');
      }
    );
  }

  fileBrowseHandler(files: any): void {
    this.prepareFilesList(files);
  }

  deleteFile(index: number): void {
    this.files.splice(index, 1);
  }

  uploadFilesSimulator(index: number): void {
    setTimeout(() => {
      if (index === this.files.length) return;
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
    }, 1000);
  }

  prepareFilesList(files: Array<any>): void {
    if (files && files.length > 0) {
      for (const item of files) {
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0);
    }
  }

  openFileDialog(fileInput: HTMLInputElement): void {
    setTimeout(() => {
      fileInput.click();
    }, 0);
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  submit(): boolean {
    if (this.files.length === 0) {
      this.commonService.errorSnackBar('Please upload the file');
      return false;
    }

    const extension = this.getFileExtension(this.files[0].name);
    if (extension !== 'xls' && extension !== 'xlsx' && extension !== 'csv') {
      this.commonService.errorSnackBar('File format should be csv or xls or xlsx');
      return false;
    }

    this.btnDisabled = true;
    const req: any = {};
    req.fileName = this.files[0].name;
    req.uploadType = CibilUploadTypes.UPLOAD_SELECTED_CUSTOMER;

    console.log('CRIF customer upload req:', req);

    this.msmeService.crifUploadCibilFileFromFileName(req).subscribe(
      (res: any) => {
        this.btnDisabled = false;
        if (res.status === 200) {
          this.commonService.successSnackBar('File uploaded successfully');
          this.fetchBulkUploadHistory();
          this.files = [];
        } else {
          this.commonService.warningSnackBar(res.message);
          this.files = [];
        }
      },
      () => {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
      }
    );
    return true;
  }

  getData(type: number, url: string, fileId: any, name?: string): void {
    const filename = (name || 'file') + '-' + new Date().toISOString();
    const createMasterJson: any = {};
    createMasterJson.url = url + fileId + '&type=' + type;

    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
    this.msmeService.getCrifDataByFileId(createMasterJson).subscribe(
      (res: any) => {
        if (res.status === 200) {
          this.downloadCSVFromBase64(res.data, filename);
        }
      },
      () => {
        this.commonService.errorSnackBar('Error in Downloading data');
      }
    );
  }

  downloadCSVFromBase64(base64Data: string, fileName: string): void {
    const byteCharacters = atob(base64Data);
    const byteLength = byteCharacters.length;
    const byteArray = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([byteArray], { type: mimeType });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(a.href);
  }
}
