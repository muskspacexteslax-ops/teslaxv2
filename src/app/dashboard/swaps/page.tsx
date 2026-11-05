'use client'

import React from 'react'
import Link from 'next/link'
import { DashShell, SwapPill } from '../../../components/dashboard'
import { CarVisual } from '../../../components/CarVisual'
import { money, dateStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function SwapsListPage() {
  const { user, swaps, models } = useTeslaX()
  const mySwaps = user
    ? (user.role === 'admin'
        ? swaps
        : swaps.filter((sw) => sw.email && sw.email.toLowerCase() === user.email.toLowerCase()))
    : []

  return (
    <DashShell
      active="swaps"
      title="My swaps"
      sub="Every valuation, offer and collection in one timeline."
      counts={{ swaps: mySwaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length }}
      actions={
        <Link className="btn btn-primary btn-sm" href="/swap">
          New valuation <span className="arrow">→</span>
        </Link>
      }
    >
      {mySwaps.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing to track yet</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            Value your current car and choose a Tesla — your swap timeline appears here.
          </p>
          <Link className="btn btn-primary btn-sm" href="/swap" style={{ marginTop: '16px' }}>
            Value my car
          </Link>
        </div>
      ) : (
        <div className="stack">
          {mySwaps.map((sw) => {
            const target = models.find((m) => m.slug === sw.target_slug)
            return (
              <Link className="order-row" href={`/dashboard/swaps/${sw.ref}`} key={sw.ref}>
                <div className="order-thumb">
                  {target ? (
                    <CarVisual body={target.body} color={target.color} photo={target.photo} name={target.name} fit="contain" />
                  ) : (
                    <span className="tiny dim">No target</span>
                  )}
                </div>
                <div className="order-main">
                  <div className="row-between" style={{ gap: '10px', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 500 }}>
                        {sw.year} {sw.make} {sw.model}
                      </div>
                      <div className="tiny dim font-mono" style={{ marginTop: '3px' }}>
                        {sw.ref} · into {sw.target_name || 'undecided'} · {dateStr(sw.created_at)}
                      </div>
                    </div>
                    <SwapPill status={sw.status} />
                  </div>
                  <div className="row-between" style={{ marginTop: '14px', gap: '12px' }}>
                    <div>
                      <div className="price-lbl">Credit</div>
                      <div className="mono font-mono" style={{ fontSize: '13.5px' }}>
                        {money(sw.offer_cents || sw.estimate_mid)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price-lbl">Gap</div>
                      <div className="mono font-mono" style={{ fontSize: '13.5px', color: '#cfd3d8' }}>
                        {sw.gap_cents === 0 ? '—' : money(sw.gap_cents)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </DashShell>
  )
}

