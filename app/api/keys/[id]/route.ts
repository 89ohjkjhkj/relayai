import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const apiKey = await prisma.apiKey.findUnique({ where: { id: params.id } })
  if (!apiKey) return NextResponse.json({ error: '密钥不存在' }, { status: 404 })

  // Check ownership or admin
  if (apiKey.userId !== user.id) {
    const membership = await prisma.teamMember.findFirst({
      where: { userId: user.id, teamId: apiKey.teamId, role: { in: ['owner', 'admin'] } },
    })
    if (!membership) return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  await prisma.apiKey.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
