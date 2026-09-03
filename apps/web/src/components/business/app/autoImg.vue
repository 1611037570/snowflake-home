<template>
  <!-- 加载成功：显示 SfImg -->

  <SfImg v-if="status === 'success'" :src="finalSrc" :style="boxStyle" fit="cover" />
  <!-- 两次失败：显示 data 的第一个字 -->
  <div v-else-if="status === 'fallback'" :style="boxStyle" class="flex-c text-center">
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

// 使用原生 Image 对象预加载图片，避免加载过程中显示 img
function tryLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// data.img 变化时：走完整的加载流程
watch(
  () => props.data?.img,
  async (img) => {
    status.value = "loading";
    finalSrc.value = "";
    const rawSrc = img || "";
    // 第一次：尝试原始 img 地址
    const ok1 = await tryLoad(rawSrc);
    if (ok1) {
      finalSrc.value = rawSrc;
      status.value = "success";
      return;
    }
    // 第二次：尝试 favicon 回退地址
    const favSrc = buildFaviconUrl(rawSrc);
    if (favSrc && favSrc !== rawSrc) {
      const ok2 = await tryLoad(favSrc);
      if (ok2) {
        finalSrc.value = favSrc;
        status.value = "success";
        return;
      }
    }
    // 两次失败：不渲染图片，显示首字
    status.value = "fallback";
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped></style>
