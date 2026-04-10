import { inject, NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot } from '@angular/router';
import { LayoutComponent } from './Component/layout/layout.component';
import { TermsAndConditionsComponent } from './Component/pages/terms-and-conditions/terms-and-conditions.component';
import { RedirectComponent } from './redirect/redirect.component';
import { NotificationRedirectComponent } from './notification-redirect/notification-redirect.component';


const routes: Routes = [
  { path: 'redirect', component: RedirectComponent, data: { title: 'HSBC' }, pathMatch: 'full' },
  {
    path: 'notification/redirect',
    canActivate: [(route: ActivatedRouteSnapshot) => {
      const service = inject(NotificationRedirectComponent);
      service.processNotificationRedirectRequest(route, null);
      return false;
    }],
    component: NotificationRedirectComponent,
    pathMatch: 'full'
  },
  { path: '', component: LayoutComponent, loadChildren: () => import('./Component/pages/pages.module').then(m => m.PagesModule), canActivate: [] },
  { path: '', component: LayoutComponent, loadChildren: () => import('./Component/pages/wallet-dashboard/pr-dash-wallet.module').then(m => m.PrWalletModule) },
  { path: '', component: LayoutComponent, loadChildren: () => import('./Component/pages/wallet-dashboard-lipisearch/pr-dash-wallet.module').then(m => m.PrWalletModule) },
  { path: '', component: LayoutComponent, loadChildren: () => import('./Component/pages/wallet-dashboard-structured/wallet-structured.module').then(m => m.WalletStructuredModule) },
  { path: 'termsAndConditions', component: TermsAndConditionsComponent, data: { title: 'Terms & Conditions - HSBC' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
