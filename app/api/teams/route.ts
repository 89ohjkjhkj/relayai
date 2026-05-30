import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: user.id } } },
    include: { _count: { select: { members: true, apiKeys: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(teams)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const { name, plan, monthlyQuota } = await req.json()

    if (!name) {
      return NextResponse.json({ error: '团队名称不能为空' }, { status: 400 })
    }

    const team = await prisma.team.create({
      data: {
        name,
        plan: plan || 'free',
        monthlyQuota: monthlyQuota || 0,
        members: {
          create: { userId: user.id, role: 'owner', monthlyQuota: 0, allowedModels: '*', maxKeys: 50 },
        },
      },
      include: { _count: { select: { members: true, apiKeys: true } } },
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json({ error: '创建团队失败' }, { status: 500 })
  }
}
