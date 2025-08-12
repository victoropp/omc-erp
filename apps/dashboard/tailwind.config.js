/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Ghana OMC Brand Colors
      colors: {
        // Primary - Ghana Flag Red
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626', // Main brand color
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#662626',
          950: '#4D1F1F',
        },
        
        // Secondary - Ghana Gold
        secondary: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B', // Main gold color
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#5B2B0B',
        },
        
        // Accent - Environmental Green
        accent: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#059669', // Main accent color
          600: '#047857',
          700: '#065F46',
          800: '#064E3B',
          900: '#064039',
          950: '#03312B',
        },
        
        // Fuel Type Colors
        fuel: {
          pms: '#3B82F6',    // Blue - Premium Motor Spirit
          ago: '#F59E0B',    // Amber - Automotive Gas Oil
          lpg: '#8B5CF6',    // Purple - Liquefied Petroleum Gas
          kero: '#06B6D4',   // Cyan - Kerosene
          ifo: '#EC4899',    // Pink - Industrial Fuel Oil
        },
        
        // Dark Theme Colors
        dark: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#5B5D7A',  // Dark text/borders
          600: '#3F4158',  // Tertiary surface
          700: '#2D2E3F',  // Secondary surface
          800: '#1A1B23',  // Primary surface
          900: '#0C0C0F',  // Pure black with blue tint
        },
        
        // Glass/Translucent overlays
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
          primary: 'rgba(220, 38, 38, 0.1)',
          secondary: 'rgba(245, 158, 11, 0.1)',
        }
      },
      
      // Custom font families
      fontFamily: {
        'display': ['Inter Display', 'SF Pro Display', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'Cascadia Code', 'monospace'],
      },
      
      // Extended spacing scale (8px base)
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
        '42': '10.5rem',  // 168px
        '46': '11.5rem',  // 184px
        '50': '12.5rem',  // 200px
      },
      
      // Custom border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      
      // Backdrop blur utilities
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '32px',
        '2xl': '64px',
        '3xl': '128px',
      },
      
      // Box shadow presets
      boxShadow: {
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.25)',
        'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.45)',
        
        // Neumorphism shadows
        'neu-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.1)',
        'neu-outset': '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.1)',
        
        // Elevated cards
        'elevated-sm': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'elevated-md': '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'elevated-lg': '0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.06)',
        'elevated-xl': '0 16px 32px -8px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.06)',
        
        // Glow effects
        'glow-primary': '0 0 20px rgba(220, 38, 38, 0.5)',
        'glow-secondary': '0 0 20px rgba(245, 158, 11, 0.5)',
        'glow-accent': '0 0 20px rgba(5, 150, 105, 0.5)',
      },
      
      // Gradient presets
      backgroundImage: {
        // Holographic gradients
        'gradient-holographic': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-forest': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        
        // Brand gradients
        'gradient-primary': 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-accent': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        
        // Dark theme gradients
        'gradient-dark': 'linear-gradient(135deg, #1A1B23 0%, #2D2E3F 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      
      // Animation durations
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // Animation timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'swift': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      
      // Custom keyframe animations
      keyframes: {
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-16px)' },
        },
        
        // Slide animations
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        
        // Scale animations
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Shimmer loading effect
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        
        // Pulse glow effect
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(220, 38, 38, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)' },
        },
        
        // Floating animation
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        
        // Rotating gradient
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      
      // Animation classes
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Custom plugin for glassmorphism utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.neu-raised': {
          'background': 'linear-gradient(135deg, #f0f0f0, #cacaca)',
          'box-shadow': '4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.7)',
        },
        '.neu-pressed': {
          'background': 'linear-gradient(135deg, #cacaca, #f0f0f0)',
          'box-shadow': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #DC2626, #F59E0B)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.border-gradient': {
          'border': '2px solid transparent',
          'background': 'linear-gradient(135deg, #DC2626, #F59E0B) border-box',
          '-webkit-mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          '-webkit-mask-composite': 'destination-out',
          'mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          'mask-composite': 'exclude',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}