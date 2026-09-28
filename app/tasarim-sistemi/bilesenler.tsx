import { useState } from "react";
import { View } from "react-native";
import { ActionTile, Avatar, Badge, Banner, Button, Card, Chip, Divider, Header, Input, Keypad, ListItem, Progress, Row, Screen, Section, Segmented, Skeleton, Small, Spinner, Toggle, Txt } from "@/components/ui";
import { AccountCard, BankCard, Donut, TxRow } from "@/components/bank";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";

export default function Gallery() {
  const { c } = useTheme();
  const accounts = useStore((s) => s.accounts); const cards = useStore((s) => s.cards); const txs = useStore((s) => s.txs);
  const [tog, setTog] = useState(true); const [seg, setSeg] = useState("a"); const [chip, setChip] = useState("Tümü"); const [val, setVal] = useState(""); const [keys, setKeys] = useState("");
  return (
    <Screen testID="ds-components-page">
      <Header title="Bileşenler" subtitle="Canlı galeri · tema ve yazı ölçeğine tepki verir" back />
      <Section title="Düğmeler">
        <Card style={{ gap: space[2] }}>
          <Button title="Birincil" onPress={() => {}} icon="send" /><Button title="İkincil" variant="secondary" onPress={() => {}} /><Button title="Üçüncül" variant="tertiary" onPress={() => {}} /><Button title="Yıkıcı" variant="destructive" onPress={() => {}} icon="x" />
          <Row gap={space[2]}><Button title="Küçük" size="sm" onPress={() => {}} /><Button title="Devre dışı" disabled onPress={() => {}} /><Button title="Yükleniyor" loading onPress={() => {}} /></Row>
        </Card>
      </Section>
      <Section title="Seçim">
        <Card style={{ gap: space[3] }}>
          <Row gap={space[2]} style={{ flexWrap: "wrap" }}>{["Tümü", "Market", "Ulaşım"].map((l) => <Chip key={l} label={l} active={chip === l} onPress={() => setChip(l)} />)}</Row>
          <Segmented label="Örnek" value={seg} onChange={setSeg} options={[{ value: "a", label: "Kategoriler" }, { value: "b", label: "Aylık" }]} />
          <Row style={{ justifyContent: "space-between" }}><Txt>Anahtar</Txt><Toggle value={tog} onChange={setTog} label="Örnek anahtar" /></Row>
        </Card>
      </Section>
      <Section title="Girişler">
        <Card style={{ gap: space[3] }}>
          <Input label="Etiket" placeholder="Yer tutucu" value={val} onChangeText={setVal} help="Yardım metni" />
          <Input label="Hatalı" placeholder="TR.." value="TR12" error="IBAN doğrulanamadı, kontrol edin" />
          <Txt role="h2" color={c.text} align="center">{keys || "0"}</Txt>
          <Keypad onKey={(k) => setKeys((d) => (k === "⌫" ? d.slice(0, -1) : (d + k).slice(0, 8)))} />
        </Card>
      </Section>
      <Section title="Geri bildirim">
        <View style={{ gap: space[2] }}>
          <Banner tone="info" title="Bilgi" text="Bilgilendirme mesajı." /><Banner tone="success" title="Başarılı" text="İşlem tamamlandı." /><Banner tone="warning" title="Dikkat" text="EFT ücreti uygulanır." /><Banner tone="danger" title="Hata" text="Yetersiz bakiye." />
          <Card><Row gap={space[2]} style={{ flexWrap: "wrap" }}><Badge label="Birincil" /><Badge label="Başarı" tone="success" /><Badge label="Hata" tone="danger" /><Badge label="Uyarı" tone="warning" /><Badge label="Bilgi" tone="info" /><Badge label="Nötr" tone="neutral" /></Row></Card>
          <Card style={{ gap: space[3] }}><Progress value={65} max={100} label="Örnek" /><Row gap={space[3]}><Spinner /><Skeleton width={120} /><Skeleton width={60} /></Row></Card>
        </View>
      </Section>
      <Section title="Liste ve avatar">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          <ListItem title="Başlık" subtitle="Alt başlık" left={<Avatar name="Ayşe Yılmaz" />} chevron onPress={() => {}} /><Divider />
          <ListItem title="Simgeli" subtitle="Kategori avatarı" left={<Avatar name="Market" icon="cart" color="#10b981" />} right={<Badge label="Yeni" />} /><Divider />
          <TxRow tx={txs[0]} />
        </Card>
      </Section>
      <Section title="Hızlı işlem">
        <Card><Row gap={space[1]}><ActionTile icon="send" label="Gönder" onPress={() => {}} /><ActionTile icon="arrowDown" label="İste" onPress={() => {}} /><ActionTile icon="qr" label="QR" onPress={() => {}} /><ActionTile icon="bolt" label="Fatura" onPress={() => {}} /></Row></Card>
      </Section>
      <Section title="Alan bileşenleri"><View style={{ gap: space[3] }}><AccountCard account={accounts[0]} /><BankCard card={cards[0]} /><Card style={{ alignItems: "center" }}><Donut data={[{ value: 40, color: c.primary }, { value: 30, color: c.success }, { value: 20, color: c.warning }, { value: 10, color: c.info }]} size={140}><Small>Halka</Small></Donut></Card></View></Section>
      <Section title="Simgeler">
        <Card><Row gap={space[3]} style={{ flexWrap: "wrap" }}>{(["home", "card", "send", "chart", "menu", "wallet", "target", "trending", "snow", "wifi", "globe", "shield", "sun", "moon", "type", "bell", "lock", "finger", "qr", "copy", "cart", "food", "bus", "bolt", "film", "heart", "shirt", "briefcase", "star", "search", "eye", "eyeOff", "check", "x", "info", "swap", "refresh", "logout", "palette", "grid"] as const).map((n) => <View key={n} style={{ width: 40, alignItems: "center" }}><Icon name={n} color={c.text2} /></View>)}</Row></Card>
      </Section>
    </Screen>
  );
}
