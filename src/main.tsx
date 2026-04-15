import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { useAppStore } from './shared/store/appStore'
// import './style.css'
import './index.css'

import './shared/i18n/i18n'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore SW failures in dev / restricted environments
    })
  })
}

function applyTheme() {
  const theme = useAppStore.getState().theme
  document.documentElement.dataset.theme = theme
}

applyTheme()
useAppStore.subscribe(applyTheme)

ReactDOM.createRoot(document.querySelector<HTMLDivElement>('#app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

