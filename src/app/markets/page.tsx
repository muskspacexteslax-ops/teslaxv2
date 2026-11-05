'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Layout } from '../../components/ui'
import { LiveChart } from '../../components/chart'
import { fmtPct, fmtPrice, seriesPath, type Series } from '../../lib/market'
import { useTeslaX } from '../../context/TeslaXContext'

const Spark: React.FC<{ series: Series | null }> = ({ series }) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !series || !series.points.length) {
    return <div className="sprint-skel" style={{ width: 240, height: 60 }} />
  }

  const last = series.points[series.points.length - 1].c
  const first = series.points[0].c
  const up = last >= first
  const { line, area } = seriesPath(series.points, 240, 60, 1)
  return (
    <svg viewBox="0 0 240 60" className="sprint" preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={up ? 'rgba(52,211,153,0.14)' : 'rgba(255,107,112,0.14)'} />
      <path
        d={line}
        fill="none"
        stroke={up ? '#34d399' : '#ff6b70'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MarketsContent() {
  const searchParams = useSearchParams()
  const initialSym = searchParams.get('sym') || 'TSLA'
  const { user, settings, quotes, symbols, charts } = useTeslaX()
  const [activeSymbol, setActiveSymbol] = useState<string>(initialSym)

  const activeQuote = quotes.find((q) => q.symbol === activeSymbol) || quotes[0]
  const activeSeries = charts[activeQuote?.symbol ?? ''] ?? null

  return (
    <Layout title="Markets">
      <div className="wrap" style={{ paddingTop: '118px', paddingBottom: '70px' }}>
        <div className="sec-head" style={{ marginBottom: '26px' }}>
          <div>
            <div className="eyebrow">Markets</div>
            <h2 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.8rem)' }}>Tesla, SpaceX and X</h2>
            <p className="lede" style={{ marginTop: '14px' }}>
              One live price feed and two marked private valuations. Members can allocate wallet balance
              into any of the three — positions settle instantly and appear in your personal portfolio.
            </p>
          </div>
          <Link
            className="btn btn-ghost btn-sm"
            href={user ? '/dashboard/markets' : '/signup'}
          >
            {user ? 'Open trading desk' : 'Create an account'} <span className="arrow">→</span>
          </Link>
        </div>

        {/* --------------------------------------------------- SYMBOL SWITCHER */}
        <div className="chips" style={{ marginBottom: '18px' }}>
          {symbols.map((sym) => {
            const q = quotes.find((x) => x.symbol === sym.symbol)
            return (
              <button
                key={sym.symbol}
                className={`chip mchip ${sym.symbol === activeQuote?.symbol ? 'on' : ''}`}
                onClick={() => setActiveSymbol(sym.symbol)}
                type="button"
              >
                <b>{sym.symbol}</b>
                <span>{fmtPrice(q?.price ?? null)}</span>
                <i className={q?.marked ? 'mk' : (q?.changePct ?? 0) >= 0 ? 'up' : 'dn'}>
                  {q?.marked ? 'mark' : fmtPct(q?.changePct ?? null)}
                </i>
              </button>
            )
          })}
        </div>

        {/* ---------------------------------------------------------- CHART CARD */}
        {activeQuote && (
          <LiveChart quote={activeQuote} series={activeSeries} range="1mo" height={340} />
        )}

        {/* ------------------------------------------------------------- CARDS */}
        <div className="grid g3" style={{ marginTop: '22px' }}>
          {symbols.map((sym) => {
            const q = quotes.find((x) => x.symbol === sym.symbol)
            const series = charts[sym.symbol] || null
            const chgUp = (q?.changePct ?? 0) >= 0
            return (
              <article className="card mcard" key={sym.symbol}>
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="row" style={{ gap: '8px' }}>
                      <b style={{ fontSize: '15px' }}>{sym.symbol}</b>
                      <span className={`badge ${q?.marked ? '' : 'badge-ok'}`}>
                        {q?.marked ? 'MARK' : 'LIVE'}
                      </span>
                    </div>
                    <div className="tiny dim" style={{ marginTop: '2px' }}>
                      {sym.label}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 300 }} className="font-mono">
                      {fmtPrice(q?.price ?? null)}
                    </div>
                    <div
                      className={`tick-chg ${q?.marked ? 'muted' : chgUp ? 'up' : 'down'}`}
                      style={{ justifyContent: 'flex-end' }}
                    >
                      {q?.marked ? 'marked' : fmtPct(q?.changePct ?? null)}
                    </div>
                  </div>
                </div>
                <Spark series={series} />
                <p className="tiny dim" style={{ marginTop: '10px', lineHeight: 1.6 }}>
                  {sym.blurb}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    className="btn btn-quiet btn-sm flex-1"
                    onClick={() => setActiveSymbol(sym.symbol)}
                  >
                    View chart
                  </button>
                  {user && (
                    <Link
                      className="btn btn-primary btn-sm flex-1 text-center"
                      href={`/dashboard/markets?sym=${sym.symbol}`}
                    >
                      Trade
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <div className="alert alert-info" style={{ marginTop: '22px' }}>
          {settings.invest_note ||
            'Prices are informational and are not investment advice. Paper positions are internal to the TeslaX portal and carry no claim on real securities.'}
        </div>
      </div>
    </Layout>
  )
}

export default function MarketsPage() {
  return (
    <Suspense fallback={<Layout title="Markets"><div className="wrap py-28 text-center text-muted">Loading markets...</div></Layout>}>
      <MarketsContent />
    </Suspense>
  )
}

