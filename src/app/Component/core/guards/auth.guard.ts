import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../services/auth.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
@Injectable({ providedIn: 'root' })
export class AuthGuard  {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private commonService: CommonService, private loaderService: LoaderService,private commonMethod :CommonMethods
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true) != null) {
            // logged in so return true
          //  this.startIntervalForGetNewAccessKey(1800000);
            return true;
          } else {
            this.loaderService.hide();
            this.commonService.warningSnackBar('You are not Authorized');
            this.logoutUser();
            return false;
          }
    }
    logoutUser() {
      return this.commonMethod.logoutUser();
    }

    // logoutUser() {
    //     // For Logout
    //     this.msmeService.logoutUser().subscribe(res => {
    //         if (res.status === 200) {
    //             this.commonService.successSnackBar(res.message);
    //         } else {
    //             this.commonService.errorSnackBar(res.message);
    //         }
    //     }, error => {
    //         this.commonService.errorSnackBar(error);
    //     });
    //     this.commonService.removeStorage(Constants.httpAndCookies.USERTYPE);
    //     this.commonService.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
    //     this.commonService.removeStorage(Constants.httpAndCookies.ORGID);
    //     this.commonService.removeStorage(Constants.httpAndCookies.ROLEID);
    //     this.commonService.removeStorage(Constants.httpAndCookies.USER_NAME);
    //     window.location.href = RestUrl.LENDER_LOGIN_URL;
    // }
}