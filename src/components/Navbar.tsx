'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brand } from './ui'
import { useTeslaX } from '../context/TeslaXContext'

export const Navbar: React.FC = () => {
  const pathname = usePathname()
  const { user, logout, settings } = useTeslaX()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLinkActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-black/85 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Brand />
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/lineup"
              className={`px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${
                isLinkActive('/lineup') ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              The Lineup
            </Link>
            <Link
              href="/swap"
              className={`px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${
                isLinkActive('/swap') ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              Value My Car
            </Link>
            <Link
              href="/markets"
              className={`px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${
                isLinkActive('/markets') ? 'text-white font-medium bg-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              Markets
            </Link>
          </nav>
        </div>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' ? (
                <Link href="/admin" className="btn btn-primary btn-sm">
                  Control Room
                </Link>
              ) : (
                <Link href="/dashboard" className="btn btn-primary btn-sm">
                  Portal
                </Link>
              )}
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm text-xs text-gray-400 hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-quiet btn-sm">
                Log in
              </Link>
              <Link href="/swap" className="btn btn-primary btn-sm">
                Value my car →
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="btn btn-primary btn-xs text-xs"
            >
              {user.role === 'admin' ? 'Admin' : 'Portal'}
            </Link>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-line bg-black/95 px-6 py-4 flex flex-col gap-3">
          <Link
            href="/lineup"
            onClick={() => setMobileOpen(false)}
            className="text-gray-300 py-2 border-b border-white/5 text-sm"
          >
            The Lineup
          </Link>
          <Link
            href="/swap"
            onClick={() => setMobileOpen(false)}
            className="text-gray-300 py-2 border-b border-white/5 text-sm"
          >
            Value My Car
          </Link>
          <Link
            href="/markets"
            onClick={() => setMobileOpen(false)}
            className="text-gray-300 py-2 border-b border-white/5 text-sm"
          >
            Markets
          </Link>

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-white font-medium py-2 border-b border-white/5 text-sm"
              >
                Member Portal
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-red-400 font-medium py-2 border-b border-white/5 text-sm"
                >
                  Admin Control Room
                </Link>
              )}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">{user.email}</span>
                <button
                  onClick={() => {
                    logout()
                    setMobileOpen(false)
                  }}
                  className="text-xs text-red-400 underline"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-ghost btn-sm flex-1 text-center"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary btn-sm flex-1 text-center"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

