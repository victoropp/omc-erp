import React from 'react';
import { SelectOption } from '@/types';
interface SelectProps {
    label?: string;
    placeholder?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    value?: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'filled' | 'outlined';
}
export declare function Select({ label, placeholder, error, hint, options, value, onChange, multiple, disabled, required, fullWidth, size, variant }: SelectProps): React.JSX.Element;
interface MultiSelectProps extends Omit<SelectProps, 'multiple' | 'value' | 'onChange'> {
    value: string[];
    onChange: (value: string[]) => void;
    maxSelected?: number;
}
export declare function MultiSelect({ value, onChange, maxSelected, ...props }: MultiSelectProps): React.JSX.Element;
export {};
//# sourceMappingURL=Select.d.ts.map