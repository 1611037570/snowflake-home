<template>
  <div class="h-full w-full">
    <div class="flex-c h-full w-full flex-col bg-sf-primary" v-if="showContent">
      <div class="relative h-32 w-32">
        <!-- 外层光环：代表时间流动 -->
        <div
          class="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-sf-text-3"
        ></div>

        <!-- 内层逆转环：代表逆转时空 -->
        <div
          class="absolute inset-4 animate-[spin_4s_linear_infinite_reverse] rounded-full border-2 border-sf-theme-hover border-t-sf-theme-hover border-l-transparent"
        ></div>

        <!-- 中心沙漏效果 -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <SfIcon icon="tabler:hourglass" size="8" class="animate-pulse text-sf-text" />
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center gap-2">
        <p class="text-xl font-medium tracking-wide text-sf-text-2">"{{ $t('load') }}"</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const showContent = ref(false)

useTimeoutFn(() => {
  showContent.value = true
}, 100)
</script>

<style scoped></style>
