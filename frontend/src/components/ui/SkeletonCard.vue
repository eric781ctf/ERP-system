<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-card__image skeleton-pulse" />
    <div class="skeleton-card__body">
      <div class="skeleton-card__title skeleton-pulse" />
      <div class="skeleton-card__text skeleton-pulse" />
      <div class="skeleton-card__text skeleton-card__text--short skeleton-pulse" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.skeleton-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  background: var(--color-border);
}

.skeleton-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-card__title {
  height: 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--color-border);
  width: 60%;
}

.skeleton-card__text {
  height: 0.875rem;
  border-radius: var(--radius-sm);
  background: var(--color-border);
}

.skeleton-card__text--short {
  width: 40%;
}

.skeleton-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-pulse {
    animation: none;
  }
}
</style>
