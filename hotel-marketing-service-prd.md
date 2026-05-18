# 호텔 마케팅 상품 관리 서비스 PRD

- 문서 버전: 1.0.0
- 작성일: 2026-05-18
- 대상 개발 환경: Codex / Next.js / Supabase / Vercel
- 기본 문자 인코딩: UTF-8
- 서비스명 가칭: StayBoost Admin

---

## 1. 제품 개요

### 1.1 목적

호텔 마케팅 대행 상품을 등록, 수정, 판매 관리하고, 계약 호텔별 결제 상품과 진행 업무 일정을 통합 관리하는 내부 운영용 웹 서비스를 개발한다.

이 서비스는 다음 운영 문제를 해결한다.

1. 마케팅 상품 패키지와 세부 항목을 한 곳에서 관리한다.
2. 계약 호텔 정보를 구조화하여 관리한다.
3. 호텔별 결제 상품과 실제 진행 업무를 연결한다.
4. 진행 업무의 시작일, 종료일, 특이사항을 관리한다.
5. 전체 진행 일정을 달력에서 한눈에 확인한다.
6. Google 계정 로그인 기반으로 접근 권한을 제한한다.

### 1.2 핵심 사용자

| 사용자 | 설명 | 권한 |
|---|---|---|
| 어드민 | `resumet@gmail.com` | 전체 기능 접근, 로그인 요청 승인/거절, 상품/호텔/업무 전체 CRUD |
| 승인된 사용자 | 어드민이 승인한 Google 계정 | 기본적으로 전체 운영 데이터 조회 및 CRUD 가능. 추후 역할 분리 가능하도록 DB 설계 |
| 미승인 사용자 | Google 로그인은 했지만 승인되지 않은 계정 | 접근 불가. 로그인 요청 상태 화면만 확인 가능 |

### 1.3 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui 권장 |
| 인증 | Supabase Auth + Google OAuth Provider |
| DB | Supabase Postgres |
| 파일 저장 | Supabase Storage |
| 배포 | GitHub → Vercel 자동 배포 |
| 캘린더 UI | FullCalendar 또는 React Big Calendar |
| 폼 검증 | React Hook Form + Zod |
| 날짜 처리 | date-fns |

---

## 2. 주요 요구사항 요약

### 2.1 인증 및 승인 플로우

1. 사용자는 Google 계정으로 로그인한다.
2. 로그인 계정이 `resumet@gmail.com`이면 자동으로 어드민 권한을 가진다.
3. 다른 Google 계정이 처음 로그인하면 `pending` 상태의 로그인 요청이 생성된다.
4. 미승인 사용자는 서비스 내부 페이지에 접근할 수 없다.
5. 어드민 대시보드에는 로그인 요청 목록이 표시된다.
6. 어드민은 요청을 승인 또는 거절할 수 있다.
7. 승인된 계정만 대시보드, 상품, 호텔, 업무 페이지에 접근할 수 있다.

### 2.2 상품 관리

1. 마케팅 상품 패키지를 생성, 조회, 수정, 삭제할 수 있다.
2. 상품 안에 여러 개의 세부 항목을 추가할 수 있다.
3. 세부 항목에는 이름, 가격, 가격 표시 문구, 설명, 정렬 순서를 입력할 수 있다.
4. 초기 기본 상품으로 아래 3개 패키지를 seed 데이터로 등록한다.
   - 초기 세팅 패키지
   - 디럭스 패키지
   - 프리미엄 패키지
5. 기본 상품 외에도 새 상품을 추가하고 수정할 수 있어야 한다.

### 2.3 계약 호텔 관리

계약 호텔 정보를 생성, 조회, 수정, 삭제할 수 있다.

필수 관리 항목:

- 호텔명
- 대표자 이름
- 사업자번호
- 사업자등록증 업로드
- 대표자 전화번호
- 호텔 주소
- 호텔 전화번호
- 기타 특이사항
- 호텔 사진 관리 폴더 URL

### 2.4 업무 관리

업무 페이지에서 다음 기능을 제공한다.

1. 호텔 선택
2. 결제한 상품 추가
3. 진행중인 업무 추가/삭제/수정
4. 업무별 시작일, 종료일, 특이사항 입력
5. 업무 상태 관리
6. 호텔별 업무 목록 필터링
7. 상품별 업무 자동 생성 또는 수동 생성 지원

### 2.5 전체 대시보드

1. 진행중인 모든 업무 일정을 달력에 표시한다.
2. 달력에서 업무명, 호텔명, 기간, 상태를 확인한다.
3. 달력 항목 클릭 시 업무 상세 또는 편집 화면으로 이동한다.
4. 상태별 필터, 호텔별 필터를 제공한다.

---

## 3. 페이지 구조

```txt
/
├─ /login
├─ /auth/callback
├─ /pending-approval
├─ /dashboard
├─ /admin/login-requests
├─ /products
│  ├─ /products/new
│  └─ /products/[id]
├─ /hotels
│  ├─ /hotels/new
│  └─ /hotels/[id]
├─ /work
│  ├─ /work/new
│  └─ /work/[id]
└─ /settings
```

### 3.1 `/login`

Google 로그인 버튼을 제공한다.

기능:

- Supabase Google OAuth 로그인 시작
- 이미 로그인된 사용자는 권한 상태에 따라 redirect
  - 승인됨: `/dashboard`
  - 승인 대기: `/pending-approval`
  - 거절됨: `/pending-approval?status=rejected`

### 3.2 `/pending-approval`

미승인 사용자에게 표시되는 대기 화면이다.

표시 내용:

- 현재 로그인 이메일
- 승인 상태: 대기중 / 거절됨
- “관리자 승인 후 이용할 수 있습니다.” 안내 문구
- 로그아웃 버튼

### 3.3 `/dashboard`

전체 운영 현황과 일정 달력을 표시한다.

구성:

- 상단 요약 카드
  - 계약 호텔 수
  - 진행중 업무 수
  - 이번 달 종료 예정 업무 수
  - 승인 대기 로그인 요청 수. 어드민만 표시
- 전체 일정 캘린더
- 최근 등록 호텔
- 최근 수정 업무

### 3.4 `/admin/login-requests`

어드민 전용 페이지다.

기능:

- 로그인 요청 목록 조회
- 상태 필터: 대기중 / 승인됨 / 거절됨
- 요청자 이메일, 이름, 요청일 표시
- 승인 버튼
- 거절 버튼
- 승인 취소 또는 비활성화 기능은 선택 사항으로 제공

### 3.5 `/products`

상품 목록 페이지다.

기능:

- 상품 목록 카드 또는 테이블 표시
- 상품명, 부제목, 활성 상태, 세부 항목 수 표시
- 상품 추가 버튼
- 상품 수정 버튼
- 상품 삭제 버튼
- 활성/비활성 토글

### 3.6 `/products/new`, `/products/[id]`

상품 생성/수정 페이지다.

입력 항목:

| 필드 | 타입 | 필수 | 설명 |
|---|---:|---:|---|
| 상품명 | text | Y | 예: 초기 세팅 패키지 |
| 부제목 | text | N | 예: 성장을 위한 견고한 토대 마련 |
| 설명 | textarea | N | 내부 설명 |
| 활성 상태 | boolean | Y | 판매/운영 사용 여부 |
| 정렬 순서 | number | N | 목록 표시 순서 |

세부 항목 입력:

| 필드 | 타입 | 필수 | 설명 |
|---|---:|---:|---|
| 항목명 | text | Y | 예: 홈페이지 제작 및 도메인 설정 |
| 금액 | number | N | 계산용 숫자. 포함/실비청구 등은 null 허용 |
| 표시 금액 | text | Y | 예: 200,000 / 포함 / 필요시 출장실비 청구 / 550,000 ~ |
| 설명 | textarea | N | 항목 상세 설명 |
| 정렬 순서 | number | N | 패키지 내 표시 순서 |

### 3.7 `/hotels`

계약 호텔 목록 페이지다.

기능:

- 호텔 목록 테이블
- 호텔명, 대표자, 사업자번호, 호텔 전화번호, 주소, 등록일 표시
- 검색: 호텔명, 대표자명, 사업자번호
- 호텔 추가 버튼
- 상세/수정 진입

### 3.8 `/hotels/new`, `/hotels/[id]`

호텔 정보 생성/수정 페이지다.

입력 항목:

| 필드 | 타입 | 필수 | 설명 |
|---|---:|---:|---|
| 호텔명 | text | Y | 계약 호텔 이름 |
| 대표자 이름 | text | Y | 사업자 대표 이름 |
| 사업자번호 | text | Y | 숫자와 하이픈 허용 |
| 사업자등록증 | file | N | PDF/JPG/PNG 업로드 |
| 대표자 전화번호 | text | Y | 휴대폰 번호 |
| 호텔 주소 | text | Y | 주소 |
| 호텔 전화번호 | text | N | 대표 전화번호 |
| 기타 특이사항 | textarea | N | 운영 메모 |
| 호텔 사진 관리 폴더 URL | url | N | Google Drive, Dropbox 등 외부 폴더 URL |

파일 업로드 정책:

- Supabase Storage bucket: `business-licenses`
- 허용 확장자: pdf, jpg, jpeg, png, webp
- 최대 용량: 10MB
- 업로드 파일명은 `hotel_id/timestamp-original_filename` 형태 권장

### 3.9 `/work`

업무 목록 및 관리 페이지다.

기능:

- 호텔 필터
- 상품 필터
- 상태 필터
- 기간 필터
- 업무 추가 버튼
- 업무 테이블 표시

표시 컬럼:

- 호텔명
- 결제 상품명
- 업무명
- 시작일
- 종료일
- 상태
- 특이사항 요약
- 수정 버튼

### 3.10 `/work/new`, `/work/[id]`

업무 생성/수정 페이지다.

입력 항목:

| 필드 | 타입 | 필수 | 설명 |
|---|---:|---:|---|
| 호텔 | select | Y | 계약 호텔 선택 |
| 결제 상품 | select | N | 해당 호텔에 연결된 구매 상품 선택 |
| 업무명 | text | Y | 예: 구글 리뷰 등록 10건 |
| 업무 설명 | textarea | N | 세부 설명 |
| 시작일 | date | Y | 일정 시작일 |
| 종료일 | date | Y | 일정 종료일 |
| 상태 | select | Y | 예정/진행중/보류/완료/취소 |
| 특이사항 | textarea | N | 진행 메모 |

---

## 4. 데이터 모델

### 4.1 ERD 개요

```txt
profiles
  └─ login_requests

products
  └─ product_items

hotels
  ├─ hotel_purchased_products
  │    └─ work_items
  └─ work_items

storage.objects
  └─ hotels.business_license_file_path
```

### 4.2 테이블: `profiles`

Supabase Auth 사용자를 서비스 사용자로 확장한다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK, auth.users.id 참조 | 사용자 ID |
| email | text | unique, not null | Google 계정 이메일 |
| full_name | text | nullable | Google 프로필 이름 |
| avatar_url | text | nullable | Google 프로필 이미지 |
| role | text | not null default 'user' | `admin`, `user` |
| approval_status | text | not null default 'pending' | `approved`, `pending`, `rejected` |
| approved_at | timestamptz | nullable | 승인 시각 |
| approved_by | uuid | nullable | 승인한 어드민 ID |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

규칙:

- `email = 'resumet@gmail.com'`인 경우 `role = 'admin'`, `approval_status = 'approved'`로 자동 설정한다.
- 그 외 이메일은 `role = 'user'`, `approval_status = 'pending'`으로 생성한다.

### 4.3 테이블: `login_requests`

비어드민 사용자의 로그인 승인 요청을 관리한다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 요청 ID |
| user_id | uuid | FK profiles.id | 요청 사용자 |
| email | text | not null | 요청 이메일 |
| full_name | text | nullable | 요청자 이름 |
| status | text | not null default 'pending' | `pending`, `approved`, `rejected` |
| requested_at | timestamptz | default now() | 요청 시각 |
| reviewed_at | timestamptz | nullable | 처리 시각 |
| reviewed_by | uuid | nullable | 처리자 |
| review_note | text | nullable | 거절/승인 메모 |

중복 방지:

- `user_id` 기준으로 active 요청은 1개만 유지한다.

### 4.4 테이블: `products`

마케팅 상품 패키지 테이블이다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 상품 ID |
| name | text | not null | 상품명 |
| subtitle | text | nullable | 부제목 |
| description | text | nullable | 설명 |
| is_active | boolean | default true | 활성 여부 |
| sort_order | int | default 0 | 정렬 순서 |
| created_by | uuid | FK profiles.id | 생성자 |
| updated_by | uuid | FK profiles.id | 수정자 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

### 4.5 테이블: `product_items`

상품에 포함되는 세부 항목이다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 항목 ID |
| product_id | uuid | FK products.id on delete cascade | 상품 ID |
| name | text | not null | 항목명 |
| price_amount | integer | nullable | 숫자 금액. 계산이 어려운 항목은 null |
| price_label | text | not null | 표시 금액 |
| description | text | nullable | 설명 |
| sort_order | int | default 0 | 정렬 순서 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

가격 저장 기준:

- `200,000` → `price_amount = 200000`, `price_label = '200,000'`
- `550,000 ~` → `price_amount = 550000`, `price_label = '550,000 ~'`
- `포함` → `price_amount = null`, `price_label = '포함'`
- `필요시 출장실비 청구` → `price_amount = null`, `price_label = '필요시 출장실비 청구'`

### 4.6 테이블: `hotels`

계약 호텔 정보 테이블이다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 호텔 ID |
| name | text | not null | 호텔명 |
| owner_name | text | not null | 대표자 이름 |
| business_number | text | not null | 사업자번호 |
| business_license_file_path | text | nullable | 사업자등록증 Storage path |
| owner_phone | text | not null | 대표자 전화번호 |
| address | text | not null | 호텔 주소 |
| hotel_phone | text | nullable | 호텔 전화번호 |
| notes | text | nullable | 기타 특이사항 |
| photo_folder_url | text | nullable | 호텔 사진 관리 폴더 URL |
| is_active | boolean | default true | 계약 활성 여부 |
| created_by | uuid | FK profiles.id | 생성자 |
| updated_by | uuid | FK profiles.id | 수정자 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

### 4.7 테이블: `hotel_purchased_products`

호텔이 결제한 상품을 기록한다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 구매 상품 ID |
| hotel_id | uuid | FK hotels.id on delete cascade | 호텔 ID |
| product_id | uuid | FK products.id | 상품 ID |
| purchased_at | date | nullable | 결제일 또는 계약일 |
| price_amount | integer | nullable | 실제 결제 금액 |
| price_label | text | nullable | 표시 금액 |
| status | text | default 'active' | `active`, `completed`, `cancelled` |
| notes | text | nullable | 결제/계약 메모 |
| created_by | uuid | FK profiles.id | 생성자 |
| updated_by | uuid | FK profiles.id | 수정자 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

### 4.8 테이블: `work_items`

호텔별 진행 업무를 관리한다.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | 업무 ID |
| hotel_id | uuid | FK hotels.id on delete cascade | 호텔 ID |
| purchased_product_id | uuid | FK hotel_purchased_products.id nullable | 결제 상품 ID |
| product_item_id | uuid | FK product_items.id nullable | 원본 상품 세부 항목 ID |
| title | text | not null | 업무명 |
| description | text | nullable | 업무 설명 |
| status | text | not null default 'scheduled' | 업무 상태 |
| start_date | date | not null | 시작일 |
| end_date | date | not null | 종료일 |
| notes | text | nullable | 특이사항 |
| sort_order | int | default 0 | 정렬 순서 |
| created_by | uuid | FK profiles.id | 생성자 |
| updated_by | uuid | FK profiles.id | 수정자 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now() | 수정 시각 |

업무 상태 enum 권장:

| 값 | 한글 표시 |
|---|---|
| scheduled | 예정 |
| in_progress | 진행중 |
| on_hold | 보류 |
| completed | 완료 |
| cancelled | 취소 |

---

## 5. Supabase SQL 초안

Codex는 `supabase/migrations/0001_init.sql` 파일을 생성하고 아래 구조를 기반으로 migration을 작성한다.

```sql
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  approval_status text not null default 'pending' check (approval_status in ('approved', 'pending', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.login_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  full_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  review_note text
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_amount integer,
  price_label text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null,
  business_number text not null,
  business_license_file_path text,
  owner_phone text not null,
  address text not null,
  hotel_phone text,
  notes text,
  photo_folder_url text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hotel_purchased_products (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  product_id uuid not null references public.products(id),
  purchased_at date,
  price_amount integer,
  price_label text,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  notes text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  purchased_product_id uuid references public.hotel_purchased_products(id) on delete set null,
  product_item_id uuid references public.product_items(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date not null,
  end_date date not null,
  notes text,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create index idx_products_active_sort on public.products(is_active, sort_order);
create index idx_product_items_product_sort on public.product_items(product_id, sort_order);
create index idx_hotels_name on public.hotels(name);
create index idx_work_items_dates on public.work_items(start_date, end_date);
create index idx_work_items_hotel on public.work_items(hotel_id);
create index idx_login_requests_status on public.login_requests(status, requested_at);
```

---

## 6. 인증 및 권한 정책

### 6.1 어드민 계정

고정 어드민 이메일:

```txt
resumet@gmail.com
```

환경변수로도 관리한다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=resumet@gmail.com
NEXT_PUBLIC_SITE_URL=
```

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용한다.
- 클라이언트 번들에 노출하면 안 된다.

### 6.2 로그인 후 프로필 생성 로직

Supabase Auth 로그인 완료 후 서버 액션 또는 API route에서 다음을 수행한다.

1. `auth.getUser()`로 현재 사용자 확인
2. `profiles`에서 사용자 조회
3. 없으면 생성
   - 이메일이 `ADMIN_EMAIL`과 같으면 admin/approved
   - 아니면 user/pending
4. 일반 사용자이면 `login_requests`에 pending 요청 생성
5. 승인 상태에 따라 redirect

### 6.3 접근 제어

Middleware 또는 서버 레이아웃에서 처리한다.

접근 규칙:

| 상태 | 접근 가능 페이지 |
|---|---|
| 미로그인 | `/login`, `/auth/callback` |
| pending | `/pending-approval` |
| rejected | `/pending-approval` |
| approved user | `/dashboard`, `/products`, `/hotels`, `/work` |
| admin | 전체 페이지 |

### 6.4 RLS 정책 방향

Supabase RLS를 모든 테이블에 활성화한다.

정책 원칙:

1. `profiles.approval_status = 'approved'`인 사용자는 운영 데이터 조회 가능
2. 승인된 사용자는 운영 데이터 생성/수정/삭제 가능
3. 로그인 요청 승인/거절은 admin만 가능
4. `profiles`의 role 변경은 admin만 가능
5. 미승인 사용자는 본인 `profiles`와 본인 `login_requests`만 조회 가능

권장 helper function:

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and approval_status = 'approved'
  );
$$;

create or replace function public.is_approved_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and approval_status = 'approved'
  );
$$;
```

---

## 7. 초기 상품 Seed 데이터

Codex는 `supabase/seed.sql` 또는 seed script에 아래 데이터를 넣는다.

### 7.1 초기 세팅 패키지

- 상품명: 초기 세팅 패키지
- 부제목: 성장을 위한 견고한 토대 마련

| 항목명 | 금액 | 표시 금액 |
|---|---:|---|
| 홈페이지 제작 및 도메인 설정 | 200000 | 200,000 |
| 네이버 구글 SEO 최적화 | 200000 | 200,000 |
| 현장 출장 & 사진 촬영 | 550000 | 550,000 ~ |
| 구글 리뷰 (초기 15건) | 250000 | 250,000 |
| 여행 인플루언서 기자단 (5건) | 1200000 | 1,200,000 |

### 7.2 디럭스 패키지

- 상품명: 디럭스 패키지
- 부제목: 지속적인 유입과 대세감 형성

| 항목명 | 금액 | 표시 금액 |
|---|---:|---|
| 구글 리뷰 등록 (10건) | 200000 | 200,000 |
| 인플루언서 기자단 (5건) | 900000 | 900,000 |
| 홈페이지 무료 유지보수 | 30000 | 30,000 |
| 월간 성과 분석 리포트 | null | 포함 |
| 추가 사진촬영 | null | 필요시 출장실비 청구 |

### 7.3 프리미엄 패키지

- 상품명: 프리미엄 패키지
- 부제목: 브랜드 신뢰와 상위 노출을 함께 강화

| 항목명 | 금액 | 표시 금액 |
|---|---:|---|
| 구글 리뷰 등록 (20건) | 250000 | 250,000 |
| 인플루언서 기자단 (10건) | 1200000 | 1,200,000 |
| 홈페이지 무료 유지보수 | 30000 | 30,000원 |
| 월간 성과 분석 리포트 | null | 포함 |
| 추가 사진촬영 | null | 필요시 출장실비 청구 |

---

## 8. 주요 사용자 시나리오

### 8.1 어드민 최초 접속

1. 어드민이 `/login` 접속
2. Google 로그인 클릭
3. `resumet@gmail.com`으로 로그인
4. 시스템이 자동으로 `profiles`에 admin/approved 생성
5. `/dashboard`로 이동
6. 기본 상품 seed 데이터 확인

### 8.2 일반 사용자 로그인 요청

1. 일반 사용자가 Google 로그인
2. 시스템이 `profiles`에 user/pending 생성
3. `login_requests`에 pending 요청 생성
4. 사용자는 `/pending-approval` 화면으로 이동
5. 어드민은 `/admin/login-requests`에서 요청 확인
6. 승인 클릭
7. 사용자는 재접속 또는 새로고침 후 `/dashboard` 접근 가능

### 8.3 새 상품 추가

1. 어드민 또는 승인된 사용자가 `/products` 접속
2. “상품 추가” 클릭
3. 상품명, 부제목 입력
4. 세부 항목 여러 개 추가
5. 저장
6. 상품 목록에 표시

### 8.4 계약 호텔 등록

1. `/hotels/new` 접속
2. 호텔 기본 정보 입력
3. 사업자등록증 업로드
4. 호텔 사진 관리 폴더 URL 입력
5. 저장
6. 호텔 상세 페이지에서 정보 확인

### 8.5 호텔에 결제 상품 추가 및 업무 생성

1. 호텔 상세 페이지 또는 업무 페이지에서 호텔 선택
2. “결제 상품 추가” 클릭
3. 상품 선택: 예: 디럭스 패키지
4. 결제일, 실제 결제 금액, 메모 입력
5. 저장 시 선택한 상품의 세부 항목을 기준으로 업무 자동 생성 여부를 묻는다.
6. 자동 생성 선택 시 `product_items` 항목별로 `work_items` 생성
7. 각 업무에 시작일, 종료일, 상태, 특이사항 입력

### 8.6 전체 일정 확인

1. `/dashboard` 접속
2. 전체 업무 달력 확인
3. 특정 일정 클릭
4. 업무 상세/수정 페이지로 이동
5. 일정 또는 상태 수정

---

## 9. UI/UX 요구사항

### 9.1 공통 레이아웃

- 좌측 사이드바 또는 상단 내비게이션 제공
- 메뉴:
  - 대시보드
  - 상품 관리
  - 호텔 관리
  - 업무 관리
  - 로그인 요청. 어드민만
  - 설정
- 모바일에서도 기본 조회와 수정이 가능해야 한다.
- 한국어 UI를 기본으로 한다.
- 모든 파일과 소스코드는 UTF-8로 저장한다.

### 9.2 상태 배지

업무 상태는 색상 배지로 표시한다.

| 상태 | 표시명 | 의미 |
|---|---|---|
| scheduled | 예정 | 아직 시작 전 |
| in_progress | 진행중 | 현재 진행 중 |
| on_hold | 보류 | 일시 중단 |
| completed | 완료 | 완료됨 |
| cancelled | 취소 | 취소됨 |

### 9.3 달력 표시

캘린더 항목 제목 형식:

```txt
[호텔명] 업무명
```

캘린더 항목 클릭 시 표시:

- 호텔명
- 업무명
- 상태
- 시작일
- 종료일
- 특이사항
- 수정 버튼

필터:

- 호텔 필터
- 상태 필터
- 기간 필터

---

## 10. API / Server Action 설계

Next.js App Router 기준으로 Route Handler 또는 Server Action 중 하나를 선택한다. Codex는 일관성을 위해 Server Action 중심 구현을 권장한다.

### 10.1 인증 관련

| 기능 | 권장 경로/액션 | 설명 |
|---|---|---|
| OAuth callback 처리 | `/auth/callback/route.ts` | Supabase 세션 교환 후 프로필 생성 |
| 현재 사용자 조회 | `getCurrentProfile()` | 서버에서 profile과 권한 조회 |
| 승인 요청 목록 | `getLoginRequests()` | admin 전용 |
| 승인 처리 | `approveLoginRequest(id)` | admin 전용 |
| 거절 처리 | `rejectLoginRequest(id, note)` | admin 전용 |

### 10.2 상품 관련

| 기능 | 액션 |
|---|---|
| 상품 목록 조회 | `getProducts()` |
| 상품 상세 조회 | `getProduct(id)` |
| 상품 생성 | `createProduct(input)` |
| 상품 수정 | `updateProduct(id, input)` |
| 상품 삭제 | `deleteProduct(id)` |
| 상품 활성 토글 | `toggleProductActive(id)` |

### 10.3 호텔 관련

| 기능 | 액션 |
|---|---|
| 호텔 목록 조회 | `getHotels(filters)` |
| 호텔 상세 조회 | `getHotel(id)` |
| 호텔 생성 | `createHotel(input)` |
| 호텔 수정 | `updateHotel(id, input)` |
| 호텔 삭제 또는 비활성화 | `deactivateHotel(id)` |
| 사업자등록증 업로드 | `uploadBusinessLicense(file, hotelId)` |

### 10.4 업무 관련

| 기능 | 액션 |
|---|---|
| 호텔 결제 상품 추가 | `createHotelPurchasedProduct(input)` |
| 결제 상품 목록 조회 | `getHotelPurchasedProducts(hotelId)` |
| 업무 목록 조회 | `getWorkItems(filters)` |
| 업무 생성 | `createWorkItem(input)` |
| 업무 수정 | `updateWorkItem(id, input)` |
| 업무 삭제 | `deleteWorkItem(id)` |
| 상품 항목 기반 업무 자동 생성 | `createWorkItemsFromProduct(purchasedProductId)` |
| 캘린더용 업무 조회 | `getCalendarWorkItems(filters)` |

---

## 11. 폴더 구조 제안

```txt
src/
├─ app/
│  ├─ login/
│  ├─ auth/callback/
│  ├─ pending-approval/
│  ├─ dashboard/
│  ├─ admin/login-requests/
│  ├─ products/
│  ├─ hotels/
│  ├─ work/
│  └─ settings/
├─ components/
│  ├─ layout/
│  ├─ auth/
│  ├─ products/
│  ├─ hotels/
│  ├─ work/
│  ├─ calendar/
│  └─ ui/
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts
│  │  ├─ server.ts
│  │  └─ middleware.ts
│  ├─ auth.ts
│  ├─ validations/
│  └─ utils.ts
├─ actions/
│  ├─ auth-actions.ts
│  ├─ product-actions.ts
│  ├─ hotel-actions.ts
│  └─ work-actions.ts
└─ types/
   └─ database.types.ts

supabase/
├─ migrations/
│  └─ 0001_init.sql
└─ seed.sql
```

---

## 12. 검증 규칙

### 12.1 상품 검증

- 상품명은 필수다.
- 세부 항목은 0개 이상 허용한다.
- 세부 항목명은 필수다.
- 표시 금액은 필수다.
- 숫자 금액은 0 이상 정수 또는 null이다.

### 12.2 호텔 검증

- 호텔명, 대표자 이름, 사업자번호, 대표자 전화번호, 호텔 주소는 필수다.
- 사업자번호는 숫자와 하이픈만 허용한다.
- 전화번호는 숫자, 하이픈, 공백, 괄호를 허용한다.
- 호텔 사진 관리 폴더 URL은 URL 형식이어야 한다. 빈 값은 허용한다.
- 사업자등록증 파일은 허용 확장자와 용량을 검사한다.

### 12.3 업무 검증

- 호텔 선택은 필수다.
- 업무명은 필수다.
- 시작일과 종료일은 필수다.
- 종료일은 시작일보다 빠를 수 없다.
- 상태는 정의된 enum 값만 허용한다.

---

## 13. 배포 요구사항

### 13.1 GitHub

- GitHub repository에 Next.js 프로젝트를 생성한다.
- main 브랜치를 기준으로 Vercel에 연결한다.
- PR 단위로 변경사항을 관리한다.

### 13.2 Vercel

Vercel 프로젝트 환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=resumet@gmail.com
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 13.3 Supabase Auth 설정

Supabase Dashboard에서 설정한다.

Google OAuth:

- Provider: Google 활성화
- Client ID 입력
- Client Secret 입력

Redirect URL 예시:

```txt
http://localhost:3000/auth/callback
https://your-domain.vercel.app/auth/callback
```

Site URL:

```txt
https://your-domain.vercel.app
```

### 13.4 Supabase Storage

Bucket 생성:

| Bucket | Public | 용도 |
|---|---:|---|
| business-licenses | false | 사업자등록증 파일 저장 |

파일 접근은 승인된 사용자만 가능해야 한다.

---

## 14. 비기능 요구사항

### 14.1 보안

- Google OAuth 외의 로그인 방식은 초기 버전에서 제공하지 않는다.
- 미승인 사용자는 운영 데이터 접근 불가.
- Service Role Key는 서버에서만 사용.
- Supabase RLS 활성화 필수.
- 파일 업로드 확장자와 용량 제한 적용.
- 삭제 기능은 가능하면 hard delete보다 soft delete를 우선 고려한다.

### 14.2 성능

- 상품, 호텔, 업무 목록은 기본 20~50개 단위 pagination 적용.
- 캘린더 일정은 선택된 월 또는 기간 기준으로만 조회한다.
- 업무 기간 검색을 위해 `start_date`, `end_date` index를 사용한다.

### 14.3 접근성

- 버튼과 입력 필드에 label 제공.
- 키보드 조작 가능.
- 상태 색상은 텍스트 라벨과 함께 표시.

### 14.4 국제화/문자 인코딩

- 모든 소스 파일은 UTF-8로 저장한다.
- DB 컬럼은 한글 입력을 정상 저장해야 한다.
- CSV export를 추가할 경우 UTF-8 BOM 옵션을 고려한다.

---

## 15. MVP 범위

### 15.1 MVP에 반드시 포함

- Google 로그인
- 어드민 자동 승인
- 비어드민 로그인 요청 생성
- 어드민 승인/거절
- 상품 CRUD
- 상품 세부 항목 CRUD
- 초기 seed 상품 3개
- 호텔 CRUD
- 사업자등록증 업로드
- 호텔별 결제 상품 등록
- 업무 CRUD
- 전체 일정 캘린더
- GitHub → Vercel 배포

### 15.2 MVP 이후 개선 사항

- 역할 분리: admin, manager, viewer
- 업무 담당자 지정
- 알림 기능: 이메일, 카카오톡, Slack 등
- 월간 성과 분석 리포트 업로드/관리
- 계약서 파일 업로드
- 호텔별 매출/원가/마진 관리
- 캘린더 Google Calendar 연동
- 업무 템플릿 기능 강화
- CSV/Excel export

---

## 16. Codex 구현 체크리스트

### 16.1 프로젝트 초기화

- [ ] Next.js TypeScript 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] shadcn/ui 설정
- [ ] Supabase client/server 설정
- [ ] 환경변수 예시 파일 `.env.example` 생성
- [ ] 기본 layout, navigation 구현

### 16.2 DB / Supabase

- [ ] `supabase/migrations/0001_init.sql` 작성
- [ ] RLS 활성화
- [ ] helper function 작성: `is_admin`, `is_approved_user`
- [ ] 각 테이블 RLS policy 작성
- [ ] Storage bucket 생성 문서화
- [ ] seed 데이터 작성
- [ ] TypeScript DB 타입 생성 스크립트 추가

### 16.3 인증

- [ ] Google OAuth 로그인 버튼 구현
- [ ] `/auth/callback` 구현
- [ ] profile 자동 생성 로직 구현
- [ ] admin 자동 승인 로직 구현
- [ ] pending user redirect 구현
- [ ] middleware 접근 제어 구현
- [ ] 로그아웃 구현

### 16.4 어드민 승인

- [ ] 로그인 요청 목록 UI 구현
- [ ] 승인 액션 구현
- [ ] 거절 액션 구현
- [ ] 대시보드에 승인 대기 수 표시

### 16.5 상품 관리

- [ ] 상품 목록 페이지 구현
- [ ] 상품 생성 폼 구현
- [ ] 상품 수정 폼 구현
- [ ] 상품 세부 항목 동적 추가/삭제 구현
- [ ] 상품 삭제 또는 비활성화 구현

### 16.6 호텔 관리

- [ ] 호텔 목록 페이지 구현
- [ ] 호텔 생성 폼 구현
- [ ] 호텔 수정 폼 구현
- [ ] 사업자등록증 업로드 구현
- [ ] 호텔 검색 구현
- [ ] 호텔 상세에서 결제 상품 목록 표시

### 16.7 업무 관리

- [ ] 결제 상품 추가 기능 구현
- [ ] 상품 세부 항목 기반 업무 자동 생성 구현
- [ ] 업무 목록 페이지 구현
- [ ] 업무 생성/수정 폼 구현
- [ ] 업무 삭제 구현
- [ ] 호텔/상태/기간 필터 구현

### 16.8 대시보드 / 캘린더

- [ ] 요약 카드 구현
- [ ] 전체 업무 캘린더 구현
- [ ] 달력 항목 클릭 상세 구현
- [ ] 호텔/상태 필터 구현

### 16.9 배포

- [ ] GitHub repository 연결
- [ ] Vercel 프로젝트 생성
- [ ] Vercel 환경변수 등록
- [ ] Supabase Auth redirect URL 등록
- [ ] 프로덕션 로그인 테스트
- [ ] 프로덕션 파일 업로드 테스트

---

## 17. 완료 기준

MVP 완료 기준은 다음과 같다.

1. `resumet@gmail.com`으로 Google 로그인 시 즉시 어드민 대시보드 접근 가능하다.
2. 다른 Google 계정으로 로그인 시 승인 대기 화면이 표시된다.
3. 어드민 대시보드에서 로그인 요청을 승인하면 해당 사용자가 서비스에 접근할 수 있다.
4. 초기 상품 3개가 DB에 등록되어 상품 목록에 표시된다.
5. 상품과 세부 항목을 추가, 수정, 삭제할 수 있다.
6. 계약 호텔 정보를 등록하고 사업자등록증을 업로드할 수 있다.
7. 호텔에 결제 상품을 연결할 수 있다.
8. 업무를 생성, 수정, 삭제할 수 있다.
9. 업무의 시작일과 종료일이 전체 대시보드 달력에 표시된다.
10. GitHub main branch push 후 Vercel에 자동 배포된다.

---

## 18. Codex에게 전달할 구현 지시문 예시

```txt
이 PRD를 기준으로 Next.js App Router + TypeScript + Supabase + Tailwind CSS 기반의 MVP를 구현해줘.

우선순위:
1. Supabase migration, RLS, seed 작성
2. Google OAuth 로그인과 승인 플로우 구현
3. 상품 관리 CRUD 구현
4. 호텔 관리 CRUD와 사업자등록증 업로드 구현
5. 결제 상품 및 업무 관리 CRUD 구현
6. 대시보드 캘린더 구현

모든 소스 파일은 UTF-8로 저장하고, UI 문구는 한국어로 작성해줘.
```
