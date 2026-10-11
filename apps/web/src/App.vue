<script setup>
// 加载组件
import LoadingComponent from "@views/status/loading.vue";
// 聊天弹窗
import { snowflakePing } from "@/apis";
import { reportResumeVisit } from "@/hooks";
import router from "@/routers";
import { useSystemStore } from "@/stores/modules/system";

const systemStore = useSystemStore();

// 检测服务器连接状态
const checkConnection = async () => {
  try {
    await snowflakePing();
    systemStore.isConnected = true;
  } catch {
    systemStore.isConnected = false;
  }
};

checkConnection();
// 应用启动登记访客，失败不影响页面；打印页由服务端渲染唤起，不计入访客统计
router.isReady().then(() => {
  if (router.currentRoute.value.name !== "resume-print") reportResumeVisit();
});
</script>
<template>
  <!-- 应用根元素 -->
  <SfConfigProvider>
    <!-- 路由切换期间显示顶部进度条，避免页面无反馈 -->
    <SfTopLoading />
    <!-- 全局控制器 -->
    <SfGlobalController />
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
  /* 缩短过渡时长，减少页面切换时的停顿感 */
  transition: opacity 0.15s ease;
}

.page-transition-enter-from,
.page-transition-leave-to {
  opacity: 0;
}
</style>
