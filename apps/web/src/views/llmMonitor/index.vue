<script setup lang="ts">
import { ref } from "vue";
import EvalPanel from "./eval/index.vue";
import TracePanel from "./trace/index.vue";

defineOptions({ name: "LlmMonitor" });

// 页签清单：请求观测看单次请求过程，效果评测看端到端行为是否符合契约
const TABS = [
  { key: "trace", label: "请求观测" },
  { key: "eval", label: "效果评测" },
];

const active = ref("trace");
</script>

<template>
  <SfViewContainer>
    <div class="flex h-full flex-col overflow-hidden">
      <div class="flex shrink-0 items-center gap-3 border-b border-sf-border bg-sf-page px-3">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          class="cursor-pointer border-b-2 px-3 py-3 text-sm transition"
          :class="
            active === tab.key
              ? 'border-sf-theme font-medium text-sf-text'
              : 'border-transparent text-sf-text-2 hover:text-sf-text'
          "
          type="button"
          @click="active = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="min-h-0 flex-1">
        <TracePanel v-if="active === 'trace'" />
        <EvalPanel v-else />
      </div>
    </div>
  </SfViewContainer>
</template>
