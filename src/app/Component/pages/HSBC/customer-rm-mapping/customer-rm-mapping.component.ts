
import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MsmeService} from '../../../../services/msme.service';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {CommonMethods} from '../../../../CommoUtils/common-methods';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Constants} from '../../../../CommoUtils/constants';
import {
  ReadInstructionBulkUploadComponent
} from '../../../../Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import {
  SendLinkBorrowerPopupComponent
} from '../../../../Popup/HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import alasql from 'alasql';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import { CustomerBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import { SharedService } from 'src/app/services/SharedService';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';
@Component({
  selector: 'app-customer-rm-mapping',
  templateUrl: './customer-rm-mapping.component.html',
  styleUrl: './customer-rm-mapping.component.scss'
})
export class CustomerRmMappingComponent {
        // tslint:disable-next-line:max-line-length
        constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
          private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private sharedService: SharedService) {
            this.sharedService.getCustomerRmMappingStatusClickEvent().subscribe((message) => {
              console.log("message Recived");
              this.fetchDataFromWebSocket(message);
               })
          }

          fetchDataFromWebSocket(responseFromWebSocket?){
            responseFromWebSocket = JSON.parse(responseFromWebSocket);
              this.bulkUploadHistory = responseFromWebSocket?.response.listData;
          }



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
        PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }, ];
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
      protected readonly consValue = Constants;
        ngOnInit(): void {
        this.constants = Constants;
        this.pageData = history.state.data;
        if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.HRMS_DATA)
    }
        resetGlobalHeaders();
        GlobalHeaders['x-path-url'] = '/hsbc/Hrms-Bulk-Upload';
        GlobalHeaders['x-main-page'] = this.pageData.pageName;
        this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
        this.createBulkUploadForm(null);
        this.fetchBulkUploadHistory(null, false);
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
        // if (!onPageChangeFlag) {
        //   //console.log("onPageChangeFlag is : " + onPageChangeFlag);
        //  this.resetStartIndex();
        // } else {
        //   data.pageIndex = page - 1
        // }
        console.log(this.pageSize);

        data.size = this.pageSize;

        data.pageIndex = this.page - 1;
        data.tableType = 'HRMS';
        // this.data.tab = tabId;

        this.msmeService.getCustRmFileData(data).subscribe((res: any) => {
        console.log("response ", res)
        if (res && res.status == 200) {
        if (res.data != null) {
        this.counts = res.data;
        this.totalSize = res.data;
        }

        this.bulkUploadHistory = res.listData;

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
          if(this.files.length == 0 ){
            return;
          }
        if (this.files[index]?.progress === 100) {
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
        isPopupOpen= true;
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
        const fileExt = extension.toLowerCase();
        if (!['csv', 'xls', 'xlsx'].includes(fileExt)) {
        this.commonService.errorSnackBar('Invalid file format. Please upload a CSV, XLS, or XLSX file.');
        return;
       }
        formData.append('file', this.files[0]);
        }
        }

        // console.log("formdata", formData);
        this.btnDisabled = true;
        this.msmeService.customerRmMappingUpload(formData,this.userName).subscribe(res => {
        //// console.log("res=========",res);
        if (res.status === 200) {
          this.files.splice(0,1);
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
       this.fetchBulkUploadHistory(null,false);
       // this.FileUploadStatus_popup();
        // this.commonMethod.pageRefresh();
        } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        // this.commonMethod.pageRefresh();
        }
        }, error => {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        // this.commonMethod.pageRefresh();
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
        // getData(type, batchId) {
        // if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
        // if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
        // if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }
        // // if ( type === 4 ){ GlobalHeaders['x-page-action'] = 'Donwload Inactive User file'; }
        // console.log(type);
        // const createMasterJson: any = {};
        // createMasterJson.mstId = batchId;
        // createMasterJson.tableType = 'OW8';
        // this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
        // if (type == 1) {
        // createMasterJson.isFailed = false;
        // this.msmeService.getSuccessAndFiledEntery(createMasterJson).subscribe((res: any) => {
        // console.log('res=========', res.data);
        // if (res.status == 200) {
        // this.downloadDataInExcel(res.data, 2, type);
        // }
        // }, error => {
        // this.commonService.errorSnackBar('Error in Downloading validData');
        // });
        // } else if (type == 2) {
        // createMasterJson.isFailed = true;
        // this.msmeService.getSuccessAndFiledEntery(createMasterJson).subscribe(res => {
        // console.log("res for failed=========",res.data);
        // if (res.status == 200) {
        // this.downloadDataInExcel(res.data, 2, type);
        // }
        // }, error => {
        // this.commonService.errorSnackBar('Error in Downloading InValid data');
        // });
        // } else if (type == 3) {
        // this.msmeService.getSuccessAndFiledEntery(createMasterJson).subscribe(res => {
        // if (res.status == 200) {
        //   console.log("resfor total=========",res.data);

        // this.downloadDataInExcel(res.data, 2, type);
        // }
        // }, error => {
        // this.commonService.errorSnackBar('Error in Downloading Total Data');
        // });
        // }
        // }

        // downloadDataInExcel(excelData, type, reqType) {
        // let downloadData = [];
        // const a = type === 1 ? '.xls' : '.xlsx';
        // let fileName = '';
        // if (reqType === 1) {
        //   console.log("excelData for 1", excelData);

        // fileName = 'Successful_Entries_' + new Date().toDateString() + a;
        // excelData.forEach((element, i) => {
        // const index = i + 1;
        // let allApplications = null;
        // allApplications = [{
        // 'Customer ID': element.customerId ? element.customerId : '-',
        // 'Staff Relation Type': element.staffRelationType ? element.staffRelationType : '-',
        // 'Staff Relation Description': element.staffRelationDesc ? element.staffRelationDesc : '-',
        // 'Staff Id': element.staffId ? element.staffId : '-',
        // 'Staff Name': element.staffName ? element.staffName : '-',
        // 'Staff Email Id': element.staffEmailId ? element.staffEmailId : '-',
        // 'Mobile No': element.staffMobileNo ? element.staffMobileNo : '-',
        // 'Telephone No': element.telePhoneNo ? element.telePhoneNo : '-',
        // }];
        // downloadData = downloadData.concat(allApplications);
        // });
        // } else if (reqType === 2) {
        //   console.log("excelData for 2 ", excelData);

        // fileName = 'Failed_Entries_' + new Date().toDateString() + a;
        // excelData.forEach((element, i) => {
        // const index = i + 1;
        // let allApplications = null;
        // allApplications = [{
        //   'Customer ID': element.customerId ? element.customerId : '-',
        //   'Staff Relation Type': element.staffRelationType ? element.staffRelationType : '-',
        //   'Staff Relation Description': element.staffRelationDesc ? element.staffRelationDesc : '-',
        //   'Staff Id': element.staffId ? element.staffId : '-',
        //   'Staff Name': element.staffName ? element.staffName : '-',
        //   'Staff Email Id': element.staffEmailId ? element.staffEmailId : '-',
        //   'Mobile No': element.staffMobileNo ? element.staffMobileNo : '-',
        //   'Telephone No': element.telePhoneNo ? element.telePhoneNo : '-',
        //   'Failure Reason': element.failureReason ? element.failureReason : '-',
        //   'Is Failed': element.isFailed ? element.isFailed : '-',


        // }];
        // downloadData = downloadData.concat(allApplications);
        // });
        // } else if (reqType === 3) {
        //   console.log("excelData for 3 ", excelData);

        // fileName = 'Total_Entries_' + new Date().toDateString() + a;
        // excelData.forEach((element, i) => {
        // const index = i + 1;
        // let allApplications = null;
        // allApplications = [{
        //   'Customer ID': element.customerId ? element.customerId : '-',
        //   'Staff Relation Type': element.staffRelationType ? element.staffRelationType : '-',
        //   'Staff Relation Description': element.staffRelationDesc ? element.staffRelationDesc : '-',
        //   'Staff Id': element.staffId ? element.staffId : '-',
        //   'Staff Name': element.staffName ? element.staffName : '-',
        //   'Staff Email Id': element.staffEmailId ? element.staffEmailId : '-',
        //   'Mobile No': element.staffMobileNo ? element.staffMobileNo : '-',
        //   'Telephone No': element.telePhoneNo ? element.telePhoneNo : '-',
        //   'Failure Reason': element.failureReason ? element.failureReason : '-',
        //   'Is Failed': element.isFailed ? element.isFailed : '-',
        //   // 'Total Rows': element.totalRows ? element.totalRows : '-',
        // }];
        // downloadData = downloadData.concat(allApplications);
        // });
        //  }


        // alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
        // }

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

        // isDownloadingHrms = false;

        // downloadHrmsExcel(): void {
        // const timestamp = this.getFormattedTimestamp();
        // let fileName = 'HRMS_Data';
        // this.isDownloadingHrms = true
        // this.msmeService.downloadHrmsExcel().subscribe(res=>{
        // this.downloadExcel(res.file, fileName );
        // this.isDownloadingHrms = false
        // });
        // }

        // private getFormattedTimestamp(): string {
        // const now = new Date();
        // const year = now.getFullYear();
        // const month = String(now.getMonth() + 1).padStart(2, '0');
        // const day = String(now.getDate()).padStart(2, '0');
        // const hours = String(now.getHours()).padStart(2, '0');
        // const minutes = String(now.getMinutes()).padStart(2, '0');
        // const seconds = String(now.getSeconds()).padStart(2, '0');
        // return `${year}-${month}-${day}`;
        // }

        getData(type, batchId) {
          if (type === 1) { GlobalHeaders['x-page-action'] = 'Download Success file'; }
          if (type === 2) { GlobalHeaders['x-page-action'] = 'Download fail file'; }
          if (type === 3) { GlobalHeaders['x-page-action'] = 'Download All file'; }

          console.log(type);
          const createMasterJson: any = {};
          createMasterJson.mstId = batchId;
          createMasterJson.tableType = 'OW8';

          // Set the isFailed flag based on type
          if (type == 1) {
              createMasterJson.isFailed = false;
          } else if (type == 2) {
              createMasterJson.isFailed = true;
          }
          // For type 3 (all data), don't set isFailed flag

          console.log("createMasterJson: ", createMasterJson);

          this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");

          // Call the backend service that directly returns the Excel file
          this.msmeService.downloadExcelFileForOW8(createMasterJson).subscribe(
              (response: any) => {
                  console.log("Response: ", response)

                  // this.downloadDataInExcel(response, this.getFileName(type));
                      this.commonService.passRefershIDCallToBucket(response.bucketReferenceId,this.getFileName(type));
                  this.commonService.successSnackBar("File downloaded successfully!");
              },
              (error:any) => {
                  console.error('Error downloading file:', error);
                  this.commonService.errorSnackBar('Error in downloading file');
              }
          );
        }

        // Helper method to generate filename
        private getFileName(type: number): string {
          const dateStr = new Date().toDateString();
          switch (type) {
              case 1:
                  return `Successful_Entries_${dateStr}.xlsx`;
              case 2:
                  return `Failed_Entries_${dateStr}.xlsx`;
              case 3:
                  return `Total_Entries_${dateStr}.xlsx`;
              default:
                  return `Data_Export_${dateStr}.xlsx`;
          }
        }

        // Helper method to trigger file download
        private downloadDataInExcel(blob: Blob, filename: string) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }

        getAllRmCustomerData(){
          this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");

           this.msmeService.getAllRmCustomerData().subscribe(
              (response: any) => {
                  const currentDate = new Date().toISOString().split('T')[0];
                  const filename =  "Download_All_RM_Customer_"+currentDate;
                  // this.downloadExcel(response.contentInBytes,filename);
                  this.passRefershIDCallToBucket(response.bucketReferenceId, filename);
                  this.commonService.successSnackBar("File downloaded successfully!");
              },
              (error:any) => {
                  console.error('Error downloading file:', error);
                  this.commonService.errorSnackBar('Error in downloading file');
              }
          );
        }

        passRefershIDCallToBucket(docReferenceId,reportName) {
            this.downloadFileFromBucket(docReferenceId, 'txt').subscribe(blob => {
              const a = document.createElement('a');
              const objectUrl = URL.createObjectURL(blob);
              a.href = objectUrl;
              a.download = reportName+'.xlsx';
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
}
