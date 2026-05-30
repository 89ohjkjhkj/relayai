import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { role: 'asc' },
      },
    },
  })

  if (!team) return NextResponse.json({ error: '团队不存在' }, { status: 404 })

  // Check membership
  const isMember = team.members.some(m => m.userId === user.id)
  if (!isMember) return NextResponse.json({ error: '无权访问' }, { status: 403 })

  return NextResponse.json(team)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId: params.id, role: 'owner' },
  })
  if (!membership) return NextResponse.json({ error: '仅所有者可删除团队' }, { status: 403 })

  await prisma.team.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
