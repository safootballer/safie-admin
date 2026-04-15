'use client'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard',             label: 'Dashboard',     icon: '📊' },
  { href: '/dashboard/analytics',   label: 'Analytics',     icon: '📈' },
  { href: '/dashboard/costs',       label: 'Cost Manager',  icon: '💰' },
  { href: '/dashboard/users',       label: 'Users',         icon: '👥' },
  { href: '/dashboard/matches',     label: 'Matches',       icon: '🏈' },
  { href: '/dashboard/add-matches', label: 'Add Matches',   icon: '📥' },
]

export function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: '#000',
      borderRight: '1px solid rgba(44,163,238,0.2)',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      padding: '1.25rem 0.875rem', gap: '0.25rem',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
          <img src="/logo2.png" alt="SAFie" style={{ height: 32 }} onError={e => (e.currentTarget.style.display='none')} />
          <img src="/logo.png" alt="SA Footballer" style={{ height: 32 }} onError={e => (e.currentTarget.style.display='none')} />
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '1.25rem', color: '#2ca3ee' }}>
          SAFie Admin
        </div>
        <span className="badge-yellow" style={{ fontSize: '0.58rem', marginTop: 3, display: 'inline-block' }}>
          SA Footballer
        </span>
      </div>

      <div style={{ height: 1, background: 'rgba(44,163,238,0.2)', margin: '0.25rem 0 0.75rem' }} />

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1 }}>
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.6rem 0.875rem', borderRadius: 9,
              background: active ? 'rgba(44,163,238,0.15)' : 'transparent',
              border: active ? '1px solid rgba(44,163,238,0.3)' : '1px solid transparent',
              color: active ? '#2ca3ee' : 'rgba(255,255,255,0.6)',
              fontSize: '0.875rem', fontWeight: active ? 700 : 400,
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ height: 1, background: 'rgba(44,163,238,0.2)', margin: '0.75rem 0 0.5rem' }} />

      {/* User */}
      <div style={{ padding: '0.625rem 0.875rem', borderRadius: 9, background: 'rgba(44,163,238,0.05)', border: '1px solid rgba(44,163,238,0.15)', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Signed in</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
        <div style={{ fontSize: '0.72rem', color: '#2ca3ee', marginTop: 2 }}>{(user?.role ?? 'admin').toUpperCase()}</div>
      </div>

      <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn-yellow" style={{ width: '100%', fontSize: '0.82rem', padding: '0.6rem' }}>
        Logout
      </button>
    </aside>
  )
}
