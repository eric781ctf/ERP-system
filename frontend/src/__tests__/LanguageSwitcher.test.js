/**
 * Task 7.2 — LanguageSwitcher 元件測試
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

const messages = {
  "zh-TW": { nav: { catalog: "型錄", langZhTW: "繁體中文", langEn: "English" } },
  en: { nav: { catalog: "Catalog", langZhTW: "繁體中文", langEn: "English" } },
};

function makeI18n(locale = "zh-TW") {
  return createI18n({ legacy: false, locale, fallbackLocale: "zh-TW", messages });
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("LanguageSwitcher", () => {
  it("renders language buttons", () => {
    const i18n = makeI18n();
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    expect(wrapper.text()).toContain("繁體中文");
    expect(wrapper.text()).toContain("English");
  });

  it("clicking English switches locale to en", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    const enBtn = wrapper.findAll("button").find((b) => b.text() === "English");
    await enBtn.trigger("click");
    expect(i18n.global.locale.value).toBe("en");
  });

  it("clicking 繁體中文 switches locale to zh-TW", async () => {
    const i18n = makeI18n("en");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    const zhBtn = wrapper.findAll("button").find((b) => b.text() === "繁體中文");
    await zhBtn.trigger("click");
    expect(i18n.global.locale.value).toBe("zh-TW");
  });

  it("persists language choice to localStorage", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    const enBtn = wrapper.findAll("button").find((b) => b.text() === "English");
    await enBtn.trigger("click");
    expect(localStorage.getItem("locale")).toBe("en");
  });

  it("restores locale from localStorage on mount", () => {
    localStorage.setItem("locale", "en");
    const i18n = makeI18n("zh-TW");
    mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    expect(i18n.global.locale.value).toBe("en");
  });
});
