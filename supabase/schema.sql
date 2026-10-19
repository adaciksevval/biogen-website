-- =========================================================
--  KGTÜ Biogen — Biyo-İndikatör gözlem formu · Supabase şeması
--
--  ▶ Supabase SQL Editor'de TEK SEFERDE çalıştırın.
--    Betik idempotenttir; tekrar çalıştırmak hata vermez ve
--    tablo verisini silmez (yalnızca fonksiyon, yetki, policy ve
--    bucket ayarlarını güncel hâle getirir).
--
--  ▶ SON YÜKLEME TARİHİ tek yerden yönetilir:
--    aşağıdaki public.gozlem_son_tarih() fonksiyonundaki tarihi
--    değiştirip betiği yeniden çalıştırın (veya dosyanın sonundaki
--    "son tarihi uzat" örneğini kullanın). Hem tablo hem storage
--    INSERT policy'leri bu fonksiyonu kullanır.
--
--    ┌──────────────────────────────────────────────┐
--    │  SON TARİH: 2026-10-27 23:59:59+03           │
--    └──────────────────────────────────────────────┘
-- =========================================================

begin;

-- ---------------------------------------------------------
-- 1) Son yükleme tarihi
-- ---------------------------------------------------------
create or replace function public.gozlem_son_tarih()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select timestamptz '2026-10-27 23:59:59+03';  -- ← SON TARİH (tek yer)
$$;

comment on function public.gozlem_son_tarih() is
  'Gözlem formu için son yükleme anı. gozlemler ve storage INSERT policy''leri kullanır.';

-- Policy'ler anon rolüyle değerlendirildiği için çalıştırma izni gerekir.
grant execute on function public.gozlem_son_tarih() to anon;


-- ---------------------------------------------------------
-- 2) Tablo: public.gozlemler
-- ---------------------------------------------------------
create table if not exists public.gozlemler (
  id                 uuid        primary key,                  -- istemcide crypto.randomUUID()
  created_at         timestamptz not null default now(),       -- sunucu saati (gönderim anı)

  ad                 text        not null,
  soyad              text        not null,
  eposta             text        not null,
  duzey              text        not null,
  universite         text        not null,
  il                 text        not null,

  tur                text        not null,
  konum              text        not null,
  aciklama           text        not null,
  foto_yollari       text[]      not null,

  kvkk_onay          boolean     not null,
  kvkk_onay_zamani   timestamptz not null,                     -- kutunun işaretlendiği an (istemci saati)
  kvkk_metin_surumu  text        not null,

  constraint gozlemler_ad_uzunluk          check (char_length(btrim(ad)) between 2 and 100),
  constraint gozlemler_soyad_uzunluk       check (char_length(btrim(soyad)) between 2 and 100),
  constraint gozlemler_eposta_bicim        check (
    eposta = lower(btrim(eposta))
    and char_length(eposta) <= 254
    and eposta ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  ),
  constraint gozlemler_duzey_deger         check (duzey in ('lisans', 'on-lisans')),
  constraint gozlemler_universite_uzunluk  check (char_length(btrim(universite)) between 2 and 200),
  constraint gozlemler_il_uzunluk          check (char_length(btrim(il)) between 2 and 50),
  constraint gozlemler_tur_deger           check (tur in (
    'liken', 'alg', 'endemik-bitki', 'kuruyan-bitki',
    'bocek', 'yosun', 'tahribat', 'diger'
  )),
  constraint gozlemler_konum_uzunluk       check (char_length(btrim(konum)) between 2 and 300),
  constraint gozlemler_aciklama_uzunluk    check (char_length(btrim(aciklama)) between 30 and 500),

  -- 1–3 fotoğraf, boş eleman yok ve her yol bu kaydın klasörüne işaret etmeli:
  --   {id}/{1|2|3}.{jpg|png|webp|heic|heif}
  constraint gozlemler_foto_yollari_gecerli check (
    cardinality(foto_yollari) between 1 and 3
    and array_position(foto_yollari, null) is null
    and array_to_string(foto_yollari, ',') ~ (
      '^' || id::text || '/[1-3]\.(jpg|png|webp|heic|heif)'
      || '(,' || id::text || '/[1-3]\.(jpg|png|webp|heic|heif)){0,2}$'
    )
  ),

  constraint gozlemler_kvkk_onayli         check (kvkk_onay = true),
  constraint gozlemler_kvkk_surum_uzunluk  check (char_length(btrim(kvkk_metin_surumu)) between 1 and 20)
);

comment on table  public.gozlemler                   is 'Vatandaş bilimi gözlem formu gönderimleri.';
comment on column public.gozlemler.created_at        is 'Sunucu tarafından atanan gönderim zamanı.';
comment on column public.gozlemler.foto_yollari      is 'gozlem-fotograflari bucket''ı içindeki nesne yolları.';
comment on column public.gozlemler.kvkk_onay_zamani  is 'KVKK kutusunun işaretlendiği an (istemci saati).';
comment on column public.gozlemler.kvkk_metin_surumu is 'Onay verilen KVKK Aydınlatma Metni sürümü.';

create index if not exists gozlemler_created_at_idx on public.gozlemler (created_at desc);
create index if not exists gozlemler_tur_idx        on public.gozlemler (tur);
create index if not exists gozlemler_il_idx         on public.gozlemler (il);


-- ---------------------------------------------------------
-- 3) Yetkiler + RLS (anon: yalnızca INSERT)
-- ---------------------------------------------------------
-- Supabase varsayılan olarak anon/authenticated'a tüm tablo yetkilerini verir;
-- bunları kaldırıp yalnızca gerekli kolonlara INSERT izni veriyoruz.
-- created_at listede yok: istemci sunucu zamanını ezemez.
revoke all on table public.gozlemler from anon, authenticated;

grant insert (
  id, ad, soyad, eposta, duzey, universite, il,
  tur, konum, aciklama, foto_yollari,
  kvkk_onay, kvkk_onay_zamani, kvkk_metin_surumu
) on table public.gozlemler to anon;

alter table public.gozlemler enable row level security;

drop policy if exists "gozlemler_anon_insert" on public.gozlemler;
create policy "gozlemler_anon_insert"
  on public.gozlemler
  for insert
  to anon
  with check (
    now() <= public.gozlem_son_tarih()
    -- istemci saatiyle gelen onay anı gelecekte olamaz (5 dk saat sapması toleransı)
    and kvkk_onay_zamani <= now() + interval '5 minutes'
  );
-- SELECT / UPDATE / DELETE policy'si bilinçli olarak yok:
-- kayıtlar yalnızca dashboard veya service role ile görülür.


-- ---------------------------------------------------------
-- 4) Storage bucket: gozlem-fotograflari (private)
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gozlem-fotograflari',
  'gozlem-fotograflari',
  false,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------
-- 5) Storage policy (anon: yalnızca INSERT, upsert yok)
-- ---------------------------------------------------------
-- Yol biçimi: {gozlem_id (uuid, küçük harf)}/{1|2|3}.{uzanti}
-- SELECT/UPDATE policy'si olmadığı için üzerine yazma (upsert) ve okuma mümkün değil.
drop policy if exists "gozlem_foto_anon_insert" on storage.objects;
create policy "gozlem_foto_anon_insert"
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'gozlem-fotograflari'
    and now() <= public.gozlem_son_tarih()
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[1-3]\.(jpg|png|webp|heic|heif)$'
  );

commit;


-- =========================================================
--  TEST / YÖNETİM SORGULARI (yorum satırı — gerektiğinde seçip çalıştırın)
-- =========================================================

-- Son 50 kayıt:
-- select id, created_at, ad, soyad, eposta, duzey, universite, il, tur, konum,
--        cardinality(foto_yollari) as foto_sayisi, kvkk_onay_zamani, kvkk_metin_surumu
-- from public.gozlemler
-- order by created_at desc
-- limit 50;

-- Türe ve ile göre dağılım:
-- select tur, count(*) from public.gozlemler group by tur order by 2 desc;
-- select il,  count(*) from public.gozlemler group by il  order by 2 desc;

-- Bir kaydın fotoğraf nesneleri:
-- select name, metadata->>'size' as boyut, metadata->>'mimetype' as tur, created_at
-- from storage.objects
-- where bucket_id = 'gozlem-fotograflari'
--   and name like '<GOZLEM_ID>/%';

-- Sahipsiz fotoğraflar (yüklenmiş ama kaydı oluşmamış klasörler):
-- select o.name, o.created_at
-- from storage.objects o
-- where o.bucket_id = 'gozlem-fotograflari'
--   and not exists (
--     select 1 from public.gozlemler g
--     where g.id::text = split_part(o.name, '/', 1)
--   )
-- order by o.created_at;

-- Şu anki son tarih ve form açık mı:
-- select public.gozlem_son_tarih() as son_tarih, now() <= public.gozlem_son_tarih() as acik_mi;

-- Son tarihi uzat (ör. 3 Kasım 2026 gece yarısına):
-- create or replace function public.gozlem_son_tarih()
-- returns timestamptz
-- language sql
-- stable
-- set search_path = ''
-- as $$
--   select timestamptz '2026-11-03 23:59:59+03';
-- $$;
