import {Component, OnInit} from '@angular/core';
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
import {
  HrmsBulkUploadSuccessComponent
} from "../../../../Popup/HSBC/hrms-bulk-upload-success/hrms-bulk-upload-success.component";
import {GlobalHeaders, resetGlobalHeaders} from "../../../../CommoUtils/global-headers";

@Component({
  selector: 'app-hrms-bulk-upload',
  templateUrl: './hrms-bulk-upload.component.html',
  styleUrl: './hrms-bulk-upload.component.scss'
})
export class HrmsBulkUploadComponent implements OnInit {
  // tslint:disable-next-line:max-line-length
  constructor(public dialog: MatDialog, private modalService: NgbModal, private msmeService: MsmeService, private commonService: CommonService,
              private formBuilder: UntypedFormBuilder, private commonMethod: CommonMethods, private http: HttpClient) { }


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

  ngOnInit(): void {
    this.constants = Constants;
    this.pageData = history.state.data;
    if(!this.pageData || this.pageData === 'undefined'){
      this.pageData  = this.commonService.getPageData(Constants.pageMaster.BULK_UPLOAD,Constants.pageMaster.HRMS_DATA)
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

    this.msmeService.getCustUploadedFileData(data).subscribe((res: any) => {
      // tslint:disable-next-line:triple-equals
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
        if (extension != 'csv' && extension != 'xls' && extension != 'xlsx') {
          this.commonService.errorSnackBar('File format of the upload should be csv or xls or xlsx');
          return;
        }
        formData.append('file', this.files[0]);
      }
    }

    // console.log("formdata", formData);
    this.btnDisabled = true;
    this.msmeService.hrmsBulkUpload(formData,this.userName).subscribe(res => {
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
        this.FileUploadStatus_popup();
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
    const dialogRef = this.dialog.open(HrmsBulkUploadSuccessComponent, {
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

  getData(type, batchId) {
    if ( type === 1 ){ GlobalHeaders['x-page-action'] = 'Donwload Success file'; }
    if ( type === 2 ){ GlobalHeaders['x-page-action'] = 'Donwload fail file'; }
    if ( type === 3 ){ GlobalHeaders['x-page-action'] = 'Donwload All file'; }
    if ( type === 4 ){ GlobalHeaders['x-page-action'] = 'Donwload Inactive User file'; }
    console.log(type);
    const createMasterJson: any = {};
    createMasterJson.mstId = batchId;
    createMasterJson.tableType = 'HRMS';
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    if (type == 1) {
      createMasterJson.isFailed = false;
      this.msmeService.getEximData(createMasterJson).subscribe((res: any) => {
        console.log('res=========', res.data);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading validData');
      });
    } else if (type == 2) {
      createMasterJson.isFailed = true;
      this.msmeService.getEximData(createMasterJson).subscribe(res => {
        //// console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading InValid data');
      });
    } else if (type == 3) {
      this.msmeService.getEximData(createMasterJson).subscribe(res => {
        //// console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading Total Data');
      });
    }else if (type == 4) {
      createMasterJson.isInActive = true;
      this.msmeService.getEximData(createMasterJson).subscribe(res => {
        console.log("res=========",res);
        if (res.status == 200) {
          this.downloadDataInExcel(res.data, 2, type);
        }
      }, error => {
        this.commonService.errorSnackBar('Error in Downloading Total Data');
      });

    }
  }

  downloadDataInExcel(excelData, type, reqType) {
    let downloadData = [];
    const a = type === 1 ? '.xls' : '.xlsx';
    let fileName = '';
    if (reqType === 1) {
      fileName = 'Successful_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        let allApplications = null;
        allApplications = [{
          'Employee ID': element.employeeId ? element.employeeId : '-',
          'Employee Name': element.employeeName ? element.employeeName : '-',
          'Employee Business Email Address': element.employeeBusinessEmailAddress ? element.employeeBusinessEmailAddress : '-',
          'Employee Preferred First Name': element.employeePreferredFirstName ? element.employeePreferredFirstName : '-',
          'Global Career Band': element.globalCareerBand ? element.globalCareerBand : '-',
          'Employee FTE': element.employeeFte ? element.employeeFte : '-',
          'Employment Type': element.employmentType ? element.employmentType : '-',
          'Employee Status': element.employeeStatus ? element.employeeStatus : '-',
          'Employee Class': element.employeeClass ? element.employeeClass : '-',
          'Last Hire Date': element.lastHireDate ? element.lastHireDate : '-',
          'Latest Hire Date': element.latestHireDate ? element.latestHireDate : '-',
          'Tenure in Service (Years)': element.tenureInServiceYears ? element.tenureInServiceYears : '-',
          'Original Hire Date': element.originalHireDate ? element.originalHireDate : '-',
          'Assignment Start Date': element.assignmentStartDate ? element.assignmentStartDate : '-',
          'Tenure in Organisation (Years)': element.tenureInOrganisationYears ? element.tenureInOrganisationYears : '-',
          'Tenure in GCB (Years)': element.tenureInGcbYears ? element.tenureInGcbYears : '-',
          'Tenure in Position (Years)': element.tenureInPositionYears ? element.tenureInPositionYears : '-',
          'Local Secondment': element.localSecondment ? element.localSecondment : '-',
          'Expected Local Secondment End Date': element.expectedLocalSecondmentEndDate ? element.expectedLocalSecondmentEndDate : '-',
          'Fixed Term Contract Start Date': element.fixedTermContractStartDate ? element.fixedTermContractStartDate : '-',
          'Fixed Term Contract End Date': element.fixedTermContractEndDate ? element.fixedTermContractEndDate : '-',
          'BF Level 1 ID': element.bfLevel1Id ? element.bfLevel1Id : '-',
          'BF Level 1 Name': element.bfLevel1Name ? element.bfLevel1Name : '-',
          'BF Level 2 ID': element.bfLevel2Id ? element.bfLevel2Id : '-',
          'BF Level 2 Name': element.bfLevel2Name ? element.bfLevel2Name : '-',
          'BF Level 3 ID': element.bfLevel3Id ? element.bfLevel3Id : '-',
          'BF Level 3 Name': element.bfLevel3Name ? element.bfLevel3Name : '-',
          'BF Level 4 ID': element.bfLevel4Id ? element.bfLevel4Id : '-',
          'BF Level 4 Name': element.bfLevel4Name ? element.bfLevel4Name : '-',
          'BF Level 5 ID': element.bfLevel5Id ? element.bfLevel5Id : '-',
          'BF Level 5 Name': element.bfLevel5Name ? element.bfLevel5Name : '-',
          'Finance Cost Centre': element.financeCostCentre ? element.financeCostCentre : '-',
          'Legal Entity Name': element.legalEntityName ? element.legalEntityName : '-',
          'Department Code': element.departmentCode ? element.departmentCode : '-',
          'Department Name': element.departmentName ? element.departmentName : '-',
          'Branch': element.branch ? element.branch : '-',
          'Sub Branch': element.subBranch ? element.subBranch : '-',
          'Global Workstyle': element.globalWorkstyle ? element.globalWorkstyle : '-',
          'Workstyle Detail': element.workstyleDetail ? element.workstyleDetail : '-',
          'Finance Managed Entity Level 1': element.financeManagedEntityLevel1 ? element.financeManagedEntityLevel1 : '-',
          'Company Code': element.companyCode ? element.companyCode : '-',
          'Company Name': element.companyName ? element.companyName : '-',
          'Work Location Name': element.workLocationName ? element.workLocationName : '-',
          'Work Location Code': element.workLocationCode ? element.workLocationCode : '-',
          'Work Location Building': element.workLocationBuilding ? element.workLocationBuilding : '-',
          'Work Location City': element.workLocationCity ? element.workLocationCity : '-',
          'Work Location Country/Territory Name': element.workLocationCountryTerritoryName ? element.workLocationCountryTerritoryName : '-',
          'Work Location Region Name': element.workLocationRegionName ? element.workLocationRegionName : '-',
          'Home Worker': element.homeWorker ? element.homeWorker : '-',
          'Job Code': element.jobCode ? element.jobCode : '-',
          'Job Family': element.jobFamily ? element.jobFamily : '-',
          'Job Sub Family': element.jobSubFamily ? element.jobSubFamily : '-',
          'Job Category': element.jobCategory ? element.jobCategory : '-',
          'Job Vetting Status': element.jobVettingStatus ? element.jobVettingStatus : '-',
          'Enhanced Vetting Reason': element.enhancedVettingReason ? element.enhancedVettingReason : '-',
          'Position Number': element.positionNumber ? element.positionNumber : '-',
          'Workforce Plan ID': element.workforcePlanId ? element.workforcePlanId : '-',
          'Position Class': element.positionClass ? element.positionClass : '-',
          'Position Title': element.positionTitle ? element.positionTitle : '-',
          'Position Learning Financial Crime Risk Rating': element.positionLearningFinancialCrimeRiskRating ? element.positionLearningFinancialCrimeRiskRating : '-',
          'Entity Manager Employee ID': element.entityManagerEmployeeId ? element.entityManagerEmployeeId : '-',
          'Entity Manager Employee Name': element.entityManagerEmployeeName ? element.entityManagerEmployeeName : '-',
          'Functional Manager Employee ID': element.functionalManagerEmployeeId ? element.functionalManagerEmployeeId : '-',
          'Functional Manager Employee Name': element.functionalManagerEmployeeName ? element.functionalManagerEmployeeName : '-',
          'Employee Alternate Language 1 Middle Name': element.employeeAlternateLanguage1MiddleName ? element.employeeAlternateLanguage1MiddleName : '-',
          'Employee Alternate Language 1 First Name': element.employeeAlternateLanguage1FirstName ? element.employeeAlternateLanguage1FirstName : '-',
          'Employee Alternate Language 1 Last Name': element.employeeAlternateLanguage1LastName ? element.employeeAlternateLanguage1LastName : '-',
          'Total Workforce Headcount Flag': element.totalWorkforceHeadcountFlag ? element.totalWorkforceHeadcountFlag : '-',
          'Employee Type': element.employeeType ? element.employeeType : '-',
          'Hire Date': element.hireDate ? element.hireDate : '-',
          'Cost Center': element.costCenter ? element.costCenter : '-',
          'Company': element.company ? element.company : '-',
          'Department': element.department ? element.department : '-',
          'Job': element.job ? element.job : '-',
          'Finance Managed Entity Level 2': element.financeManagedEntityLevel2 ? element.financeManagedEntityLevel2 : '-',
          'Finance Managed Geography Level 1': element.financeManagedGeographyLevel1 ? element.financeManagedGeographyLevel1 : '-',
          'Finance Managed Geography Level 2': element.financeManagedGeographyLevel2 ? element.financeManagedGeographyLevel2 : '-',
          'Position Vetting Status': element.positionVettingStatus ? element.positionVettingStatus : '-',
          'Contract Type': element.contractType ? element.contractType : '-',
          'Regulatory Local Job Title': element.regulatoryLocalJobTitle ? element.regulatoryLocalJobTitle : '-',
          'Category Code': element.categoryCode ? element.categoryCode : '-',
          'Local Job Title': element.localJobTitle ? element.localJobTitle : '-',
          'CBO Title': element.cboTitle ? element.cboTitle : '-',
          'Employee Category': element.employeeCategory ? element.employeeCategory : '-',
          'Date Vetting Completed': element.dateVettingCompleted ? element.dateVettingCompleted : '-',
          'Date Next Vetting Check Due': element.dateNextVettingCheckDue ? element.dateNextVettingCheckDue : '-',
          'Non Financial Risk Role': element.nonFinancialRiskRole ? element.nonFinancialRiskRole : '-',
          'Division': element.division ? element.division : '-',
          'Division Code': element.divisionCode ? element.divisionCode : '-',
          'Division Name': element.divisionName ? element.divisionName : '-',
          'Subdivision': element.subdivision ? element.subdivision : '-',
          'Subdivision Code': element.subdivisionCode ? element.subdivisionCode : '-',
          'Subdivision Name': element.subdivisionName ? element.subdivisionName : '-',
          'User ID': element.userId ? element.userId : '-',
          'Career Link Opt-In': element.careerLinkOptIn ? element.careerLinkOptIn : '-',
          'Establishment ID': element.establishmentId ? element.establishmentId : '-',
          'Is Union Employee': element.isUnionEmployee ? element.isUnionEmployee : '-',
          'Total Rows': element.totalRows ? element.totalRows : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType === 2) {
      fileName = 'Failed_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        let allApplications = null;
        allApplications = [{
          'Employee ID': element.employeeId ? element.employeeId : '-',
          'Employee Name': element.employeeName ? element.employeeName : '-',
          'Employee Business Email Address': element.employeeBusinessEmailAddress ? element.employeeBusinessEmailAddress : '-',
          'Employee Preferred First Name': element.employeePreferredFirstName ? element.employeePreferredFirstName : '-',
          'Global Career Band': element.globalCareerBand ? element.globalCareerBand : '-',
          'Employee FTE': element.employeeFte ? element.employeeFte : '-',
          'Employment Type': element.employmentType ? element.employmentType : '-',
          'Employee Status': element.employeeStatus ? element.employeeStatus : '-',
          'Employee Class': element.employeeClass ? element.employeeClass : '-',
          'Last Hire Date': element.lastHireDate ? element.lastHireDate : '-',
          'Latest Hire Date': element.latestHireDate ? element.latestHireDate : '-',
          'Tenure in Service (Years)': element.tenureInServiceYears ? element.tenureInServiceYears : '-',
          'Original Hire Date': element.originalHireDate ? element.originalHireDate : '-',
          'Assignment Start Date': element.assignmentStartDate ? element.assignmentStartDate : '-',
          'Tenure in Organisation (Years)': element.tenureInOrganisationYears ? element.tenureInOrganisationYears : '-',
          'Tenure in GCB (Years)': element.tenureInGcbYears ? element.tenureInGcbYears : '-',
          'Tenure in Position (Years)': element.tenureInPositionYears ? element.tenureInPositionYears : '-',
          'Local Secondment': element.localSecondment ? element.localSecondment : '-',
          'Expected Local Secondment End Date': element.expectedLocalSecondmentEndDate ? element.expectedLocalSecondmentEndDate : '-',
          'Fixed Term Contract Start Date': element.fixedTermContractStartDate ? element.fixedTermContractStartDate : '-',
          'Fixed Term Contract End Date': element.fixedTermContractEndDate ? element.fixedTermContractEndDate : '-',
          'BF Level 1 ID': element.bfLevel1Id ? element.bfLevel1Id : '-',
          'BF Level 1 Name': element.bfLevel1Name ? element.bfLevel1Name : '-',
          'BF Level 2 ID': element.bfLevel2Id ? element.bfLevel2Id : '-',
          'BF Level 2 Name': element.bfLevel2Name ? element.bfLevel2Name : '-',
          'BF Level 3 ID': element.bfLevel3Id ? element.bfLevel3Id : '-',
          'BF Level 3 Name': element.bfLevel3Name ? element.bfLevel3Name : '-',
          'BF Level 4 ID': element.bfLevel4Id ? element.bfLevel4Id : '-',
          'BF Level 4 Name': element.bfLevel4Name ? element.bfLevel4Name : '-',
          'BF Level 5 ID': element.bfLevel5Id ? element.bfLevel5Id : '-',
          'BF Level 5 Name': element.bfLevel5Name ? element.bfLevel5Name : '-',
          'Finance Cost Centre': element.financeCostCentre ? element.financeCostCentre : '-',
          'Legal Entity Name': element.legalEntityName ? element.legalEntityName : '-',
          'Department Code': element.departmentCode ? element.departmentCode : '-',
          'Department Name': element.departmentName ? element.departmentName : '-',
          'Branch': element.branch ? element.branch : '-',
          'Sub Branch': element.subBranch ? element.subBranch : '-',
          'Global Workstyle': element.globalWorkstyle ? element.globalWorkstyle : '-',
          'Workstyle Detail': element.workstyleDetail ? element.workstyleDetail : '-',
          'Finance Managed Entity Level 1': element.financeManagedEntityLevel1 ? element.financeManagedEntityLevel1 : '-',
          'Company Code': element.companyCode ? element.companyCode : '-',
          'Company Name': element.companyName ? element.companyName : '-',
          'Work Location Name': element.workLocationName ? element.workLocationName : '-',
          'Work Location Code': element.workLocationCode ? element.workLocationCode : '-',
          'Work Location Building': element.workLocationBuilding ? element.workLocationBuilding : '-',
          'Work Location City': element.workLocationCity ? element.workLocationCity : '-',
          'Work Location Country/Territory Name': element.workLocationCountryTerritoryName ? element.workLocationCountryTerritoryName : '-',
          'Work Location Region Name': element.workLocationRegionName ? element.workLocationRegionName : '-',
          'Home Worker': element.homeWorker ? element.homeWorker : '-',
          'Job Code': element.jobCode ? element.jobCode : '-',
          'Job Family': element.jobFamily ? element.jobFamily : '-',
          'Job Sub Family': element.jobSubFamily ? element.jobSubFamily : '-',
          'Job Category': element.jobCategory ? element.jobCategory : '-',
          'Job Vetting Status': element.jobVettingStatus ? element.jobVettingStatus : '-',
          'Enhanced Vetting Reason': element.enhancedVettingReason ? element.enhancedVettingReason : '-',
          'Position Number': element.positionNumber ? element.positionNumber : '-',
          'Workforce Plan ID': element.workforcePlanId ? element.workforcePlanId : '-',
          'Position Class': element.positionClass ? element.positionClass : '-',
          'Position Title': element.positionTitle ? element.positionTitle : '-',
          'Position Learning Financial Crime Risk Rating': element.positionLearningFinancialCrimeRiskRating ? element.positionLearningFinancialCrimeRiskRating : '-',
          'Entity Manager Employee ID': element.entityManagerEmployeeId ? element.entityManagerEmployeeId : '-',
          'Entity Manager Employee Name': element.entityManagerEmployeeName ? element.entityManagerEmployeeName : '-',
          'Functional Manager Employee ID': element.functionalManagerEmployeeId ? element.functionalManagerEmployeeId : '-',
          'Functional Manager Employee Name': element.functionalManagerEmployeeName ? element.functionalManagerEmployeeName : '-',
          'Employee Alternate Language 1 Middle Name': element.employeeAlternateLanguage1MiddleName ? element.employeeAlternateLanguage1MiddleName : '-',
          'Employee Alternate Language 1 First Name': element.employeeAlternateLanguage1FirstName ? element.employeeAlternateLanguage1FirstName : '-',
          'Employee Alternate Language 1 Last Name': element.employeeAlternateLanguage1LastName ? element.employeeAlternateLanguage1LastName : '-',
          'Total Workforce Headcount Flag': element.totalWorkforceHeadcountFlag ? element.totalWorkforceHeadcountFlag : '-',
          'Employee Type': element.employeeType ? element.employeeType : '-',
          'Hire Date': element.hireDate ? element.hireDate : '-',
          'Cost Center': element.costCenter ? element.costCenter : '-',
          'Company': element.company ? element.company : '-',
          'Department': element.department ? element.department : '-',
          'Job': element.job ? element.job : '-',
          'Finance Managed Entity Level 2': element.financeManagedEntityLevel2 ? element.financeManagedEntityLevel2 : '-',
          'Finance Managed Geography Level 1': element.financeManagedGeographyLevel1 ? element.financeManagedGeographyLevel1 : '-',
          'Finance Managed Geography Level 2': element.financeManagedGeographyLevel2 ? element.financeManagedGeographyLevel2 : '-',
          'Position Vetting Status': element.positionVettingStatus ? element.positionVettingStatus : '-',
          'Contract Type': element.contractType ? element.contractType : '-',
          'Regulatory Local Job Title': element.regulatoryLocalJobTitle ? element.regulatoryLocalJobTitle : '-',
          'Category Code': element.categoryCode ? element.categoryCode : '-',
          'Local Job Title': element.localJobTitle ? element.localJobTitle : '-',
          'CBO Title': element.cboTitle ? element.cboTitle : '-',
          'Employee Category': element.employeeCategory ? element.employeeCategory : '-',
          'Date Vetting Completed': element.dateVettingCompleted ? element.dateVettingCompleted : '-',
          'Date Next Vetting Check Due': element.dateNextVettingCheckDue ? element.dateNextVettingCheckDue : '-',
          'Non Financial Risk Role': element.nonFinancialRiskRole ? element.nonFinancialRiskRole : '-',
          'Division': element.division ? element.division : '-',
          'Division Code': element.divisionCode ? element.divisionCode : '-',
          'Division Name': element.divisionName ? element.divisionName : '-',
          'Subdivision': element.subdivision ? element.subdivision : '-',
          'Subdivision Code': element.subdivisionCode ? element.subdivisionCode : '-',
          'Subdivision Name': element.subdivisionName ? element.subdivisionName : '-',
          'User ID': element.userId ? element.userId : '-',
          'Career Link Opt-In': element.careerLinkOptIn ? element.careerLinkOptIn : '-',
          'Establishment ID': element.establishmentId ? element.establishmentId : '-',
          'Is Union Employee': element.isUnionEmployee ? element.isUnionEmployee : '-',
          'Total Rows': element.totalRows ? element.totalRows : '-',
          'Failure Reason': element.failureReason ? element.failureReason : '-'

        }];
        downloadData = downloadData.concat(allApplications);
      });
    } else if (reqType === 3) {
      fileName = 'Total_Entries_' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        let allApplications = null;
        allApplications = [{
          'Employee ID': element.employeeId ? element.employeeId : '-',
          'Employee Name': element.employeeName ? element.employeeName : '-',
          'Employee Business Email Address': element.employeeBusinessEmailAddress ? element.employeeBusinessEmailAddress : '-',
          'Employee Preferred First Name': element.employeePreferredFirstName ? element.employeePreferredFirstName : '-',
          'Global Career Band': element.globalCareerBand ? element.globalCareerBand : '-',
          'Employee FTE': element.employeeFte ? element.employeeFte : '-',
          'Employment Type': element.employmentType ? element.employmentType : '-',
          'Employee Status': element.employeeStatus ? element.employeeStatus : '-',
          'Employee Class': element.employeeClass ? element.employeeClass : '-',
          'Last Hire Date': element.lastHireDate ? element.lastHireDate : '-',
          'Latest Hire Date': element.latestHireDate ? element.latestHireDate : '-',
          'Tenure in Service (Years)': element.tenureInServiceYears ? element.tenureInServiceYears : '-',
          'Original Hire Date': element.originalHireDate ? element.originalHireDate : '-',
          'Assignment Start Date': element.assignmentStartDate ? element.assignmentStartDate : '-',
          'Tenure in Organisation (Years)': element.tenureInOrganisationYears ? element.tenureInOrganisationYears : '-',
          'Tenure in GCB (Years)': element.tenureInGcbYears ? element.tenureInGcbYears : '-',
          'Tenure in Position (Years)': element.tenureInPositionYears ? element.tenureInPositionYears : '-',
          'Local Secondment': element.localSecondment ? element.localSecondment : '-',
          'Expected Local Secondment End Date': element.expectedLocalSecondmentEndDate ? element.expectedLocalSecondmentEndDate : '-',
          'Fixed Term Contract Start Date': element.fixedTermContractStartDate ? element.fixedTermContractStartDate : '-',
          'Fixed Term Contract End Date': element.fixedTermContractEndDate ? element.fixedTermContractEndDate : '-',
          'BF Level 1 ID': element.bfLevel1Id ? element.bfLevel1Id : '-',
          'BF Level 1 Name': element.bfLevel1Name ? element.bfLevel1Name : '-',
          'BF Level 2 ID': element.bfLevel2Id ? element.bfLevel2Id : '-',
          'BF Level 2 Name': element.bfLevel2Name ? element.bfLevel2Name : '-',
          'BF Level 3 ID': element.bfLevel3Id ? element.bfLevel3Id : '-',
          'BF Level 3 Name': element.bfLevel3Name ? element.bfLevel3Name : '-',
          'BF Level 4 ID': element.bfLevel4Id ? element.bfLevel4Id : '-',
          'BF Level 4 Name': element.bfLevel4Name ? element.bfLevel4Name : '-',
          'BF Level 5 ID': element.bfLevel5Id ? element.bfLevel5Id : '-',
          'BF Level 5 Name': element.bfLevel5Name ? element.bfLevel5Name : '-',
          'Finance Cost Centre': element.financeCostCentre ? element.financeCostCentre : '-',
          'Legal Entity Name': element.legalEntityName ? element.legalEntityName : '-',
          'Department Code': element.departmentCode ? element.departmentCode : '-',
          'Department Name': element.departmentName ? element.departmentName : '-',
          'Branch': element.branch ? element.branch : '-',
          'Sub Branch': element.subBranch ? element.subBranch : '-',
          'Global Workstyle': element.globalWorkstyle ? element.globalWorkstyle : '-',
          'Workstyle Detail': element.workstyleDetail ? element.workstyleDetail : '-',
          'Finance Managed Entity Level 1': element.financeManagedEntityLevel1 ? element.financeManagedEntityLevel1 : '-',
          'Company Code': element.companyCode ? element.companyCode : '-',
          'Company Name': element.companyName ? element.companyName : '-',
          'Work Location Name': element.workLocationName ? element.workLocationName : '-',
          'Work Location Code': element.workLocationCode ? element.workLocationCode : '-',
          'Work Location Building': element.workLocationBuilding ? element.workLocationBuilding : '-',
          'Work Location City': element.workLocationCity ? element.workLocationCity : '-',
          'Work Location Country/Territory Name': element.workLocationCountryTerritoryName ? element.workLocationCountryTerritoryName : '-',
          'Work Location Region Name': element.workLocationRegionName ? element.workLocationRegionName : '-',
          'Home Worker': element.homeWorker ? element.homeWorker : '-',
          'Job Code': element.jobCode ? element.jobCode : '-',
          'Job Family': element.jobFamily ? element.jobFamily : '-',
          'Job Sub Family': element.jobSubFamily ? element.jobSubFamily : '-',
          'Job Category': element.jobCategory ? element.jobCategory : '-',
          'Job Vetting Status': element.jobVettingStatus ? element.jobVettingStatus : '-',
          'Enhanced Vetting Reason': element.enhancedVettingReason ? element.enhancedVettingReason : '-',
          'Position Number': element.positionNumber ? element.positionNumber : '-',
          'Workforce Plan ID': element.workforcePlanId ? element.workforcePlanId : '-',
          'Position Class': element.positionClass ? element.positionClass : '-',
          'Position Title': element.positionTitle ? element.positionTitle : '-',
          'Position Learning Financial Crime Risk Rating': element.positionLearningFinancialCrimeRiskRating ? element.positionLearningFinancialCrimeRiskRating : '-',
          'Entity Manager Employee ID': element.entityManagerEmployeeId ? element.entityManagerEmployeeId : '-',
          'Entity Manager Employee Name': element.entityManagerEmployeeName ? element.entityManagerEmployeeName : '-',
          'Functional Manager Employee ID': element.functionalManagerEmployeeId ? element.functionalManagerEmployeeId : '-',
          'Functional Manager Employee Name': element.functionalManagerEmployeeName ? element.functionalManagerEmployeeName : '-',
          'Employee Alternate Language 1 Middle Name': element.employeeAlternateLanguage1MiddleName ? element.employeeAlternateLanguage1MiddleName : '-',
          'Employee Alternate Language 1 First Name': element.employeeAlternateLanguage1FirstName ? element.employeeAlternateLanguage1FirstName : '-',
          'Employee Alternate Language 1 Last Name': element.employeeAlternateLanguage1LastName ? element.employeeAlternateLanguage1LastName : '-',
          'Total Workforce Headcount Flag': element.totalWorkforceHeadcountFlag ? element.totalWorkforceHeadcountFlag : '-',
          'Employee Type': element.employeeType ? element.employeeType : '-',
          'Hire Date': element.hireDate ? element.hireDate : '-',
          'Cost Center': element.costCenter ? element.costCenter : '-',
          'Company': element.company ? element.company : '-',
          'Department': element.department ? element.department : '-',
          'Job': element.job ? element.job : '-',
          'Finance Managed Entity Level 2': element.financeManagedEntityLevel2 ? element.financeManagedEntityLevel2 : '-',
          'Finance Managed Geography Level 1': element.financeManagedGeographyLevel1 ? element.financeManagedGeographyLevel1 : '-',
          'Finance Managed Geography Level 2': element.financeManagedGeographyLevel2 ? element.financeManagedGeographyLevel2 : '-',
          'Position Vetting Status': element.positionVettingStatus ? element.positionVettingStatus : '-',
          'Contract Type': element.contractType ? element.contractType : '-',
          'Regulatory Local Job Title': element.regulatoryLocalJobTitle ? element.regulatoryLocalJobTitle : '-',
          'Category Code': element.categoryCode ? element.categoryCode : '-',
          'Local Job Title': element.localJobTitle ? element.localJobTitle : '-',
          'CBO Title': element.cboTitle ? element.cboTitle : '-',
          'Employee Category': element.employeeCategory ? element.employeeCategory : '-',
          'Date Vetting Completed': element.dateVettingCompleted ? element.dateVettingCompleted : '-',
          'Date Next Vetting Check Due': element.dateNextVettingCheckDue ? element.dateNextVettingCheckDue : '-',
          'Non Financial Risk Role': element.nonFinancialRiskRole ? element.nonFinancialRiskRole : '-',
          'Division': element.division ? element.division : '-',
          'Division Code': element.divisionCode ? element.divisionCode : '-',
          'Division Name': element.divisionName ? element.divisionName : '-',
          'Subdivision': element.subdivision ? element.subdivision : '-',
          'Subdivision Code': element.subdivisionCode ? element.subdivisionCode : '-',
          'Subdivision Name': element.subdivisionName ? element.subdivisionName : '-',
          'User ID': element.userId ? element.userId : '-',
          'Career Link Opt-In': element.careerLinkOptIn ? element.careerLinkOptIn : '-',
          'Establishment ID': element.establishmentId ? element.establishmentId : '-',
          'Is Union Employee': element.isUnionEmployee ? element.isUnionEmployee : '-',
          'Total Rows': element.totalRows ? element.totalRows : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }else if (reqType === 4) {
      fileName = 'InActive_User_Entry' + new Date().toDateString() + a;
      excelData.forEach((element, i) => {
        const index = i + 1;
        let allApplications = null;
        allApplications = [{
          'Employee ID': element.employeeId ? element.employeeId : '-',
          'Employee Name': element.employeeName ? element.employeeName : '-',
          'Employee Business Email Address': element.employeeBusinessEmailAddress ? element.employeeBusinessEmailAddress : '-',
          'Employee Preferred First Name': element.employeePreferredFirstName ? element.employeePreferredFirstName : '-',
          'Global Career Band': element.globalCareerBand ? element.globalCareerBand : '-',
          'Employee FTE': element.employeeFte ? element.employeeFte : '-',
          'Employment Type': element.employmentType ? element.employmentType : '-',
          'Employee Status': element.employeeStatus ? element.employeeStatus : '-',
          'Employee Class': element.employeeClass ? element.employeeClass : '-',
          'Last Hire Date': element.lastHireDate ? element.lastHireDate : '-',
          'Latest Hire Date': element.latestHireDate ? element.latestHireDate : '-',
          'Tenure in Service (Years)': element.tenureInServiceYears ? element.tenureInServiceYears : '-',
          'Original Hire Date': element.originalHireDate ? element.originalHireDate : '-',
          'Assignment Start Date': element.assignmentStartDate ? element.assignmentStartDate : '-',
          'Tenure in Organisation (Years)': element.tenureInOrganisationYears ? element.tenureInOrganisationYears : '-',
          'Tenure in GCB (Years)': element.tenureInGcbYears ? element.tenureInGcbYears : '-',
          'Tenure in Position (Years)': element.tenureInPositionYears ? element.tenureInPositionYears : '-',
          'Local Secondment': element.localSecondment ? element.localSecondment : '-',
          'Expected Local Secondment End Date': element.expectedLocalSecondmentEndDate ? element.expectedLocalSecondmentEndDate : '-',
          'Fixed Term Contract Start Date': element.fixedTermContractStartDate ? element.fixedTermContractStartDate : '-',
          'Fixed Term Contract End Date': element.fixedTermContractEndDate ? element.fixedTermContractEndDate : '-',
          'BF Level 1 ID': element.bfLevel1Id ? element.bfLevel1Id : '-',
          'BF Level 1 Name': element.bfLevel1Name ? element.bfLevel1Name : '-',
          'BF Level 2 ID': element.bfLevel2Id ? element.bfLevel2Id : '-',
          'BF Level 2 Name': element.bfLevel2Name ? element.bfLevel2Name : '-',
          'BF Level 3 ID': element.bfLevel3Id ? element.bfLevel3Id : '-',
          'BF Level 3 Name': element.bfLevel3Name ? element.bfLevel3Name : '-',
          'BF Level 4 ID': element.bfLevel4Id ? element.bfLevel4Id : '-',
          'BF Level 4 Name': element.bfLevel4Name ? element.bfLevel4Name : '-',
          'BF Level 5 ID': element.bfLevel5Id ? element.bfLevel5Id : '-',
          'BF Level 5 Name': element.bfLevel5Name ? element.bfLevel5Name : '-',
          'Finance Cost Centre': element.financeCostCentre ? element.financeCostCentre : '-',
          'Legal Entity Name': element.legalEntityName ? element.legalEntityName : '-',
          'Department Code': element.departmentCode ? element.departmentCode : '-',
          'Department Name': element.departmentName ? element.departmentName : '-',
          'Branch': element.branch ? element.branch : '-',
          'Sub Branch': element.subBranch ? element.subBranch : '-',
          'Global Workstyle': element.globalWorkstyle ? element.globalWorkstyle : '-',
          'Workstyle Detail': element.workstyleDetail ? element.workstyleDetail : '-',
          'Finance Managed Entity Level 1': element.financeManagedEntityLevel1 ? element.financeManagedEntityLevel1 : '-',
          'Company Code': element.companyCode ? element.companyCode : '-',
          'Company Name': element.companyName ? element.companyName : '-',
          'Work Location Name': element.workLocationName ? element.workLocationName : '-',
          'Work Location Code': element.workLocationCode ? element.workLocationCode : '-',
          'Work Location Building': element.workLocationBuilding ? element.workLocationBuilding : '-',
          'Work Location City': element.workLocationCity ? element.workLocationCity : '-',
          'Work Location Country/Territory Name': element.workLocationCountryTerritoryName ? element.workLocationCountryTerritoryName : '-',
          'Work Location Region Name': element.workLocationRegionName ? element.workLocationRegionName : '-',
          'Home Worker': element.homeWorker ? element.homeWorker : '-',
          'Job Code': element.jobCode ? element.jobCode : '-',
          'Job Family': element.jobFamily ? element.jobFamily : '-',
          'Job Sub Family': element.jobSubFamily ? element.jobSubFamily : '-',
          'Job Category': element.jobCategory ? element.jobCategory : '-',
          'Job Vetting Status': element.jobVettingStatus ? element.jobVettingStatus : '-',
          'Enhanced Vetting Reason': element.enhancedVettingReason ? element.enhancedVettingReason : '-',
          'Position Number': element.positionNumber ? element.positionNumber : '-',
          'Workforce Plan ID': element.workforcePlanId ? element.workforcePlanId : '-',
          'Position Class': element.positionClass ? element.positionClass : '-',
          'Position Title': element.positionTitle ? element.positionTitle : '-',
          'Position Learning Financial Crime Risk Rating': element.positionLearningFinancialCrimeRiskRating ? element.positionLearningFinancialCrimeRiskRating : '-',
          'Entity Manager Employee ID': element.entityManagerEmployeeId ? element.entityManagerEmployeeId : '-',
          'Entity Manager Employee Name': element.entityManagerEmployeeName ? element.entityManagerEmployeeName : '-',
          'Functional Manager Employee ID': element.functionalManagerEmployeeId ? element.functionalManagerEmployeeId : '-',
          'Functional Manager Employee Name': element.functionalManagerEmployeeName ? element.functionalManagerEmployeeName : '-',
          'Employee Alternate Language 1 Middle Name': element.employeeAlternateLanguage1MiddleName ? element.employeeAlternateLanguage1MiddleName : '-',
          'Employee Alternate Language 1 First Name': element.employeeAlternateLanguage1FirstName ? element.employeeAlternateLanguage1FirstName : '-',
          'Employee Alternate Language 1 Last Name': element.employeeAlternateLanguage1LastName ? element.employeeAlternateLanguage1LastName : '-',
          'Total Workforce Headcount Flag': element.totalWorkforceHeadcountFlag ? element.totalWorkforceHeadcountFlag : '-',
          'Employee Type': element.employeeType ? element.employeeType : '-',
          'Hire Date': element.hireDate ? element.hireDate : '-',
          'Cost Center': element.costCenter ? element.costCenter : '-',
          'Company': element.company ? element.company : '-',
          'Department': element.department ? element.department : '-',
          'Job': element.job ? element.job : '-',
          'Finance Managed Entity Level 2': element.financeManagedEntityLevel2 ? element.financeManagedEntityLevel2 : '-',
          'Finance Managed Geography Level 1': element.financeManagedGeographyLevel1 ? element.financeManagedGeographyLevel1 : '-',
          'Finance Managed Geography Level 2': element.financeManagedGeographyLevel2 ? element.financeManagedGeographyLevel2 : '-',
          'Position Vetting Status': element.positionVettingStatus ? element.positionVettingStatus : '-',
          'Contract Type': element.contractType ? element.contractType : '-',
          'Regulatory Local Job Title': element.regulatoryLocalJobTitle ? element.regulatoryLocalJobTitle : '-',
          'Category Code': element.categoryCode ? element.categoryCode : '-',
          'Local Job Title': element.localJobTitle ? element.localJobTitle : '-',
          'CBO Title': element.cboTitle ? element.cboTitle : '-',
          'Employee Category': element.employeeCategory ? element.employeeCategory : '-',
          'Date Vetting Completed': element.dateVettingCompleted ? element.dateVettingCompleted : '-',
          'Date Next Vetting Check Due': element.dateNextVettingCheckDue ? element.dateNextVettingCheckDue : '-',
          'Non Financial Risk Role': element.nonFinancialRiskRole ? element.nonFinancialRiskRole : '-',
          'Division': element.division ? element.division : '-',
          'Division Code': element.divisionCode ? element.divisionCode : '-',
          'Division Name': element.divisionName ? element.divisionName : '-',
          'Subdivision': element.subdivision ? element.subdivision : '-',
          'Subdivision Code': element.subdivisionCode ? element.subdivisionCode : '-',
          'Subdivision Name': element.subdivisionName ? element.subdivisionName : '-',
          'User ID': element.userId ? element.userId : '-',
          'Career Link Opt-In': element.careerLinkOptIn ? element.careerLinkOptIn : '-',
          'Establishment ID': element.establishmentId ? element.establishmentId : '-',
          'Is Union Employee': element.isUnionEmployee ? element.isUnionEmployee : '-'
        }];
        downloadData = downloadData.concat(allApplications);
      });
    }


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

  getAllCustomer(): void {
    this.isDownloading = true
    this.msmeService.getAllNonActiveUsersCustomerData().subscribe(res=>{
      this.downloadExcel(res.contentInBytes,"Customer_Data");
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

  isDownloadingHrms = false;

  downloadHrmsExcel(): void {
    const timestamp = this.getFormattedTimestamp();
    let fileName = 'HRMS_Data';
    this.isDownloadingHrms = true
    this.msmeService.downloadHrmsExcel().subscribe(res=>{
      this.downloadExcel(res.file, fileName );
      this.isDownloadingHrms = false
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
}
