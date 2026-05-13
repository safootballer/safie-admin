import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SAFIE_URL           = process.env.SAFIE_URL ?? 'https://nextjs-safie.onrender.com'
const AUTO_PUBLISH_SECRET = process.env.AUTO_PUBLISH_SECRET ?? ''

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all active match links that have match data in DB
  const links = await prisma.matchLink.findMany({
    where: { is_active: 1 },
    orderBy: { added_at: 'desc' },
  })

  if (!links.length) {
    return NextResponse.json({ success: false, error: 'No active match links found' }, { status: 404 })
  }

  // Fire all in background — return immediately
  const responsePromise = NextResponse.json({
    success: true,
    message: `Auto-publish pipeline started for ${links.length} matches`,
    total: links.length,
  })

  // Process all matches in background
  ;(async () => {
    const results: { matchId: string; status: string; slug?: string; error?: string }[] = []

    for (const link of links) {
      try {
        console.log(`[AUTO-ALL] Processing ${link.match_id}: ${link.home_team} vs ${link.away_team}`)

        const res  = await fetch(`${SAFIE_URL}/api/auto-publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auto-publish-secret': AUTO_PUBLISH_SECRET,
          },
          body: JSON.stringify({ matchId: link.match_id }),
        })
        const data = await res.json()

        if (data.success) {
          console.log(`[AUTO-ALL] ✅ ${link.match_id} published as ${data.slug} after ${data.attempts} attempt(s)`)
          results.push({ matchId: link.match_id, status: 'success', slug: data.slug })
        } else {
          console.error(`[AUTO-ALL] ❌ ${link.match_id} failed: ${data.error}`)
          results.push({ matchId: link.match_id, status: 'failed', error: data.error })
        }
      } catch (e: any) {
        console.error(`[AUTO-ALL] ❌ ${link.match_id} error: ${e.message}`)
        results.push({ matchId: link.match_id, status: 'error', error: e.message })
      }
    }

    const succeeded = results.filter(r => r.status === 'success').length
    const failed    = results.filter(r => r.status !== 'success').length
    console.log(`[AUTO-ALL] Done: ${succeeded} published, ${failed} failed`)
  })()

  return responsePromise
}