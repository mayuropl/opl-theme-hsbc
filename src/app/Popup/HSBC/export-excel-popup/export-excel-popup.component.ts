import { event } from 'jquery';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ExcelDownloadService } from 'src/app/CommoUtils/common-services/excel-download.service';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { SharedService } from 'src/app/services/SharedService';
import { MsmeService } from 'src/app/services/msme.service';
import { takeWhile } from 'rxjs/operators';
import { Constants } from 'src/app/CommoUtils/constants';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-export-excel-popup',
  templateUrl: './export-excel-popup.component.html',
  styleUrl: './export-excel-popup.component.scss'
})
export class ExportExcelPopupComponent {
  hidden=false;
  isCustomerProfileChecked: boolean = false;
  isFinancialChecked: boolean = false;
 // isLendingOpportunityChecked: boolean = false;
  isTarget: boolean  = false;
  isETB: boolean  = false;
  IsCrossBordersAndFlowsChecked: boolean = false;
  isLendingOpportunityChecked:boolean=false;
  isRatingAndCodChecked:boolean=false;
  isWpbOpportunityChecked:boolean=false;
  isBureauReportChecked : boolean= false;
  isPreQualifiedProductsChecked : boolean = false;
  isPslReportChecked : boolean = false;
  isComplianceReportChecked : boolean = false;
  isEcbFdiOdiChecked : boolean = false;
  isHsbcWalletChecked : boolean = false;
  isWpbOpportunityCheckBoxSelect:boolean=false;
  isFinancialCheckBoxSelect: boolean = false;
  isCustomerProfileCheckboxSelect: boolean = false;
  isLendingOpportunityCheckBoxSelect:boolean=false;
  isRatingAndCodCheckBoxSelect:boolean=false;
  isCrossBordersAndFlowsCheckBoxSelect: boolean = false;

  isLiabilitiesOpportunityChecked: boolean = false;

  isHsbcCustomerDetailsChecked: boolean = false;
  isMasterGroupChecked : boolean = false;
  isServiceExportChecked: boolean = false;
  makeDisableCheckboxButton = false;
  makeDisableRadioButton = false;

  isPopupOpen = false;

  toolTipMgs = "Selecting this section or any checkboxes from this section will disable all the other sections";

  isDisabled= true;
  bureauReportType: string;

  selectedRowsPerPage = 5; // Default page size
currentPage = 1; // Current page number
pageSizeOptions = [5, 10, 20, 50]; // Page size options
@ViewChild('tabGroup') tabGroup: MatTabGroup;

  CustomerProfileDto = {
    constitutionAsPerGst: false,
    foreignShareholding: false,
    dateOfIncorporation: false,
    pslStatus: false,
    // persona: false,
    industry: false,
    sector: false,
    // bureauVintage: false,
    cin: false,
    listingStatus: false,
    // timeWithHsbc: false,  // added in new section customer details
    pan: false,
    leiNumber: false,
    udayam: false,
    noOfEmployees: false,
    constitutionAsPerMca: false,
    // business:false, // added in new section customer details
    // segment: false,   // added in new section customer details
    // region: false,    // added in new section customer details
    // customerType: false,   // added in new section customer details
    // rmName: false,   // added in new section customer details
    // rmPSID: false,  //added in new section customer details
    agriPsl: false,
    // MSMEPSL: false,
    iec: false,
    leiExpiry: false,
    udyamStatus: false,
    udyamCategory: false,
    gstTurnover: false,
    gstStatus: false
  };

  financials ={
            latestAuditedYear: false,
            nameofAuditor: false,
            auditedTurnover: false,
            // gstTurnover: false,  // // added in customer profile section
            // eximTurnover: false,
            itItesTurnover: false,
            ebitda: false,
            ebitdaPercentage: false,
            pat: false,
            patPercentage: false,
            leverage: false,
            longTermBorrowings: false,
            shortTermBorrowings: false,
            workingCapitalCycle: false,
            payableDaysOnSalesBasis: false,
            daysOfSalesOutstanding: false,
            inventoryDaysSalesBasis: false,
            currentRatio: false,
            interestCoverageRatio: false,
            dscr: false,
            netWorth: false,
            tradePayable: false,
            tradeReceivables: false,
            inventories: false,
            nonCurrentAssets:false,
            assetSize: false,
            netDebtEBITDA:false
  }

  crossBordersAndFlows = {
    // noOfLenders : false,
    // totalSanction : false,
    // sactionWallet : false,
    // mcaOpenCharge : false,
    // countOfEnquiriesInPast12M : false,
    // totalOutstanding : false,
    // utilisationWallet : false,
    // facilitiesFromNBFCOthers : false,
    // availingProducts : false,
    // noOfProductsNotWithHSBC : false,
    // bankingArrangement: false,
    totalExports: false,
    totalImports: false,
    // cashAndBank: false,  //added in new section Liabilities Opportunity
    // fixedDeposits: false,
    // annualTax: false,  //added in new section Liabilities Opportunity
    // annualSalary: false,  //added in new section Liabilities Opportunity
    // currentInvestments: false, // //added in new section Liabilities Opportunity
    ecb: false,
    fdi: false,
    odi: false,
    noOfExportShipment: false,
    noOfImportShipment: false,
    // unbilledRevenue:false,   //added in new section Liabilities Opportunity
    // dividendPaid : false,    //added in new section Liabilities Opportunity
    // dividendPayable : false,  //added in new section Liabilities Opportunity
    // csrObligation : false,   //added in new section Liabilities Opportunity
    // csrAmountSpent : false,   //added in new section Liabilities Opportunity
    // transferToUnspentCsrAc : false   //added in new section Liabilities Opportunity
  }
  lendingOpportunity= {
    dateOfBureauReport: false,
    totalSanction: false,
    totalUtilization: false,
    hsbcSanction: false,
    hsbcUtilization: false,
    cmrScore: false,
    soleMultipleLending: false,
    openCharges: false,
    mcaOpenCharge: false,
    nameOfChargeHolder: false,
    facilitiesFromNBFCAndOthers: false,
    facilitiesFromPrivateAndForeignBanks: false,
    bureauVintage: false,
    isPROrCIR: false,
    facilitiesFromNBFCAndOthersOs: false,
}
ratingAndCod= {
  latestCreditRating: false,
  isRatingType: false,
  ratingAgency: false,
  dateOfRating: false
}
wpbOpportunity = {
  directorRemuneration: false,
  lapLoans: false,
  homeLoans: false,
  cards: false,
  noOfDirectors: false
}

bureauReport = {
  rmName : false,
  segment : false,
  crr : false,
  isBureauReport : false,
  creditRating : false,
  isRatingType : false,
  city : false,
  isDateOfBureau : false,
  bureauDataType: false,
  isProduct : false,
  isOtherSanction : false,
  isOtherUtilization : false,
  isHSBCSaction : false,
  isHSBCUtilization : false,
  isSanctionedBy : false,
  isUtilizedBy : false,
  noOfCreditFacility : false,
  categoryOfLoan : true
}

preQualifiedProducts = {
  rmName : false,
  segment : false,
  crr : false,
  isPrequalifiedProduct : false,
  isRatingType : false,
  isCreditRating : false,
  isApplicationCode : false,
  isProductName : false,
  isAmount : false,
  isDateOfApplication : false,
  isStatus : false,
  isRiskFlag : false,
  isCity : false,
}

pslReportDto= {
  rmName : false,
  segment : false,
  crr : false,
  isPslReport: false,
  msmePsl: false,
  agriPsl: false,
  udyamNumber: false,
  udyamStatus: false,
  udyamCategory: false,
  nicCode: false,
  dateOfIncorporation: false,
  latestAuditedYear: false,
  totalAsset: false,
  exportTurnover: false,
  fundBasedSanction: false,
  fundBasedUtilization: false,
  startUpPsl: false,
  auditedTurnover: false,
  bureauLeading: false,
  totalSanction: false,
  totalUtilization: false,
  // fundBaseSanction: false,
  // fundBaseUtilization: false,
  city: false,
  creditRating: false,
  isRatingType: false,
  industry: false,
  sector: false,
  constitutionAsPerMCA: false,
  constitutionAsPerGST: false,
  auditedTurnoverNetExports: false,
  gstTurnover: false,
  dateOfBureau: false,
  bureauDataType: false,
  hsbcSanction: false,
  hsbcUtilization: false,
  agriExports: false
}

complianceReportDto= {
  rmName : false,
  segment : false,
  crr : false,
  isComplianceReport: false,
  isExcoMatch: false,
   city: false,
   creditRating: false,
   isRatingType: false,
  isConnectedLending: false,
  isBlacklistedAuditor: false,
  isStrikeOff5: false,
  isStrikeOff7: false,
  isRBIWilfulDflt: false,
  isSuitFiled: false,
  isNctl: false,
  // startup: false
  shellCompany: false,
  disqualifiedUs164Pdf: false,
  disqualifiedUs164Din: false,
  legalDefaults: false,
  litigations: false,

}

ecbFdiOdiReportDto= {
  rmName : false,
  segment : false,
  crr : false,
  creditRating : false,
  isRatingType : false,
  city : false,
  isEcbFdiOdiReportDto: false,
  // city: false,
  isFdiDate: false,
  isForeignCollaborator: false,
  isCountry: false,
  isItemofManufacture: false,
  isFDIInflows: false,
  isECBFCCBDate: false,
  isRoute: false,
  isEquicalentAmount: false,
  isPurpose: false,
  isMaturityPeriod: false,
  isODIDate: false,
  isNameoftheJVWOS: false,
  isWhetherJointVentureSubsidiary: false,
  isOverseasCountry: false,
  isMajorActivity: false,
  isEquity: false,
  isLoan: false,
  isGuaranteeIssues: false,
  isTotalAmount: false
}

hsbcWalletReportDto={
  isHsbcWalletReportDto : false,
  customerId : false,
  customerName : false,
  rmName : false,
  segment : false,
  hsbcFdi : false,
  hsbcOdi : false,
  hsbcEcb : false,
  totalFdi : false,
  totalOdi : false,
  totalEcb : false,
  walletFdi : false,
  walletOdi : false,
  walletEcb : false,
  hsbcImport : false,
  hsbcExport : false,
  totalImport : false,
  totalExport : false,
  walletImport : false,
  walletExport : false
}

liabilitiesOpportunity = {
    cashAndBank: false,
    currentInvestments: false,
    annualTax: false,
    annualSalary: false,
    unbilledRevenue:false,
    dividendPaid : false,
    dividendPayable : false,
    csrObligation : false,
    csrAmountSpent : false,
    transferToUnspentCsrAc : false,
    cyChurnPer : false,
    pyChurnPer: false

}

hsbcCustomerDetails = {
    rmName: false,
    rmPSID: false,
    business: false,
    segment: false,
    region: false,
    city: false,
    customerType: false,
    crr: false,
    lastApprovedDate: false,
    nextReviewDate: false,
    cddDate: false,
    cddRiskRating: false,
    timeWithHsbc: false
}

  mastergroupIncomeReportDto = {
    isMasterGroupReportDto : false,
    mastergroupName: false,
    segment: false,
    derivedSegment: false,
    customerId: false,
    customerName: false,
    rmName: false,
    city: false,
    previousYearIncome: false,
    currentYearIncome: false
  }

  serviceExportReportDto = {
    isServiceExportReport: false,
    name: false,
    cin: false,
    pan: false,
    exportRevenueServices: false,
    nicCode: false,
    nicHead: false,
    nicSubHead: false,
    yearCategory: false
  }

  customerDataDto = {
    customerProfile: this.CustomerProfileDto,
    // financials: this.financials,
    crossBordersAndFlows: this.crossBordersAndFlows,
    financials:this.financials,
    lendingOpportunity:this.lendingOpportunity,
    ratingAndCod:this.ratingAndCod,
    wpbOpportunity:this.wpbOpportunity,
    bureauReport : this.bureauReport,
    preQualifiedProducts : this.preQualifiedProducts,
    pslReportDto : this.pslReportDto,
    complianceReportDto : this.complianceReportDto,
    ecbFdiOdiReportDto : this.ecbFdiOdiReportDto,
    hsbcCustomerDetails: this.hsbcCustomerDetails,
    liabilitiesOpportunity: this.liabilitiesOpportunity,
    hsbcWalletReportDto : this.hsbcWalletReportDto,
    mastergroupIncomeReportDto: this.mastergroupIncomeReportDto,
    serviceExportReportDto: this.serviceExportReportDto
  }




  filterRequest:any = {};
  roleId;
  selectedValue;
  private subscription: Subscription;

  constructor(public dialogRef: MatDialogRef<ExportExcelPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private excelDownload : ExcelDownloadService, private msmeService: MsmeService, private commonService: CommonService,
     public http: HttpClient, private sharedService: SharedService, private cd: ChangeDetectorRef) {
    console.log(data);
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));

    if(this.data.type === 'ETB'){
      this.isETB = true;
    }

    if(this.data.type === 'TARGET'){
      this.isTarget = true;
    }
    this.filterRequest = data;
    console.log('this.filterRequest: ', this.filterRequest);
    this.getReportStatus();
    // this.openPopup();

    this.initialize();

  }

  private initialize() {
    this.subscription = this.sharedService.getExportReportStatusClickEvent().subscribe((message)=>{
      console.log("Message recieved from export");
      // this.fetchDataFromWebSocket(message);
      this.handleWebSocketMessage(message);
  })
}

private debounceTimer: any;

handleWebSocketMessage(message: any) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      console.log('this.debounceTimer: ', this.debounceTimer);
        this.fetchDataFromWebSocket(message);
    }, 1000);
}

ngOnDestroy() {
  if (this.subscription) {
      this.subscription.unsubscribe();
  }
}

fetchDataFromWebSocket(responseFromWebSocket?){
  responseFromWebSocket = JSON.parse(responseFromWebSocket);
    // this.fetchHistory(responseFromWebSocket?.response)
    this.reportStatuses = responseFromWebSocket?.response;
    this.reportStatuses = this.reportStatuses.filter(item => item.customerType == this.data.type)
    // if(responseFromWebSocket?.contentInBytes){
    //   this.excelDownload.downloadExcel(responseFromWebSocket?.contentInBytes, responseFromWebSocket?.fileName + new Date());
    // }
    console.log("bucketReferenceId",responseFromWebSocket?.bucketReferenceId)
    if(responseFromWebSocket?.bucketReferenceId && responseFromWebSocket?.fileName){
      console.log("bucketReferenceId",responseFromWebSocket.bucketReferenceId)
      this.downloadExportReport(responseFromWebSocket?.bucketReferenceId,responseFromWebSocket?.fileName);
    }
}

get paginatedReportStatuses(): any[] {
  const startIndex = (this.currentPage - 1) * this.selectedRowsPerPage;
  return this.reportStatuses.slice(startIndex, startIndex + this.selectedRowsPerPage);
}


changePageSize(newSize: number) {
  this.selectedRowsPerPage = newSize;
  this.currentPage = 1; // Reset to first page
}


  // checked all the customer profile checkboxes
  onCustomerProfileChange(event: any): void {
    this.isCustomerProfileChecked = event.checked;
    for (const key in this.CustomerProfileDto) {
      this.CustomerProfileDto[key] = this.isCustomerProfileChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual customer profile checkbox
  onCustomerProfileCheckboxChange(): void {
    this.isCustomerProfileChecked = Object.values(this.CustomerProfileDto).every(checked => checked);
    this.isAnyOneSelected();
  }

  isAnyMainSelected(){
    if(this.isCustomerProfileChecked || this.isFinancialChecked || this.IsCrossBordersAndFlowsChecked
      || this.isWpbOpportunityChecked || this.isRatingAndCodChecked || this.isLendingOpportunityChecked){
      this.makeDisableAllRadio(true);
    }
    else{
      this.makeDisableAllRadio(false);
    }
  }

  isAnyOneSelected(){
    this.isCustomerProfileCheckboxSelect = Object.values(this.CustomerProfileDto).some(checked => checked);
    this.isFinancialCheckBoxSelect = Object.values(this.financials).some(checked => checked);
    this.isCrossBordersAndFlowsCheckBoxSelect = Object.values(this.crossBordersAndFlows).some(checked => checked);
    this.isLendingOpportunityCheckBoxSelect = Object.values(this.lendingOpportunity).some(checked => checked);
    this.isRatingAndCodCheckBoxSelect = Object.values(this.ratingAndCod).some(checked => checked);
    this.isWpbOpportunityCheckBoxSelect = Object.values(this.wpbOpportunity).some(checked => checked);
    if(this.isCustomerProfileCheckboxSelect || this.isFinancialCheckBoxSelect || this.isCrossBordersAndFlowsCheckBoxSelect
      || this.isLendingOpportunityCheckBoxSelect || this.isRatingAndCodCheckBoxSelect || this.isWpbOpportunityCheckBoxSelect){
      this.makeDisableNewColumns(true);
    }
    else{
      this.makeDisableNewColumns(false);
    }
  }

// Checked all the Financial checkboxes
  onFinancialsChange(event: any): void {
    this.isFinancialChecked = event.checked;
    for (const key in this.financials) {
      this.financials[key] = this.isFinancialChecked;
    }
    this.isAnyMainSelected();
  }

   // Check individual Liabilities Opportunity checkbox
  onLiabilitiesOpportunityCheckboxChange(){
     this.isLiabilitiesOpportunityChecked = Object.values(this.liabilitiesOpportunity).every(checked => checked);
    this.isAnyOneSelected();
  }

  // Checked all the Liabilities Opportunity checkboxes
  onLiabilitiesOpportunityChange(event: any): void {
     this.isLiabilitiesOpportunityChecked = event.checked;
    for (const key in this.liabilitiesOpportunity) {
      this.liabilitiesOpportunity[key] = this.isLiabilitiesOpportunityChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual Hsbc Customer Details checkbox
  onHsbcCustomerDetailsCheckboxChange(){
    this.isHsbcCustomerDetailsChecked = Object.values(this.hsbcCustomerDetails).every(checked => checked);
    this.isAnyOneSelected();
  }

  // Checked all the Hsbc Customer Details checkboxes
  onHsbcCustomerDetailsChange(event: any): void{
    this.isHsbcCustomerDetailsChecked = event.checked;
    for (const key in this.hsbcCustomerDetails) {
      if (this.isETB === false && (key === 'lastYearRevenue' || key === 'currentYearRevenue'))
      this.hsbcCustomerDetails[key] = false;
      else this.hsbcCustomerDetails[key] = this.isHsbcCustomerDetailsChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual Financials profile checkbox
  onFinancialsCheckboxChange(): void {
    this.isFinancialChecked = Object.values(this.financials).every(checked => checked);
    this.isAnyOneSelected();
  }

  // Checked all the Lending opportunity checkboxes
  onCrossBordersAndFlowsChange(event: any): void {
    this.IsCrossBordersAndFlowsChecked = event.checked;
    for (const key in this.crossBordersAndFlows) {
      this.crossBordersAndFlows[key] = this.IsCrossBordersAndFlowsChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual Lending opportunity profile checkbox
  onCrossBordersAndFlowsCheckboxChange(): void {
    this.IsCrossBordersAndFlowsChecked = Object.values(this.crossBordersAndFlows).every(checked => checked);
    this.isAnyOneSelected();
  }
  onLendingOpportunityChange(event: any): void {
    this.isLendingOpportunityChecked = event.checked;
    for (const key in this.lendingOpportunity) {
      this.lendingOpportunity[key] = this.isLendingOpportunityChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual customer profile checkbox
  onLendingOpportunityCheckedCheckboxChange(): void {
    this.lendingOpportunity.isPROrCIR =  true;
   // this.isLendingOpportunityChecked = Object.values(this.lendingOpportunity).every(checked => checked);
   this.isAnyOneSelected();
  }

  onRatingAndCodeChange(event: any): void {
    this.isRatingAndCodChecked = event.checked;
    for (const key in this.ratingAndCod) {
      this.ratingAndCod[key] = this.isRatingAndCodChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual ratingAndCod profile checkbox
  onRatingAndCodCheckedCheckboxChange(): void {
    this.isRatingAndCodChecked = Object.values(this.ratingAndCod).every(checked => checked);
    this.isAnyOneSelected();
  }

  onWpbOpportunityChange(event: any): void {
    this.isWpbOpportunityChecked = event.checked;
    for (const key in this.wpbOpportunity) {
      this.wpbOpportunity[key] = this.isWpbOpportunityChecked;
    }
    this.isAnyMainSelected();
  }

  // Check individual wpbOpportunity profile checkbox
  onWpbOpportunityCheckboxChange(): void {
    this.isWpbOpportunityChecked = Object.values(this.wpbOpportunity).every(checked => checked);
    this.isAnyOneSelected();
  }

  closeDialog(): void {
    this.isPopupOpen = false;
    this.dialogRef.close();
  }

  submitData(){
    if(this.commonService.isObjectNullOrEmpty(this.customerDataDto)) {
      this.commonService.warningSnackBar("Please select data");
      return;
    }
    if(this.customerDataDto.bureauReport.isBureauReport && this.commonService.isObjectNullOrEmpty(this.bureauReportType)) {
      this.commonService.errorSnackBar("Please select dropdown value");
      return;
    }else{
      this.filterRequest.bureauReportType =  this.bureauReportType;
    }

    const nestedObjects = Object.values(this.customerDataDto);

    const allFalse = nestedObjects.every(obj => {
      if (typeof obj !== 'object' || obj === null) {
        return true;
      }
      return Object.values(obj).every(val => val === false);
    });

    if (allFalse) {
      this.commonService.warningSnackBar("Select one category");
      return;
    }

    // if(!this.commonService.isObjectNullOrEmpty(this.bureauReportType) && !this.customerDataDto.bureauReport.isBureauReport){
    //   this.selectAllBureau(true)
    // }
    this.filterRequest.customerDataDto = this.customerDataDto;
    this.filterRequest.roleId = this.roleId
    this.commonService.successSnackBar('Your file is being prepared. The download will begin shortly…')
    this.msmeService.getDashboardExcelDownload(this.filterRequest).subscribe((res) =>{
      // this.getReportStatus();

      if(!this.commonService.isObjectIsEmpty(res?.listData)){
        // this.reportStatuses = res?.listData
        this.reportStatuses = res?.listData.filter(item => item.customerType == this.data.type)
        this.cd.detectChanges();
      }

      // if (res.status === 200 && res.contentInBytes) {
      //   // this.commonService.successSnackBar(res.message);
      //   this.excelDownload.downloadExcel(res.contentInBytes, "Export_Customer"+ new Date());
      // } else {
      //   // this.commonService.warningSnackBar(res.message);
      // }
      if (res.status === 200 && res.bucketReferenceId) {
        this.downloadExportReport(res?.bucketReferenceId,res?.fileName);
      } else {
        // this.commonService.warningSnackBar(res.message);
      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });

    // if(this.customerDataDto.bureauReport.isBureauReport
    //   || this.customerDataDto.preQualifiedProducts.isPrequalifiedProduct
    //   || this.customerDataDto.pslReportDto.isPslReport){
    //   this.tabGroup.selectedIndex = 2;
    // }
    // else{
    //   this.isPopupOpen = false;
    //   this.dialogRef.close();
    // }
    this.tabGroup.selectedIndex = 2;
  }


  makeDisableNewColumns(isSelected?){
      this.makeDisableRadioButton = isSelected;
  }

  makeDisableAllRadio(isSelected?){
    this.makeDisableRadioButton = isSelected;
}

  makeDisableOldColumns(){
    this.makeDisableCheckboxButton = true;
  }


  onBureauReportChangeReset(){

    // reseting customer profile
    this.isCustomerProfileChecked = false;
    this.resetSelectedData(this.CustomerProfileDto)

    // reseting HSBC customer details
    this.isHsbcCustomerDetailsChecked = false;
    this.resetSelectedData(this.hsbcCustomerDetails);

    // reseting rating and code
    this.isRatingAndCodChecked = false;
    this.resetSelectedData(this.ratingAndCod);

    // reseting financials
    this.isFinancialChecked = false;
    this.resetSelectedData(this.financials);

    // reseting liabilities
    this.isLiabilitiesOpportunityChecked = false;
    this.resetSelectedData(this.liabilitiesOpportunity);

    //reseting leading opportunity
    this.isLendingOpportunityChecked = false;
    this.resetSelectedData(this.lendingOpportunity);

    // reseting cross border flow
    this.IsCrossBordersAndFlowsChecked = false;
    this.resetSelectedData(this.crossBordersAndFlows);

    // reseting wpb opportunity
    this.isWpbOpportunityChecked = false;
    this.resetSelectedData(this.wpbOpportunity);

  }

  resetSelectedData(report){
    Object.keys(report).forEach(key => {
      report[key] = false;
    });
  }

  onCustomeReportChangeReset(){
    this.selectedValue = null;
    // reseting burea report
    this.resetSelectedData(this.bureauReport)

    // reseting pre qualified products
    this.resetSelectedData(this.preQualifiedProducts)

    // reseting psl report
    this.resetSelectedData(this.pslReportDto)

    // reseting compliance report
    this.resetSelectedData(this.complianceReportDto)

    // reseting ecb, fdi, odi report
    this.resetSelectedData(this.ecbFdiOdiReportDto)

    // reseting hsbc wallet report
    this.resetSelectedData(this.hsbcWalletReportDto)

    // reseting service export report
    this.resetSelectedData(this.serviceExportReportDto)

  }

  tabChange(){
    if(this.tabGroup.selectedIndex == 0){
      this.onCustomeReportChangeReset();
    }

    if (this.tabGroup.selectedIndex == 1) {
      this.onBureauReportChangeReset();
    }

    if(this.tabGroup.selectedIndex == 2){
      this.onCustomeReportChangeReset();
      this.onBureauReportChangeReset();
    }
  }

  onBureauReportChange(event : any){
    this.makeDisableOldColumns();

// Make checked values to unckecked
    if(event.value == undefined){
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllComplianceReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 1){
      this.selectAllBureau(true)
      this.selectAllPreQualified(false)
      this.selectAllPslReport(false)
      this.selectAllComplianceReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 2){
      this.selectAllPreQualified(true)
      this.selectAllBureau(false)
      this.selectAllPslReport(false)
      this.selectAllComplianceReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 3){
      this.selectAllPslReport(true)
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllComplianceReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 4){
      this.selectAllComplianceReport(true)
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllPslReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 5){
      this.selectAllComplianceReport(false)
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllPslReport(false)
      this.selectAllECbFdiOdiReport(true)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 6){
      this.selectAllComplianceReport(false)
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllPslReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(true)
      this.selectAllMasterGroupReport(false)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 7){
      this.selectAllComplianceReport(false)
      this.selectAllPreQualified(false)
      this.selectAllBureau(false)
      this.selectAllPslReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(true)
      this.selectAllServiceExportReport(false)
    }

    if(event.value == 8){
      this.selectAllServiceExportReport(true)
      this.selectAllBureau(false)
      this.selectAllPreQualified(false)
      this.selectAllPslReport(false)
      this.selectAllComplianceReport(false)
      this.selectAllECbFdiOdiReport(false)
      this.selectAllHsbcWalletReport(false)
      this.selectAllMasterGroupReport(false)
    }

  }

  selectAllBureau(checked:boolean){
    this.isBureauReportChecked = checked;
    for(const key in this.bureauReport){
      this.bureauReport[key] = checked;
    }
  }

  selectAllPreQualified(checked:boolean){
    this.isPreQualifiedProductsChecked = checked;
      for(const key in this.preQualifiedProducts){
        this.preQualifiedProducts[key] = checked;
      }
  }

  selectAllPslReport(checked:boolean){
    this.isPslReportChecked = checked;
      for(const key in this.pslReportDto){
        this.pslReportDto[key] = checked;
      }
  }

  selectAllComplianceReport(checked:boolean){
    this.isComplianceReportChecked = checked;
      for(const key in this.complianceReportDto){
        this.complianceReportDto[key] = checked;
      }
  }

  selectAllECbFdiOdiReport(checked:boolean){
    this.isEcbFdiOdiChecked = checked;
      for(const key in this.ecbFdiOdiReportDto){
        this.ecbFdiOdiReportDto[key] = checked;
      }
  }

  selectAllHsbcWalletReport(checked:boolean){
    this.isHsbcWalletChecked = checked;
    for(const key in this.hsbcWalletReportDto){
      this.hsbcWalletReportDto[key] = checked;
    }
  }

  selectAllMasterGroupReport(checked:boolean){
    this.isMasterGroupChecked = checked;
    for(const key in this.mastergroupIncomeReportDto){
      this.mastergroupIncomeReportDto[key] = checked;
    }
  }

  selectAllServiceExportReport(checked: boolean) {
    this.isServiceExportChecked = checked;
    for (const key in this.serviceExportReportDto) {
      this.serviceExportReportDto[key] = checked;
    }
  }

 // Check individual customer profile checkbox
 onBureauReportCheckboxChange(): void {
  this.isBureauReportChecked = Object.values(this.bureauReport).every(checked => checked);
}

reportStatuses: any[] = []; // Store fetched data

getReportStatus(): void {
  this.msmeService.getReportStatus().subscribe(res => {
    console.log("response=========", res);
    this.reportStatuses = res; // Assign response data to the array
    this.reportStatuses = this.reportStatuses.filter(item => item.customerType == this.data.type)

  });
}

// Function to open the popup and start auto-refresh
// openPopup(): void {
//   this.isPopupOpen = true;
//   this.startAutoRefress();
// }

// startAutoRefress(): void {
//   setInterval(() => {
//     if (this.isPopupOpen) {
//         this.getReportStatus();
//     }
//   }, 5000); // Calls every 5,000 milliseconds (5 sec)
// }
reportFail(): void {
  this.msmeService.reportFail().subscribe(res => {
    console.log("Report fail triggered:", res);
  });
}

downloadExportReport(docReferenceId,reportName){
  this.downloadTemplate(docReferenceId,reportName);
}

downloadTemplate(docReferenceId,reportName) {
  this.downloadFileFromBucket(docReferenceId,'txt').subscribe(blob => {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = reportName+'.xlsx';  // Update with the actual file name and extension
    a.click();
    URL.revokeObjectURL(objectUrl);
  });
}

encryptedObject(data) {
  return { data: AesGcmEncryptionService.getEncPayload(data) };
}

downloadFileFromBucket(fileName: string, extension: string): Observable<Blob> {
  let createMasterJson: any = {};
  createMasterJson["fileName"] = fileName;
  createMasterJson["extension"] = extension;
  return this.http.post(RestUrl.GET_FILE_FROM_BUCKET, this.encryptedObject(createMasterJson), { responseType: 'blob' }).pipe(
  map((res: Blob) => {
    return new Blob([res], { type: res.type });
  })
  );
}


}
