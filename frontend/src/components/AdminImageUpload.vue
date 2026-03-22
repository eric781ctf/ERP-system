<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../stores/products.js";
import * as productsApi from "../api/products.js";

const props = defineProps({
  productId: { type: [Number, String], required: true },
});

const { t } = useI18n();
const productsStore = useProductsStore();

const uploadError = ref(null);
const deleteError = ref(null);

const images = computed(() => {
  const imgs = productsStore.currentProduct?.images;
  if (!imgs) return [];
  return [...imgs].sort((a, b) => a.sort_order - b.sort_order);
});

async function handleFileChange(e) {
  uploadError.value = null;
  const file = e.target.files?.[0];
  if (!file) return;

  if (!["image/jpeg", "image/png"].includes(file.type)) {
    uploadError.value = t("admin.invalidFormat");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = t("admin.fileTooLarge");
    return;
  }
  if (images.value.length >= 6) {
    uploadError.value = t("admin.maxImagesReached");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    await productsApi.uploadImage(props.productId, formData);
    await productsStore.refreshCurrentProduct();
    // Reset file input
    e.target.value = "";
  } catch (err) {
    uploadError.value = err.message || t("admin.uploadError");
  }
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
    // silent — non-critical
  }
}

async function handleDelete(imageId) {
  deleteError.value = null;
  try {
    await productsApi.deleteImage(props.productId, imageId);
    await productsStore.refreshCurrentProduct();
  } catch (err) {
    deleteError.value = err.message || t("admin.deleteError");
  }
}
</script>

<template>
  <div class="admin-image-upload">
    <h3>{{ $t("product.images") }}</h3>
    <p class="hint">{{ $t("admin.maxImages") }}</p>

    <!-- Image list -->
    <div v-if="images.length > 0" class="image-list">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
      >
        <img :src="image.url" :alt="`image-${image.sort_order}`" />

        <!-- Reorder controls -->
        <button
          v-if="index > 0"
          type="button"
          class="move-up-btn"
          @click="handleReorder('up', index)"
        >
          ↑
        </button>
        <button
          v-if="index < images.length - 1"
          type="button"
          class="move-down-btn"
          @click="handleReorder('down', index)"
        >
          ↓
        </button>

        <!-- Delete -->
        <button
          type="button"
          class="delete-image-btn"
          @click="handleDelete(image.id)"
        >
          {{ $t("admin.delete") }}
        </button>
      </div>
    </div>

    <!-- Upload -->
    <div class="upload-section">
      <label>
        {{ $t("admin.uploadImage") }}
        <input
          type="file"
          accept="image/jpeg,image/png"
          @change="handleFileChange"
        />
      </label>
    </div>

    <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
    <p v-if="deleteError" class="delete-error">{{ deleteError }}</p>
  </div>
</template>
