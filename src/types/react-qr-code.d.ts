declare module 'react-qr-code' {
  import * as React from 'react'

  export type QRCodeProps = {
    value: string
    size?: number
    bgColor?: string
    fgColor?: string
    level?: 'L' | 'M' | 'Q' | 'H'
  }

  const DefaultQRCode: React.FC<QRCodeProps>
  export default DefaultQRCode
}
