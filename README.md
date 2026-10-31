# Parça Cini - GitHub Pages hukuk sayfaları

Bu klasörde **GitHub Pages'e doğrudan yüklenebilecek** dosyalar bulunmaktadır:

- `index.html` - sayfa girişi ve iki bağlantı
- `gizlilik-politikasi.html` - Gizlilik Politikası + KVKK Aydınlatma Metni
- `hesap-silme.html` - uygulama dışından hesap silme talebi için e-posta bağlantısı
- `style.css` - mobil uyumlu görünüm
- `.nojekyll` - GitHub Pages'in Jekyll dönüşümünü atlaması için

## Kurulum

1. GitHub'da herkese açık **parca-cini-legal** deposu açın.
2. ZIP'i bilgisayarınızda **çıkarın**. **ZIP'i tek parça olarak GitHub'a yüklemeyin.**
3. Çıkardığınız `index.html`, `gizlilik-politikasi.html`, `hesap-silme.html`, `style.css` ve `.nojekyll` dosyalarını **deponun ana dizinine** yükleyip commit edin.
4. Depo içinden **Settings > Pages > Build and deployment** bölümüne gidin.
5. **Source: Deploy from a branch** seçin; **Branch: main**, klasör: **/(root)**, ardından **Save**.
6. Yayınlandıktan sonra şu adresleri (GitHub kullanıcı adınızla) tarayıcıda test edin:
   - `https://KULLANICI_ADINIZ.github.io/parca-cini-legal/gizlilik-politikasi.html`
   - `https://KULLANICI_ADINIZ.github.io/parca-cini-legal/hesap-silme.html`
7. Bu URL'leri Google Play Console'un Gizlilik Politikası ve Hesap Silme alanlarına girin.
8. İki adresin de **giriş yapmadan** açıldığını mobil cihazda test edin.

## Hesap silme işlemi nasıl çalışır?

- `hesap-silme.html` sayfasındaki buton `mailto:` bağlantısıdır. Kullanıcının e-posta uygulamasını açar, destek adresine önceden doldurulmuş bir talep hazırlar.
- Kullanıcının **Gönder** demesi gerekir. Bu site otomatik bir silme, Supabase bağlantısı veya sunucu taraflı başvuru kaydı oluşturmaz.
- Gelen başvuruları `parcacini.bildirim@gmail.com` posta kutusunda izlemeli, kimlik doğrulaması yapmalı, gerekli işlemi gerçekleştirip yanıtlamalısınız.
- E-posta gönderimini telefon/masaüstünde gerçekten test edin; e-posta uygulaması tanımlı olmayan cihazda kullanıcı adresi elle kullanabilir.

## ÖNEMLİ: Yayından önce doğrulanacak bilgiler

Aşağıdaki maddeler mevcut Parça Cini hukuk metinlerinde de henüz doğrulanmamış olarak işaretlenmişti:

1. **Saklama süreleri / imha:** Üyelik, ilan, mesajlar, destek, güvenlik kayıtları, fotoğraflar ve yedekler için fiilen uygulanan imha takvimi. Web sayfasında net süreler bilinmediği için süre uydurulmadı. Google Play'e gönderimden önce uygulama davranışı ile eşleştirilmelidir.
2. **Üçüncü taraf veri aktarımı:** Supabase, Google, Firebase ve harita hizmetlerinin fiili veri bölgeleri, gönderilen veriler, varsa uluslararası aktarım ve ilgili KVKK koşulları doğrulanmalıdır.
3. **Uygulama metin sürümü:** Bu sayfalar 30.10.2026 tarihli **1.1.0** kaynak metinlerinden uyarlandı. Uygulama içindeki daha sonraki **1.1.1** sürümüyle tutarlılığı kontrol edilmelidir.
4. **Hesap silme sistemi:** Supabase'de bağlı kişisel verilerin, fotoğrafların, bildirim belirteçlerinin ve hukukî saklama istisnalarının gerçekte nasıl ele alındığı doğrulanmalıdır.
5. **Kullanıcı işlemi:** Destek e-postası gönderim ve yanıt süreci düzenli takip edilmelidir. Yalnızca sayfa yayınlamak gerçek silme yükümlülüğünü yerine getirmez.
6. **İşletmeci bilgisi / iletişim:** `Yavuz Selim Türkoğlu` ve `parcacini.bildirim@gmail.com` önceki metinlerden kullanıldı. Gerekli diğer ticari/KVKK iletişim bilgileri, işletmecinin hukuki statüsüne göre doğrulanmalıdır.

**Güvenlik:** Bu açık depoya Flutter kodu, `service_role` anahtarı, Firebase servis hesabı dosyası, `key.properties`, `.env` veya gerçek kullanıcı verisi yüklemeyin.

**Not:** Dosyalar GitHub'a yüklenmemiştir. Canlı URL'ler GitHub Pages etkinleşince oluşur.
