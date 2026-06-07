// English reference translations, mirroring the structure of fr.ts.
// See src/i18n/README.md for usage guidelines.

const en = {
  nav: {
    dashboard: 'Dashboard',
    clients: 'My customers',
    stats: 'Statistics',
    myCard: 'My card',
    settings: 'My business',
    caisse: 'Checkout',
    login: 'Log in',
    register: 'Create an account',
    logout: 'Log out',
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to VanCart!',
    setupPrompt: 'Set up your business to launch your loyalty program.',
    setupCta: 'Set up my business →',
    edit: 'Edit →',
    giveStamp: 'Give a stamp',
    giveStampHint: "Scan the customer's QR code or search by phone number",
    activeCards: 'Active cards',
    stampsToday: 'Stamps today',
    rewards: 'Rewards',
    notifyClients: 'Notify my customers',
    notifyPlaceholder: 'Come back and see us — your reward is waiting!',
    sendNotification: 'Send notification',
    sending: 'Sending…',
  },

  onboarding: {
    step: 'Step',
    businessName: 'Business name',
    chooseColor: 'Choose your color',
    loyaltyRule: 'Loyalty rule',
    preview: 'Live preview',
    finish: 'Finish',
    next: 'Next',
    back: 'Back',
  },

  wallet: {
    title: 'My Wallet',
    cardCount: '{count} loyalty card{plural}',
    empty: "You don't have any loyalty card yet.",
    loadError: 'Could not load your cards.',
    retry: 'Retry',
    notifyBanner: 'Get offers from your favorite shops',
    activate: 'Activate',
    activated: 'Notifications enabled ✓',
    close: 'Close',
    scanPrompt: 'Scan a QR code at a VanCart merchant to see your cards here',
  },

  caisse: {
    loginTitle: 'Checkout login',
    yourFirstName: 'Your first name',
    pinIncorrect: 'Incorrect PIN code.',
    notFound: 'Checkout not found.',
    scanClient: 'Scan a customer',
    scanAnother: 'Scan another',
    cancel: 'Cancel',
    logout: 'Log out',
    sessionUntil: 'Session active until {time}',
    rewardUnlocked: 'Reward unlocked',
    invalidQr: 'Invalid QR code',
    privateBrowsingTitle: '⚠️ Private browsing',
  },

  landing: {
    heroTitle: 'The digital loyalty card built for independent shop owners.',
    heroSubtitle: 'VanCart replaces your paper loyalty card with a digital one in Apple Wallet and Google Wallet.',
    heroCta: 'Create my card for free →',
    heroReassurance: '✓ Free • ✓ No card required • ✓ Ready in 5 minutes',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Log in',
    howItWorks: 'See how it works →',
    pricingTitle: 'Simple, transparent pricing',
    pricingFooter: 'A Sullivan & Audrey offer',
  },

  errors: {
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    invalidPayload: 'Invalid payload',
    genericError: 'Something went wrong, please try again.',
    rateLimited: 'Too many requests, please try again shortly.',
    offline: 'You are offline',
    offlineHint: 'Check your connection and try again.',
  },
} as const

export default en
