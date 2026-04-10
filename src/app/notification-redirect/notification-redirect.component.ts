import { Component, Injectable, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { GlobalHeaders, saveActivity } from '../CommoUtils/global-headers';
import { CommonService } from '../CommoUtils/common-services/common.service';
import { Constants } from '../CommoUtils/constants';

@Component({
  selector: 'app-notification-redirect',
  standalone: false,
  templateUrl: './notification-redirect.component.html',
  styleUrl: './notification-redirect.component.scss'
})
@Injectable({ providedIn: 'root' })
export class NotificationRedirectComponent implements OnInit {
  pageData: any;

  constructor(private commonService:CommonService, private router:Router){}

  ngOnInit(): void {
  }

  processNotificationRedirectRequest(route: ActivatedRouteSnapshot, storageData: any): void {
    // this.pageData = JSON.parse(this.commonService.getStorage(Constants.httpAndCookies.US_PR, true));
    this.pageData = this.commonService.getPageData(Constants.pageMaster.PORTFOLIO_NEW, Constants.pageMaster.EXISTING_PORTFOLIO)
    
    const notificationredirect = route?.queryParams || storageData;
    
    if (this.commonService.isObjectNullOrEmpty(this.pageData)) {
      this.commonService.clearStorageAndMoveToLogin(true);
      this.commonService.setStorageAesEncryption('notificationredirect', JSON.stringify(notificationredirect));
      return;
    }
    
    this.commonService.removeStorage('notificationredirect');
    
    GlobalHeaders['x-main-page'] = notificationredirect['mainPage'];
    GlobalHeaders['x-page-data'] = notificationredirect['pan'];
    GlobalHeaders['x-page-action'] = notificationredirect['pageName'];  
    saveActivity(() => {});
    
    this.router.navigate([notificationredirect.path], {
      state: {
        routerData: { cin: notificationredirect.cin, pan: notificationredirect.pan, tabId: Number(notificationredirect.tabId), tabLabel: notificationredirect.tabLabel },
        data: this.pageData,
        dataFrom: this.pageData
      }
    });
  }
}