import React, { HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  hover?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className,
  variant = 'glass',
  padding = 'md',
  animate = true,
  hover = false,
  interactive = false,
  children,
  ...props
}, ref) => {
  const { actualTheme } = useTheme();

  const baseClasses = 'rounded-3xl transition-all duration-300';

  const variantClasses = {
    default: actualTheme === 'dark' 
      ? 'bg-dark-800 border border-dark-700' 
      : 'bg-white border border-gray-200 shadow-sm',
    glass: actualTheme === 'dark' 
      ? 'glass border border-white/10' 
      : 'glass border border-gray-200 bg-white/80 backdrop-blur-sm',
    elevated: actualTheme === 'dark' 
      ? 'bg-dark-800 shadow-xl shadow-black/20 border border-dark-700' 
      : 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100',
    outlined: actualTheme === 'dark' 
      ? 'border-2 border-primary-500/30 bg-dark-800/50' 
      : 'border-2 border-primary-500/30 bg-white/50',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const hoverClasses = hover 
    ? actualTheme === 'dark' 
      ? 'hover:bg-white/5 hover:border-white/20 hover:shadow-glow-primary/20' 
      : 'hover:shadow-lg hover:shadow-gray-300/30'
    : '';

  const interactiveClasses = interactive 
    ? 'cursor-pointer transform hover:scale-[1.02]' 
    : '';

  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    interactiveClasses,
    className
  );

  if (animate) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cardClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}, ref) => {
  const { actualTheme } = useTheme();

  return (
    <div
      ref={ref}
      className={clsx(
        'flex items-center justify-between pb-4 mb-6 border-b',
        actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200',
        className
      )}
      {...props}
    >
      <div>
        {title && (
          <h3 className={clsx(
            'text-xl font-semibold',
            actualTheme === 'dark' ? 'text-white' : 'text-gray-800'
          )}>
            {title}
          </h3>
        )}
        {subtitle && (
          <p className={clsx(
            'text-sm mt-1',
            actualTheme === 'dark' ? 'text-dark-400' : 'text-gray-600'
          )}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

// Card content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  // Add any specific props if needed
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

// Card footer component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  // Add any specific props if needed
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({
  className,
  children,
  ...props
}, ref) => {
  const { actualTheme } = useTheme();

  return (
    <div
      ref={ref}
      className={clsx(
        'pt-4 mt-6 border-t',
        actualTheme === 'dark' ? 'border-white/10' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };