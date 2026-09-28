import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { ThemeProvider, useTheme } from "@/theme";

function Root() {
  const { c, name } = useTheme();
  return (
    <>
      <StatusBar style={name === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg }, animation: "slide_from_right" }}>
        <Stack.Screen name="giris" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="transfer/basarili" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="kisi-ekle" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    if (Platform.OS === "web") { document.documentElement.lang = "tr"; (globalThis as unknown as { Bankam: typeof useStore }).Bankam = useStore; } // dil: CSS büyük harf dönüşümü (İ) · store: uçtan uca testler
    return unsub;
  }, []);
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {hydrated ? <Root /> : <View style={{ flex: 1, backgroundColor: "#0a0d1a", alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#818cf8" /></View>}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
