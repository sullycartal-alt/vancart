import { Sk } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Sk className="h-7 w-40" />
          <Sk className="h-4 w-28" />
        </div>
        <Sk className="h-5 w-16" />
      </div>

      {/* Primary action */}
      <Sk className="h-24 w-full rounded-2xl" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
        <Sk className="h-20 rounded-xl" />
      </div>

      {/* QR widget */}
      <Sk className="h-40 rounded-2xl" />
    </div>
  )
}
