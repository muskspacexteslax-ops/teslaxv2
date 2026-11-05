'use client'

import React from 'react'
import Link from 'next/link'
import { DashShell } from '../../../components/dashboard'
import { money, moneyExact, dateTimeStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function PortfolioPage() {
  const { user, portfolio, tradeHistory } = useTeslaX()
  const userTrades = user ? tradeHistory.filter((t: any) => t.email && t.email.toLowerCase() === user.email.toLowerCase()) : []

  return (
    <DashShell
      active="portfolio"
      title="Portfolio"
      sub="Every position you hold across Tesla, SpaceX and X."
      actions={
        <Link className="btn btn-primary btn-sm" href="/dashboard/markets">
          Trade <span className="arrow">→</span>
        </Link>
      }
    >
      <div className="dash-top">
        <div className="balance">
          <div className="eyebrow no-rule">
            <span className="dot" style={{ background: '#34d399', color: '#34d399' }} /> Portfolio value
          </div>
          <div className="amt font-mono">{money(portfolio.value)}</div>
          <div className="hint font-mono">
            {portfolio.pl >= 0 ? '▲' : '▼'} {money(Math.abs(portfolio.pl))} ({portfolio.pl_pct.toFixed(2)}%)
            on {money(portfolio.cost)} invested
          </div>
          <div className="row" style={{ marginTop: '18px', gap: '8px' }}>
            <Link className="btn btn-primary btn-sm" href="/dashboard/markets">
              Buy more
            </Link>
            <Link className="btn btn-ghost btn-sm" href="/dashboard/wallet">
              Add funds
            </Link>
          </div>
        </div>

        <div className="stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="stat">
            <div className="k">Cost basis</div>
            <div className="v font-mono">{money(portfolio.cost)}</div>
            <div className="m">across {portfolio.positions.length} positions</div>
          </div>
          <div className="stat">
            <div className="k">Unrealised P/L</div>
            <div className="v font-mono" style={{ color: portfolio.pl >= 0 ? '#6ee7b7' : '#ff9a9e' }}>
              {portfolio.pl >= 0 ? '+' : ''}
              {money(portfolio.pl)}
            </div>
            <div className="m font-mono">{portfolio.pl_pct.toFixed(2)}%</div>
          </div>
          <div className="stat">
            <div className="k">Wallet</div>
            <div className="v font-mono">{money(user?.balance_cents || 0)}</div>
            <div className="m">available to allocate</div>
          </div>
          <div className="stat">
            <div className="k">Trades</div>
            <div className="v font-mono">{userTrades.length}</div>
            <div className="m">all time</div>
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Positions</h3>
      </div>

      {portfolio.positions.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No positions yet</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            Allocate wallet balance into TSLA, SpaceX or X and it will appear here.
          </p>
          <Link className="btn btn-primary btn-sm" href="/dashboard/markets" style={{ marginTop: '16px' }}>
            Open markets
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Company</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Value</th>
                <th>Cost</th>
                <th>P/L</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {portfolio.positions.map((p) => (
                <tr key={p.symbol}>
                  <td>
                    <div className="row" style={{ gap: '8px' }}>
                      <b>{p.symbol}</b>
                      <span
                        className={`badge ${p.kind === 'private' ? '' : 'badge-ok'}`}
                        style={{ height: '18px', fontSize: '9px' }}
                      >
                        {p.kind === 'private' ? 'MARK' : 'LIVE'}
                      </span>
                    </div>
                    <div className="tiny dim">{p.label}</div>
                  </td>
                  <td className="num font-mono">{p.shares.toFixed(4)}</td>
                  <td className="num font-mono">{moneyExact(p.price_cents)}</td>
                  <td className="num font-mono font-semibold">{money(p.value_cents)}</td>
                  <td className="num dim font-mono">{money(p.cost_cents)}</td>
                  <td
                    className="num font-mono"
                    style={{ color: p.pl_cents >= 0 ? '#6ee7b7' : '#ff9a9e' }}
                  >
                    {p.pl_cents >= 0 ? '+' : ''}
                    {money(p.pl_cents)}
                    <span className="tiny dim"> ({p.pl_pct.toFixed(1)}%)</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link className="btn btn-quiet btn-xs" href={`/dashboard/markets?sym=${p.symbol}`}>
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Trade history</h3>
      </div>

      {userTrades.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No trades yet</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            Your executions will be listed here.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Side</th>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {userTrades.map((t) => (
                <tr key={t.id}>
                  <td className="dim">{dateTimeStr(t.created_at)}</td>
                  <td>
                    <span className={`badge ${t.side === 'buy' ? 'badge-ok' : 'badge-warn'}`}>
                      {t.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="font-bold">{t.symbol}</td>
                  <td className="num font-mono">{t.shares.toFixed(4)}</td>
                  <td className="num font-mono">{moneyExact(t.price_cents)}</td>
                  <td className="num font-mono font-semibold">{money(t.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashShell>
  )
}

