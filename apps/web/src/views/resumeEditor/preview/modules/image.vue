<script setup>
import { computed, inject } from "vue";
import DiffField from "../components/diffField/index.vue";
import Title from "../theme/title/index.vue";
import { toAvatarSrc } from "@/utils";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const images = computed(() => previewData.value?.image?.data || []);
</script>

<template>
  <div class="resume-row w-full" data-module="image" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="图片作品"></Title>
    <!-- 图片作品列表：内容结构后续可按需调整，已绑定 name / img / desc -->
    <template v-for="(item, index) in images" :key="index">
      <div class="mt-1 flex min-w-0 max-w-full items-center gap-3">
        <img
          v-if="item.img?.value"
          :src="toAvatarSrc(item.img?.value)"
          alt="图片作品"
          class="h-16 w-16 shrink-0 rounded object-cover"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="font-bold">
            <DiffField v-model="item.name" />
          </div>
          <div class="min-w-0 max-w-full">
            <DiffField v-model="item.desc" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
