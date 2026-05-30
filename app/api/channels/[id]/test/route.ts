import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const channel = await prisma.channel.findUnique({ where: { id: params.id } })
  if (!channel) return NextResponse.json({ error: '渠道不存在' }, { status: 404 })

  try {
    const testModels = channel.models.split(',').map(m => m.trim()).filter(m => m !== '*')
    const model = testModels[0] || 'gpt-4o-mini'

    const baseUrl = channel.baseUrl.replace(/\/$/, '')
    let url: string
    let headers: Record<string, string>

    if (channel.provider === 'anthropic') {
      url = `${baseUrl}/v1/messages`
      headers = {
        'x-api-key': channel.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      }
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model.replace('claude-3.5-sonnet', 'claude-3-5-sonnet-20241022'),
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ success: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` })
      }
    } else {
      url = `${baseUrl}/v1/chat/completions`
      headers = {
        'Authorization': `Bearer ${channel.apiKey}`,
        'Content-Type': 'application/json',
      }
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 }),
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json({ success: false, error: `HTTP ${res.status}: ${err.slice(0, 200)}` })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg })
  }
}
