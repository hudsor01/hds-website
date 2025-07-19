"use client";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <SunIcon
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          } text-yellow-500`}
        />
        <MoonIcon
          className={`absolute inset-0 transform transition-all duration-300 ${
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          } text-blue-400`}
        />
      </div>
      
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
        theme === 'dark' 
          ? 'bg-blue-400/20 opacity-100' 
          : 'bg-yellow-400/20 opacity-100'
      } group-hover:opacity-100 blur-xl`} />
    </button>
  );
}