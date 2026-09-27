/**
 * Output-language directive appended to every AI system prompt.
 *
 * Upstream prompts are written in English and never state an output
 * language, so models answered in English (or, worse, in Simplified
 * Chinese / mainland terminology when fed Taiwanese pages). This fork
 * defaults AI output to Traditional Chinese with Taiwan usage.
 *
 * Resolution order:
 *   1. Settings key `ai.output_language` (e.g. "zh-TW", "en")
 *   2. env AI_OUTPUT_LANGUAGE
 *   3. DEFAULT_LOCALE (zh-TW unless overridden)
 *
 * "en" / "en-*" disables the directive (upstream behaviour).
 */
import { DEFAULT_LOCALE } from "@/lib/locale";

export const ZH_TW_DIRECTIVE = `## Output language (highest priority)
Write every natural-language part of your answer in Traditional Chinese as used in Taiwan (繁體中文，台灣用語), e.g. 網站、關鍵字、反向連結、索引、結構化資料、排名、使用者、軟體、影片、資訊 — never Simplified characters or mainland terms (网站、关键词、外链、软件、视频、信息、用户).
- Keep these EXACTLY as specified by the instructions: JSON keys, enum / label values the schema lists (e.g. "informational", "high"), code, HTML tags, attribute names, URLs, brand and product names, and any fixed English field formats.
- Wherever other instructions say "plain English", read it as "plain, jargon-free language" and still write in Traditional Chinese.
- Keep widely used SEO acronyms in English (SEO, SERP, CTR, E-E-A-T, Core Web Vitals, schema.org), optionally with a short Chinese gloss.
- Exception: if the instructions or the user explicitly ask for another language (for example "write the meta description in the page's language" and the page is English), follow that request.`;

export function resolveAiOutputLanguage(setting?: string | null): string {
  const s = (setting ?? "").trim();
  if (s) return s;
  const env = process.env.AI_OUTPUT_LANGUAGE?.trim();
  if (env) return env;
  return DEFAULT_LOCALE;
}

/** System-prompt suffix for the given output language, or "" for English. */
export function languageDirective(lang: string): string {
  const l = lang.toLowerCase();
  if (!l || l.startsWith("en")) return "";
  if (l === "zh-tw" || l === "zh-hant" || l.startsWith("zh-hant") || l === "zh-hk") {
    return ZH_TW_DIRECTIVE;
  }
  if (l.startsWith("zh")) {
    return "## Output language\nWrite all natural-language text in Simplified Chinese. Keep JSON keys, enum values, code, HTML and URLs exactly as specified.";
  }
  return `## Output language\nWrite all natural-language text in the language with BCP-47 tag "${lang}". Keep JSON keys, enum values, code, HTML and URLs exactly as specified.`;
}
