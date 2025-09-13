// Next.js 15 global loading UI
export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-cyan-500" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Loading page...</span>
    </div>
  );
}