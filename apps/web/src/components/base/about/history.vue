<template>
  <div class="mx-auto max-w-2xl">
    <Teleport to="body">
      <el-image-viewer
        v-if="previewVisible"
        :url-list="[previewImg]"
        @close="previewVisible = false"
      />
    </Teleport>
    <!-- 项目历程时间线 -->
    <div class="relative">
      <!-- 时间线垂直轴 -->
      <div class="absolute top-0 bottom-0 left-4 w-px bg-blue-100"></div>

      <!-- 时间线条目 -->
      <div v-for="item in historyList" :key="item.time" class="group relative ml-12">
        <!-- 时间线圆点 -->
        <div class="absolute -left-12 flex items-center justify-center">
          <div
            class="h-8 w-8 rounded-full border-4 border-white bg-sf-theme shadow-sm transition-transform duration-200 group-hover:scale-110"
          ></div>
        </div>

        <!-- 时间戳 -->
        <div class="group mb-2 pt-1">
          <div class="text-lg font-semibold text-sf-theme transition-colors duration-200">
            {{ item.time }}
          </div>
        </div>

        <!-- 描述内容 -->
        <div class="rounded-xl border border-sf-b bg-sf-bg-2 p-3">
          <div class="mb-2 last:mb-0">
            <div class="text-sf-text">{{ item.desc }}</div>
            <div
              v-if="item.url"
              class="cursor-pointer text-sf-theme hover:underline"
              @click="go(item.url)"
            >
              去体验
            </div>
          </div>

          <!-- 图片展示 -->
          <SfImg
            v-if="item.img"
            :src="item.img"
            class="mx-auto w-full cursor-pointer rounded-xl"
            @click="selectImg(item.img)"
            fit="contain"
            lazy
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { historyList } from "@/configs/modules/history";

// 图片查看器显隐
const previewVisible = ref(false);
const previewImg = ref("");

function selectImg(img) {
  previewVisible.value = true;
  previewImg.value = img;
}

// 跳转链接
function go(url) {
  urlNavigation(url);
}
</script>
