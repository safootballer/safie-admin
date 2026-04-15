'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function AddMatchesPage() {
  const { data: session } = useSession()
  const [urls, setUrls]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [results, setResults]   = useState<any[]>([])
  const [links, setLinks]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  async function loadLinks() {
    const data = await fetch('/api/match-links').then(r => r.json())
    setLinks(data); setLoading(false)
  }

  useEffect(() => { loadLinks() }, [])

  async function saveUrls() {
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean)
    if (!urlList.length) return
    setSaving(true); setResults([])
    const res  = await fetch('/api/match-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlList, addedBy: session?.user?.name ?? 'admin' }),
    })
    const data = await res.json()
    setResults(data.results ?? [])
    setSaving(false)
    setUrls('')
    loadLinks()
  }

  async function toggleLink(id: number, isActive: number) {
    await fetch('/api/match-links', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_active: isActive ? 0 : 1 }) })
    loadLinks()
  }

  async function deleteLink(id: number) {
    if (!confirm('Delete this link?')) return
    await fetch('/api/match-links', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    loadLinks()
  }

  const active  = links.filter(l => l.is_active)
  const hidden  = links.filter(l => !l.is_active)

  return (
    <div className="fade-up">
      <div className="page-title">📥 Add Match Links</div>

      <div className="alert-info" style={{ marginBottom: '1.5rem', borderLeft: '4px solid #e6fe00' }}>
        After each match day, paste the PlayHQ match URLs below (one per line). The system will fetch match details automatically and make them available for users in the SAFie dashboard.
      </div>

      {/* URL input */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          PlayHQ Match URLs (one per line)
        </label>
        <textarea
          value={urls}
          onChange={e => setUrls(e.target.value)}
          rows={5}
          className="input-field"
          placeholder={'https://www.playhq.com/afl/org/.../game/abc123\nhttps://www.playhq.com/afl/org/.../game/def456'}
          style={{ marginBottom: '1rem', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button onClick={saveUrls} disabled={saving || !urls.trim()} className="btn-primary" style={{ minWidth: 220 }}>
            {saving ? 'Fetching & Saving...' : 'Save Match Links'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '2rem' }}>
          {results.map((r, i) => (
            <div key={i} className={r.status === 'success' ? 'alert-success' : r.status === 'duplicate' ? 'alert-warning' : 'alert-error'}>
              {r.status === 'success' ? '✅' : r.status === 'duplicate' ? '⚠️' : '❌'} {r.message}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Saved',      value: links.length },
          { label: 'Visible to Users', value: active.length },
          { label: 'Hidden',           value: hidden.length },
        ].map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-value" style={{ fontSize: '1.75rem' }}>{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Saved links */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.875rem' }}>
        Saved Match Links
      </p>

      {loading ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map(link => (
            <div key={link.id} className="glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{ fontSize: '1rem' }}>🏈</span>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem' }}>
                      {link.home_team} vs {link.away_team}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                      📅 {link.date?.slice(0, 10)} · 📍 {link.venue} · 🏆 {link.competition}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                      Added by {link.added_by} · {link.added_at?.slice(0, 10)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: link.is_active ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    border: `1px solid ${link.is_active ? '#4ade80' : '#f87171'}`,
                    color: link.is_active ? '#4ade80' : '#f87171',
                  }}>
                    {link.is_active ? 'Active' : 'Hidden'}
                  </span>
                  <button onClick={() => toggleLink(link.id, link.is_active)} className="btn-primary" style={{ fontSize: '0.78rem', padding: '0.45rem 0.875rem' }}>
                    {link.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="btn-danger" style={{ fontSize: '0.78rem', padding: '0.45rem 0.875rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!links.length && (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>No match links saved yet. Add some above!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
