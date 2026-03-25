<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useContactsStore } from "../../stores/contacts.js";

const { t } = useI18n();
const contactsStore = useContactsStore();

// ── 篩選 tab ───────────────────────────────────────────────────────────────────
const TABS = [
  { key: "all", typeParam: null },
  { key: "customer", typeParam: "customer" },
  { key: "supplier", typeParam: "supplier" },
];
const activeTab = ref("all");

function selectTab(tab) {
  activeTab.value = tab.key;
  const params = tab.typeParam ? { type: tab.typeParam } : {};
  contactsStore.fetchContacts(params);
}

onMounted(() => {
  contactsStore.fetchContacts({});
});

// ── 排序 ───────────────────────────────────────────────────────────────────────
const sortKey = ref(null); // 'name' | 'phone' | 'type' | null
const sortDir = ref("asc"); // 'asc' | 'desc'

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

const sortedContacts = computed(() => {
  const contacts = [...(contactsStore.contacts || [])];
  if (!sortKey.value) return contacts;
  const key = sortKey.value;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return contacts.sort((a, b) => {
    const va = (a[key] ?? "").toString().toLowerCase();
    const vb = (b[key] ?? "").toString().toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
});

function sortIcon(key) {
  if (sortKey.value !== key) return "↕";
  return sortDir.value === "asc" ? "↑" : "↓";
}

// ── Modal 狀態 ─────────────────────────────────────────────────────────────────
const showModal = ref(false);
const editingId = ref(null);
const saveError = ref(null);

const CONTACT_METHODS = ["line", "whatsapp", "wechat", "email"];

const emptyForm = () => ({
  name: "",
  phone: "",
  fax: "",
  tax_id: "",
  contact_methods: [],
  email: "",
  type: null,
  note: "",
});

const form = ref(emptyForm());

function openAdd() {
  editingId.value = null;
  form.value = emptyForm();
  saveError.value = null;
  showModal.value = true;
}

function openEdit(contact) {
  editingId.value = contact.id;
  form.value = {
    name: contact.name || "",
    phone: contact.phone || "",
    fax: contact.fax || "",
    tax_id: contact.tax_id || "",
    contact_methods: contact.contact_methods ? [...contact.contact_methods] : [],
    email: contact.email || "",
    type: contact.type || null,
    note: contact.note || "",
  };
  saveError.value = null;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function handleSave() {
  saveError.value = null;
  const payload = {
    name: form.value.name,
    phone: form.value.phone || null,
    fax: form.value.fax || null,
    tax_id: form.value.tax_id || null,
    contact_methods: form.value.contact_methods.length ? form.value.contact_methods : null,
    email: form.value.contact_methods.includes("email") ? form.value.email : null,
    type: form.value.type || null,
    note: form.value.note || null,
  };

  try {
    if (editingId.value) {
      await contactsStore.updateContact(editingId.value, payload);
    } else {
      await contactsStore.createContact(payload);
    }
    showModal.value = false;
  } catch {
    saveError.value = t("contacts.error.saveFailed");
  }
}

// ── 刪除 ───────────────────────────────────────────────────────────────────────
const confirmDeleteId = ref(null);

function requestDelete(id) {
  confirmDeleteId.value = id;
}

function cancelDelete() {
  confirmDeleteId.value = null;
}

async function confirmDelete() {
  try {
    await contactsStore.deleteContact(confirmDeleteId.value);
    confirmDeleteId.value = null;
  } catch {
    confirmDeleteId.value = null;
  }
}

// ── helper ────────────────────────────────────────────────────────────────────
function typeLabel(type) {
  if (type === "customer") return t("contacts.types.customer");
  if (type === "supplier") return t("contacts.types.supplier");
  return t("contacts.types.unclassified");
}
</script>

<template>
  <div class="contacts-view">
    <div class="contacts-header">
      <h1>{{ t("contacts.title") }}</h1>
      <button data-testid="add-contact-btn" @click="openAdd">
        {{ t("contacts.addContact") }}
      </button>
    </div>

    <!-- 篩選 tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        data-testid="filter-tab"
        :class="{ active: activeTab === tab.key }"
        @click="selectTab(tab)"
      >
        {{ t(`contacts.types.${tab.key}`) }}
      </button>
    </div>

    <!-- 錯誤提示 + 重試 -->
    <div v-if="contactsStore.error" class="contacts-error" data-testid="contacts-error">
      <span>{{ contactsStore.error }}</span>
      <button data-testid="retry-btn" @click="contactsStore.fetchContacts(activeTab === 'all' ? {} : { type: activeTab })">
        {{ t("contacts.table.retry") }}
      </button>
    </div>

    <!-- 表格區域（含捲動容器） -->
    <div class="table-scroll-wrapper">
      <table class="contacts-table">
        <thead>
          <tr>
            <th class="col-name" @click="toggleSort('name')" style="cursor:pointer">
              {{ t("contacts.fields.name") }}
              <span class="sort-icon" aria-hidden="true">{{ sortIcon("name") }}</span>
            </th>
            <th class="col-phone" @click="toggleSort('phone')" style="cursor:pointer">
              {{ t("contacts.fields.phone") }}
              <span class="sort-icon" aria-hidden="true">{{ sortIcon("phone") }}</span>
            </th>
            <th class="col-fax">{{ t("contacts.fields.fax") }}</th>
            <th class="col-email">{{ t("contacts.fields.email") }}</th>
            <th class="col-taxid">{{ t("contacts.fields.tax_id") }}</th>
            <th class="col-type" @click="toggleSort('type')" style="cursor:pointer">
              {{ t("contacts.fields.type") }}
              <span class="sort-icon" aria-hidden="true">{{ sortIcon("type") }}</span>
            </th>
            <th class="col-note">{{ t("contacts.fields.note") }}</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          <!-- 載入骨架列 -->
          <template v-if="contactsStore.loading">
            <tr v-for="n in 5" :key="`skeleton-${n}`" class="skeleton-row" data-testid="skeleton-row">
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell"></span></td>
              <td><span class="skeleton-cell skeleton-cell--sm"></span></td>
            </tr>
          </template>

          <!-- 空狀態 -->
          <tr v-else-if="sortedContacts.length === 0">
            <td colspan="8" class="empty-state" data-testid="empty-state">
              {{ t("contacts.table.empty") }}
            </td>
          </tr>

          <!-- 資料列 -->
          <template v-else>
            <tr v-for="contact in sortedContacts" :key="contact.id">
              <td>{{ contact.name }}</td>
              <td>{{ contact.phone || '—' }}</td>
              <td>{{ contact.fax || '—' }}</td>
              <td>{{ contact.email || '—' }}</td>
              <td>{{ contact.tax_id || '—' }}</td>
              <td>{{ typeLabel(contact.type) }}</td>
              <td class="note-cell">{{ contact.note || '—' }}</td>
              <td>
                <div class="actions-cell">
                  <button @click="openEdit(contact)">{{ t("contacts.editContact") }}</button>
                  <button @click="requestDelete(contact.id)">{{ t("contacts.actions.delete") }}</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯 Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>{{ editingId ? t("contacts.editContact") : t("contacts.addContact") }}</h2>

        <label>
          {{ t("contacts.fields.name") }} <span class="required-badge">{{ t("admin.required") }}</span>
          <input v-model="form.name" type="text" required />
        </label>
        <label>
          {{ t("contacts.fields.phone") }}
          <input v-model="form.phone" type="text" />
        </label>
        <label>
          {{ t("contacts.fields.fax") }}
          <input v-model="form.fax" type="text" />
        </label>
        <label>
          {{ t("contacts.fields.tax_id") }}
          <input v-model="form.tax_id" type="text" />
        </label>
        <label>
          {{ t("contacts.fields.type") }}
          <select v-model="form.type">
            <option :value="null">{{ t("contacts.types.unclassified") }}</option>
            <option value="customer">{{ t("contacts.types.customer") }}</option>
            <option value="supplier">{{ t("contacts.types.supplier") }}</option>
          </select>
        </label>

        <!-- 聯絡方式 checkboxes -->
        <fieldset>
          <legend>{{ t("contacts.fields.contactMethods") }}</legend>
          <label v-for="method in CONTACT_METHODS" :key="method">
            <input
              type="checkbox"
              :data-testid="`method-${method}`"
              :value="method"
              v-model="form.contact_methods"
            />
            {{ t(`contacts.contactMethodOptions.${method}`) }}
          </label>
        </fieldset>

        <!-- Email 輸入（僅在勾選 email 時顯示）-->
        <label v-if="form.contact_methods.includes('email')">
          {{ t("contacts.fields.email") }} <span class="required-badge">{{ t("admin.required") }}</span>
          <input
            v-model="form.email"
            type="email"
            data-testid="email-input"
          />
        </label>

        <label>
          {{ t("contacts.fields.note") }}
          <textarea v-model="form.note" />
        </label>

        <p v-if="saveError" class="error">{{ saveError }}</p>

        <div class="modal-actions">
          <button @click="handleSave">{{ t("contacts.actions.save") }}</button>
          <button @click="closeModal">{{ t("contacts.actions.cancel") }}</button>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Dialog -->
    <div v-if="confirmDeleteId !== null" class="confirm-dialog">
      <p>{{ t("contacts.deleteConfirm") }}</p>
      <button @click="confirmDelete">{{ t("contacts.actions.confirmDelete") }}</button>
      <button @click="cancelDelete">{{ t("contacts.actions.cancel") }}</button>
    </div>
  </div>
</template>

<style scoped>
.required-badge {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.8125rem;
}

/* 表格捲動容器 */
.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* 聯絡人表格 */
.contacts-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
  font-size: 0.9375rem;
}

.contacts-table thead th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  user-select: none;
}

.contacts-table thead th:hover {
  background: #f8fafc;
}

.contacts-table tbody td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  vertical-align: middle;
}

/* Column widths */
.col-name    { min-width: 100px; }
.col-phone   { min-width: 90px; }
.col-fax     { min-width: 90px; }
.col-email   { min-width: 120px; }
.col-taxid   { min-width: 80px; }
.col-type    { min-width: 70px; }
.col-note    { min-width: 100px; }
.col-actions { min-width: 120px; }

.note-cell {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sort-icon {
  margin-left: 0.25rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Actions cell */
.actions-cell {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2.5rem 0;
  color: #64748b;
  font-size: 0.9375rem;
}

/* Skeleton rows */
.skeleton-row td {
  padding: 0.75rem;
}

.skeleton-cell {
  display: block;
  height: 1rem;
  width: 80%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}

.skeleton-cell--sm {
  width: 50%;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Error banner */
.contacts-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}
</style>
