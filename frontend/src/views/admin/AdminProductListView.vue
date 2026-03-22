<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";

const { t } = useI18n();
const router = useRouter();
const productsStore = useProductsStore();

const confirmDeleteId = ref(null);
const deleteError = ref(null);

onMounted(() => {
  productsStore.fetchProducts({});
});

function formatDate(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ");
}

async function handleTogglePublish(product) {
  await productsStore.togglePublish(product.id, !product.is_published);
}

function requestDelete(id) {
  confirmDeleteId.value = id;
  deleteError.value = null;
}

function cancelDelete() {
  confirmDeleteId.value = null;
  deleteError.value = null;
}

async function confirmDelete() {
  const id = confirmDeleteId.value;
  try {
    await productsStore.deleteProduct(id);
    confirmDeleteId.value = null;
  } catch (e) {
    deleteError.value = e.message || t("admin.deleteError");
  }
}
</script>

<template>
  <div class="admin-product-list">
    <h1>{{ $t("admin.productList") }}</h1>
    <button @click="router.push('/admin/products/new')">
      {{ $t("admin.addProduct") }}
    </button>

    <p v-if="productsStore.loading">Loading...</p>
    <p v-else-if="productsStore.error" class="error">
      {{ productsStore.error }}
    </p>

    <table v-if="productsStore.products.length > 0">
      <thead>
        <tr>
          <th>{{ $t("product.name") }}</th>
          <th>{{ $t("admin.lastUpdated") }}</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="product in productsStore.products"
          :key="product.id"
          :class="product.is_published ? 'status-published' : 'status-draft'"
        >
          <td>{{ product.name_zh }}</td>
          <td>{{ formatDate(product.updated_at) }}</td>
          <td>
            <span
              :class="
                product.is_published ? 'badge-published' : 'badge-draft'
              "
            >
              {{
                product.is_published
                  ? $t("admin.published")
                  : $t("admin.draft")
              }}
            </span>
          </td>
          <td>
            <button
              class="toggle-publish-btn"
              @click="handleTogglePublish(product)"
            >
              {{
                product.is_published
                  ? $t("admin.unpublish")
                  : $t("admin.publish")
              }}
            </button>
            <button class="delete-btn" @click="requestDelete(product.id)">
              {{ $t("admin.delete") }}
            </button>
            <button
              @click="router.push(`/admin/products/${product.id}/edit`)"
            >
              {{ $t("admin.editProduct") }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Delete confirmation dialog -->
    <div v-if="confirmDeleteId !== null" class="confirm-dialog">
      <p>{{ $t("admin.confirmDelete") }}</p>
      <p v-if="deleteError" class="error">{{ deleteError }}</p>
      <button class="confirm-delete-btn" @click="confirmDelete">
        {{ $t("admin.delete") }}
      </button>
      <button class="cancel-delete-btn" @click="cancelDelete">
        {{ $t("admin.cancel") }}
      </button>
    </div>
  </div>
</template>
