'use client'
import { useState, useEffect } from 'react'

export default function UsersPage() {
  const [users, setUsers]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState('user')
  const [creating, setCreating] = useState(false)
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/users').then(r => r.json())
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createUser() {
    if (!username || !password) { setMsg({ type: 'error', text: 'Fill in all fields' }); return }
    setCreating(true); setMsg(null)
    const res  = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password, role }) })
    const data = await res.json()
    setCreating(false)
    if (data.success) { setMsg({ type: 'success', text: 'User created!' }); setUsername(''); setPassword(''); load() }
    else setMsg({ type: 'error', text: data.error ?? 'Failed' })
  }

  async function deleteUser(id: number) {
    if (!confirm('Delete this user?')) return
    await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  const labelStyle = { display: 'block' as const, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '0.35rem' }

  return (
    <div className="fade-up">
      <div className="page-title">👥 User Management</div>

      {/* Create user */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '3px solid #2ca3ee' }}>
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
          Create New User
        </p>
        {msg && <div className={msg.type === 'success' ? 'alert-success' : 'alert-error'} style={{ marginBottom: '1rem' }}>{msg.text}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input-field" />
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={createUser} disabled={creating} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {creating ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </div>

      {/* Users table */}
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#2ca3ee', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.875rem' }}>
        All Users
      </p>
      {loading ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {users.map(u => (
            <div key={u.id} className="glass-card" style={{ padding: '1.125rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(44,163,238,0.15)', border: '1px solid rgba(44,163,238,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    👤
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: '#2ca3ee', marginTop: 2 }}>{u.role.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e6fe00', fontFamily: "'Barlow Condensed', sans-serif" }}>{u.generations}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gens</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e6fe00', fontFamily: "'Barlow Condensed', sans-serif" }}>${(u.totalCost ?? 0).toFixed(4)}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{u.created_at?.slice(0, 10) ?? '—'}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Created</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{u.last_login?.slice(0, 10) ?? 'Never'}</div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Login</div>
                  </div>
                </div>
                <div>
                  {u.username !== 'admin'
                    ? <button onClick={() => deleteUser(u.id)} className="btn-danger">Delete</button>
                    : <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>Protected</span>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
