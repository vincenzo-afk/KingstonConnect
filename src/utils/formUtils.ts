/**
 * Form utilities for validation, dirty state tracking, and form management
 */

// =============================================================================
// VALIDATION RULES
// =============================================================================

export type ValidationRule<T> = (value: T, formValues?: Record<string, any>) => string | undefined;

/**
 * Required field validation
 */
export const required = (message = 'This field is required'): ValidationRule<any> => {
    return (value) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            return message;
        }
        return undefined;
    };
};

/**
 * Minimum length validation
 */
export const minLength = (min: number, message?: string): ValidationRule<string> => {
    return (value) => {
        if (value && value.length < min) {
            return message || `Must be at least ${min} characters`;
        }
        return undefined;
    };
};

/**
 * Maximum length validation
 */
export const maxLength = (max: number, message?: string): ValidationRule<string> => {
    return (value) => {
        if (value && value.length > max) {
            return message || `Must be at most ${max} characters`;
        }
        return undefined;
    };
};

/**
 * Email validation
 */
export const email = (message = 'Please enter a valid email address'): ValidationRule<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (value) => {
        if (value && !emailRegex.test(value)) {
            return message;
        }
        return undefined;
    };
};

/**
 * Phone number validation
 */
export const phone = (message = 'Please enter a valid phone number'): ValidationRule<string> => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return (value) => {
        if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
            return message;
        }
        return undefined;
    };
};

/**
 * Pattern validation with regex
 */
export const pattern = (regex: RegExp, message: string): ValidationRule<string> => {
    return (value) => {
        if (value && !regex.test(value)) {
            return message;
        }
        return undefined;
    };
};

/**
 * Minimum number validation
 */
export const min = (minValue: number, message?: string): ValidationRule<number> => {
    return (value) => {
        if (value !== undefined && value < minValue) {
            return message || `Must be at least ${minValue}`;
        }
        return undefined;
    };
};

/**
 * Maximum number validation
 */
export const max = (maxValue: number, message?: string): ValidationRule<number> => {
    return (value) => {
        if (value !== undefined && value > maxValue) {
            return message || `Must be at most ${maxValue}`;
        }
        return undefined;
    };
};

/**
 * Match another field validation
 */
export const matches = (fieldName: string, message?: string): ValidationRule<any> => {
    return (value, formValues) => {
        if (formValues && value !== formValues[fieldName]) {
            return message || `Must match ${fieldName}`;
        }
        return undefined;
    };
};

/**
 * Custom validation
 */
export const custom = <T>(validator: (value: T) => boolean, message: string): ValidationRule<T> => {
    return (value) => {
        if (!validator(value)) {
            return message;
        }
        return undefined;
    };
};

// =============================================================================
// VALIDATION COMPOSER
// =============================================================================

/**
 * Compose multiple validation rules
 */
export function composeValidators<T>(...validators: ValidationRule<T>[]): ValidationRule<T> {
    return (value, formValues) => {
        for (const validator of validators) {
            const error = validator(value, formValues);
            if (error) return error;
        }
        return undefined;
    };
}

/**
 * Validate a single field
 */
export function validateField<T>(
    value: T,
    validators: ValidationRule<T>[],
    formValues?: Record<string, any>
): string | undefined {
    for (const validator of validators) {
        const error = validator(value, formValues);
        if (error) return error;
    }
    return undefined;
}

/**
 * Validate entire form
 */
export function validateForm<T extends Record<string, any>>(
    values: T,
    schema: Partial<Record<keyof T, ValidationRule<any>[]>>
): Partial<Record<keyof T, string>> {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, validators] of Object.entries(schema)) {
        if (validators) {
            const error = validateField(values[field], validators as ValidationRule<any>[], values);
            if (error) {
                errors[field as keyof T] = error;
            }
        }
    }

    return errors;
}

// =============================================================================
// FORM FIELD UTILITIES
// =============================================================================

/**
 * Create field props for input binding
 */
export function createFieldProps<T>(
    name: string,
    value: T,
    onChange: (name: string, value: T) => void,
    onBlur: (name: string) => void,
    error?: string,
    touched?: boolean
) {
    return {
        name,
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            onChange(name, e.target.value as any);
        },
        onBlur: () => onBlur(name),
        error: touched ? error : undefined,
    };
}

// =============================================================================
// FORM STATE HELPERS
// =============================================================================

/**
 * Check if values have changed from initial
 */
export function isDirty<T extends Record<string, any>>(
    values: T,
    initialValues: T
): boolean {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
}

/**
 * Get changed fields
 */
export function getChangedFields<T extends Record<string, any>>(
    values: T,
    initialValues: T
): Partial<T> {
    const changed: Partial<T> = {};

    for (const key of Object.keys(values) as (keyof T)[]) {
        if (JSON.stringify(values[key]) !== JSON.stringify(initialValues[key])) {
            changed[key] = values[key];
        }
    }

    return changed;
}

/**
 * Reset form to initial values
 */
export function resetForm<T extends Record<string, any>>(
    initialValues: T,
    setValues: (values: T) => void,
    setErrors: (errors: Partial<Record<keyof T, string>>) => void,
    setTouched: (touched: Partial<Record<keyof T, boolean>>) => void
) {
    setValues({ ...initialValues });
    setErrors({});
    setTouched({});
}

// =============================================================================
// UNSAVED CHANGES WARNING
// =============================================================================

/**
 * Hook to warn user about unsaved changes
 */
import { useEffect, useCallback } from 'react';

export function useUnsavedChangesWarning(
    isDirty: boolean,
    message = 'You have unsaved changes. Are you sure you want to leave?'
) {
    const handleBeforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        },
        [isDirty, message]
    );

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [handleBeforeUnload]);
}

// =============================================================================
// FORM INPUT FORMATTERS
// =============================================================================

/**
 * Format phone number as user types
 */
export function formatPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 3) {
        return numbers;
    }
    if (numbers.length <= 6) {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    }
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
}

/**
 * Format credit card number
 */
export function formatCreditCard(value: string): string {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').trim();
}

/**
 * Format currency
 */
export function formatCurrency(value: string | number, currency = 'INR'): string {
    const number = typeof value === 'string' ? parseFloat(value) || 0 : value;

    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(number);
}

/**
 * Parse formatted number
 */
export function parseFormattedNumber(value: string): number {
    return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
}

// =============================================================================
// FORM SUBMISSION HELPERS
// =============================================================================

/**
 * Debounced auto-save
 */
export function createAutoSave<T>(
    saveFunction: (values: T) => Promise<void>,
    delay: number = 1000
) {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (values: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            saveFunction(values);
        }, delay);
    };
}

/**
 * Submit with loading state
 */
export async function submitWithLoading<T>(
    submitFn: () => Promise<T>,
    setLoading: (loading: boolean) => void,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
): Promise<T | null> {
    setLoading(true);
    try {
        const result = await submitFn();
        onSuccess?.(result);
        return result;
    } catch (error) {
        onError?.(error as Error);
        return null;
    } finally {
        setLoading(false);
    }
}
