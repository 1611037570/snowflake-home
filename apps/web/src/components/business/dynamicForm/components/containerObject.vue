<template>
  <component
    :is="component"
    v-bind="{
      ...rootData.getDataProxy(currentForm.model, currentIndex),
      ...currentForm.props,
      // ...$attrs,
    }"
    v-on="bindEvent"
  ></component>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { getComponent } from "../code/getComponent";
import {
  DF_CONTEXT,
  DF_CURRENT_FORM,
  DF_CURRENT_INDEX,
  DF_CURRENT_TYPE,
  DF_REMOVE,
  DF_ROOT_DATA,
} from "../code/injectionKeys";

const { currentIndex, currentForm } = defineProps<{
  currentIndex?: any;
  currentForm: any;
}>();

const rootData: any = inject(DF_ROOT_DATA);

const bindEvent = computed(() => {
  return rootData.setDataProxy(currentForm.model, currentIndex);
});

const component = computed(() => getComponent(currentForm?.component));
const emit = defineEmits(["removeObject"]);

function remove() {
  emit("removeObject", currentIndex);
}
// 提供当前容器的索引
provide(DF_CURRENT_INDEX, currentIndex);
// 提供当前容器的表单数据（统一提供 ref，与 container/containerArray 保持一致）
provide(DF_CURRENT_FORM, currentForm);
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "object");
// 提供删除方法
provide(DF_REMOVE, remove);
// 对外上下文契约：聚合父级上下文 + 当前对象容器能力
const parentContext = inject(DF_CONTEXT, {});
provide(DF_CONTEXT, {
  ...parentContext,
  currentForm,
  currentIndex,
  currentType: "object",
  removeSelf: remove,
});
</script>

<style scoped></style>
