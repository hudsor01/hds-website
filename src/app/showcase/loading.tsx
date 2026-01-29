export default function ShowcaseLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-border border-t-cyan-500" />
        <p className="text-muted-foreground text-lg mt-4">Loading showcase...</p>
      </div>
    </div>
  );
}
