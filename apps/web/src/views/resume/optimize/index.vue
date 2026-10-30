<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useResumeStore } from "@/stores";
import { useResumeName } from "../hooks/useResumeName";
import eventBus from "@/utils/modules/eventBus";
import ResumePreview from "../components/aiOptimize/resumePreview.vue";
import { getResumeOptimizationBlockReason } from "@snowflake/resume-agent";
import { createResumeSnapshotForAi } from "../shared/resumeSnapshot";

const store = useResumeStore();
const { getResumeTitle } = useResumeName();
const selectedId = ref("");
const loading = ref(true);
const error = ref("");
const selectedResume = computed(() => store.resumeList.find((item) => item.id === selectedId.value));
// 本地先判定是否有真实内容，空简历不开放优化执行入口。
const blockReason = computed(() => selectedResume.value
  ? getResumeOptimizationBlockReason(createResumeSnapshotForAi(selectedResume.value, false)) : "");
const options = computed(() => store.resumeList.map((item) => ({
  value: item.id, // 选中的真实简历编号。
  name: getResumeTitle(item), // 沿用项目统一简历标题。
})));
const initialize = async () => {
  loading.value = true;
  error.value = "";
  try {
    await store.loadActiveResumes();
    selectedId.value = options.value.some((item) => item.value === store.currentItem?.id) ? store.currentItem.id : options.value[0]?.value || "";
  } catch { error.value = "简历读取失败，请重试。"; }
  finally { loading.value = false; }
};
onMounted(initialize);
// 工作台只负责选择对象，实际任务与编辑器共用同一个独立弹窗。
const open = () => { if (selectedId.value && !blockReason.value) eventBus.emit("resume-open-optimize", selectedId.value); };
</script>

<template>
  <main class="flex h-full min-h-0 w-full flex-col gap-3 bg-sf-page p-3 text-sf-text">
    <!-- 功能名称复用导航文案，保证各入口一致。 -->
    <header class="shrink-0"><h1 class="text-lg font-semibold">{{ $t('resumeNavAiOptimize') }}</h1><p class="mt-3 text-xs leading-6 text-sf-text-2">选择简历，一次优化。在预览中确认效果，再决定保存或放弃。</p></header>
    <section v-if="!loading && !error && options.length" class="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
      <label class="flex min-w-0 flex-1 items-center gap-3 text-sm"><span class="shrink-0">选择简历</span><SfSelect v-model="selectedId" :list="options" placeholder="请选择简历" aria-label="选择需要优化的简历" class="min-w-0" /></label>
      <SfButton icon="lucide:sparkles" :disabled="!selectedId || !!blockReason || store.isGenerating" @click="open">{{ store.isGenerating ? '优化任务进行中' : blockReason ? '暂无可优化内容' : '优化这份简历' }}</SfButton>
    </section>
    <section v-if="!loading && !error && blockReason" class="flex shrink-0 flex-wrap items-center gap-3 rounded-xl bg-sf-warning-2 p-3 text-xs leading-6 text-sf-warning" role="status">
      <p class="min-w-0 flex-1">{{ blockReason }}</p>
      <router-link :to="{ path: '/resume/editor', query: { id: selectedId } }" class="shrink-0 font-medium hover:underline">去填写简历</router-link>
      <router-link to="/resume/generate" class="shrink-0 font-medium hover:underline">{{ $t('resumeNavAiGenerate') }}</router-link>
    </section>
    <section class="min-h-0 flex-1 overflow-hidden rounded-xl border border-sf-b bg-sf-primary">
      <div v-if="loading" class="flex h-full items-center justify-center gap-3 text-sm text-sf-text-2"><SfIcon icon="eos-icons:loading" size="6" />正在读取简历…</div>
      <div v-else-if="error" class="flex h-full flex-col items-center justify-center gap-3"><p class="text-sm text-sf-error">{{ error }}</p><SfButton type="bg" @click="initialize">重新读取</SfButton></div>
      <div v-else-if="!options.length" class="flex h-full flex-col items-center justify-center gap-3 p-3 text-center"><SfIcon icon="lucide:file-plus" size="9" class="text-sf-text-3" /><h2 class="text-lg font-medium">先准备一份简历</h2><p class="text-sm text-sf-text-2">创建或导入简历后，就可以开始优化。</p><router-link to="/resume/mine" class="text-sm text-sf-theme hover:underline">前往我的简历</router-link></div>
      <ResumePreview v-else-if="selectedResume" :key="selectedId" :item="selectedResume" />
    </section>
  </main>
</template>
