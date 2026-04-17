import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HSBCRMDashboardComponent } from './hsbc-rm-dashboard/hsbc-rm-dashboard.component';
import { HSBCAPIAuditLogComponent } from './hsbc-api-audit-log/hsbc-api-audit-log.component';
import { HSBCTrailLogComponent } from './hsbc-trail-log/hsbc-trail-log.component';
import { BulkUploadPablComponent } from './bulk-upload-pabl/bulk-upload-pabl.component';
import { RMThankyouDetailsComponent } from './RM/rmthankyou-details/rmthankyou-details.component';
import { BRCConfigurationComponent } from './Configuration/brc-configuration/brc-configuration.component';
import { CustomerMasterBulkUploadComponent } from './customer-master-bulk-upload/customer-master-bulk-upload.component';
import { CustomerMasterComponent } from './customer-master/customer-master.component';
import { RmExisitingPortfolioComponent } from './existingPortfolio/rm-exisiting-portfolio/rm-exisiting-portfolio.component';
import { TargetsProspectsComponent } from './targets-prospects/targets-prospects/targets-prospects.component';
import { RmExisitingPortfolioViewComponent } from './existingPortfolio/rm-exisiting-portfolio-view/rm-exisiting-portfolio-view.component';
import { TargetsProspectsFindComponent } from './targets-prospects/targets-prospects-find/targets-prospects-find.component';
import { TargetsProspectsDetailsComponent } from './targets-prospects/targets-prospects-details/targets-prospects-details.component';
import { RMGSTAnalysisComponent } from './RM/Analysis/rmgstanalysis/rmgstanalysis.component';
import { RMGSTAnalysisViewComponent } from './RM/Analysis/rmgstanalysis-view/rmgstanalysis-view.component';
import { RMEXIMAnalysisComponent } from './RM/Analysis/rmeximanalysis/rmeximanalysis.component';
import { RMEXIMAnalysisViewComponent } from './RM/Analysis/rmeximanalysis-view/rmeximanalysis-view.component';
import { CommercialBureauComponent } from './RM/Analysis/commercial-bureau/commercial-bureau.component';
import { CommercialBureauDetailsComponent } from './RM/Analysis/commercial-bureau-details/commercial-bureau-details.component';
import { ConsumerBureauComponent } from './RM/Analysis/consumer-bureau/consumer-bureau.component';
import { ConsumerBureauDetailsComponent } from './RM/Analysis/consumer-bureau-details/consumer-bureau-details.component';
import { RMBankStatementAnalysisComponent } from './RM/Analysis/rmbank-statement-analysis/rmbank-statement-analysis.component';
import { RmBankstatementUploadComponent } from './RM/Analysis/rm-bankstatement-upload/rm-bankstatement-upload.component';
import { RmBankstatementanalysisViewComponent } from './RM/Analysis/rm-bankstatementanalysis-view/rm-bankstatementanalysis-view.component';
import { RmAPIAuditLogsComponent } from './RM/rm-apiaudit-logs/rm-apiaudit-logs.component';
import { CommercialCibilBulkUploadComponent } from './commercial-cibil-bulk-upload/commercial-cibil-bulk-upload.component';
import {HrmsBulkUploadComponent} from './hrms-bulk-upload/hrms-bulk-upload.component';
import { CustomerSegBulkUploadComponent } from './customer-seg-bulk-upload/customer-seg-bulk-upload.component';
import { RegionMasterBulkUploadComponent } from './region-master-bulk-upload/region-master-bulk-upload.component';
import { CountryMasterBulkUploadComponent } from './country-master-bulk-upload/country-master-bulk-upload.component';
import { FindProspectsTableComponent } from './targets-prospects/find-prospects-table/find-prospects-table.component';
import { LoginImgUploadComponent } from './login-img-upload/login-img-upload.component';
import { CustomerIncomeBulkUploadComponent } from './customer-income-bulk-upload/customer-income-bulk-upload.component';
import { RequestedPortfolioComponent } from '../../requested-portfolio/requested-portfolio.component';
import { PreScreenDataUploadComponent } from './pre-screen-data-upload/pre-screen-data-upload.component';
import { BankPortfolioUploadComponent } from './bank-portfolio-upload/bank-portfolio-upload.component';
import { BankStatementInternalComponent } from './bank-statement-internal/bank-statement-internal.component';

import { BankStatementAnalysisComponent } from './bank-statement-analysis/bank-statement-analysis.component';
import { AvgBankBalanceUploadComponent } from './avg-bank-balance-upload/avg-bank-balance-upload.component';
import { AverageBankBalanceAnalysisComponent } from './average-bank-balance-analysis/average-bank-balance-analysis.component';
import { HsbcBankingBulkUploadComponent } from './hsbc-banking-bulk-upload/hsbc-banking-bulk-upload.component';
import { CustomerRmMappingComponent } from './customer-rm-mapping/customer-rm-mapping.component';
import { InvesteeCompanyDetailsComponent } from './existingPortfolio/rm-exisiting-portfolio-view/investee-company-details/investee-company-details.component';
import { TracxnLendingIndicatorsComponent } from './tracxn-lending-indicators/tracxn-lending-indicators.component';
import { UploadBankStatementComponent } from './upload-bank-statement/upload-bank-statement.component';
import { RiskDashboardComponent } from './risk-dashboard/risk-dashboard.component';
import { InvesteeCompaniesComponent } from './investee-companies/investee-companies.component';
import { NewGccUploadComponent } from './new-gcc-upload/new-gcc-upload.component';
import { NewAgeEconomyUploadComponent } from './new-age-economy-upload/new-age-economy-upload.component';
import { BankPortfolioUploadOneTimeComponent } from './bank-portfolio-upload-one-time/bank-portfolio-upload-one-time.component';
import {EncryptDecryptComponent} from './encrypt-decrypt/encrypt-decrypt.component';
import { MatchingToolCueDataComponent } from './matching-tool-cue-data/matching-tool-cue-data.component';
import { ConsumerCibilBulkUploadComponent } from './consumer-cibil-bulk-upload/consumer-cibil-bulk-upload.component';
import { FoeWalletComponent } from './foe-wallet/foe-wallet.component';
import {UploadBankStatementComponentNew} from './upload-bank-statement-new/upload-bank-statement.component-new';
import {
  NewRmBankstatementanalysisViewComponent
} from './RM/Analysis/new-rm-bankstatementanalysis-view/new-rm-bankstatementanalysis-view.component';
import {NewRMBankStatementAnalysisComponent} from './RM/Analysis/new-rmbank-statement-analysis/new-rmbank-statement-analysis.component';
import { EximExternalDataUploadComponent } from './exim-external-data-upload/exim-external-data-upload.component';
import {IncomeDataUploadComponent} from '../../../Popup/HSBC/income-data-upload/income-data-upload.component';
import { IncomeDashboardComponent } from './income-dashboard/income-dashboard.component';
import { HsnBulkDataUploadComponent } from './hsn-bulk-data-upload/hsn-bulk-data-upload.componet';
import { EximExchangeRateUploadComponent } from './exim-exchange-rate-upload/exim-exchange-rate-upload.component';
import { EximInternalBulkUploadComponent } from './exim-internal-bulk-upload/exim-internal-bulk-upload.component';
import { NotificationDashboardComponent } from './notification-dashboard/notification-dashboard.component';
import { HelpAndSupportComponent } from './help-and-support/help-and-support.component';
import { HelpAndSupportUploadComponent } from 'src/app/help-and-support-upload/help-and-support-upload.component';
import { CrifDataUploadComponent } from 'src/app/Popup/HSBC/crif-data-upload/crif-data-upload.component';
import { CustomerProcessingOverviewComponent } from './customer-processing-overview/customer-processing-overview.component';
import { HsbcFacilityFileComponent } from './hsbc-facility-file/hsbc-facility-file.component';
// import { CrifCommercailPrDataComponent } from './crif-commercail-pr-data/crif-commercail-pr-data.component';
import { MyPortfolioComponent } from './my-portfolio/my-portfolio.component';
import { CrilicDataFetchProcessingComponent } from './api-counter/crilic-data-fetch-processing/crilic-data-fetch-processing.component';
import { CrilicDataUploadComponent } from './api-counter/crilic-data-upload/crilic-data-upload.component';
import { MySavedArticlesComponent } from './my-saved-articles/my-saved-articles.component';
import { ForeignCurrencyTransactionsComponent } from './foreign-currency-transactions/foreign-currency-transactions.component';
import { LiquidityOpportunityDashboardComponent } from './liquidity-opportunity-dashboard/liquidity-opportunity-dashboard.component';

const routes: Routes = [
  { path: 'rmDashboard', component: HSBCRMDashboardComponent, data: { title: 'HSBC- RM Dashboard' }, canActivate: [], },
  { path: 'Bulk-Upload', component: BulkUploadPablComponent, data: { title: 'Bank - Bulk Upload' }, canActivate: [], },
  { path: 'Customer-Bulk-Upload', component: CustomerMasterBulkUploadComponent, data: { title: 'EXIM Data' }, canActivate: [], },
  { path: 'Customer-Master-Bulk-Upload', component: CustomerMasterComponent, data: { title: 'Customer Master' }, canActivate: [], },
  { path: 'customer_seg_bulk_upload', component: CustomerSegBulkUploadComponent, data: { title: 'Customer Seg Bulk Upload' }, canActivate: [], },
  { path: 'help-and-support-upload', component: HelpAndSupportUploadComponent, data: { title: 'Help and Support Upload' }, canActivate: [], },
  { path: 'Hrms-Bulk-Upload', component: HrmsBulkUploadComponent, data: { title: 'Hrms Data' }, canActivate: [], },
  { path: 'Commercial-Cibil-Bulk-Upload', component: CommercialCibilBulkUploadComponent, data: { title: 'Commercial Cibil' }, canActivate: [], },
  { path: 'bank-portfolio-upload', component: BankPortfolioUploadComponent, data: { title: 'Bank Portfolio' }, canActivate: [], },
  { path: 'apiAuditLog', component: HSBCAPIAuditLogComponent, data: { title: 'Bank - API Audit Log' }, canActivate: [], },
  { path: 'trailLog', component: HSBCTrailLogComponent, data: { title: 'Bank - Trail Log' }, canActivate: [], },
  { path: 'thankyou', component: RMThankyouDetailsComponent, data: { title: 'Bank - RM Assisted Journey - Thankyou' }, canActivate: [], },
  { path: 'bureauConfig', component: BRCConfigurationComponent, data: { title: 'Bureau configuration' }, canActivate: [] }, // , canActivate: [AccessGuard
  { path: 'rmExisitingPortfolio', component: RmExisitingPortfolioComponent, data: { title: 'Bank - RM Assisted Journey - Exisiting Portfolio Details'}, canActivate: [] },
  { path: 'rmExisitingPortfolioOld', component: RmExisitingPortfolioComponent, data: { title: 'Bank - RM Assisted Journey - Exisiting Portfolio Details' ,isNewFilter:false  }, canActivate: [] },
  { path: 'rmExisitingPortfolioView', component: RmExisitingPortfolioViewComponent, data: { title: 'Bank - RM Assisted Journey - Exisiting Portfolio View Details' }, canActivate: [] },
  { path: 'rmTargetsProspects', component: TargetsProspectsComponent, data: { title: 'Bank - RM Assisted Journey - Targets & Prospects' }, canActivate: [] },
  { path: 'rmTargetsProspectsOld', component: TargetsProspectsComponent, data: { title: 'Bank - RM Assisted Journey - Targets & Prospects',isNewFilter:false }, canActivate: [] },
  { path: 'rmTargetsProspectsFind', component: TargetsProspectsFindComponent, data: { title: 'Bank - RM Assisted Journey - Targets & Prospects Find'}, canActivate: [] },
  { path: 'rmTargetsProspectsFindOld', component: TargetsProspectsFindComponent, data: { title: 'Bank - RM Assisted Journey - Targets & Prospects Find' ,isNewFilter:false }, canActivate: [] },
  { path: 'rmTargetsProspectsDetails', component: TargetsProspectsDetailsComponent, data: { title: 'Bank - RM Assisted Journey - Targets & Prospects Details' }, canActivate: [] },
  { path: 'rmBankStatementAnalysis', component: RMBankStatementAnalysisComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmBankStatementUpload/:pan', component: RmBankstatementUploadComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmBankStatementAnalysisView/:bsId', component: RmBankstatementanalysisViewComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },

  { path: 'rmGSTAnalysis', component: RMGSTAnalysisComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmGSTAnalysisView', component: RMGSTAnalysisViewComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },

  { path: 'rmEXIMAnalysis', component: RMEXIMAnalysisComponent, data: { title: 'Bank - RM Assisted Journey - EXIM Analysis Details' }, canActivate: [] },
  { path: 'rmEXIMAnalysisView', component: RMEXIMAnalysisViewComponent, data: { title: 'Bank - RM Assisted Journey - EXIM Analysis View Details' }, canActivate: [] },
  { path: 'rmCommercialBureau', component: CommercialBureauComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },
  { path: 'rmCommercialBureauDetails', component: CommercialBureauDetailsComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },
  { path: 'rmConsumerBureau', component: ConsumerBureauComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },
  { path: 'rmConsumerBureauDetail', component: ConsumerBureauDetailsComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },
  { path: 'rmBankStatementAnalysis', component: RMBankStatementAnalysisComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmBankStatementUpload/:pan', component: RmBankstatementUploadComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmBankStatementAnalysisView/:bsId', component: RmBankstatementanalysisViewComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'rmApiAuditLogs', component: RmAPIAuditLogsComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis View Details' }, canActivate: [] },
  { path: 'findprospectstable', component: FindProspectsTableComponent, data: { title: 'Bank - ' }, canActivate: [] },


  { path: 'investeeCompanyDetails', component: InvesteeCompanyDetailsComponent, data: { title: 'Bank -Investee Company Details' }, canActivate: [] },

  // Regeion master bulk upload
  { path: 'region-master-bulk-upload', component: RegionMasterBulkUploadComponent, data: { title: 'Region Master Bulk Upload' }, canActivate: [], },
  { path: 'country-master-bulk-upload', component: CountryMasterBulkUploadComponent, data: { title: 'Bank - Country Master Bulk Upload' }, canActivate: [], },
  { path: 'customer-income-bulk-upload', component: CustomerIncomeBulkUploadComponent, data: { title: 'Customer Income Bulk Upload' }, canActivate: [], },
  { path: 'login-img-upload', component: LoginImgUploadComponent, data: { title: 'Login image Upload' }, canActivate: [], },
  { path: 'requested-portfolio', component: RequestedPortfolioComponent, data: { title: 'Requested Portfolio' },  },
  { path: 'pre-screen-data-upload', component: PreScreenDataUploadComponent, data: { title: 'Pre Screen' }, canActivate: [], },
  { path: 'bank-statement-internal', component: BankStatementInternalComponent, data: { title: 'Bank Statement - Internal' }},
  { path: 'pre-screen-data-upload', component: PreScreenDataUploadComponent, data: { title: 'Pre Screen' }, canActivate: [], },
  { path: 'hsbc-banking-bulk-data', component: HsbcBankingBulkUploadComponent, data: { title: 'Hsbc Banking Data' }, canActivate: [], },

  { path: 'avgBankBalanceUpload', component: AvgBankBalanceUploadComponent, data: { title: 'Avg Bank Balance Upload' }},
  // { path: 'rejected-portfolio', component: RejectedPortfolioComponent, data: { title: 'Rejected Portfolio' },  },
  { path: 'bank-statement-analysis', component: BankStatementAnalysisComponent, data: { title: 'Bank Statement - Analysis' }},
  { path: 'average-bank-balance-analysis', component: AverageBankBalanceAnalysisComponent, data: { title: 'Average Bank Balance Analysis' }},
  { path: 'customer-rm-mapping-bulk-upload', component: CustomerRmMappingComponent, data: { title: 'Customer Rm mapping Bulk Upload' }, canActivate: [], },

  { path: 'tracxn-lending-indicators-bulk-data', component: TracxnLendingIndicatorsComponent, data: { title: 'Tracxn Lending Indicators' }, canActivate: [],},
  { path: 'upload-bank-statement/:pan', component: UploadBankStatementComponent, data: { title: 'Upload bank statement' },},
  { path: 'risk-dashboard', component: RiskDashboardComponent, data: { title: 'Risk Dashboard' },},
  { path: 'investee-companies', component: InvesteeCompaniesComponent, data: { title: 'Investee Companies' },},
  { path: 'new-gcc-upload', component: NewGccUploadComponent, data: { title: 'New Gcc Upload' },},
  { path: 'new-age-economy-upload', component: NewAgeEconomyUploadComponent, data: { title: 'New-age Economy' },},
  { path: 'bank-protfolio-upload-one-time', component: BankPortfolioUploadOneTimeComponent, data: { title: 'Bank Protfolio Upload One Time' },},
  { path: 'encrypt-decrypt', component: EncryptDecryptComponent, data: { title: 'EncryptDecrypt' },},
  { path: 'consumer-cibil-bulk-upload', component: ConsumerCibilBulkUploadComponent, data: { title: 'Consumer Cibil' }, canActivate: [], },
  { path: 'matching-tool-cue-data', component: MatchingToolCueDataComponent, data: { title: 'Matching Tool for CUE Data' },},
  { path: 'foe-walllet', component: FoeWalletComponent, data: { title: 'FDI,ODI & ECB Wallet' },},

  { path: 'upload-bank-statement-new/:pan', component: UploadBankStatementComponentNew, data: { title: 'Upload bank statement' },},
  { path: 'newRmBankStatementAnalysis', component: NewRMBankStatementAnalysisComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'newRmBankStatementAnalysisView/:bsId', component: NewRmBankstatementanalysisViewComponent, data: { title: 'Bank - RM Assisted Journey - Bureau Analysis Details' }, canActivate: [] },
  { path: 'exim-external-data-upload', component: EximExternalDataUploadComponent, data: { title: 'Bank - Exim External Data' }},
  { path: 'hsn-bulk-data-upload', component: HsnBulkDataUploadComponent, data: { title: 'Bank - HSN Bulk Data Upload' }},
  { path: 'income-data-upload', component: IncomeDataUploadComponent, data: { title: 'Bank - Income Data Upload' }, canActivate: []},
  { path: 'income-dashboard', component: IncomeDashboardComponent, data: { title: 'Bank - Income Dashboard' }},
  { path: 'exim-exchange-rate-upload', component: EximExchangeRateUploadComponent, data: { title: 'Bank - Exim Exchange Rate Upload' } },
  { path: 'exim-internal-bulk-upload', component: EximInternalBulkUploadComponent, data: { title: 'Bank - Exim Internal Bulk Upload' } },
  { path: 'notification-configuration', component: NotificationDashboardComponent, data: { title: 'Bank - Notification Dashboard' } },
  { path: 'commercial-crif-pr-data', component: CrifDataUploadComponent, data: { title: 'Bank - Commercial CRIF PR Data ' }, canActivate: []},
  { path: 'help-and-support', component: HelpAndSupportComponent, data: { title: 'Bank - Help And Support' } },
  { path: 'customer-processing-overview', component: CustomerProcessingOverviewComponent, data: { title: 'Bank - Customer Processing Overview' } },
  { path: 'hsbc-facility-file', component: HsbcFacilityFileComponent, data: { title: 'Bank - Facility File' } },
  // { path: 'crif-commercail-pr-data', component: CrifCommercailPrDataComponent, data: { title: 'Bank - Crif Commercial PR Data' } },
  { path: 'my-portfolio', component: MyPortfolioComponent, data: { title: 'Bank - My Portfolio' } },
  { path: 'crilic-data-fetch-processing', component: CrilicDataFetchProcessingComponent, data: { title: 'Bank - Crilc Data Fetch Processing' } },
  { path: 'crilic-data-upload', component: CrilicDataUploadComponent, data: { title: 'Bank - Crilc Data Upload' } },
  { path: 'my-saved-articles', component: MySavedArticlesComponent, data: { title: 'Bank - My Saved Articles' } },
  { path: 'liquidity-opportunity-dashboard', component: LiquidityOpportunityDashboardComponent, data: { title: 'Bank - Liquidity Opportunity Dashboard' } },
  { path: 'foreign-currency-transactions', component: ForeignCurrencyTransactionsComponent, data: { title: 'Bank - Foreign Currency Transactions' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HsbcComponentRoutingModule { }
