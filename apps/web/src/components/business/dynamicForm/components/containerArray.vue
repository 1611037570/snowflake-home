<template>
  <el-row
    class="m-0! w-full gap-3"
    :class="[{ 'drag-array-active': isDragging }, currentForm?.rowClass]"
    :gutter="0"
    ref="row"
  >
    <!-- 数组记录样式与数组字段自身样式分离 -->
    <!-- 记录下标：作为滚动定位锚点，同时用于记录级选中的匹配 -->
    <FormItem
      v-for="item in formListWithStyle"
      :class="currentForm?.itemClass"
      :currentForm="item.item"
      :key="item.key"
      :data-item-index="item.index"
      :pathContext="getPathContext(item.index)"
      :selected="isRecordSelected(item.index)"
      :style="item.style"
      @mouseenter="clearRecordSelect(item.index)"
    >
      <ContainerSlot
        v-if="item.item.type === 'group'"
        :currentForm="item.item"
        :pathContext="getPathContext(item.index)"
        @removeObject="remove(item.index)"
      />
      <ContainerObject
        v-else
        :currentForm="item.item"
        :pathContext="getPathContext(item.index)"
        @removeObject="remove(item.index)"
      />
    </FormItem>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from "@/utils";
import { computed, inject, onMounted, onUnmounted, ref, toRaw } from "vue";
import { useDraggable } from "vue-draggable-plus";
import { getArrayRecords, removeArrayRecord } from "../code/arrayData.ts";
import { getFormItemStyles } from "../code/formItemStyle";
import type { DataPathContext } from "../code/pathContext";
import { getArrayDataPath } from "../code/schemaAccess";
import { DF_MODULE_SELECT, DF_ROOT_DATA } from "../code/injectionKeys.ts";
import { provideContainerContext } from "../code/provideContainerContext";
import ContainerObject from "./containerObject.vue";
import ContainerSlot from "./containerSlot.vue";
import FormItem from "./formItem.vue";
const row: any = useTemplateRef("row");

const { pathContext } = defineProps<{
  pathContext?: DataPathContext;
}>();
const currentForm: any = defineModel("currentForm");
const rootData: any = inject(DF_ROOT_DATA);
const isDragging = ref(false);
// 数组容器直接读取真实记录，并允许拖拽组件整体回写顺序
const records = computed<any[]>({
  get: () => getArrayRecords(rootData.data, currentForm.value, pathContext) || [],
  set: (value) => {
    const current = getArrayRecords(rootData.data, currentForm.value, pathContext);
    if (current) current.splice(0, current.length, ...value);
  },
});
// 记录标识仅用于渲染，不写入业务数据
const recordKeys = new WeakMap<object, string>();
const getRecordKey = (record: any, index: number) => {
  if (record && typeof record === "object") {
    const target = toRaw(record);
    if (!recordKeys.has(target)) recordKeys.set(target, getUUID());
    return recordKeys.get(target);
  }
  return `${index}-${String(record)}`;
};
// 为每条数组记录创建子项字段使用的数据路径上下文
const getPathContext = (index: number): DataPathContext | undefined => {
  const source = getArrayDataPath(currentForm.value, pathContext);
  return source ? { basePath: source, index } : undefined;
};
// 延迟到真实根元素挂载完成后再启动拖拽
const draggable = useDraggable(null, records, {
  immediate: false,
  handle: currentForm.value?.dragClass || "",
  animation: 300,
  easing: "cubic-bezier(.2, .8, .2, 1)",
  ghostClass: "ghost",
  // 用克隆体跟手拖拽，才能给拖拽中的条目加缩放与投影
  forceFallback: true,
  fallbackClass: "df-drag-fallback",
  fallbackOnBody: true,
  onStart: (e) => {
    e.stopPropagation();
    isDragging.value = true;
  },
  onEnd() {
    isDragging.value = false;
  },
});
onMounted(async () => {
  await nextTick();

  if (!currentForm.value?.drag) {
    return;
  }

  const element = row.value?.$el ?? row.value;
  if (!(element instanceof HTMLElement)) return;

  draggable.start(element);
});
onUnmounted(() => {
  draggable.destroy();
});

const length = computed(() => records.value.length);
const formListWithStyle = computed(() => {
  const list = records.value;
  const itemSchema = currentForm.value?.itemSchema;
  // 数组记录共享 itemSchema，间距应依据字段跨度而不是业务数据计算
  const styles = getFormItemStyles(list.map(() => itemSchema));
  return list.map((item: any, index: number) => {
    return {
      item: itemSchema,
      index,
      key: getRecordKey(item, index),
      style: styles[index],
    };
  });
});

// 删除
const remove = (index: any) => {
  removeArrayRecord(rootData.data, currentForm.value, index, pathContext);
};
// 模块选中能力：记录与外层共用同一选中契约，用于高亮命中的那条记录
const moduleSelect = inject(DF_MODULE_SELECT)!;
// 所属模块标识：数组数据路径的首段即模块 key
const moduleKey = computed(() => getArrayDataPath(currentForm.value, pathContext)?.[0]);
// 记录是否处于选中状态：模块标识与记录下标同时匹配
const isRecordSelected = (index: number) =>
  moduleSelect.selectedKey.value != null &&
  moduleSelect.selectedKey.value === moduleKey.value &&
  moduleSelect.selectedIndex?.value === index;
// 鼠标进入记录时清除选中，避免边框持续闪烁
const clearRecordSelect = (index: number) => {
  if (isRecordSelected(index)) moduleSelect.selectModule(null);
};
// 统一提供容器上下文：类型、表单配置与记录数；删除与路径由记录节点提供
provideContainerContext({
  type: "array",
  form: currentForm,
  length,
});
</script>

<style scoped>
/* 拖拽时原位仅保留占位高度，视觉上不可见 */
.ghost {
  opacity: 0;
}

/* 跟手拖拽的克隆体：抬升并微放大，位移由 Sortable 每帧写入 matrix 控制 */
.df-drag-fallback {
  transform: scale(1.03);
  /* 与卡片自身 rounded-3xl 保持一致，避免拖拽时圆角突变 */
  border-radius: 24px;
  opacity: 1 !important;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.18);
}
.drag-array-active {
  position: relative;
  border-radius: 12px;
}
.drag-array-active::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  border: 2px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
}
</style>
