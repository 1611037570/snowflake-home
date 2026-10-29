<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import type { InterviewConfig } from "@snowflake/interview-agent";
import confirm from "@/components/business/confirm";
import { INTERVIEW_INTRO_PHASE, INTERVIEW_MODES, formatInterviewDuration, getInterviewCompletedCount, getInterviewQuestionLimit, getModeLabel, isPreparationMode } from "./config";
import { useInterviewSession } from "./useInterviewSession";
import type { InterviewSession } from "./types";
import SetupPanel from "./setupPanel.vue";
import InterviewRoom from "./interviewRoom.vue";

const { store, current, select, start, pause, resume, submit, finish, request } = useInterviewSession();
const historyVisible = ref(false);
const search = ref("");
const historyMode = ref("");
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
const statusLabel = (session: InterviewSession) => session.status === "completed" ? "已结束" : session.status === "active" ? "进行中" : "已暂停";

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
const endSession = async () => {
  try {
    await confirm("结束后将停止提问，并只根据已提交的回答生成复盘。未提交的草稿会保留在记录中。", "结束本场面试", { confirmText: "结束并复盘", cancelText: "继续作答" });
    await finish();
  } catch { /* 用户取消时保持当前训练。 */ }
};
const deleteSession = async (session: InterviewSession) => {
  try {
    await confirm(`删除“${session.title}”及其问答、草稿和复盘？此操作无法恢复。`, "删除面试记录", { confirmText: "删除", cancelText: "取消" });
  } catch { return; }
  if (current.value?.id === session.id) select("");
  try { await store.remove(session.id); }
  catch { ElMessage.error("删除失败，请重试"); }
};

// 导出可读记录，保留辅助、跳过、未完成输出与草稿的真实标记。
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
      turn.submitted ? `### 你的回答${turn.assisted ? "（使用过辅助）" : ""}\n\n${turn.skipped ? "已跳过" : turn.answer}` : "尚未提交回答",
      ...(turn.hint.content ? [`### 思考提示（辅助内容）\n\n${turn.hint.content}`] : []),
      ...(turn.reference.content ? [`### 参考回答（辅助内容）\n\n${turn.reference.content}`] : []),
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
  <main class="interview-fields flex h-full min-h-0 min-w-0 flex-col gap-3 bg-sf-page text-sf-text">
    <header class="flex shrink-0 flex-wrap items-center justify-between gap-3 p-3">
      <div>
        <h1 class="text-lg font-semibold text-sf-text">{{ $t('resumeNavInterview') }}</h1>
        <p class="mt-[6px] text-xs leading-6 text-sf-text-2">选择分类，填写岗位与年限即可开始，其他资料均为选填。</p>
      </div>
      <nav class="flex flex-wrap items-center gap-3">
        <span class="text-xs" :class="store.saveError ? 'text-sf-error' : 'text-sf-text-2'">{{ store.saveError ? '保存失败' : store.saving ? '正在保存…' : '本地独立存储' }}</span>
        <SfButton type="bg" :disabled="initializing || !store.ready" @click="historyVisible = true"><SfIcon icon="tabler:history" size="4" class="mr-3" />训练记录 {{ sessions.length }}</SfButton>
        <SfButton v-if="current" type="bg" @click="newSession()">新建训练</SfButton>
        <RouterLink v-if="current" to="/resume/ai" class="rounded-xl border border-sf-b p-3 text-xs transition-colors hover:border-sf-theme">模型设置</RouterLink>
      </nav>
    </header>
    <p v-if="store.saveError" class="flex shrink-0 flex-wrap items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-error" role="alert">面试记录尚未保存成功：{{ store.saveError }}<SfButton type="bg" @click="store.retrySave">重试保存</SfButton></p>
    <section v-if="initializing" class="flex min-h-60 flex-1 items-center justify-center gap-3 text-sm text-sf-text-2"><SfIcon icon="eos-icons:loading" size="6" />正在读取面试记录…</section>
    <section v-else-if="store.loadError" class="flex flex-1 flex-col items-center justify-center gap-3"><p class="text-sf-error">面试记录读取失败：{{ store.loadError }}</p><SfButton @click="initialize">重新读取</SfButton></section>
    <InterviewRoom v-else-if="current" :key="current.id" :session="current" @pause="pause" @resume="resume" @finish="endSession" @submit="submit" @request="request" @again="newSession(true)" @export="exportSession" />
    <!-- 滚动容器与页面外层不再重复留白，表单自身统一控制内边距。 -->
    <SfScrollbar v-else flush class="min-h-0 flex-1">
      <SetupPanel :key="setupKey" :initial-config="initialConfig" :initial-resume-id="initialResumeId" @start="start" />
    </SfScrollbar>

    <SfModal v-model="historyVisible" title="面试训练记录" width="860px">
      <section class="interview-fields flex w-full min-w-0 flex-col gap-3">
        <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <el-input v-model="search" placeholder="搜索岗位、公司或记录标题" clearable />
          <el-select v-model="historyMode" placeholder="全部训练类型" clearable><el-option v-for="mode in INTERVIEW_MODES" :key="mode.value" :value="mode.value" :label="mode.label" /></el-select>
        </div>
        <p v-if="!filteredSessions.length" class="p-3 text-center text-sm text-sf-text-2">{{ sessions.length ? '没有符合条件的记录' : '还没有训练记录，先开始一场面试吧' }}</p>
        <SfScrollbar flush class="h-auto! flex-none!" max-height="60vh">
          <div class="flex flex-col gap-3">
          <article v-for="session in filteredSessions" :key="session.id" class="flex items-center gap-3 rounded-xl border border-sf-b p-3">
            <button type="button" class="flex min-w-0 flex-1 cursor-pointer flex-col gap-3 rounded-xl p-3 text-left hover:bg-sf-bg" @click="openSession(session.id)">
              <span class="break-words text-sm font-medium">{{ session.title }}</span>
              <span class="text-xs leading-6 text-sf-text-2">{{ dateLabel(session.updatedAt) }} · {{ statusLabel(session) }}<template v-if="!isPreparationMode(session.config.mode)"> · 已完成 {{ getInterviewCompletedCount(session.config, session.turns.filter(turn => turn.submitted)) }}<template v-if="getInterviewQuestionLimit(session.config)"> / {{ getInterviewQuestionLimit(session.config) }}</template> {{ session.config.mode === 'specialized' ? '轮有效回答' : '题' }}</template></span>
            </button>
            <SfButton type="error" plain @click="deleteSession(session)">删除</SfButton>
          </article>
          </div>
        </SfScrollbar>
        <p class="text-xs leading-6 text-sf-text-2">面试记录与简历分开保存。删除简历不会删除面试记录；清理浏览器站点数据会删除本地记录，请按需导出。</p>
      </section>
    </SfModal>
  </main>
</template>

<style lang="scss" scoped>
// 面试表单明确绘制边框与底色，不依赖已被全局去掉的输入框阴影。
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
}
</style>
