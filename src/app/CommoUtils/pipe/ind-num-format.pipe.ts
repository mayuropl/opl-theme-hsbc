import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indNumFormat'
})
export class IndNumFormatPipe implements PipeTransform {

  transform(numbers: any): any {
    if (typeof (numbers) !== 'undefined' && numbers !== null && !isNaN(parseFloat(numbers))) {
      const text = parseFloat(numbers);
      const currencySymbol = text.toLocaleString('en-IN', {
        currency: 'INR', minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      return currencySymbol;
    }

    return null;
  }

}
