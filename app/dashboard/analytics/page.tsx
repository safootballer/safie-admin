'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function AnalyticsPage() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading analytics...</p>

  const chartStyle = { background: 'transparent', fontFamily: 'Barlow, sans-serif', fontSize: 11 }
  const tooltipStyle = { background: '#0b1520', border: '1px solid rgba(44,163,238,0.3)', borderRadius: 8, color: '#fff', fontSize: 12 }

  return (
    <div className="fade-up">
      <div className="page-title">📈 Analytics & Insights</div>

      {/* Daily cost + generations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Daily Cost ($)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.dailyCosts ?? []} style={chartStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,163,238,0.1)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="cost" stroke="#2ca3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Daily Generations
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.dailyCosts ?? []} style={chartStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,163,238,0.1)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#e6fe00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By content type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Cost by Content Type
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.byContentType ?? []} style={chartStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,163,238,0.1)" />
              <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cost" fill="#2ca3ee" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Content Type Breakdown
            </p>
          </div>
          <table>
            <thead><tr><th>Type</th><th>Gens</th><th>Total Cost</th></tr></thead>
            <tbody>
              {(data?.byContentType ?? []).map((r: any) => (
                <tr key={r.type}>
                  <td>{r.type}</td>
                  <td>{r.count}</td>
                  <td style={{ color: '#e6fe00' }}>${r.cost.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By user */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cost by User
            </p>
          </div>
          <table>
            <thead><tr><th>User</th><th>Gens</th><th>Total Cost</th><th>Avg Cost</th></tr></thead>
            <tbody>
              {(data?.byUser ?? []).map((r: any) => (
                <tr key={r.user}>
                  <td>{r.user}</td>
                  <td>{r.count}</td>
                  <td style={{ color: '#e6fe00' }}>${r.cost.toFixed(6)}</td>
                  <td>${(r.cost / Math.max(r.count, 1)).toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Matches by Competition
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.byCompetition ?? []} style={chartStyle} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,163,238,0.1)" />
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
              <YAxis dataKey="competition" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#e6fe00" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matches over time */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Matches Created Over Time
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data?.matchesByDay ?? []} style={chartStyle}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,163,238,0.1)" />
            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#2ca3ee" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
