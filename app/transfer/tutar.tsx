import { useState } from "react";
import { Platform, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Avatar, Button, Chip, Header, Keypad, Row, Screen, Small, Txt } from "@/components/ui";
import { Amount } from "@/components/bank";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";
import { formatTL } from "@/lib/money";

const QUICK = [10_000, 25_000, 50_000, 100_000, 250_000];

/** Adım 2/3 — tutar. Hızlı tutara dokununca doğrudan onaya geçer (2. dokunuş). */
export default function AmountStep() {
  const { c } = useTheme(); const router = useRouter();
  const { iban, name } = useLocalSearchParams<{ iban: string; name: string }>();
  const from = useStore((s) => s.accounts.find((a) => a.id === "vadesiz")!); const quote = useStore((s) => s.quote); const haptics = useStore((s) => s.settings.haptics);
  const [digits, setDigits] = useState("");
  const kurus = Number(digits || "0");
  const q = kurus > 0 ? quote("vadesiz", { iban, name }, kurus) : null;
  const err = q && !q.ok ? q.reason : "";
  const next = (k: number) => router.push({ pathname: "/transfer/onay", params: { iban, name, kurus: String(k) } });
  const key = (k: string) => { if (haptics && Platform.OS !== "web") Haptics.selectionAsync(); setDigits((d) => (k === "⌫" ? d.slice(0, -1) : (d + k).replace(/^0+(?=\d)/, "").slice(0, 9))); };
  return (
    <Screen scroll={false} testID="amount-step">
      <Header title="Tutar" subtitle="Adım 2 / 3" back />
      <Row gap={space[3]} style={{ marginBottom: space[4] }}><Avatar name={name} size={40} /><View><Small>Alıcı</Small><Txt role="bodyStrong" color={c.text}>{name}</Txt></View></Row>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: space[2], paddingVertical: space[4] }}>
          <Amount kurus={kurus} role="amount" color={err ? c.danger : c.text} testID="amount-display" />
          {err ? <Small color={c.danger} testID="amount-error">{err}</Small> : q?.ok ? <Small color={c.success} testID="amount-quote">{q.channel}{q.fee ? ` · ücret ${formatTL(q.fee)}` : " · ücretsiz"}</Small> : <Small>Kullanılabilir {formatTL(from.balance)}</Small>}
          <Row gap={space[2]} style={{ marginTop: space[3], flexWrap: "wrap", justifyContent: "center" }}>
            {QUICK.map((v) => <Chip key={v} label={formatTL(v, { compact: true })} onPress={() => next(v)} testID={`quick-${v}`} />)}
          </Row>
        </View>
        <View style={{ gap: space[3] }}>
          <Keypad onKey={key} />
          <Button title="Devam" size="lg" iconRight="arrow" disabled={!q?.ok} onPress={() => next(kurus)} testID="amount-next" />
        </View>
      </View>
    </Screen>
  );
}
