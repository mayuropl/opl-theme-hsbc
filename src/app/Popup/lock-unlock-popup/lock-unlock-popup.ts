import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ap-bank-change-noday',
  templateUrl: './lock-unlock-popup.html',
  styleUrls: ['./lock-unlock-popup.scss']
})
export class LockUnlockPopupComponent implements OnInit {
  
   @Input() public user :any;
  // @Input() public currentObj :any ;
  
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
