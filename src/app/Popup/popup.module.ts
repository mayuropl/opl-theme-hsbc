import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../Component/shared/shared.module';
import { HSBCAPIAuditLogPopupComponent } from './HSBC/hsbc-api-audit-log-popup/hsbc-api-audit-log-popup.component';
import { HSBCBusinessPANComponent } from './HSBC/hsbc-business-pan/hsbc-business-pan.component';
import { HSBCNotEligibleComponent } from './HSBC/hsbc-not-eligible/hsbc-not-eligible.component';
import { HsbcThankyouPopupComponent } from './HSBC/hsbc-thankyou-popup/hsbc-thankyou-popup.component';
import { BulkUploadSuccessFullyComponent } from './HSBC/bulk-upload-success-fully/bulk-upload-success-fully.component';
import { ReadInstructionBulkUploadComponent } from './HSBC/read-instruction-bulk-upload/read-instruction-bulk-upload.component';
import { SendLinkBorrowerPopupComponent } from './HSBC/send-link-borrower-popup/send-link-borrower-popup.component';
import { MaterialModule } from '../CommoUtils/merterial.module';
import { BRCConfigurationPopupComponent } from './Configuration/brc-configuration-popup/brc-configuration-popup.component';
import { BRCConfigurationStatusComponent } from './Configuration/brc-configuration-status/brc-configuration-status.component';
import { BRCConfirmationPopupComponent } from './Configuration/brcconfirmation-popup/brcconfirmation-popup.component';
import { CustomerBulkUploadSuccessComponent } from './HSBC/customer-bulk-upload-success/customer-bulk-upload-success.component';
import { UdyamDetailsPopupComponent } from './HSBC/udyam-details-popup/udyam-details-popup.component';
import { CreditRatingDetailsPopupComponent } from './HSBC/credit-rating-details-popup/credit-rating-details-popup.component';
import { WarningPopupComponent } from './HSBC/warning-popup/warning-popup.component';
import { ActiveGstDetailsPopupComponent } from './HSBC/active-gst-details-popup/active-gst-details-popup.component';
import { InactiveDisableGstDetailsPopupComponent } from './HSBC/inactive-disable-gst-details-popup/inactive-disable-gst-details-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HSBCGSTOTPVerifyComponent } from './HSBC/hsbcgstotpverify/hsbcgstotpverify.component';
import { EximSearchPopupComponent } from './HSBC/exim-search-popup/exim-search-popup.component';
import { LenderMcaChargesPopupComponent } from './HSBC/lender-mca-charges-popup/lender-mca-charges-popup.component';
import { HSNdetailsPopupComponent } from './HSBC/hsndetails-popup/hsndetails-popup.component';
import { FdiOpportunitydataComponent } from './HSBC/fdi-opportunitydata/fdi-opportunitydata.component';
import { ProductsHSNcodePopupComponent } from './HSBC/products-hsncode-popup/products-hsncode-popup.component';
import { SectorHSNDetailsComponent } from './HSBC/sector-hsn-details/sector-hsn-details.component';
import { CommercialCibilUploadSuccessComponent } from './HSBC/commercial-cibil-upload-success/commercial-cibil-upload-success.component';
import { FacilitiesFromLendersComponent } from './HSBC/facilities-from-lenders/facilities-from-lenders.component';
import { ProductsForeignCurrenciesComponent } from './HSBC/products-foreign-currencies/products-foreign-currencies.component';
import { SpreadOrderPopupComponent } from './HSBC/spread-order-popup/spread-order-popup.component';
import { BureauReportRefreshPopupComponent } from './HSBC/bureau-report-refresh-popup/bureau-report-refresh-popup.component';
import {HrmsBulkUploadSuccessComponent} from "./HSBC/hrms-bulk-upload-success/hrms-bulk-upload-success.component";
import { UserDeletePopupComponent } from './user-delete-popup/user-delete-popup.component';
import { ExportExcelPopupComponent } from './HSBC/export-excel-popup/export-excel-popup.component';
import { UseridPopupComponent } from './HSBC/userid-popup/userid-popup.component';
import {InactiveCsemCompanyPopupComponent} from './HSBC/inactive-csem-company-popup/inactive-csem-company-popup.component';
import { UserDetailsPopupComponent } from './HSBC/user-details-popup/user-details-popup.component';
import { RegionBulkUploadSuccessComponent } from './HSBC/region-bulk-upload-success/region-bulk-upload-success.component';
import { CountryBulkUploadSuccessComponent } from './HSBC/country-bulk-upload-success/country-bulk-upload-success.component';

import { RequestStatusPopupComponent } from './request-status-popup/request-status-popup.component';
import { NewIncorporationViewPopupComponent } from './new-incorporation-view-popup/new-incorporation-view-popup.component';
import { ReadInstructionsPopupComponent } from './read-instructions-popup/read-instructions-popup.component';
import { RemarkAlertPopupComponent } from './remark-alert-popup/remark-alert-popup.component';
import { ProfileDetailsPopupComponent } from './HSBC/profile-details-popup/profile-details-popup.component';
import { InvesteeCompaniesPopupComponent } from './HSBC/investee-companies-popup/investee-companies-popup.component';
import { RejectedPopupComponent } from './HSBC/rejected-popup/rejected-popup.component';
import { BalanceDepositPopupComponent } from './HSBC/balance-deposit-popup/balance-deposit-popup.component';
import {HsbcComponentModule} from "../Component/pages/HSBC/hsbc-component.module";
import { FundingRoundPopupComponent } from './HSBC/funding-round-popup/funding-round-popup.component';
import { MillionFormatPipe } from "../CommoUtils/pipe/million-format.pipe";
import { AssociatedLegalEntitiesPopupComponent } from './HSBC/associated-legal-entities-popup/associated-legal-entities-popup.component';
import { SaveViewPopupComponent } from './save-view-popup/save-view-popup.component';
import { ReportStatusPopupComponent } from './HSBC/report-status-popup/report-status-popup.component';
import { UploadCustomerPopupComponent } from './upload-customer-popup/upload-customer-popup.component';
import { AgriHsnDetailPopupComponent } from './HSBC/agri-hsn-detail-popup/agri-hsn-detail-popup.component';
import {UploadCibilCustomerPopupComponent} from './upload-cibil-customer-popup/upload-cibil-customer-popup.component';
import {UploadCrifCustomerPopupComponent} from './upload-crif-customer-popup/upload-crif-customer-popup.component';
import {CibilmarkPopupComponent} from './HSBC/cibilmark-popup/cibilmark-popup.component';
import { TargetUserdeletePopupComponent } from './HSBC/target-userdelete-popup/target-userdelete-popup.component';
import { SucessfullyDeletePopupComponent } from './HSBC/sucessfully-delete-popup/sucessfully-delete-popup.component';
import {
  UploadCibilConsumerCustomerPopupComponent
} from './upload-cibil-consumer-customer-popup/upload-cibil-consumer-customer-popup.component';
import { Layer7ConfigurationPopupComponent } from './Configuration/layer7-configuration-popup/layer7-configuration-popup.component';
import { MillionFormatINRPipePipe } from '../CommoUtils/pipe/million-format-inrpipe.pipe';

import { ListofCustomerPopupComponent } from './HSBC/listof-customer-popup/listof-customer-popup.component';
import { PortfolioRemarkPopupComponent } from './HSBC/portfolio-remark-popup/portfolio-remark-popup.component';
import { ApproveRejectPopupComponent } from './HSBC/approve-reject-popup/approve-reject-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RequestedPortfolioLimitPopupComponent } from './HSBC/requested-portfolio-limit-popup/requested-portfolio-limit-popup.component';
import { UniquePopupComponent } from './HSBC/unique-popup/unique-popup.component';
 import { CreateCampaignPopupComponent } from './create-campaign-popup/create-campaign-popup.component';
 import { CreateCampaignProspectPopupComponent } from './create-campaign-prospect-popup/create-campaign-prospect-popup.component';
import { CustomizeColumnsPopupComponent } from './customize-columns-popup/customize-columns-popup.component';
 import { AddMultiRmPopupComponent } from './HSBC/add-multi-rm-popup/add-multi-rm-popup.component';
import { ViewAllrmPopupComponent } from './HSBC/view-allrm-popup/view-allrm-popup.component';
import { ComparisonAnalysisPopupComponent } from './HSBC/comparison-analysis-popup/comparison-analysis-popup.component';
import { OpExportPopupComponent } from './HSBC/op-export-popup/op-export-popup.component';
import { OpChangeStatusPopupComponent } from './HSBC/op-change-status-popup/op-change-status-popup.component';
import { OpAuditLogPopupComponent } from './HSBC/op-audit-log-popup/op-audit-log-popup.component';
import { TooltipDetailPopupComponent } from './HSBC/tooltip-detail-popup/tooltip-detail-popup.component';
import { OpRejectionRemarkPopupComponent } from './Configuration/op-rejection-remark-popup/op-rejection-remark-popup.component';
import {IdmviewDetailPopupComponent} from './HSBC/idmview-detail-popup/idmview-detail-popup.component';
import { CustomizeColumnsstructuredPopupComponent } from './customize-columns-structured-popup/customize-columns-popup.component';
import { ComparisonAnalysisstructuredPopupComponent } from './HSBC/comparison-analysis-structured-popup/comparison-analysis-popup.component';
import { FilterSidebarNewComponent } from './filter-sidebar-new/filter-sidebar-new.component';
import { NotificationPopupComponent } from './notification-popup/notification-popup.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { VideoViewerPopupComponent } from './video-viewer-popup/video-viewer-popup.component';
import { PdfViewerPopupComponent } from './pdf-viewer-popup/pdf-viewer-popup.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamStructurePopupComponent } from './team-structure-popup/team-structure-popup.component';
import { CorporateSubscribePopupComponent } from './HSBC/corporate-subscribe-popup/corporate-subscribe-popup.component';
import { AssignTargetPopupComponent } from './assign-target-popup/assign-target-popup.component';
import { SaveFilterPopupComponent } from './save-filter-popup/save-filter-popup.component';
import { CrilcReportPopupComponent } from './crilc-report-popup/crilc-report-popup.component';
import { PreQulifiedCommonPopupComponent } from './pre-qulified-common-popup/pre-qulified-common-popup.component';
import { MyportfolioSubscribePopupComponent } from './HSBC/myportfolio-subscribe-popup/myportfolio-subscribe-popup.component';
import { CrilicOpportunityPopupComponent } from './HSBC/crilic-opportunity-popup/crilic-opportunity-popup.component';
  @NgModule({
  declarations: [
    HSBCAPIAuditLogPopupComponent,
    HSBCBusinessPANComponent,
    HSBCNotEligibleComponent,
    HsbcThankyouPopupComponent,
    BulkUploadSuccessFullyComponent,
    CommercialCibilUploadSuccessComponent,
    CustomerBulkUploadSuccessComponent,
    ReadInstructionBulkUploadComponent,
    SendLinkBorrowerPopupComponent,
    UdyamDetailsPopupComponent,
    CreditRatingDetailsPopupComponent,
    WarningPopupComponent,
    BRCConfigurationPopupComponent,
    BRCConfigurationStatusComponent,
    BRCConfirmationPopupComponent,
    ActiveGstDetailsPopupComponent,
    InactiveDisableGstDetailsPopupComponent,
    HSBCGSTOTPVerifyComponent,
    EximSearchPopupComponent,
    LenderMcaChargesPopupComponent,
    HSNdetailsPopupComponent,
    FdiOpportunitydataComponent,
    ProductsHSNcodePopupComponent,
    SectorHSNDetailsComponent,
    FacilitiesFromLendersComponent,
    ProductsForeignCurrenciesComponent,
    SpreadOrderPopupComponent,
    BureauReportRefreshPopupComponent,
    HrmsBulkUploadSuccessComponent,
    UserDeletePopupComponent,
    ExportExcelPopupComponent,
    UseridPopupComponent,
    InactiveCsemCompanyPopupComponent,
    UserDetailsPopupComponent,
    RegionBulkUploadSuccessComponent,
    CountryBulkUploadSuccessComponent,

    RequestStatusPopupComponent,
    NewIncorporationViewPopupComponent,
    ReadInstructionsPopupComponent,
    RemarkAlertPopupComponent,
    ProfileDetailsPopupComponent,
    InvesteeCompaniesPopupComponent,
    RejectedPopupComponent,
    RemarkAlertPopupComponent,
    BalanceDepositPopupComponent,
    FundingRoundPopupComponent,
    AssociatedLegalEntitiesPopupComponent,
    SaveViewPopupComponent,
    ReportStatusPopupComponent,
    UploadCustomerPopupComponent,
    UploadCibilCustomerPopupComponent,
    UploadCrifCustomerPopupComponent,
    AgriHsnDetailPopupComponent,
    CibilmarkPopupComponent,
    TargetUserdeletePopupComponent,
    SucessfullyDeletePopupComponent,
    UploadCibilConsumerCustomerPopupComponent,
    SucessfullyDeletePopupComponent,
    ListofCustomerPopupComponent,
    Layer7ConfigurationPopupComponent,
    PortfolioRemarkPopupComponent,
    ApproveRejectPopupComponent,
    RequestedPortfolioLimitPopupComponent,
    UniquePopupComponent,
    CreateCampaignPopupComponent,
    CreateCampaignProspectPopupComponent,
    CustomizeColumnsPopupComponent,
    CustomizeColumnsstructuredPopupComponent,
     AddMultiRmPopupComponent,
    ViewAllrmPopupComponent,
    ComparisonAnalysisPopupComponent,
    ComparisonAnalysisstructuredPopupComponent,
    OpExportPopupComponent,
    OpChangeStatusPopupComponent,
    OpAuditLogPopupComponent,
    TooltipDetailPopupComponent,
    OpRejectionRemarkPopupComponent,
    IdmviewDetailPopupComponent,
    FilterSidebarNewComponent,
    NotificationPopupComponent,
    VideoViewerPopupComponent,
    PdfViewerPopupComponent,
    TeamStructurePopupComponent,
    CorporateSubscribePopupComponent,
    AssignTargetPopupComponent,
    SaveFilterPopupComponent,
    CrilcReportPopupComponent,
    PreQulifiedCommonPopupComponent,
    MyportfolioSubscribePopupComponent,
    CrilicOpportunityPopupComponent
    ],

    imports: [
    CommonModule,
    HttpClientModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    HsbcComponentModule,
    MillionFormatPipe,
    MillionFormatINRPipePipe,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    BsDatepickerModule.forRoot(),
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PopupModule { }
