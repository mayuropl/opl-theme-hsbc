import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-change-status-popup',
  templateUrl: './change-status-popup.component.html',
  styleUrls: ['./change-status-popup.component.scss']
})
export class ChangeStatusPopupComponent implements OnInit {

  @Input() public user :any;
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    //console.log("user => ",this.user);
  }
  closeModal(n:number){
    if(n == 1){
      this.activeModal.close(1);
    }else{
      this.activeModal.close(0);
    }
  }
}
