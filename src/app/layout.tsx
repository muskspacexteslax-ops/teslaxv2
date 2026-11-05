import type { Metadata } from 'next'
import './globals.css'
import { TeslaXProvider } from '../context/TeslaXContext'
import { ToastContainer } from '../components/Toast'
import { Preloader } from '../components/Preloader'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teslax.com'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'TeslaX — Petrol to Electric Swap Platform',
    template: '%s | TeslaX',
  },
  description:
    'Trade your petrol car for the one that drives itself. Transparent valuation, zero classifieds, full title transfer, and private markets tracking.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'TeslaX — Petrol to Electric Swap Platform',
    description:
      'Trade your petrol car for the one that drives itself. Instant trade-in valuations, direct vehicle exchange, and private tech portfolio access.',
    url: appUrl,
    siteName: 'TeslaX',
    images: [
      {
        url: '/images/cars/model-3.jpg',
        width: 1200,
        height: 630,
        alt: 'TeslaX Electric Swap Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeslaX — Petrol to Electric Swap Platform',
    description:
      'Trade your petrol car for the one that drives itself. Instant valuation, zero classifieds, guaranteed price locks.',
    images: ['/images/cars/model-3.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-ink text-gray-100 antialiased selection:bg-accent selection:text-white">
        <Preloader />
        <TeslaXProvider>
          {children}
          <ToastContainer />
        </TeslaXProvider>
      </body>
    </html>
  )
}

