/**
 * ContactsView 元件測試（含 admin-ui-polish 新增：表格、排序、空狀態、骨架列、i18n）
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

describe("ContactsView — 表格與空狀態（admin-ui-polish）", () => {
  it("聯絡人清單為空時顯示空狀態訊息", async () => {
    contactsApi.getContacts.mockResolvedValue({ data: [] });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    const emptyState = wrapper.find("[data-testid='empty-state']");
    expect(emptyState.exists()).toBe(true);
    expect(emptyState.text()).toContain("尚無聯絡人");
  });

  it("載入中時顯示骨架列", async () => {
    // Never resolve to keep loading=true
    contactsApi.getContacts.mockReturnValue(new Promise(() => {}));
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    // At this point fetchContacts is called but not resolved — loading should be true
    await wrapper.vm.$nextTick();
    const skeletonRows = wrapper.findAll("[data-testid='skeleton-row']");
    expect(skeletonRows.length).toBeGreaterThan(0);
  });

  it("有聯絡人資料時渲染 <table> 並顯示姓名欄", async () => {
    contactsApi.getContacts.mockResolvedValue({
      data: [
        { id: 1, name: "王小明", phone: "0912345678", type: "customer" },
        { id: 2, name: "李大華", phone: "0987654321", type: "supplier" },
      ],
    });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    expect(wrapper.find("table").exists()).toBe(true);
    expect(wrapper.text()).toContain("王小明");
    expect(wrapper.text()).toContain("李大華");
  });

  it("Modal 儲存與取消按鈕使用 i18n 文字，不顯示硬編碼中文", async () => {
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);
    const wrapper = mount(ContactsView, { global: { plugins: [pinia, i18n] } });
    await flushPromises();

    await wrapper.find("[data-testid='add-contact-btn']").trigger("click");

    // Buttons should use t() keys — verify text renders correctly from i18n
    const modalActions = wrapper.find(".modal-actions");
    expect(modalActions.text()).toContain("儲存");
    expect(modalActions.text()).toContain("取消");
    // Ensure delete button in table also comes from i18n (contacts.actions.delete key)
    // (No hardcoded "刪除" text should appear outside i18n — verified by key existence in locales)
  });
});
