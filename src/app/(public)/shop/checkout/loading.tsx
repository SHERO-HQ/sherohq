export default function CheckoutLoading() {
 return (
 <div className="min-h-screen bg-background">
 <div className="max-w-4xl mx-auto px-4 py-12">
 {/* Title skeleton */}
 <div className="h-8 w-40 bg-muted rounded animate-pulse mb-8" />

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Form skeleton */}
 <div className="lg:col-span-2 space-y-6">
 <div className="h-48 bg-muted rounded animate-pulse" />
 <div className="h-48 bg-muted rounded animate-pulse" />
 </div>

 {/* Summary skeleton */}
 <div className="space-y-4">
 <div className="h-64 bg-muted rounded animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 );
}
