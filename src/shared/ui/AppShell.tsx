
import BottomNav from './BottomNav';
import { Toast } from './Toast';
import type { ReactNode } from 'react';

export function AppShell(props: { children: ReactNode; showBottomNav?: boolean }) {
  // Luôn hiển thị BottomNav trừ khi truyền showBottomNav={false}
  const showBottomNav = props.showBottomNav !== false;
  return (
    <div className="appShell">
      {/* <TopBar /> */}
      <main className="main">{props.children}</main>
      {showBottomNav && <BottomNav />}
      <Toast />
    </div>
  );
}

