import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Bars, Donut, Amount, CATEGORY_ICON, useMonthKeys } from "@/components/bank";
import { Avatar, Badge, Card, Divider, Header, ListItem, Progress, Row, Screen, Section, Segmented, Small, Txt } from "@/components/ui";
import { useStore } from "@/store";
import { BUDGETS } from "@/data/demo";
import { budgetStatus, CATEGORY_COLOR, CATEGORY_LABEL, goalMonthly, monthlyTotals, spendingByCategory, todayIso } from "@/lib/bank";
import { space, useTheme } from "@/theme";
import { formatTL } from "@/lib/money";

export default function Spending() {
  const { c } = useTheme(); const router = useRouter();
  const txs = useStore((s) => s.txs); const goals = useStore((s) => s.goals);
  const months = useMonthKeys(6); const [view, setView] = useState<"kategori" | "aylik">("kategori");
  const month = todayIso().slice(0, 7);
  const cats = spendingByCategory(txs, month); const total = cats.reduce((s, r) => s + r.total, 0);
  const totals = monthlyTotals(txs, months.map((m) => m.key));
  return (
    <Screen testID="spending">
      <Header title="Harcamalar" subtitle={new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" })} />
      <Segmented label="Görünüm" value={view} onChange={setView} options={[{ value: "kategori", label: "Kategoriler" }, { value: "aylik", label: "Aylık" }]} />
      {view === "kategori" ? (
        <>
          <Card style={{ alignItems: "center", marginTop: space[4], gap: space[2] }}>
            <Donut data={cats.map((r) => ({ value: r.total, color: CATEGORY_COLOR[r.category] }))}><Small>Toplam</Small><Amount kurus={total} role="h2" compact testID="cat-total" /></Donut>
            <Row gap={space[2]} style={{ flexWrap: "wrap", justifyContent: "center" }}>{cats.slice(0, 4).map((r) => <Row key={r.category} gap={4}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: CATEGORY_COLOR[r.category] }} /><Small>{CATEGORY_LABEL[r.category]} %{r.pct}</Small></Row>)}</Row>
          </Card>
          <Section title="Kategoriler">
            <Card padded={false} style={{ paddingHorizontal: space[4] }}>
              {cats.map((r, i) => {
                const b = BUDGETS[r.category]; const st = b ? budgetStatus(r.total, b) : null;
                return (
                  <View key={r.category} testID={`cat-${r.category}`}>{i > 0 && <Divider />}
                    <ListItem title={CATEGORY_LABEL[r.category]} subtitle={`${r.count} işlem${b ? ` · bütçe ${formatTL(b, { compact: true })}` : ""}`} left={<Avatar name={r.category} icon={CATEGORY_ICON[r.category]} color={CATEGORY_COLOR[r.category]} size={42} />}
                      right={<View style={{ alignItems: "flex-end", gap: 4 }}><Amount kurus={r.total} role="bodyStrong" compact />{st && <Badge label={st.state === "asildi" ? `%${st.pct} aşıldı` : `%${st.pct}`} tone={st.state === "iyi" ? "success" : st.state === "dikkat" ? "warning" : "danger"} />}</View>} />
                    {b && <View style={{ paddingBottom: space[3] }}><Progress value={r.total} max={b} color={st?.state === "iyi" ? CATEGORY_COLOR[r.category] : st?.state === "dikkat" ? c.warning : c.danger} height={5} label={`${CATEGORY_LABEL[r.category]} bütçesi`} /></View>}
                  </View>
                );
              })}
            </Card>
          </Section>
        </>
      ) : (
        <>
          <Card style={{ marginTop: space[4], gap: space[3] }}>
            <Row style={{ justifyContent: "space-between" }}><View><Small>Bu ay gelir</Small><Amount kurus={totals.at(-1)!.income} role="h3" color={c.success} compact /></View><View style={{ alignItems: "flex-end" }}><Small>Bu ay gider</Small><Amount kurus={totals.at(-1)!.expense} role="h3" compact testID="month-expense" /></View></Row>
            <Bars data={totals.map((t, i) => ({ label: months[i].label, income: t.income, expense: t.expense }))} />
            <Row gap={space[4]} style={{ justifyContent: "center" }}><Row gap={4}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.success }} /><Small>Gelir</Small></Row><Row gap={4}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.primary }} /><Small>Gider</Small></Row></Row>
          </Card>
          <Section title="Aylar">
            <Card padded={false} style={{ paddingHorizontal: space[4] }}>
              {[...totals].reverse().map((t, i) => { const m = months[months.length - 1 - i]; const net = t.income - t.expense; return <View key={t.month}>{i > 0 && <Divider />}<ListItem title={new Date(t.month + "-01T00:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" })} subtitle={`Gelir ${formatTL(t.income, { compact: true })} · Gider ${formatTL(t.expense, { compact: true })}`} right={<Txt role="bodyStrong" color={net >= 0 ? c.success : c.danger}>{formatTL(net, { sign: true, compact: true })}</Txt>} testID={`month-${m.key}`} /></View>; })}
            </Card>
          </Section>
        </>
      )}
      <Section title="Birikim hedefleri">
        {goals.map((g) => (
          <Card key={g.id} onPress={() => router.push(`/hesap/birikim`)} style={{ gap: space[2] }} accessibilityLabel={`${g.name}, ${formatTL(g.saved)} / ${formatTL(g.target)}`}>
            <Row style={{ justifyContent: "space-between" }}><Row gap={space[2]}><Avatar name={g.name} icon={g.icon as "sun"} size={36} color={c.primary} /><Txt role="bodyStrong" color={c.text}>{g.name}</Txt></Row><Small>Hedef {g.due.replace("-", "/")}</Small></Row>
            <Progress value={g.saved} max={g.target} label={g.name} />
            <Row style={{ justifyContent: "space-between" }}><Small>{formatTL(g.saved, { compact: true })} / {formatTL(g.target, { compact: true })}</Small><Small>Ayda {formatTL(goalMonthly(g, todayIso()), { compact: true })} gerekli</Small></Row>
          </Card>
        ))}
      </Section>
    </Screen>
  );
}
