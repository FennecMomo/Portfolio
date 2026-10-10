import type { Access, Where } from 'payload'
export const authenticated: Access = ({ req }) => Boolean(req.user)
export const publicContent: Access = ({ req }) =>
  req.user
    ? true
    : ({
        and: [{ _status: { equals: 'published' } }, { visibility: { equals: 'public' } }],
      } as Where)
export const safeURL = (value: unknown) => {
  if (!value) return true
  try {
    return (
      ['https:', 'http:'].includes(new URL(String(value)).protocol) || '请填写 http 或 https 地址'
    )
  } catch {
    return '请填写完整网址'
  }
}
export const slugValid = (value: unknown) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value)) || '请使用小写英文、数字和短横线'
