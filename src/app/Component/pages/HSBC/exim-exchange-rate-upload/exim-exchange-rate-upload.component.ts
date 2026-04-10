import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import alasql from 'alasql';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { CustomerBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import { ReadInstructionBulkUploadComponent } from 'src/app/Popup/HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { SendLinkBorrowerPopupComponent } from 'src/app/Popup/HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";
import { clear, error } from 'console';
import { event } from 'jquery';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { SharedService } from 'src/app/services/SharedService';
import { RestUrl } from 'src/app/CommoUtils/resturl';


@Component({
  selector: 'app-exim-exchange-rate-upload',
  templateUrl: './exim-exchange-rate-upload.component.html',
  styleUrls: ['./exim-exchange-rate-upload.component.scss']
})
export class EximExchangeRateUploadComponent implements OnInit {


  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;
  selectedModuleId = 1;
  showDropdown: boolean = false;
  fileType:any;
  uploadFileType: string;

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
  eximBulkHistoryData:any;
  userName: any;
  selectedFileType: any;
  selectedUploadFileType:any;
  fileTypeSet = new Set<string>();
  fileTypeList: any = [];
  filesFor: File[] = [];
fileTypes: string[] = [];
  uploadType: number;
  private availableActions: number[] = [];

  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService, private sharedService: SharedService,
    private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient, private excelDownloadService: ExcelDownloadService) {

      this.sharedService.getEximExportStatusClickEvent().subscribe((message)=>{
        console.log("message recieved export");
        this.fetchDataFromWebSocket(message);
      });

      this.sharedService.getEximImportStatusClickEvent().subscribe((message)=>{
        console.log("message recieved import");
        this.fetchDataFromWebSocketForImport(message);
      })
    }
    fetchDataFromWebSocket(responseFromWebSocket?){
      responseFromWebSocket = JSON.parse(responseFromWebSocket);
        this.bulkUploadHistory = responseFromWebSocket?.response.listData;
    }
    fetchDataFromWebSocketForImport(responseFromWebSocket?){
      responseFromWebSocket = JSON.parse(responseFromWebSocket);
      this.bulkUploadHistory = responseFromWebSocket?.response.listData;
    }
protected readonly consValue = Constants;
  ngOnInit(): void {
    console.log('inside ng on init');

    this.constants = Constants;
    this.pageData = history.state.data;
      if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(this.consValue.pageMaster.BULK_UPLOAD,this.consValue.pageMaster.EXIM_UPLOADS)
    }

    let subpageData = this.pageData.subSubpages.filter(data => data.subpageId === this.consValue.pageMaster.EXIM_EXCHANGE_RATE);
    
    // Initialize available actions list
    this.availableActions = [];
    if (subpageData.length > 0 && subpageData[0].actions) {
      this.availableActions = subpageData[0].actions.map(action => action.actionId);
    }

    console.log('inside ng on init');

    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/exim-exchange-rate-upload';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    this.breadCrumbItems = [{ label: 'Dashboard' }, { label: 'Upload', path: '/', active: true }];
    this.createBulkUploadForm(null);
    console.log('going to fetch history...');
    
    this.fetchBulkUploadHistory(null, false);
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

  onFileSelected(event: any) {
    this.filesFor = Array.from(event.target.filesFor); // store selected files


    this.fileTypes = [];
    this.filesFor.forEach(file => {
      if (file.name.toLowerCase().includes('export')) {
        this.fileTypes.push('EXIM-EXPORT-DATA');
      } else if (file.name.toLowerCase().includes('import')) {
        this.fileTypes.push('EXIM-IMPORT-DATA');
      }
    });

    console.log('Selected files:', this.files);
    console.log('Detected types:', this.fileTypes);
  }

  uploadForExport(){
    const missingFields: string[] = [];

    if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
      missingFields.push('File type');
    }

    if (this.selectedModuleId !== 1) {
      this.commonService.warningSnackBar('Please upload Import file');
      return false;
    }

    // if(this.commonService.isObjectNullOrEmpty(this.uploadFileType)){
    //   missingFields.push('Upload File Type');
    // }

    GlobalHeaders['x-page-action'] = 'Uploading file';
    // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
    //   //console.log("upload data", this.bulkUploadDetailsForm.value);
    const formData: any = new FormData();
    if (this.files.length == 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }
    // if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
    //   this.commonService.warningSnackBar('Please select exim-data file-type');
    //   return false;
    // }
    if(this.commonService.isObjectNullOrEmpty(this.uploadFileType)){
      this.commonService.warningSnackBar('Please select upload file type');
    }
    for (let i = 0; i < this.files.length; i++) {
      if (this.commonService.isObjectIsEmpty(this.files)) {
        this.commonService.errorSnackBar('Please upload a file.');
        return false;
      } else {
        //console.log("filesss...",this.files[0].type);
        let extension = this.getFileExtension(this.files[i].name);
        if (extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be csv or xls or xlsx");
          return;
        }
        formData.append('file', this.files[i]);
      }
    }
    formData.append('fileType',this.fileType);
    // formData.append('uploadFileType', this.uploadFileType);

    //console.log("formdata", formData);
    this.btnDisabled = true;
    this.msmeService.eximBulkUploadDataForExport(formData, this.userName).subscribe(res=>{
      console.log("res=========",res);
      if(res.status == 200){
        this.fileType=null;
        // this.uploadFileType=null;
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
        this.fetchBulkUploadHistory();
        this.files = [];
        // this.FileUploadStatus_popup();
      }else{
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar('Something went wrong');
      this.files = [];

      // this.commonMethod.pageRefresh()
    });
    return true;
  }

  uploadForImport(){
    const missingFields: string[] = [];

    if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
      missingFields.push('File type');
    }

    // if (this.selectedModuleId != 2) {
    //   this.commonService.warningSnackBar('Please upload Import file');
    //   return false;
    // }
    // if(this.commonService.isObjectNullOrEmpty(this.uploadFileType)){
    //   missingFields.push('Upload File Type');
    // }

    GlobalHeaders['x-page-action'] = 'Uploading file';
    // //console.log("upload data", this.bulkUploadDetailsForm.value.fileUpload);
    //   //console.log("upload data", this.bulkUploadDetailsForm.value);
    const formData: any = new FormData();
    if (this.files.length == 0) {
      this.commonService.errorSnackBar('Please upload the smart excel file');
      return false;
    }
    if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
      this.commonService.warningSnackBar('Please select exim-data file-type');
      return false;
    }
    // if(this.commonService.isObjectNullOrEmpty(this.uploadFileType)){
    //   this.commonService.warningSnackBar('Please select upload file type');
    // }
    for (let i = 0; i < this.files.length; i++) {
      if (this.commonService.isObjectIsEmpty(this.files)) {
        this.commonService.errorSnackBar('Please upload a file.');
        return false;
      } else {
        //console.log("filesss...",this.files[0].type);
        let extension = this.getFileExtension(this.files[i].name);
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar("File format of the upload should be csv or xls or xlsx");
          return;
        }
        formData.append('file', this.files[i]);
      }
    }
    formData.append('fileType',this.fileType);
    // formData.append('uploadFileType',this.uploadFileType);

    //console.log("formdata", formData);
    this.btnDisabled = true;
    this.msmeService.eximBulkUploadDataForImport(formData, this.userName).subscribe(res=>{
      console.log("res=========",res);
      if(res.status == 200){
        this.fileType=null;
        // this.uploadFileType=null;
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
        this.fetchBulkUploadHistory();
        this.files = [];
        // this.FileUploadStatus_popup();
      }else{
        this.btnDisabled = false;
        this.commonService.errorSnackBar('Error in Uploading file');
        this.files = [];
        // this.commonMethod.pageRefresh();
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar('Something went wrong');
      this.files = [];

      // this.commonMethod.pageRefresh()
    });
    return true;
  }

  uploadFile(){
    if(this.selectedModuleId === 1){
      this.uploadForExport();
    }else if(this.selectedModuleId === 2){
      this.uploadForImport();
    }
  }

  onSelectionChange(event: any) {
    // Commented out as only Exchange Rate Upload is supported
    /* const selected = Number(event.value);
    // this.selectedFileType = event.value;
    // this.isFullPreScreen=event.value==='2';
    // if (this.isFullPreScreen) {
    if (selected === 0) {
      this.showDropdown = true;
      this.fileType = "Exim Internal Data Upload";
      this.uploadFileType = null;
      this.fetchBulkUploadHistory();
    } else {
      this.showDropdown = false;
      this.fileType = "Exchange Rate Table Upload";
      this.selectedModuleId = null;
      this.uploadFileType = null;
      this.fetchBulkUploadHistory();
    }
    this.deleteFile(0); */
  }

  onSelectionChangeValue(event: any){
    this.selectedModuleId = event.value;
    this.uploadFileType = event.value === 1 ? 'Export' : 'Import';
    console.log(this.selectedModuleId);
  }

  getDataForExim(type, historyData?){

    console.log("Dtaa:::::::::", historyData);
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    console.log("<===========================>");
    let createMasterJsonForExim: any = {}
    createMasterJsonForExim["mstId"] = historyData.id;
    // const uploadTypes = this.bulkUploadHistory[historyData]?.uploadType;
    // console.log("upoadType===>",uploadTypes)

    if (type == 1) {
      createMasterJsonForExim["isFailed"] = false;
    } else if (type == 2) {
      createMasterJsonForExim["isFailed"] = true;
    }
    if (historyData.uploadType == 1) {
      createMasterJsonForExim.uploadType =  1
      createMasterJsonForExim.tableType = 'EXIM-EXPORT-DATA';
      console.log("res",createMasterJsonForExim)
      this.msmeService.downloadEximExportImportDataByMstId(createMasterJsonForExim).subscribe((res: any) => {
        console.log("response=====>", res);
        if (res.status == 200) {
          const bucketRefId = res.data?.data?.bucketReferenceId;

          const recordCount = res.data?.count?? 0;
          const dateStr = new Date().toDateString();
          let fileNamePrefix = `Total_Entries_${dateStr}`; // default for null (total list)
          if (createMasterJsonForExim.isFailed === true) {
            fileNamePrefix = `Failed_Entries_${dateStr}`;
          } else if (createMasterJsonForExim.isFailed === false) {
            fileNamePrefix = `Successful_Entries_${dateStr}`;
          }

          // this.downloadDataInExcelForExport(res.data?.data??[], 2, type);
          const fileName = `${fileNamePrefix}`;
          this.downloadTemplate1(bucketRefId, fileName);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    } else if(historyData.uploadType == 2){
      createMasterJsonForExim.uploadType = 2
      createMasterJsonForExim.tableType = 'EXIM-IMPORT-DATA';
      this.msmeService.downloadEximExportImportDataByMstId(createMasterJsonForExim).subscribe((res: any) => {
        if (res.status == 200) {
          console.log("check response : ",res)
          // this.downloadDataInExcelForImport(res.data?.data??[], 2, type);
           const bucketRefId = res.data?.data?.bucketReferenceId;
          const recordCount = res.data?.count?? 0;
          const dateStr = new Date().toDateString();

          let fileNamePrefix = `Total_Entries_${dateStr}`; // default for null (total list)
          if (createMasterJsonForExim.isFailed === true) {
            fileNamePrefix = `Failed_Entries_${dateStr}`;
          } else if (createMasterJsonForExim.isFailed === false) {
            fileNamePrefix = `Successful_Entries_${dateStr}`;
          }

          // this.downloadDataInExcelForExport(res.data?.data??[], 2, type);
          const fileName = `${fileNamePrefix}`;
          this.downloadTemplate1(bucketRefId, fileName);
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    }
  }


  downloadDataInExcelForExport(excelData, type, reqType) {
    let downloadData = [];
    let a = type == 1 ? '.xls' : '.xlsx';
    let fileName = "";

    console.log("formateInvoiceAmount=====>",);
    if (reqType == 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'Shipping Bill Date': element.shippingBillDate?element.shippingBillDate : '-',
          'Invoice Amount in INR': element.actualAmount? element.actualAmount : '-',
          'Export Agency': element.exportAgency ? element.exportAgency : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'Country Code': element.countryCode ? element.countryCode : '-',
          'Buyer Name': element.buyerName ? element.buyerName : '-',
        }];
        downloadData = downloadData.concat(allApplications);
        console.log("downloadData ======>",downloadData)
      });
    } else if (reqType == 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = null;
        allApplications = [{
          // Sr_no: index,
          'Shipping Bill Date': element.shippingBillDate?element.shippingBillDate : '-',
          'Invoice Amount in INR': element.actualAmount? element.actualAmount : '-',
          'Export Agency': element.exportAgency ? element.exportAgency : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'Country Code': element.countryCode ? element.countryCode : '-',
          'Buyer Name': element.buyerName ? element.buyerName : '-',
          'Failuer Reason': element.failureReason ? element.failureReason : '-'
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
          'Shipping Bill Date':element.shippingBillDate?element.shippingBillDate : '-',
          'Invoice Amount in INR':element.actualAmount? element.actualAmount : '-',
          'Export Agency': element.exportAgency ? element.exportAgency : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'Country Code': element.countryCode ? element.countryCode : '-',
          'Buyer Name': element.buyerName ? element.buyerName : '-',
          'Failuer Reason': element.failureReason ? element.failureReason : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }


    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  downloadDataInExcelForImport(excelData, type, reqType) {
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
          'BOE Date': element.boeDate? element.boeDate : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE PAN': element.iePan ? element.iePan : '-',
          'Shipment Port': element.shipmentPort ? element.shipmentPort : '-',
          'Invoice Amount': element.actualAmount ? element.actualAmount : '-',
          'Invoice Currency': element.invoiceCurrency ? element.invoiceCurrency : '-',
          'Supplier Name': element.supplierName ? element.supplierName : '-',
          'Supplier Country': element.supplierCountry ? element.supplierCountry : '-',
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
          'BOE Date':  element.boeDate? element.boeDate : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE PAN': element.iePan ? element.iePan : '-',
          'Shipment Port': element.shipmentPort ? element.shipmentPort : '-',
          'Invoice Amount': element.actualAmount ? element.actualAmount : '-',
          'Invoice Currency': element.invoiceCurrency ? element.invoiceCurrency : '-',
          'Supplier Name': element.supplierName ? element.supplierName : '-',
          'Supplier Country': element.supplierCountry ? element.supplierCountry : '-',
          'Failuer Reason': element.failureReason ? element.failureReason : '-'
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
          'BOE Date':  element.boeDate? element.boeDate : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE PAN': element.iePan ? element.iePan : '-',
          'Shipment Port': element.shipmentPort ? element.shipmentPort : '-',
          'Invoice Amount': element.actualAmount ? element.actualAmount : '-',
          'Invoice Currency': element.invoiceCurrency ? element.invoiceCurrency : '-',
          'Supplier Name': element.supplierName ? element.supplierName : '-',
          'Supplier Country': element.supplierCountry ? element.supplierCountry : '-',
          'Failuer Reason': element.failureReason ? element.failureReason : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }


    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }



  fetchBulkUploadHistory(page?, onPageChangeFlag?: boolean, approvalStatus?: String): void {
    const data: any = {};
    console.log(this.pageSize);

    data.size = this.pageSize;
    data.pageIndex = this.page - 1;
    // Commented out EXIM data types as only Exchange Rate is supported
    // data.tableTypes = ['EXIM-EXPORT-DATA','EXIM-IMPORT-DATA'];
    data.fileType = this.fileType;
    
    console.log('Fetching history with data:', data);
    
    // Only fetch Exchange Rate data
    this.msmeService.getExchRateUploadedFileData(data).subscribe((res: any) => {
      console.log('History API response:', res);
      if (res && res.status == 200) {
        if (res.data != null) {
          this.counts = res.data;
          this.totalSize = res.data;
        }

        this.bulkUploadHistory = res.listData;
        console.log('bulkUploadHistory set to:', this.bulkUploadHistory);
      } else {
        console.error('API returned non-200 status:', res);
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      console.error('API error:', err);
      this.commonService.errorSnackBar(err);
    });
    
    /* Commented out EXIM functionality
    if (this.bulkUploadDetailsForm.get('exchangeRateYTD')?.value === '0' ){
    this.msmeService.uploadEximBulkData(data).subscribe((res: any) => {
      console.log("==========>",res)
          if(res && res.status == 200){
            if(res.data != null){
              this.counts = res.data;
              this.totalSize = res.data;
            }
            this.bulkUploadHistory = res.listData;
            console.log("bulkUploadHistory =======>",this.bulkUploadHistory);
            this.fileTypeSet.clear();
            this.fileTypeList=[];

            for (let data of this.bulkUploadHistory) {
              if (data?.fileType && data?.fileTypeStatus?.toLowerCase() === 'pending') {
                 this.fileTypeSet.add(data?.fileType);
              }
            }
            this.fileTypeList = Array.from(this.fileTypeSet);

            if (!this.fileTypeList.includes(this.bulkUploadDetailsForm.get('selectedFileType').value)) {
              this.bulkUploadDetailsForm.get('selectedFileType').setValue(null);
              this.bulkUploadDetailsForm.get('selectedModule').setValue(null);
              this.bulkUploadDetailsForm.get('selectedFileType')?.disable();
            }
      } else {
        console.error
        this.commonService.warningSnackBar(res.message);
      }
    }, err => {
      this.commonService.errorSnackBar(err);
    });
    } */
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
      exchangeRateYTD: new UntypedFormControl( '1', [Validators.required]), // Set to '1' for Exchange Rate Upload
      fileUpload: new UntypedFormControl(bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '', [Validators.required]),
      // fileUpload: [],
      selectedFileType: [null],
      // selectedUploadFileType: [null]
    });
    
    // Set default values for Exchange Rate Upload
    this.fileType = null; // Try with null first
    this.showDropdown = false;
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
    const missingFields: string[] = [];

    if (this.commonService.isObjectNullOrEmpty(this.fileType)) {
      missingFields.push('File type');
    }

    // Commented out EXIM validation as only Exchange Rate is supported
    /* if (this.bulkUploadDetailsForm.get('exchangeRateYTD')?.value === '0' && this.commonService.isObjectNullOrEmpty(this.uploadFileType)) {
    this.commonService.warningSnackBar('Please select upload file type');
    return false;
    } */

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
        let extension = this.getFileExtension(this.files[i].name);
        if (extension != 'xls' && extension != 'xlsx') {
          this.commonService.warningSnackBar("File format of the upload should be xls or xlsx");
          return;
        }
        formData.append('file', this.files[i]);
      }
    }
    formData.append('fileType',this.fileType);

    this.btnDisabled = true;
    
    // Only Exchange Rate upload functionality
    this.msmeService.exchMasterBulkUpload(formData).subscribe(res => {
      if (res.status === 200) {
        this.btnDisabled = false;
        this.batchId = res.data.id
        this.totalEntry = res.data.totalRows;
        this.successfullEntry = res.data.success;
        this.failEntry = res.data.fail
        this.commonService.successSnackBar("File uploaded successfully");
        this.fetchBulkUploadHistory();
        this.files = [];
        this.FileUploadStatus_popup();
      } else {
        this.btnDisabled = false;
        if (res?.message) {
          this.commonService.warningSnackBar(res?.message);
        } else {
          this.commonService.errorSnackBar('Error in Uploading file');
        }
      }
    }, error => {
      this.btnDisabled = false;
      this.commonService.errorSnackBar("Error in Uploading file");
    });
    
    /* Commented out EXIM upload functionality
    if (this.bulkUploadDetailsForm.get('exchangeRateYTD')?.value === '0' && this.selectedModuleId === 1){
      // EXIM Export upload logic
    } else if(this.bulkUploadDetailsForm.get('exchangeRateYTD')?.value === '0' && this.selectedModuleId === 2){
      // EXIM Import upload logic
    } */
    
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

  // getData(type, batchId) {
  //   let createMasterJson: any = {}
  //   createMasterJson["mstId"] = batchId;
  //   this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
  //   if (type == 1) {
  //     createMasterJson["isFailed"] = false;
  //     this.msmeService.getEximData(createMasterJson).subscribe((res: any) => {
  //       console.log("res=========", res.data);
  //       if (res.status == 200) {
  //         this.downloadDataInExcel(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading validData");
  //     });
  //   } else if (type == 2) {
  //     createMasterJson["isFailed"] = true;
  //     this.msmeService.getEximData(createMasterJson).subscribe(res => {
  //       ////console.log("res=========",res);
  //       if (res.status == 200) {
  //         this.downloadDataInExcel(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading InValid data");
  //     });
  //   } else if (type == 3) {
  //     this.msmeService.getEximData(createMasterJson).subscribe(res => {
  //       ////console.log("res=========",res);
  //       if (res.status == 200) {
  //         this.downloadDataInExcel(res.data, 2, type);
  //       }
  //     }, error => {
  //       this.commonService.errorSnackBar("Error in Downloading Total Data");
  //     });
  //   }

  //   this.msmeService.getEximData(createMasterJson).subscribe((res: any) => {
  //     console.log("res=========", res.data);
  //     if (res.status == 200) {
  //       this.downloadDataInExcel(res.data, 2, type);
  //     }
  //   }, error => {
  //     this.commonService.errorSnackBar("Error in Downloading validData");
  //   });
  // }

  getExchData(type, batchId) {
    let createMasterJson: any = {}
    createMasterJson["mstId"] = batchId;
    if (type == 1) {
      createMasterJson["isFailed"] = false;
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.getExchBulkDataByMstId(createMasterJson).subscribe((res: any) => {
        console.log("res=========", res.contentInBytes);
        if (res.status == 200) {
          this.downloadExcel(res.contentInBytes,"Successful_Entries_"+ new Date().toDateString());
        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading validData");
      });
    } else if (type == 2) {
      createMasterJson["isFailed"] = true;
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.getExchBulkDataByMstId(createMasterJson).subscribe(res => {
        if (res.status == 200) {
          // this.downloadDataInExcel(res.data, 2, type);
          this.downloadExcel(res.contentInBytes,"Failed_Entries_"+ new Date().toDateString())

        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading InValid data");
      });
    } else if (type == 3) {
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
      this.msmeService.getExchBulkDataByMstId(createMasterJson).subscribe(res => {
        if (res.status == 200) {
          // this.downloadDataInExcel(res.data, 2, type);
          this.downloadExcel(res.contentInBytes,"Total_Entries_"+ new Date().toDateString())

        }
      }, error => {
        this.commonService.errorSnackBar("Error in Downloading Total Data");
      });
    }
  }

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
          'Ad Bill No': element.adBillNo ? element.adBillNo : '-',
          'Shipping Bill No': element.shippingBillNo ? element.shippingBillNo : '-',
          'Form No': element.formNo ? element.formNo : '-',
          'Shipping Bill Date': element.shippingBillDate ? element.shippingBillDate : '-',
          'Port Code': element.portCode ? element.portCode : '-',
          'Bank Name': element.bankName ? element.bankName : '-',
          'Ad Code': element.adCode ? element.adCode : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE Name': element.ieName ? element.ieName : '-',
          'IE Address': element.ieAddress ? element.ieAddress : '-',
          'Amount': element.amount ? element.amount : '-',
          'Status': element.status ? element.status : '-',
          'Expected Payment Last Date': element.expectedPaymentLastDate ? element.expectedPaymentLastDate : '-'
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
          'Ad Bill No': element.adBillNo ? element.adBillNo : '-',
          'Shipping Bill No': element.shippingBillNo ? element.shippingBillNo : '-',
          'Form No': element.formNo ? element.formNo : '-',
          'Shipping Bill Date': element.shippingBillDate ? element.shippingBillDate : '-',
          'Port Code': element.portCode ? element.portCode : '-',
          'Bank Name': element.bankName ? element.bankName : '-',
          'Ad Code': element.adCode ? element.adCode : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE Name': element.ieName ? element.ieName : '-',
          'IE Address': element.ieAddress ? element.ieAddress : '-',
          'Amount': element.amount ? element.amount : '-',
          'Status': element.status ? element.status : '-',
          'Expected Payment Last Date': element.expectedPaymentLastDate ? element.expectedPaymentLastDate : '-',
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
          'Ad Bill No': element.adBillNo ? element.adBillNo : '-',
          'Shipping Bill No': element.shippingBillNo ? element.shippingBillNo : '-',
          'Form No': element.formNo ? element.formNo : '-',
          'Shipping Bill Date': element.shippingBillDate ? element.shippingBillDate : '-',
          'Port Code': element.portCode ? element.portCode : '-',
          'Bank Name': element.bankName ? element.bankName : '-',
          'Ad Code': element.adCode ? element.adCode : '-',
          'IE Code': element.ieCode ? element.ieCode : '-',
          'IE Name': element.ieName ? element.ieName : '-',
          'IE Address': element.ieAddress ? element.ieAddress : '-',
          'Amount': element.amount ? element.amount : '-',
          'Status': element.status ? element.status : '-',
          'Expected Payment Last Date': element.expectedPaymentLastDate ? element.expectedPaymentLastDate : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }


    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  isActionAvail(actionId: number): boolean {
    return true;
    // return this.availableActions.includes(actionId);
  }

//   isActionAvail(actionId: string): boolean {
//     for (let page of this.pageData?.actions) {
//         if (page?.actionId === actionId) {
//             return true; // Return true if found
//         }
//     }
//     return false; // Return false if not found
// }

  getStatus(stageId: any): string {
    switch (Number(stageId)) {
      case 1:
        return 'Completed';
      case 0:
        return 'Failed';
      }
  }

  downloadByBucketRef(bucketRef,name) {
    if(this.commonService.isObjectNullOrEmpty(bucketRef)){
      this.commonService.warningSnackBar("File Not Found");
      return;
    }
    var formData = new FormData();
    formData.append('bucketRefId', bucketRef)
    formData.append('fileType','xlsx')
    console.info('inside file download');
     this.msmeService.getByBucketRef(formData).subscribe((blob: Blob) => {
       if (blob.size > 0) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = name;
        a.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        console.error('Received empty blob');
        this.commonService.warningSnackBar('File is empty or could not be downloaded');
      }
    },
    (error) => {
      console.error('Failed to download file', error);
      this.commonService.warningSnackBar('Failed to download file');
    }
  );
}

downloadTemplate1(docReferenceId,reportName) {
  const fileUrl = RestUrl.GET_FILE_FROM_BUCKET+'/'+docReferenceId+'/xlsx';  // Path to the file in the assets folder
  this.downloadFile1(fileUrl).subscribe(blob => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = reportName+'.xlsx';  // Update with the actual file name and extension
    a.click();
    URL.revokeObjectURL(objectUrl);
  });
}
 
 downloadFile1(fileUrl: string): Observable<Blob> {
  const headers = new HttpHeaders({
    'req_auth': 'true',
    'Content-Type': 'application/json'
  });
 
    return this.http.get(fileUrl, {headers, responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
  }

}
