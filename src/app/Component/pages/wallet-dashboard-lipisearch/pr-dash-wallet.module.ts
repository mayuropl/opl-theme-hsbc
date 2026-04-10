// import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
// import { PrWalletRoutingModule } from './pr-dash-wallet-routing.module'
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
// import { SharedModule } from '../../shared/shared.module';
// import { WalletDashboardComponent } from './wallet-dashboard/wallet-dashboard.component';
// import { PrTopFilterComponent } from './pr-top-filter/pr-top-filter.component';
// import { PrLendingAnalyticsComponent } from './pr-lending-analytics/pr-lending-analytics.component';
// import { TrendsLendingChartComponent } from './trends-lending-chart/trends-lending-chart.component';
// import { SegmentLevelChartComponent } from './segment-level-chart/segment-level-chart.component';
// import { ProductLevelChartComponent } from './product-level-chart/product-level-chart.component';
// import { PrInsightsAnalysisComponent } from './pr-insights-analysis/pr-insights-analysis.component';
// import { ComparisonAnalysisComponent } from './comparison-analysis/comparison-analysis.component';
// import { BankerAnalysisTabsComponent } from './banker-analysis-tabs/banker-analysis-tabs.component';
// import { BalanceLiabilityWallletComponent } from './balance-liability-walllet/balance-liability-walllet.component';
// import { SelfTransferLiabilityWalletComponent } from './self-transfer-liability-wallet/self-transfer-liability-wallet.component';
// import { ReceiptsLiabilityWalletComponent } from './receipts-liability-wallet/receipts-liability-wallet.component';
// import { PaymentsLiabilityWalletComponent } from './payments-liability-wallet/payments-liability-wallet.component';
// import { RelatedPartiesLiabilityWalletComponent } from './related-parties-liability-wallet/related-parties-liability-wallet.component';
// import { OthersLiabilityWalletComponent } from './others-liability-wallet/others-liability-wallet.component';
// import { SkeletonDirective } from 'src/app/Directives/skeleton.directive';
// import { PrReconcilationDashboardComponent } from './pr-reconcilation-dashboard/pr-reconcilation-dashboard.component';
// import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { SharedModule } from "../../shared/shared.module";
import { BalanceLiabilityWallletComponent } from "./balance-liability-walllet/balance-liability-walllet.component";
import { BankerAnalysisTabsComponent } from "./banker-analysis-tabs/banker-analysis-tabs.component";
import { ComparisonAnalysisComponent } from "./comparison-analysis/comparison-analysis.component";
import { OthersLiabilityWalletComponent } from "./others-liability-wallet/others-liability-wallet.component";
import { PaymentsLiabilityWalletComponent } from "./payments-liability-wallet/payments-liability-wallet.component";
import { PrWalletRoutingModule } from "./pr-dash-wallet-routing.module";
import { PrInsightsAnalysisComponent } from "./pr-insights-analysis/pr-insights-analysis.component";
import { PrLendingAnalyticsComponent } from "./pr-lending-analytics/pr-lending-analytics.component";
import { PrReconcilationDashboardComponent } from "./pr-reconcilation-dashboard/pr-reconcilation-dashboard.component";
import { PrTopFilterComponent } from "./pr-top-filter/pr-top-filter.component";
import { ProductLevelChartComponent } from "./product-level-chart/product-level-chart.component";
import { ReceiptsLiabilityWalletComponent } from "./receipts-liability-wallet/receipts-liability-wallet.component";
import { RelatedPartiesLiabilityWalletComponent } from "./related-parties-liability-wallet/related-parties-liability-wallet.component";
import { SegmentLevelChartComponent } from "./segment-level-chart/segment-level-chart.component";
import { SelfTransferLiabilityWalletComponent } from "./self-transfer-liability-wallet/self-transfer-liability-wallet.component";
import { TrendsLendingChartComponent } from "./trends-lending-chart/trends-lending-chart.component";
import { WalletDashboardComponent } from "./wallet-dashboard/wallet-dashboard.component";

@NgModule({
  declarations:
    [
      WalletDashboardComponent,
      PrTopFilterComponent,
      PrLendingAnalyticsComponent,
      TrendsLendingChartComponent,
      SegmentLevelChartComponent,
      ProductLevelChartComponent,
      PrInsightsAnalysisComponent,
      ComparisonAnalysisComponent,
      BankerAnalysisTabsComponent,
      BalanceLiabilityWallletComponent,
      SelfTransferLiabilityWalletComponent,
      ReceiptsLiabilityWalletComponent,
      PaymentsLiabilityWalletComponent,
      RelatedPartiesLiabilityWalletComponent,
      OthersLiabilityWalletComponent,
      PrReconcilationDashboardComponent
    ],
  imports: [
    CommonModule,
    NgbDropdownModule,
    PrWalletRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    SharedModule,
    BsDatepickerModule.forRoot()
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA,],
})
export class PrWalletModule { }
