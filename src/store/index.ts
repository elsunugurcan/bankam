import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyTransfer, quoteTransfer, todayIso, type Account, type Card, type Contact, type Goal, type Tx, type TransferQuote } from "@/lib/bank";
import { ACCOUNTS, CARDS, CONTACTS, GOALS, TRANSACTIONS } from "@/data/demo";
import type { FontScale, ThemeName } from "@/theme/tokens";

export type Settings = { theme: ThemeName | "system"; fontScale: FontScale; hideBalances: boolean; haptics: boolean; biometrics: boolean; notifications: boolean };
export type State = {
  unlocked: boolean;
  accounts: Account[]; cards: Card[]; contacts: Contact[]; goals: Goal[]; txs: Tx[];
  settings: Settings;
  sentToday: Record<string, number>;
  // eylemler
  unlock: () => void; lock: () => void;
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  transfer: (fromId: string, to: { iban: string; name: string }, amount: number, note?: string) => TransferQuote & { txId?: string };
  quote: (fromId: string, to: { iban: string; name: string }, amount: number) => TransferQuote;
  toggleCard: (id: string, key: "frozen" | "onlineEnabled" | "contactless") => void;
  setCardLimit: (id: string, limit: number) => void;
  addContact: (c: Omit<Contact, "id">) => Contact;
  toggleFavorite: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  reset: () => void;
};
const uid = () => Math.random().toString(36).slice(2, 10);
const initial = () => ({ unlocked: false, accounts: ACCOUNTS, cards: CARDS, contacts: CONTACTS, goals: GOALS, txs: TRANSACTIONS, sentToday: {} as Record<string, number>, settings: { theme: "dark" as const, fontScale: "normal" as const, hideBalances: false, haptics: true, biometrics: true, notifications: true } });

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial(),
      unlock: () => set({ unlocked: true }),
      lock: () => set({ unlocked: false }),
      setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
      quote: (fromId, to, amount) => { const s = get(); const from = s.accounts.find((a) => a.id === fromId)!; return quoteTransfer({ fromAccount: from, to, amount, sentToday: s.sentToday[todayIso()] ?? 0, ownIbans: s.accounts.map((a) => a.iban) }); },
      transfer: (fromId, to, amount, note) => {
        const s = get(); const from = s.accounts.find((a) => a.id === fromId)!; const t = todayIso(); const id = "tx" + uid();
        const r = applyTransfer(s.accounts, s.txs, { fromAccount: from, to, amount, sentToday: s.sentToday[t] ?? 0, ownIbans: s.accounts.map((a) => a.iban), id, date: new Date().toISOString().slice(0, 16) });
        if (!r.quote.ok) return r.quote;
        const txs = note ? r.txs.map((x) => (x.id === id ? { ...x, note: `${x.note} · ${note}` } : x)) : r.txs;
        const contacts = s.contacts.map((c) => (c.iban === to.iban ? { ...c, lastSent: new Date().toISOString().slice(0, 16) } : c));
        set({ accounts: r.accounts, txs, contacts, sentToday: { [t]: (s.sentToday[t] ?? 0) + amount } });
        return { ...r.quote, txId: id };
      },
      toggleCard: (id, key) => set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, [key]: !c[key] } : c)) })),
      setCardLimit: (id, limit) => set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, limit } : c)) })),
      addContact: (c) => { const n = { ...c, id: "p" + uid() }; set((s) => ({ contacts: [n, ...s.contacts] })); return n; },
      toggleFavorite: (id) => set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)) })),
      addToGoal: (id, amount) => set((s) => {
        const g = s.goals.find((x) => x.id === id); if (!g) return s;
        const from = s.accounts.find((a) => a.id === "vadesiz")!; if (from.balance < amount) return s;
        return { goals: s.goals.map((x) => (x.id === id ? { ...x, saved: x.saved + amount } : x)), accounts: s.accounts.map((a) => (a.id === "vadesiz" ? { ...a, balance: a.balance - amount } : a.id === "birikim" ? { ...a, balance: a.balance + amount } : a)), txs: [{ id: "tx" + uid(), accountId: "vadesiz", amount: -amount, title: `Hedef: ${g.name}`, category: "transfer", date: new Date().toISOString().slice(0, 16), status: "tamam", note: "Hesaplar arası" }, ...s.txs] };
      }),
      reset: () => set({ ...initial(), unlocked: true }),
    }),
    { name: "bankam-v1", storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ accounts: s.accounts, cards: s.cards, contacts: s.contacts, goals: s.goals, txs: s.txs, settings: s.settings, sentToday: s.sentToday }) },
  ),
);
