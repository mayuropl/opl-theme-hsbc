import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, NgModel, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import alasql from 'alasql';
import { request } from 'http';
import { data } from 'jquery';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { GlobalHeaders, resetGlobalHeaders } from 'src/app/CommoUtils/global-headers';
import { CustomerBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import { ReadInstructionBulkUploadComponent } from 'src/app/Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { ReportStatusPopupComponent } from 'src/app/Popup/HSBC/report-status-popup/report-status-popup.component';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-hsbc-banking-bulk-upload',
  templateUrl: './hsbc-banking-bulk-upload.component.html',
  styleUrl: './hsbc-banking-bulk-upload.component.scss'
})
export class HsbcBankingBulkUploadComponent {
  pageData: any;
  pageSize: any = 10;
  endIndex: any;
  page: number = 1;
  counts: any;
  totalSize: any;
  totalCount;

  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '20', value: 20 }, { name: '50', value: 50 }, { name: '100', value: 100 }, ];
  files: any[] = [];
  btnDisabled: boolean;
  userName: any;
  totalEntry: any;
  successfullEntry: any;
  failEntry: any;
  dialog: any;
  batchId: any;
  breadCrumbItems: Array<{}>;
  bulkUploadDetailsForm: UntypedFormGroup;
  totalList: any;
  searchCritera = {
    ccnId: '',
    name : '',
    country : '',
    shortCountry : '',
    bankingPresence : '',
    reportType : '',
    hsbcPresence : '',
    docRefrenceId : ''
  };

  constructor(private http: HttpClient,private commonMethod: CommonMethods,private modalService: NgbModal, private msmeService:MsmeService, private commonService: CommonService, private formBuilder:FormBuilder, private matDialog: MatDialog){}
  ngOnInit(): void {
    // this.selectedModuleId = this.selectedModuleId || 1;  // Ensure it’s set to 1 if not defined    
    this.selectedModuleId = this.dropdown[0]?.value;
    this.selectedModule = this.selectedModule || 'HSBC Status';
    this.constants = Constants;
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(Constants.pageMaster.BULK_UPLOAD,Constants.pageMaster.HSBC_STATUS)
    }
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/hsbc-banking-data-upload';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    this.getUserDetails();
    this.getHsbcBankingBulkUploadHistory();
    
  }

  constants: any;
  dropdown = [{name:'HSBC Status',value:1}, {name:'HSBC Country Presence',value:2}]
  selectedModule = 'HSBC Status';
  selectedModuleId = 1;
  hsbcHistoryData:any;
  startIndex = 0;

  getHsbcBankingBulkUploadHistory(page?, onPageChangeFlag?: boolean){
    const data:any = {}
    console.log(this.pageSize);

    data.size = this.pageSize;
    
    // data.size =10;
    // data.pageIndex=0;
    data.pageIndex = this.page - 1;
    // data.tableType = 'HSBC-BANKING-STATUS';
    data.tab = this.selectedModuleId;
    console.log("Method called...")
    console.log("Fetching data for:", data.tableType);

    this.msmeService.getHSBCBankingData(data).subscribe(res => {
      console.log("response",res);
      if (res.status === 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }
       this.hsbcHistoryData = res.listData;
       console.log(this.hsbcHistoryData);
        // this.commonMethod.pageRefresh();
      } else {
        // this.commonMethod.pageRefresh();
        this.commonService.warningSnackBar(res.message);
      }
    }
    , error => {
      this.commonService.errorSnackBar('Something went wrong');
      // this.commonMethod.pageRefresh();
    });
  }

  upload(){
    GlobalHeaders['x-page-action'] = 'Uploading file';
    // console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
    //   console.log("upload data", this.bulkUploadDetailsForm.value);
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
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
          return;
        }
        formData.append('file', this.files[0]);
      }
    }

    this.btnDisabled = true;
    this.msmeService.hsbcBankingBulkUpload(formData,this.userName).subscribe(res => {
      console.log("res=========",res);
      if (res.status === 200) {
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
        // this.commonMethod.pageRefresh();
        this.getHsbcBankingBulkUploadHistory();
        this.files = [];
        // this.FileUploadStatus_popup();
       
      } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
  
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar('Something went wrong');
      this.files = [];

      // this.commonMethod.pageRefresh();

    });
    return true;
  }

  uploadCountryPresence(){
    GlobalHeaders['x-page-action'] = 'Uploading file';
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
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
          return;
        }
        formData.append('file', this.files[0]);
      }
    }

    this.btnDisabled = true;
    this.msmeService.hsbcCountryPresenceUpload(formData,this.userName).subscribe(res => {
      //// console.log("res=========",res);
      if (res.status === 200) {
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
        // this.commonMethod.pageRefresh();
        this.getHsbcBankingBulkUploadHistory();
        this.files = [];
        // this.FileUploadStatus_popup();
      } else {
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        this.files = [];

        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar('Something went wrong');
      this.files = [];

      // this.commonMethod.pageRefresh();
    });
    return true;
  }

  uploadFile(){
    if(this.selectedModuleId == 1){
      this.upload();
    }else{
      this.uploadCountryPresence();
    }
  }

  Read_Instruction_BulkUpload_popup() {
      const config = {
        windowClass: 'popupMain_design',
      };
      const modalRef = this.modalService.open(ReadInstructionBulkUploadComponent, config);
      return modalRef;
    }

  getFileExtension(filename) {
    // get file extension
    const extension = filename.split('.').pop();
    return extension;
  }

   FileUploadStatus_popup(): void {
        const dialogRef = this.dialog.open( {
          data: this,
          panelClass: ['popupMain_design'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      }



  isDownloadingHsbc = false;
  // getAllHSBCBankingData(){
  //   let fileName = 'HSBC_Banking_Data';
  //   this.isDownloadingHsbc = true
  //   this.msmeService.getAllHSBCBankingData().subscribe(res=>{
  //     if(res.status === 200){
  //     this.downloadExcel(res.data,fileName);
  //     this.isDownloadingHsbc = false
  //     } else {
  //       this.isDownloadingHsbc = false;
  //       this.commonService.errorSnackBar("Something Went Wrong");
  //     }
  //   });
  // }

  

  getAllHSBCBankingData(){
    let request:any = {}
    request["ccnId"] = this.searchCritera.ccnId;
    request["name"] = this.searchCritera.name;
    request["country"] = this.searchCritera.country;
    request["shortCountry"] = this.searchCritera.shortCountry;
    request["bankingPresence"] = this.searchCritera.bankingPresence;
    request["reportType"] = "HSBC_BANKING_STATUS";
    request["docRefrenceId"] = this.searchCritera.docRefrenceId;

    this.matDialog.open(ReportStatusPopupComponent, {panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true})

  }


  // getAllHSBCCountryPresenceData(){
  //   let fileName = 'HSBC_Country_presence_Data';
  //   this.isDownloadingHsbc = true
  //   this.msmeService.getAllHSBCCountryPresenceData().subscribe(res=>{
  //     if(res.status === 200){
  //     this.downloadExcel(res.data,fileName);
  //     this.isDownloadingHsbc = false
  //     } else {
  //       this.isDownloadingHsbc = false;
  //       this.commonService.errorSnackBar("Something Went Wrong");
  //     }
  //   });
  // }

  getAllHSBCCountryPresenceData(){
    let request:any = {}
    request["country"] = this.searchCritera.country;
    request["shortCountry"] = this.searchCritera.shortCountry;
    request["hsbcPresence"] = this.searchCritera.hsbcPresence;
    request["reportType"] = "HSBC_COUNTRY_STATUS";
  

    this.matDialog.open(ReportStatusPopupComponent, {panelClass: ['popupMain_design', 'export_popup'], data: request, disableClose: true, autoFocus: true})

  }
 
  downloadExcel(byteData: string, fileName: string) {
    // console.log("Received Base64 Data:", byteData);  
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
    if (!base64Data) {
      throw new Error('Base64 data is undefined or null');
    }
    const base64 = base64Data.includes('base64,')
    ? base64Data.split('base64,')[1]
    : base64Data;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }


  pageSizeChange(size: any, page: any) {
    this.pageSize = size;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getHsbcBankingBulkUploadHistory(page, true);
  }
  
  onModuleChange(value?) {
    console.log(value);
    
    this.page = 1; // Reset to first page
    this.startIndex = 0;
    this.selectedModuleId = value?.value;
    console.log('Dropdown data:', this.dropdown);
    if(this.selectedModuleId == 1) {
      this.selectedModule = 'HSBC Status';
    } else {
      this.selectedModule = 'HSBC Country Presence';
    }
    this.getHsbcBankingBulkUploadHistory();
    
  }

  handleDownloadClick(){
    if (this.selectedModuleId == 1) {
      this.getAllHSBCBankingData();
    } else {
      this.getAllHSBCCountryPresenceData();
    }
  }

  onChangePage(page: any): void {
    // update current page of items
    // console.log("Page number is : ");
    // console.log(this.pageSize);
    // this.approvalStatus = approvalStatus;
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getHsbcBankingBulkUploadHistory(page, true);
    // this.fetchAllRecord();
  }

  getData(type, batchId) {
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    console.log("<===========================>");
    let createMasterJson: any = {}
    createMasterJson["mstId"] = batchId;
    createMasterJson.tableType = 'HSBC-BANKING';

    if (type == 1) {
      createMasterJson["isFailed"] = false;
    } else if (type == 2) {
      createMasterJson["isFailed"] = true;
    } 
    if (this.selectedModuleId == 1) {
      this.msmeService.getHSBCBankingBulkMstId(createMasterJson).subscribe((res: any) => {
        if (res.status == 200) {
          
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    } else {
      createMasterJson.tableType = 'HSBC-COUNTRY-PRESENCE';
      this.msmeService.getHSBCCountryPresenceBulkMstId(createMasterJson).subscribe((res: any) => {
        if (res.status == 200) {
          console.log("check response : ",res)
          this.downloadDataInExcelForCountryPresece(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    }
  }

  downloadDataInExcel(excelData:any, type, reqType) {

    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'CCN_ID': element.ccnId ? element.ccnId : '-',
          'Name': element.name ? element.name : '-',
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Banking Presence':element.bankingPresence ? element.bankingPresence:'-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'CCN_ID': element.ccnId ? element.ccnId : '-',
          'Name': element.name ? element.name : '-',
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Banking Presence':element.bankingPresence ? element.bankingPresence:'-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'CCN_ID': element.ccnId ? element.ccnId : '-',
          'Name': element.name ? element.name : '-',
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Banking Presence':element.bankingPresence ? element.bankingPresence:'-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);

  }

  // getDataForCountryPresence(type, batchId) {
  //   console.log("<===========================>");
  //   let createMasterJson: any = {}
  //   createMasterJson["mstId"] = batchId;
  //   createMasterJson.tableType = 'HSBC-COUNTRY-PRESENCE';

  //   if (type == 1) {
  //     createMasterJson["isFailed"] = false;
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getHSBCCountryPresenceBulkMstId(createMasterJson).subscribe((res: any) => {
  //       if (res.status == 200) {
  //         this.downloadDataInExcelForCountryPresece(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading validData");
  //     });
  //   } else if (type == 2) {
  //     createMasterJson["isFailed"] = true;
  //     ////console.log("res=========",res);
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getHSBCCountryPresenceBulkMstId(createMasterJson).subscribe(res => {
  //       if (res.status == 200) {
  //         this.downloadDataInExcelForCountryPresece(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading InValid data");
  //     });
  //   } else if (type == 3) {
  //     this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //     this.msmeService.getHSBCCountryPresenceBulkMstId(createMasterJson).subscribe(res => {
  //       ////console.log("res=========",res);
  //       if (res.status == 200) {
  //         this.downloadDataInExcelForCountryPresece(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading Total Data");
  //     });
  //   }
  // }

  downloadDataInExcelForCountryPresece(excelData:any, type, reqType) {

    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Hsbc Presence':element.hsbcPresence ? element.hsbcPresence:'-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Hsbc Presence':element.hsbcPresence ? element.hsbcPresence:'-',
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType == 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'Country': element.country ? element.country : '-',
          'Short Country':element.shortCountry ?element.shortCountry:'-',
          'Hsbc Presence':element.hsbcPresence ? element.hsbcPresence:'-',
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
    return true; // Return false if not found
  }

   downloadFile(fileUrl: string): Observable<Blob> {
      return this.http.get(fileUrl, { responseType: 'blob' }).pipe(
        map((res: Blob) => {
          return new Blob([res], { type: res.type });
        })
      );
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

  getUserDetails() {
    this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }

   /**
   * Simulate the upload process
   */
   uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (!this.files || index >= this.files.length) {
        return;
      }
  
      const file = this.files[index];
  
      if (!file || file.progress === undefined) {
        console.error(`File at index ${index} is invalid:`, file);
        return;
      }
  
      const progressInterval = setInterval(() => {
        if (file.progress === 100) {
          clearInterval(progressInterval);
          this.uploadFilesSimulator(index + 1);
        } else {
          file.progress += 5;
        }
      }, 200);
    }, 1000);
  }
}
