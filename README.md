<div align="center">

# 🌿 Türkiye İklim Krizi Biyo-İndikatörleri
### Ulusal Saha Gözlem ve Veri Toplama Çalıştayı

**KGTÜ Biogen Topluluğu** · Biyoloji · Genetik · Biyoteknoloji

*Bir Vatandaş Bilimi (Citizen Science) Projesi*

`HTML5` · `Tailwind CSS (CDN)` · `Vanilla JavaScript` · `Responsive`

</div>

---

## 📌 Proje Hakkında

İklim krizi yalnızca termometrelerde değil, canlıların bedeninde ve yayılışında da iz bırakır.
**Biyo-indikatörler**; varlıkları, yoklukları veya sağlık durumlarıyla çevresel değişimin habercisi olan canlılardır.

Bu proje, Türkiye genelindeki üniversite öğrencilerini kendi bölgelerinde **saha gözlemcisi** olmaya davet eder.
Katılımcılar biyo-indikatör türlerini fotoğraflayıp kısa ekolojik notlarıyla birlikte sisteme yükler;
böylece ülke çapında, gönüllüler tarafından üretilen bir ekolojik veri seti oluşur.

> En nitelikli veriyi sunan **10 lisans öğrencisi**, ekoloji ve botanik alanında uzman akademisyenler eşliğinde **Mersin Göksu Deltası**'ndaki saha çalıştayına **Ulusal Saha Araştırmacısı** olarak davet edilecektir.
> Çalıştay çıktıları **Gençlerin Gözünden Türkiye İklim Krizi Biyo-İndikatör Raporu** adıyla dijital katalog olarak yayımlanacaktır.

**Süre:** 5 hafta (14 Ekim – 13 Kasım 2026) · **Hedef kitle:** lisans ve ön lisans öğrencileri · **Saha ekibi:** 17 kişi (10 öğrenci, 2 akademisyen, 5 yürütücü)

### 🔬 Gözlemlenen Gruplar

| Grup | Neyi anlatır? |
|---|---|
| 🪨 **Likenler** | Hava kalitesi ve kirlilik düzeyi |
| 💧 **Algler** | Su sıcaklığı artışı ve ötrofikasyon |
| 🌱 **Endemik Bitkiler** | Yayılış alanı ve fenoloji kaymaları |
| 🐞 **Böcekler & Omurgasızlar** | Tozlaşma ağları ve ekosistem sağlığı |

---

## 🗓️ Çalıştay Takvimi

| Aşama | Başlık | Tarih |
|:---:|---|---|
| 1 | Ulusal Çağrı ve Veri Toplama | 14 – 27 Ekim 2026 |
| 2 | Akademik Değerlendirme ve Katılımcı Seçimi | 28 Ekim – 5 Kasım 2026 |
| 3 | **Mersin Göksu Deltası Saha Çalıştayı** | **6 – 7 Kasım 2026** |
| 4 | Raporlama ve Dijital Yayın | 9 – 13 Kasım 2026 |

---

## 🗂️ Dosya Yapısı

```
biogen-website/
├── index.html   # Tek sayfalık site: header, hero, hakkında, takvim, form, footer
├── style.css    # Tailwind üzerine özel bileşen stilleri ve animasyonlar
├── script.js    # Navigasyon, scroll animasyonları, geri sayım, form etkileşimleri
└── README.md
```

## ✨ Özellikler

- **Tam duyarlı tasarım** — mobil, tablet ve masaüstü için optimize edilmiş düzen
- **Yapışkan navigasyon** — kaydırıldıkça buzlu cam görünümüne geçer, aktif bölümü vurgular
- **Hero** — yalnızca CSS ile oluşturulmuş, orman yeşilinden koyu zeytin tonlarına pürüzsüz gradient arka plan ve çalıştaya kalan gün sayacı
- **Zaman çizelgesi** — masaüstünde iki yönlü, mobilde dikey akış
- **Veri yükleme formu** — e-posta, öğrenim düzeyi, 81 il listesi, gözlem konumu, gözlem türü seçimi, sürükle-bırak fotoğraf yükleme ve önizleme, karakter sayacı, satır içi doğrulama
- **Erişilebilirlik** — klavye odak stilleri, ARIA etiketleri, `prefers-reduced-motion` desteği

## 🚀 Çalıştırma

Herhangi bir kurulum gerekmez. `index.html` dosyasını tarayıcıda açmanız yeterlidir.

Yerel bir sunucu ile çalıştırmak isterseniz:

```bash
npx serve .
# veya
python -m http.server 8000
```

## 🎨 Tasarım Dili

| Renk | Kod | Kullanım |
|---|---|---|
| Forest 600 | `#22623F` | Birincil renk, butonlar |
| Forest 950 | `#0A1C14` | Hero ve footer zemini |
| Earth 400 | `#B98F5C` | Vurgu, CTA |
| Sand | `#F6F3EC` | Sayfa zemini |

Tipografi: **Fraunces** (başlıklar) · **Plus Jakarta Sans** (metin)

## 🔧 Geliştirme Notları

- **Veri kaydı Supabase ile yapılır.** Form gönderimleri `gozlemler` tablosuna (Postgres), fotoğraflar
  `gozlem-fotograflari` adlı private storage bucket'ına yüklenir. Fotoğraflar gönderilmeden önce tarayıcıda
  sıkıştırılır (JPG/PNG/WEBP → uzun kenar en fazla 1600 px, JPEG; HEIC/HEIF olduğu gibi gönderilir).
- **Veritabanı kurulumu:** `supabase/schema.sql` dosyasını Supabase **SQL Editor**'de tek seferde çalıştırın.
  Betik idempotenttir; tablo, kısıtlar, RLS, bucket ve storage policy'lerini oluşturur ya da günceller.
  Ziyaretçiler (anon) yalnızca kayıt **ekleyebilir**; okuma, güncelleme ve silme yetkisi yoktur.
- **Son yükleme tarihi iki yerde tanımlıdır ve birlikte güncellenmelidir:**
  - `supabase/schema.sql` → `public.gozlem_son_tarih()` fonksiyonu (sunucuda asıl engel; değiştirdikten sonra
    fonksiyonu SQL Editor'de yeniden çalıştırın)
  - `script.js` → `SUBMIT_DEADLINE` sabiti (yalnızca kullanıcıya gösterilecek hata mesajını seçmek için)
- **Kayıtları görüntüleme:** Supabase panelinde **Table Editor → gozlemler** tablosundan görülür ve
  **Export → CSV** ile indirilebilir. Fotoğraflar **Storage → gozlem-fotograflari** altında, kayıt
  `id`'siyle adlandırılmış klasörlerdedir. Hazır sorgular `schema.sql` dosyasının sonunda yer alır.
- **Anahtarlar:** `script.js` içindeki `SUPABASE_URL` ve publishable (anon) key'in kodda açık durması normaldir;
  bu anahtar tarayıcıda kullanılmak üzere tasarlanmıştır ve yetkileri RLS ile sınırlıdır.
  **Secret / `service_role` key asla koda, repoya veya istemciye konmamalıdır** — tüm RLS kurallarını atlar.
- KVKK Aydınlatma Metni, formdaki bağlantıdan açılan bir modal (`<dialog id="kvkkModal">`) içinde yer alır; metni güncellemek için `index.html` içindeki bu bloğu düzenleyin.
- Tailwind CDN geliştirme içindir; canlı ortam için Tailwind CLI ile derlenmiş bir CSS dosyası önerilir.

## 📬 İletişim

- **E-posta:** kgtubiogentoplulugu@gmail.com
- **Instagram:** [@kgtubiogen.toplulugu](https://www.instagram.com/kgtubiogen.toplulugu/)
- **WhatsApp:** [Topluluk Grubu](https://chat.whatsapp.com/EvxjlQGGt9iJdBTVM8ygaH?s=cl&p=a&ilr=1)

---

<div align="center">

© 2026 **KGTÜ Biogen Topluluğu** — *Doğa için, veriyle.* 🌿

</div>
