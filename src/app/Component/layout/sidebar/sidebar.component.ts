import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() isCondensed = false;

  menu: any;
  readonly constant = Constants;
  collapse: boolean = false;
  Dashbordcollapse: boolean = false;
  ProductScoringcollapse: boolean = false;
  bulkUpload: boolean = false;
  UserManagementcollapse: boolean = false;
  Reportscollapse: boolean = false;
  BankProfilecollapse: boolean = false;
  Monitoringcollapse: boolean = false;

  userPermissions: any;
  userPageList: any;
  permissionList: any;
  req = { roleId: null, loanTypeId: null, orgId: null };
  roleIdStorage: any;
  roleId: any;
  @ViewChild('sideMenu', { static: false }) sideMenu: ElementRef;

  //analytics
  dashboardType: any;
  isCommercialActive: boolean = false;
  isConsumerActive: boolean = false;
  isGstTabActive: boolean = false;
  isBsTabActive: boolean = false;
  isEximTabActive: boolean = false;

  constructor(private router: Router, private commonService: CommonService, private msmeService: MsmeService) { }

  ngOnInit() {

    // this java script Add Nikul Do not-Remove 1-1-2020 Start point
    this.roleIdStorage = this.commonService.getStorage(Constants.httpAndCookies.ROLEID, false);
    this.roleId = parseInt(atob(this.roleIdStorage));
    (function ($) {
      $(window).resize(function () {
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        if (width < 1366) {
          document.body.classList.add('enlarged');
          document.body.classList.remove('sidebar-enable');
          return true;
        } else {
          document.body.classList.add('sidebar-enable');
          document.body.classList.remove('enlarged');
          return false;
        }
      });
    })(jQuery);
    // this java script Add Nikul Do not-Remove 1-1-2020 End Point
  }

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);

    this._activateMenuDropdown();
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }

  /**
   * small sidebar
   */
  smallSidebar() {
    document.body.classList.add('left-side-menu-sm');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('topbar-light');
    document.body.classList.remove('boxed-layout');
    document.body.classList.remove('enlarged');
  }

  /**
   * Dark sidebar
   */
  darkSidebar() {
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.add('left-side-menu-dark');
    document.body.classList.remove('topbar-light');
    document.body.classList.remove('boxed-layout');
  }

  /**
   * Light Topbar
   */
  lightTopbar() {
    document.body.classList.add('topbar-light');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.remove('boxed-layout');

  }

  /**
   * Sidebar collapsed
   */
  sidebarCollapsed() {
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.remove('left-side-menu-sm');
    document.body.classList.toggle('enlarged');
    document.body.classList.remove('boxed-layout');
    document.body.classList.remove('topbar-light');
  }

  /**
   * Boxed Layout
   */
  boxedLayout() {
    document.body.classList.add('boxed-layout');
    document.body.classList.remove('left-side-menu-dark');
    document.body.classList.add('enlarged');
    document.body.classList.remove('left-side-menu-sm');
  }

  /**
   * Activates the menu dropdown
   */
  _activateMenuDropdown() {

    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      if (window.location.pathname === links[i]['pathname']) {
        menuItemEl = links[i];
        break;
      }
    }

    if (menuItemEl) {
      menuItemEl.classList.add('active');

      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('active');

        const parent2El = parentEl.parentElement;
        if (parent2El) {
          parent2El.classList.add('in');
        }

        const parent3El = parent2El.parentElement;
        if (parent3El) {
          parent3El.classList.add('active');
          parent3El.firstChild.classList.add('active');
        }
      }
    }
  }

  routeUserManagenent(type) {
    // this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true)
    let businessTypeId = this.commonService.toATOB(this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, false));
    this.commonService.redirectToOtherModule(businessTypeId, type);
  }

  redirectToAnalysis(applicationId?, panNo?, redirectUrl?) {
    console.log("roleId => ", this.roleId)
    let cookiesObje: any = this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
    cookiesObje = JSON.parse(cookiesObje);
    cookiesObje.token = cookiesObje.tk_lg;
    cookiesObje.orgId = this.commonService.getStorage(Constants.httpAndCookies.ORGID, true)
    cookiesObje.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    cookiesObje.userType = this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true);
    cookiesObje.campaignCode = this.commonService.getStorage(Constants.httpAndCookies.CAMPIGN_CODE, true);
    cookiesObje.type = 2;
    cookiesObje.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);

    cookiesObje.businessTypeId = this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true);
    cookiesObje.roleId = this.roleId;
    cookiesObje.isShowAuditView = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, true);
    cookiesObje.isShowNewCAMKFSButton = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_NEW_CAM_KFS_BTN, true);

    this.commonService.setStorage(Constants.httpAndCookies.ENV_ORG_ID, environment.orgId.toString());
    cookiesObje.environmentOrgId = environment.orgId;
    cookiesObje.platForm_id = environment.platFormId;
    if (applicationId) {
      cookiesObje.applicationId = applicationId;
    }
    if (panNo) {
      cookiesObje.panNo = panNo;
    }

    if(this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true)){
      cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
      console.log("msalAccessToken string=",true);
    }

    if (this.roleId == 9) {
      cookiesObje.branchId = this.commonService.getStorage('branchId', true);
    }
    this.commonService.setStorage(Constants.httpAndCookies.NEW_ROLE_ID, this.roleId);

    // console.log(Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj);
    //  window.location.href = Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj;

    //  window.location.href = 'http://localhost:4600' + '/hsbc/application' + '/redirect?data=' + encObj;
    let cookieString = JSON.stringify(cookiesObje);
    if (Constants.IS_LOCAL) {
      window.location.href = 'http://localhost:4500/redirect?data=' + this.commonService.toBTOA(cookieString);;
    } else {
      let UUID = crypto.randomUUID();
      this.commonService.setStorage(UUID, cookieString)
      window.location.href = Constants.LOCATION_URL + '/hsbc/application' + '/redirect?data=' + this.commonService.toBTOA(UUID);
    }


  }

  //analytics
  removeValue() {
    this.commonService.removeStorage("commrcial_pan");
    this.commonService.removeStorage("consumer_pan");
    this.commonService.removeStorage("gst_pan");
    this.commonService.removeStorage("bs_pan");
    this.commonService.removeStorage("exim_pan");
    this.commonService.removeStorage("exim_search_by");
    this.commonService.removeStorage("existing_pan");
    // window.location.reload();
  }

  onChange(url?) {
    if (!url) {
      url = this.router.url;
    }
  }


}
