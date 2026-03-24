<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import { useToastStore } from "../../stores/toast.js";

const { t } = useI18n();
const router = useRouter();
const productsStore = useProductsStore();
const toastStore = useToastStore();

const confirmDeleteProduct = ref(null);

onMounted(() => {
  productsStore.fetchProducts({});
});

function formatDate(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ");
}

async function handleTogglePublish(product) {
  try {
    await productsStore.togglePublish(product.id, !product.is_published);
    toastStore.add(
      product.is_published ? t("admin.unpublishSuccess") : t("admin.publishSuccess"),
      "success"
    );
  } catch {
    toastStore.add(t("admin.publishError"), "error");
  }
}

function requestDelete(product) {
  confirmDeleteProduct.value = product;
}

function cancelDelete() {
  confirmDeleteProduct.value = null;
}

async function confirmDelete() {
  const product = confirmDeleteProduct.value;
  try {
    await productsStore.deleteProduct(product.id);
    confirmDeleteProduct.value = null;
    toastStore.add(t("admin.deleteSuccess"), "success");
  } catch (e) {
    toastStore.add(e.message || t("admin.deleteError"), "error");
  }
}
</script>

<template>
  <div class="admin-product-list">
    <div class="admin-product-list__header">
      <h1>{{ $t("admin.productList") }}</h1>
      <button class="btn-primary" @click="router.push('/admin/products/new')">
        {{ $t("admin.addProduct") }}
      </button>
    </div>

    <p v-if="productsStore.loading" class="loading-text">Loading...</p>
    <p v-else-if="productsStore.error" class="error-text">
      {{ productsStore.error }}
    </p>

    <div v-if="productsStore.products.length > 0" class="table-wrap">
      <table class="product-table">
        <thead>
          <tr>
            <th class="th-thumb"></th>
            <th>{{ $t("product.name") }}</th>
            <th>{{ $t("admin.lastUpdated") }}</th>
            <th>{{ $t("admin.status") }}</th>
            <th>{{ $t("admin.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in productsStore.products"
            :key="product.id"
          >
            <td class="td-thumb">
              <img
                v-if="product.cover_image_url"
                :src="product.cover_image_url"
                :alt="product.name_zh"
                class="product-thumb"
              />
              <div v-else class="product-thumb-placeholder" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            </td>
            <td>{{ product.name_zh }}</td>
            <td>{{ formatDate(product.updated_at) }}</td>
            <td>
              <span :class="product.is_published ? 'badge-published' : 'badge-draft'">
                {{ product.is_published ? $t("admin.published") : $t("admin.draft") }}
              </span>
            </td>
            <td class="actions-cell">
              <button
                class="btn-sm btn-outline"
                @click="handleTogglePublish(product)"
              >
                {{ product.is_published ? $t("admin.unpublish") : $t("admin.publish") }}
              </button>
              <button
                class="btn-sm btn-edit"
                :aria-label="`${$t('admin.editProduct')} ${product.name_zh}`"
                @click="router.push(`/admin/products/${product.id}/edit`)"
              >
                {{ $t("admin.editProduct") }}
              </button>
              <button
                class="btn-sm btn-danger"
                :aria-label="`${$t('admin.delete')} ${product.name_zh}`"
                @click="requestDelete(product)"
              >
                {{ $t("admin.delete") }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="confirmDeleteProduct"
        class="modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title'">
          <h2 id="modal-title" class="modal__title">
            {{ $t("admin.confirmDelete") }}
          </h2>
          <p class="modal__body">
            {{ confirmDeleteProduct.name_zh }}
          </p>
          <div class="modal__actions">
            <button class="btn-secondary" @click="cancelDelete">
              {{ $t("admin.cancel") }}
            </button>
            <button class="btn-danger" @click="confirmDelete">
              {{ $t("admin.delete") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-product-list {
  max-width: 1100px;
}

.admin-product-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.admin-product-list__header h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
}

.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  font-size: var(--font-size-sm);
}

.product-table thead tr {
  background: var(--color-primary);
  color: #fff;
}

.product-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
}

.product-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.product-table tbody tr:hover {
  background: rgba(0, 0, 0, 0.02);
}

.th-thumb {
  width: 64px;
}

.td-thumb {
  width: 64px;
  padding: 0.5rem;
}

.product-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.product-thumb-placeholder {
  width: 48px;
  height: 48px;
  background: #f1f5f9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.product-table tbody tr:last-child td {
  border-bottom: none;
}

.badge-published {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: #dcfce7;
  color: #16a34a;
}

.badge-draft {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--color-cta);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-cta-hover);
}

.btn-sm {
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: 500;
  transition: background var(--transition-fast), color var(--transition-fast);
  border: 1px solid;
}

.btn-outline {
  border-color: var(--color-border-hover);
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-outline:hover {
  background: var(--color-border);
}

.btn-edit {
  border-color: var(--color-cta);
  background: transparent;
  color: var(--color-cta);
}

.btn-edit:hover {
  background: var(--color-cta);
  color: #fff;
}

.btn-danger {
  border-color: var(--color-danger);
  background: transparent;
  color: var(--color-danger);
}

.btn-danger:hover {
  background: var(--color-danger);
  color: #fff;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border-hover);
  color: var(--color-text-secondary);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-base);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.btn-secondary:hover {
  background: var(--color-border);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 1.5rem 2rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-modal);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.modal__body {
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.loading-text,
.error-text {
  padding: 1rem 0;
  color: var(--color-text-secondary);
}

.error-text {
  color: var(--color-danger);
}
</style>
