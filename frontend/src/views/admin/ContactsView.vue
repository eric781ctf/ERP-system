<script setup>
import { ref, onMounted } from "vue";
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

    <p v-if="contactsStore.loading">Loading...</p>
    <p v-else-if="contactsStore.error" class="error">{{ contactsStore.error }}</p>

    <!-- 聯絡人列表 -->
    <table v-if="contactsStore.contacts.length > 0">
      <thead>
        <tr>
          <th>{{ t("contacts.fields.name") }}</th>
          <th>{{ t("contacts.fields.phone") }}</th>
          <th>{{ t("contacts.fields.fax") }}</th>
          <th>{{ t("contacts.fields.tax_id") }}</th>
          <th>{{ t("contacts.fields.contactMethods") }}</th>
          <th>{{ t("contacts.fields.email") }}</th>
          <th>{{ t("contacts.fields.type") }}</th>
          <th>{{ t("contacts.fields.note") }}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contact in contactsStore.contacts" :key="contact.id">
          <td>{{ contact.name }}</td>
          <td>{{ contact.phone }}</td>
          <td>{{ contact.fax }}</td>
          <td>{{ contact.tax_id }}</td>
          <td>
            <span
              v-for="method in contact.contact_methods"
              :key="method"
              class="method-badge"
            >
              {{ t(`contacts.contactMethodOptions.${method}`) }}
            </span>
          </td>
          <td>{{ contact.email }}</td>
          <td>{{ typeLabel(contact.type) }}</td>
          <td>{{ contact.note }}</td>
          <td>
            <button @click="openEdit(contact)">{{ t("contacts.editContact") }}</button>
            <button @click="requestDelete(contact.id)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>

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
          <button @click="handleSave">儲存</button>
          <button @click="closeModal">取消</button>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Dialog -->
    <div v-if="confirmDeleteId !== null" class="confirm-dialog">
      <p>{{ t("contacts.deleteConfirm") }}</p>
      <button @click="confirmDelete">確認刪除</button>
      <button @click="cancelDelete">取消</button>
    </div>
  </div>
</template>

<style scoped>
.required-badge {
  color: #dc2626;
  font-weight: 600;
  font-size: 0.8125rem;
}
</style>
