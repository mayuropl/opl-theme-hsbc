import { Component, HostListener, signal } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { ValidationsService } from 'src/app/CommoUtils/common-services/validations.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { PaginationSignal } from 'src/app/CommoUtils/model/paginationSignal';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../../CommoUtils/global-headers";
import { SharedService } from 'src/app/services/SharedService';

@Component({
  selector: 'app-consumer-bureau-details',
  // standalone: true,
  // imports: [],
  templateUrl: './consumer-bureau-details.component.html',
  styleUrl: './consumer-bureau-details.component.scss'
})
export class ConsumerBureauDetailsComponent {

  pageOfItems: Array<any>;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  tempPage = 0;
  count: 0;
  selectedTabIndex : number;
  tabValue : number;
  userId:any;
  applicationId: any;
  cibilId: any;
  private debounceTimer: any;
  consumerData: any;
  defaultDetailList: any;
  currentSortField: string = null;
  checkAnalysisExistOrNot : boolean;
  isFromConsumerPrUpload: any;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  additionalDtls: any;
  hsbcClosedFacilityList: any[]=[];
  hsbcClosedFacilityPag = new PaginationSignal();
  scrolled: boolean = false;
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
  constants: any;
  pageData: any;
  routerData: any ;
  protected readonly consValue = Constants;
  constructor(private router: Router,
    public dialog: MatDialog, private formBuilder: UntypedFormBuilder, private validationsService: ValidationsService,
    public msmeService: MsmeService, public commonService: CommonService, private loaderService: LoaderService,
   private sharedService : SharedService) {
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.applicationId = this.commonService.getStorage(Constants.httpAndCookies.APPLICATION_ID, true);
    this.cibilId = this.commonService.getStorage(Constants.httpAndCookies.CIBIL_ID, true);
    console.log("This cibilId Data :: {} ", this.cibilId)
    // this.cibilId = 9676;
      this.initialize();
  }

  private initialize() {
    console.log("Message recieved from Cibil Bureau Fetch Status ");
    this.sharedService.getCibilConsumerBureauFetchStatusClickEvent().subscribe((message)=>{
      // this.fetchDataFromWebSocket(message);
      this.handleWebSocketMessage(message);
  })
  }

  handleWebSocketMessage(message: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      console.log('this.debounceTimer: ', this.debounceTimer);
      this.fetchDataFromWebSocket(message);
    }, 1000);
  }

  fetchDataFromWebSocket(responseFromWebSocket?){
  responseFromWebSocket = JSON.parse(responseFromWebSocket);
  console.log(responseFromWebSocket);
  // this.checkAnalysisExistOrNot = true;
  console.log(this.checkAnalysisExistOrNot)
  this.consumerData = responseFromWebSocket?.response;
           this.defaultDetailList = this.consumerData?.defaultDetailList;
          this.additionalDtls = this.consumerData?.additionDtlslist;
          this.hsbcClosedFacilityList = this.consumerData?.hsbcClosedFacility;
          this.hsbcClosedFacilityPag.totalSize = this.hsbcClosedFacilityList ? this.hsbcClosedFacilityList.length : 0;
          this.checkAnalysisExistOrNot = this.consumerData?.checkAnalysisExistOrNot;
            console.log(this.checkAnalysisExistOrNot)
}
      // mat tab header fixed S
      @HostListener('window:scroll', [])
      onWindowScroll() {
        this.scrolled = window.scrollY > 100;
      }
      // mat tab header fixed S
  ngOnInit(): void {
    this.constants = Constants;
    console.log(history.state)
    this.pageData = history.state.data;
    this.routerData = history?.state?.routerData;
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmConsumerBureauDetail';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    if (this.pageData?.status == 1) {
          this.checkAnalysisExistOrNot = true;
    }else{
       this.checkAnalysisExistOrNot = undefined;
    }
    this.getIndividualData();
  }
  onPageChange(page: any): void {
    console.log("onPageChange");
   //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
  }

  // formatPan(pan: string): string {
  //   if (pan && pan[3] === 'P' && !this.isActionAvail(this.constants.PageActions.MASK_PAN)) {
  //     return pan.substring(0, pan.length - 4) + 'XXXX';
  //   }
  //   return pan || '-';
  // }
  getIndividualData() {
    let tempResponse = `{
      "name": "ABC XYZ",
      "pan": "AVDSDSKD",
      "cibilScore": "887",
      "bureauVintage": 2007,
      "countOfAcount": 12,
      "specificLoanType": {
        "noAccHL": 1,
        "sanctionAmtHL": 2,
        "ostAmtHl": 2233,
        "noAccLap": 1,
        "sanctionAmtLap": 2,
        "ostAmtLap": 2233,
        "noAccFd": 1,
        "sanctionAmtFd": 2,
        "ostAmtFd": 2233

      },
      "defaultDetailList": [
        {
          "statusName": "wreritten off",
          "amount": "",
          "closedDate": "22-10-2021",
          "loanTypeName": ""
        },
        {
          "statusName": "ritten on",
          "amount": "231121",
          "closedDate": "11-03-2023",
          "loanTypeName": "Home"
        }
      ],
      "loanAnalysis": {
        "countOfLoanIn0To3Month": 52,
        "countOfLoanIn3To6Month": null,
        "countOfLoanIn6To12Month": 1252,
        "last0To3MonthSanctionAmt": 1002252,
        "last3To6MonthSanctionAmt": 12200052,
        "last6To12MonthSanctionAmt": null,
        "countOf0To3MonthSecureUnsecureLoan": 12,
        "countOf3To6MonthSecureUnsecureLoan": 152,
        "countOf6To12MonthSecureUnsecureLoan": 15
      },
      "additionalDtls": [
        {
          "countOfEnquires": 22,
          "countOfOpenCreditFacility": 52,
          "totalSanctionLoanAmountForAllLoans": 7.5,
          "totalOutstandingAmountForAllLoans": 6.5,
          "creditFacilityUtilizationPercentage": 5.5,
          "countOfTotalCreditFacilityOfHsbcMember": 123,
          "totalSanctionAmountOfHsbcMember": 6.6,
          "creditFacilityPercentageOfHsbc": null,
          "reportDate": "12-01-2024"
        },
        {
          "countOfEnquires": 22,
          "countOfOpenCreditFacility": 52,
          "totalSanctionLoanAmountForAllLoans": 7.5,
          "totalOutstandingAmountForAllLoans": 6.5,
          "creditFacilityUtilizationPercentage": 5.5,
          "countOfTotalCreditFacilityOfHsbcMember": 123,
          "totalSanctionAmountOfHsbcMember": 6.6,
          "creditFacilityPercentageOfHsbc": 8.8,
          "reportDate": "24-12-2021"
        },
        {
          "countOfEnquires": 22,
          "countOfOpenCreditFacility": 52,
          "totalSanctionLoanAmountForAllLoans": 7.5,
          "totalOutstandingAmountForAllLoans": 6.5,
          "creditFacilityUtilizationPercentage": 5.5,
          "countOfTotalCreditFacilityOfHsbcMember": 123,
          "totalSanctionAmountOfHsbcMember": 6.6,
          "creditFacilityPercentageOfHsbc": 8.8,
          "reportDate": "09-11-2020"
        }
      ]
    }`;
    // this.consumerData = JSON.parse(tempResponse);
          this.msmeService.getConsumerData(this.cibilId).subscribe(response => {
        if (response) {
          console.log("Get consumer Data {} :: ", response);
          this.consumerData = response;
          console.log("This consumer Data :: {} ", this.consumerData)
          this.isFromConsumerPrUpload = this.consumerData?.isFromConsumerPrUpload;
          this.defaultDetailList = this.consumerData?.defaultDetailList;
          this.additionalDtls = this.consumerData?.additionDtlslist;
          this.hsbcClosedFacilityList = this.consumerData?.hsbcClosedFacility;
          this.hsbcClosedFacilityPag.totalSize = this.hsbcClosedFacilityList ? this.hsbcClosedFacilityList.length : 0;
          this.checkAnalysisExistOrNot = this.consumerData?.checkAnalysisExistOrNot;
          if( this.checkAnalysisExistOrNot == true){
            this.pageData.status = 1;
          }
          if(this.checkAnalysisExistOrNot == false){
            this.checkAnalysisExistOrNot= null;
          }
      //     if(this.consumerData?.checkAnalysisExistOrNot  == false){
      //     // this.viewCommercialDetailPage(this.pan.toUpperCase());
      //     this.navBack();
      // }
        }
      })
  }

  toggleSort(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if(dontCallApi && this.currentSortField==("closedDateD")){
      console.log("in Default date")
      this.getSortedDefaultDate();
    }
    if(dontCallApi && this.currentSortField==("amountD")){
      this.getSortedDefaultAmt();
    }
  }

  toggleSort2(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if(dontCallApi && this.currentSortField==("closedDate")){
      this.getSortedHsbcFacilityDate();
    }
    if(dontCallApi && this.currentSortField==("amount")){
      this.getSortedHsbcFacilityAmt();
    }
  }

  getSortedHsbcFacilityAmt():void{
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsbcClosedFacilityList = this.hsbcClosedFacilityList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedHsbcFacilityDate(): void {
    const sortField = this.currentSortField;
    const sortDirection = this.sortDirection;
    this.hsbcClosedFacilityList = this.hsbcClosedFacilityList.sort((a, b) => {
      const dateA = this.convertStringToDate(a[sortField]);
      const dateB = this.convertStringToDate(b[sortField]);
      const diff = dateA.getTime() - dateB.getTime();
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedDefaultAmt():void{
    const sortField = "amount";
    const sortDirection = this.sortDirection;
    this.defaultDetailList = this.defaultDetailList.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedDefaultDate(): void {
    const sortField = "closedDate";
    const sortDirection = this.sortDirection;
    this.defaultDetailList = this.defaultDetailList.sort((a, b) => {
      const dateA = this.convertStringToDate(a[sortField]);
      const dateB = this.convertStringToDate(b[sortField]);
    if (sortDirection === 'ASC') {
      if (!dateA && !dateB) return 0;
      if (!dateA) return -1;
      if (!dateB) return 1;
    } else {
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
    }
      const diff = dateA.getTime() - dateB.getTime();
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  convertStringToDate(dateString: string): Date {
  if (!dateString || dateString === '-' || dateString.trim() === '') {
    return null;
  }
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return null;
  }
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  downloadConsumerReport() {
    GlobalHeaders['x-page-action'] = 'Download Rreport';
    if(this.isFromConsumerPrUpload === null || this.isFromConsumerPrUpload === 0){
      this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    }else{
      this.commonService.warningSnackBar("This is pre-populate bureau report to help you with instant wallet-gap analysis and alerts. To download the entire bureau report - please go back and trigger fresh consumer bureau pull")
      return;
    }

    var formData = new FormData();
    formData.append('cibilId', this.cibilId)
    formData.append('type',"1")
    console.info('inside file download');
     this.msmeService.downloadCibilReport2(formData).subscribe((blob: Blob) => {
       if (blob.size > 0) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.cibilId + ".html";
        a.click();
        URL.revokeObjectURL(objectUrl);
      } else {
        this.commonService.warningSnackBar("File Not Found.") ;
        // console.error('Received empty blob');
      //  this.commonService.errorSnackBar("Not able to download");
      }
    },
    (error) => {
       console.error('Failed to download file bcz latest report is uploaded from PR', error);
      this.commonService.warningSnackBar("Not able to download");
    }
  );

    // this.msmeService.downloadCibilReport(this.cibilId,1).subscribe(res => {
    //   if(res && res?.data){
    //     this.blobToFile(atob(res.data),"text/html",this.cibilId);
    //    }else{
    //     this.commonService.errorSnackBar("Not able to download");
    //    }
    // }, error => {
    //   this.commonService.errorSnackBar(error.message);
    // })
  }

  downloadConsumerPdf() {
    GlobalHeaders['x-page-action'] = 'Download Pdf';
    const data = {
      cibilId: this.cibilId,
      templateId :2
    }
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadCibilPdf(data).subscribe(res => {
      console.log("Download Cibil Consumer PDF >>",res);
      if(res && res?.data && res?.data?.content){
        this.downloadBase64(res.data.content,"Consumer_Analysis_"+ this.cibilId);
       }else{
        this.commonService.errorSnackBar("Not able to download");
       }
    }, error => {
      this.commonService.errorSnackBar(error.message);
    })
  }

  downloadBase64(data: any, fileName: string) {
    const blob = new Blob([this.base64ToArrayBuffer(data)], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = fileName;
    anchor.href = downloadUrl;
    anchor.click();
}
  private base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  blobToFile(data: any, type: string, fileName: string) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    a.href = url; a.download = fileName; a.click();
    window.URL.revokeObjectURL(url);
  }

  navBack(){
    console.log(this.pageData)
    this.router.navigate(['/hsbc/rmConsumerBureau'],{state: { data: this.pageData, routerData: this.routerData }});
  }
  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.CONSUMER_BUREAU2 || this.pageData?.subpageId == Constants.pageMaster.CONSUMER_BUREAU) {
      for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
          res = true; // Return true if found
        }
      }
    } else {
      if (!res) {
        this.pageData?.subSubpages.forEach(masterPage => {
          if (masterPage?.subpageId == Constants.pageMaster.ANALYTICS) {
            masterPage?.subSubpages.forEach(page => {
              if (page?.subpageId == Constants.pageMaster.CONSUMER_BUREAU) {
                for (let subpage of page?.actions) {
                  if (subpage?.actionId === actionId) {
                    res = true; // Return true if found
                  }
                }
              }
            });
          }
        })
      }
    }
    return res; // Return false if not found
  }


}
