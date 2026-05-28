import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mes cartes — VanCart',
}

export default function WalletPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F3] px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold"
          style={{ backgroundColor: '#6C47FF' }}
        >
          V
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Mes cartes VanCart</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Connectez-vous pour voir toutes vos cartes de fidélité
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-colors hover:opacity-90"
          style={{ backgroundColor: '#6C47FF' }}
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
}
