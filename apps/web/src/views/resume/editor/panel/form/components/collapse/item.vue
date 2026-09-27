<script setup>
import { $t } from "@/locales";
import { EXPANDED } from "@/stores/modules/resume/config/formConfig";
import { useFormContext } from "@/components/business/dynamicForm/api";
import Icon from "../icon.vue";

const { proxy } = getCurrentInstance();
// 记录折叠状态：复用展开常量，随记录数据持久化
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => EXPANDED,
});
const name = defineModel("name", {
  type: String,
  default: "",
});
// 当前经历项的隐藏状态
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});
const { removeCurrent } = useFormContext();

// 标题：统一走 name 数据源，空值占位符兜底
const displayTitle = computed(() => name.value || $t("notFilled"));

function del() {
  proxy.$confirm($t("deleteItemMessage", { name: name.value }), $t("deleteConfirm")).then(() => {
    removeCurrent();
  });
}
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false">
    <SfCollapseItem name="1" lazy>
      <template #title>
        <div class="group flex h-full w-full items-center justify-between text-sf-text">
          <div class="flex min-w-0 flex-1 items-center text-[15px] font-bold">
            <Icon icon="icon-park-outline:drag" class="item-drag shrink-0 cursor-move!" />
            <span class="truncate">{{ displayTitle }}</span>
          </div>
          <div class="flex shrink-0 items-center">
            <SfTooltip :content="hidden ? $t('show') : $t('hide')">
              <Icon
                :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
                @click.stop="hidden = !hidden"
                :class="hidden ? 'text-sf-theme' : ''"
              />
            </SfTooltip>

            <Icon @click.stop="del" icon="ic:round-delete" />
          </div>
        </div>
      </template>
      <template #default>
        <slot />
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
