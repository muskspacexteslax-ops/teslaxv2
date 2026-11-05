'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Layout } from '../components/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled TeslaX Application Error:', error)
  }, [error])

  return (
    <Layout title="System Recovery">
      <div className="wrap py-36 text-center max-w-lg mx-auto">
        <div className="eyebrow no-rule mb-4">
          <span className="dot" style={{ background: '#ff6b70', color: '#ff6b70' }} /> System Alert
        </div>
        <h1 className="text-3xl sm:text-4xl font-light mb-4 text-white">Something went off track</h1>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          An unexpected interface anomaly occurred while processing this request. Our telemetry has logged the event.
        </p>
        <div className="flex gap-3 justify-center">
          <button type="button" onClick={() => reset()} className="btn btn-primary">
            Retry Operation
          </button>
          <Link href="/" className="btn btn-ghost">
            Return Home
          </Link>
        </div>
        {error?.digest && (
          <p className="tiny dim font-mono mt-8">
            Reference Digest: {error.digest}
          </p>
        )}
      </div>
    </Layout>
  )
}

