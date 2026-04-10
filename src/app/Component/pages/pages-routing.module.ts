import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessGuard } from '../core/guards/access.guard';
import { OpportunityDashboardComponent } from './opportunity-dashboard/opportunity-dashboard/opportunity-dashboard.component';
import { WalletDashboardComponent } from './wallet-dashboard/wallet-dashboard/wallet-dashboard.component';
import { OpportunityDashboardNtbComponent } from './HSBC/opportunity-dashboard-ntb/opportunity-dashboard-ntb.component';
import { WalletDashboardStructuredComponent } from './wallet-dashboard-structured/wallet-dashboard-structured/wallet-dashboard-structured.component';
import { HelpAndSupportComponent } from './HSBC/help-and-support/help-and-support.component';
import { CampaignThroughBulkUploadComponent } from './opportunity-dashboard/campaign-through-bulk-upload/campaign-through-bulk-upload.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/hsbc/rmExisitingPortfolio' },
  { path: 'hsbc', loadChildren: () => import('./HSBC/hsbc-component.module').then(m => m.HsbcComponentModule), canActivate: [] },
  { path: 'hsbc/opportunity-dashboard', component: OpportunityDashboardComponent, data: { title: 'Opportunity Dashboard' } },
  { path: 'hsbc/opportunity-dashboard-ntb', component: OpportunityDashboardNtbComponent, data: { title: 'Opportunity Dashboard NTB' } },
  { path: 'hsbc/campaign-through-bulk-upload', component: CampaignThroughBulkUploadComponent, data: { title: 'Campaign Through Bulk Upload' } },
  { path: 'hsbc', loadChildren: () => import('./wallet-dashboard/pr-dash-wallet.module').then(m => m.PrWalletModule) },
  { path: 'hsbc', loadChildren: () => import('./wallet-dashboard-lipisearch/pr-dash-wallet.module').then(m => m.PrWalletModule) },
  // { path: 'hsbc/walllet-dashboard-structured', loadChildren: () => import('./wallet-dashboard-structured/wallet-structured.module').then(m => m.WalletStructuredModule)},
  { path: 'hsbc/walllet-dashboard-structured', component: WalletDashboardStructuredComponent, data: { title: 'Wallet Dashboard Structured' } },
  { path: 'hsbc/help-and-support', component: HelpAndSupportComponent, data: { title: 'Help and Support' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
