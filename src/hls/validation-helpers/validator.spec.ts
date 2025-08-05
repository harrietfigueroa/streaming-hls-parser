import { describe, expect, it } from 'vitest';
import { ValidationError, ValidationResult, Validator } from './validator.types';

describe('Validator Types', () => {
    describe('ValidationError', () => {
        it('should have correct structure', () => {
            const error: ValidationError = {
                type: 'negative-value',
                invalidValue: 'test',
                description: 'Test error'
            };

            expect(error.type).toBe('negative-value');
            expect(error.invalidValue).toBe('test');
            expect(error.description).toBe('Test error');
        });
    });

    describe('ValidationResult', () => {
        it('should have correct structure for valid result', () => {
            const result: ValidationResult = {
                tagName: '#EXT-X-TARGETDURATION',
                errors: [],
                isValid: true
            };

            expect(result.tagName).toBe('#EXT-X-TARGETDURATION');
            expect(result.errors).toHaveLength(0);
            expect(result.isValid).toBe(true);
        });

        it('should have correct structure for invalid result', () => {
            const result: ValidationResult = {
                tagName: '#EXT-X-TARGETDURATION',
                errors: [
                    {
                        type: 'negative-value',
                        invalidValue: -1,
                        description: 'Value must be non-negative'
                    }
                ],
                isValid: false
            };

            expect(result.tagName).toBe('#EXT-X-TARGETDURATION');
            expect(result.errors).toHaveLength(1);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe('negative-value');
            expect(result.errors[0].invalidValue).toBe(-1);
            expect(result.errors[0].description).toBe('Value must be non-negative');
        });
    });

    describe('Validator interface', () => {
        it('should be implementable', () => {
            class TestValidator implements Validator<string> {
                validate(value: string): ValidationResult {
                    if (value === 'valid') {
                        return {
                            tagName: '#TEST',
                            errors: [],
                            isValid: true
                        };
                    } else {
                        return {
                            tagName: '#TEST',
                            errors: [
                                {
                                    type: 'invalid-enum-value',
                                    invalidValue: value,
                                    description: 'Value must be "valid"'
                                }
                            ],
                            isValid: false
                        };
                    }
                }
            }

            const validator = new TestValidator();

            const validResult = validator.validate('valid');
            expect(validResult.isValid).toBe(true);
            expect(validResult.errors).toHaveLength(0);

            const invalidResult = validator.validate('invalid');
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.errors).toHaveLength(1);
            expect(invalidResult.errors[0].type).toBe('invalid-enum-value');
            expect(invalidResult.errors[0].invalidValue).toBe('invalid');
        });
    });
}); 