const baseUrl = window.location.protocol + '//' + window.location.host;
// const baseUrl = 'https://gkeqa-hsbc.instantmseloans.in';
// const baseUrl = 'https://gcpsit-hsbc.instantmseloans.in';

/**
 * For use service on server
 **/
const loansUrl = baseUrl + '/hsbc/loans/msme';
const loansUrlLocal = 'http://localhost:2025/hsbc/loans/msme';
const userUrl = baseUrl + '/common/user';

const cibilMsmeUrl = baseUrl + '/hsbc/cibil';
const gstUrl = baseUrl + '/gst';
const cibilUrl = baseUrl + '/hsbc/cibil';
const bsUrl = baseUrl + '/bs';
const bankerDashboard = '/hsbc/banker/dashboard';
const dashboardUrl = baseUrl + '/hsbc/ds';
const notificationUrl = baseUrl + '/hsbc/notification';
const baseRfUrl = baseUrl + '/hsbc/rf';


/**
 * For use service on local server
 **/
// const notificationUrl = 'http://localhost:20255/hsbc/notification';
// const dashboardUrl = 'http://localhost:2027/hsbc/ds';
// const loansUrl = 'http://localhost:20505/hsbc/loans/msme';
// const userUrl = 'http://localhost:27752/common/user';
// const bankerDashboard =  'http://localhost:20502/hsbc/banker/dashboard';
//const localLoansUrl = 'http://localhost:2025/hsbc/loans/msme';
const dmsUrl = baseUrl + '/hsbc/dms/msme';

export const RestUrl = {

  GET_TOKENS: userUrl + '/getTokensForClient',
  LENDER_DASHBOARD_URL: baseUrl + '/redirect?data=',
  LENDER_LOGIN_URL: baseUrl + '/enterprise',
  LOGOUT: userUrl + '/logoutUser',
  // DMS
  DOWNLOAD_DOC: dmsUrl + '/productDownloadDocument/',

  USER_DETAILS: userUrl + '/details',

  UPLOAD_BULK_FILE: loansUrl + '/bulk/upload',

  UPLOAD_CUST_BULK_FILE: loansUrl + '/bulk/customer-master-upload',

  GET_BULK_UPLOAD_FILE: loansUrl + '/bulk/getUploadedFileData',

  GET_CUST_BULK_UPLOAD_FILE: loansUrl + '/bulk/getCustUploadedFileData',

  GET_PRE_SCREEN_BULK_UPLOAD_FILE: loansUrl + '/preScreen/getPreScreenUploadedFileData',
  GET_PRE_SCREEN_PAN_FILE: loansUrl + '/preScreen/getPanUploadFileData',

  GET_COMM_CIBIL_BULK_UPLOAD_FILE: loansUrl + '/commercial/cibil/excelUpload',

  CALL_GET_INPUT_MASTER_FILE_DATA: loansUrl + '/commercial/cibil/getInputFileMasterIds',
  // GET_COMM_CIBIL_BULK_UPLOAD_FILE: 'http://localhost:2026/hsbc/loans/msme/commercial/cibil/excelUpload',

  UPLOAD_CIBIL_FILE_FROM_FILE_NAME: loansUrl + '/commercial/cibil/uploadCibilFileFromFileName',
  // UPLOAD_CIBIL_FILE_FROM_FILE_NAME : 'http://localhost:2025/hsbc/loans/msme/commercial/cibil/uploadCibilFileFromFileName',

  GET_COMM_CIBIL_BULK_UPLOADED_FILE_DATA: loansUrl + '/commercial/cibil/get-comm-cibil-uploaded-file-data',
  // GET_COMM_CIBIL_BULK_UPLOADED_FILE_DATA:'http://localhost:2025/hsbc/loans/msme/commercial/cibil/get-comm-cibil-uploaded-file-data',

  GET_BULK_BY_FILE_ID: loansUrl + '/commercial/cibil/get-data-by-file-id',
  // GET_BULK_BY_FILE_ID:'http://localhost:2026/hsbc/loans/msme/commercial/cibil/get-data-by-file-id',

  GET_COMM_CIBIL_BULK_UPLOAD_SHOW_FLAG: loansUrl + '/commercial/cibil/getcommercialCibilBulkUploadShowFlag',
  // GET_COMM_CIBIL_BULK_UPLOAD_SHOW_FLAG:'http://localhost:2026/hsbc/loans/msme/commercial/cibil/getcommercialCibilBulkUploawShowFlag',

  GET_CONSUM_CIBIL_BULK_UPLOADED_FILE_DATA: loansUrl + '/consumer/cibil/get-consum-cibil-uploaded-file-data',
  // GET_CONSUM_CIBIL_BULK_UPLOADED_FILE_DATA:'http://localhost:2025/hsbc/loans/msme/consumer/cibil/get-consum-cibil-uploaded-file-data',

  GET_VALID_PAN_DATA: loansUrl + '/bulk/getValidData',
  GET_ALL_CUSTOMER_MASTER_DATA: loansUrl + '/customer/getAllCustomerData',
  GET_ALL_CHILD_CUSTOMER_DATA: loansUrl + '/customer/getAllChildCustomerData',

  GET_INVALID_PAN_DATA: loansUrl + '/bulk/getInValidData',

  GET_BULK_MST_ID: loansUrl + '/bulk/getDataByMstId',

  GET_PAN_Data_MST_ID: loansUrl + '/preScreen/getPreScreenPanByMstId',

  GET_TOTAL_PAN_DATA: loansUrl + '/bulk/getTotalData',

  GET_DASHBOARD_DETAILS: loansUrl + '/getHSBCHODashboardDetailsV2',

  CHECK_CUSTOMER_PROFILE_EXISTS: loansUrl + '/checkCustomerProfileExists',

  GET_TRAIL_LOG_DATA: loansUrl + '/application-trail/get',

  GET_BULKData_MST_ID: loansUrl + '/preScreen/getPreScreenDataByMstId',

  DOWNLOAD_TEMPLATE: dmsUrl + '/downloadBulkUploadDocument',

  DOWNLOAD_CAM: loansUrl + '/downloadExcelFile',

  PROCCED_APPS: loansUrl + '/processApps',

  GET_STAGE_AUDIT_LIST_FOR_APPLICATION: loansUrl + '/getStageAuditList',

  GET_PAGES_ACCESS_LIST: userUrl + '/getRoleBaseAccess',

  //Checking cibil auditing

  // CIBIL BUREAU CONFIGURATION URL ALL
  SAVE_BUREAU_CONFIG: cibilMsmeUrl + '/config/update/bureauPermission',
  // SAVE_BUREAU_CONFIG: 'http://localhost:27777/hsbc/cibil/config/update/bureauPermission',

  GET_EDIT_MASTER_LIST: cibilMsmeUrl + '/config/getById/',
  // GET_EDIT_MASTER_LIST: 'http://localhost:27777/hsbc/cibil/config/getById/',

  UPDATE_POPUP_DATA: cibilMsmeUrl + '/config/update/popUpData',
  // UPDATE_POPUP_DATA: 'http://localhost:27777/hsbc/cibil/config/update/popUpData',

  //CIBIL LAYER  CONFIGURATION

  GET_LAYER7_DATA: cibilMsmeUrl + '/get-credential',
  // GET_LAYER7_DATA: 'http://localhost:27777/hsbc/cibil/config/get-credential/',

  UPDATE_POPUP_LAYER7_DATA: cibilMsmeUrl + '/update-credential',
  // UPDATE_POPUP_LAYER7_DATA: 'http://localhost:27777/hsbc/cibil/update-credential',

  UPDATE_LAYER_POPUP_DATA: cibilMsmeUrl + '/config/update/popUpLayer7Data',


  GENERATE_CONSUMER_ZIP: cibilMsmeUrl + '/msme/getConsumerZipResponse/',

  GENERATE_COMMERCIAL_REPORT: cibilMsmeUrl + '/msme/getCommericialFileBytes/',

  UPLOAD_CUST_MAST_BULK_UPLOAD_FILE: loansUrl + '/customer/customer-upload',
  // UPLOAD_CUST_MAST_BULK_UPLOAD_FILE:'http://localhost:2024/hsbc/loans/msme/customer/customer-upload',

  GET_CUST_MAST_BULK_UPLOAD_FILE: loansUrl + '/customer/get-cust-uploaded-file-data',
  // GET_CUST_MAST_BULK_UPLOAD_FILE:  'http://localhost:2024/hsbc/loans/msme/customer/get-cust-uploaded-file-data',

  GET_DATA_BY_MST_ID: loansUrl + '/customer/get-data-by-mst-id',

  // STREAM_GET_DATA_BY_MST_ID: 'http://localhost:2025/hsbc/loans/msme/customer/stream-get-data-by-mst-id',
  STREAM_GET_DATA_BY_MST_ID: loansUrl + '/customer/stream-get-data-by-mst-id',

  // Help & Support Upload
  UPLOAD_HELP_AND_SUPPORT: loansUrl + '/help-and-support/upload',
  GET_HELP_AND_SUPPORT_FILES: loansUrl + '/help-and-support/get-uploads',
  STREAM_HELP_AND_SUPPORT_VIDEO: loansUrl + '/help-and-support/stream',
  VIEW_HELP_AND_SUPPORT_PDF: loansUrl + '/help-and-support/view-pdf',
  DELETE_HELP_AND_SUPPORT_FILE: loansUrl + '/help-and-support/delete',
  SYNC_BUCKET_FILES: loansUrl + '/help-and-support/sync-bucket',
  // GET_DATA_BY_MST_ID:'http://localhost:2024/hsbc/loans/msme/customer/get-data-by-mst-id',

  GET_MCA_NETWORK_TAB_DETAILS: loansUrl + '/loansMca/getMcaNetworkTabDetais',
  GET_MCA_TAB_DETAILS: loansUrl + '/loansMca/getMcaTabDetails',
  DOWNLOAD_UDYAM_CERTIFICATE: loansUrl + '/karza/download-udyam-certificate',

  // customer segement bulk upload
  UPLOAD_CUST_SEG_BULK_UPLOAD_FILE: loansUrl + '/customer-segment-upload',
  GET_CUST_SEG_BULK_UPLOAD_FILE: loansUrl + '/get-cust-uploaded-file-data',
  GET_SEGEMENT_DATA_BY_ID: loansUrl + '/get-data-by-segement-code',

  //Existing
  GET_CUSTOMER: loansUrl + '/customer/get-cusotmer',
  GET_CUSTOMER_BIGQUERY: loansUrl + '/customer/bigquery/get-customer',
  GET_DASHBOARD_EXCEL_BIGQUERY: loansUrl + '/customer/bigquery/dashboard-excel-download',
  GET_SAVE_RISK_SEARCH_COMPANY_DETAILS: loansUrl + '/loansMca/getSaveRiskSearchDetails',
  SAVE_INDIVIDUAL_COMPNAY_GST_UDHYAM_SAVE_RISK: loansUrl + '/loansMca/saveIndividualGstUdhyamSaveRiskApi',
  GET_INDIVIDUAL_COMPNAY_GST_UDHYAM_SAVE_RISK: loansUrl + '/loansMca/getIndividualGstUdhyamSaveRiskApi',
  ADD_TO_TARGER_INDIVIDUAL_CUSTOMER: loansUrl + '/loansMca/addToTargetCustomers',
  DELETE_CUSTOMER: loansUrl + '/customer/deleteCustomer',
  GET_AUDIT_DATA: loansUrl + '/get_audit_data',

  ADD_TO_ORDER_FINANCIAL: loansUrl + '/loansMca/addToOrderFinancial',
  GET_STATUS_FOR_ORDER_FINANCIAL: loansUrl + '/loansMca/getStatusForOrderFinancial',
  GET_SPREAD_ORDER_STATUS: loansUrl + '/loansMca/getSpreadOrderStatus',
  // GET_SPREAD_ORDER_STATUS: loansUrl + '/loansMca/getSpreadOrderStatus',

  REFRESH_DATA_BASED_ON_API_ID: loansUrl + '/loansMca/refreshApisBasedOnId',
  GET_API_AUDIT_DATA: loansUrl + '/loansMca/getApiAuditData',
  GET_MCA_CHARGE: loansUrl + '/loansMca/get-mca-charges',
  GET_HSN_DETAIL: loansUrl + '/customer/get-hsn-detail',

  GET_GSTIN_LIST_BY_MASTER_ID: loansUrl + '/gst/getGSTINListByGstMasterId',
  GET_GST_ANALYSIS_DATA: loansUrl + '/gstAnalysis/getGstAnalysisData',
  GST_ANALYSIS_TP_BY_PAN: loansUrl + '/gstAnalysis/tpByPAN',
  GST_ANALYSIS_TP_BY_PAN_DATA: loansUrl + '/gstAnalysis/getTpByPanData',
  GST_ANALYSIS_REQ_OTP: loansUrl + '/gstAnalysis/requestOtp',
  GET_GST_HISTORY_DATA: loansUrl + '/gstAnalysis/get_gst_history', // gst history
  GET_CONSUMER_DETAILS: cibilUrl + '/msme/getIndividualAnalysis',
  GET_CIBIL_REPORT_DOWNLOAD: cibilUrl + '/msme/getCibilReportDownload',
  GET_CIBIL_PDF_DOWNLOAD: cibilUrl + '/msme/generateHtmltoPDF',
  GET_COMMERCIAL_DETAILS: cibilUrl + '/commercialcibildetail/calculatedinfo',
  SAVE_COMPANY_DETAILS_IN_CIBIL: cibilUrl + '/msme/save_company_details',
  CALL_BURAUE: cibilUrl + '/msme/bureau_call_api',
  GET_STATE_CITY_FROM_PINCODE: loansUrl + '/master/getCityStateNameByPincode',
  CALL_SIGNZY_API: cibilUrl + '/msme/getDetailsByPanFromSignzy',
  GET_BUREUE_HISTORY_DATA: cibilUrl + '/msme/get_bureau_history_java', // commericial and consumer history
  GET_XDAYS_FOR_CIBIL_PING: cibilUrl + '/msme/getXdaysForCibilPing',
  // GET_XDAYS_FOR_CIBIL_PING: 'http://localhost:2027/hsbc/cibil/msme/getXdaysForCibilPing',

  EXIM_ANALYSIS_HISTORY: loansUrl + '/exim/getEximHistory',
  EXIM_IEC_BY_PAN: loansUrl + '/exim/karza/getIECByPAN',
  EXIM_BY_NAME: loansUrl + '/exim/get-exim-by-name',

  EXIM_ANALYSIS_GET_DATA: loansUrl + '/exim/getSummaryDetailsByEximId',

  EXIM_ANALYSIS_HSN_CODE: loansUrl + '/exim/get-hsn-code',
  EXIM_ANALYSIS_IMPORT_DATA: loansUrl + '/exim/getImportExportAnalysis',
  EXIM_ANALYSIS_EXPORT_DATA: loansUrl + '/exim/getImportExportAnalysis',
  EXIM_ANALYSIS_BUYER_SELLER_DATA: loansUrl + '/exim/getSameBuyerSellerPeer',
  EXIM_ANALYSIS_SELLER_DATA: loansUrl + '/eximAnalysis/getExportData',
  EXIM_ANALYSIS_PRODUCT_PEER_DATA: loansUrl + '/exim/getProductImportExportPeer',
  EXIM_ANALYSIS_NEW_BUYER_SELLER_DATA: loansUrl + '/exim/get-new-buyer-seller',
  EXIM_ANALYSIS_GET_ANCHOR_DATA: loansUrl + '/exim/get-anchor',
  EXIM_ANALYSIS_GET_CCN_ANCHOR_DATA: loansUrl + '/exim/get-ccn-anchor',
  EXIM_ANALYSIS_EX_IM_COUNTRY_EXPOSURE_DATA: loansUrl + '/exim/get-country-exposure',
  EXIM_ANALYSIS_SEARCH_BY_PRODUCT: loansUrl + '/exim/getSearchByProduct',
  EXIM_COUNTRY_MASTER_LIST: loansUrl + '/exim/getEximCountryMasterList',
  GET_HSN_CODE_BY_EXIM_ID: loansUrl + '/exim/getHsnCodeByEximId',
  GET_COMPANY_NAMES: loansUrl + '/exim/search-company-by-name',

  EXIM_IEC_BY_COMPANY_NAME: loansUrl + '/exim/analysis-by-ccn',
  SAVE_CONSUMER_DETAILS: cibilUrl + '/msme/save_Consumer_details',

  GST_ANALYSIS_VERIFY_OTP: loansUrl + '/gstAnalysis/verifyOtp',
  GST_ANALYSIS_SUBMIT: loansUrl + '/gstAnalysis/submitGstAnalysis',

  BANK_ANALYSIS_STATEMENT_UPLOAD: loansUrl + '/bsAnalysis/uploadStatement',
  BANK_ANALYSIS_GET_DATA: loansUrl + '/bsAnalysis/getAnalysisData',
  BANK_ANALYSIS_TRANSACTION_DATA: loansUrl + '/bsAnalysis/getTransactionData',
  BANK_ANALYSIS_BOUNCE_CHEQUE: loansUrl + '/bsAnalysis/getBounceCheqData',
  BANK_ANALYSIS_VERIFY_PAN: loansUrl + '/bsAnalysis/verifyPan',
  BANK_ANALYSIS_CREATE_MASTER: loansUrl + '/bsAnalysis/createMaster',
  BANK_ANALYSIS_DOWNLOAD: loansUrl + '/bsAnalysis/downloadZipFileBsAnalysis',
  BANK_ANALYSIS_PDF_DOWNLOAD: bsUrl + '/bs-analysis/generateHtmltoPDF',

  LOANS_BS_FILES_DETAILS: loansUrl + '/loansBS/bankFileDetail',
  FETCH_BANK_LIST: loansUrl + '/loansBS/fetchBankList',
  GST_ANALYSIS_DOWNLOAD_EXCEL: loansUrl + '/gstAnalysis/generateExcel',
  GST_ANALYSIS_DOWNLOAD_PDF: loansUrl + '/gstAnalysis/generateHtmltoPDF',
  GET_ALERTS_TAB_DETAILS: loansUrl + '/loansMca/getAlertsTabDetais',
  UPDATE_ALERTS_TAB_DETAILS: loansUrl + '/loansMca/updateAlertsTrackit',
  INSIGHT_FILTER: loansUrl + "/filter/insightFilter",
  GET_ALL_CITIES_FILTER: loansUrl + "/filter/get-all-cities",
  GET_FILTER_LIST_FROM_API: loansUrl + "/filter/insight-filter-list",
  TOP_BAR_FILTER: loansUrl + "/filter/top-bar-filters",
  GET_TOP_BOR_FILTER_LIST_FROM_API: loansUrl + "/filter/top-bar/insight-filter-list",
  BG_ANALYSIS_DOWNLOAD_PDF: loansUrl + '/loansMca/generateHtmltoPDF',
  GET_USER_PERMISSIONS: userUrl + '/api/v1/permission/getpermissionList',
  GET_ALLPAGE_BYROLEID: userUrl + '/getAllPageAndSubpageByRoleId',
  GET_BANKER_USER_LIST: userUrl + '/getUserListBySP',
  LOCK_UNLOCK_USER: userUrl + '/lockUnlockUser',
  DELETE_USER: userUrl + '/deleteUser',
  ACTIVE_IS_ACTIVE_USER: userUrl + '/update_active_status',
  DOWNLOAD_EXCEL: userUrl + '/download/excel',
  USER_RESET_PASSWORD: userUrl + '/reset_password',
  GET_USER_DETAILS_LIST: userUrl + '/getUserDetails',
  GET_ORGANIZATION_LIST: userUrl + '/org/getOrgList',
  PRODUCT_LIST: userUrl + '/getProductList',
  GET_BRANCH_LIST: userUrl + '/getBranchList',
  GET_STATE_LIST: userUrl + '/get-states',
  GET_EMPLOYEE_LIST: userUrl + '/getAllEmployeeListWithUsername',
  GET_BANKER_ROLE_LIST: userUrl + '/getAllRolesByRoleId',
  UPDATE_USER: userUrl + '/updateUserDetailsfromHO',
  // UPDATE_USER:  'http://localhost:27752/common/user/updateUserDetailsfromHO',
  GET_ZONE_LIST: userUrl + '/get/zoneListFromOrgId',
  GET_CIRCLE_LIST: userUrl + '/get/circleListFromZoneAndOrgId',
  GET_BRANCH_MASTER_LIST: userUrl + '/get/branchListBasedOnCityAndOrgId',
  SAVE_USER_ROLE_PAGE_ACTION: userUrl + '/saveUserPageIdAndActionId',
  GET_ALL_PAGE_AND_SUBPAGE_AND_ACTION: userUrl + '/getAllPageAndSubpageAndAction',
  SAVE_ROLEID_AND_PAGEID_AND_ACTIONID: userUrl + '/saveRoleIdAndPageIdandActionId',
  GET_ALL_PAGE_AND_SUBPAGE_BY_ROLEID: userUrl + '/getAllPageAndSubpageByRoleId',
  //  SAVE_CUSTOMER_REGION:loansUrl + '/customer-region/add-customer-region',
  //GET_ALL_CUSTOMER_Region:'http://localhost:10505/loans/customer-region/get-all-customers-region',
  // GET_ALL_CUSTOMER_SEGMENT:'http://localhost:10505/loans/getAllCustomerSegData',
  //UPDATE_MAPPING: 'http://localhost:10505/loans/business-mapping/update/',
  // GET_HRMS_DATA: 'http://localhost:10505/loans/bulk/getHRMSData',
  // GET_RIGION_BUSINESS: 'http://localhost:10505/loans/business-mapping/get',

  GET_ALL_CUSTOMER_city: loansUrl + '/business-mapping/get-all-city',


  GET_ALL_CUSTOMER_SEGMENT: loansUrl + '/getAllCustomerSegData',

  UPDATE_MAPPING: loansUrl + '/business-mapping/insertAndUpdate',
  GET_HRMS_DATA: loansUrl + '/bulk/getHRMSData',
  GET_CITY_BUSINESS: loansUrl + '/business-mapping/get',

  // user management
  ADD_UPDATE_CUSTOMER_DATA: loansUrl + '/addUpdateCustomer',
  GET_ALL_CUSTOMER_DATA: loansUrl + '/getAllCustomerSegData',
  DELETE_CUSTOMER_dATA_BYID: loansUrl + '/deleteCustomerDataByid',
  DELET_ROLEMASTER_DATA_BYID: userUrl + '/deleteRolemasterDataByid',
  GET_ALL_ROLEMASTER_DATA: userUrl + '/getAllRolemasterData',
  ADD_UPDTAE_ROLEMASTER_DATA: userUrl + '/addUpdateRoleMaster',
  GET_USER_ROLES_DATA: userUrl + '/api/v1/permission/usersRole',
  UPLOAD_HRMS_BULK_FILE: loansUrl + '/bulk/hrms-data-upload',
  UPLOAD_PRE_SCREEN_DATA_FILE: loansUrl + '/preScreen/pre-screen-data-upload',
  CHECK_FILE_UPLOAD: loansUrl + '/preScreen/check',
  UPLOAD_PRE_SCREEN_PAN_FILE: loansUrl + '/preScreen/panNumber-file-upload',
  DELETE_USER_DATA: userUrl + '/deleteTheUser',
  GET_USERS_DATA: loansUrl + '/downloadExcel',
  DOWNLOAD_ALL_CUSTOMER_SEGEMENT: loansUrl + '/downloadAllCustomerSegement',
  DOWNLOAD_ALL_REGION: loansUrl + '/customer-region/downloadAllRegion',


  // Region upload data
  REGION_MASTER_UPLOAD: loansUrl + '/customer-region/customer-region-upload',

  GET_ALL_NONACTIVE_USERS_CUSTOMER_DATA: loansUrl + '/customer/downloadExcelOfCustomersForNonActiveUsers',

  // General Auditing

  GET_GENERAL_AUDIT_LOG: loansUrl + "/audit_log/get_general_audit_log",

  GET_USER_DETAILS_BY_ROLE_ID: loansUrl + '/customer/getUserDetailsByRoleId',

  GET_DASHBOARD_EXCEL: loansUrl + '/customer/dashboard-excel-download',

  GET_HISTORY_REGION_BULK_UPLOAD: loansUrl + '/customer-region/get-region-upload-files',

  // GET_REGION_DATA_BY_ID: loansUrl +'/customer-region/customer-region-upload',

  //customer-region/get-region-upload-files

  GET_REGION_DATA_BY_ID: loansUrl + '/customer-region/get-data-by-region-code',

  GET_API_STATUS: loansUrl + '/admin/dashboard/getApiStatusDataQuery',

  GET_IS_API_STATUS_SUCCESS: loansUrl + '/admin/dashboard/getApIStatus',

  GET_RESPONSE_BY_BUCKET_ID: loansUrl + '/bucket/getDataByBucketRefId',

  DOWNLOAD_USER_EXCEL: userUrl + '/download-all-users',

  STREAM_DOWNLOAD_USER_EXCEL: userUrl + '/stream-download-all-users',
  // STREAM_DOWNLOAD_USER_EXCEL: 'http://localhost:27752/common/user/stream-download-all-users',

  DOWNLOAD_USER_AUDIT_EXCEL: userUrl + "/download-excel-for-user-audits",

  STREAM_DOWNLOAD_USER_AUDIT_EXCEL: userUrl + "/stream-download-excel-for-user-audits",
  // STREAM_DOWNLOAD_USER_AUDIT_EXCEL: "http://localhost:27752/common/user/stream-download-excel-for-user-audits",

  DOWNLOAD_HRMS_DATA: loansUrl + '/bulk/get-hrms-active-data',

  DOWNLOAD_PRE_SCREEN_DATA: cibilUrl + '/preScreen/get-CibilPreScreen-data',

  PANCHECKINCIBILMATSR: cibilUrl + '/preScreen/panCheckInCibilMater',
  // PANCHECKINCIBILMATSR:'http://localhost:2027/hsbc/cibil/preScreen/panCheckInCibilMater',


  GET_ALL_ROLE_TYPE: userUrl + '/roleType/get-all-role-types',
  RM_FILTER_BY_CITY: loansUrl + "/filter/getRmDataByCities",
  SAVE_USER_ACTIVITY: userUrl + "/user-activity/save",

  // getAllApiStatusDetails :  loansUrl + '/getAllApiStatus'

  // getAllApiStatusDetails : 'http://localhost:2024/hsbc/loans/msme/dashboard/get-api-status'

  getAllApiStatusDetails: loansUrl + '/dashboard/get-api-status',

  CUSTOMER_EXPORT_EXCEL: loansUrl + '/customer/customer-export',

  COUNT_API_CALL_EXCEL: loansUrl + '/dashboard/api-call-count/download-excel',

  GET_API_COUNT_DATA: loansUrl + '/dashboard/api-call-count/get-all',

  SYNC_API_COUNT_DATA: loansUrl + '/dashboard/api-call-count/sync',

  FETCH_PRE_SCREEN_DATA_BY_PAN: cibilUrl + '/preScreen/get-pre-screen-data-by-pan',
  // FETCH_PRE_SCREEN_DATA_BY_PAN:'http://localhost:2027/hsbc/cibil/preScreen/get-pre-screen-data-by-pan',

  WEB_SOCKET_URL: loansUrl + '/sock/notify',
  // WEB_SOCKET_URL : 'http://localhost:2024/hsbc/loans/msme/sock/notify',

  GET_NOTES: cibilUrl + '/config/getNotes',

  GET_IN_CORPORATION: loansUrl + '/loansMca/getNewIncorporationStandard',

  FETCH_CUSTOMER_PORT_FOLIO: loansUrl + '/request-customer-portfolio/get-request-customer-portfolio',
  GET_TOTAL_COMPANIES_LIST: loansUrl + '/request-customer-portfolio/get-total-company-list',
  SAVE_CUSTOMER_PORT_FOLIO: loansUrl + '/request-customer-portfolio/save-request-customer-portfolio',
  SEARCH_CUSTOMER_PORT_FOLIO: loansUrl + '/request-customer-portfolio/search-request-customer-portfolio',

  TARGET_TRACKING_EXCEL: loansUrl + '/api/tracking/download-excel',
  AGEING_AND_TAT_EXCEL: loansUrl + '/api/tracking/download-AgingsAndTat-excel',

  REVOKE_CUSTOMER_PORT_FOLIO: loansUrl + '/request-customer-portfolio/save-request-customer-portfolio',

  GET_IN_CORPORATION_CITY_STATE: loansUrl + '/loansMca/getNewIncorporationStandard/CityState',

  GET_HSBC_BANKING_DATA: loansUrl + '/exim/getHsbcBankingBulkUploadedFileData',

  // GET_ALL_HSBC_BANKING_DATA: loansUrl + '/exim/hsbc-banking-excel-download',

  GET_HSBC_STATUS_DOWNLOAD_REPORT_FOR_COUNTRY: loansUrl + '/exim/download-new-hsbc-country-status-excel',

  GET_HSBC_STATUS_DOWNLOAD_REPORT: loansUrl + '/exim/download-new-hsbc-status-excel',

  UPLOAD_HSBC_BANKING_BULK_FILE: loansUrl + '/exim/hsbcBankingDataUpload',

  GET_HSBC_BANKING_BULK_MST_ID: loansUrl + '/exim/getHsbcBankingDataByMstId',

  GET_HSBC_COUNTRY_PRESENCE_DATA: loansUrl + '/exim/getHsbcCountryPresenceBulkUploadedFileData',

  GET_HSBC_COUNTRY_PRESENCE_MST_ID: loansUrl + '/exim/getHsbcCountryPresenceDataByMstId',

  UPLOAD_HSBC_COUNTRY_PRESENCE_BULK_FILE: loansUrl + '/exim/countryPresenceDataUpload',

  GET_ALL_HSBC_COUNTRY_PRESENCE_DATA: loansUrl + '/exim/hsbc-country-presence-excel-download',
  PINCODE_BY_CITY: loansUrl + '/filter/get-pincodes',

  // Bank Portfolio upload

  UPLOAD_BANK_PORTFOLIO: loansUrl + '/bank-portfolio/uploadBankPortfolioFromFileName',
  GET_BANK_UPLOAD_HISTORY: loansUrl + '/bank-portfolio/get-bank-uploaded-file-data',
  DOWNLOAD_BANK_PORTFOLIO_BY_TYPE: loansUrl + '/bank-portfolio/get-data-by-file-id',
  GET_ALL_BANK_UPLOAD_UNIQUE_DATA: loansUrl + '/bank-portfolio/getBankExportUniqueAccIFSCData',
  DOWNLOAD_EXCEL_BANK_PORTFOLIO_ACC_UNIQUE: loansUrl + '/bank-portfolio/get-download-excel',
  SUBMIT_EXPORT_UNIQUE_IFSC_DATA: loansUrl + '/bank-portfolio/submitExportUniqueIFSC',


  // Bank Portfolio upload ONE TIME

  UPLOAD_BANK_PORTFOLIO_ONE_TIME: loansUrl + '/bank-portfolio/uploadBankPortfolioFromFileNameOneTime',

  GET_BANK_UPLOAD_HISTORY_ONE_TIME: loansUrl + '/bank-portfolio/get-bank-uploaded-file-data-one-time',



  //Innovation
  GET_INNOVATE_BANK_DETAILS: loansUrl + '/tracxn/getInnovateBankingDetails',
  GET_DOMAIN_LIST: loansUrl + '/tracxn/getDomainList',
  CALL_TRACXN_APIS: loansUrl + '/tracxn/callTracxnApis',
  GET_ALL_EMPLOYEE_DETAILS: loansUrl + '/tracxn/getAllEmployeeDetails',
  GET_ALL_INVESTOR_DETAILS: loansUrl + '/tracxn/getListOfInvestor',
  GET_ALL_FACILITORS_DETAILS: loansUrl + '/tracxn/getListOfFaciliters',
  REFRESH_TRACXN_API: loansUrl + '/tracxn/refreshTracxnApi',
  GET_ALL_COMPETITOR: loansUrl + '/tracxn/getAllCompetitors',
  GET_ALL_AQUIRED_COMPANIES: loansUrl + '/tracxn/getAllAquiredCompanies',
  GET_ALL_PART_OF_COMPANIES: loansUrl + '/tracxn/getAllPartOfCompanies',
  CALL_TRACXN_INVESTOR_PROFILE_API: loansUrl + '/tracxn/callTracxnInvestorApi',
  CALL_TRACXN_INVESTOR_COMPANY_API: loansUrl + '/tracxn/callTracxnCompanyApi',
  GET_INVESTOR_PROFILE_DETAILS: loansUrl + '/tracxn/getInvestorProfileDetails',
  GET_ALL_BUSINESS_AND_COVERAGE_DETAILS: loansUrl + '/tracxn/getAllBusinessDetailsAndCoverageAreaDetails',
  GET_ALL_FUNDING_ROUND_LIST_DETAILS: loansUrl + '/tracxn/getAllFundingRoundList',
  GET_ALL_TRACXN_COMPANY_DETAILS: loansUrl + '/tracxn/getAllTracxnCompanyList',
  GET_ALL_ASSOCIATED_ENTITIES_DETAILS: loansUrl + '/tracxn/getAllAssociatedEntities',
  GET_ALL_TRACXN_INVESTOR_COMPANY_DETAILS: loansUrl + '/tracxn/getAllTracxnInvestorCompanyList',
  GET_INVESTEE_COMPANIES_SEARCH_DETAILS: loansUrl + '/tracxn/getInvesteeCompaniesSearchDetails',
  CALL_INVESTOR_TRACXN_COMPANY_SEARCH_API: loansUrl + '/tracxn/callInvestorTracxnCompanySearchApi',
  CALL_TRACXN_ASSOCIATED_ENTITIES_API: loansUrl + '/tracxn/callTracxnAssociatedEntitiesApi',
  CALL_TRACXN_INVESTEE_COMPANIES_API: loansUrl + '/tracxn/call-tracxn-investee-companies',
  GET_ALL_TRACXN_FUNDING_VENTURE_DEBT_DETAILS: loansUrl + '/tracxn/getAllFundingVentureDebtList',
  GET_ALL_TRACXN_FUNDING_BUYOUT_DETAILS: loansUrl + '/tracxn/getAllFundingBuyOutDebtList',


  //ABB Account
  UPLOAD_ABB_ACCOUNT: loansUrl + '/abb_account/uploadBulkAccountData',
  GET_ABB_UPLOAD_HISTORY: loansUrl + '/abb_account/getAbbHistory',
  DOWNLOAD_ABB_UPLOAD_BY_TYPE: loansUrl + '/abb_account/get_data_by_file_id',
  INITIAL_BANK_ANALYSIS_INTERNAL: loansUrl + '/loansInternalBS/getInitAnalysisData',
  // INITIAL_BANK_ANALYSIS_INTERNAL : 'http://localhost:20505/hsbc/loans/msme/loansInternalBS/getInitAnalysisData',
  BANK_ANALYSIS_INTERNAL: loansUrl + '/loansInternalBS/getAnalysisData',
  GET_BALANCE_CURRENT_ACCOUNT_CRILIC: loansUrl + '/loansInternalBS/get-current-account-balance-crilic',
  // BANK_ANALYSIS_INTERNAL : 'http://localhost:20505/hsbc/loans/msme/loansInternalBS/getAnalysisData',
  GET_CHILD_CUSTOMERS_DATA: loansUrl + '/child-customer/by-pan',
  PORTFOLIO_BANK_ANALYSIS_INITIAL: loansUrl + '/loansInternalBS/getPortfolioInitData',
  // PORTFOLIO_BANK_ANALYSIS_INITIAL : 'http://localhost:20505/hsbc/loans/msme/loansInternalBS/getPortfolioInitData',

  PORTFOLIO_BANK_ANALYSIS: loansUrl + '/loansInternalBS/getPortfolioAnalysisData',
  // PORTFOLIO_BANK_ANALYSIS : 'http://localhost:20505/hsbc/loans/msme/loansInternalBS/getPortfolioAnalysisData',


  GET_YEARWISE_PORTFOLIO_REPORT: loansUrl + '/abb_account/get_yearwise_protfolio_report',
  GET_CURRENCY: loansUrl + '/abb_account/get_currency',

  // ABB Report
  GET_ABB_REPORT_DATA: loansUrl + '/abb_account/get_abb_report',
  GET_TOTAL_ABB_REPORT_DATA: loansUrl + '/abb_account/get_abb_report_total',

  // CUSTOMER_RM
  CUSTOMER_RM_UPLOAD_FILE: loansUrl + '/customer-rm-mapping/customer-staff-upload',
  FETCH_TOTAL_ENTRY: loansUrl + '/customer-rm-mapping/getCustomerRmDataByMstId',
  GET_CUST_RM_UPLOAD_FILE_DATA: loansUrl + '/customer-rm-mapping/get-cust-rm-uploaded-file-data',
  CUSTOMER_INCOME_UPLOAD: loansUrl + '/customer/customer-income-upload',
  GET_HISTORY_CUSTOMER_INCOME_BULK_UPLOAD: loansUrl + '/customer/getCustIncomeUploadedFileData',
  GET_CUSROMER_INCOME_BULK_MST_ID: loansUrl + '/customer/getCusIncomeDataByMstId',
  UPDATE_ALERT: loansUrl + '/loansMca/updateAlert',


  GET_REJECTED_PORTFOLIO: loansUrl + '/customer/rejected-portfolio/get',
  GET_CLIENT_UPDATE_HISTORY: loansUrl + '/customer/rejected-portfolio/getClientUpdateHistory',
  CLIENT_UPDATE_REASONS_MASTER: loansUrl + '/customer/rejected-portfolio/clientUpdateMasterList',
  // GET_CLIENT_UPDATE_HISTORY: 'http://localhost:2025/hsbc/loans/msme/customer/rejected-portfolio/getClientUpdateHistory',
  // CLIENT_UPDATE_REASONS_MASTER: 'http://localhost:2025/hsbc/loans/msme/customer/rejected-portfolio/clientUpdateMasterList',
  REJECTED_PORTFOLIO_EXPORT_EXCEL: loansUrl + '/customer/rejected-portfolio/export',
  REJECT_CUSTOMER: loansUrl + '/customer/rejected-portfolio/reject',
  REJECTED_HISTORY: loansUrl + '/customer/rejected-portfolio/rejection-history',

  GET_REPORT_STATUS: loansUrl + '/api/report-status',
  REPORT_FAIL: loansUrl + '/api/report-status/failReportAndMarkAsTimeOut',

  GET_CITY_LOCATION_PINCODE: loansUrl + '/filter/top-bar/getCityLocationPincode',

  GET_FILE_FROM_BUCKET: loansUrl + '/opl/bucket/deseriablizeFile',
  DELETE_REJECTED_CUSTOMER: loansUrl + '/customer/rejected-portfolio/delete',
  GET_ABB_MASTER_LIST: loansUrl + '/abb_account/getAbbMasterList',
  GET_RM_USER_LIST: loansUrl + '/abb_account/getRmUserList',
  GET_ABB_REPORT_LEVEL_DATA: loansUrl + '/abb_account/geAbbLevelReport',
  SEARCH_CUSTOMER_DATA: loansUrl + '/request-customer-portfolio/search-customer-data',



  UPLOAD_TRACXN_LENDING_INDICATORS_BULK_FILE: loansUrl + '/tracxn/traxcnBulkUpload',

  GET_TRACXN_BULK_DATA_MST_ID_AND_CATEGORY: loansUrl + '/tracxn/getDataByTypeIds',
  GET_TRACXN_BULK_UPLOAD_FILE_DATA: loansUrl + '/tracxn/getTraxcnUploadFiles',
  UPLOAD_TRACXN_BULK_FILE: loansUrl + '/tracxn/traxcnBulkUpload',

  // GET_TRACXN_BULK_UPLOAD_FILE_DATA : 'http://localhost:2024/hsbc/loans/msme/tracxn/getTraxcnUploadFiles',
  // GET_TRACXN_BULK_DATA_MST_ID_AND_CATEGORY: 'http://localhost:2024/hsbc/loans/msme/tracxn/getDataByTypeIds',
  // UPLOAD_TRACXN_BULK_FILE: 'http://localhost:2024/hsbc/loans/msme/tracxn/traxcnBulkUpload',

  // DOWNLOAD_TRACXN_LENDING_INDICATORS_DATA: loansUrl+'/tracxn/getDataByTypeIds'

  GET_LENDING_INDICATORS_DATA: loansUrl + '/tracxn/getLendingAnalysisAlert',
  GET_TOTAL_OPPORTUNITY: loansUrl + '/request-customer-portfolio/get-request-customer-portfolio',

  GET_NEW_GCC: loansUrl + '/newGccAnn/search',
  // GET_NEW_GCC: 'http://localhost:2025/hsbc/loans/msme/newGccAnn/search',

  GET_LOCATION_HQ: loansUrl + '/newGccAnn/getLocationAndHq',
  //  GET_LOCATION_HQ: 'http://localhost:2025/hsbc/loans/msme/newGccAnn/getLocationAndHq',

  UPLOAD_NEW_GCC_FILE: loansUrl + '/newGccAnn/upload',
  // UPLOAD_NEW_GCC_FILE:  'http://localhost:2025/hsbc/loans/msme/newGccAnn/upload',

  GET_NEW_GCC_FILE_HISTORY: loansUrl + '/newGccAnn/getUploadHistory',
  // GET_NEW_GCC_FILE_HISTORY:  'http://localhost:2025/hsbc/loans/msme/newGccAnn/getUploadHistory',

  GET_NEW_GCC_FILE_STREAM: loansUrl + '/newGccAnn/getStreamDataByBucketRefId',
  // GET_NEW_GCC_FILE_STREAM:  'http://localhost:2025/hsbc/loans/msme/newGccAnn/getStreamDataByBucketRefId',

  // CRISIL
  ORDER_CRISIL_DATA: loansUrl + '/api/dashboard/order-crisil-data',

  GET_CRISIL_DATA_FROM_DB: loansUrl + '/api/dashboard/get-crisil-data',

  DOWNLOAD_NEW_INCORPORATION_EXCEL: loansUrl + '/loansMca/download-new-incorporation-excel',
  GET_NEW_INCORPORSTION_EXCEL_STATUS: loansUrl + '/loansMca/get-new-incorporation-status-reports',
  GET_SCHDULER_FILTER_DETAILS: loansUrl + '/filter/get-schedular-dtl',
  GET_SCHEDULAR_REPORT_DOWNLOAD: loansUrl + '/filter/get-schedular-excel',
  CALL_GET_MASTER_FILE_DATA: loansUrl + '/commercial/cibil/getMasterIds',
  FETCH_BS_UPLOAD_HISTORY: loansUrl + '/bsAnalysis/fetchUploadBsHistory',
  SUBMIT_BS_UPLOAD_DATA: loansUrl + '/bsAnalysis/submitUploadData',
  DELETE_BS_UPLOAD_FILE_DATA: loansUrl + '/bsAnalysis/deleteFileData',
  DELETE_BS_UPLOAD_ACC_DATA: loansUrl + '/bsAnalysis/removeAccData',
  CALL_MARK_FILE_COMPLETED: loansUrl + '/commercial/cibil/markFileCompleted',
  UPLOAD_STATUS_CHANGE: loansUrl + '/preScreen/uploadStatusChange',
  DOWNLOAD_ERROR_NO_HIT_FILES: loansUrl + '/preScreen/dowmloadErrorAndNoHit',
  DOWNLOAD_ALL_CUSTOMER_PRE_SCREEN_DATA: loansUrl + '/preScreen/getAllCustomerPreScreenData',
  PR_BULK_UPLOAD_HISTORY: loansUrl + '/preScreen/getPreScreenFileDataByFileId',
  GET_PART_FILE_Data_MST_ID: loansUrl + '/preScreen/getPreScreenPartDataByMstId',

  GET_AGRI_EXIM_HSN_DETAIL: loansUrl + '/customer/get-agri-exim-hsn-detail',


  DELETE_MULTIPLE_CUSTOMER: loansUrl + '/customer/move-to-prospects',
  // Matching Tool

  GET_INPUT_MATCHING_REPORT_DATA: loansUrl + '/matching/base_audit',
  GET_MATCHING_REPORT_DATA: loansUrl + '/matching/match_audit',
  UPLOAD_INPUT_MATCHING_FILES: loansUrl + '/matching/data_input_upload',
  UPLOAD_MATCHING_FILES: loansUrl + '/matching/data_matching_upload',
  GET_MATCHING_AUDIT_DATA: loansUrl + '/matching/audit_data',

  GET_NEW_GCC_EXCEL: loansUrl + '/newGccAnn/generateXlsx',
  //  GET_NEW_GCC_EXCEL: 'http://localhost:2025/hsbc/loans/msme/newGccAnn/generateXlsx',

  GET_NEW_GCC_EXCEL_STATUS: loansUrl + '/newGccAnn/getExcelStatusReports',
  //  GET_NEW_GCC_EXCEL_STATUS :  'http://localhost:2025/hsbc/loans/msme/newGccAnn/getExcelStatusReports',
  GET_SUPPLIER_CUSTOMER_LEVEL_REPORT: loansUrl + '/loansInternalBS/get-supplier-customer-level-report',

  GET_ALL_RM_CUSTOMER_DATA: loansUrl + '/customer-rm-mapping/downloadAllRmCustomerData',

  CONSUMER_CALL_MARK_FILE_COMPLETED: loansUrl + '/consumer/cibil/markFileCompleted',
  CONSUMER_CALL_GET_MASTER_FILE_DATA: loansUrl + '/consumer/cibil/getMasterIds',
  CONSUMER_UPLOAD_CIBIL_FILE_FROM_FILE_NAME: loansUrl + '/consumer/cibil/uploadCibilFileFromFileName',
  CONSUMER_GET_BULK_BY_FILE_ID: loansUrl + '/consumer/cibil/get-data-by-file-id',
  GET_PAN_FROM_DIN_FOR_DIRECTOR: loansUrl + '/loansMca/getPanFromDinForDirector',

  DOWNLOAD_COUNTRY_EXPOSURE: loansUrl + '/exim/download-country-exposure',

  SEARCH_RM_DATA: loansUrl + '/request-customer-portfolio/search-rm-data',
  SEARCH_BY_RMID: loansUrl + '/request-customer-portfolio/search-by-rmid',
  SAVE_REQEST_RM_DATA: loansUrl + '/request-customer-portfolio/save-request-by-rm',
  SEARCH_HISTORY_BY_RM: loansUrl + '/request-customer-portfolio/search-history-by-rm',
  UPDATE_REQUEST_BY_RM: loansUrl + '/request-customer-portfolio/update-request-rm-by-uuid',
  UPDATE_REQUEST_BY_RM_FOR_RECEIVER: loansUrl + '/request-customer-portfolio/update-request-rm-by-ids',
  GET_EXCH_BULK_UPLOAD_FILE: loansUrl + '/bulk/getExchangeRateUploadedFileData',
  UPLOAD_EXCH_BULK_FILE: loansUrl + '/bulk/exchange-master-upload',
  GET_EXCH_DATA_BY_MST_ID: loansUrl + '/bulk/get-exch-data-by-mst-id',

  UPLOAD_FDI_ODI_ECB_WALLET_FILE: loansUrl + '/fdiOdiAndEcbWallet/uploadRecords',
  GET_FDI_ODI_ECB_WALLET_FILE_HISTORY: loansUrl + '/fdiOdiAndEcbWallet/getUploadFileHistory',
  GET_FDI_ODI_ECB_WALLLET_FILE_STREAM: loansUrl + '/fdiOdiAndEcbWallet/getStreamDataByBucketRefId',
  GET_FDI_ODI_ECB_WALLET_DATA_BY_CIN: loansUrl + '/fdiOdiAndEcbWallet/getFdiOdiEcbWalletDataByCin',
  // GET_FDI_ODI_ECB_WALLET_DATA_BY_CIN: loansUrl + '/fdiOdiAndEcbWallet/getFdiOdiEcbWalletDataByCin',


  //  UPDATE_REQUEST_BY_RM_FOR_RECEIVER : loansUrl+  '/request-customer-portfolio/update-request-rm-by-ids',

  UPLOAD_EXIM_DATA: loansUrl + '/exim/uploadEximData',
  EXIM_BULK_UPLOAD_DATA_FOR_EXPORT: loansUrl + '/exim/eximBulkUploadDataForExport',
  EXIM_BULK_UPLOAD_DATA_FOR_IMPORT: loansUrl + '/exim/eximBulkUploadDataForImport',
  DOWNLOAD_EXIM_EXPORT_IMPORT_DATA_BY_MSTID: loansUrl + '/exim/getEximExportImportDataByMstId',
  GET_EXIM_WALLET_DATA: loansUrl + '/exim/getEximWalletData',
  GET_EXIM_WALLET_DATA_FROM_FILTER: loansUrl + '/exim-internal-data/analysis-data',
  GET_APP_TIME_OUT_TIME: bankerDashboard + '/api/config/timeout',

  // Added New
  GET_BULK_API_DASHBOARD: loansUrl + '/admin/dashboard/getBulkApiDashboard',
  GET_API_HISTORY: loansUrl + '/api-history/getApiHistory',
  GET_MIGRATION_API_DASHBOARD: loansUrl + '/admin/dashboard/getMigrationApi',
  GET_API_STATUS_DASHBOARD: loansUrl + '/admin/dashboard/getApiStatus/',
  GET_BULK_API_SYNC_ASYNC_DASHBOARD: loansUrl + '/admin/dashboard/getBulkApiSyncAsyncDashboard',


  SAVE_API_HISTORY: '/hsbc/schedular/api-history/saveApiHistory',
  SAVE_API_HISTORY_QA: '/hsbc/loans/msme/api-history/saveApiHistory',

  GET_BY_BUCKET_RES: baseUrl + '/hsbc/api/saveRisk/getStreamDataByBucketRefId',
  GET_BY_NONJSON_BUCKET_RES: baseUrl + '/hsbc/api/api/crisil/getStreamDataByBucketRefId',
  BASE_URL: baseUrl,

  GET_MCA_CUSTOMER_TYPE: loansUrl + '/customer/getAllActiveCustomerTypes',
  UPLOAD_PERFIOUS_DIRECTOR_NAME: loansUrl + '/loansMca/update/prefiousDirectorName',
  SAVE_OR_UPDATE_CAMPAIGN_DETAILS: dashboardUrl + '/opportunityDashboard/saveOrUpdateCampaignDetails',
  GET_CAMPAIGN_DETAILS: dashboardUrl + '/opportunityDashboard/getCampaignDetails',
  GET_CIR_COUNTS_BY_CAMPAIGN_ID: dashboardUrl + '/opportunityDashboard/getCirCountsByCampaignId',
  FETCH_DASHBOARD_DATA: dashboardUrl + '/opportunityDashboard/getOpportunityDashboardData',
  UPDATE_CONVERT_REJECT_STATUS_FOR_CUSTOMER: dashboardUrl + '/opportunityDashboard/updateCustomerStatus',
  FETCH_FILTER_DATA_LIST: dashboardUrl + '/opportunityDashboard/fetch-filter-data',
  DOWNLOAD_CAMPAIGN_EXCEl: dashboardUrl + '/opportunityDashboard/document/downloadCampaignExcel',
  GET_INACTIVE_CAMPAIGNS: dashboardUrl + '/opportunityDashboard/document/getInactiveCampaign',
  GET_EXPIRED_CAMPAIGNS: dashboardUrl + '/opportunityDashboard/document/getExpiredCampaign',
  GET_ALL_CAMPAIGN_LIST: dashboardUrl + '/opportunityDashboard/document/getAllCampaignList',
  GET_CAMPAIGN_REPORT_STATUS: dashboardUrl + '/opportunityDashboard/document/getReportStatus',
  GET_FILE_S3_BUCKET: dashboardUrl + '/opl/bucket/deseriablizeFile',
  GET_PREAPPROVED_REPORT: dashboardUrl + '/opportunityDashboard/download-preapproved-excel',//
  GET_CAMPAIGN_SUMMARY: dashboardUrl + '/opportunityDashboard/document/getCampaignSummary',
  GET_CLIENT_UPDATE_AND_REJECTION_REASON_LIST: loansUrl + '/clientUpdate/clientUpdateMasterList',
  ADD_CLIENT_UPDATE_AND_REJECTION_REASON: loansUrl + '/clientUpdate/saveClientUpdateRejectionReasonDetails',
  DELETE_REJECTION_REASON: dashboardUrl + '/deleteRejectionReason',
  REJECTION_REMARK_STATUS: loansUrl + '/clientUpdate/rejectionRemarkToggle',
  BANK_ANALYSIS_STATEMENT_SAVE_REQUEST: loansUrl + '/bsAnalysis/multi/saveAccData',
  BANK_ANALYSIS_STATEMENT_SUBMIT_MULTI: loansUrl + '/bsAnalysis/multi/submitData',
  BANK_ANALYSIS_DOWNLOAD_MULTI: loansUrl + '/bsAnalysis/multi/downloadZipFileBsAnalysis',
  BANK_ANALYSIS_GET_DATA_MULTI: loansUrl + '/bsAnalysis/multi/getAnalysisData',
  // UPLOAD_PERFIOUS_DIRECTOR_NAME: loansUrl+'/loansMca/update/prefiousDirectorName',


  GET_PR_DASHBOARD_FILTER: loansUrl + '/dashboard/getPrDashboardFilterData',
  GET_PR_DASHBOARD_FILTER_LIPISEARCH: loansUrl + '/dashboard/getLendingAnalysisFromLipiSearch',
  GET_PR_DASHBOARD_DEPENDANT_FILTER: loansUrl + '/dashboard/getPrDashboardDependentFilterData',
  GET_PR_DASHBOARD_DEPENDENT_FILTER_LIST: loansUrl + '/dashboard/getPrDashboardDependentFilterList',
  // GET_PR_DASHBOARD_DEPENDENT_FILTER_LIST: 'http://localhost:2025/hsbc/loans/msme/dashboard/getPrDashboardDependentFilterList',
  GET_PR_DASHBOARD_LENDING_ANALYSIS: loansUrl + '/dashboard/getLendingAnalysis',
  GET_PR_DASHBOARD_LENDING_ANALYSIS_LIPISEARCH: loansUrl + '/dashboard/getLendingAnalysisFromLipiSearch',
  GET_DEC_PAN: loansUrl + '/dashboard/getDecPan',
  // GET_DEC_PAN: 'http://localhost:2025/hsbc/loans/msme/dashboard/getDecPan',
  // GET_PR_DASHBOARD_FILTER: 'http://localhost:1003/hsbc/loans/msme/dashboard/getPrDashboardFilterData',
  // GET_PR_DASHBOARD_LENDING_ANALYSIS: 'http://localhost:1004/hsbc/loans/msme/dashboard/getLendingAnalysis',
  // DOWNLOAD_EXCEL_PR: 'http://localhost:1004/hsbc/loans/msme/dashboard/downloadExcelPR',
  DOWNLOAD_EXCEL_PR: loansUrl + '/dashboard/downloadExcelPR',
  PR_CAMPAIGN_DETAILS_SAVE: dashboardUrl + '/opportunityDashboard/prCampaignDetailsSave',


  GET_MATCHING_DATA_DOWNLOAD: loansUrl + '/matching/downloadFile',
  EXIM_DASHBOARD_UPLOAD: loansUrl + '/eximDashboard/upload',
  EXIM_DASHBOARD_GET_HISTORY: loansUrl + '/eximDashboard/audit-list',
  EXIM_DASHBOARD_RETRY_UPLOAD: loansUrl + '/eximDashboard/retry-upload',
  EXIM_DASHBOARD_DOWNLOAD_FILE: loansUrl + '/eximDashboard/download-file',
  HSN_BULK_DATA_UPLOAD: loansUrl + '/hsn-bulk-upload/upload',
  HSN_BULK_DATA_GET_HISTORY: loansUrl + '/hsn-bulk-upload/audit-list',
  HSN_BULK_DATA_RETRY_UPLOAD: loansUrl + '/hsn-bulk-upload/retry-upload',
  HSN_BULK_DATA_DOWNLOAD_FILE: loansUrl + '/hsn-bulk-upload/download-file',
  GET_STATUS_AUDIT_DATA_FOR_CUSTOMER: dashboardUrl + '/opportunityDashboard/getAuditStatusForCustomer',

  SHARE_TO_RM: loansUrl + '/loansMca/shareToRm',
  SHARE_TO_RM_BULK: loansUrl + '/loansMca/shareToRmBulk',
  GET_ALL_SHARED_RM: loansUrl + '/loansMca/getAllSharedRm',
  REVOKED_SHARED_RM: loansUrl + '/loansMca/revokedSharedRm',
  WEB_SOCKET_URL_FOR_DS: dashboardUrl + '/sock/notify',
  GET_ALL_PRODUCT_NAMES: dashboardUrl + '/opportunityDashboard/document/getAllProductName',
  CREATE_CAMPAIGN_FROM_EXCEL: dashboardUrl + '/opportunityDashboard/create-campaign-from-excel',
  GET_CAMPAIGN_UPLOAD_HISTORY: dashboardUrl + '/opportunityDashboard/getCampaignUploadHistory',
  DOWNLOAD_CAMPAIGN_UPLOAD_FILE: dashboardUrl + '/opportunityDashboard/downloadCampaignUploadFile',
  INCOME_DASHBOARD_EXCEL_UPLOAD: dashboardUrl + '/income-dashboard/excel/upload/',
  INCOME_DASHBOARD_EXCEL_UPLOAD_HISTORY: dashboardUrl + '/income-dashboard/excel/upload/history',
  INCOME_DASHBOARD_EXCEL_GET_FILE: dashboardUrl + '/income-dashboard/excel/get-file',
  COMMERCIAL_CRIF_DATA_EXCEL_UPLOAD: loansUrl + '/commercial/crif/uploadCrifBulkData',
  COMMERCIAL_CRIF_DATA_EXCEL_UPLOAD_HISTORY: loansUrl + '/commercial/crif/get-crif-bulk-uploaded-file-data',
  //COMMERCIAL_CRIF_DATA_EXCEL_UPLOAD_HISTORY: 'http://localhost:2025/hsbc/loans/msme/commercial/crif/get-crif-bulk-uploaded-file-data',
  COMMERCIAL_CRIF_DATA_EXCEL_GET_FILE: loansUrl + '/commercial/crif/get-data-by-file-id',
  // COMMERCIAL_CRIF_DATA_EXCEL_GET_FILE: 'http://localhost:2025/hsbc/loans/msme/commercial/crif/get-data-by-file-id',
  CRILC_DATA_EXCEL_UPLOAD_WITH_FILE: loansUrl + '/crilc/uploadCrilcBulkDataWithFile',
  CRILC_DATA_EXCEL_UPLOAD_HISTORY: loansUrl + '/crilc/get-crilc-bulk-uploaded-file-data',
  CRILC_DATA_EXCEL_GET_FILE: loansUrl + '/crilc/download-file-by-detail-id',
  CRILC_AUDIT_REPORT:loansUrl + '/crilc/get-crilc-audit-report-data',
  CRILC_RUN_MONTHLY_FETCH: loansUrl +'/crilc/run-monthly-fetch',
  CRILC_RERUN_FAILED_FILES:  loansUrl +'/crilc/rerun-failed-files',
  CRILC_DOWNLOAD_CONSOLIDATED_REPORT: loansUrl + '/crilc/download-consolidated-report',
  CRILC_DOWNLOAD_AUDIT_REPORT: loansUrl + '/crilc/download-audit-report',
  CRILC_DOWNLOAD_ORIGINAL_FILE: loansUrl + '/crilc/download-original-file',
  CRILC_LENDER_DETAILS: loansUrl + '/crilc/get-crilc-lender-details',

  // CRIF Commercial PR Data URLs
  CRIF_COMMERCIAL_PR_UPLOAD: loansUrl + '/crif-commercial-pr/upload',
  CRIF_COMMERCIAL_PR_HISTORY: loansUrl + '/crif-commercial-pr/history',
  CRIF_COMMERCIAL_PR_INPUT_MASTER_IDS: loansUrl + '/crif-commercial-pr/input-master-ids',
  CRIF_COMMERCIAL_PR_DOWNLOAD: loansUrl + '/crif-commercial-pr/download',
  CRIF_COMMERCIAL_PR_DOWNLOAD_INPUT_FILE: loansUrl + '/crif-commercial-pr/download-input-file',
  CRIF_COMMERCIAL_PR_MARK_COMPLETE: loansUrl + '/crif-commercial-pr/mark-complete',
  CRIF_UPLOAD_CIBIL_FILE_FROM_FILE_NAME: loansUrl + '/crif-commercial-pr/uploadCibilFileFromFileName',
  CRIF_GET_CUSTOMER_UPLOAD_HISTORY: loansUrl  + '/crif-commercial-pr/get-customer-upload-history',
  CRIF_GET_DATA_BY_FILE_ID: loansUrl  + '/crif-commercial-pr/get-data-by-file-id',
  DOWNLOAD_CRIF_DATA_BY_FILE_ID: loansUrl  + '/crif-commercial-pr/download-data-by-file-id',

  MANAGE_HIERARCHY: loansUrl + '/loansMca/manageHierarchy',
  GET_DIRECTOR_CONTACT_NUMBER: loansUrl + '/insta/finance/getDirectorContact',
  // GET_DIRECTOR_CONTACT_NUMBER: 'http://localhost:2025/hsbc/loans/msme/insta/finance/getDirectorContact',
  GET_INCOME_VISUALIZATION_DATA: dashboardUrl + '/income-dashboard/visualization',
  GET_FILTER_OPTIONS: dashboardUrl + '/income-dashboard/filter-options',

  GET_ASSIGN_HISTORY_DATA: loansUrl + '/loansMca/getAssignUserHistoryData',
  GET_ASSIGNMENT_SOURCE: loansUrl + '/filter/getAssignmentSource',
  GET_NOTIFICATION_DATA_FOR_USER: notificationUrl + '/api/notification-transactions/get-notification-data',
  MARK_NOTIFICATION_AS_READ: notificationUrl + '/api/notification-transactions/mark-as-read',
  SAVE_NOTIFICATION_MASTER_DATA: notificationUrl + '/api/notification-master/save-or-update-master-data',
  GET_NOTIFICATION_MASTER_DATA: notificationUrl + '/api/notification-master/dashboard-data',
  DELETE_NOTIFICATION_MASTER_DATA: notificationUrl + '/api/notification-master/deleteNotificationData',
  SAVE_NOTIFICATION_DATA: notificationUrl + '/api/notification-transactions/save-notification-data',
  GET_COUNT_ALL_OF_TABLE: loansUrl + '/data-stream/bronze/count/all',
  SYNC_DATA_STREAM: loansUrl + '/data-stream/bronze/sync/data',
  GET_SILVER_AUDIT_DATA: loansUrl + '/data-stream/silver/flat/table/audit',
  // // Parent Company Search API with pagination
  SEARCH_PARENT_COMPANY: loansUrl + '/filter/search-parent-company',
  SEARCH_PARENT_COMPANY_DASHBOARD: dashboardUrl + '/filter/parent-company/paginated',
  // // Parent Country API
  GET_PARENT_COUNTRY: dashboardUrl + '/filter/parent-country',

  // Exim Internal Data Upload APIs
  EXIM_INTERNAL_DATA_UPLOAD: loansUrl + '/exim-internal-data/upload',
  EXIM_INTERNAL_DATA_AUDIT_LIST: loansUrl + '/exim-internal-data/audit-list',
  EXIM_INTERNAL_DATA_RETRY_UPLOAD: loansUrl + '/exim-internal-data/retry-upload',


  // RM Hierarchy API
  GET_RM_HIERARCHY_BY_ROLE_AND_TYPE: loansUrl + '/filter/get-rm-hierarchy-by-role-and-type',
  EXIM_INTERNAL_DATA_DOWNLOAD_FILE: loansUrl + '/exim-internal-data/download-file',

  GET_CORPORATE_ANNOUNCEMENTS_STATS: loansUrl + '/api/corporate-announcements/stats',
  FETCH_CORPORATE_ANNOUNCEMENTS: loansUrl + '/api/corporate-announcements/fetch',
  GET_CORPORATE_ANNOUNCEMENTS: loansUrl + '/api/v1/msme/announcements',
  SAVE_CORPORATE_SUBSCRIPTION: loansUrl + '/api/corporate-announcements/subscription/saveSubscriptions',
  GET_CORPORATE_SUBSCRIPTIONS: loansUrl + '/api/corporate-announcements/subscription/getSubscriptions',
  GET_SUBSCRIPTION_COUNTS: loansUrl + '/api/corporate-announcements/subscription/counts',
  FETCH_FILTERED_ANNOUNCEMENTS: loansUrl + '/api/corporate-announcements/fetchFiltered',
  GET_ALL_PARENT_CATEGORIES: loansUrl + '/api/corporate-announcements/categories/all',
  GET_SUBCATEGORIES_BY_PARENT: loansUrl + '/api/corporate-announcements/categories/subcategories',

  GET_CONFIG_MASTER_LIST: baseRfUrl + '/api/config-cache',
  GET_ALL_RULES_LEVELS: baseRfUrl + '/approvalLevel/getAllRulesLevels',
  SAVE_OR_UPDATE_RULES: baseRfUrl + '/approvalLevel/saveOrUpdateRules',
  GET_USER_DETAILS_AND_ALL_RULES: baseRfUrl + '/approvalLevel/getUserDetailsAndAllRules',
  ASSIGN_RULES_TO_TRM: baseRfUrl + '/approvalLevel/assignRulesToTrm',
  DELETE_RULE_MASTER_RF: baseRfUrl + '/approvalLevel/deleteRuleMaster',
  CHECK_RF_CONFIG_VISIBILITY: userUrl + '/api/v1/permission/checkRFConfigVisibility',


  GET_COMMERCIAL_PR_SUMMARY_DATA: loansUrl + '/commercial/cibilPr/getPrCommercialCibilSummary',
  DOWNLOAD_EXCEL_COMMERCIAL_SUMMARY: loansUrl + '/commercial/cibilPr/downloadSummaryExcel',

  // Staff Hierarchy Role APIs
  GET_STAFF_HIERARCHY_ROLE_LIST: loansUrl + '/staffHierarchyRole/list',
  UPDATE_STAFF_HIERARCHY_ROLE: loansUrl + '/staffHierarchyRole/update',

  GET_COMMERCIAL_RECONSILATION_PR_SUMMARY_DATA: loansUrl + '/commercial/cibilPr/getPrCommercialCibilReconsilationCountData',
  COMMERCIAL_RECONSILATION_DATA: loansUrl + '/commercial/cibilPr/getPrCommercialCibilReconsilationData',
  DOWNLOAD_EXCEL_COMMERCIAL_RECONSILATION_DATA: loansUrl + '/commercial/cibilPr/downloadCommercialCibilReconsilationExcel',

  // User Filter APIs
  SAVE_USER_FILTER: loansUrl + '/filter/user-filter/save',
  UPDATE_USER_FILTER: loansUrl + '/filter/user-filter/update',
  GET_USER_FILTERS: loansUrl + '/filter/user-filter/list',
  GET_USER_FILTER_BY_ID: loansUrl + '/filter/user-filter',
  DELETE_USER_FILTER: loansUrl + '/filter/user-filter',

  // EXIM_INTERNAL_DATA_UPLOAD: loansUrlLocal + '/exim-internal-data/upload',
  // EXIM_INTERNAL_DATA_AUDIT_LIST: loansUrlLocal + '/exim-internal-data/audit-list',
  // EXIM_INTERNAL_DATA_RETRY_UPLOAD: loansUrlLocal + '/exim-internal-data/retry-upload',
  // EXIM_INTERNAL_DATA_DOWNLOAD_FILE: loansUrlLocal + '/exim-internal-data/download-file'
  // Industry News
  GET_INDUSTRY_NEWS_METADATA: loansUrl + '/industry-news/metadata',
  FETCH_INDUSTRY_NEWS: loansUrl + '/industry-news/fetch',
  SAVE_INDUSTRY_NEWS_ARTICLE: loansUrl + '/industry-news/save-article',
  DELETE_INDUSTRY_NEWS_ARTICLE: loansUrl + '/industry-news/delete-article',
  GET_SAVED_INDUSTRY_NEWS_ARTICLES: loansUrl + '/industry-news/saved-articles',

  // Country Master
  COUNTRY_MASTER_UPLOAD: loansUrl + '/country-master/upload',
  GET_HISTORY_COUNTRY_BULK_UPLOAD: loansUrl + '/country-master/get-upload-files',
  GET_COUNTRY_DATA_BY_ID: loansUrl + '/country-master/get-data-by-country-code',
  DOWNLOAD_COUNTRY_BULK_UPLOAD_REPORT: loansUrl + '/country-master/download-bulk-upload-report',
  DOWNLOAD_ALL_COUNTRY: loansUrl + '/country-master/downloadAllCountry',
    // My Portfolio APIs
  MY_PORTFOLIO_ANNOUNCEMENTS: loansUrl + '/api/my-portfolio/announcements',
  MY_PORTFOLIO_STATS: loansUrl + '/api/my-portfolio/stats',
  MY_PORTFOLIO_CATEGORIES: loansUrl +'/api/my-portfolio/categories/all',
  MY_PORTFOLIO_COMPANIES: loansUrl + '/api/my-portfolio/companies',
  MY_PORTFOLIO_SUBSCRIPTION_SAVE: loansUrl + '/api/my-portfolio/subscription/save',
  MY_PORTFOLIO_SUBSCRIPTION_GET: loansUrl + '/api/my-portfolio/subscription/get',
  MY_PORTFOLIO_SUBSCRIPTION_COUNTS: loansUrl + '/api/my-portfolio/subscription/counts',
  MY_PORTFOLIO_SUBSCRIPTION_STATUS: loansUrl + '/api/my-portfolio/subscription/status',
  MY_PORTFOLIO_COMPANIES_BY_CINS: loansUrl + '/api/my-portfolio/companies/by-cins',
  UPLOAD_FOREIGN_CURRENCY_FILE: loansUrl + '/fct/uploadForeignCurrencyFromFileNames',
  GET_FOREIGN_CURRENCY_FILE_DATA: loansUrl + '/fct/get-foreign-Currency-file-data',
  DOWNLOAD_FOREIGN_CURRENCY_FILE: loansUrl + '/fct/download-file-by-id'
};

