import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-corporate-subscribe-popup',
  templateUrl: './corporate-subscribe-popup.component.html',
  styleUrl: './corporate-subscribe-popup.component.scss',
  providers: [DatePipe]
})
export class CorporateSubscribePopupComponent implements OnInit {
  isSubscribe = true;
  searchSubcategoryText = '';

  subscribeList: { name: string, selected: boolean, disabled: boolean }[] = [];
  unsubscribeList: { name: string, selected: boolean }[] = [];

  fromDate: Date | null = null;
  toDate: Date | null = null;
  
  // Minimum date is today (no past dates allowed)
  minDate: Date = new Date();
  minToDate: Date = new Date(); // Dynamic minimum for End Date based on From Date

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CorporateSubscribePopupComponent>,
    private msmeService: MsmeService,
    private commonMethod: CommonMethods,
    private commonService: CommonService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.data.allSubcategories.forEach((sub: string) => {
      const isAlreadySubscribed = this.data.subscribedList.includes(sub);
      this.subscribeList.push({
        name: sub,
        selected: isAlreadySubscribed,
        disabled: isAlreadySubscribed
      });
    });

    this.data.subscribedList.forEach((sub: string) => {
      this.unsubscribeList.push({
        name: sub,
        selected: false
      });
    });
  }

  get filteredSubscribeList() {
    if (!this.searchSubcategoryText) return this.subscribeList;
    return this.subscribeList.filter(s => s.name.toLowerCase().includes(this.searchSubcategoryText.toLowerCase()));
  }

  get filteredUnsubscribeList() {
    if (!this.searchSubcategoryText) return this.unsubscribeList;
    return this.unsubscribeList.filter(s => s.name.toLowerCase().includes(this.searchSubcategoryText.toLowerCase()));
  }

  get isAllSubscribeSelected() {
    const list = this.filteredSubscribeList;
    return list.length > 0 && list.every(s => s.selected);
  }

  get isAllSubscribeDisabled() {
    const list = this.filteredSubscribeList;
    return list.length > 0 && list.every(s => s.disabled);
  }

  get isAllUnsubscribeSelected() {
    const list = this.filteredUnsubscribeList;
    return list.length > 0 && list.every(s => s.selected);
  }

  toggleAllSubscribe(checked: boolean) {
    this.filteredSubscribeList.forEach(s => {
      if (!s.disabled) s.selected = checked;
    });
  }

  toggleAllUnsubscribe(checked: boolean) {
    this.filteredUnsubscribeList.forEach(s => {
      s.selected = checked;
    });
  }

  onFromDateChange(selectedDate: Date | null) {
    if (selectedDate) {
      // Set minimum To Date to be the same as or after From Date
      this.minToDate = new Date(selectedDate);
      
      // If To Date is already selected and is before the new From Date, clear it
      if (this.toDate && this.toDate < selectedDate) {
        this.toDate = null;
      }
    }
  }

  onSave() {
    let finalSubcategories: string[] = [];
    const payload: any = {
      userId: this.data.userId,
      pan: this.data.pan,
      cin: this.data.cin,
      category: this.data.parentCategory
    };

    if (this.isSubscribe) {
      // All disabled (previously subscribed) + all newly checked
      const newSelections = this.subscribeList.filter(s => s.selected && !s.disabled).map(s => s.name);

      if (newSelections.length === 0) {
        this.commonService.errorSnackBar("Please select at least one new subcategory to subscribe.");
        return;
      }
      if (!this.fromDate || !this.toDate) {
        this.commonService.errorSnackBar("Please select a valid date range.");
        return;
      }

      finalSubcategories = [
        ...this.data.subscribedList,
        ...newSelections
      ];

      payload.startDate = this.datePipe.transform(this.fromDate, 'yyyy-MM-dd');
      payload.endDate = this.datePipe.transform(this.toDate, 'yyyy-MM-dd');

    } else {
      // Unsubscribe side
      const toRemove = this.unsubscribeList.filter(s => s.selected).map(s => s.name);
      if (toRemove.length === 0) {
        this.commonService.errorSnackBar("Please select at least one subcategory to unsubscribe.");
        return;
      }

      // Final payload is simply the original list MINUS the ones we want to remove
      finalSubcategories = this.data.subscribedList.filter((sub: string) => !toRemove.includes(sub));
    }

    payload.subCategory = finalSubcategories;

    this.msmeService.saveCorporateAnnouncementSubscription(payload).subscribe({
      next: (res: any) => {
        if (res && res.status === 200) {
          this.commonMethod.successSnackBar(res.message || (this.isSubscribe ? "Subscriptions added successfully!" : "Subscriptions removed successfully!"));
          this.dialogRef.close(true);
        } else {
          this.commonService.errorSnackBar(res?.message || "Failed to update subscriptions.");
        }
      },
      error: (err: any) => {
        console.error("Subscription Error", err);
        this.commonService.errorSnackBar("An error occurred while saving the subscriptions.");
      }
    });

  }
}
