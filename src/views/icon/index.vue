<script setup>
import { ICON_LIST } from '@/constants'
import { ref } from 'vue'
const icons = Object.values(ICON_LIST)
const successIcons = ref([])
const failedIcons = ref([])
function onSuccess(icon) {
  if (!successIcons.value.includes(icon)) successIcons.value.push(icon)
  const i = failedIcons.value.indexOf(icon)
  if (i > -1) failedIcons.value.splice(i, 1)
}
function onFail(icon) {
  if (!failedIcons.value.includes(icon)) failedIcons.value.push(icon)
  const i = successIcons.value.indexOf(icon)
  if (i > -1) successIcons.value.splice(i, 1)
}
</script>

<template>
  <SfViewContainer>
    <h1 class="p-4 text-2xl font-bold">图标示例</h1>

    <div v-show="false">
      <SfIcon
        v-for="item in icons"
        :key="'all-' + item.icon"
        :icon="item.icon"
        @success="onSuccess(item.icon)"
        @fail="onFail(item.icon)"
      />
    </div>

    <div v-if="successIcons.length" class="mb-4 rounded-xl bg-sf-bg p-3">
      <h2 class="px-2 pb-2 text-lg font-semibold">加载成功 ({{ successIcons.length }})</h2>
      <div class="grid grid-cols-14 gap-4">
        <SfIcon
          v-for="icon in successIcons"
          :key="'succ-' + icon"
          :icon="icon"
          class="rounded-xl bg-sf-primary text-sf-text ring-2 ring-green-500"
          size="9"
          boxSize="12"
        />
      </div>
    </div>

    <div v-if="failedIcons.length" class="rounded-xl bg-sf-bg p-3">
      <h2 class="px-2 pb-2 text-lg font-semibold">加载失败 ({{ failedIcons.length }})</h2>
      <div class="grid grid-cols-14 gap-4">
        <SfIcon
          v-for="icon in failedIcons"
          :key="'fail-' + icon"
          :icon="icon"
          class="rounded-xl bg-sf-primary text-sf-text ring-2 ring-red-500"
          size="9"
          boxSize="12"
        />
      </div>
    </div>
  </SfViewContainer>
</template>

<style lang="scss" scoped></style>
