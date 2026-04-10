import { Injectable } from '@angular/core';
import { Observable, Observer, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RootScopeService {
  private data = new BehaviorSubject('');
  currentData = this.data.asObservable();
  currentValue: any;

  constructor() { }

  updateScope(item: any) {
    this.data.next(item);
  }
  getScopeValue() {
    this.currentData.subscribe((currentData) => {
      this.currentValue = currentData;
    });
    return this.currentValue;
  }
  convertToCurrencyInRound(value){
    if(value != undefined){
      if(typeof value == "string"){
        value = Number(value);
      }
      return value.toLocaleString('en-IN',{maximumFractionDigits: 0});
    }
  }
}
