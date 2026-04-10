import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AuthenticationService } from '../services/auth.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,public commonService: CommonService,
        public commonMethod : CommonMethods) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                //this.commonMethod.logoutUser();
                this.commonService.clearStorageAndMoveToLogin(true);
               // location.reload();
            }else{
                return this.commonService.errorHandle(err.status,err.message);
            }

           // const error = err.error.message || err.statusText;
            //return throwError(error);
        }));
    }
}
