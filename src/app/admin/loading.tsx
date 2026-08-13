export default function AdminLoading() {
  return (
    <div className="w-full h-96 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
