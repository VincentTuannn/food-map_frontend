import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { Toast } from './Toast'

export function AppShell(props: { children: ReactNode; showBottomNav?: boolean }) {
  return (
    <div className="appShell">
      <TopBar />
      <main className="main">{props.children}</main>
      {props.showBottomNav === false ? null : <BottomNav />}
      <Toast />
    </div>
  )
}

