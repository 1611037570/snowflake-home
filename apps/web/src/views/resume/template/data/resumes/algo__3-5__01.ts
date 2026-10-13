import { getResumeThemeTemplate } from "@/views/resume/theme";
import { xiaoyang } from "../avatar";

// 互联网行业算法工程师岗位简历示例数据。
const resumeData: any = {
  data: {
    user: {
      ui: { archived: false },
      data: {
        position: "算法工程师",
        name: "谭书白",
        birthday: "1995.09",
        phone: "15888888888",
        email: "16****70@qq.com",
        workTime: "2020.07",
        sex: "男",
        city: "北京",
        avatar: xiaoyang,
      },
    },
    work: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "北京****科技有限公司",
            department: "推荐算法组",
            post: "算法工程师",
            city: "北京",
            startTime: "2020.07",
            endTime: "2023.02",
            tags: ["召回排序", "特征工程"],
            content:
              "<p>负责信息流推荐的召回与精排模型迭代，引入多兴趣召回与用户行为序列建模，线上人均点击率提升 14%，人均停留时长提升 9%。</p><p>搭建特征平台与离线样本回溯流程，特征上线周期从两周缩短至三天，模型迭代效率提升一倍以上。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "北京****智能科技有限公司",
            department: "搜索算法中心",
            post: "高级算法工程师",
            city: "北京",
            startTime: "2023.02",
            endTime: "至今",
            tags: ["向量检索", "大模型应用"],
            content:
              "<p>负责搜索语义召回与向量检索建设，落地双塔模型与近似最近邻索引，长尾 query 的有结果率提升 21%，首屏相关性人工评分提升 0.4 分。</p><p>推动大模型在查询改写与意图识别中的应用，结合蒸馏与缓存策略把在线推理耗时控制在 40 毫秒以内，搜索无结果率下降 33%。</p>",
          },
        },
      ],
    },
    project: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "信息流推荐精排模型升级",
            department: "推荐算法组",
            post: "算法负责人",
            city: "北京",
            startTime: "2021.04",
            endTime: "2022.06",
            tags: ["精排模型", "在线实验"],
            content:
              "<p>设计融合多目标兴趣的排序模型，统一点击、时长与互动三类目标的训练与在线打分，配合分人群校准解决目标冲突问题。</p><p>通过分层实验与长期 holdback 验证，核心指标稳定提升且用户留存未出现负向，模型全量后日均有效播放提升 11%。</p>",
          },
        },
        {
          ui: {},
          data: {
            name: "搜索语义向量召回系统",
            department: "搜索算法中心",
            post: "技术负责人",
            city: "北京",
            startTime: "2023.06",
            endTime: "2024.08",
            tags: ["向量召回", "语义改写"],
            content:
              "<p>构建千万级向量的索引与在线检索服务，支持多路召回融合与实时增量更新，检索平均耗时 18 毫秒，召回覆盖率提升 26%。</p><p>结合大模型做 query 改写与同义扩展，解决口语化与冷门表述的召回空白，搜索满意度调研评分由 3.9 提升至 4.4。</p>",
          },
        },
      ],
    },
    education: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        {
          ui: {},
          data: {
            name: "北京邮电大学",
            college: "计算机学院",
            education: "硕士",
            mode: "全日制",
            post: "计算机应用技术",
            city: "北京",
            startTime: "2017.09",
            endTime: "2020.06",
            content:
              "<p>研究方向为自然语言处理与推荐系统，系统掌握机器学习、最优化理论与统计建模方法。</p><p>硕士课题围绕用户兴趣建模展开，成果发表于国内学术会议，并完成一次工业界数据集上的完整验证。</p>",
          },
        },
      ],
    },
    skill: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p><strong>算法能力：</strong>熟悉推荐与搜索全链路算法，包括召回、粗排、精排与重排，掌握向量检索、多目标建模与因果推断方法，具备大模型微调、蒸馏与提示工程实践经验。</p><p><strong>工程能力：</strong>熟练使用 Python 与 PyTorch、TensorFlow 训练模型，掌握 Spark、Flink 处理大规模样本与特征，熟悉向量数据库与在线推理服务部署，具备实验设计与指标归因分析能力。</p>",
      },
    },
    advantage: {
      ui: { collapsed: ["1"], archived: false },
      data: {
        content:
          "<p>既能独立完成从特征、模型到在线服务的完整链路，也能把业务目标翻译成可优化的模型目标，避免只追求离线指标而忽略线上体验。</p><p>重视实验的严谨性，习惯用分层实验、长期 holdback 与归因分析验证收益，结论对业务方具有解释力。</p>",
      },
    },
    honor: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "年度算法突破奖" } },
        { ui: {}, data: { name: "搜索质量提升专项奖" } },
      ],
    },
    account: {
      ui: { collapsed: ["1"], archived: false },
      list: [
        { ui: {}, data: { name: "GitHub", url: "https://example.com/algorithm-engineer" } },
        { ui: {}, data: { name: "学术论文主页", url: "https://example.com/algorithm-papers" } },
      ],
    },
  },
  config: {
    modules: [
      { key: "user" },
      { key: "work" },
      { key: "project" },
      { key: "education" },
      { key: "skill" },
      { key: "advantage" },
      { key: "honor" },
      { key: "account" },
    ],
  },
  // 界面配置沿用主题预设：与模板页该主题的样式卡片共用同一份配置，保证布局与配色一致。
  ui: structuredClone(getResumeThemeTemplate("hairlineRail").item.ui),
};

export default resumeData;
