import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from '../constants';
import { RootScopeService } from './root-scope.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RestUrl } from 'src/app/CommoUtils/resturl';
import { AesGcmEncryptionService } from './aes-gcm-encryption.service';
import {
  findSubpageData,
  isActionAvailable,
  isSubpageExists
} from '../subpage-permission.helpers';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  allDemoPageActions,
  demoSubSubpagesAll,
} from '../static-demo/static-demo-permissions';
import { map } from 'rxjs/operators';
/**
 * Common services common methods for multiple time use
 */
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  customerInActiveForCurrPage: boolean[] = [false, false, false, false, false, false];
  
  data: any;
  constructor(private modalService: NgbModal, private rootScope: RootScopeService,private http: HttpClient,
              private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private dialog: MatDialog) { this.loadToggleState(); }

  setData(data: any) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  /**
   * For check null,empty and undefined
   */
  isObjectNullOrEmpty(data: any) {
    return (data == null || data === undefined || data === '' || data === 'null' || data === 'undefined' ||
      data === '');
  }

  isObjectNullOrEmptyWithTrim(data: any) {
    return (data == null || data === undefined || data === '' || data === 'null' || data === 'undefined' ||
      (typeof data === 'string' && data.trim() === ''));
  }

  // isObjectNullOrEmpty(data: any) {
  //   return (data == null || data === undefined || data === '' || data === 'null' || data === 'undefined' ||
  //     data === '' || data === [] || data === {});
  // }

  isObjectIsEmpty(data: any) {
    return data && Object.keys(data).length <= 0;
  }

  /**
   * for convert value(encrypt)
   */
  toBTOA(value: string) {
    try {
      return btoa(value);
    } catch (err) {
      console.log('error while btoa convert');
    }
  }

   decryptFuntion(request) {
    if (Constants.IS_ENCRYPTION && !this.isObjectNullOrEmpty(request)) {
     return AesGcmEncryptionService.getDecPayload(request);
    }
    return request;
  }

  encryptText(request: object): string {
    if(!this.isObjectNullOrEmpty(request)){
      return AesGcmEncryptionService.getEncPayload(request.toString());
    }
    return null;
  }

  /**
   * Decrypt value
   */
  toATOB(value: string) {
    try {
      return atob(value);
    } catch (err) {
      console.log('error while atob convert');
    }
  }

  /**
   * Get value from storage
   */
  getStorage(key: string, decrypt: boolean) {
    const data = localStorage.getItem(key);
    if (this.isObjectNullOrEmpty(data)) {
      return data;
    }
    if (decrypt) {
      const decryptdata = this.toATOB(data);
      return this.isObjectIsEmpty(decryptdata) ? null : decryptdata;
    }
    return data;
  }

  getStorageAesEncryption(key){
    const data = localStorage.getItem(key);
    if (!this.isObjectNullOrEmpty(data)) {
      return this.decryptFunction(data);
    }
    return data;
  }

  setStorageAesEncryption(key,value){
    localStorage.setItem(key, this.encryptFunction(value));
  }

  /**
   * set value in storage
   */
  setStorage(key: any, value: string) {
    localStorage.setItem(key, this.toBTOA(value));
  }

  /**
   * Remove value from storage
   */
  removeStorage(key: any) {
    localStorage.removeItem(key);
  }

  /**
   * for set Header for cookies
   */
  setSessionAndHttpAttr(email: any, response: { access_token: any; refresh_token: any; }, loginToken: any,orgId:any,platFormId?) {
    this.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
    // set cookies object
    const cookies = {};
    const config = { secure: true };
    cookies[Constants.httpAndCookies.USNM] = email;
    // cookies[Constants.httpAndCookies.ACTK] = response.access_token;
    // cookies[Constants.httpAndCookies.RFTK] = response.refresh_token;
    cookies[Constants.httpAndCookies.LGTK] = loginToken;
    cookies[Constants.httpAndCookies.ORGID] = orgId
    cookies[Constants.httpAndCookies.PLATFORM_ID] = platFormId;
    this.setStorage(Constants.httpAndCookies.COOKIES_OBJ, JSON.stringify(cookies));
    
  }

  /**
   * Open PopUp
   */
  openPopUp(obj: any, popUpName: any, isYesNo: any, objClass?: any) {
    // and use the reference from the component itself

    const modalRef = this.modalService.open(popUpName, objClass);
    modalRef.componentInstance.popUpObj = obj;
    modalRef.componentInstance.isYesNo = isYesNo; // if isYesNo true than display both buttons
    return modalRef;
  }


  openDialogue(popUpName: any, obj: any) {
    // and use the reference from the component itself

    const modalRef = this.dialog.open(popUpName, obj).afterClosed();
    return modalRef;
  }

  /**
   * For handle error and display error msg
   */
  /**
   * For handle error and display error msg
   */
  errorHandle(status: any,errorMsg) {
    // let errorMsg = '';
    if (status === 401) {
      localStorage.clear();
      window.location.href = RestUrl.LENDER_LOGIN_URL;
      errorMsg = 'You are not authorised';
    } else if (status === 404) {
      if (errorMsg == undefined || errorMsg == null) {
        errorMsg = 'Method Not found';
      }
    } else if (status === 400) {
      if (errorMsg == undefined || errorMsg == null) {
        errorMsg = 'Bad Request';
      }
    } else if (status === 500) {
      if (errorMsg == undefined || errorMsg == null) {
        errorMsg = 'Internal Server error';
      }
    } else if (status === 0) {
      errorMsg = 'Internal Server error';
    } else if (status === 502) {
      errorMsg = 'Server is not responding';
    } else if (status === 504) {
      errorMsg = 'Gateway Time out : 504';
    } else {
      if (errorMsg == undefined || errorMsg == null) {
        errorMsg = 'Something went wrong';
      }
      if (errorMsg === '') {
        errorMsg = 'Something went wrong';
      }
    }
    this.errorSnackBar(errorMsg);
    return throwError(errorMsg);
  }

  /**
   * For display Toaster msg in right side
   */
  successSnackBar(message: any, action?: any) {
    return;
  }
  errorSnackBar(message: string, action?: undefined) {
    return;
  }
  warningSnackBar(message: any, action?: any) {
    return;
  }
  infoSnackBar(message: any, action?: any) {
    return;
  }
  defaultSnackBar(message: any, action?: any) {
    return;
  }

  /**
   * For set Rootscope value data get till page refresh
   */
  setRootScopeObj(data) {
    this.rootScope.updateScope(data);
  }

  /**
   * get Stored data in Rootscope
   */
  getRootScopeObj() {
    return this.rootScope.getScopeValue();
  }

  loadScript(url: string) {
    const body = document.body as HTMLDivElement;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }

  senitizeURL(urlpath, title) {
    this.iconRegistry.addSvgIcon(title, this.sanitizer.bypassSecurityTrustResourceUrl(urlpath));
  }

  downloadStaticFile(extension,fileName){
    let link = document.createElement("a");
    link.download = fileName;
    link.href = "assets/files/"+fileName+extension;
    link.click();
  }

  redirectToOtherModule(bussinessTypeId, type) {
    // let cookiesObje: any = this.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
    // cookiesObje = JSON.parse(cookiesObje);
    // cookiesObje.token = cookiesObje.tk_lg;
    // cookiesObje.userType = this.getStorage(Constants.httpAndCookies.USERTYPE, true);
    // const encObj = this.toBTOA(JSON.stringify(cookiesObje));
    // Redirection code start from here

    let redirectModule;

    window.location.href = Constants.LOCATION_URL + redirectModule;
    // window.location.href = 'http://localhost:4300/redirect/'+ encObj;
  }

  downloadFile(bytes, fileName) {
    const blob = new Blob([bytes], {
      type: 'application/octet-stream'
    });
    const a: any = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display:none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
  clearStorageAndMoveToLogin(isMsgShow: boolean): void {
    this.clearStorage();
    this.errorSnackBar('Your session is expired..!');
    setTimeout(() => {
      window.location.href = RestUrl.LENDER_LOGIN_URL;
    }, 2000);
        // alert('Its seems your authorized token is expired, please login again !!');
  }
  clearStorage():void{
    this.removeStorage(Constants.httpAndCookies.USERTYPE);
    this.removeStorage(Constants.httpAndCookies.COOKIES_OBJ);
    this.removeStorage(Constants.httpAndCookies.ORGID);
    this.removeStorage(Constants.httpAndCookies.ROLEID);
    this.removeStorage(Constants.httpAndCookies.USER_NAME);
    this.removeStorage(Constants.httpAndCookies.TABID);
  }
  /**
   * CryptoJS.AES Encryption and convert to Base64
   */
  encryptFunction(request) {
    if (Constants.IS_ENCRYPTION && !this.isObjectNullOrEmpty(request)) {
      // return CommonService.toBTOA(CommonService.encryptText(request));
      return AesGcmEncryptionService.getEncPayload(request.toString());
    }
    // else {
    return request;
    // }
  }

  decryptFunction(request) {
    if (Constants.IS_ENCRYPTION && !this.isObjectNullOrEmpty(request)) {
      // return CommonService.decryptText(CommonService.toATOB(request));
     return AesGcmEncryptionService.getDecPayload(request);
    }
    return request;
  }

  static downloadFile(bytes: BlobPart, fileName: any) {
    const blob = new Blob([bytes], {
      type: 'application/octet-stream'
    });
    const a: any = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display:none';
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }



  formateDate(dateString: string): string {
    if (!dateString) return '';

    const dateParts = dateString.split('/');
    if (dateParts.length !== 3) return '';

    const [month, day, year] = dateParts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  public getLast12Months(): string[] {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const result = [];
    const date = new Date();
    date.setDate(1); // Set to the first day of the month to avoid issues

    for (let i = 0; i < 12; i++) {
      date.setMonth(date.getMonth() - 1); // Move to the previous month
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      result.push(`${monthName} ${year}`);
    }
    return result;
  }

  isActionAvailable(permissionData: any[],targetId: number,actionId: number): boolean {
      if (environment.staticDemo) {
        return true;
      }
      return isActionAvailable(permissionData,targetId,actionId);
  }

  isSubpageIsAvailable(permissionData: any[],page:any):boolean{
    if (environment.staticDemo) {
      return true;
    }
    return isSubpageExists(permissionData,page);
  }

  getPageData(pageId?:any,subPageId?:any, subSubPageId?:any):any{
     if (environment.staticDemo) {
       const actions = allDemoPageActions();
       const subSubpages = demoSubSubpagesAll();
       if (pageId != null && pageId !== undefined && subPageId != null && subPageId !== undefined
         && subSubPageId != null && subSubPageId !== undefined) {
         const hit = subSubpages.find((s) => s.subpageId === subSubPageId);
         return hit || { subpageId: subSubPageId, actions };
       }
       if (pageId != null && pageId !== undefined && subPageId != null && subPageId !== undefined) {
         return {
           subpageId: subPageId,
           subpageName: 'Demo',
           pageName: 'Demo',
           actions,
           routeLink: 'hsbc/rmExisitingPortfolio',
           subSubpages,
         };
       }
       if (pageId != null && pageId !== undefined) {
         return {
           pageId,
           pageName: 'Demo',
           subpages: [
             {
               subpageId: 1,
               subpageName: 'Demo',
               actions,
               routeLink: 'hsbc/rmExisitingPortfolio',
               subSubpages,
             },
           ],
         };
       }
       return undefined;
     }
     const storedData = this.getStorage(Constants.httpAndCookies.US_PR, true);
      if (storedData) {
        try {
          const routeData = JSON.parse(storedData);
          const analysisPage = routeData.find(
            (el: any) => (el?.pageId) === (pageId)
          );
             if (pageId && !subPageId){
               return analysisPage;
             }
          if (subPageId && !subSubPageId){
            return analysisPage.subpages.find(
              (el: any) => (el?.subpageId) === (subPageId)
            );
          }
          if (subSubPageId){
            return analysisPage.subpages.find(
              (el: any) => (el?.subpageId) === (subPageId)
            )?.subSubpages.find(
              (el: any) => (el?.subpageId) === (subSubPageId)
            );
          }
        } catch (error) {
          console.error('Invalid JSON in storage:', error);
        }
      }
  }

  formatPan(pan: string): string {
    if (pan && pan[3] === 'P') {
      return pan.substring(0, pan.length - 4) + 'XXXX';
    }
    return pan || '-';
  }

  // For Crisil Integration
  private bankerDataSource = new BehaviorSubject<any>(null);
  private companyDataSource = new BehaviorSubject<any>(null);
 
  currentBankerData = this.bankerDataSource.asObservable();
  currentCompanyData = this.companyDataSource.asObservable();
 
  getBankerData(data: any) {
    this.bankerDataSource.next(data);
  }
 
  getCompanyData(data: any, cin: any, pan:any) {
    const requestData = {
      data: data,
      cin: cin,
      pan: pan,
    };
    this.companyDataSource.next(requestData);
  }

  updateCustomerInActive(index: number, value: boolean): void {
      this.customerInActiveForCurrPage[index] = value;
      this.saveToggleState();
  }

  private saveToggleState(): void {
    this.setStorageAesEncryption('customerInActiveForCurrPage', JSON.stringify(this.customerInActiveForCurrPage));
    console.log("customerInActiveForCurrPage::::> ", this.customerInActiveForCurrPage);
  }

  private loadToggleState(): void {
    const stored = this.getStorageAesEncryption('customerInActiveForCurrPage');
    try {
      if (!this.isObjectNullOrEmpty(stored) && stored !== undefined) {
        console.log("Inside if block:::::> ", stored, " stored type::::> ", typeof stored)
        let parsed = JSON.parse(stored);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed); 
        }
        console.log("parsed::::> ", parsed, " parsed type::::> ", typeof parsed);
        console.log("Converting::::> ", Array.isArray(parsed))
        this.customerInActiveForCurrPage = Array.isArray(parsed) ? parsed.map(Boolean) : [false, false, false, false, false, false];
      } else {
        this.customerInActiveForCurrPage = [false, false, false, false, false, false];
      }
    } catch (e) {
      console.log("Error loading toggle state:", e);
      this.customerInActiveForCurrPage = [false, false, false, false, false, false];
    }
  }

    passRefershIDCallToBucket(docReferenceId,reportName) {
      this.downloadFileFromBucket(docReferenceId, 'txt').subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = reportName+'.xlsx';  // Update with the actual file name and extension
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
    }

  encryptedObject(data) {
    return { data: AesGcmEncryptionService.getEncPayload(data) };
  }

  downloadFileFromBucket(fileName: string, extension: string): Observable<Blob> {
    let createMasterJson: any = {};
    createMasterJson["fileName"] = fileName;
    createMasterJson["extension"] = extension;
    return this.http.post(RestUrl.GET_FILE_FROM_BUCKET, this.encryptedObject(createMasterJson), { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return new Blob([res], { type: res.type });
      })
    );
  }


  redirectToBankerModule(redirectUrl?) {
    console.log("Enter for Move to the other module ::::::>");
    let cookiesObje: any = this.getStorage(Constants.httpAndCookies.COOKIES_OBJ, true);
    // cookiesObje.platForm_id = environment.platFormId;
    cookiesObje = JSON.parse(cookiesObje);
    cookiesObje.token = cookiesObje.tk_lg;
    cookiesObje.userType = this.getStorage(Constants.httpAndCookies.USERTYPE, true);
    cookiesObje.orgId = this.getStorage(Constants.httpAndCookies.ORGID, true)
    cookiesObje.userId = this.getStorage(Constants.httpAndCookies.USER_ID, true);
    cookiesObje.employeeCode = this.getStorage(Constants.httpAndCookies.EMP_CODE, true);
    cookiesObje.businessTypeId = this.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true);
    cookiesObje.roleId = this.getStorage(Constants.httpAndCookies.ROLEID, true);
    // cookiesObje.roles = this.getStorage(Constants.httpAndCookies.ROLES, true);
    cookiesObje.campaignCode = this.getStorage(Constants.httpAndCookies.CAMPIGN_CODE, true);
    cookiesObje.type = this.getStorage(Constants.httpAndCookies.CAMPIGN_TYPE, true);
    
    // when you set IS_LOCAL is true then you run with you system.
    if (Constants.IS_LOCAL) {
      const encObj = this.toBTOA(JSON.stringify(cookiesObje));  
      window.location.href = 'http://localhost:4500/redirect?data='+ encObj;
    }
     else {
      let UUID = crypto.randomUUID();
      // this.setStorage(UUID,JSON.stringify(cookiesObje));
      window.location.href = Constants.LOCATION_URL + redirectUrl;
    }  
  }


}
