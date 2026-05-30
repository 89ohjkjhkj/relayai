import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create super admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@relay.ai' },
    update: {},
    create: {
      email: 'admin@relay.ai',
      password: hashedPassword,
      name: 'Admin',
      role: 'super_admin',
    },
  })

  // Create default team
  const existingTeam = await prisma.team.findFirst({ where: { name: '默认团队' } })
  if (!existingTeam) {
    await prisma.team.create({
      data: {
        name: '默认团队',
        plan: 'business',
        monthlyQuota: 100,
        balance: 50,
        members: {
          create: {
            userId: admin.id,
            role: 'owner',
            monthlyQuota: 0,
            allowedModels: '*',
            maxKeys: 100,
          },
        },
      },
    })
  }

  // Create default settings
  const defaultSettings = [
    { key: 'appName', value: 'RelayAI' },
    { key: 'appUrl', value: 'http://localhost:3000' },
    { key: 'defaultQuota', value: '1' },
    { key: 'registerEnabled', value: 'true' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  // Create some sample redeem codes
  const sampleCodes = [
    { code: 'WELCOME-2026-DEMO', value: 5 },
    { code: 'TEAM-START-2026', value: 20 },
    { code: 'BUSI-TRIAL-2026', value: 100 },
  ]

  for (const c of sampleCodes) {
    await prisma.redeemCode.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        value: c.value,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Seed completed!')
  console.log('📧 Admin: admin@relay.ai / admin123')
  console.log('🎁 Redeem codes: WELCOME-2026-DEMO ($5), TEAM-START-2026 ($20), BUSI-TRIAL-2026 ($100)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
