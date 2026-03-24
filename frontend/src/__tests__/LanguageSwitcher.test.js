/**
 * LanguageSwitcher 元件測試（重構後：globe 圖示 + dropdown）
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import LanguageSwitcher from "../components/LanguageSwitcher.vue";

const messages = {
  "zh-TW": {
    nav: { catalog: "型錄", langZhTW: "繁體中文", langEn: "English" },
    layout: {
      nav: {
        langSwitcher: { label: "切換語言" },
        langZhTW: "繁體中文",
        langEn: "English",
      },
    },
  },
  en: {
    nav: { catalog: "Catalog", langZhTW: "繁體中文", langEn: "English" },
    layout: {
      nav: {
        langSwitcher: { label: "Switch language" },
        langZhTW: "繁體中文",
        langEn: "English",
      },
    },
  },
};

function makeI18n(locale = "zh-TW") {
  return createI18n({ legacy: false, locale, fallbackLocale: "zh-TW", messages });
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("LanguageSwitcher", () => {
  it("renders globe button with aria-label", () => {
    const i18n = makeI18n();
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    const btn = wrapper.find("button.lang-switcher__btn");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("aria-label")).toBe("切換語言");
  });

  it("dropdown is hidden initially", () => {
    const i18n = makeI18n();
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    expect(wrapper.find(".lang-switcher__dropdown").exists()).toBe(false);
  });

  it("clicking globe button opens dropdown showing both language options", async () => {
    const i18n = makeI18n();
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    expect(wrapper.find(".lang-switcher__dropdown").exists()).toBe(true);
    expect(wrapper.text()).toContain("繁體中文");
    expect(wrapper.text()).toContain("English");
  });

  it("clicking English option switches locale to en and closes dropdown", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    // Open dropdown
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    // Click English option
    const options = wrapper.findAll('[role="menuitem"]');
    const enBtn = options.find((b) => b.text().includes("English"));
    await enBtn.trigger("click");
    expect(i18n.global.locale.value).toBe("en");
    expect(wrapper.find(".lang-switcher__dropdown").exists()).toBe(false);
  });

  it("clicking 繁體中文 option switches locale to zh-TW", async () => {
    const i18n = makeI18n("en");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    const options = wrapper.findAll('[role="menuitem"]');
    const zhBtn = options.find((b) => b.text().includes("繁體中文"));
    await zhBtn.trigger("click");
    expect(i18n.global.locale.value).toBe("zh-TW");
  });

  it("persists language choice to localStorage", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    const options = wrapper.findAll('[role="menuitem"]');
    const enBtn = options.find((b) => b.text().includes("English"));
    await enBtn.trigger("click");
    expect(localStorage.getItem("locale")).toBe("en");
  });

  it("restores locale from localStorage on mount", () => {
    localStorage.setItem("locale", "en");
    const i18n = makeI18n("zh-TW");
    mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    expect(i18n.global.locale.value).toBe("en");
  });

  it("active locale option has aria-hidden check mark", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    const activeOption = wrapper.find(".lang-switcher__option--active");
    expect(activeOption.exists()).toBe(true);
    expect(activeOption.text()).toContain("繁體中文");
  });

  it("pressing Escape key closes the dropdown", async () => {
    const i18n = makeI18n("zh-TW");
    const wrapper = mount(LanguageSwitcher, { global: { plugins: [i18n] } });
    await wrapper.find("button.lang-switcher__btn").trigger("click");
    expect(wrapper.find(".lang-switcher__dropdown").exists()).toBe(true);
    await wrapper.find(".lang-switcher").trigger("keydown", { key: "Escape" });
    expect(wrapper.find(".lang-switcher__dropdown").exists()).toBe(false);
  });
});
