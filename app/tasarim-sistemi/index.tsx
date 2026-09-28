import { View, Text as RNText } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Button, Card, Divider, Header, Row, Screen, Section, Small, Txt } from "@/components/ui";
import { contrast, level } from "@/lib/a11y";
import { contrastContract, palette, radius, space, type, useTheme, type ColorRole, hit } from "@/theme";

const ROLES: ColorRole[] = ["bg", "surface", "surface2", "border", "borderStrong", "text", "text2", "textMuted", "primary", "primarySoft", "success", "danger", "warning", "info"];

export default function Tokens() {
  const { c, name } = useTheme(); const router = useRouter();
  const results = contrastContract.map((r) => { const ratio = contrast(c[r.fg], c[r.bg], c.bg); return { ...r, ratio, lvl: level(ratio), pass: ratio >= r.min }; });
  const passed = results.filter((r) => r.pass).length;
  return (
    <Screen testID="ds-tokens-page">
      <Header title="Belirteçler" subtitle={`Tasarım sistemi · ${name === "dark" ? "koyu" : "açık"} tema`} back right={<Button title="Bileşenler" variant="secondary" size="sm" iconRight="right" onPress={() => router.push("/tasarim-sistemi/bilesenler")} />} />
      <Card tone={passed === results.length ? "successSoft" : "dangerSoft"} style={{ gap: 4 }}>
        <Txt role="h3" color={passed === results.length ? c.onSuccessSoft : c.onDangerSoft} testID="contrast-summary">WCAG 2.2 · {passed}/{results.length} çift geçti</Txt>
        <Small color={passed === results.length ? c.onSuccessSoft : c.onDangerSoft}>Oranlar canlı hesaplanır; aynı sözleşme birim testlerinde de doğrulanır.</Small>
      </Card>

      <Section title="Kontrast sözleşmesi">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          {results.map((r, i) => (
            <View key={r.fg + r.bg} testID={`contrast-${r.fg}-${r.bg}`}>{i > 0 && <Divider />}
              <Row style={{ paddingVertical: space[2] }} gap={space[3]}>
                <View style={{ width: 44, height: 44, borderRadius: radius.sm, backgroundColor: c[r.bg], borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center" }}><RNText style={{ color: c[r.fg], fontWeight: "800", fontSize: 18 }}>Aa</RNText></View>
                <View style={{ flex: 1 }}><Txt role="bodyStrong" color={c.text}>{r.note}</Txt><Small>{r.fg} / {r.bg} · min {r.min}:1</Small></View>
                <View style={{ alignItems: "flex-end", gap: 4 }}><Txt role="bodyStrong" color={r.pass ? c.success : c.danger}>{r.ratio.toFixed(2)}:1</Txt><Badge label={r.lvl} tone={r.pass ? "success" : "danger"} /></View>
              </Row>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Anlamsal renkler">
        <Row gap={space[2]} style={{ flexWrap: "wrap" }}>
          {ROLES.map((r) => <View key={r} style={{ width: "30%", gap: 4 }}><View style={{ height: 44, borderRadius: radius.sm, backgroundColor: c[r], borderWidth: 1, borderColor: c.border }} /><Small numberOfLines={1}>{r}</Small><Small numberOfLines={1} style={{ fontSize: 10 }}>{c[r]}</Small></View>)}
        </Row>
      </Section>

      <Section title="İlkel skala · indigo">
        <Row gap={2}>{Object.entries(palette.indigo).map(([k, v]) => <View key={k} style={{ flex: 1, alignItems: "center", gap: 2 }}><View style={{ height: 36, alignSelf: "stretch", backgroundColor: v, borderRadius: 4 }} /><Small style={{ fontSize: 9 }}>{k}</Small></View>)}</Row>
      </Section>

      <Section title="Tipografi ölçeği">
        <Card style={{ gap: space[3] }}>
          {(Object.keys(type) as (keyof typeof type)[]).map((k) => <Row key={k} style={{ justifyContent: "space-between" }} gap={space[3]}><Txt role={k} color={c.text} numberOfLines={1} style={{ flexShrink: 1 }}>{k === "label" ? "Etiket" : k === "amount" ? "₺1.250,50" : "Bankam"}</Txt><Small>{k} · {type[k].size}/{type[k].line}</Small></Row>)}
        </Card>
      </Section>

      <Section title="Boşluk · 4 pt ızgara">
        <Card style={{ gap: space[2] }}>{Object.entries(space).map(([k, v]) => <Row key={k} gap={space[3]}><Small style={{ width: 28 }}>{k}</Small><View style={{ width: v, height: 14, backgroundColor: c.primary, borderRadius: 3 }} /><Small>{v} pt</Small></Row>)}</Card>
      </Section>

      <Section title="Köşe yarıçapı ve dokunma hedefi">
        <Row gap={space[3]}>{Object.entries(radius).filter(([k]) => k !== "full").map(([k, v]) => <View key={k} style={{ alignItems: "center", gap: 4 }}><View style={{ width: 44, height: 44, borderRadius: v, backgroundColor: c.primarySoft, borderWidth: 1, borderColor: c.primary }} /><Small>{k} {v}</Small></View>)}<View style={{ alignItems: "center", gap: 4 }}><View style={{ width: hit.min, height: hit.min, borderRadius: radius.sm, borderWidth: 1, borderStyle: "dashed", borderColor: c.danger }} /><Small>min {hit.min}</Small></View></Row>
      </Section>
    </Screen>
  );
}
