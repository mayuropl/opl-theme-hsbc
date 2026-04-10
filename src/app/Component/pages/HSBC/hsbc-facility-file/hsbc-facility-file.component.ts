import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { map } from 'rxjs/operators';
import alasql from 'alasql';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import {CibilDownloadUrls, CibilUploadTypes, Constants} from '../../../../CommoUtils/constants';
import {SharedService} from "../../../../services/SharedService";

@Component({
  selector: 'app-hsbc-facility-file',
  templateUrl: './hsbc-facility-file.component.html',
  styleUrl: './hsbc-facility-file.component.scss'
})
export class HsbcFacilityFileComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;
  fileName: any;

  //formgroup
  facilityUploadDetailsForm: UntypedFormGroup;

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
  isFullPr:any ;
  fileDropdown:any;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
              private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient,private sharedService:SharedService) {

    this.sharedService.getCibilUploadStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved");
      console.log(message);
      this.fetchDataFromWebSocket(message);
    })
  }

  fetchDataFromWebSocket(responseFromWebSocket){
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    this.fetchHistory(responseFromWebSocket?.response?.response);
  }

  fetchHistory(res){
    if(res?.data){
      this.fetchBulkUploadHistory(null, false);
    }
  }

  protected readonly consValue = Constants;
  
  ngOnInit(): void {
    this.isFullPr = 2;
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.COMMERCIAL_CIBIL)
    }
    this.constants = Constants;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/hsbc-facility-file';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'HSBC Facility File Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);
    this.callGetMAsterId();
  }

  // pageSizeChange(size: any, page: any) {
  //   this.pageSize = 1;
  //   this.startIndex = (page - 1) * this.pageSize;
  //   this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  //   this.fetchBulkUploadHistory(page, true);
  // }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.page = 1; // Reset to first page when page size changes
    this.startIndex = 0;
    this.endIndex = this.pageSize;
    this.fetchBulkUploadHistory(1, true);
  }
  
  onChangePage(page: any): void {
    this.fetchBulkUploadHistory(page, true);
  }
  
  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    const data: any = {};
    console.log(this.pageSize);

   // Backend expects page_no and page_size
    data.page_no = this.page;
    data.page_size = this.pageSize;
    
    const filterJson = {
      filterJson : JSON.stringify(data),
      tab: 3
    };
    // curl --location 'https://gkeqa-hsbc.instantmseloans.in/start/bulkupload/inputfile_history/?page_no=1&page_size=5' 
    
    this.msmeService.getCommCibilUploadedFileData(filterJson).subscribe((res: any) => {
      console.log(res);
      if(res?.data){
        let json = JSON.parse(res?.data);
          if(json){
            if(json?.data){
              this.bulkUploadHistory = json?.data;
              this.bulkUploadHistory.forEach(file => {
                this.collapsedMap[file.id] = true;
              });
            }
            if(json?.data){
              this.totalSize = json?.data?.length;
              this.counts = json?.data;
            }
            if(onPageChangeFlag){
              this.startIndex = (page - 1) * this.pageSize;
              this.endIndex = (page - 1) * this.pageSize + this.pageSize;
            }
          }
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
    this.facilityUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      prdataBoolean: new UntypedFormControl(0, [Validators.required]),
      reqType: new UntypedFormControl('', []),
      prValue: new UntypedFormControl('', [Validators.required]),
      fileId: new UntypedFormControl('', [Validators.required]),
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
        item.progress = 0;
        this.files.push(item);
      }
      this.uploadFilesSimulator(0);
    }
  }

  callGetMAsterId(){
    this.msmeService.getInputFileMasterList().subscribe((res: any) => {
      if (res.status === 200) {
        console.log('Response === > ', res);
        let response = JSON.parse(res?.data);
        this.fileDropdown = response?.listData;
      } else {
        console.log('Error in getting file list');
      }
    }, error => {
      this.btnDisabled = false;
      console.log('Error in getting file list');
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
      this.files.push({ data: file, state: 'in', inProgress: false, password: 0, canRetry: false, canCancel: true });
    }
  }

  submit(uploadType?:any) {
    const formData: any = new FormData();
    let fArray =[];
    if (this.files.length == 0 && !uploadType) {
      this.commonService.errorSnackBar('Please upload the facility file');
      return false;
    }
    if(!uploadType){
    for (let i = 0; i < this.files.length; i++) {
      if (this.commonService.isObjectIsEmpty(this.files)) {
        this.commonService.errorSnackBar('Please upload a file.');
        return false;
      } else {
        let extension = this.getFileExtension(this.files[0].name);
        if (extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be xlsx");
          return;
        }
      }
    }
      for ( const obj of this.files ){
        fArray.push(obj.name);
      }
    }
    
    this.btnDisabled = true;
    const req: any = {};
    let isfull = this.facilityUploadDetailsForm?.value.prdataBoolean;
    req.isFull = isfull;
    req.fileId = this.facilityUploadDetailsForm?.value?.fileId?.fileId;
    // this.facilityUploadDetailsForm?.value.fileId.fileId;
    req.fileName = JSON.stringify(fArray);
    req.uploadType = CibilUploadTypes.UPLOAD_INPUTFILE;
    console.log(req);

    this.msmeService.commercialCibilBulkExcelUpload(req).subscribe(res => {
      this.btnDisabled = false;
      if (res.status === 200) {
        this.facilityUploadDetailsForm?.get('prValue')?.setValue('');
        this.facilityUploadDetailsForm?.get('fileId')?.setValue('');
        this.fileDropdown = [];

        this.batchId = res.data.fileId
        this.totalEntry = res.data.totalEntries;
        this.successfullEntry = res.data.successEntries;
        this.failEntry = res.data.failEntries;
        
        if(!uploadType) {
          this.commonService.successSnackBar("File uploaded successfully");
          this.fetchBulkUploadHistory(null, false);
        }else{
          this.commonService.successSnackBar('File is being prepared. You can download it from the Upload Status if required.');
        }
        this.files = [];
      } else {
        this.btnDisabled = false;
        if(!uploadType) {
          this.commonService.warningSnackBar(res.message);
        }
        this.files = [];
      }
    }, error => {
      this.btnDisabled = false;
      if(!uploadType) {
        this.commonService.errorSnackBar("Error in Uploading file");
      }
    });
    return true;
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
    const fileUrl = 'assets/files/PR reconcilation File format.xlsx';
    this.downloadFile(fileUrl).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'HSBC_Facility_Template.xlsx';
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
  
  getData(type, url, fileId: any ,name?:any ,format?:any) {
    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    const filename = name + '-' +formattedDate;
    
    let createMasterJson: any = {};
    createMasterJson.url = url + fileId + '&req_type=' + type;
    this.msmeService.getCommCibilUploadedDataByFileId(createMasterJson).subscribe((res: any) => {
      console.log('res=========', res.data);
      this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
      if (res.status === 200) {
        this.downloadCSVFromBase64(res.data, filename , format);
      }else{
        this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Error in Downloading validData');
    });
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
          'Facility ID': element.facilityId ? element.facilityId : '-',
          'Facility Name': element.facilityName ? element.facilityName : '-',
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
          'Facility ID': element.facilityId ? element.facilityId : '-',
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
          'Facility ID': element.facilityId ? element.facilityId : '-',
          'Facility Name': element.facilityName ? element.facilityName : '-',
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
  
  collapsedMap: { [key: number]: boolean } = {};
  
  toggleCollapse(fileId: number) {
    this.collapsedMap[fileId] = !this.collapsedMap[fileId];
  }

  generateFileName(fileId: string): any {
    return fileId+'_Facility_InputFile';
  }

  downloadCSVFromBase64(base64Data: string, fileName: string ,format?:any ) {
    const byteCharacters = atob(base64Data);
    const byteLength = byteCharacters.length;
    const byteArray = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }
    let blob ;
    let mimeType = '';
    if(format){
      if (format?.toLowerCase() === 'xlsx') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      blob = new Blob([byteArray], { type: mimeType });
    }else{
      blob = new Blob([byteArray], { type: 'text/csv' });
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  protected readonly CibilDownloadUrls = CibilDownloadUrls;
}
