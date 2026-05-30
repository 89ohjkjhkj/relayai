import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateRedeemCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  try {
    const { value, expiresInDays, count } = await req.json()
    const numCount = Math.min(Math.max(count || 1, 1), 100)

    const codes = []
    for (let i = 0; i < numCount; i++) {
      const code = generateRedeemCode()
      const expiresAt = expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
        : null

      const redeemCode = await prisma.redeemCode.create({
        data: { code, value: parseFloat(value) || 10, expiresAt },
      })
      codes.push(redeemCode)
    }

    return NextResponse.json({ codes })
  } catch (error) {
    console.error('Generate redeem codes error:', error)
    return NextResponse.json({ error: '生成失败' }, { status: 500 })
  }
}
