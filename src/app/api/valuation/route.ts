import { NextRequest, NextResponse } from 'next/server'
import { valuate, ValuationInput } from '@/lib/valuation'
import { getClientIp, checkRateLimit } from '@/lib/rate-limit'
import {
  getValuationCacheKey,
  getCachedValuation,
  setCachedValuation,
} from '@/lib/valuation-cache'

interface ValuationRequestBody extends ValuationInput {
  honeypot?: string
  preferred_contact_method?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValuationRequestBody

    if (!body.make || !body.model || !body.year || !body.mileage) {
      return NextResponse.json(
        { error: 'Make, model, year, and mileage are required.' },
        { status: 400 }
      )
    }

    // 1. Calculate baseline algorithmic valuation
    const baseline = valuate(body)

    // SHIELD LAYER 1: Invisible Honeypot Anti-Bot Detection
    // If a bot filled out the hidden contact field, bypass external AI API and return local math
    if (body.honeypot || body.preferred_contact_method) {
      return NextResponse.json({
        success: true,
        valuation: baseline,
        source: 'protected',
      })
    }

    // SHIELD LAYER 2: In-Memory 24-Hour Valuation Cache
    // If this make/model/year/mileage was already appraised, serve instantly with 0ms latency & 0 quota used
    const cacheKey = getValuationCacheKey(body)
    const cached = getCachedValuation(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        valuation: {
          ...cached,
          cached: true,
        },
        source: 'cache',
      })
    }

    // SHIELD LAYER 3: Soft Per-IP Rate Limiting
    // Limit to 8 Gemini calls per 10 minutes per IP.
    // If a visitor or scraper exceeds this, gracefully serve the algorithmic valuation without throwing errors
    const clientIp = getClientIp(req)
    const rateCheck = checkRateLimit(`gemini_val_${clientIp}`, 8, 600000)

    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: true,
        valuation: baseline,
        throttled: true,
        source: 'algorithmic-shield',
      })
    }

    // 4. Query Google Gemini AI if configured
    const geminiKey = process.env.GEMINI_API_KEY

    if (geminiKey) {
      try {
        const prompt = `You are a professional automotive appraisal intelligence engine for an EV trade-in exchange.
Evaluate this vehicle based on market wholesale, trade-in, and salvage auctions:
- Make: ${body.make}
- Model: ${body.model}
- Year: ${body.year}
- Mileage: ${body.mileage} miles
- Physical Condition: ${body.condition || 'good'}
- Fuel: ${body.fuel || 'petrol'}
- Transmission: ${body.transmission || 'automatic'}
- Previous Owners: ${body.owners || 1}
- Service Records: ${body.service_history || 'full'}
- Accident History: ${body.accident_history || 'none'}

Algorithmic reference mid-point: $${(baseline.mid / 100).toLocaleString()} USD (Range: $${(baseline.low / 100).toLocaleString()} - $${(baseline.high / 100).toLocaleString()}).

IMPORTANT RULES:
- High mileage (e.g. >140,000 mi) or older vehicles (>12 years old) must be valued realistically reflecting wholesale auction trade values (often $700 - $3,500 depending on condition), NOT high dealer retail.
- Return ONLY a strict JSON object with:
  "low": estimated wholesale low in USD cents (integer),
  "mid": estimated trade-in mid in USD cents (integer),
  "high": estimated private market high in USD cents (integer),
  "reasoning": concise 1-sentence analytical commentary explaining how mileage and year drove the valuation,
  "confidence": confidence percentage between 85 and 99`

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
            signal: AbortSignal.timeout(7000),
          }
        )

        if (res.ok) {
          const data = await res.json()
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (rawText) {
            const aiParsed = JSON.parse(rawText)
            if (aiParsed.mid && aiParsed.low && aiParsed.high) {
              // Sanity check: Ensure AI valuation is within 35% of algorithmic baseline
              const ratio = aiParsed.mid / baseline.mid
              if (ratio >= 0.65 && ratio <= 1.45) {
                const finalValuation = {
                  ...baseline,
                  low: Math.round(aiParsed.low),
                  mid: Math.round(aiParsed.mid),
                  high: Math.round(aiParsed.high),
                  marketSummary: aiParsed.reasoning || baseline.marketSummary,
                  confidence: aiParsed.confidence || 97,
                  engine: 'Gemini AI Intelligence (Google)',
                }

                // Cache the AI appraisal for 24 hours
                setCachedValuation(cacheKey, finalValuation)

                return NextResponse.json({
                  success: true,
                  valuation: finalValuation,
                  source: 'ai-fresh',
                })
              }
            }
          }
        }
      } catch (aiErr) {
        console.warn('AI valuation fallback:', aiErr)
      }
    }

    // Default to the refined algorithmic intelligence engine
    return NextResponse.json({
      success: true,
      valuation: baseline,
    })
  } catch (err: any) {
    console.error('Valuation route error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to calculate vehicle valuation.' },
      { status: 500 }
    )
  }
}
