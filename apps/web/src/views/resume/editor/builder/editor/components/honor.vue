<script setup>
import { getCurrentInstance } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import Icon from "../icon.vue";

const { proxy } = getCurrentInstance();

// 荣誉证书名称数据
const name = defineModel("name", {
  type: String,
  default: "",
});
// 当前荣誉证书的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 删除当前荣誉证书
const removeHonor = () => {
  proxy.$confirm("确定要删除当前内容吗？", "删除确认").then(() => {
    removeCurrent();
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
    <!-- 隐藏当前荣誉证书 -->
    <SfTooltip :content="hidden ? '显示' : '隐藏'">
      <Icon :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'" @click.stop="hidden = !hidden" />
    </SfTooltip>
    <!-- 删除按钮 -->
    <Icon icon="ic:round-delete" @click="removeHonor" />
  </div>
</template>

<style lang="scss" scoped></style>
