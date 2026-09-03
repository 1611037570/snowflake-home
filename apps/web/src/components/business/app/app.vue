<template>
  <div @click="handleClick" class="cursor-pointer">
    <div
      class="flex-c flex-col overflow-hidden rounded-xl transition-all duration-300 hover:bg-sf-bg"
      :style="boxStyle"
    >
      <div class="flex-c relative overflow-hidden rounded-xl" :style="imgStyle">
        <!-- 加载中：显示 SfIcon 加载动画 -->
        <SfIcon v-if="status === 'loading'" icon="line-md:loading-twotone-loop" :size="size" />
        <SfAutoImg v-model:status="status" :data="data" :size="size" />
      </div>
    </div>
    <div
      :style="{ width: `${boxSize}px` }"
      class="mt-1 min-w-0 truncate text-center text-sm text-sf-text"
      v-if="data.name"
    >
      {{ data.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import SfIcon from "@/components/base/icon/icon.vue";
import SfAutoImg from "./autoImg.vue";

defineOptions({ name: "SfApp" });

interface AppData {
  img: string;
  [key: string]: any;
}

const props = withDefaults(
  defineProps<{
    data: AppData;
    size?: number | string;
    boxSize?: number | string;
  }>(),
  {
    size: 4,
    boxSize: 0,
  },
);
// 图片样式
const imgStyle = computed(() => {
  const s = Number(props.size) * 4;
  return {
    width: `${s}px`,
    height: `${s}px`,
    minWidth: `${s}px`,
    minHeight: `${s}px`,
  };
});
const boxSize = computed(() => Number(props.boxSize || props.size) * 4);
// 盒子样式
const boxStyle = computed(() => {
  const s = boxSize.value;
  return {
    width: `${s}px`,
    height: `${s}px`,
  };
});

const status = ref<"loading" | "success" | "fallback">("loading");

const emit = defineEmits(["onClick"]);

// 点击事件
// 点击事件
const handleClick = () => {
  emit("onClick", props.data);
};
</script>

<style scoped></style>
