'use client'

import React from 'react'
import { useTeslaX } from '../context/TeslaXContext'

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTeslaX()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-lg shadow-2xl text-xs font-medium flex items-center justify-between gap-3 border backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${
            t.kind === 'err'
              ? 'bg-rose-950/90 border-rose-800 text-rose-200'
              : t.kind === 'info'
              ? 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
              : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}
        >
          <span>{t.text}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-white/60 hover:text-white text-base leading-none font-bold"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

