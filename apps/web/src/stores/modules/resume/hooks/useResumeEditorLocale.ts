import { $t } from "@/locales";

type Translate = (key: string) => string;

// 表单模板中的中文只作为默认源文案，运行时映射到页面语言包中的稳定 key。
const TEXT_KEYS_SOURCE = `
  个人信息: "personalInfo",
  社交账号: "socialAccounts",
  教育经历: "educationExperience",
  专业技能: "professionalSkills",
  个人优势: "personalAdvantages",
  工作经历: "workExperience",
  项目经历: "projectExperience",
  荣誉证书: "honorsCertificates",
  视频作品: "videoWorks",
  图片作品: "imageWorks",
  整个简历: "allResume",
  基本信息: "basicInfo",
  联系方式: "contactInfo",
  求职意向: "jobIntent",
  个性标签: "personalityTags",
  其他: "other",
  基础模块: "basicModules",
  其他模块: "otherModules",
  自定义模块: "customModule",
  头像: "avatar",
  姓名: "name",
  请输入姓名: "namePlaceholder",
  请输入2-20位姓名: "nameLength",
  出生日期: "birthday",
  请选择出生日期: "birthdayPlaceholder",
  年龄: "age",
  性别: "sex",
  请选择性别: "sexPlaceholder",
  婚姻状况: "marital",
  请选择婚姻状况: "maritalPlaceholder",
  民族: "nation",
  请输入民族: "nationPlaceholder",
  星座: "zodiac",
  请选择星座: "zodiacPlaceholder",
  MBTI: "mbti",
  "请输入 MBTI": "mbtiPlaceholder",
  求职岗位: "position",
  请输入求职岗位: "positionPlaceholder",
  参加工作时间: "workTime",
  请选择参加工作时间: "workTimePlaceholder",
  电话: "phone",
  请输入电话: "phonePlaceholder",
  请输入正确的电话: "phoneInvalid",
  邮箱: "email",
  请输入邮箱: "emailPlaceholder",
  请输入正确的邮箱格式: "emailInvalid",
  微信: "wechat",
  请输入微信: "wechatPlaceholder",
  GitHub: "github",
  "请输入 GitHub 地址": "githubPlaceholder",
  LinkedIn: "linkedin",
  "请输入 LinkedIn 地址": "linkedinPlaceholder",
  求职状态: "status",
  请选择求职状态: "statusPlaceholder",
  政治面貌: "political",
  请选择政治面貌: "politicalPlaceholder",
  期望城市: "city",
  请选择城市: "cityPlaceholder",
  籍贯: "nativePlace",
  请选择籍贯: "nativePlacePlaceholder",
  现居城市: "currentCity",
  请选择现居城市: "currentCityPlaceholder",
  期望薪资: "salary",
  请输入期望薪资: "salaryPlaceholder",
  身高体重: "heightWeight",
  三围: "measurements",
  尺码: "sizes",
  学校名称: "schoolName",
  "如：北京大学": "schoolNamePlaceholder",
  项目链接: "projectLink",
  学院名称: "collegeName",
  请输入学院名称: "collegeNamePlaceholder",
  学位: "degree",
  请选择学位: "degreePlaceholder",
  学制: "mode",
  请选择学制: "modePlaceholder",
  开始时间: "startTime",
  请选择开始时间: "startTimePlaceholder",
  结束时间: "endTime",
  请选择结束时间: "endTimePlaceholder",
  至今: "present",
  专业: "major",
  请输入专业: "majorPlaceholder",
  所在部门: "department",
  请输入所在部门: "departmentPlaceholder",
  公司名称: "company",
  请输入公司: "companyPlaceholder",
  职位: "jobTitle",
  请输入职位: "jobTitlePlaceholder",
  项目名称: "projectName",
  请输入项目名称: "projectNamePlaceholder",
  经历: "experience",
  核心成员: "coreMember",
  团队管理: "teamManagement",
  团队协作: "teamwork",
  跨部门协作: "crossDepartmentCollaboration",
  独立负责: "independentlyResponsible",
  从0到1: "fromZeroToOne",
  性能优化: "performanceOptimization",
  已上线: "launched",
  开源项目: "openSourceProject",
  推荐必填: "recommendRequired",
  "该模块会将视频地址转换为二维码，方便在简历中展示": "videoDescription",
  男: "male",
  女: "female",
  在职: "employed",
  离职: "resigned",
  应届生: "freshGraduate",
  随时到岗: "availableImmediately",
  一月内到岗: "availableWithinOneMonth",
  在职看机会: "openToOpportunities",
  未婚: "single",
  已婚: "married",
  离异: "divorced",
  白羊座: "aries",
  金牛座: "taurus",
  双子座: "gemini",
  巨蟹座: "cancer",
  狮子座: "leo",
  处女座: "virgo",
  天秤座: "libra",
  天蝎座: "scorpio",
  射手座: "sagittarius",
  摩羯座: "capricorn",
  水瓶座: "aquarius",
  双鱼座: "pisces",
  共产党员: "communistPartyMember",
  预备党员: "probationaryPartyMember",
  共青团员: "communistYouthLeagueMember",
  群众: "mass",
  小学: "primarySchool",
  初中: "juniorHighSchool",
  高中: "seniorHighSchool",
  大专: "juniorCollege",
  专升本: "topUpBachelor",
  成人本科: "adultBachelor",
  本科: "bachelor",
  硕士: "master",
  博士: "doctor",
  全日制: "fullTime",
  非全日制: "partTime",
  双一流: "doubleFirstClass",
`;

const TEXT_KEYS = Object.fromEntries(
  TEXT_KEYS_SOURCE.trim()
    .split("\n")
    .map((line) => {
      const [source = "", key = ""] = line.trim().replace(/,$/, "").split(/:\s+/);
      return [source.replace(/^"|"$/g, ""), key.replace(/^"|"$/g, "")];
    }),
);

export function translateResumeEditorText(value: unknown, translate: Translate = $t): unknown {
  if (typeof value !== "string") return value;
  const key = TEXT_KEYS[value];
  if (!key) return value;
  const translated = translate(key);
  return translated === key ? value : translated;
}

function localizeField(field: any, translate: Translate) {
  if (!field || typeof field !== "object") return;
  if (typeof field.label === "string") field.label = translateResumeEditorText(field.label, translate);
  if (Array.isArray(field.rules)) {
    field.rules.forEach((rule: any) => {
      if (typeof rule?.message === "string") {
        rule.message = translateResumeEditorText(rule.message, translate);
      }
    });
  }
  if (field.props && typeof field.props === "object") {
    if (typeof field.props.label === "string") {
      field.props.label = translateResumeEditorText(field.props.label, translate);
    }
    if (typeof field.props.tip === "string") {
      field.props.tip = translateResumeEditorText(field.props.tip, translate);
    }
    if (typeof field.props.placeholder === "string") {
      field.props.placeholder = translateResumeEditorText(field.props.placeholder, translate);
    }
    if (Array.isArray(field.props.displayOptions)) {
      field.props.displayOptions.forEach((option: any) => {
        option.label = translateResumeEditorText(option.label, translate);
      });
    }
    if (Array.isArray(field.props.list)) {
      field.props.list = field.props.list.map((item: unknown) =>
        translateResumeEditorText(item, translate),
      );
    }
  }
  if (Array.isArray(field.model)) {
    field.model.forEach((binding: any) => {
      if (binding?.prop === "title" && typeof binding.defaultValue === "string") {
        binding.defaultValue = translateResumeEditorText(binding.defaultValue, translate);
      }
    });
  }
  field.fields?.forEach((child: any) => localizeField(child, translate));
  if (field.itemSchema) localizeField(field.itemSchema, translate);
}

// 只本地化运行时展示配置，避免把翻译文本写入持久化简历数据。
export function localizeResumeConfig(config: any, translate: Translate = $t) {
  config?.fields?.forEach((field: any) => localizeField(field, translate));
  return config;
}

export function localizeResumeOptions(options: Record<string, any>, translate: Translate = $t) {
  const localized = structuredClone(options);
  Object.values(localized).forEach((list: any) => {
    if (!Array.isArray(list)) return;
    list.forEach((item: any) => {
      if (item && typeof item.name === "string") {
        item.name = translateResumeEditorText(item.name, translate);
      }
    });
  });
  return localized;
}
