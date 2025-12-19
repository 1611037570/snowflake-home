<template>
  <ElDropdown trigger="hover">
    <div
      class="flex-c group relative rounded-md p-1 transition-all duration-300 hover:bg-sf-theme/20"
      @click="goUrl(item.url)"
    >
      <SfIcon :icon="item.icon" :auto="false" size="6" class="" />
      <SfIcon
        v-if="item.qrcode"
        icon="fa7-solid:qrcode"
        size="3"
        class="absolute! -right-0.5 -bottom-0.5 z-10 text-sf-base"
      />
    </div>
    <template #dropdown>
      <div class="relative flex flex-col items-center justify-center overflow-hidden p-3">
        <div
          v-if="item.type"
          class="absolute top-0 right-0 rounded-bl-md bg-sf-theme px-1 text-white"
        >
          {{ item.type === 'dev' ? '开发' : '摄影' }}
        </div>
        <div class="font-bold text-sf-theme">
          {{ item.name }}
        </div>
        <div class="flex-c w-[128px] text-[12px] text-white">点击浏览web端</div>
        <template v-if="item.qrcode">
          <div class="relative my-2 overflow-hidden rounded-sm bg-white p-1">
            <div class="h-[128px] w-[128px]">
              <SfQrcode :value="item.url" :size="128" />
            </div>
            <div class="qr-scan-line"></div>
          </div>
          <div class="text-[12px] text-white">{{ item.name }}app内浏览</div>
        </template>
      </div>
    </template>
  </ElDropdown>
</template>

<script setup>
import { urlNavigation } from '@/utils'
defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})
function goUrl(url) {
  urlNavigation(url)
}
</script>

<style lang="scss" scoped>
.qr-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--sf-theme), transparent);
  box-shadow:
    0 0 10px var(--sf-theme),
    0 0 20px var(--sf-theme),
    0 0 30px var(--sf-theme);
  animation: scan 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
  z-index: 2;
  border-radius: 2px;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    box-shadow: none;
    top: 100%;
    opacity: 0;
  }
}
</style>
