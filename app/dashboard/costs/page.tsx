'use client'
import { useState, useEffect } from 'react'

export default function CostsPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 8) + '01')
  const [endDate, setEndDate]     = useState(new Date().toISOString().slice(0, 10))
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/costs').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  async function exportCsv() {
    setExporting(true)
    const res = await fetch(`/api/costs?export=true&start=${startDate}&end=${endDate}`)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `costs_${startDate}_${endDate}.csv`; a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const labelStyle = { display: 'block' as const, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.35rem' }

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>

  return (
    <div className="fade-up">
      <div className="page-title">💰 Cost Management</div>

      {/* Monthly breakdown */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.875rem' }}>
        Monthly Breakdown
      </p>
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <table>
          <thead>
            <tr><th>Month</th><th>Generations</th><th>Total Cost</th><th>Avg Cost</th><th>Prompt Tokens</th><th>Completion</th><th>Total Tokens</th></tr>
          </thead>
          <tbody>
            {(data?.monthly ?? []).map((m: any) => (
              <tr key={m.month}>
                <td style={{ fontWeight: 600 }}>{m.month}</td>
                <td>{m.count}</td>
                <td style={{ color: '#e6fe00', fontWeight: 600 }}>${m.cost.toFixed(4)}</td>
                <td>${(m.cost / Math.max(m.count, 1)).toFixed(6)}</td>
                <td>{m.promptTokens?.toLocaleString()}</td>
                <td>{m.completionTokens?.toLocaleString()}</td>
                <td>{m.totalTokens?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.monthly?.length && <p style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No cost data yet</p>}
      </div>

      {/* Model usage */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.875rem' }}>
        Model Usage
      </p>
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '2rem' }}>
        <table>
          <thead><tr><th>Model</th><th>Generations</th><th>Total Cost</th><th>Avg Cost</th><th>Total Tokens</th></tr></thead>
          <tbody>
            {(data?.byModel ?? []).map((m: any) => (
              <tr key={m.model}>
                <td><span className="badge-blue">{m.model}</span></td>
                <td>{m.count}</td>
                <td style={{ color: '#e6fe00', fontWeight: 600 }}>${m.cost.toFixed(6)}</td>
                <td>${(m.cost / Math.max(m.count, 1)).toFixed(6)}</td>
                <td>{m.tokens?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.byModel?.length && <p style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No model data yet</p>}
      </div>

      {/* Export */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.875rem' }}>
        Export CSV
      </p>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
          </div>
          <button onClick={exportCsv} disabled={exporting} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {exporting ? 'Exporting...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}
