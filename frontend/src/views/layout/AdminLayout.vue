<template>
  <div class="admin-layout">
    <AppSidebar :is-open="sidebarOpen" :on-close="closeSidebar" />

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="admin-layout__overlay"
      @click="closeSidebar"
    />

    <div class="admin-layout__main">
      <AppHeader :on-toggle-sidebar="toggleSidebar" />
      <main id="main-content" class="admin-layout__content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import AppSidebar from "../../components/layout/AppSidebar.vue";
import AppHeader from "../../components/layout/AppHeader.vue";

const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-layout__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 25;
}

.admin-layout__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-layout__content {
  padding: 1.5rem;
  margin-top: 60px;
  flex: 1;
}

@media (min-width: 1024px) {
  .admin-layout__overlay {
    display: none;
  }
}
</style>
