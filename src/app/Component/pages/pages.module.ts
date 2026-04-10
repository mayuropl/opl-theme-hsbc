import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { DashboardsModule } from './dashboards/dashboards.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { OpportunityDashboardComponent } from './opportunity-dashboard/opportunity-dashboard/opportunity-dashboard.component';
import { OpportunityDashboardNtbComponent } from './HSBC/opportunity-dashboard-ntb/opportunity-dashboard-ntb.component';
import { OpportunityDataTableComponent } from './opportunity-dashboard/opportunity-data-table/opportunity-data-table.component';
import { SharedModule } from '../shared/shared.module';
import { HsbcComponentModule } from './HSBC/hsbc-component.module';
import { CampaignThroughBulkUploadComponent } from './opportunity-dashboard/campaign-through-bulk-upload/campaign-through-bulk-upload.component';
  @NgModule({
  declarations: [TermsAndConditionsComponent, OpportunityDashboardComponent, OpportunityDataTableComponent, OpportunityDashboardNtbComponent, CampaignThroughBulkUploadComponent],
  imports: [
    CommonModule,
    NgbDropdownModule,
    DashboardsModule,
    PagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    SharedModule,
    HsbcComponentModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA,],
})
export class PagesModule { }
