<script setup>
import { PROJECT_PAGE } from '@/constants'

const router = useRouter()
const currentRoute = ref(localStorage.getItem('snowflakeRoute') || '')
const recommendedPage = computed(() => PROJECT_PAGE.value.find((item) => item.url === '/home'))
const pageList = computed(() =>
  PROJECT_PAGE.value.filter((item) => !item.hidden && item.url !== '/home'),
)

function handleSelect(item) {
  currentRoute.value = item.url
}

function handleConfirm() {
  if (!currentRoute.value) return
  localStorage.setItem('snowflakeRoute', currentRoute.value)
  router.push(currentRoute.value)
}
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center bg-sf-bg px-4 py-10 text-sf-base">
    <div class="w-full max-w-3xl">
      <div class="mb-8 flex flex-col items-center justify-center">
        <div class="mb-2 text-2xl font-black">初始化项目</div>
        <div class="text-sm text-sf-text-2">
          选择一个喜欢的项目作为您的起始页，之后可在设置中修改。
        </div>
      </div>
      <div class="mb-3 text-center text-sm font-black text-sf-theme">推荐页面</div>
      <button
        v-if="recommendedPage"
        type="button"
        class="mb-6 flex w-full cursor-pointer items-center rounded-xl border p-4 text-left transition hover:bg-sf-bg-hover"
        :class="
          currentRoute === recommendedPage.url
            ? 'border-sf-theme bg-sf-theme/10'
            : 'border-sf-border bg-sf-primary'
        "
        @click="handleSelect(recommendedPage)"
      >
        <div class="mr-3 flex h-9 w-9 shrink-0 items-center justify-center">
          <SfLogo v-if="recommendedPage.icon" :name="recommendedPage.icon" :size="8" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="truncate font-bold text-sf-base">{{ recommendedPage.name }}</div>
          <div v-if="recommendedPage.desc" class="mt-1 line-clamp-2 text-sm text-sf-text-2">
            {{ recommendedPage.desc }}
          </div>
        </div>
      </button>

      <div class="mb-3 text-center text-sm font-black text-sf-text-2">其他页面</div>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          v-for="item in pageList"
          :key="item.url"
          type="button"
          class="flex cursor-pointer items-center rounded-xl border p-4 text-left transition hover:bg-sf-bg-hover"
          :class="
            currentRoute === item.url
              ? 'border-sf-theme bg-sf-theme/10'
              : 'border-sf-border bg-sf-primary'
          "
          @click="handleSelect(item)"
        >
          <div class="mr-3 flex h-9 w-9 shrink-0 items-center justify-center">
            <SfLogo v-if="item.icon" :name="item.icon" :size="9" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate font-bold text-sf-base">{{ item.name }}</div>
            <div v-if="item.desc" class="mt-1 line-clamp-2 text-sm text-sf-text-2">
              {{ item.desc }}
            </div>
          </div>
        </button>
      </div>

      <div class="flex-c mt-8">
        <button
          type="button"
          class="h-10 cursor-pointer rounded-full bg-sf-theme px-8 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!currentRoute"
          @click="handleConfirm"
        >
          开始使用
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
