<script setup>
import { useSystemStore } from '@/stores/modules/system'
import { loadElLocale } from '@/utils'

import { DEFAULT_LANGUAGE } from '@/constants'

import LoadingComponent from '@views/status/loading.vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const systemStore = useSystemStore()
const { monitorWatch } = storeToRefs(systemStore)

// 加载element-plus的locale
onMounted(async () => {
  language.value = await loadElLocale()
})
// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
// 语言配置对象
const langConfig = {
  'zh-CN': zhCn,
  en: en,
}

const language = ref(DEFAULT_LANGUAGE)
// 根据语言键获取配置，不存在则使用默认语言
const locale = computed(() => langConfig[language.value] || langConfig[DEFAULT_LANGUAGE])
</script>
<template>
  <!-- 应用根元素 -->
  <ElConfigProvider :locale="locale">
    <!-- 监控器 -->
    <SfMonitor v-if="monitorWatch" />
    <!-- 路由视图 -->
    <RouterView v-slot="{ Component }">
      <Transition name="page-transition" mode="out-in">
        <Component :is="Component || LoadingComponent" />
      </Transition>
    </RouterView>
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
