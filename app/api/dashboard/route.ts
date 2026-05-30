import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teams = await prisma.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  })
  const teamIds = teams.map(t => t.teamId)

  if (teamIds.length === 0) {
    return NextResponse.json(null)
  }

  // Get current month range
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Aggregate stats
  const [monthLogs, todayLogs, activeKeys, modelBreakdown, recentLogs] = await Promise.all([
    prisma.usageLog.aggregate({
      _sum: { totalTokens: true, cost: true },
      _count: true,
      where: { apiKey: { teamId: { in: teamIds } }, createdAt: { gte: monthStart }, status: 200 },
    }),
    prisma.usageLog.aggregate({
      _sum: { cost: true },
      _count: true,
      where: { apiKey: { teamId: { in: teamIds } }, createdAt: { gte: todayStart }, status: 200 },
    }),
    prisma.apiKey.count({
      where: { teamId: { in: teamIds }, status: 'active' },
    }),
    prisma.usageLog.groupBy({
      by: ['model'],
      _sum: { cost: true },
      _count: true,
      where: { apiKey: { teamId: { in: teamIds } }, createdAt: { gte: monthStart } },
      orderBy: { _count: { model: 'desc' } },
      take: 10,
    }),
    prisma.usageLog.findMany({
      where: { apiKey: { teamId: { in: teamIds } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true, model: true, totalTokens: true, cost: true, status: true, createdAt: true,
      },
    }),
  ])

  return NextResponse.json({
    totalRequests: monthLogs._count,
    totalTokens: monthLogs._sum.totalTokens || 0,
    monthlyCost: monthLogs._sum.cost || 0,
    activeKeys,
    todayRequests: todayLogs._count,
    todayCost: todayLogs._sum.cost || 0,
    modelBreakdown: modelBreakdown.map(m => ({
      model: m.model,
      requests: m._count,
      cost: m._sum.cost || 0,
    })),
    recentLogs,
  })
}
