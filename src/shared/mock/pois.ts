import type { Poi } from '../domain/poi'

// Mock data (demo). Replace by API: Location & POI Service (PostGIS).
export const POIS: Poi[] = [
  {
    id: 'pho-minh',
    name: 'Phở Minh (Hồ Gươm)',
    category: 'food',
    lat: 21.0286,
    lng: 105.8524,
    rating: 4.6,
    priceLevel: 2,
    tags: ['Phở', 'Local', 'Quick'],
    short: {
      vi: 'Quán phở bò truyền thống, nước dùng trong, thơm quế hồi.',
      en: 'Classic beef pho with a clear, fragrant broth.',
      ja: '伝統的な牛肉フォー。澄んだスープが香り高い。',
    },
    menuHighlights: ['Phở tái', 'Phở chín', 'Quẩy nóng'],
    voucher: {
      code: 'PHOMINH10',
      description: 'Giảm 10% cho tô đầu tiên (áp dụng sau 17:00).',
      expiresAt: '2026-06-30',
    },
    reviews: [
      { author: 'Linh', stars: 5, text: 'Nước dùng đậm, không ngấy. Sẽ quay lại.' },
      { author: 'Tom', stars: 4, text: 'Tasty pho, quick service. A bit crowded.' },
    ],
  },
  {
    id: 'ca-phe-pho-co',
    name: 'Cà phê Phố Cổ',
    category: 'drink',
    lat: 21.0331,
    lng: 105.8507,
    rating: 4.4,
    priceLevel: 1,
    tags: ['Coffee', 'View', 'Egg coffee'],
    short: {
      vi: 'Trứng cà phê béo mịn, view phố cổ từ ban công.',
      en: 'Creamy egg coffee with a balcony Old Quarter view.',
      ja: '濃厚なエッグコーヒー。旧市街を見下ろせる。',
    },
    menuHighlights: ['Cà phê trứng', 'Bạc xỉu', 'Cacao nóng'],
    reviews: [
      { author: 'Mai', stars: 5, text: 'Trứng thơm, không tanh. View đẹp.' },
      { author: 'Ken', stars: 4, text: 'Great egg coffee. Seating is limited.' },
    ],
  },
  {
    id: 'bun-cha-34',
    name: 'Bún chả 34',
    category: 'food',
    lat: 21.0308,
    lng: 105.8478,
    rating: 4.7,
    priceLevel: 2,
    tags: ['Bún chả', 'Grill', 'Family'],
    short: {
      vi: 'Thịt nướng than hoa, nước chấm vừa miệng, rau đầy đặn.',
      en: 'Charcoal grilled pork with balanced dipping sauce.',
      ja: '炭火焼きの豚肉。つけだれが絶妙。',
    },
    menuHighlights: ['Suất đặc biệt', 'Nem cua bể', 'Trà đá'],
    voucher: {
      code: 'BUNCHA5',
      description: 'Giảm 5% khi check-in (ảnh + review).',
      expiresAt: '2026-05-15',
    },
    reviews: [
      { author: 'Hà', stars: 5, text: 'Thịt thơm, nước chấm ngon. Đi sớm đỡ đông.' },
      { author: 'Sarah', stars: 5, text: 'Best bun cha I had in Hanoi.' },
    ],
  },
]

