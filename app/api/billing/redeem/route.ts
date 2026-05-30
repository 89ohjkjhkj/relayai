import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const { code } = await req.json()
    if (!code) return NextResponse.json({ error: '兑换码不能为空' }, { status: 400 })

    const redeemCode = await prisma.redeemCode.findUnique({ where: { code } })
    if (!redeemCode) return NextResponse.json({ error: '兑换码不存在' }, { status: 404 })
    if (redeemCode.status !== 'active') return NextResponse.json({ error: '兑换码已使用' }, { status: 400 })
    if (redeemCode.expiresAt && new Date() > redeemCode.expiresAt) {
      return NextResponse.json({ error: '兑换码已过期' }, { status: 400 })
    }

    // Find user's first team to credit
    const membership = await prisma.teamMember.findFirst({
      where: { userId: user.id, role: { in: ['owner', 'admin'] } },
      orderBy: { createdAt: 'asc' },
    })
    if (!membership) return NextResponse.json({ error: '请先创建团队' }, { status: 400 })

    await prisma.$transaction([
      prisma.redeemCode.update({
        where: { id: redeemCode.id },
        data: { status: 'used', usedBy: user.id, usedAt: new Date() },
      }),
      prisma.team.update({
        where: { id: membership.teamId },
        data: { balance: { increment: redeemCode.value } },
      }),
      prisma.invoice.create({
        data: {
          teamId: membership.teamId,
          amount: redeemCode.value,
          currency: 'USD',
          type: 'topup',
          status: 'paid',
        },
      }),
    ])

    return NextResponse.json({ success: true, value: redeemCode.value })
  } catch (error) {
    console.error('Redeem error:', error)
    return NextResponse.json({ error: '兑换失败' }, { status: 500 })
  }
}
