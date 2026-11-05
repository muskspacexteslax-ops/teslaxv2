'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { DashShell } from '../../../../components/dashboard'
import { CarVisual } from '../../../../components/CarVisual'
import { Alert } from '../../../../components/ui'
import { money } from '../../../../lib/db'
import { useTeslaX } from '../../../../context/TeslaXContext'

export default function ShowroomModelPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { user, models, swaps, updateSwap, showToast } = useTeslaX()

  const [reserved, setReserved] = useState(false)

  const m = models.find(
    (x) =>
      x.slug === slug ||
      (slug === 'roadster-2' && x.slug === 'tesla-roadster') ||
      (slug === 'tesla-roadster' && x.slug === 'roadster-2') ||
      (slug === 'original-roadster' && x.slug === 'roadster-original') ||
      (slug === 'roadster-original' && x.slug === 'original-roadster')
  )
  if (!m) return notFound()

  const specs: { label: string; value: string }[] = m.specs || JSON.parse(m.specs_json || '[]')
  const openSwaps = swaps.filter((x) => x.status !== 'completed' && x.status !== 'declined')
  const activeSwap = openSwaps[0]
  const credit = activeSwap?.offer_cents || activeSwap?.estimate_mid || 0
  const gap = credit > 0 ? credit - m.swap_value : null
  const related = models.filter((x) => x.slug !== m.slug).slice(0, 3)

  const handleReserve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSwap) return
    const gapCents = Math.max(0, m.swap_value - credit)
    updateSwap(activeSwap.ref, {
      target_slug: m.slug,
      target_name: m.name,
      gap_cents: gapCents,
    })
    setReserved(true)
    showToast(`The ${m.name} has been attached to your swap ${activeSwap.ref}!`, 'ok')
  }

  return (
    <DashShell
      active="showroom"
      title={m.name}
      sub={`${m.era} · ${m.tagline}`}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/dashboard/showroom">
          ← Showroom
        </Link>
      }
    >
      {reserved && (
        <Alert kind="ok" className="mb-4">
          The {m.name} has been reserved and attached to swap <strong>{activeSwap?.ref}</strong>.
        </Alert>
      )}

      <div className="detail-grid">
        <div>
          <div className="detail-visual">
            <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
          </div>
          <p className="lede" style={{ marginTop: '22px' }}>
            {m.blurb}
          </p>
          <div className="specs">
            {specs.map((sp) => (
              <div className="spec" key={sp.label}>
                <span className="spec-k">{sp.label}</span>
                <span className="spec-v">{sp.value}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="eyebrow no-rule">How the swap settles</div>
            <ul className="ticks" style={{ marginTop: '14px' }}>
              <li>Your trade-in credit is applied directly to this model</li>
              <li>Any gap can be settled from your wallet balance or by bank transfer</li>
              <li>Surplus credit is returned directly to your wallet</li>
              <li>Doorstep delivery, vehicle collection and title transfer are included</li>
            </ul>
          </div>
        </div>

        <aside>
          <div className="card card-glow" style={{ position: 'sticky', top: '80px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Reserve this swap
            </div>

            {credit > 0 && activeSwap ? (
              <>
                <div className="kv">
                  <span className="k">Your credit</span>
                  <span className="v font-mono">{money(credit)}</span>
                </div>
                <div className="kv">
                  <span className="k">{gap !== null && gap > 0 ? 'Surplus back' : 'Gap to settle'}</span>
                  <span
                    className="v font-mono"
                    style={{ color: gap !== null && gap > 0 ? '#6ee7b7' : '#ff9a9e' }}
                  >
                    {gap === null ? '—' : gap > 0 ? money(gap) : money(-gap)}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">Wallet available</span>
                  <span className="v font-mono">{money(user?.balance_cents || 0)}</span>
                </div>

                {gap !== null && gap < 0 && (user?.balance_cents || 0) < Math.abs(gap) && (
                  <div className="alert alert-info" style={{ marginTop: '14px', fontSize: '12px' }}>
                    Wallet is short by {money(Math.abs(gap) - (user?.balance_cents || 0))}. You can still reserve — the
                    balance is settled before vehicle delivery.
                  </div>
                )}

                <form onSubmit={handleReserve} style={{ marginTop: '16px' }}>
                  <button className="btn btn-primary btn-block" type="submit">
                    Reserve the {m.name} <span className="arrow">→</span>
                  </button>
                </form>
                <p className="tiny dim" style={{ marginTop: '10px', lineHeight: 1.6 }}>
                  Attaches {m.name} to open swap {activeSwap.ref}. Nothing is charged today.
                </p>
              </>
            ) : (
              <>
                <p className="dim" style={{ fontSize: '13px', lineHeight: 1.65 }}>
                  Value your current car first and we'll calculate your credit against this model, then let
                  you reserve it in one step.
                </p>
                <Link className="btn btn-primary btn-block" href={`/swap?target=${m.slug}`} style={{ marginTop: '16px' }}>
                  Value my car against this <span className="arrow">→</span>
                </Link>
              </>
            )}

            <div className="divider" />

            <div className="kv">
              <span className="k">Credit</span>
              <span className="v">Free to value</span>
            </div>
            <div className="kv">
              <span className="k">Obligation</span>
              <span className="v">None until collection</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="row-between" style={{ marginTop: '36px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Also in the showroom</h3>
        <Link className="tiny dim hover:text-white" href="/dashboard/showroom">
          All models →
        </Link>
      </div>
      <div className="grid g3">
        {related.map((r) => (
          <Link className="model-card" href={`/dashboard/showroom/${r.slug}`} key={r.slug}>
            <div className="model-visual">
              <CarVisual body={r.body} color={r.color} photo={r.photo} name={r.name} />
            </div>
            <div className="model-body">
              <div className="model-name">{r.name}</div>
              <div className="model-era">{r.era}</div>
            </div>
          </Link>
        ))}
      </div>
    </DashShell>
  )
}

