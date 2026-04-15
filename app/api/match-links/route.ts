import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchMatchPreview } from '@/lib/playhq'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const links = await prisma.matchLink.findMany({ orderBy: { added_at: 'desc' } })
  return NextResponse.json(links)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { urls, addedBy } = await req.json()
  const results: any[] = []

  for (const url of urls) {
    try {
      const matchId = url.trim().replace(/\/$/, '').split('/').pop()
      const existing = await prisma.matchLink.findUnique({ where: { match_id: matchId } })
      if (existing) {
        results.push({ url, status: 'duplicate', message: `Already saved: ${existing.home_team} vs ${existing.away_team}` })
        continue
      }

      const preview = await fetchMatchPreview(matchId)
      if (!preview) {
        results.push({ url, status: 'error', message: 'Could not fetch match data' })
        continue
      }

      await prisma.matchLink.create({
        data: {
          playhq_url: url.trim(),
          match_id: matchId,
          home_team: preview.home_team,
          away_team: preview.away_team,
          competition: preview.competition,
          date: preview.date,
          venue: preview.venue,
          added_by: addedBy,
          added_at: new Date().toISOString(),
          is_active: 1,
        },
      })
      results.push({ url, status: 'success', message: `Saved: ${preview.home_team} vs ${preview.away_team}` })
    } catch (e: any) {
      results.push({ url, status: 'error', message: e.message })
    }
  }

  return NextResponse.json({ results })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, is_active } = await req.json()
  await prisma.matchLink.update({ where: { id }, data: { is_active } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.matchLink.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
