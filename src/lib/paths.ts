import path from 'node:path'
export const storageRoot = path.resolve(process.env.STORAGE_DIR || './storage')
export const mediaRoot = path.join(storageRoot, 'media')
export const archiveRoot = path.join(storageRoot, 'archives')
export const demoRoot = path.join(storageRoot, 'demos')
export const siteURL = () =>
  process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
export const demoOrigin = () => new URL(process.env.DEMO_ORIGIN || 'http://127.0.0.1:3000').origin
