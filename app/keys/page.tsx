'use client'

import { useEffect, useState } from 'react'
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react'

interface ApiKeyData {
  id: string; key: string; name: string; allowedModels: string; totalQuota: number;
  usedQuota: number; status: string; expiresAt: string | null; createdAt: string;
  team: { id: string; name: string }
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([])
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', teamId: '', allowedModels: '*', totalQuota: 0, expiresInDays: 0 })

  const fetchData = () => {
    Promise.all([
      fetch('/api/keys').then(r => r.json()),
      fetch('/api/teams').then(r => r.json()),
    ]).then(([k, t]) => {
      setKeys(k || [])
      setTeams((t || []).map((x: { id: string; name: string }) => ({ id: x.id, name: x.name })))
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setNewKey(data.key)
      setShowForm(false)
      setForm({ name: '', teamId: '', allowedModels: '*', totalQuota: 0, expiresInDays: 0 })
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该密钥？此操作不可恢复。')) return
    await fetch(`/api/keys/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const maskKey = (key: string) => key.slice(0, 12) + '...' + key.slice(-4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API 密钥</h1>
          <p className="text-slate-400 text-sm mt-1">管理 API 访问密钥，用于调用中转接口</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 创建密钥
        </button>
      </div>

      {/* New Key Display */}
      {newKey && (
        <div className="card border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">密钥已创建！请立即复制保存</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-dark-400 px-3 py-2 rounded font-mono text-sm text-white">{newKey}</code>
            <button onClick={() => handleCopy(newKey, 'new')} className="btn-secondary text-sm">
              {copied === 'new' ? '已复制' : '复制'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">此密钥仅显示一次，关闭后将无法再次查看完整内容</p>
          <button onClick={() => setNewKey(null)} className="text-xs text-brand-400 hover:text-brand-300 mt-2">我知道了</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">创建新密钥</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">密钥名称</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="如：生产环境" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">所属团队</label>
              <select value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: e.target.value }))} className="input-field" required>
                <option value="">选择团队</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">允许模型（* 表示全部）</label>
              <input value={form.allowedModels} onChange={e => setForm(f => ({ ...f, allowedModels: e.target.value }))} className="input-field" placeholder="gpt-4o,deepseek-chat 或 *" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">额度上限 (USD, 0=不限)</label>
              <input type="number" step="0.01" value={form.totalQuota} onChange={e => setForm(f => ({ ...f, totalQuota: parseFloat(e.target.value) || 0 }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">有效期（天，0=永不过期）</label>
              <input type="number" value={form.expiresInDays} onChange={e => setForm(f => ({ ...f, expiresInDays: parseInt(e.target.value) || 0 }))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">创建密钥</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {/* Keys List */}
      {loading ? (
        <div className="card animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-14 bg-dark-50 rounded" />)}</div>
      ) : keys.length === 0 ? (
        <div className="card text-center py-12">
          <Key className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">暂无密钥</h3>
          <p className="text-slate-400">创建你的第一个 API 密钥</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50">
                <th className="table-header">名称</th>
                <th className="table-header">密钥</th>
                <th className="table-header">团队</th>
                <th className="table-header">模型</th>
                <th className="table-header">额度</th>
                <th className="table-header">状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-b border-dark-50/50 hover:bg-dark-100/30">
                  <td className="table-cell font-medium text-white">{k.name}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{showKeys[k.id] ? k.key : maskKey(k.key)}</code>
                      <button onClick={() => setShowKeys(s => ({ ...s, [k.id]: !s[k.id] }))} className="text-slate-400 hover:text-white">
                        {showKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => handleCopy(k.key, k.id)} className="text-slate-400 hover:text-white">
                        {copied === k.id ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">{k.team.name}</td>
                  <td className="table-cell font-mono text-xs">{k.allowedModels}</td>
                  <td className="table-cell">
                    {k.totalQuota > 0 ? `$${k.usedQuota.toFixed(2)} / $${k.totalQuota}` : `$${k.usedQuota.toFixed(2)}`}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
                      k.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${k.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {k.status === 'active' ? '活跃' : '已撤销'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Usage Example */}
      <div className="card">
        <h3 className="font-semibold text-white mb-3">调用示例</h3>
        <pre className="bg-dark-400 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
{`curl ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-relay-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
        </pre>
      </div>
    </div>
  )
}
