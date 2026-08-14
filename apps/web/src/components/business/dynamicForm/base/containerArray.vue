<template>
  <el-row
    class="m-0! w-full"
    :class="{ 'drag-array-active': isDragging }"
    :gutter="0"
    ref="row"
    v-if="init"
  >
    <FormItem
      v-for="item in formListWithStyle"
      :currentForm="item.item"
      :key="item.item.id"
      :style="item.style"
    >
      <!-- v-bind="$attrs"  -->
      <ContainerObject :currentIndex="item.index" :currentForm="item.item" :key="item.item.id" />
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
import { computed, inject, onMounted, onUnmounted } from "vue";
import { useDraggable } from "vue-draggable-plus";
import ContainerObject from "./containerObject.vue";
import FormItem from "./formItem.vue";
const row: any = useTemplateRef("row");
let draggable: ReturnType<typeof useDraggable> | null = null;

defineProps<{
  currentIndex?: any;
}>();
const currentForm = defineModel<any>("currentForm");
const rootData = inject<any>("df/root/data");
const init = ref(false);
const isDragging = ref(false);
onMounted(async () => {
  await nextTick(() => {});
  if (currentForm.value?.list) {
    currentForm.value.list = currentForm.value.list.map((item: any) => {
      return {
        ...item,
        id: item?.id || getUUID(),
      };
    });
  }
  init.value = true;
  if (!currentForm.value?.drag) {
    return;
  }

  draggable = useDraggable(row, currentForm.value.list, {
    handle: currentForm.value?.dragClass || "",
    animation: 150,
    ghostClass: "ghost",
    onStart: (e) => {
      console.log("e:>> ", e);

      e.stopPropagation();
      isDragging.value = true;
    },
    onEnd(data: any) {
      isDragging.value = false;
      // 获取旧索引和新索引
      const { oldIndex, newIndex } = data;
      if (oldIndex === newIndex) return;
      // const [item] = currentForm.value.list.splice(oldIndex, 1)
      // currentForm.value.list.splice(newIndex, 0, item)
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
  ...(isFirstInRow || isLastInRow ? { paddingBottom: bottomStyle } : {}),
});

// 动态计算样式算法：实现第一个左边距0，最后一个右边距0，其他左右各6
const formListWithStyle = computed(() => {
  const list = currentForm.value?.list || [];
  let lastRowStartIndex = 0;
  let accumulatedSpan = 0;
  let currentAccumulatedSpan = 0;

  list.forEach((item: any, index: number) => {
    const span = getSpan(item);
    if (accumulatedSpan + span > 24) {
      lastRowStartIndex = index;
      accumulatedSpan = 0;
    }

    accumulatedSpan += span;
    if (accumulatedSpan >= 24) {
      accumulatedSpan = 0;
      if (index < list.length - 1) {
        lastRowStartIndex = index + 1;
      }
    }
  });

  return list.map((item: any, index: number) => {
    const span = getSpan(item);
    if (currentAccumulatedSpan + span > 24) {
      currentAccumulatedSpan = 0;
    }

    const isFirstInRow = currentAccumulatedSpan === 0;
    const nextItem = list[index + 1];
    const nextSpan = nextItem ? getSpan(nextItem) : 0;
    const isLastInRow =
      currentAccumulatedSpan + span === 24 ||
      (!!nextItem && currentAccumulatedSpan + span + nextSpan > 24) ||
      index === list.length - 1;

    currentAccumulatedSpan += span;
    if (currentAccumulatedSpan >= 24) {
      currentAccumulatedSpan = 0;
    }

    const bottomStyle = index >= lastRowStartIndex ? "" : "6px";

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
// 添加
const add = () => {
  // 检查是否有添加配置
  const addConfig = currentForm.value.addConfig;
  if (!addConfig) return;
  // 添加到列表
  currentForm.value.list.push(addConfig);
};
// 提供当前容器的长度
provide("df/current/length", length);
// 提供当前容器的表单数据
provide("df/current/form", currentForm);
// 提供当前容器的类型
provide("df/current/type", "array");
// 提供添加方法
provide("df/add", add);
// 提供删除方法
provide("df/removeItem", remove);
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: yellow;
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
  border: 1px dashed var(--color-sf-theme);
  border-radius: 12px;
  pointer-events: none;
  content: "";
}
</style>
