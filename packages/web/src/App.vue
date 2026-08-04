<script setup>
// 加载组件
import LoadingComponent from '@views/status/loading.vue'
// 聊天弹窗
import ChatModal from '@views/ai/chatModal.vue'
</script>
<template>
  <!-- 应用根元素 -->
  <SfConfigProvider>
    <!-- 全局控制器 -->
    <SfGlobalController />
    <!-- 路由视图 -->
    <RouterView v-slot="{ Component }">
      <Transition name="page-transition" mode="out-in">
        <Component :is="Component || LoadingComponent" />
      </Transition>
    </RouterView>
    <!-- 聊天弹窗 -->
    <ChatModal />
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
