import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OpportunityDashboardComponent } from '../opportunity-dashboard/opportunity-dashboard/opportunity-dashboard.component';
import { WalletDashboardComponent } from './wallet-dashboard/wallet-dashboard.component';
import { PrReconcilationDashboardComponent } from './pr-reconcilation-dashboard/pr-reconcilation-dashboard.component';


const routes: Routes = [
  { path: 'hsbc/walllet-dashboard-lipisearch', component: WalletDashboardComponent, data: { title: 'Wallet Dashboard Lipisearch' } },
  { path: 'hsbc/pr-reconcilation-dashboard-lipisearch', component: PrReconcilationDashboardComponent, data: { title: 'PR Reconcilation Dashboard Lipisearch' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrWalletRoutingModule { }
