import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-read-instruction-bulk-upload',
  templateUrl: './read-instruction-bulk-upload.component.html',
  styleUrls: ['./read-instruction-bulk-upload.component.scss']
})
export class ReadInstructionBulkUploadComponent implements OnInit {

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any,private router: Router) { }

  ngOnInit(): void {
    console.log(this.data.totalEntry);
  }

  reload(): void{
    window.location.reload();
   this.data.this.fetchBulkUploadHistory(null, true);
}

}
