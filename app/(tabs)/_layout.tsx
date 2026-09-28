import { Redirect, Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Icon, type IconName } from "@/components/Icon";
import { useStore } from "@/store";
import { useTheme } from "@/theme";

const tab = (title: string, icon: IconName) => ({ title, tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={String(color)} stroke={2.2} /> });

export default function TabsLayout() {
  const unlocked = useStore((s) => s.unlocked); const { c } = useTheme();
  if (!unlocked) return <Redirect href="/giris" />;
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, tabBarActiveTintColor: c.primary, tabBarInactiveTintColor: c.textMuted, tabBarStyle: { backgroundColor: c.bgElevated, borderTopColor: c.border, height: 64, paddingTop: 6 }, tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600", marginBottom: 6 }, tabBarItemStyle: { paddingHorizontal: 0 }, tabBarAllowFontScaling: false }}>
      <Tabs.Screen name="index" options={tab("Ana sayfa", "home")} />
      <Tabs.Screen name="kartlar" options={tab("Kartlar", "card")} />
      <Tabs.Screen name="transfer" options={tab("Transfer", "send")} />
      <Tabs.Screen name="harcamalar" options={tab("Harcama", "chart")} />
      <Tabs.Screen name="daha" options={tab("Daha", "menu")} />
    </Tabs>
  );
}
