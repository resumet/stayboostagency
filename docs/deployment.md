# StayBoost Admin 배포 체크리스트

## Supabase

1. 새 Supabase 프로젝트를 만든다.
2. SQL editor에서 `supabase/migrations/0001_init.sql`을 실행한다.
3. SQL editor에서 `supabase/seed.sql`을 실행한다.
4. Authentication > Providers에서 Google OAuth를 활성화한다.
5. Redirect URL을 등록한다.
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
6. Storage bucket `business-licenses`가 private으로 생성되었는지 확인한다.

## Vercel

필수 환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=resumet@gmail.com
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

배포 후 `resumet@gmail.com`으로 Google 로그인, 일반 계정 승인 요청, 사업자등록증 업로드를 각각 확인한다.
