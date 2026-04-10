import { Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';


@Component({
  selector: 'app-pr-lending-analytics', 
  templateUrl: './pr-lending-analytics.component.html',
  styleUrl: './pr-lending-analytics.component.scss'
})
export class PrLendingAnalyticsComponent {
  // selectedUnit = 'Million';
  @Input() selectedUnit: any;
  moneyFormatTableHeader : string = '';
  isLoading:boolean = true;
  // lendingAnalysisF: any;
  @Input() lendingAnalysis: any;
  @Input() previousLendingAnalysis: any;
  @Output() unitChanged = new EventEmitter<string>();
  @Input() isLoadingFromParent: boolean = false;
  

  @ViewChild('scroll') scroll!: ScrollButtonsDirective;

  ngAfterViewChecked() {
    this.scroll?.['updateButtons']?.();
  }

  setUnit(unit: string) {
    this.selectedUnit = unit;
    this.unitChanged.emit(unit);
    this.moneyFormatTableHeader = this.selectedUnit === 'Million' ? 'M' : this.selectedUnit === 'Billion' ? 'B' : '';
    // this.setupLendingAnalysis();
  }

  get numberFormat(): string {
  if (this.selectedUnit === 'Million') return '1.1-1';
  if (this.selectedUnit === 'Billion') return '1.2-2';  
  return '1.0-0';                                        
}

  get numberFormatForPer(): string {
  if (this.selectedUnit === 'Million') return '1.1-1';
  if (this.selectedUnit === 'Billion') return '1.2-2';  
  return '1.2-2';                                        
  }
walletTrend: { change: number; isIncrease: boolean; changePercent: number } = {
  change: 0, isIncrease: false, changePercent: 0
};

  ngOnChanges(changes: SimpleChanges) {
    console.log('child lendingg', this.lendingAnalysis);
    // if (changes['isLoadingFromParent']) {
    //   this.isLoading = this.isLoadingFromParent;
    // }
    if (changes['lendingAnalysis'] && this.lendingAnalysis) {
      this.setupLendingAnalysis();
      this.moneyFormatTableHeader = this.selectedUnit === 'Million' ? 'M' : this.selectedUnit === 'Billion' ? 'B' : '';
    }
    if (this.lendingAnalysis) {
      this.walletTrend = this.getWalletTrend();
      this.isLoading = this.isLoadingFromParent;
    }
  }

  getWalletTrend(): { change: number; isIncrease: boolean; changePercent: number } {
    // if (!this.lendingAnalysis?.hsbc_wallet_utilization_pct || !this.previousLendingAnalysis?.hsbc_wallet_utilization_pct) {
    //   return { change: 0, isIncrease: false, changePercent: 0 };
    // }
    if (!this.previousLendingAnalysis) {
      return { change: 0, isIncrease: false, changePercent:null };
    }
    
    const current = parseFloat(this.lendingAnalysis.hsbc_wallet_utilization_pct ?? "0");
    const previous = parseFloat(this.previousLendingAnalysis.hsbc_wallet_utilization_pct ?? "0");
    const change = current - previous;
    console.log("this.lendingAnalysis.hsbc_wallet_utilization_pct",current - previous);
    return {
      change: Math.abs(change),
      isIncrease: change >= 0,
      changePercent: Math.abs(change)
    };
  }

  setupLendingAnalysis() {
    // const unit = this.selectedUnit;
    // console.log('UNIT', unit)
    // switch (unit) {
    //   case 'Million':
    //     this.lendingAnalysisF = this.lendingAnalysis.million_values[0];
    //     break;
    //   case 'Billion':
    //     this.lendingAnalysisF = this.lendingAnalysis.billion_values[0];
    //     break;
    //   case 'Absolute':
    //     this.lendingAnalysisF = this.lendingAnalysis.absolute_values[0];
    //     break;
    // }
  }

  //    this.apiService.getStats().subscribe((data: any[]) => {
  //   this.statsList = data.map(item => {
  //     // Match based on title or any unique key
  //     switch (item.title) {
  //       case 'Unique Customers':
  //         return { ...item, icon: 'fi fi-rr-users blue_text' };
  //       case 'Competition Sanction':
  //         return { ...item, icon: 'fi fi-rr-gym-bag green_text', trend: { ...item.trend, icon: 'fi fi-rr-arrow-trend-up', color: 'darkgreen_text' } };
  //       case 'Bank Sanction':
  //         return { ...item, img: 'assets/images/hsbc-title.svg', trend: { ...item.trend, icon: 'fi fi-rr-arrow-trend-down', color: 'red_text' } };
  //       case 'Competition Utilisation':
  //         return { ...item, icon: 'fi fi-rr-gym-bag green_text' };
  //       default:
  //         return item;
  //     }
  //   });
  // });
}
