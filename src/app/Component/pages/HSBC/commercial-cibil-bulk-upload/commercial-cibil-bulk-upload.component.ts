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
import { CommercialCibilUploadSuccessComponent } from 'src/app/Popup/HSBC/commercial-cibil-upload-success/commercial-cibil-upload-success.component';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import {CibilDownloadUrls, CibilUploadTypes, Constants} from '../../../../CommoUtils/constants';
import {SharedService} from "../../../../services/SharedService";
import {UploadCibilCustomerPopupComponent} from '../../../../Popup/upload-cibil-customer-popup/upload-cibil-customer-popup.component';
import {CibilmarkPopupComponent} from '../../../../Popup/HSBC/cibilmark-popup/cibilmark-popup.component';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-commercial-cibil-bulk-upload',
  templateUrl: './commercial-cibil-bulk-upload.component.html',
  styleUrl: './commercial-cibil-bulk-upload.component.scss'
})
export class CommercialCibilBulkUploadComponent implements OnInit {
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
  pageDataCommercialSummary : any;
  constants:any = [];
  isFullPr:any ;
  fileDropdown:any;
  restoredPrdataBoolean: number | undefined;

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, public commonService: CommonService,
              private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient,private sharedService:SharedService,private router: Router ) {

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
      // let json = JSON.parse(res?.data);
      // if(json){
      //   if(json?.listData){
      //     this.bulkUploadHistory = json?.listData;
      //     // this.bulkUploadHistory.forEach(file => {
      //     //   this.collapsedMap[file.fileId] = true; // all collapsed initially
      //     // });
      //   }
      //   if(json?.data){
      //     this.totalSize = json?.data;
      //     this.counts = json?.data;
      //   }
      // }
    }

  }
protected readonly consValue = Constants;
  ngOnInit(): void {
    this.isFullPr = 2;
    this.pageData = history.state.data;
    this.restoredPrdataBoolean = history.state?.prdataBoolean;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.COMMERCIAL_CIBIL)
    }
    this.pageDataCommercialSummary  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.COMMERCIAL_CIBIL,this.consValue.pageMaster.COMMERCIAL_SUMMARY)
    this.constants = Constants;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/Commercial-Cibil-Bulk-Upload';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.fetchBulkUploadHistory(null, false);

    // Populate file dropdown when restoring HSBC Facility Bulk Upload tab
    if (this.restoredPrdataBoolean === 2) {
      this.callGetMAsterId();
    }
  }

  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.page = 1; // Reset to first page when page size changes
    this.startIndex = 0;
    this.endIndex = this.pageSize;
    this.fetchBulkUploadHistory(1, true);
  }
  onChangePage(page: any): void {
    // update current page of items
    this.page = page;
    this.fetchBulkUploadHistory(page, true);
  }
  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    const data: any = {};
    console.log(this.pageSize);

    if(this.commCibilUploadDetailsForm?.value?.prdataBoolean === 2){
      data.size = this.pageSize;
      data.pageIndex = this.page;
    }else {
      data.size = this.pageSize;
      data.pageIndex = this.page - 1;
    }
    
    const filterJson = {
      filterJson : JSON.stringify(data),
      tab: this.commCibilUploadDetailsForm?.value?.prdataBoolean === 2 ?   3 : 1,
      size: this.pageSize,
      pageIndex: this.commCibilUploadDetailsForm?.value?.prdataBoolean === 2 ? this.page : this.page - 1
    };
    
    this.msmeService.getCommCibilUploadedFileData(filterJson).subscribe((res: any) => {
      console.log(res);
      if(res?.data){
        let json = JSON.parse(res?.data);
        if(json){
          // Clear existing data before assigning new data
          this.bulkUploadHistory = [];
          this.collapsedMap = {};
          
          // Handle different response formats based on prdataBoolean
          if(this.commCibilUploadDetailsForm?.value?.prdataBoolean === 2){
            // For HSBC Facility Bulk Upload (prdataBoolean === 2)
            // Data comes in json.data array format
            if(json?.data && Array.isArray(json.data)){
              this.bulkUploadHistory = json.data.map(item => ({
                fileId: item.id,
                fileName: item.file_name,
                createdDate: item.created_date,
                inputDownloadDate: item.input_file_uploaddate,
                successEntries: item.success_with_input,
                errorCount: item.fail_with_input,
                totalCustomer: item.total_count,
                statusCode: item.stage_id,
                completed: item.is_completed,
                isReconciliationDone: item.is_re_consiliation_done,
                isReconciliationStatus: item.reconsiliation_status,
                fileWiseData: item.filewise_data?.map(subItem => ({
                  file_id: subItem.id,
                  file_name: subItem.file_name,
                  created_date: subItem.created_date,
                  stage_id: subItem.stage_id,
                  success_entries: subItem.success_entries,
                  fail_entries: subItem.fail_entries,
                  total_entries: subItem.total_entries,
                  file_upload_failure_reason: subItem.file_upload_failure_reason
                })) || []
              }));
              
              this.bulkUploadHistory.forEach(file => {
                this.collapsedMap[file.fileId] = true; // all collapsed initially
              });
            }
            
            if(json?.total_records){
              this.totalSize = json.total_records;
              this.counts = json.total_records;
            }
          } else {
            // For Part PR Data / Full PR Data (prdataBoolean === 0 or 1)
            // Data comes in json.listData format
            if(json?.listData){
              this.bulkUploadHistory = json.listData;
              this.bulkUploadHistory.forEach(file => {
                this.collapsedMap[file.fileId] = true; // all collapsed initially
              });
            }
            
            if(json?.data){
              this.totalSize = json.data;
              this.counts = json.data;
            }
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

  // file upload @Nikul
  files: any[] = [];

  //create a form
  createBulkUploadForm(bulkUploadDetails) {
    const initialPrdataBoolean = this.restoredPrdataBoolean != null ? this.restoredPrdataBoolean : 0;
    this.commCibilUploadDetailsForm = this.formBuilder.group({
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      prdataBoolean: new UntypedFormControl(initialPrdataBoolean, [Validators.required]),
      reqType: new UntypedFormControl('', []),
      prValue: new UntypedFormControl('', [Validators.required]),
      fileId: new UntypedFormControl('', [Validators.required]),
    });

    // If restored to HSBC Facility Bulk Upload, clear prValue validators
    if (initialPrdataBoolean === 2) {
      const prValueControl = this.commCibilUploadDetailsForm.get('prValue');
      prValueControl?.clearValidators();
      prValueControl?.updateValueAndValidity();
    }
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
  callGetMAsterId(){
      if(this.commCibilUploadDetailsForm?.value.prdataBoolean === 0 || this.commCibilUploadDetailsForm?.value.prdataBoolean === 1){
        this.msmeService.getFileMasterList().subscribe((res: any) => {
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
    } else if(this.commCibilUploadDetailsForm?.value.prdataBoolean === 2){
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
  }

  onPrdataBooleanChange(event: any): void {
    const selectedValue = event.value;
    
    // Clear fileDropdown when changing radio button
    this.fileDropdown = [];
    this.commCibilUploadDetailsForm.get('fileId')?.setValue('');
    
    // Handle prValue validation based on prdataBoolean
    const prValueControl = this.commCibilUploadDetailsForm.get('prValue');
    
    if (selectedValue === 2) {
      // For HSBC Facility Bulk Upload, prValue is not required
      prValueControl?.clearValidators();
      prValueControl?.setValue(''); // Clear the value
      this.callGetMAsterId();
    } else {
      // For Part PR Data (0) and Full PR Data (1), prValue is required
      prValueControl?.setValidators([Validators.required]);
      prValueControl?.setValue(''); // Clear the value
    }
    
    // Update validation status
    prValueControl?.updateValueAndValidity();
    
    // Reset pagination to first page
    this.page = 1;
    this.startIndex = 0;
    this.endIndex = this.pageSize;
    
    // Fetch new data based on selected radio button
    this.fetchBulkUploadHistory(null, false);
  }

  // Check if file has at least one successful upload
  hasSuccessfulUpload(file: any): boolean {
    if (!file.fileWiseData || file.fileWiseData.length === 0) {
      return false;
    }
    // Check if any uploaded file has stage_id === 2 (Successful/Completed)
    return file.fileWiseData.some((sub: any) => sub.stage_id === 2);
  }

  // Open reconciliation status
  openReconciliationStatus(fileId: any): void {
    console.log('Opening reconciliation status for fileId:', fileId);

    this.reconsilation(window.location.protocol + '//' + window.location.host +"/hsbc/loans/msme/commercial/cibil/get-comm-cibil-uploaded-file-data",CibilDownloadUrls.RECONSILATION_DOWNLOAD,fileId)
    // TODO: Implement reconciliation status logic
    // This could open a popup/modal or navigate to a reconciliation page
    this.commonService.successSnackBar('Reconciliation process initiated for File ID: ' + fileId);
  }

  callMarkCompleted(file:any){
    const filterJson = {
      fileId : file
    };
    this.msmeService.callMarkFileCompleted(filterJson).subscribe((res: any) => {
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

  UploadCustomer_popup(): void {
    const dialogRef = this.dialog.open(UploadCibilCustomerPopupComponent, {
      data: this,
      panelClass: ['popupMain_design'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

CibilMark_popup(fileId:any): void {
  const dialogRef = this.dialog.open(CibilmarkPopupComponent, {
    data: { fileId, type: 'COMMERCIAL' },
    panelClass: ['popupMain_design'],
    autoFocus: false,
});
  dialogRef.afterClosed().subscribe(result => {
     this.commCibilUploadDetailsForm?.get('prValue')?.setValue('');
     this.commCibilUploadDetailsForm?.get('fileId')?.setValue('');
     this.fileDropdown = [];

    if (result) {
      console.log("Returned data from popup:", result);

      // You can assign it to a variable, call another method, etc.
    }
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
      // //console.log(this.files);
    }
  }

  submit(uploadType?:any) {
    const formData: any = new FormData();
    let fArray =[];
    if (this.files.length == 0 && !uploadType) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }
    if(!uploadType){
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
      for ( const obj of this.files ){
        fArray.push(obj.name);
      }
    }
    //console.log("formdata", formData);
    this.btnDisabled = true;
    const req: any = {};
    let isfull = this.commCibilUploadDetailsForm?.value.prdataBoolean;
    req.isFull = isfull;
    req.fileId = this.commCibilUploadDetailsForm?.value.fileId.fileId;
    req.fileName = JSON.stringify(fArray);
    if(!uploadType){
    if (this.commCibilUploadDetailsForm?.value.prValue === "1"){
      req.uploadType = CibilUploadTypes.UPLOAD_PR; }
    else if (this.commCibilUploadDetailsForm?.value.prdataBoolean === 2){
      req.uploadType = CibilUploadTypes.UPLOAD_INPUTFILE;  
    } 
    else {
      req.uploadType = CibilUploadTypes.UPLOAD_PR_STATUS;
    }
    }else{
      req.uploadType = CibilUploadTypes.UPLOAD_ALL_CUSTOMER;
    }
    console.log(req);

    this.msmeService.commercialCibilBulkExcelUpload(req).subscribe(res => {
      ////console.log("res=========",res);
      this.btnDisabled = false;
      // this.fetchBulkUploadHistory(null, false);
      if (res.status === 200) {
        // res.data.forEach(element => {
        //console.log(res.data);
        this.commCibilUploadDetailsForm?.get('prValue')?.setValue('');
        this.commCibilUploadDetailsForm?.get('fileId')?.setValue('');

        this.fileDropdown = [];


        this.batchId = res.data.fileId
        this.totalEntry = res.data.totalEntries;
        this.successfullEntry = res.data.successEntries;
        // this.failEntry = element.invalidEntryCount + element.failedEntryCount
        this.failEntry = res.data.failEntries;
        // });
        if(!uploadType) {
          this.commonService.successSnackBar("File uploaded successfully");
          this.fetchBulkUploadHistory(null, false);
        }else{
          this.commonService.successSnackBar('File is being prepared. You can download it from the PR Upload Status if required.');
        }
        this.files = [];
        // this.FileUploadStatus_popup();
        // this.commonMethod.pageRefresh();
      } else {
        this.btnDisabled = false;
        if(!uploadType) {
          this.commonService.warningSnackBar(res.message);
        }
        // this.fetchBulkUploadHistory(null, false);
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      if(!uploadType) {
        this.commonService.errorSnackBar("Error in Uploading file");
      }
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
  getData(type, url, fileId: any ,name?:any ,format?:any) {
    const date = new Date(); // or any valid Date object

const dd = String(date.getDate()).padStart(2, '0');
const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
const yyyy = date.getFullYear();

const formattedDate = `${dd}-${mm}-${yyyy}`;
    const filename = name + '-' +formattedDate;
    let createMasterJson: any = {};
    createMasterJson.url = url + fileId + '&type=' + type;
    this.msmeService.getCommCibilUploadedDataByFileId(createMasterJson).subscribe((res: any) => {
      console.log('res=========', res.data);
      this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
      if (res.status === 200) {
        this.downloadCSVFromBase64(res.data, filename , format);
        // this.downloadDataInExcel(res.data, 2, type);
      }else{
        this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Error in Downloading validData');
    });

  }

  getDatav2(type, url, fileId: any ,name?:any ,format?:any) {
    const date = new Date(); // or any valid Date object

const dd = String(date.getDate()).padStart(2, '0');
const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
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
        // this.downloadDataInExcel(res.data, 2, type);
      }else{
        this.commonService.warningSnackBar(res.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Error in Downloading validData');
    });

  }

  reconsilation(type, url, fileId: any) {
    const date = new Date(); // or any valid Date object

const dd = String(date.getDate()).padStart(2, '0');
const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
const yyyy = date.getFullYear();

const formattedDate = `${dd}-${mm}-${yyyy}`;
    const filename = name + '-' +formattedDate;
    let createMasterJson: any = {};
    createMasterJson.url = url + fileId + '&callback_url=' + type;
    this.msmeService.getCommCibilUploadedDataByFileId(createMasterJson).subscribe((res: any) => {
      console.log('res=========', res.data);
      if (res.status === 200) {
        this.commonService.successSnackBar(res.message);
        this.fetchBulkUploadHistory(null, false);
        // this.downloadCSVFromBase64(res.data, filename , format);
        // this.downloadDataInExcel(res.data, 2, type);
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

  redirectToSummary(){
    this.router.navigate(['/hsbc/customer-processing-overview'], { state: { data: this.pageDataCommercialSummary} });
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
  return fileId+'_PR_InputFile';

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

    navigateToView(fileId?: any) {
      const routerData = { fileId: fileId};// Data to pass
      const prdataBoolean = this.commCibilUploadDetailsForm?.value?.prdataBoolean;
      this.router.navigate([`/hsbc/pr-reconcilation-dashboard`], { state: { routerData, data: this.pageData, prdataBoolean } });
    }
}


