import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'noSymbolCurrency',
  standalone:true
})
export class NoSymbolCurrencyPipe implements PipeTransform {

  //dolor pipe
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | string, currencyCode: string = 'USD', digitsInfo: string = '1.0-2', locale: string = 'en-US'): string | null {
    const formattedValue = this.currencyPipe.transform(value, currencyCode, 'symbol', digitsInfo, locale);
    return formattedValue ? formattedValue.replace(/[^0-9.,-]/g, '') : null; // Remove all non-numeric characters except for '.', ',' and '-'
  }

}
