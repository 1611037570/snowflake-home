<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 首页页眉独立于个人信息模块，蓝色部分跟随主题色，金色横带与圆标保持固定点缀色。 -->
  <header class="w-full px-3 pt-3">
    <div class="flex min-h-[66px] items-center justify-between gap-3 pb-3">
      <div class="flex min-w-0 items-center gap-3" :style="{ color: themeColor }">
        <span class="shrink-0 text-[36px] leading-none tracking-[0.08em]">个人简历</span>
        <span
          aria-hidden="true"
          class="h-[42px] w-px shrink-0"
          :style="{ backgroundColor: themeColor }"
        />
        <span class="min-w-0 text-[14px] leading-[1.5]">
          <span class="block">细心从每一个细节开始</span>
          <span class="block font-semibold">Personal resume</span>
        </span>
      </div>
      <div aria-hidden="true" class="flex shrink-0 gap-3 text-white">
        <span class="flex size-[42px] items-center justify-center rounded-full bg-[#B58A52]">
          <svg
            class="size-[22px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="m2 8 10-5 10 5-10 5L2 8Z" />
            <path d="M6 10v6c3 3 9 3 12 0v-6M21 9v7" />
          </svg>
        </span>
        <span class="flex size-[42px] items-center justify-center rounded-full bg-[#B58A52]">
          <svg
            class="size-[21px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
      </div>
    </div>
    <div aria-hidden="true" class="flex h-[17px] w-full gap-[6px]">
      <span
        class="h-full flex-[0_0_73%] rounded-bl-[4px] [clip-path:polygon(0_0,calc(100%_-_16px)_0,100%_100%,0_100%)]"
        :style="{ backgroundColor: themeColor }"
      />
      <span
        class="h-full min-w-0 flex-1 rounded-br-[4px] bg-[#B58A52] [clip-path:polygon(0_0,100%_0,100%_100%,16px_100%)]"
      />
    </div>
  </header>
</template>
