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
// 熟练度档位：一到五档，预览按档位渲染分段熟练度条
const level = defineModel("level", {
  type: Number,
  default: 3,
});
// 当前技能的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 熟练度档位选项：数值写入技能条目 level 字段，预览按档位渲染分段条
const proficiencyOptions = [
  { name: $t("proficiencyBeginner"), value: 1 },
  { name: $t("proficiencyFamiliar"), value: 2 },
  { name: $t("proficiencySkilled"), value: 3 },
  { name: $t("proficiencyExpert"), value: 4 },
  { name: $t("proficiencyMaster"), value: 5 },
];

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
    <!-- 熟练度档位 -->
    <div class="w-28 shrink-0">
      <SfSelect v-model="level" :list="proficiencyOptions" :placeholder="$t('proficiencyLevel')" />
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
