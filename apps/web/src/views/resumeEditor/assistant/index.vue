<script setup>
import { computed, inject } from "vue";
import { useAiStore, useResumeStore } from "@/stores";
import {
  ALL_MODULE_KEY,
  ALL_MODULE_NAME,
  DEFAULT_EDITOR,
} from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { flows, suggestions } from "./flows";
import { useResumeAssistant } from "./useResumeAssistant";

const Chat = defineAsyncComponent(() => import("./chat/index.vue"));

// AI 对话
const aiStore = useAiStore();
const resumeStore = useResumeStore();
// 应用 AI 差异由上层预览草稿注入，随技能与工具一并传给 chat
const applyDiff = inject("applyDiff");
// 组装简历域技能、工具与对话创建方法，入口不再直接拼接系统消息
const { config: assistantConfig, createChat: createAssistantChat } = useResumeAssistant(applyDiff);
const { resumeAssistantChat } = storeToRefs(aiStore);
const { system } = storeToRefs(resumeStore);
const { selectedModule } = storeToRefs(resumeStore);
// 当前操作模块列表：有选中模块时展示真实模块，无选中时补“整个简历”兜底项
const selectedModules = computed(() =>
  selectedModule.value.length
    ? selectedModule.value
    : [{ key: ALL_MODULE_KEY, name: ALL_MODULE_NAME }],
);
// 点击模块标签右上角关闭按钮时取消选中，统一走 store 操作
const removeSelectedModule = (key) => {
  resumeStore.unselectModule(key);
};
// AI助手区域宽度：读取编辑器配置，默认 400px
const assistantWidth = DEFAULT_EDITOR.assistantWidth;

// 简历助手对话：ai store 已持久化，无缓存时初始化默认对话
if (!resumeAssistantChat.value) {
  resumeAssistantChat.value = createAssistantChat();
}
const chat = resumeAssistantChat;

function createNewChat() {
  chat.value = createAssistantChat();
}

// 调试：一次性追加覆盖各类请求状态的长文本测试消息
function addDebugMessages() {
  if (!chat.value) return;
  const push = (payload) => {
    chat.value.messages.push({ ...aiStore.createDefaultMessage(), ...payload });
  };
  const assistantJson = (analysis, followQuestions = []) =>
    JSON.stringify({ data: null, analysis, followQuestions });
  // 用模块标题与优化要点生成长文本 markdown 分析
  const buildAnalysis = (title, bullets) =>
    `### ${title}\n\n${bullets.map((bullet) => `- ${bullet}`).join("\n")}\n\n### 呈现建议\n\n- 保持结构稳定，关键结论前置，方便招聘方快速阅读。`;
  const userSay = (content) => push({ role: "user", content, typing: false });
  const assistantSay = (round, index, followQuestions = []) =>
    push({
      role: "assistant",
      content: assistantJson(buildAnalysis(round.title, round.bullets), followQuestions),
      requestStatus: "success",
      total_tokens: 1800 + index * 240,
      thoughtTime: 2 + (index % 9),
      contentTime: 3 + (index % 12),
      typing: false,
    });
  const rounds = [
    {
      user: "请帮我优化简历中的基本信息",
      title: "基本信息优化建议",
      bullets: [
        "将姓名与目标岗位放在首屏，使用加粗字体突出重点，让招聘方第一眼获取核心信息。",
        "联系方式按主次排列：手机号优先，其次邮箱与常用社交账号，避免一屏堆叠过多入口。",
        "现居住地与到岗时间建议保留，方便企业判断面试与入职节奏。",
        "若年龄与学历有优势，可在基本信息中显式标注，增强初筛通过率。",
      ],
    },
    {
      user: "请帮我优化求职意向",
      title: "求职意向优化建议",
      bullets: [
        "目标岗位建议写具体方向而不是宽泛职能，例如前端开发中的可视化或工程化方向。",
        "期望薪资可写范围区间，既保留谈判空间，也避免首轮筛选被价格因素卡住。",
        "期望城市若可接受异地，建议补充可到岗时间与是否接受出差。",
        "岗位关键词应与目标 JD 保持一致，提高系统初筛的关键词命中率。",
      ],
    },
    {
      user: "请帮我优化工作经历，重点突出管理成果",
      title: "工作经历优化建议",
      bullets: [
        "每条经历采用时间倒序，先写职责概览，再分点拆解核心产出，控制单条在三行以内。",
        "管理类经历补充团队规模、汇报关系与跨部门协作机制，体现组织协调能力。",
        "用前后对比呈现结果，例如性能指标、交付周期、事故率等维度的变化。",
        "去除过程性描述，保留决策、推进与结果三个关键环节，信息密度更高。",
      ],
    },
    {
      user: "请帮我优化项目经历，补充技术难点与量化指标",
      title: "项目经历优化建议",
      bullets: [
        "项目背景一句话交代清楚，聚焦业务目标而不是罗列技术名词。",
        "个人职责与整体项目区分开，明确写出你负责的模块与上下游依赖。",
        "技术难点建议描述为问题、方案、验证三步，便于面试官追问时展开。",
        "量化结果尽量给出对比基线，例如优化前后耗时、并发量或转化率的差异。",
      ],
    },
    {
      user: "请帮我优化教育经历",
      title: "教育经历优化建议",
      bullets: [
        "学历信息保持标准格式，主修课程只保留与目标岗位相关的部分。",
        "在校荣誉按含金量排序，奖学金、竞赛、论文优于一般社团奖项。",
        "应届生可补充毕业设计或论文方向，与目标岗位呼应会更有说服力。",
        "非全日制或海外学历建议标注学制与取得时间，避免信息断层。",
      ],
    },
    {
      user: "请帮我优化技能特长",
      title: "技能特长优化建议",
      bullets: [
        "技能按熟练度分级展示，基础、进阶、深入三层结构更利于判断真实水平。",
        "技术栈名称与版本保持一致，避免新旧混写造成理解偏差。",
        "每个核心技能补一句落地场景，说明在什么项目中实际使用过。",
        "软技能不单列清单，融入项目经历中的协作与推动描述更可信。",
      ],
    },
    {
      user: "请帮我优化自我评价",
      title: "自我评价优化建议",
      bullets: [
        "首句直接给出职业定位与年限，避免空泛的形容词堆叠。",
        "评价内容与简历中的经历互相印证，突出可被验证的优势。",
        "结尾补充职业规划，让企业了解你的稳定预期与成长方向。",
        "篇幅控制在五行以内，语气务实克制，减少主观色彩。",
      ],
    },
    {
      user: "请帮我梳理证书与荣誉",
      title: "证书荣誉优化建议",
      bullets: [
        "按专业相关度排序，目标岗位关联度高的证书放在前面。",
        "竞赛荣誉补充赛事级别与参赛规模，含金量更直观。",
        "过期或与职业方向无关的证书建议删除，避免稀释重点。",
        "证书名称使用规范全称，便于系统识别与人工核验。",
      ],
    },
    {
      user: "请帮我调整整份简历的排版与篇幅",
      title: "排版篇幅调整建议",
      bullets: [
        "篇幅控制在两页以内，一页内容优先，页内留白保持呼吸感。",
        "模块顺序按目标岗位的决策权重调整，弱化与岗位无关的经历。",
        "标题层级与字号统一，同类信息使用相同的对齐方式与间距。",
        "检查中英文混排的标点与空格，避免视觉杂乱。",
      ],
    },
    {
      user: "请帮我分析这份简历与目标岗位的匹配度",
      title: "岗位匹配度分析",
      bullets: [
        "从目标 JD 提取核心关键词，与简历技能、项目逐一比对，标注匹配与缺失项。",
        "高匹配经历应提升展示层级，缺失能力可用相近项目经验作迁移说明。",
        "行业背景与目标公司业务方向重合度不足时，建议补充场景化案例。",
        "匹配度结论用百分比与差距清单呈现，便于后续逐项补齐。",
      ],
    },
    {
      user: "请帮我生成一份适合投递的开头介绍",
      title: "个人介绍生成结果",
      bullets: [
        "首段明确经验年限、核心方向与当前状态，例如具备五年大前端开发经验。",
        "第二段用两到三个量化成果支撑能力，避免使用负责、参与等模糊词。",
        "结尾表达对目标公司的了解与加入意愿，篇幅控制在三段以内。",
      ],
    },
    {
      user: "请帮我检查简历中的表述一致性与错别字",
      title: "表述一致性检查结果",
      bullets: [
        "时间格式统一为年月至年月，工作经历与教育经历口径一致。",
        "同一技能在不同模块的写法保持一致，避免大小写与中英文混用。",
        "全文术语统一，例如性能优化相关概念使用同一套命名。",
        "已修正标点混用与疑似错别字，结果可直接在预览中核对。",
      ],
    },
  ];
  rounds.forEach((round, index) => {
    userSay(round.user);
    assistantSay(round, index);
  });
  // 追加收起态与各类请求状态示例，便于逐项检查渲染分支
  push({
    role: "assistant",
    content: assistantJson(
      buildAnalysis("收起态回复示例", [
        "本条消息用于验证收起态，点击标题旁按钮可展开查看完整内容。",
        "收起状态下建议保留结论句，避免折叠后完全丢失有效信息。",
      ]),
    ),
    contentCollapsed: true,
    requestStatus: "success",
    total_tokens: 900,
    typing: false,
  });
  push({
    role: "assistant",
    content: "",
    requestStatus: "loading",
    typing: true,
  });
  push({
    role: "assistant",
    content: "",
    requestStatus: "thinking",
    thoughtTime: 6,
    typing: true,
  });
  push({
    role: "assistant",
    content: "",
    requestStatus: "generating",
    contentTime: 4,
    typing: true,
  });
  push({
    role: "assistant",
    content: "请求出错：模拟网络中断，请点击下方按钮重试。",
    requestStatus: "error",
    typing: false,
  });
  push({
    role: "assistant",
    content: assistantJson(
      buildAnalysis("对话整体回顾", [
        "本轮调试数据覆盖基本信息到整体排版的完整简历优化链路。",
        "所有成功回复均包含结构化分析、要点列表与呈现建议。",
        "消息导航中每一行对应一条消息，点击即可滚动定位到对应位置。",
        "最后保留推荐问题，便于验证底部快捷追问的交互。",
      ]),
      ["继续优化教育经历", "生成本轮修改对比", "生成完整求职报告"],
    ),
    requestStatus: "success",
    total_tokens: 3600,
    thoughtTime: 9,
    contentTime: 12,
    typing: false,
  });
  chat.value.updateTime = Date.now();
}
</script>

<template>
  <div class="box-border h-full py-3" :style="{ width: assistantWidth + 'px' }">
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary hover:border-sf-theme-2"
    >
      <!-- 顶部操作栏 -->
      <div
        class="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-sf-b bg-sf-page p-2 transition-all duration-200 select-none"
        :class="
          system.toolbarAlwaysVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
        "
      >
        <SfTooltip content="新建话题">
          <SfIcon
            @click="createNewChat"
            icon="ph:plus-bold"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
        <SfTooltip content="添加测试数据">
          <SfIcon
            @click="addDebugMessages"
            icon="mdi:hammer-wrench"
            size="5"
            boxSize="7"
            class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
          />
        </SfTooltip>
      </div>
      <Chat
        :chat="chat"
        :config="assistantConfig"
        :flows="flows"
        :suggestions="suggestions"
        :selected-modules="selectedModules"
        :remove-module="removeSelectedModule"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
