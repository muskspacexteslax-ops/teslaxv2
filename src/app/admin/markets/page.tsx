'use client'

import React, { useState, useEffect } from 'react'
import { AdminShell } from '../../../components/AdminShell'
import { money } from '../../../lib/db'
import { fmtPrice } from '../../../lib/market'
import { useTeslaX } from '../../../context/TeslaXContext'

export default function AdminMarketsPage() {
  const { symbols, quotes, models, updateMarkPrice, updateModelValue } = useTeslaX()

  const [markPrices, setMarkPrices] = useState<Record<string, string>>({})
  const [modelValues, setModelValues] = useState<Record<string, string>>({})
  const [savedModel, setSavedModel] = useState<string | null>(null)
  const [savedMark, setSavedMark] = useState<string | null>(null)

  // Sync modelValues when models load or change
  useEffect(() => {
    if (models && models.length > 0) {
      const init: Record<string, string> = {}
      models.forEach((m) => {
        init[m.slug] = (m.swap_value / 100).toString()
      })
      setModelValues(init)
    }
  }, [models])

  // Sync markPrices when quotes load or change
  useEffect(() => {
    if (quotes && quotes.length > 0) {
      const init: Record<string, string> = {}
      quotes.forEach((q) => {
        if (q.marked || q.symbol === 'SPCX' || q.symbol === 'X') {
          init[q.symbol] = q.price.toFixed(2)
        }
      })
      setMarkPrices(init)
    }
  }, [quotes])

  const handleSetMark = (symbol: string, e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(markPrices[symbol])
    if (isNaN(val) || val <= 0) return
    updateMarkPrice(symbol, val)
    setSavedMark(symbol)
    setTimeout(() => setSavedMark(null), 2500)
  }

  const handleSaveModel = (slug: string, e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(modelValues[slug])
    if (isNaN(val) || val <= 0) return
    updateModelValue(slug, Math.round(val * 100))
    setSavedModel(slug)
    setTimeout(() => setSavedModel(null), 2500)
  }

  return (
    <AdminShell
      active="markets"
      title="Markets &amp; Pricing"
      sub="Update private marks and internal sizing value per Tesla model. All changes persist permanently in MongoDB."
    >
      <div className="admin-grid">
        <div>
          {/* Tracked Companies & Valuation Marks */}
          <div className="card">
            <div className="flex items-center justify-between mb-3.5">
              <div className="eyebrow no-rule mb-0">Tracked companies</div>
              <span className="badge badge-accent">Auto-Persisting</span>
            </div>
            <div className="table-wrap" style={{ border: 0 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Kind</th>
                    <th>Current Mark</th>
                    <th style={{ textAlign: 'right' }}>Update Valuation Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {symbols.map((sym) => {
                    const q = quotes.find((x) => x.symbol === sym.symbol)
                    const isSaved = savedMark === sym.symbol
                    return (
                      <tr key={sym.symbol}>
                        <td>
                          <b>{sym.symbol}</b>
                          <div className="tiny dim">{sym.label}</div>
                        </td>
                        <td className="dim capitalize">{sym.kind}</td>
                        <td className="num font-mono">
                          {sym.kind === 'private'
                            ? fmtPrice(q?.price ?? null)
                            : 'Live NASDAQ Feed'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {sym.kind === 'private' && (
                            <form
                              onSubmit={(e) => handleSetMark(sym.symbol, e)}
                              className="mini-form flex items-center justify-end gap-1.5"
                            >
                              <input
                                className="input font-mono"
                                type="number"
                                step="0.01"
                                placeholder="USD/sh"
                                style={{ width: '100px' }}
                                value={markPrices[sym.symbol] ?? (q?.price ? q.price.toFixed(2) : '')}
                                onChange={(e) =>
                                  setMarkPrices({ ...markPrices, [sym.symbol]: e.target.value })
                                }
                              />
                              <button
                                className={`btn btn-xs transition-colors ${
                                  isSaved
                                    ? 'bg-emerald-600 text-white font-medium'
                                    : 'btn-quiet'
                                }`}
                                type="submit"
                              >
                                {isSaved ? 'Saved ✓' : 'Set Mark'}
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vehicle Sizing Values */}
          <div className="card" style={{ marginTop: '14px' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="eyebrow no-rule mb-0">Vehicle sizing values</div>
              <span className="badge badge-ok">Live DB Sync</span>
            </div>
            <p className="tiny dim" style={{ marginBottom: '12px' }}>
              These values power the "gap to settle" and trade-in calculations across the site. Changes save directly to MongoDB.
            </p>
            <div className="table-wrap" style={{ border: 0 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Internal Sizing Value</th>
                    <th style={{ textAlign: 'right' }}>Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => {
                    const isSaved = savedModel === m.slug
                    return (
                      <tr key={m.slug}>
                        <td>
                          <div className="font-semibold text-white">{m.name}</div>
                          <div className="tiny dim">{m.era}</div>
                        </td>
                        <td className="num font-mono font-medium">{money(m.swap_value)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <form
                            onSubmit={(e) => handleSaveModel(m.slug, e)}
                            className="mini-form flex items-center justify-end gap-1.5"
                          >
                            <input
                              className="input font-mono"
                              type="number"
                              step="100"
                              style={{ width: '110px' }}
                              value={modelValues[m.slug] ?? (m.swap_value / 100).toString()}
                              onChange={(e) =>
                                setModelValues({ ...modelValues, [m.slug]: e.target.value })
                              }
                            />
                            <button
                              className={`btn btn-xs transition-colors ${
                                isSaved
                                  ? 'bg-emerald-600 text-white font-medium'
                                  : 'btn-quiet'
                              }`}
                              type="submit"
                            >
                              {isSaved ? 'Saved ✓' : 'Save'}
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside>
          <div className="card">
            <div className="eyebrow no-rule" style={{ marginBottom: '12px' }}>
              How private marks work
            </div>
            <p className="dim" style={{ fontSize: '12.5px', lineHeight: 1.7 }}>
              TSLA streams from a live market feed and is never editable. SpaceX and X are private companies,
              so the platform values them based on the internal mark set here.
            </p>
            <p className="dim mt-3" style={{ fontSize: '12.5px', lineHeight: 1.7 }}>
              When you click <strong>Save</strong> or <strong>Set Mark</strong>, the updated values are stored in the database immediately, repricing all member portfolios and trade-in calculations.
            </p>
          </div>
        </aside>
      </div>
    </AdminShell>
  )
}
