<template>
  <ElSelect
    v-model="value"
    v-bind="$attrs"
    :ref="changeRef"
    :append-to="dropdownContent"
    class="flex-1 rounded-3xl! text-sf-base"
    :class="bg"
  >
    <!-- 支持自行输入的下拉：首行固定一条提示，告知预置选项之外还能输入自定义值 -->
    <ElOption
      v-if="canInputCustom"
      :value="INPUT_HINT_VALUE"
      :label="$t('dropdownInputHint')"
      disabled
      class="rounded-2xl!"
    />
    <ElOption
      v-for="item in list"
      :key="item.value"
      :label="item.name"
      :value="item.value"
      class="rounded-2xl!"
    >
      <!-- 选项可提供通用图标，模型列表与其他下拉共用展示能力。 -->
      <span v-if="item.icon" class="flex min-w-0 items-center gap-[9px]">
        <SfIcon :icon="item.icon" size="5" class="shrink-0" />
        <span class="truncate">{{ item.name }}</span>
      </span>
      <template v-else>{{ item.name }}</template>
    </ElOption>
    <template v-for="(item, name) in slots" #[name]>
      <slot :name="name" />
    </template>
  </ElSelect>
</template>

<script setup lang="ts">
import { ElSelect } from "element-plus";
import type { ComponentInstance, PropType } from "vue";
import { computed, getCurrentInstance, inject, useAttrs, useSlots } from "vue";

defineOptions({ name: "SfSelect" });

const bg = inject("bg");
const dropdownContent = inject<HTMLElement | undefined>("sfDropdownContent", undefined);
const slots = useSlots();
const attrs = useAttrs();

// 首行提示的标识值：禁用态不可选中，仅用于承载提示文案
const INPUT_HINT_VALUE = "__dropdown_input_hint__";
// 模板无值属性编译为空字符串而非 true，与配置里的布尔 true 同样算开启；仅显式 false 或未传才算关闭
const isAttrEnabled = (value: unknown) => value !== false && value !== undefined;
// 同时开启筛选与允许创建时，用户才可以在预置选项之外输入自定义值
const canInputCustom = computed(() => isAttrEnabled(attrs.filterable) && isAttrEnabled(attrs.allowCreate));

type SelectOption = {
  // 选项对应的值。
  value: string;
  // 选项展示名称。
  name: string;
  // 可选图标标识，不提供时沿用纯文字展示。
  icon?: string;
};

defineProps({
  list: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});
const value: any = defineModel("modelValue");

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElSelect>);
</script>

<style scoped lang="scss">
:deep(.el-select__wrapper) {
  /* 移除阴影 */
  box-shadow: none;
  /* 移除背景 */
  background-color: transparent;
}
</style>
