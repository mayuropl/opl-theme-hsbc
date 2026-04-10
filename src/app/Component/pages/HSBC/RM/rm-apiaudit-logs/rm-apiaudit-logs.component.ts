import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { HSBCAPIAuditLogPopupComponent } from 'src/app/Popup/HSBC/hsbc-api-audit-log-popup/hsbc-api-audit-log-popup.component';
// import { CommonMethods } from 'src/app/commonUtils/common-methods';
// import { CommonService } from 'src/app/commonUtils/common-services/common.service';
// import { Constants } from 'src/app/commonUtils/constants';
// import { HSBCAPIAuditLogPopupComponent } from 'src/app/popup/hsbc-api-audit-log-popup/hsbc-api-audit-log-popup.component';
import { MsmeService } from 'src/app/services/msme.service';
import { ShowRequestResponseComponent } from '../../show-request-response/show-request-response.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rm-apiaudit-logs',
  templateUrl: './rm-apiaudit-logs.component.html',
  styleUrl: './rm-apiaudit-logs.component.scss'
})
export class RmAPIAuditLogsComponent {

  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;

  refType: any;
  refId: any;
  auditDataList: any = [];
  isIndividual: any;
  PageSelectNumber: any[] = [
    {
      name: '10',
      value: 10
    },
    {
      name: '20',
      value: 20
    },
    {
      name: '50',
      value: 50
    },
    {
      name: '100',
      value: 100
    },
  ]

  constructor(private msmeService: MsmeService,
    private commonMethods: CommonMethods, private router: Router, private modalService: NgbModal,
    // private datePipe: DatePipe,
    private commonservice: CommonService, private dialog: MatDialog) {
    this.refType = this.commonservice.getStorage(Constants.httpAndCookies.REF_TYPE_FOR_AUDIT, true);
    this.refId = this.commonservice.getStorage(Constants.httpAndCookies.REF_ID_FOR_AUDIT, true);
    this.isIndividual =this.commonservice.getStorage(Constants.httpAndCookies.IS_INDIVIDUAL, true);
    // this.refType = "GST";
    this.getAuditDataAPI()
  }

  backBUtton() {
    if (this.refType === 'BS') { this.router.navigate(["/rmBankStatementAnalysis"], { state: { data: history.state.data , routerData: history?.state?.routerData} }); }
    else if (this.refType === 'GST') { this.router.navigate(["/rmGSTAnalysis"], { state: { data: history.state.data, routerData: history?.state?.routerData} }); }
    else if (this.refType === 'EXIM_ANALYSIS') { this.router.navigate(["/rmEXIMAnalysis"], { state: { data: history.state.data, routerData: history?.state?.routerData} }); }
    else if (this.isIndividual === 'true') { this.router.navigate(["/hsbc/rmConsumerBureau"], { state: { data: history.state.data, routerData: history?.state?.routerData} }); }
    else if (this.isIndividual === 'false') { this.router.navigate(["/hsbc/rmCommercialBureau"], { state: { data: history.state.data, routerData: history?.state?.routerData} });
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
    } catch (error) {
      // let x2js = new X2JS();
      dd = data;
    }

    const modalRef = this.modalService.open(ShowRequestResponseComponent, config);
    modalRef.componentInstance.responseData = dd;
    modalRef.componentInstance.typeName = name;
    return modalRef;
  }

  // showPopupForReqRes(name: any, data: any) {
  //   const popUpData = {
  //     data: data,
  //     // name: name
  //   }
  //   const dialog = this.dialog.open(ShowRequestResponseComponent, {
  //     panelClass: ['popupMain_design'],
  //     autoFocus: false,
  //     data: data
  //   });

  //   dialog.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }


  onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    this.getAuditDataAPI();
  }

  getAuditDataAPI() {

    if(this.refType == 'CIBIL_AUDIT'){
      this.getStageAuditList()
    }else if (this.refType != 'CIBIL_AUDIT') {
      const auditReq = {
        refType: this.refType,
        refId: this.refId,
        pageIndex: this.page - 1,
        size: this.pageSize
      };
      console.log("getAuditDataAPI req :", auditReq)

      this.msmeService.getAuditData(auditReq).subscribe(response => {
        console.log("getAuditDataAPI response", response)
        if (response?.status == 200) {
          this.auditDataList = response?.data?.data;
          this.totalSize = this.auditDataList[0]?.totalEntries;
        } else {
          this.commonservice.errorSnackBar(!(this.commonservice.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
        }
      })
    } else {
      this.commonservice.errorSnackBar("REF_TYPE_FOR_AUDIT Not Found")
    }
  }

  getStageAuditList() {

    const data = {
      auditType: 4,
      cibilId: this.refId,
      pageIndex: this.page - 1,
      size: this.pageSize
    };

    this.msmeService.getStageAuditListfORaPPLICATION(data).subscribe(res => {
      this.auditDataList = [];
      this.totalSize = 0;
      if (res && res.data) {
          this.auditDataList = res.data;
          if(this.auditDataList?.length > 0){
            this.totalSize = this.auditDataList[0]?.totalCount;
          }
      }
    });
  }
}
