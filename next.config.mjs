import { withPayload } from '@payloadcms/next/withPayload'

export default withPayload({
  poweredByHeader: false,
  serverExternalPackages: ['yauzl'],
  async redirects() {
    return [
      { source: '/project/:slug', destination: '/works/:slug', permanent: true },
      { source: '/root', destination: '/admin', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
})
