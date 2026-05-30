import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teams = await prisma.teamMember.findMany({
    where: { userId: user.id, role: { in: ['owner', 'admin'] } },
    select: { teamId: true },
  })
  const teamIds = teams.map(t => t.teamId)

  const channels = await prisma.channel.findMany({
    where: { teamId: { in: teamIds } },
    orderBy: { priority: 'desc' },
  })

  // Mask API keys
  const masked = channels.map(ch => ({
    ...ch,
    apiKey: ch.apiKey.slice(0, 8) + '...' + ch.apiKey.slice(-4),
  }))

  return NextResponse.json(masked)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const { name, provider, apiKey, baseUrl, models, priority, teamId } = await req.json()

    if (!name || !provider || !apiKey || !baseUrl || !models) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // Verify user is admin of the team
    const membership = await prisma.teamMember.findFirst({
      where: { userId: user.id, teamId, role: { in: ['owner', 'admin'] } },
    })
    if (!membership) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const channel = await prisma.channel.create({
      data: { teamId, name, provider, apiKey, baseUrl, models, priority: priority || 1 },
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Create channel error:', error)
    return NextResponse.json({ error: '创建渠道失败' }, { status: 500 })
  }
}
