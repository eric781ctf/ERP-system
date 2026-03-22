/**
 * Task 12.1 / 12.2 / 12.3 — AdminImageUpload 元件測試
 * 圖片上傳驗證、排序、刪除
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createI18n } from "vue-i18n";
import zhTW from "../locales/zh-TW/product.json";
import en from "../locales/en/product.json";

vi.mock("../api/products.js", () => ({
  fetchProducts: vi.fn().mockResolvedValue({ data: [] }),
  fetchProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  togglePublish: vi.fn(),
  uploadImage: vi.fn().mockResolvedValue({ data: { id: 10, url: "https://cdn/new.jpg", sort_order: 3 } }),
  deleteImage: vi.fn().mockResolvedValue({ success: true }),
  reorderImages: vi.fn().mockResolvedValue({ data: [] }),
}));

import * as productsApi from "../api/products.js";
import AdminImageUpload from "../components/AdminImageUpload.vue";
import { useProductsStore } from "../stores/products.js";

function makeI18n() {
  return createI18n({
    legacy: false,
    locale: "zh-TW",
    fallbackLocale: "zh-TW",
    messages: { "zh-TW": zhTW, en },
  });
}

const mockImages = [
  { id: 1, url: "https://cdn.example.com/1.jpg", sort_order: 0 },
  { id: 2, url: "https://cdn.example.com/2.jpg", sort_order: 1 },
  { id: 3, url: "https://cdn.example.com/3.jpg", sort_order: 2 },
];

function mountWithImages(images = mockImages) {
  const pinia = createPinia();
  setActivePinia(pinia);
  const i18n = makeI18n();

  const store = useProductsStore();
  store.currentProduct = { id: 1, images };

  const wrapper = mount(AdminImageUpload, {
    props: { productId: 1 },
    global: { plugins: [pinia, i18n] },
  });
  return { wrapper, store };
}

async function simulateFileChange(wrapper, { name, type, sizeBytes }) {
  const content = new Uint8Array(sizeBytes);
  const file = new File([content], name, { type });
  const input = wrapper.find('input[type="file"]');
  Object.defineProperty(input.element, "files", {
    value: [file],
    configurable: true,
  });
  await input.trigger("change");
  await flushPromises();
}

// ── Task 12.1 — 圖片上傳驗證 ──────────────────────────────────────────────────

describe("AdminImageUpload — Task 12.1 上傳驗證", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.uploadImage.mockResolvedValue({
      data: { id: 10, url: "https://cdn/new.jpg", sort_order: 3 },
    });
    productsApi.fetchProduct.mockResolvedValue({ data: { id: 1, images: mockImages } });
  });

  it("渲染 file input", () => {
    const { wrapper } = mountWithImages();
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it("拒絕 WebP 格式並顯示格式錯誤", async () => {
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, { name: "img.webp", type: "image/webp", sizeBytes: 100 });
    expect(productsApi.uploadImage).not.toHaveBeenCalled();
    expect(wrapper.find(".upload-error").text()).toContain("僅接受 JPG 或 PNG");
  });

  it("拒絕 PDF 格式並顯示格式錯誤", async () => {
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, { name: "doc.pdf", type: "application/pdf", sizeBytes: 100 });
    expect(productsApi.uploadImage).not.toHaveBeenCalled();
    expect(wrapper.find(".upload-error").exists()).toBe(true);
  });

  it("拒絕超過 5MB 的檔案並顯示大小錯誤", async () => {
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, {
      name: "big.jpg",
      type: "image/jpeg",
      sizeBytes: 5 * 1024 * 1024 + 1,
    });
    expect(productsApi.uploadImage).not.toHaveBeenCalled();
    expect(wrapper.find(".upload-error").text()).toContain("5MB");
  });

  it("已有 6 張圖片時拒絕上傳並顯示數量錯誤", async () => {
    const sixImages = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      url: `https://cdn/${i}.jpg`,
      sort_order: i,
    }));
    const { wrapper } = mountWithImages(sixImages);
    await simulateFileChange(wrapper, { name: "ok.jpg", type: "image/jpeg", sizeBytes: 100 });
    expect(productsApi.uploadImage).not.toHaveBeenCalled();
    expect(wrapper.find(".upload-error").text()).toContain("6");
  });

  it("有效 JPEG 檔案成功呼叫 uploadImage API", async () => {
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, { name: "photo.jpg", type: "image/jpeg", sizeBytes: 100 });
    expect(productsApi.uploadImage).toHaveBeenCalledWith(1, expect.any(FormData));
  });

  it("有效 PNG 檔案成功呼叫 uploadImage API", async () => {
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, { name: "photo.png", type: "image/png", sizeBytes: 200 });
    expect(productsApi.uploadImage).toHaveBeenCalledWith(1, expect.any(FormData));
  });

  it("上傳成功後呼叫 refreshCurrentProduct 更新圖片清單", async () => {
    const { wrapper, store } = mountWithImages();
    const spy = vi.spyOn(store, "refreshCurrentProduct").mockResolvedValue();
    await simulateFileChange(wrapper, { name: "photo.jpg", type: "image/jpeg", sizeBytes: 100 });
    expect(spy).toHaveBeenCalled();
  });

  it("上傳 API 失敗時顯示錯誤訊息", async () => {
    productsApi.uploadImage.mockRejectedValue(new Error("上傳失敗"));
    const { wrapper } = mountWithImages();
    await simulateFileChange(wrapper, { name: "photo.jpg", type: "image/jpeg", sizeBytes: 100 });
    expect(wrapper.find(".upload-error").text()).toContain("上傳失敗");
  });
});

// ── Task 12.2 — 圖片排序 ─────────────────────────────────────────────────────

describe("AdminImageUpload — Task 12.2 圖片排序", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.reorderImages.mockResolvedValue({ data: mockImages });
    productsApi.fetchProduct.mockResolvedValue({ data: { id: 1, images: mockImages } });
  });

  it("依 sort_order 顯示圖片列表", () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    expect(items.length).toBe(3);
  });

  it("第一張圖片沒有「上移」按鈕", () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    expect(items[0].find(".move-up-btn").exists()).toBe(false);
  });

  it("最後一張圖片沒有「下移」按鈕", () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    expect(items[2].find(".move-down-btn").exists()).toBe(false);
  });

  it("非首尾圖片同時有上移與下移按鈕", () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    expect(items[1].find(".move-up-btn").exists()).toBe(true);
    expect(items[1].find(".move-down-btn").exists()).toBe(true);
  });

  it("點擊上移呼叫 reorderImages 並傳入正確新順序", async () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    // Move image at index 1 up → new order: [id2, id1, id3]
    await items[1].find(".move-up-btn").trigger("click");
    await flushPromises();
    expect(productsApi.reorderImages).toHaveBeenCalledWith(1, [2, 1, 3]);
  });

  it("點擊下移呼叫 reorderImages 並傳入正確新順序", async () => {
    const { wrapper } = mountWithImages();
    const items = wrapper.findAll(".image-item");
    // Move image at index 1 down → new order: [id1, id3, id2]
    await items[1].find(".move-down-btn").trigger("click");
    await flushPromises();
    expect(productsApi.reorderImages).toHaveBeenCalledWith(1, [1, 3, 2]);
  });

  it("排序後呼叫 refreshCurrentProduct", async () => {
    const { wrapper, store } = mountWithImages();
    const spy = vi.spyOn(store, "refreshCurrentProduct").mockResolvedValue();
    const items = wrapper.findAll(".image-item");
    await items[1].find(".move-up-btn").trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalled();
  });
});

// ── Task 12.3 — 圖片刪除 ─────────────────────────────────────────────────────

describe("AdminImageUpload — Task 12.3 圖片刪除", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsApi.deleteImage.mockResolvedValue({ success: true });
    productsApi.fetchProduct.mockResolvedValue({ data: { id: 1, images: mockImages } });
  });

  it("每張圖片顯示刪除按鈕", () => {
    const { wrapper } = mountWithImages();
    const deleteBtns = wrapper.findAll(".delete-image-btn");
    expect(deleteBtns.length).toBe(3);
  });

  it("點擊刪除呼叫 deleteImage 並帶入正確 imageId", async () => {
    const { wrapper } = mountWithImages();
    await wrapper.findAll(".delete-image-btn")[0].trigger("click");
    await flushPromises();
    expect(productsApi.deleteImage).toHaveBeenCalledWith(1, 1);
  });

  it("刪除成功後呼叫 refreshCurrentProduct", async () => {
    const { wrapper, store } = mountWithImages();
    const spy = vi.spyOn(store, "refreshCurrentProduct").mockResolvedValue();
    await wrapper.findAll(".delete-image-btn")[0].trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalled();
  });

  it("刪除 API 失敗時顯示錯誤訊息", async () => {
    productsApi.deleteImage.mockRejectedValue(new Error("刪除圖片失敗"));
    const { wrapper } = mountWithImages();
    await wrapper.findAll(".delete-image-btn")[0].trigger("click");
    await flushPromises();
    expect(wrapper.find(".delete-error").text()).toContain("刪除圖片失敗");
  });
});
