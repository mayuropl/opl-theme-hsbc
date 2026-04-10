import { Component, OnInit } from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MsmeService} from '../../../../services/msme.service';
import {CommonService} from '../../../../CommoUtils/common-services/common.service';
import {CommonMethods} from '../../../../CommoUtils/common-methods';
import {HttpClient} from '@angular/common/http';
import {Constants} from '../../../../CommoUtils/constants';
import {
  CustomerBulkUploadSuccessComponent
} from '../../../../Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
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
import { PreScreenBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/pre-screen-bulk-upload-success/pre-screen-bulk-upload-success.component';
import { SharedService } from 'src/app/services/SharedService';
import { UploadCustomerPopupComponent } from 'src/app/Popup/upload-customer-popup/upload-customer-popup.component';
import { DownloadcustomerPopupComponent } from 'src/app/Popup/HSBC/downloadcustomer-popup/downloadcustomer-popup.component';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { PrescreenMarkPopupComponent } from 'src/app/Popup/HSBC/prescreen-mark-popup/prescreen-mark-popup.component';
@Component({
  selector: 'app-pre-screen-data-upload',
  templateUrl: './pre-screen-data-upload.component.html',
  styleUrl: './pre-screen-data-upload.component.scss'
})
export class PreScreenDataUploadComponent {
    // tslint:disable-next-line:max-line-length
    constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService, private excelDownload : ExcelDownloadService,
                private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient,private sharedService: SharedService) {
                  this.sharedService.getPreScreenStatusClickEvent().subscribe((message) => {
                    console.log("1message Recived");
                    this.fetchDataFromWebSocket(message);
                     })

                     this.sharedService.getPreScreenPANStatusClickEvent().subscribe((message) => {
                      console.log("2message Recived");
                      this.PreScreenPanfetchDataFromWebSocket(message);
                       })

                       this.sharedService.getPreScreenDownloadStatusClickEvent().subscribe((message) => {
                        console.log("1message Recived");
                        this.PreScreenDownloadfetchDataFromWebSocket(message);
                         })
                }

                fetchDataFromWebSocket(responseFromWebSocket?){
                  responseFromWebSocket = JSON.parse(responseFromWebSocket);
                    this.bulkUploadHistory = responseFromWebSocket?.response.listData;
                }

                PreScreenPanfetchDataFromWebSocket(responseFromWebSocket?){
                  responseFromWebSocket = JSON.parse(responseFromWebSocket);
                  console.log(responseFromWebSocket);

                    this.bulkUploadHistory = responseFromWebSocket?.response.listData;
                }

                PreScreenDownloadfetchDataFromWebSocket(responseFromWebSocket?) {
                  responseFromWebSocket = JSON.parse(responseFromWebSocket);
                  console.log(responseFromWebSocket);
                  this.fetchBulkUploadHistory();
                }



    breadCrumbItems: Array<{}>;
    btnDisabled = false;
    bulkUploadData: [];
    failEntry: [];
    successfullEntry: [];
    totalEntry: [];
    bulikUploadDetails: any;
    selectedFileId: any = null;
    selectedFileType: any = null;
    selectedModule: any = null;
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
    // prBulkUploadHistory: any = [];
    fileIdSet = new Set<string>();
    fileIdList: any = [];
    openedRowIndex: number | null = null;
    // tslint:disable-next-line:ban-types
    dragDropFlag: Boolean = false;
    counts: any = [];
    pageData: any;
    constants: any;
    userName: string;
    // file upload @Nikul
    files: any[] = [];
    isPopupOpen= true;
    // isFullPreScreen: boolean = false;
    requestType:any;
    fileId:any;
    fileType:any;
    collapsedMap: { [key: number]: boolean } = {};

    ngOnInit(): void {
      this.constants = Constants;
      this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
        this.pageData  = this.commonService.getPageData(Constants.pageMaster.BULK_UPLOAD,Constants.pageMaster.PRE_SCREEN_DATA)
      }
      resetGlobalHeaders();
      GlobalHeaders['x-path-url'] = '/hsbc/pre-screen-data-upload';
      GlobalHeaders['x-main-page'] = this.pageData.pageName;
      this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
      this.createBulkUploadForm(null);
      this.fetchBulkUploadHistory(null, false);
      this.getUserDetails();
    }

    UploadCustomer_popup(): void {
      const dialogRef = this.dialog.open(UploadCustomerPopupComponent, {
        data: this,
        panelClass: ['popupMain_design'],
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe(result => {
        // window.location.reload();
        this.fetchBulkUploadHistory();
      });
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
      // window.location.reload();
      this.fetchBulkUploadHistory(page, true);
      this.openedRowIndex=null;
      // this.fetchAllRecord();
    }

    // fetchPRBulkUploadHistory(index:any, fileId:any){
    //   if (this.openedRowIndex === index) {
    //     this.openedRowIndex = null;
    //     this.prBulkUploadHistory = [];
    //   } else {
    //     this.openedRowIndex = index;
    //     this.msmeService.getPRBulkUploadHistory(fileId).subscribe(
    //       (res) => {
    //         if(!this.commonService.isObjectNullOrEmpty(res))
    //         // this.prBulkUploadHistory = res.dataList;

    //         this.prBulkUploadHistory = res?.dataList?.sort((a, b)=>{
    //           return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    //         });
    //       },
    //       (err) => {
    //         console.error('Error fetching sub-table data', err);
    //         this.prBulkUploadHistory = [];
    //       }
    //     );
    //   }
    // }

  toggleCollapse(fileId: number) {
    this.collapsedMap[fileId] = !this.collapsedMap[fileId];
  }

    fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
      const data: any = {};
      console.log("Page size in fetchBulkUploadHistory::::> ", this.pageSize);

      data.size = this.pageSize;

      data.pageIndex = this.page - 1;
      data.tableType = 'PRE-SCREEN';
      // this.data.tab = tabId;

      this.msmeService.getPreScreenPanFiles(data).subscribe((res: any) => {
        // tslint:disable-next-line:triple-equals
        console.log("response ", res)
        if (res && res.status == 200) {
          if (res.data != null) {
            this.counts = res.data;
            this.totalSize = res.data;
          }

          this.bulkUploadHistory = res.listData;

          this.fileIdSet.clear();
          this.fileIdList=[];

          console.log("Old FileIdSet:::> ", this.fileIdSet);
          console.log("Old FileidList:::::> ", this.fileIdList);

          for (let data of this.bulkUploadHistory) {
            if (data?.fileId && data?.fileIdStatus?.toLowerCase() === 'pending') {
               this.fileIdSet.add(data?.fileId);
            }
          }

          this.fileIdList = Array.from(this.fileIdSet);
          console.log("fileIdList::::> ", this.fileIdList);
          // //console.log("Bulkuplod  list is : ");
          // //console.log(this.bulkUploadHistory)
          if (!this.fileIdList.includes(this.bulkUploadDetailsForm.get('selectedFileId').value)) {
            this.bulkUploadDetailsForm.get('selectedFileId').setValue(null);
            this.bulkUploadDetailsForm.get('selectedModule').setValue(null);
            this.bulkUploadDetailsForm.get('selectedFileId')?.disable();
          }
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
        selectedFileId: [{ value: null, disabled: true }],
        selectedFileType: [null],
        selectedModule: [null],
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

      if (this.files.length === 0) {
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
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
            if (!this.files[index]) {
              clearInterval(progressInterval);
              return;
            }
            if(this.files.length == 0){
              return;
            }
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
    // prepareFilesList(files: Array<any>) {
    //   for (const item of files) {
    //     item.progress = 0;
    //     this.files.push(item);
    //     // this.Com_BulkUpload_popup();
    //   }
    //   this.uploadFilesSimulator(0);
    // }

    prepareFilesList(files: Array<any>): void {
      const fileArray = [...files];
      const maxSize = 20 * 1024 * 1024;
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);

      if (totalSize > maxSize) {
        this.commonService.warningSnackBar(`Total size of selected files exceeds 20MB limit.`);
        return;
      }

      for (const item of fileArray) {
        item.progress = 0;
        this.files.push(item);
      }
    
      if (this.files.length > 0) {
        this.uploadFilesSimulator(0); 
      }
    }
    

    clearInput(event) {
      event.target.value = '';
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
    DownloadAllcusomerpopup(): Observable<any> {
      const dialogRef = this.dialog.open(DownloadcustomerPopupComponent, {
        data: {},
        panelClass: ['popupMain_design'],
      });
      return dialogRef.afterClosed();
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


    submit() {
      const missingFields: string[] = [];

      if (this.commonService.isObjectNullOrEmpty(this.requestType)) {
        missingFields.push('Request type');
      }

      if (this.commonService.isObjectNullOrEmpty(this.fileId)) {
        missingFields.push('File ID');
      }

      if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
        missingFields.push('File type');
      }

      if (missingFields.length > 0) {
        const message = 'Please select the following' + (missingFields.length > 1 ? 's' : '') + ': ' + missingFields.join(', ');
        this.commonService.errorSnackBar(message);
        return;
      }

      const checkData = {
        module: this.requestType,
        fileId: this.fileId
      };
      
      this.msmeService.checkFullOrPartFileUploaded(checkData).subscribe(res => {
        if(res===true) {
          if(this.requestType==="Data")
          this.commonService.warningSnackBar("Full Pre Screen uploaded for the FileId, you can only upload Status File")

          else if(this.requestType==="Status")
            this.commonService.warningSnackBar("Full Pre Screen uploaded for the FileId, you can only upload Data File")

          return; 
        }
        else if(res===false){
          GlobalHeaders['x-page-action'] = 'Uploading file';
          // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
          //   //console.log("upload data", this.bulkUploadDetailsForm.value);
          const formData: any = new FormData();
          if (this.files.length == 0) {
            this.commonService.errorSnackBar('Please upload the smart excel file');
            return false;
          }
          if (this.commonService.isObjectNullOrEmpty(this.fileType) && this.commonService.isObjectNullOrEmpty(this.fileId)) {
            this.commonService.errorSnackBar('Please select pre-screen file-type and file-id');
            return false;
          }
    
          for (let i = 0; i < this.files.length; i++) {
            if (this.commonService.isObjectIsEmpty(this.files)) {
              this.commonService.errorSnackBar('Please upload a file.');
              return false;
            } else {
              // console.log("filesss...",this.files[0].type);
              const extension = this.getFileExtension(this.files[i].name);
              if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
                this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
                return;
              }
              formData.append('file', this.files[i]);
            }
          }
    
          formData.append('module',this.requestType);
          formData.append('fileId',this.fileId);
          formData.append('fileType',this.fileType);
    
          // console.log("formdata", formData);
          this.btnDisabled = true;
          this.msmeService.preScreenBulkUpload(formData).subscribe(res => {
    
             console.log("res=========",res);
            if (res.status === 200) {
              this.files = [];
              this.bulkUploadDetailsForm.reset();
              this.fileType=null;
              this.fileId=null;
              this.requestType=null;
              this.deleteFile(0);
              this.btnDisabled = false;
              // res.data.forEach(element => {
              // console.log(res.data);
              this.batchId = res.data.id;
              this.totalEntry = res.data.totalRows;
              this.successfullEntry = res.data.success;
              // this.failEntry = element.invalidEntryCount + element.failedEntryCount
              this.failEntry = res.data.fail;
              // this.userName = res.data.userName;
              // });
              this.commonService.successSnackBar('File uploaded successfully');
              // this.files.length =0;
              this.fetchBulkUploadHistory(null, false);
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
          });
    
            return true;
        }
      },(error) => {
        this.commonService.errorSnackBar('Error while cheking uploaded files', error);
      });

     
    }


    FileUploadStatus_popup(): void {
      const dialogRef = this.dialog.open(PreScreenBulkUploadSuccessComponent, {
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
      const fileUrl = 'assets/files/PRE_SCREEN_DATA_UPLOAD.xlsx';
      this.downloadFile(fileUrl).subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'PRE_SCREEN_DATA_UPLOAD.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
    }


    // getData(type, dataObj) {
    //   if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
    //   if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
    //   if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }

    //   console.log(type);
    //   const createMasterJson: any = {};
    //   createMasterJson.mstId = dataObj.id;
    //   createMasterJson.tableType = 'PRE-SCREEN-PART-FILE';
    //   this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    //   if (type == 1) {
    //     createMasterJson.isFailed = false;
    //     this.msmeService.getPreScreenPartData(createMasterJson).subscribe((res: any) => {
    //       console.log('res=========', res.data);
    //       if (res.status == 200) {
    //         this.downloadDataInExcelPartFile(res.data, 2, type);
    //       }
    //     }, error => {
    //       this.commonService.errorSnackBar('Error in Downloading validData');
    //     });
    //   } else if (type == 2) {
    //     createMasterJson.isFailed = true;
    //     this.msmeService.getPreScreenPartData(createMasterJson).subscribe(res => {
    //       //// console.log("res=========",res);
    //       if (res.status == 200) {
    //         this.downloadDataInExcelPartFile(res.data, 2, type);
    //       }
    //     }, error => {
    //       this.commonService.errorSnackBar('Error in Downloading InValid data');
    //     });
    //   } else if (type == 3) {
    //     this.msmeService.getPreScreenPartData(createMasterJson).subscribe(res => {
    //       //// console.log("res=========",res);
    //       if (res.status == 200) {
    //         this.downloadDataInExcelPartFile(res.data, 2, type);
    //       }
    //     }, error => {
    //       this.commonService.errorSnackBar('Error in Downloading Total Data');
    //     });
    //   }
    // }

    getDataForMainPrescreen(type, dataObj) {  
    if(dataObj?.referenceId?.toLowerCase().includes('pre-screen-part-file')) {

      if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
      if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
      if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }

      const createMasterJson: any = {};
      createMasterJson.mstId = dataObj.id;
      createMasterJson.tableType = 'PRE-SCREEN-PART-FILE';
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      if (type == 1) {
        createMasterJson.isFailed = false;
        this.msmeService.getPreScreenPartData(createMasterJson).subscribe((res: any) => {
          console.log('res=========', res.data);
          if (res.status == 200) {
            this.downloadDataInExcelPartFile(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading validData');
        });
      } else if (type == 2) {
        createMasterJson.isFailed = true;
        this.msmeService.getPreScreenPartData(createMasterJson).subscribe(res => {
           console.log("res=========",res);
          if (res.status == 200) {
            this.downloadDataInExcelPartFile(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading InValid data');
        });
      } else if (type == 3) {
        this.msmeService.getPreScreenPartData(createMasterJson).subscribe(res => {
          //// console.log("res=========",res);
          if (res.status == 200) {
            this.downloadDataInExcelPartFile(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading Total Data');
        });
      }
    }else{
      if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
      if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
      if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }

      const createMasterJson: any = {};
      createMasterJson.mstId = dataObj.id;
      createMasterJson.tableType = 'PRE-SCREEN-DATA-UPLOAD';
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      if (type == 1) {
        createMasterJson.isFailed = false;
        this.msmeService.getPreScreenData(createMasterJson).subscribe((res: any) => {
          console.log('res=========', res.data);
          if (res.status == 200) {
            this.downloadDataInExcel(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading validData');
        });
      } else if (type == 2) {
        createMasterJson.isFailed = true;
        this.msmeService.getPreScreenData(createMasterJson).subscribe(res => {
           console.log("res=========",res);
          if (res.status == 200) {
            this.downloadDataInExcel(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading InValid data');
        });
      } else if (type == 3) {
        this.msmeService.getPreScreenData(createMasterJson).subscribe(res => {
          //// console.log("res=========",res);
          if (res.status == 200) {
            this.downloadDataInExcel(res.data, 2, type);
          }
        }, error => {
          this.commonService.errorSnackBar('Error in Downloading Total Data');
        });
      }
    }

    }

   

    // downloadDataInExcel(excelData, type, reqType) {
    //   let downloadData = [];
    //   const a = type === 1 ? '.xls' : '.xlsx';
    //   let fileName = '';
  
    //   const emptyRowTemplate = {
    //     'report_order_number': '',
    //     'report_date': '',
    //     'report_user_id': '',
    //     'report_member': '',
    //     'application_reference_number': '',
    //     'borrower_name': '',
    //     'borrower_address': '',
    //     'borrower_pan': '',
    //     'contact_no': '',
    //     'cmr': '',
    //     'total_lenders': '',
    //     'total_active_accounts': '',
    //     'total_os_open_trades': '',
    //     'total_balance_of_open_trades_reported_in_past_12_months': '',
    //     'std_trades_open_trades_currently_satisfactory': '',
    //     'total_balance_of_all_non_funded_trades_reported_in_past_12_months': '',
    //     'total_balance_of_open_term_loan_trades_reported_in_past_12_months': '',
    //     'total_balance_of_open_wc_trades_reported_in_past_12_months': '',
    //     'total_balance_of_all_revolving_trades_reported_in_past_12_months': '',
    //     'total_balance_of_all_export_finance_trades_reported_in_past_12_months': '',
    //     'number_of_export_finance_trades': '',
    //     'total_balance_of_open_demand_loans_trades_reported_in_past_12_months': '',
    //     'number_of_demand_loan_trades': '',
    //     'number_of_willful_default_trades': '',
    //     'total_past_due_amount_of_suit_filed_trades_reported_in_past_12_months': '',
    //     'total_past_due_amount_of_restructured_trades_reported_in_past_12_months': '',
    //     'total_past_due_amount_of_invoked_devolved_trades_reported_in_past_12_months': '',
    //     'total_past_due_amount_of_settled_trades_reported_in_past_12_months': '',
    //     'missed_payments_ratio_last_12_months_for_financial_trades': '',
    //     'total_dpd_amount_of_currently_90_or_more_days_past_due_trades': '',
    //     'total_past_due_amount_of_currently_90_or_more_days_past_due_trades': '',
    //     'number_of_bank_inquiries_in_past_3_months': '',
    //     'number_of_finance_inquiries_in_past_3_months': '',
    //     'months_since_most_recent_delinquency': '',
    //     'worst_rating_on_all_trades_in_past_12_months': '',
    //     'months_since_most_recent_inquiry': '',
    //     'financial_balance_magnitude_over_past_24_months': '',
    //     // 'utilization_for_open_trades_reported_in_past_12_months': '',
    //     'utilization_for_open_trades_reported_in_past_12_months': '',
    //   };
    
    //   if (reqType === 2 || reqType === 3) {
    //     emptyRowTemplate['failure_reason'] = '';
    //   }
    
    //   if (reqType === 1) {
    //     fileName = 'Successful_Entries_' + new Date().toDateString() + a;
    //   } else if (reqType === 2) {
    //     fileName = 'Failed_Entries_' + new Date().toDateString() + a;
    //   } else if (reqType === 3) {
    //     fileName = 'Total_Entries_' + new Date().toDateString() + a;
    //   }
    
    //   if (excelData && excelData.length > 0) {
    //     excelData.forEach((element) => {
    //       const row = { ...emptyRowTemplate }; 
    
    //       Object.keys(row).forEach((key) => {
    //         const keyVal = this.camelToPascal(key);
    //         row[key] = element[keyVal] ?? '-';
    //       });
    
    //       downloadData.push(row);
    //     });
    //   } else {
    //     downloadData.push(emptyRowTemplate);
    //   }
    
    //   alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
    // }
    
    // camelToPascal(str) {
    //   return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    // }    
    


    downloadDataInExcel(excelData, type, reqType) {
      let downloadData = [];
      const a = type === 1 ? '.xls' : '.xlsx';
      let fileName = '';
    
      const emptyRowTemplate = {
        'report_order_number': '',
        'report_date': '',
        'report_user_id': '',
        'report_member': '',
        'application_reference_number': '',
        'borrower_name': '',
        'borrower_address': '',
        'borrower_pan': '',
        'contact_no': '',
        'cmr': '',
        'total_lenders': '',
        'total_active_accounts': '',
        'total_os_open_trades': '',
        'total_balance_of_open_trades_reported_in_past_12_months': '',
        'std_trades_open_trades_currently_satisfactory': '',
        'total_balance_of_all_non_funded_trades_reported_in_past_12_months': '',
        'total_balance_of_open_term_loan_trades_reported_in_past_12_months': '',
        'total_balance_of_open_wc_trades_reported_in_past_12_months': '',
        'total_balance_of_all_revolving_trades_reported_in_past_12_months': '',
        'total_balance_of_all_export_finance_trades_reported_in_past_12_months': '',
        'number_of_export_finance_trades': '',
        'total_balance_of_open_demand_loans_trades_reported_in_past_12_months': '',
        'number_of_demand_loan_trades': '',
        'number_of_willful_default_trades': '',
        'total_past_due_amount_of_suit_filed_trades_reported_in_past_12_months': '',
        'total_past_due_amount_of_restructured_trades_reported_in_past_12_months': '',
        'total_past_due_amount_of_invoked_devolved_trades_reported_in_past_12_months': '',
        'total_past_due_amount_of_settled_trades_reported_in_past_12_months': '',
        'missed_payments_ratio_last_12_months_for_financial_trades': '',
        'total_dpd_amount_of_currently_90_or_more_days_past_due_trades': '',
        'total_past_due_amount_of_currently_90_or_more_days_past_due_trades': '',
        'number_of_bank_inquiries_in_past_3_months': '',
        'number_of_finance_inquiries_in_past_3_months': '',
        'months_since_most_recent_delinquency': '',
        'worst_rating_on_all_trades_in_past_12_months': '',
        'months_since_most_recent_inquiry': '',
        'financial_balance_magnitude_over_past_24_months': '',
        'utilization_for_open_trades_reported_in_past_12_months': '',
      };
    
      // Add this if needed
      if (reqType === 2 || reqType === 3) {
        emptyRowTemplate['failure_reason'] = '';
      }
    
      if (reqType === 1) {
        fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      } else if (reqType === 2) {
        fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      } else if (reqType === 3) {
        fileName = 'Total_Entries_' + new Date().toDateString() + a;
      }
    
      // ✅ Mapping Excel keys to response keys
      const keyMapping = {
        'report_order_number': 'reportOrderNumber',
        'report_date': 'reportDate',
        'report_user_id': 'reportUserId',
        'report_member': 'reportMember',
        'application_reference_number': 'applicationReferenceNumber',
        'borrower_name': 'borrowerName',
        'borrower_address': 'borrowerAddress',
        'borrower_pan': 'borrowerPan',
        'contact_no': 'contactNo',
        'cmr': 'cmr',
        'total_lenders': 'totalLenders',
        'total_active_accounts': 'totalActiveAccounts',
        'total_os_open_trades': 'totalOsOpenTrades',
        'total_balance_of_open_trades_reported_in_past_12_months': 'totalBalanceOfOpenTradesReportedInPast12Months',
        'std_trades_open_trades_currently_satisfactory': 'stdTradesOpenTradesCurrentlySatisfactory',
        'total_balance_of_all_non_funded_trades_reported_in_past_12_months': 'totalBalanceOfAllNonFundedTradesReportedInPast12Months',
        'total_balance_of_open_term_loan_trades_reported_in_past_12_months': 'totalBalanceOfOpenTermLoanTradesReportedInPast12Months',
        'total_balance_of_open_wc_trades_reported_in_past_12_months': 'totalBalanceOfOpenWcTradesReportedInPast12Months',
        'total_balance_of_all_revolving_trades_reported_in_past_12_months': 'totalBalanceOfAllRevolvingTradesReportedInPast12Months',
        'total_balance_of_all_export_finance_trades_reported_in_past_12_months': 'totalBalanceOfAllExportFinanceTradesReportedInPast12Months',
        'number_of_export_finance_trades': 'numberOfExportFinanceTrades',
        'total_balance_of_open_demand_loans_trades_reported_in_past_12_months': 'totalBalanceOfOpenDemandLoansTradesReportedInPast12Months',
        'number_of_demand_loan_trades': 'numberOfDemandLoanTrades',
        'number_of_willful_default_trades': 'numberOfWillfulDefaultTrades',
        'total_past_due_amount_of_suit_filed_trades_reported_in_past_12_months': 'totalPastDueAmountOfSuitFiledTradesReportedInPast12Months',
        'total_past_due_amount_of_restructured_trades_reported_in_past_12_months': 'totalPastDueAmountOfRestructuredTradesReportedInPast12Months',
        'total_past_due_amount_of_invoked_devolved_trades_reported_in_past_12_months': 'totalPastDueAmountOfInvokedDevolvedTradesReportedInPast12Months',
        'total_past_due_amount_of_settled_trades_reported_in_past_12_months': 'totalPastDueAmountOfSettledTradesReportedInPast12Months',
        'missed_payments_ratio_last_12_months_for_financial_trades': 'missedPaymentsRatioLast12MonthsForFinancialTrades',
        'total_dpd_amount_of_currently_90_or_more_days_past_due_trades': 'totalDpdAmountOfCurrently90OrMoreDaysPastDueTrades',
        'total_past_due_amount_of_currently_90_or_more_days_past_due_trades': 'totalPastDueAmountOfCurrently90OrMoreDaysPastDueTrades',
        'number_of_bank_inquiries_in_past_3_months': 'numberOfBankInquiriesInPast3Months',
        'number_of_finance_inquiries_in_past_3_months': 'numberOfFinanceInquiriesInPast3Months',
        'months_since_most_recent_delinquency': 'monthsSinceMostRecentDelinquency',
        'worst_rating_on_all_trades_in_past_12_months': 'worstRatingOnAllTradesInPast12Months',
        'months_since_most_recent_inquiry': 'monthsSinceMostRecentInquiry',
        'financial_balance_magnitude_over_past_24_months': 'financialBalanceMagnitudeOverPast24Months',
        'utilization_for_open_trades_reported_in_past_12_months': 'utilizationForOpenTradesReportedInPast12Months',
        'failure_reason': 'failureReason',
      };
    
      if (excelData && excelData.length > 0) {
        excelData.forEach((element) => {
          const row = { ...emptyRowTemplate };
    
          Object.keys(row).forEach((excelKey) => {
            const responseKey = keyMapping[excelKey];
            row[excelKey] = element[responseKey] ?? '-';
          });
    
          downloadData.push(row);
        });
      } else {
        downloadData.push(emptyRowTemplate);
      }
    
      alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
    }
    

    downloadDataInExcelPartFile(excelData, type, reqType) {
      let downloadData = [];
      const a = type === 1 ? '.xls' : '.xlsx';
      let fileName = '';
      if (reqType === 1) {
        fileName = 'Successful_Entries_' + new Date().toDateString() + a;
        if (excelData && excelData.length > 0) {
          excelData.forEach((element) => {
            downloadData.push({
              'MRN': element.mrn ?? '-',
              'Status': element.status ?? '-'
            });
          });
        }else {
          // No data? Still generate headers with dummy row
          downloadData.push({
            'MRN': '',
            'Status': ''
          });
        }
      } else if (reqType === 2) {
        fileName = 'Failed_Entries_' + new Date().toDateString() + a;
        if (excelData && excelData.length > 0) {
          excelData.forEach(element => {
            downloadData.push({
              'MRN': element.mrn ?? '',
              'Status': element.status ?? '',
              'Failure Reason': element.invalidReason ?? ''
            });
          });
        } else {
          // Dummy row just to show headers
          downloadData.push({
            'MRN': '',
            'Status': '',
            'Failure Reason': ''
          });
        }
  

      } else if (reqType === 3) {
        fileName = 'Total_Entries_' + new Date().toDateString() + a;
        if (excelData && excelData.length > 0) {
          excelData.forEach((element) => {
            downloadData.push({
              'MRN': element.mrn ?? '-',
              'Status': element.status ?? '-',
              'Failure Reason': element.invalidReason ?? '-'
            });
          });
        } else {
          // Add header row only (dummy data) if there's no actual data
          downloadData.push({
            'MRN': '',
            'Status': '',
            'Failure Reason': ''
          });
        }
      }
      console.log('Final downloadData:', downloadData);
      alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
    }

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

    isDownloadingPreScreen = false;

    downloadPreScreenExcel(): void {
      const timestamp = this.getFormattedTimestamp();
      let fileName = 'PRE-SCREEN_ACTIVE_DATA';
      this.isDownloadingPreScreen = true
      this.msmeService.downloadPreScreenExcel().subscribe(res=>{
        this.downloadExcel(res.file, fileName );
        this.isDownloadingPreScreen = false
      });
    }

    private getFormattedTimestamp(): string {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    onSelectionChange(event: any) {
      // this.isFullPreScreen=event.value==='2';

      // if (this.isFullPreScreen) {
      if (event.value==='2') {
        this.fileType = "FULL";
      } else {
        this.fileType = "PART";
      }
    }

    onInputFileTypeChange(event: any) {
      if (event.value === "0") {
        this.requestType = "Data";
        this.bulkUploadDetailsForm.get('selectedFileId')?.enable();
      } else if (event.value === "1") {
        this.requestType = "Status";
        this.bulkUploadDetailsForm.get('selectedFileId')?.enable();
      } else{
        this.bulkUploadDetailsForm.get('selectedFileId')?.disable();
      }
    }

    uploadStatusChange(fileId:any, revertFlag:Boolean) {
      this.msmeService.uploadStatusChange(fileId, revertFlag).subscribe((res: any) => {
          console.log('res=========', res.data);
          if (res.status == 200) {
            this.commonService.successSnackBar(res?.success);
            this.fetchBulkUploadHistory(null, false);
          }
          else{
            this.commonService.errorSnackBar(res?.success);
          }
        }, (error) => {
          this.commonService.errorSnackBar('Error while changing status for given file.');
        });
    }

    onFileTypeChange(event:any) {
      const index = event.value;
      this.fileId = this.fileIdList[index];
    }

    downloadErrorAndNoHits(type:any, file_id:any){
      console.log(file_id);

      const payLoadData:any= {};
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      GlobalHeaders['x-page-action'] = 'Get All PRE-SCREEN Data';
        payLoadData.downloadType = type;
        payLoadData.fileId = file_id;
        this.msmeService.dowmloadError(payLoadData).subscribe((res)=>{
          const currentDate = new Date().toISOString().split('T')[0];
          const filename =   file_id+"_Pree Screen_Input File_"+currentDate;
          this.downloadExcel(res.file,filename);
        })
    }

    downloadAllCustomerPreScreenExcel(): void {
      this.DownloadAllcusomerpopup().subscribe(result => {
        if (result === true || result === 'true') { // Only proceed if user clicked OK
          const uniqueId = this.generateHsbcUniqueCode();
          const currentDate = new Date().toISOString().split('T')[0];
          const fileName = `${uniqueId}_Pre_Screen_Input_File_${currentDate}.xlsx`;

          this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…');
          this.msmeService.downloadAllCustomerPreScreenExcel(fileName).subscribe(res => {
           console.log('res=========', res.data);
          if (res.status == 200) {
            this.fetchBulkUploadHistory(null, false);
          }
          else{
            this.commonService.errorSnackBar(res?.success);
          }
        }, (error) => {
          this.commonService.errorSnackBar('Error while changing status for given file.');
          });
        }
      });
    }

    private hsbcCounter = 1;

    generateHsbcUniqueCode(): string {
      const paddedNumber = this.hsbcCounter.toString().padStart(2, '0');
      this.hsbcCounter++;
      return `HSBC${paddedNumber}`;
    }

    Mark_popup(fileId:any, revertFlag:Boolean): void {
      const data={
        "fileId":fileId,
        "revertFlag":revertFlag
      }
      const dialogRef = this.dialog.open(PrescreenMarkPopupComponent, {
        data: data,
        panelClass: ['popupMain_design'],
        autoFocus: false,
    });
      dialogRef.afterClosed().subscribe(result => {
         this.fetchBulkUploadHistory(null, false);
      });
    }
  }

