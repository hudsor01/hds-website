'use client';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 fade-in">
      <p className="text-red-800 dark:text-red-200 text-sm">{message}</p>
    </div>
  );
}