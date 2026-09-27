import { describe, expect, it } from "vitest";
import { languageDirective, resolveAiOutputLanguage, ZH_TW_DIRECTIVE } from "./ai-language";

describe("AI output language", () => {
  it("defaults to Traditional Chinese (Taiwan)", () => {
    expect(resolveAiOutputLanguage(null)).toMatch(/^zh-TW$/i);
    expect(languageDirective(resolveAiOutputLanguage(null))).toBe(ZH_TW_DIRECTIVE);
  });
  it("a setting overrides the default, and English disables the directive", () => {
    expect(resolveAiOutputLanguage("en")).toBe("en");
    expect(languageDirective("en")).toBe("");
    expect(languageDirective("en-US")).toBe("");
  });
  it("keeps JSON keys / enum values untranslated", () => {
    expect(ZH_TW_DIRECTIVE).toContain("JSON keys");
    expect(ZH_TW_DIRECTIVE).toContain("繁體中文");
  });
  it("handles Simplified Chinese and other languages", () => {
    expect(languageDirective("zh-CN")).toContain("Simplified Chinese");
    expect(languageDirective("ja")).toContain('"ja"');
  });
});
