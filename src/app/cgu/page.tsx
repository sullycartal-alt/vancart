import Link from 'next/link'

export const metadata = {
  title: 'Conditions Générales d\'Utilisation — VanCart',
}

export default function CGUPage() {
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
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Conditions Générales d&apos;Utilisation</h1>
          <p className="mt-2 text-sm text-[#6B6B6B]">Dernière mise à jour : mai 2025</p>
        </div>

        <section className="bg-[#6C47FF]/5 border border-[#6C47FF]/15 rounded-xl p-4">
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            En utilisant VanCart, vous acceptez les présentes Conditions Générales d'Utilisation. Veuillez les lire attentivement avant de créer votre compte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">1. Objet du service</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart est une plateforme de cartes de fidélité dématérialisées destinée aux commerçants indépendants. Elle permet aux commerçants de créer, gérer et distribuer des programmes de fidélité digitaux accessibles depuis le smartphone de leurs clients, sans nécessiter le téléchargement d'une application.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">2. Accès au service et création de compte</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            L'accès au service VanCart nécessite la création d'un compte commerçant. Vous vous engagez à fournir des informations exactes et à jour lors de votre inscription. Vous êtes responsable de la confidentialité de vos identifiants de connexion.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart se réserve le droit de suspendre ou supprimer tout compte en cas d'utilisation frauduleuse, abusive ou contraire aux présentes conditions.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            L'accès au service est réservé aux personnes majeures (18 ans ou plus) et aux représentants légaux d'une entreprise ou activité commerciale.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">3. Plans tarifaires et paiement</h2>
          <div className="space-y-3 text-sm text-[#6B6B6B] leading-relaxed">
            <p>VanCart propose plusieurs plans tarifaires :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-[#1A1A1A]">Plan Découverte (gratuit) :</strong> 30 jours d'essai gratuit, jusqu'à 50 clients, fonctionnalités de base</li>
              <li><strong className="text-[#1A1A1A]">Plan Essentiel (29€/mois) :</strong> jusqu'à 500 clients, statistiques avancées, conseiller IA</li>
              <li><strong className="text-[#1A1A1A]">Plan Pro (59€/mois) :</strong> clients illimités, notifications SMS, fonctionnalités avancées</li>
            </ul>
            <p>
              Les abonnements payants sont sans engagement mensuel. Vous pouvez résilier à tout moment depuis votre espace commerçant. Aucun remboursement n'est effectué pour les périodes en cours.
            </p>
            <p>
              Les prix sont indiqués en euros toutes taxes comprises (TTC). VanCart se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">4. Utilisation du service</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Vous vous engagez à utiliser VanCart uniquement à des fins légales et dans le respect des présentes CGU. Il est notamment interdit de :
          </p>
          <ul className="text-sm text-[#6B6B6B] list-disc list-inside space-y-1 ml-2 leading-relaxed">
            <li>Utiliser le service à des fins frauduleuses ou trompeuses envers vos clients</li>
            <li>Collecter des données personnelles sans le consentement des personnes concernées</li>
            <li>Tenter de contourner les mesures de sécurité du service</li>
            <li>Revendre ou sous-licencier l'accès au service à des tiers</li>
            <li>Utiliser des outils automatisés pour accéder au service sans autorisation préalable</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">5. Données personnelles</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            En tant que commerçant utilisant VanCart, vous êtes responsable de traitement des données personnelles de vos clients. Vous vous engagez à les informer de la collecte et à respecter leurs droits conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart agit en qualité de sous-traitant pour le traitement des données de vos clients. Notre politique de traitement des données est détaillée dans notre{' '}
            <Link href="/politique-confidentialite" className="text-[#6C47FF] hover:underline">Politique de confidentialité</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">6. Propriété des données</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Vous restez propriétaire de vos données et de celles de vos clients. VanCart ne revend ni ne partage vos données à des tiers à des fins publicitaires. En cas de résiliation de votre compte, vous disposez de 30 jours pour exporter vos données avant leur suppression définitive.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">7. Disponibilité du service</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart s'efforce de maintenir le service disponible 24h/24 et 7j/7. Cependant, des interruptions pour maintenance ou en cas de force majeure peuvent survenir. VanCart ne peut être tenu responsable des préjudices résultant d'une indisponibilité temporaire du service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">8. Résiliation</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Vous pouvez résilier votre compte à tout moment depuis votre espace commerçant ou en contactant notre support à{' '}
            <a href="mailto:contact@vancart.fr" className="text-[#6C47FF] hover:underline">contact@vancart.fr</a>.
            La résiliation prend effet à la fin de la période de facturation en cours pour les plans payants.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart peut résilier votre accès en cas de violation des présentes CGU, avec ou sans préavis selon la gravité de l'infraction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">9. Modifications des CGU</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            VanCart se réserve le droit de modifier les présentes CGU à tout moment. Vous serez informé des modifications significatives par email ou par une notification dans votre dashboard. La poursuite de l'utilisation du service après modification vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">10. Droit applicable et litiges</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Les présentes CGU sont soumises au droit français. En cas de litige relatif à l'interprétation ou à l'exécution de ces conditions, les parties s'engagent à rechercher une solution amiable dans un délai de 30 jours. À défaut, les tribunaux de Paris seront seuls compétents.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">11. Contact</h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Pour toute question relative aux présentes CGU, contactez-nous à{' '}
            <a href="mailto:contact@vancart.fr" className="text-[#6C47FF] hover:underline">contact@vancart.fr</a>.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#E8E8E3] px-6 py-8 text-center text-xs text-[#6B6B6B] space-x-4 bg-white">
        <Link href="/" className="hover:text-[#1A1A1A]">Accueil</Link>
        <Link href="/politique-confidentialite" className="hover:text-[#1A1A1A]">Politique de confidentialité</Link>
        <Link href="/mentions-legales" className="hover:text-[#1A1A1A]">Mentions légales</Link>
      </footer>
    </div>
  )
}
