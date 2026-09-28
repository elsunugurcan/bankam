import { makeTrIban } from "@/lib/money";
import type { Account, Card, Contact, Goal, Tx, Category } from "@/lib/bank";

export const BANK_CODE = "00099"; // Bankam (kurgusal)
const iso = (daysAgo: number, hh = 12, mm = 0) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); d.setHours(hh, mm, 0, 0); return d.toISOString().slice(0, 16); };

export const ACCOUNTS: Account[] = [
  { id: "vadesiz", name: "Vadesiz Hesap", kind: "vadesiz", iban: makeTrIban(BANK_CODE, "1000000000000001"), balance: 1_842_560, currency: "TRY", color: "#4f46e5" },
  { id: "birikim", name: "Birikim Hesabı", kind: "birikim", iban: makeTrIban(BANK_CODE, "1000000000000002"), balance: 6_500_000, currency: "TRY", color: "#059669" },
  { id: "yatirim", name: "Yatırım Hesabı", kind: "yatirim", iban: makeTrIban(BANK_CODE, "1000000000000003"), balance: 2_275_000, currency: "TRY", color: "#b45309" },
];
export const CARDS: Card[] = [
  { id: "c1", accountId: "vadesiz", pan: "4539148803436467", holder: "UĞUR CAN ELSUN", expires: "09/29", kind: "banka", frozen: false, limit: 500_000, onlineEnabled: true, contactless: true, spentThisMonth: 412_350 },
  { id: "c2", accountId: "vadesiz", pan: "5355220012345670", holder: "UĞUR CAN ELSUN", expires: "03/28", kind: "kredi", frozen: false, limit: 4_000_000, onlineEnabled: true, contactless: false, spentThisMonth: 1_286_400 },
];
export const CONTACTS: Contact[] = [
  { id: "p1", name: "Ayşe Yılmaz", iban: makeTrIban("00062", "2000000000000011"), bank: "Garanti BBVA", lastSent: iso(2), favorite: true },
  { id: "p2", name: "Mehmet Demir", iban: makeTrIban(BANK_CODE, "1000000000000077"), bank: "Bankam", lastSent: iso(5), favorite: true },
  { id: "p3", name: "Elif Kaya", iban: makeTrIban("00010", "3000000000000021"), bank: "Ziraat", lastSent: iso(9), favorite: true },
  { id: "p4", name: "Can Öztürk", iban: makeTrIban("00046", "4000000000000045"), bank: "Akbank", lastSent: iso(14) },
  { id: "p5", name: "Zeynep Arslan", iban: makeTrIban("00064", "5000000000000099"), bank: "İş Bankası", lastSent: iso(20) },
  { id: "p6", name: "Kiracı — Deniz Ak", iban: makeTrIban("00111", "6000000000000123"), bank: "QNB", lastSent: iso(31) },
];
export const GOALS: Goal[] = [
  { id: "g1", name: "Tatil fonu", target: 3_000_000, saved: 1_950_000, icon: "sun", due: "2027-06" },
  { id: "g2", name: "Acil durum", target: 10_000_000, saved: 4_550_000, icon: "shield", due: "2027-12" },
];
export const BUDGETS: Partial<Record<Category, number>> = { market: 800_000, yemek: 400_000, ulasim: 150_000, eglence: 250_000, giyim: 200_000 };

const tx = (id: number, accountId: string, amount: number, title: string, category: Category, daysAgo: number, hh: number, extra: Partial<Tx> = {}): Tx => ({ id: "tx" + id, accountId, amount, title, category, date: iso(daysAgo, hh), status: "tamam", ...extra });
export const TRANSACTIONS: Tx[] = [
  tx(1, "vadesiz", -18_990, "Migros", "market", 0, 9, { cardId: "c1" }),
  tx(2, "vadesiz", -8_500, "İstanbulkart", "ulasim", 0, 8, { cardId: "c1" }),
  tx(3, "vadesiz", -34_250, "Getir", "market", 1, 20, { cardId: "c1" }),
  tx(4, "vadesiz", -62_000, "Kıyı Balık", "yemek", 1, 13, { cardId: "c2" }),
  tx(5, "vadesiz", -150_000, "Ayşe Yılmaz", "transfer", 2, 11, { counterparty: CONTACTS[0].iban, note: "FAST" }),
  tx(6, "vadesiz", -119_900, "Spotify", "eglence", 3, 6, { cardId: "c2", status: "bekliyor" }),
  tx(7, "vadesiz", -89_400, "CK Enerji", "fatura", 3, 10),
  tx(8, "vadesiz", -45_700, "Eczane Yıldız", "saglik", 4, 17, { cardId: "c1" }),
  tx(9, "vadesiz", -2_100_000, "Kira — Deniz Ak", "transfer", 5, 9, { counterparty: CONTACTS[5].iban, note: "EFT" }),
  tx(10, "vadesiz", -140_000, "Mehmet Demir", "transfer", 5, 15, { counterparty: CONTACTS[1].iban, note: "Havale" }),
  tx(11, "vadesiz", -249_900, "Zara", "giyim", 6, 18, { cardId: "c2" }),
  tx(12, "vadesiz", -27_500, "Şok Market", "market", 7, 19, { cardId: "c1" }),
  tx(13, "vadesiz", -15_000, "Taksi", "ulasim", 8, 23, { cardId: "c1" }),
  tx(14, "vadesiz", -320_000, "Türk Telekom", "fatura", 9, 10),
  tx(15, "vadesiz", -78_000, "Sinema + yemek", "eglence", 10, 21, { cardId: "c2" }),
  tx(16, "vadesiz", 8_950_000, "Maaş — Delta Yazılım A.Ş.", "maas", 12, 9),
  tx(17, "vadesiz", -500_000, "Birikim Hesabı", "transfer", 12, 9, { note: "Hesaplar arası" }),
  tx(18, "birikim", 500_000, "Vadesiz Hesap", "transfer", 12, 9, { note: "Hesaplar arası" }),
  tx(19, "vadesiz", -96_500, "Carrefour", "market", 13, 12, { cardId: "c1" }),
  tx(20, "vadesiz", -41_000, "Kahve Durağı", "yemek", 14, 8, { cardId: "c1" }),
  tx(21, "vadesiz", -20_000, "Otopark", "ulasim", 16, 14, { cardId: "c1" }),
  tx(22, "vadesiz", -185_000, "Doktor randevusu", "saglik", 18, 11, { cardId: "c2" }),
  tx(23, "vadesiz", -52_000, "Yemeksepeti", "yemek", 22, 20, { cardId: "c2" }),
  tx(24, "vadesiz", -110_000, "Migros", "market", 25, 18, { cardId: "c1" }),
  tx(25, "vadesiz", -99_000, "Netflix + Spotify", "eglence", 33, 6, { cardId: "c2" }),
  tx(26, "vadesiz", 8_950_000, "Maaş — Delta Yazılım A.Ş.", "maas", 42, 9),
  tx(27, "vadesiz", -2_100_000, "Kira — Deniz Ak", "transfer", 35, 9, { note: "EFT" }),
  tx(28, "vadesiz", -640_000, "Market (Ağustos)", "market", 40, 12),
  tx(29, "birikim", 42_300, "Faiz getirisi", "diger", 11, 0),
  ...[72, 102, 132, 162].flatMap((d, i) => [
    tx(40 + i * 4, "vadesiz", 8_950_000, "Maaş — Delta Yazılım A.Ş.", "maas", d, 9),
    tx(41 + i * 4, "vadesiz", -2_100_000, "Kira — Deniz Ak", "transfer", d - 2, 9, { note: "EFT" }),
    tx(42 + i * 4, "vadesiz", -(600_000 + i * 45_000), "Market harcamaları", "market", d - 10, 12),
    tx(43 + i * 4, "vadesiz", -(380_000 + i * 20_000), "Faturalar", "fatura", d - 12, 10),
  ]),
  tx(30, "yatirim", 175_000, "Fon değer artışı", "diger", 3, 0),
];
export const DEMO_USER = { name: "Uğur Can Elsun", short: "Uğur", email: "ugur@bankam.example", phone: "+90 5•• ••• 42 67", customerNo: "1042 9931" };
