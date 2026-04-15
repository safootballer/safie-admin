'use client'
import { useState, useEffect } from 'react'

export default function MatchesPage() {
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function load(p = 1) {
    setLoading(true)
    const res = await fetch(`/api/matches?page=${p}`).then(r => r.json())
    setData(res); setLoading(false)
  }

  useEffect(() => { load(page) }, [page])

  async function deleteMatch(id: number) {
    if (!confirm('Delete this match?')) return
    await fetch('/api/matches', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load(page)
  }

  return (
    <div className="fade-up">
      <div className="page-title">🏈 Match Management</div>

      <div className="alert-info" style={{ marginBottom: '1.5rem' }}>
        Total matches in database: <strong>{data?.total ?? '...'}</strong>
      </div>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p> : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {(data?.matches ?? []).map((m: any) => (
              <div key={m.id} className="glass-card" style={{ overflow: 'hidden' }}>
                <div
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  style={{ padding: '0.875rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: expanded === m.id ? 'rgba(44,163,238,0.06)' : 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1rem' }}>🏈</span>
                    <div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem' }}>
                        {m.home_team} vs {m.away_team}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                        {m.date?.slice(0, 10)} · {m.competition}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#e6fe00' }}>
                        {m.home_final_score} – {m.away_final_score}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{m.margin} pt margin</div>
                    </div>
                    <span style={{ color: '#2ca3ee', fontSize: '0.75rem', transform: expanded === m.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                  </div>
                </div>

                {expanded === m.id && (
                  <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(44,163,238,0.15)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Match Details</p>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>📍 {m.venue}</p>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>🏆 {m.competition}</p>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>📏 Margin: {m.margin} pts</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Goal Scorers</p>
                      {m.goal_scorers && (() => {
                        try {
                          const s = JSON.parse(m.goal_scorers)
                          return Object.entries(s).map(([team, scorers]: any) => (
                            <div key={team} style={{ marginBottom: '0.5rem' }}>
                              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2ca3ee' }}>{team}</p>
                              {(scorers ?? []).map((sc: string) => <p key={sc} style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginLeft: '0.5rem' }}>• {sc}</p>)}
                            </div>
                          ))
                        } catch { return null }
                      })()}
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => deleteMatch(m.id)} className="btn-danger">Delete Match</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.pages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={p === page ? 'btn-primary' : 'btn-yellow'} style={{ padding: '0.5rem 1rem', minWidth: 40 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
