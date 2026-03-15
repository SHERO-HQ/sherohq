/**
 * Skeleton loading components for better perceived performance
 */

interface SkeletonProps {
 className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
 return (
 <div
 className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}
 />
 );
}

export function ProductCardSkeleton() {
 return (
 <div className="bg-white dark:bg-slate-900/80 rounded overflow-hidden border border-slate-100 dark:border-slate-800 animate-pulse">
 {/* Image skeleton */}
 <div className="h-40 sm:h-52 bg-slate-200 dark:bg-slate-800" />

 {/* Content skeleton */}
 <div className="p-3 sm:p-4 space-y-3">
 {/* Category row */}
 <div className="flex items-center justify-between">
 <Skeleton className="h-3 w-14 sm:w-16" />
 <Skeleton className="h-2 w-8 rounded-full" />
 </div>

 {/* Title */}
 <Skeleton className="h-4 sm:h-5 w-3/4" />
 <Skeleton className="h-3 w-full opacity-50" />

 {/* Pricing and buttons bar */}
 <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
 <Skeleton className="h-6 w-20" />
 <div className="flex gap-1.5 ">
 <Skeleton className="h-9 flex-1 rounded" />
 <Skeleton className="h-9 flex-1 rounded" />
 </div>
 </div>
 </div>
 </div>
 );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
 return (
 <div className="grid grid-cols-1 min-[425px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
 {Array.from({ length: count }).map((_, i) => (
 <ProductCardSkeleton key={i} />
 ))}
 </div>
 );
}

export function OrderCardSkeleton() {
 return (
 <div className="bg-slate-900/50 border border-slate-800 rounded overflow-hidden p-6">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 {/* Status icon and order info */}
 <div className="flex items-center gap-4">
 <Skeleton className="w-10 h-10 rounded" />
 <div className="space-y-2">
 <Skeleton className="h-5 w-32" />
 <Skeleton className="h-3 w-24" />
 </div>
 </div>

 {/* Customer info */}
 <div className="hidden md:block space-y-2">
 <Skeleton className="h-4 w-28" />
 <Skeleton className="h-3 w-24" />
 </div>

 {/* Total and status */}
 <div className="flex items-center gap-4">
 <div className="text-right space-y-2">
 <Skeleton className="h-5 w-20" />
 <Skeleton className="h-3 w-12" />
 </div>
 <Skeleton className="h-8 w-24 rounded" />
 <Skeleton className="h-5 w-5 rounded" />
 </div>
 </div>
 </div>
 );
}

export function OrderListSkeleton({ count = 5 }: { count?: number }) {
 return (
 <div className="space-y-4">
 {Array.from({ length: count }).map((_, i) => (
 <OrderCardSkeleton key={i} />
 ))}
 </div>
 );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
 return (
 <tr className="border-b border-slate-800">
 {Array.from({ length: columns }).map((_, i) => (
 <td key={i} className="px-6 py-2">
 <Skeleton className="h-4 w-full max-w-[120px]" />
 </td>
 ))}
 </tr>
 );
}

export function DashboardStatSkeleton() {
 return (
 <div className="bg-slate-900/50 border border-slate-800 rounded p-6">
 <div className="flex items-center gap-4">
 <Skeleton className="w-12 h-12 rounded" />
 <div className="flex-1 space-y-2">
 <Skeleton className="h-3 w-20" />
 <Skeleton className="h-7 w-16" />
 </div>
 </div>
 </div>
 );
}

export function DashboardStatsSkeleton() {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {Array.from({ length: 4 }).map((_, i) => (
 <DashboardStatSkeleton key={i} />
 ))}
 </div>
 );
}
