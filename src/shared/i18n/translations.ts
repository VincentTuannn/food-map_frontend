import type { Language } from '../store/appStore'

export type I18nKey =
  | 'app.name'
  | 'nav.tourist'
  | 'nav.merchant'
  | 'nav.admin'
  | 'top.qrToMap'
  | 'top.premium'
  | 'tourist.start.title'
  | 'tourist.start.subtitle'
  | 'tourist.start.tourCode'
  | 'tourist.start.saveTour'
  | 'tourist.start.scanQr'
  | 'tourist.start.lang'
  | 'tourist.start.radius'
  | 'tourist.start.apply'
  | 'tourist.start.gps'
  | 'tourist.start.requestLocation'
  | 'tourist.start.openMap'
  | 'tourist.map.title'
  | 'tourist.map.subtitle'
  | 'tourist.map.nearbyList'
  | 'tourist.map.triggerUnder'
  | 'tourist.map.noGps'
  | 'tourist.poi.notFound'
  | 'tourist.poi.backToMap'
  | 'merchant.title'
  | 'admin.title'
  | 'common.overview'

type Dict = Record<I18nKey, string>

const VI: Dict = {
  'app.name': 'Food Map',
  'nav.tourist': 'Du khách',
  'nav.merchant': 'Quán ăn',
  'nav.admin': 'Admin',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': 'Bắt đầu hành trình',
  'tourist.start.subtitle': 'Demo PWA: nhập mã tour (hoặc quét QR ở bước tích hợp camera).',
  'tourist.start.tourCode': 'Mã tour / QR code',
  'tourist.start.saveTour': 'Lưu mã tour',
  'tourist.start.scanQr': 'Quét QR',
  'tourist.start.lang': 'Ngôn ngữ ưu tiên',
  'tourist.start.radius': 'Bán kính kích hoạt POI',
  'tourist.start.apply': 'Áp dụng',
  'tourist.start.gps': 'GPS & điều hướng',
  'tourist.start.requestLocation': 'Cấp quyền vị trí',
  'tourist.start.openMap': 'Mở Map (demo)',
  'tourist.map.title': 'Bản đồ & POI lân cận',
  'tourist.map.subtitle': 'Ở demo này dùng “map mock” + geolocation thật (nếu bật GPS).',
  'tourist.map.nearbyList': 'Danh sách gần bạn',
  'tourist.map.triggerUnder': 'Trigger ≤ {radius}m',
  'tourist.map.noGps': 'Chưa có GPS',
  'tourist.poi.notFound': 'Không tìm thấy POI',
  'tourist.poi.backToMap': 'Quay lại Map',
  'merchant.title': 'Merchant Console',
  'admin.title': 'Admin Console',
  'common.overview': 'Tổng quan',
}

const EN: Dict = {
  'app.name': 'Food Map',
  'nav.tourist': 'Tourist',
  'nav.merchant': 'Merchant',
  'nav.admin': 'Admin',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': 'Start your tour',
  'tourist.start.subtitle': 'PWA demo: enter tour code (or scan QR once camera is integrated).',
  'tourist.start.tourCode': 'Tour code / QR',
  'tourist.start.saveTour': 'Save tour code',
  'tourist.start.scanQr': 'Scan QR',
  'tourist.start.lang': 'Preferred language',
  'tourist.start.radius': 'POI trigger radius',
  'tourist.start.apply': 'Apply',
  'tourist.start.gps': 'GPS & navigation',
  'tourist.start.requestLocation': 'Allow location',
  'tourist.start.openMap': 'Open map (demo)',
  'tourist.map.title': 'Map & nearby POIs',
  'tourist.map.subtitle': 'This demo uses a mock map + real geolocation (if enabled).',
  'tourist.map.nearbyList': 'Nearby list',
  'tourist.map.triggerUnder': 'Trigger ≤ {radius}m',
  'tourist.map.noGps': 'No GPS',
  'tourist.poi.notFound': 'POI not found',
  'tourist.poi.backToMap': 'Back to map',
  'merchant.title': 'Merchant Console',
  'admin.title': 'Admin Console',
  'common.overview': 'Overview',
}

const JA: Dict = {
  'app.name': 'Food Map',
  'nav.tourist': '旅行者',
  'nav.merchant': '店舗',
  'nav.admin': '管理者',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': '旅を始める',
  'tourist.start.subtitle': 'PWAデモ：ツアーコード入力（QRスキャンは後で実装）。',
  'tourist.start.tourCode': 'ツアーコード / QR',
  'tourist.start.saveTour': '保存',
  'tourist.start.scanQr': 'QRスキャン',
  'tourist.start.lang': '言語',
  'tourist.start.radius': 'POI発火半径',
  'tourist.start.apply': '適用',
  'tourist.start.gps': 'GPS・ナビ',
  'tourist.start.requestLocation': '位置情報を許可',
  'tourist.start.openMap': '地図を開く(デモ)',
  'tourist.map.title': '地図・周辺POI',
  'tourist.map.subtitle': 'このデモはモック地図＋実際の位置情報を使用。',
  'tourist.map.nearbyList': '近くの一覧',
  'tourist.map.triggerUnder': '発火 ≤ {radius}m',
  'tourist.map.noGps': 'GPSなし',
  'tourist.poi.notFound': 'POIが見つかりません',
  'tourist.poi.backToMap': '地図へ戻る',
  'merchant.title': 'Merchant Console',
  'admin.title': 'Admin Console',
  'common.overview': '概要',
}

export function t(lang: Language, key: I18nKey, vars?: Record<string, string | number>) {
  const dict = lang === 'vi' ? VI : lang === 'ja' ? JA : EN
  const raw = dict[key] ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}

