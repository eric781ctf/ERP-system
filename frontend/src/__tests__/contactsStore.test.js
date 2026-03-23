/**
 * Task 8.1 — useContactsStore 單元測試
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContactsStore } from "../stores/contacts.js";

vi.mock("../api/contacts.js", () => ({
  getContacts: vi.fn(),
  createContact: vi.fn(),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

import * as api from "../api/contacts.js";

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

describe("useContactsStore — 初始狀態", () => {
  it("初始 contacts 為空陣列，loading 為 false，error 為 null", () => {
    const store = useContactsStore();
    expect(store.contacts).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });
});

describe("useContactsStore — fetchContacts", () => {
  it("成功時更新 contacts state", async () => {
    api.getContacts.mockResolvedValue({ data: [{ id: 1, name: "客戶A", type: "customer" }] });
    const store = useContactsStore();
    await store.fetchContacts();
    expect(store.contacts).toEqual([{ id: 1, name: "客戶A", type: "customer" }]);
    expect(store.loading).toBe(false);
  });

  it("呼叫正確 API 端點並傳入 params", async () => {
    api.getContacts.mockResolvedValue({ data: [] });
    const store = useContactsStore();
    await store.fetchContacts({ type: "customer" });
    expect(api.getContacts).toHaveBeenCalledWith({ type: "customer" });
  });

  it("失敗時設定 error", async () => {
    api.getContacts.mockRejectedValue(new Error("載入失敗"));
    const store = useContactsStore();
    await store.fetchContacts();
    expect(store.error).toBe("載入失敗");
    expect(store.contacts).toEqual([]);
  });
});

describe("useContactsStore — createContact", () => {
  it("成功後 contacts 陣列新增一筆", async () => {
    const newContact = { id: 2, name: "新客戶", type: "customer" };
    api.createContact.mockResolvedValue({ data: newContact });
    const store = useContactsStore();
    store.contacts = [{ id: 1, name: "既有" }];
    await store.createContact({ name: "新客戶", type: "customer" });
    expect(store.contacts).toHaveLength(2);
    expect(store.contacts[1]).toEqual(newContact);
  });
});

describe("useContactsStore — updateContact", () => {
  it("成功後更新 contacts 陣列中對應的項目", async () => {
    const updated = { id: 1, name: "更新後", type: "supplier" };
    api.updateContact.mockResolvedValue({ data: updated });
    const store = useContactsStore();
    store.contacts = [{ id: 1, name: "原始", type: "customer" }];
    await store.updateContact(1, { name: "更新後", type: "supplier" });
    expect(store.contacts[0]).toEqual(updated);
  });
});

describe("useContactsStore — deleteContact", () => {
  it("成功後 contacts 陣列移除對應筆", async () => {
    api.deleteContact.mockResolvedValue({ success: true });
    const store = useContactsStore();
    store.contacts = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    await store.deleteContact(1);
    expect(store.contacts).toEqual([{ id: 2, name: "B" }]);
  });
});

describe("useContactsStore — computed", () => {
  it("customers 只回傳 type === customer 的聯絡人", () => {
    const store = useContactsStore();
    store.contacts = [
      { id: 1, name: "客戶A", type: "customer" },
      { id: 2, name: "供應商B", type: "supplier" },
      { id: 3, name: "未分類", type: null },
    ];
    expect(store.customers).toEqual([{ id: 1, name: "客戶A", type: "customer" }]);
  });

  it("suppliers 只回傳 type === supplier 的聯絡人", () => {
    const store = useContactsStore();
    store.contacts = [
      { id: 1, name: "客戶A", type: "customer" },
      { id: 2, name: "供應商B", type: "supplier" },
    ];
    expect(store.suppliers).toEqual([{ id: 2, name: "供應商B", type: "supplier" }]);
  });
});
