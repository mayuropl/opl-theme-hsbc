import { Directive, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../CommoUtils/common-services/common.service';
import * as _ from 'lodash';

@Directive({
  selector: '[appNgxSelectFilter]'
})
export class NgxSelectFilterDirectiveDirective {

  @Input() keyName = 'value';
  @Input() type = 2;
  @Input() optionsList = [];
  @Input() optionMasterList = [];
  @Input() searchMode = "";
  @Output() filteredEvent = new EventEmitter();

  constructor() { 
  }
  ngOnInit(): void {
    this.optionsList = _.cloneDeep(this.optionMasterList);
     switch (this.type) {
      case 1: {
        this.optionMasterList = this.optionMasterList.map(String);
        break;
      }
      case 2: {
        this.optionMasterList.forEach(element => {
          element.value = element.value.toString();
        });
        break;
      }
      case 3: {
        this.optionMasterList.forEach(element => {
          if (element[this.keyName]) {
            element[this.keyName] = element[this.keyName].toString();
          }
        });
        break;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes?.searchMode?.isFirstChange() && changes?.searchMode?.currentValue == "") {
      this.optionsList = _.cloneDeep(this.optionMasterList);
      this.filteredEvent.emit({ optionsList: this.optionsList });
    }
  }

  @HostListener('input', ['$event'])
  onSelectionChange(event): void {
     if (this.optionMasterList && event?.target?.value) {
      switch (this.type) {
        case 1: {
          this.optionsList = this.optionMasterList.filter(x => x.toLowerCase().includes(event.target.value.toLowerCase()));
          break;
        }
        case 2: {
          this.optionsList = _.cloneDeep(this.optionMasterList.filter(x => x.value.toLowerCase().includes(event.target.value.toLowerCase())));
          break;
        }
        case 3: {
          this.optionsList = _.cloneDeep(this.optionMasterList.filter(x => x[this.keyName].toLowerCase().includes(event.target.value.toLowerCase())));
          break;
        }
        case 4: {
          this.optionsList = _.cloneDeep(this.optionMasterList.filter(x => JSON.stringify(x).toLowerCase().includes(event.target.value.toLowerCase())));
          break;
        }
      }
    } else {
      this.optionsList = _.cloneDeep(this.optionMasterList);
    }
    this.filteredEvent.emit({optionsList:this.optionsList});
  }

}
