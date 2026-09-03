<template>
  <!-- 加载中/成功：显示 SfImg，由其 load/error 回调驱动状态 -->
  <SfImg
    v-if="status !== 'fallback'"
    :src="finalSrc"
    :style="boxStyle"
    fit="cover"
    @load="onLoad"
    @error="onError"
  >
    <!-- 屏蔽默认错误占位，避免重试过程中闪现 Load failed -->
    <template #error><span /></template>
  </SfImg>
  <!-- 两次失败：显示 data 的第一个字 -->
  <div v-else :style="boxStyle" class="flex-c text-center">
    {{ firstChar }}
  </div>
</template>

<script setup lang="ts">
import SfImg from "@/components/el/img/img.vue";

defineOptions({ name: "SfAutoImg" });

const props = withDefaults(
  defineProps<{
    data: any;
    size?: number;
  }>(),
  {
    size: 4,
  },
);
// 盒子样式，统一给 img / 首字占位使用
const boxStyle = computed(() => ({
  width: `${props.size * 4}px !important`,
  height: `${props.size * 4}px !important`,
  fontSize: `${props.size * 3.5}px !important`,
}));
// 对外暴露加载状态，供父组件配合展示 loading
const status = defineModel<"loading" | "success" | "fallback">("status", { default: "loading" });
// data 的首字（取除了 img 外第一个字符串属性的首字符）
const firstChar = computed(() => {
  if (!props.data) return "";
  for (const key of Object.keys(props.data)) {
    if (key === "img") continue;
    const v = props.data[key];
    if (typeof v === "string" && v) return v.charAt(0);
  }
  return "";
});

// 取 img 地址第 3 个 / 前面的部分拼接 /favicon.ico
function buildFaviconUrl(src: string): string {
  if (!src) return "";
  let count = 0;
  let idx = -1;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "/") {
      count++;
      if (count === 3) {
        idx = i;
        break;
      }
    }
  }
  const base = idx >= 0 ? src.slice(0, idx) : src;
  return `${base}/favicon.ico`;
}

// 最终确认可用的图片地址
const finalSrc = ref<string>("");
// 标记是否已尝试 favicon 回退，避免循环
const triedFavicon = ref(false);

// SfImg 加载成功回调
function onLoad() {
  status.value = "success";
}

// SfImg 加载失败回调：先尝试 favicon 回退，再失败则显示首字
function onError() {
  if (triedFavicon.value) {
    status.value = "fallback";
    return;
  }
  triedFavicon.value = true;
  const favSrc = buildFaviconUrl(finalSrc.value);
  if (favSrc && favSrc !== finalSrc.value) {
    finalSrc.value = favSrc;
  } else {
    status.value = "fallback";
  }
}

// data.img 变化时：重置状态，交给 SfImg 的回调判定
watch(
  () => props.data?.img,
  (img) => {
    status.value = "loading";
    triedFavicon.value = false;
    const rawSrc = img || "";
    if (!rawSrc) {
      // 没有原始地址，直接进入首字占位
      status.value = "fallback";
      finalSrc.value = "";
      return;
    }
    finalSrc.value = rawSrc;
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped></style>
