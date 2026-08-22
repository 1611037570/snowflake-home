<template>
  <!-- 容器组件包裹 -->
  <component :is="getComponent(currentForm.component)" v-bind="currentForm.props">
    <template #[slotName]>
      <!-- ="slotProps" v-bind="slotProps" -->
      <FormRenderer v-model:items="currentForm" />
    </template>
  </component>
</template>

<script setup lang="ts">
import { isString } from "@/utils";
import { DF_CURRENT_FORM, DF_CURRENT_INDEX, DF_CURRENT_TYPE, DF_REMOVE } from "../code/injectionKeys";
import { getComponent } from "../components";
import FormRenderer from "./formRenderer.vue";

const currentForm = defineModel<any>("currentForm");
const currentIndex = defineModel<any>("currentIndex");

// 处理插槽名称
const slotName = computed(() => {
  const slot = currentForm.value?.slot;
  return isString(slot) && slot.length ? slot : "default";
});
const emit = defineEmits(["removeObject"]);
function remove() {
  emit("removeObject", currentIndex.value);
}
// 提供当前容器的表单数据
provide(DF_CURRENT_FORM, currentForm);
// 提供当前容器的索引
provide(DF_CURRENT_INDEX, currentIndex);
// 提供删除方法
provide(DF_REMOVE, remove);
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "container");
</script>

<style scoped></style>
