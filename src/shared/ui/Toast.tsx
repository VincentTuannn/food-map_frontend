import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export function Toast() {
  const toast = useAppStore((s) => s.toast)
  const showToast = useAppStore((s) => s.showToast)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => showToast(undefined), 3200)
    return () => window.clearTimeout(t)
  }, [toast, showToast])

  if (!toast) return null
  return (
    <div className="toast" role="status" aria-live="polite">
      <div className="rowBetween">
        <div>
          <div style={{ fontWeight: 750 }}>{toast.title}</div>
          {toast.message ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>{toast.message}</div> : null}
        </div>
        <button className="btn btnGhost" onClick={() => showToast(undefined)}>
          ✕
        </button>
      </div>
    </div>
  )
}

