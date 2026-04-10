/**
 * @author Jaimin Darji
 */
import { Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidationRule {
    private static _validationRulesMap: Map<string, ValidationRule>;
    public static classname: ValidationRule;
    public static required = new ValidationRule('required', Validators.required);
    private constructor(private name: string, public validationFn: (control: AbstractControl) => ValidationErrors | null) {
        ValidationRule.validationRulesMap.set(name, this);
    }

    public static setValidationRulesMap(keyName: string, declaredClass: ValidationRule) {
        ValidationRule.validationRulesMap.set('' + keyName, declaredClass);
    }

    public static get validationRulesMap() {
        if (!ValidationRule._validationRulesMap) {
            ValidationRule._validationRulesMap = new Map<string, ValidationRule>();
        }
        return ValidationRule._validationRulesMap;
    }

    public static setValidationsRulesMap(name: string, value) {
        if (name === 'required') {
            ValidationRule.setValidationRulesMap('required', new ValidationRule('required', Validators.required));
        } else if (name === 'minLength') {
            ValidationRule.setValidationRulesMap('minLength', new ValidationRule('minLength', Validators.minLength(value)));
        } else if (name === 'maxLength') {
            ValidationRule.setValidationRulesMap('maxLength', new ValidationRule('maxLength', Validators.maxLength(value)));
        } else if (name === 'min') {
            ValidationRule.setValidationRulesMap('min', new ValidationRule('min', Validators.min(value)));
        } else if (name === 'max') {
            ValidationRule.setValidationRulesMap('max', new ValidationRule('max', Validators.max(value)));
        } else if (name === 'pattern') {
            ValidationRule.setValidationRulesMap('pattern', new ValidationRule('pattern', Validators.pattern(value)));
        }
    }

    toString() {
        return this.name;
    }
}
