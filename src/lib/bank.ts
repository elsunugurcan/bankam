/** Bankacılık alan mantığı — saf fonksiyonlar, tutarlar kuruş cinsinden. */
export type Account = { id: string; name: string; kind: "vadesiz" | "birikim" | "yatirim"; iban: string; balance: number; currency: "TRY"; color: string };
export type Category = "market" | "yemek" | "ulasim" | "fatura" | "eglence" | "saglik" | "giyim" | "transfer" | "maas" | "diger";
export type Tx = { id: string; accountId: string; amount: number; title: string; category: Category; date: string; counterparty?: string; note?: string; cardId?: string; status: "tamam" | "bekliyor" };
export type Contact = { id: string; name: string; iban: string; bank: string; lastSent?: string; favorite?: boolean };
export type Card = { id: string; accountId: string; pan: string; holder: string; expires: string; kind: "banka" | "kredi"; frozen: boolean; limit: number; onlineEnabled: boolean; contactless: boolean; spentThisMonth: number };
export type Goal = { id: string; name: string; target: number; saved: number; icon: string; due: string };

export const CATEGORY_LABEL: Record<Category, string> = { market: "Market", yemek: "Yeme-içme", ulasim: "Ulaşım", fatura: "Faturalar", eglence: "Eğlence", saglik: "Sağlık", giyim: "Giyim", transfer: "Transfer", maas: "Maaş", diger: "Diğer" };
export const CATEGORY_COLOR: Record<Category, string> = { market: "#10b981", yemek: "#f59e0b", ulasim: "#38bdf8", fatura: "#818cf8", eglence: "#ec4899", saglik: "#f43f5e", giyim: "#a78bfa", transfer: "#94a3b8", maas: "#34d399", diger: "#64748b" };

export const LIMITS = { dailyTransfer: 5_000_000, singleTransfer: 2_500_000, freeFastThreshold: 500_000, fastFee: 350 } as const; // ₺50.000 / ₺25.000 / ₺5.000 / ₺3,50

export type TransferInput = { fromAccount: Account; to: { iban: string; name: string }; amount: number; sentToday: number; now?: Date; ownIbans?: string[] };
export type Channel = "FAST" | "EFT" | "Havale" | "Hesaplar arası";
export type TransferQuote = { ok: true; fee: number; total: number; channel: Channel; warnings: string[] } | { ok: false; reason: string };

export function isBusinessHours(d: Date): boolean { const day = d.getDay(), h = d.getHours(); return day >= 1 && day <= 5 && h >= 9 && h < 17; }
export function quoteTransfer(i: TransferInput): TransferQuote {
  const now = i.now ?? new Date();
  if (i.amount <= 0) return { ok: false, reason: "Tutar sıfırdan büyük olmalı" };
  if (i.amount > LIMITS.singleTransfer) return { ok: false, reason: `Tek seferlik limit ₺${LIMITS.singleTransfer / 100 / 1000}.000` };
  if (i.sentToday + i.amount > LIMITS.dailyTransfer) return { ok: false, reason: "Günlük transfer limiti aşılıyor" };
  const sameBank = i.to.iban.slice(4, 9) === i.fromAccount.iban.slice(4, 9);
  const own = i.to.iban === i.fromAccount.iban;
  if (own) return { ok: false, reason: "Aynı hesaba transfer yapılamaz" };
  const warnings: string[] = [];
  let channel: Channel;
  let fee = 0;
  if (i.ownIbans?.includes(i.to.iban)) channel = "Hesaplar arası";
  else if (sameBank) channel = "Havale";
  else if (i.amount <= LIMITS.freeFastThreshold) channel = "FAST";
  else if (isBusinessHours(now)) { channel = "EFT"; fee = LIMITS.fastFee; warnings.push("EFT ücreti uygulanır"); }
  else { channel = "FAST"; fee = LIMITS.fastFee; warnings.push("Mesai dışı, FAST ücreti uygulanır"); }
  const total = i.amount + fee;
  if (total > i.fromAccount.balance) return { ok: false, reason: "Yetersiz bakiye" };
  if (i.amount >= 1_000_000) warnings.push("Yüksek tutar: alıcı adını kontrol edin");
  return { ok: true, fee, total, channel, warnings };
}

/** Transferi uygular: hesap bakiyesi düşer, iki işlem kaydı (transfer + varsa ücret) üretir. */
export function applyTransfer(accounts: Account[], txs: Tx[], i: TransferInput & { id: string; date: string }): { accounts: Account[]; txs: Tx[]; quote: TransferQuote } {
  const quote = quoteTransfer(i); if (!quote.ok) return { accounts, txs, quote };
  const next = accounts.map((a) => (a.id === i.fromAccount.id ? { ...a, balance: a.balance - quote.total } : a));
  const own = accounts.find((a) => a.iban === i.to.iban);
  const withOwn = own ? next.map((a) => (a.id === own.id ? { ...a, balance: a.balance + i.amount } : a)) : next;
  const out: Tx[] = [{ id: i.id, accountId: i.fromAccount.id, amount: -i.amount, title: i.to.name, category: "transfer", date: i.date, counterparty: i.to.iban, status: "tamam", note: quote.channel }];
  if (quote.fee) out.push({ id: i.id + "-f", accountId: i.fromAccount.id, amount: -quote.fee, title: `${quote.channel} ücreti`, category: "fatura", date: i.date, status: "tamam" });
  if (own) out.push({ id: i.id + "-in", accountId: own.id, amount: i.amount, title: i.fromAccount.name, category: "transfer", date: i.date, status: "tamam", note: "Hesaplar arası" });
  return { accounts: withOwn, txs: [...out, ...txs], quote };
}

/** Bu ayki harcamalar kategoriye göre (sadece giderler). */
export function spendingByCategory(txs: Tx[], month: string): { category: Category; total: number; pct: number; count: number }[] {
  const rows = new Map<Category, { total: number; count: number }>();
  let sum = 0;
  for (const t of txs) if (t.amount < 0 && t.date.startsWith(month) && t.category !== "transfer") { const r = rows.get(t.category) ?? { total: 0, count: 0 }; r.total += -t.amount; r.count++; rows.set(t.category, r); sum += -t.amount; }
  return [...rows].map(([category, r]) => ({ category, total: r.total, count: r.count, pct: sum ? Math.round((r.total / sum) * 100) : 0 })).sort((a, b) => b.total - a.total);
}
export function monthlyTotals(txs: Tx[], months: string[]): { month: string; income: number; expense: number }[] {
  return months.map((m) => ({ month: m, income: txs.filter((t) => t.amount > 0 && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0), expense: txs.filter((t) => t.amount < 0 && t.date.startsWith(m)).reduce((s, t) => s - t.amount, 0) }));
}
export function budgetStatus(spent: number, budget: number): { pct: number; state: "iyi" | "dikkat" | "asildi" } {
  const pct = budget ? Math.round((spent / budget) * 100) : 0;
  return { pct, state: pct >= 100 ? "asildi" : pct >= 80 ? "dikkat" : "iyi" };
}
/** Hedef için aylık gereken birikim. */
export function goalMonthly(g: Goal, today: string): number {
  const [y, m] = today.split("-").map(Number), [ty, tm] = g.due.split("-").map(Number);
  const months = Math.max(1, (ty - y) * 12 + (tm - m));
  return Math.ceil((g.target - g.saved) / months);
}
/** İşlemleri güne göre gruplar (yeni → eski). */
export function groupByDay(txs: Tx[]): { day: string; items: Tx[]; total: number }[] {
  const map = new Map<string, Tx[]>();
  for (const t of [...txs].sort((a, b) => (a.date < b.date ? 1 : -1))) { const d = t.date.slice(0, 10); map.set(d, [...(map.get(d) ?? []), t]); }
  return [...map].map(([day, items]) => ({ day, items, total: items.reduce((s, t) => s + t.amount, 0) }));
}
export function dayLabel(iso: string, today: string): string {
  if (iso === today) return "Bugün";
  const d = new Date(iso + "T00:00:00"), t = new Date(today + "T00:00:00");
  if ((t.getTime() - d.getTime()) / 86400000 === 1) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
}
export const todayIso = () => new Date().toISOString().slice(0, 10);
export const totalBalance = (accounts: Account[]) => accounts.reduce((s, a) => s + a.balance, 0);
