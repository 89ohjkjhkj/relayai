import { prisma } from './db'
import { calculateCost } from './utils'

interface ProxyRequest {
  model: string
  messages?: unknown[]
  prompt?: string
  stream?: boolean
  [key: string]: unknown
}

interface ChannelConfig {
  id: string
  provider: string
  apiKey: string
  baseUrl: string
  models: string[]
  priority: number
  weight: number
}

function matchModel(channelModels: string[], requestedModel: string): boolean {
  return channelModels.some(cm => {
    if (cm === '*') return true
    if (cm === requestedModel) return true
    // Support wildcard like gpt-4*
    if (cm.endsWith('*') && requestedModel.startsWith(cm.slice(0, -1))) return true
    return false
  })
}

export async function findChannel(teamId: string, model: string): Promise<ChannelConfig | null> {
  const channels = await prisma.channel.findMany({
    where: { teamId, status: 'active' },
    orderBy: [{ priority: 'desc' }, { weight: 'desc' }],
  })

  for (const ch of channels) {
    const models = ch.models.split(',').map(m => m.trim())
    if (matchModel(models, model)) {
      return {
        id: ch.id,
        provider: ch.provider,
        apiKey: ch.apiKey,
        baseUrl: ch.baseUrl,
        models,
        priority: ch.priority,
        weight: ch.weight,
      }
    }
  }
  return null
}

export async function authenticateKey(apiKey: string) {
  const key = await prisma.apiKey.findUnique({
    where: { key: apiKey, status: 'active' },
    include: {
      team: { include: { members: true } },
      user: true,
    },
  })
  if (!key) return null

  // Check expiry
  if (key.expiresAt && new Date() > key.expiresAt) return null

  // Check team status
  if (key.team.status !== 'active') return null

  return key
}

export async function checkQuota(apiKey: Awaited<ReturnType<typeof authenticateKey>>): Promise<{ allowed: boolean; reason?: string }> {
  if (!apiKey) return { allowed: false, reason: 'Invalid API key' }

  // Check key quota
  if (apiKey.totalQuota > 0 && apiKey.usedQuota >= apiKey.totalQuota) {
    return { allowed: false, reason: 'API key quota exceeded' }
  }

  // Check team quota
  if (apiKey.team.monthlyQuota > 0 && apiKey.team.usedQuota >= apiKey.team.monthlyQuota) {
    return { allowed: false, reason: 'Team monthly quota exceeded' }
  }

  // Check member quota
  if (apiKey.memberId) {
    const member = apiKey.team.members.find(m => m.id === apiKey.memberId)
    if (member && member.monthlyQuota > 0 && member.usedQuota >= member.monthlyQuota) {
      return { allowed: false, reason: 'Member quota exceeded' }
    }
  }

  return { allowed: true }
}

export async function recordUsage(params: {
  teamId: string
  apiKeyId: string
  memberId?: string
  model: string
  promptTokens: number
  completionTokens: number
  channelId?: string
  latency: number
  status: number
  errorMessage?: string
}) {
  const cost = calculateCost(params.model, params.promptTokens, params.completionTokens)
  const totalTokens = params.promptTokens + params.completionTokens

  await prisma.$transaction([
    prisma.usageLog.create({
      data: {
        teamId: params.teamId,
        apiKeyId: params.apiKeyId,
        memberId: params.memberId,
        model: params.model,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens,
        cost,
        latency: params.latency,
        channelId: params.channelId,
        status: params.status,
        errorMessage: params.errorMessage,
      },
    }),
    prisma.apiKey.update({
      where: { id: params.apiKeyId },
      data: { usedQuota: { increment: cost } },
    }),
    prisma.team.update({
      where: { id: params.teamId },
      data: { usedQuota: { increment: cost } },
    }),
  ])

  return cost
}

function buildUpstreamUrl(baseUrl: string, provider: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '')
  if (provider === 'anthropic') {
    return `${base}/v1/${path}`
  }
  return `${base}/v1/${path}`
}

function buildUpstreamHeaders(provider: string, apiKey: string): Record<string, string> {
  if (provider === 'anthropic') {
    return {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    }
  }
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

function transformRequestBody(provider: string, body: ProxyRequest): unknown {
  if (provider === 'anthropic') {
    return {
      model: body.model,
      messages: body.messages,
      stream: body.stream,
      max_tokens: body.max_tokens || 4096,
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.top_p !== undefined && { top_p: body.top_p }),
    }
  }
  return body
}

export async function proxyRequest(
  channel: ChannelConfig,
  body: ProxyRequest,
  path: string
): Promise<Response> {
  const url = buildUpstreamUrl(channel.baseUrl, channel.provider, path)
  const headers = buildUpstreamHeaders(channel.provider, channel.apiKey)
  const transformedBody = transformRequestBody(channel.provider, body)

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(transformedBody),
  })

  return response
}

export async function proxyStreamRequest(
  channel: ChannelConfig,
  body: ProxyRequest,
  path: string
): Promise<ReadableStream> {
  const url = buildUpstreamUrl(channel.baseUrl, channel.provider, path)
  const headers = buildUpstreamHeaders(channel.provider, channel.apiKey)
  const transformedBody = transformRequestBody(channel.provider, body)

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(transformedBody),
  })

  if (!response.ok || !response.body) {
    throw new Error(`Upstream error: ${response.status} ${response.statusText}`)
  }

  return response.body
}
