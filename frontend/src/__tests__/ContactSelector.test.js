/**
 * Task 8.2 — ContactSelector 元件測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTWContacts from "../locales/zh-TW/contacts.json";
import enContacts from "../locales/en/contacts.json";

vi.mock("../api/contacts.js", () => ({
  getContacts: vi.fn(),
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

import * as contactsApi from "../api/contacts.js";
import ContactSelector from "../components/ContactSelector.vue";

const allContacts = [
  { id: 1, name: "客戶A", type: "customer" },
  { id: 2, name: "供應商B", type: "supplier" },
  { id: 3, name: "未分類C", type: null },
];

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
});

describe("ContactSelector — type='customer'", () => {
  it("僅顯示 customer 類型選項", async () => {
    contactsApi.getContacts.mockResolvedValue({ data: allContacts });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ContactSelector, {
      props: { type: "customer", modelValue: null },
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const options = wrapper.findAll("option[data-testid='contact-option']");
    expect(options).toHaveLength(1);
    expect(options[0].text()).toContain("客戶A");
  });
});

describe("ContactSelector — type='supplier'", () => {
  it("僅顯示 supplier 類型選項", async () => {
    contactsApi.getContacts.mockResolvedValue({ data: allContacts });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ContactSelector, {
      props: { type: "supplier", modelValue: null },
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const options = wrapper.findAll("option[data-testid='contact-option']");
    expect(options).toHaveLength(1);
    expect(options[0].text()).toContain("供應商B");
  });
});

describe("ContactSelector — 無 type prop", () => {
  it("顯示全部聯絡人選項", async () => {
    contactsApi.getContacts.mockResolvedValue({ data: allContacts });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ContactSelector, {
      props: { modelValue: null },
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const options = wrapper.findAll("option[data-testid='contact-option']");
    expect(options).toHaveLength(3);
  });
});

describe("ContactSelector — v-model", () => {
  it("選擇選項後觸發 update:modelValue emit 並帶入對應 id", async () => {
    contactsApi.getContacts.mockResolvedValue({ data: allContacts });
    const { pinia, i18n } = makePlugins();
    setActivePinia(pinia);

    const wrapper = mount(ContactSelector, {
      props: { modelValue: null },
      global: { plugins: [pinia, i18n] },
    });
    await flushPromises();

    const select = wrapper.find("select");
    await select.setValue("1");

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toBe(1);
  });
});
