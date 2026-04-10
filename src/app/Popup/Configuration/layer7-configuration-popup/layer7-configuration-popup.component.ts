import { Component,Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-layer7-configuration-popup',
  templateUrl: './layer7-configuration-popup.component.html',
  styleUrl: './layer7-configuration-popup.component.scss'
})
export class Layer7ConfigurationPopupComponent implements OnInit  {

    businessTypeId: number;
    loanTypeId: Number;
    schemeId: number;
    orgId: any;
    productId: number = 0;
    bureauConfigName: any;
    userId: Number;
    id: Number;
    countSelectedScheme: any;
    @Input() popUpObj: any = {};
    // LODASH = _;
  
    bureauUserName: any;
    bureauNewPwd: any;
    bureauMemberId: any;
    bureauMemberPasswrd: any;
    popUpId: Number;
  
    editId: Number;
    activateTab: Number;
  
    hide = true;
    hide1 = true;
    hide2 = true;
  
    hide5 = true;
  
    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal
      , private commonService: CommonService, private router: Router, private route: ActivatedRoute, private msmeService: MsmeService) { }
  
    ngOnInit(): void {
      this.popUpId = this.popUpObj.popUpId;
      this.getLayer7Data();
      // setTimeout(() => {
  
      //   this.businessTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true));
      //   this.schemeId = Number(this.commonService.getStorage(Constants.httpAndCookies.SCHEME_ID, true));
      //   // this.loanTypeId = this.commonService.getLoanType(this.businessTypeId);
      //   this.loanTypeId = 1;
      //   this.orgId = Number(this.commonService.getStorage(Constants.httpAndCookies.ORGID, true));
      //   this.orgId = this.commonService.getStorage(Constants.httpAndCookies.ENV_ORG_ID,true);
      //   this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));
  
      //   // POPUP DATA
      //   this.popUpId = this.popUpObj.popUpId;
      //   this.editId = this.popUpObj.editId;
      //   // this.id = this.editId;
      //   this.id = this.orgId;
      //   this.activateTab = this.popUpObj.activateTab;
  
      //   if (this.editId) {
      //     this.getLayer7Data();
      //   }
      // }, 0);
    }
  
    redirect() {
      this.activeModal.close('close');
      // this.router.navigate(['/Config/BureauConfig-List']);
    }
  
  //   getLayer7Data() {
  //     const data = {}
  //     // this.msmeService.getLayer7Data(data).subscribe(res => {
  //       // console.log("res ", res)
  //     let response: any = {};
  //       response.data = {
  //   "status": 1000,
  //   "message": "Success",
  //   "referenceId": "e3b3562a-1b42-46bb-8ba0-fde6df45083e",
  //   "data": "{\"indMemberUserId\":\"SU00018888_UATC2CNPE1\",\"indMemberPassword\":\"k8xlbm@shzdgpxagnyhM1\",\"comCredActive\":\"true\",\"comPassword\":\"avhatanfs@Ms9w1\",\"comUserName\":\"SU00010001_CMMUATC2C21\",\"indCredActive\":\"true\"}"
  //   }
  //       console.log("data is here...",response)
  //   if (response) {

  //   const parsedData = JSON.parse(response.data.data);

  //   if (this.popUpId === 1) {
  //     this.bureauUserName = parsedData.comUserName;
  //     this.bureauNewPwd = parsedData.comPassword;
  //   } else if (this.popUpId === 2) {
  //     this.bureauUserName = parsedData.indMemberUserId;
  //     this.bureauNewPwd = parsedData.indMemberPassword;
  //   }
  // }
   
  //   }


//     getLayer7Data() {
//     const data = {};
   
//     this.msmeService.getLayer7Data(data).subscribe(res => {
//       console.log("API Response:", res);
//     });

//     console.log("Data is here...", response);

//     if (response?.data?.data) {
//       try {
//         const parsedData = JSON.parse(response.data.data);

//         if (this.popUpId === 1) {
//           this.bureauUserName = parsedData.comUserName || '';
//           this.bureauNewPwd = parsedData.comPassword || '';
//         } else if (this.popUpId === 2) {
//           this.bureauUserName = parsedData.indMemberUserId || '';
//           this.bureauNewPwd = parsedData.indMemberPassword || '';
//         }
//       } catch (error) {
//         console.error("Error parsing response data:", error);
//       }
//     } else {
//       console.warn("No valid data found in response.");
//     }
// }

getLayer7Data() {
  const data = {};

  this.msmeService.getLayer7Data(data).subscribe({
    next: (res: any) => {
      console.log("API Response:", res);

      if (res?.data?.data) {
        try {
          const parsedData = JSON.parse(res.data.data);

          if (this.popUpId === 1) {
            this.bureauUserName = parsedData.comUserName || '';
            this.bureauNewPwd = parsedData.comPassword || '';
          } else if (this.popUpId === 2) {
            this.bureauUserName = parsedData.indMemberUserId || '';
            this.bureauNewPwd = parsedData.indMemberPassword || '';
          }
        } catch (error) {
          console.error("Error parsing response data:", error);
        }
      } else {
        console.warn("No valid data found in response.");
      }
    },
    error: (err) => {
      console.error("API call failed:", err);
    }
  });
}


    saveAndUpdateLayer7Password() {

      
      // Validation
      if (this.bureauUserName || this.bureauNewPwd) {
        this.commonService.warningSnackBar('Please fill Mandatory fields!!');
        return;
      }

      // Determine credentialType based on popUpId

      const reqObject: any = {
        serviceName: "Cibil Layer 7",
        productCode: "HSBC",
        credentialId: 1,
        credentialType: this.popUpId === 1 ? 'COMMERCIAL' : 'INDIVIDUAL'
      };

      if (this.popUpId === 1) {
        reqObject.comUserName = this.bureauUserName;
        reqObject.comPassword = this.bureauNewPwd;
      } else {
        reqObject.indMemberUserId = this.bureauUserName;
        reqObject.indMemberPassword = this.bureauNewPwd;
      }

      // API call
      this.msmeService.updatePopupLayer7Data(reqObject).subscribe(
        (response: any) => {
          console.log('this is your update data.....',response);
          if (response && response.status === 200) {
            this.redirect();
            this.commonService.successSnackBar('Layer7 configure updated successfully !!');
          }
        },
        (error: any) => {
          this.commonService.errorSnackBar(error);
        }
      );
    }


}
