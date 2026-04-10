import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 import { WalletDashboardStructuredComponent } from './wallet-dashboard-structured/wallet-dashboard-structured.component';
 

const routes: Routes = [
    { path: 'hsbc/walllet-dashboard-structured', component: WalletDashboardStructuredComponent ,data: { title: 'Wallet Dashboard' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrWalletStructuredRoutingModule { }
