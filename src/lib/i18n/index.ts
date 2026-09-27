/**
 * Minimal i18n for the zh-TW fork.
 *
 * There was no i18n layer upstream, and the UI strings are spread across
 * ~230 routes. Rather than pulling in next-intl (routing changes, message
 * catalogs per route, provider wiring in a codebase that mixes server and
 * client components everywhere), this is a gettext-style dictionary:
 *
 *   tr("All tools")            → "所有工具"   (when the UI locale is zh-TW)
 *   tr("{n} matches", { n })   → "{n} 筆符合" with {n} filled in
 *
 * The English source string IS the key, so an untranslated string simply
 * falls back to English, and switching the UI back to English is a
 * single env var. Works identically in server and client components.
 *
 * UI locale: NEXT_PUBLIC_DEFAULT_LOCALE (default "zh-TW"). It must be a
 * NEXT_PUBLIC_ variable so server and client render the same text
 * (otherwise hydration mismatches). Set NEXT_PUBLIC_DEFAULT_LOCALE=en for
 * the original English UI.
 */
import { ZH_TW } from "./zh-TW";
import { TOOLS_ZH_TW } from "./tools.zh-TW";

export type UiLocale = "zh-TW" | "en";

export const UI_LOCALE: UiLocale = /^en/i.test(
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "",
)
  ? "en"
  : "zh-TW";

/** BCP-47 tag for <html lang>. */
export const HTML_LANG = UI_LOCALE === "zh-TW" ? "zh-Hant-TW" : "en";

type Vars = Record<string, string | number>;

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  );
}

/** Translate a UI string (English source text is the key). */
export function tr(en: string, vars?: Vars): string {
  if (UI_LOCALE === "zh-TW") {
    const zh = ZH_TW[en];
    if (zh !== undefined) return interpolate(zh, vars);
  }
  return interpolate(en, vars);
}

/** Translated tool title / description by route, falling back to English. */
export function toolText(
  href: string,
  fallback: { title: string; description: string },
): { title: string; description: string } {
  if (UI_LOCALE !== "zh-TW") return fallback;
  const zh = TOOLS_ZH_TW[href];
  return zh ? { title: zh.title, description: zh.description } : fallback;
}

/** Just the tool title (for page headers, palettes, breadcrumbs). */
export function toolTitle(href: string, fallback: string): string {
  if (UI_LOCALE !== "zh-TW") return fallback;
  return TOOLS_ZH_TW[href]?.title ?? fallback;
}

/** `true` if a translation exists — handy in tests / coverage scripts. */
export function hasTranslation(en: string): boolean {
  return en in ZH_TW;
}

/** Alias of `tr` (short name kept out of the way of `t` loop variables). */
export const t = tr;
