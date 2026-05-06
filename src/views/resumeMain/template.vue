<script setup>
import { useResumeStore } from '@/stores'
import { xiaoYangResumeItem } from '@/stores/modules/resume/xiaoYangData'
const resumeStore = useResumeStore()

function selectTemplate(templateName) {
  if (templateName === 'xiaoYang') {
    resumeStore.addResume(xiaoYangResumeItem)
  }
}
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-8">
    <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
    <div class="group relative h-[400px] w-[282px] rounded-xl bg-sf-theme">
      <div
        class="absolute top-0 left-0 h-[400px] w-[282px] rounded-xl bg-red-200 transition-all duration-300 group-hover:top-[-6px] group-hover:left-[-6px]"
      >
        <div
          @click="selectTemplate('xiaoYang')"
          class="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer rounded-xl bg-sf-theme px-4 py-2 text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          使用模板
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
