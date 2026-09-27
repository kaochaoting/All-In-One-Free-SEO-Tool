import { describe, expect, it } from "vitest";
import { HTML_LANG, toolText, toolTitle, tr, UI_LOCALE } from "./index";
import { TOOLS_ZH_TW } from "./tools.zh-TW";
import { ZH_TW } from "./zh-TW";

describe("zh-TW i18n", () => {
  it("defaults to Traditional Chinese", () => {
    expect(UI_LOCALE).toBe("zh-TW");
    expect(HTML_LANG).toBe("zh-Hant-TW");
    expect(tr("All tools")).toBe("所有工具");
    expect(tr("Settings")).toBe("設定");
  });

  it("interpolates variables and falls back to English", () => {
    expect(tr("{n} matches", { n: 3 })).toBe("3 筆符合");
    expect(tr("An untranslated string {x}", { x: 1 })).toBe("An untranslated string 1");
  });

  it("translates tool titles by route", () => {
    expect(toolTitle("/tools/health-check", "x")).toContain("網站健檢");
    expect(toolText("/nope", { title: "A", description: "B" })).toEqual({ title: "A", description: "B" });
    expect(Object.keys(TOOLS_ZH_TW).length).toBeGreaterThanOrEqual(90);
  });

  it("uses Taiwan terminology, not mainland terms", () => {
    const all = Object.values(ZH_TW).join("\n") +
      Object.values(TOOLS_ZH_TW).map((t) => t.title + t.description).join("\n");
    for (const bad of ["关键词", "外链", "网站", "软件", "视频", "信息", "用户", "默认", "服务器"]) {
      expect(all, bad).not.toContain(bad);
    }
  });
});
