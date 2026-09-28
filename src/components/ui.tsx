/**
 * Bankam bileşen kütüphanesi. Tüm bileşenler tema belirteçlerini (useTheme) kullanır;
 * sabit renk yoktur. Her etkileşimli bileşen erişilebilirlik rolü ve etiketi taşır.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Modal, Platform, Pressable, ScrollView, Text as RNText, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { hit, motion, radius, space, useTheme, type TypeRole } from "@/theme";
import { Icon, type IconName } from "./Icon";
import { initials } from "@/lib/money";

/* ---------- Metin ---------- */
type TP = { children: ReactNode; role?: TypeRole; color?: string; style?: StyleProp<TextStyle>; testID?: string; numberOfLines?: number; align?: "left" | "center" | "right"; accessibilityLabel?: string };
export function Txt({ children, role = "body", color, style, testID, numberOfLines, align, accessibilityLabel }: TP) {
  const { c, font } = useTheme();
  const defaultColor = role === "small" || role === "label" ? c.textMuted : role === "body" ? c.text2 : c.text;
  return <RNText testID={testID} accessibilityLabel={accessibilityLabel} numberOfLines={numberOfLines} style={[font(role), { color: color ?? defaultColor, textAlign: align }, role === "label" && { textTransform: "uppercase" }, (role === "amount" || role === "h1" || role === "display") && { fontVariant: ["tabular-nums"] }, style]}>{children}</RNText>;
}
export const H1 = (p: Omit<TP, "role">) => <Txt role="h1" {...p} />;
export const H2 = (p: Omit<TP, "role">) => <Txt role="h2" {...p} />;
export const H3 = (p: Omit<TP, "role">) => <Txt role="h3" {...p} />;
export const Small = (p: Omit<TP, "role">) => <Txt role="small" {...p} />;
export const Label = (p: Omit<TP, "role">) => <Txt role="label" {...p} />;

/* ---------- Sayfa iskeleti ---------- */
export function Screen({ children, scroll = true, padded = true, style, testID }: { children: ReactNode; scroll?: boolean; padded?: boolean; style?: StyleProp<ViewStyle>; testID?: string }) {
  const { c } = useTheme();
  const inner = <View style={[padded && { paddingHorizontal: space[4] }, { paddingBottom: space[10] }, style]}>{children}</View>;
  return (
    <SafeAreaView testID={testID} style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{inner}</ScrollView> : <View style={{ flex: 1 }}>{inner}</View>}
    </SafeAreaView>
  );
}
export function Header({ title, subtitle, back, right, onClose }: { title: string; subtitle?: string; back?: boolean; right?: ReactNode; onClose?: () => void }) {
  const router = useRouter();
  return (
    <Row style={{ paddingVertical: space[4] }} gap={space[3]}>
      {back && <IconButton name="left" label="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />}
      <View style={{ flex: 1 }}>{subtitle && <Small>{subtitle}</Small>}<H2>{title}</H2></View>
      {right}
      {onClose && <IconButton name="x" label="Kapat" onPress={onClose} />}
    </Row>
  );
}
export const Row = ({ children, style, gap = space[3] }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) => <View style={[{ flexDirection: "row", alignItems: "center", gap }, style]}>{children}</View>;
export function Divider() { const { c } = useTheme(); return <View style={{ height: 1, backgroundColor: c.border }} />; }
export const Section = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <View style={{ gap: space[3], marginTop: space[6] }}>
    <Row style={{ justifyContent: "space-between" }}><Label>{title}</Label>{action}</Row>
    {children}
  </View>
);

/* ---------- Kart ---------- */
export function Card({ children, style, tone = "surface", padded = true, onPress, testID, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: "surface" | "surface2" | "primarySoft" | "successSoft" | "dangerSoft" | "warningSoft"; padded?: boolean; onPress?: () => void; testID?: string; accessibilityLabel?: string }) {
  const { c } = useTheme();
  const base: ViewStyle = { backgroundColor: c[tone], borderRadius: radius.lg, borderWidth: 1, borderColor: tone === "surface" ? c.border : "transparent", padding: padded ? space[4] : 0, overflow: "hidden" };
  if (onPress) return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.85 }, style]}>{children}</Pressable>;
  return <View testID={testID} style={[base, style]}>{children}</View>;
}

/* ---------- Düğmeler ---------- */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export function Button({ title, onPress, variant = "primary", size = "md", icon, iconRight, disabled, loading, full, style, testID, accessibilityLabel }: { title: string; onPress: () => void; variant?: ButtonVariant; size?: "sm" | "md" | "lg"; icon?: IconName; iconRight?: IconName; disabled?: boolean; loading?: boolean; full?: boolean; style?: StyleProp<ViewStyle>; testID?: string; accessibilityLabel?: string }) {
  const { c, font } = useTheme();
  const bg = variant === "primary" ? c.primary : variant === "secondary" ? c.primarySoft : variant === "destructive" ? c.dangerSoft : "transparent";
  const fg = variant === "primary" ? c.textOnPrimary : variant === "secondary" ? c.onPrimarySoft : variant === "destructive" ? c.onDangerSoft : c.primary;
  const h = size === "sm" ? 36 : size === "lg" ? 56 : hit.comfortable;
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }} onPress={onPress} disabled={disabled || loading}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: space[2], height: h, paddingHorizontal: size === "sm" ? space[3] : space[5], borderRadius: size === "sm" ? radius.sm : radius.md, backgroundColor: pressed && variant === "primary" ? c.primaryPressed : bg, opacity: disabled ? 0.45 : pressed && variant !== "primary" ? 0.7 : 1, minWidth: hit.min }, full && { alignSelf: "stretch" }, style]}>
      {loading ? <Spinner color={fg} /> : icon ? <Icon name={icon} size={size === "sm" ? 16 : 18} color={fg} stroke={2.4} /> : null}
      <RNText style={[font(size === "sm" ? "small" : "bodyStrong"), { color: fg, fontWeight: "700" }]}>{title}</RNText>
      {iconRight && <Icon name={iconRight} size={18} color={fg} stroke={2.4} />}
    </Pressable>
  );
}
export function IconButton({ name, onPress, label, size = hit.min, tone = "surface2", color, testID, badge }: { name: IconName; onPress: () => void; label: string; size?: number; tone?: "surface2" | "primary" | "primarySoft" | "transparent"; color?: string; testID?: string; badge?: boolean }) {
  const { c } = useTheme();
  const bg = tone === "transparent" ? "transparent" : c[tone];
  const fg = color ?? (tone === "primary" ? c.textOnPrimary : tone === "primarySoft" ? c.onPrimarySoft : c.text);
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={name} size={Math.round(size * 0.48)} color={fg} stroke={2.2} />
      {badge && <View style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: c.danger, borderWidth: 1.5, borderColor: c.bg }} />}
    </Pressable>
  );
}
/** Hızlı işlem: dikey ikon + etiket */
export function ActionTile({ icon, label, onPress, testID }: { icon: IconName; label: string; onPress: () => void; testID?: string }) {
  const { c } = useTheme();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [{ flex: 1, alignItems: "center", gap: space[2], paddingVertical: space[2], opacity: pressed ? 0.7 : 1 }]}>
      <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={24} color={c.onPrimarySoft} stroke={2.2} /></View>
      <Small color={c.text2} style={{ fontWeight: "600" }} align="center">{label}</Small>
    </Pressable>
  );
}
export function Chip({ label, active, onPress, icon, testID }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName; testID?: string }) {
  const { c, font } = useTheme();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36, paddingVertical: 6, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1, borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : c.surface }}>
      {icon && <Icon name={icon} size={14} color={active ? c.textOnPrimary : c.text2} />}
      <RNText style={[font("small"), { color: active ? c.textOnPrimary : c.text2, fontWeight: "600" }]}>{label}</RNText>
    </Pressable>
  );
}
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { c, font } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", backgroundColor: c.surface2, borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return <Pressable key={o.value} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={o.label} onPress={() => onChange(o.value)} style={{ flex: 1, minHeight: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, backgroundColor: on ? c.surface : "transparent" }}><RNText style={[font("small"), { fontWeight: "700", color: on ? c.text : c.textMuted }]}>{o.label}</RNText></Pressable>;
      })}
    </View>
  );
}
export function Toggle({ value, onChange, label, testID }: { value: boolean; onChange: (v: boolean) => void; label: string; testID?: string }) {
  const { c } = useTheme();
  const x = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => { Animated.timing(x, { toValue: value ? 1 : 0, duration: motion.base, useNativeDriver: false }).start(); }, [value, x]);
  return (
    <Pressable testID={testID} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: value }} onPress={() => onChange(!value)} hitSlop={8} style={{ width: 52, height: 32, borderRadius: 16, padding: 3, backgroundColor: value ? c.primary : c.borderStrong, justifyContent: "center" }}>
      <Animated.View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.surface, transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }} />
    </Pressable>
  );
}

/* ---------- Liste ---------- */
export function ListItem({ title, subtitle, left, right, onPress, testID, accessibilityLabel, chevron }: { title: string; subtitle?: string; left?: ReactNode; right?: ReactNode; onPress?: () => void; testID?: string; accessibilityLabel?: string; chevron?: boolean }) {
  const { c } = useTheme();
  const body = (
    <>
      {left}
      <View style={{ flex: 1, gap: 2 }}><Txt role="bodyStrong" color={c.text} numberOfLines={1}>{title}</Txt>{subtitle && <Small numberOfLines={1}>{subtitle}</Small>}</View>
      {right}
      {chevron && <Icon name="right" size={18} color={c.textMuted} />}
    </>
  );
  const style: ViewStyle = { flexDirection: "row", alignItems: "center", gap: space[3], minHeight: 60, paddingVertical: space[2] };
  return onPress ? <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} onPress={onPress} style={({ pressed }) => [style, pressed && { opacity: 0.7 }]}>{body}</Pressable> : <View testID={testID} style={style}>{body}</View>;
}
export function Avatar({ name, size = 44, color, icon }: { name: string; size?: number; color?: string; icon?: IconName }) {
  const { c, name: theme } = useTheme();
  const hue = [...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 360;
  const bg = color ?? `hsl(${hue} 55% ${theme === "dark" ? 30 : 88}%)`;
  const fg = color ? c.textOnPrimary : theme === "dark" ? c.text : `hsl(${hue} 60% 28%)`;
  return (
    <View accessibilityElementsHidden style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      {icon ? <Icon name={icon} size={size * 0.5} color={fg} /> : <RNText style={{ color: fg, fontWeight: "700", fontSize: size * 0.36 }}>{initials(name)}</RNText>}
    </View>
  );
}
export function Badge({ label, tone = "primary", testID }: { label: string; tone?: "primary" | "success" | "danger" | "warning" | "info" | "neutral"; testID?: string }) {
  const { c, font } = useTheme();
  const bg = tone === "neutral" ? c.surface2 : c[`${tone}Soft` as const];
  const fg = tone === "neutral" ? c.text2 : c[`on${tone[0].toUpperCase()}${tone.slice(1)}Soft` as "onPrimarySoft"];
  return <View testID={testID} style={{ alignSelf: "flex-start", backgroundColor: bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.xs }}><RNText style={[font("small"), { color: fg, fontWeight: "700" }]}>{label}</RNText></View>;
}

/* ---------- Girişler ---------- */
export function Input(props: TextInputProps & { label?: string; help?: string; error?: string; right?: ReactNode; testID?: string }) {
  const { label, help, error, right, style, ...rest } = props; const { c, font } = useTheme(); const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label && <Label>{label}</Label>}
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.surface, borderWidth: focus ? 2 : 1, borderColor: error ? c.danger : focus ? c.focus : c.borderStrong, borderRadius: radius.md, paddingHorizontal: space[3], minHeight: hit.comfortable }}>
        <TextInput accessibilityLabel={label ?? rest.placeholder} placeholderTextColor={c.textMuted} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...rest} style={[font("body"), { flex: 1, color: c.text, paddingVertical: 10 }, Platform.OS === "web" && ({ outlineStyle: "none" } as object), style]} />
        {right}
      </View>
      {error ? <Small color={c.danger} accessibilityLabel={`Hata: ${error}`}>{error}</Small> : help ? <Small>{help}</Small> : null}
    </View>
  );
}
/** Tutar tuş takımı — tek dokunuşla büyük hedefler, ekran okuyucu etiketleri */
export function Keypad({ onKey, testID, pin }: { onKey: (k: string) => void; testID?: string; pin?: boolean }) {
  const { c, font } = useTheme();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", pin ? "" : "00", "0", "⌫"];
  return (
    <View testID={testID} style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {keys.map((k, i) => k === "" ? <View key={i} style={{ width: "33.333%", height: 60 }} /> : (
        <Pressable key={k} accessibilityRole="button" accessibilityLabel={k === "⌫" ? "Sil" : k} onPress={() => onKey(k)} style={({ pressed }) => ({ width: "33.333%", height: 60, alignItems: "center", justifyContent: "center", borderRadius: radius.md, backgroundColor: pressed ? c.surface2 : "transparent" })}>
          {k === "⌫" ? <Icon name="left" size={22} color={c.text} /> : <RNText style={[font("h2"), { color: c.text, fontWeight: "600" }]}>{k}</RNText>}
        </Pressable>
      ))}
    </View>
  );
}

/* ---------- Geri bildirim ---------- */
export function Spinner({ color, size = 18 }: { color?: string; size?: number }) {
  const { c } = useTheme(); const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: Platform.OS !== "web" })).start(); }, [spin]);
  return <Animated.View accessibilityLabel="Yükleniyor" style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2.5, borderColor: color ?? c.primary, borderTopColor: "transparent", transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }} />;
}
export function Skeleton({ width = "100%", height = 16, radiusSize = radius.sm }: { width?: number | `${number}%`; height?: number; radiusSize?: number }) {
  const { c } = useTheme(); const o = useRef(new Animated.Value(0.5)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(o, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== "web" }), Animated.timing(o, { toValue: 0.5, duration: 700, useNativeDriver: Platform.OS !== "web" })])).start(); }, [o]);
  return <Animated.View style={{ width, height, borderRadius: radiusSize, backgroundColor: c.surface2, opacity: o }} />;
}
export function Progress({ value, max, color, height = 8, label }: { value: number; max: number; color?: string; height?: number; label?: string }) {
  const { c } = useTheme(); const pct = Math.min(100, Math.max(0, max ? (value / max) * 100 : 0));
  return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={{ height, borderRadius: height / 2, backgroundColor: c.surface2, overflow: "hidden" }}><View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color ?? c.primary }} /></View>;
}
export function Banner({ tone = "info", title, text, icon, testID }: { tone?: "info" | "success" | "danger" | "warning"; title?: string; text: string; icon?: IconName; testID?: string }) {
  const { c } = useTheme(); const fg = c[`on${tone[0].toUpperCase()}${tone.slice(1)}Soft` as "onInfoSoft"];
  return (
    <View testID={testID} accessibilityRole="alert" style={{ flexDirection: "row", gap: space[3], padding: space[3], borderRadius: radius.md, backgroundColor: c[`${tone}Soft` as const], alignItems: "flex-start" }}>
      <Icon name={icon ?? (tone === "success" ? "check" : tone === "danger" ? "x" : "info")} size={20} color={fg} stroke={2.4} />
      <View style={{ flex: 1, gap: 2 }}>{title && <Txt role="bodyStrong" color={fg}>{title}</Txt>}<Small color={fg}>{text}</Small></View>
    </View>
  );
}
/** Alttan açılan sayfa */
export function Sheet({ open, onClose, title, children, testID }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; testID?: string }) {
  const { c } = useTheme();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Kapat" onPress={onClose} style={{ flex: 1, backgroundColor: c.overlay }} />
      <View testID={testID} style={{ backgroundColor: c.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space[4], paddingBottom: space[8], gap: space[3] }}>
        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.borderStrong, marginBottom: space[2] }} />
        {title && <Row style={{ justifyContent: "space-between" }}><H3>{title}</H3><IconButton name="x" label="Kapat" onPress={onClose} size={36} /></Row>}
        {children}
      </View>
    </Modal>
  );
}
export function Toast({ text, tone = "success", visible }: { text: string; tone?: "success" | "danger" | "info"; visible: boolean }) {
  const { c } = useTheme(); if (!visible) return null;
  return <View accessibilityRole="alert" testID="toast" style={{ position: "absolute", left: space[4], right: space[4], bottom: 96, flexDirection: "row", gap: space[2], alignItems: "center", padding: space[3], borderRadius: radius.md, backgroundColor: c.surfaceInverse }}><Icon name={tone === "success" ? "check" : tone === "danger" ? "x" : "info"} size={18} color={c.textInverse} stroke={2.4} /><Txt role="bodyStrong" color={c.textInverse}>{text}</Txt></View>;
}
export function Empty({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const { c } = useTheme();
  return <Card style={{ alignItems: "center", gap: 6, paddingVertical: space[6] }}><Icon name={icon} size={28} color={c.textMuted} /><H3>{title}</H3><Small align="center">{text}</Small></Card>;
}
