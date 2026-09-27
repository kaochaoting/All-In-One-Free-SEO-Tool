import { afterEach, describe, expect, it } from "vitest";
import {
  __setSegmenterForTests,
  cjkCharThreshold,
  cjkTerms,
  countCjkChars,
  countWords,
  formatLength,
  isBelowWordThreshold,
  isCjkDominant,
  queryTermCount,
  textStats,
  wordEquivalents,
} from "./segment";

const ZH =
  "網站健檢可以幫你找出技術 SEO 問題，包括 meta 標籤、反向連結與結構化資料。定期檢查索引狀態，才能確保排名穩定。";

describe("countWords", () => {
  afterEach(() => __setSegmenterForTests(undefined));

  it("is unchanged for plain English", () => {
    expect(countWords("Hello world, this is a test.")).toBe(6);
    expect(countWords("  spaced   out  ")).toBe(2);
    expect(countWords("")).toBe(0);
  });

  it("counts Chinese words even without spaces", () => {
    // upstream split(/\s+/) returned 5 for this paragraph
    expect(ZH.split(/\s+/).filter(Boolean).length).toBeLessThan(6);
    const n = countWords(ZH);
    expect(n).toBeGreaterThan(25);
    expect(n).toBeLessThan(countCjkChars(ZH) + 5);
  });

  it("counts mixed English and Chinese", () => {
    const n = countWords("SEO 教學：如何寫 meta description");
    // SEO, 教學, 如何, 寫, meta, description (+/- segmenter granularity)
    expect(n).toBeGreaterThanOrEqual(6);
    expect(n).toBeLessThanOrEqual(8);
  });

  it("falls back without Intl.Segmenter", () => {
    __setSegmenterForTests(null);
    // 6 CJK chars / 1.5 = 4, plus "SEO" = 5
    expect(countWords("SEO 網站健檢工具")).toBe(5);
    expect(cjkTerms("網站健檢")).toContain("網站");
  });
});

describe("CJK stats + thresholds", () => {
  it("counts CJK characters and detects dominance", () => {
    expect(countCjkChars("SEO 教學")).toBe(2);
    expect(isCjkDominant(ZH)).toBe(true);
    expect(isCjkDominant("An English sentence with one 字.")).toBe(false);
    const s = textStats(ZH);
    expect(s.cjkDominant).toBe(true);
    expect(s.latinWords).toBe(2); // SEO, meta
  });

  it("uses a character-based threshold for Chinese (200 words → 300 字)", () => {
    expect(cjkCharThreshold(200)).toBe(300);
    const zh280 = "字".repeat(280);
    const zh320 = "字".repeat(320);
    expect(isBelowWordThreshold(zh280, 200)).toBe(true);
    expect(isBelowWordThreshold(zh320, 200)).toBe(false);
    expect(wordEquivalents(zh320)).toBe(213);
    expect(isBelowWordThreshold("word ".repeat(150), 200)).toBe(true);
  });

  it("formats a length label", () => {
    expect(formatLength(ZH)).toMatch(/字$/);
    expect(formatLength("two words", "en")).toBe("2 words");
  });
});

describe("queryTermCount", () => {
  it("measures Chinese queries by characters", () => {
    expect(queryTermCount("如何寫部落格")).toBe(3);
    expect(queryTermCount("最便宜 筆電 推薦")).toBe(4);
    expect(queryTermCount("SEO 教學")).toBe(2);
    expect(queryTermCount("best running shoes for men")).toBe(5);
  });
});

describe("cjkTerms", () => {
  it("extracts Chinese topic terms and skips stop words", () => {
    const t = cjkTerms("我們的網站健檢工具");
    expect(t).toContain("網站");
    expect(t).toContain("工具");
    expect(t).not.toContain("的");
    expect(t).not.toContain("我們");
    expect(cjkTerms("english only")).toEqual([]);
  });
});
