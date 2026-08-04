<script setup>
import { ElNotification } from 'element-plus'
import { onMounted } from 'vue'
import StepSelectRoute from './StepSelectRoute.vue'

onMounted(() => {
  const ua = navigator.userAgent.toLowerCase()
  // 严格判断是否为谷歌浏览器，排除 Edge, Opera 等基于 Chromium 的浏览器
  const isChrome =
    ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr') && !ua.includes('opera')

  if (!isChrome) {
    ElNotification({
      title: '浏览器建议',
      message: '为了获得最佳体验，推荐使用谷歌浏览器，其他浏览器可能会遇到兼容性或性能问题。',
      type: 'warning',
      duration: 0, // 不自动关闭，让用户明确看到
    })
  }
})
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col items-center justify-center bg-sf-bg p-4 text-sf-base">
    <div class="flex w-full max-w-2xl items-center justify-end gap-5">
      <SfTheme />
      <SfLocale />
      <SfDonation />
      <SfSetting />
    </div>
    <div class="flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
      <StepSelectRoute />
    </div>
    <SfFooter class="text-xs" />
  </div>
</template>

<style lang="scss" scoped></style>
