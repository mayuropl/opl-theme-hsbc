import { Component } from '@angular/core';

interface Bank {
  name: string;
  loss: number;
  logo: string;
  highlighted?: boolean;
}

@Component({
  selector: 'app-related-parties-liability-wallet', 
  templateUrl: './related-parties-liability-wallet.component.html',
  styleUrl: './related-parties-liability-wallet.component.scss'
})
export class RelatedPartiesLiabilityWalletComponent {
  selectedBank = 'HDFC Bank';

  banks: Bank[] = [
    { name: 'HDFC Bank', loss: 632, logo: 'assets/images/bank_small_logo/hdfc_bank.svg' },
    { name: 'Axis Bank', loss: 435, logo: 'assets/images/bank_small_logo/axis_bank.svg' },
    { name: 'Citi Bank', loss: 245, logo: 'assets/images/bank_small_logo/citi_bank.svg' },
    { name: 'SBI Bank', loss: 156, logo: 'assets/images/bank_small_logo/sbi_bank.svg' },
    { name: 'ICICI Bank', loss: 137, logo: 'assets/images/bank_small_logo/icici_bank.svg' }
  ];
}
