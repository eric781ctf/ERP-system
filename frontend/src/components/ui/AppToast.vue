<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="item in toastStore.items"
          :key="item.id"
          class="toast"
          :class="`toast--${item.type}`"
          role="alert"
        >
          {{ item.message }}
          <button
            class="toast__close"
            :aria-label="'關閉通知'"
            @click="toastStore.remove(item.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from "../../stores/toast.js";

const toastStore = useToastStore();
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
  width: calc(100vw - 2rem);
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: var(--shadow-card);
  color: #fff;
}

.toast--success {
  background: var(--color-success);
}

.toast--error {
  background: var(--color-danger);
}

.toast--info {
  background: var(--color-cta);
}

.toast__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  opacity: 0.8;
  flex-shrink: 0;
}

.toast__close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
</style>
