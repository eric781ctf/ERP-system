import { ref } from "vue";
import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", () => {
  const items = ref([]);
  let nextId = 0;

  function add(message, type = "info", duration = 3000) {
    const id = nextId++;
    items.value.push({ id, message, type });
    setTimeout(() => remove(id), duration);
  }

  function remove(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, add, remove };
});
