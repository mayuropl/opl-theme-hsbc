import { Component, OnInit, Injectable } from '@angular/core';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { RootScopeService } from 'src/app/CommoUtils/common-services/root-scope.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { ProspectsFilterStorageService } from '../services/prospect-filter-storage.service';
import { GlobalHeaders, saveActivity } from '../CommoUtils/global-headers';
import { NotificationRedirectComponent } from '../notification-redirect/notification-redirect.component';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html'
})
export class RedirectComponent implements OnInit {

  userResponse: any = {};
  data: any = {};
  uuid: any;
  existinPage:any;
  pageData:any;

  constructor(private MsmeService: MsmeService, private commonService: CommonService, private router: Router, private route: ActivatedRoute,
    private rootScope: RootScopeService, private commonMethod: CommonMethods, private prospectsfilterStorageService: ProspectsFilterStorageService, private notificationRedirect: NotificationRedirectComponent) { }

  ngOnInit(): void {
    this.getTokens();
  }

  getTokens() {
    console.log("getTockens called..");
    if (this.commonService.isObjectNullOrEmpty(this.route.snapshot.queryParamMap.get('data'))) {
      this.commonMethod.moveBackToplatForm();
    }
    if (Constants.IS_LOCAL) {
      this.data = JSON.parse(this.commonService.toATOB(this.route.snapshot.queryParamMap.get('data')));
    } else {
      this.uuid = atob(this.route.snapshot.queryParamMap.get('data'));
      const encObj = this.commonService.getStorage(this.uuid, true);
      if (this.commonService.isObjectNullOrEmpty(encObj)) {
        this.commonService.clearStorageAndMoveToLogin(true);
        return;
      }
      this.data = JSON.parse(encObj);
      this.commonService.removeStorage(this.uuid);
    }
    this.data.platFormId = this.data.platForm_id
    this.data.grant_type = btoa(this.data.token);
    this.MsmeService.getTokensForClient(this.data).subscribe(res => {
      // console.log("getTocken : ",res.data);
      if (res.status == 200 && !this.commonService.isObjectNullOrEmpty(res.data) && !this.commonService.isObjectNullOrEmpty(res.data.access_token) &&
        !this.commonService.isObjectNullOrEmpty(res.data.refresh_token)) {
        this.commonService.removeStorage(Constants.httpAndCookies.USERTYPE);
        this.commonService.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
        this.commonService.removeStorage(Constants.httpAndCookies.ROLEID);
        this.commonService.removeStorage(Constants.httpAndCookies.ORGID);
        this.commonService.removeStorage(Constants.httpAndCookies.USER_ID);
        this.commonService.removeStorage(Constants.httpAndCookies.EMP_CODE);
        this.commonService.removeStorage(Constants.httpAndCookies.ROLE_TYPE);
        this.commonService.removeStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API);
        this.commonService.removeStorage(Constants.FILTER_JSON_EXISTING);
        this.commonService.removeStorage(Constants.FILTER_LIST_MASTER_EXISTING);
        this.commonService.removeStorage(Constants.FILTER_JSON_TARGET);
        this.commonService.removeStorage(Constants.TOP_BAR_FILTER_LIST_EXISTING);
        this.commonService.removeStorage(Constants.TOP_BAR_FILTER_LIST_TARGET);
        this.commonService.removeStorage(Constants.FILTER_JSON_FIND_PROSPECT);
        this.commonService.removeStorage(Constants.FILTER_LIST_MASTER_TARGET);
        this.commonService.removeStorage(Constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT);
        this.prospectsfilterStorageService.clearAllFilterStates();
        // Clear hierarchy filter states
        this.commonService.removeStorage(Constants.HIERARCHY_FILTER_EXISTING);
        this.commonService.removeStorage(Constants.HIERARCHY_FILTER_TARGET);
        this.commonService.removeStorage(Constants.HIERARCHY_FILTER_WALLET);
        // Clear PR Dashboard filter states
        this.commonService.removeStorage("pr_dashboard_show_summary");
        this.commonService.removeStorage("pr_dashboard_filters_summary");
        this.commonService.removeStorage("pr_dashboard_show_comparison");
        this.commonService.removeStorage("pr_dashboard_filters_comparison");
        this.commonService.removeStorage("pr_dashboard_original_group_by");
        this.commonService.removeStorage("pr_dashboard_search_view_by_selection");
        this.commonService.removeStorage("pr_dashboard_search_view_by_options");
        this.commonService.removeStorage("pr_dashboard_bureau_type");
        this.commonService.removeStorage("pr_dashboard_customer_type");

        this.commonService.removeStorage(Constants.CLEAN_FILTER_LIST_MASTER);
        this.userResponse = res.data;
        this.commonService.setStorage(Constants.httpAndCookies.USERTYPE, this.userResponse.userType);
        this.commonService.setStorage(Constants.httpAndCookies.USER_NAME, this.data.userName);
        this.commonService.setStorage(Constants.httpAndCookies.ORGID, this.data.orgId);
        this.commonService.setStorage(Constants.httpAndCookies.USER_ID, this.data.userId);
        this.commonService.setStorage(Constants.httpAndCookies.EMP_CODE, this.data.employeeCode);
        this.commonService.setStorage(Constants.httpAndCookies.ROLE_TYPE, this.data?.roleType);
        this.commonService.setStorage(Constants.httpAndCookies.PLATFORM_ID, this.data.platFormId);
        this.commonService.setStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, this.data.businessTypeId);
        if(this.data?.msalAccessToken){
          this.commonService.setStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, this.data.msalAccessToken);
        }// save data in Localstorage
        console.log()
        console.log()
        console.log('USER INFO :: ', this.userResponse)
        console.log('org id :', this.commonService.getStorage(Constants.httpAndCookies.ORGID, false))
        console.log()
        this.commonService.setSessionAndHttpAttr(btoa(this.userResponse.email), this.userResponse, this.userResponse.loginToken, this.commonService.getStorage(Constants.httpAndCookies.ORGID, true), this.data.platFormId);
        this.commonService.setStorage(Constants.httpAndCookies.ROLEID, this.commonService.isObjectNullOrEmpty(this.userResponse.userRoleId) ? this.data.roleId : this.userResponse.userRoleId);
        this.commonService.setStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, this.data.isShowAuditView);
        this.getUserPermissionData(this.commonService.isObjectNullOrEmpty(this.userResponse.userRoleId) ? this.data.roleId : this.userResponse.userRoleId,this.data.userId);

        if (this.commonService.isObjectNullOrEmpty(this.data.state)) {
          // if (res.data.userType == 2) {
          //   this.router.navigate(['/Product-Scoring/Product-list']);
          // }
        } else if (!this.commonService.isObjectNullOrEmpty(this.data.state)) {
          this.router.navigate([this.data.state]);
        } else {
          this.commonService.warningSnackBar('Invalid token, You are not authorized.');
          this.commonMethod.moveBackToplatForm();
          //this.headerComp.moveBackToplatForm();
        }
      } else {
        console.log("token invalid..!!")
        this.commonService.warningSnackBar('Invalid Token,You are not Authorized');
        this.commonMethod.moveBackToplatForm();
        // this.headerComp.moveBackToplatForm();
      }
    }, error => {
      console.log(error);
      this.commonService.errorSnackBar(error);
      // this.headerComp.moveBackToplatForm();
    });
  }



  goToAddScoringModel() {
    this.router.navigate(['/addScoringModel']);
  }

  isArrayEmpty(arr: any[]): boolean {
    return !arr || arr.length === 0;
  }

  getUserPermissionData(role: any, user_id: any): void {
    if (!role || !user_id) {
      console.log("User ID and Role are required.");
      return;
    }

    this.MsmeService.getUserPermission(user_id, role).subscribe(
      (response) => {
        if (!response) {
          this.commonService.errorSnackBar('Error while getting user permission');
          return;
        }

        this.pageData = response;
        // store response in storage
        this.commonService.setStorage(Constants.httpAndCookies.US_PR, JSON.stringify(response));

        let routeUrl = JSON.parse(JSON.parse(this.commonService.getStorageAesEncryption('notificationredirect')));
        if(!this.commonService.isObjectNullOrEmpty(routeUrl) && !this.commonService.isObjectNullOrEmpty(routeUrl?.pan)){
          this.notificationRedirect.processNotificationRedirectRequest(null, routeUrl);
        }
        else{
        // Find the EXISTING_PORTFOLIO page
        this.existinPage = response.find(
          (data) => data.pageId === Constants.pageMaster.PORTFOLIO_NEW
        );

        if (!this.isArrayEmpty(this.pageData)) {
          // let targetPage = this.existinPage || this.pageData[0];
          let targetPage = this.existinPage?.subpages.find(
            (data) => data.subpageId === Constants.pageMaster.EXISTING_PORTFOLIO
          ) || this.pageData.find(
            (data) => data.pageId === Constants.pageMaster.PORTFOLIO_NEW
          )?.subpages.find(
            (data) => data.subpageId === Constants.pageMaster.EXISTING_PORTFOLIO
          );

          // If main page doesn't have a routeLink, try subpages
          if (!targetPage.routeLink && targetPage.subpages?.[0]?.routeLink) {
            targetPage = targetPage.subpages[0];
          }

          if (targetPage.routeLink) {
            this.router.navigate([targetPage.routeLink], {
              state: { data: targetPage },
            });
          } else {
            this.commonService.errorSnackBar('No valid route found for the user.');
          }
        } else {
          this.commonService.errorSnackBar('No page permission found for this role.');
          setTimeout(() => this.commonMethod.logoutUser(), 5000);
        }
        }
      },
      (error) => {
        console.error("Permission fetch error:", error);
        this.commonService.errorSnackBar('Error while getting user permission');
      }
    );
  }


  resetActiveFlags(selectedId: number) {
    // Reset other conditions based on the selected link's subpageId
  }

}