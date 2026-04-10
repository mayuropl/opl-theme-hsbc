import { MatTabChangeEvent } from '@angular/material/tabs';
import { Component, HostListener, OnInit, Optional } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { BRCConfigurationPopupComponent } from 'src/app/Popup/Configuration/brc-configuration-popup/brc-configuration-popup.component';
import { BRCConfigurationStatusComponent } from 'src/app/Popup/Configuration/brc-configuration-status/brc-configuration-status.component';
import { BRCConfirmationPopupComponent } from 'src/app/Popup/Configuration/brcconfirmation-popup/brcconfirmation-popup.component';
import { Constants } from 'src/app/CommoUtils/constants';
import { AuthGuard } from 'src/app/Component/core/guards/auth.guard';
import { MsmeService } from 'src/app/services/msme.service';
import {GlobalHeaders, resetGlobalHeaders} from "../../../../../CommoUtils/global-headers";
import { Layer7ConfigurationPopupComponent } from 'src/app/Popup/Configuration/layer7-configuration-popup/layer7-configuration-popup.component';
import { OpRejectionRemarkPopupComponent } from 'src/app/Popup/Configuration/op-rejection-remark-popup/op-rejection-remark-popup.component';



declare var jQuery: any;
declare var $: any;

@Component({
  selector: 'app-brc-configuration',
  templateUrl: './brc-configuration.component.html',
  styleUrls: ['./brc-configuration.component.scss']
})
export class BRCConfigurationComponent implements OnInit {

  // bread crumb data
  breadCrumbItems!: Array<{}>;
  businessTypeId: number;
  loanTypeId: Number;
  schemeId: number;
  orgId: any;
  productId: number = 0;
  bureauConfigName: any;
  userId: Number;
  id: Number;
  source :Number
  countSelectedScheme: any;
  // LODASH = _;
  modifiedDate: Date;

  isCibilCheck = false;
  isCibilLayer7Check = false;
  isExperianCheck = false;
  isCrifCheck = false;
  isHighMarkCheck: Boolean;
isCheckedConsumer = true
  schemeArray = [];
  popUpObj: any = [];

  popUpId: Number;
  schemeDisabledArray = [];
  secondaryBureau;

  primaryBureauValue: Number;
  secondaryBureauValue: Number;

  // selectValue: string[];
  disabledCommercial: Boolean;
  YesAndNoValue: Boolean;
  DropDownValue: Boolean;
  selectValue;
  secUpdatedvalue;
  selectValueTemp = [];
  secondaryBureauDropDownTemp = [];

  activateTab: number;
  editId: Number;

  primaryNew: any;

  isConfigViewMode: Boolean;
  rejectionReasonList: any[] = [];
  clientUpdateList:any[] = [];
  threshold:any[]=[];
  activeThresholdValue: string = '';
  thresholdValue: string = '';
  selectedRejectionReason: any;
  rejectionReason: string = '';
  clientUpdate: string = '';
  reasonId:any;
  pageSize = 10;
  startIndex = 0;
  endIndex = 10;
  totalSize = 0;
  page = 1;
  isTransunionCommercialFlag = false;
  isTransunionIndividualFlag = false;
  isExperianCommercialFlag = false;
  isExperianIndividualFlag = false;
  isCrifCheckCommercialFlag = false;
  isCrifCheckIndividualFlag = false;

  hide=false;
  pageData: any;

  commercialActive= false;
  consumerActive= false;
  protected readonly consValue = Constants;
   PageSelectNumber: any[] = [
    {
      name: '5',
      value: 5
    },
    {
      name: '10',
      value: 10
    },
    {
      name: '15',
      value: 15
    },
    {
      name: '20',
      value: 20
    },
  ]
rejectionPage = 1;
rejectionPageSize = 10;
rejectionTotalSize = 0;
rejectionStartIndex = 0;
rejectionEndIndex = 10;
paginatedRejectionList: any[] = [];

clientPage = 1;
clientPageSize = 10;
clientTotalSize = 0;
clientStartIndex = 0;
clientEndIndex = 10;
paginatedClientUpdateList: any[] = [];
isActiveRole = true;

selectedTabIndex = 0;
configMasteListRes:any = null;
ruleLevelsResListByRf:any = null;
authorizationMatrixForm: FormGroup;

// Staff Hierarchy Role Properties
staffHierarchyRoles: any[] = [];
staffHierarchyRolesLoading: boolean = false;
staffHierarchyRolesError: string | null = null;
staffRolePage: number = 1;
staffRolePageSize: number = 10;
staffRoleTotalSize: number = 0;
staffRoleStartIndex: number = 0;
paginatedStaffRoles: any[] = [];

// Inline Editing State
editingRoleId: number | null = null;
editingField: 'rmRole' | null = null;
editingValue: string = '';
originalValue: string = '';



  constructor(
    @Optional() public activeModal: NgbActiveModal,private modalService: NgbModal, private authGuard: AuthGuard,
     public commonService: CommonService, private router: Router, private route: ActivatedRoute,
      private msmeService: MsmeService, private fb: FormBuilder) {
  }
  ngOnInit(): void {
    this.pageData = history.state.data;
    console.log("Configurations PageData",this.pageData)
    resetGlobalHeaders();
    GlobalHeaders['x-path-url'] = '/hsbc/bureauConfig';
    GlobalHeaders['x-main-page'] = this.pageData.pageName;
    console.log('Received data:', this.pageData);
    this.breadCrumbItems = [{ label: 'Dashboard', path: '/' }, { label: 'Bureau Configuration', path: '/' }, { label: 'Edit Bureau Configuration', path: '/', active: true }];

    this.primaryNew = { label: 'Transunion(CIBIL)', id: 1 }, { label: 'Experian', 'id': 2 }, { label: 'Crif Highmark', 'id': 3 };

    this.route.queryParams.subscribe(params => {
      this.activateTab = Number(this.commonService.decryptFunction(params['activateTab']));
      this.editId = Number(this.commonService.decryptFunction(params['id']));
      this.isConfigViewMode = Boolean(this.commonService.decryptFunction(params['isConfigViewMode']));
    });

    this.businessTypeId = Number(this.commonService.getStorage(Constants.httpAndCookies.BUSINESS_TYPE_ID, true));
    this.schemeId = Number(this.commonService.getStorage(Constants.httpAndCookies.SCHEME_ID, true));
    this.loanTypeId = 1;
    this.orgId = this.commonService.isObjectNullOrEmpty(this.commonService.getStorage(Constants.httpAndCookies.ENV_ORG_ID,true)) ? 80 : this.commonService.getStorage(Constants.httpAndCookies.ENV_ORG_ID,true);

    this.userId = Number(this.commonService.getStorage(Constants.httpAndCookies.USER_ID, true));

    // on load edit list
    this.getEditMasterList(this.editId, this.activateTab, null);
    this.getClinetUpdateRejectionReasonList();


    this.initializeAuthorizationMatrixForm();
  }

   showErrors: boolean = false;
  saveClientUpdateRejectionDetails(source: 'REJECT_REASON' | 'CLIENT_UPDATE' | 'BULK_PREAPPROVAL_THRESHOLD') {

  const value =
    source === 'REJECT_REASON'
      ? this.rejectionReason
      : source === 'CLIENT_UPDATE'
      ? this.clientUpdate
      : this.thresholdValue;

  if (source === 'BULK_PREAPPROVAL_THRESHOLD') {
    if (!value || value.trim().length === 0) {
      this.showErrors = true;
      return;
    }
  } else {
    if (!this.isValidReason(value)) {
      this.showErrors = true;
      return;
    }
  }

  const payload = {
    reasonName: value.trim(),
    clientStatus: source
  };
console.log(payload)
  this.msmeService.addClientUpdateRejectionReason(payload)
  .subscribe((response: any) => {

    if (response && response.status === 200) {
      this.commonService.successSnackBar(response.message || 'Saved successfully');
      this.getClinetUpdateRejectionReasonList();

      if (source === 'REJECT_REASON') {
        this.rejectionReason = '';
      } else if (source === 'CLIENT_UPDATE') {
        this.clientUpdate = '';
      } else {
        this.thresholdValue = '';
      }

      this.showErrors = false;

    } else {

      this.commonService.warningSnackBar(response.message || 'Something went wrong');
    }
  },
  () => {

    this.commonService.errorSnackBar('Something went wrong');
  });

}
isValidReason(value: string): boolean {
  if (this.isFieldEmpty(value)) {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed.length > 35) {
    return false;
  }

  if (!this.hasAtLeastOneLetter(trimmed)) {
    return false;
  }

  return true;
}

  isFieldEmpty(value: string | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  hasAtLeastOneLetter(value: string | undefined): boolean {
    if (this.isFieldEmpty(value)) return true;  // don't show letter error if empty
    return /[A-Za-z]/.test(value!.trim());
  }

  onInputChange() {
    // Don't reset showErrors here - let validation show immediately
    // this.showErrors = false;
  }

  providerDisabledFuntion(response: any) {
    this.schemeDisabledArray = this.getSchemeIds(response);
    // console.log("schemeDisabledArray    ::{}",this.schemeDisabledArray);
    this.disabledCommercial = false;
    for (let index = 0; index < this.schemeDisabledArray.length; index++) {
      const value = this.schemeDisabledArray[index];
      // console.log("response here  ----> ",this.schemeDisabledArray[index])
      if (value === 1 || value === 2 || value === 3 || value === 4 || value === 5 || value === 10 || value === 11 || value === 12 || value === 14) {
        this.disabledCommercial = true;
        // console.log("break response here  ---->[{}] and index [{}]",this.disabledCommercial ,index)
        break;
      }
    }
  }


  // // FOR ON TOGGLE
  // dataPush(isCibilCheck: Boolean, type, value: Number) {
  //   // console.log("dataPush  value  ::: {}", isCibilCheck);
  //   if (isCibilCheck) {
  //     const json = {
  //       label: type,
  //       id: value,
  //     };
  //     this.selectValueTemp.push(json);
  //   } else {
  //     const index = _.findIndex(this.selectValueTemp, ['id', value]);
  //     if (index !== -1) {
  //       this.selectValueTemp.splice(index, 1);
  //     }
  //   }
  //   this.selectValueTemp = _.cloneDeep(this.selectValueTemp);


  //   if (this.selectValue) {
  //     const index = _.findIndex(this.selectValueTemp, ['id', this.selectValue]);
  //     if (index === -1) {
  //       this.selectValue = null;
  //     }
  //   }
  //   // console.log("final dropdown selectValueTemp  ::: {}", this.selectValueTemp)
  // }

  dataPushDropDown(primarySelectedValue: number) {
    // console.log("primarySelectedValue  ::: {}", primarySelectedValue);
    this.primaryBureauValue = primarySelectedValue;
    if (primarySelectedValue === 1) {
      this.secondaryBureauDropDownTemp = [];
      this.secondaryBureau = 2;
      this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
      this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
    }
    if (primarySelectedValue === 2) {
      this.secondaryBureauDropDownTemp = [];
      this.secondaryBureau = 3;
      this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
      this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
    }
    if (primarySelectedValue === 3) {
      this.secondaryBureauDropDownTemp = [];
      this.secondaryBureau = 1;
       this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
      this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
    }
    // if (this.secondaryBureau) {
    //   const index = _.findIndex(this.selectValueTemp, ['id', this.secondaryBureau]);
    //   if (index === -1) {
    //     this.secondaryBureau = null;
    //   }
    // }
  }



  // for PRIMARY DROPDOWN
  // dataPushDropDown(primarySelectedValue: Number) {
  //   console.log("primarySelectedValue  ::: {}", primarySelectedValue);
  //   this.primaryBureauValue = primarySelectedValue;
  //   if (primarySelectedValue) {

  //     this.secondaryBureauDropDownTemp = _.cloneDeep(this.selectValueTemp);
  //     const index = _.findIndex(this.selectValueTemp, ['id', primarySelectedValue]);
  //     if (index !== -1) {
  //       this.secondaryBureauDropDownTemp.splice(index, 1);
  //     }
  //   }

  //   if (this.secondaryBureau) {
  //     const index = _.findIndex(this.selectValueTemp, ['id', this.secondaryBureau]);
  //     if (index === -1) {
  //       this.secondaryBureau = null;
  //     }
  //   }
  // }

  secondaryDropValue(secondDropDValue: number) {
    // console.log("dsdsdssddsdsds   : {}",secondDropDValue);
    this.secondaryBureauValue = secondDropDValue;
  }


  getEditMasterList(editId: Number, activateTab: number, isSaveTime?, isCibilCheck?,isCibilLayer7Check?, isExperianCheck? ,isCrifCheck?) {
    this.msmeService.getEditMasterList(this.orgId).subscribe(response => {
      if (response && response.status === 200) {
        const paginatedData = response.data.data;
        this.source = paginatedData.source;
          if (this.source === 1) {
            this.isCibilCheck = true;
            this.isCibilLayer7Check = false;
          } else if (this.source === 2) {
            this.isCibilCheck = false;
            this.isCibilLayer7Check = true;
          }
        this.countSelectedScheme = this.getSize(paginatedData.schemeIds);
        this.bureauConfigName = paginatedData.organisationName;
        this.modifiedDate = paginatedData.modifiedDate;

        this.commercialActive = paginatedData.commercialActive;
        this.consumerActive = paginatedData.consumerActive;
        // this.schemeArray = this.getSchemeNames(paginatedData.schemeIds);
        // this.providerDisabledFuntion(paginatedData.schemeIds);

        if (!isSaveTime) {
          const cibilCheckCommcialFlag = JSON.parse(paginatedData.msmeConfig).bureauList?.transunionConfig?.commercial?.isActive;
          this.isCibilCheck = cibilCheckCommcialFlag ? cibilCheckCommcialFlag && this.source == 1 : JSON.parse(paginatedData.msmeConfig).bureauList?.transunionConfig?.individual?.isActive;
          const experianCheck = JSON.parse(paginatedData.msmeConfig).bureauList?.experianConfig?.commercial?.isActive;
          this.isExperianCheck = experianCheck ? experianCheck : JSON.parse(paginatedData.msmeConfig).bureauList?.experianConfig?.individual?.isActive;
          const crifCheck = JSON.parse(paginatedData.msmeConfig).bureauList?.crifHighmarkConfig?.commercial?.isActive;
          this.isCrifCheck = crifCheck ? crifCheck : JSON.parse(paginatedData.msmeConfig).bureauList?.crifHighmarkConfig?.individual?.isActive;


          this.selectValueTemp.push({ label: 'Transunion(CIBIL)', id: 1 }, { label: 'Experian', id: 2 }, { label: 'Crif Highmark', id: 3});
          this.selectValue = JSON.parse(paginatedData.msmeConfig).primary ? JSON.parse(paginatedData.msmeConfig).primary : 1;
          this.secUpdatedvalue = JSON.parse(paginatedData.msmeConfig).secondary ? JSON.parse(paginatedData.msmeConfig).secondary : 2;

          // if (this.selectValue === 1) {
          //   this.primaryBureauValue = this.selectValue;
          //   this.secondaryBureauValue = 2;
          //   this.secondaryBureauDropDownTemp = [];
          //   this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
          //   this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
          //   this.secondaryBureau = 2;
          // }
          // if (this.selectValue === 2) {
          //   this.primaryBureauValue = 2;
          //   this.secondaryBureauValue = this.selectValue;
          //   this.secondaryBureauDropDownTemp = [];
          //   this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
          //   this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
          //   this.secondaryBureau = 3;
          // }

          // if (this.selectValue === 3) {
          //   this.primaryBureauValue = 1;
          //   this.secondaryBureauValue = this.selectValue;
          //   this.secondaryBureauDropDownTemp = [];
          //   this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
          //   this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
          //   this.secondaryBureau = 3;
          // }

          if (this.selectValue === 1) {
            this.primaryBureauValue = this.selectValue;
            this.secondaryBureauValue = 2;
            this.secondaryBureauDropDownTemp = [];
            this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
            this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
            this.secondaryBureau = this.secUpdatedvalue;
          }
          if (this.selectValue === 2) {
            this.primaryBureauValue = 2;
            this.secondaryBureauValue = this.selectValue;
            this.secondaryBureauDropDownTemp = [];
            this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
            this.secondaryBureauDropDownTemp.push({ label: 'Crif Highmark', id: 3 });
            this.secondaryBureau = this.secUpdatedvalue;
          }

          if (this.selectValue === 3) {
            this.primaryBureauValue = 1;
            this.secondaryBureauValue = this.selectValue;
            this.secondaryBureauDropDownTemp = [];
            this.secondaryBureauDropDownTemp.push({ label: 'Transunion(CIBIL)', id: 1 });
            this.secondaryBureauDropDownTemp.push({ label: 'Experian', id: 2 });
            this.secondaryBureau = this.secUpdatedvalue;
          }

        //   if(this.isCrifCheck){
        //   this.crifCheckPopup(this.isCrifCheck);
        // }
        }


        // fullfile while save configration
        if (isSaveTime) {
          this.checkValidationAndSave(isCibilCheck, isCibilLayer7Check, isExperianCheck,isCrifCheck, paginatedData);
        }
      }
    }, (error: any) => {
      if (error.status === 401) {
        this.authGuard.logoutUser();
      }
    });
  }

  checkValidationAndSave(isCibilCheck, isCibilLayer7Check, isExperianCheck, isCrifCheck, responceData) {
    if (isCibilCheck) {
      const isCommercial = JSON.parse(responceData?.msmeConfig).bureauList?.transunionConfig?.commercial?.userName; //password  bureauMemberId isActive
      if (isCommercial) {
        this.isTransunionCommercialFlag = true;
      }
      const isIndividual = JSON.parse(responceData?.msmeConfig).bureauList?.transunionConfig?.individual?.userName; //password  bureauMemberId isActive
      if (isIndividual) {
        this.isTransunionIndividualFlag = true;
      }
    }

    if (isExperianCheck) {
      const isCommercial = JSON.parse(responceData?.msmeConfig).bureauList?.experianConfig?.commercial?.userName;
      if (isCommercial) {
        this.isExperianCommercialFlag = true;
      }
      const isIndividual = JSON.parse(responceData?.msmeConfig).bureauList?.experianConfig?.individual?.userName;
      if (isIndividual) {
        this.isExperianIndividualFlag = true;
      }
    }

    if(isCrifCheck) {
      const isCommercial = JSON.parse(responceData?.msmeConfig).bureauList?.crifHighmarkConfig?.commercial?.userName;
      if (isCommercial) {
        this.isCrifCheckCommercialFlag = true;
      }
      const isIndividual = JSON.parse(responceData?.msmeConfig).bureauList?.crifHighmarkConfig?.individual?.userName;
      if (isIndividual) {
        this.isCrifCheckIndividualFlag = true;
      }
    }

    let eduFlag = false;
    let homeFlag = false;
    let businessFlag = false;
    let srmsFlag = false;
    let agriFlag = false;
    let liveliFlag = false;
    const scheme = JSON.parse(responceData.schemeIds);
    for (const element of scheme) {
      if ((element === Constants.SchemeMaster.CENTRAL_SECTOR_INTEREST_SUBSIDY.id) || (element === Constants.SchemeMaster.PADHO_PRADESH.id) || (element === Constants.SchemeMaster.DR_AMBEDKAR_CENTRAL_SECTOR_SCHEME.id)) {
        eduFlag = true;
        // break;
      }
      if (element === Constants.SchemeMaster.PRADHAN_MANTRI_AWAS_YOJANA.id) {
        homeFlag = true;
        // break;
      }
      if ((element === Constants.SchemeMaster.WEAVER_CREDIT_CARD.id) || (element === Constants.SchemeMaster.PRADHAN_MANTRI_MUDRA_YOJNA.id) || (element === Constants.SchemeMaster.STAND_UP_INDIA_SCHEME.id)) {
        businessFlag = true;
        // break;
      }
      if (element === Constants.SchemeMaster.SRMS.id) {
        srmsFlag = true;
        // break;
      }
      if ((element === Constants.SchemeMaster.AGRICLINICS_AGRIBUSINESS_CENTERS_SCHEME.id) || (element === Constants.SchemeMaster.AGRICULTURAL_MARKETING_INFRASTRUCTURE.id) || (element === Constants.SchemeMaster.AGRICULTURE_INFRASTRUCTURE_FUND.id)) {
        agriFlag = true;
        // break;
      }
      if ((element === Constants.SchemeMaster.NULM.id) || (element === Constants.SchemeMaster.DEENDAYAL_ANTYODAYA_YOJANA_NATIONAL_RURAL_LIVELIHOODS_MISSION.id)) {
        liveliFlag = true;
        // break;
      }
    }

    const transunionCommonMesage = 'Please update details of Transunion(CIBIL) bureau configuration';
    if (isCibilCheck) {
      if (eduFlag) {
        if (!this.isTransunionIndividualFlag) {
          this.commonService.warningSnackBar(transunionCommonMesage);
          return;
        }
      }
      // if (homeFlag) {
      //   if (!this.isTransunionIndividualFlag) {
      //     this.commonService.warningSnackBar(transunionCommonMesage);
      //     return;
      //   }
      // }
      if (businessFlag) {
        if (!this.isTransunionCommercialFlag || !this.isTransunionIndividualFlag) {
          this.commonService.warningSnackBar(transunionCommonMesage);
          return;
        }
      }
      if (srmsFlag) {
        if (!this.isTransunionIndividualFlag) {
          this.commonService.warningSnackBar(transunionCommonMesage);
          return;
        }
      }
      if (agriFlag) {
        if (!this.isTransunionCommercialFlag || !this.isTransunionIndividualFlag) {
          this.commonService.warningSnackBar(transunionCommonMesage);
          return;
        }
      }
      if (liveliFlag) {
        if (!this.isTransunionIndividualFlag) {
          this.commonService.warningSnackBar(transunionCommonMesage);
          return;
        }
      }
    }
    const experianCommonMesage = 'Please update details of Experian bureau configuration'
    if (isExperianCheck) {
      if (eduFlag) {
        if (!this.isExperianIndividualFlag) {
          this.commonService.warningSnackBar(experianCommonMesage);
          return;
        }
      }
      // if (homeFlag) {
      //   if (!this.isExperianIndividualFlag) {
      //     this.commonService.warningSnackBar(experianCommonMesage);
      //     return;
      //   }
      // }
      if (businessFlag) {
        if (!this.isExperianCommercialFlag || !this.isExperianIndividualFlag) {
          this.commonService.warningSnackBar(experianCommonMesage);
          return;
        }
      }
      if (srmsFlag) {
        if (!this.isExperianIndividualFlag) {
          this.commonService.warningSnackBar(experianCommonMesage);
          return;
        }
      }
      if (agriFlag) {
        if (!this.isExperianCommercialFlag || !this.isExperianIndividualFlag) {
          this.commonService.warningSnackBar(experianCommonMesage);
          return;
        }
      }
      if (liveliFlag) {
        if (!this.isExperianIndividualFlag) {
          this.commonService.warningSnackBar(experianCommonMesage);
          return;
        }
      }
    }

    const crifCheckCommonMesage = 'Please update details of Crif Highmark bureau configuration'
    if (isCrifCheck) {
      if (eduFlag) {
        if (!this.isCrifCheckIndividualFlag) {
          this.commonService.warningSnackBar(crifCheckCommonMesage);
          return;
        }
      }
      // if (homeFlag) {
      //   if (!this.isExperianIndividualFlag) {
      //     this.commonService.warningSnackBar(experianCommonMesage);
      //     return;
      //   }
      // }
      if (businessFlag) {
        if (!this.isCrifCheckCommercialFlag || !this.isCrifCheckIndividualFlag) {
          this.commonService.warningSnackBar(crifCheckCommonMesage);
          return;
        }
      }
      if (srmsFlag) {
        if (!this.isCrifCheckIndividualFlag) {
          this.commonService.warningSnackBar(crifCheckCommonMesage);
          return;
        }
      }
      if (agriFlag) {
        if (!this.isCrifCheckCommercialFlag || !this.isCrifCheckIndividualFlag) {
          this.commonService.warningSnackBar(crifCheckCommonMesage);
          return;
        }
      }
      if (liveliFlag) {
        if (!this.isCrifCheckIndividualFlag) {
          this.commonService.warningSnackBar(crifCheckCommonMesage);
          return;
        }
      }
    }


    const objects = {
      orgId: this.orgId,
      bureauConfigName: this.bureauConfigName,
      userId: this.userId,
      id: this.editId,
      isCibilCheck: this.isCibilCheck,
      isExperianCheck: this.isExperianCheck,
      isCrifCheck: this.isCrifCheck,
      status: (this.isCibilCheck || this.isExperianCheck || this.isCrifCheck) ? 1 : 3,
      returnAry: this.schemeArray,
      selectValueTemp: this.selectValueTemp,
      secondaryBureauDropDownTemp: this.secondaryBureauDropDownTemp,
      primaryBureauValue: this.selectValue,
      secondaryBureauValue: this.secondaryBureau,
      isTransunionCommercialFlag: this.isTransunionCommercialFlag,
      isTransunionIndividualFlag: this.isTransunionIndividualFlag,
      isExperianCommercialFlag: this.isExperianCommercialFlag,
      isExperianIndividualFlag: this.isExperianIndividualFlag,
      isCrifCheckCommercialFlag: this.isCrifCheckCommercialFlag,
      isCrifCheckIndividualFlag: this.isCrifCheckIndividualFlag
    };
    // console.log('objects: ', objects);

    this.msmeService.saveBureauConfig(objects).subscribe(response => {
      if (response && response.status === 200) {
        this.commonService.successSnackBar('Bureau configure successfully updated!!');
        //  this.router.navigate(['/Config/BureauConfig-Edit']);
        this.router.navigate(['/BL/BureauConfiguration']);

      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });
  }

  dataPushNew(isCibilCheck: Boolean, type, value: Number) {
    if (isCibilCheck && value === 1) {
      //  console.log("call first   ::: {}", value);
      const json = {
        label: type,
        id: value,
      };
      this.selectValueTemp.push(json);
    }


    // if(isCibilCheck && value == 2) {
    //         console.log("call second   ::: {}", value);
    //   const json = {
    //     label: type,
    //     id: value,
    //   }
    //   this.secondaryBureauDropDownTemp.push(json);
    // }

  }

  onClickValueChange(YesAndNoValue: Boolean) {
    // console.log("onclick yes and no value  ::::::::", YesAndNoValue);
    this.DropDownValue = this.YesAndNoValue;

  }

  //  This js On Window Scroll Top set Cont Dont Remove @Nikul

  //  This js On Window Scroll Top set Cont Dont Remove @Nikul
  // Windi scroll Function
  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(e: any) {
  //   if (window.pageYOffset > 360) {
  //     let element: any = document.getElementById('stick-headerN');
  //     element.classList.add('fix-to-top');
  //     this.adjustWidth();
  //   } else {
  //     let element: any = document.getElementById('stick-headerN');
  //     element.classList.remove('fix-to-top');
  //     //this.adjustWidthRemove();]
  //     // Fix After Remove Css
  //     let stickN: any = document.getElementById('stick-headerN');
  //     stickN.style.width = "100%"
  //   }
  // }

  adjustWidth() {
    var parentwidth = $(".parent").width();
    $(".fix-to-top").width(parentwidth);
    // console.log(parentwidth);
  }
  //  This js On Window Scroll Top set Cont Dont Remove @Nikul

  // Bureau_Change_Popup(popUpId: Number) {
  //   const config = {
  //     windowClass: 'popup-400',
  //     size: 'sm',
  //   };
  //   const objData = { popUpId: popUpId, orgId: this.orgId, schemeArray: this.schemeArray, editId: this.editId, activateTab: this.activateTab };
  //   this.commonService.openPopUp(objData, BRCExperianCommercialConfigurationComponent, false, config).result.then(result => {
  //   });
  // }

  // Bureau_Status_Popup() {
  //   const config = {
  //     windowClass: 'popup-400',
  //     // size: 'sm'
  //   };
  //   const modalRef = this.modalService.open(BRCExperianCommercialStatusComponent, config);
  //   return modalRef;
  // }

  editConfig(id: Number) {
    // console.log("edit id here  :: {}",this.id);
    // this.router.navigate(['/Config/BureauConfig-AddNew']);
    this.router.navigate(['/Config/BureauConfig-AddNew'], {
      queryParams: {
        id: this.commonService.encryptFunction(id.toString()),
        activateTab: this.commonService.encryptFunction(this.activateTab.toString())
      }
    });
    //routerLink="/Config/BureauConfig-AddNew"
  }

  getSize(param) {
    return param ? _.size(JSON.parse(param)) : null;
  }

  getSchemeNames(param) {
    const returnAry = [];
    if (param) {
      const json = JSON.parse(param);
      const schemeList = _.cloneDeep(Constants.schemeList);
      for (const iterator of json) {
        const obj = _.find(schemeList, ['id', iterator]);
        if (obj) {
          returnAry.push(obj.code);
        }
      }
    }
    return returnAry;
  }

  getSchemeIds(param) {
    const returnAry = [];
    if (param) {
      const json = JSON.parse(param);
      const schemeList = _.cloneDeep(Constants.schemeList);
      for (const iterator of json) {
        const obj = _.find(schemeList, ['id', iterator]);
        if (obj) {
          returnAry.push(obj.id);
        }
      }
    }
    return returnAry;
  }

  saveAndUpdateBureau() {
    if (!this.isExperianCheck && !this.isCibilCheck && !this.isCrifCheck) {
      this.commonService.warningSnackBar('Please select atleast one Bureau Preferences!! ');
      return;
    }
    const checkData = this.getEditMasterList(this.editId, this.activateTab, true, this.isCibilCheck, this.isExperianCheck, this.isCrifCheck);
  }

  crifCheckPopup(isCibilCheck: Boolean){
    if(isCibilCheck){
      const config = {
        windowClass: 'popup-650',
        size: 'lg',
        centered: true ,
      };
      const modalRef = this.modalService.open(null, config);
      modalRef.componentInstance.popUpObj = this;
      return modalRef;
    }
    return null;
  }

  Bureau_Change_Popup(popUpId?: Number) {
    GlobalHeaders['x-page-action'] = 'Update Cibil';
    const config = {
      windowClass: 'popup-650',
      size: 'sm',
    };
    const objData = { popUpId: popUpId, orgId: this.orgId, schemeArray: this.schemeArray, editId: true, activateTab: this.activateTab };
    this.commonService.openPopUp(objData, BRCConfigurationPopupComponent, false, config).result.then(result => {
    });
  }

  layer7_change_Popup(popUpId?: Number) {
    GlobalHeaders['x-page-action'] = 'Update Cibil';
    const config = {
      windowClass: 'popup-650',
      size: 'sm',
    };
    const objData = { popUpId: popUpId, orgId: this.orgId, schemeArray: this.schemeArray, editId: true, activateTab: this.activateTab };
    this.commonService.openPopUp(objData, Layer7ConfigurationPopupComponent, false, config).result.then(result => {
    });
  }

  Bureau_Status_Popup() {
    const config = {
      windowClass: 'popup-650',
      // size: 'sm'
    };
    this.commonService.openPopUp('', BRCConfigurationStatusComponent, false, config).result.then(result => {
    });
  }

  Bureau_Confirm_Popup() {
    const config = {
      windowClass: 'popup-650',
      // size: 'sm'
    };
    this.commonService.openPopUp('', BRCConfirmationPopupComponent, false, config).result.then(result => {
    });
  }

  activeInactive() {
    GlobalHeaders['x-page-action'] = 'activeInactive';
    const objects = {
      orgId: this.orgId,
      bureauConfigName: this.bureauConfigName,
      userId: this.userId,
      id: this.editId,
      isCibilCheck: this.isCibilCheck,
      isCibilLayer7Check : this.isCibilLayer7Check,
      isExperianCheck: this.isExperianCheck,
      isCrifCheck: this.isCrifCheck,
      status: (this.isCibilCheck || this.isExperianCheck || this.isCrifCheck) ? 1 : 3,
      returnAry: this.schemeArray,
      selectValueTemp: this.selectValueTemp,
      secondaryBureauDropDownTemp: this.secondaryBureauDropDownTemp,
      primaryBureauValue: this.selectValue,
      secondaryBureauValue: this.secondaryBureau,
      isTransunionCommercialFlag: this.isTransunionCommercialFlag,
      isTransunionIndividualFlag: this.isTransunionIndividualFlag,
      isExperianCommercialFlag: this.isExperianCommercialFlag,
      isExperianIndividualFlag: this.isExperianIndividualFlag,
      isCrifCheckCommercialFlag: this.isCrifCheckCommercialFlag,
      isCrifCheckIndividualFlag: this.isCrifCheckIndividualFlag
    };
    // console.log('objects: ', objects);

    this.msmeService.saveBureauConfig(objects).subscribe(response => {
      if (response && response.status === 200) {
        this.commonService.successSnackBar('Bureau configure successfully updated!!');
        //  this.router.navigate(['/Config/BureauConfig-Edit']);
        this.router.navigate(['/BL/BureauConfiguration']);

      }
    }, (error: any) => {
      this.commonService.errorSnackBar(error);
    });
  }

  updateSource() {
    GlobalHeaders['x-page-action'] = 'activeInactive';
    const newSource = this.source === 1 ? 2 : this.source === 2 ? 1 : this.source;
    const sourceReqObject = {
    source: newSource,
    orgId: this.orgId,
    userId: this.userId
  };

  this.msmeService.updateSourceLayer7Data(sourceReqObject).subscribe(
    (response: any) => {
      console.log('Source update response', response);
      if (response && response.status === 200) {
        this.commonService.successSnackBar(newSource === 1 ?'Now source is CIBIL Base version !!':'Now source is Cibil Layer 7 !!');
        this.getEditMasterList(this.editId, this.activateTab, null);
        // this.redirect();
      }
    },
    (error: any) => {
      this.commonService.errorSnackBar('Error updating Layer7 Source');
    }
  );
  }

   getClinetUpdateRejectionReasonList(callback?: Function) {

  this.msmeService.getClientUpdateAndRejectionReasonList().subscribe(
    (response: any) => {

      if (response && response.status === 200) {

        // Full lists
        this.rejectionReasonList = response.data?.reject || [];
        this.clientUpdateList = response.data?.work_in_progress || [];
        this.threshold=response.data?.threshold || [];
        const activeThreshold = this.threshold.find(t => t.isActive);
        this.activeThresholdValue = activeThreshold?.reasonName || '';
        // Set totals
        this.rejectionTotalSize = this.rejectionReasonList.length;
        this.clientTotalSize = this.clientUpdateList.length;

        // Reset pages
        this.rejectionPage = 1;
        this.clientPage = 1;

        // Apply pagination
        this.applyRejectionPagination();
        this.applyClientPagination();

        if (callback) callback();
      }
    },
    () => {
      this.commonService.errorSnackBar('Something Went Wrong');
      if (callback) callback();
    }
  );
}
applyRejectionPagination() {
  this.rejectionStartIndex =
    (this.rejectionPage - 1) * this.rejectionPageSize;

  this.rejectionEndIndex =
    this.rejectionStartIndex + this.rejectionPageSize;

  this.paginatedRejectionList =
    this.rejectionReasonList.slice(
      this.rejectionStartIndex,
      this.rejectionEndIndex
    );
}
applyClientPagination() {
  this.clientStartIndex =
    (this.clientPage - 1) * this.clientPageSize;

  this.clientEndIndex =
    this.clientStartIndex + this.clientPageSize;

  this.paginatedClientUpdateList =
    this.clientUpdateList.slice(
      this.clientStartIndex,
      this.clientEndIndex
    );
}
onRejectionPageChange(page: number) {
  this.rejectionPage = page;
  this.applyRejectionPagination();
}

onClientPageChange(page: number) {
  this.clientPage = page;
  this.applyClientPagination();
}
onRejectionPageSizeChange(size: number) {
  this.rejectionPageSize = size;
  this.rejectionPage = 1;
  this.applyRejectionPagination();
}

onClientPageSizeChange(size: number) {
  this.clientPageSize = size;
  this.clientPage = 1;
  this.applyClientPagination();
}


  redirect() {

      this.router.navigate(['/bureauConfig']);
    }

    toggleStatus(checked: any, reason: any) {
    reason.isActive = checked;
    console.log("toggle status changed ",checked,reason)
    const data = {
      id: reason.id,
      isActive: checked ? 1 : 0,
    };

    this.msmeService.rejectionRemarkStatus(data).subscribe((res) => {
      if (res.status === 200) {
        this.commonService.successSnackBar(res.message);
        this.getClinetUpdateRejectionReasonList();
      } else {
        this.commonService.warningSnackBar(res.message);
      }
    });
  }

  // ==================== STAFF HIERARCHY ROLE METHODS ====================

  loadStaffHierarchyRoles(): void {
    this.staffHierarchyRolesLoading = true;
    this.staffHierarchyRolesError = null;

    this.msmeService.getStaffHierarchyRoleList().subscribe(
      (response: any) => {
        this.staffHierarchyRolesLoading = false;
        if (response && response.status === 200) {
          this.staffHierarchyRoles = response.data || [];
          this.staffRoleTotalSize = this.staffHierarchyRoles.length;
          this.applyStaffRolePagination();
        } else {
          this.staffHierarchyRolesError = response.message || 'Failed to load data';
          this.commonService.warningSnackBar(this.staffHierarchyRolesError);
        }
      },
      (error: any) => {
        this.staffHierarchyRolesLoading = false;
        if (error.status === 401) {
          this.authGuard.logoutUser();
        } else {
          this.staffHierarchyRolesError = 'Failed to load hierarchy roles. Please try again.';
          this.commonService.errorSnackBar(this.staffHierarchyRolesError);
        }
      }
    );
  }

  applyStaffRolePagination(): void {
    this.staffRoleStartIndex = (this.staffRolePage - 1) * this.staffRolePageSize;
    const endIndex = this.staffRoleStartIndex + this.staffRolePageSize;
    this.paginatedStaffRoles = this.staffHierarchyRoles.slice(this.staffRoleStartIndex, endIndex);
  }

  onStaffRolePageChange(page: number): void {
    this.staffRolePage = page;
    this.applyStaffRolePagination();
  }

  onStaffRolePageSizeChange(size: number): void {
    this.staffRolePageSize = size;
    this.staffRolePage = 1;
    this.applyStaffRolePagination();
  }

  // Inline Editing Methods
  startEditing(role: any, field: 'rmRole'): void {
    this.editingRoleId = role.id;
    this.editingField = field;
    this.editingValue = role[field];
    this.originalValue = role[field];
  }

  cancelEditing(): void {
    this.editingRoleId = null;
    this.editingField = null;
    this.editingValue = '';
    this.originalValue = '';
  }

  isEditing(role: any, field: 'rmRole'): boolean {
    return this.editingRoleId === role.id && this.editingField === field;
  }

  validateRoleField(value: string): boolean {
    return value && value.trim().length > 0 && value.trim().length <= 50;
  }

  saveEditing(role: any): void {
    if (!this.validateRoleField(this.editingValue)) {
      this.commonService.warningSnackBar('Field cannot be empty and must be less than 50 characters');
      return;
    }

    if (this.editingValue.trim() === this.originalValue.trim()) {
      this.cancelEditing();
      return;
    }

    const updateData = {
      id: role.id,
      rmType: role.rmType,
      rmRole: this.editingValue.trim(),
      isActive: role.isActive
    };

    this.msmeService.updateStaffHierarchyRole(updateData).subscribe(
      (response: any) => {
        if (response && response.status === 200) {
          this.commonService.successSnackBar(response.message || 'Role updated successfully');
          // Update local data
          const index = this.staffHierarchyRoles.findIndex(r => r.id === role.id);
          if (index !== -1) {
            this.staffHierarchyRoles[index] = { ...this.staffHierarchyRoles[index], ...updateData };
            this.applyStaffRolePagination();
          }
          this.cancelEditing();
        } else {
          this.commonService.warningSnackBar(response.message || 'Failed to update role');
        }
      },
      (error: any) => {
        this.commonService.errorSnackBar('Error updating role. Please try again.');
        // Revert to original value
        this.editingValue = this.originalValue;
      }
    );
  }

  onEditBlur(role: any): void {
    // Small delay to allow click events to fire first
    setTimeout(() => {
      if (this.editingRoleId === role.id) {
        this.saveEditing(role);
      }
    }, 150);
  }

  onEditKeydown(event: KeyboardEvent, role: any): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveEditing(role);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditing();
    }
  }

  toggleStaffRoleStatus(role: any, checked: boolean): void {
    const updateData = {
      id: role.id,
      rmType: role.rmType,
      rmRole: role.rmRole,
      isActive: checked
    };

    this.msmeService.updateStaffHierarchyRole(updateData).subscribe(
      (response: any) => {
        if (response && response.status === 200) {
          this.commonService.successSnackBar(response.message || 'Status updated successfully');
          // Update local data
          const index = this.staffHierarchyRoles.findIndex(r => r.id === role.id);
          if (index !== -1) {
            this.staffHierarchyRoles[index].isActive = checked;
            this.applyStaffRolePagination();
          }
        } else {
          this.commonService.warningSnackBar(response.message || 'Failed to update status');
          // Revert the toggle
          role.isActive = !checked;
        }
      },
      (error: any) => {
        this.commonService.errorSnackBar('Error updating status. Please try again.');
        // Revert the toggle
        role.isActive = !checked;
      }
    );
  }

  // ==================== END STAFF HIERARCHY ROLE METHODS ====================

  pageSizeChange(size:any,page:any){
  this.pageSize = size;
  this.startIndex = (page - 1) * this.pageSize;
  this.endIndex = (page - 1) * this.pageSize + this.pageSize;

 }
onPageChange(page: any): void {
    console.log("onPageChange");
    //console.logpage);
    this.startIndex = (page - 1) * this.pageSize;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;

    // this.callFilterOnTab();
  }

  resetStartIndex(): void {
    //console.log"in reset");
    this.startIndex = 0;
    this.page = 1;
    this.pageSize = 10;

  }

  onThresholdInput(event: any): void {
    let value = event.target.value;
    value = value.replace(/^0+/, '').replace(/\D/g, '').slice(0, 4);
    this.thresholdValue = value;
    event.target.value = this.thresholdValue;
  }
  // Helper to check if field is empty or whitespace only
// isFieldEmpty(value: string | undefined): boolean {
//   return !value || value.trim().length === 0;
// }

// hasAtLeastOneLetter(value: string | undefined): boolean {
//   if (this.isFieldEmpty(value)) {
//     return true; // Don't show "no letter" error if field is empty
//   }
//   return /[A-Za-z]/.test(value!.trim());
// }



onTabChange(event: MatTabChangeEvent) {

  this.selectedTabIndex = event.index;
  const label = event.tab.textLabel;
  if(label == "Receivable Finance - Configuration") {

    this.getConfigMasterListFromRf();
    this.getAllRulesLevels();

  } else if(label == "Staff Hierarchy Roles") {
    // Load Staff Hierarchy Roles data when tab is activated
    if (this.staffHierarchyRoles.length === 0) {
      this.loadStaffHierarchyRoles();
    }
  }

}

// ==================== AUTHORIZATION MATRIX FUNCTIONALITY ====================

getConfigMasterListFromRf() {
  const configRequest = {
    configNames: ['CURRENCY']
  }

  this.msmeService.getConfigMasterListFromRf(configRequest).subscribe({
    next: (res: any) => {
      if(res.status == 200 && res.data) {
        this.configMasteListRes = res.data;
        console.log('this.configMasteListRes: ', this.configMasteListRes);
      }
      else if(res.status == 404) {
        this.commonService.infoSnackBar(res.message);
      }
    },
    error: err => {
      console.error('API error For getConfigMasterList() ::::::> ', err);
    }
  });
}

getAllRulesLevels() {
  this.msmeService.getAllRulesLevels().subscribe({
    next: (res: any) => {
      if(res.status == 200 && res.data) {
        this.ruleLevelsResListByRf = res.data;
        if (this.ruleLevelsResListByRf && this.ruleLevelsResListByRf.length > 0) {
          this.loadExistingRulesIntoForm(this.ruleLevelsResListByRf);
        }
        else {
          this.commonService.errorSnackBar(res.message);
        }
      }
    },
    error: err => {
      console.error('API error For getAllRulesLevels() ::::::> ', err);
    }
  });
}

// Load existing rules data into the form
loadExistingRulesIntoForm(existingRules: any[]): void {
  this.authorizationMatrixForm = this.fb.group({
    levels: this.fb.array([])
  });

  existingRules.forEach((rule, index) => {

    const ruleDetail = rule.ruleDetails && rule.ruleDetails.length > 0 ? rule.ruleDetails[0] : null;
    const hasNoLimit = !ruleDetail || !ruleDetail.value;
    const limitType = hasNoLimit ? 'noLimit' : 'amount';

    const levelFormGroup = this.fb.group({
      id: [rule?.id],
      levelNumber: [index + 1],
      ruleName: [rule.ruleName || `Level ${index + 1}`],
      ruleDetails: this.fb.group({
        id: [ruleDetail?.id],
        parameterValue: [ruleDetail?.parameterValue || 'RF Facility Amount'],
        paramType: [ruleDetail?.paramType || 'amount'],
        value: [ruleDetail?.value || '', hasNoLimit ? [] : [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
        subValue: [ruleDetail?.subValue || '', [Validators.required]],
        operator: [ruleDetail?.operator || 'LTE'],
      }),
      limitType: [limitType]
    });

    this.levelsFormArray.push(levelFormGroup);

    if (hasNoLimit) {
      const ruleDetailsControl = levelFormGroup.get('ruleDetails');
      const valueControl = ruleDetailsControl?.get('value');
      const subValueControl = ruleDetailsControl?.get('subValue');

      // Disable controls when No Limit is loaded from API
      valueControl?.disable();
      subValueControl?.disable();
    }

  });
}

initializeAuthorizationMatrixForm(): void {
  this.authorizationMatrixForm = this.fb.group({
    levels: this.fb.array([this.createLevelFormGroup(1)])
  });
}

// Create a single level form group
createLevelFormGroup(levelNumber: number): FormGroup {
  return this.fb.group({
    levelNumber: [levelNumber],
    ruleName: [`Level ${levelNumber}`],
    ruleDetails: this.fb.group({
      parameterValue: ['RF Facility Amount'],
      paramType: ['AMOUNT'],
      value: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      subValue: [null, [Validators.required]],
      operator: ['LTE'],
    }),
    limitType: ['amount'],
  });
}

// Get levels FormArray
get levelsFormArray(): FormArray {
  return this.authorizationMatrixForm.get('levels') as FormArray;
}

// Add new level
addMoreLevel(): void {
  // Before adding new level, remove "No Limit" option from all existing levels
  for (let i = 0; i < this.levelsFormArray.length; i++) {
    const levelControl = this.levelsFormArray.at(i);
    const currentLimitType = levelControl.get('limitType')?.value;

    if (currentLimitType === 'noLimit') {
      // Change from "No Limit" to "amount" and clear the amount field
      levelControl.patchValue({limitType: 'amount'});

      const ruleDetailsControl = levelControl.get('ruleDetails');
      ruleDetailsControl?.patchValue({value: ''});

      const valueControl = ruleDetailsControl?.get('value');
      valueControl?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
      valueControl?.updateValueAndValidity();
    }
  }

  const currentLevels = this.levelsFormArray.length;
  const newLevelNumber = currentLevels + 1;
  const newLevel = this.createLevelFormGroup(newLevelNumber);
  this.levelsFormArray.push(newLevel);
}

// Remove latest level
removeLatestLevel(): void {
  if (this.levelsFormArray.length > 1) {

    const levelControl = this.levelsFormArray.at(this.levelsFormArray.length - 1);
    const masterId = levelControl.get('id')?.value;

    if(this.commonService.isObjectNullOrEmpty(masterId)){
      this.levelsFormArray.removeAt(this.levelsFormArray.length - 1);
    }
    else {
      this.msmeService.deleteRuleMasterByRF(masterId).subscribe({
        next: (response: any) => {
          if (response && response.status === 200) {
            this.commonService.successSnackBar(response.message || 'Authorization Matrix deleted successfully!');
            this.getAllRulesLevels();
          }
          else {
            this.commonService.warningSnackBar(response.message || 'Authorization level not found. It may have been already deleted');
          }
        },
        error: (error: any) => {
          console.error('Error saving Authorization Matrix:', error);
          this.commonService.errorSnackBar(error.message??'Error occurred while saving Authorization Matrix');
        }
      });
    }
  }
}

// Toggle between amount limit and no limit
onLimitTypeChange(levelIndex: number, limitType: string): void {
  const levelControl = this.levelsFormArray.at(levelIndex);
  const ruleDetailsControl = levelControl.get('ruleDetails');
  const valueControl = ruleDetailsControl?.get('value');
  const subValueControl = ruleDetailsControl?.get('subValue');

  if (limitType === 'noLimit') {
    // Clear amount field and disable controls when No Limit is selected
    valueControl?.setValue('');
    subValueControl?.setValue('');
    valueControl?.disable();
    subValueControl?.disable();
    valueControl?.clearValidators();

    // When "No Limit" is selected, remove "No Limit" from all other levels
    for (let i = 0; i < this.levelsFormArray.length; i++) {
      if (i !== levelIndex) {
        const otherLevelControl = this.levelsFormArray.at(i);
        const otherLimitType = otherLevelControl.get('limitType')?.value;

        if (otherLimitType === 'noLimit') {

          otherLevelControl.patchValue({limitType: 'amount'});

          const otherRuleDetailsControl = otherLevelControl.get('ruleDetails');
          const otherValueControl = otherRuleDetailsControl?.get('value');
          const otherSubValueControl = otherRuleDetailsControl?.get('subValue');
          otherValueControl?.enable();
          otherSubValueControl?.enable();
          otherValueControl?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
          otherValueControl?.updateValueAndValidity();
        }
      }
    }
  }
  else {
    // Enable controls when Amount is selected
    valueControl?.enable();
    subValueControl?.enable();
    valueControl?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
  }

  valueControl?.updateValueAndValidity();
}


// Get currency symbol for a specific level
getLevelCurrencySymbol(levelIndex: number): string {
  const levelControl = this.levelsFormArray.at(levelIndex);
  const limitType = levelControl.get('limitType')?.value;
  if (limitType === 'noLimit') {return '₹';}
  const currencyCode = levelControl.get('ruleDetails.subValue')?.value;
  if (!currencyCode) return '₹';
  const list = this.configMasteListRes?.CURRENCY || [];
  const item: any = list.find(i => i.key === currencyCode);
  return item?.description ?? '₹';
}

saveAuthorizationMatrix(): void {

  this.markFormGroupTouched(this.authorizationMatrixForm);
  if (!this.authorizationMatrixForm.valid) {
    this.commonService.warningSnackBar('Please fill all required fields correctly.');
    return;
  }

  const formData = this.authorizationMatrixForm.value;
  const authorizationMatrixData = formData.levels.map((level: any) => ({
    ruleName: level.ruleName,
    id: level?.id??null,
    ruleDetails: [{
      id: level.ruleDetails?.id??null,
      parameterValue: level.ruleDetails.parameterValue,
      paramType: level.ruleDetails.paramType,
      value: level.limitType === 'amount' ? level.ruleDetails.value : null,
      subValue: level.limitType === 'amount' ? level.ruleDetails.subValue : null,
      operator: level.ruleDetails.operator,
    }]
  }));

  const requestRuleDetails = {
    ruleMaster: authorizationMatrixData
  }

  this.msmeService.saveAuthorizationMatrix(requestRuleDetails).subscribe({
    next: (response: any) => {

      if (response && response.status === 200) {
        this.commonService.successSnackBar(response.message || 'Authorization Matrix saved successfully!');
        this.getAllRulesLevels();
        // Optionally reload the data or reset form
        // this.loadAuthorizationMatrix();
      }
      else {
        this.commonService.warningSnackBar(response.message || 'Failed to save Authorization Matrix');
      }
    },
    error: (error: any) => {
      console.error('Error saving Authorization Matrix:', error);
      this.commonService.errorSnackBar(error.message??'Error occurred while saving Authorization Matrix');
    }
  });
}

// Cancel Authorization Matrix changes
cancelAuthorizationMatrix(): void {
  this.initializeAuthorizationMatrixForm();
  this.commonService.infoSnackBar('Changes cancelled.');
}

// Mark all form controls as touched to show validation errors
private markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    control?.markAsTouched();

    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    }
    else if (control instanceof FormArray) {
      control.controls.forEach(arrayControl => {
        if (arrayControl instanceof FormGroup) {
          this.markFormGroupTouched(arrayControl);
        }
      });
    }
  });
}

canShowNoLimitOption(levelIndex: number): boolean {
  const totalLevels = this.levelsFormArray.length;
  if (totalLevels === 1) {
    return true;
  }
  return levelIndex === totalLevels - 1;
}

isAddMoreLevelDisabled(): boolean {
  const totalLevels = this.levelsFormArray.length;
  if (totalLevels === 1) {
    const firstLevel = this.levelsFormArray.at(0);
    const limitType = firstLevel.get('limitType')?.value;
    return limitType === 'noLimit';
  }

  const lastLevel = this.levelsFormArray.at(totalLevels - 1);
  const lastLevelLimitType = lastLevel.get('limitType')?.value;
  return lastLevelLimitType === 'noLimit';
}

// ==================== END NEW AUTHORIZATION MATRIX BUSINESS LOGIC METHODS ====================

}
