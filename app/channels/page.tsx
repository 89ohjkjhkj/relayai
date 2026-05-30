'use client'

import { useEffect, useState } from 'react'
import { Radio, Plus, Trash2, RefreshCw, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

interface Channel {
  id: string; name: string; provider: string; baseUrl: string; models: string;
  priority: number; status: string; createdAt: string; testResult?: string;
  _count?: { apiKey: number }
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI', baseUrl: 'https://api.openai.com' },
  { value: 'anthropic', label: 'Anthropic', baseUrl: 'https://api.anthropic.com' },
  { value: 'google', label: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com' },
  { value: 'deepseek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com' },
  { value: 'doubao', label: '豆包', baseUrl: 'https://ark.cn-beijing.volces.com/api' },
  { value: 'azure', label: 'Azure OpenAI', baseUrl: '' },
  { value: 'custom', label: '自定义', baseUrl: '' },
]

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [form, setForm] = useState({
    name: '', provider: 'openai', apiKey: '', baseUrl: 'https://api.openai.com', models: '', priority: 1,
  })

  const fetchChannels = () => {
    fetch('/api/channels').then(r => r.json()).then(d => { setChannels(d || []); setLoading(false) })
  }

  useEffect(() => { fetchChannels() }, [])

  const handleProviderChange = (provider: string) => {
    const p = PROVIDERS.find(x => x.value === provider)
    setForm(f => ({ ...f, provider, baseUrl: p?.baseUrl || f.baseUrl }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', provider: 'openai', apiKey: '', baseUrl: 'https://api.openai.com', models: '', priority: 1 })
      fetchChannels()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该渠道？')) return
    await fetch(`/api/channels/${id}`, { method: 'DELETE' })
    fetchChannels()
  }

  const handleTest = async (id: string) => {
    const res = await fetch(`/api/channels/${id}/test`, { method: 'POST' })
    const data = await res.json()
    setChannels(chs => chs.map(c => c.id === id ? { ...c, testResult: data.success ? 'ok' : data.error } : c))
  }

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(s => ({ ...s, [id]: !s[id] }))
  }

  const maskKey = (key: string) => key.slice(0, 8) + '...' + key.slice(-4)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">渠道管理</h1>
          <p className="text-slate-400 text-sm mt-1">配置上游 AI 服务商的 API 渠道</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 添加渠道
        </button>
      </div>

      {/* Add Channel Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">新渠道</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">渠道名称</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="如：OpenAI 主渠道" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">服务商</label>
              <select value={form.provider} onChange={e => handleProviderChange(e.target.value)} className="input-field">
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1.5">API Key</label>
              <input value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} className="input-field font-mono" placeholder="sk-..." required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Base URL</label>
              <input value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))} className="input-field font-mono" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">优先级</label>
              <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 1 }))} className="input-field" min={1} max={100} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-300 mb-1.5">支持的模型（逗号分隔，* 表示全部）</label>
              <input value={form.models} onChange={e => setForm(f => ({ ...f, models: e.target.value }))} className="input-field" placeholder="gpt-4o,gpt-4o-mini,claude-3.5-sonnet 或 *" required />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">创建渠道</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {/* Channel List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card animate-pulse space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-dark-50 rounded" />)}
          </div>
        ) : channels.length === 0 ? (
          <div className="card text-center py-12">
            <Radio className="w-12 h-12 text-brand-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">暂无渠道</h3>
            <p className="text-slate-400">添加你的第一个 AI 服务渠道</p>
          </div>
        ) : (
          channels.map(ch => (
            <div key={ch.id} className="card flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full ${ch.status === 'active' ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{ch.name}</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-brand-500/10 text-brand-400">{ch.provider}</span>
                  <span className="px-2 py-0.5 text-xs rounded bg-dark-50 text-slate-400">优先级 {ch.priority}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1 flex items-center gap-3">
                  <span className="font-mono text-xs">{ch.baseUrl}</span>
                  <span className="text-slate-500">|</span>
                  <span className="truncate max-w-xs">{ch.models}</span>
                </div>
                {ch.testResult && (
                  <div className={`text-xs mt-1 flex items-center gap-1 ${ch.testResult === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ch.testResult === 'ok' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {ch.testResult === 'ok' ? '连通正常' : ch.testResult}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleTest(ch.id)} className="p-2 rounded-lg hover:bg-dark-100 text-slate-400 hover:text-white transition-colors" title="测试连通">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={() => toggleKeyVisibility(ch.id)} className="p-2 rounded-lg hover:bg-dark-100 text-slate-400 hover:text-white transition-colors" title="显示/隐藏 Key">
                  {showKeys[ch.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(ch.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" title="删除">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
