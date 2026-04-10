import { Component, OnInit, OnDestroy, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '../../core/services/auth.service';
import { LeftMenuStateService } from '../left-menu-state.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { environment } from 'src/environments/environment';
import { NotificationPopupComponent } from 'src/app/Popup/notification-popup/notification-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  scrolled: boolean = false;
  private leftMenuStateSub?: Subscription;

  get iscloseLeftmenu(): boolean {
    return typeof document !== 'undefined' && document.body.classList.contains('closeLeftmenu');
  }
//   notificationItems: Array<{}>;
//   lender: string;
//   userDetails: any = {};
  userName: string;
//   roleId: any;
//   languages: Array<{
//     id: number,
//     flag?: string,
//     name: string
//   }>;
//   selectedLanguage: {
//     id: number,
//     flag?: string,
//     name: string
//   };

//   openMobileMenu: boolean;

//   @Output() settingsButtonClicked = new EventEmitter();
  @Output() mobileMenuButtonClicked = new EventEmitter();


//   //analytics
//   dashboardType: any;
//   isCommercialActive: boolean = false;
//   isConsumerActive: boolean = false;
//   isGstTabActive: boolean = false;
//   isBsTabActive: boolean = false;
//   isEximTabActive: boolean = false;
//   isCommCibilBulkShow: boolean = false;
//   isEximdataActive: boolean =  false;
//   isCustomermasterActive: boolean =  false;
//   isUsermanagementActive: boolean =  false;
//   isCustomersegmentationActive: boolean =  false;
//   isUsergroupsrolemasterActive: boolean =  false;
//   isUserlistActive: boolean =  false;
  notificationData:any = [];
  roleType: any;
  userId: any;
  pageData: any = [];
//   analytics: boolean = false;
//   muser: boolean = false;
//   bulkUp: boolean = false;
//   anaSubPage:any = [];
//   muserSubPage:any = [];
//   analysisLinks :any=[];
//   bureauLinks :any = [];
//   portfolioAnalysisLinks :any = [];
//   portfolioAnalysis:boolean = false;
//   monitoringLinks :any = [];
//   monitoring:boolean = false;
//   productAprlJrnyLinks :any = [];
//   productAprlJrny:boolean = false;
  constants :any;
//   bulkUploadLinks:any=[];
//   portfolio: boolean = false;
//   portfolioLink: any=[]
//   campaigndashboard:boolean=false;
//   campaigndashboardSubPage:any = [];
//   pageMaster = [
//     { pageId: 126, pageName: "Portfolio Analysis" },
//     { pageId: 1, pageName: "Existing Portfolio" },
//     { pageId: 23, pageName: "Targets and prospects" },
//     { pageId: 35, pageName: "Pre Approved Products" },
//     { pageId: 38, pageName: "Configurations" },
//     { pageId: 47, pageName: "User Management" },
//     { pageId: 51, pageName: "Bulk Upload" },
//     { pageId: 39, pageName: "Analytics" },
//     { pageId: 122, pageName: "Portfolio" }

// ];

//   mainPageHavingSubpages = [
//     "Exim Uploads"
//   ]

// menuItems = [
//   {
//     id: Constants.pageMaster.GST_ANALYSIS2,
//     icon: 'fas fa-percent',
//     tabKey: 'isGstTabActive'
//   },
//   {
//     id: Constants.pageMaster.BANK_STATEMENT_ANALYSIS2,
//     icon: 'fas fa-university',
//     tabKey: 'isBsTabActive'
//   },
//   {
//     id: Constants.pageMaster.EXIM_ANALYSIS2,
//     icon: 'fas fa-boxes',
//     tabKey: 'isEximTabActive'
//   },
//   {
//     id: Constants.pageMaster.COMMERCIAL_BUREAU2,
//     icon: 'fas fa-building',
//     tabKey: 'isCommercialActive'
//   },
//   {
//     id: Constants.pageMaster.CONSUMER_BUREAU2,
//     icon: 'fas fa-shopping-basket',
//     tabKey: 'isConsumerActive'
//   }
// ];
// menuMap = new Map(this.menuItems.map(menu => [menu.id, menu]));
// activeTab: any;

// // Submenu positioning
// activeSubmenuIndex: number | null = null;
// submenuPositions: { [key: number]: { top: number; left: number } } = {};
// private submenuHideTimeout: any = null;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    public commonMethod: CommonMethods,
    private msmeService: MsmeService,
    public commonService: CommonService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private leftMenuState: LeftMenuStateService
  ) {}

//   showSubmenu(event: MouseEvent, index: number): void {
//     // Clear any pending hide timeout
//     if (this.submenuHideTimeout) {
//       clearTimeout(this.submenuHideTimeout);
//       this.submenuHideTimeout = null;
//     }

//     const target = event.currentTarget as HTMLElement;
//     const rect = target.getBoundingClientRect();
//     this.submenuPositions[index] = {
//       top: rect.top,
//       left: rect.right // Reduced gap to prevent cursor from leaving hover area
//     };
//     this.activeSubmenuIndex = index;
//   }

//   hideSubmenu(index: number): void {
//     // Add a small delay before hiding to allow cursor movement to submenu
//     this.submenuHideTimeout = setTimeout(() => {
//       if (this.activeSubmenuIndex === index) {
//         this.activeSubmenuIndex = null;
//       }
//       this.submenuHideTimeout = null;
//     }, 150);
//   }

//   keepSubmenuOpen(index: number): void {
//     // Clear any pending hide timeout when hovering over submenu
//     if (this.submenuHideTimeout) {
//       clearTimeout(this.submenuHideTimeout);
//       this.submenuHideTimeout = null;
//     }
//     this.activeSubmenuIndex = index;
//   }

  ngOnInit() {
    this.constants = Constants;
    this.leftMenuStateSub = this.leftMenuState.onLeftMenuStateChanged.subscribe(() => this.cdr.detectChanges());

//     this.constants = Constants;
//     this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.getUserDetails();
//     this.getcommercialCibilBulkUploadShowFlag();
    this.pageData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR,true));
    // this.pageData = this.commonService.getPageData(this.constants.pageMaster.HELP_AND_SUPPORT);
       
    // this.pageData  = this.commonService.getPageData(this.constants.pageMaster.HELP_AND_SUPPORT,this.constants.pageMaster.HELP_AND_SUPPORT_SUBPAGE)
//     this.getUserPermissionData();
//     // get the notifications
//     this._fetchNotifications();
//     this.openMobileMenu = false;
    this.getNotificationDataForUser();
//     this.onChange();
//     // this.SchemeURL == this.router.url

//     // this.checkMaintenanceMode();
//     (function ($) {
//       $(document).ready(function () {

//         // For Analysis Dropdown
//         $(".dropdownBtn").hover(function () {
//           $("#analysis_dropdown").fadeIn("fast");
//           clearTimeout(debounce);
//         });
//         // $("#analysis_dropdown").hover(function () {
//         //   $("#analysis_dropdown").fadeIn("fast");
//         //   clearTimeout(debounce);
//         // });
//         $(".dropdownBtn").mouseleave(function () {
//           debounce = setTimeout(closeMenu, 100);
//         });
//         $("#analysis_dropdown").mouseleave(function () {
//           debounce = setTimeout(closeMenu, 100);
//         });
//         var debounce;
//         var closeMenu = function () {
//           $("#analysis_dropdown").fadeOut("fast");
//           clearTimeout(debounce);
//         }

//         // For Admin User Dropdown
//         $(".dropdownBtn2").hover(function () {
//           $("#admin_dropdown").fadeIn("fast");
//           clearTimeout(debounce2);
//         });
//         $(".dropdownBtn2").mouseleave(function () {
//           debounce2 = setTimeout(closeMenu2, 100);
//         });
//         $("#admin_dropdown").mouseleave(function () {
//           debounce2 = setTimeout(closeMenu2, 100);
//         });
//         var debounce2;
//         var closeMenu2 = function () {
//           $("#admin_dropdown").fadeOut("fast");
//           clearTimeout(debounce2);
//         }

//         // For Bulk Upload Dropdown
//         $(".dropdownBtn3").hover(function () {
//           $("#bulkUpload_dropdown").fadeIn("fast");
//           clearTimeout(debounce3);
//         });
//         $(".dropdownBtn3").mouseleave(function () {
//           debounce3 = setTimeout(closeMenu3, 100);
//         });
//         $("#bulkUpload_dropdown").mouseleave(function () {
//           debounce3 = setTimeout(closeMenu3, 100);
//         });
//         var debounce3;
//         var closeMenu3 = function () {
//           $("#bulkUpload_dropdown").fadeOut("fast");
//           clearTimeout(debounce3);
//         }


//          // For Bulk Upload Dropdown
//          $(".dropdownBtn4").hover(function () {
//           $("#target_dropdown").fadeIn("fast");
//           clearTimeout(debounce4);
//         });
//         $(".dropdownBtn4").mouseleave(function () {
//           debounce4 = setTimeout(closeMenu4, 100);
//         });
//         $("#target_dropdown").mouseleave(function () {
//           debounce4 = setTimeout(closeMenu4, 100);
//         });
//         var debounce4;
//         var closeMenu4 = function () {
//           $("#target_dropdown").fadeOut("fast");
//           clearTimeout(debounce4);
//         }



//           // For Bulk Upload Dropdown
//           $(".dropdownBtn5").hover(function () {
//             $("#portfolio_dropdown").fadeIn("fast");
//             clearTimeout(debounce5);
//           });
//           $(".dropdownBtn5").mouseleave(function () {
//             debounce5 = setTimeout(closeMenu5, 100);
//           });
//           $("#portfolio_dropdown").mouseleave(function () {
//             debounce5 = setTimeout(closeMenu5, 100);
//           });
//           var debounce5;
//           var closeMenu5 = function () {
//             $("#portfolio_dropdown").fadeOut("fast");
//             clearTimeout(debounce5);
//           }

//           // Porfolio Analysis Dropdown
//         // For Bulk Upload Dropdown
//         $(".dropdownBtn6").hover(function () {
//           $("#portfolioAnalysis_dropdown").fadeIn("fast");
//           clearTimeout(debounce5);
//         });
//         $(".dropdownBtn6").mouseleave(function () {
//           debounce5 = setTimeout(closeMenu5, 100);
//         });
//         $("#portfolioAnalysis_dropdown").mouseleave(function () {
//           debounce5 = setTimeout(closeMenu5, 100);
//         });
//         var debounce5;
//         var closeMenu5 = function () {
//           $("#portfolioAnalysis_dropdown").fadeOut("fast");
//           clearTimeout(debounce5);
//         }

//         // Monitoring Dropdown
//         // For Monitoring Dropdown
//         $(".dropdownBtn7").hover(function () {
//           $("#monitoring_dropdown").fadeIn("fast");
//           clearTimeout(debounce6);
//         });
//         $(".dropdownBtn7").mouseleave(function () {
//           debounce6 = setTimeout(closeMenu6, 100);
//         });
//         $("#monitoring_dropdown").mouseleave(function () {
//           debounce6 = setTimeout(closeMenu6, 100);
//         });
//         var debounce6;
//         var closeMenu6 = function () {
//           $("#monitoring_dropdown").fadeOut("fast");
//           clearTimeout(debounce6);
//         }

//         $(".dropdownBtn8").hover(function () {
//           $("#productAprlJrny_dropdown").fadeIn("fast");
//           clearTimeout(debounce8);
//         });
//         $(".dropdownBtn8").mouseleave(function () {
//           debounce8 = setTimeout(closeMenu8, 100);
//         });
//         $("#productAprlJrny_dropdown").mouseleave(function () {
//           debounce8 = setTimeout(closeMenu8, 100);
//         });
//         let debounce8;
//         let closeMenu8 = function () {
//           $("#productAprlJrny_dropdown").fadeOut("fast");
//           clearTimeout(debounce8);
//         }
//         //
//         $(".dropdownBtn9").hover(function () {
//           $("#campaign_dropdown").fadeIn("fast");
//           clearTimeout(debounce9);
//         });
//         $(".dropdownBtn9").mouseleave(function () {
//           debounce9 = setTimeout(closeMenu9, 100);
//         });
//         $("#campaign_dropdown").mouseleave(function () {
//           debounce9 = setTimeout(closeMenu9, 100);
//         });
//         let debounce9;
//         let closeMenu9 = function () {
//           $("#campaign_dropdown").fadeOut("fast");
//           clearTimeout(debounce9);
//         }
//       });

//     })(jQuery);
  }

//   checkSubSubPagesListShow(parentPageName: string) {
//     return this.mainPageHavingSubpages.filter(page => page === parentPageName).length > 0;
//   }


//   /**
//    * Change the language
//    * @param language language
//    */
//   changeLanguage(language) {
//     this.selectedLanguage = language;
//   }

//   /**
//    * Toggles the right sidebar
//    */
//   toggleRightSidebar() {
//     this.settingsButtonClicked.emit();
//   }

//   /**
//    * Toggle the menu bar when having mobile screen
//    */
  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

//   /**
//    * Logout the user
//    */
  logout() {
    this.commonMethod.logoutUser();
  }

//   /**
//    * Fetches the notification
//    * Note: For now returns the hard coded notifications
//    */
//   _fetchNotifications() {
//     this.notificationItems = [{
//       text: 'Caleb Flakelar commented on Admin',
//       subText: '1 min ago',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'primary',
//       redirectTo: '/notification/1'
//     },
//     {
//       text: 'New user registered.',
//       subText: '5 min ago',
//       icon: 'mdi mdi-account-plus',
//       bgColor: 'info',
//       redirectTo: '/notification/2'
//     },
//     {
//       text: 'Cristina Pride',
//       subText: 'Hi, How are you? What about our next meeting',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'success',
//       redirectTo: '/notification/3'
//     },
//     {
//       text: 'Caleb Flakelar commented on Admin',
//       subText: '2 days ago',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'danger',
//       redirectTo: '/notification/4'
//     },
//     {
//       text: 'Caleb Flakelar commented on Admin',
//       subText: '1 min ago',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'primary',
//       redirectTo: '/notification/5'
//     },
//     {
//       text: 'New user registered.',
//       subText: '5 min ago',
//       icon: 'mdi mdi-account-plus',
//       bgColor: 'info',
//       redirectTo: '/notification/6'
//     },
//     {
//       text: 'Cristina Pride',
//       subText: 'Hi, How are you? What about our next meeting',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'success',
//       redirectTo: '/notification/7'
//     },
//     {
//       text: 'Caleb Flakelar commented on Admin',
//       subText: '2 days ago',
//       icon: 'mdi mdi-comment-account-outline',
//       bgColor: 'danger',
//       redirectTo: '/notification/8'
//     }];
//   }

  getUserDetails() {

    this.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }

//   getcommercialCibilBulkUploadShowFlag(){
//     this.msmeService.getcommercialCibilBulkUploadShowFlag().subscribe(response => {
//         console.log("getcommercialCibilBulkUploawShowFlag", response)
//         if (response?.status == 200) {
//           this.isCommCibilBulkShow = response?.flag;
//         } else {
//           this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
//         }
//       });
//     }
//   getcommercialCibilBulkUploadShowFlag(){
//     this.msmeService.getcommercialCibilBulkUploadShowFlag().subscribe(response => {
//         console.log("getcommercialCibilBulkUploawShowFlag", response)
//         if (response?.status == 200) {
//           this.isCommCibilBulkShow = response?.flag;
//         } else {
//           this.commonService.errorSnackBar(!(this.commonService.isObjectNullOrEmpty(response?.message)) ? response?.message : response?.isDisplayMessage)
//         }
//       });
//     }

  // redirectToAnalysis(applicationId?, panNo?, redirectUrl?) {
  //   console.log("roleId => ", this.roleId)
  //   let cookiesObje: any = this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
  //   cookiesObje = JSON.parse(cookiesObje);
  //   cookiesObje.token = cookiesObje.tk_lg;
  //   cookiesObje.orgId = this.commonService.getStorage(Constants.httpAndCookies.ORGID, true)
  //   cookiesObje.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
  //   cookiesObje.userType = this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true);
  //   cookiesObje.campaignCode = this.commonService.getStorage(Constants.httpAndCookies.CAMPIGN_CODE, true);
  //   cookiesObje.type = 2;
  //   cookiesObje.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);

  //   cookiesObje.businessTypeId = this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true);
  //   cookiesObje.roleId = this.roleId;
  //   cookiesObje.isShowAuditView = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, true);
  //   cookiesObje.isShowNewCAMKFSButton = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_NEW_CAM_KFS_BTN, true);
  //   cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
  //   this.commonService.setStorage(Constants.httpAndCookies.ENV_ORG_ID, environment.orgId.toString());
  //   cookiesObje.environmentOrgId = environment.orgId;
  //   cookiesObje.platForm_id = environment.platFormId;
  //   if (applicationId) {
  //     cookiesObje.applicationId = applicationId;
  //   }
  //   if (panNo) {
  //     cookiesObje.panNo = panNo;
  //   }

  //   if(this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true)){
  //     cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
  //     console.log("msalAccessToken string=",true);
  //   }

  //   if (this.roleId == 9) {
  //     cookiesObje.branchId = this.commonService.getStorage('branchId', true);
  //   }
  //   this.commonService.setStorage(Constants.httpAndCookies.NEW_ROLE_ID, this.roleId);

  //   // console.log(Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj);
  //   //  window.location.href = Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj;

  //   //  window.location.href = 'http://localhost:4600' + '/hsbc/application' + '/redirect?data=' + encObj;
  //   let cookieString = JSON.stringify(cookiesObje);
  //   if (Constants.IS_LOCAL) {
  //     window.location.href = 'http://localhost:4330/redirect?data=' + this.commonService.toBTOA(cookieString);;
  //   } else {
  //     let UUID = crypto.randomUUID();
  //     this.commonService.setStorage(UUID, cookieString)
  //     window.location.href = Constants.LOCATION_URL + '/hsbc/application' + '/redirect?data=' + this.commonService.toBTOA(UUID);
  //   }

  // }


  // //analytics
  // removeValue(activeTab: string) {
  //   this.isGstTabActive = false;
  //   this.isBsTabActive = false;
  //   this.isEximTabActive = false;
  //   this.isCommercialActive = false;
  //   this.isConsumerActive = false;

  //   // Activate the specified tab dynamically
  //   if (activeTab === 'isGstTabActive') this.isGstTabActive = true;
  //   if (activeTab === 'isBsTabActive') this.isBsTabActive = true;
  //   if (activeTab === 'isEximTabActive') this.isEximTabActive = true;
  //   if (activeTab === 'isCommercialActive') this.isCommercialActive = true;
  //   if (activeTab === 'isConsumerActive') this.isConsumerActive = true;

  //   this.commonService.removeStorage("commrcial_pan");
  //   this.commonService.removeStorage("consumer_pan");
  //   this.commonService.removeStorage("gst_pan");
  //   this.commonService.removeStorage("bs_pan");
  //   this.commonService.removeStorage("exim_pan");
  //   this.commonService.removeStorage("exim_search_by");
  //   this.commonService.removeStorage("existing_pan");
  // }

  // onChange(url?) {
  //   if (!url) {
  //     url = this.router.url;
  //   }
  // }

  // isAnalyticsDropdownOpen = false;

  // toggleAnalyticsDropdown() {
  //   this.isAnalyticsDropdownOpen = !this.isAnalyticsDropdownOpen;
  // }

  // closeDropdown1() {
  //   this.isAnalyticsDropdownOpen = false;
  // }

  // isDropdownOpen = false;

  // toggleDropdown() {
  //   this.isDropdownOpen = !this.isDropdownOpen;
  //   console.log('Dropdown Toggled:', this.isDropdownOpen);  // Debugging log
  // }

  // @HostListener('document:click', ['$event.target'])
  // closeDropdown(event: HTMLElement) {
  //   const isInsideClick = event.closest('.dropdownBtn');
  //   if (!isInsideClick) {
  //     this.isDropdownOpen = false;
  //     console.log('Dropdown Closed from Outside');
  //   }
  // }

  // getUserPermissionData(){
  //   if(this.roleId && this.userId){

  //     // this.msmeService.getUserPermission(this.userId,this.roleId).subscribe(response => {
  //     let response:any = this.pageData;
  //       console.log("um response", response)
  //       localStorage.setItem("pages", JSON.stringify(response))
  //       if (response) {
  //         const pageOrderMap = new Map(this.pageMaster.map((item, index) => [item.pageId, index]));
  //         response.sort((a, b) => {
  //           const orderA = pageOrderMap.get(a.pageId) ?? Infinity;
  //           const orderB = pageOrderMap.get(b.pageId) ?? Infinity;
  //           return orderA - orderB;
  //       });

  //       // this.pageData = response;
  //         for(let data of this.pageData){
  //           if(data.pageId == Constants.pageMaster.ANALYTICS2){
  //             this.analytics = true;
  //             this.anaSubPage = data.subpages;
  //           }
	// 		    if(data.pageId == Constants.pageMaster.USER_MANAGEMENT){
  //             this.muser = true;
  //             this.muserSubPage = data.subpages;
  //             console.log(this.muserSubPage);
  //           }
  //           if(data.pageId == Constants.pageMaster.BULK_UPLOAD){
  //             this.bulkUp = true;
  //             this.bulkUploadLinks = data.subpages;
  //             console.log('bulk upload links: ',this.bulkUploadLinks);
  //             console.log('....');
  //           }
  //           if(data.pageId == Constants.pageMaster.PORTFOLIO){
  //             this.portfolio = true;
  //             this.portfolioLink = data.subpages;
  //             console.log(this.portfolioLink);
  //           }
  //           if(data.pageId == Constants.pageMaster.PORTFOLIO_ANALYSIS){
  //             this.portfolioAnalysis = true;
  //             this.portfolioAnalysisLinks = data.subpages;
  //             console.log(this.portfolioAnalysisLinks);
  //           }

  //           if(data.pageId == Constants.pageMaster.MONITORING){
  //             this.monitoring = true;
  //             this.monitoringLinks = data.subpages;
  //             console.log(this.monitoringLinks);
  //           }

  //           if(data.pageId == Constants.pageMaster.PRODUCT_APPROVAL_JOURNEY){
  //             this.productAprlJrny = true;
  //             this.productAprlJrnyLinks = data.subpages;
  //           }
  //            if(data.pageId == Constants.pageMaster.CAMPAIGN_DASHBOARD){
  //             this.campaigndashboard = true;
  //             this.campaigndashboardSubPage = data.subpages;
  //             console.log("this.campaigndashboardSubPage",this.campaigndashboardSubPage);
  //           }
  //         }
  //         for (let subpage of this.anaSubPage) {
  //               const validPageIds = new Set([
  //                 Constants.pageMaster.GST_ANALYSIS2,
  //                 Constants.pageMaster.BANK_STATEMENT_ANALYSIS2,
  //                 Constants.pageMaster.EXIM_ANALYSIS2
  //             ]);

  //             // Convert subpageId to string and check if it's in the validPageIds set
  //             const id = subpage.subpageId;
  //             // Check if the id exists in the set of valid page IDs
  //             if (validPageIds.has(id)) {
  //                 this.analysisLinks.push(subpage);
  //                 for (let link of this.analysisLinks) {
  //                   const matchingMenu = this.menuMap.get(link.subpageId);
  //                   if (matchingMenu) {
  //                     link.icon = matchingMenu.icon;
  //                     link.tabKey = matchingMenu.tabKey;
  //                   }
  //              }
  //           }
  //             if (id === Constants.pageMaster.COMMERCIAL_BUREAU2 || id === Constants.pageMaster.CONSUMER_BUREAU2) {
  //                 this.bureauLinks.push(subpage);
  //                 for (let link of this.bureauLinks) {
  //                   const matchingMenu = this.menuMap.get(link.subpageId);
  //                   if (matchingMenu) {
  //                     link.icon = matchingMenu.icon;
  //                     link.tabKey = matchingMenu.tabKey;
  //                   }
  //              }
  //             }
  //             if(id===Constants.pageMaster.EXIM_DATA || id===Constants.pageMaster.CUSTOMER_MASTER || id===Constants.pageMaster.CUSTOMER_SEG_BULK_UPLOAD)
  //             {
  //               this.bulkUploadLinks.push(subpage);
  //             }
  //       }


  //         console.log('analysis link ==>',this.analysisLinks);
  //         console.log('Bureau link ==>',this.bureauLinks);
  //         console.log('bulkUploadLinks link ==>',this.bulkUploadLinks);
  //       } else {
  //         this.commonService.errorSnackBar('Error while getting user permission')
  //       }
  //     // })
  //   } else {
  //     console.log("User id and Role Should Exist");
  //   }
  // }

  // resetActiveFlags(link:any) {
  //   let activeTab = link.tabKey;
  //   this.activeTab = activeTab;
  //   this.isGstTabActive = false;
  //   this.isBsTabActive = false;
  //   this.isEximTabActive = false;
  //   this.isCommercialActive = false;
  //   this.isConsumerActive = false;

  //   if (activeTab === 'isGstTabActive') this.isGstTabActive = true;
  //   if (activeTab === 'isBsTabActive') this.isBsTabActive = true;
  //   if (activeTab === 'isEximTabActive') this.isEximTabActive = true;
  //   if (activeTab === 'isCommercialActive') this.isCommercialActive = true;
  //   if (activeTab === 'isConsumerActive') this.isConsumerActive = true;

  //   console.log( this.activeTab +':::'+
  //     this.isGstTabActive +':::'+
  //     this.isBsTabActive+':::'+
  //     this.isEximTabActive+':::'+
  //     this.isCommercialActive+':::'+
  //     this.isConsumerActive)

  //   this.commonService.removeStorage("commrcial_pan");
  //   this.commonService.removeStorage("consumer_pan");
  //   this.commonService.removeStorage("gst_pan");
  //   this.commonService.removeStorage("bs_pan");
  //   this.commonService.removeStorage("exim_pan");
  //   this.commonService.removeStorage("exim_search_by");
  //   this.commonService.removeStorage("existing_pan");
  //   this.commonService.removeStorage("pr_commercial_pan");
	// 	this.commonService.removeStorage("from_pr_dashboard");


  //   if(link?.subpageName && link?.subpageName == "GTS - Receivable Finance") {
  //     this.commonService.redirectToBankerModule(link.routeLink);
  //   }
  //   else {
  //     this.router.navigate([link.routeLink], {
  //       state: { data: link }
  //   });
  // }


// }

// navigateToPage(pageData: any) {
//     this.router.navigate([pageData.routeLink], {
//         state: { data: pageData }
//     });
// }

//   redirectToAnalysis(applicationId?, panNo?, redirectUrl?) {
//     console.log("roleId => ", this.roleId)
//     let cookiesObje: any = this.commonService.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
//     cookiesObje = JSON.parse(cookiesObje);
//     cookiesObje.token = cookiesObje.tk_lg;
//     cookiesObje.orgId = this.commonService.getStorage(Constants.httpAndCookies.ORGID, true)
//     cookiesObje.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
//     cookiesObje.userType = this.commonService.getStorage(Constants.httpAndCookies.USERTYPE, true);
//     cookiesObje.campaignCode = this.commonService.getStorage(Constants.httpAndCookies.CAMPIGN_CODE, true);
//     cookiesObje.type = 2;
//     cookiesObje.userName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);

//     cookiesObje.businessTypeId = this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true);
//     cookiesObje.roleId = this.roleId;
//     cookiesObje.isShowAuditView = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_AUDIT_API, true);
//     cookiesObje.isShowNewCAMKFSButton = this.commonService.getStorage(Constants.httpAndCookies.IS_SHOW_NEW_CAM_KFS_BTN, true);
//     cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
//     this.commonService.setStorage(Constants.httpAndCookies.ENV_ORG_ID, environment.orgId.toString());
//     cookiesObje.environmentOrgId = environment.orgId;
//     cookiesObje.platForm_id = environment.platFormId;
//     if (applicationId) {
//       cookiesObje.applicationId = applicationId;
//     }
//     if (panNo) {
//       cookiesObje.panNo = panNo;
//     }

//     if(this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true)){
//       cookiesObje.msalAccessToken = this.commonService.getStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN, true);
//       console.log("msalAccessToken string=",true);
//     }

//     if (this.roleId == 9) {
//       cookiesObje.branchId = this.commonService.getStorage('branchId', true);
//     }
//     this.commonService.setStorage(Constants.httpAndCookies.NEW_ROLE_ID, this.roleId);

//     // console.log(Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj);
//     //  window.location.href = Constants.LOCATION_URL + '/hsbc/application' +  '/redirect?data=' + encObj;

//     //  window.location.href = 'http://localhost:4600' + '/hsbc/application' + '/redirect?data=' + encObj;
//     let cookieString = JSON.stringify(cookiesObje);
//     if (Constants.IS_LOCAL) {
//       window.location.href = 'http://localhost:4330/redirect?data=' + this.commonService.toBTOA(cookieString);;
//     } else {
//       let UUID = crypto.randomUUID();
//       this.commonService.setStorage(UUID, cookieString)
//       window.location.href = Constants.LOCATION_URL + '/hsbc/application' + '/redirect?data=' + this.commonService.toBTOA(UUID);
//     }

//   }


//   //analytics
//   removeValue(activeTab: string) {
//     this.isGstTabActive = false;
//     this.isBsTabActive = false;
//     this.isEximTabActive = false;
//     this.isCommercialActive = false;
//     this.isConsumerActive = false;

//     // Activate the specified tab dynamically
//     if (activeTab === 'isGstTabActive') this.isGstTabActive = true;
//     if (activeTab === 'isBsTabActive') this.isBsTabActive = true;
//     if (activeTab === 'isEximTabActive') this.isEximTabActive = true;
//     if (activeTab === 'isCommercialActive') this.isCommercialActive = true;
//     if (activeTab === 'isConsumerActive') this.isConsumerActive = true;

//     this.commonService.removeStorage("commrcial_pan");
//     this.commonService.removeStorage("consumer_pan");
//     this.commonService.removeStorage("gst_pan");
//     this.commonService.removeStorage("bs_pan");
//     this.commonService.removeStorage("exim_pan");
//     this.commonService.removeStorage("exim_search_by");
//     this.commonService.removeStorage("existing_pan");
//   }

//   onChange(url?) {
//     if (!url) {
//       url = this.router.url;
//     }
//   }

//   isAnalyticsDropdownOpen = false;

//   toggleAnalyticsDropdown() {
//     this.isAnalyticsDropdownOpen = !this.isAnalyticsDropdownOpen;
//   }

//   closeDropdown1() {
//     this.isAnalyticsDropdownOpen = false;
//   }

//   isDropdownOpen = false;

//   toggleDropdown() {
//     this.isDropdownOpen = !this.isDropdownOpen;
//     console.log('Dropdown Toggled:', this.isDropdownOpen);  // Debugging log
//   }

//   @HostListener('document:click', ['$event.target'])
//   closeDropdown(event: HTMLElement) {
//     const isInsideClick = event.closest('.dropdownBtn');
//     if (!isInsideClick) {
//       this.isDropdownOpen = false;
//       console.log('Dropdown Closed from Outside');
//     }
//   }

//   getUserPermissionData(){
//     if(this.roleId && this.userId){

//       // this.msmeService.getUserPermission(this.userId,this.roleId).subscribe(response => {
//       let response:any = this.pageData;
//         console.log("um response", response)
//         localStorage.setItem("pages", JSON.stringify(response))
//         if (response) {
//           const pageOrderMap = new Map(this.pageMaster.map((item, index) => [item.pageId, index]));
//           response.sort((a, b) => {
//             const orderA = pageOrderMap.get(a.pageId) ?? Infinity;
//             const orderB = pageOrderMap.get(b.pageId) ?? Infinity;
//             return orderA - orderB;
//         });

//         // this.pageData = response;
//           for(let data of this.pageData){
//             if(data.pageId == Constants.pageMaster.ANALYTICS2){
//               this.analytics = true;
//               this.anaSubPage = data.subpages;
//             }
// 			    if(data.pageId == Constants.pageMaster.USER_MANAGEMENT){
//               this.muser = true;
//               this.muserSubPage = data.subpages;
//               console.log(this.muserSubPage);
//             }
//             if(data.pageId == Constants.pageMaster.BULK_UPLOAD){
//               this.bulkUp = true;
//               this.bulkUploadLinks = data.subpages;
//               console.log('bulk upload links: ',this.bulkUploadLinks);
//               console.log('....');
//             }
//             if(data.pageId == Constants.pageMaster.PORTFOLIO){
//               this.portfolio = true;
//               this.portfolioLink = data.subpages;
//               console.log(this.portfolioLink);
//             }
//             if(data.pageId == Constants.pageMaster.PORTFOLIO_ANALYSIS){
//               this.portfolioAnalysis = true;
//               this.portfolioAnalysisLinks = data.subpages;
//               console.log(this.portfolioAnalysisLinks);
//             }

//             if(data.pageId == Constants.pageMaster.MONITORING){
//               this.monitoring = true;
//               this.monitoringLinks = data.subpages;
//               console.log(this.monitoringLinks);
//             }

//             if(data.pageId == Constants.pageMaster.PRODUCT_APPROVAL_JOURNEY){
//               this.productAprlJrny = true;
//               this.productAprlJrnyLinks = data.subpages;
//             }
//              if(data.pageId == Constants.pageMaster.CAMPAIGN_DASHBOARD){
//               this.campaigndashboard = true;
//               this.campaigndashboardSubPage = data.subpages;
//               console.log("this.campaigndashboardSubPage",this.campaigndashboardSubPage);
//             }
//           }
//           for (let subpage of this.anaSubPage) {
//                 const validPageIds = new Set([
//                   Constants.pageMaster.GST_ANALYSIS2,
//                   Constants.pageMaster.BANK_STATEMENT_ANALYSIS2,
//                   Constants.pageMaster.EXIM_ANALYSIS2
//               ]);

//               // Convert subpageId to string and check if it's in the validPageIds set
//               const id = subpage.subpageId;
//               // Check if the id exists in the set of valid page IDs
//               if (validPageIds.has(id)) {
//                   this.analysisLinks.push(subpage);
//                   for (let link of this.analysisLinks) {
//                     const matchingMenu = this.menuMap.get(link.subpageId);
//                     if (matchingMenu) {
//                       link.icon = matchingMenu.icon;
//                       link.tabKey = matchingMenu.tabKey;
//                     }
//                }
//             }
//               if (id === Constants.pageMaster.COMMERCIAL_BUREAU2 || id === Constants.pageMaster.CONSUMER_BUREAU2) {
//                   this.bureauLinks.push(subpage);
//                   for (let link of this.bureauLinks) {
//                     const matchingMenu = this.menuMap.get(link.subpageId);
//                     if (matchingMenu) {
//                       link.icon = matchingMenu.icon;
//                       link.tabKey = matchingMenu.tabKey;
//                     }
//                }
//               }
//               if(id===Constants.pageMaster.EXIM_DATA || id===Constants.pageMaster.CUSTOMER_MASTER || id===Constants.pageMaster.CUSTOMER_SEG_BULK_UPLOAD)
//               {
//                 this.bulkUploadLinks.push(subpage);
//               }
//         }


//           console.log('analysis link ==>',this.analysisLinks);
//           console.log('Bureau link ==>',this.bureauLinks);
//           console.log('bulkUploadLinks link ==>',this.bulkUploadLinks);
//         } else {
//           this.commonService.errorSnackBar('Error while getting user permission')
//         }
//       // })
//     } else {
//       console.log("User id and Role Should Exist");
//     }
//   }

//   resetActiveFlags(link:any) {
//     let activeTab = link.tabKey;
//     this.activeTab = activeTab;
//     this.isGstTabActive = false;
//     this.isBsTabActive = false;
//     this.isEximTabActive = false;
//     this.isCommercialActive = false;
//     this.isConsumerActive = false;

//     if (activeTab === 'isGstTabActive') this.isGstTabActive = true;
//     if (activeTab === 'isBsTabActive') this.isBsTabActive = true;
//     if (activeTab === 'isEximTabActive') this.isEximTabActive = true;
//     if (activeTab === 'isCommercialActive') this.isCommercialActive = true;
//     if (activeTab === 'isConsumerActive') this.isConsumerActive = true;

//     console.log( this.activeTab +':::'+
//       this.isGstTabActive +':::'+
//       this.isBsTabActive+':::'+
//       this.isEximTabActive+':::'+
//       this.isCommercialActive+':::'+
//       this.isConsumerActive)

//     this.commonService.removeStorage("commrcial_pan");
//     this.commonService.removeStorage("consumer_pan");
//     this.commonService.removeStorage("gst_pan");
//     this.commonService.removeStorage("bs_pan");
//     this.commonService.removeStorage("exim_pan");
//     this.commonService.removeStorage("exim_search_by");
//     this.commonService.removeStorage("existing_pan");


//     if(link?.subpageName && link?.subpageName == "GTS - Receivable Finance") {
//       this.commonService.redirectToBankerModule(link.routeLink);
//     }
//     else {
//       this.router.navigate([link.routeLink], {
//         state: { data: link }
//     });
//   }


// }

// // navigateToPage(pageData: any) {
// //     this.router.navigate([pageData.routeLink], {
// //         state: { data: pageData }
// //     });
// // }

//   // header fixed S
//   @HostListener('window:scroll', [])
//   onWindowScroll() {
//     this.scrolled = window.scrollY > 100;
//   }
//   // header fixed S

//   notificationPopup(): void {
//     const dialogRef = this.dialog.open(NotificationPopupComponent, {
//       panelClass: ['popupMain_design', 'right_side_popup'],
//       data: {
//        }
//     });
//   }
  notificationPopup(): void {

    this.unreadCount = 0;
    const dialogRef = this.dialog.open(NotificationPopupComponent, {
      panelClass: ['popupMain_design', 'right_side_popup'],
      data: {
        notificationData: this.notificationData,
      }
    });


  }

  unreadCount: number = 0;

  // Helper method to check if user has permission for a specific page/subpage
  hasPagePermission(pageId: number, actionId: number): boolean {
    if (!this.pageData || !Array.isArray(this.pageData)) {
      return false;
    }

    // Search through all pages
    for (const page of this.pageData) {
      // Check if this is the target page
      if (page.pageId === pageId) {
        // Check if page has the required action
        if (page.actions && Array.isArray(page.actions)) {
          return page.actions.some(action => action.actionId === actionId);
        }
        return false;
      }

      // Check in subpages
      if (page.subpages && Array.isArray(page.subpages)) {
        for (const subpage of page.subpages) {
          if (subpage.subpageId === pageId) {
            if (subpage.actions && Array.isArray(subpage.actions)) {
              return subpage.actions.some(action => action.actionId === actionId);
            }
            return false;
          }

          // Check in subSubpages
          if (subpage.subSubpages && Array.isArray(subpage.subSubpages)) {
            for (const subSubpage of subpage.subSubpages) {
              if (subSubpage.subpageId === pageId) {
                if (subSubpage.actions && Array.isArray(subSubpage.actions)) {
                  return subSubpage.actions.some(action => action.actionId === actionId);
                }
                return false;
              }
            }
          }
        }
      }
    }

    return false;
  }
// isActionAvail(actionId: string): boolean {
//     for (let page of this.pageData?.actions) {
//         if (page?.actionId === actionId) {
//             return true; // Return true if found
//         }
//     }
//     return false; // Return false if not found
//   }
  getNotificationDataForUser() {
    const data = {
      userId: String(this.userId),
      roleType: String(this.roleType),
    }
    this.msmeService.getNotificationDataForUser(data).subscribe({
      next: (response) => {
        console.log("getNotificationDataForUser", response);

        if (response?.status === 200) {
          this.notificationData = response?.data;
          if (Array.isArray(this.notificationData)) {
            this.unreadCount = this.notificationData.filter(n => !n.isRead).length;
          }
        } else {
          this.commonService.errorSnackBar(response?.message);
        }
      },
      error: (error) => {
        console.error("API Error:", error);
        this.commonService.errorSnackBar(error?.error?.message || 'Something went wrong. Please try again.');
      }
    });
  }
  ngOnDestroy(): void {
    this.leftMenuStateSub?.unsubscribe();
  }

 
  onTopbarAreaClick(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.add('closeLeftmenu');
      this.leftMenuState.setOpenedByButton(false);
      this.leftMenuState.notifyStateChanged();
    }
  }

  toggleLeftMen(event: any): void {
    event.preventDefault();
    event.stopPropagation();
    if (typeof document === 'undefined') return;
    const isCurrentlyClosed = document.body.classList.contains('closeLeftmenu');
    if (isCurrentlyClosed) {
      document.body.classList.remove('closeLeftmenu');
      this.leftMenuState.setOpenedByButton(true);
    } else {
      document.body.classList.add('closeLeftmenu');
      this.leftMenuState.setOpenedByButton(false);
    }
    this.leftMenuState.notifyStateChanged();
  }
}
