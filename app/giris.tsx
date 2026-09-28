import { useState } from "react";
import { Platform, Pressable, Text as RNText, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button, H1, Keypad, Small, Txt } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { useStore } from "@/store";
import { DEMO_USER } from "@/data/demo";
import { radius, space, useTheme } from "@/theme";

/** Demo: 4 haneli herhangi bir PIN ya da biyometri düğmesi kilidi açar. */
export default function Login() {
  const { c } = useTheme(); const router = useRouter();
  const unlock = useStore((s) => s.unlock); const haptics = useStore((s) => s.settings.haptics);
  const [pin, setPin] = useState(""); const [error, setError] = useState("");
  const go = () => { unlock(); router.replace("/(tabs)"); };
  const key = (k: string) => {
    if (haptics && Platform.OS !== "web") Haptics.selectionAsync();
    if (k === "⌫") return setPin((p) => p.slice(0, -1));
    if (k === "00") return;
    const next = (pin + k).slice(0, 4); setPin(next); setError("");
    if (next.length === 4) { if (next === "0000") { setError("PIN hatalı. 2 deneme hakkınız kaldı."); setPin(""); } else setTimeout(go, 150); }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, paddingHorizontal: space[6], justifyContent: "space-between", paddingVertical: space[6] }}>
        <View style={{ alignItems: "center", gap: space[4], marginTop: space[8] }}>
          <View style={{ width: 64, height: 64, borderRadius: radius.lg, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}><RNText style={{ color: c.textOnPrimary, fontWeight: "900", fontSize: 30 }}>b</RNText></View>
          <H1 align="center">Merhaba, {DEMO_USER.short}</H1>
          <Txt align="center">Devam etmek için PIN girin</Txt>
          <View accessibilityLabel={`PIN, ${pin.length} hane girildi`} style={{ flexDirection: "row", gap: space[3], marginTop: space[2] }}>
            {[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < pin.length ? c.primary : c.surface2, borderWidth: 1, borderColor: error ? c.danger : c.borderStrong }} />)}
          </View>
          {error ? <Small color={c.danger} accessibilityLabel={error} testID="pin-error">{error}</Small> : <Small>Demo: 4 haneli herhangi bir PIN</Small>}
        </View>
        <View style={{ gap: space[4] }}>
          <Keypad onKey={key} testID="pin-pad" pin />
          <Pressable accessibilityRole="button" accessibilityLabel="Face ID ile giriş" onPress={go} testID="biometric" style={({ pressed }) => [{ flexDirection: "row", alignSelf: "center", alignItems: "center", gap: space[2], padding: space[3], opacity: pressed ? 0.7 : 1 }]}>
            <Icon name="finger" color={c.primary} /><Txt role="bodyStrong" color={c.primary}>Face ID ile giriş</Txt>
          </Pressable>
          <Button title="Şifremi unuttum" variant="tertiary" onPress={() => {}} />
        </View>
      </View>
    </SafeAreaView>
  );
}
