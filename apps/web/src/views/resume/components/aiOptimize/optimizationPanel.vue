<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useElementSize } from "@vueuse/core";
import { useRouter } from "vue-router";
import { useAiStore, useResumeStore } from "@/stores";
import { useResumeName } from "../../hooks/useResumeName";
import { useResumeAiAvailability } from "../../hooks/useResumeAiAvailability";
import { useResumeOptimization } from "./useResumeOptimization";
import OptimizationReport from "./optimizationReport.vue";
import ResumePreview from "./resumePreview.vue";
import { getResumeOptimizationBlockReason } from "@snowflake/resume-agent";
import { createResumeSnapshotForAi } from "../../shared/resumeSnapshot";

const props = defineProps<{
  resumeId: string; // 本次优化的固定简历编号，进入后不随页面切换。
}>();
// 关闭、放弃或保存完成后统一由外层收起面板。
const emit = defineEmits<{ close: [] }>();
const store = useResumeStore();
const aiStore = useAiStore();
const router = useRouter();
const { getResumeTitle } = useResumeName();
const { ensureAiAvailable } = useResumeAiAvailability();
const { generating, stage, error, report, originalItem, pendingItem, accepted, hasChanges, saving, saveError, incomplete, notice, run, cancel, apply, backToInput } = useResumeOptimization();
const loading = ref(true);
const loadError = ref("");
const resumeTitle = ref("");
const selectedResume = computed(() => store.resumeList.find((item) => item.id === props.resumeId));
// 页面与弹窗入口都在本地检查，不能靠模型生成报告后才告知没有内容。
const blockReason = computed(() => selectedResume.value
  ? getResumeOptimizationBlockReason(createResumeSnapshotForAi(selectedResume.value, false)) : "");
const input = reactive({
  position: "", // 自动预填并允许覆盖本次优化的目标岗位。
  jd: "", // 可选岗位说明，不加入简历正文。
  focus: "综合优化", // 本轮采用的内容处理重点。
});
const focuses = ["综合优化", "岗位匹配", "精简表达"];
// 报告为默认视图，用户主动查看后才切到简历或对比。
const resultView = ref<"report" | "preview" | "comparison">("report");
const comparisonArea = ref<HTMLElement | null>(null);
const { width: comparisonWidth } = useElementSize(comparisonArea);
// 面板只负责功能与内部滚动，高度完全由使用方给的容器决定。
// 每轮结果先展示报告，简历只在用户点击查看后挂载。
watch(report, (value) => { if (value) resultView.value = "report"; });

// 读取选定简历，不切换编辑器当前对象，也不创建 AI 会话。
const initialize = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const resume = await store.loadResume(props.resumeId);
    if (!resume) throw new Error("简历已不存在，请重新选择");
    resumeTitle.value = getResumeTitle(resume);
    input.position = resume.data?.user?.data?.position?.trim() || "";
  } catch (cause) { loadError.value = cause instanceof Error ? cause.message : "简历读取失败，请重试"; }
  finally { loading.value = false; }
};
onMounted(initialize);

const start = (continueExisting = false) => {
  if (blockReason.value) { error.value = blockReason.value; return; }
  if (!input.position.trim()) { error.value = "请填写本次优化的目标岗位。"; return; }
  if (input.focus === "岗位匹配" && !input.jd.trim()) { error.value = "岗位匹配需要粘贴目标岗位的 JD。"; return; }
  if (!ensureAiAvailable(() => {
    emit("close");
    aiStore.modelManagerTab = "added";
    router.push("/resume/ai");
  })) return;
  void run(props.resumeId, { position: input.position.trim(), jd: input.jd.trim(), focus: input.focus }, continueExisting);
};

// 保存成功后直接结束面板，不再停留在已写入待保存的中间态。
const saveResult = async () => { if (await apply()) emit("close"); };
// 弹窗外壳关闭前询问面板是否仍在保存，避免写入过程中被关闭。
const canClose = () => !saving.value;
defineExpose({ canClose });
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-3 text-sf-text">
    <section v-if="loading" class="flex min-h-60 flex-1 flex-col items-center justify-center gap-3 text-sm text-sf-text-2"><SfIcon icon="eos-icons:loading" size="9" />正在读取简历…</section>
    <section v-else-if="loadError" class="flex min-h-60 flex-1 flex-col items-center justify-center gap-3 text-center"><p class="text-sm text-sf-error">{{ loadError }}</p><SfButton type="bg" @click="initialize">重新读取</SfButton></section>
    <section v-else-if="!generating && !report && blockReason" class="flex flex-col gap-3">
      <p class="rounded-xl bg-sf-warning-2 p-3 text-sm leading-6 text-sf-warning" role="status">{{ blockReason }}</p>
      <p class="text-xs leading-6 text-sf-text-3">当前不会发起 AI 简历优化请求，也不会生成空报告。</p>
      <footer class="flex flex-wrap justify-end gap-3"><SfButton type="bg" @click="emit('close')">关闭</SfButton><router-link to="/resume/generate" class="flex items-center text-sm text-sf-theme hover:underline" @click="emit('close')">{{ $t('resumeNavAiGenerate') }}</router-link><router-link :to="{ path: '/resume/editor', query: { id: resumeId } }" class="flex items-center text-sm text-sf-theme hover:underline" @click="emit('close')">去填写简历</router-link></footer>
    </section>

    <template v-else-if="report">
      <header class="flex shrink-0 flex-wrap items-center justify-between gap-3 text-xs">
        <p class="min-w-0 truncate text-sf-text-2">{{ resumeTitle }} · {{ accepted ? '保存失败，草稿仍可重试写入' : incomplete ? '部分草稿已保留，原简历尚未修改' : hasChanges ? '优化草稿已生成，原简历尚未修改' : '已完成检查，本轮没有内容修改' }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <SfButton v-if="resultView !== 'report'" type="bg" @click="resultView = 'report'">返回报告</SfButton>
          <SfButton v-if="pendingItem && resultView !== 'preview'" type="bg" @click="resultView = 'preview'">查看简历</SfButton>
          <SfButton v-if="hasChanges && resultView !== 'comparison'" type="bg" @click="resultView = 'comparison'">查看对比</SfButton>
        </div>
      </header>
      <p v-if="notice" role="status" class="shrink-0 rounded-xl bg-sf-warning-2 p-3 text-xs leading-6 text-sf-warning">{{ notice }}</p>
      <!-- 对比按容器宽度自动并排或上下展示，每份简历沿用 SfScrollbar，不再切换版本。 -->
      <div v-if="resultView === 'comparison'" ref="comparisonArea" class="grid min-h-0 flex-1 gap-3" :class="comparisonWidth >= 960 ? 'grid-cols-2 grid-rows-1' : 'grid-cols-1 grid-rows-2'">
        <section class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-sf-b">
          <h2 class="shrink-0 border-b border-sf-b p-3 text-sm font-medium">优化前</h2>
          <ResumePreview v-if="originalItem" :item="originalItem" class="min-h-0 flex-1" />
        </section>
        <section class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-sf-b">
          <h2 class="shrink-0 border-b border-sf-b p-3 text-sm font-medium">优化后</h2>
          <ResumePreview v-if="pendingItem" :item="pendingItem" class="min-h-0 flex-1" />
        </section>
      </div>
      <section v-else-if="resultView === 'preview'" class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-sf-b">
        <h2 class="shrink-0 border-b border-sf-b p-3 text-sm font-medium">优化结果</h2>
        <ResumePreview v-if="pendingItem" :item="pendingItem" class="min-h-0 flex-1" />
      </section>
      <!-- 默认结果只展示报告；进入查看后隐藏报告，滚动区复用外壳留白。 -->
      <SfScrollbar v-else flush class="min-h-0 flex-1" view-class="gap-3">
        <OptimizationReport :report="report" :incomplete="incomplete" class="shrink-0" />
      </SfScrollbar>
      <p v-if="error" role="alert" class="text-xs leading-6 text-sf-error">{{ error }}</p>
      <p v-if="saveError" role="alert" class="text-xs text-sf-error">{{ saveError }}</p>
      <footer class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-sf-b pt-3">
        <div class="flex flex-wrap gap-3">
          <!-- 优化成功后不再提供调整目标，避免紧邻保存的按钮直接丢弃整份草稿。 -->
          <SfButton v-if="!accepted && (!hasChanges || incomplete)" type="bg" :disabled="saving" @click="backToInput">调整目标</SfButton>
          <SfButton v-if="incomplete" type="bg" :disabled="saving" @click="start(true)">继续未完成优化</SfButton>
        </div>
        <div class="flex gap-3"><SfButton type="bg" :disabled="saving" @click="emit('close')">{{ accepted || !hasChanges ? '关闭' : '放弃本次优化' }}</SfButton><SfButton v-if="hasChanges" icon="lucide:check" :disabled="saving" @click="saveResult">{{ saving ? '正在保存…' : accepted ? '重试保存' : '保存' }}</SfButton></div>
      </footer>
    </template>

    <section v-else-if="generating" class="flex min-h-72 flex-col items-center justify-center gap-3 p-3 text-center" aria-live="polite" aria-busy="true">
      <span class="flex h-18 w-18 items-center justify-center rounded-3xl bg-sf-theme-3 text-sf-theme"><SfIcon icon="eos-icons:loading" size="9" /></span>
      <div><h2 class="text-lg font-semibold">{{ stage }}</h2><p class="mt-3 text-sm leading-6 text-sf-text-2">正在结合目标岗位优化「{{ resumeTitle }}」</p><p class="mt-3 text-xs leading-6 text-sf-text-3">完成后预览草稿再决定是否保存；停止时保留已校验的部分，原简历不会被修改。</p></div>
      <SfButton type="bg" @click="cancel">停止优化</SfButton>
    </section>

    <template v-else>
      <!-- 表单沿用外壳留白，滚动时底部操作保持固定。 -->
      <SfScrollbar flush class="min-h-0 flex-1">
        <form class="flex shrink-0 flex-col gap-3" @submit.prevent="start()">
          <header class="rounded-2xl bg-sf-bg p-3"><p class="flex items-center gap-3 text-xs text-sf-text-3"><SfIcon icon="lucide:file-text" size="4" />本次优化的简历</p><h2 class="mt-3 text-sm font-semibold">{{ resumeTitle }}</h2><p class="mt-3 text-xs leading-6 text-sf-text-2">一次生成优化草稿和报告，先看完整效果，再决定是否保存。</p></header>
          <label class="flex flex-col gap-3 text-sm font-medium">目标岗位<SfInput v-model="input.position" placeholder="例如：后端开发工程师" maxlength="100" aria-label="目标岗位" /></label>
          <fieldset><legend class="mb-3 text-sm font-medium">优化重点</legend><div class="grid grid-cols-3 gap-3"><button v-for="focus in focuses" :key="focus" type="button" class="cursor-pointer rounded-xl border px-3 py-3 text-xs transition-colors" :class="input.focus === focus ? 'border-sf-theme bg-sf-theme-3 text-sf-theme' : 'border-sf-b text-sf-text-2 hover:bg-sf-bg'" :aria-pressed="input.focus === focus" @click="input.focus = focus">{{ focus }}</button></div></fieldset>
          <label class="flex flex-col gap-3 text-sm font-medium">岗位说明 <span class="text-xs font-normal text-sf-text-3">综合优化与精简表达可留空</span><SfInput v-model="input.jd" type="textarea" :rows="5" maxlength="15000" placeholder="粘贴 JD，帮助 AI 判断岗位要求与已有经历的匹配程度" aria-label="岗位说明" /></label>
          <p class="flex items-start gap-3 text-xs leading-6 text-sf-text-3"><SfIcon icon="lucide:shield-check" size="5" class="shrink-0" />将读取整份简历并沿用当前脱敏设置。保留已确认事实，补写候选中的未知细节使用 XX 标记，保存前可在预览中核实。</p>
          <p v-if="error" role="alert" class="text-sm leading-6 text-sf-error">{{ error }}</p>
          <p v-else-if="stage === '已停止优化'" role="status" class="text-xs text-sf-text-2">已停止优化，原简历未修改。</p>
        </form>
      </SfScrollbar>
      <footer class="flex shrink-0 justify-end gap-3 border-t border-sf-b pt-3"><SfButton type="bg" @click="emit('close')">取消</SfButton><SfButton icon="lucide:sparkles" @click="start()">开始优化</SfButton></footer>
    </template>
  </div>
</template>
