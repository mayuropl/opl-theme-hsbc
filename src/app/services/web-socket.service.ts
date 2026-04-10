import { Injectable, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { RestUrl } from '../CommoUtils/resturl';
import { CommonService } from '../CommoUtils/common-services/common.service';
import { Constants } from '../CommoUtils/constants';
import { SharedService } from './SharedService';
import { Client, Stomp } from '@stomp/stompjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnInit {

  userId: any;
  private socketClient1:any = null;
  private socketClient: Client | null = null;
  private socketClient3: Client | null = null;
  private socketUrl: string = RestUrl.WEB_SOCKET_URL;
  private socketUrlForDashboardService: string = RestUrl.WEB_SOCKET_URL_FOR_DS;
    private  messageSubject = new BehaviorSubject<string[]>([]);
  public messages$ = this.messageSubject.asObservable();

  constructor(public commonService: CommonService, private sharedService:SharedService) {
    this.timeDelayConnection();
  }

  ngOnInit(): void {

    console.log("Into websocket service");
    // this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    // if(this.userId == null || this.userId == 0){
    //   console.log("User Id is null or Empty try with re login :::::::::::::::::>");
    // }
    // // this.connectWs1();
    // this.connectWs2();



    this.sharedService.sendClickEvent("Hello from websocket");
  }


  async timeDelayConnection() {
    console.log("Start :::::::::::::::::::>");
    await this.sleep(3000);
    console.log("Ending :::::::::::::::::::>");
    this.connectionWS();

  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  connectionWS(){
    if (environment.staticDemo) {
      return;
    }

    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    if(this.userId == null || this.userId == 0){
      console.log("User Id is null or Empty try with re login :::::::::::::::::>");
    }
    // this.connectWs1();
    this.connectWs2();
    this.connectWs3();
  }




  // connectWs1 ----------------->
  connectWs1(){
    console.log('connectWs 1 :::::::::::::::::::::::::>');
    const ws = new SockJS(this.socketUrl);
    ws.onclose = (event) => {
      console.error("WebSocket connection closed: ", event);
      this.callBackOnError1(event);
    };
    this.socketClient1 = Stomp.over(ws);
    const headers = {
      'req_auth': 'true',
      'user-id': 'your-personal-user-id', // Add your custom header here
      'Authorization': 'Bearer your-token', // Example of another custom header for auth
    };
    this.socketClient1.connect(headers, () => {
      console.log("Connection to WS ....");
      this.socketClient.subscribe(`6/queue/notification`, (message: any) => {
          this.onMessageReceived1(message);
        });
      },
      (error) => {
        console.error("STOMP connection error:", error);
        this.callBackOnError1(error); // Call your custom error handler
      });
  }

  onMessageReceived1(message: any) {
    console.log('onMessageReceived ::::::> ', message);
    const finalMessage = JSON.parse(message.body);
    console.log('onMessageReceived Body::::::> ', finalMessage);
    // this.messageSubject.next(finalMessage);
  }

  callBackOnError1(error: any) {
    console.log('Error Make Connection ---> ',error);
    setTimeout(() => {
      this.connectWs1();
    }, 500);
  }

  disconnectSocket1() {
    if(this.socketClient1 != null) {
      this.socketClient1.disconnect();
      console.log('Socket Client Is Disconnected Successfully');
    }
    else{
      console.log('Error while Disconnected Socket Client');
    }
  };

  // connectWs2 ----------------->
  connectWs2(){

    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    if(this.userId == null || this.userId == 0){
      console.log("User Id is null or Empty try with re login :::::::::::::::::>");
    }

    // This code is for safe side to prevent userId is not null and 0
    // console.log("Before if conditon in connectWs2() user Id >>>>>>> ",this.userId);
    // if(this.userId == undefined || this.userId == null || this.userId == 0){
    //   console.log("User Id is null or Empty try with re login :::::::::::::::::>");
    //   this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    //   console.log("After if conditon in connectWs2() user Id >>>>>>> ",this.userId);
    // }

    console.log('connectWs 2 ::::::::::::::::::::::>');
    const ws = new SockJS(this.socketUrl);
    this.socketClient = new Client({
      webSocketFactory: () => new SockJS(this.socketUrl), reconnectDelay: 6000, debug: (str) => { console.log("webSocketFactory::> ",str);}
    });

    this.socketClient.onConnect = (frame) => {
      console.log('socketClient2 Connected:::> ', frame);

      // this.onAfterConnect2({ username: 'ravi_testing' });

      this.socketClient.subscribe(`/user/${this.userId}/queue/notification`, (message) => {
        console.log('queue/notification ::::::::::::::> ', message);
        this.onMessageReceived2(message);
      });

      // this.socketClient.subscribe('/topic/notifications', (message) => {
      //   console.log('/topic/notifications::::::::::::::> ', message);
      //   // this.onMessageReceived2(message);
      // });

    };
    this.socketClient.onStompError =  (frame) => {
      console.log('Stomp Error:::::> ', frame);
      // this.connectWs2();
    }
    this.socketClient.activate();
  };

  connectWs3(){
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    if(this.userId == null || this.userId == 0){
      console.log("User Id is null or Empty try with re login :::::::::::::::::>");
    }

    console.log('connectWs 3 ::::::::::::::::::::::>');
    this.socketClient3 = new Client({
      webSocketFactory: () => new SockJS(this.socketUrlForDashboardService), reconnectDelay: 6000, debug: (str) => { console.log("webSocketFactory::> ",str);}
    });

    this.socketClient3.onConnect = (frame) => {
      console.log('socketClient3 Connected:::> ', frame);

      // this.onAfterConnect2({ username: 'ravi_testing' });

      this.socketClient3.subscribe(`/user/${this.userId}/queue/notification`, (message) => {
        console.log('queue/notification ::::::::::::::> ', message);
        this.onMessageReceived2(message);
      });

      // this.socketClient.subscribe('/topic/notifications', (message) => {
      //   console.log('/topic/notifications::::::::::::::> ', message);
      //   // this.onMessageReceived2(message);
      // });

    };
    this.socketClient3.onStompError =  (frame) => {
      console.log('Stomp Error:::::> ', frame);
      // this.connectWs2();
    }
    this.socketClient3.activate();
  };

  onMessageReceived2(message: any) {
    const finalMessage = JSON.parse(message.body);
    console.log('onMessageReceived Body::::::> ', finalMessage);
    const currentMessage = this.messageSubject.value;
    this.messageSubject.next([...currentMessage, finalMessage]);

    if(finalMessage.reqType == "ABB_REPORT_STATUS"){
      this.sharedService.sendAppReportStatusClickEvent(message.body)
    }
    else if(finalMessage.reqType == "EXPORT_REPORT_STATUS"){
      this.sharedService.sendExportReportStatusClickEvent(message.body)
    } else if(finalMessage.reqType == "PRESCREEN_STATUS"){
      this.sharedService.sendPreScreenStatusClickEvent(message.body)
    }
    else if(finalMessage.reqType == "TRACXN_EXCEL_STATUS"){
      console.log('successfully recieved messgae..... TRACXN_EXCEL_STATUS');
      this.sharedService.sendTracxnUploadStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "CUSTOMER_RM_STATUS"){
      this.sharedService.sendCustomerRmMappingStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "BANK_PORTFOLIO_STATUS"){
      console.log('successfully recieved messgae..... BANK_PORTFOLIO_STATUS');
      this.sharedService.sendBankPortfolioStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "CIBIL_UPLOAD_STATUS"){
      console.log('successfully recieved messgae..... CIBIL_UPLOAD_STATUS');
      this.sharedService.sendCibilUploadStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "CIBIL_BUREAU_FETCH_STATUS"){
      console.log('successfully recieved messgae..... CIBIL_BUREAU_FETCH_STATUS');
      this.sharedService.sendCibilBureauFetchStatusClickEvent(message.body)
    }else if (finalMessage.reqType === 'BANK_STATEMENT_UPLOAD_STATUS'){
      console.log('successfully recieved message..... BANK_STATEMENT_UPLOAD_STATUS');
      this.sharedService.sendBsUploadStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "CIBIL_CONSUMER_BUREAU_FETCH_STATUS"){
      console.log('successfully recieved messgae..... CIBIL_CONSUMER_BUREAU_FETCH_STATUS');
      this.sharedService.sendCibilConsumerBureauFetchStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "NEW_INCORPORATION_STATUS"){
      console.log('successfully recieved messgae..... NEW_INCORPORATION_STATUS');
      this.sharedService.sendNewIncorporationStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "HSBC_BANKING_STATUS"){
      console.log('successfully recieved messgae..... HSBC_BANKING_STATUS');
      this.sharedService.sendHsbcStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "HSBC_COUNTRY_STATUS"){
      console.log('successfully recieved messgae..... HSBC_COUNTRY_STATUS');
      this.sharedService.sendHsbcCountryStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "SELECTED_CUSTOMER_FILE_IS_GENERATED_STATUS"){
      console.log('successfully recieved messgae..... CIBIL_BULK_CUSTOMER_UPLOAD');
      this.sharedService.sendCibilCustomerUploadStatusClickEvent(message.body);
    } else if(finalMessage.reqType == "PRESCREEN_PAN_STATUS"){
      this.sharedService.sendPreScreenPanStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "MATCHING_TOOLING_STATUS"){
      console.log('successfully recieved messgae..... MATCHING_TOOLING_STATUS');
      this.sharedService.sendMatchingToolStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "PRESCREEN_DOWNLOAD_STATUS"){
           this.sharedService.sendPreScreenDownloadStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "PRESCREEN_SELECTED_PAN_STATUS"){
      this.sharedService.sendPreScreenSelectedPanClickEvent(message.body)
    }else if(finalMessage.reqType == "NEW_GCC_STATUS"){
      this.sharedService.sendNewGccReportStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "CUSTOMER_UPLOAD_STATUS"){
      this.sharedService.sendCustomerUploadClickEvent(message.body)
    }else if(finalMessage.reqType == "CONSUMER_UPLOAD_STATUS"){
      this.sharedService.sendConsumerCibilUploadStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "CONSUMER_SELECTED_CUSTOMER_FILE_IS_GENERATED_STATUS"){
      this.sharedService.sendConsumerCibilCustomerUploadStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "EXIM_EXPORT_WALLET"){
      this.sharedService.sendEximExportStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "EXIM_IMPORT_WALLET"){
      this.sharedService.sendEximImportStatusClickEvent(message.body);
    }else if(finalMessage.reqType == "FDI_ODI_ECB_WALLET"){
      this.sharedService.sendFdiOdiEcbWalletRes(message.body)
    }else if(finalMessage.reqType == "BANK_STATEMENT_UPLOAD_UNIQUE_ACC_IFSC_STATUS"){
      this.sharedService.sendBankPortfolioUniqueIFSCReportStatusClickEvent(message.body)
    }else if(finalMessage.reqType == "EXIM_DASHBOARD_UPDATE_UPLOADED_FILE_STATUS"){
      this.sharedService.sendEximUploadFileStatusChangeEvent(message.body)
    }else if(finalMessage.reqType == "OPPORTUNITY_DASHBOARD_DOWNLOAD_REPORT_STATUS"){
      this.sharedService.sendOdReportDownloadStatusChangeEvent(message.body)
    }else if(finalMessage.reqType == 'INCOME_EXCEL_STATUS'){
      this.sharedService.sendIncomeExcelStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'HSN_BULK_STATUS'){
      this.sharedService.sendHsnUploadFileStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'CRIF_BULK_UPLOAD_STATUS'){
      this.sharedService.sendCommercialCRIFPRStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'CRILC_BULK_UPLOAD_STATUS'){
      this.sharedService.sendCRILCStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'CRILC_AUDIT_REPORT_UPLOAD_STATUS'){
      this.sharedService.sendCrilcDetailsStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'FOREIGN_CURRENCY_BULK_UPLOAD_STATUS'){
      this.sharedService.sendForeignCurrencyTransactionsStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == 'HELP_AND_SUPPORT_UPLOAD'){
      this.sharedService.sendHelpAndSupportUploadStatusChangeEvent(message.body);
    }else if(finalMessage.reqType == "EXIM_INTERNAL_DATA"){
      this.sharedService.sendEximInternalDataUploadStatusEvent(message.body);
    }

    else{
      this.sharedService.sendClickEvent(message.body)
    }

  }

  sendPrivateMessage2(message: string) {
    console.log('Send message: ', message);
    if (this.socketClient?.connected) {
      this.socketClient?.publish({
        destination: '/app/private-message',
        body: JSON.stringify({ messageContent: message })
      });
    };
  };

  onAfterConnect2(body: any){
    this.socketClient.publish({destination: '/app/connect', body: body});
  }

  disconnectWs2() {
    if(this.socketClient != null) {
      this.socketClient.onDisconnect;
      console.log('Socket Client Is Disconnected Successfully');
    }
    else{
      console.log('Error while Disconnected Socket Client');
    }
  };

  disconnectWs3() {
    if(this.socketClient3 != null) {
      this.socketClient3.onDisconnect;
      console.log('Socket Client Is Disconnected Successfully');
    }
    else{
      console.log('Error while Disconnected Socket Client');
    }
  };

  disconnectSocket() {
    this.disconnectWs2();
    this.disconnectWs3();
  }

  sendFilterViaSocketClient3(filterData: any, SocketFilterRequestTypeForDS: any) {
    if (!this.socketClient3 || !this.socketClient3.active) {
      console.warn('socketClient3 not active yet');
      return;
    }

    this.socketClient3.publish({
      destination: '/app/filter',
      body: JSON.stringify(filterData),
      headers: {
        'user-id': String(this.userId),
        'socket-filter-request-type': String(SocketFilterRequestTypeForDS),
      }
    });
  }
}
