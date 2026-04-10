import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency',
  standalone: true
})
export class IndianCurrencyPipe implements PipeTransform {

  transform(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '0';
    }

    const numberValue = Number(value);

    if (isNaN(numberValue)) {
      return value;
    }

    return numberValue.toLocaleString('en-IN');
  }


}
