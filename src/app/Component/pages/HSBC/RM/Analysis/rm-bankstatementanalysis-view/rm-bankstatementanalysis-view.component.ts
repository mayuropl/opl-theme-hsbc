import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../../CommoUtils/global-headers";
import { isSubpageExists } from 'src/app/CommoUtils/subpage-permission.helpers';

@Component({
  selector: 'app-rm-bankstatementanalysis-view',
  templateUrl: './rm-bankstatementanalysis-view.component.html',
  styleUrl: './rm-bankstatementanalysis-view.component.scss'
})
export class RmBankstatementanalysisViewComponent implements OnInit {


  selectedTabIndex: number;
  tabValue: number;

  selectedbsDetails: any;
  activatebs: any;
  bsId: number;
  //data pass from prevous page
  routerData: any;
  tempPage = 0;
  count: 0;
  totalCount;
  currentSortField: string = null;
  sortDirection: 'ASC' | 'DESC' = 'ASC';
  scrolled: boolean = false;
  //  bounce cheque pagination
  //boun
  bCPagination: Pagination
  //  transaction pagination
  trxPagination: Pagination
  // boundChequeTotalSize = 0;

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
  ];
  bankStatementAnalysisData: BankStatementAnalysisData = null;
  bankStatementTranaction: BankStatementTranaction = null;
  bankStatementBounceCheque: BankStatementTranaction = null;
  constants: any;
  protected readonly consValue = Constants;
  pageData: any;
   consolidatedRequired: any;
   consolidatedSelected: boolean = false;
  accountSummaryList = [
    { bankName: 'ICICI Bank', accountNumber: '1234567890' },
    { bankName: 'HDFC Bank', accountNumber: '9876543210' },
    { bankName: 'SBI', accountNumber: '5550012398' },
    { bankName: 'Axis Bank', accountNumber: '9988776655' }
  ];

  oamPlusMappings = [
    {
      srNo: 1,
      dataField: 'Cheque Bounce For last 1 Month',
      mappingPath: 'bankStatementAnalysis > combined additional calculation > checkbounceforlast1month'
    },
    {
      srNo: 2,
      dataField: 'Cheque Bounce For last 6 Month',
      mappingPath: 'bankStatementAnalysis > combined additional calculation > checkbounceforlast6month'
    },
    {
      srNo: 3,
      dataField: 'Total Cheque Bounce',
      mappingPath: 'bankStatementAnalysis > combined additional calculation > chequebounce'
    }
  ];

  constructor(private msmeService: MsmeService, protected commonService: CommonService, private route: ActivatedRoute,
              private router: Router) {

  }
      // mat tab header fixed S
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 100;
  }
  // mat tab header fixed S
  activeClick(index, item , consol?:any) {
    if( consol){
      this.consolidatedSelected = true;
    }else{
      this.consolidatedSelected = false;
    }
    this.selectedTabIndex = 0;
    this.activatebs = index;
    this.selectedbsDetails = item;
    this.getData();
  }

  onPageChangeBounceCheque(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.bCPagination.startIndex = (page - 1) * this.bCPagination.pageSize;
    this.bCPagination.endIndex = (page - 1) * this.bCPagination.pageSize + this.bCPagination.pageSize;
    this.bCPagination.page = page;
    this.getBounceChequeData();
  }

  onPageChangeTrx(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.trxPagination.startIndex = (page - 1) * this.trxPagination.pageSize;
    this.trxPagination.endIndex = (page - 1) * this.trxPagination.pageSize + this.trxPagination.pageSize;
    this.trxPagination.page = page;
    this.getTransactionData();
  }

  getValue(DayWiseEodDetail: DayWiseEodDetail, day: number) {
    console.log("day ", day);
    console.log("DayWiseEodDetail ", DayWiseEodDetail);
    // for (let index = 0; index <= DayWiseEodDetail.monthBalance.length; index++) {
    //   console.log("index ", index);
    //     console.log("day ", day);
    //   // for (let index1 = 0; index1 < 31; index1++) {
    //     if(day == index){
    //       console.log("index ", index);
    // console.log("index1 ", index1)
    if (DayWiseEodDetail.monthBalance[day - 1]?.balance) {
      return DayWiseEodDetail.monthBalance[day - 1].balance;
    } else {
      '-'
    }
    // }
    // }

    // }
  }
  // Nikul Add NGX-Slider Start
  slideConfig = {
    slidesToShow: 5,
    slidesToScroll: 1,
    dots: false,
    infinite: false,
    // initialSlide: 1,
    // "nextArrow": "<div class='nav-btn next-slide'></div>",
    // "prevArrow": "<div class='nav-btn prev-slide'></div>",
    arrows: true,
    margin: 10,
    mobileFirst: false,
    respondTo: 'window',
    swipeToSlide: false,
    rows: 1,
    // cssEase: 'linear',
    lazyLoad: 'ondemand',
    responsive: [
      {
        breakpoint: 1440,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          arrows: true,
        }
      },
      {
        breakpoint: 620,
        settings: {
          slidesToShow: 2,
          arrows: true,
        }
        // settings: "unslick" // destroys slick
      },
      {
        breakpoint: 515,
        settings: {
          slidesToShow: 1,
          arrows: true,
        }
        // settings: "unslick" // destroys slick
      }
    ]

  };

  slickInit(e) {
    console.log('slick initialized');
  }

  breakpoint(e) {
    console.log('breakpoint');
  }

  afterChange(e) {
    console.log('afterChange');
  }

  beforeChange(e) {
    console.log('beforeChange');
  }
  // Nikul Add NGX-Slider End


  ngOnInit(): void {
    // const navigation = this.router.getCurrentNavigation();
    this.routerData = history.state.routerData;
    this.constants = Constants;
    this.pageData = history.state.data;
    this.consolidatedRequired = this.commonService.getStorage('consolidatedRequired',true);
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/rmBankStatementAnalysisView';
    GlobalHeaders['x-main-page'] = this.pageData.subpageName;
    // console.log(navigation);
    if (history?.state?.routerData) {
      this.routerData = history?.state?.routerData;
      // this.accountNo = this.routerData?.accountNo
      // console.log(this.routerData); // Access the passed data
    }

    this.bsId = Number(this.commonService.toATOB(this.route.snapshot.params.bsId));
    this.bCPagination = new Pagination();
    this.trxPagination = new Pagination();

    this.getData();

  }
  getData() {
    var json = {};
    json['profileId'] = this.bsId;
    json['accountNo'] = this.selectedbsDetails?.accountNo || this.routerData?.accountNo;
    json['isConsolidated'] = this.consolidatedSelected;

    this.msmeService.bankStatementGetData(json).subscribe((response: any) => {
      console.log(response);
      if (response.status == 200) {
        this.bankStatementAnalysisData = response.data;
        if (this.bankStatementAnalysisData?.accountList?.length > 0) {
          if (!this.selectedbsDetails) {
            if (this.routerData?.accountNo && this.bankStatementAnalysisData?.accountList) {
              this.selectedbsDetails = this.bankStatementAnalysisData?.accountList.find(accountDetail => accountDetail.accountNo == this.routerData?.accountNo);
            } else {
              this.selectedbsDetails = this.bankStatementAnalysisData?.accountList[0];
            }
          }
          if (!this.consolidatedSelected){
            this.getTransactionData();
            this.getBounceChequeData(); }
         }
      } else {
        this.commonService.errorSnackBar(response.message);
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong');
      console.error('Upload failed', error);
    });
  }

  getTransactionData() {
    var json = {};
    json["bankId"] = this.selectedbsDetails?.acId;
    json["pageIndex"] = this.trxPagination.page - 1;
    json["size"] = this.trxPagination?.pageSize;

    this.msmeService.getBankStatementTransaction(json).subscribe((response: any) => {
      console.log(response);
      if (response.status == 200) {
        this.bankStatementTranaction = response.data;
        this.trxPagination.totalSize = response?.data?.totalElements;
      } else {
        this.bankStatementTranaction = null;
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    });
  }

  getBounceChequeData() {
    var json = {};
    json["bankId"] = this.selectedbsDetails?.acId;
    json["pageIndex"] = this.bCPagination.page - 1;
    json["size"] = this.bCPagination?.pageSize;

    this.msmeService.getBankStatementBounceCheque(json).subscribe((response: any) => {
      console.log(response);
      if (response.status == 200) {
        this.bankStatementBounceCheque = response.data;

        this.bCPagination.totalSize = response?.data?.totalElements;
      } else {
        this.bankStatementBounceCheque = null;
        console.log(response.message);
      }
    }, error => {
      this.commonService.errorSnackBar('Something Went Wrong')
      console.error('Upload failed', error);
    });
  }

  toggleSort(column: string, dontCallApi?: boolean){
    if (this.currentSortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortField = column;
      this.sortDirection = 'ASC';
    }
    if(dontCallApi && this.currentSortField==("dateTopPay")){
      this.getSortedTopFundDate();
    }
    if(dontCallApi && this.currentSortField==("amountTopPay")){
      this.getSortedTopFundAmt();
    }
    if(dontCallApi && this.currentSortField==("dateXNS")){
      this.getSortedTranDate();
    }
    if(dontCallApi && this.currentSortField==("amountXNS")){
      this.getSortedTranAmt();
    }
    if(dontCallApi && this.currentSortField==("balanceXNS")){
      this.getSortedTranBlc();
    }
    if(dontCallApi && this.currentSortField==("dateTopRec")){
      this.getSortedTopFundRecDate();
    }
    if(dontCallApi && this.currentSortField==("amountTopRec")){
      this.getSortedTopFundRecAmt();
    }
    if(dontCallApi && this.currentSortField==("dateMW")){
      this.getSortedMonthWiseDDate();
    }
    if(dontCallApi && this.currentSortField==("amountMW")){
      this.getSortedMonthWiseDAmt();
    }
    if(dontCallApi && this.currentSortField==("balanceMW")){
      this.getSortedMonthWiseDBlc();
    }
  }

  getSortedTranBlc():void{
    const sortField = 'balance';
    const sortDirection = this.sortDirection;
    this.bankStatementTranaction.content = this.bankStatementTranaction?.content.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedTranAmt():void{
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    this.bankStatementTranaction.content = this.bankStatementTranaction?.content.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedTranDate(): void {
    const sortField = 'date';
    const sortDirection = this.sortDirection;
    this.bankStatementTranaction.content = this.bankStatementTranaction?.content.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedMonthWiseDBlc():void{
    const sortField = 'balance';
    const sortDirection = this.sortDirection;
    this.bankStatementBounceCheque.content = this.bankStatementBounceCheque?.content.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedMonthWiseDAmt():void{
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    this.bankStatementBounceCheque.content = this.bankStatementBounceCheque?.content.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedMonthWiseDDate(): void {
    const sortField = 'date';
    const sortDirection = this.sortDirection;
    this.bankStatementBounceCheque.content = this.bankStatementBounceCheque?.content.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  getSortedTopFundRecAmt():void{
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    this.bankStatementAnalysisData.topTransaction.topCredits = this.bankStatementAnalysisData?.topTransaction?.topCredits.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedTopFundRecDate(): void {
    const sortField = 'date';
    const sortDirection = this.sortDirection;
    this.bankStatementAnalysisData.topTransaction.topCredits = this.bankStatementAnalysisData?.topTransaction?.topCredits.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }
  getSortedTopFundAmt():void{
    const sortField = 'amount';
    const sortDirection = this.sortDirection;
    this.bankStatementAnalysisData.topTransaction.topDebits = this.bankStatementAnalysisData?.topTransaction?.topDebits.sort((a, b) => {
      const diff = a[sortField] - b[sortField];
      return sortDirection === 'ASC' ? Math.sign(diff) : Math.sign(-diff);
    });
  }

  getSortedTopFundDate(): void {
    const sortField = 'date';
    const sortDirection = this.sortDirection;
    this.bankStatementAnalysisData.topTransaction.topDebits = this.bankStatementAnalysisData?.topTransaction?.topDebits.sort((a, b) => {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      if (sortDirection === 'ASC') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  }

  // downloadAnalysisReport() {
  //   // let json = {
  //   //   "profileId":this.bsId
  //   // }

  //   debugger;
  //   this.msmeService.downloadBSAnalysisReport(this.bsId).subscribe(res => {
  //   // this.msmeService.downloadBSAnalysisReport(json).subscribe(res => {
  //     debugger;
  //     if(res && res?.data){
  //       this.blobToFile("asdasd",'xlsx',this.bsId+'');
  //      }else{
  //       this.commonService.errorSnackBar("Not able to download");
  //      }
  //   }, error => {
  //     this.commonService.errorSnackBar(error.message);
  //   })
  //   }

  downloadExcelFile() {
    GlobalHeaders['x-page-action'] = 'Download Excel';
    //console.log"in method");
    const req: any = {};
    req.profileId = this.bsId;
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadBSAnalysisReport(req).subscribe(res => {
      //console.logres);
      //  if (res.status === 200 && res.contentInBytes) {
      //   //  this.downloadExcel(res.contentInBytes, 'BS Analysis_'+this.bsId);
      //    this.downloadZip(res.contentInBytes, 'BS Analysis_'+this.bsId);
      console.log(res);
      if (res.status === 200 && res.fileBytes) {
        //  this.downloadExcel(res.contentInBytes, 'BS Analysis_'+this.bsId);
        this.downloadZip(res.fileBytes, 'BS Analysis_' + this.bsId);


      } else {
        this.commonService.warningSnackBar(res.message);
      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });
  }

  downloadPdfFile() {
    GlobalHeaders['x-page-action'] = 'Download Pdf';
    //console.log"in method");
    const req: any = {};
    req.profileId = this.bsId;
    this.commonService.successSnackBar("Your file is being prepared. The download will begin shortly…");
    this.msmeService.downloadBSAnalysisPdf(req).subscribe(res => {
      if (res.status === 200 && res?.data?.content) {
        console.log("Download BS Analysis PDF >>",res);
      if(res && res?.data && res?.data?.content){
        this.downloadBase64(res.data.content,"BS_Analysis_"+ this.bsId);
       }else{
        this.commonService.errorSnackBar("Not able to download");
       }
      } else {
        this.commonService.warningSnackBar(res.message);
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

  downloadExcel(byteData: string, fileName: string) {
    // Create a Blob from the base64 encoded byte data
    // const blob = this.base64toBlob(byteData, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const blob = this.base64toBlob(byteData, 'application/zip');

    // Create a temporary anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';

    // Create object URL from the Blob
    const url = window.URL.createObjectURL(blob);

    // Set the anchor element's properties
    a.href = url;
    a.download = fileName;

    // Simulate a click event to trigger the download
    a.click();

    // Revoke the object URL to free up resources
    window.URL.revokeObjectURL(url);

    // Remove the temporary anchor element
    a.remove();
  }

  downloadZip(byteData: any, fileName: string) {
    console.log('Received data:', byteData);
    // const byteArray = new Uint8Array(byteData);
    // console.log('Byte array length:', byteArray.length);

    const byteArray = this.base64ToUint8Array(byteData);
    const blob = new Blob([byteArray], { type: 'application/zip' });


    // const blob = new Blob([byteArray], { type: 'application/zip' });
    // const blob = new Blob(byteData);
    // const blob = new Blob(byteData, { type: 'application/zip' });
    // window.URL.createObjectURL(blob);
    //  const blob = this.base64toBlob(byteData, 'application/zip');
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    // link.href = window.URL.createObjectURL(byteData);
    link.download = fileName;  // Set your desired file name
    link.click();
    window.URL.revokeObjectURL(link.href); // Clean up the object URL
  }

  base64toBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64); // Decode Base64
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  navBack(){
    this.router.navigate(['/hsbc/newRmBankStatementAnalysis'],{state: { data: this.pageData }});
  }

  isSubpageIsAvailable(page:any){
    return isSubpageExists(this.pageData,page);
  }

  isActionAvail(actionId: string): boolean {
    let res = false;
    // console.log("******Permission*****");
    // console.log(actionId);
    // console.log(this.pageData);
    if (this.pageData?.subpageId == Constants.pageMaster.BANK_STATEMENT_ANALYSIS2) {
      for (let page of this.pageData?.actions) {
        if (page?.actionId === actionId) {
          res = true; // Return true if found
        }
      }
    } else {
      if (!res) {
        this.pageData?.subpages.forEach(masterPage => {
          if (masterPage?.subpageId == Constants.pageMaster.ANALYTICS) {
            masterPage?.subSubpages.forEach(page => {
              if (page?.subpageId == Constants.pageMaster.BANK_STATEMENT_ANALYSIS) {
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


  // base64toBlob(base64Data: string, contentType: string) {
  //   const byteCharacters = atob(base64Data);
  //   const byteNumbers = new Array(byteCharacters.length);
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }
  //   const byteArray = new Uint8Array(byteNumbers);
  //   return new Blob([byteArray], { type: contentType });
  // }
  // blobToFile(data: any, type: string, fileName: string) {
  //   const a = document.createElement('a');
  //   document.body.appendChild(a);
  //   a.style.display = 'none';
  //   const blob = new Blob([data], { type: type });
  //   const url = window.URL.createObjectURL(blob);
  //   a.href = url; a.download = fileName; a.click();
  //   window.URL.revokeObjectURL(url);
  // }
}

interface BankStatementAnalysisData {
  bsId: number;
  acId?: number;
  accountList?: AccountDetails[];
  summaryInfo?: SummaryInfo;
  monthWiseDetails: KeyValuePair[];
  topTransaction: TopTransaction;
  eodBalances: EODBalance;
}


interface AccountDetails {
  bankName: string;
  accountNo?: string;
  acId?: string;
  accholderName: string;
}


interface SummaryInfo {
  name: string;
  bank: string;
  accountNo: string;
  accountType: string;
  ifsc: string;
  micr: string;
  mobile: string;
  address: string;
  timeperiod: string;
  bankBalanceSummary: BankbankBalanceSummary;
  creditSummary: CreditSummary;
  debitSummary: DebitSummary;
  monthWiseDetails: MonthWiseDetail;
  topTransaction: TopTransaction;
  bounceDetail: BounceDetail;

}

interface BankbankBalanceSummary {
  balAvg: number;
  balMin: number;
  balMax: number;
}

interface BounceDetail {
  checkBounceForLast1Month: number;
  checkBounceForLast6Month: number;
  chequeBounce: number;
}

interface CreditSummary {
  credits: number;
  totalCredit: number;
  totalAvgCredit: number;
}


interface DebitSummary {
  debits: number;
  totalDebit: number;
  totalDebitAvg: number;
}

interface MonthWiseDetail {
  credits: number;
  totalCredit: number;
  debits: number;
  totalDebit: number;
  cashDeposits: number;
  totalCashDeposit: number;
  cashWithdrawals: number;
  totalCashWithdrawal: number;
  chqDeposits: number;
  totalChqDeposit: number;
  chqIssues: number;
  totalChqIssue: number;
  inwBounces: number;
  outwBounces: number;
  neftCredits: number;
  totalNeftCredit: number;
  neftCreditsDebits: number;
  totalNeftDebit: number;
  rtgsCredits: number;
  totalRtgsCredit: number;
  rtgsDebits: number;
  totalRtgsDebit: number;
  upiCredits: number;
  totalUpiCredit: number;
  upiDebits: number;
  totalUpiDebit: number;
  balMin: number;
  balMax: number;
  balAvg: number;
}



interface TopTransaction {
  topDebits: TopDebitCreditDetail[];
  topCredits: TopDebitCreditDetail[];

}

interface TopDebitCreditDetail {
  date: Date;
  narration: number;
  category: number;
  modeOfPayment: number;
  amount: number;
}

interface EODBalance {
  monthWiseEod: MonthWiseEodDetail[];
  dayWiseEod?: DayWiseEodDetail[];
}

interface MonthWiseEodDetail {
  monthName: string;
  eodMondto: MonthEodDetail;
}

interface MonthEodDetail {
  balMin: number;
  balMax: number;
  balAvg: number;
  five: number;
  onefive: number;
  twofive: number;
}

interface DayWiseEodDetail {
  monthName: string;

  monthBalance: DayMonthBalance[];
}

interface DayMonthBalance {
  day: number;
  balance: number;
}

interface KeyValuePair {
  monthName: MonthWiseDetail;
  details: any;
}


//transaction model


interface BankStatementTranaction {
  content: BankStatementTranactionData[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
}

interface BankStatementTranactionData {
  id: number;
  date?: Date;
  chqNo?: string;
  narration?: string;
  amount: number;
  category: string;
  balance: number;
  modeOfPayment: string;
  type: string;
}


interface Pageable {

}


class Pagination {
  pageSize: number = 10;
  startIndex: number = 0;
  endIndex: number = 10;
  totalSize: number = 0;
  page: number = 1;
}


