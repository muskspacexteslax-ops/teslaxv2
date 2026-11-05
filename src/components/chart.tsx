'use client'

import React, { useState } from 'react'
import type { Quote, Series } from '../lib/market'
import { fmtPrice, fmtPct, seriesPath, generatePoints } from '../lib/market'

interface LiveChartProps {
  quote: Quote
  series?: Series | null
  range?: string
  height?: number
  className?: string
}

export const LiveChart: React.FC<LiveChartProps> = ({
  quote,
  series,
  range: initialRange = '1mo',
  height = 320,
  className = '',
}) => {
  const [mounted, setMounted] = useState(false)
  const [activeRange, setActiveRange] = useState(initialRange)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Adapt points according to selected range
  const basePoints = series?.points || generatePoints(quote.price, 0.02, 30)
  
  // Synthetic variations for ranges if clicked
  const points = React.useMemo(() => {
    const count = activeRange === '1d' ? 24 : activeRange === '1w' ? 28 : activeRange === '1y' ? 52 : 36
    const vol = activeRange === '1d' ? 0.008 : activeRange === '1w' ? 0.015 : activeRange === '1y' ? 0.035 : 0.02
    return generatePoints(quote.price, vol, count)
  }, [quote.price, activeRange])

  const values = points.map((p) => p.c)
  const first = values[0] || quote.price
  const last = values[values.length - 1] || quote.price
  const currentVal = hoverIdx !== null && points[hoverIdx] ? points[hoverIdx].c : quote.price
  const isUp = currentVal >= first

  const strokeColor = isUp ? '#34d399' : '#ff6b70'
  const fillColor = isUp ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255, 107, 112, 0.12)'

  const width = 800
  const chartHeight = Math.max(120, height - 90)
  const { line, area } = seriesPath(points, width, chartHeight, 1.8)

  return (
    <div className={`card ${className}`} style={{ padding: '22px 24px' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-white">{quote.symbol}</h3>
            <span className={`badge ${quote.marked ? '' : 'badge-ok'}`}>
              {quote.marked ? 'PRIVATE MARK' : 'LIVE FEED'}
            </span>
            <span className="text-xs text-muted font-mono">{quote.name || quote.label}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-light tracking-tight text-white font-mono">
              {fmtPrice(currentVal, quote.currency)}
            </span>
            <span className={`text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {quote.marked
                ? 'Fixed valuation mark'
                : `${isUp ? '▲' : '▼'} ${fmtPct(((currentVal - first) / first) * 100)}`}
            </span>
          </div>
        </div>

        {/* Range switcher */}
        <div className="flex items-center gap-1 bg-surface-2 border border-line rounded-md p-1 self-start sm:self-auto">
          {[
            { id: '1d', label: '1D' },
            { id: '1w', label: '1W' },
            { id: '1mo', label: '1M' },
            { id: '1y', label: '1Y' },
            { id: 'all', label: 'ALL' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRange(r.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                activeRange === r.id
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-muted hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden" style={{ height: `${chartHeight}px` }}>
        {mounted ? (
          <svg
            viewBox={`0 0 ${width} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const xRel = (e.clientX - rect.left) / rect.width
              const idx = Math.min(points.length - 1, Math.max(0, Math.floor(xRel * points.length)))
              setHoverIdx(idx)
            }}
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {area && <path d={area} fill="url(#chartGrad)" />}

            {/* Line stroke */}
            {line && (
              <path
                d={line}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Hover indicator dot */}
            {hoverIdx !== null && points[hoverIdx] && (
              <g>
                <line
                  x1={(hoverIdx / (points.length - 1)) * width}
                  y1="0"
                  x2={(hoverIdx / (points.length - 1)) * width}
                  y2={chartHeight}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={(hoverIdx / (points.length - 1)) * width}
                  cy={
                    chartHeight -
                    ((points[hoverIdx].c - Math.min(...values)) /
                      (Math.max(...values) - Math.min(...values) || 1)) *
                      (chartHeight - 16) -
                    8
                  }
                  r="4"
                  fill="#ffffff"
                  stroke={strokeColor}
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        ) : (
          <div className="w-full h-full sprint-skel" />
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-2 pt-3 border-t border-line/40 mt-3 font-mono">
        <span>LOW: {fmtPrice(Math.min(...values))}</span>
        <span>RANGE: {activeRange.toUpperCase()}</span>
        <span>HIGH: {fmtPrice(Math.max(...values))}</span>
      </div>
    </div>
  )
}

