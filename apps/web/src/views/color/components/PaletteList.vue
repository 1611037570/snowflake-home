<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { list } from "../data";

const { copy } = useClipboard();

function copyClass(cls: string) {
  copy(cls)
    .then(() => ElMessage.success(`已复制类名: ${cls}`))
    .catch(() => ElMessage.error("复制失败"));
}
</script>

<template>
  <div class="space-y-10">
    <template v-for="item in list" :key="item.name">
      <div class="sf-color-section group/section">
        <div class="mb-5 flex items-center gap-3">
          <div
            class="h-6 w-1 rounded-full bg-sf-theme transition-all group-hover/section:h-8 group-hover/section:shadow-[0_0_8px_var(--sf-theme)]"
          ></div>
          <h2 class="text-xl font-bold text-sf-text transition-colors">{{ item.name }}</h2>
          <span
            class="border-sf-b rounded-full border bg-sf-bg-2 px-2.5 py-0.5 text-xs font-medium text-sf-text-3 shadow-sm transition-colors group-hover/section:bg-sf-theme/5 group-hover/section:text-sf-theme"
          >
            {{ item.list.length }} 种
          </span>
        </div>

        <div
          class="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <div
            v-for="data in item.list"
            :key="data.class"
            class="group border-sf-b relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-sf-primary transition-all duration-300 hover:-translate-y-1.5 hover:border-sf-theme hover:shadow-xl"
            @click="copyClass(data.class)"
          >
            <!-- 颜色展示区 -->
            <div
              class="border-sf-b relative flex h-28 w-full items-center justify-center border-b transition-transform duration-500 group-hover:scale-105"
              :class="data.class"
            >
              <!-- Text visibility test if applicable -->
              <span
                v-if="
                  data.class.includes('bg-sf-theme') ||
                  data.class.includes('bg-sf-success') ||
                  data.class.includes('bg-sf-error')
                "
                class="text-xs font-medium opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
                :class="data.class === 'bg-sf-theme-text' ? 'text-sf-theme' : 'text-sf-bg'"
              >
                Contrast
              </span>
            </div>

            <!-- 信息展示区 -->
            <div
              class="relative z-10 flex flex-col gap-1.5 bg-sf-primary p-4 transition-colors group-hover:bg-sf-bg-2"
            >
              <span
                class="truncate text-sm font-semibold text-sf-text transition-colors group-hover:text-sf-theme"
                :title="data.name"
              >
                {{ data.name }}
              </span>
              <span
                class="truncate font-mono text-[11px] text-sf-text-3 transition-colors group-hover:text-sf-text-2"
                :title="data.class"
              >
                {{ data.class }}
              </span>
            </div>

            <!-- 悬浮复制提示 -->
            <div
              class="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
            >
              <span
                class="border-sf-b flex translate-y-3 transform items-center gap-1.5 rounded-lg border bg-sf-primary/90 px-4 py-2 text-sm font-medium text-sf-text opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:!bg-sf-theme hover:!text-sf-theme-text"
              >
                <SfIcon icon="mdi:content-copy" size="4" class="text-inherit" />
                点击复制
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
