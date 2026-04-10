import { Component, Input } from '@angular/core';
import { UntypedFormControl, AbstractControl } from '@angular/forms';
import { ValidationsService } from './validations.service';
import { CommonMethods } from '../common-methods';


@Component({
    selector: 'app-validation-messages',
    template: `<div class="text-danger" *ngIf="errorMessage">{{errorMessage}}</div>`
})
export class ValidationMessagesComponent {
    @Input() control: UntypedFormControl;
    constructor(private validationService: ValidationsService, private commonMethod: CommonMethods) { }

    get errorMessage() {
        for (const propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && (this.control.dirty || this.control.touched)) {
                let errorMsg = this.validatorErrorMessage(this.control, propertyName);
                if (errorMsg == null) {
                    errorMsg = this.validationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
                }
                return errorMsg;
            }
        }

        return null;
    }

    validatorErrorMessage(c: AbstractControl, propertyName): string | null {
        const formGroup = c.parent.controls;
        const controlName = Object.keys(formGroup).find(name => c === formGroup[name]);
        if (controlName != null || controlName !== undefined) {
            return this.commonMethod.getErrorMessage(controlName, propertyName) || null;
        }
        return null;
    }
}
