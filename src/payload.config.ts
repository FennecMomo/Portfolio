import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { zh } from '@payloadcms/translations/languages/zh'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'
import { Users, Media, Projects, Plans, Demos, SiteSettings } from './collections'
import { storageRoot, siteURL } from './lib/paths'

mkdirSync(storageRoot, { recursive: true })
const dirname = path.dirname(fileURLToPath(import.meta.url))
if (!process.env.PAYLOAD_SECRET) throw new Error('Missing PAYLOAD_SECRET. Run npm run setup first.')
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  serverURL: siteURL(),
  admin: {
    user: 'users',
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' · 狐漠漠工作室' },
  },
  i18n: { supportedLanguages: { zh, en }, fallbackLanguage: 'zh' },
  collections: [Users, Media, Projects, Plans, Demos],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  sharp,
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URL || 'file:./storage/portfolio.db' },
    migrationDir: path.join(dirname, 'migrations'),
    push: process.env.NODE_ENV !== 'production',
  }),
  typescript: { outputFile: path.join(dirname, 'payload-types.ts') },
  upload: { limits: { fileSize: 100 * 1024 * 1024 }, abortOnLimit: true },
  cors: [siteURL()],
  csrf: [siteURL()],
})
