<script setup>
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'

const paddingList = [
  {
    name: '紧凑',
    value: 'p-3',
  },
  {
    name: '适中',
    value: 'p-5',
  },
  {
    name: '宽松',
    value: 'p-8',
  },
]

const paddingValue = ref(paddingList[1].value)
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="z-10 flex items-center justify-end border-b border-sf-border bg-white p-2">
      <SfSelect
        :list="paddingList"
        placeholder="请选择间距"
        class="w-[100px]"
        v-model="paddingValue"
      />
    </div>
    <ScaleContainer class="min-h-0 w-full flex-1">
      <ResumePage :paddingClass="paddingValue" />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
