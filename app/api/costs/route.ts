import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const start     = searchParams.get('start')
  const end       = searchParams.get('end')
  const exportCsv = searchParams.get('export') === 'true'

  const allCosts = await prisma.generationCost.findMany({
    include: { user: true },
    orderBy: { generated_at: 'desc' },
  })

  const monthMap: Record<string, { count: number; cost: number; promptTokens: number; completionTokens: number; totalTokens: number }> = {}
  for (const g of allCosts) {
    const month = (g.generated_at ?? '').slice(0, 7)
    if (!month) continue
    if (!monthMap[month]) monthMap[month] = { count: 0, cost: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    monthMap[month].count += 1
    monthMap[month].cost += g.cost_usd ?? 0
    monthMap[month].promptTokens += g.prompt_tokens ?? 0
    monthMap[month].completionTokens += g.completion_tokens ?? 0
    monthMap[month].totalTokens += g.total_tokens ?? 0
  }
  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, v]) => ({ month, ...v }))

  const modelMap: Record<string, { count: number; cost: number; tokens: number }> = {}
  for (const g of allCosts) {
    const m = g.model ?? 'Unknown'
    if (!modelMap[m]) modelMap[m] = { count: 0, cost: 0, tokens: 0 }
    modelMap[m].count += 1
    modelMap[m].cost += g.cost_usd ?? 0
    modelMap[m].tokens += g.total_tokens ?? 0
  }
  const byModel = Object.entries(modelMap).map(([model, v]) => ({ model, ...v }))

  if (exportCsv) {
    let filtered: any[] = allCosts
    if (start) filtered = filtered.filter((g: any) => (g.generated_at ?? '') >= start)
    if (end)   filtered = filtered.filter((g: any) => (g.generated_at ?? '') <= end + 'T23:59:59')

    const rows: any[][] = filtered.map((g: any) => [
      g.generated_at, g.user?.username ?? '', g.content_type,
      g.prompt_tokens, g.completion_tokens, g.total_tokens,
      g.cost_usd, g.model, g.match_id,
    ])
    const header = 'generated_at,username,content_type,prompt_tokens,completion_tokens,total_tokens,cost_usd,model,match_id'
    const csv    = [header, ...rows.map((r: any[]) => r.join(','))].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="costs.csv"',
      },
    })
  }

  return NextResponse.json({ monthly, byModel })
}