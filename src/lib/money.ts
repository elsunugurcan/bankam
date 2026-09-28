/** Para, IBAN ve kart yardımcıları — saf fonksiyonlar. */
export function formatTL(kurus: number, opts: { sign?: boolean; compact?: boolean } = {}): string {
  const neg = kurus < 0; const abs = Math.abs(kurus);
  const lira = Math.floor(abs / 100), k = abs % 100;
  const int = lira.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = opts.compact && k === 0 ? int : `${int},${k.toString().padStart(2, "0")}`;
  const s = neg ? "−" : opts.sign ? "+" : "";
  return `${s}₺${body}`;
}
/** "1.250,50" | "1250.5" | "1250" → kuruş */
export function parseAmount(s: string): number {
  const t = s.replace(/[^\d,.\-]/g, "");
  if (!t) return 0;
  const norm = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  const n = Number(norm); if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
/** Tuş takımı girişi: rakam dizisi → kuruş (son iki hane kuruş) */
export const keypadToKurus = (digits: string) => Number(digits || "0");
export const kurusToKeypad = (kurus: number) => String(kurus);

/* ---------- IBAN ---------- */
export function normalizeIban(s: string): string { return s.replace(/\s+/g, "").toUpperCase(); }
export function formatIban(s: string): string { return normalizeIban(s).replace(/(.{4})/g, "$1 ").trim(); }
/** ISO 13616 mod-97 doğrulaması. Türkiye: TR + 24 hane = 26 karakter. */
export function isValidIban(s: string): boolean {
  const iban = normalizeIban(s);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  if (iban.startsWith("TR") && iban.length !== 26) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let rem = 0;
  for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
  return rem === 1;
}
/** Geçerli bir TR IBAN üretir (demo verisi için). */
export function makeTrIban(bankCode: string, account: string): string {
  const bban = bankCode.padStart(5, "0") + "0" + account.padStart(16, "0");
  const digits = (bban + "TR00").replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
  let rem = 0; for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
  const check = String(98 - rem).padStart(2, "0");
  return "TR" + check + bban;
}
export const maskIban = (s: string) => { const n = normalizeIban(s); return n.slice(0, 4) + " •••• " + n.slice(-4); };
export const maskCard = (pan: string) => "•••• " + pan.replace(/\s/g, "").slice(-4);
export function formatCard(pan: string): string { return pan.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim(); }
/** Luhn */
export function isValidCard(pan: string): boolean {
  const d = pan.replace(/\D/g, ""); if (d.length < 13) return false;
  let sum = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) { let n = Number(d[i]); if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; }
  return sum % 10 === 0;
}
/** Kişi adı baş harfleri (avatar için). */
export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toLocaleUpperCase("tr-TR") ?? "").join("");
