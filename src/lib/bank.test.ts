import { describe, expect, it } from "vitest";
import { formatTL, parseAmount, isValidIban, makeTrIban, formatIban, isValidCard, initials, maskIban } from "./money";
import { applyTransfer, budgetStatus, goalMonthly, groupByDay, quoteTransfer, spendingByCategory, type Account, type Tx } from "./bank";

describe("para biçimlendirme", () => {
  it("kuruş → ₺ (TR biçimi)", () => { expect(formatTL(125050)).toBe("₺1.250,50"); expect(formatTL(-990)).toBe("−₺9,90"); expect(formatTL(1234500, { sign: true, compact: true })).toBe("+₺12.345"); });
  it("metin → kuruş", () => { expect(parseAmount("1.250,50")).toBe(125050); expect(parseAmount("1250.5")).toBe(125050); expect(parseAmount("₺ 300")).toBe(30000); expect(parseAmount("abc")).toBe(0); });
});
describe("IBAN / kart", () => {
  it("üretilen TR IBAN mod-97 doğrulamasından geçer", () => { const i = makeTrIban("00062", "1234567890123456"); expect(i).toHaveLength(26); expect(isValidIban(i)).toBe(true); expect(isValidIban(formatIban(i))).toBe(true); });
  it("bozuk IBAN reddedilir", () => { const i = makeTrIban("00062", "1234567890123456"); expect(isValidIban(i.slice(0, -1) + "9")).toBe(false); expect(isValidIban("TR12")).toBe(false); expect(isValidIban("GB82WEST12345698765432")).toBe(true); });
  it("maske ve baş harfler", () => { expect(maskIban("TR330006100519786457841326")).toBe("TR33 •••• 1326"); expect(initials("ayşe yılmaz")).toBe("AY"); expect(initials("ibrahim")).toBe("İ"); });
  it("Luhn", () => { expect(isValidCard("4539 1488 0343 6467")).toBe(true); expect(isValidCard("4539 1488 0343 6468")).toBe(false); });
});

const acc: Account = { id: "a1", name: "Vadesiz", kind: "vadesiz", iban: makeTrIban("00099", "1"), balance: 1_000_000, currency: "TRY", color: "#000" };
const sav: Account = { id: "a2", name: "Birikim", kind: "birikim", iban: makeTrIban("00099", "2"), balance: 0, currency: "TRY", color: "#000" };
const other = { iban: makeTrIban("00062", "77"), name: "Ayşe Yılmaz" };
const weekday = new Date("2026-09-10T11:00:00"), night = new Date("2026-09-10T22:00:00");

describe("transfer kuralları", () => {
  it("aynı banka → havale, ücretsiz", () => { const q = quoteTransfer({ fromAccount: acc, to: { iban: makeTrIban("00099", "9"), name: "X" }, amount: 100000, sentToday: 0 }); expect(q).toMatchObject({ ok: true, channel: "Havale", fee: 0 }); });
  it("₺5.000 altı başka banka → FAST ücretsiz", () => { expect(quoteTransfer({ fromAccount: acc, to: other, amount: 500000, sentToday: 0, now: night })).toMatchObject({ ok: true, channel: "FAST", fee: 0 }); });
  it("₺5.000 üstü mesai içi → EFT + ücret; mesai dışı → FAST + ücret", () => {
    expect(quoteTransfer({ fromAccount: acc, to: other, amount: 600000, sentToday: 0, now: weekday })).toMatchObject({ ok: true, channel: "EFT", fee: 350, total: 600350 });
    expect(quoteTransfer({ fromAccount: acc, to: other, amount: 600000, sentToday: 0, now: night })).toMatchObject({ ok: true, channel: "FAST", fee: 350 });
  });
  it("limitler ve bakiye", () => {
    expect(quoteTransfer({ fromAccount: acc, to: other, amount: 3_000_000, sentToday: 0 })).toMatchObject({ ok: false });
    expect(quoteTransfer({ fromAccount: acc, to: other, amount: 100000, sentToday: 4_950_000 })).toMatchObject({ ok: false, reason: "Günlük transfer limiti aşılıyor" });
    expect(quoteTransfer({ fromAccount: acc, to: other, amount: 1_000_000, sentToday: 0, now: weekday })).toMatchObject({ ok: false, reason: "Yetersiz bakiye" });
    expect(quoteTransfer({ fromAccount: acc, to: { iban: acc.iban, name: "ben" }, amount: 100, sentToday: 0 })).toMatchObject({ ok: false });
  });
  it("hesaplar arası: ücretsiz, iki hesap da güncellenir", () => {
    const r = applyTransfer([acc, sav], [], { fromAccount: acc, to: { iban: sav.iban, name: "Birikim" }, amount: 250000, sentToday: 0, ownIbans: [acc.iban, sav.iban], id: "t1", date: "2026-09-10T10:00:00" });
    expect(r.quote).toMatchObject({ ok: true, channel: "Hesaplar arası", fee: 0 });
    expect(r.accounts.map((a) => a.balance)).toEqual([750000, 250000]);
    expect(r.txs).toHaveLength(2); expect(r.txs[0].amount).toBe(-250000); expect(r.txs[1].amount).toBe(250000);
  });
  it("ücretli transfer ayrı ücret kaydı üretir", () => {
    const r = applyTransfer([acc], [], { fromAccount: acc, to: other, amount: 600000, sentToday: 0, now: weekday, id: "t2", date: "2026-09-10T10:00:00" });
    expect(r.accounts[0].balance).toBe(1_000_000 - 600350); expect(r.txs.map((t) => t.amount)).toEqual([-600000, -350]);
  });
});
describe("analiz", () => {
  const txs: Tx[] = [
    { id: "1", accountId: "a1", amount: -20000, title: "Migros", category: "market", date: "2026-09-02T10:00", status: "tamam" },
    { id: "2", accountId: "a1", amount: -30000, title: "Migros", category: "market", date: "2026-09-03T10:00", status: "tamam" },
    { id: "3", accountId: "a1", amount: -60000, title: "Yemek", category: "yemek", date: "2026-09-03T12:00", status: "tamam" },
    { id: "4", accountId: "a1", amount: 500000, title: "Maaş", category: "maas", date: "2026-09-01T09:00", status: "tamam" },
    { id: "5", accountId: "a1", amount: -10000, title: "Ağustos", category: "market", date: "2026-08-20T10:00", status: "tamam" },
  ];
  it("kategoriye göre harcama (sadece bu ay, giderler)", () => { const s = spendingByCategory(txs, "2026-09"); expect(s).toEqual([{ category: "yemek", total: 60000, pct: 55, count: 1 }, { category: "market", total: 50000, pct: 45, count: 2 }]); });
  it("güne göre grupla", () => { const g = groupByDay(txs); expect(g[0].day).toBe("2026-09-03"); expect(g[0].total).toBe(-90000); expect(g).toHaveLength(4); });
  it("bütçe ve hedef", () => { expect(budgetStatus(85000, 100000)).toEqual({ pct: 85, state: "dikkat" }); expect(budgetStatus(120000, 100000).state).toBe("asildi"); expect(goalMonthly({ id: "g", name: "", target: 1_200_000, saved: 200000, icon: "", due: "2027-03" }, "2026-09-10")).toBe(Math.ceil(1_000_000 / 6)); });
});
