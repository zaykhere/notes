"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { toggleDarkMode } = useStore();
  const { theme, setTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const toggleTheme = () => {
    toggleDarkMode();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
}