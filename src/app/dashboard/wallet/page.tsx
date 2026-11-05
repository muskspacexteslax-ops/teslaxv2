'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashShell } from '../../../components/dashboard'
import { Alert } from '../../../components/ui'
import { money, dateTimeStr } from '../../../lib/db'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function WalletPage() {
  const { user, ledger, payments, topUpWallet, portfolio, settings } = useTeslaX()
  const [amount, setAmount] = useState('500')
  const [method, setMethod] = useState<'card' | 'transfer' | 'crypto'>('card')
  const [cryptoCoin, setCryptoCoin] = useState<'btc' | 'eth' | 'usdt'>('btc')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const myPayments = user
    ? payments.filter(
        (p: any) => p.email && p.email.toLowerCase() === user.email.toLowerCase()
      )
    : []
  const myLedger = user
    ? ledger.filter(
        (l: any) => l.email && l.email.toLowerCase() === user.email.toLowerCase()
      )
    : []
  const pendingPayments = myPayments.filter((p) => p.status === 'pending')

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return

    let methodName = 'Card (Instant simulated credit)'
    if (method === 'transfer') {
      methodName = `Bank wire (${settings?.bank_name || 'JPMorgan'})`
    } else if (method === 'crypto') {
      methodName = `Crypto (${cryptoCoin.toUpperCase()})`
    }

    topUpWallet(Math.round(val * 100), methodName)

    if (method === 'card') {
      setNotice(`$${val.toFixed(2)} added instantly to your wallet balance!`)
    } else {
      setNotice(`${methodName} deposit request for $${val.toFixed(2)} submitted for admin review and credit.`)
    }
  }

  return (
    <DashShell
      active="wallet"
      title="Wallet"
      sub="One balance for swap gaps and market allocation."
      actions={
        <Link className="btn btn-ghost btn-sm" href="/dashboard/portfolio">
          Portfolio
        </Link>
      }
    >
      {notice && (
        <Alert kind="ok" className="mb-4">
          {notice}
        </Alert>
      )}

      <div className="dash-top">
        <div className="balance">
          <div className="eyebrow no-rule flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="dot animate-pulse" style={{ background: '#34d399' }} /> Total Balance &amp; Equity
            </span>
            <span className="badge badge-accent">Live Ticker</span>
          </div>
          <div className="amt font-mono text-3xl font-light text-white mt-1">
            {money((user?.balance_cents || 0) + portfolio.value)}
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-muted border-t border-white/10 pt-3">
            <div className="flex justify-between">
              <span>Available Cash:</span>
              <span className="font-mono text-white font-medium">{money(user?.balance_cents || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Invested in Stocks:</span>
              <span className="font-mono text-white font-medium">{money(portfolio.value)}</span>
            </div>
            {portfolio.positions.length > 0 && (
              <div className="flex justify-between">
                <span>Unrealized P&amp;L:</span>
                <span className={`font-mono font-medium ${portfolio.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {portfolio.pl >= 0 ? '+' : ''}{money(portfolio.pl)} ({portfolio.pl_pct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div className="hint mt-3">
            Confirmed top-ups credit cash directly. Stock allocations fluctuate dynamically with market prices.
          </div>
        </div>

        <div className="card">
          <div className="eyebrow no-rule" style={{ marginBottom: '14px' }}>
            Top up wallet
          </div>
          <form onSubmit={handleTopup}>
            <label className="field">
              <span className="label">Amount (USD)</span>
              <input
                className="input font-mono"
                type="number"
                min="10"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500"
                required
              />
            </label>
            <div className="chips" style={{ marginBottom: '14px' }}>
              {[100, 250, 500, 1000, 2500].map((v) => (
                <button
                  key={v}
                  className="chip qa"
                  type="button"
                  onClick={() => setAmount(v.toString())}
                >
                  ${v}
                </button>
              ))}
            </div>

            <label className="field">
              <span className="label">Deposit Method</span>
              <div className="grid grid-cols-3 gap-2 mt-1 mb-3">
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  className={`py-2 px-2 text-xs rounded border transition-all text-center ${
                    method === 'card'
                      ? 'border-white bg-white/10 text-white font-medium'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Card (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('transfer')}
                  className={`py-2 px-2 text-xs rounded border transition-all text-center ${
                    method === 'transfer'
                      ? 'border-white bg-white/10 text-white font-medium'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Bank Wire
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('crypto')}
                  className={`py-2 px-2 text-xs rounded border transition-all text-center ${
                    method === 'crypto'
                      ? 'border-white bg-white/10 text-white font-medium'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Crypto
                </button>
              </div>
            </label>

            {/* Bank Wire Details Panel */}
            {method === 'transfer' && (
              <div className="p-3.5 mb-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-2 font-mono">
                <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-muted mb-2">
                  Wire Transfer Destination
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Beneficiary:</span>
                  <span className="text-white font-medium">{settings?.bank_account_name || 'TeslaX Liquidity Desk'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Bank:</span>
                  <span className="text-white">{settings?.bank_name || 'JPMorgan Chase Bank, N.A.'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account:</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white">{settings?.bank_account_number || '883902194821'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.bank_account_number || '883902194821', 'acc')}
                      className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-1 py-0.5 rounded bg-white/10"
                    >
                      {copiedKey === 'acc' ? 'Copied' : 'Copy'}
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Routing / ABA:</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white">{settings?.bank_routing || '021000021'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.bank_routing || '021000021', 'route')}
                      className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-1 py-0.5 rounded bg-white/10"
                    >
                      {copiedKey === 'route' ? 'Copied' : 'Copy'}
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">SWIFT / BIC:</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white">{settings?.bank_swift || 'CHASUS33'}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings?.bank_swift || 'CHASUS33', 'swift')}
                      className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-1 py-0.5 rounded bg-white/10"
                    >
                      {copiedKey === 'swift' ? 'Copied' : 'Copy'}
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* Crypto Wallet Details Panel */}
            {method === 'crypto' && (
              <div className="p-3.5 mb-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-2">
                <div className="flex gap-2 mb-2">
                  {(['btc', 'eth', 'usdt'] as const).map((coin) => (
                    <button
                      key={coin}
                      type="button"
                      onClick={() => setCryptoCoin(coin)}
                      className={`px-2.5 py-1 text-[11px] rounded uppercase font-mono font-medium transition-colors ${
                        cryptoCoin === coin
                          ? 'bg-red-600 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {coin}
                    </button>
                  ))}
                </div>
                <div className="text-muted text-[11px]">
                  {cryptoCoin === 'btc' && 'Send Bitcoin on the native Bitcoin network.'}
                  {cryptoCoin === 'eth' && 'Send Ether on Ethereum mainnet (ERC-20).'}
                  {cryptoCoin === 'usdt' && 'Send USDT on Ethereum (ERC-20) or Tron (TRC-20).'}
                </div>
                <div className="pt-1">
                  <div className="text-[11px] text-gray-400 mb-1">Deposit Address:</div>
                  <div className="flex items-center justify-between gap-2 p-2 bg-black/60 rounded border border-white/10 font-mono text-[11px] break-all">
                    <span className="text-white">
                      {cryptoCoin === 'btc'
                        ? settings?.btc_address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
                        : cryptoCoin === 'eth'
                        ? settings?.eth_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7'
                        : settings?.usdt_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          cryptoCoin === 'btc'
                            ? settings?.btc_address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
                            : cryptoCoin === 'eth'
                            ? settings?.eth_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7'
                            : settings?.usdt_address || '0x71C83709b11caC94C10a26639d67bFff4D43F9B7',
                          'crypto'
                        )
                      }
                      className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10 shrink-0"
                    >
                      {copiedKey === 'crypto' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-block" type="submit">
              {method === 'card'
                ? 'Credit wallet instantly'
                : 'Submit deposit confirmation'}
            </button>
            <p className="tiny dim" style={{ marginTop: '10px', lineHeight: 1.6 }}>
              {method === 'card'
                ? 'Simulated card funding credits available cash balance in real time.'
                : 'Transfers and crypto confirmations are audited and credited from the Control Room.'}
            </p>
          </form>
        </div>
      </div>

      {pendingPayments.length > 0 && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
            Awaiting confirmation
          </div>
          {pendingPayments.map((p) => (
            <div className="kv" key={p.id}>
              <span className="k mono font-mono">{p.reference}</span>
              <span className="v font-mono">
                {money(p.amount_cents)} · {p.method}{' '}
                <span className="badge badge-warn ml-2">pending</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="row-between" style={{ marginTop: '34px', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '1.12rem' }}>Ledger</h3>
        <span className="tiny dim">{myLedger.length} entries</span>
      </div>

      {myLedger.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Nothing moved yet</p>
          <p className="dim" style={{ fontSize: '13.5px' }}>
            Top-ups, swap settlements and trades all show here.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Reason</th>
                <th>Amount</th>
                <th>Balance impact</th>
              </tr>
            </thead>
            <tbody>
              {myLedger.map((t) => (
                <tr key={t.id}>
                  <td className="dim">{dateTimeStr(t.created_at)}</td>
                  <td>{t.reason}</td>
                  <td
                    className="num font-mono"
                    style={{ color: t.delta_cents >= 0 ? '#6ee7b7' : '#ff9a9e' }}
                  >
                    {t.delta_cents >= 0 ? '+' : ''}
                    {money(t.delta_cents)}
                  </td>
                  <td className="num dim font-mono uppercase text-xs">
                    {t.delta_cents >= 0 ? 'credit' : 'debit'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashShell>
  )
}
