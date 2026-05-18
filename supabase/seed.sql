with product_seed(name, subtitle, description, sort_order) as (
  values
    ('초기 세팅 패키지', '성장을 위한 견고한 토대 마련', '호텔 마케팅 운영을 시작하기 위한 기본 구축 패키지', 10),
    ('디럭스 패키지', '지속적인 유입과 대세감 형성', '운영 안정화와 지속적인 검색/리뷰 유입을 위한 패키지', 20),
    ('프리미엄 패키지', '브랜드 신뢰와 상위 노출을 함께 강화', '브랜드 신뢰도와 상위 노출 강화를 위한 고급 패키지', 30)
)
insert into public.products (name, subtitle, description, sort_order, is_active)
select name, subtitle, description, sort_order, true
from product_seed
on conflict (name) do update
set subtitle = excluded.subtitle,
    description = excluded.description,
    sort_order = excluded.sort_order,
    is_active = true;

with item_seed(product_name, name, price_amount, price_label, sort_order) as (
  values
    ('초기 세팅 패키지', '홈페이지 제작 및 도메인 설정', 200000, '200,000', 10),
    ('초기 세팅 패키지', '네이버 구글 SEO 최적화', 200000, '200,000', 20),
    ('초기 세팅 패키지', '현장 출장 & 사진 촬영', 550000, '550,000 ~', 30),
    ('초기 세팅 패키지', '구글 리뷰 (초기 15건)', 250000, '250,000', 40),
    ('초기 세팅 패키지', '여행 인플루언서 기자단 (5건)', 1200000, '1,200,000', 50),
    ('디럭스 패키지', '구글 리뷰 등록 (10건)', 200000, '200,000', 10),
    ('디럭스 패키지', '인플루언서 기자단 (5건)', 900000, '900,000', 20),
    ('디럭스 패키지', '홈페이지 무료 유지보수', 30000, '30,000', 30),
    ('디럭스 패키지', '월간 성과 분석 리포트', null, '포함', 40),
    ('디럭스 패키지', '추가 사진촬영', null, '필요시 출장실비 청구', 50),
    ('프리미엄 패키지', '구글 리뷰 등록 (20건)', 250000, '250,000', 10),
    ('프리미엄 패키지', '인플루언서 기자단 (10건)', 1200000, '1,200,000', 20),
    ('프리미엄 패키지', '홈페이지 무료 유지보수', 30000, '30,000원', 30),
    ('프리미엄 패키지', '월간 성과 분석 리포트', null, '포함', 40),
    ('프리미엄 패키지', '추가 사진촬영', null, '필요시 출장실비 청구', 50)
)
insert into public.product_items (
  product_id,
  name,
  price_amount,
  price_label,
  sort_order
)
select
  p.id,
  s.name,
  s.price_amount,
  s.price_label,
  s.sort_order
from item_seed s
join public.products p on p.name = s.product_name
on conflict (product_id, name) do update
set price_amount = excluded.price_amount,
    price_label = excluded.price_label,
    sort_order = excluded.sort_order;
