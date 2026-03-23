<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../stores/products.js";
import { useToastStore } from "../stores/toast.js";
import * as productsApi from "../api/products.js";

const props = defineProps({
  productId: { type: [Number, String], required: true },
});

const { t } = useI18n();
const productsStore = useProductsStore();
const toastStore = useToastStore();

const isDragOver = ref(false);
const uploading = ref(false);

const images = computed(() => {
  const imgs = productsStore.currentProduct?.images;
  if (!imgs) return [];
  return [...imgs].sort((a, b) => a.sort_order - b.sort_order);
});

function validateFile(file) {
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    toastStore.add(t("admin.invalidFormat"), "error");
    return false;
  }
  if (file.size > 5 * 1024 * 1024) {
    toastStore.add(t("admin.fileTooLarge"), "error");
    return false;
  }
  if (images.value.length >= 6) {
    toastStore.add(t("admin.maxImagesReached"), "error");
    return false;
  }
  return true;
}

async function uploadFile(file) {
  if (!validateFile(file)) return;
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    await productsApi.uploadImage(props.productId, formData);
    await productsStore.refreshCurrentProduct();
  } catch (err) {
    toastStore.add(err.message || t("admin.uploadError"), "error");
  } finally {
    uploading.value = false;
  }
}

async function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  await uploadFile(file);
  e.target.value = "";
}

function onDragEnter(e) {
  e.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDragOver(e) {
  e.preventDefault();
}

async function onDrop(e) {
  e.preventDefault();
  isDragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) await uploadFile(file);
}

async function handleReorder(direction, index) {
  const sorted = [...images.value];
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  [sorted[index], sorted[swapIndex]] = [sorted[swapIndex], sorted[index]];
  const order = sorted.map((img) => img.id);
  try {
    await productsApi.reorderImages(props.productId, order);
    await productsStore.refreshCurrentProduct();
  } catch {
    // silent
  }
}

async function handleDelete(imageId) {
  try {
    await productsApi.deleteImage(props.productId, imageId);
    await productsStore.refreshCurrentProduct();
  } catch (err) {
    toastStore.add(err.message || t("admin.deleteError"), "error");
  }
}
</script>

<template>
  <div class="image-upload">
    <div class="image-upload__header">
      <h3>{{ $t("product.images") }}</h3>
      <span class="image-upload__count">{{ images.length }} / 6</span>
    </div>
    <p class="image-upload__hint">{{ $t("admin.maxImages") }}</p>

    <!-- Thumbnail grid -->
    <div v-if="images.length > 0" class="image-upload__grid">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-thumb"
      >
        <img :src="image.url" :alt="`圖片 ${index + 1}`" />

        <div class="image-thumb__actions">
          <button
            v-if="index > 0"
            type="button"
            class="thumb-btn"
            aria-label="上移"
            @click="handleReorder('up', index)"
          >
            ↑
          </button>
          <button
            v-if="index < images.length - 1"
            type="button"
            class="thumb-btn"
            aria-label="下移"
            @click="handleReorder('down', index)"
          >
            ↓
          </button>
          <button
            type="button"
            class="thumb-btn thumb-btn--delete"
            aria-label="刪除圖片"
            @click="handleDelete(image.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Drop zone -->
    <label
      class="image-upload__dropzone"
      :class="{ 'image-upload__dropzone--drag': isDragOver, 'image-upload__dropzone--disabled': images.length >= 6 }"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
    >
      <span v-if="uploading" class="image-upload__spinner" aria-hidden="true">⏳</span>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span class="image-upload__label">
        {{ uploading ? "上傳中..." : $t("admin.uploadImage") }}
      </span>
      <input
        type="file"
        accept="image/jpeg,image/png"
        :disabled="images.length >= 6 || uploading"
        class="image-upload__input"
        @change="handleFileChange"
      />
    </label>
  </div>
</template>

<style scoped>
.image-upload {
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.image-upload__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.image-upload__header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
}

.image-upload__count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.image-upload__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 1rem;
}

.image-upload__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.image-thumb {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-base);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-thumb__actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.image-thumb:hover .image-thumb__actions {
  opacity: 1;
}

.thumb-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
  line-height: 1;
  transition: background var(--transition-fast);
}

.thumb-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.thumb-btn--delete {
  border-color: rgba(220, 38, 38, 0.6);
  background: rgba(220, 38, 38, 0.3);
}

.thumb-btn--delete:hover {
  background: rgba(220, 38, 38, 0.6);
}

.image-upload__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base);
  color: var(--color-text-secondary);
}

.image-upload__dropzone:hover,
.image-upload__dropzone--drag {
  border-color: var(--color-cta);
  background: rgba(3, 105, 161, 0.04);
  color: var(--color-cta);
}

.image-upload__dropzone--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-upload__label {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.image-upload__input {
  display: none;
}

.image-upload__spinner {
  font-size: 1.5rem;
}
</style>
