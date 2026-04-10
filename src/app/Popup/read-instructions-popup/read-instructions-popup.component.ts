import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-read-instructions-popup', 
  templateUrl: './read-instructions-popup.component.html',
  styleUrl: './read-instructions-popup.component.scss'
})
export class ReadInstructionsPopupComponent {
  constructor(public dialog: MatDialog) { 
  }
   
}
