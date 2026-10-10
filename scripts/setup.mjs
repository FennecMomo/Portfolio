import { mkdir, writeFile, access } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
await mkdir('storage', { recursive: true })
try {
  await access('.env')
  console.log('.env already exists; preserved.')
} catch {
  await writeFile(
    '.env',
    `PAYLOAD_SECRET=${randomBytes(48).toString('hex')}\nSERVER_URL=http://localhost:3000\nDEMO_ORIGIN=http://127.0.0.1:3000\nDATABASE_URL=file:./storage/portfolio.db\nSTORAGE_DIR=./storage\n`,
  )
  console.log('Created local .env with a random secret. Never commit this file.')
}
