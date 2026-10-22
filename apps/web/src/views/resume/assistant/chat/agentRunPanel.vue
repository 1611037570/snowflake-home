<script setup>
import { computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { ElMessage } from "element-plus";

const props = defineProps({
  // 本轮 Agent 运行观测数据
  run: {
    type: Object,
    required: true,
  },
});

const { copy, isSupported } = useClipboard();

// 任务契约：规划缺失时可能只有隐式任务或没有任务
const task = computed(() => props.run.task || null);
// 证据条数用于快速判断这轮到底执行了几次工具
const stepCount = computed(() => props.run.steps?.length || 0);
// 被拦截的完成校验次数
const blockedCount = computed(
  () => (props.run.verdicts || []).filter((item) => !item.completed).length,
);
// 导出用完整快照，包含任务契约与全部证据
const snapshot = computed(() => JSON.stringify(props.run, null, 2));

// 复制排障快照，方便贴给开发定位
const copySnapshot = async () => {
  if (!isSupported.value) {
    ElMessage.error("当前浏览器不支持复制");
    return;
  }
  await copy(snapshot.value);
  ElMessage.success("已复制运行详情");
};
</script>

<template>
  <section class="mt-3 w-full rounded-xl border border-sf-b bg-sf-bg-2 p-3 text-[12px] text-sf-text-2">
    <!-- 概览：一轮请求的关键指标 -->
    <div class="flex flex-wrap items-center gap-3">
      <span>入口 {{ run.source }}</span>
      <span>耗时 {{ ((run.durationMs || 0) / 1000).toFixed(1) }} 秒</span>
      <span v-if="run.tokens">用量 {{ run.tokens }} tokens</span>
      <span>工具 {{ stepCount }} 次</span>
      <span v-if="blockedCount">拦截 {{ blockedCount }} 次</span>
      <button
        type="button"
        class="ml-auto rounded-lg border border-sf-b px-3 py-1 text-sf-theme hover:bg-sf-theme-2"
        @click="copySnapshot"
      >
        复制详情
      </button>
    </div>

    <!-- 降级说明：正常情况下不应出现 -->
    <p v-if="run.note" class="mt-3 text-sf-error">{{ run.note }}</p>

    <!-- 任务契约 -->
    <div v-if="task" class="mt-3 grid grid-cols-2 gap-3">
      <div>
        <span class="text-sf-text-3">目标</span>
        <p class="text-sf-text">{{ task.objective }}</p>
      </div>
      <div>
        <span class="text-sf-text-3">范围</span>
        <p class="text-sf-text">{{ task.scope }}</p>
      </div>
      <div>
        <span class="text-sf-text-3">必需效果</span>
        <p class="text-sf-text">{{ task.requiredEffects?.join("、") || "无" }}</p>
      </div>
      <div>
        <span class="text-sf-text-3">完成条件</span>
        <p class="text-sf-text">{{ task.successCondition }}</p>
      </div>
      <div>
        <span class="text-sf-text-3">阶段</span>
        <p class="text-sf-text">{{ task.phase }}</p>
      </div>
      <div>
        <span class="text-sf-text-3">能力</span>
        <p class="text-sf-text">{{ task.capabilityIds?.join("、") || "无" }}</p>
      </div>
    </div>

    <!-- 工具证据时间线 -->
    <div v-if="stepCount" class="mt-3">
      <span class="text-sf-text-3">工具证据</span>
      <ul class="mt-1 space-y-1">
        <li v-for="step in run.steps" :key="`${step.sequence}-${step.tool}`" class="flex gap-3">
          <span class="w-6 shrink-0 text-right text-sf-text-3">{{ step.sequence }}</span>
          <span class="w-40 shrink-0 text-sf-text">{{ step.tool }}</span>
          <span class="w-16 shrink-0" :class="step.status === 'success' ? '' : 'text-sf-error'">
            {{ step.status }}
          </span>
          <span class="min-w-0 flex-1">
            {{ step.summary }}<template v-if="step.replayed">（复用）</template>
          </span>
        </li>
      </ul>
    </div>

    <!-- 完成校验：记录每次被拦截的原因 -->
    <div v-if="run.verdicts?.length" class="mt-3">
      <span class="text-sf-text-3">完成校验</span>
      <ul class="mt-1 space-y-1">
        <li v-for="(verdict, index) in run.verdicts" :key="index">
          {{ verdict.completed ? "放行" : "拦截" }}
          <template v-if="verdict.reason">：{{ verdict.reason }}</template>
        </li>
      </ul>
    </div>
  </section>
</template>
