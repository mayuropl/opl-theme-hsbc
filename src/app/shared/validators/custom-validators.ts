import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function panValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const pattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const valid = pattern.test(control.value);
    return valid ? null : { panInvalid: true };
  };
}
