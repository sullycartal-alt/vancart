'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Check } from 'lucide-react'

const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://vancart.vercel.app/reset-password',
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="bg-white border border-[#E8E8E3] shadow-sm rounded-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-[#6C47FF]">VanCart</Link>
        <h1 className="text-xl font-bold text-[#1A1A1A] mt-3">Réinitialiser votre mot de passe</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Entrez votre email, nous vous enverrons un lien de réinitialisation
        </p>
      </div>

      {sent ? (
        <div className="space-y-5">
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-center">
            <p className="text-sm text-green-700 font-medium">
              <Check size={16} strokeWidth={1.9} className="inline-block mr-1 text-green-600" />Email envoyé ! Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
          </div>
          <Link
            href="/login"
            className="block text-center text-sm text-[#6C47FF] hover:text-[#5835e0] transition-colors font-medium"
          >
            ← Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="votre@email.com"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>

          <Link
            href="/login"
            className="block text-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </form>
      )}
    </div>
  )
}
