<script setup>
import { computed, onMounted } from "vue";
import { useContactsStore } from "../stores/contacts.js";

const props = defineProps({
  type: {
    type: String,
    default: null,
  },
  modelValue: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const contactsStore = useContactsStore();

onMounted(() => {
  const params = props.type ? { type: props.type } : {};
  contactsStore.fetchContacts(params);
});

const options = computed(() => {
  if (props.type === "customer") return contactsStore.customers;
  if (props.type === "supplier") return contactsStore.suppliers;
  return contactsStore.contacts;
});

function handleChange(event) {
  const val = event.target.value;
  emit("update:modelValue", val ? Number(val) : null);
}
</script>

<template>
  <select :value="modelValue ?? ''" @change="handleChange">
    <option value="">—</option>
    <option
      v-for="contact in options"
      :key="contact.id"
      :value="contact.id"
      data-testid="contact-option"
    >
      {{ contact.name }}
    </option>
  </select>
</template>
