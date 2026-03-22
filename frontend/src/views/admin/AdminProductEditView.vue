<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProductsStore } from "../../stores/products.js";
import { useTagsStore } from "../../stores/tags.js";
import AdminImageUpload from "../../components/AdminImageUpload.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const tagsStore = useTagsStore();

const isEdit = computed(() => !!route.params.id);
const activeTab = ref("zh-TW");

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

const compositionError = ref(false);
const saveError = ref(null);
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
  compositionError.value = false;
  saveError.value = null;

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

  try {
    if (isEdit.value) {
      const updated = await productsStore.updateProduct(route.params.id, payload);
      updatedAt.value = updated.updated_at;
    } else {
      await productsStore.createProduct(payload);
      router.push("/admin/products");
    }
  } catch (e) {
    saveError.value = e.message || t("admin.saveError");
  }
}
</script>

<template>
  <div class="admin-product-edit">
    <h1>{{ isEdit ? $t("admin.editProduct") : $t("admin.addProduct") }}</h1>

    <p v-if="isEdit && updatedAt" class="updated-at">
      {{ $t("admin.lastUpdated") }}: {{ formatDate(updatedAt) }}
    </p>

    <form @submit.prevent="handleSubmit">
      <!-- Language tabs -->
      <div class="tabs">
        <button
          type="button"
          class="tab-zh-TW"
          :class="{ active: activeTab === 'zh-TW' }"
          @click="activeTab = 'zh-TW'"
        >
          {{ $t("admin.tabZhTW") }}
        </button>
        <button
          type="button"
          class="tab-en"
          :class="{ active: activeTab === 'en' }"
          @click="activeTab = 'en'"
        >
          {{ $t("admin.tabEn") }}
        </button>
      </div>

      <!-- zh-TW fields -->
      <template v-if="activeTab === 'zh-TW'">
        <div>
          <label>{{ $t("product.name") }}</label>
          <input v-model="form.name_zh" name="name_zh" type="text" />
        </div>
        <div>
          <label>{{ $t("product.description") }}</label>
          <textarea v-model="form.description_zh" name="description_zh" />
        </div>
      </template>

      <!-- en fields -->
      <template v-if="activeTab === 'en'">
        <div>
          <label>Product Name</label>
          <input v-model="form.name_en" name="name_en" type="text" />
        </div>
        <div>
          <label>Description</label>
          <textarea v-model="form.description_en" name="description_en" />
        </div>
      </template>

      <!-- Composition (required, always visible) -->
      <div>
        <label>
          {{ $t("product.composition") }}
          <span class="required">{{ $t("admin.required") }}</span>
        </label>
        <input v-model="form.composition" name="composition" type="text" />
        <span v-if="compositionError" class="composition-error">
          {{ $t("admin.required") }}
        </span>
      </div>

      <!-- Optional spec fields -->
      <div>
        <label>{{ $t("product.yarnCount") }}</label>
        <input v-model="form.yarn_count" name="yarn_count" type="text" />
      </div>
      <div>
        <label>{{ $t("product.density") }}</label>
        <input v-model="form.density" name="density" type="text" />
      </div>
      <div>
        <label>{{ $t("product.weightGsm") }}</label>
        <input v-model="form.weight_gsm" name="weight_gsm" type="number" />
      </div>
      <div>
        <label>{{ $t("product.width") }}</label>
        <input v-model="form.width" name="width" type="text" />
      </div>
      <div>
        <label>{{ $t("product.weaveStructure") }}</label>
        <input v-model="form.weave_structure" name="weave_structure" type="text" />
      </div>

      <!-- Tag management -->
      <div class="tag-section">
        <label>{{ $t("product.tags") }}</label>

        <!-- Existing tags for selection -->
        <div class="tag-options">
          <button
            v-for="tag in tagsStore.tags"
            :key="tag"
            type="button"
            class="tag-option"
            :class="{ selected: form.tags.includes(tag) }"
            @click="form.tags.includes(tag) ? removeTag(tag) : addTag(tag)"
          >
            {{ tag }}
          </button>
        </div>

        <!-- New tag input -->
        <input
          v-model="tagInput"
          name="tag_input"
          type="text"
          placeholder="輸入新標籤後按 Enter"
          @keydown="handleTagKeydown"
        />

        <!-- Selected tags -->
        <div class="selected-tags">
          <span
            v-for="tag in form.tags"
            :key="tag"
            class="selected-tag"
          >
            {{ tag }}
            <button type="button" class="remove-tag-btn" @click="removeTag(tag)">
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- Image management (edit mode only) -->
      <AdminImageUpload v-if="isEdit" :productId="route.params.id" />

      <p v-if="saveError" class="error">{{ saveError }}</p>

      <div class="form-actions">
        <button type="submit">{{ $t("admin.save") }}</button>
        <button type="button" @click="router.push('/admin/products')">
          {{ $t("admin.cancel") }}
        </button>
      </div>
    </form>
  </div>
</template>
