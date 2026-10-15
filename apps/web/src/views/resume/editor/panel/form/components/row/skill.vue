<script setup>
import { $t } from "@/locales";
import { getCurrentInstance } from "vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import Icon from "../icon.vue";

const { proxy } = getCurrentInstance();

// 技能名称数据
const name = defineModel("name", {
  type: String,
  default: "",
});
// 所有技能样式共用一个一到十分的滑块数值。
const level = defineModel("level", { type: Number, default: 7 });
// 当前技能的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 删除当前技能
const removeSkill = () => {
  proxy.$confirm($t("deleteCurrentContent"), $t("deleteConfirm")).then(() => {
    removeCurrent();
  });
};
</script>

<template>
  <div class="flex w-full items-center gap-1">
    <!-- 拖拽排序手柄 -->
    <SfIcon
      icon="icon-park-outline:drag"
      size="4"
      class="item-drag mr-1 cursor-move!"
      @click.stop=""
    />
    <!-- 名称 -->
    <div class="min-w-0 flex-1">
      <SfInput v-model="name" :placeholder="$t('skillNamePlaceholder')" />
    </div>
    <!-- 十分制滑块统一控制所有技能样式。 -->
    <div class="w-45 shrink-0">
      <SfSlider v-model="level" :min="1" :max="10" :step="1" size="small" />
    </div>
    <!-- 隐藏当前技能 -->
    <SfTooltip :content="hidden ? $t('show') : $t('hide')">
      <Icon
        :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
        @click.stop="hidden = !hidden"
        :class="hidden ? 'text-sf-theme' : ''"
      />
    </SfTooltip>
    <!-- 删除按钮 -->
    <Icon icon="ic:round-delete" @click="removeSkill" />
  </div>
</template>

<style lang="scss" scoped></style>
