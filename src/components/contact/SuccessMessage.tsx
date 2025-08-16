'use client';

interface SuccessMessageProps {
  onReset: () => void;
}

export function SuccessMessage({ onReset }: SuccessMessageProps) {
  return (
    <div className="fade-in bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
        Message Sent Successfully!
      </h3>
      <p className="text-green-700 dark:text-green-300 mb-6">
        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
      </p>
      <button
        onClick={onReset}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
      >
        Send Another Message
      </button>
    </div>
  );
}