'use client';

import * as React from 'react';
import { Film, Heart } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-11 h-11" />; // Placeholder to avoid layout shift
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="text-gray-400 hover:text-accent transition-colors"
    >
      {theme === 'dark' ? (
        <Heart className="h-5 w-5 transition-transform duration-500 text-accent fill-current" />
      ) : (
        <Film className="h-5 w-5 transition-transform duration-500 text-accent" />
      )}
    </Button>
  );
}
