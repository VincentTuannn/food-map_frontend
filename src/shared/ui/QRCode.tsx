import QRCodeLib from 'react-qr-code'

export default function QRCode(props: any) {
  // Đảm bảo lấy đúng Component function đề phòng trường hợp thư viện bị bọc trong object 'default'
  const Comp = (QRCodeLib as any).default || QRCodeLib

  return <Comp {...props} />
}