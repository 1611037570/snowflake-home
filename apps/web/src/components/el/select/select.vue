<template>
  <ElSelect
    v-model="value"
    v-bind="$attrs"
    :ref="changeRef"
    class="flex-1 rounded-3xl! text-sf-base"
    :class="bg"
  >
    <ElOption
      v-for="item in list"
      :key="item.value"
      :label="item.name"
      :value="item.value"
      class="rounded-2xl!"
    />
    <template v-for="(item, name) in slots" #[name]>
      <slot :name="name" />
    </template>
  </ElSelect>
</template>

<script setup lang="ts">
import { ElSelect } from "element-plus";
import type { ComponentInstance, PropType } from "vue";
import { getCurrentInstance, useSlots } from "vue";

defineOptions({ name: "SfSelect" });

const bg = inject("bg");
const slots = useSlots();

defineProps({
  list: {
    type: Array as PropType<{ value: string; name: string }[]>,
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
