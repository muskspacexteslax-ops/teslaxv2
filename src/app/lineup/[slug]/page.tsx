'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { Layout } from '../../../components/ui'
import { CarVisual } from '../../../components/CarVisual'
import { BODY_LABEL } from '../../../data/models'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function ModelDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { user, models } = useTeslaX()

  const m = models.find(
    (item) =>
      item.slug === slug ||
      (slug === 'roadster-2' && item.slug === 'tesla-roadster') ||
      (slug === 'tesla-roadster' && item.slug === 'roadster-2') ||
      (slug === 'original-roadster' && item.slug === 'roadster-original') ||
      (slug === 'roadster-original' && item.slug === 'original-roadster')
  )
  if (!m) {
    return notFound()
  }

  const specs: { label: string; value: string }[] = m.specs || JSON.parse(m.specs_json || '[]')
  const related = models.filter((item) => item.slug !== m.slug).slice(0, 3)

  return (
    <Layout title={m.name}>
      <div className="wrap" style={{ paddingTop: '104px', paddingBottom: '40px' }}>
        <Link href="/lineup" className="tiny dim inline-block mb-4 hover:text-white">
          ← Back to lineup
        </Link>

        <div className="detail-grid">
          <div>
            <div className="detail-visual">
              <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
            </div>
            <div className="row-between" style={{ marginTop: '22px' }}>
              <div>
                <div className="eyebrow">
                  {BODY_LABEL[m.body as keyof typeof BODY_LABEL] || m.body} · {m.era}
                </div>
                <h1 style={{ fontSize: 'clamp(2rem,3.6vw,2.9rem)', marginTop: '12px' }}>{m.name}</h1>
                <p className="lede" style={{ marginTop: '10px' }}>{m.tagline}</p>
              </div>
              {m.badge && <span className="badge badge-accent">{m.badge}</span>}
            </div>

            <p className="lede" style={{ marginTop: '22px' }}>{m.blurb}</p>

            <div className="specs">
              {specs.map((sp) => (
                <div className="spec" key={sp.label}>
                  <span className="spec-k">{sp.label}</span>
                  <span className="spec-v">{sp.value}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: '26px' }}>
              <div className="eyebrow no-rule">What a swap includes</div>
              <ul className="ticks" style={{ marginTop: '14px' }}>
                <li>Free valuation of your current car within 24 hours</li>
                <li>Collection from your address at no cost</li>
                <li>All transfer and registration paperwork handled both ways</li>
                <li>Battery health and drivetrain report on the Tesla you receive</li>
                <li>14-day cooling off period after handover</li>
              </ul>
            </div>
          </div>

          <aside>
            <div className="card card-glow" style={{ position: 'sticky', top: '80px' }}>
              <div className="eyebrow no-rule" style={{ marginBottom: '10px' }}>
                {m.slug === 'roadster-2' ? 'Pre-Order the Next-Gen Roadster' : `Swap into the ${m.name}`}
              </div>
              <p className="dim" style={{ fontSize: '13px', lineHeight: 1.65 }}>
                {m.slug === 'roadster-2'
                  ? 'Reserve your queue position with optional SpaceX cold-gas thruster package. Apply trade-in equity directly against your reservation.'
                  : 'This platform does not publish list prices. Your existing vehicle determines the terms — we assess it, then disclose the exact difference for your review.'}
              </p>

              <Link className="btn btn-primary btn-block" href={`/swap?target=${m.slug}`} style={{ marginTop: '20px' }}>
                {m.slug === 'roadster-2' ? 'Pre-Order with trade-in credit' : 'Value my car against this'} <span className="arrow">→</span>
              </Link>

              <div className="divider" />

              <div className="kv">
                <span className="k">Valuation time</span>
                <span className="v">Under 24 hours</span>
              </div>
              <div className="kv">
                <span className="k">Cost to value</span>
                <span className="v">Free</span>
              </div>
              <div className="kv">
                <span className="k">Obligation</span>
                <span className="v">None</span>
              </div>

              {!user && (
                <p className="tiny dim" style={{ marginTop: '16px', lineHeight: 1.6 }}>
                  You may begin without an account. One is required to submit the swap and follow its
                  progress from your dashboard.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <section className="section" style={{ paddingBottom: '60px' }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Also consider</div>
              <h2 style={{ fontSize: '1.6rem' }}>Others in the lineup</h2>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/lineup">
              All models
            </Link>
          </div>
          <div className="grid g3">
            {related.map((r) => (
              <Link className="model-card" href={`/lineup/${r.slug}`} key={r.slug}>
                <div className="model-visual">
                  <CarVisual body={r.body} color={r.color} photo={r.photo} name={r.name} />
                </div>
                <div className="model-body">
                  <div className="model-name">{r.name}</div>
                  <div className="model-era">{r.era}</div>
                  <div className="model-foot">
                    <span className="swap-cta">
                      Swap into this <span className="arrow">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}

