<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { publicExamples } from "./catalog";
import PublicContent from "./publicContent.vue";
import ErrorPage from "@/views/status/error.vue";

const route = useRoute();
// 未登记的范本不回退成首页内容，生产环境同时由服务器返回不存在状态。
const exists = computed(() => publicExamples.some((item) => item.path === route.path));
</script>

<template>
  <SfScrollbar v-if="exists" class="h-full">
    <PublicContent />
  </SfScrollbar>
  <ErrorPage v-else />
</template>
