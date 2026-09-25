<script setup>
import { ref } from "vue";
import Toolbar from "../toolbar/index.vue";

const props = defineProps({
  activePanel: {
    type: String,
    default: "preview",
  },
});
const emit = defineEmits(["select"]);
const panelOptions = [
  { value: "edit", label: "编辑", icon: "lucide:file-text" },
  { value: "preview", label: "预览", icon: "lucide:eye" },
];

// 右侧工具栏抽屉展开状态
const expanded = ref(false);
</script>

<template>
  <!-- :style="{ marginBottom: 'max(0.75rem,env(safe-area-inset-bottom))' }" -->
  <nav class="relative w-full">
    <div
      class="relative z-30 mx-auto flex w-fit shrink-0 items-center gap-1 self-center rounded-t-3xl border border-sf-b bg-sf-primary p-1"
      aria-label="简历工作区"
    >
      <!-- 底部切换只控制编辑与预览面板。 -->
      <button
        v-for="option in panelOptions"
        :key="option.value"
        type="button"
        class="flex h-8 w-20 items-center justify-center gap-1 rounded-2xl px-2 text-xs transition-colors"
        :class="
          props.activePanel === option.value ? 'bg-sf-theme text-sf-theme-text' : 'text-sf-text-2'
        "
        :aria-pressed="props.activePanel === option.value"
        @click="emit('select', option.value)"
      >
        <SfIcon :icon="option.icon" size="4" />
        <span>{{ option.label }}</span>
      </button>
    </div>

    <button
      type="button"
      class="absolute top-1/2 right-3 z-50 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-sf-b bg-sf-primary text-sf-text-2 shadow-md transition-colors hover:text-sf-theme"
      :style="{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }"
      aria-label="打开右侧工具栏"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <SfIcon :icon="expanded ? 'lucide:x' : 'lucide:ellipsis-vertical'" size="5" />
    </button>
  </nav>

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
