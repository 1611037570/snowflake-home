<script setup lang="ts">
import { useToggle } from '@vueuse/core'
const [active, toggle] = useToggle(false)
</script>

<template>
  <button
    class="fixed right-4 bottom-4 z-150 rounded bg-sf-theme px-3 py-1 text-white transition-all duration-300"
    @click="toggle()"
  >
    切换Banner
  </button>
  <div
    class="absolute top-0 left-0 h-full w-full transform bg-amber-300 transition-all duration-300"
    :class="[active ? 'translate-y-0' : 'translate-y-full']"
  ></div>
</template>
