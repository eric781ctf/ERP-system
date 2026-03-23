<template>
  <div class="public-layout">
    <PublicNavbar />
    <main id="main-content" class="public-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import PublicNavbar from "../../components/layout/PublicNavbar.vue";
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.public-layout__main {
  flex: 1;
}
</style>
