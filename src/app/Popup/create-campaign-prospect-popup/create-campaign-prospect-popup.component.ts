import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { ExistingProspectsDropDownService } from 'src/app/services/existing-target-prospects-drop-down.service';
import { MsmeService } from 'src/app/services/msme.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-create-campaign-prospect-popup',
  templateUrl: './create-campaign-prospect-popup.component.html',
  styleUrl: './create-campaign-prospect-popup.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)', height: 0, overflow: 'hidden' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)', height: '*', overflow: 'hidden' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)', height: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class CreateCampaignProspectPopupComponent {
  constructor(
    private router: Router, private dialogRef: MatDialogRef<CreateCampaignProspectPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public commonService: CommonService, private cdr: ChangeDetectorRef, private existingProspectsDropDownService: ExistingProspectsDropDownService,
    private msmeService: MsmeService, private ws: WebSocketService
  ) {
    this.roleId = data?.roleId ? Number(data.roleId) : Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.customerCount = data?.customerCount;
    this.selectedCustomers = data?.selectedCustomers;
    this.inEditMode = data?.edit || false;
    this.fieldsDisabled = this.inEditMode;
    this.allCampaignData = data?.allCampaignData;
    this.campaignOptions = this.allCampaignData?.filter(campaign => campaign.campaignId != 0 && (campaign?.isCampaign === true))
      ?.map((campaign) => ({ id: campaign.campaignId, campaignName: campaign.campaignName, isCampaign: campaign.isCampaign, createdById: campaign.createdById })) || [];
    this.filteredCampaigns = this.campaignOptions;
    this.filterDataList = data?.filterDataList;
    this.includeInactiveCampaigns = data?.includeInactiveCampaigns;
    // this.filteredKeyValueList = data?.filteredKeyValueList;
    this.parameters = this.formatFilteredData(this.filterDataList);
    this.isNTB = data?.isNTB;
    this.getCustomerPayload = data?.getCustomerPayload;
    this.isAssignedAllCustomer = data?.isAssignedAllCustomer;
    this.customerTypeId = data?.customerTypeId || null;
  }

  startDate: Date;
  endDate: Date;
  campaignName: any;
  selectedCampaign: any;
  estimatedRevenue: any;
  objective: any;
  parameters: any;
  fetchFreshCIR: any = 'no';
  preApprovedOffer: any = 'no';
  loadProductDropDown: Boolean = false;
  inEditMode: Boolean = false;
  customerCount: any;
  filteredCampaigns: any[] = [];
  fieldsDisabled: Boolean = false;
  markInactive: Boolean = false;
  allProductList: any[] = [];
  selectedProducts: any = {};
  selectedCustomers: any[] = [];
  campaignOptions: any[] = [];
  allCampaignData: any[] = [];
  filterDataList: any[] = [];
  filteredKeyValueList: any[] = [];
  // pmName: any;
  includeInactiveCampaigns: Boolean = false;
  pageData: any;
  constants: any;
  campaignSearchText: any;
  roleId: any;
  selectedCustomerDetails: Map<number, { customerName: string, customerId: string, pan: string, rmId: string, customerType: number, }> = new Map();
  isNTB: Boolean = false;
  toDateError: string = '';
  isToDateInvalid: boolean = false;
  showCheckboxError: boolean = false;
  getCustomerPayload: any;
  isAssignedAllCustomer: Boolean;
  isSubmitButtonDisabled: boolean = false;
  roleType: any;
  customerTypeId: number | null = null;
  
  // CIR counts data
  staleCibilCount: number = 0;
  missingCibilCount: number = 0;
  totalCibilCount: number = 0;
  inProgressCibilCount: number = 0;
  cibilAvailableCount: number = 0;
  cibilAvailableNullCount: number = 0;
  notOptedCount: number = 0;
  pendingCount: number = 0;
  cirRejectedCount: number = 0;
  cirApprovalPendingCount: number = 0;
  cirApprovalCount: number = 0;
  canProceedJourney: boolean = false;
  cirCountsLoaded: boolean = false;
  reRunPreApproval: boolean = false;
  isRetryJourneyDone: boolean = false;
  previouslySelectedCampaignId: number | null = null;
  allCibilAlreadyAvailable: boolean = false;
  ngOnInit() {
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.constants = Constants;
    this.pageData = history.state.data;
    if (!this.pageData || this.pageData === 'undefined' || this.pageData === undefined) {
      const parentPage = this.consValue.pageMaster.CAMPAIGN_DASHBOARD ?? this.consValue.pageMaster.PORTFOLIO_ANALYSIS ?? this.consValue.pageMaster.PRODUCT_APPROVAL_JOURNEY;
      this.pageData = this.commonService.getPageData(this.consValue.pageMaster.PORTFOLIO_ANALYSIS, this.consValue.pageMaster.CAMPAIGN_DASHBOARD, this.consValue.pageMaster.NTB_CAMPAIGN_DASHBOARD);
    }
    // this.allProductList = this.existingProspectsDropDownService.getPreApprovedDropdownOptions();
    if (!this.inEditMode) {
      this.startDate = new Date();
      this.getAllProductName();
    }
    // this.pmName = this.commonService.getStorage(Constants.httpAndCookies.USER_NAME, true);
  }
  protected readonly consValue = Constants;
  filterCampaigns() {
    if (!this.campaignName || typeof this.campaignName !== 'string') {
      this.filteredCampaigns = this.campaignOptions;
      return;
    }

    const search = this.campaignName.toLowerCase().trim();
    this.filteredCampaigns = this.campaignOptions.filter(campaign =>
      campaign.campaignName.toLowerCase().trim().includes(search)
    );
  }

  onCampaignSelected(event: any) {
    this.selectedCampaign = event.option.value;
    this.campaignName = this.selectedCampaign.campaignName;
    const campaignData = this.allCampaignData.find(campaign => campaign.campaignId === this.selectedCampaign.id);

    if (campaignData) {
      this.estimatedRevenue = campaignData.revenue ? this.formatRevenue(campaignData.revenue, true) : '';
      this.objective = campaignData.objective || '';
      this.parameters = campaignData.parameter || '';
      this.customerCount = campaignData.customerCount || '';
      this.startDate = campaignData.fromDate ? new Date(campaignData.fromDate) : null;
      this.endDate = campaignData.toDate ? new Date(campaignData.toDate) : null;
      this.isRetryJourneyDone = campaignData.isRetryJourneyDone || false;

      // Check if this is a different campaign than previously selected
      const isDifferentCampaign = this.previouslySelectedCampaignId !== this.selectedCampaign.id;

      // Only fetch CIR counts if:
      // 1. It's a different campaign than previously selected
      // 2. AND retry journey is not done
      if (isDifferentCampaign && !this.isRetryJourneyDone) {
        this.fetchCirCountsForCampaign(this.selectedCampaign.id);
        this.previouslySelectedCampaignId = this.selectedCampaign.id;
      } else if (isDifferentCampaign && this.isRetryJourneyDone) {
        // Different campaign but retry journey done - just mark as loaded
        setTimeout(() => {
          this.cirCountsLoaded = true;
          this.staleCibilCount = 0;
          this.missingCibilCount = 0;
          this.inProgressCibilCount = 0;
          this.totalCibilCount = 0;
          this.previouslySelectedCampaignId = this.selectedCampaign.id;
        });
      }
      // If same campaign selected again, do nothing (keep existing data)

      // Validate to_date
      this.validateToDate();

      if (!this.includeInactiveCampaigns && this.endDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.markInactive = this.endDate >= today && !this.isToDateInvalid;
      } else {
        this.markInactive = !(campaignData?.isActive ?? true);
      }

      this.fieldsDisabled = false;
    }
  }

  displayCampaign = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    return value ? value.campaignName : '';
  }

  isFormValid(): boolean {
    const campaignNameValid = this.campaignName?.trim() && this.campaignName.trim().length <= 50;
    const objectiveValid = this.objective?.trim() && this.objective.trim().length <= 250;
    const revenueValid = this.estimatedRevenue?.trim();
    const preApprovedValid = this.preApprovedOffer !== 'yes' || this.isAnyProductSelected();
    const dateValid = !this.isToDateInvalid;
    const inactiveValid = !this.includeInactiveCampaigns ? this.markInactive : true;

    const cirOptionValid = (this.preApprovedOffer !== 'yes') || (this.fetchFreshCIR && this.fetchFreshCIR.length > 0);

    return !!(campaignNameValid && revenueValid && this.startDate &&
      this.endDate && objectiveValid && this.preApprovedOffer && preApprovedValid && dateValid && inactiveValid && cirOptionValid);
  }

  hasInvalidNumberFormat(): boolean {
    if (!this.estimatedRevenue) return false;
    const numericValue = this.estimatedRevenue.replace(/[$,\s]/g, '');
    return numericValue.endsWith('.') || numericValue === '.' || numericValue === '';
  }

  hasInvalidDecimalPlaces(): boolean {
    if (!this.estimatedRevenue) return false;
    const numericValue = this.estimatedRevenue.replace(/[$,\s]/g, '');
    const decimalIndex = numericValue.indexOf('.');
    if (decimalIndex === -1) return false;
    return numericValue.substring(decimalIndex + 1).length > 2;
  }

  isFieldEmpty(field: any): boolean {
    return !field || (typeof field === 'string' && !field.trim());
  }

  isRevenueExceedsLimit(): boolean {
    if (!this.estimatedRevenue) return false;
    const numericValue = this.estimatedRevenue.replace(/[$,\s]/g, '');
    const decimalIndex = numericValue.indexOf('.');
    const integerPart = decimalIndex === -1 ? numericValue : numericValue.substring(0, decimalIndex);
    return integerPart.length > 7;
  }

  onPreApprovedOfferChange(event: any) {
    if (event.value === 'yes') {
      this.loadProductDropDown = true;
    } else {
      this.loadProductDropDown = false;
      this.fetchFreshCIR = 'no';
    }
  }

  // onRevenueInput() {
  //   let value = this.estimatedRevenue || '';
  //   let cleaned = value.replace(/[^0-9.]/g, '');

  //   if (cleaned.startsWith('.')) {
  //     cleaned = '0' + cleaned;
  //   }

  //   if (cleaned) {
  //     const parts = cleaned.split('.');
  //     const integerPart = parts[0] || '0';
  //     let decimalPart = parts[1] !== undefined ? '.' + parts[1] : '';

  //     // Limit decimal places to 2
  //     if (parts[1] && parts[1].length > 2) {
  //       decimalPart = '.' + parts[1].substring(0, 2);
  //     }

  //     const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  //     this.estimatedRevenue = `$ ${formattedInteger}${decimalPart}`;
  //   } else {
  //     this.estimatedRevenue = '';
  //   }
  // }

  onRevenueInput() {
    let value = this.estimatedRevenue || '';

    let digits = value.replace(/[^0-9]/g, '');

    if (!digits) {
      this.estimatedRevenue = '';
      return;
    }

    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    this.estimatedRevenue = `$ ${formatted}`;
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.commonService.warningSnackBar('Please fill all required fields correctly');
      return;
    }

    // Disable submit button immediately
    this.isSubmitButtonDisabled = true;

    if (!this.inEditMode) {
      const customerTypeIds = this.customerTypeId
        ? [this.customerTypeId]
        : [this.constants.CustomerType.PROSPECTS, this.constants.CustomerType.FDI, this.constants.CustomerType.ODI, this.constants.CustomerType.ECB];
      const payload = {
        campaignIds: null,
        pmNames: null,
        isActive: true,
        roleId: this.roleId,
        customerTypeIds: customerTypeIds,
        roleType: this.roleType,
        isForNtb: true,
      }
      this.ws.sendFilterViaSocketClient3(payload, this.constants.SocketFilterRequestTypeForDS.GET_CAMPAIGN_DETAILS);
    }

    const data: any = {
      fromDate: this.startDate ? this.formatDateForBackend(this.startDate) : null,
      toDate: this.endDate ? this.formatDateForBackend(this.endDate) : null,
      campaignName: this.campaignName,
      revenue: this.formatRevenue(this.estimatedRevenue, false),
      objective: this.objective,
      parameters: this.parameters,
      totalCustomer: String(this.customerCount),
      // runPreApprovedOffer: false,
      runPreApprovedOffer: this.preApprovedOffer === 'yes',
      productCampaignMappings: this.getSelectedProducts(),
      customerMappings: this.selectedCustomers,
      filterMappings: this.filterDataList,
      // pmName: this.pmName,
      isForNtb: true,
      getCustomerPayload: this.getCustomerPayload,
      isAssignedAllCustomer: this.isAssignedAllCustomer,
      wantToFetchFreshCIR: this.preApprovedOffer === 'yes' ? (this.fetchFreshCIR === 'yes') : false,
      sourceName: this.constants.SourceNameForCampaign.NTB,
      roleId: this.roleId,
      roleType: this.roleType,
      ...(this.customerTypeId ? { customerTypeId: this.customerTypeId } : {}),
    };

    if (this.inEditMode) {
      if (this.includeInactiveCampaigns) {
        data.markInactive = this.markInactive;
      } else {
        data.markInactive = !this.markInactive;
      }
      data.id = this.selectedCampaign?.id;
      // Add re-run pre-approval flag for edit mode
      data.reRunPreApproval = this.reRunPreApproval;
      // data.markInactive = this.markInactive;
    }

    if (this.isNTB && !this.inEditMode) {
      // Re-enable submit button before closing dialog
      this.isSubmitButtonDisabled = false;
      this.dialogRef.close({ payload: data })
      return;
    }
    else {
      this.msmeService.saveOrUpdateCampaignDetails(data, !this.inEditMode).subscribe((response: any) => {
        // Re-enable submit button after API response
        this.isSubmitButtonDisabled = false;

        if (response && response.status == 200) {
          this.commonService.successSnackBar(response.message);

          // if(this.inEditMode)
          this.dialogRef.close({ updatedCampaignData: true });

          // else if(!this.inEditMode)
          // this.dialogRef.close();

          // if(!this.inEditMode)
          // this.router.navigate(['hsbc/opportunity-dashboard-ntb']);
        } else if (response && response.status == 400) {
          this.commonService.warningSnackBar(response.message);
        } else if (response && response.status == 404) {
          this.commonService.warningSnackBar(response.message);
        } else if (response && response.status == 500) {
          this.commonService.errorSnackBar(response.message);
        }
      }, (error) => {
        // Re-enable submit button on error
        this.isSubmitButtonDisabled = false;
        this.commonService.errorSnackBar('Something Went Wrong');
      });
    }
  }

  get minStartDate(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  get maxStartDate(): Date {
    // if (this.endDate) {
    //   return new Date(new Date(this.endDate).setHours(23, 59, 59, 999));
    // }
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  get minEndDate(): Date {
    if (this.startDate)
      return new Date(new Date(this.startDate).setHours(0, 0, 0, 0));

    else
      return new Date(new Date().setHours(0, 0, 0, 0));
  }

  getMinEndDate(): Date {
    if (this.inEditMode) {
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      if (this.startDate) {
        const startDateNormalized = new Date(new Date(this.startDate).setHours(0, 0, 0, 0));
        return startDateNormalized > today ? startDateNormalized : today;
      }
      return today;
    }
    return this.minEndDate;
  }

  getMaxEndDate(): Date {
    if (this.startDate) {
      const maxDate = new Date(this.startDate);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return maxDate;
    }
    return null;
  }

  // onRevenueKeydown(event: KeyboardEvent) {
  //   const char = event.key;
  //   const currentValue = this.estimatedRevenue || '';
  //   const numericValue = currentValue.replace(/[$,\s]/g, '');
  //   const decimalIndex = numericValue.indexOf('.');

  //   // Allow control keys
  //   if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(char)) {
  //     return true;
  //   }

  //   // Allow decimal point if not already present
  //   if (char === '.' && decimalIndex === -1) {
  //     return true;
  //   }

  //   // Allow digits
  //   if (/[0-9]/.test(char)) {
  //     if (decimalIndex === -1) {
  //       // Before decimal: allow up to 7 digits
  //       if (numericValue.length >= 7) {
  //         event.preventDefault();
  //         return false;
  //       }
  //     } else {
  //       // After decimal: allow up to 2 digits
  //       const decimalPart = numericValue.substring(decimalIndex + 1);
  //       if (decimalPart.length >= 2) {
  //         event.preventDefault();
  //         return false;
  //       }
  //     }

  //     return true;
  //   }

  //   // Prevent all other characters
  //   event.preventDefault();
  //   return false;
  // }

  onRevenueKeydown(event: KeyboardEvent) {
    const char = event.key;

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(char)) return;

    if (/^[0-9]$/.test(char)) {
      if (char === '0') {
        const rawValue = (this.estimatedRevenue || '').replace(/[^0-9]/g, '');
        if (rawValue.length === 0) {
          event.preventDefault();
          return;
        }
      }
      return;
    }

    event.preventDefault();
  }

  formatRevenue(amount: any, convertIntoFormatted: Boolean): any {
    if (convertIntoFormatted) {
      const formatted = new Intl.NumberFormat('en-IN').format(amount);
      return `$ ${formatted}`;
    }
    else {
      const numericValue = amount.replace(/[$,\s]/g, '');
      return numericValue || '0';
    }
  }

  onProductCheckboxChange(item: any, isChecked: boolean) {
    if (item.value === 'All') {
      this.allProductList.forEach(product => {
        this.selectedProducts[product.value] = isChecked;
      });
    } else {
      this.selectedProducts[item.value] = isChecked;
      if (!isChecked) {
        this.selectedProducts['All'] = false;
      } else {
        const nonAllItems = this.allProductList.filter(p => p.value !== 'All');
        const allSelected = nonAllItems.every(p => this.selectedProducts[p.value]);
        this.selectedProducts['All'] = allSelected;
      }
    }
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getSelectedProducts(): any[] {
    const selected = [];
    for (const [key, value] of Object.entries(this.selectedProducts)) {
      if (value && key !== 'All') {
        selected.push({ product: key, productName: this.allProductList.find(product => product?.value === key)?.label });
      }
    }
    return selected;
  }

  filterCampaignOptions() {
    const campaignOptions = this.allCampaignData?.filter(campaign => campaign?.campaignId !== 0 && (campaign?.isCampaign === true))
      ?.map(campaign => ({ id: campaign.campaignId, campaignName: campaign.campaignName, isCampaign: campaign.isCampaign, createdById: campaign.createdById })) || [];

    if (!this.campaignSearchText) {
      this.filteredCampaigns = campaignOptions;
    } else {
      const search = this.campaignSearchText.toLowerCase().trim();
      this.filteredCampaigns = campaignOptions.filter(campaign =>
        campaign.campaignName.toLowerCase().trim().includes(search)
      );
    }
  }

  isAnyProductSelected(): boolean {
    return Object.values(this.selectedProducts).some(selected => selected === true);
  }

  formatFilteredData(filteredList: any[]): string {
    if (!filteredList || filteredList.length === 0) return '';

    const grouped: any = {};

    filteredList.forEach(item => {
      const key = item.subFilterName;
      let val = item.subFilterValue;

      if (item.type === 'radioButton') {

        if (this.RADIO_BUTTON_VALUE_MAP[key]) {
          val = this.RADIO_BUTTON_VALUE_MAP[key][val] || val;
        }
        else {
          if (val === '1' || val?.toLowerCase() === 'yes') val = 'Yes';
          else if (val === '0' || val?.toLowerCase() === 'no') val = 'No';
        }
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(val);
    });

    return Object.keys(grouped)
      .map(key => `${key} : ${grouped[key].join(', ')}`)
      .join(' | ');
  }

  getAllProductName() {
    this.msmeService.getAllProductNames().subscribe(
      (response: any) => {
        if (response && response.status == 200) {
          const dropdownList = [
            { value: 'All', label: 'All' }
          ];

          const dynamicOptions = response.data.map((item: any) => ({
            value: String(item.id),
            label: item.productName
          }));

          this.allProductList = [...dropdownList, ...dynamicOptions];
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }
  onEndDateChange() {
    this.validateToDate();
    if (!this.includeInactiveCampaigns && this.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.markInactive = this.endDate >= today && !this.isToDateInvalid;
    } else {
      this.markInactive = false;
    }
  }

  onMarkInactiveChange(checked: boolean) {
    if (!this.includeInactiveCampaigns && this.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (this.endDate < today && checked) {
        this.markInactive = false;
        this.showCheckboxError = true;
        return;
      }
    }
    this.markInactive = checked;
    this.showCheckboxError = false;
    
    // If marking inactive, reset reRunPreApproval to false
    if (checked) {
      this.reRunPreApproval = false;
    }
  }

  validateToDate() {
    if (this.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(this.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < today) {
        this.isToDateInvalid = true;
        this.toDateError = 'To date must be greater than or equal to today';
        setTimeout(() => {
          const endDateInput = document.querySelector('#endDateInputProspect') as HTMLInputElement;
          if (endDateInput) {
            endDateInput.focus();
            endDateInput.blur();
          }
        });
      } else {
        this.isToDateInvalid = false;
        this.toDateError = '';
      }
    } else {
      this.isToDateInvalid = false;
      this.toDateError = '';
    }
  }

  isEndDateInvalid(): boolean {
    if (!this.includeInactiveCampaigns && this.endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.endDate < today && !this.markInactive;
    }
    return false;
  }

  readonly RADIO_BUTTON_VALUE_MAP: any = {
    "Availed From": {
      "1": "None",
      "2": "Only Competition",
      "3": "Only HSBC",
      "4": "Both HSBC & Competition"
    },
    "Sanction/Utilization": {
      "1": "Sanction",
      "0": "Utilization"
    },
    "Listing Status": {
      "1": "Listed",
      "0": "Unlisted",
      "1,2": "All"
    },
    "Financial Year": {
      "1": "Previous Financial Year",
      "0": "Current Financial Year"
    }
  };

  fetchCirCountsForCampaign(campaignId: number) {
    this.cirCountsLoaded = false;
    this.staleCibilCount = 0;
    this.missingCibilCount = 0;
    this.totalCibilCount = 0;
    this.inProgressCibilCount = 0;
    this.cibilAvailableCount = 0;
    this.allCibilAlreadyAvailable = false;

    this.msmeService.getCirCountsByCampaignId(campaignId).subscribe(
      (response: any) => {
        if (response && response.status === 200 && response.data) {
          // Map backend response to component properties
          // trueCount = customers with fresh CIBIL (is_cibil_available = true)
          // falseCount = customers with stale CIBIL (is_cibil_available = false)
          // nullCount = customers with missing CIBIL (is_cibil_available = null)
          // inProgressCount = customers with CIBIL fetch in progress
          // cirRejectedCount, cirApprovalCount, cirApprovalPendingCount = block journey if > 0
          this.cibilAvailableCount = response.data.trueCount || 0;
          this.staleCibilCount = response.data.falseCount || 0;
          this.missingCibilCount = response.data.nullCount || 0;
          this.inProgressCibilCount = response.data.inProgressCount || 0;
          this.totalCibilCount = response.data.totalCount || 0;
          this.notOptedCount = response.data.notOptedCount || 0;
          this.pendingCount = response.data.pendingCount || 0;
          this.cirRejectedCount = response.data.cirRejectedCount || 0;
          this.cirApprovalPendingCount = response.data.cirApprovalPendingCount || 0;
          this.cirApprovalCount = response.data.cirApprovalCount || 0;
          
          // Check if journey is blocked by any in-progress status
          const isJourneyBlocked = this.inProgressCibilCount > 0 || this.cirRejectedCount > 0 || this.cirApprovalCount > 0 || this.cirApprovalPendingCount > 0 || this.notOptedCount > 0 || this.pendingCount > 0;
          
          // Store blocking status
          this.canProceedJourney = !isJourneyBlocked;
          
          // Check if all customers already have fresh CIBIL
          this.allCibilAlreadyAvailable = (this.cibilAvailableCount === this.totalCibilCount) && this.totalCibilCount > 0;
          
          this.cirCountsLoaded = true;
          
          console.log('CIR Counts loaded:', {
            stale: this.staleCibilCount,
            missing: this.missingCibilCount,
            inProgress: this.inProgressCibilCount,
            pending: this.pendingCount,
            notOpted: this.notOptedCount,
            cirRejected: this.cirRejectedCount,
            cirApproval: this.cirApprovalCount,
            cirApprovalPending: this.cirApprovalPendingCount,
            available: this.cibilAvailableCount,
            total: this.totalCibilCount,
            allAvailable: this.allCibilAlreadyAvailable,
            canProceed: this.canProceedJourney
          });
        }
      },
      (error) => {
        console.error('Error fetching CIR counts:', error);
        this.cirCountsLoaded = false;
      }
    );
  }
}
