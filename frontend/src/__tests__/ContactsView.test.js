/**
 * Task 8.3 — ContactsView 元件測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTWContacts from "../locales/zh-TW/contacts.json";
import enContacts from "../locales/en/contacts.json";

vi.mock("../api/contacts.js", () => ({
  getContacts: vi.fn().mockResolvedValue({ data: [] }),
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

import * as contactsApi from "../api/contacts.js";
import ContactsView from "../views/admin/ContactsView.vue";

function makePlugins() {
  const pinia = createPinia();
  const i18n = createI18n({
    legacy: false,
    locale: "zh-TW",
    fallbackLocale: "zh-TW",
    messages: { "zh-TW": zhTWContacts, en: enContacts },
  });
  return { pinia, i18n };
}

beforeEach(() => {
  vi.clearAllMocks();
  contactsApi.getContacts.mockResolvedValue({ data: [] });
});

describe("ContactsView — 篩選 tab 切換", () => {
  it("點擊「客戶」tab 後 fetchContacts 帶入 type='customer'", async () => {
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    const tabs = wrapper.findAll("[data-testid='filter-tab']");
    const customerTab = tabs.find((t) => t.text().includes("客戶"));
    await customerTab.trigger("click");
    await flushPromises();

    expect(contactsApi.getContacts).toHaveBeenCalledWith({ type: "customer" });
  });

  it("點擊「全部」tab 後 fetchContacts 不帶 type 參數", async () => {
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    const tabs = wrapper.findAll("[data-testid='filter-tab']");
    const allTab = tabs.find((t) => t.text().includes("全部"));
    await allTab.trigger("click");
    await flushPromises();

    expect(contactsApi.getContacts).toHaveBeenCalledWith({});
  });
});

describe("ContactsView — Email checkbox 行為", () => {
  it("勾選 Email checkbox 時顯示 email 輸入欄位", async () => {
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    // 開啟新增 Modal
    await wrapper.find("[data-testid='add-contact-btn']").trigger("click");

    // 找到 Email checkbox 並勾選
    const emailCheckbox = wrapper.find("[data-testid='method-email']");
    await emailCheckbox.setValue(true);

    expect(wrapper.find("[data-testid='email-input']").exists()).toBe(true);
  });

  it("取消勾選 Email checkbox 時隱藏 email 輸入欄位", async () => {
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    await wrapper.find("[data-testid='add-contact-btn']").trigger("click");

    const emailCheckbox = wrapper.find("[data-testid='method-email']");
    await emailCheckbox.setValue(true);
    expect(wrapper.find("[data-testid='email-input']").exists()).toBe(true);

    await emailCheckbox.setValue(false);
    expect(wrapper.find("[data-testid='email-input']").exists()).toBe(false);
  });
});
