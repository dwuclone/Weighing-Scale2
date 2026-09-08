import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

export default async () => {
  const store = getStore('uploads')
  const { blobs } = await store.list()

  const files = await Promise.all(
    blobs.map(async ({ key }) => {
      const result = await store.getMetadata(key)
      return {
        key,
        filename: result?.metadata.filename ?? key,
        contentType: result?.metadata.contentType,
        uploadedAt: result?.metadata.uploadedAt,
      }
    }),
  )

  files.sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))

  return Response.json({ files })
}

export const config: Config = {
  path: '/api/uploads',
  method: 'GET',
}
