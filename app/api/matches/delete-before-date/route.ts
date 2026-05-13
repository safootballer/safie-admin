import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { beforeDate } = await req.json()
  if (!beforeDate) return NextResponse.json({ error: 'beforeDate required' }, { status: 400 })

  const cutoff = new Date(beforeDate).toISOString()

  // Delete from match_links
  const links = await prisma.matchLink.findMany({
    where: { added_at: { lt: cutoff } },
    select: { id: true, match_id: true },
  })

  if (!links.length) {
    return NextResponse.json({ success: true, deleted: 0 })
  }

  const matchIds = links.map((l: { id: number; match_id: string }) => l.match_id)

  // Delete from matches table too
  await prisma.match.deleteMany({
    where: { match_id: { in: matchIds } },
  })

  // Delete from match_links
  await prisma.matchLink.deleteMany({
    where: { added_at: { lt: cutoff } },
  })

  return NextResponse.json({ success: true, deleted: links.length })
}