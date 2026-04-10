import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import {Inject, Injectable, Renderer2} from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, finalize, catchError, map } from 'rxjs/operators';
import { CommonService } from './common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { Constants } from '../constants';
import {DOCUMENT} from '@angular/common';
import {GlobalHeaders} from '../global-headers';
import { environment } from 'src/environments/environment';

/**
 *  Note intercepter for filter web service Like header add skip URl from Headers etc.
 */
@Injectable()
export class InterceptorService implements HttpInterceptor {
  private requests: HttpRequest<any>[] = [];
  private page: string = '';
  private renderer: Renderer2;
  private subPage: string = '';
  @Inject(DOCUMENT) private document: Document;
  constructor(private loaderService: LoaderService, private commonService: CommonService ) {}


  // Handle request for loader spin
  removeRequest(req: HttpRequest<any>) {
    const i = this.requests.indexOf(req);
    if (i >= 0) {
      this.requests.splice(i, 1);
    }
    if (environment.staticDemo) {
      return;
    }
    // Don't show main loader if subloader is active
    if (this.loaderService.isSubLoaderActive) {
      this.loaderService.isLoading.next(false);
    } else {
      this.loaderService.isLoading.next(this.requests.length > 0);
    }
  }

  // call interceptor and add token parameter into request
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headers = req.headers;
    for (const [key, value] of Object.entries(GlobalHeaders)) {
      if (value) { // Only set headers with non-empty values
        // console.log(`${key} => ${value}`);
        req = req.clone({ headers: req.headers.set(`${key}`, `${value}`) });
       // modifiedHeaders = modifiedHeaders.set(key, value);
      }
    }

  //  const modifiedRequest = req.clone({ headers: modifiedHeaders });

    if (headers.has('ignoreLoader') && (headers.get('ignoreLoader') === 'false')) {
      // this.hideLoader();
    } else {
      // this.loaderService.show();
      // this.requests.push(req);
    }
    if (!this.isHeaderSkipUrls(req.url)) {// for skip URL
      const cookiesObj = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true));
      //console.logcookiesObj===>>>",cookiesObj);
      if (cookiesObj != null && cookiesObj !== undefined) {
        req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.USNM, cookiesObj[Constants.httpAndCookies.USNM]) });
        // req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.ACTK, cookiesObj[Constants.httpAndCookies.ACTK]) });
        req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.LGTK, cookiesObj[Constants.httpAndCookies.LGTK].toString()) });
        // req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.RFTK, cookiesObj[Constants.httpAndCookies.RFTK]) });
       req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.ORGID, cookiesObj[Constants.httpAndCookies.ORGID]) });
       req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.PLATFORM_ID, cookiesObj[Constants.httpAndCookies.PLATFORM_ID].toString())});
        if(this.commonService.getStorage('msalAccessToken', true)){
         req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.AUTHORIZATION, Constants.httpAndCookies.BEARER+ this.commonService.getStorage('msalAccessToken', true))});
         console.log("msalAccessToken string=",this.commonService.getStorage('msalAccessToken', true));
          }
       if (this.isSkipEncryption(req.url)) {
        req = req.clone({ headers: req.headers.set('is_decrypt', 'true') });
        req = req.clone({ headers: req.headers.set(Constants.httpAndCookies.PLATFORM_ID, cookiesObj[Constants.httpAndCookies.PLATFORM_ID].toString())});
      }
      } else {
        this.hideLoader();
        console.log('You are not authorised person');
      }
    }else{
      if (this.isSkipEncryption(req.url)) {
        req = req.clone({ headers: req.headers.set('is_decrypt', 'true') });
      }
    }
    const startTime = Date.now();
    let status: string;
    // Hide loader
    if (headers.has('ignoreLoader')) {
      if((headers.get('ignoreLoader') === 'false')) {
        this.requests.push(req);
      } else {
        req = req.clone({ headers: req.headers.delete('ignoreLoader', 'false') });
      }
    }
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          status = 'succeeded';
          this.removeRequest(req);
          // console.log('event--->>>', event);
          return event;
        }
      }, catchError(error => {
        status = 'Error';
        this.removeRequest(req);
        return this.handleError(error);
      })), finalize(() => {
        const elapsedTime = Date.now() - startTime;
        const message = req.method + ' ' + req.urlWithParams + ' ' + status + ' in ' + elapsedTime + 'ms';
        this.logDetails(message);
        this.removeRequest(req);
        // this.hideLoader();
      }));
  }

  isSkipEncryption(url: string): boolean {
    if (
      //url.endsWith('/getTokensForClient') ||
      //url.endsWith('/checkEmailExists')
      url.includes('/cam/getCamReport')
      || url.includes('/getStorageIdsForDownload')
      )
      return false;
    else
      return true;
    // return true;
  }

  // For Skip URLS
  isHeaderSkipUrls(url: string): boolean {
    if (url.endsWith('/login')
      || url.endsWith('/forgotpassword')
      || url.endsWith('/otp')
      || url.endsWith('/resend')
      || url.endsWith('/checkOtpVarification')
      || url.endsWith('/linkVerification')
      || url.endsWith('/getTokensForClient')
      || url.endsWith('/password')
      || url.endsWith('/timeout')
      || url.endsWith('/getUrls')
      || url.endsWith('/register')) {
      return true;
    } else {
      return false;
    }
  }

  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      console.log(error.status);
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    // window.alert(errorMessage);
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  private logDetails(msg: string) {
    console.log(msg);
  }

  private showLoader(): void {
    this.loaderService.show();
  }
  private hideLoader(): void {
    this.loaderService.hide();
  }
}
