<script setup>
import { computed, defineAsyncComponent } from "vue";
import Project from "./project.vue";
import RichTextBlock from "./richTextBlock.vue";
import User from "./user/index.vue";
import Work from "./work.vue";

// 定义属性，接收 key 参数
const props = defineProps({
  name: {
    type: String,
  },
});

const richTextModules = new Set(["skill", "advantage"]);

// 常用模块同步加载，避免测量树和实际预览树等待异步模块。
const syncComponents = {
  user: User,
  skill: RichTextBlock,
  work: Work,
  project: Project,
};

/**
 * 使用 Vite 的 import.meta.glob 动态导入当前目录下的所有 .vue 组件
 * 排除当前 index.vue 文件自身
 */
// 同时匹配单文件组件与目录化组件（如 user/index.vue）
const components = import.meta.glob([
  "./*.vue",
  "./*/index.vue",
  "!./expItemList.vue",
  "!./index.vue",
  "!./project.vue",
  "!./richTextBlock.vue",
  "!./user/index.vue",
  "!./work.vue",
]);
const asyncComponentCache = new Map();

const getAsyncComponent = (filePath) => {
  if (!asyncComponentCache.has(filePath)) {
    asyncComponentCache.set(filePath, defineAsyncComponent(components[filePath]));
  }
  return asyncComponentCache.get(filePath);
};

/**
 * 根据传入的 name 动态计算并加载对应的组件
 */
const dynamicComponent = computed(() => {
  if (!props.name) {
    return;
  }
  if (syncComponents[props.name]) {
    return syncComponents[props.name];
  }
  // 富文本模块共用同一渲染器，直接复用同步组件。
  if (richTextModules.has(props.name)) {
    return RichTextBlock;
  }
  // 自定义模块使用带前缀的 key,统一渲染为自定义模块组件
  if (props.name.startsWith("custom_")) {
    return defineAsyncComponent(components["./custom.vue"]);
  }
  // 优先匹配模块目录下的 index.vue，未命中再回退单文件组件
  const directoryPath = `./${props.name}/index.vue`;
  const singlePath = `./${props.name}.vue`;
  const filePath = components[directoryPath] ? directoryPath : singlePath;
  // 检查请求的组件是否存在于导入的模块中
  if (components[filePath]) {
    return getAsyncComponent(filePath);
  }

  console.warn(`[ResumePreview] 组件 ${props.name} 不存在于目录中`);
  return null;
});

const componentProps = computed(() => {
  if (richTextModules.has(props.name)) {
    return {
      moduleName: props.name,
      dataKey: props.name,
    };
  }
  return props;
});
</script>

<template>
  <component
    :is="dynamicComponent"
    v-if="dynamicComponent"
    v-bind="{ ...componentProps, ...$attrs }"
  />
</template>

<style lang="scss" scoped></style>
