<template>
  <component
    :is="component"
    v-bind="{
      ...rootData.getDataProxy(currentForm.model, pathContext),
      ...currentForm.props,
    }"
    v-on="bindEvent"
  ></component>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { getComponent } from "../code/getComponent";
import { DF_ROOT_DATA } from "../code/injectionKeys";
import type { DataPathContext } from "../code/pathContext";
import { provideContainerContext } from "../code/provideContainerContext";

const { currentForm, pathContext } = defineProps<{
  currentForm: any;
  pathContext?: DataPathContext;
}>();

const rootData: any = inject(DF_ROOT_DATA);

const bindEvent = computed(() => {
  return rootData.setDataProxy(currentForm.model, pathContext);
});

const component = computed(() => getComponent(currentForm?.component));
const emit = defineEmits(["removeObject"]);

function remove() {
  emit("removeObject");
}
// 统一提供容器上下文：类型、表单配置、路径与删除能力
provideContainerContext({
  type: "object",
  form: () => currentForm,
  pathContext: () => pathContext,
  remove,
});
</script>

<style scoped></style>
