import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

    private subject = new Subject<any>();
    private abbReportSubject = new Subject<any>();
    private exportReportSubject = new Subject<any>();
    private tracxnUploadSubject = new Subject<any>();
    private preScreenSubject = new Subject<any>();
    private customerRmMappingSubject = new Subject<any>();
    private bankPortfolioReportSubject = new Subject<any>();
    private cibilBulkUploadSubject = new Subject<any>();
    private cibilBureauStatusSubject = new Subject<any>();
    private bsUploadStatusSubject = new Subject<any>();
    private cibilConsumerBureauStatusSubject = new Subject<any>();
    private newIncorporationStatusSubject = new Subject<any>();
    private hsbcStatusSubject = new Subject<any>();
    private hsbcCountryStatusSubject = new Subject<any>();
    private cibilBulkCustomerUploadSubject= new Subject<any>();
    private preScreenPanUploadSubject = new Subject<any>();
    private matchingToolStatusSubject = new Subject<any>();
    private preScreenDownloadSubject = new Subject<any>();
    private preScreenSelectedPanSubject = new Subject<any>();
    private newGccStatusSubject = new Subject<any>();
    private customerUploadSubject = new Subject<any>();
    private consumerCibilBulkCustomerUploadSubject= new Subject<any>();
    private consumerCibilBulkUploadSubject = new Subject<any>();
    private fdiOdiEcbWalletRes = new Subject<any>();
    private eximExportSubject = new Subject<any>();
    private eximImportSubject = new Subject<any>();
    private eximUploadFileStatus = new Subject<any>();
    private hsnUploadFileStatus = new Subject<any>();
    private bankPortfolioUniqueStatusReportSubject = new Subject<any>();
    private OdReportDownloadStatusSubject = new Subject<any>();
    private incomeExcelStatusSubject = new Subject<any>();
    private commercialCrifPRStatusSubject = new Subject<any>();
    private crilcUplodFileStatusSubject = new Subject<any>();
    private crilcDetailsStatusSubject = new Subject<any>();
    private getCampaignDetailsSubject = new Subject<any>();
    private foreignCurrencyStatusUplodSubject = new Subject<any>();
    private helpAndSupportUploadSubject = new Subject<any>();
    private eximInternalDataUploadSubject = new Subject<any>();

    sendHelpAndSupportUploadStatusChangeEvent(message:any){
      this.helpAndSupportUploadSubject.next(message);
    }
    getHelpAndSupportUploadStatusClickEvent(): Observable<any>{
      return this.helpAndSupportUploadSubject.asObservable();
    }
    sendClickEvent(message) {
        console.log("recived message from sendClickEvent", message);
        this.subject.next(message);
    }
    getClickEvent(): Observable<any>{
      return this.subject.asObservable();
    }


    sendAppReportStatusClickEvent(message){
      this.abbReportSubject.next(message);
    }

    getAbbReportStatusClickEvent(): Observable<any>{
      return this.abbReportSubject.asObservable();
    }

    sendExportReportStatusClickEvent(message){
      this.exportReportSubject.next(message);
    }

    getExportReportStatusClickEvent(): Observable<any>{
      return this.exportReportSubject.asObservable();
    }

    sendTracxnUploadStatusClickEvent(message){
      this.tracxnUploadSubject.next(message);
    }

    getTracxnUploadStatusClickEvent(): Observable<any>{
      return this.tracxnUploadSubject.asObservable();
    }

    sendPreScreenStatusClickEvent(message){
      this.preScreenSubject.next(message);
    }

    getPreScreenStatusClickEvent(): Observable<any>{
      return this.preScreenSubject.asObservable();
    }

    sendCustomerRmMappingStatusClickEvent(message){
      this.customerRmMappingSubject.next(message);
    }

    getCustomerRmMappingStatusClickEvent(): Observable<any>{
      return this.customerRmMappingSubject.asObservable();
    }

    sendBankPortfolioStatusClickEvent(message:any){
      this.bankPortfolioReportSubject.next(message);
    }

    getBankPortfolioStatusClickEvent(): Observable<any>{
    return this.bankPortfolioReportSubject.asObservable();
    }

    getBankPortfolioUniqueIFSCReportStatusClickEvent(): Observable<any>{
    return this.bankPortfolioUniqueStatusReportSubject.asObservable();
    }

    sendBankPortfolioUniqueIFSCReportStatusClickEvent(message:any){
    this.bankPortfolioUniqueStatusReportSubject.next(message);
    }

    sendCibilUploadStatusClickEvent(message:any){
    this.cibilBulkUploadSubject.next(message);
    }
    getCibilUploadStatusClickEvent(): Observable<any>{
    return this.cibilBulkUploadSubject.asObservable();
    }

    sendNewIncorporationStatusClickEvent(message:any){
      this.newIncorporationStatusSubject.next(message);
      }
      getNewIncorporationStatusClickEvent(): Observable<any>{
      return this.newIncorporationStatusSubject.asObservable();
      }

    sendCibilBureauFetchStatusClickEvent(message:any){
      this.cibilBureauStatusSubject.next(message);
    }
    getCibilBureauFetchStatusClickEvent(): Observable<any>{
      return this.cibilBureauStatusSubject.asObservable();
    }

    sendCibilConsumerBureauFetchStatusClickEvent(message:any){
      this.cibilConsumerBureauStatusSubject.next(message);
    }
    getCibilConsumerBureauFetchStatusClickEvent(): Observable<any>{
      return this.cibilConsumerBureauStatusSubject.asObservable();
    }

    sendHsbcStatusClickEvent(message:any){
      this.hsbcStatusSubject.next(message);
    }
    getHsbcStatusClickEvent(): Observable<any>{
      return this.hsbcStatusSubject.asObservable();
    }

    sendHsbcCountryStatusClickEvent(message:any){
      this.hsbcCountryStatusSubject.next(message);
    }
    getHsbcCountryStatusClickEvent(): Observable<any>{
      return this.hsbcCountryStatusSubject.asObservable();
    }

    sendBsUploadStatusClickEvent(message:any){
    this.bsUploadStatusSubject.next(message);
    }
    getBsUploadStatusStatusClickEvent(): Observable<any>{
    return this.bsUploadStatusSubject.asObservable();
    }
    sendCibilCustomerUploadStatusClickEvent(message:any){
    this.cibilBulkCustomerUploadSubject.next(message);
    }
    getCibilCustomerUploadStatusClickEvent(): Observable<any>{
    return this.cibilBulkCustomerUploadSubject.asObservable();
    }

    sendPreScreenPanStatusClickEvent(message){
      this.preScreenPanUploadSubject.next(message);
    }

    getPreScreenPANStatusClickEvent(): Observable<any>{
      return this.preScreenPanUploadSubject.asObservable();
    }

    sendMatchingToolStatusClickEvent(message:any){
      this.matchingToolStatusSubject.next(message);
      }
      getMatchingStatusStatusClickEvent(): Observable<any>{
      return this.matchingToolStatusSubject.asObservable();
      }


    sendPreScreenDownloadStatusClickEvent(message){
      this.preScreenDownloadSubject.next(message);
    }

    getPreScreenDownloadStatusClickEvent(): Observable<any>{
      return this.preScreenDownloadSubject.asObservable();
    }

    sendPreScreenSelectedPanClickEvent(message){
      this.preScreenSelectedPanSubject.next(message);
    }

    getPreScreenSelectedPanClickEvent(): Observable<any>{
      return this.preScreenSelectedPanSubject.asObservable();
    }

    sendNewGccReportStatusClickEvent(message){
      this.newGccStatusSubject.next(message);
    }

    getNewGccReportStatusClickEvent(): Observable<any>{
      return this.newGccStatusSubject.asObservable();
    }

    sendCustomerUploadClickEvent(message){
      this.preScreenSelectedPanSubject.next(message);
    }

    getCustomerUploadClickEvent(): Observable<any>{
      return this.preScreenSelectedPanSubject.asObservable();
    }

  sendConsumerCibilCustomerUploadStatusClickEvent(message:any){
    this.consumerCibilBulkCustomerUploadSubject.next(message);
  }
  getConsumerCibilCustomerUploadStatusClickEvent(): Observable<any>{
    return this.consumerCibilBulkCustomerUploadSubject.asObservable();
  }


  sendConsumerCibilUploadStatusClickEvent(message:any){
    this.consumerCibilBulkUploadSubject.next(message);
  }
  getConsumerCibilUploadStatusClickEvent(): Observable<any>{
    return this.consumerCibilBulkUploadSubject.asObservable();
  }

  sendFdiOdiEcbWalletRes(message:any) {
    this.fdiOdiEcbWalletRes.next(message);
  }

  getFdiOdiEcbWalletRes(): Observable<any>{
    return this.fdiOdiEcbWalletRes.asObservable();
  }


  sendEximExportStatusClickEvent(message){
    this.eximExportSubject.next(message);
  }
  getEximExportStatusClickEvent(): Observable<any>{
    return this.eximExportSubject.asObservable();
  }

  sendEximImportStatusClickEvent(message){
    this.eximImportSubject.next(message);
  }
  getEximImportStatusClickEvent():Observable<any>{
    return this.eximImportSubject.asObservable();
  }

  sendEximUploadFileStatusChangeEvent(message){
    this.eximUploadFileStatus.next(message);
  }
  getEximUploadFileStatusChangeEvent():Observable<any>{
    return this.eximUploadFileStatus.asObservable();
  }

  sendHsnUploadFileStatusChangeEvent(message){
    this.hsnUploadFileStatus.next(message);
  }
  getHsnUploadFileStatusChangeEvent():Observable<any>{
    return this.hsnUploadFileStatus.asObservable();
  }

  sendOdReportDownloadStatusChangeEvent(message){
    this.OdReportDownloadStatusSubject.next(message);
  }
  getOdReportDownloadStatusChangeEvent():Observable<any>{
    return this.OdReportDownloadStatusSubject.asObservable();
  }

  sendIncomeExcelStatusChangeEvent(message){
    this.incomeExcelStatusSubject.next(message);
  }
  getIncomeExcelStatusSubjectChangeEvent():Observable<any>{
    return this.incomeExcelStatusSubject.asObservable();
  }

  sendCommercialCRIFPRStatusChangeEvent(message){
    this.commercialCrifPRStatusSubject.next(message);
  }
  getCommercialCRIFPRStatusSubjectChangeEvent():Observable<any>{
    return this.commercialCrifPRStatusSubject.asObservable();
  }

  sendCRILCStatusChangeEvent(message){
    this.crilcUplodFileStatusSubject.next(message);
  }
  getCRILCStatusSubjectChangeEvent():Observable<any>{
    return this.crilcUplodFileStatusSubject.asObservable();
  }

  sendForeignCurrencyTransactionsStatusChangeEvent(message){
    this.foreignCurrencyStatusUplodSubject.next(message);
  }
  getForeignCurrencyTransactionsStatusSubjectChangeEvent():Observable<any>{
    return this.foreignCurrencyStatusUplodSubject.asObservable();
  }

  sendCrilcDetailsStatusChangeEvent(message){
    this.crilcDetailsStatusSubject.next(message);
  }
  getCrilcDetailsSubjectChangeEvent():Observable<any>{
    return this.crilcDetailsStatusSubject.asObservable();
  }
  
  sendGetCampaignDetailsSubject(message){
    this.getCampaignDetailsSubject.next(message);
  }
  getGetCampaignDetailsSubject():Observable<any>{
    return this.getCampaignDetailsSubject.asObservable();
  }

  sendEximInternalDataUploadStatusEvent(message: any) {
    this.eximInternalDataUploadSubject.next(message);
  }

  getEximInternalDataUploadStatusEvent(): Observable<any> {
    return this.eximInternalDataUploadSubject.asObservable();
  }
}
