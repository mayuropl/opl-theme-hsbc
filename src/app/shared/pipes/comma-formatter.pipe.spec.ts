import { CommaFormatterPipe, parseFormattedNumber } from './comma-formatter.pipe';
import * as fc from 'fast-check';

describe('CommaFormatterPipe', () => {
  let pipe: CommaFormatterPipe;

  beforeEach(() => {
    pipe = new CommaFormatterPipe();
  });

  describe('transform', () => {
    it('should format integer with commas', () => {
      expect(pipe.transform(1000)).toBe('1,000.00');
      expect(pipe.transform(1000000)).toBe('1,000,000.00');
      expect(pipe.transform(25000000)).toBe('25,000,000.00');
    });

    it('should handle decimal values', () => {
      expect(pipe.transform(1000.5)).toBe('1,000.50');
      expect(pipe.transform(1000.55)).toBe('1,000.55');
    });

    it('should handle null/undefined/empty', () => {
      expect(pipe.transform(null)).toBe('');
      expect(pipe.transform(undefined)).toBe('');
      expect(pipe.transform('')).toBe('');
    });

    it('should handle zero', () => {
      expect(pipe.transform(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(pipe.transform(-1000)).toBe('-1,000.00');
      expect(pipe.transform(-1000000)).toBe('-1,000,000.00');
    });

    it('should handle string input', () => {
      expect(pipe.transform('1000')).toBe('1,000.00');
      expect(pipe.transform('1,000,000')).toBe('1,000,000.00');
    });

    it('should respect custom decimal places', () => {
      expect(pipe.transform(1000, { decimalPlaces: 0 })).toBe('1,000');
      expect(pipe.transform(1000.555, { decimalPlaces: 3 })).toBe('1,000.555');
    });
  });

  describe('parseFormattedNumber', () => {
    it('should parse comma-formatted string to number', () => {
      expect(parseFormattedNumber('1,000')).toBe(1000);
      expect(parseFormattedNumber('1,000,000')).toBe(1000000);
      expect(parseFormattedNumber('1,000.50')).toBe(1000.5);
    });

    it('should handle null/undefined/empty', () => {
      expect(parseFormattedNumber(null)).toBeNull();
      expect(parseFormattedNumber(undefined)).toBeNull();
      expect(parseFormattedNumber('')).toBeNull();
      expect(parseFormattedNumber('   ')).toBeNull();
    });

    it('should handle invalid input', () => {
      expect(parseFormattedNumber('abc')).toBeNull();
    });

    it('should handle negative numbers', () => {
      expect(parseFormattedNumber('-1,000')).toBe(-1000);
    });
  });

  /**
   * Property-Based Tests
   * Feature: min-max-filter-enhancement, Property 1: Comma Formatting Round-Trip
   * Validates: Requirements 2.1, 2.2, 2.5
   */
  describe('Property 1: Comma Formatting Round-Trip', () => {
    it('should preserve numeric value after format and parse (integers)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -999999999999, max: 999999999999 }),
          (num) => {
            const formatted = pipe.transform(num, { decimalPlaces: 0 });
            const parsed = parseFormattedNumber(formatted);
            return parsed === num;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve numeric value after format and parse (decimals)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -999999999, max: 999999999, noNaN: true, noDefaultInfinity: true }),
          (num) => {
            // Round to 2 decimal places for comparison (pipe default)
            const rounded = Math.round(num * 100) / 100;
            const formatted = pipe.transform(rounded);
            const parsed = parseFormattedNumber(formatted);
            
            if (parsed === null) return false;
            // Compare with tolerance for floating point
            return Math.abs(parsed - rounded) < 0.01;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always produce valid formatted output for valid numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 999999999 }),
          (num) => {
            const formatted = pipe.transform(num);
            // Should contain only digits, commas, decimal point, and optional negative sign
            return /^-?[\d,]+(\.\d+)?$/.test(formatted);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should place commas at correct positions (every 3 digits from right)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 999999999999 }),
          (num) => {
            const formatted = pipe.transform(num, { decimalPlaces: 0 });
            const parts = formatted.replace('-', '').split(',');
            
            // First part can be 1-3 digits, rest must be exactly 3
            if (parts.length === 1) return true;
            
            const firstPartValid = parts[0].length >= 1 && parts[0].length <= 3;
            const restPartsValid = parts.slice(1).every(p => p.length === 3);
            
            return firstPartValid && restPartsValid;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
