import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default async (req: Request) => {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'File exceeds the 10MB limit' }, { status: 400 })
  }

  const store = getStore('uploads')
  const key = `${Date.now()}-${crypto.randomUUID()}`

  await store.set(key, await file.arrayBuffer(), {
    metadata: {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    },
  })

  return Response.json({ key, filename: file.name })
}

export const config: Config = {
  path: '/api/upload',
  method: 'POST',
}
