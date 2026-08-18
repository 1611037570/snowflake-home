<script setup>
import { ICON_LIST } from "@/configs";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { ref } from "vue";
const icons = Object.values(ICON_LIST);
const successIcons = ref([]);
const failedIcons = ref([]);
const { copy } = useClipboard();
function handleCopy(icon) {
  copy(icon)
    .then(() => ElMessage.success(`已复制: ${icon}`))
    .catch(() => ElMessage.error("复制失败"));
}
function onSuccess(icon) {
  if (!successIcons.value.includes(icon)) successIcons.value.push(icon);
  const i = failedIcons.value.indexOf(icon);
  if (i > -1) failedIcons.value.splice(i, 1);
}
function onFail(icon) {
  if (!failedIcons.value.includes(icon)) failedIcons.value.push(icon);
  const i = successIcons.value.indexOf(icon);
  if (i > -1) successIcons.value.splice(i, 1);
}
</script>

<template>
  <SfViewContainer>
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
          class="cursor-pointer rounded-xl bg-sf-primary text-sf-text ring-2 ring-green-500"
          size="9"
          boxSize="12"
          @click="handleCopy(icon)"
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
