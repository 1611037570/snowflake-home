<script setup lang="ts">
import InterviewButton from "./interviewButton.vue";
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import type { InterviewConfig } from "@snowflake/interview-agent";
import confirm from "@/components/business/confirm";
import { INTERVIEW_INTRO_PHASE, INTERVIEW_MODES, formatInterviewDuration, getInterviewCompletedCount, getInterviewQuestionLimit, getModeLabel, isPreparationMode } from "./config";
import { useInterviewSession } from "./useInterviewSession";
import type { InterviewSession } from "./types";
import SetupPanel from "./setupPanel.vue";
import InterviewRoom from "./interviewRoom.vue";

const { store, current, select, start, pause, resume, submit, clarify, finish, request } = useInterviewSession();
const historyVisible = ref(false);
const search = ref("");
const historyMode = ref("");
// 记录筛选复用项目下拉组件，选项名称与训练分类保持一致。
const historyModeOptions = INTERVIEW_MODES.map((mode) => ({
  value: mode.value, // 用于筛选记录的训练类型。
  name: mode.label, // 下拉选项显示的训练名称。
}));
const initialConfig = ref<InterviewConfig>();
const initialResumeId = ref("");
const setupKey = ref(0);
const initializing = ref(true);
const sessions = computed(() => [...store.sessions].sort((a, b) => b.updatedAt - a.updatedAt));
const filteredSessions = computed(() => sessions.value.filter((session) =>
  (!historyMode.value || session.config.mode === historyMode.value) &&
  (!search.value.trim() || `${session.title} ${session.config.company}`.toLowerCase().includes(search.value.trim().toLowerCase())),
));
const dateLabel = (time: number) => new Date(time).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
// 文案生成与模拟面试使用各自的状态文案，历史记录不再混称训练结束。
const statusLabel = (session: InterviewSession) => isPreparationMode(session.config.mode)
  ? session.status === "completed" ? "已生成" : session.status === "active" ? "生成中" : "未完成"
  : session.status === "completed" ? "已结束" : session.status === "active" ? "进行中" : "已暂停";

// 仅加载新版独立面试记录，读取失败支持原地重试。
const initialize = async () => {
  initializing.value = true;
  try {
    await store.load();
  } finally { initializing.value = false; }
};
void initialize();

const newSession = (reuse = false) => {
  initialConfig.value = reuse && current.value ? { ...current.value.config } : undefined;
  initialResumeId.value = reuse && current.value ? current.value.resumeId : "";
  select("");
  setupKey.value += 1;
  historyVisible.value = false;
};
const openSession = (id: string) => { select(id); historyVisible.value = false; };
// 确认结束只作用于打开确认框时的会话，并拦截重复触发。
const confirmingEnd = ref(false);
const endSession = async () => {
  const id = current.value?.id;
  if (!id || confirmingEnd.value) return;
  confirmingEnd.value = true;
  try {
    await confirm("结束后将停止提问，并只根据已提交的回答生成复盘。未提交的草稿会保留在记录中。", "结束本场面试", { confirmText: "结束并复盘", cancelText: "继续作答" });
  } catch { return; }
  finally { confirmingEnd.value = false; }
  if (current.value?.id === id) await finish();
};
const deleteSession = async (session: InterviewSession) => {
  try {
    await confirm(`删除“${session.title}”及其问答、草稿和复盘？此操作无法恢复。`, "删除面试记录", { confirmText: "删除", cancelText: "取消" });
  } catch { return; }
  if (current.value?.id === session.id) select("");
  try { await store.remove(session.id); }
  catch { ElMessage.error("删除失败，请重试"); }
};

// 导出可读记录，澄清与正式回答分开，保留停止、跳过和草稿的真实状态。
const exportSession = () => {
  const session = current.value;
  if (!session) return;
  const content = [
    `# ${session.title}`, `创建时间：${new Date(session.createdAt).toLocaleString("zh-CN")}`,
    `训练类型：${getModeLabel(session.config.mode)}\n目标岗位：${session.config.position}\n工作年限：${session.config.experienceYears}\n参考简历：${session.resumeTitle || "未关联"}\n状态：${statusLabel(session)}\n训练时长：${formatInterviewDuration(session.elapsedMs)}`,
    ...(session.preparation.content ? [`## 准备材料${session.preparation.status === "complete" ? "" : "（未完成）"}\n\n${session.preparation.content}`] : []),
    ...session.turns.map((turn, index) => [
      `## ${turn.phase === INTERVIEW_INTRO_PHASE ? "开场自我介绍 · 限时两分钟" : `第 ${session.turns.slice(0, index + 1).filter((item) => item.phase !== INTERVIEW_INTRO_PHASE).length} 题 · ${turn.phase}`}${turn.question.status === "complete" ? "" : "（未完成）"}`, turn.question.content,
      `作答用时：${formatInterviewDuration(turn.durationSeconds * 1000)}`,
      ...(turn.clarifications?.map((item) => `### 题意澄清${item.reply.status === "complete" ? "" : "（未完成）"}\n\n你的疑问：${item.request}\n\n${item.reply.content}`) || []),
      turn.submitted ? `### 你的回答\n\n${turn.skipped ? "已跳过" : turn.answer}` : "尚未提交回答",
      ...(turn.hint.content ? [`### 答题思路（面试后回看）\n\n${turn.hint.content}`] : []),
      ...(turn.reference.content ? [`### 参考回答（面试后回看）\n\n${turn.reference.content}`] : []),
    ].join("\n\n")),
    ...(session.report.content ? [`## 面试复盘${session.report.status === "complete" ? "" : "（未完成）"}\n\n${session.report.content}`] : []),
    ...(session.draft ? [`## 未提交草稿\n\n${session.draft}`] : []),
  ].join("\n\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" /* 可读的面试文本记录。 */ }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${session.title.replace(/[<>:"/\\|?*]/g, "-")}-${session.id.slice(0, 8)}.md`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
</script>

<template>
  <main class="interview-fields flex h-full min-h-0 min-w-0 flex-col gap-3 bg-sf-page p-3 text-sf-text">
    <header v-if="!current" class="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <span class="flex shrink-0 items-center justify-center rounded-xl border border-sf-b bg-sf-primary text-sf-theme" :class="current ? 'h-9 w-9' : 'h-12 w-12'"><SfIcon icon="ph:microphone-duotone" :size="current ? '5' : '6'" /></span>
        <div><h1 class="font-semibold text-sf-text" :class="current ? 'text-sm' : 'text-lg'">{{ $t('resumeNavInterview') }}</h1><p v-if="!current" class="mt-3 text-xs leading-6 text-sf-text-2">选择训练方式，或先准备自我介绍与面试题。</p></div>
      </div>
      <nav class="flex flex-wrap items-center gap-3">
        <InterviewButton type="bg" :disabled="initializing || !store.ready" @click="historyVisible = true"><SfIcon icon="tabler:history" size="4" />训练记录 {{ sessions.length }}</InterviewButton>
        <InterviewButton v-if="current" type="bg" @click="newSession()">新建训练</InterviewButton>
      </nav>
    </header>
    <p v-if="store.saveError" class="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-error" role="alert">面试记录尚未保存成功：{{ store.saveError }}<InterviewButton type="bg" :disabled="store.saving > 0" @click="store.retrySave">{{ store.saving > 0 ? '正在保存…' : '重试保存' }}</InterviewButton></p>
    <section v-if="initializing" class="flex min-h-60 flex-1 items-center justify-center gap-3 text-sm text-sf-text-2"><SfIcon icon="eos-icons:loading" size="6" />正在读取面试记录…</section>
    <section v-else-if="store.loadError" class="flex flex-1 flex-col items-center justify-center gap-3"><p class="text-sf-error">面试记录读取失败：{{ store.loadError }}</p><InterviewButton @click="initialize">重新读取</InterviewButton></section>
    <!-- 面试中将记录与新建入口合入会话工具栏，避免上下两条导航重复占位。 -->
    <InterviewRoom v-else-if="current" :key="current.id" :session="current" @pause="pause" @resume="resume" @finish="endSession" @submit="submit" @clarify="clarify" @request="request" @again="newSession(true)" @export="exportSession">
      <template #navigation>
        <InterviewButton type="bg" @click="historyVisible = true"><SfIcon icon="tabler:history" size="4" />训练记录 {{ sessions.length }}</InterviewButton>
        <InterviewButton type="bg" @click="newSession()">新建训练</InterviewButton>
      </template>
    </InterviewRoom>
    <!-- 页面外层统一留白，滚动容器不再重复叠加内边距。 -->
    <SfScrollbar v-else flush class="min-h-0 flex-1">
      <SetupPanel :key="setupKey" :initial-config="initialConfig" :initial-resume-id="initialResumeId" @start="start" />
    </SfScrollbar>

    <SfModal v-model="historyVisible" title="面试训练记录" width="860px">
      <section class="interview-fields flex w-full min-w-0 flex-col gap-3">
        <div class="interview-history-filters grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <SfInput v-model="search" placeholder="搜索岗位、公司或记录标题" aria-label="搜索面试记录" clearable />
          <SfSelect v-model="historyMode" :list="historyModeOptions" placeholder="全部训练类型" aria-label="筛选训练类型" clearable />
        </div>
        <section v-if="!filteredSessions.length" class="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-sf-b p-3 text-center">
          <SfIcon icon="tabler:history" size="9" class="text-sf-text-2" /><h3 class="text-sm font-medium">{{ sessions.length ? '没有找到匹配的记录' : '还没有面试记录' }}</h3>
          <p class="text-xs leading-6 text-sf-text-2">{{ sessions.length ? '试试其他关键词，或查看全部类型。' : '完成一次生成或开始面试后，记录会保存在这里。' }}</p>
          <InterviewButton v-if="search || historyMode" type="bg" @click="search = ''; historyMode = ''">清除筛选</InterviewButton>
          <InterviewButton v-else type="bg" @click="historyVisible = false">选择功能</InterviewButton>
        </section>
        <SfScrollbar flush class="h-auto! flex-none!" max-height="60vh">
          <div class="flex flex-col gap-3">
          <!-- 悬停与聚焦统一反馈整行边框，内部打开按钮不再单独铺底色。 -->
          <article v-for="session in filteredSessions" :key="session.id" class="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-sf-theme focus-within:border-sf-theme" :class="current?.id === session.id ? 'border-sf-theme bg-sf-bg' : 'border-sf-b'">
            <button type="button" class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl text-left focus-visible:outline-2 focus-visible:outline-sf-theme" @click="openSession(session.id)">
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sf-page text-sf-theme"><SfIcon :icon="isPreparationMode(session.config.mode) ? 'lucide:file-text' : 'ph:microphone-duotone'" size="5" /></span>
              <span class="flex min-w-0 flex-1 flex-col gap-3"><span class="flex flex-wrap items-center gap-3"><span class="break-words text-sm font-medium">{{ session.title }}</span><span class="text-xs" :class="session.status === 'completed' ? 'text-sf-success' : session.status === 'paused' ? 'text-sf-warning' : 'text-sf-theme'">{{ statusLabel(session) }}</span><span v-if="current?.id === session.id" class="text-xs text-sf-theme">当前记录</span></span>
              <span class="text-xs leading-6 text-sf-text-2">{{ dateLabel(session.updatedAt) }} · {{ getModeLabel(session.config.mode) }}<template v-if="!isPreparationMode(session.config.mode)"> · 已完成 {{ getInterviewCompletedCount(session.config, session.turns.filter(turn => turn.submitted)) }}<template v-if="getInterviewQuestionLimit(session.config)"> / {{ getInterviewQuestionLimit(session.config) }}</template> {{ session.config.mode === 'specialized' ? '轮有效回答' : '题' }}</template></span></span>
            </button>
            <InterviewButton type="error" plain @click="deleteSession(session)">删除</InterviewButton>
          </article>
          </div>
        </SfScrollbar>
      </section>
    </SfModal>
  </main>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 使用可由 Tailwind 处理的样式入口，明确绘制面试表单边框与底色。 */
.interview-fields {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner) {
    @apply rounded-xl border border-sf-b bg-sf-bg text-sf-text;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    @apply min-h-12 p-3;
  }

  /* 内框填满随表单行拉伸的下拉外壳，避免底部露出重复底色。 */
  :deep(.el-select__wrapper) {
    @apply h-full;
  }

  :deep(.el-textarea__inner) {
    @apply p-3;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-select__wrapper:hover),
  :deep(.el-textarea__inner:hover),
  :deep(.el-input__wrapper.is-focus),
  :deep(.el-select__wrapper.is-focused),
  :deep(.el-textarea__inner:focus) {
    @apply border-sf-theme;
  }

  /* 不可编辑状态保留边界和草稿可读性，与可输入状态明确区分。 */
  :deep(.el-input.is-disabled .el-input__wrapper),
  :deep(.el-select__wrapper.is-disabled),
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    @apply cursor-not-allowed border-sf-b bg-sf-page text-sf-text-2;
  }
}

/* 记录筛选使用紧凑控件，同高对齐，不改变开始页表单的尺寸。 */
.interview-history-filters :deep(.el-input__wrapper),
.interview-history-filters :deep(.el-select__wrapper) {
  @apply min-h-9 px-3 py-0;
}
</style>
