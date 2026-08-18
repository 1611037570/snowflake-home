<template>
  <Component
    v-model="value"
    :is="h(ElSelect, { ...$attrs, ref: changeRef })"
    v-bind="$attrs"
    ref="changeRef"
    class="text-sf-base"
    :class="bg"
  >
    <ElOption v-for="item in list" :key="item.value" :label="item.name" :value="item.value" />
    <template v-for="(item, name) in slots" #[name]>
      <slot :name="name" />
    </template>
  </Component>
</template>

<script setup lang="ts">
import { ElSelect } from "element-plus";
import type { ComponentInstance, PropType } from "vue";
import { getCurrentInstance, useSlots, h } from "vue";

defineOptions({ name: "SfSelect" });

const bg = inject("bg");
const slots = useSlots();

defineProps({
  list: {
    type: Array as PropType<{ value: string; name: string }[]>,
    default: () => [],
  },
});
const value = defineModel("modelValue");

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
