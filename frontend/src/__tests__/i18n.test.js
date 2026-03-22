/**
 * Task 7.1 — vue-i18n 語言包測試
 */
import { describe, it, expect } from "vitest";
import { createI18n } from "vue-i18n";
import zhTW from "../locales/zh-TW/product.json";
import en from "../locales/en/product.json";

describe("語言包結構", () => {
  it("zh-TW 語言包存在必要的 key", () => {
    expect(zhTW.nav).toBeDefined();
    expect(zhTW.catalog).toBeDefined();
    expect(zhTW.product).toBeDefined();
    expect(zhTW.admin).toBeDefined();
  });

  it("en 語言包存在必要的 key", () => {
    expect(en.nav).toBeDefined();
    expect(en.catalog).toBeDefined();
    expect(en.product).toBeDefined();
    expect(en.admin).toBeDefined();
  });

  it("zh-TW 與 en 語言包擁有相同的頂層 key", () => {
    expect(Object.keys(zhTW).sort()).toEqual(Object.keys(en).sort());
  });
});

describe("vue-i18n 初始化", () => {
  it("預設語言為 zh-TW", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "zh-TW",
      fallbackLocale: "zh-TW",
      messages: { "zh-TW": zhTW, en },
    });
    expect(i18n.global.locale.value).toBe("zh-TW");
  });

  it("切換至 en 後 t() 回傳英文", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "zh-TW",
      fallbackLocale: "zh-TW",
      messages: { "zh-TW": zhTW, en },
    });
    i18n.global.locale.value = "en";
    const result = i18n.global.t("nav.catalog");
    expect(result).toBe(en.nav.catalog);
  });

  it("缺少英文翻譯時 fallback 至 zh-TW", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "en",
      fallbackLocale: "zh-TW",
      messages: {
        "zh-TW": { nav: { catalog: "型錄" } },
        en: {},
      },
    });
    const result = i18n.global.t("nav.catalog");
    expect(result).toBe("型錄");
  });
});
