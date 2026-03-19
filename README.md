# food-map_frontend

Frontend (React + Vite) cho hệ thống **Food Map / Tour Guide PWA**.

## Chạy local

```bash
npm install
npm run dev
```

## Cấu trúc thư mục (để dễ merge với Backend)

- `src/api/`: HTTP client + service wrappers theo từng Backend service (Identity/Location/Content/Promotion/Analytics/Payment)
- `src/features/`: theo Actor / luồng chức năng
  - `tourist/`: User (Du khách)
  - `merchant/`: Quán ăn (B2B) (placeholder)
  - `admin/`: Admin (placeholder)
- `src/shared/`: code dùng chung (ui, store, domain types, lib, mock)

## Environment

Copy `.env.example` → `.env.local` và chỉnh URL backend:

```txt
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCKS=true
```

## Mapping API (backend team)

Các hàm gọi API nằm ở:
- `src/api/services/identity.ts`
- `src/api/services/location.ts`
- `src/api/services/content.ts`
- `src/api/services/promotion.ts`
- `src/api/services/analytics.ts`
- `src/api/services/payment.ts`

