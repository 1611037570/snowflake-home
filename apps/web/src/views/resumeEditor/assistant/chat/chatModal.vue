<script setup>
import Chat from "./index.vue";

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-3 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-3 opacity-0"
  >
    <div v-if="visible" class="pointer-events-none fixed inset-0 z-80">
      <section
        class="border-sf-border pointer-events-auto absolute right-6 bottom-6 flex h-[720px] w-[960px] max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-xl border bg-sf-primary shadow-xl"
      >
        <header class="border-sf-border flex shrink-0 items-center justify-between border-b p-3">
          <div class="flex items-center gap-3">
            <SfIcon icon="ph:chats-teardrop-duotone" size="5" class="text-sf-theme" />
            <span class="font-bold text-sf-text">简历助手</span>
          </div>
          <button
            class="flex cursor-pointer items-center justify-center rounded-lg p-3 text-sf-text-2 transition hover:bg-sf-bg-2 hover:text-sf-text"
            type="button"
            @click="emit('close')"
          >
            <SfIcon icon="mingcute:close-line" size="5" />
          </button>
        </header>
        <Chat class="min-h-0 flex-1" />
      </section>
    </div>
  </Transition>
</template>
