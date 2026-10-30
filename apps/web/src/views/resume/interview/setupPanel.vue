<script setup lang="ts">
import InterviewButton from "./interviewButton.vue";
import { computed, reactive, ref, watch } from "vue";
import { useStorage } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { hasInterviewModel } from "@snowflake/interview-agent";
import type { InterviewConfig, InterviewMode } from "@snowflake/interview-agent";
import type { ResumeSnapshot } from "@snowflake/resume-core";
import { useResumeStore } from "@/stores";
import { useResumeName } from "../hooks/useResumeName";
import { createInterviewConfig, INTERVIEW_LANGUAGE_KEY, INTERVIEW_MODES, isPreparationMode } from "./config";
import { createResumeSnapshotForAi } from "../shared/resumeSnapshot";
import { readInterviewResumeProfile } from "./resumeProfile";
import InterviewModelSettings from "./interviewModelSettings.vue";

const emit = defineEmits<{
  start: [config: InterviewConfig, resumeId: string, resumeTitle: string, snapshot: ResumeSnapshot]; // 资料确认后开始独立训练。
}>();
const props = defineProps<{
  initialConfig?: InterviewConfig; // 再练一场时复用的面试设置。
  initialResumeId?: string; // 再练一场时优先选择的来源简历。
}>();
const resumeStore = useResumeStore();
const { getResumeTitle } = useResumeName();
const language = useStorage<InterviewConfig["language"]>(INTERVIEW_LANGUAGE_KEY, "中文");
const config = reactive({ ...createInterviewConfig(), ...props.initialConfig, language: language.value });
// 设置中修改语言只更新尚未开始的表单，已创建的面试仍使用自己的固定设置。
watch(language, (value) => { config.language = value; });
// 初次进入只展示分类，明确选择后再显示本场配置界面。
const category = ref<InterviewMode | null>(null);
const pendingCategory = ref<InterviewMode | null>(props.initialConfig?.mode || null);
const modelSettingsVisible = ref(false);
const modelReady = computed(() => hasInterviewModel());
const resumeId = ref(props.initialResumeId || "");
const loading = ref(true);
const loadError = ref("");
const starting = ref(false);
const selectedResume = computed(() => resumeStore.resumeList.find((item) => item.id === resumeId.value));
const selectedMode = computed(() => INTERVIEW_MODES.find((item) => item.value === category.value));
const preparation = computed(() => isPreparationMode(config.mode));
// 分类按实际使用方式分组，文案生成不混入逐轮面试。
const modeGroups = [
  {
    name: "模拟面试", // 需要逐轮真实作答的功能组。
    description: "从两分钟自我介绍开始，逐题作答，结束后复盘。", // 本组的共同使用方式。
    modes: INTERVIEW_MODES.filter((mode) => !isPreparationMode(mode.value)), // 三类逐轮面试。
  },
  {
    name: "面试准备", // 一次生成准备内容的功能组。
    description: "生成后直接阅读、练习或复制。", // 本组无需进入作答流程。
    modes: INTERVIEW_MODES.filter((mode) => isPreparationMode(mode.value)), // 押题与自我介绍稿。
  },
];
const textOptions = (values: string[]) => values.map((value) => ({
  value, // 选择后保存的设置值。
  name: value, // 下拉菜单中显示的设置名称。
}));
const experienceOptions = textOptions(["应届生", "1 年以下", "1 年", "2 年", "3 年", "4 年", "5 年", "6–10 年", "10 年以上"]);
const resumeOptions = computed(() => resumeStore.resumeList.map((resume) => ({
  value: resume.id, // 实际简历编号。
  name: getResumeTitle(resume), // 用户可识别的简历标题。
})));
// 自我介绍只需要简历或背景，模拟面试才要求岗位与年限。
const canStart = computed(() => !!category.value && (config.mode === "intro"
  ? !!selectedResume.value || !!config.background.trim()
  : !!config.position.trim() && !!config.experienceYears.trim() && (config.mode !== "specialized" || !!config.direction.trim()))
  && (!resumeId.value || (!!selectedResume.value && !loading.value)) && !starting.value);
// 禁用主按钮时直接说明缺少什么，不让用户猜测下一步。
const startNotice = computed(() => {
  if (resumeId.value && (loading.value || !selectedResume.value)) return "正在读取参考简历，请稍候或清空选择。";
  if (config.mode === "intro") return selectedResume.value || config.background.trim() ? "准备好了，生成后可直接复制。" : "选择一份简历，或简单填写自己的背景。";
  if (!config.position.trim() || !config.experienceYears.trim()) return config.mode === "specialized" ? "确认岗位、年限和这次的训练重点。" : "填好求职岗位与工作年限即可开始。";
  if (config.mode === "specialized" && !config.direction.trim()) return "写下这次想重点练习的内容。";
  return preparation.value ? "按目标岗位生成准备材料。" : "先进行两分钟自我介绍，结束后统一复盘。";
});
const startLabel = computed(() => starting.value ? "正在创建…" : config.mode === "intro" ? "生成自我介绍" : preparation.value ? "生成面试题" : "开始面试");

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

// 跟踪上次自动带入的内容，切换简历时更新自动值，保留用户自行修改的目标。
let autofilledProfile = {
  position: "", // 上次从简历自动带入的岗位。
  experienceYears: "", // 上次从简历自动带入的工作年限。
};
watch(() => selectedResume.value?.id, () => {
  if (!selectedResume.value) return;
  const profile = readInterviewResumeProfile(selectedResume.value);
  if (!config.position.trim() || config.position === autofilledProfile.position) config.position = profile.position;
  if (!config.experienceYears.trim() || config.experienceYears === autofilledProfile.experienceYears) config.experienceYears = profile.experienceYears;
  autofilledProfile = profile;
}, { immediate: true });

const chooseCategory = (mode: InterviewMode) => {
  // 分类选择先核对模型，未配置时不让用户进入填写流程。
  if (!modelReady.value) {
    pendingCategory.value = mode;
    modelSettingsVisible.value = true;
    return;
  }
  // 卡片已经确定训练类型，切换时清除上一个专项重点，不再要求选择子类型。
  if (config.mode !== mode) config.direction = "";
  config.mode = mode;
  category.value = mode;
};

const openModelSettings = () => {
  pendingCategory.value = category.value || pendingCategory.value;
  modelSettingsVisible.value = true;
};
// 原地完成配置后恢复刚才选择的分类，保留已有表单与简历选择。
const continueAfterModel = () => {
  if (!modelReady.value) { ElMessage.warning("请先在角色模型中为面试官小羊选择可用模型"); return; }
  modelSettingsVisible.value = false;
  const mode = pendingCategory.value;
  pendingCategory.value = null;
  if (mode) chooseCategory(mode);
};

const start = () => {
  if (!category.value || starting.value) return;
  if (!modelReady.value) { openModelSettings(); return; }
  if (config.mode === "intro") {
    if (!selectedResume.value && !config.background.trim()) { ElMessage.warning("请选择简历，或填写自己的背景资料"); return; }
  } else {
    if (!config.position.trim()) { ElMessage.warning("请填写求职岗位"); return; }
    if (!config.experienceYears.trim()) { ElMessage.warning("请选择工作年限"); return; }
    if (config.mode === "specialized" && !config.direction.trim()) { ElMessage.warning("请填写这次的训练重点"); return; }
  }
  if (resumeId.value && (loading.value || !selectedResume.value)) { ElMessage.warning("请等待简历读取完成，或清空参考简历后开始"); return; }
  try {
    // 参考简历固定脱敏，不在开始页增加隐私配置步骤。
    const snapshot = selectedResume.value ? createResumeSnapshotForAi(selectedResume.value, true) : {};
    starting.value = true;
    emit("start", {
      ...config,
      position: config.position.trim(), // 本场确认的求职岗位。
      experienceYears: config.experienceYears.trim(), // 本场确认的工作年限。
      direction: config.mode === "specialized" ? config.direction.trim() : "", // 仅专项面试固定本场训练重点。
      company: config.company.trim(), // 可选的目标公司或行业。
      jobDescription: config.jobDescription.trim(), // 可选的职位描述。
      background: config.background.trim(), // 生成自我介绍时提供的背景或补充要求。
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
      <p v-if="!modelReady" class="flex flex-wrap items-center gap-3 rounded-xl border border-sf-warning bg-sf-primary p-3 text-sm text-sf-text-2" role="status">
        <SfIcon icon="lucide:circle-alert" size="5" class="shrink-0 text-sf-warning" />
        <span class="flex-1">先为面试官小羊选择模型，配置完成后会回到你选的功能。</span>
        <InterviewButton type="bg" @click="openModelSettings">配置模型</InterviewButton>
      </p>
      <!-- 图标与标题同排，避免装饰元素单独占用卡片高度。 -->
      <section v-for="group in modeGroups" :key="group.name" class="flex flex-col gap-3">
        <header class="flex flex-wrap items-baseline gap-3">
          <h2 class="text-sm font-semibold">{{ group.name }}</h2>
          <p class="text-xs leading-6 text-sf-text-2">{{ group.description }}</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-2" :class="{ 'xl:grid-cols-3': group.name === '模拟面试' }">
          <!-- 悬停仅改变边框，保持卡片背景不变。 -->
          <button v-for="mode in group.modes" :key="mode.value" type="button"
            class="flex h-full min-w-0 cursor-pointer flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3 text-left transition-colors hover:border-sf-theme focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sf-theme"
            @click="chooseCategory(mode.value)">
            <span class="flex items-center gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sf-bg text-sf-theme"><SfIcon :icon="mode.icon" size="5" /></span>
              <span class="min-w-0 flex-1 font-semibold">{{ mode.label }}</span>
              <span class="shrink-0 text-xs text-sf-text-2">{{ isPreparationMode(mode.value) ? '生成内容' : '逐轮对话' }}</span>
            </span>
            <span class="text-sm leading-6 text-sf-text-2">{{ mode.description }}</span>
            <span class="text-xs leading-6 text-sf-text-2">{{ mode.detail }}</span>
            <span class="mt-auto flex w-full items-center justify-between gap-3 border-t border-sf-b pt-3 text-xs font-medium text-sf-theme">
              {{ modelReady ? mode.value === 'intro' ? '准备自我介绍' : isPreparationMode(mode.value) ? '准备面试题' : '确认资料，开始面试' : '配置模型后继续' }}
              <SfIcon icon="mingcute:arrow-right-line" size="4" />
            </span>
          </button>
        </div>
      </section>
    </template>

    <template v-else-if="selectedMode">
      <!-- 卡片确定用途，开始页只确认资料，专项额外填写本次训练重点。 -->
      <form class="flex flex-col gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3" @submit.prevent="start">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sf-bg text-sf-theme"><SfIcon :icon="selectedMode.icon" size="5" /></span>
            <div><h2 class="font-semibold">{{ selectedMode.label }}</h2><p class="text-xs leading-6 text-sf-text-2">{{ selectedMode.detail }}</p></div>
          </div>
          <nav class="flex flex-wrap gap-3"><InterviewButton type="bg" @click="openModelSettings">面试设置</InterviewButton><InterviewButton type="bg" @click="category = null">更换类型</InterviewButton></nav>
        </header>
        <section class="grid gap-3 border-t border-sf-b pt-3 sm:grid-cols-2" :class="{ 'lg:grid-cols-3': config.mode !== 'intro' }">
          <label class="flex min-w-0 flex-col gap-3 text-sm" :class="{ 'sm:col-span-2': config.mode === 'intro' }"><span class="flex items-center justify-between gap-3 font-medium">参考简历<span class="text-xs font-normal text-sf-text-2">选填</span></span>
            <SfSelect v-model="resumeId" :list="resumeOptions" :loading="loading" :disabled="loading || starting" filterable clearable :placeholder="config.mode === 'intro' ? '选择用来生成自我介绍的简历' : '选择后自动补齐尚未填写的岗位与年限'" />
          </label>
          <label v-if="config.mode !== 'intro'" class="flex min-w-0 flex-col gap-3 text-sm"><span class="flex items-center justify-between gap-3 font-medium">求职岗位<span class="text-xs font-normal text-sf-theme">必填</span></span><SfInput v-model="config.position" placeholder="例如：前端工程师、产品经理" maxlength="100" /></label>
          <label v-if="config.mode !== 'intro'" class="flex min-w-0 flex-col gap-3 text-sm"><span class="flex items-center justify-between gap-3 font-medium">工作年限<span class="text-xs font-normal text-sf-theme">必填</span></span><SfSelect v-model="config.experienceYears" :list="experienceOptions" filterable allow-create default-first-option placeholder="请选择，也可输入具体年限" /></label>
          <label v-if="config.mode !== 'intro'" class="flex min-w-0 flex-col gap-3 text-sm"><span class="flex items-center justify-between gap-3 font-medium">目标公司或行业<span class="text-xs font-normal text-sf-text-2">选填</span></span><SfInput v-model="config.company" placeholder="不填则按通用岗位场景面试" maxlength="100" /></label>
          <label v-if="config.mode === 'intro'" class="flex min-w-0 flex-col gap-3 text-sm sm:col-span-2"><span class="font-medium">背景与补充要求<span class="ml-3 text-xs font-normal text-sf-text-2">选了简历可不填</span></span><SfInput v-model="config.background" type="textarea" :rows="3" maxlength="12000" resize="none" placeholder="简单描述经历与求职方向，也可补充想突出的内容" /></label>
          <label v-else class="flex min-w-0 flex-col gap-3 text-sm sm:col-span-2"><span class="flex items-center justify-between gap-3 font-medium">职位描述<span class="text-xs font-normal text-sf-text-2">选填</span></span><SfInput v-model="config.jobDescription" type="textarea" :rows="2" maxlength="12000" resize="none" placeholder="粘贴岗位职责与任职要求" /></label>
          <label v-if="config.mode === 'specialized'" class="flex min-w-0 flex-col gap-3 text-sm sm:col-span-2 lg:col-span-3"><span class="flex items-center justify-between gap-3 font-medium">训练重点<span class="text-xs font-normal text-sf-theme">必填</span></span><SfInput v-model="config.direction" placeholder="例如：接口设计、项目表达、产品需求分析" maxlength="200" /></label>
        </section>
        <p v-if="loadError" class="flex flex-wrap items-center gap-3 text-xs text-sf-error" role="alert">{{ loadError }}<InterviewButton type="bg" @click="loadResumes">重新读取</InterviewButton></p>
        <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-sf-b pt-3">
          <span class="text-xs leading-6 text-sf-text-2" role="status">{{ startNotice }}<template v-if="selectedResume"> 简历姓名和联系方式自动隐藏。</template></span>
          <InterviewButton :disabled="!canStart" @click="start"><SfIcon v-if="starting" icon="eos-icons:loading" size="4" />{{ startLabel }}<SfIcon v-if="!starting" icon="mingcute:arrow-right-line" size="4" /></InterviewButton>
        </footer>
      </form>
    </template>

    <InterviewModelSettings v-model="modelSettingsVisible" @ready="continueAfterModel" />
  </section>
</template>
