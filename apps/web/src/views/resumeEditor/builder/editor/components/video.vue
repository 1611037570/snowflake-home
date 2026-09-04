<script setup>
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const name = defineModel("name", {
  type: String,
  default: "",
});
const url = defineModel("url", {
  type: String,
  default: "",
});
const desc = defineModel("desc", {
  type: String,
  default: "",
});
const { currentIndex, removeItem } = inject("df/context")();

// 删除视频作品
const removeVideo = (index) => {
  proxy.$confirm("确定要删除当前内容吗？", "删除确认").then(() => {
    removeItem(index);
  });
};
</script>

<template>
  <div class="flex w-full flex-col gap-1">
    <div class="flex items-center">
      <SfIcon
        icon="icon-park-outline:drag"
        size="4"
        class="item-drag mr-1 cursor-move!"
        @click.stop=""
      />
      <div class="w-[100px] min-w-0">
        <SfInput v-model="name" placeholder="视频名称" />
      </div>
      <div class="min-w-0 flex-1">
        <SfInput v-model="url" placeholder="视频链接" />
      </div>
      <!-- 删除按钮 -->
      <SfIcon
        icon="ic:round-delete"
        size="4"
        boxSize="8"
        class="shrink-0 cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
        @click="removeVideo(currentIndex)"
      />
    </div>
    <div class="flex items-center">
      <div class="flex w-[60px]">介绍：</div>
      <SfInput v-model="desc" placeholder="视频介绍" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
