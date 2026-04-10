import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, UntypedFormControl } from '@angular/forms';
import { ValidationRule } from './validation-rule';
import { ObjectModel } from '../model/object-model';

@Injectable({
  providedIn: 'root'
})
export class ValidationsService {

  getValidatorErrorMessage(validatorName, validatorValue) {
    const config = {
      required: 'This field is required',
      invalidNumber: 'Input should be an integer value',
      alphaNumericAllowed: 'Only apha numeric input is allowed',
      numericAllowed: 'Only numeric values are allowed',
      emailTaken: 'Email id already taken',
      minlength: `Minimum length should be ${validatorValue.requiredLength} characters`,
      maxlength: `Maximum length should be ${validatorValue.requiredLength} characters`,
      min: `Min value should be more than ${validatorValue.min}`,
      max: `Max value should be less than ${validatorValue.max}`,
      pattern: `Pattern not match`,
    };

    return config[validatorName];
  }
  validationConfig(value, fieldValidations?) {
    if (fieldValidations != null || fieldValidations !== undefined) {
      const validatiors = this.getValidationFunctions(fieldValidations);
      if (validatiors != null) {
        return new UntypedFormControl(value, validatiors);
      }
    }
    return new UntypedFormControl(value);
  }

  getValidationFunctions(validationRuleStrings: Array<ObjectModel>): Array<(control: AbstractControl) =>
    ValidationErrors | null> | null {
    const validationRules = [];
    for (const validationRuleStr of validationRuleStrings) {
      if (validationRules.indexOf(validationRuleStr) === -1) {
        let validationRule;
        // let validationRule = ValidationRule.validationRulesMap.get(validationRuleStr.key);
        // if (validationRule === undefined) {
        ValidationRule.setValidationsRulesMap(validationRuleStr.key, validationRuleStr.value);
        validationRule = ValidationRule.validationRulesMap.get(validationRuleStr.key);
        // }
        validationRules.push(validationRule.validationFn);
      }
    }
    return validationRules.length > 0 ? validationRules : null;
  }
}
