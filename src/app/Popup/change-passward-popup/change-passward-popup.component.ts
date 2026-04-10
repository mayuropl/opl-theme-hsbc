import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-change-passward-popup',
  templateUrl: './change-passward-popup.component.html',
  styleUrls: ['./change-passward-popup.component.scss']
})
export class ChangePasswardPopupComponent implements OnInit {

  @Input() public user :any;
  
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    //console.log("user => ",this.user);
  }
  closeModal(n:number){
    if(n == 1){
      this.activeModal.close(1);
    }else{
      this.activeModal.close();
    }
  }
}
