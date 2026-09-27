/**
 * Chinese (Traditional first, Simplified where it's cheap) search-intent
 * signals, used by `classifyIntent` in keyword-research.ts and the auto
 * keyword discoverer.
 *
 * The upstream classifier only knew English words and `\b` boundaries,
 * which never match between Chinese characters — so every Chinese query
 * fell through to the "≤ 2 words → commercial" heuristic and
 * 「如何寫部落格」 came out as commercial.
 *
 * Patterns are deliberately plain substrings (no `\b`), with a
 * Latin-letter guard around the few ASCII tokens (ptt, dcard, vs …) so
 * "vs" doesn't match inside "canvas".
 */

export type ZhIntent = "informational" | "commercial" | "transactional" | "navigational";

const L = (s: string) => `(?<![a-z])(?:${s})(?![a-z])`;

/** Buying now: price, deals, where to buy. */
const ZH_TRANSACTIONAL = new RegExp(
  [
    "價格", "价格", "價錢", "价钱", "多少錢", "多少钱", "幾錢", "報價", "报价",
    "費用", "费用", "收費", "收费", "優惠", "优惠", "折扣", "折價", "折价",
    "優惠碼", "优惠码", "折扣碼", "折扣码", "特價", "特价", "團購", "团购",
    "購買", "购买", "哪裡買", "哪里买", "哪買", "在哪買", "最便宜", "便宜",
    "訂購", "订购", "下單", "下单", "預約", "预约", "代購", "代购", "免運",
    "免运", "門市", "门市", "出租", "租借", "二手", "拍賣", "拍卖",
  ]
    .map((w) => (/^[a-z]+$/.test(w) ? L(w) : w))
    .join("|"),
  "i",
);

/**
 * Marketplace names (「蝦皮 耳機」 = shopping). Kept apart from the explicit
 * buying words so 「蝦皮 官網 登入」 stays navigational: a marketplace name
 * only counts as transactional when no navigational signal is present.
 */
const ZH_MARKETPLACE = new RegExp(
  ["蝦皮", "虾皮", "露天", "淘寶", "淘宝", L("momo"), L("pchome"), L("shopee")].join("|"),
  "i",
);

/** Researching before buying: recommendations, comparisons, reviews. */
const ZH_COMMERCIAL = new RegExp(
  [
    "推薦", "推荐", "比較", "比较", "評價", "评价", "評測", "评测", "評比",
    "评比", "評論", "评论", "開箱", "开箱", "心得", "口碑", "排行", "排行榜",
    "排名", "哪個好", "哪个好", "哪家好", "哪款", "值得買", "值得买", "好用嗎",
    "好用吗", "優缺點", "优缺点", "替代", "cp值", "首選", "首选", "必買",
    "必买", "精選", "精选",
    L("ptt"), L("dcard"), L("mobile01"), L("vs\\.?"), L("top\\s*\\d+"),
  ].join("|"),
  "i",
);

/** Looking for a specific site / page. */
const ZH_NAVIGATIONAL = new RegExp(
  [
    "官網", "官网", "官方網站", "官方网站", "登入", "登錄", "登录", "註冊",
    "注册", "客服", "客服電話", "聯絡", "联系", "會員", "会员", "帳號", "账号",
    "下載", "下载", "網址", "网址", "營業時間", "营业时间", "地址",
    L("app"), L("login"),
  ].join("|"),
  "i",
);

/** Wants to learn / understand something. */
const ZH_INFORMATIONAL = new RegExp(
  [
    "如何", "怎麼", "怎么", "怎樣", "怎样", "什麼", "什么", "是什麼", "什麼是",
    "為什麼", "为什么", "為何", "为何", "教學", "教学", "教程", "方法", "意思",
    "定義", "定义", "原理", "步驟", "步骤", "技巧", "懶人包", "懒人包", "入門",
    "入门", "介紹", "介绍", "範例", "范例", "例子", "注意事項", "注意事项",
    "差別", "差别", "差異", "差异", "好處", "好处", "攻略", "秘訣", "秘诀",
    "指南", "須知", "须知", "原因", "意義", "意义", "解釋", "解释", "嗎", "吗",
  ].join("|"),
  "i",
);

export type ZhIntentSignals = Record<ZhIntent, boolean>;

export function zhIntentSignals(query: string): ZhIntentSignals {
  const q = query.toLowerCase();
  const navigational = ZH_NAVIGATIONAL.test(q);
  return {
    transactional:
      ZH_TRANSACTIONAL.test(q) || (!navigational && ZH_MARKETPLACE.test(q)),
    commercial: ZH_COMMERCIAL.test(q),
    navigational,
    informational: ZH_INFORMATIONAL.test(q),
  };
}

/**
 * Intent from Chinese signals alone, or null when none match. Precedence
 * mirrors the English classifier (transactional > commercial >
 * navigational > informational), with one Chinese-specific exception: a
 * question word (如何 / 怎麼 / 什麼是 …) combined only with a commercial
 * word stays commercial (「筆電推薦 怎麼選」), but a question word with
 * NO buying signal is informational even if it is short.
 */
export function classifyZhIntent(query: string): ZhIntent | null {
  const s = zhIntentSignals(query);
  if (s.transactional) return "transactional";
  if (s.commercial) return "commercial";
  if (s.navigational && !s.informational) return "navigational";
  if (s.informational) return "informational";
  if (s.navigational) return "navigational";
  return null;
}
