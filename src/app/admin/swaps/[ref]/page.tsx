'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { AdminShell } from '../../../../components/AdminShell'
import { CarVisual } from '../../../../components/CarVisual'
import { money, dateStr, SWAP_STATUS } from '../../../../lib/db'
import { useTeslaX } from '../../../../context/TeslaXContext'

export default function AdminSwapDetailPage() {
  const params = useParams()
  const ref = params?.ref as string
  const { swaps, users, models, updateSwap, showToast } = useTeslaX()

  const swap = swaps.find((s) => s.ref === ref)
  if (!swap) return notFound()

  const owner = users.find((u) => u.id === swap.user_id)
  const target = models.find((m) => m.slug === swap.target_slug)

  const [offerDollars, setOfferDollars] = useState(
    swap.offer_cents ? (swap.offer_cents / 100).toString() : (swap.estimate_mid / 100).toString()
  )
  const [stage, setStage] = useState(swap.status)
  const [adminNote, setAdminNote] = useState(swap.admin_note || '')

  React.useEffect(() => {
    if (swap) {
      setOfferDollars(
        swap.offer_cents ? (swap.offer_cents / 100).toString() : (swap.estimate_mid / 100).toString()
      )
      setStage(swap.status)
      setAdminNote(swap.admin_note || '')
    }
  }, [swap])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const offerVal = parseFloat(offerDollars)
    const offerCents = isNaN(offerVal) ? 0 : Math.round(offerVal * 100)
    const gapCents = target ? Math.max(0, target.swap_value - offerCents) : 0

    updateSwap(swap.ref, {
      offer_cents: offerCents,
      gap_cents: gapCents,
      status: stage as any,
      admin_note: adminNote,
    })
    showToast(`Swap ${swap.ref} updated. Offer: ${money(offerCents)}, Stage: ${stage}`, 'ok')
  }

  return (
    <AdminShell
      active="swaps"
      title={`Swap ${swap.ref}`}
      sub={`${swap.year} ${swap.make} ${swap.model} → ${swap.target_name || 'undecided'}`}
      actions={
        <Link className="btn btn-ghost btn-sm" href="/admin/swaps">
          ← All swaps
        </Link>
      }
    >
      <div className="order-detail">
        <div>
          <div className="card">
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="price-lbl">Member estimate</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 300, letterSpacing: '-0.04em' }} className="font-mono">
                  {money(swap.estimate_mid)}
                </div>
                <div className="tiny dim font-mono">
                  Range {money(swap.estimate_low)} — {money(swap.estimate_high)}
                </div>
              </div>
              <span className="badge">{SWAP_STATUS[swap.status]?.label || swap.status}</span>
            </div>

            <div className="divider" />

            <div className="kv">
              <span className="k">Member</span>
              <span className="v">
                {owner?.full_name || 'Member'} · {owner?.email || '—'}
              </span>
            </div>
            <div className="kv">
              <span className="k">Mileage</span>
              <span className="v">{Number(swap.mileage || 0).toLocaleString('en-US')} mi</span>
            </div>
            <div className="kv">
              <span className="k">Fuel · transmission</span>
              <span className="v capitalize">
                {swap.fuel} · {swap.transmission}
              </span>
            </div>
            <div className="kv">
              <span className="k">Condition</span>
              <span className="v capitalize">{swap.condition}</span>
            </div>
            <div className="kv">
              <span className="k">Service history</span>
              <span className="v capitalize">{swap.service_history}</span>
            </div>
            <div className="kv">
              <span className="k">Accidents</span>
              <span className="v capitalize">{swap.accident_history}</span>
            </div>
            <div className="kv">
              <span className="k">Owners</span>
              <span className="v">{swap.owners || '1'}</span>
            </div>
            {swap.notes && (
              <div className="kv">
                <span className="k">Member notes</span>
                <span className="v" style={{ maxWidth: '60%' }}>
                  {swap.notes}
                </span>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: '14px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
              Set official offer and stage
            </div>
            <form onSubmit={handleSave}>
              <div className="field-row">
                <label className="field">
                  <span className="label">Official Offer (USD)</span>
                  <input
                    className="input font-mono"
                    type="number"
                    min="0"
                    step="50"
                    value={offerDollars}
                    onChange={(e) => setOfferDollars(e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="label">Stage</span>
                  <select
                    className="input"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                  >
                    {['submitted', 'valued', 'accepted', 'scheduled', 'completed', 'declined'].map((st) => (
                      <option value={st} key={st}>
                        {SWAP_STATUS[st]?.label || st}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="field">
                <span className="label">Note to member</span>
                <textarea
                  className="input"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Final value confirmed after 20m drive inspection…"
                />
              </label>
              <button className="btn btn-primary" type="submit">
                Save official swap offer
              </button>
            </form>
          </div>
        </div>

        <aside>
          <div className="card">
            {target ? (
              <>
                <div className="swap-target-visual" style={{ marginBottom: '12px' }}>
                  <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} />
                </div>
                <h4>{target.name}</h4>
                <p className="tiny dim" style={{ marginTop: '4px' }}>
                  {target.era}
                </p>
              </>
            ) : (
              <p className="tiny dim">No target model selected yet.</p>
            )}
            <div className="divider" />
            <div className="kv">
              <span className="k">Gap to settle</span>
              <span className="v font-mono">{swap.gap_cents ? money(swap.gap_cents) : '—'}</span>
            </div>
            <div className="kv">
              <span className="k">Submitted</span>
              <span className="v">{dateStr(swap.created_at)}</span>
            </div>
            <div className="kv">
              <span className="k">Updated</span>
              <span className="v">{dateStr(swap.updated_at)}</span>
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}

