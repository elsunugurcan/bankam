import { useMemo, type ReactNode } from "react";
import { Pressable, Text as RNText, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { radius, space, useTheme } from "@/theme";
import { useStore } from "@/store";
import { Avatar, Badge, ListItem, Small, Txt } from "./ui";
import { Icon, type IconName } from "./Icon";
import { CATEGORY_COLOR, CATEGORY_LABEL, type Account, type Card as CardT, type Tx } from "@/lib/bank";
import { formatTL, maskCard, maskIban } from "@/lib/money";

/** Bakiye — "gizle" ayarına saygı duyar */
export function Amount({ kurus, role = "amount", color, sign, compact, testID }: { kurus: number; role?: "amount" | "h1" | "h2" | "h3" | "bodyStrong" | "body"; color?: string; sign?: boolean; compact?: boolean; testID?: string }) {
  const hide = useStore((s) => s.settings.hideBalances); const { c } = useTheme();
  return <Txt role={role} color={color ?? c.text} testID={testID} accessibilityLabel={hide ? "Bakiye gizli" : formatTL(kurus, { sign, compact })}>{hide ? "₺ ••••" : formatTL(kurus, { sign, compact })}</Txt>;
}
export const CATEGORY_ICON: Record<Tx["category"], IconName> = { market: "cart", yemek: "food", ulasim: "bus", fatura: "bolt", eglence: "film", saglik: "heart", giyim: "shirt", transfer: "send", maas: "briefcase", diger: "dots" };

export function TxRow({ tx, onPress, testID }: { tx: Tx; onPress?: () => void; testID?: string }) {
  const { c } = useTheme();
  const time = tx.date.slice(11, 16);
  return (
    <ListItem testID={testID} onPress={onPress} title={tx.title} subtitle={`${CATEGORY_LABEL[tx.category]} · ${time}${tx.status === "bekliyor" ? " · Bekliyor" : ""}`} accessibilityLabel={`${tx.title}, ${formatTL(tx.amount, { sign: true })}`}
      left={<Avatar name={tx.title} icon={CATEGORY_ICON[tx.category]} color={CATEGORY_COLOR[tx.category]} size={42} />}
      right={<Amount kurus={tx.amount} role="bodyStrong" sign compact color={tx.amount > 0 ? c.success : c.text} />} />
  );
}

/** Hesap kartı — gradyan, IBAN maskesi */
export function AccountCard({ account, onPress, compact, testID }: { account: Account; onPress?: () => void; compact?: boolean; testID?: string }) {
  const { c } = useTheme();
  const w = compact ? 260 : undefined, h = compact ? 150 : 170;
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${account.name}, ${formatTL(account.balance)}`} onPress={onPress} style={({ pressed }) => [{ width: w, height: h, borderRadius: radius.lg, overflow: "hidden", opacity: pressed ? 0.9 : 1 }]}>
      <Svg width="100%" height="100%" style={{ position: "absolute" }} preserveAspectRatio="none" viewBox="0 0 300 170">
        <Defs><LinearGradient id={"g" + account.id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={account.color} /><Stop offset="1" stopColor={shade(account.color)} /></LinearGradient></Defs>
        <Rect width="300" height="170" fill={`url(#g${account.id})`} />
        <Circle cx="260" cy="20" r="80" fill="rgba(255,255,255,0.10)" /><Circle cx="40" cy="170" r="60" fill="rgba(0,0,0,0.12)" />
      </Svg>
      <View style={{ flex: 1, padding: space[4], justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <RNText style={{ color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 13 }}>{account.name}</RNText>
          <Icon name={account.kind === "vadesiz" ? "wallet" : account.kind === "birikim" ? "target" : "trending"} size={18} color="rgba(255,255,255,0.9)" />
        </View>
        <View>
          <Amount kurus={account.balance} role={compact ? "h2" : "h1"} color="#ffffff" testID={`balance-${account.id}`} />
          <RNText style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4, fontVariant: ["tabular-nums"] }}>{maskIban(account.iban)}</RNText>
        </View>
      </View>
      {onPress && <View style={{ position: "absolute", right: space[3], bottom: space[3] }}><Icon name="right" size={18} color="rgba(255,255,255,0.8)" /></View>}
    </Pressable>
  );
}
function shade(hex: string) { const n = parseInt(hex.slice(1), 16); const f = (v: number) => Math.max(0, Math.round(v * 0.55)); return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map((v) => v.toString(16).padStart(2, "0")).join(""); }

/** Banka/kredi kartı görseli */
export function BankCard({ card, testID }: { card: CardT; testID?: string }) {
  const bg = card.kind === "kredi" ? ["#1c2033", "#0a0d1a"] : ["#4f46e5", "#312e81"];
  return (
    <View testID={testID} accessibilityLabel={`${card.kind === "kredi" ? "Kredi kartı" : "Banka kartı"} ${maskCard(card.pan)}${card.frozen ? ", donduruldu" : ""}`} style={{ height: 190, borderRadius: radius.lg, overflow: "hidden", opacity: card.frozen ? 0.6 : 1 }}>
      <Svg width="100%" height="100%" style={{ position: "absolute" }} preserveAspectRatio="none" viewBox="0 0 320 190">
        <Defs><LinearGradient id={"c" + card.id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={bg[0]} /><Stop offset="1" stopColor={bg[1]} /></LinearGradient></Defs>
        <Rect width="320" height="190" fill={`url(#c${card.id})`} />
        <Path d="M0 120 C 90 60, 200 200, 320 110 L320 190 L0 190z" fill="rgba(255,255,255,0.06)" />
      </Svg>
      <View style={{ flex: 1, padding: space[5], justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <RNText style={{ color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 1 }}>bankam</RNText>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>{card.contactless && <Icon name="wifi" size={18} color="rgba(255,255,255,0.85)" />}{card.frozen && <Icon name="snow" size={18} color="#fff" />}</View>
        </View>
        <View style={{ width: 40, height: 28, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.35)", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)" }} />
        <View>
          <RNText style={{ color: "#fff", fontSize: 18, letterSpacing: 2, fontVariant: ["tabular-nums"] }}>{maskCard(card.pan)}</RNText>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <RNText style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" }}>{card.holder}</RNText>
            <RNText style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{card.expires} · {card.kind === "kredi" ? "KREDİ" : "BANKA"}</RNText>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Kategori halka grafiği */
export function Donut({ data, size = 180, stroke = 22, children }: { data: { value: number; color: string }[]; size?: number; stroke?: number; children?: ReactNode }) {
  const { c } = useTheme();
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, total = data.reduce((s, d) => s + d.value, 0) || 1;
  let off = 0;
  const arcs = data.map((d) => { const len = (d.value / total) * circ; const a = { len, off, color: d.color }; off += len; return a; });
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.surface2} strokeWidth={stroke} fill="none" />
        {arcs.map((a, i) => <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={a.color} strokeWidth={stroke} fill="none" strokeDasharray={`${Math.max(0, a.len - 3)} ${circ}`} strokeDashoffset={-a.off} strokeLinecap="butt" />)}
      </Svg>
      {children}
    </View>
  );
}
/** Aylık gelir/gider çubukları */
export function Bars({ data, height = 120 }: { data: { label: string; income: number; expense: number }[]; height?: number }) {
  const { c } = useTheme();
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  return (
    <View accessibilityLabel="Aylık gelir ve gider grafiği" style={{ flexDirection: "row", alignItems: "flex-end", gap: space[3], height: height + 22 }}>
      {data.map((d) => (
        <View key={d.label} style={{ flex: 1, alignItems: "center", gap: 6 }}>
          <View style={{ flexDirection: "row", gap: 4, alignItems: "flex-end", height }}>
            <View style={{ width: 12, height: Math.max(3, (d.income / max) * height), borderRadius: 4, backgroundColor: c.success }} />
            <View style={{ width: 12, height: Math.max(3, (d.expense / max) * height), borderRadius: 4, backgroundColor: c.primary }} />
          </View>
          <Small>{d.label}</Small>
        </View>
      ))}
    </View>
  );
}
export function CategoryPill({ category }: { category: Tx["category"] }) { return <Badge label={CATEGORY_LABEL[category]} tone="neutral" />; }
export const useMonthKeys = (n: number) => useMemo(() => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (n - 1 - i)); return { key: d.toISOString().slice(0, 7), label: d.toLocaleDateString("tr-TR", { month: "short" }) }; }), [n]);
