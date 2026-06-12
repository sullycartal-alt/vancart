import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
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

  const { messages, systemPromptOverride } = await request.json() as {
    messages: { role: 'user' | 'model'; content: string }[]
    systemPromptOverride?: string
  }

  if (!messages?.length) {
    return NextResponse.json({ error: 'messages requis' }, { status: 400 })
  }

  // Fetch merchant context server-side — never trust client-supplied data
  const service = createServiceClient()
  const { data: merchant } = await service
    .from('merchants')
    .select('business_name, loyalty_rule, stamps_required, points_required, loyalty_type')
    .eq('user_id', user.id)
    .single()

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant introuvable' }, { status: 404 })
  }

  // Build context-aware system prompt
  let systemPrompt = systemPromptOverride ?? SYSTEM_PROMPT
  if (merchant.business_name) {
    const isPoints = merchant.loyalty_type === 'points'
    const requiredCount = isPoints
      ? (merchant.points_required ?? 'non défini')
      : (merchant.stamps_required ?? 'non défini')
    systemPrompt += `\n\nInformations sur le commerce de cet utilisateur :
- Nom : ${merchant.business_name}
- Règle actuelle : ${merchant.loyalty_rule || 'non définie'}
- Type de programme : ${isPoints ? 'Points (le client accumule des points par euro dépensé)' : 'Tampons (le client reçoit un tampon par visite/achat)'}
- ${isPoints ? 'Points requis pour une récompense' : 'Tampons requis pour une récompense'} : ${requiredCount}

Tu connais déjà ce commerce. Adapte tes conseils en conséquence et parle de "${isPoints ? 'points' : 'tampons'}" selon le programme actuel. Réfère-toi à ces informations quand c'est pertinent.`
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
