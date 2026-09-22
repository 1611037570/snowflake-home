<script setup lang="ts">
import { computed } from "vue";
import Title from "../../../components/title/index.vue";
import { sliceRichTextHtml } from "../adapter/richTextParser";
import LayoutNodeContent from "../render/layoutNodeContent.vue";
import type { LayoutNode } from "../types";

const props = defineProps<{ node: LayoutNode }>();
const richText = computed(() => props.node.payload as { html?: string; breakPoints?: { offset: number }[] });
</script>

<template>
  <div class="layout-measure-record">
    <div v-if="node.title" class="layout-measure-title" :data-layout-node-id="node.title.id">
      <Title :module-key="node.title.sourceModuleKey" />
    </div>
    <div class="layout-measure-node" :data-layout-node-id="node.id">
      <LayoutNodeContent :node="node" />
      <template v-if="node.type === 'richText' && richText.html">
        <div
          v-for="point in node.breakPoints"
          :key="point.offset"
          class="layout-measure-breakpoint"
          :data-layout-breakpoint-offset="point.offset"
          :style="{ width: '100%' }"
          v-html="sliceRichTextHtml(richText.html, 0, point.offset)"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.layout-measure-node {
  position: relative;
  width: 100%;
}

.layout-measure-breakpoint {
  position: absolute;
  left: 0;
  top: 0;
  visibility: hidden;
  pointer-events: none;
}
</style>
