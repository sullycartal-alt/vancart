'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard?toast=password_updated')
  }

  return (
    <div className="bg-white border border-[#E8E8E3] shadow-sm rounded-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-[#6C47FF]">VanCart</Link>
        <h1 className="text-xl font-bold text-[#1A1A1A] mt-3">Choisir un nouveau mot de passe</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Minimum 8 caractères</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className={inputClass}
            placeholder="Répétez votre mot de passe"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
        </button>
      </form>
    </div>
  )
}
