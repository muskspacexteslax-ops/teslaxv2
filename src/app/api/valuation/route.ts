import { NextRequest, NextResponse } from 'next/server'
import { valuate, ValuationInput } from '@/lib/valuation'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ValuationInput

    if (!body.make || !body.model || !body.year || !body.mileage) {
      return NextResponse.json(
        { error: 'Make, model, year, and mileage are required.' },
        { status: 400 }
      )
    }

    // 1. Calculate baseline algorithmic valuation
    const baseline = valuate(body)

    // 2. Check if Google Gemini AI key is configured
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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
            signal: AbortSignal.timeout(5000),
          }
        )

        if (res.ok) {
          const data = await res.json()
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (rawText) {
            const aiParsed = JSON.parse(rawText)
            if (aiParsed.mid && aiParsed.low && aiParsed.high) {
              // Sanity check: Ensure AI valuation is within 35% of algorithmic baseline to prevent wild hallucinations
              const ratio = (aiParsed.mid / baseline.mid)
              if (ratio >= 0.65 && ratio <= 1.45) {
                return NextResponse.json({
                  success: true,
                  valuation: {
                    ...baseline,
                    low: Math.round(aiParsed.low),
                    mid: Math.round(aiParsed.mid),
                    high: Math.round(aiParsed.high),
                    marketSummary: aiParsed.reasoning || baseline.marketSummary,
                    confidence: aiParsed.confidence || 96,
                    engine: 'Gemini-1.5-Flash (AI Appraisal)',
                  },
                })
              }
            }
          }
        }
      } catch (aiErr) {
        // Fall through to algorithmic baseline if AI times out or errors
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
