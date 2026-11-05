import type { MetadataRoute } from 'next'
import { MODELS } from '../data/models'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teslax.com'
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/lineup`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/swap`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/markets`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ]

  const modelRoutes: MetadataRoute.Sitemap = MODELS.map((model) => ({
    url: `${baseUrl}/lineup/${model.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...modelRoutes]
}

