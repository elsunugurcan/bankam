import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { fontScales, themes, type FontScale, type Theme, type ThemeName, type TypeRole, type } from "./tokens";
import { useStore } from "@/store";

export * from "./tokens";

export type ThemeCtx = { name: ThemeName; c: Theme; scale: number; scaleName: FontScale; font: (role: TypeRole) => { fontSize: number; lineHeight: number; fontWeight: (typeof type)[TypeRole]["weight"]; letterSpacing: number } };
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const pref = useStore((s) => s.settings.theme);
  const scaleName = useStore((s) => s.settings.fontScale);
  const name: ThemeName = pref === "system" ? (system === "light" ? "light" : "dark") : pref;
  const value = useMemo<ThemeCtx>(() => {
    const scale = fontScales[scaleName];
    return { name, c: themes[name], scale, scaleName, font: (role) => ({ fontSize: Math.round(type[role].size * scale), lineHeight: Math.round(type[role].line * scale), fontWeight: type[role].weight, letterSpacing: type[role].tracking }) };
  }, [name, scaleName]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useTheme(): ThemeCtx {
  const v = useContext(Ctx); if (!v) throw new Error("useTheme, ThemeProvider içinde kullanılmalı");
  return v;
}
