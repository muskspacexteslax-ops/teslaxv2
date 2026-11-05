// @ts-nocheck
import type { FC } from 'hono/jsx'
import type { User } from '../lib/db'
import { Layout } from '../components/ui'
import { LiveChart } from '../components/chart'
import type { Quote, Series, SymbolRow } from '../lib/market'
import { fmtPct, fmtPrice, seriesPath } from '../lib/market'

/* ------------------------------------------------------------------ */
/*  Public markets page                                               */
/*                                                                    */
/*  The hero chart is a LiveChart island: the first series is          */
/*  server-rendered so the page is never blank, then static/app.js     */
/*  swaps ranges in place against /api/market/series.                  */
/* ------------------------------------------------------------------ */

const Spark: FC<{ series: Series | null }> = ({ series }) => {
  if (!series || !series.points.length) return <div class="sprint-skel" />
  const last = series.points[series.points.length - 1].c
  const first = series.points[0].c
  const up = last >= first
  const { line, area } = seriesPath(series.points, 240, 60, 1)
  return (
    <svg viewBox="0 0 240 60" class="sprint" preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={up ? 'rgba(52,211,153,0.14)' : 'rgba(255,107,112,0.14)'} />
      <path
        d={line}
        fill="none"
        stroke={up ? '#34d399' : '#ff6b70'}
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  )
}

export const MarketsPage: FC<{
  user: User | null
  s: Record<string, string>
  quotes: Quote[]
  symbols: SymbolRow[]
  charts: Record<string, Series | null>
  active: string
}> = ({ user, s, quotes, symbols, charts, active }) => {
  const activeQuote = quotes.find((q) => q.symbol === active) ?? quotes[0]
  const activeSeries = charts[activeQuote?.symbol ?? ''] ?? null

  return (
    <Layout user={user} s={s} title="Markets">
      <div class="wrap" style="padding-top:118px;padding-bottom:70px">
        <div class="sec-head" style="margin-bottom:26px">
          <div>
            <div class="eyebrow">Markets</div>
            <h2 style="font-size:clamp(1.9rem,3.6vw,2.8rem)">Tesla, SpaceX and X</h2>
            <p class="lede" style="margin-top:14px">
              One live price feed and two marked private valuations. Members can allocate wallet balance
              into any of the three — positions settle instantly and appear in the portfolio.
            </p>
          </div>
          <a class="btn btn-ghost btn-sm" href={user ? '/dashboard/markets' : '/signup'}>
            {user ? 'Open trading desk' : 'Create an account'} <span class="arrow">→</span>
          </a>
        </div>

        {/* --------------------------------------------------- symbol switcher */}
        <div class="chips" style="margin-bottom:18px">
          {symbols.map((sym) => {
            const q = quotes.find((x) => x.symbol === sym.symbol)
            return (
              <a class={`chip mchip ${sym.symbol === activeQuote?.symbol ? 'on' : ''}`} href={`/markets?sym=${sym.symbol}`}>
                <b>{sym.symbol}</b>
                <span>{fmtPrice(q?.price ?? null)}</span>
                <i class={q?.marked ? 'mk' : (q?.changePct ?? 0) >= 0 ? 'up' : 'dn'}>
                  {q?.marked ? 'mark' : fmtPct(q?.changePct ?? null)}
                </i>
              </a>
            )
          })}
        </div>

        {/* ---------------------------------------------------------- chart card */}
        {activeQuote && <LiveChart quote={activeQuote} series={activeSeries} range="1mo" height={320} />}

        {/* ------------------------------------------------------------- cards */}
        <div class="grid g3" style="margin-top:22px">
          {symbols.map((sym) => {
            const q = quotes.find((x) => x.symbol === sym.symbol)
            const series = charts[sym.symbol]
            const chgUp = (q?.changePct ?? 0) >= 0
            return (
              <article class="card mcard">
                <div class="row-between" style="align-items:flex-start">
                  <div>
                    <div class="row" style="gap:8px">
                      <b style="font-size:15px">{sym.symbol}</b>
                      <span class={`badge ${q?.marked ? '' : 'badge-ok'}`}>
                        {q?.marked ? 'MARK' : 'LIVE'}
                      </span>
                    </div>
                    <div class="tiny dim" style="margin-top:2px">
                      {sym.label}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1.15rem;font-weight:300">{fmtPrice(q?.price ?? null)}</div>
                    <div class={`tick-chg ${q?.marked ? 'muted' : chgUp ? 'up' : 'down'}`} style="justify-content:flex-end">
                      {q?.marked ? 'marked' : fmtPct(q?.changePct ?? null)}
                    </div>
                  </div>
                </div>
                <Spark series={series} />
                <p class="tiny dim" style="margin-top:10px;line-height:1.6">
                  {sym.blurb}
                </p>
                <a class="btn btn-quiet btn-sm btn-block" href={`/markets?sym=${sym.symbol}`}>
                  Open chart
                </a>
              </article>
            )
          })}
        </div>

        <div class="alert alert-info" style="margin-top:22px">
          {s.invest_note ||
            'Prices are informational and are not investment advice. Paper positions are internal to the TeslaX portal and carry no claim on real securities.'}
        </div>
      </div>
    </Layout>
  )
}
