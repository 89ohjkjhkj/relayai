'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Settings, Crown, Shield, UserCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface TeamData {
  id: string; name: string; plan: string; monthlyQuota: number; usedQuota: number;
  balance: number; status: string; _count: { members: number; apiKeys: number }
}

const PLAN_LABELS: Record<string, string> = {
  free: '免费版', starter: '入门版', team: '团队版', business: '商业版',
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', plan: 'free', monthlyQuota: 0 })

  const fetchTeams = () => {
    fetch('/api/teams').then(r => r.json()).then(d => { setTeams(d || []); setLoading(false) })
  }

  useEffect(() => { fetchTeams() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm({ name: '', plan: 'free', monthlyQuota: 0 })
      fetchTeams()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该团队？所有关联的密钥和数据将被清除。')) return
    await fetch(`/api/teams/${id}`, { method: 'DELETE' })
    fetchTeams()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">团队管理</h1>
          <p className="text-slate-400 text-sm mt-1">管理团队、成员配额和权限</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 创建团队
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">新团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">团队名称</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="如：产品研发组" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">套餐</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="input-field">
                <option value="free">免费版</option>
                <option value="starter">入门版 ¥99/月</option>
                <option value="team">团队版 ¥499/月</option>
                <option value="business">商业版 ¥1,999/月</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">月度额度 (USD, 0=不限)</label>
              <input type="number" step="0.01" value={form.monthlyQuota} onChange={e => setForm(f => ({ ...f, monthlyQuota: parseFloat(e.target.value) || 0 }))} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">创建</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">取消</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card animate-pulse space-y-3">{[1, 2].map(i => <div key={i} className="h-20 bg-dark-50 rounded" />)}</div>
      ) : teams.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">暂无团队</h3>
          <p className="text-slate-400">创建你的第一个团队</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="card hover:border-brand-500/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white text-lg">{team.name}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-brand-500/10 text-brand-400 mt-1">
                    {PLAN_LABELS[team.plan] || team.plan}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/teams/${team.id}`} className="p-2 rounded-lg hover:bg-dark-100 text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(team.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{team._count.members}</div>
                  <div className="text-xs text-slate-400">成员</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{team._count.apiKeys}</div>
                  <div className="text-xs text-slate-400">密钥</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {team.monthlyQuota > 0 ? `${((team.usedQuota / team.monthlyQuota) * 100).toFixed(0)}%` : '∞'}
                  </div>
                  <div className="text-xs text-slate-400">额度使用</div>
                </div>
              </div>
              {team.monthlyQuota > 0 && (
                <div className="mt-3 bg-dark-400 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((team.usedQuota / team.monthlyQuota) * 100, 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
