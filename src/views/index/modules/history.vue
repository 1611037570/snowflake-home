<template>
  <div class="w-dwh relative z-10 flex flex-col overflow-hidden bg-sf-primary px-12 py-20">
    <div class="py-12">时光轴</div>

    <el-scrollbar>
      <div class="mb-16 flex flex-row gap-4">
        <!-- 内部子元素3 -->
        <div
          class="flex-c w-fit max-w-[260px] flex-shrink-0 flex-col rounded-lg bg-sf-bg-hover px-2 py-1 shadow-sm"
          v-for="item in historyList"
          :key="item.time"
        >
          <!-- 上层：时间 -->
          <div class="mb-1 text-sm text-gray-500">{{ item.time }}</div>
          <!-- 下层：内容（超长内容，超过300px后自动换行） -->
          <div class="text-[12px] break-words text-gray-800">
            <span>
              {{ item.desc }}
            </span>
            <span
              class="bg-sf-secondary cursor-pointer self-start rounded-full px-2 py-1 text-xs whitespace-nowrap text-sf-theme"
              v-if="item.img"
              @click="previewImg(item.img)"
            >
              查看图片
            </span>
            <span
              class="bg-sf-secondary cursor-pointer self-start rounded-full px-2 py-1 text-xs whitespace-nowrap text-sf-theme"
              v-if="item.url"
            >
              前去体验
            </span>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <teleport to="body">
      <div class="fixed inset-0 z-60 bg-black/50" v-if="imgVisible">
        <SfIcon
          icon="mingcute:close-line"
          size="24"
          class="absolute top-4 right-4 text-sf-text"
          @click="imgVisible = false"
        />
        <SfImg
          :src="imgUrl"
          class="absolute top-1/2 left-1/2 max-h-[90%] max-w-[90%] -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { historyList } from './data'
const imgVisible = ref(false)
const imgUrl = ref('')
const previewImg = (img) => {
  imgVisible.value = true
  imgUrl.value = img
}
</script>

<style lang="scss" scoped></style>
