import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { HsbcComponentRoutingModule } from './hsbc-component-routing.module';
import { HSBCRMDashboardComponent } from './hsbc-rm-dashboard/hsbc-rm-dashboard.component';
import { IndianCurrencyPipe } from 'src/app/CommoUtils/pipe/indian-currency.pipe';
import { SharedModule } from '../../shared/shared.module';
import { BRCConfigurationComponent } from './Configuration/brc-configuration/brc-configuration.component';
import { RMThankyouDetailsComponent } from './RM/rmthankyou-details/rmthankyou-details.component';
import { BulkUploadPablComponent } from './bulk-upload-pabl/bulk-upload-pabl.component';
import { CustomerMasterBulkUploadComponent } from './customer-master-bulk-upload/customer-master-bulk-upload.component';
import { CustomerMasterComponent } from './customer-master/customer-master.component';
import { RmExisitingPortfolioViewComponent } from './existingPortfolio/rm-exisiting-portfolio-view/rm-exisiting-portfolio-view.component';
import { RmExisitingPortfolioComponent } from './existingPortfolio/rm-exisiting-portfolio/rm-exisiting-portfolio.component';
import { HSBCAPIAuditLogComponent } from './hsbc-api-audit-log/hsbc-api-audit-log.component';
import { HSBCTrailLogComponent } from './hsbc-trail-log/hsbc-trail-log.component';
import { ShowRequestResponseComponent } from './show-request-response/show-request-response.component';
import { TargetsProspectsDetailsComponent } from './targets-prospects/targets-prospects-details/targets-prospects-details.component';
import { TargetsProspectsFindComponent } from './targets-prospects/targets-prospects-find/targets-prospects-find.component';
import { TargetsProspectsComponent } from './targets-prospects/targets-prospects/targets-prospects.component';
import { RMGSTAnalysisComponent } from './RM/Analysis/rmgstanalysis/rmgstanalysis.component';
import { RMGSTAnalysisViewComponent } from './RM/Analysis/rmgstanalysis-view/rmgstanalysis-view.component';
import { RMEXIMAnalysisComponent } from './RM/Analysis/rmeximanalysis/rmeximanalysis.component';
import { RMEXIMAnalysisViewComponent } from './RM/Analysis/rmeximanalysis-view/rmeximanalysis-view.component';
import { CommercialBureauComponent } from './RM/Analysis/commercial-bureau/commercial-bureau.component';
import { CommercialBureauDetailsComponent } from './RM/Analysis/commercial-bureau-details/commercial-bureau-details.component';
import { ConsumerBureauComponent } from './RM/Analysis/consumer-bureau/consumer-bureau.component';
import { ConsumerBureauDetailsComponent } from './RM/Analysis/consumer-bureau-details/consumer-bureau-details.component';
import { HSBCProvideSelesComponent } from 'src/app/Popup/HSBC/hsbcprovide-seles/hsbcprovide-seles.component';
import { HSBCHSNCodeComponent } from 'src/app/Popup/HSBC/hsbchsncode/hsbchsncode.component';
import { RmBankstatementUploadComponent } from './RM/Analysis/rm-bankstatement-upload/rm-bankstatement-upload.component';
import { RMBankStatementAnalysisComponent } from './RM/Analysis/rmbank-statement-analysis/rmbank-statement-analysis.component';
import { NoSymbolCurrencyPipe } from 'src/app/CommoUtils/pipe/no-symbol-currency.pipe';
import { RmBankstatementanalysisViewComponent } from './RM/Analysis/rm-bankstatementanalysis-view/rm-bankstatementanalysis-view.component';
import { CustomSortPipe } from 'src/app/CommoUtils/pipe/custom-sort.pipe';
import { RmAPIAuditLogsComponent } from './RM/rm-apiaudit-logs/rm-apiaudit-logs.component';
import { CommercialCibilBulkUploadComponent } from './commercial-cibil-bulk-upload/commercial-cibil-bulk-upload.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxSelectFilterDirectiveDirective } from 'src/app/Directives/ngx-select-filter-directive.directive';
import { ValidateElementDirective } from 'src/app/Directives/validate-element.directive';
import {HrmsBulkUploadComponent} from './hrms-bulk-upload/hrms-bulk-upload.component';
import { CustomerSegBulkUploadComponent } from './customer-seg-bulk-upload/customer-seg-bulk-upload.component';
import { RegionMasterBulkUploadComponent } from './region-master-bulk-upload/region-master-bulk-upload.component';
import { CountryMasterBulkUploadComponent } from './country-master-bulk-upload/country-master-bulk-upload.component';
import { FindProspectsTableComponent } from './targets-prospects/find-prospects-table/find-prospects-table.component';
import { LoginImgUploadComponent } from './login-img-upload/login-img-upload.component';
 import { RequestedPortfolioComponent } from '../../requested-portfolio/requested-portfolio.component';
import { WebSocketCommonComponent } from './web-socket-common/web-socket-common.component';
import { PreScreenDataUploadComponent } from './pre-screen-data-upload/pre-screen-data-upload.component';
import { BankPortfolioUploadComponent } from './bank-portfolio-upload/bank-portfolio-upload.component';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { PreScreenBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/pre-screen-bulk-upload-success/pre-screen-bulk-upload-success.component';
import { PanFormatPipe } from 'src/app/CommoUtils/pipe/pan-format.pipe';
import { BankStatementInternalComponent } from './bank-statement-internal/bank-statement-internal.component';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { InternationalNumberPipe } from 'src/app/CommoUtils/pipe/international-number.pipe';
import { BankStatementAnalysisComponent } from './bank-statement-analysis/bank-statement-analysis.component';
import { MillionFormatPipe } from 'src/app/CommoUtils/pipe/million-format.pipe';
import { AvgBankBalanceUploadComponent } from './avg-bank-balance-upload/avg-bank-balance-upload.component';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
 import { AverageBankBalanceAnalysisComponent } from './average-bank-balance-analysis/average-bank-balance-analysis.component';
import { HsbcBankingBulkUploadComponent } from './hsbc-banking-bulk-upload/hsbc-banking-bulk-upload.component';

import { CustomerRmMappingComponent } from './customer-rm-mapping/customer-rm-mapping.component';
import { InvesteeCompanyDetailsComponent } from './existingPortfolio/rm-exisiting-portfolio-view/investee-company-details/investee-company-details.component';

import { CustomerIncomeBulkUploadComponent } from './customer-income-bulk-upload/customer-income-bulk-upload.component';
import { CustomerIncomeBulkUploadSuccessComponent } from 'src/app/Popup/HSBC/customer-income-bulk-upload-success/customer-income-bulk-upload-success.component';
import { CustomDaterangepanelComponent } from './custom-daterangepanel/custom-daterangepanel.component';
import { CustomDateheaderComponent } from './custom-dateheader/custom-dateheader.component';
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
import { SearchFilterPipe } from 'src/app/CommoUtils/pipe/search-filter.pipe';
import { MillionFormatINRPipePipe } from 'src/app/CommoUtils/pipe/million-format-inrpipe.pipe';
import { FoeWalletComponent } from './foe-wallet/foe-wallet.component';
import {UploadBankStatementComponentNew} from './upload-bank-statement-new/upload-bank-statement.component-new';
import {NewRMBankStatementAnalysisComponent} from './RM/Analysis/new-rmbank-statement-analysis/new-rmbank-statement-analysis.component';
import {
  NewRmBankstatementanalysisViewComponent
} from './RM/Analysis/new-rm-bankstatementanalysis-view/new-rm-bankstatementanalysis-view.component';
import { EximExternalDataUploadComponent } from './exim-external-data-upload/exim-external-data-upload.component';
import { SubLoaderComponent } from 'src/app/CommoUtils/common-components/sub-loader/sub-loader.component';
import {IncomeDataUploadComponent} from '../../../Popup/HSBC/income-data-upload/income-data-upload.component';
import { IncomeDashboardComponent } from './income-dashboard/income-dashboard.component';
import { HsnBulkDataUploadComponent } from './hsn-bulk-data-upload/hsn-bulk-data-upload.componet';
import { EximExchangeRateUploadComponent } from './exim-exchange-rate-upload/exim-exchange-rate-upload.component';
import { EximInternalBulkUploadComponent } from './exim-internal-bulk-upload/exim-internal-bulk-upload.component';
import { NotificationDashboardComponent } from './notification-dashboard/notification-dashboard.component';
import { HelpAndSupportComponent } from './help-and-support/help-and-support.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { CrifDataUploadComponent } from 'src/app/Popup/HSBC/crif-data-upload/crif-data-upload.component';
import { CustomerProcessingOverviewComponent } from './customer-processing-overview/customer-processing-overview.component';
import { HsbcFacilityFileComponent } from './hsbc-facility-file/hsbc-facility-file.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
// import { CrifCommercailPrDataComponent } from './crif-commercail-pr-data/crif-commercail-pr-data.component';
import { MyPortfolioComponent } from './my-portfolio/my-portfolio.component';
import { CrilicDataFetchProcessingComponent } from './api-counter/crilic-data-fetch-processing/crilic-data-fetch-processing.component';
import { CrilicDataUploadComponent } from './api-counter/crilic-data-upload/crilic-data-upload.component';
import { MySavedArticlesComponent } from './my-saved-articles/my-saved-articles.component';
import { ForeignCurrencyTransactionsComponent } from './foreign-currency-transactions/foreign-currency-transactions.component';
import { LiquidityOpportunityDashboardComponent } from './liquidity-opportunity-dashboard/liquidity-opportunity-dashboard.component';

@NgModule({
  declarations: [
    HSBCRMDashboardComponent,
    BulkUploadPablComponent,
    CustomerMasterBulkUploadComponent,
    HrmsBulkUploadComponent,
    HSBCAPIAuditLogComponent,
    HSBCTrailLogComponent,
    ShowRequestResponseComponent,
    RMThankyouDetailsComponent,
    BRCConfigurationComponent,
    CustomerMasterComponent,
    TargetsProspectsComponent,
    TargetsProspectsDetailsComponent,
    TargetsProspectsFindComponent,
    RmExisitingPortfolioComponent,
    RmExisitingPortfolioViewComponent,
    RMGSTAnalysisComponent,
    RMGSTAnalysisViewComponent,
    RMEXIMAnalysisComponent,
    RMEXIMAnalysisViewComponent,
    CommercialBureauComponent,
    CommercialBureauDetailsComponent,
    ConsumerBureauComponent,
    ConsumerBureauDetailsComponent,
    HSBCProvideSelesComponent,
    HSBCHSNCodeComponent,
    RmBankstatementUploadComponent,
    RMBankStatementAnalysisComponent,
    RmBankstatementanalysisViewComponent,
    RmAPIAuditLogsComponent,
    InvesteeCompanyDetailsComponent,
    CommercialCibilBulkUploadComponent,
    BankPortfolioUploadComponent,
    ValidateElementDirective,
    NgxSelectFilterDirectiveDirective,
    CustomerSegBulkUploadComponent,
    RegionMasterBulkUploadComponent,
    CountryMasterBulkUploadComponent,
    CustomerIncomeBulkUploadComponent,
    FindProspectsTableComponent,
    LoginImgUploadComponent,
     RequestedPortfolioComponent,
    WebSocketCommonComponent,
    PreScreenDataUploadComponent,
    FilterSidebarComponent,
    PreScreenBulkUploadSuccessComponent,
    BankStatementInternalComponent,
    // RejectedPortfolioComponent,
    BankStatementAnalysisComponent,
    AvgBankBalanceUploadComponent,
    AverageBankBalanceAnalysisComponent,
    CustomerRmMappingComponent,
    HsbcBankingBulkUploadComponent,
    CustomerIncomeBulkUploadSuccessComponent,
    CustomDaterangepanelComponent,
    CustomDateheaderComponent,
    TracxnLendingIndicatorsComponent,
    UploadBankStatementComponent,
    RiskDashboardComponent,
    InvesteeCompaniesComponent,
    NewGccUploadComponent,
    NewAgeEconomyUploadComponent,
    BankPortfolioUploadOneTimeComponent,
    EncryptDecryptComponent,
    MatchingToolCueDataComponent,
    ConsumerCibilBulkUploadComponent,
    FoeWalletComponent,

    // New Component added By Nikul
    UploadBankStatementComponentNew,
    NewRMBankStatementAnalysisComponent,
    NewRmBankstatementanalysisViewComponent,
    EximExternalDataUploadComponent,
    SubLoaderComponent,
    IncomeDataUploadComponent,
    IncomeDashboardComponent,
    EximExchangeRateUploadComponent,
    HsnBulkDataUploadComponent,
    EximInternalBulkUploadComponent,
    NotificationDashboardComponent,
    HelpAndSupportComponent,
    CrifDataUploadComponent,
    CustomerProcessingOverviewComponent,
    HsbcFacilityFileComponent,
    // CrifCommercailPrDataComponent,
    MyPortfolioComponent,
    CrilicDataFetchProcessingComponent,
    CrilicDataUploadComponent,
    MySavedArticlesComponent,
    LiquidityOpportunityDashboardComponent,
    ForeignCurrencyTransactionsComponent
  ],

  imports: [CommonModule, SharedModule, HsbcComponentRoutingModule, MillionFormatPipe, MillionFormatINRPipePipe,
    IndianCurrencyPipe, NoSymbolCurrencyPipe, CustomSortPipe, NgxMatSelectSearchModule, MillionFormatPipe,
    PanFormatPipe, SearchFilterPipe, ScrollingModule, InternationalNumberPipe, BsDatepickerModule.forRoot(), NgxDaterangepickerMd.forRoot(),
    NgbDropdownModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    SubLoaderComponent
  ]
})
export class HsbcComponentModule { }
