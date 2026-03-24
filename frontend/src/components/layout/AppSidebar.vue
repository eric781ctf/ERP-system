<template>
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <nav class="sidebar__nav" aria-label="管理後台導覽">
      <ul class="sidebar__list">
        <li v-for="item in navItems" :key="item.to" class="sidebar__item">
          <RouterLink
            :to="item.to"
            class="sidebar__link"
            :class="{ 'sidebar__link--active': isActive(item.to) }"
            @click="handleNavClick"
          >
            {{ t(item.label) }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  onClose: {
    type: Function,
    default: null,
  },
});

const { t } = useI18n();
const route = useRoute();

const navItems = [
  { label: "layout.nav.helpCenter", to: "/admin/help-center" },
  { label: "layout.nav.products", to: "/admin/products" },
  { label: "layout.nav.contacts", to: "/admin/contacts" },
  { label: "layout.nav.banners", to: "/admin/banners" },
];

function isActive(path) {
  return route.path.startsWith(path);
}

function handleNavClick() {
  if (props.onClose) {
    props.onClose();
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 240px;
  background: #0f172a;
  color: #f8fafc;
  display: none;
  flex-direction: column;
  z-index: 30;
  transform: translateX(-100%);
  transition: transform 0.2s ease-out;
}

.sidebar--open {
  display: flex;
  transform: translateX(0);
}

.sidebar__nav {
  padding: 1rem 0;
  margin-top: 60px;
}

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar__link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.15s ease-out, color 0.15s ease-out;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.sidebar__link--active {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  font-weight: 600;
  border-left: 3px solid #0369a1;
}

@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: 0;
    display: flex;
    transform: none;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
  }
}
</style>
