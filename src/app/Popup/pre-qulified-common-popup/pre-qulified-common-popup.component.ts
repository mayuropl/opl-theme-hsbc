import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PreQulifiedCommonPopupData {
  popupType: 'approved' | 'rejected' | 'inProcess' | 'disabled';
}

@Component({
  selector: 'app-pre-qulified-common-popup',
  templateUrl: './pre-qulified-common-popup.component.html',
  styleUrl: './pre-qulified-common-popup.component.scss'
})
export class PreQulifiedCommonPopupComponent {
  popupType: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PreQulifiedCommonPopupData) {
    this.popupType = data?.popupType || 'approved';
  }
}
