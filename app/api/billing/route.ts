import { NextRequest, NextResponse } from 'next/server'
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

  const invoices = await prisma.invoice.findMany({
    where: { teamId: { in: teamIds } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const { teamId, amount, type } = await req.json()

    if (!teamId || !amount || amount <= 0) {
      return NextResponse.json({ error: '参数无效' }, { status: 400 })
    }

    // Verify membership
    const membership = await prisma.teamMember.findFirst({
      where: { userId: user.id, teamId, role: { in: ['owner', 'admin'] } },
    })
    if (!membership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

    // Create invoice and update balance
    await prisma.$transaction([
      prisma.invoice.create({
        data: { teamId, amount, currency: 'USD', type: type || 'topup', status: 'paid' },
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { balance: { increment: amount } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Topup error:', error)
    return NextResponse.json({ error: '充值失败' }, { status: 500 })
  }
}
