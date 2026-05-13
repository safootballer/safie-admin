'use client'
import { useState, useEffect } from 'react'

export default function MatchesPage() {
  const [data, setData]             = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [expanded, setExpanded]     = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ type: string; text: string } | null>(null)

  // Delete by date
  const [deleteDate, setDeleteDate]       = useState('')
  const [deleting, setDeleting]           = useState(false)
  const [deleteResult, setDeleteResult]   = useState<{ type: string; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  async function autoPublishAll() {
    if (!confirm(`This will auto-generate and publish reports for ALL active matches. Continue?`)) return
    setPublishing(true); setPublishResult(null)
    try {
      const res  = await fetch('/api/auto-publish-all', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setPublishResult({ type: 'success', text: `🚀 Pipeline started for ${data.total} matches! Reports are generating in the background.` })
      } else {
        setPublishResult({ type: 'error', text: `❌ ${data.error ?? 'Failed to start pipeline'}` })
      }
    } catch (e: any) {
      setPublishResult({ type: 'error', text: `❌ ${e.message}` })
    }
    setPublishing(false)
  }

  async function deleteBeforeDate() {
    if (!deleteDate) return
    setDeleting(true); setDeleteResult(null)
    try {
      const res  = await fetch('/api/matches/delete-before-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeDate: deleteDate }),
      })
      const data = await res.json()
      if (data.success) {
        setDeleteResult({ type: 'success', text: `✅ Deleted ${data.deleted} match link${data.deleted !== 1 ? 's' : ''} before ${deleteDate}` })
        setConfirmDelete(false)
        setDeleteDate('')
        load(page)
      } else {
        setDeleteResult({ type: 'error', text: `❌ ${data.error ?? 'Delete failed'}` })
      }
    } catch (e: any) {
      setDeleteResult({ type: 'error', text: `❌ ${e.message}` })
    }
    setDeleting(false)
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title" style={{ marginBottom: '0.25rem' }}>🏈 Match Management</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
            Total matches: <strong style={{ color: '#fff' }}>{data?.total ?? '...'}</strong>
          </div>
        </div>
        <button
          onClick={autoPublishAll}
          disabled={publishing}
          style={{
            background: publishing ? 'rgba(230,254,0,0.3)' : '#e6fe00',
            color: '#000', border: 'none', borderRadius: 10,
            padding: '0.75rem 1.5rem',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900, fontSize: '1rem',
            cursor: publishing ? 'not-allowed' : 'pointer',
          }}
        >
          {publishing ? '⏳ Generating...' : '🚀 Auto Publish All'}
        </button>
      </div>

      {/* Auto publish result */}
      {publishResult && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1.5rem',
          background: publishResult.type === 'success' ? 'rgba(5,46,22,0.8)' : 'rgba(45,0,0,0.8)',
          border: `1px solid ${publishResult.type === 'success' ? '#4ade80' : '#f87171'}`,
          color: publishResult.type === 'success' ? '#4ade80' : '#f87171',
          fontSize: '0.875rem', fontWeight: 500,
        }}>
          {publishResult.text}
        </div>
      )}

      {/* Delete by date */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '4px solid #f87171' }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#f87171', marginBottom: '0.75rem' }}>
          🗑️ Delete Match Links Before Date
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={deleteDate}
            onChange={e => { setDeleteDate(e.target.value); setConfirmDelete(false); setDeleteResult(null) }}
            style={{
              padding: '0.6rem 0.875rem', border: '1.5px solid rgba(248,113,113,0.4)',
              borderRadius: 8, background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: '0.875rem', outline: 'none',
            }}
          />
          {deleteDate && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                background: 'transparent', border: '1.5px solid #f87171',
                color: '#f87171', borderRadius: 8, padding: '0.6rem 1.25rem',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              Delete Before {deleteDate}
            </button>
          )}
          {confirmDelete && (
            <>
              <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.875rem' }}>Are you sure?</span>
              <button
                onClick={deleteBeforeDate}
                disabled={deleting}
                style={{
                  background: '#f87171', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '0.6rem 1.25rem',
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '0.6rem 1.25rem',
                  fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        {deleteResult && (
          <div style={{
            marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
            color: deleteResult.type === 'success' ? '#4ade80' : '#f87171',
          }}>
            {deleteResult.text}
          </div>
        )}
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
                    <span>🏈</span>
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