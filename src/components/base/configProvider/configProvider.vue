<script setup>
import { DEFAULT_LANGUAGE } from '@/constants'
import { loadElLocale } from '@/utils'

import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
const props = defineProps({
  bg: {
    type: String,
    default: 'bg-sf-primary',
  },
})
provide('bg', props.bg)

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
  <ElConfigProvider :locale="locale">
    <slot></slot>
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
