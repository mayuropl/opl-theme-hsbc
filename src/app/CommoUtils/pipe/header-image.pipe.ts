import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'headerImages'
})
export class HeaderImagePipe implements PipeTransform {
    transform(lender: string): string {
        if (lender === 'sbi') {
            return 'assets/images/Bank_Spacifc_logo/sbi/sbi@2x.png';
        }else {
            // return 'assets/images/PSB_59_logo/PSB_logo_black.svg';
            // assets/images/OPL-Logo/opl_logo_trans_registered.svg
            return 'assets/images/OPL-Logo/opl_logo_trans_registered.svg';
        }
    }
}

/* Left Side Small Logo  Started */

@Pipe({
    name: 'headerImagesmall'
})
export class HeaderImageSmallPipe implements PipeTransform {
    transform(lender: string): string {
         
        if (lender === 'sbi') {
            return 'assets/images/Bank_Spacifc_logo/sbi/sbi@2x.png';
        } else {
            // return 'assets/images/PSB_59_logo/PSB_logo_black.svg';
            // assets/images/OPL-Logo/opl_logo_trans_registered.svg
            return 'assets/images/OPL-Logo/opl_logo_tran_smll.svg';
        }
    }
}

/* Left Side Small Logo  End */