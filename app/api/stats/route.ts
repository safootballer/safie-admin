import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [totalUsers, totalMatches, totalGenerations, recentMatches, allCosts, monthCosts, recentGens] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
    prisma.generationCost.count(),
    prisma.match.count({ where: { extracted_at: { gte: sevenDaysAgo } } }),
    prisma.generationCost.aggregate({ _sum: { cost_usd: true }, _avg: { cost_usd: true } }),
    prisma.generationCost.findMany({ where: { generated_at: { startsWith: currentMonth } } }),
    prisma.generationCost.findMany({
      take: 10,
      orderBy: { generated_at: 'desc' },
      include: { user: true },
    }),
  ])

  const monthCostTotal = monthCosts.reduce((s: number, g: any) => s + (g.cost_usd ?? 0), 0)
  const monthGenCount = monthCosts.length

  return NextResponse.json({
    totalUsers,
    totalMatches,
    totalGenerations,
    recentMatches,
    totalCost: allCosts._sum.cost_usd ?? 0,
    avgCost: allCosts._avg.cost_usd ?? 0,
    monthCost: monthCostTotal,
    monthGenerations: monthGenCount,
    recentGens: recentGens.map((g: any) => ({
      date: g.generated_at,
      user: g.user?.username ?? 'Unknown',
      contentType: g.content_type,
      promptTokens: g.prompt_tokens,
      completionTokens: g.completion_tokens,
      totalTokens: g.total_tokens,
      costUsd: g.cost_usd,
      model: g.model,
    })),
  })
}
