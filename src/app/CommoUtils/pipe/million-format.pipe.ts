import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'millionFormat',
  standalone: true
})
export class MillionFormatPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'NA';
    }

    const isNegative = value < 0;
    const absValue = Math.abs(value);

    // Convert to millions
    const millionValue = absValue / 1_000_000;

    // Truncate to 2 decimal places (without rounding)
    const truncated = Math.floor(millionValue * 100) / 100;

    const formatted = `$${truncated.toFixed(2)}M`;

    return isNegative ? `-${formatted}` : formatted;
  }
}