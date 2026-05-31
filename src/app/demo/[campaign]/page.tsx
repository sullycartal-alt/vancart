import DemoPage from '@/components/demo/DemoPage'

interface Props {
  params: Promise<{ campaign: string }>
}

export async function generateMetadata({ params }: Props) {
  const { campaign } = await params
  return {
    title: `VanCart — Offre spéciale ${campaign}`,
    description: 'Créez votre programme de fidélité digital. QR code en caisse, carte sur smartphone. 1 mois gratuit, sans carte bancaire.',
  }
}

export default async function CampaignPage({ params }: Props) {
  const { campaign } = await params
  return <DemoPage campaign={campaign} />
}
