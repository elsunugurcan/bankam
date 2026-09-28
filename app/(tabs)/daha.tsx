import { View } from "react-native";
import { useRouter } from "expo-router";
import { Avatar, Button, Card, Divider, Header, ListItem, Row, Screen, Section, Segmented, Small, Toggle, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { DEMO_USER } from "@/data/demo";
import { space, useTheme } from "@/theme";

export default function More() {
  const { c } = useTheme(); const router = useRouter();
  const settings = useStore((s) => s.settings); const set = useStore((s) => s.setSetting); const lock = useStore((s) => s.lock); const reset = useStore((s) => s.reset);
  return (
    <Screen testID="more">
      <Header title="Daha" />
      <Card><Row gap={space[3]}><Avatar name={DEMO_USER.name} size={52} /><View style={{ flex: 1 }}><Txt role="h3" color={c.text}>{DEMO_USER.name}</Txt><Small>Müşteri no {DEMO_USER.customerNo} · {DEMO_USER.phone}</Small></View><Icon name="right" color={c.textMuted} /></Row></Card>

      <Section title="Görünüm">
        <Card style={{ gap: space[4] }}>
          <View style={{ gap: space[2] }}><Txt role="bodyStrong" color={c.text}>Tema</Txt><Segmented label="Tema" value={settings.theme} onChange={(v) => set("theme", v)} options={[{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, { value: "system", label: "Sistem" }]} /></View>
          <View style={{ gap: space[2] }}><Txt role="bodyStrong" color={c.text}>Yazı boyutu</Txt><Segmented label="Yazı boyutu" value={settings.fontScale} onChange={(v) => set("fontScale", v)} options={[{ value: "normal", label: "Normal" }, { value: "large", label: "Büyük" }, { value: "xlarge", label: "Çok büyük" }]} /><Small>Tüm ekranlar seçilen ölçeğe göre yeniden düzenlenir (WCAG 1.4.4).</Small></View>
        </Card>
      </Section>

      <Section title="Güvenlik ve gizlilik">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          <ListItem title="Bakiyeleri gizle" subtitle="Ana sayfada tutarları maskele" left={<Icon name="eyeOff" color={c.textMuted} />} right={<Toggle value={settings.hideBalances} onChange={(v) => set("hideBalances", v)} label="Bakiyeleri gizle" testID="setting-hide" />} />
          <Divider />
          <ListItem title="Face ID / parmak izi" subtitle="Girişte biyometri kullan" left={<Icon name="finger" color={c.textMuted} />} right={<Toggle value={settings.biometrics} onChange={(v) => set("biometrics", v)} label="Biyometri" />} />
          <Divider />
          <ListItem title="Titreşim geri bildirimi" left={<Icon name="phone" color={c.textMuted} />} right={<Toggle value={settings.haptics} onChange={(v) => set("haptics", v)} label="Titreşim" />} />
          <Divider />
          <ListItem title="Bildirimler" subtitle="Harcama ve giriş uyarıları" left={<Icon name="bell" color={c.textMuted} />} right={<Toggle value={settings.notifications} onChange={(v) => set("notifications", v)} label="Bildirimler" />} />
        </Card>
      </Section>

      <Section title="Tasarım sistemi">
        <Card padded={false} style={{ paddingHorizontal: space[4] }}>
          <ListItem title="Belirteçler" subtitle="Renkler, kontrast oranları, tipografi, boşluk" left={<Icon name="palette" color={c.textMuted} />} chevron onPress={() => router.push("/tasarim-sistemi")} testID="ds-tokens" />
          <Divider />
          <ListItem title="Bileşenler" subtitle="Canlı bileşen galerisi" left={<Icon name="grid" color={c.textMuted} />} chevron onPress={() => router.push("/tasarim-sistemi/bilesenler")} testID="ds-components" />
        </Card>
      </Section>

      <View style={{ marginTop: space[6], gap: space[2] }}>
        <Button title="Oturumu kilitle" variant="secondary" icon="lock" onPress={() => { lock(); router.replace("/giris"); }} testID="lock" />
        <Button title="Demo verilerini sıfırla" variant="tertiary" icon="refresh" onPress={reset} />
        <Small align="center" style={{ marginTop: space[2] }}>Bankam 1.0 · kurgusal banka, gerçek para hareketi yoktur</Small>
      </View>
    </Screen>
  );
}
