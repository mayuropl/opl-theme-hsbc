import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Injector, LOCALE_ID} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './Component/core/helpers/jwt.interceptor';
import { ErrorInterceptor } from './Component/core/helpers/error.interceptor';
import { FakeBackendProvider } from './Component/core/helpers/fake-backend';
import { LayoutsModule } from './Component/layout/layouts.module';
import { PopupModule } from './Popup/popup.module';
import { LoaderComponent } from 'src/app/CommoUtils/common-components/loader/loader.component';
import { ValidationMessagesComponent } from 'src/app/CommoUtils/common-services/validation-message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './CommoUtils/merterial.module';
import { NgbDateAdapter, NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { IndNumFormatPipe } from 'src/app/CommoUtils/pipe/ind-num-format.pipe';
// import { RedirectComponent } from './Component/redirect/redirect.component';
// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CustomAdapter, CustomDateParserFormatter } from './CommoUtils/datepicker-adapter';
import { ShortNamePipe } from './CommoUtils/pipe/short-name.pipe';
import { PrivacyPolicyComponent } from './Component/pages/privacy-policy/privacy-policy.component';
import { ValidateElementDirective } from './Directives/validate-element.directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonMethods } from './CommoUtils/common-methods';
import { InterceptorService } from './CommoUtils/common-services/interceptor.service';
import { LoaderService } from './CommoUtils/common-services/LoaderService';
import { HttpService } from './CommoUtils/common-services/http.service';
import { RedirectComponent } from './redirect/redirect.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { HsbcComponentModule } from './Component/pages/HSBC/hsbc-component.module';
import { registerLocaleData } from '@angular/common';
import localeIn from '@angular/common/locales/en-IN';

import '@lottiefiles/lottie-player';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatSelectSearchOptions, NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {setGlobalInjector} from "./CommoUtils/global-headers";
import { MillionFormatPipe } from './CommoUtils/pipe/million-format.pipe';
import { NotificationRedirectComponent } from './notification-redirect/notification-redirect.component';
import { SubLoaderComponent } from './CommoUtils/common-components/sub-loader/sub-loader.component';
import { HelpAndSupportUploadComponent } from './help-and-support-upload/help-and-support-upload.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { APP_MAT_DIALOG_DEFAULT_CONFIG } from './CommoUtils/mat-dialog-defaults';
import { StaticDemoInterceptor } from './CommoUtils/static-demo/static-demo.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    IndNumFormatPipe,
    PrivacyPolicyComponent,
    // ValidateElementDirective
    RedirectComponent,
    NotificationRedirectComponent,
    HelpAndSupportUploadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    LayoutsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    HsbcComponentModule,
    PopupModule,
    // Ng2SearchPipeModule,
    TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] } }),
    NgOtpInputModule,
    NgxMatSelectSearchModule,
    // FlexLayoutModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    CommonMethods,
    HttpService, LoaderService, InterceptorService,
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  { provide: NgbDateAdapter, useClass: CustomAdapter },
  { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
  { provide: LOCALE_ID, useValue: 'en-IN' },
  { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
  { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: APP_MAT_DIALOG_DEFAULT_CONFIG },
    // provider used to create fake backend
    FakeBackendProvider,
    { provide: HTTP_INTERCEPTORS, useClass: StaticDemoInterceptor, multi: true },
    Title, DecimalPipe, ShortNamePipe, DatePipe,MillionFormatPipe
  // {
  //   provide: MAT_SELECTSEARCH_DEFAULT_OPTIONS,
  //   useValue: <MatSelectSearchOptions>{
  //     noEntriesFoundLabel: 'No options found',
  //     disableInitialFocus: true,
  //     alwaysRestoreSelectedOptionsMulti: false,
  //     clearSearchInput: true,
  //     placeholderLabel: 'Search...',
  //     searching: true,
  //     enableClearOnEscapePressed: true,
  //   }
  // }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    setGlobalInjector(injector);
    registerLocaleData(localeIn);
    // Set global injector once at app startup
  }
}
export function HttpLoaderFactory(http: HttpClient) {
  if (window.location.pathname.includes('/banker/dashboard')) {
    return new TranslateHttpLoader(http, '/banker/dashboard/assets/i18n/', '.json'); // For live
  }
  return new TranslateHttpLoader(http); // For local
}
