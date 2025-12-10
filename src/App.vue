<script setup>
import { useSystemStore } from '@/stores/modules/system'
import { loadElLocale, loadEvent, loadTheme } from '@/utils'
import LoadingComponent from '@views/status/loading.vue'

const systemStore = useSystemStore()
const { monitorWatch } = storeToRefs(systemStore)
// 加载主题
loadTheme()
// 加载element-plus的locale
const currentElLocale = loadElLocale()
// 加载默认事件
loadEvent()

// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
</script>
<template>
  <ElConfigProvider :locale="currentElLocale">
    <SfMonitor v-if="monitorWatch" />
    <Suspense>
      <!-- 默认插槽 -->
      <template #default>
        <RouterView v-slot="{ Component }">
          <Component :is="Component || LoadingComponent" />
        </RouterView>
      </template>
      <!-- 占位插槽 -->
      <template #fallback>
        <LoadingComponent />
      </template>
    </Suspense>
  </ElConfigProvider>
</template>

<style></style>
