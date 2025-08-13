import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  inputSize = 'md',
  fullWidth = true,
  type = 'text',
  ...props
}, ref) => {
  const { actualTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const baseClasses = 'block transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default: clsx(
      'border-2 rounded-xl',
      actualTheme === 'dark' 
        ? 'bg-dark-800 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500 focus:bg-dark-700' 
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:bg-gray-50'
    ),
    filled: clsx(
      'border-0 rounded-xl',
      actualTheme === 'dark' 
        ? 'bg-dark-700 text-white placeholder-dark-400 focus:bg-dark-600' 
        : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-200'
    ),
    outlined: clsx(
      'border-2 rounded-xl bg-transparent',
      actualTheme === 'dark' 
        ? 'border-white/20 text-white placeholder-dark-400 focus:border-primary-500' 
        : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const widthClasses = fullWidth ? 'w-full' : '';

  const inputClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[inputSize],
    widthClasses,
    leftIcon && 'pl-10',
    (rightIcon || type === 'password') && 'pr-10',
    error && 'border-red-500 focus:border-red-500',
    className
  );

  const containerClasses = clsx(
    'relative',
    fullWidth ? 'w-full' : 'inline-block'
  );

  const iconClasses = clsx(
    'absolute top-1/2 transform -translate-y-1/2 w-5 h-5',
    actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-400'
  );

  const labelClasses = clsx(
    'block text-sm font-medium mb-2',
    actualTheme === 'dark' ? 'text-white' : 'text-gray-700',
    error && 'text-red-500'
  );

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const PasswordToggleIcon = () => (
    <button
      type="button"
      onClick={handlePasswordToggle}
      className={clsx(
        'absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors duration-200',
        actualTheme === 'dark' 
          ? 'text-dark-400 hover:text-white' 
          : 'text-gray-400 hover:text-gray-600'
      )}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
        </svg>
      )}
    </button>
  );

  return (
    <div className={containerClasses}>
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={labelClasses}
          htmlFor={props.id || props.name}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={clsx(iconClasses, 'left-3')}>
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && type !== 'password' && (
          <div className={clsx(iconClasses, 'right-3')}>
            {rightIcon}
          </div>
        )}
        
        {type === 'password' && <PasswordToggleIcon />}
        
        {/* Focus ring animation */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 rounded-xl border-2 border-primary-500 pointer-events-none"
              style={{ 
                boxShadow: actualTheme === 'dark' 
                  ? '0 0 0 4px rgba(59, 130, 246, 0.1)' 
                  : '0 0 0 4px rgba(59, 130, 246, 0.1)' 
              }}
            />
          )}
        </AnimatePresence>
      </div>
      
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
});

Input.displayName = 'Input';

export { Input };