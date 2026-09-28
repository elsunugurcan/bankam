import { Redirect } from "expo-router";
import { useStore } from "@/store";
export default function Index() { const unlocked = useStore((s) => s.unlocked); return <Redirect href={unlocked ? "/(tabs)" : "/giris"} />; }
