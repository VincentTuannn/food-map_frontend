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
  'app.name': 'Vĩnh Khánh Tour Guide',
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
  'tourist.start.subtitle': '',
  'tourist.start.tourCode': 'Mã tour / QR code',
  'tourist.start.example': 'VD:',
  'tourist.start.saveTour': 'Lưu mã tour',
  'tourist.start.scanQr': 'Quét QR',
  'tourist.start.lang': 'Ngôn ngữ',
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
  'tourist.start.radiusDesc': '',
  'tourist.start.gpsDesc': '',
  'tourist.start.pwaPill': 'PWA',
  'tourist.map.title': 'Bản đồ',
  'tourist.map.subtitle': '',
  'tourist.map.nearbyList': 'Danh sách gần bạn',
  'tourist.map.triggerUnder': 'Trigger ≤ {radius}m',
  'tourist.map.noGps': 'Chưa có GPS',
  'tourist.map.nearByToast': 'Bạn đang gần: ',
  'tourist.map.directionsTitle': 'Chỉ dẫn',
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
  'tourist.premium.subtitle': '',
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
  'app.name': 'Vĩnh Khánh Tour Guide',
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
  'tourist.start.lang': 'Language',
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
  'tourist.map.directionsTitle': 'Directions',
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
  'app.name': 'Vĩnh Khánh Tour Guide',
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
  'tourist.map.directionsTitle': 'ルート案内',
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

const ZH: Dict = {
  'app.name': 'Vĩnh Khánh Tour Guide',
  'nav.tourist': '游客',
  'nav.merchant': '商家',
  'nav.admin': '管理员',
  'nav.map': '地图',
  'nav.poi': '兴趣点',
  'nav.premium': '高级',
  'nav.start': '开始',
  'top.qrToMap': '扫码 → 地图',
  'top.premium': '高级版',
  'tourist.start.title': '开始您的旅程',
  'tourist.start.subtitle': 'PWA 演示：输入行程代码（稍后整合扫码功能）。',
  'tourist.start.tourCode': '行程代码 / 二维码',
  'tourist.start.example': '例：',
  'tourist.start.saveTour': '保存行程代码',
  'tourist.start.scanQr': '扫描二维码',
  'tourist.start.lang': '语言',
  'tourist.start.radius': '兴趣点触发半径',
  'tourist.start.apply': '应用',
  'tourist.start.gps': 'GPS及导航',
  'tourist.start.requestLocation': '允许获取位置',
  'tourist.start.openMap': '打开地图（演示）',
  'tourist.start.tourSavedTitle': '行程已保存',
  'tourist.start.tourSavedDesc': '您现在可以打开地图查看兴趣点。',
  'tourist.start.qrDemoTitle': '扫描二维码（待办）',
  'tourist.start.qrDemoDesc': '将整合后置摄像头。',
  'tourist.start.noGpsTitle': '不支持 GPS',
  'tourist.start.noGpsDesc': '请在移动版 Chrome/Safari 浏览器上尝试。',
  'tourist.start.gpsOkTitle': '已启用 GPS',
  'tourist.start.gpsOkDesc': '正在切换至地图...',
  'tourist.start.gpsDeniedTitle': '位置权限被拒绝',
  'tourist.start.gpsDeniedDesc': '请在设置中开启定位服务以使用地图。',
  'tourist.start.radiusSet': '半径已设置为 {radius} 米',
  'tourist.start.radiusDesc': '（实际上由管理员配置，仅在此作快速编辑演示用。）',
  'tourist.start.gpsDesc': '当您进入兴趣点区域时，系统会自动播放语音或显示文本。',
  'tourist.start.pwaPill': 'PWA · 移动优先',
  'tourist.map.title': '地图及附近兴趣点',
  'tourist.map.subtitle': '此演示使用模拟地图及真实定位。',
  'tourist.map.nearbyList': '附近列表',
  'tourist.map.triggerUnder': '触发 ≤ {radius} 米',
  'tourist.map.noGps': '无 GPS',
  'tourist.map.nearByToast': '您在附近：',
  'tourist.map.directionsTitle': '导航',
  'tourist.map.walking': '步行',
  'tourist.map.driving': '驾车',
  'tourist.map.cycling': '骑行',
  'tourist.map.mockRoute': '模拟路线',
  'tourist.poi.notFound': '未找到此兴趣点',
  'tourist.poi.backToMap': '返回地图',
  'tourist.poi.menuHighlights': '招牌菜单',
  'tourist.poi.viewMenu': '查看完整菜单',
  'tourist.poi.viewMenuDemoTitle': '查看菜单（演示）',
  'tourist.poi.viewMenuDemoDesc': '将打开菜单页面、PDF 或应用内弹窗。',
  'tourist.poi.voucherTitle': '优惠券',
  'tourist.poi.copyVoucher': '复制优惠券码',
  'tourist.poi.copySuccess': '已复制',
  'tourist.poi.copyFailed': '复制失败',
  'tourist.poi.noVoucher': '暂无优惠券。',
  'tourist.poi.navigateTo': '导航到这里',
  'tourist.poi.navigateDemoTitle': '导航（演示）',
  'tourist.poi.navigateDemoDesc': '将跳转至 Google / Apple 地图。',
  'tourist.poi.reviewsTitle': '评价',
  'tourist.poi.writeReview': '写评价',
  'tourist.poi.writeReviewDemo': '发布评价（演示）',
  'tourist.premium.title': 'Premium',
  'tourist.premium.subtitle': '支付流程用户界面演示。将配合后端集成支付网关。',
  'tourist.premium.paymentMock': '付款（模拟）',
  'tourist.premium.buyNow': '立即购买',
  'tourist.premium.restore': '恢复购买',
  'tourist.premium.payDemo': '付款（演示）',
  'tourist.premium.restoreDemo': '恢复交易（演示）',
  'tourist.premium.plan1.name': '专业版行程',
  'tourist.premium.plan1.perks': '解锁高级兴趣点|离线缓冲|无广告',
  'tourist.premium.plan2.name': '名人语音',
  'tourist.premium.plan2.perks': '高质量声音|自动播放|优先加载',
  'tourist.premium.plan3.name': 'AI 语音增强',
  'tourist.premium.plan3.perks': '多语言 TTS|调整语速及音色|稳定质量',
  'merchant.title': '商家控制台',
  'admin.title': '管理员控制台',
  'common.overview': '概览',
}

const KO: Dict = {
  'app.name': 'Vĩnh Khánh Tour Guide',
  'nav.tourist': '여행객',
  'nav.merchant': '상인',
  'nav.admin': '관리자',
  'nav.map': '지도',
  'nav.poi': '장소',
  'nav.premium': '프리미엄',
  'nav.start': '시작',
  'top.qrToMap': 'QR → 지도',
  'top.premium': '프리미엄',
  'tourist.start.title': '여행 시작하기',
  'tourist.start.subtitle': 'PWA 데모: 투어 코드를 입력하세요.',
  'tourist.start.tourCode': '투어 코드 / QR',
  'tourist.start.example': '예:',
  'tourist.start.saveTour': '투어 코드 저장',
  'tourist.start.scanQr': 'QR 스캔',
  'tourist.start.lang': '언어',
  'tourist.start.radius': '장소 감지 반경',
  'tourist.start.apply': '적용',
  'tourist.start.gps': 'GPS 및 내비게이션',
  'tourist.start.requestLocation': '위치 허용',
  'tourist.start.openMap': '지도 열기 (데모)',
  'tourist.start.tourSavedTitle': '투어 저장됨',
  'tourist.start.tourSavedDesc': '이제 지도에서 장소를 확인할 수 있습니다.',
  'tourist.start.qrDemoTitle': 'QR 스캔 (TODO)',
  'tourist.start.qrDemoDesc': '카메라 연동 예정.',
  'tourist.start.noGpsTitle': 'GPS 미지원',
  'tourist.start.noGpsDesc': '모바일 Chrome/Safari에서 시도해주세요.',
  'tourist.start.gpsOkTitle': 'GPS 활성화됨',
  'tourist.start.gpsOkDesc': '지도로 전환합니다…',
  'tourist.start.gpsDeniedTitle': '위치 권한 거부됨',
  'tourist.start.gpsDeniedDesc': '지도를 사용하려면 위치 권한을 허용해주세요.',
  'tourist.start.radiusSet': '반경이 {radius}m로 설정되었습니다',
  'tourist.start.radiusDesc': '(실제로는 관리자가 설정합니다)',
  'tourist.start.gpsDesc': '장소에 진입하면 음성과 텍스트가 자동 재생됩니다.',
  'tourist.start.pwaPill': 'PWA · 모바일 최우선',
  'tourist.map.title': '지도 및 근처 장소',
  'tourist.map.subtitle': '가상 지도와 실제 위치 정보가 사용됩니다.',
  'tourist.map.nearbyList': '근처 목록',
  'tourist.map.triggerUnder': '감지 ≤ {radius}m',
  'tourist.map.noGps': 'GPS 없음',
  'tourist.map.nearByToast': '근처 장소: ',
  'tourist.map.directionsTitle': '길찾기',
  'tourist.map.walking': '도보',
  'tourist.map.driving': '자동차',
  'tourist.map.cycling': '자전거',
  'tourist.map.mockRoute': '모의 경로',
  'tourist.poi.notFound': '장소를 찾을 수 없습니다',
  'tourist.poi.backToMap': '지도로 돌아가기',
  'tourist.poi.menuHighlights': '추천 메뉴',
  'tourist.poi.viewMenu': '전체 메뉴 보기',
  'tourist.poi.viewMenuDemoTitle': '메뉴 열기 (데모)',
  'tourist.poi.viewMenuDemoDesc': '메뉴 페이지 또는 PDF가 열립니다.',
  'tourist.poi.voucherTitle': '할인 및 바우처',
  'tourist.poi.copyVoucher': '바우처 코드 복사',
  'tourist.poi.copySuccess': '코드 복사됨',
  'tourist.poi.copyFailed': '복사 실패',
  'tourist.poi.noVoucher': '현재 사용 가능한 바우처가 없습니다.',
  'tourist.poi.navigateTo': '이곳으로 길찾기',
  'tourist.poi.navigateDemoTitle': '길찾기 (데모)',
  'tourist.poi.navigateDemoDesc': '구글 또는 애플 지도로 연결됩니다.',
  'tourist.poi.reviewsTitle': '리뷰',
  'tourist.poi.writeReview': '리뷰 쓰기',
  'tourist.poi.writeReviewDemo': '리뷰 제출 (데모)',
  'tourist.premium.title': 'Premium',
  'tourist.premium.subtitle': '결제 흐름 UI 데모입니다.',
  'tourist.premium.paymentMock': '결제 (모의)',
  'tourist.premium.buyNow': '지금 구매',
  'tourist.premium.restore': '복원',
  'tourist.premium.payDemo': '결제 (데모)',
  'tourist.premium.restoreDemo': '거래 복원 (데모)',
  'tourist.premium.plan1.name': 'Pro Tour',
  'tourist.premium.plan1.perks': '고급 장소 잠금 해제|오프라인 저장|광고 제거',
  'tourist.premium.plan2.name': 'Celebrity Voice',
  'tourist.premium.plan2.perks': '고음질 음성|자동 재생|우선 로딩',
  'tourist.premium.plan3.name': 'AI Voice+',
  'tourist.premium.plan3.perks': '다국어 TTS|음성 및 속도 조절|안정적인 품질',
  'merchant.title': '상인 콘솔',
  'admin.title': '관리자 콘솔',
  'common.overview': '개요',
}

export function t(lang: Language, key: I18nKey, vars?: Record<string, string | number>) {
  const dict = lang === 'vi' ? VI : lang === 'ja' ? JA : lang === 'zh' ? ZH : lang === 'ko' ? KO : EN
  const raw = dict[key] ?? key
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`))
}

