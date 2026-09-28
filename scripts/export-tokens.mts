// Tasarım belirteçlerini W3C Design Tokens (DTCG) JSON ve CSS değişkenleri olarak dışa aktarır.
// Kullanım: npm run tokens  →  design-tokens/tokens.json, design-tokens/tokens.css
import { writeFileSync, mkdirSync } from "node:fs";
import { palette, light, dark, space, radius, type, motion, hit, fontScales } from "../src/theme/tokens.ts";

const color = (v: string, desc?: string) => ({ $type: "color", $value: v, ...(desc ? { $description: desc } : {}) });
const dim = (v: number) => ({ $type: "dimension", $value: `${v}px` });
const tokens = {
  $schema: "https://tr.designtokens.org/format/",
  palette: Object.fromEntries(Object.entries(palette).map(([k, scale]) => [k, Object.fromEntries(Object.entries(scale).map(([s, v]) => [s, color(v)]))])),
  theme: { light: Object.fromEntries(Object.entries(light).map(([k, v]) => [k, color(v)])), dark: Object.fromEntries(Object.entries(dark).map(([k, v]) => [k, color(v)])) },
  space: Object.fromEntries(Object.entries(space).map(([k, v]) => [k, dim(v)])),
  radius: Object.fromEntries(Object.entries(radius).map(([k, v]) => [k, dim(v)])),
  typography: Object.fromEntries(Object.entries(type).map(([k, t]) => [k, { $type: "typography", $value: { fontFamily: "System", fontSize: `${t.size}px`, lineHeight: `${t.line}px`, fontWeight: Number(t.weight), letterSpacing: `${t.tracking}px` } }])),
  fontScale: Object.fromEntries(Object.entries(fontScales).map(([k, v]) => [k, { $type: "number", $value: v }])),
  motion: { fast: { $type: "duration", $value: `${motion.fast}ms` }, base: { $type: "duration", $value: `${motion.base}ms` }, slow: { $type: "duration", $value: `${motion.slow}ms` } },
  hitTarget: { min: dim(hit.min), comfortable: dim(hit.comfortable) },
};
const css = [":root {", ...Object.entries(light).map(([k, v]) => `  --color-${k}: ${v};`), ...Object.entries(space).map(([k, v]) => `  --space-${k}: ${v}px;`), ...Object.entries(radius).map(([k, v]) => `  --radius-${k}: ${v}px;`), ...Object.entries(type).map(([k, t]) => `  --type-${k}: ${t.weight} ${t.size}px/${t.line}px system-ui;`), "}", '[data-theme="dark"] {', ...Object.entries(dark).map(([k, v]) => `  --color-${k}: ${v};`), "}", ""].join("\n");
mkdirSync("design-tokens", { recursive: true });
writeFileSync("design-tokens/tokens.json", JSON.stringify(tokens, null, 2) + "\n");
writeFileSync("design-tokens/tokens.css", css);
console.log("✓ design-tokens/tokens.json ve tokens.css yazıldı");
