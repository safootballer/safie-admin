import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allCosts = await prisma.generationCost.findMany({ include: { user: true } })
  const allMatches = await prisma.match.findMany({ select: { extracted_at: true, competition: true } })

  // Daily costs
  const dailyMap: Record<string, { cost: number; count: number }> = {}
  for (const g of allCosts) {
    const day = (g.generated_at ?? '').slice(0, 10)
    if (!day) continue
    if (!dailyMap[day]) dailyMap[day] = { cost: 0, count: 0 }
    dailyMap[day].cost += g.cost_usd ?? 0
    dailyMap[day].count += 1
  }
  const dailyCosts = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, ...v }))

  // By content type
  const typeMap: Record<string, { count: number; cost: number }> = {}
  for (const g of allCosts) {
    const t = g.content_type ?? 'Unknown'
    if (!typeMap[t]) typeMap[t] = { count: 0, cost: 0 }
    typeMap[t].count += 1
    typeMap[t].cost += g.cost_usd ?? 0
  }
  const byContentType = Object.entries(typeMap).map(([type, v]) => ({ type, ...v }))

  // By user
  const userMap: Record<string, { count: number; cost: number }> = {}
  for (const g of allCosts) {
    const u = (g as any).user?.username ?? 'Unknown'
    if (!userMap[u]) userMap[u] = { count: 0, cost: 0 }
    userMap[u].count += 1
    userMap[u].cost += g.cost_usd ?? 0
  }
  const byUser = Object.entries(userMap).map(([user, v]) => ({ user, ...v }))

  // Matches by day
  const matchDayMap: Record<string, number> = {}
  for (const m of allMatches) {
    const day = (m.extracted_at ?? '').slice(0, 10)
    if (!day) continue
    matchDayMap[day] = (matchDayMap[day] ?? 0) + 1
  }
  const matchesByDay = Object.entries(matchDayMap).sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count }))

  // By competition
  const compMap: Record<string, number> = {}
  for (const m of allMatches) {
    const c = m.competition ?? 'Unknown'
    compMap[c] = (compMap[c] ?? 0) + 1
  }
  const byCompetition = Object.entries(compMap).map(([competition, count]) => ({ competition, count }))

  return NextResponse.json({ dailyCosts, byContentType, byUser, matchesByDay, byCompetition })
}
