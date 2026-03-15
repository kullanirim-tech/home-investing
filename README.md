# 🏠 Home Investment Calculator

Single Page React uygulaması ile ev alım hedefinizi planlayın.

## Özellikler

- ✅ **Grafiksel Görüntüleme** - Recharts ile beautiful line chart
- ✅ **Detaylı Tablo** - Yıllık bazda birikim ve ev fiyatı karşılaştırması
- ✅ **Tapu Masrafları** - Otomatik %4 hesaplama
- ✅ **Responsive Tasarım** - Mobil ve masaüstü uyumlu
- ✅ **Örnek Veriler** - Hızlı başlangıç için hazır senaryo
- ✅ **Turuncu Tema** - Modern ve göz alıcı UI
- ✅ **Input Formatlama** - TL alanları için binlik ayraç, % alanları için ondalık
- ✅ **Persistent Storage** - window.storage API ile kayıt
- ✅ **Toast Bildirimleri** - Kayıt sonrası bildirim
- ✅ **Enflasyon Düzeltilmiş Gerçek Değer** - Nominal birikimin yanı sıra enflasyonla düzeltilmiş gerçek satın alma gücünü hesaplar
- ✅ **🆕 Loan Calculator Karşılaştırma** - Sadece biriktirme vs Kredi + Yatırım karşılaştırması
- ✅ **🆕 Loan Calculator Karşılaştırma** - İki farklı yolun şık bir şekilde karşılaştırılması
  - Sadece biriktirme yolu
  - Kredi + fark yatırma yolu
  - Her iki yolun yıllık özeti
  - İki yolun ay bazlı karşılaştırma grafiği

## Kullanım

### Online Demo

🚀 **Canlı Demo:** https://kullanirim-tech.github.io/home-investing/

### Kurulum

```bash
npm install
```

### Geliştirme

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılacak.

### Build

```bash
npm run build
```

### GitHub Pages'e Deploy Etme

**Otomatik Yöntem (Önerilen):**

1. GitHub repository'de **Settings → Pages**'e gidin
2. **Source** altında:
   - **Build and deployment** → "Deploy from a branch" seçin
   - **Branch** → `gh-pages` seçin
3. **Save** butonuna basın

**Manuel Yöntem:**

```bash
# gh-pages branch'ine deploy et
npm run build
git checkout gh-pages
git merge main --no-edit
git push origin gh-pages
git checkout main
```

## Teknolojiler

- **React** - UI kütüphanesi
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Grafikler

## Nasıl Çalışır?

1. Mevcut birikiminizi ve aylık birikim miktarını girin
2. Yatırım getirisi ve emlak artış oranlarını belirleyin
3. Hedef ev fiyatını girin
4. Hesapla butonuna basın
5. Grafik ve tablo üzerinden detayları inceleyin

## Örnek Senaryo

- Mevcut Birikim: 300.000 TL
- Aylık Birikim: 20.000 TL
- Aylık Yatırım Getirisi: %1.5
- Ev Fiyatı: 4.000.000 TL
- Yıllık Emlak Artışı: %15
- Yıllık Enflasyon: %50

**Sonuç:** Bu koşullarda evi yaklaşık 4.5 yıl sonra alabilirsiniz.

## 💡 Enflasyon Düzeltilmiş Gerçek Değer

Bu özellik sayesinde sadece **nominal** (kağıt üzerindeki) birikiminizi değil, **enflasyon düzeltilmiş gerçek satın alma gücünüzü** de görebilirsiniz:

- **Nominal Birikim:** Yatırım getirisiyle artan birikiminiz
- **Gerçek Birikim:** Enflasyonun etkisiyle düzeltilmiş satın alma gücünüz
- Eğer nominal birikim > gerçek birikim ise, birikiminizin değer kaybettiğini anlar

Bu özellik özellikle yüksek enflasyon ortamında kritik bir bilgidir — çünkü 1 milyon TL'nin değeri, yıllar sonra aynı değerde olmayabilir!

## 🔥 Loan Calculator Karşılaştırma

Bir ev alım planlarken **sadece biriktirmek mi**, yoksa **kredi alıp farkı yatırma mı** daha mantıklı? Artık ikisini de görebilirsiniz!

### 🎯 İki Yol Karşılaştırması

**1. Sadece Biriktirme Yolu:**
- Tüm aylık birikiminizi ev için tutarsınız
- Yatırım getirisi ile birikim artar
- Ev fiyatına ulaşınca alırsınız

**2. Kredi + Yatırım Yolu:**
- Krediyi alırsınız
- Her ay kredi taksidini ödersiniz
- Aylık birikiminizden kalan kısmı yatırırsınız
- Kredi bittiğinde yatırılmış paranız olur

### 📊 Özellikler

- **Akıllı Öneri Sistemi:** Uygulama otomatik olarak hangi yolun daha avantajlı olduğunu gösterir
- **Aylık Grafik:** Her iki yolun ay bazlı karşılaştırması (nominal ve gerçek değerler)
- **Yıllık Özet:** 5, 10, 15, 20, 30 yılın sonuçlarını gösteren bar grafik
- **İlk Eşleşme Noktası:** Kredi yolunun evi alabileceği ilk ayı vurgular

### 💡 Neden Önemli?

Bu özellik, **yüksek enflasyon** ve **yüksek kredi faizleri** ortamında kritik bir yardımcıdır:

1. **Gerçekçi Karşılaştırma:** Kağıt üzerinde kredi "pahalı" görünebilir, ama gerçek yatırım avantajı muhtemelen daha yüksek
2. **Geri Dönüşümsüz Kararlar:** Ev alırken son kararı rasyonel almak için bu karşılaştırma şart
3. **Uzun Vadeli Bakış:** 30 yıllık piyasa dinamiklerini görürsünüz

## Notlar

- **Input Formatlama:**
  - TL alanları: `12.000.000` (binlik ayraç ile)
  - % alanları: `1.5` (ondalık, formatlama yok)
- **Storage:** `window.storage` API kullanılır (localStorage DEĞİL)
- **Grafik:** Tüm ayları gösterir (1, 2, 3...)
- **Hesaplama:** Doğru yıllık'dan aylık'a dönüşüm (basit bölme yok)

---

**Built with ❤️ by Orhan Claw**
