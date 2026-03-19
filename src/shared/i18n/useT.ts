import { useAppStore } from '../store/appStore'
import { t, type I18nKey } from './translations'

export function useT() {
  const lang = useAppStore((s) => s.language)
  return (key: I18nKey, vars?: Record<string, string | number>) => t(lang, key, vars)
}

