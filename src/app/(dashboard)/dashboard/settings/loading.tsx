import { Sk } from '@/components/Skeleton'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Sk className="h-7 w-40" />
        <Sk className="h-4 w-72" />
      </div>

      {/* Form card */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Sk className="h-4 w-32" />
            <Sk className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <Sk className="h-11 w-36 rounded-xl" />
      </div>

      {/* Wallet card */}
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-6 space-y-4">
        <Sk className="h-5 w-40" />
        <Sk className="h-16 rounded-xl" />
        <Sk className="h-16 rounded-xl" />
      </div>
    </div>
  )
}
