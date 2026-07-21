<template>
  <div
    class="w-dwh relative z-10 flex flex-col overflow-hidden bg-sf-primary px-4 py-12 md:px-12 md:py-20"
  >
    <!-- 标题区域 -->
    <div class="mb-10 flex flex-col items-start space-y-2 px-4">
      <h2 class="text-3xl font-bold text-sf-text">时光轴</h2>
      <p class="text-sf-text-2">记录每一个重要的时刻与里程碑</p>
    </div>

    <el-scrollbar>
      <div class="flex min-w-full flex-row items-start gap-8 px-4 pt-4 pb-12">
        <div
          v-for="(item, index) in historyList"
          :key="item.time"
          class="group relative flex w-[320px] flex-shrink-0 flex-col"
        >
          <!-- 顶部时间 -->
          <div class="mb-4 flex items-center">
            <span class="text-lg font-bold text-sf-theme">{{ formatTime(item.time) }}</span>
          </div>

          <!-- 时间轴连接线与节点 -->
          <div class="relative mb-6 flex items-center">
            <!-- 节点 -->
            <div
              class="z-10 h-4 w-4 rounded-full border-[3px] border-sf-bg bg-sf-theme transition-transform duration-300 group-hover:scale-125"
            ></div>
            <!-- 连接线 (除了最后一个元素) -->
            <div
              v-if="index !== historyList.length - 1"
              class="absolute top-1/2 left-4 h-[2px] w-[calc(100%+32px)] -translate-y-1/2 bg-sf-border"
            ></div>
          </div>

          <!-- 内容卡片 -->
          <div
            class="flex h-full flex-col overflow-hidden rounded-xl border border-sf-border/50 bg-sf-bg-2 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <!-- 图片区域 -->
            <div
              v-if="item.img"
              class="group/img relative mb-3 h-40 w-full overflow-hidden rounded-lg bg-sf-bg"
            >
              <SfImg
                :src="item.img"
                class="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
              />
              <!-- 图片遮罩与按钮 -->
              <div
                class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100"
              >
                <button
                  @click="previewImg(item.img)"
                  class="flex items-center gap-1 rounded-full bg-sf-theme px-3 py-1.5 text-xs text-white shadow-md hover:bg-sf-theme-hover"
                >
                  <SfIcon icon="mingcute:eye-line" size="14" />
                  <span>查看大图</span>
                </button>
              </div>
            </div>

            <!-- 文字描述 -->
            <div class="flex flex-1 flex-col justify-between">
              <p class="mb-3 text-sm leading-relaxed text-sf-text-2">
                {{ item.desc }}
              </p>

              <!-- 底部操作栏 -->
              <div v-if="item.url" class="mt-2 flex justify-end">
                <a
                  :href="item.url"
                  target="_blank"
                  class="flex items-center gap-1 text-xs font-medium text-sf-theme transition-colors hover:text-sf-theme-hover"
                >
                  <span>前去体验</span>
                  <SfIcon icon="mingcute:arrow-right-line" size="12" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 结尾占位，确保最后一个元素右侧有留白 -->
        <div class="w-8 flex-shrink-0"></div>
      </div>
    </el-scrollbar>

    <!-- 图片预览弹窗 -->
    <teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="imgVisible"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          @click="imgVisible = false"
        >
          <!-- 关闭按钮 -->
          <button
            class="absolute top-6 right-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            @click.stop="imgVisible = false"
          >
            <SfIcon icon="mingcute:close-line" size="24" />
          </button>

          <div class="relative max-h-[90vh] max-w-[90vw]" @click.stop>
            <SfImg :src="imgUrl" class="max-h-[85vh] max-w-[85vw] rounded-lg shadow-2xl" />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { historyList } from '@/constants/modules/history'
import { ref } from 'vue'

const imgVisible = ref(false)
const imgUrl = ref('')

const previewImg = (img: string) => {
  imgVisible.value = true
  imgUrl.value = img
}

// 简单的日期格式化，如果 time 是时间戳
const formatTime = (time: string | number) => {
  if (typeof time === 'number') {
    // 假设是时间戳，这里简单处理，或者直接返回
    // 如果是 '未完待续' 这种字符串，直接返回
    return new Date(time).toLocaleDateString()
  }
  return time
}
</script>

<style lang="scss" scoped>
/* 隐藏滚动条但保留功能 (可选) */
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px;
  bottom: 2px;
}
</style>
