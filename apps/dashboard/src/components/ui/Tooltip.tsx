import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'right', 
  delay = 500,
  disabled = false 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const { actualTheme } = useTheme();

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let x = 0, y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - 10;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 10;
            break;
          case 'left':
            x = rect.left - 10;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + 10;
            y = rect.top + rect.height / 2;
            break;
        }

        setTooltipPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformOrigin = () => {
    switch (position) {
      case 'top': return 'bottom center';
      case 'bottom': return 'top center';
      case 'left': return 'right center';
      case 'right': return 'left center';
      default: return 'left center';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return '-translate-x-1/2 -translate-y-full';
      case 'bottom': return '-translate-x-1/2';
      case 'left': return '-translate-x-full -translate-y-1/2';
      case 'right': return '-translate-y-1/2';
      default: return '-translate-y-1/2';
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 transform rotate-45';
    const bgColor = actualTheme === 'dark' ? 'bg-dark-700' : 'bg-gray-800';
    
    switch (position) {
      case 'top': return `${baseClasses} ${bgColor} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom': return `${baseClasses} ${bgColor} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left': return `${baseClasses} ${bgColor} left-full top-1/2 -translate-y-1/2 -translate-x-1/2`;
      case 'right': return `${baseClasses} ${bgColor} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
      default: return `${baseClasses} ${bgColor} right-full top-1/2 -translate-y-1/2 translate-x-1/2`;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transformOrigin: getTransformOrigin(),
            }}
          >
            <div className={`relative ${getPositionClasses()}`}>
              <div className={`px-3 py-2 text-sm font-medium text-white rounded-lg shadow-lg border max-w-xs ${
                actualTheme === 'dark' 
                  ? 'bg-dark-700 border-white/10' 
                  : 'bg-gray-800 border-gray-600'
              }`}>
                {content}
              </div>
              <div className={getArrowClasses()} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}