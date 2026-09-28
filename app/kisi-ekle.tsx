import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Banner, Button, Header, Input, Screen, Small } from "@/components/ui";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";
import { formatIban, isValidIban, normalizeIban } from "@/lib/money";
import { BANK_CODE } from "@/data/demo";

const BANKS: Record<string, string> = { "00010": "Ziraat", "00012": "Halkbank", "00015": "VakıfBank", "00046": "Akbank", "00062": "Garanti BBVA", "00064": "İş Bankası", "00067": "Yapı Kredi", "00111": "QNB", "00134": "DenizBank", [BANK_CODE]: "Bankam" };

export default function AddContact() {
  const { c } = useTheme(); const router = useRouter(); const add = useStore((s) => s.addContact);
  const [name, setName] = useState(""); const [iban, setIban] = useState(""); const [touched, setTouched] = useState(false);
  const norm = normalizeIban(iban); const valid = isValidIban(norm); const bank = BANKS[norm.slice(4, 9)] ?? (valid ? "Diğer banka" : "");
  const ibanErr = touched && norm.length > 0 && !valid ? (norm.length < 26 ? `IBAN 26 karakter olmalı (${norm.length}/26)` : "IBAN doğrulanamadı, kontrol edin") : "";
  const save = () => { const cnt = add({ name: name.trim(), iban: norm, bank }); router.replace({ pathname: "/transfer/tutar", params: { iban: cnt.iban, name: cnt.name } }); };
  return (
    <Screen testID="add-contact">
      <Header title="Yeni alıcı" subtitle="IBAN ile" onClose={() => router.back()} />
      <View style={{ gap: space[4] }}>
        <Input label="Ad soyad" placeholder="Alıcının adı" value={name} onChangeText={setName} autoCapitalize="words" testID="contact-name" />
        <Input label="IBAN" placeholder="TR00 0000 0000 0000 0000 0000 00" value={iban} onChangeText={(v) => setIban(formatIban(v).slice(0, 32))} onBlur={() => setTouched(true)} autoCapitalize="characters" error={ibanErr} help={valid ? `✓ Geçerli · ${bank}` : "Mod-97 ile anında doğrulanır"} testID="contact-iban" />
        {valid && name.trim().length > 2 && <Banner tone="success" title="Hazır" text={`${name.trim()} · ${bank}`} testID="contact-ready" />}
        <Small>Alıcı adı bankadan doğrulanır; uyuşmazlıkta işlem onay ekranında uyarı görürsünüz.</Small>
        <Button title="Kaydet ve devam et" size="lg" iconRight="arrow" disabled={!valid || name.trim().length < 3} onPress={save} testID="contact-save" />
      </View>
    </Screen>
  );
}
