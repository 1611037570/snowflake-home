<template>
  <div class="flex-c min-h-screen flex-col bg-sf-primary">
    <div class="text-lg font-medium text-sf-text">{{ $t('error.loadFailed') }}</div>
    <div class="mt-2 text-sf-text">{{ $t('error.autoRedirect', { count }) }}</div>
    <button class="sf-theme-element mt-4 rounded px-4 py-2" @click="jump">
      {{ $t('error.redirectNow') }}
    </button>
  </div>
</template>

<script setup>
import { DEFAULT_ROUTE } from '@/constants'
import { useIntervalFn } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const count = ref(3)

function jump() {
  router.push(DEFAULT_ROUTE)
}

const { pause, resume } = useIntervalFn(() => {
  count.value -= 1

  if (count.value <= 0) {
    pause()
    jump()
  }
}, 1000)

onMounted(async () => {
  resume()
})
</script>

<style scoped></style>
