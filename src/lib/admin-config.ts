// Single source of truth for admin access. Used by middleware, layouts and API routes.
export const ADMIN_EMAILS = ['sullycartal@gmail.com', 'audrey@vancart.fr'] as const

export function isAdminEmail(email?: string | null): boolean {
  return !!email && (ADMIN_EMAILS as readonly string[]).includes(email)
}
