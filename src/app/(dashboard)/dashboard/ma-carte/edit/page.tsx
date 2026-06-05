import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function EditCartePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex flex-col items-center justify-center px-4">
      <div className="bg-white border border-[#E8E8E3] rounded-2xl p-10 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Modifier ma carte</h1>
        <p className="text-[#6B6B6B] text-sm">Cette page est en cours de construction. Revenez bientôt !</p>
        <Link href="/dashboard/ma-carte" className="inline-block mt-2 text-sm font-semibold text-[#6C47FF] hover:underline">
          ← Retour à ma carte
        </Link>
      </div>
    </div>
  )
}
