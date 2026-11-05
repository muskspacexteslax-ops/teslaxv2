'use client'

import React from 'react'
import Link from 'next/link'
import { DashShell, SwapPill, Ico } from '../../components/dashboard'
import { CarVisual } from '../../components/CarVisual'
import { money, dateStr, timeAgo, SWAP_STATUS, SWAP_FLOW } from '../../lib/db'
import { fmtPct, fmtPrice } from '../../lib/market'
import { useTeslaX } from '../../context/TeslaXContext'

export default function DashboardOverviewPage() {
  const { user, models, swaps, announcements, portfolio, quotes } = useTeslaX()

  if (!user) {
    return <DashShell active="home" title="Dashboard"><div>Please sign in.</div></DashShell>
  }

  const firstName = (user.full_name || 'there').split(' ')[0]
  const mySwaps = user.role === 'admin'
    ? swaps
    : swaps.filter((sw) => sw.email && sw.email.toLowerCase() === user.email.toLowerCase())
  const activeSwap = mySwaps.find((x) => x.status !== 'completed' && x.status !== 'declined')
  const latest = mySwaps[0]
  const showcase = models.filter((m) => ['model-y', 'model-3', 'cybertruck', 'roadster-2'].includes(m.slug))
  const profileIncomplete = !user.address_line1 || !user.city || !user.phone

  return (
    <DashShell
      active="home"
      title={`Welcome back, ${firstName}`}
      sub="Your swap, your balance and your portfolio — in one place."
      counts={{ swaps: mySwaps.filter((x) => x.status !== 'completed' && x.status !== 'declined').length }}
      actions={
        <Link className="btn btn-primary btn-sm" href="/swap">
          Value another car <span className="arrow">→</span>
        </Link>
      }
    >
      {announcements.length > 0 && announcements[0].active === 1 && (
        <div className="card" style={{ marginBottom: '14px', borderColor: 'rgba(255,255,255,0.16)' }}>
          <div className="row-between" style={{ gap: '16px', alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow no-rule" style={{ marginBottom: '8px' }}>
                <span className="dot" style={{ background: 'var(--accent)', color: 'var(--accent)' }} /> Announcement
              </div>
              <h4 className="font-semibold text-white">{announcements[0].title}</h4>
              <p className="dim" style={{ fontSize: '13px', marginTop: '6px', maxWidth: '70ch' }}>
                {announcements[0].body}
              </p>
            </div>
            <span className="tiny dim nowrap">{timeAgo(announcements[0].created_at)}</span>
          </div>
        </div>
      )}

      <div className="dash-top">
        <div className="balance">
          <div className="eyebrow no-rule flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="dot animate-pulse" style={{ background: portfolio.pl >= 0 ? '#34d399' : '#ff6b70' }} />
              Total Account Net Worth
            </span>
            <span className="badge badge-accent">Live Feed</span>
          </div>
          <div className="amt font-mono text-3xl font-light tracking-tight text-white mt-1">
            {money(user.balance_cents + portfolio.value)}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted">
            <div>
              Cash: <span className="text-white font-mono">{money(user.balance_cents)}</span>
            </div>
            <div>·</div>
            <div>
              Invested: <span className="text-white font-mono">{money(portfolio.value)}</span>
              {portfolio.positions.length > 0 && (
                <span className={`ml-1.5 font-medium ${portfolio.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {portfolio.pl >= 0 ? '▲ +' : '▼ '}{money(portfolio.pl)} ({portfolio.pl_pct.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
          <div className="hint" style={{ marginTop: '12px' }}>
            Balance updates dynamically with live stock charts and private marks.
          </div>
          <div className="row" style={{ marginTop: '18px', gap: '8px' }}>
            <Link className="btn btn-primary btn-sm" href="/dashboard/wallet">
              Top up cash
            </Link>
            <Link className="btn btn-ghost btn-sm" href="/dashboard/markets">
              Trade markets →
            </Link>
          </div>
        </div>

        <div className="stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat">
            <div className="k">Portfolio value</div>
            <div className="v font-mono">{money(portfolio.value)}</div>
            <div className="m" style={{ color: portfolio.pl >= 0 ? '#6ee7b7' : '#ff9a9e' }}>
              {portfolio.pl >= 0 ? '+' : ''}
              {money(portfolio.pl)} ({portfolio.pl_pct.toFixed(2)}%)
            </div>
          </div>
          <div className="stat">
            <div className="k">Swap status</div>
            <div className="v" style={{ fontSize: '1.05rem', marginTop: '12px' }}>
              {activeSwap ? <SwapPill status={activeSwap.status} /> : <span className="badge">Not started</span>}
            </div>
            <div className="m font-mono">{activeSwap ? activeSwap.ref : 'No open swap'}</div>
          </div>
          <div className="stat">
            <div className="k">Total swaps</div>
            <div className="v">{mySwaps.length}</div>
            <div className="m">{mySwaps.filter((x) => x.status === 'completed').length} completed</div>
          </div>
          <div className="stat">
            <div className="k">Positions</div>
            <div className="v">{portfolio.positions.length}</div>
            <div className="m">across tracked companies</div>
          </div>
        </div>
      </div>

      <div className="grid g4" style={{ marginTop: '16px' }}>
        {[
          { href: '/dashboard/markets', t: 'Markets', d: 'TSLA live · SPCX · X', i: 'chart' },
          { href: '/dashboard/showroom', t: 'Showroom', d: 'Select your next Tesla', i: 'car' },
          { href: '/dashboard/portfolio', t: 'Portfolio', d: 'Positions & P/L', i: 'pie' },
          { href: '/dashboard/wallet', t: 'Wallet', d: 'Funding & ledger', i: 'wallet' },
        ].map((q) => (
          <Link className="quick" href={q.href} key={q.href}>
            <Ico n={q.i} class="q-ico" />
            <div>
              <div className="q-t">{q.t}</div>
              <div className="q-d">{q.d}</div>
            </div>
          </Link>
        ))}
      </div>

      {profileIncomplete && (
        <div className="card prompt-card" style={{ marginTop: '16px' }}>
          <div className="row-between" style={{ gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow no-rule" style={{ marginBottom: '8px' }}>
                <span className="dot" style={{ background: 'var(--warn)', color: 'var(--warn)' }} /> Action required
              </div>
              <h4 style={{ fontSize: '1rem' }} className="font-semibold text-white">Complete your delivery details</h4>
              <p className="dim" style={{ fontSize: '13px', marginTop: '6px', maxWidth: '64ch' }}>
                A delivery address is required before we can schedule collection of your vehicle and
                shipping of your Tesla.
              </p>
            </div>
            <Link className="btn btn-primary btn-sm nowrap" href="/dashboard/profile">
              Complete profile <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* ----------------------------------------------- Market watch */}
      {quotes.length > 0 && (
        <>
          <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.12rem' }}>Market watch</h3>
              <p className="tiny dim" style={{ marginTop: '4px' }}>
                Live and marked valuations across your tracked companies.
              </p>
            </div>
            <Link className="tiny dim hover:text-white" href="/dashboard/markets">
              Trading desk →
            </Link>
          </div>

          <div className="watch-grid">
            {quotes.map((q) => {
              const pos = portfolio.positions.find((p) => p.symbol === q.symbol)
              const up = (q.changePct ?? 0) >= 0
              return (
                <Link className="watch" href={`/dashboard/markets?sym=${q.symbol}`} key={q.symbol}>
                  <div className="row-between" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <div className="row" style={{ gap: '7px' }}>
                        <b className="watch-sym">{q.symbol}</b>
                        <span className={`badge ${q.marked ? '' : 'badge-ok'} watch-tag`}>
                          {q.marked ? 'MARK' : 'LIVE'}
                        </span>
                      </div>
                      <div className="tiny dim" style={{ marginTop: '2px' }}>
                        {q.label}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="watch-price font-mono">{fmtPrice(q.price, q.currency)}</div>
                      <div className={`tick-chg ${q.marked ? 'muted' : up ? 'up' : 'down'}`} style={{ justifyContent: 'flex-end' }}>
                        {q.marked ? 'private mark' : fmtPct(q.changePct)}
                      </div>
                    </div>
                  </div>
                  <div className="watch-foot">
                    <span className="tiny dim">Holding</span>
                    <span className="tiny" style={{ color: pos ? '#fff' : 'var(--muted-2)' }}>
                      {pos ? `${pos.shares.toFixed(4)} sh · ${money(pos.value_cents)}` : 'No position'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* -------------------------------------------------- Swap tracker */}
      <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Your swap</h3>
        <Link className="tiny dim hover:text-white" href="/dashboard/swaps">
          All swaps →
        </Link>
      </div>

      {latest ? (
        <Link className="card swap-summary block" href={`/dashboard/swaps/${latest.ref}`}>
          <div className="row-between" style={{ gap: '18px', alignItems: 'flex-start' }}>
            <div>
              <div className="row" style={{ gap: '10px' }}>
                <SwapPill status={latest.status} />
                <span className="tiny dim mono font-mono">{latest.ref}</span>
              </div>
              <h4 style={{ marginTop: '12px', fontSize: '1.05rem' }}>
                {latest.year} {latest.make} {latest.model}
                <span className="dim" style={{ fontWeight: 400 }}>
                  {' '}
                  → {latest.target_name || 'model to confirm'}
                </span>
              </h4>
              <div className="tiny dim" style={{ marginTop: '6px' }}>
                Submitted {dateStr(latest.created_at)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="price-lbl">Estimated credit</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 300, letterSpacing: '-0.03em' }} className="font-mono">
                {money(latest.offer_cents || latest.estimate_mid)}
              </div>
            </div>
          </div>
          <div className="track">
            {SWAP_FLOW.map((st, i) => {
              const idx = SWAP_FLOW.indexOf(latest.status)
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
        </Link>
      ) : (
        <div className="empty">
          <p className="empty-title">No swap yet</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            Value the car you drive today and pick the Tesla you want. It takes two minutes.
          </p>
          <Link className="btn btn-primary btn-sm" href="/swap" style={{ marginTop: '14px' }}>
            Value my car
          </Link>
        </div>
      )}

      {/* ------------------------------------------------------- Picked for you */}
      <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Picked for you</h3>
        <Link className="tiny dim hover:text-white" href="/dashboard/showroom">
          Showroom →
        </Link>
      </div>
      <div className="grid g4">
        {showcase.map((m) => (
          <Link className="model-card" href={`/dashboard/showroom/${m.slug}`} key={m.slug}>
            <div className="model-visual">
              <CarVisual body={m.body} color={m.color} photo={m.photo} name={m.name} />
            </div>
            <div className="model-body" style={{ padding: '14px 16px 16px' }}>
              <div className="model-name" style={{ fontSize: '0.96rem' }}>
                {m.name}
              </div>
              <div className="model-tag" style={{ minHeight: 0 }}>
                {m.tagline}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashShell>
  )
}

