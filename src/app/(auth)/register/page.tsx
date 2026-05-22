'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

const inputClass = 'block w-full rounded-xl border border-[#E8E8E3] px-4 py-3 text-sm text-[#1A1A1A] bg-[#F7F6F3] focus:border-[#6C47FF] focus:outline-none focus:ring-2 focus:ring-[#6C47FF]/15 transition-all'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { business_name: data.businessName },
      },
    })

    if (error) {
      setError('root', { message: error.message })
      return
    }

    fetch('/api/welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, businessName: data.businessName }),
    }).catch(() => {})

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#E8E8E3] shadow-sm rounded-2xl p-8">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-[#6C47FF]">VanCart</Link>
        <h1 className="text-xl font-bold text-[#1A1A1A] mt-3">Créer un compte</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Gratuit · Aucune carte bancaire</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Nom du commerce
          </label>
          <input
            {...register('businessName')}
            type="text"
            id="businessName"
            placeholder="Le Café du Coin"
            autoComplete="organization"
            className={inputClass}
          />
          {errors.businessName && <p className="mt-1.5 text-xs text-red-500">{errors.businessName.message}</p>}
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Mot de passe
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="new-password"
            className={inputClass}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            className={inputClass}
          />
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {errors.root && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#6C47FF] hover:bg-[#5835e0] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Création du compte…' : 'Créer mon compte gratuit'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B6B6B]">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-[#6C47FF] font-medium hover:text-[#5835e0]">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
