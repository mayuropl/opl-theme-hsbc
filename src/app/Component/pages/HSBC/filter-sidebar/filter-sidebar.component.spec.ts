import { FilterSidebarComponent } from './filter-sidebar.component';
import * as fc from 'fast-check';

describe('FilterSidebarComponent', () => {
  let component: FilterSidebarComponent;

  // Mock services
  const mockMsmeService = { getFilterListFromApi: jasmine.createSpy() };
  const mockCommonService = { errorSnackBar: jasmine.createSpy() };
  const mockExistingProspectsDropDownService = { selectAllCheckbox: jasmine.createSpy() };

  beforeEach(() => {
    component = new FilterSidebarComponent(
      mockMsmeService as any,
      mockCommonService as any,
      mockExistingProspectsDropDownService as any
    );
  });

  // Helper to create a mock filter structure
  function createMockFilter(min: string | null, max: string | null) {
    return {
      filter1: { count: 0 },
      filter2: {
        json: {
          min: min,
          max: max,
          count: 0,
          minTemp: 0,
          maxTemp: 1000000
        }
      }
    };
  }

  describe('Min/Max Count Logic', () => {
    /**
     * Property-Based Tests
     * Feature: min-max-filter-enhancement, Property 2: Single Value Entry Count
     * Validates: Requirements 3.4, 5.1, 5.2
     */
    describe('Property 2: Single Value Entry Count', () => {
      it('should set count to 1 when only min value is entered', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (minValue) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // Simulate entering min value only
              filter2.json.min = minValue.toFixed(2);
              filter2.json.max = null;
              
              // Call the method that updates count
              (component as any).updateMinMaxCount(filter1, filter2);
              
              return filter2.json.count === 1 && filter1.count === 1;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should set count to 1 when only max value is entered', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (maxValue) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // Simulate entering max value only
              filter2.json.min = null;
              filter2.json.max = maxValue.toFixed(2);
              
              // Call the method that updates count
              (component as any).updateMinMaxCount(filter1, filter2);
              
              return filter2.json.count === 1 && filter1.count === 1;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should handle zero as a valid min value', () => {
        const { filter1, filter2 } = createMockFilter(null, null);
        
        filter2.json.min = '0.00';
        filter2.json.max = null;
        
        (component as any).updateMinMaxCount(filter1, filter2);
        
        expect(filter2.json.count).toBe(1);
        expect(filter1.count).toBe(1);
      });

      it('should handle zero as a valid max value', () => {
        const { filter1, filter2 } = createMockFilter(null, null);
        
        filter2.json.min = null;
        filter2.json.max = '0.00';
        
        (component as any).updateMinMaxCount(filter1, filter2);
        
        expect(filter2.json.count).toBe(1);
        expect(filter1.count).toBe(1);
      });
    });

    /**
     * Property-Based Tests
     * Feature: min-max-filter-enhancement, Property 3: Both Values Count as One
     * Validates: Requirements 5.3
     */
    describe('Property 3: Both Values Count as One', () => {
      it('should set count to 1 (not 2) when both min and max are entered', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 500000, noNaN: true, noDefaultInfinity: true }),
            fc.double({ min: 500001, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (minValue, maxValue) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // Simulate entering both values
              filter2.json.min = minValue.toFixed(2);
              filter2.json.max = maxValue.toFixed(2);
              
              // Call the method that updates count
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Count should be exactly 1, not 2
              return filter2.json.count === 1 && filter1.count === 1;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should not increment count again if already active', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 500000, noNaN: true, noDefaultInfinity: true }),
            fc.double({ min: 500001, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (minValue, maxValue) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // First entry - min only
              filter2.json.min = minValue.toFixed(2);
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Second entry - add max
              filter2.json.max = maxValue.toFixed(2);
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Count should still be 1
              return filter2.json.count === 1 && filter1.count === 1;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    /**
     * Property-Based Tests
     * Feature: min-max-filter-enhancement, Property 7: Clear Values Resets Count
     * Validates: Requirements 3.5, 5.4
     */
    describe('Property 7: Clear Values Resets Count', () => {
      it('should set count to 0 when both values are cleared', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (value) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // First, set a value
              filter2.json.min = value.toFixed(2);
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Then clear it
              filter2.json.min = null;
              (component as any).updateMinMaxCount(filter1, filter2);
              
              return filter2.json.count === 0 && filter1.count === 0;
            }
          ),
          { numRuns: 100 }
        );
      });

      it('should keep count at 1 if one value remains after clearing the other', () => {
        fc.assert(
          fc.property(
            fc.double({ min: 0, max: 500000, noNaN: true, noDefaultInfinity: true }),
            fc.double({ min: 500001, max: 1000000, noNaN: true, noDefaultInfinity: true }),
            (minValue, maxValue) => {
              const { filter1, filter2 } = createMockFilter(null, null);
              
              // Set both values
              filter2.json.min = minValue.toFixed(2);
              filter2.json.max = maxValue.toFixed(2);
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Clear min, keep max
              filter2.json.min = null;
              (component as any).updateMinMaxCount(filter1, filter2);
              
              // Count should still be 1
              return filter2.json.count === 1 && filter1.count === 1;
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  /**
   * Property-Based Tests
   * Feature: min-max-filter-enhancement, Property 5: Numeric Input Filtering
   * Validates: Requirements 4.2, 6.1
   */
  describe('Property 5: Numeric Input Filtering', () => {
    it('should strip all non-numeric characters except decimal point', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (input) => {
            const sanitized = component.sanitizeNumericInput(input, false);
            // Result should only contain digits and at most one decimal point
            const validPattern = /^-?\d*\.?\d*$/;
            return validPattern.test(sanitized);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve valid numeric input unchanged', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (num) => {
            const input = num.toFixed(2);
            const sanitized = component.sanitizeNumericInput(input, false);
            return sanitized === input;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should remove letters from mixed input', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          fc.string({ minLength: 1, maxLength: 5 }),
          (num, letters) => {
            const numStr = num.toFixed(2);
            const mixedInput = numStr + letters;
            const sanitized = component.sanitizeNumericInput(mixedInput, false);
            // Should not contain any letters
            return !/[a-zA-Z]/.test(sanitized);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep only first decimal point', () => {
      const input = '123.45.67';
      const sanitized = component.sanitizeNumericInput(input, false);
      const decimalCount = (sanitized.match(/\./g) || []).length;
      expect(decimalCount).toBeLessThanOrEqual(1);
    });
  });

  /**
   * Property-Based Tests
   * Feature: min-max-filter-enhancement, Property 6: Negative Value Conditional Acceptance
   * Validates: Requirements 4.5
   */
  describe('Property 6: Negative Value Conditional Acceptance', () => {
    it('should strip negative sign when allowNegative is false', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000000, max: -1, noNaN: true, noDefaultInfinity: true }),
          (negValue) => {
            const input = negValue.toFixed(2);
            const sanitized = component.sanitizeNumericInput(input, false);
            // Should not contain negative sign
            return !sanitized.includes('-');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve negative sign when allowNegative is true', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000000, max: -1, noNaN: true, noDefaultInfinity: true }),
          (negValue) => {
            const input = negValue.toFixed(2);
            const sanitized = component.sanitizeNumericInput(input, true);
            // Should start with negative sign
            return sanitized.startsWith('-');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep only leading negative sign', () => {
      const input = '-123-456';
      const sanitized = component.sanitizeNumericInput(input, true);
      const negCount = (sanitized.match(/-/g) || []).length;
      expect(negCount).toBe(1);
      expect(sanitized.startsWith('-')).toBe(true);
    });

    it('should handle positive values correctly with allowNegative true', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (posValue) => {
            const input = posValue.toFixed(2);
            const sanitized = component.sanitizeNumericInput(input, true);
            // Should not add negative sign to positive values
            return !sanitized.startsWith('-');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property-Based Tests
   * Feature: min-max-filter-enhancement, Property 4: Min Greater Than Max Validation
   * Validates: Requirements 4.1, 4.3
   */
  describe('Property 4: Min Greater Than Max Validation', () => {
    it('should show validation error when min > max', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 500001, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          fc.double({ min: 0, max: 500000, noNaN: true, noDefaultInfinity: true }),
          (minValue, maxValue) => {
            const filter2 = {
              json: {
                minRaw: minValue,
                maxRaw: maxValue,
                validationError: null
              }
            };
            
            const isValid = component.validateMinMax(filter2);
            
            // Should be invalid and have error message
            return !isValid && 
                   filter2.json.validationError === 'Min value is more than Max value please enter correct value';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clear validation error when min <= max', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 500000, noNaN: true, noDefaultInfinity: true }),
          fc.double({ min: 500001, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (minValue, maxValue) => {
            const filter2 = {
              json: {
                minRaw: minValue,
                maxRaw: maxValue,
                validationError: 'Previous error'
              }
            };
            
            const isValid = component.validateMinMax(filter2);
            
            // Should be valid and error cleared
            return isValid && filter2.json.validationError === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be valid when min equals max', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (value) => {
            const filter2 = {
              json: {
                minRaw: value,
                maxRaw: value,
                validationError: null
              }
            };
            
            const isValid = component.validateMinMax(filter2);
            
            return isValid && filter2.json.validationError === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be valid when only min is set', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (minValue) => {
            const filter2 = {
              json: {
                minRaw: minValue,
                maxRaw: null,
                validationError: null
              }
            };
            
            const isValid = component.validateMinMax(filter2);
            
            return isValid && filter2.json.validationError === null;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be valid when only max is set', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
          (maxValue) => {
            const filter2 = {
              json: {
                minRaw: null,
                maxRaw: maxValue,
                validationError: null
              }
            };
            
            const isValid = component.validateMinMax(filter2);
            
            return isValid && filter2.json.validationError === null;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
