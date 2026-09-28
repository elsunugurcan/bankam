/**
 * Bankam Tasarım Sistemi — tek doğruluk kaynağı.
 * Buradaki değerler uygulama tarafından doğrudan kullanılır ve
 * `npm run tokens` ile W3C Design Tokens (DTCG) JSON + CSS değişkenleri olarak dışa aktarılır.
 */

/* ---------- 1. İlkel renkler (primitives) ---------- */
export const palette = {
  indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" },
  slate: { 0: "#ffffff", 50: "#f6f7fb", 100: "#eceef5", 200: "#d9dde8", 300: "#b8bfd1", 400: "#8b93a8", 500: "#646c82", 600: "#4a5168", 700: "#343a4e", 800: "#1c2033", 850: "#14182b", 900: "#0f1224", 950: "#0a0d1a" },
  green: { 100: "#d1fae5", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857" },
  red: { 100: "#fee2e2", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c" },
  amber: { 100: "#fef3c7", 400: "#fbbf24", 500: "#f59e0b", 700: "#b45309" },
  sky: { 100: "#e0f2fe", 400: "#38bdf8", 600: "#0284c7", 700: "#0369a1" },
} as const;

/* ---------- 2. Anlamsal renkler (semantic) — açık ve koyu tema ---------- */
export type ColorRole =
  | "bg" | "bgElevated" | "surface" | "surface2" | "surfaceInverse" | "border" | "borderStrong"
  | "text" | "text2" | "textMuted" | "textInverse" | "textOnPrimary"
  | "primary" | "primaryPressed" | "primarySoft" | "onPrimarySoft"
  | "success" | "successSoft" | "onSuccessSoft" | "danger" | "dangerSoft" | "onDangerSoft" | "warning" | "warningSoft" | "onWarningSoft" | "info" | "infoSoft" | "onInfoSoft"
  | "focus" | "overlay";
export type Theme = Record<ColorRole, string>;

export const light: Theme = {
  bg: palette.slate[50], bgElevated: palette.slate[0], surface: palette.slate[0], surface2: palette.slate[100], surfaceInverse: palette.slate[900],
  border: palette.slate[200], borderStrong: palette.slate[400],
  text: palette.slate[900], text2: palette.slate[600], textMuted: palette.slate[500], textInverse: palette.slate[0], textOnPrimary: palette.slate[0],
  primary: palette.indigo[600], primaryPressed: palette.indigo[700], primarySoft: palette.indigo[50], onPrimarySoft: palette.indigo[700],
  success: palette.green[700], successSoft: palette.green[100], onSuccessSoft: palette.green[700],
  danger: palette.red[600], dangerSoft: palette.red[100], onDangerSoft: palette.red[700],
  warning: palette.amber[700], warningSoft: palette.amber[100], onWarningSoft: palette.amber[700],
  info: palette.sky[700], infoSoft: palette.sky[100], onInfoSoft: palette.sky[700],
  focus: palette.indigo[500], overlay: "rgba(15,18,36,0.55)",
};
export const dark: Theme = {
  bg: palette.slate[950], bgElevated: palette.slate[900], surface: palette.slate[850], surface2: palette.slate[800], surfaceInverse: palette.slate[50],
  border: "rgba(255,255,255,0.09)", borderStrong: "rgba(255,255,255,0.42)",
  text: palette.indigo[50], text2: palette.slate[300], textMuted: palette.slate[400], textInverse: palette.slate[900], textOnPrimary: palette.slate[950],
  primary: palette.indigo[400], primaryPressed: palette.indigo[300], primarySoft: "rgba(129,140,248,0.16)", onPrimarySoft: palette.indigo[200],
  success: palette.green[400], successSoft: "rgba(52,211,153,0.16)", onSuccessSoft: palette.green[400],
  danger: palette.red[400], dangerSoft: "rgba(248,113,113,0.16)", onDangerSoft: palette.red[400],
  warning: palette.amber[400], warningSoft: "rgba(251,191,36,0.16)", onWarningSoft: palette.amber[400],
  info: palette.sky[400], infoSoft: "rgba(56,189,248,0.16)", onInfoSoft: palette.sky[400],
  focus: palette.indigo[300], overlay: "rgba(0,0,0,0.65)",
};

/** WCAG kontrast sözleşmesi: metin/zemin çiftleri ve beklenen minimum oran. Testler bunu her iki temada doğrular. */
export const contrastContract: { fg: ColorRole; bg: ColorRole; min: number; note: string }[] = [
  { fg: "text", bg: "bg", min: 7, note: "gövde metni / sayfa (AAA)" },
  { fg: "text", bg: "surface", min: 7, note: "gövde metni / kart (AAA)" },
  { fg: "text2", bg: "surface", min: 4.5, note: "ikincil metin / kart (AA)" },
  { fg: "textMuted", bg: "surface", min: 4.5, note: "soluk metin / kart (AA)" },
  { fg: "textMuted", bg: "bg", min: 4.5, note: "soluk metin / sayfa (AA)" },
  { fg: "textOnPrimary", bg: "primary", min: 4.5, note: "birincil düğme metni (AA)" },
  { fg: "onPrimarySoft", bg: "primarySoft", min: 4.5, note: "yumuşak birincil rozet (AA)" },
  { fg: "onSuccessSoft", bg: "successSoft", min: 4.5, note: "başarı rozeti (AA)" },
  { fg: "onDangerSoft", bg: "dangerSoft", min: 4.5, note: "hata rozeti (AA)" },
  { fg: "onWarningSoft", bg: "warningSoft", min: 4.5, note: "uyarı rozeti (AA)" },
  { fg: "onInfoSoft", bg: "infoSoft", min: 4.5, note: "bilgi rozeti (AA)" },
  { fg: "danger", bg: "surface", min: 4.5, note: "hata metni / kart (AA)" },
  { fg: "success", bg: "surface", min: 4.5, note: "başarı metni / kart (AA)" },
  { fg: "primary", bg: "surface", min: 4.5, note: "bağlantı metni / kart (AA)" },
  { fg: "borderStrong", bg: "surface", min: 3, note: "giriş alanı kenarlığı (AA, arayüz bileşeni)" },
  { fg: "focus", bg: "bg", min: 3, note: "odak halkası (AA, arayüz bileşeni)" },
];

/* ---------- 3. Boşluk (4 pt ızgara) ---------- */
export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const;
/* ---------- 4. Köşe yarıçapı ---------- */
export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 } as const;
/* ---------- 5. Tipografi ölçeği (1,2 oranlı; satır yüksekliği dahil) ---------- */
export const type = {
  display: { size: 34, line: 40, weight: "800" as const, tracking: -0.8 },
  h1: { size: 28, line: 34, weight: "800" as const, tracking: -0.5 },
  h2: { size: 22, line: 28, weight: "700" as const, tracking: -0.3 },
  h3: { size: 17, line: 22, weight: "700" as const, tracking: 0 },
  body: { size: 16, line: 22, weight: "400" as const, tracking: 0 },
  bodyStrong: { size: 16, line: 22, weight: "600" as const, tracking: 0 },
  small: { size: 13, line: 18, weight: "400" as const, tracking: 0 },
  label: { size: 11, line: 14, weight: "700" as const, tracking: 1 },
  amount: { size: 40, line: 46, weight: "800" as const, tracking: -1 },
} as const;
export type TypeRole = keyof typeof type;
/** Erişilebilirlik: kullanıcı yazı boyutu tercihleri. En büyük ölçek WCAG 1.4.4 (%200'e kadar) yönünde 1,3'e kadar destekler. */
export const fontScales = { normal: 1, large: 1.15, xlarge: 1.3 } as const;
export type FontScale = keyof typeof fontScales;
/* ---------- 6. Hareket ---------- */
export const motion = { fast: 120, base: 200, slow: 320, spring: { damping: 18, stiffness: 220 } } as const;
/* ---------- 7. Dokunma hedefleri ---------- */
export const hit = { min: 44, comfortable: 48 } as const;
/* ---------- 8. Yükseklik ---------- */
export const elevation = {
  none: {},
  low: { shadowColor: "#0a0d1a", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  high: { shadowColor: "#0a0d1a", shadowOpacity: 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
} as const;

export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;
