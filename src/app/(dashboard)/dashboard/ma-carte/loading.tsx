import { Sk } from '@/components/Skeleton'

export default function MaCarteLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Sk className="h-7 w-52" />
        <Sk className="h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form skeleton */}
        <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-6">
          <div className="space-y-3">
            <Sk className="h-4 w-36" />
            <div className="flex gap-2">
              {Array.from({ length: 10 }, (_, i) => <Sk key={i} className="w-8 h-8 rounded-full" />)}
            </div>
          </div>
          {[40, 32, 32, 24].map((w, i) => (
            <div key={i} className="space-y-1.5">
              <Sk className="h-4 w-36" />
              <Sk className={`h-11 w-${w} rounded-xl`} style={{ width: '100%' }} />
            </div>
          ))}
          <Sk className="h-11 w-full rounded-xl" />
        </div>

        {/* Preview skeleton */}
        <div className="flex flex-col items-center gap-4">
          <Sk className="h-4 w-32" />
          <Sk className="h-10 w-64 rounded-xl" />
          <Sk className="w-full rounded-2xl" style={{ aspectRatio: '2.1' }} />
        </div>
      </div>
    </div>
  )
}
