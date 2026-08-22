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
import { inject, toRef } from "vue";
import { getComponent } from "../components";
import {
  DF_CURRENT_FORM,
  DF_CURRENT_INDEX,
  DF_CURRENT_TYPE,
  DF_REMOVE,
  DF_ROOT_DATA,
} from "../code/injectionKeys";

const props = defineProps<{
  currentIndex?: any;
  currentForm: any;
}>();

const rootData = inject(DF_ROOT_DATA);

const bindEvent = computed(() => {
  return rootData.setDataProxy(props.currentForm.model, props.currentIndex);
});

const component = computed(() => getComponent(props.currentForm?.component));
const emit = defineEmits(["removeObject"]);

function remove() {
  emit("removeObject", props.currentIndex);
}
// 提供当前容器的索引
provide(DF_CURRENT_INDEX, toRef(props, "currentIndex"));
// 提供当前容器的表单数据（统一提供 ref，与 container/containerArray 保持一致）
provide(DF_CURRENT_FORM, toRef(props, "currentForm"));
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "object");
// 提供删除方法
provide(DF_REMOVE, remove);
</script>

<style scoped></style>
