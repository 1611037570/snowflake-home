<script setup lang="ts">
import { loadElLocale, loadTheme } from '@/utils'
import LoadingComponent from '@views/status/loading.vue'
// 加载主题
loadTheme()
// 加载element-plus的locale
const currentElLocale: any = loadElLocale()
// 加载默认事件
function loadDefaultEvent() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault() // 阻止默认右键行为
  })
}
// 调用加载默认事件函数
loadDefaultEvent()
// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
</script>
<template>
  <ElConfigProvider :locale="currentElLocale">
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
