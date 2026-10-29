<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useClipboard, useResizeObserver, useSpeechRecognition } from "@vueuse/core";
import { ElMessage, type ScrollbarInstance } from "element-plus";
import type { InterviewAction } from "@snowflake/interview-agent";
import type { InterviewSession } from "./types";
import { INTERVIEW_ACTION_LABELS, INTERVIEW_INTRO_PHASE, INTERVIEW_INTRO_SECONDS, formatInterviewDuration, getInterviewCompletedCount, getInterviewQuestionLimit, getInterviewStages, getModeLabel } from "./config";
import { getInterviewSessionState, isInterviewHelperAction } from "./sessionFlow";
import OutputContent from "./outputContent.vue";

const props = defineProps<{
  session: InterviewSession; // 当前独立面试记录。
}>();
const emit = defineEmits<{
  pause: []; // 停止当前生成并暂停训练。
  resume: []; // 继续训练或重试中断任务。
  finish: []; // 结束提问并生成真实复盘。
  submit: [skip: boolean]; // 提交回答或主动跳过。
  request: [action: InterviewAction]; // 生成当前题目的独立辅助内容。
  again: []; // 复用当前设置新建一场。
  export: []; // 导出本场可读记录。
}>();
const state = computed(() => getInterviewSessionState(props.session));
const latest = computed(() => state.value.latestTurn);
const preparation = computed(() => state.value.preparation);
const generating = computed(() => state.value.generating);
const submittedCount = computed(() => state.value.submittedTurns.filter((turn) => turn.phase !== INTERVIEW_INTRO_PHASE).length);
const answeredCount = computed(() => state.value.submittedTurns.filter((turn) => turn.phase !== INTERVIEW_INTRO_PHASE && !turn.skipped).length);
const introduction = computed(() => state.value.introduction);
const remainingSeconds = computed(() => state.value.remainingSeconds);
const introExpired = computed(() => introduction.value && remainingSeconds.value === 0);
// 到时锁定输入，但仍允许确认提交保留的回答或明确跳过。
const canSubmit = computed(() => state.value.canSubmit);
const canAnswer = computed(() => state.value.canAnswer);
const questionLimit = computed(() => getInterviewQuestionLimit(props.session.config));
const completedCount = computed(() => getInterviewCompletedCount(props.session.config, state.value.submittedTurns));
const progress = computed(() => questionLimit.value ? Math.min(100, Math.round(completedCount.value / questionLimit.value * 100)) : 0);
const draft = computed({
  get: () => props.session.draft, // 当前面试独立保存的草稿。
  set: (value: string) => { if (canAnswer.value) props.session.draft = value; }, // 到时后不再接收编辑或语音结果，已输入内容仍由宿主保存。
});
const helper = ref<"hint" | "reference" | null>(null);
// 统一使用项目滚动条，并通过其真实滚动节点保留跟随与题目导航行为。
const scrollbar = ref<ScrollbarInstance>();
const scrollContainer = computed(() => scrollbar.value?.wrapRef);
const contentContainer = ref<HTMLElement>();
const followOutput = ref(true);
let previousScrollTop = 0;
let scrollFrame = 0;
const input = ref<{ focus: () => void }>();
const { copy, isSupported: copySupported } = useClipboard();
const phases = computed(() => getInterviewStages(props.session.config));
const currentPhase = computed(() => latest.value?.phase || phases.value[0]);
const reviewing = computed(() => state.value.reviewing);
const helperPending = computed(() => isInterviewHelperAction(props.session.pendingAction));
const resumeLabel = computed(() => {
  if (introduction.value && props.session.pendingAction === "question") return "开始自我介绍";
  if (helperPending.value || state.value.answerReady) return "继续作答";
  return props.session.pendingAction ? `重新生成${INTERVIEW_ACTION_LABELS[props.session.pendingAction]}` : "继续面试";
});
const statusLabel = computed(() => {
  if (props.session.status === "completed") return "已结束";
  if (props.session.status === "paused") return "已暂停";
  if (generating.value && props.session.pendingAction) return `正在生成${INTERVIEW_ACTION_LABELS[props.session.pendingAction]}`;
  return introExpired.value ? "自我介绍时间到，等待确认提交" : "等待你的作答";
});
const introductionNotice = computed(() => {
  if (introExpired.value) return "时间到，已停止输入并保留回答。请确认提交；未作答可选择跳过。";
  if (props.session.status === "paused") return state.value.answerReady
    ? "倒计时已暂停，继续作答后使用剩余时间。"
    : "尚未开始计时，点击开始自我介绍后即可作答。";
  return "请介绍你的背景、相关经历和岗位优势，可提前提交。暂停面试时停表。";
});
// 开场单独编号，正式题目从第一题开始，跳过仍保留实际出题顺序。
const questionNumber = (index: number) => props.session.turns.slice(0, index + 1).filter((turn) => turn.phase !== INTERVIEW_INTRO_PHASE).length;

// 浏览器语音识别仅转写到草稿，由用户确认提交，不自动发送识别结果。
const { isSupported, isListening, result, error, start: startVoice, stop: stopVoice } = useSpeechRecognition({
  lang: props.session.config.language === "英语" ? "en-US" : "zh-CN", // 跟随本场面试语言。
  continuous: true, // 允许完成一段完整口述。
  interimResults: true, // 将识别中的文字同步到草稿。
});
let speechBase = "";
const toggleVoice = () => {
  if (isListening.value) { stopVoice(); return; }
  if (!canAnswer.value) return;
  speechBase = draft.value.trim();
  result.value = "";
  try { startVoice(); }
  catch { ElMessage.warning("暂时无法启动语音输入，请检查麦克风权限或使用文字作答"); }
};
// 同步保留识别结果，避免录音结束与最终结果在同一轮更新时丢字。
watch(result, (value) => { if (isListening.value && canAnswer.value) draft.value = [speechBase, value].filter(Boolean).join(" "); }, { flush: "sync" });
watch(error, (value) => { if (value) ElMessage.warning("语音识别未能完成，请检查麦克风权限或使用文字作答"); });
// 固定开场可能在界面挂载前就已就绪，首次进入也立即聚焦作答框。
watch(canAnswer, async (value) => {
  if (!value) stopVoice();
  else if (!helper.value) { await nextTick(); input.value?.focus(); }
}, { immediate: true });
watch(() => props.session.id, () => { stopVoice(); helper.value = null; followOutput.value = true; });
watch(() => latest.value?.id, () => { helper.value = null; });
onBeforeUnmount(stopVoice);

const handleScroll = () => {
  const element = scrollContainer.value;
  if (!element) return;
  const top = element.scrollTop;
  if (element.scrollHeight - top - element.clientHeight < 72) followOutput.value = true;
  else if (top < previousScrollTop - 1) followOutput.value = false;
  previousScrollTop = top;
};
// 将流式滚动合并到动画帧，内容增长本身不会被误判为用户上滑。
const followLatest = () => {
  if (!followOutput.value || scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const element = scrollContainer.value;
    if (!followOutput.value || !element) return;
    element.scrollTop = element.scrollHeight;
    previousScrollTop = element.scrollTop;
  });
};
const scrollToLatest = () => { followOutput.value = true; followLatest(); };
// Markdown 异步渲染后高度仍会变化，保持处于底部时继续跟随。
useResizeObserver(contentContainer, followLatest);
watch(() => [latest.value?.question.content, props.session.report.content, props.session.preparation.content, props.session.turns.length], followLatest, { flush: "post" });
onBeforeUnmount(() => { if (scrollFrame) cancelAnimationFrame(scrollFrame); });

const send = (skip = false) => {
  if (!canSubmit.value || (!skip && !draft.value.trim())) return;
  stopVoice();
  followOutput.value = true;
  emit("submit", skip);
};
const handleKeydown = (event: KeyboardEvent) => {
  if (event.isComposing || !(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  send();
};
const openHelper = (action: "hint" | "reference") => {
  if (!state.value.canUseHelp) return;
  helper.value = action;
  if (latest.value?.[action].status !== "complete") emit("request", action);
};
// 关闭仍在生成的辅助窗口时立即停止请求，返回后可直接继续作答。
const closeHelper = () => {
  if (generating.value && helperPending.value) emit("pause");
  helper.value = null;
  if (canAnswer.value) void nextTick(() => input.value?.focus());
};
// 辅助回答可复制与更换，但不自动提交为候选人的作答。
const copyHelper = async () => {
  const content = helper.value && latest.value?.[helper.value].content;
  if (!content) return;
  try { await copy(content); ElMessage.success("已复制"); }
  catch { ElMessage.error("复制失败，请手动选择文字复制"); }
};
const navigateQuestion = (id: string) => {
  followOutput.value = false;
  scrollContainer.value?.querySelector(`[data-turn-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<template>
  <section class="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_270px]">
    <div class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-sf-b bg-sf-primary">
      <header class="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-sf-b p-3">
        <div class="min-w-0">
          <h2 class="break-words font-semibold">{{ session.title }}</h2>
          <p class="mt-3 flex flex-wrap items-center gap-3 text-xs text-sf-text-2">
            <span>{{ statusLabel }}</span><span v-if="!preparation">{{ formatInterviewDuration(session.elapsedMs) }}</span>
            <span>{{ session.config.language }}<template v-if="!preparation"> · {{ session.config.mode === 'resume' ? session.config.feedback : '逐题评分与反馈' }}</template></span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <SfButton v-if="session.status === 'active'" type="bg" @click="stopVoice(); emit('pause')">{{ generating ? '停止生成' : '暂停面试' }}</SfButton>
          <SfButton v-if="session.status === 'paused'" @click="emit('resume')">{{ resumeLabel }}</SfButton>
          <SfButton v-if="!preparation && !reviewing && session.status !== 'completed'" type="error" plain @click="stopVoice(); emit('finish')">结束并复盘</SfButton>
          <SfButton v-if="session.status === 'completed'" type="bg" @click="emit('again')">再练一场</SfButton>
          <SfButton type="bg" @click="emit('export')">导出记录</SfButton>
          <SfButton v-if="!followOutput" type="bg" @click="scrollToLatest">回到最新</SfButton>
        </div>
      </header>
      <div v-if="!preparation" class="shrink-0 border-b border-sf-b p-3">
        <div class="mb-3 flex flex-wrap justify-between gap-3 text-xs text-sf-text-2"><span>{{ reviewing ? '面试复盘' : currentPhase }}</span><span v-if="questionLimit">已完成 {{ completedCount }} / {{ questionLimit }} {{ session.config.mode === 'specialized' ? '轮有效回答' : '题' }}</span><span v-else>已提交 {{ submittedCount }} 题 · 已作答 {{ answeredCount }} 题 · 主动结束后点评</span></div>
        <progress v-if="questionLimit" class="h-[3px] w-full accent-sf-theme" :value="progress" max="100" :aria-label="`已完成 ${progress}%`"></progress>
      </div>

      <SfScrollbar ref="scrollbar" flush class="min-h-0 flex-1" wrap-class="overscroll-contain" @scroll="handleScroll">
        <div ref="contentContainer" class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3">
          <article v-if="preparation" class="min-w-0">
            <h3 class="mb-3 flex items-center gap-3 text-sm font-semibold text-sf-theme"><SfIcon icon="lucide:sparkles" size="5" />{{ getModeLabel(session.config.mode) }} · 准备材料</h3>
            <OutputContent :id="`${session.id}-preparation`" :output="session.preparation" loading-text="正在整理准备材料…" />
          </article>
          <article v-for="(turn, index) in session.turns" :key="turn.id" :data-turn-id="turn.id" class="scroll-mt-6 border-b border-sf-b p-3">
            <header class="mb-3 flex flex-wrap items-center gap-3 text-xs text-sf-text-2"><span class="font-semibold text-sf-theme">面试官</span><span>{{ turn.phase === INTERVIEW_INTRO_PHASE ? `${turn.phase} · 限时两分钟` : `第 ${questionNumber(index)} 题 · ${turn.phase}` }}</span></header>
            <OutputContent :id="`${turn.id}-question`" :output="turn.question" />
            <div v-if="turn.submitted" class="mt-6 rounded-xl bg-sf-bg p-3">
              <p class="mb-3 flex flex-wrap items-center gap-3 text-xs text-sf-text-2"><span class="font-semibold text-sf-text">你的回答</span><span>{{ turn.skipped ? '已跳过' : formatInterviewDuration(turn.durationSeconds * 1000) }}</span><span v-if="turn.phase === INTERVIEW_INTRO_PHASE && turn.durationSeconds >= INTERVIEW_INTRO_SECONDS">限时已结束</span><span v-if="turn.assisted">使用过辅助</span></p>
              <p class="whitespace-pre-wrap break-words text-sm leading-6">{{ turn.skipped ? '本题未作答，不作为能力已掌握的证据。' : turn.answer }}</p>
            </div>
            <details v-if="turn.hint.content || turn.reference.content" class="mt-3 rounded-xl border border-sf-b p-3 text-xs text-sf-text-2">
              <summary class="cursor-pointer">查看本题辅助内容（不计入真实作答）</summary>
              <div v-if="turn.hint.content" class="mt-3"><h4 class="mb-3 font-medium">思考提示</h4><OutputContent :id="`${turn.id}-hint-history`" :output="turn.hint" /></div>
              <div v-if="turn.reference.content" class="mt-3"><h4 class="mb-3 font-medium">参考回答</h4><OutputContent :id="`${turn.id}-reference-history`" :output="turn.reference" /></div>
            </details>
          </article>
          <article v-if="session.report.status !== 'empty' || session.pendingAction === 'report'" class="rounded-xl border border-sf-b p-3">
            <h3 class="mb-3 text-sm font-semibold text-sf-theme">{{ session.endedEarly ? '阶段复盘' : '面试复盘' }}</h3>
            <OutputContent :id="`${session.id}-report`" :output="session.report" loading-text="正在根据已提交的回答整理复盘…" />
          </article>
          <details v-if="reviewing && session.draft" class="rounded-xl border border-sf-b p-3 text-sm leading-6"><summary class="cursor-pointer text-sf-text-2">未提交草稿 · 未参与复盘</summary><p class="mt-3 whitespace-pre-wrap break-words">{{ session.draft }}</p></details>
          <section v-if="session.status === 'paused'" class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sf-bg p-3 text-sm leading-6 text-sf-text-2"><p>{{ helperPending ? '辅助生成已停止，可以接着作答，需要时再打开辅助。' : '训练已暂停，已保留当前内容和回答草稿。' }}</p><SfButton @click="emit('resume')">{{ resumeLabel }}</SfButton></section>
          <p v-if="session.status === 'completed'" class="text-center text-xs leading-6 text-sf-text-2">本场已结束，记录独立保存在当前浏览器中。清理站点数据会删除本地记录。</p>
        </div>
      </SfScrollbar>

      <footer v-if="!preparation && !reviewing && session.status !== 'completed'" class="shrink-0 border-t border-sf-b bg-sf-primary p-3">
        <div class="mx-auto flex max-w-3xl flex-col gap-3">
          <section v-if="introduction" class="rounded-xl border border-sf-b bg-sf-bg p-3" aria-label="自我介绍限时作答">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h3 class="text-sm font-semibold">自我介绍 · 两分钟</h3>
              <span role="timer" aria-label="自我介绍剩余时间" class="font-mono text-lg font-semibold tabular-nums" :class="remainingSeconds <= 30 ? 'text-sf-warning' : 'text-sf-theme'">{{ formatInterviewDuration(remainingSeconds * 1000) }}</span>
            </div>
            <p class="mt-3 text-xs leading-6 text-sf-text-2" role="status">{{ introductionNotice }}</p>
          </section>
          <nav class="flex flex-wrap items-center gap-3">
            <SfButton v-if="!introduction" type="bg" :disabled="!state.canUseHelp" @click="openHelper('hint')">思考提示</SfButton>
            <SfButton v-if="!introduction" type="bg" :disabled="!state.canUseHelp" @click="openHelper('reference')">帮我答</SfButton>
            <SfButton v-if="isSupported" type="bg" :disabled="!canAnswer" @click="toggleVoice">{{ isListening ? '结束语音输入' : '语音输入' }}</SfButton>
            <span v-else class="text-xs text-sf-text-2">当前浏览器不支持语音输入，可使用文字作答</span>
          </nav>
          <el-input ref="input" v-model="draft" type="textarea" :rows="3" :maxlength="12000" :disabled="!canAnswer" resize="none" :placeholder="introduction ? '请在两分钟内完成自我介绍，可以输入文字或使用语音转写。' : '说清背景、个人行动、选择依据和结果。按 Ctrl / Command + Enter 提交。'" @keydown.enter="handleKeydown" />
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-xs text-sf-text-2">{{ isListening ? '正在转写，确认文字后再提交' : introduction ? '草稿自动保存 · 自我介绍不占正式题数' : '草稿自动保存 · 辅助内容会单独标记' }}</span>
            <div class="flex shrink-0 gap-3"><SfButton type="bg" :disabled="!canSubmit" @click="send(true)">{{ introduction ? '跳过自我介绍' : '跳过本题' }}</SfButton><SfButton :disabled="!canSubmit || !draft.trim()" @click="send()">{{ introExpired ? '确认提交并继续' : '提交回答' }}</SfButton></div>
          </div>
        </div>
      </footer>
    </div>

    <SfScrollbar flush class="hidden min-h-0 xl:flex">
      <aside class="flex flex-col gap-3">
      <section class="rounded-2xl border border-sf-b bg-sf-primary p-3">
        <h3 class="mb-3 text-sm font-semibold">本场安排</h3>
        <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-3 text-xs leading-6">
          <dt class="text-sf-text-2">岗位</dt><dd class="break-words">{{ session.config.position }}</dd>
          <dt class="text-sf-text-2">年限</dt><dd>{{ session.config.experienceYears }}</dd>
          <dt class="text-sf-text-2">类型</dt><dd>{{ getModeLabel(session.config.mode) }}</dd>
          <template v-if="session.config.mode === 'resume' || session.config.mode === 'specialized'"><dt class="text-sf-text-2">方向</dt><dd>{{ session.config.direction }}</dd></template>
          <template v-if="session.config.mode === 'intro'"><dt class="text-sf-text-2">字数</dt><dd>{{ session.config.introWordCount }} 字</dd><dt class="text-sf-text-2">风格</dt><dd>{{ session.config.introStyle }}</dd></template>
          <dt class="text-sf-text-2">参考简历</dt><dd class="break-words">{{ session.resumeTitle || '未关联' }}</dd>
        </dl>
        <p class="mt-3 text-xs leading-6 text-sf-text-2">{{ session.resumeId ? '使用开始时的简历快照，后续修改或删除原简历不会影响本场记录。' : '按本场岗位、年限和你的真实作答开展面试。' }}</p>
      </section>
      <section v-if="!preparation" class="rounded-2xl border border-sf-b bg-sf-primary p-3">
        <h3 class="mb-3 text-sm font-semibold">考察进程</h3>
        <ol class="flex flex-col gap-3 text-xs leading-6"><li v-for="phase in phases" :key="phase" :class="currentPhase?.startsWith(phase) ? 'font-medium text-sf-theme' : 'text-sf-text-2'">{{ phase }}</li></ol>
        <nav v-if="session.turns.length" class="mt-6 flex flex-wrap gap-3" aria-label="题目导航">
          <button v-for="(turn, index) in session.turns" :key="turn.id" type="button" class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-sf-b text-xs hover:border-sf-theme" :class="turn.submitted ? 'bg-sf-bg text-sf-text' : 'text-sf-theme'" :aria-label="turn.phase === INTERVIEW_INTRO_PHASE ? '查看开场自我介绍' : `查看第 ${questionNumber(index)} 题`" @click="navigateQuestion(turn.id)">{{ turn.phase === INTERVIEW_INTRO_PHASE ? '开场' : questionNumber(index) }}</button>
        </nav>
      </section>
      <details v-if="session.config.jobDescription" class="rounded-2xl border border-sf-b bg-sf-primary p-3 text-xs leading-6"><summary class="cursor-pointer font-semibold">目标岗位要求</summary><p class="mt-3 whitespace-pre-wrap break-words text-sf-text-2">{{ session.config.jobDescription }}</p></details>
      </aside>
    </SfScrollbar>

    <SfModal :model-value="!!helper" :title="helper === 'hint' ? '思考提示' : '参考回答'" width="600px" @update:model-value="closeHelper">
      <div v-if="helper && latest" class="flex min-w-0 flex-col gap-3">
        <p class="text-xs leading-6 text-sf-text-2">辅助内容单独保存，不会自动填入或提交你的回答，复盘中会标记本题使用过辅助。</p>
        <OutputContent :id="`${latest.id}-${helper}-modal`" :output="latest[helper]" :loading-text="helper === 'hint' ? '正在整理思考提示…' : '正在生成参考回答…'" />
        <SfButton v-if="generating" type="bg" @click="emit('pause')">停止生成</SfButton>
        <div v-else class="flex flex-wrap justify-end gap-3">
          <SfButton v-if="copySupported && latest[helper].content" type="bg" @click="copyHelper">复制</SfButton>
          <SfButton type="bg" @click="emit('request', helper)">{{ latest[helper].status === 'complete' ? '换一个' : '重新生成' }}</SfButton>
          <SfButton @click="closeHelper">返回作答</SfButton>
        </div>
      </div>
    </SfModal>
  </section>
</template>
