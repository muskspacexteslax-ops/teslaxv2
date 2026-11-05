'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DashShell } from '../../../components/dashboard'
import { LiveChart } from '../../../components/chart'
import { money } from '../../../lib/db'
import { fmtPct, fmtPrice } from '../../../lib/market'
import { useTeslaX } from '../../../context/TeslaXContext'

function TradingDeskContent() {
  const searchParams = useSearchParams()
  const initialSym = searchParams.get('sym') || 'TSLA'
  const { user, quotes, symbols, charts, portfolio, buyAsset, sellAsset } = useTeslaX()

  const [activeSymbol, setActiveSymbol] = useState(initialSym)
  const [investAmount, setInvestAmount] = useState('250')

  const q = quotes.find((x) => x.symbol === activeSymbol) || quotes[0]
  const series = charts[q?.symbol ?? ''] ?? null
  const pos = portfolio.positions.find((p) => p.symbol === q?.symbol)

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(investAmount)
    if (isNaN(amt) || amt <= 0) return
    buyAsset(q.symbol, amt)
  }

  const handleSellAll = () => {
    if (!pos || pos.shares <= 0.0001) return
    sellAsset(q.symbol, pos.shares)
  }

  return (
    <DashShell
      active="markets"
      title="Markets"
      sub="Live Tesla pricing, marked private valuations, settled from your wallet."
      actions={
        <div className="row" style={{ gap: '8px' }}>
          <span className="badge font-mono" style={{ height: '28px' }}>
            Wallet {money(user?.balance_cents || 0)}
          </span>
          <Link className="btn btn-ghost btn-sm" href="/dashboard/wallet">
            Top up
          </Link>
        </div>
      }
    >
      <div className="chips" style={{ marginBottom: '16px' }}>
        {symbols.map((sym) => {
          const qq = quotes.find((x) => x.symbol === sym.symbol)
          return (
            <button
              key={sym.symbol}
              className={`chip mchip ${sym.symbol === q?.symbol ? 'on' : ''}`}
              onClick={() => setActiveSymbol(sym.symbol)}
              type="button"
            >
              <b>{sym.symbol}</b>
              <span>{fmtPrice(qq?.price ?? null)}</span>
              <i className={qq?.marked ? 'mk' : (qq?.changePct ?? 0) >= 0 ? 'up' : 'dn'}>
                {qq?.marked ? 'mark' : fmtPct(qq?.changePct ?? null)}
              </i>
            </button>
          )
        })}
      </div>

      <div className="trade-grid">
        <div>
          {q && <LiveChart quote={q} series={series} range="1mo" height={320} />}
        </div>

        <aside>
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              {q?.symbol} order ticket
            </div>

            {q?.marked && (
              <div className="alert alert-info" style={{ fontSize: '12px', marginBottom: '12px' }}>
                {q.symbol} is not publicly traded. Orders execute at the current mark of{' '}
                {fmtPrice(q.price)}.
              </div>
            )}

            <div className="kv">
              <span className="k">Last price</span>
              <span className="v font-mono">{fmtPrice(q?.price ?? null)}</span>
            </div>
            <div className="kv">
              <span className="k">You hold</span>
              <span className="v font-mono">
                {pos && pos.shares > 0.0001 ? `${pos.shares.toFixed(4)} sh · ${money(pos.value_cents)}` : '—'}
              </span>
            </div>
            <div className="kv">
              <span className="k">Wallet available</span>
              <span className="v font-mono">{money(user?.balance_cents || 0)}</span>
            </div>

            <form onSubmit={handleBuy} style={{ marginTop: '16px' }}>
              <label className="field">
                <span className="label">Amount to invest (USD)</span>
                <input
                  className="input font-mono"
                  type="number"
                  min="10"
                  step="1"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="250"
                  required
                />
              </label>
              <div className="chips" style={{ marginBottom: '12px' }}>
                {[100, 250, 500, 1000].map((v) => (
                  <button
                    key={v}
                    className="chip qa"
                    type="button"
                    onClick={() => setInvestAmount(v.toString())}
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-block" type="submit">
                Buy {q?.symbol}
              </button>
            </form>

            {pos && pos.shares > 0.0001 && (
              <button
                className="btn btn-ghost btn-block"
                type="button"
                onClick={handleSellAll}
                style={{ marginTop: '8px' }}
              >
                Sell all {pos.shares.toFixed(4)} sh
              </button>
            )}

            <p className="tiny dim" style={{ marginTop: '12px', lineHeight: 1.6 }}>
              Paper positions only. Positions settle internally from your TeslaX wallet and carry no claim on real securities.
            </p>
          </div>
        </aside>
      </div>

      <div className="grid g3" style={{ marginTop: '22px' }}>
        {symbols.map((sym) => {
          const qq = quotes.find((x) => x.symbol === sym.symbol)
          const isUp = (qq?.changePct ?? 0) >= 0
          return (
            <article className="card mcard" key={sym.symbol}>
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="row" style={{ gap: '8px' }}>
                    <b style={{ fontSize: '15px' }}>{sym.symbol}</b>
                    <span className={`badge ${qq?.marked ? '' : 'badge-ok'}`}>
                      {qq?.marked ? 'MARK' : 'LIVE'}
                    </span>
                  </div>
                  <div className="tiny dim" style={{ marginTop: '2px' }}>
                    {sym.label}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 300 }} className="font-mono">
                    {fmtPrice(qq?.price ?? null)}
                  </div>
                  <div
                    className={`tick-chg ${qq?.marked ? 'muted' : isUp ? 'up' : 'down'}`}
                    style={{ justifyContent: 'flex-end' }}
                  >
                    {qq?.marked ? 'marked' : fmtPct(qq?.changePct ?? null)}
                  </div>
                </div>
              </div>
              <p className="tiny dim" style={{ marginTop: '10px', lineHeight: 1.6 }}>
                {sym.blurb}
              </p>
              <button
                className="btn btn-quiet btn-sm btn-block mt-3"
                onClick={() => setActiveSymbol(sym.symbol)}
              >
                Trade {sym.symbol}
              </button>
            </article>
          )
        })}
      </div>
    </DashShell>
  )
}

export default function TradingDeskPage() {
  return (
    <Suspense fallback={<DashShell active="markets" title="Markets"><div>Loading trading desk...</div></DashShell>}>
      <TradingDeskContent />
    </Suspense>
  )
}

