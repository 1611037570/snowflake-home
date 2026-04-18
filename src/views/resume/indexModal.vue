<template>
  <SfModal v-if="indexVisible" v-model="indexVisible">
    <div v-if="list.length"></div>
    <div
      v-else
      class="relative flex min-h-[450px] w-full flex-col items-center justify-center p-10"
    >
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-indigo-50/80 blur-3xl"
        ></div>
        <div
          class="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-50/80 blur-3xl"
        ></div>
        <div
          class="absolute top-1/4 right-1/4 h-20 w-20 rounded-full bg-purple-50/60 blur-2xl"
        ></div>
      </div>

      <div class="relative z-10 flex flex-col items-center text-center">
        <div class="group relative mb-8">
          <div
            class="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20 group-hover:hidden"
          ></div>
          <div
            class="relative flex h-28 w-28 items-center justify-center rounded-3xl text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
          >
            <SfIcon name="document-text" size="56" />
          </div>
        </div>

        <h3 class="mb-4 text-3xl font-extrabold tracking-tight text-slate-800">开启职业新篇章</h3>

        <p class="mb-10 max-w-[280px] text-base leading-relaxed text-slate-500">
          你还没有创建过简历。现在只需几分钟，即可生成一份令 HR 眼前一亮的专业简历。
        </p>
        <div class="w-full max-w-[240px]">
          <ElButton
            type="primary"
            @click="openResume"
            class="w-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-[0_15px_25px_-10px_rgba(79,70,229,0.4)] active:scale-95"
          >
            立即创建简历
          </ElButton>
        </div>

        <p class="mt-8 flex items-center gap-2 text-sm font-medium text-slate-400">
          <span class="h-1 w-1 rounded-full bg-slate-300"></span>
          已有 10,000+ 用户通过此模板获得面试
          <span class="h-1 w-1 rounded-full bg-slate-300"></span>
        </p>
      </div>
    </div>
  </SfModal>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import { routerNavigation } from '@/utils'
import { storeToRefs } from 'pinia'
const resumeStore = useResumeStore()
const { indexVisible, list } = storeToRefs(resumeStore)

const openResume = () => {
  routerNavigation('resume')
}
</script>

<style scoped></style>
