import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';

@Component({
  selector: 'app-customize-columns-popup', 
  templateUrl: './customize-columns-popup.component.html',
  styleUrl: './customize-columns-popup.component.scss'
})
export class CustomizeColumnsstructuredPopupComponent {
  allColumns: string[] = [];
  selectedColumns: string[] = [];
  defaultColumns: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CustomizeColumnsstructuredPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService
  ) {
         this.allColumns = data.allColumns;
        this.selectedColumns = [...data.selectedColumns];
         this.defaultColumns = data.defaultColumns
         
   }

  toggleSelection(column: string, event: any) {
    const checked = event.checked;
    console.log('Toggle selection:', column, 'checked:', checked, 'current selected:', this.selectedColumns);

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
    console.log('default',this.selectedColumns);
    
  }

}
