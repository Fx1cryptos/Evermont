export function DashboardSkeleton() {
  return <main className="mx-auto grid min-h-screen max-w-5xl content-start gap-6 p-6" aria-busy="true" aria-label="Loading your member portal"><span className="private-overline">Account overview</span>{[160,84,240].map(height=><div key={height} className="animate-pulse rounded-3xl bg-slate-200" style={{height}}/>)}</main>
}
