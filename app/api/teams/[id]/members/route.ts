import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teamId = params.id

  // Check admin
  const adminMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId, role: { in: ['owner', 'admin'] } },
  })
  if (!adminMembership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  try {
    const { email, role, monthlyQuota, allowedModels, maxKeys } = await req.json()

    const targetUser = await prisma.user.findUnique({ where: { email } })
    if (!targetUser) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    // Check if already a member
    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUser.id } },
    })
    if (existing) return NextResponse.json({ error: '用户已在团队中' }, { status: 409 })

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUser.id,
        role: role || 'member',
        monthlyQuota: monthlyQuota || 0,
        allowedModels: allowedModels || '*',
        maxKeys: maxKeys || 5,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Add member error:', error)
    return NextResponse.json({ error: '添加成员失败' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teamId = params.id

  const adminMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId, role: { in: ['owner', 'admin'] } },
  })
  if (!adminMembership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  try {
    const { memberId, monthlyQuota, allowedModels, maxKeys, role } = await req.json()

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } })
    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: '成员不存在' }, { status: 404 })
    }
    if (member.role === 'owner') {
      return NextResponse.json({ error: '不能修改所有者' }, { status: 403 })
    }

    const updated = await prisma.teamMember.update({
      where: { id: memberId },
      data: {
        ...(monthlyQuota !== undefined && { monthlyQuota }),
        ...(allowedModels !== undefined && { allowedModels }),
        ...(maxKeys !== undefined && { maxKeys }),
        ...(role !== undefined && { role }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update member error:', error)
    return NextResponse.json({ error: '更新成员失败' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const teamId = params.id
  const { memberId } = await req.json()

  const adminMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id, teamId, role: { in: ['owner', 'admin'] } },
  })
  if (!adminMembership) return NextResponse.json({ error: '无权操作' }, { status: 403 })

  const member = await prisma.teamMember.findUnique({ where: { id: memberId } })
  if (!member || member.teamId !== teamId) {
    return NextResponse.json({ error: '成员不存在' }, { status: 404 })
  }
  if (member.role === 'owner') {
    return NextResponse.json({ error: '不能移除所有者' }, { status: 403 })
  }

  await prisma.teamMember.delete({ where: { id: memberId } })
  return NextResponse.json({ success: true })
}
