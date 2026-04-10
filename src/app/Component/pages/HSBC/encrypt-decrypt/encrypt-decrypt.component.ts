import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { AesGcmEncryptionService } from 'src/app/services/aes-gcm-encryption.service';

@Component({
  selector: 'app-encrypt-decrypt',
  templateUrl: './encrypt-decrypt.component.html',
  styleUrls: ['./encrypt-decrypt.component.scss']
})
export class EncryptDecryptComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  requestData: any;
  responseData: any;
  urlRequestData: any;
  urlResponseData: any;
  tab = 1;
  request: any;
  response: any;
  constructor( private commonService: CommonService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Dashboard', path: '/' }, { label: 'Reports', path: '/', active: true }];
  }

  // tab
  activeClick(tabId: number) {
    this.tab = tabId;
  }

  convertData(request) {
    // this.requestData = CommonService.decryptText(request);
    this.requestData = AesGcmEncryptionService.getDecPayload(request);
    try {
      this.requestData = JSON.parse(this.requestData.toString());
    } catch (ex) {
      this.requestData = this.requestData;
    }
  }
  convertUrlData(request) {
    // this.urlRequestData = CommonService.decryptFuntion(request);
    this.urlRequestData = AesGcmEncryptionService.getDecPayload(request);
    try {
      this.urlRequestData = this.urlRequestData.toString();
    } catch (ex) {
      this.urlRequestData = this.urlRequestData;
    }
  }
  decryptUrlData(request) {
    // this.urlResponseData = CommonService.encryptFuntion(request);
    this.urlResponseData = AesGcmEncryptionService.getEncPayload(request)
    try {
      this.urlResponseData = this.urlResponseData.toString();
    } catch (ex) {
      this.urlResponseData = this.urlResponseData;
    }
  }

  convertDecData(response) {
    // this.responseData = CommonService.encryptText(response);
    this.responseData = AesGcmEncryptionService.getEncPayload(response)
  }

  copyToClipBoard(data, isJson) {
    this.copyToClipBoard1(data, isJson);
  }

   copyToClipBoard1(data, isJson?) {
    if (data) {
      const index: number = 0;
      document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', isJson ? JSON.stringify(data) : (index !== -1) ? data : '');
        e.preventDefault();
        document.removeEventListener('copy', null);
      });
      document.execCommand('copy');
       isJson ? this.commonService.successSnackBar('String Copied') : (index !== -1) ? this.commonService.successSnackBar('Copied') : undefined ;
    }
    else {
      this.commonService.warningSnackBar('data not Found');
    }
  }

}
