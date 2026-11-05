'use client'

import React from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { DashShell, SwapPill } from '../../../../components/dashboard'
import { CarVisual } from '../../../../components/CarVisual'
import { money, dateStr, SWAP_STATUS, SWAP_FLOW } from '../../../../lib/db'
import { useTeslaX } from '../../../../context/TeslaXContext'

export default function SwapDetailPage() {
  const params = useParams()
  const ref = params?.ref as string
  const { user, swaps, models } = useTeslaX()

  const swap = swaps.find((s) => s.ref === ref)
  if (!swap) {
    return notFound()
  }

  // Tenant isolation guard: members can only view their own swap file
  if (
    user &&
    user.role !== 'admin' &&
    swap.email &&
    swap.email.toLowerCase() !== user.email.toLowerCase()
  ) {
    return notFound()
  }

  const target = models.find((m) => m.slug === swap.target_slug)
  const idx = SWAP_FLOW.indexOf(swap.status)

  return (
    <DashShell
      active="swaps"
      title={`${swap.year} ${swap.make} ${swap.model}`}
      sub={`Swap reference ${swap.ref}`}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/dashboard/swaps">
          ← All swaps
        </Link>
      }
    >
      <div className="order-detail">
        <div>
          <div className="card">
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="price-lbl">Indicative trade-in credit</span>
                <div style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.04em' }} className="font-mono">
                  {money(swap.offer_cents || swap.estimate_mid)}
                </div>
                <div className="tiny dim font-mono" style={{ marginTop: '4px' }}>
                  Range {money(swap.estimate_low)} — {money(swap.estimate_high)}
                </div>
              </div>
              <SwapPill status={swap.status} />
            </div>

            <div className="track" style={{ marginTop: '22px' }}>
              {SWAP_FLOW.map((st, i) => {
                const done = idx >= i && idx !== -1
                return (
                  <React.Fragment key={st}>
                    <div className={`track-step ${done ? 'done' : ''}`}>
                      <i />
                      <span>{SWAP_STATUS[st]?.label || st}</span>
                    </div>
                    {i < SWAP_FLOW.length - 1 && <div className={`track-line ${done && idx > i ? 'done' : ''}`} />}
                  </React.Fragment>
                )
              })}
            </div>

            <div className="divider" />

            <div className="kv">
              <span className="k">Swapping into</span>
              <span className="v font-medium">{swap.target_name || 'Undecided'}</span>
            </div>
            <div className="kv">
              <span className="k">Mileage</span>
              <span className="v">{Number(swap.mileage || 0).toLocaleString('en-US')} mi</span>
            </div>
            <div className="kv">
              <span className="k">Fuel · gearbox</span>
              <span className="v capitalize">
                {swap.fuel} · {swap.transmission}
              </span>
            </div>
            <div className="kv">
              <span className="k">Condition</span>
              <span className="v capitalize">{swap.condition}</span>
            </div>
            <div className="kv">
              <span className="k">Service · accidents</span>
              <span className="v capitalize">
                {swap.service_history} · {swap.accident_history}
              </span>
            </div>
            <div className="kv">
              <span className="k">Owners</span>
              <span className="v">{swap.owners || '1'}</span>
            </div>
            {swap.admin_note && (
              <div className="alert alert-info mt-4 text-xs">
                <strong>Control Desk Note:</strong> {swap.admin_note}
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="card card-glow" style={{ position: 'sticky', top: '80px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Selected Tesla
            </div>
            {target ? (
              <>
                <div className="swap-target-visual mb-3">
                  <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} />
                </div>
                <h4 className="text-lg font-medium">{target.name}</h4>
                <p className="tiny dim">{target.era}</p>

                <div className="divider" />

                <div className="kv">
                  <span className="k">TeslaX valuation</span>
                  <span className="v font-mono">{money(target.swap_value)}</span>
                </div>
                <div className="kv">
                  <span className="k">Your credit</span>
                  <span className="v font-mono text-emerald-400">
                    − {money(swap.offer_cents || swap.estimate_mid)}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">Difference to settle</span>
                  <span className="v font-mono font-bold">
                    {money(swap.gap_cents || Math.max(0, target.swap_value - (swap.offer_cents || swap.estimate_mid)))}
                  </span>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link href={`/dashboard/showroom/${target.slug}`} className="btn btn-primary btn-sm btn-block text-center">
                    Reserve &amp; Settle Gap
                  </Link>
                  <Link href="/dashboard/showroom" className="btn btn-ghost btn-sm btn-block text-center">
                    Choose different model
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <p className="text-xs text-muted mb-4">
                  No target vehicle chosen yet. Browse the showroom to apply your trade-in credit.
                </p>
                <Link href="/dashboard/showroom" className="btn btn-primary btn-sm btn-block text-center">
                  Open showroom →
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashShell>
  )
}

