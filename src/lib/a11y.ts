/** WCAG 2.2 kontrast hesapları — tasarım belirteçleri testlerle doğrulanır, arayüzde canlı gösterilir. */
export type RGB = { r: number; g: number; b: number; a: number };

export function parseColor(c: string): RGB {
  const s = c.trim();
  if (s.startsWith("#")) {
    const h = s.slice(1); const n = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16), a: n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1 };
  }
  const m = s.match(/rgba?\(([^)]+)\)/); if (!m) throw new Error("Renk çözümlenemedi: " + c);
  const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim());
  return { r: +r, g: +g, b: +b, a: +a };
}
/** Yarı saydam rengi opak zemin üzerine bindirir (alfa birleştirme). */
export function composite(fg: RGB, bg: RGB): RGB {
  const a = fg.a + bg.a * (1 - fg.a);
  const ch = (f: number, b: number) => Math.round((f * fg.a + b * bg.a * (1 - fg.a)) / (a || 1));
  return { r: ch(fg.r, bg.r), g: ch(fg.g, bg.g), b: ch(fg.b, bg.b), a };
}
export function luminance({ r, g, b }: RGB): number {
  const f = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
/** Kontrast oranı (1–21). Yarı saydam ön plan zemin üzerine bindirilir; zemin yarı saydamsa `base` üzerine bindirilir. */
export function contrast(fg: string, bg: string, base = "#ffffff"): number {
  let b = parseColor(bg); if (b.a < 1) b = composite(b, parseColor(base));
  let f = parseColor(fg); if (f.a < 1) f = composite(f, b);
  const l1 = luminance(f), l2 = luminance(b);
  return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
}
export type Level = "AAA" | "AA" | "AA-large" | "fail";
export function level(ratio: number): Level { return ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA-large" : "fail"; }
export const toHex = ({ r, g, b }: RGB) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
