<script setup>
import { ref } from "vue";
import Toolbar from "../toolbar/index.vue";

const expanded = ref(false);
</script>

<template>
  <Transition name="mobile-toolbar-drawer">
    <div v-if="expanded" class="fixed inset-0 z-40 bg-black/20" @click="expanded = false">
      <aside
        class="absolute inset-y-0 right-0 flex w-[82px] items-center justify-center overflow-y-auto border-l border-sf-b bg-sf-primary shadow-xl"
        aria-label="简历工具栏"
        @click.stop
      >
        <Toolbar class="h-full" />
      </aside>
    </div>
  </Transition>
  <button
    type="button"
    class="fixed right-3 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-sf-b bg-sf-primary text-sf-text-2 shadow-md transition-colors hover:text-sf-theme"
    :style="{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }"
    aria-label="打开右侧工具栏"
    :aria-expanded="expanded"
    @click="expanded = !expanded"
  >
    <SfIcon :icon="expanded ? 'lucide:x' : 'lucide:ellipsis-vertical'" size="5" />
  </button>
</template>

<style scoped>
.mobile-toolbar-drawer-enter-active,
.mobile-toolbar-drawer-leave-active {
  transition: opacity 0.2s ease;
}

.mobile-toolbar-drawer-enter-active aside,
.mobile-toolbar-drawer-leave-active aside {
  transition: transform 0.2s ease;
}

.mobile-toolbar-drawer-enter-from,
.mobile-toolbar-drawer-leave-to {
  opacity: 0;
}

.mobile-toolbar-drawer-enter-from aside,
.mobile-toolbar-drawer-leave-to aside {
  transform: translateX(100%);
}
</style>
