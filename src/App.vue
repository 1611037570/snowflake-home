<script setup>
import { useSystemStore } from '@/stores/modules/system'
import { loadElLocale } from '@/utils'
import LoadingComponent from '@views/status/loading.vue'

const systemStore = useSystemStore()
const { monitorWatch } = storeToRefs(systemStore)

// 加载element-plus的locale
const currentElLocale = loadElLocale()
// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
</script>
<template>
  <ElConfigProvider :locale="currentElLocale">
    <SfMonitor v-if="monitorWatch" />
    <Transition name="page-transition" mode="out-in">
      <RouterView v-slot="{ Component }">
        <Component :is="Component || LoadingComponent" />
      </RouterView>
    </Transition>
  </ElConfigProvider>
</template>

<style>
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
