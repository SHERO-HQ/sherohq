import { Card } from "@/components/ui/card";

export function OrderDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded bg-accent/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-accent/50 rounded" />
            <div className="h-6 w-36 bg-accent rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-accent/50 rounded" />
          <div className="h-10 w-24 bg-accent/50 rounded" />
          <div className="h-10 w-32 bg-accent rounded" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div className="h-5 w-32 bg-accent/50 rounded" />
              <div className="h-5 w-20 bg-accent/50 rounded-full" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-6 py-2">
                  <div className="w-20 h-20 bg-accent/50 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-accent rounded" />
                    <div className="h-3 w-24 bg-accent/50 rounded" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 w-16 bg-accent rounded ml-auto" />
                    <div className="h-3 w-10 bg-accent/50 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-14 bg-accent/50 rounded w-full" />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card border-border p-6 space-y-4">
              <div className="h-4 w-32 bg-accent/50 rounded" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/50" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-accent rounded" />
                  <div className="h-3 w-36 bg-accent/50 rounded" />
                </div>
              </div>
            </Card>
            <Card className="bg-card border-border p-6 space-y-4">
              <div className="h-4 w-32 bg-accent/50 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-accent rounded" />
                <div className="h-3 w-32 bg-accent/50 rounded" />
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card border-border p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-accent/50 rounded" />
              <div className="h-10 bg-accent/50 rounded" />
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="h-3 w-24 bg-accent/50 rounded" />
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-accent/50 rounded" />
                <div className="h-4 w-20 bg-accent rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-accent/50 rounded" />
                <div className="h-4 w-20 bg-accent rounded" />
              </div>
            </div>
          </Card>
          <div className="h-24 bg-card/50 rounded border border-border animate-pulse" />
        </div>
      </div>
    </div>
  );
}
