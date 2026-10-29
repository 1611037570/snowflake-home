<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { hasInterviewModel } from "@snowflake/interview-agent";
import type { InterviewConfig, InterviewMode } from "@snowflake/interview-agent";
import type { ResumeSnapshot } from "@snowflake/resume-core";
import { useResumeStore } from "@/stores";
import { useResumeName } from "../hooks/useResumeName";
import { createInterviewConfig, INTERVIEW_MODES, isPreparationMode } from "./config";
import { createResumeSnapshotForAi } from "../shared/resumeSnapshot";
import { readInterviewResumeProfile } from "./resumeProfile";

const AiProviderSettingsContent = defineAsyncComponent(() => import("../editor/toolbar/modules/ai/content.vue"));

const emit = defineEmits<{
  start: [config: InterviewConfig, resumeId: string, resumeTitle: string, snapshot: ResumeSnapshot]; // 资料确认后开始独立训练。
}>();
const props = defineProps<{
  initialConfig?: InterviewConfig; // 再练一场时复用的面试设置。
  initialResumeId?: string; // 再练一场时优先选择的来源简历。
}>();
const resumeStore = useResumeStore();
const { getResumeTitle } = useResumeName();
const config = reactive({ ...createInterviewConfig(), ...props.initialConfig });
// 初次进入只展示分类，明确选择后再显示本场配置界面。
const category = ref<InterviewMode | null>(null);
const pendingCategory = ref<InterviewMode | null>(props.initialConfig?.mode || null);
const modelSettingsVisible = ref(false);
const modelReady = computed(() => hasInterviewModel());
const resumeId = ref(props.initialResumeId || "");
const desensitize = ref(true);
const loading = ref(true);
const loadError = ref("");
const starting = ref(false);
const selectedResume = computed(() => resumeStore.resumeList.find((item) => item.id === resumeId.value));
const selectedMode = computed(() => INTERVIEW_MODES.find((item) => item.value === category.value));
const preparation = computed(() => isPreparationMode(config.mode));
const directions = computed(() => config.mode === "specialized" ? ["技术面", "业务面"] : ["八股文", "项目深挖"]);
const textOptions = (values: string[]) => values.map((value) => ({
  value, // 选择后保存的设置值。
  name: value, // 下拉菜单中显示的设置名称。
}));
const languageOptions = textOptions(["中文", "英语"]);
const experienceOptions = textOptions(["应届生", "1 年以下", "1 年", "2 年", "3 年", "4 年", "5 年", "6–10 年", "10 年以上"]);
const introStyleOptions = textOptions(["简洁", "专业", "热情"]);
const directionOptions = computed(() => textOptions(directions.value));
const feedbackOptions = [
  { value: "打分并给改进建议" /* 原简历面试评分选择。 */, name: "打分并给改进建议" /* 页面选项名称。 */ },
  { value: "只继续追问" /* 保留简短反馈与追问。 */, name: "只继续追问" /* 页面选项名称。 */ },
];
const wordCountOptions = [100, 200, 300].map((count) => ({
  value: String(count), // 通用选择组件使用的字数字符串。
  name: `${count} 字`, // 原自我介绍字数选项。
}));
const wordCountValue = computed({
  get: () => String(config.introWordCount), // 适配通用选择组件的值类型。
  set: (value: string) => { config.introWordCount = Number(value) as InterviewConfig["introWordCount"]; }, // 保留原来的三档字数。
});
const resumeOptions = computed(() => resumeStore.resumeList.map((resume) => ({
  value: resume.id, // 实际简历编号。
  name: getResumeTitle(resume), // 用户可识别的简历标题。
})));
// 只要求年限与岗位；可选简历的加载不阻塞无简历起步。
const canStart = computed(() => !!category.value && !!config.position.trim() && !!config.experienceYears.trim()
  && (!resumeId.value || (!!selectedResume.value && !loading.value)) && !starting.value);

// 只加载可选简历，不改变编辑器当前编辑对象。
const loadResumes = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    await resumeStore.loadActiveResumes();
    if (resumeId.value && !selectedResume.value) resumeId.value = "";
  } catch (error) { loadError.value = error instanceof Error ? error.message : "简历列表读取失败"; }
  finally { loading.value = false; }
};
void loadResumes();

// 选择参考简历时只补齐空白的关键字段，不展示正文或覆盖已填写的目标。
watch(() => selectedResume.value?.id, () => {
  if (!selectedResume.value) return;
  const profile = readInterviewResumeProfile(selectedResume.value);
  if (!config.position.trim()) config.position = profile.position;
  if (!config.experienceYears.trim()) config.experienceYears = profile.experienceYears;
}, { immediate: true });

const chooseCategory = (mode: InterviewMode) => {
  // 分类选择先核对模型，未配置时不让用户进入填写流程。
  if (!modelReady.value) {
    pendingCategory.value = mode;
    modelSettingsVisible.value = true;
    return;
  }
  if (config.mode !== mode) config.direction = mode === "specialized" ? "技术面" : mode === "hr" ? "行测与 HR" : "项目深挖";
  config.mode = mode;
  category.value = mode;
};

const openModelSettings = () => {
  pendingCategory.value = category.value || pendingCategory.value;
  modelSettingsVisible.value = true;
};
// 原地完成配置后恢复刚才选择的分类，保留已有表单与简历选择。
const continueAfterModel = () => {
  if (!modelReady.value) { ElMessage.warning("请先在角色模型中为面试官选择可用模型"); return; }
  modelSettingsVisible.value = false;
  const mode = pendingCategory.value;
  pendingCategory.value = null;
  if (mode) chooseCategory(mode);
};

const start = () => {
  if (!category.value || starting.value) return;
  if (!modelReady.value) { openModelSettings(); return; }
  if (!config.position.trim()) { ElMessage.warning("请填写求职岗位"); return; }
  if (!config.experienceYears.trim()) { ElMessage.warning("请选择工作年限"); return; }
  if (resumeId.value && (loading.value || !selectedResume.value)) { ElMessage.warning("请等待简历读取完成，或清空参考简历后开始"); return; }
  try {
    const snapshot = selectedResume.value ? createResumeSnapshotForAi(selectedResume.value, desensitize.value) : {};
    starting.value = true;
    emit("start", {
      ...config,
      position: config.position.trim(), // 本场确认的求职岗位。
      experienceYears: config.experienceYears.trim(), // 本场确认的工作年限。
      company: config.company.trim(), // 可选的目标公司或行业。
      jobDescription: config.jobDescription.trim(), // 可选的职位描述。
    }, selectedResume.value?.id || "", selectedResume.value ? getResumeTitle(selectedResume.value) : "", snapshot);
  } catch {
    starting.value = false;
    ElMessage.error("读取面试简历失败，请重新选择简历后再开始");
  }
};
// 再练一场也先核对模型，不绕过分类入口的检查。
if (props.initialConfig) chooseCategory(props.initialConfig.mode);
</script>

<template>
  <section class="flex min-w-0 flex-col gap-3">
    <template v-if="!category">
      <header class="p-3">
        <h2 class="font-semibold">先选择一类训练</h2>
        <p class="mt-3 text-xs leading-6 text-sf-text-2">选择后填写工作年限与求职岗位，即可开始。</p>
      </header>
      <p v-if="!modelReady" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-sm text-sf-text-2">尚未配置面试模型，选择分类后会先打开模型设置。<SfButton type="bg" @click="openModelSettings">配置模型</SfButton></p>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="训练分类">
        <button v-for="mode in INTERVIEW_MODES" :key="mode.value" type="button"
          class="flex cursor-pointer flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3 text-left transition-colors hover:border-sf-theme hover:bg-sf-bg"
          @click="chooseCategory(mode.value)">
          <span class="flex items-center gap-3 font-semibold"><SfIcon :icon="mode.icon" size="6" class="text-sf-theme" />{{ mode.label }}</span>
          <span class="text-sm leading-6 text-sf-text-2">{{ mode.description }}</span>
          <span class="text-xs leading-6 text-sf-text-2">{{ mode.detail }}</span>
          <span class="text-xs font-medium text-sf-theme">{{ modelReady ? '设置并开始' : '先配置模型再继续' }}</span>
        </button>
      </div>
    </template>

    <template v-else-if="selectedMode">
      <!-- 配置集中在一张表单内，必填项优先，可选目标直接展示。 -->
      <form class="flex flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3" @submit.prevent="start">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="flex items-center gap-3 font-semibold"><SfIcon :icon="selectedMode.icon" size="6" class="text-sf-theme" />{{ selectedMode.label }}</h2>
          <SfButton type="bg" @click="category = null">重新选择分类</SfButton>
        </header>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="flex min-w-0 flex-col gap-3 text-sm">求职岗位（必填）<SfInput v-model="config.position" placeholder="例如：前端工程师、产品经理" maxlength="100" /></label>
          <label class="flex min-w-0 flex-col gap-3 text-sm">工作年限（必填）<SfSelect v-model="config.experienceYears" :list="experienceOptions" filterable allow-create default-first-option placeholder="请选择年限，也可输入具体年限" /></label>
          <label class="flex min-w-0 flex-col gap-3 text-sm">目标公司或行业（选填）<SfInput v-model="config.company" placeholder="不填则按通用岗位场景面试" maxlength="100" /></label>
          <label class="flex min-w-0 flex-col gap-3 text-sm">参考简历（选填）
            <SfSelect v-model="resumeId" :list="resumeOptions" :loading="loading" :disabled="loading || starting" filterable clearable placeholder="可不选，选择后自动补齐岗位与年限" />
          </label>
          <p v-if="loadError" class="flex flex-wrap items-center gap-3 text-xs text-sf-error sm:col-span-2">{{ loadError }}，可不选简历继续。<SfButton type="bg" @click="loadResumes">重新读取</SfButton></p>
          <label class="flex min-w-0 flex-col gap-3 text-sm sm:col-span-2">职位描述（选填）<SfInput v-model="config.jobDescription" type="textarea" :rows="3" maxlength="12000" resize="none" placeholder="粘贴岗位职责与任职要求，让面试更贴近目标岗位" /></label>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <label class="flex min-w-0 flex-col gap-3 text-sm">面试语言<SfSelect v-model="config.language" :list="languageOptions" /></label>
          <label v-if="config.mode === 'resume' || config.mode === 'specialized'" class="flex min-w-0 flex-col gap-3 text-sm">考察方向<SfSelect v-model="config.direction" :list="directionOptions" /></label>
          <label v-if="config.mode === 'resume'" class="flex min-w-0 flex-col gap-3 text-sm">回答反馈<SfSelect v-model="config.feedback" :list="feedbackOptions" /></label>
          <label v-if="config.mode === 'intro'" class="flex min-w-0 flex-col gap-3 text-sm">自我介绍字数<SfSelect v-model="wordCountValue" :list="wordCountOptions" /></label>
          <label v-if="config.mode === 'intro'" class="flex min-w-0 flex-col gap-3 text-sm">表达风格<SfSelect v-model="config.introStyle" :list="introStyleOptions" /></label>
        </div>
        <footer class="flex flex-wrap items-center justify-between gap-3">
          <el-checkbox v-if="selectedResume" v-model="desensitize">隐藏简历中的姓名和联系方式</el-checkbox>
          <span v-else class="text-xs text-sf-text-2">只需岗位与年限，其他资料均可不填。</span>
          <div class="flex flex-wrap gap-3">
            <SfButton type="bg" @click="openModelSettings">模型设置</SfButton>
            <SfButton class="min-h-12" :disabled="!canStart" @click="start">{{ starting ? '正在创建' : preparation ? '生成准备材料' : '开始面试' }}</SfButton>
          </div>
        </footer>
      </form>
    </template>

    <SfModal v-model="modelSettingsVisible" :title="modelReady ? '面试模型设置' : '先配置面试模型'" width="1100px">
      <section class="interview-fields flex w-full min-w-0 flex-col gap-3">
        <p class="text-xs leading-6 text-sf-text-2">为“面试官”选择可用模型后再继续。设置在当前页面完成，已选择的分类、简历和填写内容都会保留。</p>
        <SfScrollbar flush class="h-auto! flex-none!" max-height="60vh"><AiProviderSettingsContent /></SfScrollbar>
        <div class="flex flex-wrap justify-end gap-3"><SfButton type="bg" @click="modelSettingsVisible = false">暂不继续</SfButton><SfButton :disabled="!modelReady" @click="continueAfterModel">配置完成，继续</SfButton></div>
      </section>
    </SfModal>
  </section>
</template>
