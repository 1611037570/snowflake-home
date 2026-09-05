<script setup>
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

// 社交账号列表数据
const name = defineModel("name", {
  type: String,
  default: "",
});
const url = defineModel("url", {
  type: String,
  default: "",
});
const { currentIndex, removeItem } = inject("df/context")();

// 删除社交账号
const removeAccount = (index) => {
  proxy.$confirm("确定要删除当前内容吗？", "删除确认").then(() => {
    removeItem(index);
  });
};
</script>

<template>
  <div class="flex w-full items-center gap-3">
    <SfIcon
      icon="icon-park-outline:drag"
      size="4"
      class="item-drag mr-1 cursor-move!"
      @click.stop=""
    />
    <!-- 第一个是平台 -->
    <div class="w-22 min-w-0">
      <SfInput v-model="name" placeholder="平台" />
    </div>
    <!-- 第二个是网址 -->
    <div class="min-w-0 flex-1">
      <SfInput v-model="url" placeholder="网址" />
    </div>
    <!-- 删除按钮 -->
    <SfIcon
      icon="ic:round-delete"
      size="4"
      boxSize="8"
      class="shrink-0 cursor-pointer rounded-lg transition-colors hover:text-sf-theme"
      @click="removeAccount(currentIndex)"
    />
  </div>
</template>

<style lang="scss" scoped></style>
