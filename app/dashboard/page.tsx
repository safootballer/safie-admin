'use client'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p>

  return (
    <div className="fade-up">
      <div className="page-title">📊 Dashboard</div>

      {/* Top metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users',      value: data?.totalUsers,      icon: '👥' },
          { label: 'Total Matches',    value: data?.totalMatches,    icon: '🏈' },
          { label: 'Matches (7 Days)', value: data?.recentMatches,   icon: '📅' },
          { label: 'Generations',      value: data?.totalGenerations, icon: '✨' },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{m.icon}</div>
            <div className="metric-value">{m.value ?? 0}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Cost metrics */}
      <div className="page-title" style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>💰 Generation Costs</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'This Month',     value: `$${(data?.monthCost ?? 0).toFixed(4)}` },
          { label: 'All Time',       value: `$${(data?.totalCost ?? 0).toFixed(4)}` },
          { label: 'Avg Cost',       value: `$${(data?.avgCost ?? 0).toFixed(6)}` },
          { label: 'Monthly Gens',   value: data?.monthGenerations ?? 0 },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-value" style={{ fontSize: '1.5rem' }}>{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Recent generations table */}
      <div className="page-title" style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>🕒 Recent Generations</div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>User</th><th>Content Type</th>
              <th>Prompt</th><th>Completion</th><th>Total</th><th>Cost</th><th>Model</th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentGens ?? []).map((g: any, i: number) => (
              <tr key={i}>
                <td>{g.date?.slice(0, 16) ?? '—'}</td>
                <td>{g.user}</td>
                <td>{g.contentType}</td>
                <td>{g.promptTokens}</td>
                <td>{g.completionTokens}</td>
                <td>{g.totalTokens}</td>
                <td style={{ color: '#e6fe00', fontWeight: 600 }}>${(g.costUsd ?? 0).toFixed(6)}</td>
                <td><span className="badge-blue">{g.model}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.recentGens?.length) && (
          <p style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No generation history yet</p>
        )}
      </div>
    </div>
  )
}
