import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as api from "../api/contacts.js";

export const useContactsStore = defineStore("contacts", () => {
  const contacts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const customers = computed(() => contacts.value.filter((c) => c.type === "customer"));
  const suppliers = computed(() => contacts.value.filter((c) => c.type === "supplier"));

  async function fetchContacts(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getContacts(params);
      contacts.value = res.data;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createContact(payload) {
    const res = await api.createContact(payload);
    contacts.value.push(res.data);
    return res.data;
  }

  async function updateContact(id, payload) {
    const res = await api.updateContact(id, payload);
    const idx = contacts.value.findIndex((c) => c.id === id);
    if (idx !== -1) contacts.value[idx] = res.data;
    return res.data;
  }

  async function deleteContact(id) {
    await api.deleteContact(id);
    contacts.value = contacts.value.filter((c) => c.id !== id);
  }

  return {
    contacts,
    loading,
    error,
    customers,
    suppliers,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  };
});
