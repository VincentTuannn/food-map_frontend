# Product Requirements Document (PRD) v1.0
## GPS Food Tour App - Food Map System

## Document Information

| Field | Value |
|---|---|
| Product Name | GPS Food Tour App |
| Version | 1.0 (MVP) |
| Document Date | 2026-03-21 |
| Status | Draft for Development |
| Owner | Product Owner / Business Analyst |
| Target Audience | Dev Team, QA, Stakeholders |

## 1. Executive Summary

### 1.1 Overview
GPS Food Tour App la he thong ban do tim quan an theo vi tri, giup nguoi dung kham pha mon ngon xung quanh, xem chi tiet quan, tao hanh trinh an uong theo chu de, va dieu huong den diem tiep theo. San pham gom:
- 1 ung dung nguoi dung cuoi (web/mobile web trong MVP)
- 1 API backend luu tru va tra cuu du lieu quan an, tour, danh gia
- 1 admin module nho de quan ly diem an va tour (co the trien khai o phase sau MVP)

### 1.2 Goals
- **Primary Goal:** Cung cap trai nghiem "tim do an gan toi" nhanh, chinh xac, va de su dung.
- **Secondary Goals:**
  - Tang ty le kham pha quan an moi thong qua ban do va de xuat theo vi tri.
  - Ho tro tour am thuc theo lo trinh de nguoi dung co hanh trinh ro rang.
  - Dam bao du lieu dia diem co chat luong (toa do, gio mo cua, gia tham khao).
  - Tao nen tang de mo rong loyalty, dat ban, va uu dai trong cac phien ban sau.

## 2. Scope Definition

### 2.1 In-Scope (MVP v1.0)

**Module 1: Authentication & User Profile**
- Dang ky / dang nhap bang email + mat khau
- Dang nhap voi Google (neu backend san sang OAuth trong MVP)
- Dang xuat
- Cap nhat ho so co ban (ten hien thi, avatar URL)

**Module 2: Nearby Discovery (Map + List)**
- Lay vi tri hien tai cua nguoi dung (co xin quyen)
- Hien thi quan an xung quanh tren ban do
- Chuyen doi ban do <-> danh sach
- Tim kiem theo ten mon / ten quan
- Loc theo loai mon, muc gia, khoang cach, rating

**Module 3: Food Place Details**
- Trang chi tiet quan an: ten, dia chi, gio mo cua, gia tham khao, menu tom tat, hinh anh
- Hien thi vi tri tren ban do mini
- Hien thi danh gia va diem trung binh
- Nut "Dan duong" (deep link Google Maps/Apple Maps)

**Module 4: GPS Food Tour**
- Danh sach tour am thuc co san (theo chu de: bua sang, street food, dem)
- Xem chi tiet tour (cac diem dung, tong thoi gian, tong quang duong uoc tinh)
- Bat dau tour: danh dau diem hien tai, goi y diem tiep theo theo thu tu
- Luu tien do tour trong phien lam viec

**Module 5: Favorites & Basic Reviews**
- Luu/bo luu quan an yeu thich
- Gui danh gia sao (1-5) + binh luan ngan
- Hien thi danh sach yeu thich cua toi

### 2.2 Out-of-Scope (Future Enhancements)
- Dat ban ban an, thanh toan online
- Giao do an
- Realtime crowd level / wait-time
- Loyalty points, voucher engine
- Gamification (badge, challenge)
- Offline map cache toan bo khu vuc
- Social feed / follow ban be
- Multi-city global expansion (MVP tap trung 1 thanh pho)

## 3. User Personas & Roles

### 3.1 Primary Persona: Urban Food Explorer
- Name: Linh Tran
- Age: 22-35
- Role: Nguoi dung ca nhan
- Technical Proficiency: Medium-High
- Goals:
  - Tim quan ngon gan vi tri hien tai trong 1-2 phut
  - Tranh quan dong, uu tien danh gia cao
  - Co lich trinh an uong ro rang khi di choi cuoi tuan
- Pain Points:
  - Qua nhieu lua chon khong duoc loc theo nhu cau
  - Danh gia khong dong nhat va kho kiem chung
  - Mat thoi gian doi app ban do + app review

### 3.2 Secondary Persona: Visitor/Tourist
- Name: David Nguyen
- Age: 25-45
- Goals:
  - Kham pha mon dia phuong theo tour ngon-bo-re
  - Co huong dan di chuyen den tung diem
  - Tranh "tourist trap"

### 3.3 Internal Persona: Content Admin (Phase 1.1+)
- Quan ly data quan an, anh, tour, category
- Kiem duyet report sai thong tin

## 4. User Stories

| ID | Module | User Story | Priority | Acceptance ID |
|---|---|---|---|---|
| US-001 | Auth | As a user, I want to sign up/sign in so that I can save my favorites and reviews | P0 | AC-001 |
| US-002 | Discovery | As a user, I want to see nearby food places on map so that I can quickly choose where to eat | P0 | AC-002 |
| US-003 | Discovery | As a user, I want to filter places by food type, price, distance, rating | P0 | AC-003 |
| US-004 | Place Detail | As a user, I want to view detailed place info before deciding | P0 | AC-004 |
| US-005 | Navigation | As a user, I want to open turn-by-turn navigation to selected place | P0 | AC-005 |
| US-006 | Tour | As a user, I want to browse themed food tours | P1 | AC-006 |
| US-007 | Tour | As a user, I want to start a tour and follow stop sequence | P1 | AC-007 |
| US-008 | Favorites | As a user, I want to save favorite places | P0 | AC-008 |
| US-009 | Reviews | As a user, I want to rate and comment on a place | P1 | AC-009 |
| US-010 | Profile | As a user, I want to manage my profile data | P2 | AC-010 |

**Priority Legend**
- P0 (Must): Bat buoc de launch MVP
- P1 (Should): Quan trong cho trai nghiem, nen co neu kip
- P2 (Could): Co the day sang post-MVP

## 5. Detailed Functional Requirements

### 5.1 Module 1: Authentication & Session

**FR-AUTH-001: Sign Up**
- Inputs: email, password, confirm password
- Validation:
  - Email dung dinh dang
  - Password >= 8 ky tu, co chu va so
  - Confirm password trung khop
- On success: tao tai khoan, tu dong dang nhap

**FR-AUTH-002: Sign In**
- Inputs: email + password (masked)
- On success: nhan access token + refresh token
- On failure: hien thi thong bao loi ro rang

**FR-AUTH-003: Session Management**
- Tu dong gia han session bang refresh token (neu cho phep)
- Dang xuat xoa token local + server-side invalidation (neu co)

### 5.2 Module 2: Nearby Discovery

**FR-DISC-001: Location Permission**
- Khi vao man hinh kham pha, app xin quyen truy cap vi tri.
- Neu tu choi quyen:
  - Cho phep nhap vi tri thu cong (quan/huyen hoặc dia chi)
  - Hien thi thong bao cach bat lai GPS

**FR-DISC-002: Map Rendering**
- Hien thi marker quan an trong ban kinh mac dinh 3km.
- Marker gom loai quan an, rating trung binh.
- Co nut "tim quanh day" de refresh theo vi tri moi.

**FR-DISC-003: List View + Sort**
- Danh sach dong bo voi marker tren map.
- Sap xep theo: khoang cach, rating, pho bien.

**FR-DISC-004: Filters**
- Filter theo:
  - Category: Pho, Bun, Com, Lau, Nuong, Cafe, Tra sua...
  - Price range: $, $$, $$$
  - Distance: <1km, 1-3km, 3-5km
  - Rating: >=3.5, >=4.0, >=4.5
- Filter ap dung realtime <= 500ms cho tap du lieu <= 500 diem.

### 5.3 Module 3: Place Detail

**FR-PLACE-001: Place Header**
- Ten quan, anh bia, diem danh gia, so review

**FR-PLACE-002: Core Information**
- Dia chi, gio mo cua, muc gia, loai mon, mo ta ngan
- Trang thai "Dang mo"/"Sap dong cua" (neu co openingHours)

**FR-PLACE-003: Menu Snapshot**
- Danh sach mon noi bat + gia tham khao (optional field)

**FR-PLACE-004: Action Buttons**
- Save favorite
- Open navigation
- Share deep link

### 5.4 Module 4: GPS Food Tour

**FR-TOUR-001: Tour List**
- Hien thi card tour: ten, so diem dung, thoi luong uoc tinh
- Co bo loc theo chu de va thoi gian (sang/trua/toi)

**FR-TOUR-002: Tour Detail**
- Hien thi thu tu cac stop (POI)
- Uoc tinh tong quang duong va tong thoi gian
- Y kien nguoi dung (neu co review cho tour)

**FR-TOUR-003: Start Tour**
- Trang thai tour: Not Started -> In Progress -> Completed
- Hien thi diem hien tai va diem tiep theo
- Cho phep bo qua 1 diem (skip stop) va tiep tuc

**FR-TOUR-004: Progress Tracking**
- Luu state trong local storage cho 1 thiet bi
- Khi mo lai app, cho phep "Resume tour"

### 5.5 Module 5: Favorites & Reviews

**FR-SAVE-001: Favorite Toggle**
- Moi place co icon heart save/unsave
- Dong bo ngay trong "My Favorites"

**FR-REV-001: Submit Review**
- Rating 1-5 bat buoc
- Comment toi da 500 ky tu
- 1 user chi duoc 1 review/place (cho phep edit)

**FR-REV-002: Review Display**
- Hien thi danh sach review moi nhat, co phan trang/co "load more"

## 6. Acceptance Criteria (Given-When-Then)

**AC-001: User Sign In**
- GIVEN toi o man hinh dang nhap
- WHEN toi nhap email/password hop le va bam "Dang nhap"
- THEN toi vao man hinh kham pha va thay danh sach quan an gan toi

**AC-002: Nearby on Map**
- GIVEN toi da cap quyen vi tri
- WHEN man hinh map tai xong
- THEN toi thay marker quan an trong ban kinh mac dinh

**AC-003: Filter by Price and Distance**
- GIVEN toi dang o man hinh discovery
- WHEN toi chon filter "$$" va "<3km"
- THEN chi cac quan phu hop duoc hien thi tren map/list

**AC-004: Place Detail**
- GIVEN toi chon 1 marker
- WHEN trang chi tiet mo ra
- THEN toi thay ten, dia chi, gio mo cua, danh gia, va nut dan duong

**AC-005: Open External Navigation**
- GIVEN toi dang o trang chi tiet quan
- WHEN toi bam "Dan duong"
- THEN app map ngoai mo dung toa do cua quan

**AC-006: Browse Tours**
- GIVEN toi vao tab Tours
- WHEN danh sach tai xong
- THEN toi thay it nhat ten tour, so diem dung, thoi luong

**AC-007: Start and Resume Tour**
- GIVEN toi bat dau 1 tour
- WHEN toi dong app va mo lai
- THEN toi co the resume o diem dang theo doi gan nhat

**AC-008: Save Favorite**
- GIVEN toi dang xem place card
- WHEN toi bam heart icon
- THEN place duoc them vao "My Favorites"

**AC-009: Submit Rating**
- GIVEN toi da dang nhap
- WHEN toi gui 5 sao + comment hop le
- THEN review moi xuat hien trong danh sach review cua place

**AC-010: Edit Profile**
- GIVEN toi o trang profile
- WHEN toi cap nhat ten hien thi va avatar URL hop le
- THEN thong tin moi duoc luu va hien thi nhat quan

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance
- NFR-PERF-001: Tai man hinh discovery ban dau <= 3s tren mang 4G on dinh.
- NFR-PERF-002: Phan hoi filter <= 500ms voi tap du lieu <= 500 places.
- NFR-PERF-003: Mo trang chi tiet place <= 2s.

### 7.2 Security
- NFR-SEC-001: Token luu an toan, khong expose qua URL.
- NFR-SEC-002: Tat ca API yeu cau auth phai kiem tra JWT hop le.
- NFR-SEC-003: Han che spam review co rate limit co ban.

### 7.3 Usability
- NFR-USE-001: Luong "Tim quan gan toi" khong qua 3 thao tac chinh.
- NFR-USE-002: Thong bao loi de hieu, ngan gon, huong dan cach khac phuc.

### 7.4 Reliability
- NFR-REL-001: Ti le crash-free sessions >= 99.5%.
- NFR-REL-002: Khong mat favorite/review da submit thanh cong.

### 7.5 Maintainability
- NFR-MAIN-001: TypeScript strict mode cho frontend/backend.
- NFR-MAIN-002: Tien hanh API versioning tu `/api/v1`.

### 7.6 Accessibility
- NFR-ACC-001: Muc tieu WCAG AA cho mau sac va contrast text chinh.
- NFR-ACC-002: Cac button/input quan trong co label ro rang.

## 8. Data Requirements

### 8.1 Food Place Data Model

```typescript
interface FoodPlace {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address: string;
  category: string[];
  priceLevel: 1 | 2 | 3;
  avgRating: number; // 0..5
  reviewCount: number;
  openingHours?: string;
  images: string[];
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 8.2 Tour Data Model

```typescript
interface FoodTour {
  id: string;
  name: string;
  description?: string;
  city: string;
  estimatedDurationMin: number;
  stopPlaceIds: string[]; // ordered
  tags: string[]; // e.g., street-food, breakfast
  image?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 8.3 Review Data Model

```typescript
interface Review {
  id: string;
  placeId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 8.4 User Data Model

```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  favoritePlaceIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

## 9. API Assumptions

### 9.1 Authentication Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### 9.2 Place Endpoints
- `GET /api/v1/places?lat=&lng=&radius=&category=&priceLevel=&ratingMin=`
- `GET /api/v1/places/:id`
- `POST /api/v1/places` (admin)
- `PUT /api/v1/places/:id` (admin)
- `DELETE /api/v1/places/:id` (admin)

### 9.3 Tour Endpoints
- `GET /api/v1/tours?city=&tag=`
- `GET /api/v1/tours/:id`
- `POST /api/v1/tours` (admin)
- `PUT /api/v1/tours/:id` (admin)
- `DELETE /api/v1/tours/:id` (admin)

### 9.4 Favorites & Reviews
- `GET /api/v1/me/favorites`
- `POST /api/v1/me/favorites/:placeId`
- `DELETE /api/v1/me/favorites/:placeId`
- `GET /api/v1/places/:id/reviews`
- `POST /api/v1/places/:id/reviews`
- `PUT /api/v1/places/:id/reviews/:reviewId`

### 9.5 API Conventions
- Base URL: `https://api.foodmap.example.com/api/v1`
- Auth: `Authorization: Bearer <token>`
- Success: `2xx` + JSON
- Error: `4xx/5xx` + `{ "error": "...", "code": "..." }`

## 10. UI/UX Specifications

### 10.1 Design Principles
- Mobile-first, map-first
- Mot tay thao tac duoc tren man hinh discovery
- Uu tien thong tin ra quyet dinh nhanh: rating, gia, khoang cach, trang thai mo cua

### 10.2 Key Screens
- Splash + Auth
- Discovery (Map/List switch)
- Place Detail
- Food Tour List + Tour Detail + In-progress tour
- Favorites
- Profile

### 10.3 Responsive Behavior
- Mobile: primary target
- Tablet: support day du
- Desktop web: support co ban cho QA/admin demo

### 10.4 Loading, Empty, Error States
- Skeleton cho list va place detail
- Empty state:
  - "Khong tim thay quan phu hop"
  - "Ban chua co dia diem yeu thich nao"
- Error state:
  - Loi mang: "Khong ket noi duoc. Vui long thu lai."
  - Loi quyen vi tri: "Ban da tat GPS. Hay bat lai de tim gan ban."

## 11. Business Rules

| ID | Rule Name | Description | Impact |
|---|---|---|---|
| BR-001 | Nearby Radius | Discovery default radius = 3km, toi da 20km | Dam bao ket qua lien quan, khong qua tai |
| BR-002 | Unique Review | Moi user chi co 1 review/place (co the cap nhat) | Tranh spam, diem rating tin cay hon |
| BR-003 | Tour Sequence | Thu tu `stopPlaceIds` la thu tu diem dung | Dam bao logic tour ro rang |
| BR-004 | Active Place Only | Place `isActive=false` khong hien thi cho end-user | Dam bao chat luong noi dung |
| BR-005 | Auth Required for Write | Favorite/review can dang nhap | Bao ve du lieu va truy vet hanh vi |

## 12. Technical Constraints

### 12.1 Technology Stack (Proposed)
- Frontend: React + TypeScript + Vite
- State/Data: TanStack Query + local storage cho tour progress
- Map: Google Maps SDK hoac Mapbox GL JS
- Backend: Node.js (NestJS/Express) + PostgreSQL + PostGIS
- Auth: JWT access + refresh tokens

### 12.2 Known Limitations (MVP)
- Du lieu geospatial co the chua day du o giai doan dau
- Chua co moderation pipeline cho review nang cao
- Khong co offline map toan bo

## 13. Dependencies & Integrations

### 13.1 External Dependencies
- Google Maps/Mapbox API (map, geocoding, routing deep links)
- Cloud image hosting (Cloudinary/S3)
- Email service (OTP/reset password neu co)

### 13.2 Internal Dependencies
- CMS/Admin for place & tour curation
- Data ops process de xac minh thong tin quan an

## 14. Risks & Mitigations

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-001 | Vi tri GPS sai lech o khu dong nha cao tang | Medium | Medium | Cho phep nhap dia chi thu cong + refresh vi tri |
| R-002 | Du lieu gio mo cua khong chinh xac | High | Medium | Them luong report sai thong tin, uu tien cap nhat dinh ky |
| R-003 | API map chi phi cao khi scale | Medium | High | Cache ket qua, toi uu truy van ban do, quota alerts |
| R-004 | Review spam/fake | Medium | High | 1 review/user/place, rate limit, co co che report |
| R-005 | Mat du lieu progress khi doi thiet bi | Low | Medium | Dong bo cloud o phase sau (MVP luu local) |

## 15. Open Questions

1. Co can uu tien iOS/Android native hay mobile web la du cho MVP?
2. Pham vi thanh pho launch dau tien la dau, va bo du lieu seed co san bao nhieu quan?
3. Co yeu cau moderation review thu cong truoc khi hien thi khong?
4. Co can tinh nang "best route optimization" ngay MVP hay de phase 2?
5. KPI launch uu tien la DAU, retention hay conversion den doi tac quan an?

## 16. Success Criteria & Acceptance

### 16.1 MVP Launch Checklist
- Toan bo user stories P0 hoat dong on dinh
- 100% AC-001 -> AC-005 pass UAT
- Khong con bug critical lien quan auth, map loading, favorite/review
- Data quality baseline dat yeu cau (toa do hop le, thong tin co ban day du)

### 16.2 Product KPIs (First 8 weeks)
- Time-to-first-place-click <= 90 giay (median)
- 7-day retention >= 20%
- >= 30% user co luu it nhat 1 favorite
- >= 15% user tu discovery mo external navigation

## 17. Future Enhancements (Post-MVP)

### Phase 2 (v1.1-v1.3)
- Route optimization theo traffic/time
- Voucher va deal theo vi tri
- On-device caching map khu vuc da xem
- Advanced profile + social sharing

### Phase 3 (v2.0)
- Native app iOS/Android
- Partner portal cho chu quan cap nhat menu/gio mo cua
- Recommendation engine ca nhan hoa theo hanh vi

## 18. Appendix

### 18.1 Glossary
- **POI:** Point of Interest (dia diem quan an)
- **Food Tour:** Lo trinh gom nhieu POI theo chu de
- **MVP:** Ban phat hanh toi thieu de kiem chung gia tri
- **Geo-query:** Truy van du lieu theo vi tri/khoang cach

### 18.2 Related Documents
- Backend note: `food-map_backend/README.md` (mo ta tong quan he thong food map)
- PRD structure reference: `PRD_GPS_Admin_v1.0.pdf`

### 18.3 Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-03-21 | AI Assistant + Product Input | Initial PRD draft |

### 18.4 Approval Sign-Off
- Product Owner: [Name]
- Tech Lead: [Name]
- QA Lead: [Name]
- Stakeholder: [Name]

## 19. Contact & Feedback
- Product Owner: [email]
- Engineering Lead: [email]
- Issue Tracker: [Jira/GitHub link]

End of Document
