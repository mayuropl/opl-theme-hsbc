import { Component } from '@angular/core';

interface Bank {
  name: string;
  loss: number;
  logo: string;
  highlighted?: boolean;
}

@Component({
  selector: 'app-self-transfer-liability-wallet', 
  templateUrl: './self-transfer-liability-wallet.component.html',
  styleUrl: './self-transfer-liability-wallet.component.scss'
})
export class SelfTransferLiabilityWalletComponent {
  selectedBank = 'HDFC Bank';

  banks: Bank[] = [
    { name: 'HDFC Bank', loss: 632, logo: 'assets/images/bank_small_logo/hdfc_bank.svg' },
    { name: 'Axis Bank', loss: 435, logo: 'assets/images/bank_small_logo/axis_bank.svg' },
    { name: 'Citi Bank', loss: 245, logo: 'assets/images/bank_small_logo/citi_bank.svg' },
    { name: 'SBI Bank', loss: 156, logo: 'assets/images/bank_small_logo/sbi_bank.svg' },
    { name: 'ICICI Bank', loss: 137, logo: 'assets/images/bank_small_logo/icici_bank.svg' }
  ];
}
