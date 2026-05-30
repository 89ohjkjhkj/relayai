import { NextRequest, NextResponse } from 'next/server'
import { authenticateKey, checkQuota, findChannel, recordUsage, proxyRequest, proxyStreamRequest } from '@/lib/gateway'

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const startTime = Date.now()
  const path = params.path.join('/')

  // Authenticate
  const authHeader = req.headers.get('Authorization') || ''
  const apiKeyStr = authHeader.replace('Bearer ', '').trim()
  if (!apiKeyStr) {
    return NextResponse.json({ error: { message: 'Missing API key', type: 'auth_error' } }, { status: 401 })
  }

  const apiKey = await authenticateKey(apiKeyStr)
  if (!apiKey) {
    return NextResponse.json({ error: { message: 'Invalid API key', type: 'auth_error' } }, { status: 401 })
  }

  // Check quota
  const quotaCheck = await checkQuota(apiKey)
  if (!quotaCheck.allowed) {
    return NextResponse.json({ error: { message: quotaCheck.reason, type: 'quota_exceeded' } }, { status: 429 })
  }

  // Parse body
  let body
  try {
    body = await req.json() as { model: string; stream?: boolean; messages?: unknown[]; [key: string]: unknown }
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON', type: 'invalid_request' } }, { status: 400 })
  }

  const model = body.model as string
  if (!model) {
    return NextResponse.json({ error: { message: 'Model is required', type: 'invalid_request' } }, { status: 400 })
  }

  // Find channel
  const channel = await findChannel(apiKey.teamId, model)
  if (!channel) {
    return NextResponse.json({ error: { message: `No available channel for model: ${model}`, type: 'no_channel' } }, { status: 404 })
  }

  const isStream = body.stream === true

  try {
    if (isStream) {
      // Streaming response
      const upstreamStream = await proxyStreamRequest(channel, body, path)
      const latency = Date.now() - startTime

      // Create a transform stream to capture usage data
      let promptTokens = 0
      let completionTokens = 0
      const decoder = new TextDecoder()

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk)

          try {
            const text = decoder.decode(chunk, { stream: true })
            const lines = text.split('\n').filter(l => l.startsWith('data: '))
            for (const line of lines) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              const parsed = JSON.parse(data)
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens || 0
                completionTokens = parsed.usage.completion_tokens || 0
              }
            }
          } catch {
            // Ignore parse errors in stream
          }
        },
        async flush() {
          // Record usage after stream ends
          if (promptTokens > 0 || completionTokens > 0) {
            // Estimate tokens if not provided by upstream
            await recordUsage({
              teamId: apiKey.teamId,
              apiKeyId: apiKey.id,
              memberId: apiKey.memberId || undefined,
              model,
              promptTokens,
              completionTokens,
              channelId: channel.id,
              latency,
              status: 200,
            })
          } else {
            // Estimate: rough token approximation
            const messages = body.messages as Array<{ content: string }> | undefined
            const promptEst = messages ? messages.reduce((sum, m) => sum + Math.ceil(m.content?.length / 4 || 0), 0) : 100
            await recordUsage({
              teamId: apiKey.teamId,
              apiKeyId: apiKey.id,
              memberId: apiKey.memberId || undefined,
              model,
              promptTokens: promptEst,
              completionTokens: Math.ceil(promptEst * 0.5),
              channelId: channel.id,
              latency,
              status: 200,
            })
          }
        },
      })

      const transformedStream = upstreamStream.pipeThrough(transformStream)

      return new Response(transformedStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const upstreamResponse = await proxyRequest(channel, body, path)
      const latency = Date.now() - startTime

      if (!upstreamResponse.ok) {
        const errorText = await upstreamResponse.text()

        // Record failed usage
        await recordUsage({
          teamId: apiKey.teamId,
          apiKeyId: apiKey.id,
          memberId: apiKey.memberId || undefined,
          model,
          promptTokens: 0,
          completionTokens: 0,
          channelId: channel.id,
          latency,
          status: upstreamResponse.status,
          errorMessage: errorText.slice(0, 500),
        })

        return new Response(errorText, {
          status: upstreamResponse.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const responseData = await upstreamResponse.json()

      // Extract usage
      const usage = responseData.usage || {}
      const promptTokens = usage.prompt_tokens || 0
      const completionTokens = usage.completion_tokens || 0

      // Record usage
      await recordUsage({
        teamId: apiKey.teamId,
        apiKeyId: apiKey.id,
        memberId: apiKey.memberId || undefined,
        model,
        promptTokens,
        completionTokens,
        channelId: channel.id,
        latency,
        status: 200,
      })

      return NextResponse.json(responseData)
    }
  } catch (error: unknown) {
    const latency = Date.now() - startTime
    const msg = error instanceof Error ? error.message : 'Unknown error'

    await recordUsage({
      teamId: apiKey.teamId,
      apiKeyId: apiKey.id,
      memberId: apiKey.memberId || undefined,
      model,
      promptTokens: 0,
      completionTokens: 0,
      channelId: channel.id,
      latency,
      status: 500,
      errorMessage: msg,
    })

    return NextResponse.json({ error: { message: msg, type: 'upstream_error' } }, { status: 502 })
  }
}

// Support GET for models endpoint
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')

  if (path === 'models') {
    // Return available models based on API key
    const authHeader = req.headers.get('Authorization') || ''
    const apiKeyStr = authHeader.replace('Bearer ', '').trim()
    if (!apiKeyStr) {
      return NextResponse.json({ error: { message: 'Missing API key' } }, { status: 401 })
    }

    const apiKey = await authenticateKey(apiKeyStr)
    if (!apiKey) {
      return NextResponse.json({ error: { message: 'Invalid API key' } }, { status: 401 })
    }

    const channels = await findChannel(apiKey.teamId, '*')
    // Return standard model list
    const models = [
      'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo',
      'claude-3.5-sonnet', 'claude-3.5-haiku', 'claude-3-opus',
      'gemini-1.5-pro', 'gemini-1.5-flash',
      'deepseek-chat', 'deepseek-reasoner',
      'doubao-pro',
    ]

    return NextResponse.json({
      object: 'list',
      data: models.map(id => ({
        id,
        object: 'model',
        created: Math.floor(Date.now() / 1000),
        owned_by: id.split('-')[0],
      })),
    })
  }

  return NextResponse.json({ error: { message: 'Not found' } }, { status: 404 })
}
