<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import { useTagsStore } from "../../stores/tags.js";
import { useToastStore } from "../../stores/toast.js";
import AdminImageUpload from "../../components/AdminImageUpload.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const tagsStore = useTagsStore();
const toastStore = useToastStore();

const isEdit = computed(() => !!route.params.id);
const activeTab = ref("zh-TW");
const saving = ref(false);

const form = reactive({
  name_zh: "",
  name_en: "",
  description_zh: "",
  description_en: "",
  composition: "",
  yarn_count: "",
  density: "",
  weight_gsm: "",
  width: "",
  weave_structure: "",
  tags: [],
});

const nameZhError = ref(false);
const compositionError = ref(false);
const updatedAt = ref(null);
const tagInput = ref("");

onMounted(async () => {
  await tagsStore.fetchTags();
  if (isEdit.value) {
    await productsStore.fetchProduct(route.params.id);
    const p = productsStore.currentProduct;
    if (p) {
      form.name_zh = p.name_zh || "";
      form.name_en = p.name_en || "";
      form.description_zh = p.description_zh || "";
      form.description_en = p.description_en || "";
      form.composition = p.composition || "";
      form.yarn_count = p.yarn_count || "";
      form.density = p.density || "";
      form.weight_gsm = p.weight_gsm ?? "";
      form.width = p.width || "";
      form.weave_structure = p.weave_structure || "";
      form.tags = p.tags ? [...p.tags] : [];
      updatedAt.value = p.updated_at;
    }
  }
});

function formatDate(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ");
}

function addTag(tag) {
  const normalized = tag.trim().toLowerCase();
  if (normalized && !form.tags.includes(normalized)) {
    form.tags = [...form.tags, normalized];
  }
}

function removeTag(tag) {
  form.tags = form.tags.filter((t) => t !== tag);
}

function handleTagKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addTag(tagInput.value);
    tagInput.value = "";
  }
}

async function handleSubmit() {
  nameZhError.value = false;
  compositionError.value = false;

  if (!form.name_zh.trim()) {
    nameZhError.value = true;
    return;
  }

  if (!form.composition.trim()) {
    compositionError.value = true;
    return;
  }

  const payload = {
    name_zh: form.name_zh,
    name_en: form.name_en,
    description_zh: form.description_zh,
    description_en: form.description_en,
    composition: form.composition,
    yarn_count: form.yarn_count,
    density: form.density,
    weight_gsm: form.weight_gsm === "" ? null : form.weight_gsm,
    width: form.width,
    weave_structure: form.weave_structure,
    tags: form.tags,
  };

  saving.value = true;
  try {
    if (isEdit.value) {
      await productsStore.updateProduct(route.params.id, payload);
      toastStore.add(t("admin.saveSuccess"), "success");
      router.push("/admin/products");
    } else {
      await productsStore.createProduct(payload);
      toastStore.add(t("admin.saveSuccess"), "success");
      router.push("/admin/products");
    }
  } catch (e) {
    toastStore.add(e.message || t("admin.saveError"), "error");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="admin-product-edit">
    <div class="admin-product-edit__header">
      <h1>{{ isEdit ? $t("admin.editProduct") : $t("admin.addProduct") }}</h1>
      <p v-if="isEdit && updatedAt" class="updated-at">
        {{ $t("admin.lastUpdated") }}: {{ formatDate(updatedAt) }}
      </p>
    </div>

    <form class="edit-form" @submit.prevent="handleSubmit">
      <div class="edit-layout">
        <!-- Left column: image management or placeholder -->
        <aside class="edit-layout__images">
          <AdminImageUpload v-if="isEdit" :productId="route.params.id" />
          <div v-else class="image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>{{ $t("admin.imagePlaceholderHint") }}</p>
          </div>
        </aside>

        <!-- Right column (or full width in create mode): form fields -->
        <div class="edit-layout__fields">
          <!-- Language tabs -->
          <div class="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab--active': activeTab === 'zh-TW' }"
              :aria-selected="activeTab === 'zh-TW'"
              @click="activeTab = 'zh-TW'"
            >
              {{ $t("admin.tabZhTW") }}
            </button>
            <button
              type="button"
              role="tab"
              class="tab"
              :class="{ 'tab--active': activeTab === 'en' }"
              :aria-selected="activeTab === 'en'"
              @click="activeTab = 'en'"
            >
              {{ $t("admin.tabEn") }}
            </button>
          </div>

          <div class="form-section">
            <!-- zh-TW fields -->
            <template v-if="activeTab === 'zh-TW'">
              <div class="form-field">
                <label for="name_zh">{{ $t("product.name") }} <span class="required-star">*</span></label>
                <input
                  id="name_zh"
                  v-model="form.name_zh"
                  name="name_zh"
                  type="text"
                  :class="{ 'input-error': nameZhError }"
                  @input="nameZhError = false"
                />
                <span v-if="nameZhError" class="field-error-msg">{{ $t("admin.required") }}</span>
              </div>
              <div class="form-field">
                <label for="description_zh">{{ $t("product.description") }}</label>
                <textarea id="description_zh" v-model="form.description_zh" name="description_zh" rows="4" />
              </div>
            </template>

            <!-- en fields -->
            <template v-if="activeTab === 'en'">
              <div class="form-field">
                <label for="name_en">{{ $t("product.name") }}</label>
                <input id="name_en" v-model="form.name_en" name="name_en" type="text" />
              </div>
              <div class="form-field">
                <label for="description_en">{{ $t("product.description") }}</label>
                <textarea id="description_en" v-model="form.description_en" name="description_en" rows="4" />
              </div>
            </template>
          </div>

          <!-- Specs section -->
          <div class="form-section">
            <div class="form-field" :class="{ 'form-field--error': compositionError }">
              <label for="composition">
                {{ $t("product.composition") }}
                <span class="required-badge">{{ $t("admin.required") }}</span>
              </label>
              <input id="composition" v-model="form.composition" name="composition" type="text" />
              <span v-if="compositionError" class="field-error" role="alert">
                {{ $t("admin.required") }}
              </span>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label for="yarn_count">{{ $t("product.yarnCount") }}</label>
                <input id="yarn_count" v-model="form.yarn_count" name="yarn_count" type="text" />
              </div>
              <div class="form-field">
                <label for="density">{{ $t("product.density") }}</label>
                <input id="density" v-model="form.density" name="density" type="text" />
              </div>
              <div class="form-field">
                <label for="weight_gsm">{{ $t("product.weightGsm") }}</label>
                <input id="weight_gsm" v-model="form.weight_gsm" name="weight_gsm" type="number" />
              </div>
              <div class="form-field">
                <label for="width">{{ $t("product.width") }}</label>
                <input id="width" v-model="form.width" name="width" type="text" />
              </div>
              <div class="form-field">
                <label for="weave_structure">{{ $t("product.weaveStructure") }}</label>
                <input id="weave_structure" v-model="form.weave_structure" name="weave_structure" type="text" />
              </div>
            </div>
          </div>

          <!-- Tag management -->
          <div class="form-section">
            <div class="form-field">
              <label>{{ $t("product.tags") }}</label>
              <div class="tag-options">
                <button
                  v-for="tag in tagsStore.tags"
                  :key="tag"
                  type="button"
                  class="tag-option"
                  :class="{ 'tag-option--selected': form.tags.includes(tag) }"
                  @click="form.tags.includes(tag) ? removeTag(tag) : addTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              <input
                v-model="tagInput"
                name="tag_input"
                type="text"
                :placeholder="'輸入新標籤後按 Enter'"
                class="tag-input"
                @keydown="handleTagKeydown"
              />
              <div v-if="form.tags.length" class="selected-tags">
                <span
                  v-for="tag in form.tags"
                  :key="tag"
                  class="selected-tag"
                >
                  {{ tag }}
                  <button type="button" class="remove-tag-btn" :aria-label="`移除標籤 ${tag}`" @click="removeTag(tag)">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn-save"
          :disabled="saving"
        >
          <span v-if="saving">{{ "儲存中..." }}</span>
          <span v-else>{{ $t("admin.save") }}</span>
        </button>
        <button type="button" class="btn-cancel" @click="router.push('/admin/products')">
          {{ $t("admin.cancel") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.admin-product-edit {
  max-width: 1100px;
}

.edit-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .edit-layout {
    grid-template-columns: 300px 1fr;
    align-items: start;
  }
}

.edit-layout__images {
  /* images panel stays at top on mobile, left on desktop */
}

.edit-layout__fields {
  min-width: 0;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-align: center;
  min-height: 160px;
}

.image-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.admin-product-edit__header {
  margin-bottom: 1.5rem;
}

.admin-product-edit__header h1 {
  font-size: var(--font-size-2xl);
  margin: 0 0 0.25rem;
}

.updated-at {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.tab {
  background: none;
  border: none;
  padding: 0.625rem 1.25rem;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.tab:hover {
  color: var(--color-text-primary);
}

.tab--active {
  color: var(--color-cta);
  font-weight: 600;
  border-bottom-color: var(--color-cta);
}

.form-section {
  padding-bottom: var(--space-6);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-field input,
.form-field textarea,
.form-field select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.12);
}

.form-field--error input {
  border-color: var(--color-danger);
}

.form-field--error input:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.required-star {
  color: var(--color-danger);
  font-weight: 700;
}

.input-error {
  border-color: var(--color-danger) !important;
}

.field-error-msg {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

.field-error {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  font-weight: 500;
}

.required-badge {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.tag-option {
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tag-option:hover {
  border-color: var(--color-cta);
  color: var(--color-cta);
}

.tag-option--selected {
  background: var(--color-cta);
  border-color: var(--color-cta);
  color: #fff;
}

.tag-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  width: 100%;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: var(--color-cta);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
}

.remove-tag-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  padding: 0;
  opacity: 0.8;
}

.remove-tag-btn:hover {
  opacity: 1;
}

.form-actions {
  position: sticky;
  bottom: var(--space-4);
  display: flex;
  gap: 0.75rem;
  padding-top: var(--space-6);
  background: linear-gradient(to bottom, transparent, var(--color-background) 50%);
}

.btn-save {
  background: var(--color-cta);
  color: #fff;
  border: none;
  padding: 0.625rem 1.5rem;
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
  min-width: 100px;
}

.btn-save:hover:not(:disabled) {
  background: var(--color-cta-hover);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border-hover);
  color: var(--color-text-secondary);
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-base);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-border);
}
</style>
