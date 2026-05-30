import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const channel = await prisma.channel.findUnique({ where: { id: params.id } })
  if (!channel) return NextResponse.json({ error: '渠道不存在' }, { status: 404 })

  const membership = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId: channel.teamId, role: { in: ['owner', 'admin'] } },
  })
  if (!membership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  await prisma.channel.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
