import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité — VanCart',
}

const CONTACT_EMAIL = 'contact@vancart.fr'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">VanCart</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
          <p className="mt-2 text-sm text-gray-500">Dernière mise à jour : mai 2025</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">1. Qui sommes-nous ?</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            VanCart est un service de cartes de fidélité dématérialisées destiné aux commerçants indépendants.
            Le responsable du traitement est l'exploitant du service VanCart, joignable à l'adresse{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">2. Données collectées</h2>

          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">Données commerçants</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
                <li>Adresse e-mail (identifiant de connexion)</li>
                <li>Nom du commerce, logo, couleur, règle de fidélité</li>
                <li>Identifiant unique de boutique (slug)</li>
              </ul>
              <p className="text-xs text-gray-400 pt-1">Finalité : authentification et configuration du programme de fidélité.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-1">
              <h3 className="text-sm font-semibold text-gray-700">Données clients (consommateurs finaux)</h3>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-0.5">
                <li>Prénom</li>
                <li>Numéro de téléphone</li>
                <li>Historique de tampons (date et heure de chaque tampon)</li>
              </ul>
              <p className="text-xs text-gray-400 pt-1">
                Finalité : gestion du programme de fidélité du commerçant (suivi des tampons, déclenchement des récompenses).
                Ces données sont collectées avec le consentement du client lors de la création de sa carte.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">3. Base légale du traitement</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Le traitement repose sur le consentement de la personne concernée (article 6.1.a du RGPD),
            recueilli lors de la création de la carte de fidélité, et sur l'exécution du contrat de service
            pour les données commerçants.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">4. Durée de conservation</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            <p>
              <strong className="text-gray-700">Données commerçants :</strong> conservées pendant toute la durée d'utilisation du service,
              puis supprimées dans les 30 jours suivant la clôture du compte.
            </p>
            <p>
              <strong className="text-gray-700">Données clients :</strong> conservées pendant 3 ans à compter du dernier tampon enregistré,
              conformément aux durées habituelles de prescription commerciale.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">5. Partage des données</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les données clients sont accessibles uniquement au commerçant ayant émis la carte de fidélité.
            Elles ne sont pas vendues, revendues ni partagées avec des tiers à des fins publicitaires.
            VanCart utilise Supabase (hébergement UE) comme base de données et Vercel comme hébergeur d'application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">6. Vos droits</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Droit d'accès</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement («&nbsp;droit à l'oubli&nbsp;»)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pour exercer ces droits, contactez-nous par e-mail à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>.
            Nous répondrons dans un délai maximum de 30 jours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">7. Cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            VanCart utilise uniquement un cookie de session sécurisé (HttpOnly, SameSite=Lax) nécessaire
            à l'authentification des commerçants. Aucun cookie publicitaire ou de suivi n'est déposé.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">8. Contact et réclamations</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pour toute question relative à la protection de vos données, écrivez à{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">{CONTACT_EMAIL}</a>.
            Vous pouvez également introduire une réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              CNIL
            </a>{' '}
            si vous estimez que vos droits ne sont pas respectés.
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-100 px-6 py-8 text-center text-xs text-gray-400">
        © 2025 VanCart ·{' '}
        <Link href="/" className="hover:text-gray-600">Retour à l'accueil</Link>
      </footer>
    </div>
  )
}
