/**
 * Market / language defaults for this fork (Taiwan, Traditional Chinese).
 *
 * Upstream hardcoded `hl=en` on every Google-facing request (autocomplete,
 * SERP scrapes, Trends) and defaulted every country field to "US", so a
 * Taiwan user typing 「SEO 教學」 got English suggestions ranked for an
 * American audience.
 *
 * Configure with environment variables (all optional):
 *
 *   DEFAULT_LOCALE=zh-TW    UI + AI output language      (default zh-TW)
 *   DEFAULT_COUNTRY=TW      default market / gl=          (default TW)
 *   SEARCH_LANGUAGE=zh-TW   hl= for the default country   (default = DEFAULT_LOCALE)
 *
 * Client components can't read server env vars, so the NEXT_PUBLIC_
 * variants (NEXT_PUBLIC_DEFAULT_COUNTRY / NEXT_PUBLIC_DEFAULT_LOCALE) are
 * honoured too, and take precedence when set.
 *
 * The search language follows the COUNTRY being queried: if you explicitly
 * research the US market you still get hl=en; TW → zh-TW, HK → zh-HK,
 * CN → zh-CN, JP → ja, and so on.
 */

function env(name: string): string | undefined {
  try {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
}

export const DEFAULT_LOCALE: string =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE || env("DEFAULT_LOCALE") || "zh-TW";

export const DEFAULT_COUNTRY: string = (
  process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || env("DEFAULT_COUNTRY") || "TW"
).toUpperCase();

/** Google `hl=` per country (alpha-2, upper-case). */
const COUNTRY_HL: Record<string, string> = {
  TW: "zh-TW",
  HK: "zh-HK",
  MO: "zh-HK",
  CN: "zh-CN",
  SG: "en",
  JP: "ja",
  KR: "ko",
  TH: "th",
  VN: "vi",
  ID: "id",
  MY: "ms",
  PH: "en",
  DE: "de",
  AT: "de",
  FR: "fr",
  ES: "es",
  MX: "es",
  IT: "it",
  NL: "nl",
  BR: "pt-BR",
  PT: "pt-PT",
};

/** `hl=` value for a Google request targeting `country`. */
export function googleHl(country?: string | null): string {
  const c = (country || DEFAULT_COUNTRY).toUpperCase();
  if (c === DEFAULT_COUNTRY) {
    return env("SEARCH_LANGUAGE") || COUNTRY_HL[c] || DEFAULT_LOCALE || "en";
  }
  return COUNTRY_HL[c] ?? "en";
}

/** `gl=` value (lower-case alpha-2) for Google requests. */
export function googleGl(country?: string | null): string {
  return (country || DEFAULT_COUNTRY).toLowerCase();
}

/** Google Trends wants e.g. "zh-TW" / "en-US". */
export function trendsHl(country?: string | null): string {
  const hl = googleHl(country);
  if (hl.includes("-")) return hl;
  const c = (country || DEFAULT_COUNTRY).toUpperCase();
  return `${hl}-${c}`;
}

/** An Accept-Language header matching the target market. */
export function acceptLanguage(country?: string | null): string {
  const hl = googleHl(country);
  if (hl === "en") return "en-US,en;q=0.9";
  const base = hl.split("-")[0];
  return `${hl},${base};q=0.9,en;q=0.6`;
}

/** Is the UI / AI output language Traditional Chinese? */
export function isZhTw(locale: string = DEFAULT_LOCALE): boolean {
  return /^zh[-_](tw|hant)/i.test(locale);
}
