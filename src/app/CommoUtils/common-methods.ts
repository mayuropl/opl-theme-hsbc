import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Constants } from './constants';
import { ObjectModel } from './model/object-model';
import { MsmeService } from '../services/msme.service';
import { CommonService } from './common-services/common.service';
import { UntypedFormGroup } from '@angular/forms';
import { IndNumFormatPipe } from './pipe/ind-num-format.pipe';
import { RestUrl } from './resturl';
import { SnackbarService } from './common-services/SnackbarService';
import * as _ from 'lodash';
import {clearCookie, GlobalHeaders, resetGlobalHeaders} from './global-headers';
import { ProspectsFilterStorageService } from '../services/prospect-filter-storage.service';
import { environment } from 'src/environments/environment';


@Injectable()
export class CommonMethods {
    validationsobj: any;
    validations: any;
  pageMaster = [
    { pageId: 1, pageName: "Existing Portfolio" },
    { pageId: 23, pageName: "Targets and prospects" },
    { pageId: 35, pageName: "Pre Approved Products" },
    { pageId: 38, pageName: "Configurations" },
    { pageId: 47, pageName: "User Management" },
    { pageId: 51, pageName: "Bulk Upload" },
    { pageId: 39, pageName: "Analytics" }
  ];
    constructor(private router: Router, private msmeService: MsmeService, private commonservice: CommonService,private snackbar: SnackbarService,
      private prospectsfilterStorageService: ProspectsFilterStorageService) { }

    goToSelectModule() {
        this.router.navigate([Constants.ROUTE_URL.MODULE_SELECT]);
    }

    // getAllValidations() {
    //     this.msmeService.getValidarions(Constants.BussinessType.EXISTING_BUSINESS).subscribe(res => {
    //         if (res.status === 200) {
    //             this.validationsobj = JSON.parse(res.data);
    //             this.commonservice.setStorage('validations', JSON.stringify(this.validationsobj));
    //         }
    //     }, error => {
    //         console.log(error);
    //     });
    // }

    getValidationByModule(moduleName) {
        const listdata = JSON.parse(this.commonservice.getStorage('validations', true)) as any;
        this.validations = listdata.filter(option => option.module.startsWith(moduleName));
        if (this.validations[0].fieldList != null) {
            this.commonservice.setStorage('module_val', JSON.stringify(this.validations[0].fieldList));
        } else {
            this.commonservice.setStorage('module_val', null);
        }
    }


    getValidations(labelOrKeyName: string): Array<ObjectModel> {
        const listdata = JSON.parse(this.commonservice.getStorage('module_val', true)) as any;
        if (!this.commonservice.isObjectNullOrEmpty(listdata)) {
            const fieldValidations = listdata.filter(option => option.label.startsWith(labelOrKeyName));
            if (fieldValidations != null || fieldValidations !== undefined) {
                if (fieldValidations[0] != null || fieldValidations[0] !== undefined) {
                    return fieldValidations[0].validations;
                }
            }
        }
        return [];
    }

    getErrorMessage(labelOrKeyName: string, propertyName): string {
        const listdata = JSON.parse(this.commonservice.getStorage('module_val', true)) as any;
        if (!this.commonservice.isObjectNullOrEmpty(listdata)) {
            const fieldValidations = listdata.filter(option => option.label.startsWith(labelOrKeyName));
            if (fieldValidations != null || fieldValidations !== undefined) {
                if (fieldValidations[0] != null || fieldValidations[0] !== undefined) {
                    const errormsgObj = fieldValidations[0].validations.filter(msg => msg.key === propertyName)[0];
                    return errormsgObj !== undefined ? errormsgObj.errorMassage : null;
                }
            }
        }
        return null;
    }

    currencyMaskInput(formName: UntypedFormGroup, formControlName) {
        if (!this.commonservice.isObjectNullOrEmpty(formName.controls[formControlName].value)) {
            const value = new IndNumFormatPipe().transform(formName.controls[formControlName].value.replace(/,/g, ''));
            formName.controls[formControlName].patchValue(value);
        }
    }

    currencyMaskForObject(obj: string) {
        if (!this.commonservice.isObjectNullOrEmpty(obj) && obj != undefined) {
            return new IndNumFormatPipe().transform(obj.toString().replace(/,/g, ''));
        }
    }
    moveBackToplatForm(){
        const cookies = JSON.parse( this.commonservice.getStorage(Constants.httpAndCookies.COOKIES_OBJ,true));
        if(cookies == null){
          window.location.href = RestUrl.LENDER_LOGIN_URL;
        }else{
          var data = {
            token : cookies[Constants.httpAndCookies.LGTK]
          };
          var incrypt = btoa(JSON.stringify(data))
          // const cwURL = RestUrl.REDIRECT_URL_CW_ANGULAR;
          const cwURL = window.location.protocol + "//" + window.location.host + "/selectBankerDashboard";
         //const cwURL = 'http://localhost:1001' + "/selectBankerDashboard/redirect?data=";
          //console.log("----------------------------------------------   URL => ",cwURL.concat(incrypt));
        //   this.commonservice.removeStorage(Constants.httpAndCookies.USERTYPE);
        //   this.commonservice.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
        //   this.commonservice.removeStorage(Constants.httpAndCookies.ORGID);
        //   this.commonservice.removeStorage(Constants.httpAndCookies.ROLEID);
          window.location.href = cwURL;
        }
        //console.log("cookies",cookies)
      }

    logoutUser() {
        if (environment.staticDemo) {
          return;
        }
        // For Logout
         resetGlobalHeaders();
         GlobalHeaders['x-page-action'] = 'logout';
         GlobalHeaders['x-path-url'] = '/logoutUser';
         GlobalHeaders['x-main-page'] = 'Logout';
        this.msmeService.logoutUser().subscribe(res => {
            if (res.status === 200) {
                this.commonservice.successSnackBar(res.message);
            } else {
                this.commonservice.errorSnackBar(res.message);
            }
        }, error => {
            this.commonservice.errorSnackBar(error);
        });
        this.commonservice.removeStorage(Constants.FILTER_JSON_EXISTING);
        this.commonservice.removeStorage(Constants.SELECTED_COLUMNS_EXISTING);
        this.commonservice.removeStorage(Constants.SELECTED_COLUMNS_TARGET);
        this.commonservice.removeStorage(Constants.SELECTED_COLUMNS_FIND_PROSPECT);
        this.commonservice.removeStorage(Constants.FILTER_LIST_MASTER_EXISTING);
        this.commonservice.removeStorage(Constants.FILTER_JSON_TARGET);
        this.commonservice.removeStorage(Constants.FILTER_JSON_FIND_PROSPECT);
        this.commonservice.removeStorage(Constants.FILTER_LIST_MASTER_TARGET);
        this.commonservice.removeStorage(Constants.CLEAN_FILTER_LIST_MASTER);
        this.commonservice.removeStorage(Constants.TOP_BAR_FILTER_LIST_EXISTING);
        this.commonservice.removeStorage(Constants.TOP_BAR_FILTER_LIST_TARGET);
        this.commonservice.removeStorage(Constants.TOP_BAR_FILTER_LIST_FIND_PROSPECT);
        this.commonservice.removeStorage(Constants.FILTER_LIST_MASTER_PROSPECTS);
        // Clear hierarchy filter states
        this.commonservice.removeStorage(Constants.HIERARCHY_FILTER_EXISTING);
        this.commonservice.removeStorage(Constants.HIERARCHY_FILTER_TARGET);
        this.commonservice.removeStorage(Constants.HIERARCHY_FILTER_WALLET);
        this.prospectsfilterStorageService.clearAllFilterStates();
        this.commonservice.removeStorage(Constants.httpAndCookies.USERTYPE);
        this.commonservice.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
        this.commonservice.removeStorage(Constants.httpAndCookies.ORGID);
        this.commonservice.removeStorage(Constants.httpAndCookies.ROLEID);
        this.commonservice.removeStorage(Constants.httpAndCookies.TABID);
        this.commonservice.removeStorage(Constants.httpAndCookies.USER_NAME);
        this.commonservice.removeStorage(Constants.httpAndCookies.MSAL_ACCESS_TOKEN);
        this.commonservice.removeStorage(Constants.httpAndCookies.NEW_ROLE_ID);
        this.commonservice.removeStorage(Constants.httpAndCookies.CMP_SEARCH_DATA);
        this.commonservice.removeStorage(Constants.httpAndCookies.US_PR);
        this.commonservice.removeStorage(Constants.httpAndCookies.PR_DASHBOARD_FILTER_DATA_SUMMARY);
        this.commonservice.removeStorage(Constants.httpAndCookies.PR_DASHBOARD_FILTER_DATA_COMPARISON);


        clearCookie();
        localStorage.clear();
        window.location.href = RestUrl.LENDER_LOGIN_URL;
    }
    pageRefresh() {
        location.reload();
    }
    public copyToClipBoard(data, isJson?) {
        if (data) {
            const adminPermissionList = _.split(this.commonservice.getStorage('AdminPermission', true), ',');
            const index: number = adminPermissionList.indexOf('IS_COPY');
            document.addEventListener('copy', (e: ClipboardEvent) => {
                e.clipboardData.setData('text/plain', isJson ? JSON.stringify(data) : (index != -1) ? data : '');
                e.preventDefault();
                document.removeEventListener('copy', null);
            });
            document.execCommand('copy');
            isJson ? this.successSnackBar("String Copied") : (index != -1) ? this.successSnackBar("Copied") : undefined;
        }
        else {
            this.warningSnackBar("data not Found")
        }
    }

    successSnackBar(message: any, action?: any): any {
        this.snackbar.openSnackBar(message, action, 'success');
    }
    warningSnackBar(message: any, action?: any): any {
        this.snackbar.openSnackBar(message, action, 'warning');
    }

    // updateStage(object) {
    //     this.msmeService.updateStage(object).subscribe(res => {
    //         if (res.status === 200) {
    //          this.commonservice.successSnackBar(res.message);
    //          // call getstage method and redirect to next page
    //         } else {
    //             this.commonservice.errorSnackBar(res.message);
    //         }
    //     }, error => {
    //         this.commonservice.errorSnackBar(error);
    //     });
    // }

  getUserPermissionData(userId?: any, roleId?: any, pageId?: any, callback?: (data: any) => void) {
    this.msmeService.getUserPermissionByPageIdAsync(userId, roleId, pageId).subscribe(
      (response) => {
        console.log('API response', response);
        if (response) {
          callback?.(response); // Pass the response to the callback
        } else {
          this.commonservice.errorSnackBar('Error while getting user permission');
        }
      },
      (error) => {
        console.error('Error:', error);
        this.commonservice.errorSnackBar('Error while getting user permission');
      }
    );
  }

  convertDaysToReadableFormat(days: number): string {
    if (!days || days <= 0) return '0 days';
    
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    
    if (months === 0) {
      return `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    } else if (remainingDays === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return `${months} month${months !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
  }
}
