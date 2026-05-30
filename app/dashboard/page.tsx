'use client'

import { useEffect, useState } from 'react'
import {
  Activity, DollarSign, Key, Zap,
  TrendingUp
} from 'lucide-react'
import { formatCost, formatNumber } from '@/lib/utils'

interface DashboardData {
  totalRequests: number
  totalTokens: number
  monthlyCost: number
  activeKeys: number
  todayRequests: number
  todayCost: number
  modelBreakdown: { model: string; requests: number; cost: number }[]
  recentLogs: {
    id: string; model: string; totalTokens: number; cost: number; status: number; createdAt: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">仪表盘</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-dark-50 rounded w-24 mb-3" />
              <div className="h-8 bg-dark-50 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">仪表盘</h1>
        <div className="card text-center py-12">
          <Zap className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">欢迎使用 RelayAI</h3>
          <p className="text-slate-400">开始创建渠道和 API 密钥来使用服务</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: '本月请求',
      value: formatNumber(data.totalRequests),
      change: data.todayRequests > 0 ? `今日 +${formatNumber(data.todayRequests)}` : '',
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Token 消耗',
      value: formatNumber(data.totalTokens),
      change: '',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: '本月费用',
      value: formatCost(data.monthlyCost),
      change: data.todayCost > 0 ? `今日 +${formatCost(data.todayCost)}` : '',
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: '活跃密钥',
      value: data.activeKeys.toString(),
      change: '',
      icon: Key,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">仪表盘</h1>
        <span className="text-sm text-slate-400">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card hover:border-dark-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            {stat.change && (
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Model Breakdown */}
      {data.modelBreakdown.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">模型使用分布</h2>
          <div className="space-y-3">
            {data.modelBreakdown.map(m => {
              const maxReq = Math.max(...data.modelBreakdown.map(x => x.requests), 1)
              const pct = (m.requests / maxReq) * 100
              return (
                <div key={m.model} className="flex items-center gap-4">
                  <span className="text-sm text-slate-300 w-40 truncate">{m.model}</span>
                  <div className="flex-1 bg-dark-400 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-20 text-right">{formatNumber(m.requests)} 次</span>
                  <span className="text-sm text-slate-400 w-24 text-right">{formatCost(m.cost)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Logs */}
      {data.recentLogs.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">最近调用</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-50">
                  <th className="table-header">模型</th>
                  <th className="table-header">Token</th>
                  <th className="table-header">费用</th>
                  <th className="table-header">状态</th>
                  <th className="table-header">时间</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map(log => (
                  <tr key={log.id} className="border-b border-dark-50/50 hover:bg-dark-100/30">
                    <td className="table-cell font-mono text-xs">{log.model}</td>
                    <td className="table-cell">{formatNumber(log.totalTokens)}</td>
                    <td className="table-cell">{formatCost(log.cost)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="table-cell text-slate-500">
                      {new Date(log.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
