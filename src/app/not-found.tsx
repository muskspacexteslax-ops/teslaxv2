import React from 'react'
import Link from 'next/link'
import { Layout } from '../components/ui'

export default function NotFound() {
  return (
    <Layout title="Not Found">
      <div className="wrap py-36 text-center max-w-lg mx-auto">
        <div className="eyebrow no-rule mb-4">404 · Page Not Found</div>
        <h1 className="text-4xl font-light mb-4">Off the grid</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          The requested page or resource doesn't exist or has moved. Return to the homepage or explore the vehicle catalogue.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
          <Link href="/lineup" className="btn btn-ghost">
            View Lineup
          </Link>
        </div>
      </div>
    </Layout>
  )
}

