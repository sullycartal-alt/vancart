import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "L'image doit faire moins de 4 Mo" }, { status: 400 })
  }

  const service = createServiceClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await service.storage
    .from('hero-images')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage.from('hero-images').getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
