<template>
  <div class="home">
    <BannerCarousel v-if="bannerStore.banners.length > 0" :banners="bannerStore.banners" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useBannerStore } from "../../stores/banner.js";
import BannerCarousel from "../../components/ui/BannerCarousel.vue";

const bannerStore = useBannerStore();

onMounted(() => {
  bannerStore.fetchBanners();
});
</script>

<style scoped>
</style>
