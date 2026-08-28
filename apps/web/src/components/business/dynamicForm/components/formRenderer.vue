<template>
  <el-row ref="row" :class="{ 'drag-container-active': isDragging }" :gutter="12" :key="items.id">
    <!-- :data-module-key="item.key" 临时增加 后期提供新方案 内部还能框选 -->
    <FormItem
      :currentForm="item"
      :data-module-key="item.key"
      v-for="(item, index) in items.fields"
      :key="item.id"
      :class="{ 'module-selected-blink': isModuleSelected(item) }"
      @mouseenter="handleModuleMouseEnter(item)"
    >
      <!-- 校验失败：展示友好的错误提示 -->
      <FormError v-if="!checkForm(item)" :error-msg="item.errorMsg" :raw="item.raw" />
      <!-- v-bind="$attrs" -->
      <ContainerSlot
        v-else-if="item.type === 'group'"
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
import { DF_MODULE_SELECT, DF_ROOT_DATA } from "../code/injectionKeys.ts";
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
// 模块选中能力：由根组件提供，动态表单内部契约，调用方按约定传 key
const moduleSelect = inject(DF_MODULE_SELECT)!;
// 模块是否处于选中状态：与选中的模块 key 匹配时边框持续闪烁
const isModuleSelected = (item: any) => moduleSelect.selectedKey.value === item.key;
// 鼠标经过模块恢复正常：清除选中状态停止闪烁
const handleModuleMouseEnter = (item: any) => {
  if (isModuleSelected(item)) {
    moduleSelect.selectModule(null);
  }
};
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
/* 选中模块：边框持续闪烁提示（作用于模块级 FormItem） */
.module-selected-blink {
  position: relative;
}
.module-selected-blink::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  border: 1px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
  animation: module-blink 1s ease-in-out infinite;
}
@keyframes module-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
</style>
