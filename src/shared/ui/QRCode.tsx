import type { ComponentType } from 'react'
import type { QRCodeProps } from 'react-qr-code'
import * as QRCodeModule from 'react-qr-code'

type QRCodeModuleShape = {
  default?: unknown
  QRCode?: unknown
}

function resolveComponent(mod: unknown): ComponentType<QRCodeProps> | undefined {
  if (!mod) return undefined
  if (typeof mod === 'function') return mod as ComponentType<QRCodeProps>
  const shape = mod as QRCodeModuleShape
  if (typeof shape.default === 'function') return shape.default as ComponentType<QRCodeProps>
  if (typeof shape.QRCode === 'function') return shape.QRCode as ComponentType<QRCodeProps>
  if (shape.default) return resolveComponent(shape.default)
  return undefined
}

const resolved = resolveComponent(QRCodeModule)

if (!resolved && import.meta.env.DEV) {
  // Avoid crashing the app if the module shape changes.
  console.warn('react-qr-code: failed to resolve component export')
}

const QRCode: ComponentType<QRCodeProps> = resolved ?? (() => null)

export default QRCode
