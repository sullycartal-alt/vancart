import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { Mistral } from '@mistralai/mistralai'

const SYSTEM_PROMPT = `Tu es un expert en fidélisation client pour petits commerces indépendants (bars, restaurants, coffee shops). Tu conseilles les commerçants sur leur stratégie de fidélité de façon chaleureuse, concrète et adaptée à leur réalité terrain. Tu parles toujours en français, de façon simple et directe comme un ami expert.

Données clés à utiliser naturellement :
- Un client fidèle dépense en moyenne 67% de plus qu'un nouveau client
- Acquérir un nouveau client coûte 5 à 7 fois plus cher que fidéliser un existant
- Les programmes de fidélité augmentent la fréquence de visite de 20 à 30%
- 80% du CA vient de 20% des clients fidèles (loi de Pareto)
- En restauration, un client qui revient 3 fois devient habitué dans 70% des cas
- Une récompense atteignable en moins de 30 jours génère 3x plus d'engagement
- Le taux d'adoption d'une carte digitale est 40% supérieur à une carte papier

Tu poses des questions pour comprendre le commerce : type, fréquence de visite, panier moyen, clientèle cible. Puis tu proposes un programme personnalisé avec :
- La règle recommandée (ex: "10 cafés achetés = 1 offert")
- Le nombre de tampons idéal selon la fréquence de visite
- Un argument chiffré personnalisé
- Un texte prêt à copier-coller dans VanCart`

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Rate limit: 30 req/day per IP
  const ip = getClientIp(request)
  const { allowed, retryAfter } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Limite de messages atteinte. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  if (!process.env.MISTRAL_API_KEY) {
    return NextResponse.json({ error: 'Mistral non configuré' }, { status: 501 })
  }

  const { messages, merchantContext } = await request.json() as {
    messages: { role: 'user' | 'model'; content: string }[]
    merchantContext?: { business_name?: string; loyalty_rule?: string; stamps_required?: number; loyalty_type?: string }
  }

  if (!messages?.length) {
    return NextResponse.json({ error: 'messages requis' }, { status: 400 })
  }

  // Build context-aware system prompt
  let systemPrompt = SYSTEM_PROMPT
  if (merchantContext?.business_name) {
    systemPrompt += `\n\nInformations sur le commerce de cet utilisateur :
- Nom : ${merchantContext.business_name}
- Règle actuelle : ${merchantContext.loyalty_rule || 'non définie'}
- Type de programme : ${merchantContext.loyalty_type === 'points' ? 'Points' : 'Tampons'}
- Nombre de tampons/points requis : ${merchantContext.stamps_required ?? 'non défini'}

Tu connais déjà ce commerce. Adapte tes conseils en conséquence et réfère-toi à ces informations quand c'est pertinent.`
  }

  // Convert to Mistral format ('model' role → 'assistant')
  const conversationHistory = messages.map(m => ({
    role: (m.role === 'model' ? 'assistant' : m.role) as 'user' | 'assistant',
    content: m.content,
  }))

  const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })

  try {
    const response = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
    })

    const text = response.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content: text })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ai/conseil] Mistral error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
