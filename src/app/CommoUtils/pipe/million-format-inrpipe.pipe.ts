import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'millionFormatINRPipe',
  standalone: true
})
export class MillionFormatINRPipePipe implements PipeTransform {

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return 'NA';
    }

    const isNegative = value < 0;
    const absValue = Math.abs(value);

    // Convert to crores (1 crore = 10,000,000 INR)
    const croreValue = absValue / 10_000_000;

    // Truncate to 2 decimal places (without rounding)
    const truncated = Math.floor(croreValue * 100) / 100;

    const formatted = `₹${truncated.toFixed(2)}M`;

    return isNegative ? `-${formatted}` : formatted;
  }

}
