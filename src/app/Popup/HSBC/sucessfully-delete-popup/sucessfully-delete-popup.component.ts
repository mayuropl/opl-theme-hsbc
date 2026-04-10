import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sucessfully-delete-popup', 
  templateUrl: './sucessfully-delete-popup.component.html',
  styleUrl: './sucessfully-delete-popup.component.scss'
})
export class SucessfullyDeletePopupComponent {
  deleteCount: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.deleteCount = data?.count || 0;
  }
}
