export type Plan = 'free' | 'essential' | 'pro'

export const ADMIN_EMAIL = 'sullycartal@gmail.com'

export const PLAN_FEATURES = {
  free: {
    maxClients: 50,
    aiAdvisor: false,
    advancedStats: false,
    appleWallet: true,
    googleWallet: true,
    smsNotifications: false,
    pushNotifications: false,
    multiStore: false,
    exportData: false,
  },
  essential: {
    maxClients: 500,
    aiAdvisor: false,
    advancedStats: true,
    appleWallet: true,
    googleWallet: true,
    smsNotifications: false,
    pushNotifications: false,
    multiStore: false,
    exportData: false,
  },
  pro: {
    maxClients: -1,
    aiAdvisor: true,
    advancedStats: true,
    appleWallet: true,
    googleWallet: true,
    smsNotifications: true,
    pushNotifications: true,
    multiStore: true,
    exportData: true,
  },
}

function normalizePlan(raw: string | null | undefined): Plan {
  const lower = (raw ?? '').toLowerCase()
  if (lower === 'pro') return 'pro'
  if (lower === 'essential' || lower === 'essentiel') return 'essential'
  // covers 'free', 'découverte', 'decouverte', '' and any unknown value
  return 'free'
}

export function effectivePlan(storedPlan: string | null | undefined, userEmail?: string | null): Plan {
  if (userEmail === ADMIN_EMAIL) return 'pro'
  return normalizePlan(storedPlan)
}

export function canAccess(plan: Plan, feature: keyof typeof PLAN_FEATURES['free']): boolean {
  return PLAN_FEATURES[plan][feature] as boolean
}
