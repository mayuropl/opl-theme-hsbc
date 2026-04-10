import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { IndNumFormatPipe } from '../CommoUtils/pipe/ind-num-format.pipe';


@Directive({
  selector: '[appCurrencyInputDirective]'
})
export class CurrencyInputDirectiveDirective {

  private digitRegex: RegExp | undefined;
  private el: HTMLInputElement;
  private lastValid = '';
  // build the regex based on max pre decimal digits allowed
  private regexString(max?: number) {
    const maxStr = max ? `{0,${max}}` : `+`;
    return `^(\\d${maxStr}(\\.\\d{0,2})?|\\.\\d{0,2})$`;
  }
  private setRegex(maxDigits?: number) {
    this.digitRegex = new RegExp(this.regexString(maxDigits), 'g');
  }
  @Input()
  set maxDigits(maxDigits: number) {
    this.setRegex(maxDigits);
  }
  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
    this.setRegex();
  }

  ngOnInit() {    
    this.el.value = new IndNumFormatPipe().transform(this.el.value);
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: string) {
    // on focus remove currency formatting
    this.el.value = value.replace(/[^0-9.]+/g, '');
  }

  // @HostListener('keyup', ['$event.target.value'])
  // onKeyup(value) {
  //    // on onKeyup, add currency formatting
  //   this.el.value = new IndNumFormatPipe().transform(value);
  // }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: any) {
    // on blur, add currency formatting
    this.el.value = new IndNumFormatPipe().transform(value);
  }

  // variable to store last valid input
  @HostListener('input', ['$event'])
  onInput(event: { target: { value: { match: (arg0: RegExp | undefined) => any; }; }; }) {
    // on input, run regex to only allow certain characters and format
    const cleanValue = (event.target.value.match(this.digitRegex) || []).join('');
    if (cleanValue || !event.target.value)
      this.lastValid = cleanValue;
      this.el.value = cleanValue || this.lastValid;
    
  }

}
