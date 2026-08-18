<template>
  <div
    @click="handleClick"
    @contextmenu="handleContextMenu"
    class="fixed top-0 right-0 bottom-0 left-0 h-full w-full bg-sf-primary bg-cover bg-center transition-all duration-200"
    :class="[searchFocus ? 'z-50' : 'z-1']"
    :style="{
      filter: searchFocus || tabIndex == 1 ? 'blur(10px)' : 'blur(0px)',
      transform:
        searchFocus && tabIndex == 1
          ? 'scale(1.2)'
          : searchFocus || tabIndex == 1
            ? 'scale(1.1)'
            : 'scale(1)',
      backgroundImage: backgroundImage,
    }"
  ></div>
</template>

<script setup>
// background-image: url('https://cn.bing.com/th?id=OHR.SunbeamsForest_ZH-CN5358008117_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp');
// https://convertio.co/zh/download/f6fd6966623acbcef28ae90b08ca0be62189ed/
import { useHomeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";

const searchStore = useHomeStore();
const homeStore = useHomeStore();
const { tabIndex } = storeToRefs(homeStore);
const { searchFocus } = storeToRefs(searchStore);

// 背景图片URL，默认为空
const backgroundUrl = ref("");

// 计算背景图片样式
const backgroundImage = computed(() => {
  return backgroundUrl.value ? `url(${backgroundUrl.value})` : "none";
});

onMounted(() => {
  setTimeout(async () => {
    const bgModule = await import("@/assets/images/background1.webp");
    // 创建图片对象进行预加载
    const img = new Image();
    img.onload = () => {
      // 图片完全加载后再设置为背景图
      backgroundUrl.value = bgModule.default;
    };
    // img.onerror = (error) => {
    // }
    img.src = bgModule.default;
  }, 0);
});

const handleClick = () => {
  if (tabIndex.value == 0) {
    return;
  }
  // 点击搜索框时，不切换
  if (searchFocus.value) {
    return;
  }
  tabIndex.value = 0;
};

const handleContextMenu = () => {
  if (tabIndex.value == 1) {
    return;
  }
  // 搜索框聚焦时，不切换
  if (searchFocus.value) {
    return;
  }
  tabIndex.value = 1;
};
</script>

<style scoped></style>
