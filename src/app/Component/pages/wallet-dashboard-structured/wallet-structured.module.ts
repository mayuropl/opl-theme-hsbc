import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
 import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SharedModule } from '../../shared/shared.module';
 import {  PrLendingAnalyticsStructuredComponent } from './pr-lending-analytics-structured/pr-lending-analytics.component';
import {TrendsLendingChartStructuredComponent } from './trends-lending-chart-structured/trends-lending-chart.component';
import { SegmentLevelChartStructuredComponent } from './segment-level-chart-structured/segment-level-chart.component';
import { ProductLevelChartStructuredComponent } from './product-level-chart-structured/product-level-chart.component';
import { PrInsightsAnalysisStructuredComponent } from './pr-insights-analysis-structured/pr-insights-analysis.component';
import { ComparisonAnalysisStructuredComponent } from './comparison-analysis-structured/comparison-analysis.component';
import { BankerAnalysisTabsStructuredComponent } from './banker-analysis-tabs-structured/banker-analysis-tabs.component';
import { BalanceLiabilityWallletStructuredComponent } from './balance-liability-walllet-structured/balance-liability-walllet.component';
import {SelfTransferLiabilityWalletStructuredComponent } from './self-transfer-liability-wallet-structured/self-transfer-liability-wallet.component';
import { ReceiptsLiabilityWalletStructuredComponent } from './receipts-liability-wallet-structured/receipts-liability-wallet.component';
import { PaymentsLiabilityWalletStructuredComponent } from './payments-liability-wallet-structured/payments-liability-wallet.component';
import { RelatedPartiesLiabilityWalletStructuredComponent } from './related-parties-liability-wallet-structured/related-parties-liability-wallet.component';
import { OthersLiabilityWalletStructuredComponent } from './others-liability-wallet-structured/others-liability-wallet.component';
import { SkeletonDirective } from 'src/app/Directives/skeleton.directive';
import { WalletDashboardStructuredComponent } from './wallet-dashboard-structured/wallet-dashboard-structured.component';
import { PrWalletStructuredRoutingModule } from './wallet-structured-routing.module';
import { PrTopFilterStructuredComponent } from './pr-top-filter-structured/pr-top-filter.component';
 @NgModule({
  declarations: 
  [
    WalletDashboardStructuredComponent, 
    PrTopFilterStructuredComponent,
    PrLendingAnalyticsStructuredComponent, 
    TrendsLendingChartStructuredComponent,
    SegmentLevelChartStructuredComponent,
    ProductLevelChartStructuredComponent,
    PrInsightsAnalysisStructuredComponent,
    ComparisonAnalysisStructuredComponent,
    BankerAnalysisTabsStructuredComponent,
    BalanceLiabilityWallletStructuredComponent,
    SelfTransferLiabilityWalletStructuredComponent,
    ReceiptsLiabilityWalletStructuredComponent,
    PaymentsLiabilityWalletStructuredComponent,
    RelatedPartiesLiabilityWalletStructuredComponent,
    OthersLiabilityWalletStructuredComponent,
  ],
  imports: [
    CommonModule,
    NgbDropdownModule,
     PrWalletStructuredRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    SharedModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA,],
})
export class WalletStructuredModule { }
