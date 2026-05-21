import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GuideActions from './GuideActions'

const FAQ = [
  {
    q: 'Mes clients ont-ils besoin de télécharger une application ?',
    a: 'Non. La carte de fidélité est une simple page web. Le client la met en favori sur son téléphone, c\'est tout.',
  },
  {
    q: 'Comment mes clients récupèrent-ils leur carte ?',
    a: 'Ils scannent votre QR code affiché en caisse, entrent leur prénom et téléphone en 30 secondes, et reçoivent un lien permanent vers leur carte.',
  },
  {
    q: 'Que se passe-t-il quand un client change de téléphone ?',
    a: 'Rien. La carte est liée à son numéro de téléphone, pas à son appareil. Il peut aussi enregistrer le lien en favori ou dans Google Wallet.',
  },
  {
    q: 'Comment mes employés tamponnent-ils une carte ?',
    a: 'Via le bouton "Tamponner" dans le dashboard. Ils scannent le QR code de la carte du client avec la caméra, ou recherchent le client par numéro de téléphone.',
  },
  {
    q: 'Puis-je changer le nombre de tampons requis après le lancement ?',
    a: 'Oui, depuis "Mon commerce". Les cartes existantes ne sont pas affectées rétroactivement — seuls les nouveaux tampons suivent la nouvelle règle.',
  },
]

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('slug, business_name, primary_color')
    .eq('user_id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const clientUrl = merchant ? `${appUrl}/${merchant.slug}` : null

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guide de démarrage</h1>
        <p className="mt-1 text-sm text-gray-500">Tout ce qu'il faut pour lancer votre programme de fidélité.</p>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {[
          {
            num: '01',
            title: 'Configurez votre commerce',
            desc: 'Ajoutez votre logo, choisissez la couleur de votre marque, rédigez votre règle de fidélité et définissez le nombre de tampons ou points requis.',
            action: (
              <Link href="/dashboard/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                Configurer mon commerce →
              </Link>
            ),
            done: !!merchant,
          },
          {
            num: '02',
            title: 'Téléchargez et imprimez votre QR code',
            desc: 'Imprimez le QR code et posez-le bien en vue en caisse, sur votre comptoir ou sur une petite affichette. Vos clients le scanneront pour obtenir leur carte.',
            action: merchant && clientUrl
              ? <GuideActions clientUrl={clientUrl} primaryColor={merchant.primary_color} />
              : <p className="text-sm text-amber-600">Configurez d'abord votre commerce pour obtenir votre QR code.</p>,
          },
          {
            num: '03',
            title: 'Formez votre personnel',
            desc: (
              <span>
                Pour tamponner une carte, allez sur{' '}
                <Link href="/dashboard/stamp" className="text-indigo-600 font-medium hover:underline">Tamponner</Link>
                {' '}dans le menu. Appuyez sur "Scanner un QR code", pointez la caméra sur la carte du client, et c'est fait en 2 secondes.
                Si le client n'a pas son QR code sous la main, vous pouvez aussi le rechercher par numéro de téléphone.
                La confirmation s'affiche instantanément avec le nombre de tampons restants.
              </span>
            ),
            action: (
              <Link href="/dashboard/stamp"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                Ouvrir Tamponner →
              </Link>
            ),
          },
          {
            num: '04',
            title: 'Partagez le lien sur vos réseaux',
            desc: 'Postez le lien de votre carte sur Instagram, WhatsApp, ou imprimez-le sur vos menus. Chaque client qui clique peut créer sa carte en 30 secondes depuis son téléphone.',
            action: clientUrl
              ? (
                <GuideActions clientUrl={clientUrl} primaryColor={merchant?.primary_color ?? '#6366f1'} copyOnly />
              )
              : null,
          },
        ].map(({ num, title, desc, action, done }) => (
          <div key={num} className="bg-white rounded-xl shadow-sm p-6 flex gap-5">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${done ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-600'}`}>
                {done ? '✓' : num}
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              {action && <div>{action}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Questions fréquentes</h2>
        <div className="space-y-3">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1.5">{q}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
