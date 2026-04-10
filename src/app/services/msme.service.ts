import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { HttpService } from 'src/app/CommoUtils/common-services/http.service';
import { Constants } from '../CommoUtils/constants';
import { CommonService } from '../CommoUtils/common-services/common.service';
import { AesGcmEncryptionService } from '../CommoUtils/common-services/aes-gcm-encryption.service';
import { User } from '../Component/core/models/auth.models';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { data } from 'jquery';
import { UserFilterRequest } from '../models/user-filter.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MsmeService {
  constructor(private http: HttpService, private commonService: CommonService) { }
  timeoutMs: number = 600 * 1000
  getTokensForClient(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_TOKENS, data, false);
  }

  getPagesAccessList(data): Observable<any> {
    return this.http.post(RestUrl.GET_PAGES_ACCESS_LIST, data);
  }

  saveCorporateAnnouncementSubscription(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_CORPORATE_SUBSCRIPTION, data);
  }

  getCorporateAnnouncementSubscriptions(payload: any): Observable<any> {
    return this.http.post(RestUrl.GET_CORPORATE_SUBSCRIPTIONS, payload);
  }

  getSubscriptionCounts(payload: any): Observable<any> {
    return this.http.post(RestUrl.GET_SUBSCRIPTION_COUNTS, payload);
  }

  fetchFilteredAnnouncements(payload: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_FILTERED_ANNOUNCEMENTS, payload);
  }

  getAllParentCategories(): Observable<any> {
    return this.http.get(RestUrl.GET_ALL_PARENT_CATEGORIES, null);
  }

  getSubcategoriesByParentCategory(parentCategory: string): Observable<any> {
    // Construct the URL safely using template literal
    return this.http.get(`${RestUrl.GET_SUBCATEGORIES_BY_PARENT}?parentCategory=${encodeURIComponent(parentCategory)}`, null);
  }

  // ── My Portfolio APIs ──────────────────────────────────────────────────────

  getMyPortfolioAnnouncements(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_ANNOUNCEMENTS, payload, false);
  }

  getMyPortfolioStats(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_STATS, payload, false);
  }

  getMyPortfolioCategories(): Observable<any> {
    return this.http.get(RestUrl.MY_PORTFOLIO_CATEGORIES, null);
  }

  getMyPortfolioCompanies(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_COMPANIES, payload, true);
  }

  saveMyPortfolioSubscription(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_SUBSCRIPTION_SAVE, payload);
  }

  getMyPortfolioSubscriptions(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_SUBSCRIPTION_GET, payload);
  }

  getMyPortfolioSubscriptionCounts(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_SUBSCRIPTION_COUNTS, payload, true);
  }

  getMyPortfolioSubscriptionStatus(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_SUBSCRIPTION_STATUS, payload, true);
  }

  getMyPortfolioCompaniesByCins(payload: any): Observable<any> {
    return this.http.post(RestUrl.MY_PORTFOLIO_COMPANIES_BY_CINS, payload, true);
  }

  /**
   * Generic method to perform dynamic actions triggered by notifications
   * @param url The API endpoint URL
   * @param method The HTTP method (POST, GET, PUT, etc.)
   * @param payload The request body
   */
  performDynamicAction(url: string, method: string, payload: any): Observable<any> {
    // Basic implementation supporting POST/PUT/GET. Extend as needed.
    const upperMethod = method.toUpperCase();
    if (upperMethod === 'POST') {
      return this.http.post(url, payload, false);
    } else if (upperMethod === 'PUT') {
      return this.http.put(url, payload, false);
    } else if (upperMethod === 'GET') {
      // For GET, we might need to handle query params differently if payload is provided
      // For now assuming payload is not used or handled by the http service if passed as 'params'
      return this.http.get(url, false, false);
    }
    return throwError(() => new Error(`Unsupported method: ${method}`));
  }

  //  For Logout User
  logoutUser(): Observable<any> {
    return this.http.get(RestUrl.LOGOUT, false);
  }

  // this object is used for encryt information
  encryptedObject(data) {
    return { encrypted: AesGcmEncryptionService.getEncPayload(data) };
  }

  forGetMethodEncrypted(data) {
    return AesGcmEncryptionService.getEncPayload(data);
  }

  downloadFile(storageId): Observable<any> {
    let cookieObj: any = this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
    cookieObj = JSON.parse(cookieObj);
    return this.http.downloadFilesGetMethod(RestUrl.DOWNLOAD_DOC + '/' + this.commonService.toBTOA(storageId)
      + '/' + this.commonService.toBTOA(cookieObj.tk_lg));
  }

  getUserDetails(): Observable<any> {
    return this.http.getForUser(RestUrl.USER_DETAILS, false);
  }

  bulkUploadFile(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_BULK_FILE, data);
  }

  getBulkUploadFile(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BULK_UPLOAD_FILE, data, true);
  }

  customerMasterBulkUpload(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_CUST_BULK_FILE, data, true);
  }

  commercialCibilBulkUpload(data: any): Observable<any> {
    return this.http.postupload(RestUrl.GET_COMM_CIBIL_BULK_UPLOAD_FILE, data, true);
  }

  commercialCibilBulkExcelUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.UPLOAD_CIBIL_FILE_FROM_FILE_NAME, data, true);
  }

  getCustUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CUST_BULK_UPLOAD_FILE, data, true);
  }

  getPreScreenUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_PRE_SCREEN_BULK_UPLOAD_FILE, data, true);
  }

  getPreScreenPanFiles(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_PRE_SCREEN_PAN_FILE, data, true);
  }

  getCommCibilUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_COMM_CIBIL_BULK_UPLOADED_FILE_DATA, data, true);
  }

  getCommCibilUploadedDataByFileId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BULK_BY_FILE_ID, data, true);
  }

  getInputFileMasterList(): Observable<Blob> {
    return this.http.get(RestUrl.CALL_GET_INPUT_MASTER_FILE_DATA, false, true);
  }

  getcommercialCibilBulkUploadShowFlag(): Observable<any> {
    return this.http.get(RestUrl.GET_COMM_CIBIL_BULK_UPLOAD_SHOW_FLAG, false);
  }

  getConsumCibilUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CONSUM_CIBIL_BULK_UPLOADED_FILE_DATA, data, true);
  }

  getValidData(batchId): Observable<any> {
    return this.http.get(RestUrl.GET_VALID_PAN_DATA + '/' + this.forGetMethodEncrypted(batchId), {}, true);
  }
  getInValidData(batchId): Observable<any> {
    return this.http.get(RestUrl.GET_INVALID_PAN_DATA + '/' + this.forGetMethodEncrypted(batchId), {}, true);
  }
  getTotalData(batchId): Observable<any> {
    return this.http.get(RestUrl.GET_TOTAL_PAN_DATA + '/' + this.forGetMethodEncrypted(batchId), {}, true);
  }
  downloadTemplate(data: any): Observable<any> {
    return this.http.downloadReport(RestUrl.DOWNLOAD_TEMPLATE, data);
  }
  getHSBCHODashboardDetails(data: any, ignoreLoader: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_DASHBOARD_DETAILS, data, ignoreLoader);
  }
  checkCustomerProfileExists(pan: string): Observable<any> {
    return this.http.post(RestUrl.CHECK_CUSTOMER_PROFILE_EXISTS, { pan }, true);
  }
  downloadExcelFile(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_CAM, data, true);
  }
  proccedData(data: any): Observable<any> {
    return this.http.post(RestUrl.PROCCED_APPS, data, true);
  }

  getTrailLogData(applicationId: any): Observable<any> {
    return this.http.get(RestUrl.GET_TRAIL_LOG_DATA + '/' + this.forGetMethodEncrypted(applicationId), false);
  }

  getStageAuditListfORaPPLICATION(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_STAGE_AUDIT_LIST_FOR_APPLICATION, data, false);
  }

  saveBureauConfig(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_BUREAU_CONFIG, data);
  }

  getEditMasterList(id: Number): Observable<any> {
    return this.http.get(RestUrl.GET_EDIT_MASTER_LIST + this.commonService.encryptFunction(id), false);

  }

  updatePopupData(data: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_POPUP_DATA, data);
  }

  getLayer7Data(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_LAYER7_DATA, data, false);

  }

  updatePopupLayer7Data(data: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_POPUP_LAYER7_DATA, data);
  }

  updateSourceLayer7Data(data: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_LAYER_POPUP_DATA, data);
  }

  downloadCommercialReport(applicationId): Observable<any> {
    return this.http.get(RestUrl.GENERATE_COMMERCIAL_REPORT + this.forGetMethodEncrypted(applicationId), false, false);
  }

  downloadConsumerZipReport(applicationId): Observable<any> {
    return this.http.get(RestUrl.GENERATE_CONSUMER_ZIP + this.forGetMethodEncrypted(applicationId), false, false);
  }

  getEximData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BULK_MST_ID, data, true);
  }

  getPreScreenData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BULKData_MST_ID, data, true);
  }
  getPreScreenPartData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_PART_FILE_Data_MST_ID, data, true);
  }
  getPreScreenPanData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_PAN_Data_MST_ID, data, true);
  }

  uploadCustomerMaster(data: any, name): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_CUST_MAST_BULK_UPLOAD_FILE + '/' + this.forGetMethodEncrypted(name), data, true);
  }

  getCustMasterUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CUST_MAST_BULK_UPLOAD_FILE, data, true);
  }

  getCustomerBulkDataByMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_DATA_BY_MST_ID, data, true);
  }
  streamCustomerBulkDataByMstId(data: any): Observable<any> {
    return this.http.postForDownload(RestUrl.STREAM_GET_DATA_BY_MST_ID, data, false);
  }

  // Help & Support
  uploadHelpAndSupport(data: any, name): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_HELP_AND_SUPPORT + '/' + this.forGetMethodEncrypted(name), data, true);
  }

  getHelpAndSupportFiles(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HELP_AND_SUPPORT_FILES, data, true);
  }

  deleteHelpAndSupportFile(fileId: any): Observable<any> {
    return this.http.get(RestUrl.DELETE_HELP_AND_SUPPORT_FILE + '/' + this.forGetMethodEncrypted(fileId), false);
  }

  syncBucketFiles(): Observable<any> {
    return this.http.post(RestUrl.SYNC_BUCKET_FILES, {}, true);
  }

  getHelpAndSupportStream(referenceId: any, extension: any) {
    return this.http.get(
      RestUrl.STREAM_HELP_AND_SUPPORT_VIDEO + '/' +
      this.forGetMethodEncrypted(referenceId) + '/' +
      this.forGetMethodEncrypted(extension),
      {

        observe: 'response',
        responseType: 'blob'
      }
    );
  }


  getMcaNetworkTabDetais(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_MCA_NETWORK_TAB_DETAILS, items);
  }

  getMcaTabDetails(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_MCA_TAB_DETAILS, items);
  }

  getCustomer(items: any, isLoader?: boolean): Observable<any> {
    return this.http.post(items?.isNewFilter ? RestUrl.GET_CUSTOMER_BIGQUERY : RestUrl.GET_CUSTOMER, items, isLoader);
  }

  downloadUdyamCertificate(udhyamCertificateRefId: any): Observable<any> {
    return this.http.get(RestUrl.DOWNLOAD_UDYAM_CERTIFICATE + '/' + this.forGetMethodEncrypted(udhyamCertificateRefId), false);
  }

  getSaveRiskCompanySearchDetails(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_SAVE_RISK_SEARCH_COMPANY_DETAILS, items, true);
  }

  saveIndividualGstUdhyamSaveRiskApi(items: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_INDIVIDUAL_COMPNAY_GST_UDHYAM_SAVE_RISK, items);
  }

  getIndividualGstUdhyamSaveRiskApi(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_INDIVIDUAL_COMPNAY_GST_UDHYAM_SAVE_RISK, items);
  }

  addToTargetIndvidualCustomer(items: any): Observable<any> {
    return this.http.post(RestUrl.ADD_TO_TARGER_INDIVIDUAL_CUSTOMER, items);
  }

  deleteCustomer(id: any, roleId?: any): Observable<any> {
    return this.http.get(RestUrl.DELETE_CUSTOMER + '/' + this.forGetMethodEncrypted(id) + '/' + this.forGetMethodEncrypted(roleId), false);
  }

  getAuditData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_AUDIT_DATA, data);
  }

  refreshApisBasedOnId(data: any): Observable<any> {
    return this.http.post(RestUrl.REFRESH_DATA_BASED_ON_API_ID, data);
  }

  getApiAuditData(data: any, isFromRefresh): Observable<any> {
    return this.http.post(RestUrl.GET_API_AUDIT_DATA, data, isFromRefresh);
  }

  getGSTINListByMstID(data: any, isFromAnalysis: boolean, ignoreLoader: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_GSTIN_LIST_BY_MASTER_ID + "/" + this.forGetMethodEncrypted(isFromAnalysis), data, ignoreLoader);
  }

  getgstAnalysisData(items: any, ignoreLoader: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_GST_ANALYSIS_DATA, items, ignoreLoader);
  }

  gstAnalysisTpByPan(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GST_ANALYSIS_TP_BY_PAN, items);
    return this.http.post(RestUrl.GST_ANALYSIS_TP_BY_PAN, items);
  }

  gstAnalysisTpByPanData(items: any, ignoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GST_ANALYSIS_TP_BY_PAN_DATA, items);
    return this.http.post(RestUrl.GST_ANALYSIS_TP_BY_PAN_DATA, items, ignoreLoader);
  }

  gstAnalysisGenOtp(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GST_ANALYSIS_REQ_OTP, items);
    return this.http.post(RestUrl.GST_ANALYSIS_REQ_OTP, items);
  }

  getGstHistoryData(data: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GET_GST_HISTORY_DATA, data,false);
    return this.http.post(RestUrl.GET_GST_HISTORY_DATA, data);
  }

  getEximAnalysisReport(eximId: number): Observable<any> {
    // return this.http.getEncrypted(RestUrl.EXIM_ANALYSIS_GET_DATA + '/' + this.forGetMethodEncrypted(eximId), false);
    return this.http.get(RestUrl.EXIM_ANALYSIS_GET_DATA + '/' + this.forGetMethodEncrypted(eximId), false);
  }

  getConsumerData(CibilId: any): Observable<any> {
    // return this.http.getEncrypted(RestUrl.GET_CONSUMER_DETAILS + '/'+ this.forGetMethodEncrypted(CibilId), false);
    return this.http.get(RestUrl.GET_CONSUMER_DETAILS + '/' + this.forGetMethodEncrypted(CibilId), false);
  }

  // downloadCibilReport(applicationId, type): Observable<any> {
  //   // return this.http.getEncrypted(RestUrl.GET_CIBIL_REPORT_DOWNLOAD+ '/' + this.forGetMethodEncrypted(applicationId) + '/' +this.forGetMethodEncrypted(type),false);
  //   return this.http.get(RestUrl.GET_CIBIL_REPORT_DOWNLOAD + '/' + this.forGetMethodEncrypted(applicationId) + '/' + this.forGetMethodEncrypted(type), false, false);
  // }

  downloadCibilPdf(data: any): Observable<any> {
    // return this.http.getEncrypted(RestUrl.GET_CIBIL_REPORT_DOWNLOAD+ '/' + this.forGetMethodEncrypted(applicationId) + '/' +this.forGetMethodEncrypted(type),false);
    return this.http.post(RestUrl.GET_CIBIL_PDF_DOWNLOAD, data, true);
  }

  getcommercialData(data: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GET_COMMERCIAL_DETAILS, data);
    return this.http.post(RestUrl.GET_COMMERCIAL_DETAILS, data);
  }

  saveCompanyDetailsInCibil(data): Observable<any> {
    // return this.http.postEncrypted(RestUrl.SAVE_COMPANY_DETAILS_IN_CIBIL,data, true);
    return this.http.post(RestUrl.SAVE_COMPANY_DETAILS_IN_CIBIL, data, false);
  }

  callBureau(data): Observable<any> {
    // return this.http.postEncrypted(RestUrl.CALL_BURAUE,data, true);
    return this.http.post(RestUrl.CALL_BURAUE, data, false);
  }

  getStateCityFromPincode(pincode: any): Observable<any> {
    // return this.http.getEncrypted(RestUrl.GET_STATE_CITY_FROM_PINCODE + '/'+ this.forGetMethodEncrypted(pincode), false);

    return this.http.get(RestUrl.GET_STATE_CITY_FROM_PINCODE + '/' + this.forGetMethodEncrypted(pincode), false, false);
  }

  getCallDataFromSignzy(data: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.CALL_SIGNZY_API, data);
    return this.http.post(RestUrl.CALL_SIGNZY_API, data);
  }

  getXdaysForCibilPing(bureauType: any): Observable<any> {
    return this.http.get(RestUrl.GET_XDAYS_FOR_CIBIL_PING + '/' + this.forGetMethodEncrypted(bureauType), false);
  }

  getBuearueHistoryData(data: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GET_BUREUE_HISTORY_DATA, data);
    return this.http.post(RestUrl.GET_BUREUE_HISTORY_DATA, data, true);
  }

  getEximImportReport(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_IMPORT_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_IMPORT_DATA, items, true);
  }

  getEximExportReport(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_EXPORT_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_EXPORT_DATA, items, true);
  }

  getEximBuyerSellerData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_BUYER_SELLER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_BUYER_SELLER_DATA, items, true);
  }

  getEximSellerData(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_SELLER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_SELLER_DATA, items);
  }


  getProductExportData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_PRODUCT_PEER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_PRODUCT_PEER_DATA, items, true);
  }

  getProductImportData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_PRODUCT_PEER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_PRODUCT_PEER_DATA, items, true);
  }

  getNewBuyerData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_NEW_BUYER_SELLER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_NEW_BUYER_SELLER_DATA, items, true);
  }

  getNewSellerData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_NEW_BUYER_SELLER_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_NEW_BUYER_SELLER_DATA, items, true);
  }

  getAnchor(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_GET_ANCHOR_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_GET_ANCHOR_DATA, items);
  }

  getAnchorData(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_GET_CCN_ANCHOR_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_GET_CCN_ANCHOR_DATA, items, true);
  }

  getExCntryExposureData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA, items, true);
  }

  downloadBGPdf(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA, items);
    return this.http.post(RestUrl.BG_ANALYSIS_DOWNLOAD_PDF, items, true);
  }

  getImCntryExposureData(items: any, isIgnoreLoader: boolean): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA, items);
    return this.http.post(RestUrl.EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA, items, true);
  }

  getEximSearchByProduct(items: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_ANALYSIS_SEARCH_BY_PRODUCT, items, true);
  }

  getEximCountryMasterList(): Observable<any> {
    return this.http.get(RestUrl.EXIM_COUNTRY_MASTER_LIST, false, true);
  }

  getHsnCodeDataByEximId(eximId: Number): Observable<any> {
    return this.http.get(RestUrl.GET_HSN_CODE_BY_EXIM_ID + '/' + this.forGetMethodEncrypted(eximId), false, true);
  }


  getEximAnalysisHsnCode(eximId: Number, mappingId: Number): Observable<any> {
    // return this.http.getEncrypted(RestUrl.EXIM_ANALYSIS_HSN_CODE + '/' + this.forGetMethodEncrypted(eximId)+ '/' + this.forGetMethodEncrypted(mappingId), false);
    return this.http.get(RestUrl.EXIM_ANALYSIS_HSN_CODE + '/' + this.forGetMethodEncrypted(eximId) + '/' + this.forGetMethodEncrypted(mappingId), false, true);

  }
  //===========exim--end ===============
  saveConsumerDetails(data: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.SAVE_CONSUMER_DETAILS, data);
    return this.http.post(RestUrl.SAVE_CONSUMER_DETAILS, data, false);
  }

  gstAnalysisVerifyOtp(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GST_ANALYSIS_VERIFY_OTP, items);
    return this.http.post(RestUrl.GST_ANALYSIS_VERIFY_OTP, items);
  }

  eximAnalysisHistory(pan: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.EXIM_ANALYSIS_HISTORY, pan);
    return this.http.post(RestUrl.EXIM_ANALYSIS_HISTORY, pan);

  }

  getCompanyNames(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_COMPANY_NAMES, items);
  }

  getIECByCOMPANY(items: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_IEC_BY_COMPANY_NAME, items);
  }

  gstAnalysisSubmit(items: any): Observable<any> {
    // return this.http.postEncrypted(RestUrl.GST_ANALYSIS_SUBMIT, items,false);
    return this.http.post(RestUrl.GST_ANALYSIS_SUBMIT, items, false);
  }


  getIECByPAN(pan: string): Observable<any> {
    // return this.http.getEncrypted(RestUrl.EXIM_IEC_BY_PAN + '/' + this.forGetMethodEncrypted(pan), false);
    return this.http.get(RestUrl.EXIM_IEC_BY_PAN + '/' + this.forGetMethodEncrypted(pan), false);
  }

  getEximByName(pan: string): Observable<any> {
    // return this.http.getEncrypted(RestUrl.EXIM_IEC_BY_PAN + '/' + this.forGetMethodEncrypted(pan), false);
    return this.http.get(RestUrl.EXIM_BY_NAME + '/' + this.forGetMethodEncrypted(pan), false);
  }

  fileByBankeS(items: any): Observable<any> {
    return this.http.post(RestUrl.LOANS_BS_FILES_DETAILS, items, true);
  }

  fetchbankList(): Observable<any> {
    return this.http.post(RestUrl.FETCH_BANK_LIST, true);
  }

  bankAnalysisVerifyPan(pan: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_VERIFY_PAN, pan);
  }

  createBsMaster(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_CREATE_MASTER, items);
  }

  bankStatementAnalysisUpload(items: any): Observable<any> {
    return this.http.postReqIsDecrypted(RestUrl.BANK_ANALYSIS_STATEMENT_UPLOAD, items);
  }

  bankStatementGetData(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_GET_DATA, items);
  }

  getBankStatementBounceCheque(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_BOUNCE_CHEQUE, items);
  }

  downloadBSAnalysisReport(data: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_DOWNLOAD, data, true);
  }

  downloadBSAnalysisPdf(data: any): Observable<any> {
    return this.http.postForUser(RestUrl.BANK_ANALYSIS_PDF_DOWNLOAD, data, true);
  }

  getBankStatementTransaction(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_TRANSACTION_DATA, items);
  }

  getMcaCharge(pan: any): Observable<any> {
    return this.http.post(RestUrl.GET_MCA_CHARGE, pan);
  }

  downloadGstAnalysisReport(detailsId: any): Observable<any> {
    // return this.http.getEncrypted(RestUrl.GET_CONSUMER_DETAILS + '/'+ this.forGetMethodEncrypted(CibilId), false);
    return this.http.get(RestUrl.GST_ANALYSIS_DOWNLOAD_EXCEL + '/' + this.forGetMethodEncrypted(detailsId), false, true);
  }

  downloadGstPdf(mstId: any): Observable<any> {
    // return this.http.getEncrypted(RestUrl.GET_CONSUMER_DETAILS + '/'+ this.forGetMethodEncrypted(CibilId), false);
    return this.http.get(RestUrl.GST_ANALYSIS_DOWNLOAD_PDF + '/' + this.forGetMethodEncrypted(mstId), false, true);
  }

  getHsnDetail(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_HSN_DETAIL, items);
  }

  getAlertsSubTabData(request: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALERTS_TAB_DETAILS, request);
  }

  updateAlertsTrackit(request: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_ALERTS_TAB_DETAILS, request);
  }

  addToOrderFinancial(items: any): Observable<any> {
    return this.http.post(RestUrl.ADD_TO_ORDER_FINANCIAL, items);
  }

  getStatusForOrderFinancial(req: any): Observable<any> {
    return this.http.post(RestUrl.GET_STATUS_FOR_ORDER_FINANCIAL, req);
  }

  getSpreadOrderStatus(req: any): Observable<any> {
    return this.http.post(RestUrl.GET_SPREAD_ORDER_STATUS, req);
  }

  getInsightFilter(ignoreLoader?: boolean): Observable<any> {
    return this.http.get(RestUrl.INSIGHT_FILTER, false, ignoreLoader);
  }

  getFilterListFromApi(req: any): Observable<any> {
    return this.http.post(RestUrl.GET_FILTER_LIST_FROM_API, req, true);
  }

  getTopBarFilter(cityType: any, ignoreLoader?: any): Observable<any> {
    // return this.http.get(RestUrl.TOP_BAR_FILTER +'/'+this.commonService.encryptText(cityType), false, true);
    return this.http.post(RestUrl.TOP_BAR_FILTER + '/' + this.commonService.encryptText(cityType), null, ignoreLoader);
  }

  getTopbarFilterListFromApi(req: any): Observable<any> {
    return this.http.post(RestUrl.GET_TOP_BOR_FILTER_LIST_FROM_API, req);
  }

  getUserPermission(userId: any, roleId: any) {
    return this.http.get(RestUrl.GET_USER_PERMISSIONS + '/' + roleId + '/' + userId, false);
  }

  getUserPermissionByPageId(userId: any, roleId: any, pageId: any) {
    return this.http.get(RestUrl.GET_USER_PERMISSIONS + '/' + roleId + '/' + userId + '/' + pageId, false);
  }

  getUserPermissionByPageIdAsync(userId: any, roleId: any, pageId: any) {
    return this.http.get(RestUrl.GET_USER_PERMISSIONS + '/' + roleId + '/' + userId + '/' + pageId, false, true);
  }

  getAllPageAndSubpageByRoleId(request: any) {
    return this.http.post(RestUrl.GET_ALLPAGE_BYROLEID, request, false);
  }

  getBankUserList(data): Observable<any> {
    return this.http.post(RestUrl.GET_BANKER_USER_LIST, data);
  }

  lockUnlockUser(data): Observable<any> {
    return this.http.post(RestUrl.LOCK_UNLOCK_USER, data);
  }
  deleteUser(data): Observable<any> {
    return this.http.post(RestUrl.DELETE_USER, data);
  }
  activeIsActiveUser(data): Observable<any> {
    return this.http.post(RestUrl.ACTIVE_IS_ACTIVE_USER, data);
  }

  downloadExcel(request: any): Observable<Blob> {
    return this.http.postForDownload(RestUrl.DOWNLOAD_EXCEL, request, false);
  }
  userResetPassword(data): Observable<any> {
    return this.http.post(RestUrl.USER_RESET_PASSWORD, data);
  }

  getUserDetailsList(data): Observable<any> {
    return this.http.post(RestUrl.GET_USER_DETAILS_LIST, data);
  }

  getHrmsData(data): Observable<any> {
    return this.http.post(RestUrl.GET_HRMS_DATA, data);
  }

  getCityAndBusiness(data): Observable<any> {
    return this.http.post(RestUrl.GET_CITY_BUSINESS, data);
  }

  getAllCustomerCity(): Observable<any> {
    return this.http.get(RestUrl.GET_ALL_CUSTOMER_city, false);
  }

  getAllCustomerSegData(customerSegmentData): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_CUSTOMER_SEGMENT, customerSegmentData);
  }

  getOrganizationList(data): Observable<any> {
    return this.http.post(RestUrl.GET_ORGANIZATION_LIST, data);
  }

  getStateList(countryCode: number): Observable<any> {
    return this.http.get(RestUrl.GET_STATE_LIST + '/' + countryCode, false);
  }
  getEmployeeList(platFormId): Observable<any> {
    return this.http.get(RestUrl.GET_EMPLOYEE_LIST + '/' + this.commonService.encryptText(platFormId), false);
  }

  getProductList(platFormId): Observable<any> {
    return this.http.get(RestUrl.PRODUCT_LIST + '/' + this.commonService.encryptText(platFormId), false);
  }
  getBankerRoleList(data): Observable<any> {
    return this.http.post(RestUrl.GET_BANKER_ROLE_LIST, data);
  }
  updateUser(data): Observable<any> {
    return this.http.post(RestUrl.UPDATE_USER, data);
  }


  updateMapping(data: any): Observable<any> {
    console.log(" update url " + RestUrl.UPDATE_MAPPING);
    return this.http.put(RestUrl.UPDATE_MAPPING, data);
  }
  // saveCustomerRegion(customerRegion, employeeCode): Observable<any> {
  //   // Prepare the data to send to the backend
  //   const requestData = {
  //     regionName: customerRegion,
  //     regionCode: employeeCode
  //   };



  //   // Make the HTTP POST request
  //   return this.http.post(RestUrl.SAVE_CUSTOMER_REGION, requestData);
  // }
  getZoneListFromOrgId(data): Observable<any> {
    return this.http.post(RestUrl.GET_ZONE_LIST, data);
  }

  getCircleListFromZoneNameAndOrgId(data): Observable<any> {
    return this.http.post(RestUrl.GET_CIRCLE_LIST, data);
  }

  getBranchMasterList(data): Observable<any> {
    return this.http.post(RestUrl.GET_BRANCH_MASTER_LIST, data);
  }

  savePermissionForRole(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_ROLEID_AND_PAGEID_AND_ACTIONID, data);
  }

  savePermission(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_USER_ROLE_PAGE_ACTION, data);
  }

  getAllPageByRoleIdUsing(data): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_PAGE_AND_SUBPAGE_BY_ROLEID, data);
  }

  getAllPageAndSubpageAndAction(data): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_PAGE_AND_SUBPAGE_AND_ACTION, data);
  }
  getRoleDetails(roleId: any): Observable<any> {
    return this.http.get(RestUrl.GET_USER_ROLES_DATA + '/' + this.forGetMethodEncrypted(roleId), false);
  }

  saveRoleIdAndPageIdandActioId

  passCustomerSegData(data: any): Observable<any> {
    return this.http.post(RestUrl.ADD_UPDATE_CUSTOMER_DATA, data, false);
  }
  getCustomerSegmentation(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_CUSTOMER_DATA, data, false);
  }

  uploadForeignCurrency(formData: FormData): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_FOREIGN_CURRENCY_FILE, formData);
  }

  getHistoryForeignCurrency(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_FOREIGN_CURRENCY_FILE_DATA, data, true);
  }

  deleteCustomerData(id): Observable<any> {
    return this.http.get(RestUrl.DELETE_CUSTOMER_dATA_BYID + '/' + this.forGetMethodEncrypted(id), false);
  }
  deleteRolemasterDataByid(id): Observable<any> {
    return this.http.get(RestUrl.DELET_ROLEMASTER_DATA_BYID + '/' + this.forGetMethodEncrypted(id), false);
  }
  passUserMasterDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.ADD_UPDTAE_ROLEMASTER_DATA, data, false);
  }
  getUserMasterData(data: any) {
    return this.http.post(RestUrl.GET_ALL_ROLEMASTER_DATA, data, false);
  }

  hrmsBulkUpload(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_HRMS_BULK_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  preScreenBulkUpload(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_PRE_SCREEN_DATA_FILE, data, false);
  }

  checkFullOrPartFileUploaded(data: any): Observable<any> {
    return this.http.post(RestUrl.CHECK_FILE_UPLOAD, data, true);
  }

  preScreenPanUpload(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_PRE_SCREEN_PAN_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  uploadCustomerSegement(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_CUST_SEG_BULK_UPLOAD_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }
  getCustomerSegementFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CUST_SEG_BULK_UPLOAD_FILE, data, true);
  }
  getCustomerSegDataByMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_SEGEMENT_DATA_BY_ID, data, true);
  }
  getReportStatus(): Observable<any> {
    return this.http.get(RestUrl.GET_REPORT_STATUS, false, true);
  }
  reportFail(): Observable<any> {
    return this.http.get(RestUrl.REPORT_FAIL, false, false);
  }
  deleteUserData(userId: any, rmUserId): Observable<any> {
    return this.http.post(RestUrl.DELETE_USER_DATA + '/' + this.forGetMethodEncrypted(userId) + '/' + this.forGetMethodEncrypted(rmUserId), true);
  }
  getAllCustomerMasterData(requestPayloadStatus: boolean) {
    let createMasterJson: any = {};
    createMasterJson["isActive"] = requestPayloadStatus;
    return this.http.postForDownload(RestUrl.GET_ALL_CUSTOMER_MASTER_DATA, createMasterJson, false);
  }

  getAllChildCustomerData() {
    return this.http.post(RestUrl.GET_ALL_CHILD_CUSTOMER_DATA, {}, true);
  }

  getAllUserData() {
    return this.http.get(RestUrl.GET_USERS_DATA, false, false);
  }

  uploadCustomerRegion(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.REGION_MASTER_UPLOAD + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  uploadCustomerIncome(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.CUSTOMER_INCOME_UPLOAD + '/' + this.forGetMethodEncrypted(userName), data, true);
  }


  getAllNonActiveUsersCustomerData() {
    return this.http.get(RestUrl.GET_ALL_NONACTIVE_USERS_CUSTOMER_DATA, false, false);
  }

  getGeneralAuditLog(data: any): Observable<any> {
    console.log("data ", data);

    return this.http.post(RestUrl.GET_GENERAL_AUDIT_LOG, data, false)
  }

  getUserDetailsByRoleId(roleId) {
    return this.http.get(RestUrl.GET_USER_DETAILS_BY_ROLE_ID + '/' + this.forGetMethodEncrypted(roleId), false, true);
  }

  getDashboardExcelDownload(data: any) {
    return this.http.post(data?.isNewFilter ? RestUrl.GET_DASHBOARD_EXCEL_BIGQUERY : RestUrl.GET_DASHBOARD_EXCEL, data, true);
  }

  getHistoryRegionBulkUpload(data: any) {
    return this.http.post(RestUrl.GET_HISTORY_REGION_BULK_UPLOAD, data, true);
  }

  getRegionDataById(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_REGION_DATA_BY_ID, data, true);
  }

  getApiStatusData(): Observable<any> {
    return this.http.post(RestUrl.GET_API_STATUS, true);
  }

  getAPIStatusSuccess(): Observable<any> {
    return this.http.post(RestUrl.GET_IS_API_STATUS_SUCCESS, false);
  }

  getDataByBucketRef(data: any): Observable<any> {
    return this.http.postupload(RestUrl.GET_RESPONSE_BY_BUCKET_ID, data, true);
  }
  downLoadAllCustomerSegement(): Observable<any> {
    return this.http.get(RestUrl.DOWNLOAD_ALL_CUSTOMER_SEGEMENT, false, true);
  }
  downLoadAllRegion(): Observable<any> {
    return this.http.get(RestUrl.DOWNLOAD_ALL_REGION, false, false);
  }

  uploadCountryMaster(data: any, name): Observable<any> {
    return this.http.postupload(RestUrl.COUNTRY_MASTER_UPLOAD + '/' + this.forGetMethodEncrypted(name), data, true);
  }

  getHistoryCountryBulkUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HISTORY_COUNTRY_BULK_UPLOAD, data, true);
  }

  getCountryDataById(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_COUNTRY_DATA_BY_ID, data, true);
  }

  downloadCountryBulkUploadReport(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_COUNTRY_BULK_UPLOAD_REPORT, data, true);
  }

  downLoadAllCountry(): Observable<any> {
    return this.http.get(RestUrl.DOWNLOAD_ALL_COUNTRY, false);
  }
  downloadUserExcels(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_USER_EXCEL, data, true);
  }
  streamDownloadUserExcels(data: any): Observable<any> {
    return this.http.postForDownload(RestUrl.STREAM_DOWNLOAD_USER_EXCEL, data, false);
  }
  downloadUserAuditExcel(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_USER_AUDIT_EXCEL, data, true)
  }
  streamDownloadUserAuditExcel(data: any): Observable<any> {
    return this.http.postForDownload(RestUrl.STREAM_DOWNLOAD_USER_AUDIT_EXCEL, data, false);
  }
  downloadHrmsExcel(): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_HRMS_DATA, false, true);
  }

  downloadPreScreenExcel(): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_PRE_SCREEN_DATA, false, true);
  }

  getRoleTypes(): Observable<any[]> {
    return this.http.get(RestUrl.GET_ALL_ROLE_TYPE, false, true);
  }

  getAssignmentSource(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ASSIGNMENT_SOURCE, data, true);
  }

  getAllApiStatus(isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.getAllApiStatusDetails, false, isLoader);
  }

  getFilterWiseRMByCity(listOfCity: any): Observable<any> {
    listOfCity = JSON.parse(JSON.stringify(listOfCity));
    return this.http.post(RestUrl.RM_FILTER_BY_CITY, { listOfCity }, true);
  }

  getRmByCities(payload: { listOfCity: number[] }): Observable<any> {
    return this.http.post(RestUrl.RM_FILTER_BY_CITY, payload, true);
  }

  saveUserActivity(): Observable<any> {
    return this.http.post(RestUrl.SAVE_USER_ACTIVITY, null, true);
  }

  downloadCustomerExportExcel(data: any): Observable<any> {
    return this.http.post(RestUrl.CUSTOMER_EXPORT_EXCEL, data, true);
  }

  downloadExcelForApiCallCount(data: any): Observable<any> {
    return this.http.post(RestUrl.COUNT_API_CALL_EXCEL, data, true);
  }

  getApiCount(data: any): Observable<any> {
    console.log("data ", data);
    return this.http.post(RestUrl.GET_API_COUNT_DATA, data, false)
  }

  getApiCountList(data: any) {
    return this.http.post(RestUrl.GET_API_COUNT_DATA, data, false)
  }

  getApiCountWithRequestPayload(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_API_COUNT_DATA, data, true);
  }

  getSyncApiCallCount(data: any): Observable<any> {
    return this.http.post(RestUrl.SYNC_API_COUNT_DATA, data, false);
  }

  getHistoryCustomerIncomeBulkUpload(data: any) {
    return this.http.post(RestUrl.GET_HISTORY_CUSTOMER_INCOME_BULK_UPLOAD, data, true);
  }

  getCusIncomeData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CUSROMER_INCOME_BULK_MST_ID, data, true);
  }

  getPreScreenDataByPan(panNo: any): Observable<any> {
    return this.http.get(RestUrl.FETCH_PRE_SCREEN_DATA_BY_PAN + '/' + this.forGetMethodEncrypted(panNo), false);
  }

  getNotes(): Observable<any> {
    return this.http.get(RestUrl.GET_NOTES, false);
  }

  getInCorporationDetails(request: any, isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_IN_CORPORATION, request, true);
  }

  getRequestPortFolio(request: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_CUSTOMER_PORT_FOLIO, request, true);
  }
  getTotalCompaniesList(request: any): Observable<any> {
    return this.http.post(RestUrl.GET_TOTAL_COMPANIES_LIST, request, true);
  }
  saveRequestPortFolio(request: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_CUSTOMER_PORT_FOLIO, request, false);
  }

  searchCustomerRequestPortFolio(searchCustomer: any): Observable<any> {
    return this.http.post(RestUrl.SEARCH_CUSTOMER_PORT_FOLIO, searchCustomer, true);
  }


  downloadTargetTrackingExcel(data: any): Observable<any> {
    return this.http.post(RestUrl.TARGET_TRACKING_EXCEL, data, true);
  }

  downloadAgeingAndTatExcel(data: any): Observable<any> {
    return this.http.post(RestUrl.AGEING_AND_TAT_EXCEL, data, true);
  }

  revokeRequestPortFolio(revokeCustomerPortfolio: any): Observable<any> {
    return this.http.post(RestUrl.REVOKE_CUSTOMER_PORT_FOLIO, revokeCustomerPortfolio, true);
  }

  getCitiesAndStates(ignoreLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_IN_CORPORATION_CITY_STATE, null, ignoreLoader);
  }

  checkPanInCibilMaster(pan: any): Observable<any> {
    return this.http.get(RestUrl.PANCHECKINCIBILMATSR + '/' + this.forGetMethodEncrypted(pan), false);

  }

  sortRequestPortFolio(data: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_CUSTOMER_PORT_FOLIO, data, true);
  }

  // Bank portfolio upload
  uploadBankPortfolio(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_BANK_PORTFOLIO, data, false);
  }

  uploadBankPortfolioOneTime(data: any): Observable<any> {
    return this.http.post(RestUrl.UPLOAD_BANK_PORTFOLIO_ONE_TIME, data, false);
  }

  getHistoryBankPortfolio(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BANK_UPLOAD_HISTORY, data, true);
  }

  getHistoryBankPortfolioOneTime(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BANK_UPLOAD_HISTORY_ONE_TIME, data, true);
  }


  downloadBankPortfolio(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_BANK_PORTFOLIO_BY_TYPE, data, true);
  }

  getAllBankUploadUniqueData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_BANK_UPLOAD_UNIQUE_DATA, data, true);
  }

  downloadExcelBankPortfolioIFSC(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_EXCEL_BANK_PORTFOLIO_ACC_UNIQUE, data, true);
  }

  submitExportUniqueIFSC(data: any): Observable<any> {
    return this.http.post(RestUrl.SUBMIT_EXPORT_UNIQUE_IFSC_DATA, data, true);
  }

  getPincodeByCity(data: any): Observable<any> {
    return this.http.post(RestUrl.PINCODE_BY_CITY, data, false);
  }

  //Innovation Banking Insights
  getInnovateBankingDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_INNOVATE_BANK_DETAILS, data, true);
  }

  getPartOfInnovateBankingDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_INNOVATE_BANK_DETAILS, data, true);
  }

  getDomainList(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_DOMAIN_LIST, data, false);
  }

  callTracxnApis(data: any, isIgnoarloader: any): Observable<any> {
    return this.http.post(RestUrl.CALL_TRACXN_APIS, data, isIgnoarloader);
  }

  getAllEmployeeDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_EMPLOYEE_DETAILS, data, true);
  }

  getAllInvestorDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_INVESTOR_DETAILS, data, true);
  }

  getAllFacilitorsDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_FACILITORS_DETAILS, data, true);
  }

  refreshTracxnApi(data: any) {
    return this.http.post(RestUrl.REFRESH_TRACXN_API, data, false);
  }

  getAllCompetitor(data: any) {
    return this.http.post(RestUrl.GET_ALL_COMPETITOR, data, true);
  }

  getAllAquiredCompanies(data: any) {
    return this.http.post(RestUrl.GET_ALL_AQUIRED_COMPANIES, data, true);
  }

  getAllPartOfCompanies(data: any) {
    return this.http.post(RestUrl.GET_ALL_PART_OF_COMPANIES, data, true);
  }

  callInvestorApi(data: any): Observable<any> {
    return this.http.post(RestUrl.CALL_TRACXN_INVESTOR_PROFILE_API, data, true);
  }

  callCompanyApi(data: any): Observable<any> {
    return this.http.post(RestUrl.CALL_TRACXN_INVESTOR_COMPANY_API, data, true);
  }

  getInvestorProfileDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_INVESTOR_PROFILE_DETAILS, data, true);
  }

  getAllBusinessandCoverageDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_BUSINESS_AND_COVERAGE_DETAILS, data, true);
  }

  getAllFundingRoundListDetailsDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_FUNDING_ROUND_LIST_DETAILS, data, true);
  }

  getAllTracxnCompanydetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_TRACXN_COMPANY_DETAILS, data, false);
  }

  getAllTracxnAssociatedEntitiesDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_ASSOCIATED_ENTITIES_DETAILS, data, true);
  }

  getAllTracxnInvestorCompaniesDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_TRACXN_INVESTOR_COMPANY_DETAILS, data, true);
  }

  callInvestorCompaniesSearchApi(data: any): Observable<any> {
    return this.http.post(RestUrl.CALL_INVESTOR_TRACXN_COMPANY_SEARCH_API, data, true);
  }

  callTracxnAssociatedEntitiesApi(data: any, isIgnoarloader: any): Observable<any> {
    return this.http.post(RestUrl.CALL_TRACXN_ASSOCIATED_ENTITIES_API, data, isIgnoarloader);
  }

  callTracxnInvesteeCompaniesApi(data: any, isIgnoarloader: any): Observable<any> {
    return this.http.post(RestUrl.CALL_TRACXN_INVESTEE_COMPANIES_API, data, isIgnoarloader);
  }

  getAllTracxnFundingVentureDebtDetails(data: any) {
    return this.http.post(RestUrl.GET_ALL_TRACXN_FUNDING_VENTURE_DEBT_DETAILS, data, true);
  }

  getAllTracxnFundingBuyOutDetails(data: any) {
    return this.http.post(RestUrl.GET_ALL_TRACXN_FUNDING_BUYOUT_DETAILS, data, true);
  }
  // Abb account
  getAbbUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ABB_UPLOAD_HISTORY, data, true);
  }

  downloadAbbDataById(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_ABB_UPLOAD_BY_TYPE, data, true);
  }

  uploadAbbAccountData(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_ABB_ACCOUNT, data, true);
  }
  getHSBCBankingData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_BANKING_DATA, data, false);
  }

  getHSBCBankingBulkMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_BANKING_BULK_MST_ID, data, true);
  }

  // downloadAllHsbcBankingdata(data: any, isLoader:any): Observable<any>{
  //   return this.http.post(RestUrl.GET_ALL_HSBC_BANKING_DATA, data, true);
  // }

  getHsbcStatusDownloadReportForCountry(): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_STATUS_DOWNLOAD_REPORT_FOR_COUNTRY, true, true);
  }

  getHsbcStatusDownloadReport(): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_STATUS_DOWNLOAD_REPORT, true, true);
  }

  hsbcBankingBulkUpload(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_HSBC_BANKING_BULK_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  getHSBCCountryPresenceBulkMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_COUNTRY_PRESENCE_MST_ID, data, true);
  }

  getChildCustomerIds(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CHILD_CUSTOMERS_DATA, data, false);
  }

  hsbcCountryPresenceUpload(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_HSBC_COUNTRY_PRESENCE_BULK_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  getAllHSBCCountryPresenceData(): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_HSBC_COUNTRY_PRESENCE_DATA, false, true);
  }

  getHSBCCountryPresenceBulkUploadData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_HSBC_COUNTRY_PRESENCE_DATA, data, true);
  }

  getInternalBankStatementInitialData(data: any): Observable<any> {
    return this.http.post(RestUrl.INITIAL_BANK_ANALYSIS_INTERNAL, data, false);
  }

  getInternalBankStatementAnalysisData(data: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_INTERNAL, data, false);
  }

  getBalanceCurrentAccountCrilc(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_BALANCE_CURRENT_ACCOUNT_CRILIC, data, false);
  }

  getYearWiseData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_YEARWISE_PORTFOLIO_REPORT, data, false);
  }

  getCurrency(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CURRENCY, data, false);
  }

  getAbbReport(data: any, isLoader?): Observable<any> {
    return this.http.post(RestUrl.GET_ABB_REPORT_DATA, data, isLoader);
  }

  getTotalAbbReport(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_TOTAL_ABB_REPORT_DATA, data, true);
  }

  // customer-rm mapping
  getCustRmFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CUST_RM_UPLOAD_FILE_DATA, data, true);
  }
  // UPLOAD FILE
  customerRmMappingUpload(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.CUSTOMER_RM_UPLOAD_FILE + '/' + this.forGetMethodEncrypted(userName), data, true);
  }
  // ENRTY THROUGH FETCH DATA API
  getSuccessAndFiledEntery(data: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_TOTAL_ENTRY, data, true);
  }

  getPortfolioBankInitialData(data: any): Observable<any> {
    return this.http.post(RestUrl.PORTFOLIO_BANK_ANALYSIS_INITIAL, data, false);
  }

  getPortfolioBankData(data: any): Observable<any> {
    return this.http.post(RestUrl.PORTFOLIO_BANK_ANALYSIS, data, true);
  }

  updateAlert(request: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_ALERT, request);
  }

  // Reject PortFolio
  getRejectedPortfolio(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_REJECTED_PORTFOLIO, data, true);
  }

  downloadExportReportForRejectedCustomer(data: any): Observable<any> {
    return this.http.post(RestUrl.REJECTED_PORTFOLIO_EXPORT_EXCEL, data, true);
  }

  rejectedCustomer(data: any): Observable<any> {
    return this.http.post(RestUrl.REJECT_CUSTOMER, data, true);
  }
  deleteRejectCustomerById(id: any): Observable<any> {
    return this.http.post(RestUrl.DELETE_REJECTED_CUSTOMER + '/' + this.forGetMethodEncrypted(id), true);
  }
  getCityLocationPincode(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CITY_LOCATION_PINCODE, data, true);
  }

  getAbbMasterList(data): Observable<any> {
    return this.http.post(RestUrl.GET_ABB_MASTER_LIST, data, true);
  }

  getRmUserList(data): Observable<any> {
    return this.http.post(RestUrl.GET_RM_USER_LIST, data, false);
  }

  getAbbLevelReport(data: any, loaderReq?: any): Observable<any> {
    return this.http.post(RestUrl.GET_ABB_REPORT_LEVEL_DATA, data, loaderReq ?? false);
  }

  searchCompanyDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.SEARCH_CUSTOMER_DATA, data, true);
  }

  getTracxnUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_TRACXN_BULK_UPLOAD_FILE_DATA, data, true);

  }

  // tracxnLendingIndicatorsBulkUpload(data: any, fileVategory:any, userName:any): Observable<any> {
  //   return this.http.postupload(RestUrl.UPLOAD_TRACXN_BULK_FILE+'/'+ this.forGetMethodEncrypted(fileVategory)+'/'+this.forGetMethodEncrypted(userName), data, true);
  // }

  tracxnBulkUpload(data: any, fileVategory: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_TRACXN_BULK_FILE + '/' + this.forGetMethodEncrypted(fileVategory) + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  getInvesteeCompaniesSearchDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_INVESTEE_COMPANIES_SEARCH_DETAILS, data, true);
  }

  // getTracxnLendingIndicatorsData(data: any): Observable<any> {
  //   return this.http.post(RestUrl.GET_TRACXN_LENDING_INDICATORS_BULK_DATA_MST_ID, data, true);
  // }

  getTracxnExcelData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_TRACXN_BULK_DATA_MST_ID_AND_CATEGORY, data, true);
  }


  getLeadingIndicator(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_LENDING_INDICATORS_DATA, data, true);
  }

  getTotalOpportunity(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_TOTAL_OPPORTUNITY, data, true);
  }

  getNewGcc(request: any, isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_NEW_GCC, request, true);
  }

  getLocationAndHQ(ignoreLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_LOCATION_HQ, null, ignoreLoader);
  }

  uploadNewGccFile(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_NEW_GCC_FILE, data);
  }

  getNewGccFileHistory(request: any, isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_NEW_GCC_FILE_HISTORY, request, true);
  }

  getByBucketRef(data: any): Observable<Blob> {
    return this.http.downloadStreamData(RestUrl.GET_NEW_GCC_FILE_STREAM, data);
  }

  downloadCibilReport2(data: any): Observable<Blob> {
    return this.http.downloadStreamData(RestUrl.GET_CIBIL_REPORT_DOWNLOAD, data);
  }

  orderCrisilData(data: any): Observable<any> {
    return this.http.post(RestUrl.ORDER_CRISIL_DATA, data, false);
  }

  getCrisilDataFromDB(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CRISIL_DATA_FROM_DB, data, true);
  }

  // For Excel file download from backend for OW8
  downloadExcelFileForOW8(requestData: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_TOTAL_ENTRY, requestData, false);
  }

  downloadNewIncorporationExcel(data: any, isLoader): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_NEW_INCORPORATION_EXCEL, data, isLoader);
  }

  getNewIncorporationExcel(data: any, isLoader): Observable<any> {
    return this.http.post(RestUrl.GET_NEW_INCORPORSTION_EXCEL_STATUS, data, isLoader);
  }

  getSchedularFilterRes(items: any, isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_SCHDULER_FILTER_DETAILS, items, isLoader);
  }

  downloadSchedularReport(data: any): Observable<Blob> {
    return this.http.downloadStreamData(RestUrl.GET_SCHEDULAR_REPORT_DOWNLOAD, data);
  }

  getFileMasterList(): Observable<Blob> {
    return this.http.get(RestUrl.CALL_GET_MASTER_FILE_DATA, false, true);
  }

  getFetchBsUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_BS_UPLOAD_HISTORY, data, false);
  }

  getSubmitBsUploadData(data: any): Observable<any> {
    return this.http.post(RestUrl.SUBMIT_BS_UPLOAD_DATA, data, false);
  }

  deleteBsUploadFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.DELETE_BS_UPLOAD_FILE_DATA, data, false);
  }
  deleteBsUploadAccountData(data: any): Observable<any> {
    return this.http.post(RestUrl.DELETE_BS_UPLOAD_ACC_DATA, data, false);
  }

  callMarkFileCompleted(data: any): Observable<any> {
    if (data?.type === 'CONSUMER') {
      return this.http.post(RestUrl.CONSUMER_CALL_MARK_FILE_COMPLETED, data, false);
    } else {
      return this.http.post(RestUrl.CALL_MARK_FILE_COMPLETED, data, false);
    }
  }

  uploadStatusChange(fileId: any, revertFlag: Boolean): Observable<any> {
    return this.http.post(RestUrl.UPLOAD_STATUS_CHANGE + '/' + this.forGetMethodEncrypted(fileId) + '/' + this.forGetMethodEncrypted(revertFlag), false);
  }

  dowmloadError(payLoadData): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_ERROR_NO_HIT_FILES, payLoadData, true);
  }

  downloadAllCustomerPreScreenExcel(fileName: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_ALL_CUSTOMER_PRE_SCREEN_DATA + '/' + this.forGetMethodEncrypted(fileName), false, true);
  }

  getAgriEximHsnDetail(items: any): Observable<any> {
    return this.http.post(RestUrl.GET_AGRI_EXIM_HSN_DETAIL, items);
  }


  getPRBulkUploadHistory(fileId: any): Observable<any> {
    return this.http.get(RestUrl.PR_BULK_UPLOAD_HISTORY + '/' + this.forGetMethodEncrypted(fileId), false, true);
  }

  getRejectionHistory(pan: any): Observable<any> {
    return this.http.post(RestUrl.REJECTED_HISTORY, pan, true);
  }


  deleteMultipleCustomer(payloadData: any): Observable<any> {
    return this.http.post(RestUrl.DELETE_MULTIPLE_CUSTOMER, payloadData, true);
  }

  getInputMatchingToolReportData(data: any, isLoader): Observable<any> {
    const params = `?size=${data.size}&pageIndex=${data.pageIndex}`;
    return this.http.get(RestUrl.GET_MATCHING_AUDIT_DATA + params, false, isLoader);
  }

  getMatchingToolReportData(data: any, isLoader): Observable<any> {
    const params = `?size=${data.page}&pageIndex=${data.page_size}`;
    return this.http.get(RestUrl.GET_MATCHING_REPORT_DATA + params, false, isLoader);
  }

  uploadMatchingToolFiles(data: any): Observable<any> {
    return this.http.post(RestUrl.UPLOAD_MATCHING_FILES, data, false);
  }

  uploadInputMatchingToolFiles(data: any): Observable<any> {
    console.log("payload ", data);

    return this.http.post(RestUrl.UPLOAD_INPUT_MATCHING_FILES, data, false);
  }

  getAllRmCustomerData() {
    return this.http.get(RestUrl.GET_ALL_RM_CUSTOMER_DATA, false, true);
  }
  getNewGccExcel(data: any, isLoader): Observable<any> {
    return this.http.post(RestUrl.GET_NEW_GCC_EXCEL, data, isLoader);
  }

  getNewGccExcelStatus(data: any, isLoader): Observable<any> {
    return this.http.post(RestUrl.GET_NEW_GCC_EXCEL_STATUS, data, isLoader);
  }

  getSearchRmData(data: any): Observable<any> {
    return this.http.post(RestUrl.SEARCH_RM_DATA, data, true);
  }

  getSearchRmId(data: any): Observable<any> {
    return this.http.post(RestUrl.SEARCH_BY_RMID, data, false);
  }
  getSupplierCustomerLevelReport(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_SUPPLIER_CUSTOMER_LEVEL_REPORT, data, true);
  }

  getConsumerFileMasterList(): Observable<Blob> {
    return this.http.get(RestUrl.CONSUMER_CALL_GET_MASTER_FILE_DATA, false, true);
  }

  callConsumerMarkFileCompleted(data: any): Observable<any> {
    return this.http.post(RestUrl.CONSUMER_CALL_MARK_FILE_COMPLETED, data, false);
  }

  consumerCibilBulkExcelUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.CONSUMER_UPLOAD_CIBIL_FILE_FROM_FILE_NAME, data, true);
  }

  getConsumerCibilUploadedDataByFileId(data: any): Observable<any> {
    return this.http.post(RestUrl.CONSUMER_GET_BULK_BY_FILE_ID, data, true);
  }

  getPanFromDinForDirector(din: String): Observable<Blob> {
    return this.http.get(RestUrl.GET_PAN_FROM_DIN_FOR_DIRECTOR + '/' + this.forGetMethodEncrypted(din), false, false);
  }


  downloadCountryExposure(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_COUNTRY_EXPOSURE, data, true);
  }

  saveRequestByRmData(rmData: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_REQEST_RM_DATA, rmData, false);

  }
  searchHistoryByRm(rmId: any): Observable<any> {
    return this.http.post(RestUrl.SEARCH_HISTORY_BY_RM, rmId, true);

  }
  revokeForRequested(uuid: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_REQUEST_BY_RM, uuid, false);

  }

  saveRequestByRmDataForReceiver(rmData: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_REQUEST_BY_RM_FOR_RECEIVER, rmData, true);
  }

  getExchRateUploadedFileData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_EXCH_BULK_UPLOAD_FILE, data, true);
  }

  exchMasterBulkUpload(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_EXCH_BULK_FILE, data, true);
  }

  getExchBulkDataByMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_EXCH_DATA_BY_MST_ID, data, true);
  }


  uploadFdiOdiEcbWalletFile(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_FDI_ODI_ECB_WALLET_FILE, data);
  }

  getfdiOdiEcbWalletFileHistory(request: any): Observable<any> {
    return this.http.post(RestUrl.GET_FDI_ODI_ECB_WALLET_FILE_HISTORY, request, true);
  }


  getFdiWalletByBucketRef(data: any): Observable<Blob> {
    return this.http.downloadStreamData(RestUrl.GET_FDI_ODI_ECB_WALLLET_FILE_STREAM, data);
  }

  getFdiOdiEcbWalletDataByCin(request: any): Observable<any> {
    return this.http.get(RestUrl.GET_FDI_ODI_ECB_WALLET_DATA_BY_CIN + '/' + this.forGetMethodEncrypted(request), false, true);
  }


  uploadEximBulkData(data: any): Observable<any> {
    return this.http.post(RestUrl.UPLOAD_EXIM_DATA, data, true);
  }

  eximBulkUploadDataForExport(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.EXIM_BULK_UPLOAD_DATA_FOR_EXPORT + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  eximBulkUploadDataForImport(data: any, userName: any): Observable<any> {
    return this.http.postupload(RestUrl.EXIM_BULK_UPLOAD_DATA_FOR_IMPORT + '/' + this.forGetMethodEncrypted(userName), data, true);
  }

  downloadEximExportImportDataByMstId(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_EXIM_EXPORT_IMPORT_DATA_BY_MSTID, data, true);
  }

  getEximWalletData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_EXIM_WALLET_DATA, data, true);
  }

  getEximWalletDataFromFilter(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_EXIM_WALLET_DATA_FROM_FILTER, data, true);
  }

  loadConfig(): Promise<void> {
    if (environment.staticDemo) {
      this.timeoutMs = 86400 * 1000;
      return Promise.resolve();
    }
    return this.http
      .getForUser(RestUrl.GET_APP_TIME_OUT_TIME, false, true)
      .toPromise()
      .then((dto: any) => {
        if (dto && typeof dto.timeout === 'number') {
          this.timeoutMs = dto.timeout * 1000;
          console.log("Time Out from Backend : ", this.timeoutMs);
        }
      })
      .catch((err) => {
        console.error('loadConfig API call failed:', err);
        throw err;
      });
  }

  // New Added
  getBulkApiDashboard(): Observable<any> {
    return this.http.get(RestUrl.GET_BULK_API_DASHBOARD, false);
  }
  getMigrationApiDashboard(): Observable<any> {
    return this.http.get(RestUrl.GET_MIGRATION_API_DASHBOARD, false);
  }

  getApiStatusDashboard(apiTypeId: any): Observable<any> {
    return this.http.post(RestUrl.GET_API_STATUS_DASHBOARD + this.forGetMethodEncrypted(apiTypeId), false);
  }

  callAdminApis(reqObj: any, endPoint: string, requestType): Observable<any> {
    if (requestType == "POST") {
      return this.http.post(RestUrl.BASE_URL.concat(endPoint), reqObj, false);
    }
    else {
      return this.http.get(RestUrl.BASE_URL.concat(endPoint), false, false);
    }
  }


  getApiHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_API_HISTORY, data, false);
  }

  DASHBOARD_CRISIL_BULK = 'CRISIL BULK';
  getByBucketRefForAllTypes(data: any, dashboardName: any) {
    if (!dashboardName || !dashboardName.trim()) {
      return throwError(() => new Error('dashboardName is required'));
    }
    if (!(data instanceof FormData)) {
      return throwError(() => new Error('Expected FormData payload'));
    }
    if (dashboardName === this.DASHBOARD_CRISIL_BULK)
      return this.http.downloadStreamDataForAllTypes(
        RestUrl.GET_BY_NONJSON_BUCKET_RES,
        data
      );
    else
      return this.http.downloadStreamDataForAllTypes(
        RestUrl.GET_BY_BUCKET_RES,
        data
      );
  }

  getMcaCustomerTypes(): Observable<any> {
    return this.http.post(RestUrl.GET_MCA_CUSTOMER_TYPE, false);
  }

  uploadPerifousDirectorNameFile(data: any): Observable<any> {
    return this.http.postupload(RestUrl.UPLOAD_PERFIOUS_DIRECTOR_NAME, data);
  }

  saveOrUpdateCampaignDetails(data: any, isLoaderIgnore: boolean): Observable<any> {
    return this.http.post(RestUrl.SAVE_OR_UPDATE_CAMPAIGN_DETAILS, data, isLoaderIgnore);
  }

  getCampaignDetails(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CAMPAIGN_DETAILS, data, false);
  }

  getCirCountsByCampaignId(campaignId: number): Observable<any> {
    return this.http.get(RestUrl.GET_CIR_COUNTS_BY_CAMPAIGN_ID + '/' + this.forGetMethodEncrypted(campaignId), false, false);
  }

  fetchOpportunityDashboardData(campaignData: any, isLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.FETCH_DASHBOARD_DATA, campaignData, isLoader);
  }
  updateCustomerConvertedRejectedStatus(data: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_CONVERT_REJECT_STATUS_FOR_CUSTOMER, data, false);
  }
  fetchFilterDataList(cityId: any): Observable<any> {
    return this.http.get(RestUrl.FETCH_FILTER_DATA_LIST + '/' + this.forGetMethodEncrypted(cityId), false, true);
  }
  getCampaignSummary(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CAMPAIGN_SUMMARY, data);
  }
  bankStatementAnalysisSaveRequest(items: any): Observable<any> {
    return this.http.postReqIsDecrypted(RestUrl.BANK_ANALYSIS_STATEMENT_SAVE_REQUEST, items);
  }

  bankStatementAnalysisSubmitMulti(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_STATEMENT_SUBMIT_MULTI, items);
  }

  multiBankStatementGetData(items: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_GET_DATA_MULTI, items);
  }

  multiDownloadBSAnalysisReport(data: any): Observable<any> {
    return this.http.post(RestUrl.BANK_ANALYSIS_DOWNLOAD_MULTI, data, true);
  }

  callQueryBuilderApis(reqObj: any, endPoint: string, requestType): Observable<any> {
    if (requestType == "POST") {
      return this.http.post(RestUrl.BASE_URL.concat(endPoint), reqObj, false);
    }
    else {
      return this.http.get(RestUrl.BASE_URL.concat(endPoint), false, false);
    }
  }

  getPRDashboardFilter(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_FILTER, reqObj, false);
  }

  getPRDashboardFilterLipisearch(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_FILTER_LIPISEARCH, reqObj, false);
  }

  getPrDashboardDependentFilterData(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_DEPENDANT_FILTER, reqObj, true);
  }

  getPrDashboardDependentFilterList(req: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_DEPENDENT_FILTER_LIST, req, true);
  }

  getPrDashboardLendingAnalysisData(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_LENDING_ANALYSIS, reqObj, true);
  }

  getPrDashboardLendingAnalysisDataLipiSearch(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_PR_DASHBOARD_LENDING_ANALYSIS_LIPISEARCH, reqObj, true);
  }

  getDecPan(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_DEC_PAN, reqObj, true);
  }

  downloadExcelPR(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_EXCEL_PR, reqObj, true);
  }

  matchingToolDataDownload(data: any, isLoader): Observable<any> {
    return this.http.post(RestUrl.GET_MATCHING_DATA_DOWNLOAD, data, isLoader);
  }

  eximDashboardUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_DASHBOARD_UPLOAD, data, false);
  }

  eximDashboardAudit(page: any, pageSize: any): Observable<any> {
    return this.http.get(RestUrl.EXIM_DASHBOARD_GET_HISTORY + '/' + this.forGetMethodEncrypted(page) + '/' + this.forGetMethodEncrypted(pageSize), data, true);
  }

  eximDashboardRetryUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_DASHBOARD_RETRY_UPLOAD, data, false);
  }

  eximDashboardDownloadFile(data: any): Observable<any> {
    return this.http.downloadStreamDataForAllTypes(
      RestUrl.EXIM_DASHBOARD_DOWNLOAD_FILE,
      data
    );
  }
  hsnBulkDataUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.HSN_BULK_DATA_UPLOAD, data, false);
  }

  hsnBulkDataAudit(page: any, pageSize: any): Observable<any> {
    return this.http.get(RestUrl.HSN_BULK_DATA_GET_HISTORY + '/' + this.forGetMethodEncrypted(page) + '/' + this.forGetMethodEncrypted(pageSize), data, true);
  }

  hsnBulkDataRetryUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.HSN_BULK_DATA_RETRY_UPLOAD, data, false);
  }

  hsnBulkDataDownloadFile(data: any): Observable<any> {
    return this.http.downloadStreamDataForAllTypes(
      RestUrl.HSN_BULK_DATA_DOWNLOAD_FILE,
      data
    );
  }

  downloadCampaignReportExcel(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_CAMPAIGN_EXCEl, data, true);
  }

  getInactiveCampaigns(): Observable<any> {
    return this.http.post(RestUrl.GET_INACTIVE_CAMPAIGNS, false, false);
  }

  getExpiredCampaigns(): Observable<any> {
    return this.http.post(RestUrl.GET_EXPIRED_CAMPAIGNS, false, false);
  }

  getAllCampaignList(): Observable<any> {
    return this.http.get(RestUrl.GET_ALL_CAMPAIGN_LIST, false, false);
  }

  // getCampaignReportStatus(): Observable<any> {
  //   return this.http.get(RestUrl.GET_CAMPAIGN_REPORT_STATUS ,false,false);
  // }
  getCampaignReportStatus(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CAMPAIGN_REPORT_STATUS, data, true);
  }

  downloadPreapproved(): Observable<any> {
    return this.http.get(RestUrl.GET_PREAPPROVED_REPORT, false, false);
  }
  getClientUpdateAndRejectionReasonList(): Observable<any> {
    return this.http.get(RestUrl.GET_CLIENT_UPDATE_AND_REJECTION_REASON_LIST, false, false);
  }
  addClientUpdateRejectionReason(data: any): Observable<any> {
    return this.http.post(RestUrl.ADD_CLIENT_UPDATE_AND_REJECTION_REASON, data, true);
  }

  deleteRejectionReason(id: any): Observable<any> {
    return this.http.get(RestUrl.DELETE_REJECTION_REASON + '/' + this.forGetMethodEncrypted(id), false, false);
  }

  rejectionRemarkStatus(data: any): Observable<any> {
    return this.http.post(RestUrl.REJECTION_REMARK_STATUS, data, false);
  }

  getAuditStatusDataForCustomer(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_STATUS_AUDIT_DATA_FOR_CUSTOMER, data, false);
  }
  shareToRm(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.SHARE_TO_RM, reqObj, true);
  }

  shareToRmBulk(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.SHARE_TO_RM_BULK, reqObj, true);
  }

  getAllSharedRm(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.GET_ALL_SHARED_RM, reqObj, true);
  }

  removeSharedRm(reqObj: any): Observable<any> {
    return this.http.post(RestUrl.REVOKED_SHARED_RM, reqObj, true);
  }

  getAllProductNames(): Observable<any> {
    return this.http.get(RestUrl.GET_ALL_PRODUCT_NAMES, false, true);
  }

  createCampaignFromExcel(data: any): Observable<any> {
    return this.http.postupload(RestUrl.CREATE_CAMPAIGN_FROM_EXCEL, data, true);
  }

  getCampaignUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CAMPAIGN_UPLOAD_HISTORY, data, true);
  }

  downloadCampaignUploadFile(masterId: any, fileType: any): Observable<any> {
    return this.http.get(RestUrl.DOWNLOAD_CAMPAIGN_UPLOAD_FILE + '/' + this.forGetMethodEncrypted(masterId) + '/' + this.forGetMethodEncrypted(fileType), false, true);
  }

  incomeDashboardUpload(data: any, type: any): Observable<any> {
    return this.http.postupload(RestUrl.INCOME_DASHBOARD_EXCEL_UPLOAD.concat(type), data, true);
  }

  incomeDashboardUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.INCOME_DASHBOARD_EXCEL_UPLOAD_HISTORY, data, true);
  }

  incomeDashboardFileDownload(data: any): Observable<any> {
    return this.http.post(RestUrl.INCOME_DASHBOARD_EXCEL_GET_FILE, data, true);
  }

  crifDashboardUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.COMMERCIAL_CRIF_DATA_EXCEL_UPLOAD, data, true);
  }

  crifDashboardUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.COMMERCIAL_CRIF_DATA_EXCEL_UPLOAD_HISTORY, data, true);
  }

  crifDashboardFileDownload(data: any): Observable<any> {
    return this.http.post(RestUrl.COMMERCIAL_CRIF_DATA_EXCEL_GET_FILE, data, true);
  }

  crilcDashboardUploadWithFile(formData: FormData): Observable<any> {
    return this.http.postupload(RestUrl.CRILC_DATA_EXCEL_UPLOAD_WITH_FILE, formData);
  }

  crilcDashboardUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DATA_EXCEL_UPLOAD_HISTORY, data, true);
  }

  crilcDashboardFileDownload(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DATA_EXCEL_GET_FILE, data, true);
  }

  getCrilcAuditReportData(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_AUDIT_REPORT, data, true);
  }

  runCrilcMonthlyFetch(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_RUN_MONTHLY_FETCH, data, false);
  }

  rerunCrilcFailedFiles(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_RERUN_FAILED_FILES, data, false);
  }

  downloadCrilcConsolidatedReport(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DOWNLOAD_CONSOLIDATED_REPORT, data, false);
  }

  downloadCrilcAuditReport(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DOWNLOAD_AUDIT_REPORT, data, false);
  }

  downloadCrilcOriginalFile(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DOWNLOAD_ORIGINAL_FILE, data, false);
  }

  downloadFileByDetailId(data: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_DATA_EXCEL_GET_FILE, data, false);
  }

  downloadForeignCurrencyFile(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_FOREIGN_CURRENCY_FILE, data, false);
  }

  manageHierarchy(data: any): Observable<any> {
    return this.http.post(RestUrl.MANAGE_HIERARCHY, data, true);
  }

  getDirectorContactByDin(din: String): Observable<any> {
    //  this.forGetMethodEncrypted(din)
    return this.http.get(RestUrl.GET_DIRECTOR_CONTACT_NUMBER + '/' + din, false, false);
  }

  getBulkApiSyncAsyncDashboard(isAsync: boolean): Observable<any> {
    return this.http.get(RestUrl.GET_BULK_API_SYNC_ASYNC_DASHBOARD + '/' + isAsync, false);
  }

  getAssignHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_ASSIGN_HISTORY_DATA, data, true);
  }

  getClientUpdateHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_CLIENT_UPDATE_HISTORY, data, true);
  }

  getClientUpdateReasonsMaster(ignoreLoader?: boolean): Observable<any> {
    return this.http.get(RestUrl.CLIENT_UPDATE_REASONS_MASTER, false, ignoreLoader);
  }
  getAllCities(ignoreLoader?: boolean): Observable<any> {
    return this.http.get(RestUrl.GET_ALL_CITIES_FILTER, false, ignoreLoader);
  }
  getACountAll(ignoreLoader?: boolean): Observable<any> {
    return this.http.get(RestUrl.GET_COUNT_ALL_OF_TABLE, false, ignoreLoader);
  }

  syncDataStream(payload: any, ignoreLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.SYNC_DATA_STREAM, payload, ignoreLoader);
  }

  getSilverAuditData(data: any, ignoreLoader?: boolean): Observable<any> {
    return this.http.post(RestUrl.GET_SILVER_AUDIT_DATA, data, ignoreLoader);
  }

  // Parent Company Search API with pagination for infinite scroll (for Existing Portfolio & Pre-Qualified Dashboard)
  // Calls service-loans which proxies to service-dashboard
  // Response format: { status, data: { content, hasMore, totalElements, page, size } }
  searchParentCompany(searchValue: string, page: number, size: number): Observable<any> {
    const body = { pageIndex: page, size: size, searchValue: searchValue || null };
    return this.http.post(RestUrl.SEARCH_PARENT_COMPANY, body, true);
  }

  // Parent Company Search API for Campaign Dashboard (direct to service-dashboard)
  // Response format: { status, content, hasMore, totalElements, page, size }
  searchParentCompanyDashboard(searchValue: string, page: number, size: number): Observable<any> {
    const body = { page: page, size: size, search: searchValue || null };
    return this.http.post(RestUrl.SEARCH_PARENT_COMPANY_DASHBOARD, body, true);
  }

  // Parent Country API - get all parent country options
  getParentCountryOptions(): Observable<any> {
    return this.http.post(RestUrl.GET_PARENT_COUNTRY, {}, true);
  }

  downloadEximExportData(mstId: number): Observable<any> {
    return null;
  }

  downloadEximImportData(mstId: number): Observable<any> {
    return null;
  }

  getBulkUploadHistory(requestData: any): Observable<any> {
    return null;
  }

  getNotificationDataForUser(data: any): Observable<any> {
    return this.http.postForUser(RestUrl.GET_NOTIFICATION_DATA_FOR_USER, data, true);
  }

  markNotificationAsRead(data: any): Observable<any> {
    return this.http.postForUser(RestUrl.MARK_NOTIFICATION_AS_READ, data, true);
  }
  // Notification Dashboard Methods
  saveNotificationMasterData(data: any): Observable<any> {
    return this.http.postForUser(RestUrl.SAVE_NOTIFICATION_MASTER_DATA, data, false);
  }

  getNotificationMasterData(data: any): Observable<any> {
    return this.http.postForUser(RestUrl.GET_NOTIFICATION_MASTER_DATA, data, false);
  }

  deleteNotificationMasterData(id: any): Observable<any> {
    return this.http.postForUser(RestUrl.DELETE_NOTIFICATION_MASTER_DATA, id, false);
  }

  prCampaignDetailsSave(data: any, isLoaderIgnore: boolean): Observable<any> {
    return this.http.post(RestUrl.PR_CAMPAIGN_DETAILS_SAVE, data, isLoaderIgnore);
  }

  // Exim Internal Data Upload APIs
  eximInternalDataUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_INTERNAL_DATA_UPLOAD, data, false);
  }

  eximInternalDataAudit(page: any, pageSize: any): Observable<any> {
    return this.http.get(RestUrl.EXIM_INTERNAL_DATA_AUDIT_LIST + '/' + this.forGetMethodEncrypted(page) + '/' + this.forGetMethodEncrypted(pageSize), false, true);
  }

  eximInternalDataRetryUpload(data: any): Observable<any> {
    return this.http.post(RestUrl.EXIM_INTERNAL_DATA_RETRY_UPLOAD, data, false);
  }

  eximInternalDataDownloadFile(data: any): Observable<any> {
    return this.http.downloadStreamDataForAllTypes(RestUrl.EXIM_INTERNAL_DATA_DOWNLOAD_FILE, data);
  }

  getConfigMasterListFromRf(data: any) {
    return this.http.post(RestUrl.GET_CONFIG_MASTER_LIST, data, false);
  }

  getAllRulesLevels() {
    return this.http.get(RestUrl.GET_ALL_RULES_LEVELS, false, true);
  }

  saveAuthorizationMatrix(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_OR_UPDATE_RULES, data);
  }

  getUserDetailsAndAllRulesByRF(userId: String): Observable<any> {
    return this.http.get(RestUrl.GET_USER_DETAILS_AND_ALL_RULES + '/' + this.forGetMethodEncrypted(userId), false, false);
  }

  assignRulesToTrm(payload: any): Observable<any> {
    return this.http.post(RestUrl.ASSIGN_RULES_TO_TRM, payload);
  }

  /**
   * Check if user has RF configuration visibility
   * @param userId - User ID from local storage
   * @param roleIds - List of selected role IDs
   * @returns Observable with isVisibleRFConfigs boolean flag
   */
  checkRFConfigVisibility(userId: number, roleIds: number[]): Observable<any> {
    const payload = {
      userId: userId,
      roleIds: roleIds
    };
    return this.http.post(RestUrl.CHECK_RF_CONFIG_VISIBILITY, payload);
  }

  deleteRuleMasterByRF(masterId: String): Observable<any> {
    return this.http.get(RestUrl.DELETE_RULE_MASTER_RF + '/' + this.forGetMethodEncrypted(masterId), false, false);
  }

  // Corporate Announcements Data Service from Backend
  getAnnouncements(cinList: any): Observable<any> {
    return this.http.post(RestUrl.GET_CORPORATE_ANNOUNCEMENTS, { cinList: cinList }, false);
  }

  getCorporateAnnouncementsStats(payload: any): Observable<any> {
    return this.http.post(RestUrl.GET_CORPORATE_ANNOUNCEMENTS_STATS, payload, false);
  }

  getCrilcLenderDetails(payload: any): Observable<any> {
    return this.http.post(RestUrl.CRILC_LENDER_DETAILS, payload, false);
  }

  // RM Hierarchy API
  getRmHierarchyByRoleAndType(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_RM_HIERARCHY_BY_ROLE_AND_TYPE, data, true);
  }

  fetchCorporateAnnouncements(payload: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_CORPORATE_ANNOUNCEMENTS, payload, false);
  }

  getCommercialSummaryData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_COMMERCIAL_PR_SUMMARY_DATA, data, false);
  }

  downloadExcelCommercialSummary(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_EXCEL_COMMERCIAL_SUMMARY, data, true);
  }

  // Staff Hierarchy Role APIs
  getStaffHierarchyRoleList(): Observable<any> {
    return this.http.get(RestUrl.GET_STAFF_HIERARCHY_ROLE_LIST, false, true);
  }

  updateStaffHierarchyRole(data: any): Observable<any> {
    return this.http.post(RestUrl.UPDATE_STAFF_HIERARCHY_ROLE, data, false);
  }

  getCommercialReconsilationSummaryData(data: any): Observable<any> {
    return this.http.post(RestUrl.GET_COMMERCIAL_RECONSILATION_PR_SUMMARY_DATA, data, false);
  }

  getCommercialReconsilationData(data: any): Observable<any> {
    return this.http.post(RestUrl.COMMERCIAL_RECONSILATION_DATA, data, true);
  }

  downloadExcelCommercialReconsilationData(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_EXCEL_COMMERCIAL_RECONSILATION_DATA, data, true);
  }

  /**
  * Save a new user filter
  * POST /filter/user-filter/save
  */
  saveUserFilter(request: UserFilterRequest): Observable<any> {
    return this.http.post(RestUrl.SAVE_USER_FILTER, request);
  }

  /**
   * Update an existing user filter
   * PUT /filter/user-filter/update/{filterId}
   */
  updateUserFilter(filterId: number, request: UserFilterRequest): Observable<any> {
    return this.http.post(RestUrl.UPDATE_USER_FILTER + '/' + this.forGetMethodEncrypted(filterId), request);
  }

  /**
   * Get all filters for a customer type
   * GET /filter/user-filter/list/{customerTypeId}
   */
  getUserFilters(customerTypeId: number): Observable<any> {
    return this.http.get(RestUrl.GET_USER_FILTERS + '/' + this.forGetMethodEncrypted(customerTypeId), false, true);
  }

  /**
   * Get a specific filter by ID
   * GET /filter/user-filter/{filterId}
   */
  getUserFilterById(filterId: number): Observable<any> {
    return this.http.get(RestUrl.GET_USER_FILTER_BY_ID + '/' + this.forGetMethodEncrypted(filterId), false);
  }

  /**
   * Delete a filter (soft delete)
   * DELETE /filter/user-filter/{filterId}
   */
  deleteUserFilter(filterId: number): Observable<any> {
    return this.http.post(RestUrl.DELETE_USER_FILTER + '/' + this.forGetMethodEncrypted(filterId), {});
  }

  // ==================== CRIF Commercial PR Data Methods ====================

  /**
   * Upload CRIF Commercial PR files
   * POST /crif-commercial-pr/upload
   */
  uploadCrifFiles(data: any): Observable<any> {
    return this.http.post(RestUrl.CRIF_COMMERCIAL_PR_UPLOAD, data, true);
  }

  /**
   * Get CRIF file upload history with pagination
   * GET /crif-commercial-pr/history?pageNo=1&pageSize=10
   */
  getCrifFileHistory(pageNo: number, pageSize: number): Observable<any> {
    return this.http.get(
      `${RestUrl.CRIF_COMMERCIAL_PR_HISTORY}?pageNo=${pageNo}&pageSize=${pageSize}`,
      false, true
    );
  }

  /**
   * Get input master IDs for dropdown
   * GET /crif-commercial-pr/input-master-ids
   */
  getCrifInputMasterIds(): Observable<any> {
    return this.http.get(RestUrl.CRIF_COMMERCIAL_PR_INPUT_MASTER_IDS, false, true);
  }

  /**
   * Download CRIF data by file ID and type
   * GET /crif-commercial-pr/download?fileId=1&type=1
   * type: 1=Success, 2=Fail, 3=Total
   */
  downloadCrifData(fileId: number, type: number): Observable<any> {
    return this.http.get(
      `${RestUrl.CRIF_COMMERCIAL_PR_DOWNLOAD_INPUT_FILE}?fileId=${fileId}&type=${type}`,
      false, true
    );
  }

  /**
   * Mark CRIF file as complete
   * POST /crif-commercial-pr/mark-complete
   */
  markCrifFileComplete(fileId: number): Observable<any> {
    return this.http.post(RestUrl.CRIF_COMMERCIAL_PR_MARK_COMPLETE, { fileid: fileId.toString() }, true);
  }

  /**
   * Download CRIF input file
   * GET /crif-commercial-pr/download-input-file?fileId=1&type=1
   * type: 1=Total Customer, 2=Success Entries, 3=Not Received Data
   */
  downloadCrifInputFile(fileId: number, type: number): Observable<any> {
    return this.http.get(
      `${RestUrl.CRIF_COMMERCIAL_PR_DOWNLOAD_INPUT_FILE}?fileId=${fileId}&type=${type}`,
      false, true
    );
  }

  /**
   * CRIF - Upload cibil file from file name (same pattern as commercial cibil)
   */
  crifUploadCibilFileFromFileName(data: any): Observable<any> {
    return this.http.post(RestUrl.CRIF_UPLOAD_CIBIL_FILE_FROM_FILE_NAME, data, true);
  }

  /**
   * CRIF - Get customer upload history (for popup)
   */
  getCrifCustomerUploadHistory(data: any): Observable<any> {
    return this.http.post(RestUrl.CRIF_GET_CUSTOMER_UPLOAD_HISTORY, data, true);
  }

  /**
   * CRIF - Download file data by URL (proxy to Python API)
   */
  getCrifDataByFileId(data: any): Observable<any> {
    return this.http.post(RestUrl.CRIF_GET_DATA_BY_FILE_ID, data, true);}

  downloadCrifDataByFileId(data: any): Observable<any> {
    return this.http.post(RestUrl.DOWNLOAD_CRIF_DATA_BY_FILE_ID, data, true);}

  getIndustryNewsMetadata(): Observable<any> {
    return this.http.get(RestUrl.GET_INDUSTRY_NEWS_METADATA, null);
  }

  fetchIndustryNews(data: any): Observable<any> {
    return this.http.post(RestUrl.FETCH_INDUSTRY_NEWS, data);
  }

  saveIndustryNewsArticle(data: any): Observable<any> {
    return this.http.post(RestUrl.SAVE_INDUSTRY_NEWS_ARTICLE, data);
  }

  deleteIndustryNewsArticle(data: any): Observable<any> {
    return this.http.post(RestUrl.DELETE_INDUSTRY_NEWS_ARTICLE, data);
  }

  getSavedIndustryNewsArticles(userId: any): Observable<any> {
    return this.http.get(RestUrl.GET_SAVED_INDUSTRY_NEWS_ARTICLES + '/' + this.forGetMethodEncrypted(userId), null);
  }

}
