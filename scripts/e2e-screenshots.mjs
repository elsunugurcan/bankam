// Uçtan uca akış testi + gerçek ekran görüntüleri (390×844, @2x).
// Önce: npm run export:web && node scripts/serve.mjs 8081
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:8081";
const OUT = process.env.OUT ?? "screenshots";
await fs.mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 14"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "tr-TR", timezoneId: "Europe/Istanbul", colorScheme: "dark" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const ok = (c, m) => { if (!c) throw new Error("TEST BAŞARISIZ: " + m); console.log("✓", m); };
const shot = async (name) => { await page.waitForTimeout(400); await page.screenshot({ path: `${OUT}/${name}.png` }); console.log("📸", name); };
const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
const tid = (id) => page.getByTestId(id).filter({ visible: true }).last();
const tab = async (label) => { await page.getByRole("tab", { name: label }).click(); await page.waitForTimeout(600); };
const wait = (ms = 400) => page.waitForTimeout(ms);
const has = (t, s) => t.toLocaleLowerCase("tr-TR").includes(s); // CSS ile büyük harfe çevrilen etiketler (İ/I) için

// ---------------- Giriş ----------------
await page.goto(BASE + "/"); await page.waitForLoadState("networkidle"); await wait(800);
ok(page.url().endsWith("/giris") && (await text()).includes("PIN girin"), "kilitli açılış: PIN ekranı");
await shot("01-giris");
for (const k of ["0", "0", "0", "0"]) await page.getByRole("button", { name: k, exact: true }).click();
await wait(300); ok((await text()).includes("PIN hatalı"), "hatalı PIN reddedildi ve uyarı gösterildi");
for (const k of ["2", "4", "6", "7"]) await page.getByRole("button", { name: k, exact: true }).click();
await page.waitForURL((u) => u.pathname === "/" || u.pathname === "/(tabs)" || u.pathname.startsWith("/index"), { timeout: 10000 }).catch(() => {});
await wait(900);

// ---------------- Ana sayfa ----------------
let t = await text();
ok(t.includes("Toplam varlık") && t.includes("₺106.175,60"), "ana sayfa: toplam varlık 3 hesabın toplamı (₺106.175,60)");
ok(t.includes("Vadesiz Hesap") && has(t, "bu ay") && has(t, "son işlemler"), "hesap kartları, bütçe ve son işlemler");
await shot("02-ana-sayfa");
await tid("toggle-hide").click(); await wait(200);
ok((await text()).includes("₺ ••••") && !(await text()).includes("₺106.175,60"), "bakiye gizleme tüm tutarları maskeler");
await tid("toggle-hide").click(); await wait(200);

// ---------------- Transfer: 3 dokunuş ----------------
await tid("quick-send").click(); await wait(600);
t = await text();
ok(t.includes("Adım 1 / 3") && has(t, "favoriler") && t.includes("Ayşe Yılmaz"), "transfer adım 1: favoriler ve son gönderilenler");
await shot("03-transfer-alici");
await tid("fav-p1").click(); await wait(500); // 1. dokunuş
ok((await text()).includes("Adım 2 / 3"), "1. dokunuş → tutar ekranı");
await tid("quick-100000").click(); await wait(500); // 2. dokunuş: ₺1.000 hızlı tutar
t = await text();
ok(t.includes("Adım 3 / 3") && t.includes("₺1.000,00") && t.includes("FAST") && t.includes("Ücretsiz"), "2. dokunuş → onay: FAST, ücretsiz (₺5.000 altı)");
await shot("04-transfer-onay");
await tid("confirm-send").click(); // 3. dokunuş
await page.waitForURL((u) => u.pathname.includes("/transfer/basarili"), { timeout: 10000 }); await wait(700);
ok((await text()).includes("Gönderildi") && (await text()).includes("₺1.000,00"), "3. dokunuş → başarı ekranı");
await shot("05-transfer-basarili");
await tid("success-home").click(); await wait(700);
t = await text();
ok(t.includes("₺105.175,60"), "bakiye ₺1.000 düştü (₺105.175,60)");
ok(t.includes("Bugün") && t.indexOf("Ayşe Yılmaz") < t.indexOf("Migros"), "yeni transfer bugünün ilk işlemi olarak listede");

// Kurallar: ₺5.000 üstü ücret + günlük limit hatası tutar ekranında
await tab("Transfer");
await tid("contact-p3").click(); await wait(400);
for (const k of ["6", "0", "0", "0", "0", "0"]) await page.getByRole("button", { name: k, exact: true }).click(); // ₺6.000,00
await wait(200); t = await text();
ok(t.includes("₺6.000,00") && /ücret ₺3,50/.test(t), "₺6.000: EFT/FAST ücreti ₺3,50 anında gösterilir");
await page.getByRole("button", { name: "Sil" }).click(); await page.getByRole("button", { name: "Sil" }).click();
for (const k of ["0", "0", "0", "0"]) await page.getByRole("button", { name: k, exact: true }).click(); // ₺60.000,00 → limit
await wait(200); t = await text();
ok(t.includes("Tek seferlik limit"), "₺60.000: tek seferlik limit hatası ve Devam devre dışı");
ok(await tid("amount-next").isDisabled(), "Devam düğmesi devre dışı");
await shot("06-transfer-tutar-hata");

// Hesaplar arası
await page.getByRole("button", { name: "Geri" }).click(); await wait(400);
await tid("own-birikim").click(); await wait(400);
await tid("quick-250000").click(); await wait(400);
ok((await text()).includes("Hesaplar arası") && (await text()).includes("Ücretsiz"), "hesaplar arası transfer ücretsiz");
await tid("confirm-send").click(); await page.waitForURL((u) => u.pathname.includes("/transfer/basarili"), { timeout: 10000 }); await wait(500);
await tid("success-home").click(); await wait(600);
ok((await text()).includes("₺105.175,60"), "hesaplar arası transfer toplam varlığı değiştirmez");

// Yeni alıcı: IBAN doğrulama
await tab("Transfer"); await tid("add-contact").click(); await wait(500);
await tid("contact-name").fill("Deniz Yıldız");
await tid("contact-iban").fill("TR05 0006 2098 7654 3210 9876 55"); await tid("contact-iban").blur(); await wait(200);
ok((await text()).includes("doğrulanamadı"), "bozuk IBAN mod-97 ile reddedildi");
await tid("contact-iban").fill("TR050006209876543210987654"); await wait(200);
t = await text(); ok(t.includes("Geçerli") && t.includes("Garanti BBVA"), "geçerli IBAN: banka tanındı (Garanti BBVA)");
await shot("07-yeni-alici");
await tid("contact-save").click(); await wait(500);
ok((await text()).includes("Deniz Yıldız") && (await text()).includes("Adım 2 / 3"), "alıcı kaydedildi → tutar ekranı");
await page.getByRole("button", { name: "Geri" }).click(); await wait(500);

// ---------------- Kartlar ----------------
await tab("Kartlar"); t = await text();
ok(t.includes("Kartlarım") && t.includes("•••• 6467") && t.includes("₺5.000"), "kart görseli, limit ₺5.000");
await tid("toggle-freeze").click(); await wait(300);
ok((await tid("frozen-banner").innerText()).includes("Kart donduruldu"), "kart dondurma anında uyarı gösterir");
await shot("08-kartlar-donduruldu");
await tid("toggle-freeze").click(); await wait(200);
await tid("open-limit").click(); await wait(400);
await tid("limit-1000000").click(); await wait(300);
ok((await tid("card-limit").innerText()).includes("₺10.000"), "harcama limiti alt sayfadan güncellendi (₺10.000)");
await tid("card-chip-c2").click(); await wait(300);
ok((await text()).includes("Dönem harcaması") && (await text()).includes("Asgari"), "kredi kartı: dönem harcaması ve asgari ödeme");
await shot("09-kredi-karti");

// ---------------- Harcamalar ----------------
await tab("Harcama"); t = await text();
ok(t.includes("Kategoriler") && t.includes("Market") && t.includes("bütçe"), "kategori halkası ve bütçe listesi");
await shot("10-harcamalar");
await page.getByRole("radio", { name: "Aylık" }).click(); await wait(400);
t = await text(); ok(t.includes("Bu ay gelir") && t.includes("Gider"), "aylık gelir/gider grafiği");
await shot("11-harcamalar-aylik");

// ---------------- İşlem detayı & hesap ----------------
await tab("Ana sayfa"); await tid("account-vadesiz").click(); await wait(500);
t = await text(); ok(t.includes("Vadesiz Hesap") && t.includes("TR") && has(t, "işlemler"), "hesap detayı: tam IBAN ve işlem listesi");
await tid("filter-market").click(); await wait(300);
t = await text(); ok(t.includes("Migros") && !t.includes("Ayşe Yılmaz"), "kategori filtresi çalışır");
await tid("tx-search").fill("getir"); await wait(300);
t = await text(); ok(t.includes("Getir") && !t.includes("Migros"), "işlem arama çalışır");
await shot("12-hesap-detay");
await tid("tx-search").fill(""); await page.getByRole("button", { name: "Tümü" }).click(); await wait(300);
await tid("tx-tx5").click(); await wait(500);
t = await text(); ok(t.includes("İşlem detayı") && t.includes("−₺1.500,00") && t.includes("Garanti BBVA"), "işlem detayı: tutar, alıcı bankası");
await shot("13-islem-detay");

// ---------------- Kalıcılık ----------------
await page.goto(BASE + "/"); await page.waitForLoadState("networkidle"); await wait(800);
ok(page.url().endsWith("/giris"), "yenilemede oturum kilitli (güvenlik)");
await tid("biometric").click(); await wait(800);
ok((await text()).includes("₺105.175,60"), "yenileme sonrası bakiye ve işlemler kalıcı (AsyncStorage)");

// ---------------- Daha: tema, yazı boyutu ----------------
await tab("Daha"); t = await text();
ok(t.includes("Tema") && t.includes("Yazı boyutu") && has(t, "tasarım sistemi"), "ayarlar ekranı");
await shot("14-ayarlar");
await page.getByRole("radio", { name: "Açık" }).click(); await wait(400);
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
await shot("15-ayarlar-acik-tema");
await tab("Ana sayfa"); await wait(300); await shot("16-ana-sayfa-acik-tema");
await tab("Daha");
await page.getByRole("radio", { name: "Çok büyük" }).click(); await wait(400);
const size = await page.evaluate(() => { const el = [...document.querySelectorAll("div")].find((d) => d.textContent === "Tema" && d.children.length === 0); return el ? parseFloat(getComputedStyle(el).fontSize) : 0; });
ok(size >= 20, `çok büyük yazı ölçeği: gövde metni ${size}px (≥ 20)`);
await shot("17-buyuk-yazi");
await page.getByRole("radio", { name: "Normal" }).click(); await wait(200);

// ---------------- Tasarım sistemi ----------------
await tid("ds-tokens").click(); await wait(600);
t = await text();
ok(/WCAG 2\.2 · 16\/16 çift geçti/.test(t), "açık tema: kontrast sözleşmesi 16/16 canlı hesapta geçiyor");
ok(has(t, "tipografi ölçeği") && has(t, "4 pt ızgara"), "belirteç sayfası: tipografi ve boşluk");
await shot("18-tasarim-belirtecler-acik");
await page.getByRole("button", { name: "Geri" }).click(); await wait(300);
await page.getByRole("radio", { name: "Koyu" }).click(); await wait(300);
await tid("ds-tokens").click(); await wait(600);
ok(/16\/16 çift geçti/.test(await text()), "koyu tema: kontrast sözleşmesi 16/16");
await shot("19-tasarim-belirtecler-koyu");
await page.getByRole("button", { name: "Bileşenler" }).click(); await wait(600);
t = await text();
ok(has(t, "düğmeler") && has(t, "geri bildirim") && has(t, "alan bileşenleri") && has(t, "simgeler"), "bileşen galerisi");
await shot("20-tasarim-bilesenler");
await page.mouse.move(195, 500); await page.mouse.wheel(0, 1500); await wait(500);
await shot("21-tasarim-bilesenler-2");

// ---------------- Erişilebilirlik: rol/etiket kontrolü ----------------
const unlabeled = await page.evaluate(() => [...document.querySelectorAll('[role="button"],[role="switch"],[role="radio"],[role="tab"]')].filter((el) => !(el.getAttribute("aria-label") || el.textContent?.trim())).length);
ok(unlabeled === 0, "tüm etkileşimli öğelerin erişilebilir adı var");
const small = await page.evaluate(() => [...document.querySelectorAll('[role="button"],[role="switch"]')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.height < 32 || r.width < 32); }).length);
ok(small === 0, "hiçbir dokunma hedefi 32 pt'den küçük değil");

// Kilitle
await page.getByRole("button", { name: "Geri" }).click(); await wait(300); await page.getByRole("button", { name: "Geri" }).click(); await wait(400);
await tab("Daha"); await tid("lock").click(); await wait(500);
ok(page.url().endsWith("/giris"), "oturum kilitlendi");

const realErrors = errors.filter((e) => !/404|favicon|Download the React DevTools/.test(e));
ok(realErrors.length === 0, "konsolda hata yok" + (realErrors.length ? ": " + realErrors.join(" | ") : ""));
await browser.close();
console.log("\nTÜM KONTROLLER GEÇTİ ✔");
