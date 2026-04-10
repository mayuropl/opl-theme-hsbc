import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-campaign-through-bulk-upload',
  templateUrl: './campaign-through-bulk-upload.component.html',
  styleUrls: ['./campaign-through-bulk-upload.component.scss']
})
export class CampaignThroughBulkUploadComponent implements OnInit {

  campaignName: string = '';
  estimatedRevenue: string = '';
  startDate: Date;
  endDate: Date;
  objective: string = '';
  parameters: string = '';
  preApprovedOffer: string = 'no';
  fetchFreshCIR: string = 'no';
  customerType: string = 'ETB';
  loadProductDropDown: boolean = false;
  allProductList: any[] = [];
  selectedProducts: any = {};
  isSubmitButtonDisabled: boolean = false;
  uploadedFile: File = null;
  uploadedFileName: string = '';
  uploadHistoryList: any[] = [];
  historyPage: number = 1;
  historyPageSize: number = 10;
  historyTotalSize: number = 0;
  historyStartIndex: number = 0;
  PageSelectNumber: any[] = [{ name: '10', value: 10 }, { name: '50', value: 50 }, { name: '100', value: 100 }, { name: '500', value: 500 }];
  roleId: any;
  roleType: any;
  pageData: any;

  constructor(
    private router: Router,
    public commonService: CommonService,
    private msmeService: MsmeService
  ) {}

  ngOnInit(): void {
    this.roleId = Number(this.commonService.getStorage(Constants.httpAndCookies.ROLEID, true));
    this.roleType = this.commonService.getStorage(Constants.httpAndCookies.ROLE_TYPE, true);
    this.pageData = this.commonService.getPageData(
      Constants.pageMaster.PORTFOLIO_ANALYSIS,
      Constants.pageMaster.CAMPAIGN_DASHBOARD,
      Constants.pageMaster.ETB_CAMPAIGN_DASHBOARD
    );
    this.startDate = new Date();
    this.getAllProductName();
    this.getCampaignUploadHistory();
  }

  // ---- Validation helpers ----

  onCampaignNameKeydown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^[a-zA-Z0-9 ]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onCampaignNamePaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') || '';
    const cleaned = pastedText.replace(/[^a-zA-Z0-9 ]/g, '');
    if (cleaned !== pastedText) {
      event.preventDefault();
      this.campaignName = (this.campaignName + cleaned).substring(0, 50);
    }
  }

  isFieldEmpty(field: any): boolean {
    return !field || (typeof field === 'string' && !field.trim());
  }

  isFormValid(): boolean {
    const campaignNameValid = this.campaignName?.trim() && this.campaignName.trim().length <= 50;
    const objectiveValid = this.objective?.trim() && this.objective.trim().length <= 250;
    const revenueValid = this.estimatedRevenue?.trim();
    const preApprovedValid = this.preApprovedOffer !== 'yes' || this.isAnyProductSelected();
    const cirOptionValid = (this.preApprovedOffer !== 'yes') || (this.fetchFreshCIR && this.fetchFreshCIR.length > 0);
    return !!(campaignNameValid && revenueValid && this.startDate && this.endDate && objectiveValid && this.preApprovedOffer && preApprovedValid && cirOptionValid && this.uploadedFile);
  }

  isRevenueExceedsLimit(): boolean {
    if (!this.estimatedRevenue) return false;
    const numericValue = this.estimatedRevenue.replace(/[$,\s]/g, '');
    const integerPart = numericValue.indexOf('.') === -1 ? numericValue : numericValue.substring(0, numericValue.indexOf('.'));
    return integerPart.length > 7;
  }

  // ---- Revenue formatting ----

  onRevenueInput(): void {
    let value = this.estimatedRevenue || '';
    let digits = value.replace(/[^0-9]/g, '');
    if (!digits) {
      this.estimatedRevenue = '';
      return;
    }
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    this.estimatedRevenue = `$ ${formatted}`;
  }

  onRevenueKeydown(event: KeyboardEvent): void {
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

  formatRevenue(amount: any, convertIntoFormatted: boolean): any {
    if (convertIntoFormatted) {
      const formatted = new Intl.NumberFormat('en-IN').format(amount);
      return `$ ${formatted}`;
    } else {
      const numericValue = amount.replace(/[$,\s]/g, '');
      return numericValue || '0';
    }
  }

  // ---- Date helpers ----

  get minStartDate(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  get maxStartDate(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  get minEndDate(): Date {
    if (this.startDate) return new Date(new Date(this.startDate).setHours(0, 0, 0, 0));
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  getMaxEndDate(): Date {
    if (this.startDate) {
      const maxDate = new Date(this.startDate);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return maxDate;
    }
    return null;
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ---- Pre-Approved Offer & Products ----

  onPreApprovedOfferChange(event: any): void {
    if (event.value === 'yes') {
      this.loadProductDropDown = true;
    } else {
      this.loadProductDropDown = false;
      this.fetchFreshCIR = 'no';
    }
  }

  getAllProductName(): void {
    this.msmeService.getAllProductNames().subscribe(
      (response: any) => {
        if (response && response.status == 200) {
          const dropdownList = [{ value: 'All', label: 'All' }];
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

  onProductCheckboxChange(item: any, isChecked: boolean): void {
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

  isAnyProductSelected(): boolean {
    return Object.values(this.selectedProducts).some(selected => selected === true);
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

  // ---- File Upload ----

  onUploadFile(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        this.commonService.errorSnackBar('File format of the upload should be xlsx or xls');
        return;
      }
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        && file.type !== 'application/vnd.ms-excel'
        && file.type !== 'application/vnd.ms-excel.sheet.binary.macroEnabled.12') {
        this.commonService.errorSnackBar('File format of the upload should be xlsx or xls');
        return;
      }
      this.uploadedFile = file;
      this.uploadedFileName = file.name;
    };
    fileInput.click();
  }

  removeFile(): void {
    this.uploadedFile = null;
    this.uploadedFileName = '';
  }

  // ---- Upload History ----

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  }

  getCampaignUploadHistory(): void {
    const data = {
      pageIndex: this.historyPage - 1,
      pageSize: this.historyPageSize,
      roleId: this.roleId,
      roleType: this.roleType
    };
    this.msmeService.getCampaignUploadHistory(data).subscribe(
      (response: any) => {
        if (response && response.status == 200) {
          this.uploadHistoryList = response.data?.content || [];
          this.historyTotalSize = response.data?.totalElements || 0;
          this.historyStartIndex = (this.historyPage - 1) * this.historyPageSize;
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Failed to load upload history');
      }
    );
  }

  onHistoryPageChange(page: number): void {
    this.historyPage = page;
    this.getCampaignUploadHistory();
  }

  onHistoryPageSizeChange(size: any): void {
    this.historyPageSize = size;
    this.historyPage = 1;
    this.getCampaignUploadHistory();
  }

  downloadFile(masterId: any, fileType: string): void {
    this.msmeService.downloadCampaignUploadFile(masterId, fileType).subscribe(
      (response: any) => {
        if (response && response.status == 200 && response.data) {
          const byteCharacters = atob(response.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `campaign_${fileType}_${masterId}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          this.commonService.warningSnackBar(response?.message || 'No file data available');
        }
      },
      (error) => {
        this.commonService.errorSnackBar('Failed to download file');
      }
    );
  }

  // ---- Submit ----

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.commonService.warningSnackBar('Please fill all required fields correctly');
      return;
    }

    this.isSubmitButtonDisabled = true;

    const formData = new FormData();
    formData.append('file', this.uploadedFile);
    formData.append('campaignType', btoa(this.customerType));

    this.msmeService.createCampaignFromExcel(formData).subscribe(
      (response: any) => {
        this.isSubmitButtonDisabled = false;
        if (response && response.status == 200) {
          this.commonService.successSnackBar(response.message);
          this.getCampaignUploadHistory();
        } else if (response && response.status == 400) {
          this.commonService.warningSnackBar(response.message);
        } else if (response && response.status == 404) {
          this.commonService.warningSnackBar(response.message);
        } else if (response && response.status == 500) {
          this.commonService.errorSnackBar(response.message);
        }
      },
      (error) => {
        this.isSubmitButtonDisabled = false;
        this.commonService.errorSnackBar('Something Went Wrong');
      }
    );
  }
}
