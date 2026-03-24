<template>
  <div class="banner-admin">
    <div class="banner-admin__header">
      <h1 class="banner-admin__title">{{ t("layout.nav.banners") }}</h1>
      <button class="btn btn--primary" @click="openAdd">+ {{ t("banner.add") }}</button>
    </div>

    <!-- List -->
    <div v-if="bannerStore.loading" class="banner-admin__loading">載入中…</div>

    <div v-else-if="bannerStore.banners.length === 0" class="banner-admin__empty">
      {{ t("banner.empty") }}
    </div>

    <ul v-else class="banner-list">
      <li
        v-for="banner in bannerStore.banners"
        :key="banner.id"
        class="banner-list__item"
        draggable="true"
        @dragstart="onDragStart(banner.id)"
        @dragover.prevent="onDragOver(banner.id)"
        @drop="onDrop"
      >
        <img :src="banner.image_url" :alt="banner.alt_text || ''" class="banner-list__thumb" />
        <div class="banner-list__info">
          <span class="banner-list__title">{{ banner.title || t("banner.untitled") }}</span>
          <span class="banner-list__order">順序 {{ banner.sort_order }}</span>
        </div>
        <div class="banner-list__actions">
          <label class="toggle">
            <input
              type="checkbox"
              :checked="banner.is_active"
              @change="handleToggle(banner)"
            />
            <span class="toggle__label">{{ banner.is_active ? t("banner.active") : t("banner.inactive") }}</span>
          </label>
          <button class="btn btn--sm btn--outline" @click="openEdit(banner)">{{ t("banner.edit") }}</button>
          <button class="btn btn--sm btn--danger" @click="confirmDelete(banner)">{{ t("banner.delete") }}</button>
        </div>
      </li>
    </ul>

    <!-- Modal: Add / Edit -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h2 class="modal__title">{{ editingId ? t("banner.edit") : t("banner.add") }}</h2>

          <div class="modal__field">
            <label>{{ t("banner.image") }} <span v-if="!editingId" class="required">*</span></label>
            <input
              ref="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png"
              @change="onFileChange"
            />
            <p v-if="fileError" class="modal__error">{{ fileError }}</p>
            <img v-if="previewUrl" :src="previewUrl" class="modal__preview" alt="preview" />
          </div>

          <div class="modal__field">
            <label>{{ t("banner.altText") }}</label>
            <input v-model="form.alt_text" type="text" class="modal__input" />
          </div>

          <div class="modal__field">
            <label>{{ t("banner.titleLabel") }}</label>
            <input v-model="form.title" type="text" class="modal__input" />
          </div>

          <div class="modal__field">
            <label>{{ t("banner.description") }}</label>
            <textarea v-model="form.description" class="modal__input modal__textarea" rows="2" />
          </div>

          <div class="modal__field">
            <label>{{ t("banner.linkUrl") }}</label>
            <input v-model="form.link_url" type="text" class="modal__input" placeholder="/products" />
          </div>

          <div class="modal__field modal__field--inline">
            <label>{{ t("banner.active") }}</label>
            <input v-model="form.is_active" type="checkbox" />
          </div>

          <p v-if="saveError" class="modal__error">{{ saveError }}</p>

          <div class="modal__footer">
            <button class="btn btn--outline" @click="closeModal">{{ t("banner.cancel") }}</button>
            <button class="btn btn--primary" :disabled="saving" @click="save">
              {{ saving ? t("banner.saving") : t("banner.save") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal modal--sm">
          <p>{{ t("banner.deleteConfirm") }}</p>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="deleteTarget = null">{{ t("banner.cancel") }}</button>
            <button class="btn btn--danger" @click="doDelete">{{ t("banner.delete") }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useBannerStore } from "../../stores/banner.js";
import { useToastStore } from "../../stores/toast.js";

const { t } = useI18n();
const bannerStore = useBannerStore();
const toastStore = useToastStore();

onMounted(() => bannerStore.fetchBanners());

// ── Form state ────────────────────────────────────────────────────────────────
const showModal = ref(false);
const editingId = ref(null);
const saving = ref(false);
const saveError = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(null);
const fileError = ref(null);

const emptyForm = () => ({
  alt_text: "",
  title: "",
  description: "",
  link_url: "",
  is_active: true,
});

const form = ref(emptyForm());

function openAdd() {
  editingId.value = null;
  form.value = emptyForm();
  selectedFile.value = null;
  previewUrl.value = null;
  fileError.value = null;
  saveError.value = null;
  showModal.value = true;
}

function openEdit(banner) {
  editingId.value = banner.id;
  form.value = {
    alt_text: banner.alt_text || "",
    title: banner.title || "",
    description: banner.description || "",
    link_url: banner.link_url || "",
    is_active: banner.is_active,
  };
  previewUrl.value = banner.image_url;
  selectedFile.value = null;
  fileError.value = null;
  saveError.value = null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function onFileChange(e) {
  fileError.value = null;
  const file = e.target.files[0];
  if (!file) return;

  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) {
    fileError.value = "僅接受 JPG 或 PNG 格式";
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    fileError.value = "圖片大小不得超過 5MB";
    return;
  }
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function save() {
  saveError.value = null;

  if (!editingId.value && !selectedFile.value) {
    saveError.value = "請選擇圖片";
    return;
  }

  saving.value = true;
  try {
    if (editingId.value) {
      // Update metadata only
      const payload = { ...form.value };
      await bannerStore.updateBanner(editingId.value, payload);
      toastStore.add("橫幅更新成功", "success");
    } else {
      // Create with image upload
      const fd = new FormData();
      fd.append("file", selectedFile.value);
      fd.append("alt_text", form.value.alt_text);
      if (form.value.title) fd.append("title", form.value.title);
      if (form.value.description) fd.append("description", form.value.description);
      if (form.value.link_url) fd.append("link_url", form.value.link_url);
      fd.append("is_active", form.value.is_active ? "true" : "false");
      await bannerStore.createBanner(fd);
      toastStore.add("橫幅新增成功", "success");
    }
    closeModal();
  } catch {
    saveError.value = bannerStore.error || "操作失敗，請再試一次";
  } finally {
    saving.value = false;
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref(null);

function confirmDelete(banner) {
  deleteTarget.value = banner;
}

async function doDelete() {
  try {
    await bannerStore.deleteBanner(deleteTarget.value.id);
    toastStore.add("橫幅已刪除", "success");
  } catch {
    toastStore.add(bannerStore.error || "刪除失敗", "error");
  } finally {
    deleteTarget.value = null;
  }
}

// ── Toggle active ─────────────────────────────────────────────────────────────
async function handleToggle(banner) {
  try {
    await bannerStore.toggleActive(banner.id, !banner.is_active);
  } catch {
    toastStore.add(bannerStore.error || "切換失敗", "error");
  }
}

// ── Drag-and-drop reorder ─────────────────────────────────────────────────────
let dragSourceId = null;
let dragOverId = null;

function onDragStart(id) {
  dragSourceId = id;
}

function onDragOver(id) {
  dragOverId = id;
}

async function onDrop() {
  if (dragSourceId === null || dragOverId === null || dragSourceId === dragOverId) return;

  const ids = bannerStore.banners.map((b) => b.id);
  const fromIdx = ids.indexOf(dragSourceId);
  const toIdx = ids.indexOf(dragOverId);
  ids.splice(fromIdx, 1);
  ids.splice(toIdx, 0, dragSourceId);

  try {
    await bannerStore.reorderBanners(ids);
  } catch {
    toastStore.add(bannerStore.error || "排序失敗", "error");
  } finally {
    dragSourceId = null;
    dragOverId = null;
  }
}
</script>

<style scoped>
.banner-admin {
  max-width: 900px;
}

.banner-admin__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.banner-admin__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.banner-admin__loading,
.banner-admin__empty {
  color: #64748b;
  padding: 2rem 0;
  text-align: center;
}

/* Banner list */
.banner-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.banner-list__item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: grab;
}

.banner-list__item:active {
  cursor: grabbing;
}

.banner-list__thumb {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.banner-list__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.banner-list__title {
  font-weight: 600;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-list__order {
  font-size: 0.8125rem;
  color: #64748b;
}

.banner-list__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Toggle */
.toggle {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
}

/* Buttons */
.btn {
  padding: 0.4rem 0.875rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s ease-out, color 0.15s ease-out;
}

.btn--primary {
  background: #0369a1;
  color: #fff;
}

.btn--primary:hover {
  background: #0284c7;
}

.btn--outline {
  background: none;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn--outline:hover {
  background: #f1f5f9;
}

.btn--danger {
  background: #dc2626;
  color: #fff;
}

.btn--danger:hover {
  background: #b91c1c;
}

.btn--sm {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  background: #fff;
  border-radius: 12px;
  padding: 1.75rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal--sm {
  max-width: 360px;
}

.modal__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
}

.modal__field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.modal__field--inline {
  flex-direction: row;
  align-items: center;
}

.modal__field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}

.modal__input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.modal__textarea {
  resize: vertical;
}

.modal__preview {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 0.375rem;
}

.modal__error {
  color: #dc2626;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.required {
  color: #dc2626;
}
</style>
