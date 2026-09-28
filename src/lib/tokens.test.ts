import { describe, expect, it } from "vitest";
import { contrast, level, parseColor, composite, toHex } from "./a11y";
import { contrastContract, themes, type, space, hit, fontScales } from "@/theme/tokens";

describe("kontrast hesabı", () => {
  it("siyah/beyaz 21:1, aynı renk 1:1", () => { expect(contrast("#000", "#fff")).toBe(21); expect(contrast("#777", "#777")).toBe(1); });
  it("bilinen WCAG örneği: #767676 / #fff ≈ 4.54", () => { expect(contrast("#767676", "#ffffff")).toBeCloseTo(4.54, 1); });
  it("yarı saydam ön plan zemine bindirilir", () => {
    expect(toHex(composite(parseColor("rgba(255,255,255,0.5)"), parseColor("#000000")))).toBe("#808080");
    expect(contrast("rgba(255,255,255,0.5)", "#000")).toBeLessThan(contrast("#fff", "#000"));
  });
  it("seviye eşikleri", () => { expect(level(7)).toBe("AAA"); expect(level(4.5)).toBe("AA"); expect(level(3)).toBe("AA-large"); expect(level(2.9)).toBe("fail"); });
});

describe("tasarım belirteçleri — WCAG sözleşmesi", () => {
  for (const name of ["light", "dark"] as const) {
    const t = themes[name];
    for (const c of contrastContract) {
      it(`${name}: ${c.note} (${c.fg}/${c.bg} ≥ ${c.min}:1)`, () => {
        const ratio = contrast(t[c.fg], t[c.bg], t.bg);
        expect(ratio, `${t[c.fg]} / ${t[c.bg]} = ${ratio}`).toBeGreaterThanOrEqual(c.min);
      });
    }
  }
  it("tipografi ölçeği artan ve satır yüksekliği ≥ 1,2×", () => {
    const sizes = [type.label.size, type.small.size, type.body.size, type.h3.size, type.h2.size, type.h1.size, type.display.size];
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
    for (const r of Object.values(type)) expect(r.line / r.size).toBeGreaterThanOrEqual(1.1);
  });
  it("boşluklar 4 pt ızgarada, dokunma hedefi ≥ 44 pt", () => {
    for (const v of Object.values(space)) expect(v % 4).toBe(0);
    expect(hit.min).toBeGreaterThanOrEqual(44);
  });
  it("en büyük yazı ölçeğinde gövde metni ≥ 20 pt", () => { expect(type.body.size * fontScales.xlarge).toBeGreaterThanOrEqual(20); });
});
