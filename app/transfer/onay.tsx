import { useState } from "react";
import { Platform, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Banner, Button, Card, Divider, Header, Input, Row, Screen, Small, Txt } from "@/components/ui";
import { Amount } from "@/components/bank";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";
import { formatIban, formatTL } from "@/lib/money";

/** Adım 3/3 — özet ve onay (3. dokunuş). */
export default function Confirm() {
  const { c } = useTheme(); const router = useRouter();
  const { iban, name, kurus } = useLocalSearchParams<{ iban: string; name: string; kurus: string }>();
  const amount = Number(kurus);
  const from = useStore((s) => s.accounts.find((a) => a.id === "vadesiz")!); const quote = useStore((s) => s.quote); const transfer = useStore((s) => s.transfer); const haptics = useStore((s) => s.settings.haptics);
  const [note, setNote] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const q = quote("vadesiz", { iban, name }, amount);
  const confirm = () => {
    setBusy(true);
    setTimeout(() => {
      const r = transfer("vadesiz", { iban, name }, amount, note.trim() || undefined);
      setBusy(false);
      if (!r.ok) { setErr(r.reason); return; }
      if (haptics && Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/transfer/basarili", params: { name, kurus: String(amount), channel: r.channel, txId: r.txId ?? "" } });
    }, 500);
  };
  const Line = ({ k, v }: { k: string; v: string }) => <Row style={{ justifyContent: "space-between", paddingVertical: space[2] }}><Small>{k}</Small><Txt role="bodyStrong" color={c.text} style={{ flexShrink: 1, textAlign: "right" }}>{v}</Txt></Row>;
  return (
    <Screen testID="confirm-step">
      <Header title="Onayla" subtitle="Adım 3 / 3" back />
      <View style={{ alignItems: "center", gap: 4, paddingVertical: space[4] }}><Small>Gönderilecek tutar</Small><Amount kurus={amount} role="amount" testID="confirm-amount" /></View>
      <Card padded={false} style={{ paddingHorizontal: space[4] }}>
        <Line k="Alıcı" v={name} /><Divider />
        <Line k="IBAN" v={formatIban(iban)} /><Divider />
        <Line k="Gönderen" v={`${from.name} · ${formatTL(from.balance)}`} /><Divider />
        {q.ok && <><Line k="Kanal" v={q.channel} /><Divider /><Line k="Ücret" v={q.fee ? formatTL(q.fee) : "Ücretsiz"} /><Divider /><Line k="Toplam" v={formatTL(q.total)} /></>}
      </Card>
      {q.ok && q.warnings.map((w) => <View key={w} style={{ marginTop: space[3] }}><Banner tone="warning" text={w} /></View>)}
      {(!q.ok || err) && <View style={{ marginTop: space[3] }}><Banner tone="danger" text={err || (!q.ok ? q.reason : "")} testID="confirm-error" /></View>}
      <View style={{ marginTop: space[4] }}><Input label="Açıklama (isteğe bağlı)" placeholder="Örn. Kira" value={note} onChangeText={setNote} maxLength={40} testID="note" /></View>
      <View style={{ marginTop: space[6], gap: space[2] }}>
        <Button title={`${formatTL(amount, { compact: true })} gönder`} size="lg" icon="send" onPress={confirm} loading={busy} disabled={!q.ok} testID="confirm-send" />
        <Button title="Vazgeç" variant="tertiary" onPress={() => router.replace("/(tabs)/transfer")} />
      </View>
    </Screen>
  );
}
