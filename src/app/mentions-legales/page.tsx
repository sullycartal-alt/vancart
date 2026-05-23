import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — VanCart',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <nav className="bg-white border-b border-[#E8E8E3] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#6C47FF]">VanCart</Link>
          <Link href="/" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">← Retour</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Mentions légales</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Dernière mise à jour : mai 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">1. Éditeur du site</h2>
          <div className="bg-white rounded-xl border border-[#E8E8E3] p-5 text-sm text-[#6B6B6B] space-y-1.5 leading-relaxed">
            <p><strong className="text-[#1A1A1A]">Nom du projet :</strong> VanCart</p>
            <p><strong className="text-[#1A1A1A]">Nature :</strong> Projet étudiant réalisé dans le cadre d'un cursus à l'ESSCA École de Management</p>
            <p><strong className="text-[#1A1A1A]">Responsable de la publication :</strong> Équipe VanCart — ESSCA</p>
            <p><strong className="text-[#1A1A1A]">Email de contact :</strong>{' '}
              <a href="mailto:contact@vancart.fr" className="text-[#6C47FF] hover:underline">contact@vancart.fr</a>
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">2. Hébergement</h2>
          <div className="bg-white rounded-xl border border-[#E8E8E3] p-5 text-sm text-[#6B6B6B] space-y-1.5 leading-relaxed">
            <p><strong className="text-[#1A1A1A]">Hébergeur de l'application :</strong> Vercel Inc.</p>
            <p><strong className="text-[#1A1A1A]">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
            <p><strong className="text-[#1A1A1A]">Site web :</strong>{' '}
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#6C47FF] hover:underline">vercel.com</a>
            </p>
            <p><strong className="text-[#1A1A1A]">Hébergeur de la base de données :</strong> Supabase Inc. — données hébergées en Europe (UE)</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">3. Propriété intellectuelle</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            L'ensemble des éléments constituant le site VanCart (textes, images, logotypes, interfaces, code source) est la propriété exclusive de l'équipe VanCart, sauf mention contraire. Toute reproduction, distribution, modification ou utilisation à des fins commerciales sans autorisation préalable écrite est strictement interdite.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Les logos et marques des services tiers mentionnés sur ce site (Apple Wallet, Google Wallet, Supabase, Vercel, etc.) sont la propriété de leurs détenteurs respectifs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">4. Limitation de responsabilité</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart met tout en œuvre pour offrir des informations disponibles et vérifiées. Cependant, l'équipe VanCart ne saurait être tenue responsable des erreurs, omissions ou résultats qui pourraient être obtenus par un mauvais usage des informations fournies sur ce site.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart ne peut être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur lors de l'accès au site, résultant de l'utilisation d'un matériel ne répondant pas aux spécifications techniques requises, ou de l'apparition d'un bug ou d'une incompatibilité.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            En tant que projet étudiant en phase de développement, VanCart est susceptible d'évoluer. Nous nous réservons le droit de modifier le site à tout moment sans préavis.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">5. Données personnelles</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Le traitement des données personnelles est décrit dans notre{' '}
            <Link href="/politique-confidentialite" className="text-[#6C47FF] hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">6. Droit applicable</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E8E8E3] px-6 py-8 text-center text-xs text-[#6B6B6B] space-x-4 bg-white">
        <Link href="/" className="hover:text-[#1A1A1A]">Accueil</Link>
        <Link href="/politique-confidentialite" className="hover:text-[#1A1A1A]">Politique de confidentialité</Link>
        <Link href="/cgu" className="hover:text-[#1A1A1A]">CGU</Link>
      </footer>
    </div>
  )
}
