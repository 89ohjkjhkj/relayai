import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateApiKey } from '@/lib/utils'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teams = await prisma.teamMember.findMany({
    where: { userId: user.id },
    select: { teamId: true },
  })
  const teamIds = teams.map(t => t.teamId)

  const keys = await prisma.apiKey.findMany({
    where: { teamId: { in: teamIds } },
    include: { team: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(keys)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextUserResponse(user)

  try {
    const { name, teamId, allowedModels, totalQuota, expiresInDays } = await req.json()

    if (!name || !teamId) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // Check membership
    const membership = await prisma.teamMember.findFirst({
      where: { userId: user.id, teamId },
    })
    if (!membership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

    // Check key limit for member
    if (membership.role === 'member') {
      const keyCount = await prisma.apiKey.count({
        where: { teamId, memberId: membership.id, status: 'active' },
      })
      if (keyCount >= membership.maxKeys) {
        return NextResponse.json({ error: `密钥数量已达上限 (${membership.maxKeys})` }, { status: 403 })
      }
    }

    const key = generateApiKey()
    const expiresAt = expiresInDays > 0 ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null

    const apiKey = await prisma.apiKey.create({
      data: {
        teamId,
        userId: user.id,
        memberId: membership.id,
        key,
        name,
        allowedModels: allowedModels || '*',
        totalQuota: totalQuota || 0,
        expiresAt,
      },
    })

    // Return the full key only on creation
    return NextResponse.json({ ...apiKey, key })
  } catch (error) {
    console.error('Create key error:', error)
    return NextResponse.json({ error: '创建密钥失败' }, { status: 500 })
  }
}

function NextUserResponse(user: { id: string; email: string; name: string; role: string } | null) {
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })
  return NextResponse.json({ error: '不应到达此处' }, { status: 500 })
}
