import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, H1, Screen, Small, Txt } from "@/components/ui";
import { Amount } from "@/components/bank";
import { Icon } from "@/components/Icon";
import { motion, space, useTheme } from "@/theme";

export default function Success() {
  const { c } = useTheme(); const router = useRouter();
  const { name, kurus, channel, txId } = useLocalSearchParams<{ name: string; kurus: string; channel: string; txId: string }>();
  const s = useRef(new Animated.Value(0.4)).current;
  useEffect(() => { Animated.spring(s, { toValue: 1, useNativeDriver: false, ...motion.spring }).start(); }, [s]);
  return (
    <Screen scroll={false} testID="success">
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: space[4] }}>
        <Animated.View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: c.successSoft, alignItems: "center", justifyContent: "center", transform: [{ scale: s }] }}><Icon name="check" size={48} color={c.onSuccessSoft} stroke={3} /></Animated.View>
        <H1 align="center">Gönderildi</H1>
        <Amount kurus={Number(kurus)} role="amount" testID="success-amount" />
        <Txt align="center" color={c.text2}>{name} hesabına {channel} ile aktarıldı.</Txt>
        <Small>İşlem no · {txId.toUpperCase()}</Small>
      </View>
      <View style={{ gap: space[2] }}>
        <Button title="Dekontu paylaş" variant="secondary" icon="copy" onPress={() => {}} />
        <Button title="Ana sayfaya dön" size="lg" onPress={() => router.replace("/(tabs)")} testID="success-home" />
      </View>
    </Screen>
  );
}
