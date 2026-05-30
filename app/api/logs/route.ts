import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const model = searchParams.get('model') || ''
  const status = searchParams.get('status') || ''
  const pageSize = 20

  const teams = await prisma.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  })
  const teamIds = teams.map(t => t.teamId)

  const where: Record<string, unknown> = {
    apiKey: { teamId: { in: teamIds } },
  }

  if (model) where.model = { contains: model }
  if (status === '200') where.status = 200
  else if (status === 'error') where.status = { not: 200 }

  const logs = await prisma.usageLog.findMany({
    where,
    include: { apiKey: { select: { name: true, key: true } } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return NextResponse.json(logs)
}
