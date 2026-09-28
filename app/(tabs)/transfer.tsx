import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Card, Divider, Header, IconButton, Input, ListItem, Row, Screen, Section, Small } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { space, useTheme } from "@/theme";
import { maskIban } from "@/lib/money";

/** Adım 1/3 — alıcı seç. Bir dokunuşla tutar ekranına geçer. */
export default function Transfer() {
  const { c } = useTheme(); const router = useRouter();
  const contacts = useStore((s) => s.contacts); const accounts = useStore((s) => s.accounts); const toggleFav = useStore((s) => s.toggleFavorite);
  const [q, setQ] = useState("");
  const list = useMemo(() => { const f = q.trim().toLocaleLowerCase("tr-TR"); return contacts.filter((x) => !f || x.name.toLocaleLowerCase("tr-TR").includes(f) || x.bank.toLocaleLowerCase("tr-TR").includes(f)).sort((a, b) => (b.lastSent ?? "").localeCompare(a.lastSent ?? "")); }, [contacts, q]);
  const favs = list.filter((x) => x.favorite);
  const go = (iban: string, name: string) => router.push({ pathname: "/transfer/tutar", params: { iban, name } });
  return (
    <Screen testID="transfer">
      <Header title="Para gönder" subtitle="Adım 1 / 3 · Alıcı" right={<IconButton name="plus" label="Yeni alıcı ekle" onPress={() => router.push("/kisi-ekle")} tone="primarySoft" testID="add-contact" />} />
      <Input placeholder="İsim, banka veya IBAN ara" value={q} onChangeText={setQ} right={<Icon name="search" color={c.textMuted} size={18} />} testID="contact-search" />

      {!q && (
        <Section title="Hesaplarım arası">
          <Card padded={false} style={{ paddingHorizontal: space[4] }}>
            {accounts.filter((a) => a.id !== "vadesiz").map((a, i) => (
              <View key={a.id}>{i > 0 && <Divider />}<ListItem title={a.name} subtitle={maskIban(a.iban)} left={<Avatar name={a.name} icon="swap" color={a.color} size={42} />} chevron onPress={() => go(a.iban, a.name)} testID={`own-${a.id}`} /></View>
            ))}
          </Card>
        </Section>
      )}
      {favs.length > 0 && !q && (
        <Section title="Favoriler">
          <Row gap={space[3]}>
            {favs.slice(0, 4).map((x) => (
              <ListItem key={x.id} title="" onPress={() => go(x.iban, x.name)} accessibilityLabel={`${x.name}, favori`} testID={`fav-${x.id}`} left={<View style={{ alignItems: "center", gap: 6, width: 72 }}><Avatar name={x.name} size={56} /><Small numberOfLines={1} color={c.text2}>{x.name.split(" ")[0]}</Small></View>} />
            ))}
          </Row>
        </Section>
      )}
      <Section title={q ? "Sonuçlar" : "Son gönderilenler"}>
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          {list.length === 0 && <Small style={{ paddingVertical: space[4] }}>Sonuç yok. Yeni alıcı ekleyebilirsin.</Small>}
          {list.map((x, i) => (
            <View key={x.id}>{i > 0 && <Divider />}
              <ListItem title={x.name} subtitle={`${x.bank} · ${maskIban(x.iban)}`} left={<Avatar name={x.name} size={42} />} onPress={() => go(x.iban, x.name)} testID={`contact-${x.id}`}
                right={<IconButton name="star" label={x.favorite ? `${x.name} favorilerden çıkar` : `${x.name} favorilere ekle`} tone="transparent" color={x.favorite ? c.warning : c.border} onPress={() => toggleFav(x.id)} size={40} />} chevron />
            </View>
          ))}
        </Card>
      </Section>
    </Screen>
  );
}
