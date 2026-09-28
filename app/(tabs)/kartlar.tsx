import { useState } from "react";
import { View } from "react-native";
import { BankCard, Amount } from "@/components/bank";
import { Banner, Button, Card, Chip, Divider, Header, ListItem, Progress, Row, Screen, Section, Sheet, Small, Toggle, Txt, Toast } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";
import { formatTL, maskCard } from "@/lib/money";

const LIMITS = [250_000, 500_000, 1_000_000, 2_000_000, 4_000_000];

export default function Cards() {
  const { c } = useTheme();
  const cards = useStore((s) => s.cards); const toggle = useStore((s) => s.toggleCard); const setLimit = useStore((s) => s.setCardLimit);
  const [sel, setSel] = useState(cards[0].id); const [limitOpen, setLimitOpen] = useState(false); const [toast, setToast] = useState("");
  const card = cards.find((x) => x.id === sel)!;
  const say = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1600); };
  return (
    <Screen testID="cards">
      <Header title="Kartlarım" subtitle={`${cards.length} kart`} />
      <Row gap={space[2]} style={{ marginBottom: space[4] }}>{cards.map((x) => <Chip key={x.id} label={`${x.kind === "kredi" ? "Kredi" : "Banka"} ${maskCard(x.pan).slice(-4)}`} active={x.id === sel} onPress={() => setSel(x.id)} testID={`card-chip-${x.id}`} />)}</Row>
      <BankCard card={card} testID="bank-card" />
      {card.frozen && <View style={{ marginTop: space[3] }}><Banner tone="info" icon="snow" title="Kart donduruldu" text="Tüm harcamalar geçici olarak engellendi. İstediğiniz zaman tekrar açabilirsiniz." testID="frozen-banner" /></View>}

      <Section title="Bu ay">
        <Card style={{ gap: space[3] }}>
          <Row style={{ justifyContent: "space-between" }}><View><Small>{card.kind === "kredi" ? "Dönem harcaması" : "Harcama"}</Small><Amount kurus={card.spentThisMonth} role="h2" compact /></View><View style={{ alignItems: "flex-end" }}><Small>Limit</Small><Txt role="bodyStrong" color={c.text} testID="card-limit">{formatTL(card.limit, { compact: true })}</Txt></View></Row>
          <Progress value={card.spentThisMonth} max={card.limit} label="Limit kullanımı" color={card.spentThisMonth / card.limit > 0.8 ? c.warning : c.primary} />
          {card.kind === "kredi" && <Row style={{ justifyContent: "space-between" }}><Small>Son ödeme: 26 Eylül</Small><Small>Asgari {formatTL(Math.round(card.spentThisMonth * 0.2), { compact: true })}</Small></Row>}
        </Card>
      </Section>

      <Section title="Kart ayarları">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          <ListItem title="Kartı dondur" subtitle="Kaybettiysen anında kapat" left={<Icon name="snow" color={c.textMuted} />} right={<Toggle value={card.frozen} onChange={() => { toggle(card.id, "frozen"); say(card.frozen ? "Kart tekrar aktif" : "Kart donduruldu"); }} label="Kartı dondur" testID="toggle-freeze" />} />
          <Divider />
          <ListItem title="İnternet alışverişi" subtitle="Çevrimiçi ödemeleri aç/kapat" left={<Icon name="globe" color={c.textMuted} />} right={<Toggle value={card.onlineEnabled} onChange={() => toggle(card.id, "onlineEnabled")} label="İnternet alışverişi" testID="toggle-online" />} />
          <Divider />
          <ListItem title="Temassız ödeme" subtitle="₺1.500'e kadar şifresiz" left={<Icon name="wifi" color={c.textMuted} />} right={<Toggle value={card.contactless} onChange={() => toggle(card.id, "contactless")} label="Temassız ödeme" testID="toggle-contactless" />} />
          <Divider />
          <ListItem title="Harcama limiti" subtitle={formatTL(card.limit, { compact: true }) + " / ay"} left={<Icon name="target" color={c.textMuted} />} chevron onPress={() => setLimitOpen(true)} testID="open-limit" />
        </Card>
      </Section>
      <View style={{ marginTop: space[4], gap: space[2] }}>
        <Button title="Kart bilgilerini göster" variant="secondary" icon="eye" onPress={() => say("Kart bilgileri 30 sn görünür")} />
        <Button title="Yeni kart talep et" variant="tertiary" icon="plus" onPress={() => {}} />
      </View>

      <Sheet open={limitOpen} onClose={() => setLimitOpen(false)} title="Aylık harcama limiti" testID="limit-sheet">
        <Small>Limit değişikliği anında geçerli olur. Yükseltme için ek doğrulama istenebilir.</Small>
        <View style={{ gap: space[2], marginTop: space[2] }}>
          {LIMITS.map((l) => <Chip key={l} label={formatTL(l, { compact: true })} active={l === card.limit} onPress={() => { setLimit(card.id, l); setLimitOpen(false); say("Limit güncellendi"); }} testID={`limit-${l}`} />)}
        </View>
      </Sheet>
      <Toast text={toast} visible={!!toast} />
    </Screen>
  );
}
