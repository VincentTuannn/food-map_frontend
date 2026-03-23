export type Poi = {
  id: string
  name: string
  category: 'food' | 'drink' | 'sight'
  imageUrl?: string
  lat: number
  lng: number
  rating: number
  priceLevel: 1 | 2 | 3
  tags: string[]
  short: {
    vi: string
    en: string
    ja: string
    zh: string
    ko: string
  }
  menuHighlights: string[]
  voucher?: {
    code: string
    description: string
    expiresAt: string
  }
  reviews: Array<{ author: string; stars: number; text: string }>
}

