import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    orderBy: { created_at: 'desc' },
    include: { generation_costs: true },
  })

  return NextResponse.json(users.map((u: any) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    created_at: u.created_at,
    last_login: u.last_login,
    generations: u.generation_costs.length,
    totalCost: u.generation_costs.reduce((s: number, g: any) => s + (g.cost_usd ?? 0), 0),
  })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, password, role } = await req.json()
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 })

  const user = await prisma.user.create({
    data: {
      username,
      password_hash: createHash('sha256').update(password).digest('hex'),
      role: role ?? 'user',
      created_at: new Date().toISOString(),
    },
  })

  return NextResponse.json({ success: true, id: user.id })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.username === 'admin') return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 })

  await prisma.generationCost.deleteMany({ where: { user_id: id } })
  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
