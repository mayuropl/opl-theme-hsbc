
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Constants } from 'src/app/CommoUtils/constants';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-op-rejection-remark-popup',
  templateUrl: './op-rejection-remark-popup.component.html',
  styleUrl: './op-rejection-remark-popup.component.scss'
})
export class OpRejectionRemarkPopupComponent {
 
  userId: Number;
  id: Number;

  reasonId: Number;
  reasonName:any;
  @Input() popUpObj: any = {};
  editId: Number;
  activateTab: Number;

  constructor(public activeModal: NgbActiveModal, private modalService: NgbModal
    , private commonService: CommonService, private router: Router, private route: ActivatedRoute, private msmeService: MsmeService) { }

  ngOnInit(): void {
    this.reasonId=this.popUpObj.id;
    this.reasonName=this.popUpObj.name;
  }

  redirect() {
    this.activeModal.close('close');
    // this.router.navigate(['/Config/BureauConfig-List']);
  }
 cancel(){
  this.activeModal.dismiss('cancel');

 }
  saveRejectionDetails(){

     if (!this.reasonName || this.reasonName.trim() === "") {
    this.commonService.warningSnackBar("Please fill Mandatory fields!!");
    return;
  }
      const data={
        reasonName:this.reasonName,
        id:this.reasonId
      }
      this.msmeService.addClientUpdateRejectionReason(data).subscribe((response: any) => {
      if (response && response.status == 200) {
       this.redirect();
        this.commonService.successSnackBar(response.message);
       
      } else if(response && response.status == 500) {
        this.commonService.errorSnackBar(response.message);
      }
    }, (error) => {
      this.commonService.errorSnackBar('Something Went Wrong');
    });
  }

}
