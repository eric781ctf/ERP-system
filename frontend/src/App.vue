<template>
  <a href="#main-content" class="skip-link">跳至主要內容</a>
  <router-view />
  <AppToast />
</template>

<script setup>
import AppToast from "./components/ui/AppToast.vue";
</script>
