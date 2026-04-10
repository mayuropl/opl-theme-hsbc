import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';

@Component({
  selector: 'app-customize-columns-popup', 
  templateUrl: './customize-columns-popup.component.html',
  styleUrl: './customize-columns-popup.component.scss'
})
export class CustomizeColumnsPopupComponent {
  allColumns: string[] = [];
  selectedColumns: string[] = [];
  defaultColumns: string[] = [];
  searchTerm: string = '';
  mandatoryColumns: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CustomizeColumnsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService
  ) {
         this.allColumns = data.allColumns;
        this.selectedColumns = [...data.selectedColumns];
         this.defaultColumns = data.defaultColumns;
         this.mandatoryColumns = data.mandatoryColumns || [];
         
         // Ensure mandatory columns are always in selectedColumns
         this.mandatoryColumns.forEach(col => {
           if (!this.selectedColumns.includes(col)) {
             this.selectedColumns.push(col);
           }
         });
   }

  get filteredColumns(): string[] {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return this.allColumns;
    }
    const search = this.searchTerm.toLowerCase().trim();
    return this.allColumns.filter(col => col.toLowerCase().includes(search));
  }

  // Clear search
  clearSearch() {
    this.searchTerm = '';
  }

  isMandatory(column: string): boolean {
    return this.mandatoryColumns.includes(column);
  }

  toggleSelection(column: string, event: any) {
    const checked = event.checked;
    console.log('Toggle selection:', column, 'checked:', checked, 'current selected:', this.selectedColumns);

    // Prevent unchecking mandatory columns
    if (this.isMandatory(column) && !checked) {
      event.source.checked = true;
      this.commonService.warningSnackBar('This is a mandatory column and cannot be removed.');
      return;
    }

    if (checked) {
      if (this.selectedColumns.length >= 9) {
        event.source.checked = false;
        this.commonService.warningSnackBar('You can select maximum 9 columns only.');
        return;
      }
      if (!this.selectedColumns.includes(column)) {
        this.selectedColumns.push(column);
      }
    } else {
      const index = this.selectedColumns.indexOf(column);
      if (index > -1) {
        this.selectedColumns.splice(index, 1);
      }
    }
    console.log('After toggle:', this.selectedColumns);
  }

  isChecked(column: string): boolean {
    return this.selectedColumns.includes(column);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedColumns, event.previousIndex, event.currentIndex);
  }

  submit() {
    if (this.selectedColumns.length > 9) {
      this.commonService.warningSnackBar('You can select maximum 9 columns only.');
      return;
    }
    this.dialogRef.close(this.selectedColumns);
  }

  cancel() {
    this.dialogRef.close();
  }

  resetToDefault() {
    this.selectedColumns = [...this.defaultColumns];
    this.searchTerm = '';
    
  }

}
