<template>
  <el-row
    class="m-0! w-full gap-3"
    :class="[{ 'drag-array-active': isDragging }, currentForm?.rowClass]"
    :gutter="0"
    ref="row"
  >
    <!-- 数组记录样式与数组字段自身样式分离 -->
    <FormItem
      v-for="item in formListWithStyle"
      :class="currentForm?.itemClass"
      :currentForm="item.item"
      :key="item.key"
      :pathContext="getPathContext(item.index)"
      :style="item.style"
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
import { resolveDataPath, type DataPathContext } from "../code/pathContext";
import {
  DF_CURRENT_FORM,
  DF_CURRENT_LENGTH,
  DF_CURRENT_TYPE,
  DF_ROOT_DATA,
} from "../code/injectionKeys.ts";
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
  get: () => getArrayRecords(rootData.data, currentForm.value) || [],
  set: (value) => {
    const current = getArrayRecords(rootData.data, currentForm.value);
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
  const source = currentForm.value?.source;
  return Array.isArray(source)
    ? { basePath: resolveDataPath(source, pathContext), index }
    : undefined;
};
// 延迟到真实根元素挂载完成后再启动拖拽
const draggable = useDraggable(null, records, {
  immediate: false,
  handle: currentForm.value?.dragClass || "",
  animation: 150,
  ghostClass: "ghost",
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
  removeArrayRecord(rootData.data, currentForm.value, index);
};
// 提供当前容器的长度
provide(DF_CURRENT_LENGTH, length);
// 提供当前容器的表单数据
provide(DF_CURRENT_FORM, currentForm);
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "array");
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  border-radius: 12px;
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
