import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';


@Component({
  selector: 'app-brc-configuration-popup',
  templateUrl: './brc-configuration-popup.component.html',
  styleUrls: ['./brc-configuration-popup.component.scss']
})

export class BRCConfigurationPopupComponent implements OnInit {
  
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
    setTimeout(() => {

      this.businessTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true));
      this.schemeId = Number(this.commonService.getStorage(Constants.httpAndCookies.SCHEME_ID, true));
      // this.loanTypeId = this.commonService.getLoanType(this.businessTypeId);
      this.loanTypeId = 1;
      this.orgId = Number(this.commonService.getStorage(Constants.httpAndCookies.ORGID, true));
      this.orgId = this.commonService.getStorage(Constants.httpAndCookies.ENV_ORG_ID,true);
      this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));

      // POPUP DATA
      this.popUpId = this.popUpObj.popUpId;
      this.editId = this.popUpObj.editId;
      // this.id = this.editId;
      this.id = this.orgId;
      this.activateTab = this.popUpObj.activateTab;

      if (this.editId) {
        this.getEditMasterList(this.editId);
      }
    }, 0);
  }

  redirect() {
    this.activeModal.close('close');
    // this.router.navigate(['/Config/BureauConfig-List']);
  }

  getEditMasterList(id) {
    this.msmeService.getEditMasterList(this.orgId).subscribe(response => {
      if (response && response.status === 200) {
        const resData = response.data.data;

        if (this.popUpId === 1) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.commercial?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.commercial?.password;
          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.commercial?.memberCode;

        } else if (this.popUpId === 2) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.individual?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.individual?.password;

          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.individual?.memberCode;
          this.bureauMemberPasswrd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.transunionConfig?.individual?.memberPassword;

        } else if (this.popUpId === 3) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.commercial?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.commercial?.password;
          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.commercial?.bureauMemberId;

        } else if (this.popUpId === 4) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.individual?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.individual?.password;
          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.experianConfig?.individual?.bureauMemberId;

        } else if (this.popUpId === 5) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.commercial?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.commercial?.password;
          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.commercial?.memberId;

        } else if (this.popUpId === 6) {
          this.bureauUserName = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.individual?.userName;
          this.bureauNewPwd = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.individual?.password;
          this.bureauMemberId = JSON.parse(response.data.data.msmeConfig)?.bureauList?.crifHighmarkConfig?.individual?.memberId;
        }
      }
    }, function (error: any) {
      if (error.status === 401) {
        this.commonMethod.logoutUser();
      }
    });
  }

  //SAVE POPUP BUREAU DATA
  saveAndUpdateBureauPassword() {
    const objects = {
      orgId: this.orgId,
      id: this.id,
      bureauMemberId: this.bureauMemberId,
      bureauNewPwd: this.bureauNewPwd,
      bureauUserName: this.bureauUserName,
      bureauMemberPasswrd: this.bureauMemberPasswrd,
      popUpId: this.popUpObj.popUpId,
      userId:this.userId
    };

    if (!this.bureauMemberId || !this.bureauNewPwd || !this.bureauNewPwd || (this.popUpId === 2 && !this.bureauMemberPasswrd)) {
      this.commonService.warningSnackBar('Please fill Mandatory fields!!');
      return;
    }

    this.msmeService.updatePopupData(objects).subscribe(response => {
      if (response && response.status === 200) {
        this.redirect();
        this.commonService.successSnackBar('Bureau configure updated successfully !!');
        // this.router.navigate(['/Config/BureauConfig-Edit']);
      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });
  }

}
