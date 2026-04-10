import { Component, ElementRef, EventEmitter, HostListener, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';

@Component({
  selector: 'app-pr-insights-analysis-structured',
  templateUrl: './pr-insights-analysis.component.html',
  styleUrl: './pr-insights-analysis.component.scss'
})
export class PrInsightsAnalysisStructuredComponent {
  @ViewChild('scroll') scroll!: ScrollButtonsDirective;
  @Input() lendingAnalysisC: any;
  @Input() dateOfReportMap: any;
  @Input() selectedDateOfReport: any;
  @Input() latestDateOfReport: any;
  @Input() selectedUnitC: any;
  // selectedUnit = 'Million';
  moneyFormatTableHeader : string = '';
  isLoading : boolean = true;
  @Output() unitChangedC = new EventEmitter<string>();
  @Input() isLoadingFromParentC: boolean = false;

  ngAfterViewChecked() {
    this.scroll?.['updateButtons']?.();
  }

    ngOnChanges(changes: SimpleChanges) {
      if (changes['isLoadingFromParentC']) {
        this.isLoading = this.isLoadingFromParentC;
      }
      if (changes['selectedUnitC'] && this.selectedUnitC) {
        this.moneyFormatTableHeader = this.selectedUnitC === 'Million' ? 'M' : this.selectedUnitC === 'Billion' ? 'B' : '';
      }

    if (changes['lendingAnalysisC'] && this.lendingAnalysisC) {
      this.moneyFormatTableHeader = this.selectedUnitC === 'Million' ? 'M' : this.selectedUnitC === 'Billion' ? 'B' : '';
      console.log('Changes In lendingAnalysisC');
    }
  }

  get numberFormat(): string {
    if (this.selectedUnitC === 'Million') return '1.1-1';
    if (this.selectedUnitC === 'Billion') return '1.2-2';
    return '1.0-0';
  }

  get numberFormatForPer(): string {
    if (this.selectedUnitC === 'Million') return '1.1-1';
    if (this.selectedUnitC === 'Billion') return '1.2-2';
    return '1.2-2';
  }

    setUnitC(unit: string) {
    this.unitChangedC.emit(unit);
    this.moneyFormatTableHeader = this.selectedUnitC === 'Million' ? 'M' : this.selectedUnitC === 'Billion' ? 'B' : '';
    // this.setupLendingAnalysis();
  }
}
