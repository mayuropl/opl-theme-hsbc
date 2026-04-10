import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { LoaderService } from 'src/app/CommoUtils/common-services/LoaderService';
import { Constants } from 'src/app/CommoUtils/constants';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard  {

  roleId;
  userTypeId;
  isRouteUrl: boolean = false;
  constructor(
    private commonService :CommonService,
    private loaderService: LoaderService,
    private router: Router,private commonMethod :CommonMethods,
    private commonMethods: CommonMethods) {
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.userTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true));
  }

  canActivate(
    
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (environment.staticDemo) {
        return true;
      }
      const nextUrl = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.ACCESS_PATH, true));
    if (nextUrl && (_.includes(nextUrl, state.url) || this.checkIsRouteUrl(nextUrl, state.url))) {
        console.log("AccessGard======>");
      return true;
    } else {
      this.loaderService.hide();
      this.commonService.warningSnackBar('You are not authorised person');
      //this.logoutUser();
      // redirected to dashBoard Role Wise
      window.location.href = RestUrl.LENDER_LOGIN_URL;
      return false;
    }
  }

  logoutUser() {
    return this.commonMethod.logoutUser();
  }

  checkIsRouteUrl(pathList, path): boolean {
    for (const iterator of pathList) {
      if (_.includes(path, iterator)) {
        return true;
      }
    }
    return false;
  }
}