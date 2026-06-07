// Référence des chaînes UI principales de VanCart, en français.
// Regroupées par section pour préparer une future intégration i18n.
// Voir src/i18n/README.md pour le guide d'utilisation.

const fr = {
  nav: {
    dashboard: 'Tableau de bord',
    clients: 'Mes clients',
    stats: 'Statistiques',
    myCard: 'Ma carte',
    settings: 'Mon commerce',
    caisse: 'Caisse',
    login: 'Se connecter',
    register: 'Créer un compte',
    logout: 'Se déconnecter',
  },

  dashboard: {
    title: 'Tableau de bord',
    welcome: 'Bienvenue sur VanCart !',
    setupPrompt: 'Configurez votre commerce pour démarrer votre programme de fidélité.',
    setupCta: 'Configurer mon commerce →',
    edit: 'Modifier →',
    giveStamp: 'Donner un tampon',
    giveStampHint: 'Scanner le QR code du client ou rechercher par téléphone',
    activeCards: 'Cartes actives',
    stampsToday: "Tampons aujourd'hui",
    rewards: 'Récompenses',
    notifyClients: 'Notifier mes clients',
    notifyPlaceholder: 'Revenez nous voir — votre récompense vous attend !',
    sendNotification: 'Envoyer la notification',
    sending: 'Envoi…',
  },

  onboarding: {
    step: 'Étape',
    businessName: 'Nom du commerce',
    chooseColor: 'Choisissez votre couleur',
    loyaltyRule: 'Règle de fidélité',
    preview: 'Aperçu en temps réel',
    finish: 'Terminer',
    next: 'Suivant',
    back: 'Retour',
  },

  wallet: {
    title: 'Mon Wallet',
    cardCount: '{count} carte{plural} de fidélité',
    empty: "Vous n'avez pas encore de carte de fidélité.",
    loadError: 'Impossible de charger vos cartes.',
    retry: 'Réessayer',
    notifyBanner: 'Recevez les offres de vos commerçants',
    activate: 'Activer',
    activated: 'Notifications activées ✓',
    close: 'Fermer',
    scanPrompt: 'Scannez un QR code chez un commerçant VanCart pour voir vos cartes ici',
  },

  caisse: {
    loginTitle: 'Connexion caisse',
    yourFirstName: 'Ton prénom',
    pinIncorrect: 'Code PIN incorrect.',
    notFound: 'Caisse introuvable.',
    scanClient: 'Scanner un client',
    scanAnother: 'Scanner un autre',
    cancel: 'Annuler',
    logout: 'Se déconnecter',
    sessionUntil: "Session active jusqu'à {time}",
    rewardUnlocked: 'Récompense débloquée',
    invalidQr: 'QR code invalide',
    privateBrowsingTitle: '⚠️ Navigation privée',
  },

  landing: {
    heroTitle: 'La carte de fidélité digitale pensée pour les commerçants indépendants.',
    heroSubtitle: 'VanCart remplace votre carte papier par une carte digitale dans Apple Wallet et Google Wallet.',
    heroCta: 'Créer ma carte gratuitement →',
    heroReassurance: '✓ Gratuit • ✓ Sans CB • ✓ Prêt en 5 minutes',
    alreadyHaveAccount: 'Déjà un compte ?',
    login: 'Se connecter',
    howItWorks: 'Voir comment ça marche →',
    pricingTitle: 'Des offres simples et transparentes',
    pricingFooter: 'Une offre Sullivan & Audrey',
  },

  errors: {
    unauthorized: 'Non autorisé',
    forbidden: 'Accès interdit',
    notFound: 'Introuvable',
    invalidPayload: 'Données invalides',
    genericError: 'Une erreur est survenue, veuillez réessayer.',
    rateLimited: 'Trop de requêtes, veuillez réessayer dans quelques instants.',
    offline: 'Vous êtes hors ligne',
    offlineHint: 'Vérifiez votre connexion et réessayez.',
  },
} as const

export default fr
