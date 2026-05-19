import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gray-50">
      <main className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">VanCart</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Cartes de fidélité dématérialisées pour vos clients — sans application à télécharger.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Créer mon compte
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Se connecter
          </Link>
        </div>
      </main>
    </div>
  )
}
