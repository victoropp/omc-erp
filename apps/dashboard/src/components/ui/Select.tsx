import React, { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
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

export function Select({
  label,
  placeholder = 'Select an option',
  error,
  hint,
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'md',
  variant = 'default'
}: SelectProps) {
  const { actualTheme } = useTheme();

  const getSelectedOption = (val: string | string[] | undefined) => {
    if (!val) return null;
    if (multiple && Array.isArray(val)) {
      return options.filter(option => val.includes(option.value));
    }
    if (!multiple && typeof val === 'string') {
      return options.find(option => option.value === val);
    }
    return null;
  };

  const selectedOption = getSelectedOption(value);

  const baseClasses = 'relative w-full cursor-default transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default: clsx(
      'border-2 rounded-xl text-left',
      actualTheme === 'dark' 
        ? 'bg-dark-800 border-dark-600 text-white focus:border-primary-500 focus:bg-dark-700' 
        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500 focus:bg-gray-50'
    ),
    filled: clsx(
      'border-0 rounded-xl text-left',
      actualTheme === 'dark' 
        ? 'bg-dark-700 text-white focus:bg-dark-600' 
        : 'bg-gray-100 text-gray-900 focus:bg-gray-200'
    ),
    outlined: clsx(
      'border-2 rounded-xl bg-transparent text-left',
      actualTheme === 'dark' 
        ? 'border-white/20 text-white focus:border-primary-500' 
        : 'border-gray-200 text-gray-900 focus:border-primary-500'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    error && 'border-red-500 focus:border-red-500'
  );

  const labelClasses = clsx(
    'block text-sm font-medium mb-2',
    actualTheme === 'dark' ? 'text-white' : 'text-gray-700',
    error && 'text-red-500'
  );

  const displayValue = () => {
    if (multiple && Array.isArray(selectedOption)) {
      if (selectedOption.length === 0) return placeholder;
      if (selectedOption.length === 1) return selectedOption[0].label;
      return `${selectedOption.length} items selected`;
    }
    if (!multiple && selectedOption && !Array.isArray(selectedOption)) {
      return selectedOption.label;
    }
    return placeholder;
  };

  return (
    <div className={widthClasses}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={labelClasses}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}

      <Listbox 
        value={value} 
        onChange={onChange} 
        multiple={multiple}
        disabled={disabled}
      >
        {({ open }) => (
          <div className="relative">
            <Listbox.Button className={buttonClasses}>
              <span className={clsx(
                'block truncate',
                !selectedOption && (actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400')
              )}>
                {displayValue()}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <motion.svg
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={clsx(
                    'h-5 w-5',
                    actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Listbox.Options className={clsx(
                'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl py-1 shadow-lg ring-1 ring-opacity-5 focus:outline-none',
                actualTheme === 'dark'
                  ? 'bg-dark-800 ring-white/10 border border-white/10'
                  : 'bg-white ring-black/5 border border-gray-200'
              )}>
                <AnimatePresence>
                  {options.map((option, index) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {({ active, selected }) => (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.05 }}
                          className={clsx(
                            'relative cursor-default select-none py-3 px-4 transition-colors duration-150',
                            active
                              ? actualTheme === 'dark'
                                ? 'bg-primary-500/20 text-white'
                                : 'bg-primary-100 text-primary-900'
                              : actualTheme === 'dark'
                                ? 'text-white'
                                : 'text-gray-900',
                            option.disabled && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={clsx(
                              'block truncate',
                              selected ? 'font-medium' : 'font-normal'
                            )}>
                              {option.label}
                            </span>
                            {selected && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-5 w-5 text-primary-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </motion.svg>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </Listbox.Option>
                  ))}
                </AnimatePresence>
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint message */}
      {hint && !error && (
        <p className={clsx(
          'mt-2 text-sm',
          actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-500'
        )}>
          {hint}
        </p>
      )}
    </div>
  );
}

// Multi-select with tags
interface MultiSelectProps extends Omit<SelectProps, 'multiple' | 'value' | 'onChange'> {
  value: string[];
  onChange: (value: string[]) => void;
  maxSelected?: number;
}

export function MultiSelect({
  value = [],
  onChange,
  maxSelected,
  ...props
}: MultiSelectProps) {
  const { actualTheme } = useTheme();

  const handleRemoveItem = (valueToRemove: string) => {
    onChange(value.filter(v => v !== valueToRemove));
  };

  const selectedOptions = props.options.filter(option => value.includes(option.value));

  return (
    <div className={props.fullWidth ? 'w-full' : ''}>
      <Select
        {...props}
        multiple
        value={value}
        onChange={onChange as (value: string | string[]) => void}
      />

      {/* Selected items as tags */}
      {selectedOptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {selectedOptions.map((option, index) => (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                actualTheme === 'dark'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-primary-100 text-primary-800 border border-primary-200'
              )}
            >
              <span>{option.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(option.value)}
                className={clsx(
                  'ml-2 inline-flex h-4 w-4 rounded-full items-center justify-center transition-colors duration-150',
                  actualTheme === 'dark'
                    ? 'text-primary-400 hover:bg-primary-500/30 hover:text-white'
                    : 'text-primary-600 hover:bg-primary-200 hover:text-primary-800'
                )}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {maxSelected && value.length >= maxSelected && (
        <p className="mt-2 text-sm text-yellow-600">
          Maximum {maxSelected} items can be selected
        </p>
      )}
    </div>
  );
}