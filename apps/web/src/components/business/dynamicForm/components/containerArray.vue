<template>
  <el-row
    class="m-0! w-full gap-3"
    :class="[{ 'drag-array-active': isDragging }, currentForm?.rowClass]"
    :gutter="0"
    ref="row"
  >
    <FormItem
      v-for="item in formListWithStyle"
      :class="currentForm?.colClass"
      :currentForm="item.item"
      :key="item.item.id"
      :style="item.style"
    >
      <!-- v-bind="$attrs"  -->
      <ContainerSlot
        v-if="item.item.type === 'group'"
        :currentIndex="item.index"
        :currentForm="item.item"
        @removeObject="remove"
      />
      <ContainerObject v-else :currentIndex="item.index" :currentForm="item.item" />
      <div class="flex" v-if="item.item.ui">
        <el-button @click="moveItem(item.index, item.index - 1)" :disabled="item.index === 0"
          >上移</el-button
        >
        <el-button
          @click="moveItem(item.index, item.index + 1)"
          :disabled="item.index === length - 1"
          >下移</el-button
        >
        <el-button @click="remove(item.index)">删除</el-button>
      </div>
    </FormItem>
    <el-button @click="add()" v-if="0">添加</el-button>
  </el-row>
</template>

<script setup lang="ts">
import { getUUID } from "@/utils";
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useDraggable } from "vue-draggable-plus";
import {
  DF_ADD,
  DF_CURRENT_FORM,
  DF_CURRENT_LENGTH,
  DF_CURRENT_TYPE,
  DF_REMOVE_ITEM,
  DF_ROOT_DATA,
} from "../code/injectionKeys.ts";
import { createAddItem } from "../code/addItem.ts";
import ContainerObject from "./containerObject.vue";
import ContainerSlot from "./containerSlot.vue";
import FormItem from "./formItem.vue";
const row: any = useTemplateRef("row");
let draggable: ReturnType<typeof useDraggable> | null = null;

defineProps<{
  currentIndex?: any;
}>();
const currentForm: any = defineModel("currentForm");
const rootData: any = inject(DF_ROOT_DATA);
const isDragging = ref(false);
// 监听列表变化，为新增的子项补充 id，避免模板 :key 为 undefined 导致重复 key
// 浅监听列表引用与长度：仅在新增/删除/整体替换时触发，避免子项输入时深度遍历整个列表
watch(
  () => [currentForm.value?.list, currentForm.value?.list?.length],
  ([list]) => {
    (list as any[])?.forEach((item: any) => {
      if (!item.id) {
        item.id = getUUID().slice(0, 4);
      }
    });
  },
  { immediate: true },
);
onMounted(async () => {
  await nextTick(() => {});

  if (!currentForm.value?.drag) {
    return;
  }

  draggable = useDraggable(row, currentForm.value.list, {
    handle: currentForm.value?.dragClass || "",
    animation: 150,
    ghostClass: "ghost",
    onStart: (e) => {
      e.stopPropagation();
      isDragging.value = true;
    },
    onEnd(data: any) {
      isDragging.value = false;
      // 获取旧索引和新索引
      const { oldIndex, newIndex } = data;
      if (oldIndex === newIndex) return;
      rootData.move(currentForm.value.list, oldIndex, newIndex);
    },
  });
});
onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});

const length = computed(() => currentForm.value?.list?.length || 0);
const getSpan = (item: any) => Number(item.span) || 24;
const getItemStyle = (isFirstInRow: boolean, isLastInRow: boolean, bottomStyle: string) => ({
  paddingLeft: isFirstInRow ? "0" : "3px",
  paddingRight: isLastInRow ? "0" : "3px",
  ...(isFirstInRow || isLastInRow ? { paddingBottom: "" } : {}),
});

// 动态计算样式算法：实现第一个左边距0，最后一个右边距0，其他左右各6
const formListWithStyle = computed(() => {
  const list = currentForm.value?.list || [];
  // 最后一行起始索引
  let lastRowStartIndex = 0;
  // 累计占用的栅格数（跨行统计，用于确定每行起点）
  let accumulatedSpan = 0;
  // 当前行累计占用的栅格数（逐项统计，用于确定行首行尾）
  let currentAccumulatedSpan = 0;

  // 第一轮遍历：根据每项 span 换行，计算最后一行起始索引（用于决定底部间距）
  list.forEach((item: any, index: number) => {
    const span = getSpan(item);
    // 当前行放不下，换行：更新最后一行起始索引并重置累计栅格数
    if (accumulatedSpan + span > 24) {
      lastRowStartIndex = index;
      accumulatedSpan = 0;
    }

    accumulatedSpan += span;
    // 刚好排满一行，重置累计栅格数，并将最后一行起始索引指向下一项
    if (accumulatedSpan >= 24) {
      accumulatedSpan = 0;
      if (index < list.length - 1) {
        lastRowStartIndex = index + 1;
      }
    }
  });

  // 第二轮遍历：逐项判断是否行首/行尾，计算每项的左右边距与底部间距
  return list.map((item: any, index: number) => {
    const span = getSpan(item);
    // 当前行放不下，重置为行首
    if (currentAccumulatedSpan + span > 24) {
      currentAccumulatedSpan = 0;
    }

    // 累计栅格为 0 时即为行首
    const isFirstInRow = currentAccumulatedSpan === 0;
    const nextItem = list[index + 1];
    const nextSpan = nextItem ? getSpan(nextItem) : 0;
    // 满足以下任一条件即为行尾：恰好排满一行 / 下一项放不下需换行 / 是最后一项
    const isLastInRow =
      currentAccumulatedSpan + span === 24 ||
      (!!nextItem && currentAccumulatedSpan + span + nextSpan > 24) ||
      index === list.length - 1;

    currentAccumulatedSpan += span;
    // 排满一行后重置，供下一项重新判断
    if (currentAccumulatedSpan >= 24) {
      currentAccumulatedSpan = 0;
    }

    // 最后一行底部不留间距，其余行保留 12px 间距
    const bottomStyle = index >= lastRowStartIndex ? "" : "12px";

    // 水平边距逻辑：
    // 1. 如果既是行首又是行尾（span=24），左右边距都是0
    // 2. 如果只是行首，左边距0，右边距6
    // 3. 如果只是行尾，右边距0，左边距6
    // 4. 中间元素，左右都是6
    return {
      item,
      index,
      style: getItemStyle(isFirstInRow, isLastInRow, bottomStyle),
    };
  });
});

// 上移
const moveItem = (index: any, targetIndex: any) => {
  if (targetIndex < 0 || targetIndex >= length.value) return;
  const [item] = currentForm.value.list.splice(index, 1);
  currentForm.value.list.splice(targetIndex, 0, item);
  rootData.move(currentForm.value.list, index, targetIndex);
};
// 删除
const remove = (index: any) => {
  rootData.removeItem(currentForm.value.list, index);
  currentForm.value.list.splice(index, 1);
};
// 添加（统一智能新增：array 容器直接新增，内部深拷贝 addConfig）
const add = createAddItem(currentForm);
// 提供当前容器的长度
provide(DF_CURRENT_LENGTH, length);
// 提供当前容器的表单数据
provide(DF_CURRENT_FORM, currentForm);
// 提供当前容器的类型
provide(DF_CURRENT_TYPE, "array");
// 提供添加方法
provide(DF_ADD, add);
// 提供删除方法
provide(DF_REMOVE_ITEM, remove);
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
