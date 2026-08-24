<template>
  <el-row ref="row" :class="{ 'drag-container-active': isDragging }" :gutter="12" :key="items.id">
    <FormItem :currentForm="item" v-for="(item, index) in items.fields" :key="item.id">
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <!-- v-bind="$attrs" -->
      <ContainerSlot
        v-else-if="item.slot"
        :currentForm="item"
        :currentIndex="index"
        @removeObject="removeObject"
      />
      <component
        v-else
        :is="item.type === 'object' ? ContainerObject : ContainerArray"
        :currentForm="item"
        :currentIndex="containerIndex ?? index"
        @removeObject="removeObject"
        @removeItem="removeItem"
      />
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from "@/utils";
import { useDraggable } from "vue-draggable-plus";
import { checkForm } from "../code/checkForm.ts";
import { DF_ROOT_DATA } from "../code/injectionKeys.ts";
import ContainerSlot from "./containerSlot.vue";
import ContainerArray from "./containerArray.vue";
import ContainerObject from "./containerObject.vue";
import FormError from "./formError.vue";
import FormItem from "./formItem.vue";

defineOptions({ name: "FormRenderer" });
// 容器索引：插槽递归时由上层容器（ContainerSlot）显式传入 array 子项的数据索引；顶层未传
defineProps<{
  containerIndex?: any;
}>();
const rootData: any = inject(DF_ROOT_DATA);
const row: any = useTemplateRef("row");
// 表单数据
const items = defineModel<any>("items", {});
const isDragging = ref(false);
// 拖拽实例
let draggable: ReturnType<typeof useDraggable> | null = null;

// 移除对象
function removeObject(index: number) {
  rootData.removeObject(items.value.fields[index]);
  items.value.fields.splice(index, 1);
}
// 移除数组项
function removeItem(index: number) {
  rootData.removeItem(items.value.list[index], index);
  items.value.list.splice(index, 1);
}

function ensureFieldIds(fields: any[]) {
  if (!fields) return;
  fields.forEach((item: any) => {
    if (!item.id) {
      item.id = getUUID().slice(0, 4);
    }
  });
}
onMounted(async () => {
  await nextTick();
  if (!items.value.id) {
    items.value.id = getUUID().slice(0, 4);
  }
  ensureFieldIds(items.value.fields);
  watch(
    () => [items.value?.fields, items.value?.fields?.length],
    () => {
      ensureFieldIds(items.value?.fields);
    },
  );

  if (!items.value?.drag) {
    return;
  }
  // 初始化拖拽
  draggable = useDraggable(row, items.value.fields, {
    animation: 150,
    ghostClass: "ghost",
    handle: items.value?.dragClass || "",
    onStart() {
      isDragging.value = true;
    },
    onEnd() {
      isDragging.value = false;
    },
  });
});
onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border-radius: 20px;
}
.drag-container-active {
  position: relative;
  border-radius: 12px;
}
.drag-container-active::after {
  position: absolute;
  inset: 0 6px;
  z-index: 1;
  box-sizing: border-box;
  border: 1px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
}
</style>
