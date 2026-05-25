import { Sk } from '@/components/Skeleton'

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Sk className="h-7 w-32" />
        <Sk className="h-4 w-48" />
      </div>

      {/* Search / filter bar */}
      <Sk className="h-10 w-full rounded-xl" />

      {/* Table rows */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#F0F0EE] last:border-0">
            <Sk className="h-9 w-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Sk className="h-4 w-32" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-6 w-16 rounded-lg" />
            <Sk className="h-4 w-20 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
