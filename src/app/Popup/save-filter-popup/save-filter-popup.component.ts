import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { FilterListItem, UserFilterRequest } from 'src/app/models/user-filter.model';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-save-filter-popup',
  templateUrl: './save-filter-popup.component.html',
  styleUrl: './save-filter-popup.component.scss'
})
export class SaveFilterPopupComponent implements OnInit, OnDestroy {

  // View state
  showSaveForm = false;
  isLoading = false;

  // Data
  savedFilters: FilterListItem[] = [];
  filteredFilters: FilterListItem[] = [];

  // Form data
  filterName = '';
  searchQuery = '';

  // Edit state
  editingFilterId: number | null = null;

  // Props from dialog data
  filterListMaster: any;
  customerTypeId: number;
  userId: number;
  isAnyFilterApplied = false;

  // Subscription management
  private subscriptions = new Subscription();

  constructor(
    public dialogRef: MatDialogRef<SaveFilterPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService,
    private msmeService: MsmeService
  ) {
    this.filterListMaster = data.filterListMaster;
    this.customerTypeId = data.customerTypeId;
    this.userId = data.userId;
    this.isAnyFilterApplied = data.isAnyFilterApplied;
  }

  /** Lifecycle hook — loads saved filters on component initialization. */
  ngOnInit(): void {
    this.loadSavedFilters();
  }

  /** Open the save filter form */
  openSaveFilterForm(): void {
    if (this.savedFilters.length == 5) {
      this.commonService.warningSnackBar("Please delete an existing saved filter before creating a new one.");
      return;
    }
    this.showSaveForm = true;
  }

  /** Load saved filters for the current customerTypeId */
  loadSavedFilters(): void {
    this.isLoading = true;
    const sub = this.msmeService.getUserFilters(this.customerTypeId)
      .subscribe({
        next: (response) => {
          this.savedFilters = response.listData || [];
          this.filteredFilters = [...this.savedFilters];
          this.isLoading = false;
        },
        error: (error) => {
          this.commonService.errorSnackBar('Failed to load saved filters');
          this.isLoading = false;
        }
      });
    this.subscriptions.add(sub);
  }

  /** Save a new filter with the current filter configuration */
  saveNewFilter(): void {
    if (!this.filterName || !this.filterName.trim()) {
      this.commonService.warningSnackBar('Please enter a filter name');
      return;
    }
    if (this.filterName.length >25) {
      this.commonService.warningSnackBar('Please enter a filter name');
      return;
    }
    let sameNameMessage:string;
    this.savedFilters.forEach(element => {
      if (element.filterName==this.filterName) {
        sameNameMessage = "Filter with name '" + this.filterName + "' already exists";
      }
    });
    if (sameNameMessage && sameNameMessage.length>0) {
      this.commonService.warningSnackBar(sameNameMessage);
      return;
    }
    const request: UserFilterRequest = {
      filterName: this.filterName.trim(),
      filterJson: JSON.stringify(this.filterListMaster),
      customerTypeId: this.customerTypeId
    };

    this.isLoading = true;
    const sub = this.msmeService.saveUserFilter(request)
      .subscribe({
        next: (response) => {
          if (response.status == 200) {
            this.commonService.successSnackBar('Filter saved successfully');
            this.loadSavedFilters();
            this.resetForm();
            this.showSaveForm = false;
          } else if(response.status == 208) {
            this.showSaveForm = false;
            this.commonService.warningSnackBar(response.message);
          }
        },
        error: (error) => {
          this.commonService.errorSnackBar(error.message || 'Failed to save filter');
          this.isLoading = false;
        }
      });
    this.subscriptions.add(sub);
  }

  /** Update an existing filter with a new name */
  updateNameFilter(filter: FilterListItem): void {
    if (!filter.editedName || !filter.editedName.trim()) {
      this.commonService.warningSnackBar('Please enter a filter name');
      return;
    }

    let sameNameMessage:string;
    this.savedFilters.forEach(element => {
      if (element.filterName==filter.editedName) {
        sameNameMessage = "Filter with name '" + filter.editedName + "' already exists";
      }
    });
    if (sameNameMessage?.length>0) {
      this.commonService.warningSnackBar(sameNameMessage);
      return;
    }

    const request: UserFilterRequest = {
      filterName: filter.editedName.trim(),
      filterJson: JSON.stringify(this.filterListMaster),
      customerTypeId: this.customerTypeId
    };

    this.isLoading = true;
    const sub = this.msmeService.updateUserFilter(filter.id, request)
      .subscribe({
        next: (response) => {
          this.commonService.successSnackBar('Filter updated successfully');
          this.loadSavedFilters();
          filter.isEditing = false;
        },
        error: (error) => {
          this.commonService.errorSnackBar(error.message || 'Failed to update filter');
          this.isLoading = false;
        }
      });
    this.subscriptions.add(sub);
  }

  /** Delete a filter after user confirmation */
  deleteFilter(filterId: number): void {
    this.isLoading = true;
    const sub = this.msmeService.deleteUserFilter(filterId)
      .subscribe({
        next: (response) => {
          this.commonService.successSnackBar('Filter deleted successfully');
          this.loadSavedFilters();
        },
        error: (error) => {
          this.commonService.errorSnackBar(error.message || 'Failed to delete filter');
          this.isLoading = false;
        }
      });
    this.subscriptions.add(sub);
  }

  /** Apply a saved filter — parse its JSON and close the dialog */
  applyFilter(filter: FilterListItem): void {
    try {
      const filterConfig = JSON.parse(filter.filterJson);
      this.dialogRef.close({
        action: 'apply',
        filterConfig: filterConfig,
        filterName: filter.filterName
      });
    } catch (error) {
      this.commonService.errorSnackBar('Invalid filter configuration');
    }
  }

  /** Open apply filter popup and close the dialog */
  updateFilter(filter: FilterListItem): void {
    try {
      const filterConfig = JSON.parse(filter.filterJson);
      this.dialogRef.close({
        action: 'update',
        filterConfig: filterConfig,
        filter:filter
      });
    } catch (error) {
      this.commonService.errorSnackBar('Invalid filter configuration');
    }
  }

  /** Client-side case-insensitive search by filter name */
  searchFilters(): void {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      this.filteredFilters = [...this.savedFilters];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredFilters = this.savedFilters.filter(filter =>
      filter.filterName.toLowerCase().includes(query)
    );
  }

  /** Enable inline edit mode for a filter */
  enableEditMode(filter: FilterListItem): void {
    this.savedFilters.forEach(f => f.isEditing = false);
    filter.isEditing = true;
    filter.editedName = filter.filterName;
    this.editingFilterId = filter.id;
  }

  /** Cancel inline edit mode */
  cancelEdit(filter: FilterListItem): void {
    filter.isEditing = false;
    filter.editedName = '';
    this.editingFilterId = null;
  }

  /** Reset the save form fields */
  resetForm(): void {
    this.filterName = '';
  }

  /** Cancel the save form and return to list view */
  cancelSaveForm(): void {
    this.resetForm();
    this.showSaveForm = false;
  }

  /** Lifecycle hook — cleans up active subscriptions. */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
