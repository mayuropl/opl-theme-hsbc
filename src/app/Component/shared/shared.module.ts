import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

import { UIModule } from './ui/ui.module';

import "@lottiefiles/lottie-player";

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { MaterialModule } from 'src/app/CommoUtils/merterial.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoDataFoundComponent } from 'src/app/CommoUtils/common-components/no-data-found/no-data-found.component';
import { InterceptorService } from 'src/app/CommoUtils/common-services/interceptor.service';
import { HttpService } from 'src/app/CommoUtils/common-services/http.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { Title } from '@angular/platform-browser';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { AuthGuard } from '../core/guards/auth.guard';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatIconModule } from 'src/app/CommoUtils/mat-icon/mat-icon.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { NgOtpInputModule } from 'ng-otp-input';
 import { CommonSelectComponent } from 'src/app/CommoUtils/common-select/common-select.component';
import { CommonChartComponent } from 'src/app/CommoUtils/common-chart/common-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';
import { TableScrollDirective } from 'src/app/Directives/table-scroll.directive';
import { SkeletonDirective } from 'src/app/Directives/skeleton.directive';



@NgModule({
  declarations: [
    NoDataFoundComponent,
    CommonSelectComponent,
    CommonChartComponent,
    ScrollButtonsDirective,
    TableScrollDirective,
    SkeletonDirective
  ],
  imports: [
    CommonModule,
    NgOtpInputModule,
    UIModule,
    UiSwitchModule,
    HttpClientModule,
    MaterialModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    SlickCarouselModule,
    HighchartsChartModule
  ],
  exports: [
    UIModule,
    UiSwitchModule,
    HttpClientModule,
    MaterialModule,
    NgSelectModule,
    NgbModule,
    FormsModule,
    NgOtpInputModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    MatIconModule,
    CommonSelectComponent,
    CommonChartComponent,
    HighchartsChartModule,
    ScrollButtonsDirective,
    TableScrollDirective,
    SkeletonDirective
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true }, HttpService, LoaderService, Title, CommonMethods,
    AuthGuard, DatePipe, TranslatePipe, CurrencyPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule { }
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}
