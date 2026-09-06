<script setup>
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

// 荣誉证书名称数据
const name = defineModel("name", {
  type: String,
  default: "",
});
const { currentIndex, removeItem } = inject("df/context")();

// 删除当前荣誉证书
const removeHonor = (index) => {
  proxy.$confirm("确定要删除当前内容吗？", "删除确认").then(() => {
    removeItem(index);
  });
};
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <!-- 拖拽排序手柄 -->
    <SfIcon
      icon="icon-park-outline:drag"
      size="4"
      class="item-drag mr-1 cursor-move!"
      @click.stop=""
    />
    <!-- 名称 -->
    <div class="min-w-0 flex-1">
      <SfInput v-model="name" placeholder="荣誉证书名称" />
    </div>
    <!-- 删除按钮 -->
    <SfIcon
      icon="ic:round-delete"
      size="4"
      class="shrink-0 cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
      @click="removeHonor(currentIndex)"
    />
  </div>
</template>

<style lang="scss" scoped></style>
