'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

const MIN_LOADING_MS = 500

const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setLoading(true)
    const start = Date.now()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      setError('root', { message: error.message })
      return
    }

    const elapsed = Date.now() - start
    if (elapsed < MIN_LOADING_MS) {
      await new Promise(r => setTimeout(r, MIN_LOADING_MS - elapsed))
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#E8E8E3] shadow-sm rounded-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-[#6C47FF]">VanCart</Link>
        <h1 className="text-xl font-bold text-[#1A1A1A] mt-3">Connexion</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Accédez à votre tableau de bord</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className={inputClass}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
              Mot de passe
            </label>
            <Link href="/forgot-password" className="text-xs text-[#6C47FF] hover:text-[#5835e0] transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="current-password"
            className={inputClass}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {errors.root && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading && <Spinner />}
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B6B6B]">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-[#6C47FF] font-medium hover:text-[#5835e0]">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
