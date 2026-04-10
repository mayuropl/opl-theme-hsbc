import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessGuard } from '../../core/guards/access.guard';
import { AuthGuard } from '../../core/guards/auth.guard';

import { DefaultDashboardComponent } from './default/default.component';

const routes: Routes = [
    {
        path: 'dashboard-1',
        component: DefaultDashboardComponent,
        data: { title: 'dashboard-1' },
        canActivate: [AccessGuard]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
