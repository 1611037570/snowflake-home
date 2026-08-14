import { DEFAULT_DATA } from "./dataConfig";
import { useResumeStore } from "./index";

const optimize = () => {
  const store = useResumeStore();
  const { currentData } = storeToRefs(store);
  // 获取用户名称
  const getName = () => {
    const name = currentData.value?.userName;
    if (!name) {
      return "";
    }
    return "用户名称：" + name;
  };
  // 获取用户求职岗位
  const getPosition = () => {
    const position = currentData.value?.user?.position;
    if (!position) {
      return "";
    }
    return " 求职岗位：" + position;
  };
  // 获取用户工作年限
  const getWorkYear = () => {
    const workYear = currentData.value?.user?.workYear || "";
    if (!workYear) {
      return "";
    }
    return " 工作年限：" + workYear;
  };
  const startTip = "用户当前" + getPosition() + getWorkYear();
  // 你是资深招聘HR，
  // 专精技术岗与运营岗的简历优化和求职竞争力提升，
  // 擅长挖掘候选人过往经历中的隐性亮点并通过量化方式最大化呈现个人价值。
  // 目标：1.针对用户提供的原始简历内容，精准识别可优化的核心模块；2.梳理并放大候选人的岗位匹配优势，
  // 将模糊描述转化为可量化的工作成果；3.输出符合大厂招聘审美的专业优化版简历。
  // 技能：1.精通各主流岗位的招聘画像与简历筛选标准；2.擅长STAR法则重构工作经历，实现成果量化展示；
  // 3.熟练掌握简历语言的专业表达范式，规避无效描述。工作流程：1.接收用户上传的原始简历文本或关键经历描述；
  // 2.逐模块识别简历中存在的模糊表述、无成果描述等问题；3.结合目标岗位要求，挖掘候选人经历中可量化的业绩数据；
  // 4.使用STAR法则重构工作经历，将职责描述转化为成果展示。约束：1.必须完全保留用户原始简历中的真实经历信息，不得虚构任何工作成果；
  // 2.优化内容需贴合目标岗位的招聘偏好，避免过度包装；3.所有量化数据需基于用户提供的原始信息进行合理转化，不得凭空捏造；
  // 4.禁止修改用户的基本个人信息（姓名、联系方式等）
  const systemMessage = () => {
    const tip = `
            你是一名资深 HR，擅长简历优化. 负责简历优化，根据现有内容，突出亮点，量化成果。

            # 角色
            你是资深招聘HR，专精于技术岗与运营岗的简历优化和求职竞争力提升，擅长挖掘候选人过往经历中的隐性亮点并通过量化方式最大化呈现个人价值。
            # 目标
            1.  针对用户提供的原始简历内容，精准识别可优化的核心模块
            2.  梳理并放大候选人的岗位匹配优势，将模糊描述转化为可量化的工作成果
            3.  输出符合大厂招聘审美的专业优化版简历
            # 技能
            1.  精通各主流岗位的招聘画像与简历筛选标准
            2.  擅长STAR法则重构工作经历，实现成果量化展示
            3.  熟练掌握简历语言的专业表达范式，规避无效描述
            # 工作流程
            1.  接收用户上传的原始简历文本或关键经历描述
            2.  逐模块识别简历中存在的模糊表述、无成果描述等问题
            3.  结合目标岗位要求，挖掘候选人经历中可量化的业绩数据
            4.  使用STAR法则重构工作经历，将职责描述转化为成果展示
            # 约束
            1.  必须完全保留用户原始简历中的真实经历信息，不得虚构任何工作成果
            2.  优化内容需贴合目标岗位的招聘偏好，避免过度包装
            3.  所有量化数据需基于用户提供的原始信息进行合理转化，不得凭空捏造
            4.  禁止修改用户的基本个人信息（姓名、联系方式等）
        `;
    return {
      role: "system",
      content: tip,
    };
  };
  const a = () => {
    return {
      role: "system",
      content: `
                # 输出强制要求
                仅输出下方指定的 JSON 结构，无任何多余内容（无解释、无标题、无注释、无文字说明）
                严格匹配模板字段层级、格式，数组 / 字符串格式与模板完全一致
                优化内容填充至对应位置，无优化则保留空值 / 原值
                固定输出 JSON 模板
                ${DEFAULT_DATA}
            `,
    };
  };
};

const bb = [
  {
    role: "system",
    content:
      "你是资深招聘HR，专精技术岗与运营岗的简历优化和求职竞争力提升，擅长挖掘候选人过往经历中的隐性亮点并通过量化方式最大化呈现个人价值。目标：1.针对用户提供的原始简历内容，精准识别可优化的核心模块；2.梳理并放大候选人的岗位匹配优势，将模糊描述转化为可量化的工作成果；3.输出符合大厂招聘审美的专业优化版简历。技能：1.精通各主流岗位的招聘画像与简历筛选标准；2.擅长STAR法则重构工作经历，实现成果量化展示；3.熟练掌握简历语言的专业表达范式，规避无效描述。工作流程：1.接收用户上传的原始简历文本或关键经历描述；2.逐模块识别简历中存在的模糊表述、无成果描述等问题；3.结合目标岗位要求，挖掘候选人经历中可量化的业绩数据；4.使用STAR法则重构工作经历，将职责描述转化为成果展示。约束：1.必须完全保留用户原始简历中的真实经历信息，不得虚构任何工作成果；2.优化内容需贴合目标岗位的招聘偏好，避免过度包装；3.所有量化数据需基于用户提供的原始信息进行合理转化，不得凭空捏造；4.禁止修改用户的基本个人信息（姓名、联系方式等）",
  },
  {
    role: "system",
    content:
      '用户简历数据规则：所有简历实际内容均取自各节点下的value字段，remark仅为字段备注、required仅为必填标识，二者均不参与简历内容优化，需先完整提取所有value值作为原始简历内容优化。输出要求：1.仅输出指定标准JSON模板，优化后内容填入对应字段，无优化内容保持空字符串/原始值；2.严格匹配模板结构、字段名、数据类型，不得增删字段、修改层级；3.输出纯JSON，无任何多余内容、注释、说明文字。固定输出JSON模板：{"user":{"position":"","name":"","birthday":"","phone":"","email":"","workTime":"","sex":"","social":[]},"skill":"","education":[{"name":"","education":"","post":"","time":["",""],"content":"","mode":""}],"work":[{"name":"","post":"","time":["",""],"content":""}],"project":[{"name":"","post":"","time":["",""],"content":""}]}',
  },
  {
    role: "user",
    content: {
      user: {
        value: {
          name: {
            value: "",
            remark: "用户名称",
            required: true,
          },
          birthday: {
            value: "",
            remark: "用户出生日期",
            required: true,
          },
          phone: {
            value: "",
            remark: "用户手机号",
            required: true,
          },
          email: {
            value: "",
            remark: "用户邮箱",
            required: true,
          },
          workTime: {
            value: "",
            remark: "用户工作时间",
            required: true,
          },
          sex: {
            value: "",
            remark: "用户性别",
            required: false,
          },
          social: {
            value: [],
            remark: "用户社交账号",
            required: false,
          },
        },
        remark: "用户信息",
        required: true,
      },
      skill: {
        value: "",
        remark: "用户技能",
        required: false,
      },
      education: {
        value: [
          {
            name: {
              value: "",
              remark: "学校名称",
              required: true,
            },
            education: {
              value: "",
              remark: "学历",
              required: true,
            },
            post: {
              value: "",
              remark: "岗位",
              required: false,
            },
            time: {
              value: ["", ""],
              remark: "时间",
              required: true,
            },
            content: {
              value: "",
              remark: "内容",
              required: false,
            },
            mode: {
              value: "",
              remark: "学习模式",
              required: false,
            },
          },
        ],
        remark: "教育经历",
        required: false,
      },
      work: {
        value: [
          {
            name: {
              value: "",
              remark: "公司名称",
              required: true,
            },
            post: {
              value: "",
              remark: "岗位",
              required: true,
            },
            time: {
              value: ["", ""],
              remark: "工作时间",
              required: true,
            },
            content: {
              value: "",
              remark: "工作内容",
              required: true,
            },
          },
        ],
        remark: "工作经历",
        required: false,
      },
      project: {
        value: [
          {
            name: {
              value: "",
              remark: "项目名称",
              required: true,
            },
            post: {
              value: "",
              remark: "项目岗位",
              required: true,
            },
            time: {
              value: ["", ""],
              remark: "项目时间",
              required: true,
            },
            content: {
              value: "",
              remark: "项目内容",
              required: true,
            },
          },
        ],
        remark: "项目经历",
        required: false,
      },
    },
  },
];
