import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'internationalNumber',
  standalone: true
})
export class InternationalNumberPipe implements PipeTransform {

  transform(value: any): string {
    if (value == null || isNaN(value)) {
      return '-';
    }

    const num = Number(value);
    return num.toLocaleString('en-US'); // Converts to 2,560,406,712 format
  }
}


