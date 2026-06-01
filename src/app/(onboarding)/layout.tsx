import Link from 'next/link'

export default function OnboardingGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col">
      <header className="bg-white border-b border-[#E8E8E3] h-16 flex items-center px-6">
        <Link href="/" className="text-xl font-bold text-[#6C47FF]">VanCart</Link>
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto py-10 px-4 sm:px-6">
        {children}
      </main>
    </div>
  )
}
