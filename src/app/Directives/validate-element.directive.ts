import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appValidateElement]'
})
export class ValidateElementDirective implements AfterViewInit {

  // validate on save click
  @Input() set appValidateElement(value) {
    this.validateElement(value);
  }

  // to pass custom message
  @Input() validationMessage;

  @Input() minlength = 3;
  @Input() maxlength = 100;

  validationMessageJSON = {
    required: '',
    minlength: '',
    maxlength: '',
    pattern: '',
  };

  inputGroup = false;

  constructor(
    private elementRef: ElementRef,
    private ngControl: NgControl
  ) {
    if (elementRef.nativeElement.parentElement.classList.contains('input-group')) {
      elementRef.nativeElement.parentElement.insertAdjacentHTML('afterend', '<p class="errorClass d-none small text-danger"></p>');  // errorClass is just for identify element
      this.inputGroup = true;
    } else {
      elementRef.nativeElement.insertAdjacentHTML('afterend', '<p class="errorClass d-none small text-danger"></p>');
    }
    // ngControl.valueChanges.subscribe((changes: any) => {
    //   this.validateElement();
    // });
  }

  ngAfterViewInit() {

  }

  validateElement(submitted?) {
    const control = this.ngControl;
    let message = '';
    this.setValidationMessage();
    if (control && (((control.dirty || control.touched) && !control.valid) || (submitted && !control.valid))) {
      for (const key in control.errors) {
        if (key) {
          message += this.validationMessageJSON[key] + ' ';
        }
      }
    }
    const errorElement = this.inputGroup ? this.elementRef.nativeElement.parentElement.nextSibling : this.elementRef.nativeElement.nextSibling;
    if (errorElement.classList.contains('errorClass')) {
      if (message) {
        errorElement.innerHTML = message;
        if (errorElement.className.indexOf('d-none') > -1) {
          errorElement.classList.toggle('d-none');
        }
      } else {
        errorElement.innerHTML = '';
        if (errorElement.className.indexOf('d-none') === -1) {
          errorElement.classList.toggle('d-none');
        }
      }
    }
  }
  ngDoCheck(): void {
    const control = this.ngControl;
    if (control && (((control.dirty || control.touched) && !control.valid))) {
      this.validateElement();
    } else {
      const errorElement = this.inputGroup ? this.elementRef.nativeElement.parentElement.nextSibling : this.elementRef.nativeElement.nextSibling;
      if(errorElement && control?.valid) {
        errorElement.innerHTML = '';
      }
    }
  }

  setValidationMessage() {
    this.validationMessageJSON = {
      required: this.validationMessage && this.validationMessage.required || 'Required',
      minlength: this.validationMessage && this.validationMessage.minlength || `Minimum ${this.minlength} characters required`,
      maxlength: this.validationMessage && this.validationMessage.maxlength || `Maximum ${this.maxlength} characters allowed`,
      pattern: this.validationMessage && this.validationMessage.pattern || 'Invalid pattern',
    };
  }

}
