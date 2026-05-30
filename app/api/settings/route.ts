import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const settings = await prisma.setting.findMany()
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))

  // Get redeem codes (admin only)
  let codes: unknown[] = []
  if (user.role === 'super_admin' || user.role === 'admin') {
    codes = await prisma.redeemCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  return NextResponse.json({
    settings: settingsMap,
    codes,
  })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return NextResponse.json({ error: '无权操作' }, { status: 403 })
  }

  try {
    const data = await req.json()

    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: '保存失败' }, { status: 500 })
  }
}
