import { Sk } from '@/components/Skeleton'

export default function StampLoading() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="space-y-2">
        <Sk className="h-7 w-44" />
        <Sk className="h-4 w-64" />
      </div>

      {/* Scanner area */}
      <Sk className="h-48 rounded-2xl" />

      {/* Or divider + search */}
      <div className="flex items-center gap-3">
        <Sk className="h-px flex-1" />
        <Sk className="h-4 w-8 rounded" />
        <Sk className="h-px flex-1" />
      </div>
      <Sk className="h-11 w-full rounded-xl" />
    </div>
  )
}
