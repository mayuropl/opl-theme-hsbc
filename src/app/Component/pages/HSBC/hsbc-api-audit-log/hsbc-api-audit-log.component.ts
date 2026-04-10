import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
// import { DatePipe } from '@angular/common';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { AuditAPIType, Constants } from 'src/app/CommoUtils/constants';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import alasql from 'alasql';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShowRequestResponseComponent } from '../show-request-response/show-request-response.component';
import { FormBuilder, FormGroup } from '@angular/forms';
// import { constants } from 'buffer';
import { Location } from '@angular/common';
import {GlobalHeaders} from "../../../../CommoUtils/global-headers";

@Component({
  selector: 'app-hsbc-api-audit-log',
  templateUrl: './hsbc-api-audit-log.component.html',
  styleUrls: ['./hsbc-api-audit-log.component.scss']
})
export class HSBCAPIAuditLogComponent implements OnInit {

  apiType = AuditAPIType.API_AUDIT;

  routerData: any;
  // bread crumb items
  breadCrumbItems: Array<{}>;

  selectValue: string[];


  // page number
  page = 1;
  // default page size
  pageSize = 5;

  // start and end index
  startIndex = 0;
  endIndex = 5;
  totalSize = 0;
  PageSelectNumber: any[];
  total$: Observable<number>;
  // debounceEventForFilter = _.debounce(() => this.getStageAuditList(), 500, {});
  stageauditList: any = [];
  totalCount;
  fromDate;
  toDate;
  searchValue;
  schemeId;
  responceTypeId;
  searchForm: FormGroup;
  private destroy$ = new Subject<void>();
  dropDownFlag = false;
  refId:any;
  refType:any;
  customerAuditApiType: any;
  auditDataList: any = [];
  apiList = [
    { value: 'UDYAM', viewValue: 'KARZA'},
    { value: 'GST PROFILE', viewValue: 'GST'},
    { value: 'EXIM', viewValue: 'EXIM'},
    { value: 'MCA', viewValue: 'SAVE_RISK'},
    {value:'PREFIOUS SEARCH',viewValue:'PREFIOUS_SEARCH'},
    { value: 'TRACXN ANALYSIS', viewValue: 'TRACXN_ANALYSIS'},
    { value: 'CRISIL', viewValue: 'CRISIL_AGGREGATION'},
  ];


  // schemeMasterList = Constants.schemeMasterList;
  // responceTypeList = Constants.responceType;
  filterId;
  isValidOrNotEmail: Boolean = false;
  proposalData;
  filterList = [
    {
      id: 1,
      value: 'Email Id'
    },
    {
      id: 2,
      value: 'Mobile No'
    },
    {
      id: 3,
      value: 'Application Id'
    },
    {
      id: 4,
      value: 'Profile Id'
    },
    {
      id: 5,
      value: 'Message Code'
    }
  ];

  // adminPermissionList: any = [];
  currentAdminRole = this.commonservice.getStorage(Constants.httpAndCookies.ROLEID, true);
  childUserId: any;
  applicationId: any = this.commonservice.getStorage('applicationId', true);
  // isShowAuditAPI = this.commonservice.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API,true);
  isShowAuditAPI = 'true'
  tab: any = this.commonservice.getStorage('tab', true);
  auditType: any = this.commonservice.getStorage('auditType', true);
  pan: any;
  tabId: any;
  constructor(private msmeService: MsmeService,
    private commonMethods: CommonMethods,
    // private datePipe: DatePipe,
    private commonservice: CommonService, private modalService: NgbModal, private fb: FormBuilder, private location: Location) {
      this.refType = this.commonservice.getStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, true);

    }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Dashboard', path: '/' }, { label: 'Reports', path: '/', active: true }];
    this.PageSelectNumber = [
      { name: '5', value: 5 },
      { name: '10', value: 10 },
      { name: '25', value: 25 },
      { name: '50', value: 50 },
      { name: '100', value: 100 }
    ];
    // this.adminPermissionList = _.split(CommonService.getStorage('AdminPermission', true), ',');
    this.refType = this.commonservice.getStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, true);
    this.refId = this.commonservice.getStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, true);
    this.routerData = history.state.routerData;
    GlobalHeaders['x-page-action'] = '';
    GlobalHeaders['x-path-url'] = 'hsbc/apiAuditLog';
    GlobalHeaders['x-main-page'] = 'Audit Log';
    if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      this.pan =this.routerData?.pan;
      this.tabId = this.routerData?.tabId;
      this.apiType = this.routerData?.apiType;
    }

    if(this.refType==="EXISTING_TARGET"){
      console.log(this.refType,'Reftype')
      this.searchForm = this.fb.group({
        // anchorName: 'samsung',
        selectedProduct: 'KARZA',
        pan: this.pan || '',
      });

      this.dropDownFlag= true;


    }
    if(this.apiType.value  == AuditAPIType.API_AUDIT.value){
      this.getAuditDataAPI();
    } else if(this.apiType.value  == AuditAPIType.PRE_APPROVED_API_AUDIT.value){
      this.getStageAuditList(this.applicationId, this.auditType);
    } else {
      this.getStageAuditList(this.applicationId, this.auditType);
    }
    // this.refType = "GST";

  }

  getFormatedDate(date): any {
    const dateParts = date.split('-');
    const dateObj = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    return dateObj;
  }

  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if(this.apiType.value  == AuditAPIType.API_AUDIT.value){
      this.getAuditDataAPI();

    } else  if(this.apiType.value  == AuditAPIType.PRE_APPROVED_API_AUDIT.value){
      this.getStageAuditList(this.applicationId, this.auditType);
    }  else {
      this.getStageAuditList(this.applicationId, this.auditType);
    }
  }

  resetStartIndex(): void {
    this.startIndex = 0;
    this.page = 1;
  }

  getStageAuditList(applicationId, auditType) {
    this.stageauditList = []

    const data = {
      applicationId: applicationId,
      auditType: auditType,
      pageIndex: this.startIndex,
      size: this.pageSize,
    };

    this.msmeService.getStageAuditListfORaPPLICATION(data).subscribe(res => {
      this.stageauditList = [];
      this.totalSize = 0;
      if (res && res.data) {
        if (auditType != 4) {
          this.stageauditList = res.data;
          if(this.stageauditList?.length > 0){
            this.totalSize = this.stageauditList[0]?.totalCount;
            if (this.isShowAuditAPI === 'false' || this.isShowAuditAPI === 'null') {
              this.stageauditList = res.data.filter(item => item.name.toLowerCase() === "MCA_COMPANY_HISTORY".toLowerCase());
              this.totalSize = this.stageauditList?.length;
            }
          }
          // this.totalCount = res.data[0].totalCount;
        } else if (auditType == 4) {
          this.proposalData = res.data
          if (this.tab === '1') {
            this.proposalData.sanctiondetailsReqRes.sanctionDate = this.setDate(this.proposalData.sanctiondetailsReqRes.sanctionDate);
          }
        }
      }
    });
  }


  getAuditDataAPI(){
    if (this.refType) {
      const auditReq = {
        refType: this.refType,
        refId: this.refId,
        customerAuditApiType:this.searchForm && this.searchForm.get("selectedProduct")?.value || 'KARZA',
        pageIndex: this.page - 1,
        size: this.pageSize,
        pan:  this.searchForm && this.searchForm.get("pan")?.value,

      };
      console.log("getAuditDataAPI req :", auditReq)

      this.msmeService.getAuditData(auditReq).subscribe(response => {
        console.log("getAuditDataAPI response", response)
        if (response?.status == 200) {
          this.stageauditList = response?.data?.data || [];
          this.totalSize = (this.stageauditList.length > 0 && this.stageauditList[0]?.totalEntries) ? this.stageauditList[0]?.totalEntries : 0;

        } else {
          this.stageauditList = [];
          this.totalSize = 0;
          this.commonservice.errorSnackBar(!(this.commonservice.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
        }
      })
    } else {
      this.commonservice.errorSnackBar("REF_TYPE_FOR_AUDIT Not Found")
    }
  }


  setDate(date: string) {
    let datearr = date.split('-');
    let temp = datearr[0];
    datearr[0] = datearr[1];
    datearr[1] = temp;
    return datearr.join('-');
  }

  // downloadAll() {
  //   const data = {
  //     filterJSON: {
  //       fromDate: this.fromDate ? this.getFormatedDate(this.fromDate) : undefined,
  //       toDate: this.toDate ? this.getFormatedDate(this.toDate) : undefined,
  //       searchValue: this.searchValue || undefined,
  //       schemeId: this.schemeId || undefined,
  //       responceTypeId: this.responceTypeId || undefined,
  //     },
  //     paginationFROM: 0,
  //     paginationTO: this.totalCount,
  //   };
  //   this.msmeService.getStageAuditList(data).subscribe(res => {
  //     if (res && res.data) {
  //       this.downloadDataInExcel(res.data);
  //     }
  //   });
  // }

  downloadDataInExcel(excelData) {
    let downloadData = [];
    const fileName = 'Audit List.xlsx';
    excelData.forEach((element, i) => {
      const index = i + 1;
      var allApplications = [{
        'Sr No': index,
        'Email': element.email || undefined,
        'Mobile': element.mobile || undefined,
        'Application Id': element.applicationId || undefined,
        'Profile Id': element.profileId || undefined,
        'Proposal Id': element.proposalId || undefined,
        'Responce Time': element.responceTime || undefined,
        'Responce Type': element.responceType || undefined,
        'Msg Code': element.msgCode || undefined,
        'Message': element.userMessage || undefined,
        'Stage Name': element.stageName || undefined,
        'Error Message': element.errorMessage || undefined,
        'Created Date': element.createdDate || undefined,
      }];
      downloadData = downloadData.concat(allApplications);
    });
    alasql('SELECT * INTO XLSX("' + fileName + '",{headers:true}) FROM ?', [downloadData]);
  }

  // copyToClipBoard(data) {
  //   this.commonMethods.copyToClipBoard(data);
  // }

  onKeydown(e, filterId) {
    console.log("value", e.target.value);
    console.log("code", e.charCode);
    console.log("filterId", filterId);
    if (filterId == 2) {
      var regex = new RegExp("^[0-9]+$");
      var str = String.fromCharCode(!e.charCode ? e.which : e.charCode);
      if ((regex.test(str) && e.target.value.length <= 10) || ([8, 13, 27, 37, 38, 39, 40].indexOf(e.which) > -1) || ((e.keyCode >= 96 && e.keyCode <= 105) && e.target.value.length <= 10)) {
        return true;
      }
      e.preventDefault();
      return false;
    }
    if (filterId == 1) {
      this.isValidOrNotEmail = this.isValidEmail(e.target.value.trim());
      console.log(this.isValidOrNotEmail);

    }
  }

  public isValidEmail(emailString: string): boolean {
    try {
      let pattern = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");
      let valid = pattern.test(emailString);
      return valid;
    } catch (TypeError) {
      return false;
    }
  }

  showPopupForReqRes(name: any, data: any) {
    const config = {
      windowClass: 'modal-adaptive-s1 popupMain_design',
      size: 'lg',
    };
    let dd = '';
    try {
      dd = JSON.parse(data);
      if(typeof(dd) == "string") {
        dd = JSON.parse(dd);
      }
    } catch (error) {
      // let x2js = new X2JS();
      dd = data;


    }

    const modalRef = this.modalService.open(ShowRequestResponseComponent, config);
    modalRef.componentInstance.responseData = dd;
    modalRef.componentInstance.typeName = name;
    return modalRef;
  }

  goBack() {
    this.location.back(); // Navigates back to the previous page
  }

}
