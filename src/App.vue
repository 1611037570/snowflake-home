<script setup>
import LoadingComponent from '@views/status/loading.vue'
// https://cdn.jsdelivr.net/npm/pinyin@4.0.0/lib/umd/pinyin.min.js
// https://www.bootcdn.cn/
// https://www.jsdelivr.com/?query=vue
// 语言配置对象
</script>
<template>
  <!-- 应用根元素 -->
  <SfConfigProvider>
    <!-- 监控器 -->
    <SfMonitor v-if="monitorWatch" />
    <!-- 路由视图 -->
    <RouterView v-slot="{ Component }">
      <Transition name="page-transition" mode="out-in">
        <Component :is="Component || LoadingComponent" />
      </Transition>
    </RouterView>
  </SfConfigProvider>
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
