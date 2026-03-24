<template>
  <div class="home">
    <BannerCarousel v-if="bannerStore.banners.length > 0" :banners="bannerStore.banners" />
    <div class="home__cta">
      <router-link to="/products" class="home__catalog-link">{{ $t("nav.catalog") }}</router-link>
    </div>
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
.home__cta {
  padding: 2rem 1.5rem;
  text-align: center;
}

.home__catalog-link {
  display: inline-block;
  padding: 0.625rem 1.5rem;
  background: #0369a1;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: background 0.15s ease-out;
}

.home__catalog-link:hover {
  background: #0284c7;
}
</style>
