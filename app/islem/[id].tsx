import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Amount, CATEGORY_ICON } from "@/components/bank";
import { Avatar, Badge, Button, Card, Divider, Header, Row, Screen, Small, Txt } from "@/components/ui";
import { useStore } from "@/store";
import { CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/bank";
import { space, useTheme } from "@/theme";
import { formatIban, maskCard } from "@/lib/money";

export default function TxDetail() {
  const { c } = useTheme(); const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tx = useStore((s) => s.txs.find((t) => t.id === id)); const account = useStore((s) => s.accounts.find((a) => a.id === tx?.accountId)); const card = useStore((s) => s.cards.find((x) => x.id === tx?.cardId));
  const contact = useStore((s) => s.contacts.find((x) => x.iban === tx?.counterparty));
  if (!tx) return <Screen><Header title="İşlem bulunamadı" back /></Screen>;
  const Line = ({ k, v }: { k: string; v: string }) => <Row style={{ justifyContent: "space-between", paddingVertical: space[2] }}><Small>{k}</Small><Txt role="bodyStrong" color={c.text} style={{ flexShrink: 1, textAlign: "right" }}>{v}</Txt></Row>;
  const date = new Date(tx.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <Screen testID="tx-detail">
      <Header title="İşlem detayı" back />
      <View style={{ alignItems: "center", gap: space[3], paddingVertical: space[4] }}>
        <Avatar name={tx.title} icon={CATEGORY_ICON[tx.category]} color={CATEGORY_COLOR[tx.category]} size={64} />
        <Txt role="h2" color={c.text} align="center">{tx.title}</Txt>
        <Amount kurus={tx.amount} role="amount" sign color={tx.amount > 0 ? c.success : c.text} testID="tx-amount" />
        <Badge label={tx.status === "tamam" ? "Tamamlandı" : "Bekliyor"} tone={tx.status === "tamam" ? "success" : "warning"} />
      </View>
      <Card padded={false} style={{ paddingHorizontal: space[4] }}>
        <Line k="Tarih" v={date} /><Divider />
        <Line k="Kategori" v={CATEGORY_LABEL[tx.category]} /><Divider />
        <Line k="Hesap" v={account?.name ?? "—"} />
        {card && <><Divider /><Line k="Kart" v={`${card.kind === "kredi" ? "Kredi" : "Banka"} ${maskCard(card.pan)}`} /></>}
        {tx.counterparty && <><Divider /><Line k="Alıcı IBAN" v={formatIban(tx.counterparty)} /></>}
        {contact && <><Divider /><Line k="Banka" v={contact.bank} /></>}
        {tx.note && <><Divider /><Line k="Açıklama" v={tx.note} /></>}
        <Divider /><Line k="İşlem no" v={tx.id.toUpperCase()} />
      </Card>
      <View style={{ marginTop: space[4], gap: space[2] }}>
        {tx.category === "transfer" && tx.amount < 0 && contact && <Button title="Tekrar gönder" icon="send" onPress={() => router.push({ pathname: "/transfer/tutar", params: { iban: contact.iban, name: contact.name } })} testID="resend" />}
        <Button title="Dekont indir" variant="secondary" icon="copy" onPress={() => {}} />
        <Button title="Sorun bildir" variant="tertiary" onPress={() => {}} />
      </View>
    </Screen>
  );
}
