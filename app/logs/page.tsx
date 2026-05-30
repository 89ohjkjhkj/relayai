'use client'

import { useEffect, useState } from 'react'
import { ScrollText, Search, Download } from 'lucide-react'
import { formatCost, formatNumber } from '@/lib/utils'

interface LogEntry {
  id: string; model: string; promptTokens: number; completionTokens: number;
  totalTokens: number; cost: number; latency: number; status: number;
  errorMessage: string | null; createdAt: string;
  apiKey: { name: string; key: string }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ model: '', status: '', page: 1 })

  const fetchLogs = () => {
    const params = new URLSearchParams({ page: String(filter.page) })
    if (filter.model) params.set('model', filter.model)
    if (filter.status) params.set('status', filter.status)
    fetch(`/api/logs?${params}`).then(r => r.json()).then(d => { setLogs(d || []); setLoading(false) })
  }

  useEffect(() => { fetchLogs() }, [filter])

  const handleExport = () => {
    const csv = [
      ['时间', '模型', '输入Token', '输出Token', '总Token', '费用', '延迟(ms)', '状态'].join(','),
      ...logs.map(l => [
        new Date(l.createdAt).toISOString(), l.model, l.promptTokens, l.completionTokens,
        l.totalTokens, l.cost.toFixed(6), l.latency, l.status
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `usage-logs-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">使用日志</h1>
          <p className="text-slate-400 text-sm mt-1">查看所有 API 调用记录</p>
        </div>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" /> 导出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={filter.model}
            onChange={e => setFilter(f => ({ ...f, model: e.target.value, page: 1 }))}
            className="input-field pl-10"
            placeholder="按模型筛选"
          />
        </div>
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value, page: 1 }))}
          className="input-field w-32"
        >
          <option value="">全部状态</option>
          <option value="200">成功</option>
          <option value="error">失败</option>
        </select>
      </div>

      {loading ? (
        <div className="card animate-pulse h-64" />
      ) : logs.length === 0 ? (
        <div className="card text-center py-12">
          <ScrollText className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">暂无日志</h3>
          <p className="text-slate-400">API 调用后将在此显示</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50">
                <th className="table-header">时间</th>
                <th className="table-header">密钥</th>
                <th className="table-header">模型</th>
                <th className="table-header">输入</th>
                <th className="table-header">输出</th>
                <th className="table-header">费用</th>
                <th className="table-header">延迟</th>
                <th className="table-header">状态</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-dark-50/50 hover:bg-dark-100/30">
                  <td className="table-cell text-slate-500 text-xs whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="table-cell text-xs">{log.apiKey.name}</td>
                  <td className="table-cell font-mono text-xs">{log.model}</td>
                  <td className="table-cell">{formatNumber(log.promptTokens)}</td>
                  <td className="table-cell">{formatNumber(log.completionTokens)}</td>
                  <td className="table-cell">{formatCost(log.cost)}</td>
                  <td className="table-cell">{log.latency}ms</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded ${
                      log.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setFilter(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
              disabled={filter.page === 1}
              className="btn-secondary text-sm disabled:opacity-30"
            >上一页</button>
            <span className="flex items-center text-sm text-slate-400 px-3">第 {filter.page} 页</span>
            <button
              onClick={() => setFilter(f => ({ ...f, page: f.page + 1 }))}
              disabled={logs.length < 20}
              className="btn-secondary text-sm disabled:opacity-30"
            >下一页</button>
          </div>
        </div>
      )}
    </div>
  )
}
