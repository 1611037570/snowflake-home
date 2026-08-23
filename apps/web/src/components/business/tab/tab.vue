<template>
  <div class="flex w-full flex-col">
    <div class="relative h-full overflow-hidden rounded-2xl bg-sf-bg p-1" :class="boxClass">
      <!-- Tab列表容器 -->
      <div class="relative z-10 flex h-full w-full">
        <!-- 循环渲染Tab项 -->
        <div
          v-for="(item, index) in list"
          :key="index"
          class="tab-item relative z-10 flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-2xl px-2 py-1 text-center transition-all duration-100"
          :class="[
            isActive(index) ? 'font-medium text-sf-primary' : 'text-sf-text hover:bg-sf-theme-2',
          ]"
          @click="handleClick(index)"
        >
          <SfIcon :icon="item.icon" size="4" v-if="item.icon" />
          {{ item.name }}
        </div>
        <!-- 背景指示器，实现跟随动画效果 -->
        <div
          class="absolute top-0 h-full rounded-2xl bg-sf-theme"
          style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          :style="{
            width: `${100 / list.length}%`,
            left: `${currentBackgroundIndex * (100 / list.length)}%`,
          }"
        ></div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";

defineOptions({ name: "SfTab" });

// 定义组件接收的props
const { list } = defineProps<{
  // Tab列表数据
  list: any[];
  boxClass?: string;
}>();
const modelValue = defineModel("modelValue");
const indexValue = defineModel("index");

// 当前激活的下标（使用响应式引用而不是计算属性引用自身）
const currentActiveIndex = ref(0);

onMounted(() => {
  currentActiveIndex.value = list.findIndex((item) => item.value === modelValue.value);
});
// 透传当前激活值给子组件 SfTabPane
provide("tabModelValue", modelValue);

const emit = defineEmits(["change"]);
// 处理点击事件
const handleClick = (index: number) => {
  currentActiveIndex.value = index;
  modelValue.value = list[index].value;
  indexValue.value = index;
  console.log("modelValue.value", index, modelValue.value);
  emit("change", modelValue.value, index);
};

// 判断是否激活
const isActive = (index: number) => {
  return index === currentActiveIndex.value;
};

// 计算当前背景指示器应该显示的下标
const currentBackgroundIndex = computed(() => {
  return currentActiveIndex.value;
});
</script>

<style scoped></style>
