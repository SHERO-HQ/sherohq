export default function AdminLoading() {
 return (
 <div className="min-h-screen flex items-center justify-center dark:bg-card bg-slate-50">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-4 border-brand-secondary-500 border-t-transparent rounded-full animate-spin" />
 <p className="text-sm text-muted-foreground font-primary animate-pulse">
 Loading…
 </p>
 </div>
 </div>
 );
}
