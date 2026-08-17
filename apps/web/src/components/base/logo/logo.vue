<script setup>
defineOptions({ name: "SfLogo" });
defineProps({
  size: {
    type: [String, Number],
    default: "7.5",
  },
  name: {
    type: String,
    default: "image",
  },
});
const map = {
  image: defineAsyncComponent(() => import("./modules/image.vue")),
  index: defineAsyncComponent(() => import("./modules/index.vue")),
  home: defineAsyncComponent(() => import("./modules/home.vue")),
  resume: defineAsyncComponent(() => import("./modules/resume.vue")),
};
</script>

<template>
  <Component :is="map[name]" :size="size" />
</template>

<style lang="scss" scoped></style>
