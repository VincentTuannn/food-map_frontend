import { useNavigate } from 'react-router-dom'
import { AppShell } from './AppShell'

export function NotFoundPage() {
  const nav = useNavigate()
  return (
    <AppShell>
      <div className="card cardPad">
        <div style={{ fontWeight: 900, fontSize: 18 }}>404</div>
        <div style={{ color: 'var(--muted)', marginTop: 6 }}>Trang không tồn tại.</div>
        <div style={{ height: 12 }} />
        <button className="btn btnPrimary" onClick={() => nav('/start')}>
          Về Start
        </button>
      </div>
    </AppShell>
  )
}

