import { forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, onFocus, ...props }, ref) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delayed scroll to allow keyboard to open and viewport to resize
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    if (onFocus) onFocus(e);
  };

  return (
    <input
      ref={ref}
      onFocus={handleFocus}
      className={cn(
        'w-full bg-paper border-2 border-accent/10 px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-gray-400 min-h-[44px] rounded-md focus:marquee-glow',
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
