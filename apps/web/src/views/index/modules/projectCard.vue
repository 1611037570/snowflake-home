<template>
  <div class="minimal-project-card cursor-pointer border-b border-sf-b py-9 transition-colors" @click="open">
    <div class="mb-3 flex items-center text-lg font-medium tracking-tight text-sf-base">
      <SfLogo v-if="data.icon" :name="data.icon" :size="5" class="mr-3 shrink-0" />
      <div class="truncate">
        {{ data.name }}
      </div>
    </div>
    <div class="text-sm leading-relaxed text-sf-text-2" v-if="data.desc">{{ data.desc }}</div>
  </div>
</template>

<script setup>
import { routerNavigation } from "@/utils";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
const open = () => {
  if (props.data.type && props.data.type === "project") {
    routerNavigation(props.data.url);
  }
};
</script>

<style scoped>
/* 用留白、细线和文字层次统一后续区域。 */

.minimal-project-card { min-height: 138px; }
.minimal-project-card:hover { border-color: var(--sf-theme); }
.minimal-project-card:hover > div:first-child { color: var(--sf-theme); }

</style>
