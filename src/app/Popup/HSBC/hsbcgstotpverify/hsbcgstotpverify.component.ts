import { Component, Inject, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { ValidationsService } from 'src/app/CommoUtils/common-services/validations.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { ObjectModel } from 'src/app/CommoUtils/model/object-model';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-hsbcgstotpverify',
  templateUrl: './hsbcgstotpverify.component.html',
  styleUrl: './hsbcgstotpverify.component.scss'
})
export class HSBCGSTOTPVerifyComponent {
  otp: string;
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: 'X',
    inputStyles: {
      width: '40px',
      height: '40px'
    }
  };
  verified = false;
  applicationId:any;
  userId:any;
  otpCorrect:boolean = false;

  constructor(private router: Router, public dialogRef: MatDialogRef<HSBCGSTOTPVerifyComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private commonService: CommonService,
  public msmeService: MsmeService, private formBuilder: FormBuilder, private validationService: ValidationsService) {
  }

  otpValidation: ObjectModel[] = [{ key: 'required', value: true }, { key: 'minLength', value: 6 }, { key: 'maxLength', value: 6 }];
  gstOtpReq: any = {};
  isAlreadyCalled = false;
  mobile: any;
  gstin: any;
  requestId: any;


  ngOnInit(): void {
    this.applicationId = this.commonService.getStorage('applicationId', true);
    this.userId = this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true);
    console.log('data of req ::', this.data);
    this.requestId = this.data.requestId;
    this.mobile = this.data.mobile;
    this.gstin = this.data?.id;
    delete this.data.requestId;
  }

  closeDialog() {
    var obj = {};
    obj['isDisplayStatus'] = 0;
    this.dialogRef.close(obj);
  }

  onOtpChange(otp) {
    this.otp = otp;
    if (this.otp.length === 6) {
      console.log("called veri");
      this.otpCorrect = true;
      // this.verifyOTP();
    }
  }

  verifyOTP() {
    this.isAlreadyCalled = true;
   let formData = {};
    formData = this.data;
    formData['otp']=this.otp
    console.log(formData);
    this.msmeService.gstAnalysisVerifyOtp(formData).subscribe(response => {
      console.log('response of GST Verification :: ' , response);
      let dataObj = null;
      this.isAlreadyCalled = false;
      if (response != null && response?.data != null && response?.isDisplayStatus ==1) {
        // 101 -- OTP Successfully Verified.
           dataObj = response;
           this.dialogRef.close(dataObj);
          return false;


      } else {
        this.commonService.errorSnackBar(response.isDisplayMessage);
        this.dialogRef.close(response);
      }
    });
  }

  resendOtp() {
    this.gstOtpReq = this.data;
    console.log('this.gstOtpReq', this.gstOtpReq);
    this.msmeService.gstAnalysisGenOtp(this.gstOtpReq).subscribe(response => {
      let dataObj = null;
      dataObj  = response;
      console.log("dataobj :: ",dataObj);
      if (response != null && response.status == 1000 && response.isDisplayStatus == 1) {
        // let respData = JSON.parse(response.data)
        this.data.sessionKey = response.data.sessionKey;
        this.data.sessionId = response?.data?.headers["session-id"]
          this.commonService.successSnackBar("OTP has been sent on your Registered Mobile Number");
      }  else {
        this.commonService.errorSnackBar(dataObj.isDisplayMessage);
      }
    });
  }
  closePopup(data?): void {
    this.dialogRef.close(data);
  }




}
