'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Crown, Shield, UserCircle, Plus, Trash2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string; role: string; monthlyQuota: number; usedQuota: number;
  allowedModels: string; maxKeys: number; status: string;
  user: { id: string; name: string; email: string }
}

interface TeamDetail {
  id: string; name: string; plan: string; monthlyQuota: number; usedQuota: number;
  balance: number; members: Member[]
}

const ROLE_ICONS: Record<string, typeof Crown> = { owner: Crown, admin: Shield, member: UserCircle }
const ROLE_COLORS: Record<string, string> = { owner: 'text-amber-400', admin: 'text-blue-400', member: 'text-slate-400' }
const ROLE_LABELS: Record<string, string> = { owner: '所有者', admin: '管理员', member: '成员' }

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string
  const [team, setTeam] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [editMember, setEditMember] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ monthlyQuota: 0, allowedModels: '*', maxKeys: 5, role: 'member' })

  const fetchTeam = () => {
    fetch(`/api/teams/${teamId}`).then(r => r.json()).then(d => { setTeam(d); setLoading(false) })
  }

  useEffect(() => { fetchTeam() }, [teamId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: 'member', monthlyQuota: 0, allowedModels: '*', maxKeys: 5 }),
    })
    if (res.ok) { setShowInvite(false); setInviteEmail(''); fetchTeam() }
  }

  const handleUpdateMember = async (memberId: string) => {
    await fetch(`/api/teams/${teamId}/members`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, ...editForm }),
    })
    setEditMember(null)
    fetchTeam()
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('确定移除该成员？')) return
    await fetch(`/api/teams/${teamId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    fetchTeam()
  }

  if (loading) return <div className="card animate-pulse h-64" />
  if (!team) return <div className="card text-center py-12 text-slate-400">团队不存在</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teams" className="p-2 rounded-lg hover:bg-dark-100 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-slate-400 text-sm">管理团队成员和配额</p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-slate-400">套餐</div>
          <div className="text-lg font-bold text-white mt-1">{team.plan}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">月度额度</div>
          <div className="text-lg font-bold text-white mt-1">${team.monthlyQuota || '∞'}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">已用额度</div>
          <div className="text-lg font-bold text-white mt-1">${team.usedQuota.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">余额</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">${team.balance.toFixed(2)}</div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">成员列表</h2>
          <button onClick={() => setShowInvite(!showInvite)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> 邀请成员
          </button>
        </div>

        {showInvite && (
          <form onSubmit={handleInvite} className="mb-4 p-4 bg-dark-400 rounded-lg flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-slate-300 mb-1.5">邮箱地址</label>
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="input-field" placeholder="member@team.com" type="email" required />
            </div>
            <button type="submit" className="btn-primary">发送邀请</button>
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary">取消</button>
          </form>
        )}

        <div className="space-y-2">
          {team.members.map(m => {
            const Icon = ROLE_ICONS[m.role] || UserCircle
            const isEditing = editMember === m.id

            return (
              <div key={m.id} className="flex items-center gap-4 p-3 bg-dark-400 rounded-lg">
                <Icon className={`w-5 h-5 ${ROLE_COLORS[m.role]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{m.user.name}</span>
                    <span className="text-xs text-slate-500">{m.user.email}</span>
                    <span className={`px-1.5 py-0.5 text-xs rounded bg-dark-100 ${ROLE_COLORS[m.role]}`}>
                      {ROLE_LABELS[m.role]}
                    </span>
                  </div>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-slate-400">月度配额(USD)</label>
                        <input type="number" step="0.01" value={editForm.monthlyQuota} onChange={e => setEditForm(f => ({ ...f, monthlyQuota: parseFloat(e.target.value) || 0 }))} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">允许模型</label>
                        <input value={editForm.allowedModels} onChange={e => setEditForm(f => ({ ...f, allowedModels: e.target.value }))} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">最大 Key 数</label>
                        <input type="number" value={editForm.maxKeys} onChange={e => setEditForm(f => ({ ...f, maxKeys: parseInt(e.target.value) || 1 }))} className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400">角色</label>
                        <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} className="input-field text-sm">
                          <option value="admin">管理员</option>
                          <option value="member">成员</option>
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-4 flex gap-2">
                        <button onClick={() => handleUpdateMember(m.id)} className="btn-primary text-sm flex items-center gap-1"><Save className="w-3 h-3" /> 保存</button>
                        <button onClick={() => setEditMember(null)} className="btn-secondary text-sm">取消</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span>配额: ${m.monthlyQuota || '∞'}</span>
                      <span>已用: ${m.usedQuota.toFixed(2)}</span>
                      <span>模型: {m.allowedModels}</span>
                      <span>Key上限: {m.maxKeys}</span>
                    </div>
                  )}
                </div>
                {!isEditing && m.role !== 'owner' && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditMember(m.id); setEditForm({ monthlyQuota: m.monthlyQuota, allowedModels: m.allowedModels, maxKeys: m.maxKeys, role: m.role }) }} className="p-2 rounded hover:bg-dark-100 text-slate-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRemoveMember(m.id)} className="p-2 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Settings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )
}
