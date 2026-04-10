import { Component, ViewChild } from '@angular/core';
import { ScrollButtonsDirective } from 'src/app/Directives/scroll-buttons.directive';

@Component({
  selector: 'app-banker-analysis-tabs', 
  templateUrl: './banker-analysis-tabs.component.html',
  styleUrl: './banker-analysis-tabs.component.scss'
})
export class BankerAnalysisTabsComponent {
  activeTab = 0;
  index: any;

  @ViewChild('scroll') scroll!: ScrollButtonsDirective;

  ngAfterViewChecked() {
    this.scroll?.['updateButtons']?.();
  }

  setActiveTab(index: number) {
    this.activeTab = index;
  }
}
