import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-myportfolio-subscribe-popup',
  templateUrl: './myportfolio-subscribe-popup.component.html',
  styleUrl: './myportfolio-subscribe-popup.component.scss',
  providers: [DatePipe]
})
export class MyportfolioSubscribePopupComponent implements OnInit {
  isSubscribe = true;
  searchCompanyText = '';

  // Company lists
  companySubscribeList: { name: string, cin: string, selected: boolean, disabled: boolean }[] = [];
  companyUnsubscribeList: { name: string, cin: string, selected: boolean }[] = [];

  // Pagination state for company list
  companyPage = 0;
  companyPageSize = 20;
  companyTotalElements = 0;
  companyLoading = false;

  // Debounce search
  private searchSubject = new Subject<string>();

  // Subcategory lists
  subcategorySubscribeList: { name: string, selected: boolean, disabled: boolean }[] = [];
  subcategoryUnsubscribeList: { name: string, selected: boolean }[] = [];

  // Per-company subscribed subcategories map (CIN → subcategory[])
  subscribedMap: { [cin: string]: string[] } = {};

  // Date range
  fromDate: Date | null = null;
  toDate: Date | null = null;
  minDate: Date = new Date();
  minToDate: Date = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MyportfolioSubscribePopupComponent>,
    private msmeService: MsmeService,
    private commonMethod: CommonMethods,
    private commonService: CommonService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    // Show loader immediately while APIs load
    this.companyLoading = true;

    // Setup search debounce (300ms delay before API call)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchCompanyText = searchValue;
      if(searchValue.length > 0 && searchValue.length < 3){
        return;
      }
      this.fetchCompanies(true);
    });

    // Pre-populate subscribed companies at the top, then load paginated list
    const subscribedCins: string[] = this.data.subscribedCompanies || [];
    const preSelectedCins: string[] = this.data.preSelectedCompanyCins || [];
    this.subscribedMap = this.data.subscribedMap || {};

    // Combine CINs that need name resolution: subscribed + pre-selected (deduplicated)
    const allCinsToResolve: string[] = [...new Set([...subscribedCins, ...preSelectedCins])];

    if (allCinsToResolve.length > 0) {
      this.msmeService.getMyPortfolioCompaniesByCins({ cins: allCinsToResolve }).subscribe({
        next: (res: any) => {
          if (res && res.status === 200 && res.data) {
            const resolvedCompanies: { name: string, cin: string }[] = (res.data || [])
              .filter((c: any) => c && c.name && c.cin);

            this.companySubscribeList = resolvedCompanies.map(c => {
              const isSubscribed = subscribedCins.includes(c.cin);
              const isPreSelected = preSelectedCins.includes(c.cin);
              return {
                name: c.name,
                cin: c.cin,
                selected: isSubscribed || isPreSelected,
                disabled: isSubscribed // only subscribed ones are disabled
              };
            });

            // Build unsubscribe list from subscribed companies only
            this.companyUnsubscribeList = resolvedCompanies
              .filter(c => subscribedCins.includes(c.cin))
              .map(c => ({
                name: c.name,
                cin: c.cin,
                selected: false
              }));
          }
          this.fetchCompanies(false);
        },
        error: () => {
          this.fetchCompanies(true);
        }
      });
    } else {
      this.fetchCompanies(true);
    }

    // Build subcategory lists (these are small, no pagination needed)
    const allSubcategories: string[] = this.data.allSubcategories || [];

    allSubcategories.forEach((sub: string) => {
      this.subcategorySubscribeList.push({
        name: sub,
        selected: false,
        disabled: false
      });
    });

    // Unsubscribe subcategory list is built dynamically based on selected companies
    // (see onUnsubscribeCompanyChange)
  }

  // ── Paginated Company Fetching ──

  fetchCompanies(reset: boolean = false) {
    // if (reset) {
    //   this.companyPage = 0;
    //   // Keep subscribed (disabled) companies at top, remove only non-subscribed
    //   this.companySubscribeList = this.companySubscribeList.filter(c => c.disabled);
    // }
    if (reset) {
    this.companyPage = 0;
    if (this.searchCompanyText) {
        this.companySubscribeList = this.companySubscribeList.filter(c =>
            c.disabled && c.name.toLowerCase().includes(this.searchCompanyText.toLowerCase())
        );
    } else {
        this.companySubscribeList = this.companySubscribeList.filter(c => c.disabled);
    }
  }
    this.companyLoading = true;
    const payload: any = {
      userId: this.data.userId,
      roleId: this.data.roleId,
      pageNumber: this.companyPage,
      pageSize: this.companyPageSize,
      searchValue: this.searchCompanyText || ''
    };

    this.msmeService.getMyPortfolioCompanies(payload).subscribe({
      next: (res: any) => {
        this.companyLoading = false;
        if (res && res.status === 200 && res.data) {
          this.companyTotalElements = res.data.totalElements || 0;
          const companies: { name: string, cin: string }[] = (res.data.companies || [])
            .filter((c: any) => c && c.name && c.cin);
          const subscribedCins: string[] = this.data.subscribedCompanies || [];
          const preSelectedCins: string[] = this.data.preSelectedCompanyCins || [];

          const newItems = companies.map(c => {
            const isAlreadySubscribed = subscribedCins.includes(c.cin);
            const isPreSelected = preSelectedCins.includes(c.cin);
            return {
              name: c.name,
              cin: c.cin,
              selected: isAlreadySubscribed || isPreSelected,
              disabled: isAlreadySubscribed
            };
          });

          // Append, avoiding duplicates by CIN (subscribed companies already at top)
          const existingCins = new Set(this.companySubscribeList.map(c => c.cin));
          newItems.forEach(item => {
            if (!existingCins.has(item.cin)) {
              this.companySubscribeList.push(item);
            }
          });
        }
      },
      error: () => {
        this.companyLoading = false;
      }
    });
  }

  onCompanyScroll(event: any) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 5;
    if (atBottom && !this.companyLoading) {
      if (this.companySubscribeList.length < this.companyTotalElements) {
        this.companyPage++;
        this.fetchCompanies(false);
      }
    }
  }

  onCompanySearch(searchValue: string) {
    this.searchSubject.next(searchValue);
  }

  // ── Company Filters ──
  get filteredCompanySubscribeList() {
    // No client-side filtering needed — search is handled by API
    return this.companySubscribeList;
  }

  get filteredCompanyUnsubscribeList() {
    if (!this.searchCompanyText) return this.companyUnsubscribeList;
    return this.companyUnsubscribeList.filter(c =>
      c.name.toLowerCase().includes(this.searchCompanyText.toLowerCase()));
  }

  get isAllCompanySubscribeSelected() {
    const list = this.filteredCompanySubscribeList;
    return list.length > 0 && list.every(c => c.selected);
  }

  get isAllCompanySubscribeDisabled() {
    const list = this.filteredCompanySubscribeList;
    return list.length > 0 && list.every(c => c.disabled);
  }

  get isAllCompanyUnsubscribeSelected() {
    const list = this.filteredCompanyUnsubscribeList;
    return list.length > 0 && list.every(c => c.selected);
  }

  toggleAllCompanySubscribe(checked: boolean) {
    this.filteredCompanySubscribeList.forEach(c => {
      if (!c.disabled) c.selected = checked;
    });
  }

  toggleAllCompanyUnsubscribe(checked: boolean) {
    this.filteredCompanyUnsubscribeList.forEach(c => { c.selected = checked; });
    this.rebuildUnsubscribeSubcategories();
  }

  /**
   * Called when a company checkbox changes in the unsubscribe tab.
   * Rebuilds the subcategory unsubscribe list based on selected companies' subscribed subcategories.
   */
  onUnsubscribeCompanyChange(item: any, checked: boolean) {
    item.selected = checked;
    this.rebuildUnsubscribeSubcategories();
  }

  /**
   * Rebuilds subcategoryUnsubscribeList as the union of subcategories
   * from all currently selected companies in the unsubscribe tab.
   */
  private rebuildUnsubscribeSubcategories() {
    const selectedCins = this.companyUnsubscribeList.filter(c => c.selected).map(c => c.cin);
    const subcategorySet = new Set<string>();
    for (const cin of selectedCins) {
      const subs = this.subscribedMap[cin] || [];
      subs.forEach(s => subcategorySet.add(s));
    }
    this.subcategoryUnsubscribeList = Array.from(subcategorySet).map(s => ({
      name: s,
      selected: false
    }));
  }

  // ── Subcategory Filters ──
  get isAllSubcategorySubscribeSelected() {
    return this.subcategorySubscribeList.length > 0 &&
      this.subcategorySubscribeList.every(s => s.selected);
  }

  get isAllSubcategorySubscribeDisabled() {
    return this.subcategorySubscribeList.length > 0 &&
      this.subcategorySubscribeList.every(s => s.disabled);
  }

  get isAllSubcategoryUnsubscribeSelected() {
    return this.subcategoryUnsubscribeList.length > 0 &&
      this.subcategoryUnsubscribeList.every(s => s.selected);
  }

  toggleAllSubcategorySubscribe(checked: boolean) {
    this.subcategorySubscribeList.forEach(s => {
      if (!s.disabled) s.selected = checked;
    });
  }

  toggleAllSubcategoryUnsubscribe(checked: boolean) {
    this.subcategoryUnsubscribeList.forEach(s => { s.selected = checked; });
  }

  // ── Counts ──
  get selectedCompanyCount(): number {
    if (this.isSubscribe) {
      return this.companySubscribeList.filter(c => c.selected).length;
    }
    return this.companyUnsubscribeList.filter(c => c.selected).length;
  }

  get selectedSubcategoryCount(): number {
    if (this.isSubscribe) {
      return this.subcategorySubscribeList.filter(s => s.selected).length;
    }
    return this.subcategoryUnsubscribeList.filter(s => s.selected).length;
  }

  // ── Date Range ──
  onFromDateChange(selectedDate: Date | null) {
    if (selectedDate) {
      this.minToDate = new Date(selectedDate);
      if (this.toDate && this.toDate < selectedDate) {
        this.toDate = null;
      }
    }
  }

  formatSubcategory(name: string): string {
    return name ? name.replace(/_/g, ' ') : '';
  }

  // ── Save ──
  onSave() {
    const payload: any = {
      userId: this.data.userId,
      category: this.data.parentCategory
    };

    if (this.isSubscribe) {
      // Only send newly selected companies (not disabled/already-subscribed ones)
      const newCompanyCins = this.companySubscribeList
        .filter(c => c.selected && !c.disabled).map(c => c.cin);
      const newSubcategories = this.subcategorySubscribeList
        .filter(s => s.selected).map(s => s.name);

      if (newCompanyCins.length === 0) {
        this.commonService.errorSnackBar('Please select at least one company to subscribe.');
        return;
      }
      if (newSubcategories.length === 0) {
        this.commonService.errorSnackBar('Please select at least one subcategory to subscribe.');
        return;
      }
      if (!this.fromDate || !this.toDate) {
        this.commonService.errorSnackBar('Please select a valid date range.');
        return;
      }

      // Send only new companies + selected subcategories (backend handles upsert)
      payload.companyNames = newCompanyCins;
      payload.subCategory = newSubcategories;
      payload.startDate = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd');
      payload.endDate = this.datePipe.transform(this.toDate, 'yyyy-MM-dd');

    } else {
      // Unsubscribe: send specific CINs + subcategories to deactivate
      const cinsToRemove = this.companyUnsubscribeList
        .filter(c => c.selected).map(c => c.cin);
      const subcategoriesToRemove = this.subcategoryUnsubscribeList
        .filter(s => s.selected).map(s => s.name);

      if (cinsToRemove.length === 0) {
        this.commonService.errorSnackBar('Please select at least one company to unsubscribe.');
        return;
      }
      if (subcategoriesToRemove.length === 0) {
        this.commonService.errorSnackBar('Please select at least one subcategory to unsubscribe.');
        return;
      }

      payload.unsubscribeCins = cinsToRemove;
      payload.unsubscribeSubcategories = subcategoriesToRemove;
    }

    this.msmeService.saveMyPortfolioSubscription(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.commonMethod.successSnackBar(
            res.message || (this.isSubscribe ? 'Subscriptions added successfully!' : 'Subscriptions removed successfully!')
          );
          this.dialogRef.close(true);
        } else {
          this.commonService.errorSnackBar(res?.message || 'Failed to update subscriptions.');
        }
      },
      error: (err: any) => {
        console.error('Subscription Error', err);
        this.commonService.errorSnackBar('An error occurred while saving the subscriptions.');
      }
    });
  }
}
