<script setup>
// 加载组件
import LoadingComponent from "@views/status/loading.vue";
// 聊天弹窗
import ChatModal from "@views/ai/chatModal.vue";
import { getSnowflakeMessage } from "@/apis/modules/snowflake";
import { useSystemStore } from "@/stores/modules/system";

const systemStore = useSystemStore();

// 检测服务器连接状态
const checkConnection = async () => {
  try {
    const res = await getSnowflakeMessage();
    console.log(1111111111, res);
    systemStore.isConnected = true;
  } catch (error) {
    systemStore.isConnected = false;
  }
  console.log(systemStore.isConnected);
};

checkConnection();
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
