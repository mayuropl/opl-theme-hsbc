import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent implements OnInit {

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
