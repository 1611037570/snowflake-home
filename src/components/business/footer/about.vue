<template>
  <SfModal v-model="modalValue" title="关于项目">
    <ElScrollbar class="h-[600px] w-100" style="height: 600px">
      <div class="flex-c">
        <SfImg
          :src="snowIcon"
          class="h-7.5 w-7.5 transition-all duration-200 hover:rotate-180"
          fit="contain"
        />
      </div>
      <div class="flex">
        运行时长：
        {{ runTime }}天
      </div>
    </ElScrollbar>
  </SfModal>
</template>
<script setup>
import snowIcon from '@/assets/images/snow.svg'
import { useSystemStore } from '@/stores'
const modalValue = defineModel()
const systemStore = useSystemStore()
const { runTime } = storeToRefs(systemStore)
</script>
