import type { Language } from '../store/appStore'

export type I18nKey =
  | 'app.name'
  | 'nav.tourist'
  | 'nav.merchant'
  | 'nav.admin'
  | 'nav.map'
  | 'nav.poi'
  | 'nav.premium'
  | 'nav.start'
  | 'top.qrToMap'
  | 'top.premium'
  | 'tourist.start.title'
  | 'tourist.start.subtitle'
  | 'tourist.start.tourCode'
  | 'tourist.start.example'
  | 'tourist.start.saveTour'
  | 'tourist.start.scanQr'
  | 'tourist.start.lang'
  | 'tourist.start.radius'
  | 'tourist.start.apply'
  | 'tourist.start.gps'
  | 'tourist.start.requestLocation'
  | 'tourist.start.openMap'
  | 'tourist.start.tourSavedTitle'
  | 'tourist.start.tourSavedDesc'
  | 'tourist.start.qrDemoTitle'
  | 'tourist.start.qrDemoDesc'
  | 'tourist.start.noGpsTitle'
  | 'tourist.start.noGpsDesc'
  | 'tourist.start.gpsOkTitle'
  | 'tourist.start.gpsOkDesc'
  | 'tourist.start.gpsDeniedTitle'
  | 'tourist.start.gpsDeniedDesc'
  | 'tourist.start.radiusSet'
  | 'tourist.start.radiusDesc'
  | 'tourist.start.gpsDesc'
  | 'tourist.start.pwaPill'
  | 'tourist.map.title'
  | 'tourist.map.subtitle'
  | 'tourist.map.nearbyList'
  | 'tourist.map.triggerUnder'
  | 'tourist.map.noGps'
  | 'tourist.map.nearByToast'
  | 'tourist.map.directionsTitle'
  | 'tourist.map.walking'
  | 'tourist.map.driving'
  | 'tourist.map.cycling'
  | 'tourist.map.mockRoute'
  | 'tourist.poi.notFound'
  | 'tourist.poi.backToMap'
  | 'tourist.poi.menuHighlights'
  | 'tourist.poi.viewMenu'
  | 'tourist.poi.viewMenuDemoTitle'
  | 'tourist.poi.viewMenuDemoDesc'
  | 'tourist.poi.voucherTitle'
  | 'tourist.poi.copyVoucher'
  | 'tourist.poi.copySuccess'
  | 'tourist.poi.copyFailed'
  | 'tourist.poi.noVoucher'
  | 'tourist.poi.navigateTo'
  | 'tourist.poi.navigateDemoTitle'
  | 'tourist.poi.navigateDemoDesc'
  | 'tourist.poi.reviewsTitle'
  | 'tourist.poi.writeReview'
  | 'tourist.poi.writeReviewDemo'
  | 'tourist.premium.title'
  | 'tourist.premium.subtitle'
  | 'tourist.premium.paymentMock'
  | 'tourist.premium.buyNow'
  | 'tourist.premium.restore'
  | 'tourist.premium.payDemo'
  | 'tourist.premium.restoreDemo'
  | 'tourist.premium.plan1.name'
  | 'tourist.premium.plan1.perks'
  | 'tourist.premium.plan2.name'
  | 'tourist.premium.plan2.perks'
  | 'tourist.premium.plan3.name'
  | 'tourist.premium.plan3.perks'
  | 'merchant.title'
  | 'admin.title'
  | 'common.overview'

type Dict = Record<I18nKey, string>

const VI: Dict = {
  'app.name': 'Tour Guide',
  'nav.tourist': 'Du khách',
  'nav.merchant': 'Quán ăn',
  'nav.admin': 'Admin',
  'nav.map': 'Bản đồ',
  'nav.poi': 'POI',
  'nav.premium': 'Premium',
  'nav.start': 'Bắt đầu',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': 'Bắt đầu hành trình',
  'tourist.start.subtitle': 'Demo PWA: nhập mã tour (hoặc quét QR ở bước tích hợp camera).',
  'tourist.start.tourCode': 'Mã tour / QR code',
  'tourist.start.example': 'VD:',
  'tourist.start.saveTour': 'Lưu mã tour',
  'tourist.start.scanQr': 'Quét QR',
  'tourist.start.lang': 'Ngôn ngữ ưu tiên',
  'tourist.start.radius': 'Bán kính kích hoạt POI',
  'tourist.start.apply': 'Áp dụng',
  'tourist.start.gps': 'GPS & điều hướng',
  'tourist.start.requestLocation': 'Cấp quyền vị trí',
  'tourist.start.openMap': 'Mở Map (demo)',
  'tourist.start.tourSavedTitle': 'Đã lưu tour',
  'tourist.start.tourSavedDesc': 'Bạn có thể mở Map để xem POI.',
  'tourist.start.qrDemoTitle': 'Quét QR (TODO)',
  'tourist.start.qrDemoDesc': 'Tích hợp camera sau (getUserMedia).',
  'tourist.start.noGpsTitle': 'Thiết bị không hỗ trợ GPS',
  'tourist.start.noGpsDesc': 'Hãy thử trên mobile Chrome/Safari.',
  'tourist.start.gpsOkTitle': 'Đã bật GPS',
  'tourist.start.gpsOkDesc': 'Chuyển sang bản đồ…',
  'tourist.start.gpsDeniedTitle': 'Chưa cấp quyền vị trí',
  'tourist.start.gpsDeniedDesc': 'Vui lòng bật Location để dùng bản đồ.',
  'tourist.start.radiusSet': 'Đã set bán kính {radius}m',
  'tourist.start.radiusDesc': '(Trong thực tế admin cấu hình; ở demo cho bạn chỉnh nhanh.)',
  'tourist.start.gpsDesc': 'Hệ thống sẽ tự phát “audio/text” khi bạn vào vùng POI.',
  'tourist.start.pwaPill': 'PWA · Mobile-first',
  'tourist.map.title': 'Bản đồ & POI lân cận',
  'tourist.map.subtitle': 'Ở demo này dùng “map mock” + geolocation thật (nếu bật GPS).',
  'tourist.map.nearbyList': 'Danh sách gần bạn',
  'tourist.map.triggerUnder': 'Trigger ≤ {radius}m',
  'tourist.map.noGps': 'Chưa có GPS',
  'tourist.map.nearByToast': 'Bạn đang gần: ',
  'tourist.map.directionsTitle': 'Chỉ dẫn (Mapbox-ready)',
  'tourist.map.walking': 'Đi bộ',
  'tourist.map.driving': 'Lái xe',
  'tourist.map.cycling': 'Đạp xe',
  'tourist.map.mockRoute': 'Tạo tuyến đường',
  'tourist.poi.notFound': 'Không tìm thấy POI',
  'tourist.poi.backToMap': 'Quay lại Map',
  'tourist.poi.menuHighlights': 'Menu nổi bật',
  'tourist.poi.viewMenu': 'Xem toàn bộ menu',
  'tourist.poi.viewMenuDemoTitle': 'Xem menu (demo)',
  'tourist.poi.viewMenuDemoDesc': 'Thực tế mở trang menu / PDF / in-app.',
  'tourist.poi.voucherTitle': 'Khuyến mãi / Voucher',
  'tourist.poi.copyVoucher': 'Copy mã giảm giá',
  'tourist.poi.copySuccess': 'Đã copy mã',
  'tourist.poi.copyFailed': 'Copy thất bại',
  'tourist.poi.noVoucher': 'Hiện chưa có voucher.',
  'tourist.poi.navigateTo': 'Điều hướng đến đây',
  'tourist.poi.navigateDemoTitle': 'Điều hướng (demo)',
  'tourist.poi.navigateDemoDesc': 'Thực tế deep-link Google Maps/Apple Maps.',
  'tourist.poi.reviewsTitle': 'Đánh giá',
  'tourist.poi.writeReview': 'Viết đánh giá',
  'tourist.poi.writeReviewDemo': 'Viết review (demo)',
  'tourist.premium.title': 'Premium',
  'tourist.premium.subtitle': 'UI demo cho luồng thanh toán. Tích hợp cổng thanh toán sẽ làm ở backend + redirect.',
  'tourist.premium.paymentMock': 'Thanh toán (mock)',
  'tourist.premium.buyNow': 'Mua ngay',
  'tourist.premium.restore': 'Khôi phục',
  'tourist.premium.payDemo': 'Thanh toán (demo)',
  'tourist.premium.restoreDemo': 'Khôi phục giao dịch (demo)',
  'tourist.premium.plan1.name': 'Pro Tour',
  'tourist.premium.plan1.perks': 'Mở khóa POI nâng cao|Offline cache (audio/text)|Không quảng cáo',
  'tourist.premium.plan2.name': 'Celebrity Voice',
  'tourist.premium.plan2.perks': 'Giọng đọc chất lượng cao|Tự động phát khi vào bán kính|Ưu tiên tải nhanh',
  'tourist.premium.plan3.name': 'AI Voice+',
  'tourist.premium.plan3.perks': 'TTS đa ngôn ngữ|Tùy chỉnh tốc độ/giọng|Chất lượng ổn định',
  'merchant.title': 'Merchant Console',
  'admin.title': 'Admin Console',
  'common.overview': 'Tổng quan',
}

const EN: Dict = {
  'app.name': 'Tour Guide',
  'nav.tourist': 'Tourist',
  'nav.merchant': 'Merchant',
  'nav.admin': 'Admin',
  'nav.map': 'Map',
  'nav.poi': 'POI',
  'nav.premium': 'Premium',
  'nav.start': 'Start',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': 'Start your tour',
  'tourist.start.subtitle': 'PWA demo: enter tour code (or scan QR once camera is integrated).',
  'tourist.start.tourCode': 'Tour code / QR',
  'tourist.start.example': 'Ex:',
  'tourist.start.saveTour': 'Save tour code',
  'tourist.start.scanQr': 'Scan QR',
  'tourist.start.lang': 'Preferred language',
  'tourist.start.radius': 'POI trigger radius',
  'tourist.start.apply': 'Apply',
  'tourist.start.gps': 'GPS & navigation',
  'tourist.start.requestLocation': 'Allow location',
  'tourist.start.openMap': 'Open map (demo)',
  'tourist.start.tourSavedTitle': 'Tour saved',
  'tourist.start.tourSavedDesc': 'You can now open the Map to see POIs.',
  'tourist.start.qrDemoTitle': 'Scan QR (TODO)',
  'tourist.start.qrDemoDesc': 'Integrate back camera (getUserMedia).',
  'tourist.start.noGpsTitle': 'GPS not supported',
  'tourist.start.noGpsDesc': 'Please try on mobile Chrome/Safari.',
  'tourist.start.gpsOkTitle': 'GPS enabled',
  'tourist.start.gpsOkDesc': 'Switching to map…',
  'tourist.start.gpsDeniedTitle': 'Location permission denied',
  'tourist.start.gpsDeniedDesc': 'Please enable Location to use the map.',
  'tourist.start.radiusSet': 'Radius set to {radius}m',
  'tourist.start.radiusDesc': '(In practice, admin configures this; here for quick editing.)',
  'tourist.start.gpsDesc': 'System will auto-play audio/text when you enter a POI zone.',
  'tourist.start.pwaPill': 'PWA · Mobile-first',
  'tourist.map.title': 'Map & nearby POIs',
  'tourist.map.subtitle': 'This demo uses a mock map + real geolocation (if enabled).',
  'tourist.map.nearbyList': 'Nearby list',
  'tourist.map.triggerUnder': 'Trigger ≤ {radius}m',
  'tourist.map.noGps': 'No GPS',
  'tourist.map.nearByToast': 'You are near: ',
  'tourist.map.directionsTitle': 'Directions (Mapbox-ready)',
  'tourist.map.walking': 'Walking',
  'tourist.map.driving': 'Driving',
  'tourist.map.cycling': 'Cycling',
  'tourist.map.mockRoute': 'Mock route',
  'tourist.poi.notFound': 'POI not found',
  'tourist.poi.backToMap': 'Back to map',
  'tourist.poi.menuHighlights': 'Menu Highlights',
  'tourist.poi.viewMenu': 'View full menu',
  'tourist.poi.viewMenuDemoTitle': 'View menu (demo)',
  'tourist.poi.viewMenuDemoDesc': 'Will open menu page / PDF / in-app.',
  'tourist.poi.voucherTitle': 'Offers / Vouchers',
  'tourist.poi.copyVoucher': 'Copy voucher code',
  'tourist.poi.copySuccess': 'Code copied',
  'tourist.poi.copyFailed': 'Failed to copy',
  'tourist.poi.noVoucher': 'No vouchers currently.',
  'tourist.poi.navigateTo': 'Navigate here',
  'tourist.poi.navigateDemoTitle': 'Navigate (demo)',
  'tourist.poi.navigateDemoDesc': 'Will deep-link to Google/Apple Maps.',
  'tourist.poi.reviewsTitle': 'Reviews',
  'tourist.poi.writeReview': 'Write review',
  'tourist.poi.writeReviewDemo': 'Write review (demo)',
  'tourist.premium.title': 'Premium',
  'tourist.premium.subtitle': 'Payment flow UI demo. Payment gateway integration will be done in backend.',
  'tourist.premium.paymentMock': 'Payment (mock)',
  'tourist.premium.buyNow': 'Buy now',
  'tourist.premium.restore': 'Restore',
  'tourist.premium.payDemo': 'Payment (demo)',
  'tourist.premium.restoreDemo': 'Restore transaction (demo)',
  'tourist.premium.plan1.name': 'Pro Tour',
  'tourist.premium.plan1.perks': 'Advanced POI unlock|Offline cache|No ads',
  'tourist.premium.plan2.name': 'Celebrity Voice',
  'tourist.premium.plan2.perks': 'High quality voices|Auto-play in radius|Priority loading',
  'tourist.premium.plan3.name': 'AI Voice+',
  'tourist.premium.plan3.perks': 'Multi-lang TTS|Speed/Voice config|Stable quality',
  'merchant.title': 'Merchant Console',
  'admin.title': 'Admin Console',
  'common.overview': 'Overview',
}

const JA: Dict = {
  'app.name': 'Tour Guide',
  'nav.tourist': '旅行者',
  'nav.merchant': '店舗',
  'nav.admin': '管理者',
  'nav.map': '地図',
  'nav.poi': 'POI',
  'nav.premium': 'Premium',
  'nav.start': '開始',
  'top.qrToMap': 'QR → Map',
  'top.premium': 'Premium',
  'tourist.start.title': '旅を始める',
  'tourist.start.subtitle': 'PWAデモ：ツアーコード入力（QRスキャンは後で実装）。',
  'tourist.start.tourCode': 'ツアーコード / QR',
  'tourist.start.example': '例:',
  'tourist.start.saveTour': '保存',
  'tourist.start.scanQr': 'QRスキャン',
  'tourist.start.lang': '言語',
  'tourist.start.radius': 'POI発火半径',
  'tourist.start.apply': '適用',
  'tourist.start.gps': 'GPS・ナビ',
  'tourist.start.requestLocation': '位置情報を許可',
  'tourist.start.openMap': '地図を開く(デモ)',
  'tourist.start.tourSavedTitle': '保存しました',
  'tourist.start.tourSavedDesc': '地図を開いてPOIを確認できます。',
  'tourist.start.qrDemoTitle': 'QRスキャン(TODO)',
  'tourist.start.qrDemoDesc': 'バックカメラを統合します(getUserMedia)',
  'tourist.start.noGpsTitle': 'GPS未対応',
  'tourist.start.noGpsDesc': 'Chrome/Safariでお試しください。',
  'tourist.start.gpsOkTitle': 'GPS有効',
  'tourist.start.gpsOkDesc': '地図へ切り替えます…',
  'tourist.start.gpsDeniedTitle': '位置情報が許可されていません',
  'tourist.start.gpsDeniedDesc': '設定でLocationをオンにしてください。',
  'tourist.start.radiusSet': '半径を{radius}mに設定しました',
  'tourist.start.radiusDesc': '(実際のアプリでは管理者が設定します。デモのための設定です)',
  'tourist.start.gpsDesc': 'POIに入ると音声やテキストが自動再生されます。',
  'tourist.start.pwaPill': 'PWA · モバイルファースト',
  'tourist.map.title': '地図・周辺POI',
  'tourist.map.subtitle': 'このデモはモック地図＋実際の位置情報を使用。',
  'tourist.map.nearbyList': '近くの一覧',
  'tourist.map.triggerUnder': '発火 ≤ {radius}m',
  'tourist.map.noGps': 'GPSなし',
  'tourist.map.nearByToast': '近くのPOI: ',
  'tourist.map.directionsTitle': 'ルート案内 (Mapbox-ready)',
  'tourist.map.walking': '徒歩',
  'tourist.map.driving': '車',
  'tourist.map.cycling': '自転車',
  'tourist.map.mockRoute': 'モックルート',
  'tourist.poi.notFound': 'POIが見つかりません',
  'tourist.poi.backToMap': '地図へ戻る',
  'tourist.poi.menuHighlights': 'おすすめメニュー',
  'tourist.poi.viewMenu': 'メニュー全体を見る',
  'tourist.poi.viewMenuDemoTitle': 'メニューを開く(デモ)',
  'tourist.poi.viewMenuDemoDesc': '実際にはメニューページ/PDFを開きます。',
  'tourist.poi.voucherTitle': '割引/バウチャー',
  'tourist.poi.copyVoucher': 'バウチャーをコピー',
  'tourist.poi.copySuccess': 'コピーしました',
  'tourist.poi.copyFailed': 'コピー失敗',
  'tourist.poi.noVoucher': '現在バウチャーはありません。',
  'tourist.poi.navigateTo': 'ここへナビゲーション',
  'tourist.poi.navigateDemoTitle': 'ナビ(デモ)',
  'tourist.poi.navigateDemoDesc': 'Google/Apple Mapsに遷移させます。',
  'tourist.poi.reviewsTitle': 'レビュー',
  'tourist.poi.writeReview': 'レビューを書く',
  'tourist.poi.writeReviewDemo': 'レビュー投稿(デモ)',
  'tourist.premium.title': 'Premium',
  'tourist.premium.subtitle': '決済フローのUIデモ。実際の決済はバックエンドで行います。',
  'tourist.premium.paymentMock': '決済 (モック)',
  'tourist.premium.buyNow': '今すぐ購入',
  'tourist.premium.restore': '復元',
  'tourist.premium.payDemo': '決済(デモ)',
  'tourist.premium.restoreDemo': 'トランザクション復元(デモ)',
  'tourist.premium.plan1.name': 'Pro Tour',
  'tourist.premium.plan1.perks': '高度なPOI解放|オフラインキャッシュ|広告なし',
  'tourist.premium.plan2.name': 'Celebrity Voice',
  'tourist.premium.plan2.perks': '高品質音声|自動再生|優先ロード',
  'tourist.premium.plan3.name': 'AI Voice+',
  'tourist.premium.plan3.perks': '多言語TTS|速度・声調整|安定した品質',
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

