import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teslax.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/lineup', '/lineup/*', '/swap', '/markets', '/login', '/signup', '/verify'],
        disallow: ['/admin', '/admin/*', '/dashboard', '/dashboard/*', '/api', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

