import React, { InputHTMLAttributes } from 'react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'filled' | 'outlined';
    inputSize?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export { Input };
//# sourceMappingURL=Input.d.ts.map