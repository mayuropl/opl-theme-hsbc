import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MsmeService } from '../../../../services/msme.service';
import { CommonService } from '../../../../CommoUtils/common-services/common.service';
import { CommonMethods } from '../../../../CommoUtils/common-methods';
import { HttpClient } from '@angular/common/http';

import {
  GlobalHeaders,
  resetGlobalHeaders,
} from '../../../../CommoUtils/global-headers';

import alasql from 'alasql';
import {
  Constants,
  TracxnFileAndTabCategory,
} from '../../../../CommoUtils/constants';
import { MatSelectChange } from '@angular/material/select';
import { SharedService } from 'src/app/services/SharedService';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { __values } from 'tslib';

@Component({
  selector: 'app-new-age-economy-upload',
  templateUrl: './new-age-economy-upload.component.html',
  styleUrl: './new-age-economy-upload.component.scss',
})
export class NewAgeEconomyUploadComponent {
  constructor(
    public dialog: MatDialog,
    private modalService: NgbModal,
    private msmeService: MsmeService,
    public commonService: CommonService,
    private formBuilder: UntypedFormBuilder,
    private commonMethod: CommonMethods,
    private http: HttpClient,
    private sharedService: SharedService,
    private loaderService: LoaderService
  ) {
    this.sharedService
      .getTracxnUploadStatusClickEvent()
      .subscribe((message) => {
        // // console.log('Message recieved from export');
        this.fetchDataFromWebSocket(message);
      });
  }

  fetchDataFromWebSocket(responseFromWebSocket?) {
    responseFromWebSocket = JSON.parse(responseFromWebSocket);
    // // console.log(
    //   'message from the tracxn file uploader: ',
    //   responseFromWebSocket
    // );
    const status = responseFromWebSocket.response.status;
    if (status == 100 || status == 200 || status == 300) {
      if(status == 100) this.deleteFile(0);
      this.fetchBulkUploadHistory();
    }
  }

  tracxnFileCategory: any[] = [
    {
      name: TracxnFileAndTabCategory.LEADING_INDICATOR,
      value: 'Leading Indicator',
      fileHeaders: ['Date of Indicators', 'Domain Name of the Company','City','Type of Indicator','Indicator Description','Link for more details'],
      isUploadAction: false,
    },
    {
      name: TracxnFileAndTabCategory.INVESTOR,
      value: 'Investor',
      fileHeaders: ['Investor Name','Investor Domain','Investor Type 1','Investor Type 2','Investor Type 3','Investor Type 4','Investor Type 5','Investor Type 6'],
      isUploadAction: false,
    },
    {
      name: TracxnFileAndTabCategory.FACILITATOR,
      value: 'Facilitator',
      isUploadAction: false,
    },
  ];

  isLoading: boolean = false;

  selectedFacilitatorFileType = TracxnFileAndTabCategory.FACILITATOR_LIST;

  facilitatorFileCategory = [
    {
      name: TracxnFileAndTabCategory.FACILITATOR_LIST,
      fileHeaders: ['Firm ID','Advisor','Type','Cleaned Domain'],
      value: 'Facilitators List',
    },
    {
      name: TracxnFileAndTabCategory.FACILITATOR_DEALS,
      fileHeaders: ['PORTFOLIO COMPANY DOMAIN','Financial Advisory','Financial Advisory Domain','Legal','Legal Domain'],
      value: 'Facilitators Deals',
    },
  ];

  breadCrumbItems: Array<{}>;
  btnDisabled = false;
  bulkUploadData: [];
  failEntry: [];
  successfullEntry: [];
  totalEntry: [];
  bulikUploadDetails: any;

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

  // formgroup
  bulkUploadDetailsForm: UntypedFormGroup;

  // tslint:disable-next-line:max-line-length
  PageSelectNumber: any[] = [
    { name: '10', value: 10 },
    { name: '20', value: 20 },
    { name: '50', value: 50 },
    { name: '100', value: 100 },
  ];
  id;
  batchId;

  bulkUploadHistory: any;
  // tslint:disable-next-line:ban-types
  dragDropFlag: Boolean = false;
  counts: any = [];
  pageData: any;
  constants: any;
  userName: string;

  filteredFileCategories: any[] = [];

  protected readonly consValue = Constants;

  selectedFileCategory: any;

  ngOnInit() {
    this.constants = Constants;

    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(Constants.pageMaster.BULK_UPLOAD,Constants.pageMaster.NEW_AGE_ECONOMY)
    }

    // // console.log('------ page data: ', this.pageData);

    resetGlobalHeaders();
    // GlobalHeaders['x-path-url'] = '/hsbc/tracxn-lending-indicators-upload';
    GlobalHeaders['x-path-url'] = '/hsbc/new-age-economy-upload';
    GlobalHeaders['x-main-page'] = this.pageData?.pageName;
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Upload', path: '/', active: true },
    ];
    // this.createBulkUploadForm(null);

    if (
      this.commonService.isSubpageIsAvailable(
        this.pageData,
        this.consValue.pageMaster.LEADING_IDICATORS
      )
    ) {
      // // console.log('permission for: leading indicator');
      this.filteredFileCategories.push(this.tracxnFileCategory[0]);
      this.selectedFileCategory == null
        ? (this.selectedFileCategory = this.tracxnFileCategory[0])
        : null;
    }

    if (
      this.commonService.isSubpageIsAvailable(
        this.pageData,
        this.consValue.pageMaster.INVESTORS
      )
    ) {
      // // console.log('permission for: investor');
      this.filteredFileCategories.push(this.tracxnFileCategory[1]);
      this.selectedFileCategory == null
        ? (this.selectedFileCategory = this.tracxnFileCategory[1])
        : null;
    }

    if (
      this.commonService.isSubpageIsAvailable(
        this.pageData,
        this.consValue.pageMaster.FACILITORS
      )
    ) {
      // // console.log('permission for: facilitator');
      this.filteredFileCategories.push(this.tracxnFileCategory[2]);
      this.selectedFileCategory == null
        ? (this.selectedFileCategory = this.tracxnFileCategory[2])
        : null;
    }

    this.fetchBulkUploadHistory();
    this.getUserDetails();

    // // console.log('filtered file categories: ', this.filteredFileCategories);
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
    // this.fetchAllRecord();
  }

  files: any[] = [];
  deleteFile(index: number) {
    this.files.splice(index, 1);
    this.isUploadEnable = false;
  }

  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
      // this.Com_BulkUpload_popup();
    }
    this.uploadFilesSimulator(0);
  }

  changeFileCategory(fileCategory: any) {
    this.selectedFileCategory = fileCategory;
    // // console.log('selected file category: ', fileCategory);
  }

  reinitialisePageData() {
      this.pageSize = 10;
      this.startIndex = 0;
      this.endIndex = 10;
      this.totalSize = 0;
      this.page = 1
  }

  onFileCategoryChange(event: MatSelectChange) {
    // // console.log('Selected full category object:', event.value);
    this.reinitialisePageData();
    this.selectedFileCategory = event.value;
    this.fetchBulkUploadHistory();
    this.deleteFile(0);
  }

  onFacilitatorFileTypeChange(event) {
    if(this.files.length > 0)
      this.deleteFile(0);
    
    this.reinitialisePageData();
    console.log('change the facilitator category: ', event);
    this.selectedFacilitatorFileType = event;
    this.fetchBulkUploadHistory();
    console.log('selected facilitator category :::: ',this.selectedFacilitatorFileType);
  }

  validFormat: boolean = false;

  validateExcelHeader(fileHeaders: any, fileType: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const file = this.files[0];

      if (!file) {
        console.error('No file selected.');
        this.validFormat = false;
        resolve(false);
        return;
      }

      console.log('-------------> file headers to be match with : ',fileHeaders);

      const fileName = file.name.toLowerCase();
      const expectedHeaders = fileHeaders.map(h => h.trim().toLowerCase());
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = e.target.result;

          if (fileName.endsWith('.csv')) {
            console.log('Attempting CSV parse...');
            const csvData = data;
            const res = alasql('SELECT * FROM CSV(?, {headers:true})', [csvData]);
            console.log('CSV parse result:', res);

            if (Array.isArray(res) && res.length > 0) {
              const actualHeaders = Object.keys(res[0]).map(h =>
                h.trim().replace(/\*$/, '').toLowerCase()
              );
              console.log('Detected headers:', actualHeaders);

              const allHeadersPresent = expectedHeaders.every(expected =>
                actualHeaders.includes(expected)
              );

              this.validFormat = allHeadersPresent;
              if (allHeadersPresent) {
                console.log('CSV file format is valid.');
                resolve(true);
              } else {
                console.error('CSV file format invalid. Missing headers.');
                this.commonService.errorSnackBar('Upload valid file format for '+fileType);
                resolve(false);
              }
            } else {
              console.error('CSV file is empty or could not be parsed.');
              this.commonService.errorSnackBar('Upload valid file format for '+fileType);
              this.validFormat = false;
              resolve(false);
            }

          } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            // console.log('Attempting XLSX parse...');
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            if (!worksheet) {
              console.error('No sheet found in XLSX file.');
              this.commonService.errorSnackBar('XLSX file is empty or cannot read header row.');
              this.validFormat = false;
              resolve(false);
              return;
            }

            const sheetJsonHeader = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: 0,
              blankrows: false
            });

            if (!sheetJsonHeader || sheetJsonHeader.length === 0) {
              console.error('XLSX file is empty or cannot read header row.');
              this.commonService.errorSnackBar('XLSX file is empty or cannot read header row.');
              this.validFormat = false;
              resolve(false);
              return;
            }

            const actualHeadersRaw = sheetJsonHeader[0] as string[];
            if (!actualHeadersRaw || actualHeadersRaw.length === 0) {
              console.error('XLSX file header row is empty.');
              this.commonService.errorSnackBar('XLSX file header row is empty.');
              this.validFormat = false;
              resolve(false);
              return;
            }

            const actualHeaders = actualHeadersRaw.map(h =>
              h.trim().replace(/\*$/, '').toLowerCase()
            );

            // console.log('Detected headers:', actualHeaders);

            const allHeadersPresent = expectedHeaders.every(expected =>
              actualHeaders.includes(expected)
            );

            this.validFormat = allHeadersPresent;
            if (allHeadersPresent) {
              // console.log('XLSX file format is valid.');
              resolve(true);
            } else {
              console.error('XLSX file format invalid. Missing headers.');
              this.commonService.errorSnackBar('Upload valid file format for '+fileType);
              resolve(false);
            }

          } else {
            console.error('Unsupported file type.');
            this.commonService.errorSnackBar('Unsupported file type.');
            this.validFormat = false;
            resolve(false);
          }

        } catch (error) {
          console.error('Error processing file:', error);
          this.commonService.errorSnackBar('Error processing file.');
          this.validFormat = false;
          resolve(false);
        }
      };

      // Trigger the file read
      if (fileName.endsWith('.csv')) {
        reader.readAsText(file);
      } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file);
      } else {
        console.error('Unsupported file type.');
        this.commonService.errorSnackBar('Unsupported file type.');
        this.validFormat = false;
        resolve(false);
      }
    });
  }



  async submit() {
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
        // // console.log("filesss...",this.files[0].type);
        
        let fileHeaders = [];
        let fileType = '';

        if(this.selectedFileCategory?.name === TracxnFileAndTabCategory.FACILITATOR) {
          fileHeaders = this.selectedFacilitatorFileType === 
          TracxnFileAndTabCategory.FACILITATOR_LIST ? this.facilitatorFileCategory[0].fileHeaders : this.facilitatorFileCategory[1].fileHeaders;

          fileType = this.selectedFacilitatorFileType === 
          TracxnFileAndTabCategory.FACILITATOR_LIST ? this.facilitatorFileCategory[0].value : this.facilitatorFileCategory[1].value;
        } else {
          // console.log('selected category: ',this.selectedFileCategory);
          fileHeaders = this.selectedFileCategory?.fileHeaders;
          fileType = this.selectedFileCategory?.value;
        }

        await this.validateExcelHeader(fileHeaders, fileType);

        if(!this.validFormat) {
          return;
        }
        // if (!this.isValidFileFormat()) {
        //   // console.log('not valid file format');
        //   this.isUploadEnable = false;
        //   return;
        // } else {
        //   this.commonService.errorSnackBar('Valid file format.......');
        //   return;
        // }

        formData.append('file', this.files[0]);
      }
    }

    let tracxnFileCategory = '';

    if (
      this.selectedFileCategory.name === TracxnFileAndTabCategory.FACILITATOR
    ) {
      tracxnFileCategory = this.selectedFacilitatorFileType;
    } else {
      tracxnFileCategory = this.selectedFileCategory.name;
    }

    // console.log('tracxn file category ---> ', tracxnFileCategory);
    // // console.log("formdata", formData);
    this.btnDisabled = true;

    this.isLoading = true;
    this.loaderService.subLoaderShow();
    this.msmeService
      .tracxnBulkUpload(formData, tracxnFileCategory, this.userName)
      .subscribe(
        (res) => {
          this.loaderService.subLoaderHide();

          this.isLoading = false;

          //// // console.log("res=========",res);
          if (res.status === 200) {
            this.btnDisabled = false;
            // res.data.forEach(element => {
            // // console.log(res.data);
            this.batchId = res.data.id;
            this.totalEntry = res.data.totalRows;
            this.successfullEntry = res.data.success;
            // this.failEntry = element.invalidEntryCount + element.failedEntryCount
            this.failEntry = res.data.fail;
            this.userName = res.data.userName;
            // });
            this.commonService.successSnackBar('File uploaded successfully');
            this.fetchBulkUploadHistory();
            this.files = [];
            // this.FileUploadStatus_popup();
            // this.commonMethod.pageRefresh();
          } else {
            this.btnDisabled = false;
            this.commonService.errorSnackBar('Error in Uploading file');
            this.files = [];
            // this.commonMethod.pageRefresh();
          }
        },
        (error) => {
          this.loaderService.subLoaderHide();
          this.isLoading = false;
          this.btnDisabled = false;
          this.commonService.errorSnackBar('Error in Uploading file');
          this.files = [];
          // this.commonMethod.pageRefresh();
        }
      );
    return true;
  }

  getFileExtension(filename) {
    // get file extension
    const extension = filename.split('.').pop();
    return extension;
  }

  isSubpageActionAvailable = (action: string): boolean => {
    switch (this.selectedFileCategory?.name) {
      case TracxnFileAndTabCategory.LEADING_INDICATOR:
        return this.commonService.isActionAvailable(
          this.pageData,
          this.consValue.pageMaster.LEADING_IDICATORS,
          this.consValue.PageActions[action]
        );
      case TracxnFileAndTabCategory.INVESTOR:
        return this.commonService.isActionAvailable(
          this.pageData,
          this.consValue.pageMaster.INVESTORS,
          this.consValue.PageActions[action]
        );
      case TracxnFileAndTabCategory.FACILITATOR:
        return this.commonService.isActionAvailable(
          this.pageData,
          this.consValue.pageMaster.FACILITORS,
          this.consValue.PageActions[action]
        );
      default:
        false;
    }
  };

  fetchBulkUploadHistory(
    page?,
    onPageChangeFlag?: boolean,
    approvalStatus?: String
  ): void {
    const data: any = {};
    // console.log(this.pageSize);

    data.size = this.pageSize;

    data.pageIndex = this.page - 1;

    data.tracxnFileCategory = this.selectedFileCategory.name;

    console.log('fetching data....');

    if (
      this.selectedFileCategory.name === TracxnFileAndTabCategory.FACILITATOR
    ) {
      data.tracxnFileCategory = this.selectedFacilitatorFileType;
    }

    this.isLoading = true;
    this.loaderService.subLoaderShow();
    this.msmeService.getTracxnUploadedFileData(data).subscribe(
      (res: any) => {
        this.loaderService.subLoaderHide();
        this.isLoading = false;
        // tslint:disable-next-line:triple-equals
        // console.log('response ', res);
        if (res && res.status == 200) {
          if (res.data != null) {
            // this.counts = res.data;
            this.totalSize = res?.data[0]?.totalData;
          }

          this.bulkUploadHistory = res.data;
          // console.log('========>');

          // //// console.log("Bulkuplod  list is : ");
          // //// console.log(this.bulkUploadHistory)
        } else {
          // tslint:disable-next-line:no-unused-expression
          this.bulkUploadHistory = [];
          console.error;
          this.commonService.warningSnackBar(res.message);
        }
      },
      (err) => {
        this.commonService.errorSnackBar(err);
      }
    );
  }

  isUploadEnable: boolean = false;

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index]) {
            if (this.files[index].progress === 100) {
              clearInterval(progressInterval);
              this.uploadFilesSimulator(index + 1);
              this.isUploadEnable = true;
            } else {
              this.files[index].progress += 5;
            }
          }
        }, 200);
      }
    }, 1000);
  }

  getData(type, batchId) {
    if (type === 1) {
      GlobalHeaders['x-page-action'] = 'Donwload Success file';
    }
    if (type === 2) {
      GlobalHeaders['x-page-action'] = 'Donwload fail file';
    }
    if (type === 3) {
      GlobalHeaders['x-page-action'] = 'Donwload All file';
    }
    // console.log('<===========================>');
    let createMasterJson: any = {};
    createMasterJson['mstId'] = batchId;
    createMasterJson['tracxnFileCategory'] = this.selectedFileCategory.name;

    if (
      this.selectedFileCategory.name === TracxnFileAndTabCategory.FACILITATOR
    ) {
      createMasterJson['tracxnFileCategory'] = this.selectedFacilitatorFileType;
    }

    // createMasterJson.tableType = 'Tracxn-Lending-Indicators';
    this.commonService.successSnackBar(
      'Your file is being prepared. The download will begin shortly…'
    );

    if (type == 1) {
      createMasterJson.isFailed = false;
      createMasterJson.isSuccess = true;
    } else if (type == 2) {
      createMasterJson.isFailed = true;
      createMasterJson.isSuccess = false;
    }

    if (
      this.selectedFileCategory.name ===
      TracxnFileAndTabCategory.LEADING_INDICATOR
    ) {
      // console.log('leading indicator excel downloading: ', createMasterJson);
      this.msmeService.getTracxnExcelData(createMasterJson).subscribe(
        (res) => {
          if (res.status == 200) {
            // console.log('investor data :::::: ', res.data);
            this.downloadDataInExcel(res.data, 2, type);
          }
        },
        (error) => {
          this.commonService.errorSnackBar('Error in Downloading InValid data');
        }
      );
    } else if (
      this.selectedFileCategory.name === TracxnFileAndTabCategory.INVESTOR
    ) {
      // console.log('investor json ::::', createMasterJson);
      this.msmeService.getTracxnExcelData(createMasterJson).subscribe(
        (res) => {
          if (res.status == 200) {
            // console.log('investor data :::::: ', res.data);
            this.downloadInvestorDataInExcel(res.data, 2, type);
          }
        },
        (error) => {
          this.commonService.errorSnackBar('Error in Downloading InValid data');
        }
      );
    } else if (
      this.selectedFileCategory.name === TracxnFileAndTabCategory.FACILITATOR
    ) {
      // console.log('---- insdie the facilitator ----');

      if (
        this.selectedFacilitatorFileType ===
        TracxnFileAndTabCategory.FACILITATOR_LIST
      ) {
        // console.log('---- insdie the facilitator list ----');

        this.msmeService.getTracxnExcelData(createMasterJson).subscribe(
          (res) => {
            if (res.status == 200) {
              // console.log('resp data :::::: ', res.data);
              this.downloadFacilitatorsListDataInExcel(res.data, 2, type);
            }
          },
          (error) => {
            this.commonService.errorSnackBar(
              'Error in Downloading InValid data'
            );
          }
        );
      }

      if (
        this.selectedFacilitatorFileType ===
        TracxnFileAndTabCategory.FACILITATOR_DEALS
      ) {
        // console.log('---- insdie the facilitator deals ----');

        this.msmeService.getTracxnExcelData(createMasterJson).subscribe(
          (res) => {
            if (res.status == 200) {
              this.downloadFacilitatorDealsDataInExcel(res.data, 2, type);
            }
          },
          (error) => {
            this.commonService.errorSnackBar(
              'Error in Downloading InValid data'
            );
          }
        );
      }
    }
  }

  // // create a form
  // createBulkUploadForm(bulkUploadDetails) {
  //   this.bulkUploadDetailsForm = this.formBuilder.group({
  //     fileUpload: new UntypedFormControl(
  //       bulkUploadDetails?.fileUpload ? bulkUploadDetails.fileUpload : '',
  //       [Validators.required]
  //     ),
  //     // fileUpload: []
  //   });
  // }

  downloadInvestorDataInExcel(excelData: any[], type: number, reqType: number) {
    // console.log('excel data in investor: ', excelData);

    let downloadData = [];
    const fileExtension = type === 1 ? '.xls' : '.xlsx';
    let fileName = '';

    const baseFileName =
      reqType === 1
        ? 'Successful_Investor_Entries_'
        : reqType === 2
        ? 'Failed_Investor_Entries_'
        : 'Total_Investor_Entries_';

    fileName = baseFileName + new Date().toDateString() + fileExtension;

    excelData.forEach((element, i) => {
      const index = i + 1;
      const row = {
        Sr_no: index,
        'Investor Name': element.investorName || '-',
        'Investor Domain': element.investorDomain || '-',
        'Investor Type 1': element.investorType1 || '-',
        'Investor Type 2': element.investorType2 || '-',
        'Investor Type 3': element.investorType3 || '-',
        'Investor Type 4': element.investorType4 || '-',
        'Investor Type 5': element.investorType5 || '-',
        'Investor Type 6': element.investorType6 || '-',
      };

      if(reqType !== 1) {
        row['Failure Reason'] = element.failureReason
            ? element.failureReason
            : '-'
      }

      downloadData.push(row);
    });

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [
      downloadData,
    ]);
  }

  downloadFacilitatorsListDataInExcel(
    excelData: any[],
    type: number,
    reqType: number
  ) {
    // console.log('excel data in facilitators: ', excelData);

    const downloadData = [];
    const fileExtension = type === 1 ? '.xls' : '.xlsx';
    let fileName = '';

    const baseFileName =
      reqType === 1
        ? 'Successful_Facilitator_Entries_'
        : reqType === 2
        ? 'Failed_Facilitator_Entries_'
        : 'Total_Facilitator_Entries_';

    fileName = baseFileName + new Date().toDateString() + fileExtension;

    excelData.forEach((element, i) => {
      const index = i + 1;
      const row = {
        Sr_no: index,
        'Firm ID': element.firmId || '-',
        Advisor: element.advisor || '-',
        Type: element.type || '-',
        'Cleaned Domain': element.cleanedDomain || '-',
      };

      if(reqType !== 1) {
        row['Failure Reason'] = element.failureReason
            ? element.failureReason
            : '-'
      }

      downloadData.push(row);
    });

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [
      downloadData,
    ]);
  }

  downloadFacilitatorDealsDataInExcel(
    excelData: any[],
    type: number,
    reqType: number
  ) {
    // console.log('excel data in facilitator deals: ', excelData);

    const downloadData = [];
    const fileExtension = type === 1 ? '.xls' : '.xlsx';
    let fileName = '';

    const baseFileName =
      reqType === 1
        ? 'Successful_Facilitator_Deals_Entries_'
        : reqType === 2
        ? 'Failed_Facilitator_Deals_Entries_'
        : 'Total_Facilitator_Deals_Entries_';

    fileName = baseFileName + new Date().toDateString() + fileExtension;

    excelData.forEach((element, i) => {
      const index = i + 1;
      const row = {
        Sr_no: index,
        'Portfolio Company Domain': element.portfolioCompanyDomain || '-',
        'Financial Advisory': element.financialAdvisory || '-',
        'Financial Advisory Domain': element.financialAdvisoryDomain || '-',
        Legal: element.legal || '-',
        'Legal Domain': element.legalDomain || '-',
      };

      if(reqType !== 1) {
        row['Failure Reason'] = element.failureReason
            ? element.failureReason
            : '-'
      }

      downloadData.push(row);
    });

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [
      downloadData,
    ]);
  }

  downloadDataInExcel(excelData: any, type, reqType) {
    //  console.log('excel data will be donwload for leading indecators: ',excelData);

    let downloadData = [];
    const fileExtension = type === 1 ? '.xls' : '.xlsx';
    let fileName = '';

    const baseFileName =
      reqType === 1
        ? 'Successful_Leading_Indicator_Entries_'
        : reqType === 2
        ? 'Failed_Leading_Indicator_Entries_'
        : 'Total_Leading_Indicator_Entries_';

    fileName = baseFileName + new Date().toDateString() + fileExtension;

      excelData.forEach((element, i) => {
        const index = i + 1;
        var allApplications = [];
        let row = {
            Sr_no: index,
            'Date of Indicators': element.dateOfIndicator
              ? element.dateOfIndicator
              : '-',
            'Domain Name of the Company': element.companyDomainName
              ? element.companyDomainName
              : '-',
            City: element.city ? element.city : '-',
            'Type of Indicator': element.indicatorType
              ? element.indicatorType
              : '-',
            'Indicator Description': element.indicatorDescription
              ? element.indicatorDescription
              : '-',
            'Link for more details': element.linkForMoreDetails
              ? element.linkForMoreDetails
              : '-',
        }
        
        if(reqType !== 1) {
          row['Failure Reason'] = element.failureReason
              ? element.failureReason
              : '-'
        }

        allApplications.push(row);
        downloadData = downloadData.concat(allApplications);
      });
   

    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [
      downloadData,
    ]);
  }

  isActionAvail(actionId: string): boolean {
    for (const page of this.pageData?.actions) {
      if (page?.actionId === actionId) {
        return true; // Return true if found
      }
    }

    return false; // Return false if not found
  }

  isDownloading = false;

  downloadExcel(byteData: string, fileName: string) {
    const blob = this.base64toBlob(
      byteData,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
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
    this.userName = this.commonService.getStorage(
      Constants.httpAndCookies.USER_NAME,
      true
    );
  }

  isDownloadingTracxnLendingIndicators = false;
}
