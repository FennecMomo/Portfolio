import { createHmac, timingSafeEqual } from 'node:crypto'
export function signDemoToken(id: string, expires = Date.now() + 15 * 60_000) {
  const value = `${id}.${expires}`
  const signature = createHmac('sha256', process.env.PAYLOAD_SECRET!)
    .update(`demo-preview:${value}`)
    .digest('hex')
  return `${value}.${signature}`
}
export function verifyDemoToken(token: string, id: string) {
  const parts = token.split('.')
  if (
    parts.length !== 3 ||
    parts[0] !== id ||
    !Number.isFinite(Number(parts[1])) ||
    Number(parts[1]) < Date.now()
  )
    return false
  const expected = Buffer.from(signDemoToken(id, Number(parts[1])))
  const received = Buffer.from(token)
  return received.length === expected.length && timingSafeEqual(received, expected)
}
