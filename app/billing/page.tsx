'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Plus, Gift, ArrowUpRight } from 'lucide-react'
import { formatCost } from '@/lib/utils'

interface TeamBilling {
  id: string; name: string; plan: string; monthlyQuota: number; usedQuota: number; balance: number;
}

interface Invoice {
  id: string; amount: number; currency: string; type: string; status: string; period: string | null; createdAt: string;
}

export default function BillingPage() {
  const [teams, setTeams] = useState<TeamBilling[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showTopup, setShowTopup] = useState(false)
  const [topupTeam, setTopupTeam] = useState('')
  const [topupAmount, setTopupAmount] = useState('')
  const [redeemCode, setRedeemCode] = useState('')

  const fetchData = () => {
    Promise.all([
      fetch('/api/teams').then(r => r.json()),
      fetch('/api/billing').then(r => r.json()),
    ]).then(([t, b]) => {
      setTeams((t || []).map((x: TeamBilling) => x))
      setInvoices(b?.invoices || [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchData() }, [])

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: topupTeam, amount: parseFloat(topupAmount), type: 'topup' }),
    })
    if (res.ok) { setShowTopup(false); setTopupAmount(''); fetchData() }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/billing/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: redeemCode }),
    })
    const data = await res.json()
    if (res.ok) { setRedeemCode(''); alert(`兑换成功！充值 $${data.value}`); fetchData() }
    else { alert(data.error || '兑换失败') }
  }

  const PLAN_LABELS: Record<string, string> = { free: '免费版', starter: '入门版', team: '团队版', business: '商业版' }

  if (loading) return <div className="card animate-pulse h-64" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">账单中心</h1>
          <p className="text-slate-400 text-sm mt-1">管理充值、订阅和兑换码</p>
        </div>
      </div>

      {/* Team Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{team.name}</h3>
              <span className="px-2 py-0.5 text-xs rounded bg-brand-500/10 text-brand-400">{PLAN_LABELS[team.plan] || team.plan}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400">余额</div>
                <div className="text-xl font-bold text-emerald-400">{formatCost(team.balance)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">本月消费</div>
                <div className="text-xl font-bold text-white">{formatCost(team.usedQuota)}</div>
              </div>
            </div>
            {team.monthlyQuota > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>额度使用</span>
                  <span>{formatCost(team.usedQuota)} / {formatCost(team.monthlyQuota)}</span>
                </div>
                <div className="bg-dark-400 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${Math.min((team.usedQuota / team.monthlyQuota) * 100, 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topup */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">充值</h3>
          </div>
          <form onSubmit={handleTopup} className="space-y-3">
            <select value={topupTeam} onChange={e => setTopupTeam(e.target.value)} className="input-field" required>
              <option value="">选择团队</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="number" step="0.01" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} className="input-field" placeholder="充值金额 (USD)" required />
            <button type="submit" className="btn-primary w-full">充值</button>
          </form>
        </div>

        {/* Redeem Code */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">兑换码</h3>
          </div>
          <form onSubmit={handleRedeem} className="space-y-3">
            <input value={redeemCode} onChange={e => setRedeemCode(e.target.value)} className="input-field font-mono" placeholder="XXXX-XXXX-XXXX-XXXX" required />
            <button type="submit" className="btn-primary w-full">兑换</button>
          </form>
        </div>
      </div>

      {/* Invoices */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">交易记录</h3>
        {invoices.length === 0 ? (
          <p className="text-slate-400 text-center py-8">暂无交易记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-50">
                  <th className="table-header">时间</th>
                  <th className="table-header">类型</th>
                  <th className="table-header">金额</th>
                  <th className="table-header">状态</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-dark-50/50">
                    <td className="table-cell text-xs">
                      {new Date(inv.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-0.5 text-xs rounded bg-dark-50 text-slate-300">
                        {inv.type === 'topup' ? '充值' : inv.type === 'subscription' ? '订阅' : '消费'}
                      </span>
                    </td>
                    <td className="table-cell font-medium">{formatCost(inv.amount)}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        inv.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {inv.status === 'paid' ? '已完成' : inv.status === 'pending' ? '待处理' : '失败'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
