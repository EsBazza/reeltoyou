'use client';

import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent/90 active:scale-95 shadow-md shadow-accent/20',
      secondary: 'bg-secondary text-foreground hover:bg-secondary/80 active:scale-95',
      outline: 'border-2 border-accent/20 hover:border-accent active:scale-95 text-accent font-bold',
      ghost: 'hover:bg-accent/5 active:scale-95 text-gray-500 hover:text-accent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs min-h-[32px]',
      md: 'px-6 py-3 text-sm font-bold uppercase tracking-widest min-h-[44px]',
      lg: 'px-8 py-4 text-base font-bold uppercase tracking-widest min-h-[56px]',
      icon: 'p-2 min-h-[44px] min-w-[44px] flex items-center justify-center',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      if (props.onClick) props.onClick(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
