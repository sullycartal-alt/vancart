// Strip all HTML tags and trim — no jsdom/DOMPurify needed for plain-text fields
export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}
