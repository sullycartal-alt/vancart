import { Sk } from '@/components/Skeleton'

export default function StatsLoading() {
  return (
    <div className="space-y-6">
      <Sk className="h-7 w-36" />

      {/* Period selector */}
      <Sk className="h-10 w-full rounded-xl" />

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
      </div>

      {/* Chart */}
      <Sk className="h-56 rounded-2xl" />

      {/* Secondary charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Sk className="h-40 rounded-2xl" />
        <Sk className="h-40 rounded-2xl" />
      </div>
    </div>
  )
}
