import { useMemo, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AccountCard, TxRow } from "@/components/bank";
import { Button, Card, Chip, Empty, Header, IconButton, Input, Row, Screen, Section, Small, Toast } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { CATEGORY_LABEL, dayLabel, groupByDay, todayIso, type Category } from "@/lib/bank";
import { space, useTheme } from "@/theme";
import { formatIban, formatTL } from "@/lib/money";

export default function AccountDetail() {
  const { c } = useTheme(); const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const account = useStore((s) => s.accounts.find((a) => a.id === id)); const txs = useStore((s) => s.txs);
  const [q, setQ] = useState(""); const [cat, setCat] = useState<Category | "">(""); const [toast, setToast] = useState("");
  const list = useMemo(() => { const f = q.trim().toLocaleLowerCase("tr-TR"); return txs.filter((t) => t.accountId === id && (!cat || t.category === cat) && (!f || t.title.toLocaleLowerCase("tr-TR").includes(f))); }, [txs, id, q, cat]);
  const cats = useMemo(() => [...new Set(txs.filter((t) => t.accountId === id).map((t) => t.category))], [txs, id]);
  if (!account) return <Screen><Header title="Hesap bulunamadı" back /></Screen>;
  const groups = groupByDay(list); const today = todayIso();
  return (
    <Screen testID="account-detail">
      <Header title={account.name} subtitle={account.kind === "vadesiz" ? "Vadesiz" : account.kind === "birikim" ? "Birikim" : "Yatırım"} back right={<IconButton name="copy" label="IBAN kopyala" onPress={() => { setToast("IBAN kopyalandı"); setTimeout(() => setToast(""), 1500); }} testID="copy-iban" />} />
      <AccountCard account={account} />
      <Card style={{ marginTop: space[3] }}><Row style={{ justifyContent: "space-between" }}><View><Small>IBAN</Small><Small color={c.text} style={{ fontVariant: ["tabular-nums"] }} testID="iban-full">{formatIban(account.iban)}</Small></View><Icon name="qr" color={c.textMuted} /></Row></Card>
      <Row gap={space[2]} style={{ marginTop: space[3] }}>
        <Button title="Para gönder" icon="send" onPress={() => router.push("/(tabs)/transfer")} style={{ flex: 1 }} />
        <Button title="Hesap özeti" variant="secondary" icon="copy" onPress={() => {}} style={{ flex: 1 }} />
      </Row>
      <Section title="İşlemler">
        <Input placeholder="İşlem ara" value={q} onChangeText={setQ} right={<Icon name="search" size={18} color={c.textMuted} />} testID="tx-search" />
        <Row gap={space[2]} style={{ flexWrap: "wrap" }}>
          <Chip label="Tümü" active={!cat} onPress={() => setCat("")} />
          {cats.map((k) => <Chip key={k} label={CATEGORY_LABEL[k]} active={cat === k} onPress={() => setCat(k)} testID={`filter-${k}`} />)}
        </Row>
        {groups.length === 0 && <Empty icon="search" title="İşlem yok" text="Aramanı ya da filtreyi değiştirmeyi dene." />}
        {groups.map((g) => (
          <View key={g.day} style={{ gap: 4 }}>
            <Row style={{ justifyContent: "space-between" }}><Small>{dayLabel(g.day, today)}</Small><Small>{formatTL(g.total, { sign: true, compact: true })}</Small></Row>
            <Card padded={false} style={{ paddingHorizontal: space[3] }}>{g.items.map((t) => <TxRow key={t.id} tx={t} onPress={() => router.push(`/islem/${t.id}`)} testID={`tx-${t.id}`} />)}</Card>
          </View>
        ))}
      </Section>
      <Toast text={toast} visible={!!toast} />
    </Screen>
  );
}
