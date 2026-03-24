<template>
  <div class="home">
    <!-- carousel-wrapper uses the negative-margin full-bleed technique so that
         BannerCarousel spans 100vw regardless of any ancestor max-width or
         padding constraints, without modifying PublicLayout. -->
    <div class="carousel-wrapper">
      <BannerCarousel v-if="bannerStore.banners.length > 0" :banners="bannerStore.banners" />
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
/* overflow-x: clip (not hidden) avoids creating a new scroll container,
   so position: sticky on the navbar is unaffected. It clips any pixel-level
   overhang caused by the 100vw + scrollbar-width mismatch on Windows. */
.home {
  overflow-x: clip;
}

/* Full-bleed breakout: shifts the wrapper to the true left edge of the
   viewport and stretches it to 100vw, escaping any ancestor padding or
   max-width without touching PublicLayout. */
.carousel-wrapper {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  position: relative;
}
</style>
