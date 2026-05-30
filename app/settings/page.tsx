'use client'

import { useEffect, useState } from 'react'
import { Settings, Save, Plus, Trash2, Copy, CheckCircle } from 'lucide-react'
import { generateRedeemCode } from '@/lib/utils'

interface SettingData {
  appName: string
  appUrl: string
  defaultQuota: string
  registerEnabled: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingData>({
    appName: 'RelayAI', appUrl: '', defaultQuota: '1', registerEnabled: 'true',
  })
  const [redeemCodes, setRedeemCodes] = useState<{ id: string; code: string; value: number; status: string; expiresAt: string | null }[]>([])
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [newCode, setNewCode] = useState({ value: 10, expiresInDays: 90, count: 1 })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.settings) setSettings(prev => ({ ...prev, ...d.settings }))
      if (d.codes) setRedeemCodes(d.codes)
    })
  }, [])

  const handleSave = async () => {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleGenerateCodes = async () => {
    const res = await fetch('/api/settings/redeem-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCode),
    })
    const data = await res.json()
    if (res.ok) {
      setRedeemCodes(prev => [...(data.codes || []), ...prev])
    }
  }

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">系统设置</h1>

      {/* General Settings */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">基本设置</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">应用名称</label>
            <input value={settings.appName} onChange={e => setSettings(s => ({ ...s, appName: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">应用地址</label>
            <input value={settings.appUrl} onChange={e => setSettings(s => ({ ...s, appUrl: e.target.value }))} className="input-field" placeholder="https://your-domain.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">新用户默认额度 (USD)</label>
            <input value={settings.defaultQuota} onChange={e => setSettings(s => ({ ...s, defaultQuota: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">开放注册</label>
            <select value={settings.registerEnabled} onChange={e => setSettings(s => ({ ...s, registerEnabled: e.target.value }))} className="input-field">
              <option value="true">开启</option>
              <option value="false">关闭（仅邀请）</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? '已保存' : '保存设置'}
        </button>
      </div>

      {/* Redeem Codes */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">兑换码管理</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">面值 (USD)</label>
            <input type="number" step="0.01" value={newCode.value} onChange={e => setNewCode(c => ({ ...c, value: parseFloat(e.target.value) || 10 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">有效期（天）</label>
            <input type="number" value={newCode.expiresInDays} onChange={e => setNewCode(c => ({ ...c, expiresInDays: parseInt(e.target.value) || 90 }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">生成数量</label>
            <input type="number" value={newCode.count} onChange={e => setNewCode(c => ({ ...c, count: parseInt(e.target.value) || 1 }))} className="input-field" min={1} max={100} />
          </div>
        </div>
        <button onClick={handleGenerateCodes} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> 生成兑换码
        </button>

        {redeemCodes.length > 0 && (
          <div className="space-y-2 mt-4">
            {redeemCodes.map(code => (
              <div key={code.id} className="flex items-center gap-3 p-3 bg-dark-400 rounded-lg">
                <code className="font-mono text-sm flex-1">{code.code}</code>
                <span className="text-sm text-emerald-400">${code.value}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${code.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                  {code.status === 'active' ? '有效' : '已使用'}
                </span>
                <button onClick={() => handleCopy(code.code, code.id)} className="p-1.5 rounded hover:bg-dark-100 text-slate-400 hover:text-white">
                  {copied === code.id ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
