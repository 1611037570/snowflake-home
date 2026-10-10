<template>
  <div
    class="minimal-history w-dwh relative z-10 flex flex-col overflow-hidden bg-sf-bg px-6 py-18 lg:px-12"
    id="history"
  >
    <Teleport to="body">
      <el-image-viewer
        v-if="previewVisible"
        :url-list="[previewImg]"
        @close="previewVisible = false"
      />
    </Teleport>
    <!-- 标题区域 -->
    <div class="mx-auto mb-9 flex w-full max-w-[1080px] flex-col items-start space-y-3">
      <h2 class="text-2xl font-medium tracking-tight text-sf-base">时光轴</h2>
      <p class="text-sm text-sf-text-2">记录每一个重要的时刻与里程碑</p>
    </div>

    <el-scrollbar class="minimal-history-track relative mx-auto w-full max-w-[1080px]">
      <!-- 两端留出节点空间，避免遮挡；各项高度随内容自然展开。 -->
      <div class="flex flex-row items-start gap-9 px-3 pt-3 pb-6">
        <div
          v-for="(item, index) in historyList"
          :key="item.time"
          class="minimal-history-item group relative flex w-[285px] flex-shrink-0 flex-col"
        >
          <!-- 顶部时间 -->
          <div class="mb-6 flex items-center">
            <span class="font-mono text-xs tracking-wide text-sf-text-2">{{ formatTime(item.time) }}</span>
          </div>

          <!-- 时间轴连接线与节点 -->
          <div class="relative mb-6 flex items-center">
            <!-- 节点 -->
            <div
              class="z-10 h-3 w-3 rounded-full border border-sf-b bg-sf-bg"
            ></div>
            <!-- 连接线 (除了最后一个元素) -->
            <div
              v-if="index !== historyList.length - 1"
              class="absolute top-1/2 left-3 h-px w-[calc(100%+36px)] -translate-y-1/2 bg-sf-b"
            ></div>
          </div>

          <!-- 内容卡片 -->
          <div
            class="flex flex-col pr-6"
          >
            <!-- 文字描述 -->
            <div class="flex flex-col gap-6">
              <p class="text-sm leading-relaxed text-sf-text-2">
                {{ item.desc }}
              </p>
              <!-- 图片仅在用户点击后打开，列表不加载缩略图。 -->
              <button
                v-if="item.img"
                type="button"
                class="w-fit cursor-pointer text-sm text-sf-theme underline-offset-6 hover:underline focus-visible:outline focus-visible:outline-sf-theme"
                @click="selectImg(item.img)"
              >查看图片</button>
            </div>
          </div>
        </div>

      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { historyList } from "@/configs";

// 图片查看器显隐
const previewVisible = ref(false);
const previewImg = ref("");

// 选择图片：设置预览图片并显示查看器
const selectImg = (img: string) => {
  previewImg.value = img;
  previewVisible.value = true;
};

// 简单的日期格式化，如果 time 是时间戳
const formatTime = (time: string | number) => {
  if (typeof time === "number") {
    // 假设是时间戳，这里简单处理，或者直接返回
    // 如果是 '未完待续' 这种字符串，直接返回
    return new Date(time).toLocaleDateString();
  }
  return time;
};
</script>

<style lang="scss" scoped>
/* 隐藏滚动条但保留功能 (可选) */
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px;
  bottom: 2px;
}
</style>

<style scoped>
/* 用留白、细线和文字层次统一后续区域。 */

.minimal-history { border-top: 1px solid var(--sf-border); scroll-margin-top: 80px; }
.minimal-history-item:first-child > div:first-child span { color: var(--sf-theme); }
.minimal-history-item:first-child > div:nth-child(2) > div:first-child { background: var(--sf-theme); border-color: var(--sf-theme); }
.minimal-history-track :deep(.el-scrollbar__thumb) { background: var(--sf-text-3); }

</style>
