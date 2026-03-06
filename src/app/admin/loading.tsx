export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-slate-950 bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-primary animate-pulse">
          Loading…
        </p>
      </div>
    </div>
  );
}
