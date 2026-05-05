<script setup>
import { useResumeStore } from '@/stores'
import dayjs from 'dayjs'
import { getAllScores, getResumeTitle } from '../resume/utils'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const router = useRouter()

const resumeStore = useResumeStore()
const { list, currentIndex } = storeToRefs(resumeStore)
const { maxCount } = resumeStore
const { proxy } = getCurrentInstance()
const getResumePosition = (item) => {
  return item?.data?.user?.position || '未填写求职岗位'
}
const getLastUseTime = (item) => {
  return item?.usage?.lastUseTime ? dayjs(item.usage.lastUseTime).format('YYYY-MM-DD HH:mm') : '--'
}
const getProgressClass = (progress) => {
  if (progress < 40) return 'bg-sf-error'
  if (progress < 60) return 'bg-sf-warning'
  return 'bg-sf-theme'
}

const handleEdit = (index) => {
  currentIndex.value = index
  router.push(`/resume`)
}

const handleDelete = (index) => {
  proxy.$confirm('确定要删除当前简历吗？', '删除确认').then(() => {
    currentIndex.value = index
    resumeStore.deleteResume()
  })
}

const handleCreate = () => {
  if (list.value.length >= maxCount) {
    return
  }
  resumeStore.addResume()
}
</script>

<template>
  <div class="relative z-4 mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-8 py-10">
    <div class="flex items-center justify-between">
      <h2 class="text-[20px] font-black text-sf-theme">简历草稿</h2>
      <button
        type="button"
        class="flex h-11 items-center gap-2 rounded-full border border-sf-theme bg-sf-theme px-10 text-sm font-black text-sf-theme-text shadow-lg shadow-sf-theme/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sf-theme-hover disabled:cursor-not-allowed disabled:opacity-45"
        :disabled="list.length >= maxCount"
        @click="handleCreate"
      >
        新建简历（{{ list.length }}/{{ maxCount }}）
      </button>
    </div>

    <div v-if="list.length" class="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
      <div
        v-for="(item, index) in list"
        :key="item.id || index"
        class="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border border-sf-border bg-sf-primary/96 text-left text-sf-text shadow-[0_24px_54px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 hover:border-sf-theme hover:shadow-[0_30px_70px_rgba(0,0,0,0.26)]"
        @click="handleEdit(index)"
      >
        <div
          class="mr-5 flex h-20 items-center rounded-br-[60px] bg-sf-theme/10 p-5 text-base font-black"
        >
          {{ getResumeTitle(item.data) }}
        </div>
        <div class="p-5">
          <div class="relative z-1 mb-5 flex items-center justify-between">
            <div class="relative z-1 text-sm font-bold text-sf-text-2">
              {{ getResumePosition(item) }}
              <div class="mt-1 text-xs">最后使用：{{ getLastUseTime(item) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full bg-sf-theme/10 text-sf-theme"
              >
                <SfIcon icon="lucide:edit-3" size="4" />
              </span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-full bg-sf-error/10 text-sf-error transition-colors duration-200 hover:bg-sf-error/20"
                @click.stop="handleDelete(index)"
              >
                <SfIcon icon="lucide:trash-2" size="4" />
              </button>
            </div>
          </div>

          <div class="relative z-1 mt-5 h-1.5 w-full rounded-full bg-sf-bg-2">
            <div
              class="h-full rounded-full"
              :class="getProgressClass(getAllScores(item.data).progress)"
              :style="{ width: `${getAllScores(item.data).progress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-sf-border bg-sf-primary/90 p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      <div
        class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sf-theme/10 text-sf-theme"
      >
        <SfIcon icon="lucide:file-text" size="8" />
      </div>
      <div class="text-2xl font-black text-sf-text">还没有简历</div>
      <button
        type="button"
        class="mt-6 flex h-11 items-center gap-2 rounded-full bg-sf-theme px-7 text-base font-black text-sf-theme-text shadow-lg shadow-sf-theme/25 hover:bg-sf-theme-hover"
        @click="handleCreate"
      >
        <SfIcon icon="lucide:plus" size="4" />
        新建简历
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
