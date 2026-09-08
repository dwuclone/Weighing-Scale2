import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

export default async (req: Request, context: Context) => {
  const store = getStore('uploads')
  const { key } = context.params

  if (req.method === 'DELETE') {
    await store.delete(key)
    return new Response(null, { status: 204 })
  }

  const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })
  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const filename = result.metadata.filename ?? key
  return new Response(result.data as ArrayBuffer, {
    headers: {
      'Content-Type': (result.metadata.contentType as string) ?? 'application/octet-stream',
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  })
}

export const config: Config = {
  path: '/api/uploads/:key',
  method: ['GET', 'DELETE'],
}
