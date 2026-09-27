/**
 * CJK-aware text measurement.
 *
 * The upstream code counted words with `text.split(/\s+/)`. Chinese (and
 * Japanese) text has no spaces between words, so a 2,000-character
 * Traditional Chinese article was counted as a handful of "words" — every
 * Chinese page got flagged as thin content, keyword long-tail heuristics
 * never fired, and the content scorers were meaningless.
 *
 * This module is the one place that knows how to measure text:
 *
 *  - `countWords(text)` — word-like tokens via the built-in
 *    `Intl.Segmenter('zh-Hant', { granularity: 'word' })`. English words,
 *    numbers and Chinese words are all counted, so mixed text such as
 *    「SEO 教學：如何寫 meta description」 works. If the runtime has no
 *    Segmenter (very old browsers / small-ICU builds) we fall back to
 *    "Latin words + CJK characters / 1.5".
 *  - `countCjkChars(text)` — Han / Kana / Hangul characters (what Taiwan
 *    writers call 字數).
 *  - `textStats(text)` — both, plus whether the text is CJK-dominant.
 *
 * ── Threshold policy (documented choice) ───────────────────────────────
 * English SEO thresholds are expressed in words ("< 200 words is thin").
 * For CJK-dominant text we switch to a CHARACTER-based threshold using
 * `CJK_CHARS_PER_WORD = 1.5`: one English word carries roughly the same
 * information as 1.5 Chinese characters (typical EN→ZH translation ratio
 * is 1.5–1.8 characters per word; we take the low end to avoid false
 * "thin content" alarms). So the upstream 200-word thin threshold becomes
 * 300 字 for a Chinese page, 80 words → 120 字, and so on. Use
 * `wordEquivalents()` / `isBelowWordThreshold()` for those comparisons.
 *
 * For short search queries (`queryTermCount`) CJK-dominant queries are
 * measured as ceil(CJK chars / 2) + Latin words, because the segmenter's
 * dictionary splits many Taiwan terms (部落格 → 部落/格, 筆電 → 筆/電)
 * and a 2-characters-per-term estimate is steadier for long-tail flags:
 * 「如何寫部落格」 → 3 terms, 「最便宜 筆電 推薦」 → 4 terms (long-tail).
 */

/** Han (incl. ext. A), CJK compatibility, Hiragana, Katakana, Hangul. */
const CJK_CHAR_RE =
  /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g;
const CJK_TEST_RE =
  /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;

/** English words carry ~1.5 Chinese characters' worth of content. */
export const CJK_CHARS_PER_WORD = 1.5;

/** CJK share of letters above which a text is treated as CJK-dominant. */
const CJK_DOMINANT_RATIO = 0.3;

type SegmenterLike = {
  segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }>;
};

let cachedSegmenter: SegmenterLike | null | undefined;

function getSegmenter(): SegmenterLike | null {
  if (cachedSegmenter !== undefined) return cachedSegmenter;
  try {
    const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => SegmenterLike })
      .Segmenter;
    cachedSegmenter = Seg ? new Seg("zh-Hant", { granularity: "word" }) : null;
  } catch {
    cachedSegmenter = null;
  }
  return cachedSegmenter;
}

/** Test hook: force the no-Segmenter fallback path. */
export function __setSegmenterForTests(s: SegmenterLike | null | undefined): void {
  cachedSegmenter = s;
}

export function hasCjk(text: string): boolean {
  return CJK_TEST_RE.test(text);
}

/** Number of CJK characters (字數, excluding punctuation). */
export function countCjkChars(text: string): number {
  if (!text) return 0;
  const m = text.match(CJK_CHAR_RE);
  return m ? m.length : 0;
}

/** Latin / number words (whitespace-separated runs after removing CJK). */
export function countLatinWords(text: string): number {
  if (!text) return 0;
  const m = text.replace(CJK_CHAR_RE, " ").match(/[\p{L}\p{N}][\p{L}\p{N}'’._-]*/gu);
  return m ? m.length : 0;
}

/**
 * Word-like tokens in `text`, CJK-aware. Punctuation and whitespace are
 * dropped. Latin tokens keep their original case.
 */
export function segmentWords(text: string): string[] {
  if (!text) return [];
  const seg = getSegmenter();
  if (seg) {
    const out: string[] = [];
    for (const s of seg.segment(text)) {
      if (s.isWordLike) out.push(s.segment);
    }
    return out;
  }
  // Fallback: Latin words as-is, every CJK character as its own token.
  const out: string[] = [];
  const re = /[\p{L}\p{N}][\p{L}\p{N}'’._-]*/gu;
  for (const chunk of text.split(/([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF])/)) {
    if (!chunk) continue;
    if (CJK_TEST_RE.test(chunk)) out.push(chunk);
    else for (const m of chunk.matchAll(re)) out.push(m[0]);
  }
  return out;
}

/**
 * Word count that works for English, Chinese and mixed text. Drop-in
 * replacement for `text.split(/\s+/).filter(Boolean).length`.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  if (!hasCjk(text)) {
    // Fast path, identical to the upstream behaviour for pure Latin text.
    return text.split(/\s+/).filter(Boolean).length;
  }
  if (getSegmenter()) return segmentWords(text).length;
  return countLatinWords(text) + Math.round(countCjkChars(text) / CJK_CHARS_PER_WORD);
}

export type TextStats = {
  /** CJK-aware word count (see `countWords`). */
  words: number;
  /** CJK characters (字數). */
  cjkChars: number;
  /** Latin / number words. */
  latinWords: number;
  /** True when CJK characters dominate the letters in the text. */
  cjkDominant: boolean;
};

export function isCjkDominant(text: string): boolean {
  const cjk = countCjkChars(text);
  if (cjk === 0) return false;
  const latinLetters = (text.replace(CJK_CHAR_RE, "").match(/\p{L}/gu) ?? []).length;
  // Compare CJK chars against Latin *words* ≈ letters / 5.
  return cjk / (cjk + latinLetters / 5) >= CJK_DOMINANT_RATIO;
}

export function textStats(text: string): TextStats {
  const cjkChars = countCjkChars(text);
  return {
    words: countWords(text),
    cjkChars,
    latinWords: countLatinWords(text),
    cjkDominant: cjkChars > 0 && isCjkDominant(text),
  };
}

/**
 * Length expressed in "English-word equivalents", for comparing against
 * thresholds that were written in English words. CJK-dominant text is
 * measured by characters: (CJK chars / 1.5) + Latin words.
 */
export function wordEquivalents(text: string): number {
  const s = textStats(text);
  if (!s.cjkDominant) return s.words;
  return Math.round(s.cjkChars / CJK_CHARS_PER_WORD) + s.latinWords;
}

/**
 * `true` when text is shorter than an English-word threshold. For
 * CJK-dominant text the threshold becomes `minWords × 1.5` characters
 * (200 words → 300 字).
 */
export function isBelowWordThreshold(text: string, minWords: number): boolean {
  return wordEquivalents(text) < minWords;
}

/** The CJK character threshold equivalent to an English word threshold. */
export function cjkCharThreshold(minWords: number): number {
  return Math.round(minWords * CJK_CHARS_PER_WORD);
}

/**
 * Human label for a text length: 「1,234 字」 for CJK-dominant text,
 * "1,234 words" otherwise.
 */
export function formatLength(text: string, locale: "zh-TW" | "en" = "zh-TW"): string {
  const s = textStats(text);
  if (s.cjkDominant) {
    return `${(s.cjkChars + s.latinWords).toLocaleString()} 字`;
  }
  return locale === "zh-TW"
    ? `${s.words.toLocaleString()} 個字詞`
    : `${s.words.toLocaleString()} words`;
}

/**
 * Number of "terms" in a short search query, for long-tail / intent
 * heuristics. CJK-dominant queries: ceil(CJK chars / 2) + Latin words.
 */
export function queryTermCount(query: string): number {
  const q = query.trim();
  if (!q) return 0;
  if (!hasCjk(q)) return q.split(/\s+/).filter(Boolean).length;
  return Math.ceil(countCjkChars(q) / 2) + countLatinWords(q);
}

/** A small set of Chinese function words that are useless as topic terms. */
export const ZH_STOP_WORDS: ReadonlySet<string> = new Set([
  "的", "了", "和", "與", "及", "或", "是", "在", "有", "我", "你", "他", "她",
  "它", "我們", "你們", "他們", "這", "那", "這個", "那個", "一個", "也", "就",
  "都", "而", "並", "但", "如果", "因為", "所以", "可以", "什麼", "如何", "怎麼",
  "以及", "還有", "對", "把", "被", "讓", "從", "到", "為", "於", "之", "等",
  "們", "个", "这", "那些", "这些", "这个", "我们", "他们", "什么", "怎么", "为",
  "与", "还", "对于", "關於", "关于",
]);

/**
 * CJK topic terms from `text` (2+ character Chinese words, stop words
 * removed). Meant to be APPENDED to the existing Latin tokenizers used
 * for similarity / clustering, which strip everything outside [a-z0-9]
 * and therefore dropped Chinese entirely.
 */
export function cjkTerms(text: string): string[] {
  if (!text || !hasCjk(text)) return [];
  const out: string[] = [];
  const words = segmentWords(text).filter((w) => hasCjk(w));
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.length >= 2) {
      if (!ZH_STOP_WORDS.has(w)) out.push(w);
    } else if (i + 1 < words.length && words[i + 1].length === 1) {
      // The ICU dictionary splits many Taiwan terms into single
      // characters (筆電 → 筆 / 電). Re-join adjacent single characters
      // into a bigram so they still contribute a topic term.
      const bi = w + words[i + 1];
      if (!ZH_STOP_WORDS.has(bi) && !ZH_STOP_WORDS.has(w)) out.push(bi);
    }
  }
  return out;
}
