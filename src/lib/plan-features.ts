export type Plan = 'free' | 'essential' | 'pro'

export const ADMIN_EMAIL = 'sullycartal@gmail.com'

export const PLAN_FEATURES = {
  free: {
    maxClients: 50,
    aiAdvisor: false,
    advancedStats: false,
    appleWallet: false,
    googleWallet: false,
    smsNotifications: false,
    pushNotifications: false,
    multiStore: false,
    exportData: false,
  },
  essential: {
    maxClients: 500,
    aiAdvisor: true,
    advancedStats: true,
    appleWallet: true,
    googleWallet: true,
    smsNotifications: false,
    pushNotifications: false,
    multiStore: false,
    exportData: true,
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

export function effectivePlan(storedPlan: Plan, userEmail?: string | null): Plan {
  if (userEmail === ADMIN_EMAIL) return 'pro'
  return storedPlan
}

export function canAccess(plan: Plan, feature: keyof typeof PLAN_FEATURES['free']): boolean {
  return PLAN_FEATURES[plan][feature] as boolean
}
