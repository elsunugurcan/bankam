import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AccountCard, Amount, TxRow } from "@/components/bank";
import { ActionTile, Avatar, Button, Card, H1, IconButton, Row, Section, Small, Txt } from "@/components/ui";
import { useStore } from "@/store";
import { DEMO_USER } from "@/data/demo";
import { budgetStatus, groupByDay, dayLabel, spendingByCategory, todayIso, totalBalance } from "@/lib/bank";
import { BUDGETS } from "@/data/demo";
import { Screen } from "@/components/ui";
import { space, useTheme } from "@/theme";
import { formatTL } from "@/lib/money";

export default function Home() {
  const { c } = useTheme(); const router = useRouter();
  const accounts = useStore((s) => s.accounts); const txs = useStore((s) => s.txs); const goals = useStore((s) => s.goals);
  const hide = useStore((s) => s.settings.hideBalances); const setSetting = useStore((s) => s.setSetting);
  const today = todayIso();
  const recent = groupByDay(txs.filter((t) => t.accountId === "vadesiz")).slice(0, 2);
  const spent = spendingByCategory(txs, today.slice(0, 7)).reduce((s, r) => s + r.total, 0);
  const budget = Object.values(BUDGETS).reduce((s, v) => s + (v ?? 0), 0);
  const b = budgetStatus(spent, budget);
  const hour = new Date().getHours(); const greet = hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  return (
    <Screen padded={false} testID="home">
      <View style={{ paddingHorizontal: space[4] }}>
        <Row style={{ paddingVertical: space[4], justifyContent: "space-between" }}>
          <Row gap={space[3]}><Avatar name={DEMO_USER.name} size={40} color={c.primary} /><View><Small>{greet}</Small><Txt role="h3" color={c.text}>{DEMO_USER.short}</Txt></View></Row>
          <Row gap={space[2]}>
            <IconButton name={hide ? "eyeOff" : "eye"} label={hide ? "Bakiyeleri göster" : "Bakiyeleri gizle"} onPress={() => setSetting("hideBalances", !hide)} testID="toggle-hide" />
            <IconButton name="bell" label="Bildirimler" onPress={() => {}} badge />
          </Row>
        </Row>
        <View style={{ gap: 4, marginBottom: space[4] }}>
          <Small>Toplam varlık</Small>
          <Amount kurus={totalBalance(accounts)} role="amount" testID="total-balance" />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space[4], gap: space[3] }}>
        {accounts.map((a) => <AccountCard key={a.id} account={a} compact onPress={() => router.push(`/hesap/${a.id}`)} testID={`account-${a.id}`} />)}
      </ScrollView>
      <View style={{ paddingHorizontal: space[4] }}>
        <Row style={{ marginTop: space[5] }} gap={space[1]}>
          <ActionTile icon="send" label="Para gönder" onPress={() => router.push("/(tabs)/transfer")} testID="quick-send" />
          <ActionTile icon="arrowDown" label="Para iste" onPress={() => {}} />
          <ActionTile icon="qr" label="QR ile öde" onPress={() => {}} />
          <ActionTile icon="bolt" label="Fatura öde" onPress={() => {}} />
        </Row>

        <Section title="Bu ay" action={<Button title="Detay" variant="tertiary" size="sm" iconRight="right" onPress={() => router.push("/(tabs)/harcamalar")} />}>
          <Card>
            <Row style={{ justifyContent: "space-between" }}>
              <View><Small>Harcama</Small><Amount kurus={spent} role="h2" compact testID="month-spent" /></View>
              <View style={{ alignItems: "flex-end" }}><Small>Bütçe {formatTL(budget, { compact: true })}</Small><Txt role="bodyStrong" color={b.state === "iyi" ? c.success : b.state === "dikkat" ? c.warning : c.danger}>%{b.pct} kullanıldı</Txt></View>
            </Row>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: c.surface2, marginTop: space[3], overflow: "hidden" }}><View style={{ width: `${Math.min(100, b.pct)}%`, height: 8, backgroundColor: b.state === "iyi" ? c.success : b.state === "dikkat" ? c.warning : c.danger }} /></View>
          </Card>
        </Section>

        <Section title="Hedefler">
          <Row gap={space[3]}>
            {goals.map((g) => (
              <Card key={g.id} style={{ flex: 1, gap: space[2] }}>
                <Small numberOfLines={1}>{g.name}</Small>
                <Amount kurus={g.saved} role="h3" compact />
                <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surface2, overflow: "hidden" }}><View style={{ width: `${Math.round((g.saved / g.target) * 100)}%`, height: 6, backgroundColor: c.primary }} /></View>
                <Small>%{Math.round((g.saved / g.target) * 100)} · {formatTL(g.target, { compact: true })}</Small>
              </Card>
            ))}
          </Row>
        </Section>

        <Section title="Son işlemler" action={<Button title="Tümü" variant="tertiary" size="sm" iconRight="right" onPress={() => router.push("/hesap/vadesiz")} />}>
          {recent.map((g) => (
            <View key={g.day}>
              <Row style={{ justifyContent: "space-between", marginBottom: 4 }}><Small>{dayLabel(g.day, today)}</Small><Small>{formatTL(g.total, { sign: true, compact: true })}</Small></Row>
              <Card padded={false} style={{ paddingHorizontal: space[3] }}>{g.items.map((t) => <TxRow key={t.id} tx={t} onPress={() => router.push(`/islem/${t.id}`)} testID={`tx-${t.id}`} />)}</Card>
            </View>
          ))}
        </Section>
      </View>
    </Screen>
  );
}
