import { describe, expect, it } from "vitest";
import { classifyZhIntent } from "./intent-zh";
import { classifyIntent } from "@/lib/keyword-research";

describe("classifyIntent — Chinese queries", () => {
  const cases: [string, string[]][] = [
    ["如何寫部落格", ["informational"]],
    ["SEO 教學", ["informational"]],
    ["什麼是反向連結", ["informational"]],
    ["為什麼網站沒有被索引", ["informational"]],
    ["结构化数据是什么", ["informational"]],
    ["最便宜 筆電 推薦", ["commercial", "transactional"]],
    ["筆電推薦 ptt", ["commercial"]],
    ["iPhone 16 vs Pixel 9", ["commercial"]],
    ["無線耳機 評價 dcard", ["commercial"]],
    ["dyson 吸塵器 多少錢", ["transactional"]],
    ["momo 折扣碼", ["transactional"]],
    ["空氣清淨機 哪裡買", ["transactional"]],
    ["中華電信 官網", ["navigational"]],
    ["蝦皮 登入", ["navigational", "transactional"]],
    ["台灣大哥大 客服", ["navigational"]],
  ];
  for (const [q, want] of cases) {
    it(`${q} → ${want.join(" | ")}`, () => {
      expect(want).toContain(classifyIntent(q));
    });
  }

  it("keeps English behaviour", () => {
    expect(classifyIntent("how to write a blog")).toBe("informational");
    expect(classifyIntent("best laptop 2026")).toBe("commercial");
    expect(classifyIntent("buy running shoes")).toBe("transactional");
    expect(classifyIntent("facebook login")).toBe("navigational");
  });

  it("treats marketplace names as shopping unless the query is navigational", () => {
    expect(classifyIntent("蝦皮 藍牙耳機")).toBe("transactional");
    expect(classifyIntent("蝦皮 官網 登入")).toBe("navigational");
    expect(classifyIntent("momo 客服")).toBe("navigational");
  });

  it("returns null when there is no Chinese signal", () => {
    expect(classifyZhIntent("筆電")).toBeNull();
    expect(classifyZhIntent("running shoes")).toBeNull();
  });

  it("does not match ASCII tokens inside words", () => {
    expect(classifyZhIntent("canvas 畫布")).toBeNull();
  });
});
