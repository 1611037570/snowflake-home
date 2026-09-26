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
  常用: "common",
  常用模块: "basicModules",
  其他模块: "otherModules",
  自定义模块: "customModule",
  头像: "avatar",
  姓名: "name",
  请输入姓名: "namePlaceholder",
  请输入2-20位姓名: "nameLength",
  出生日期: "birthday",
  请选择出生日期: "birthdayPlaceholder",
  年龄: "age",
  日期: "dateDisplay",
  性别: "sex",
  文化水平: "educationLevel",
  请选择文化水平: "educationLevelPlaceholder",
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
  主题色: "themeColor",
  魅力红: "charmRed",
  活力橙: "vibrantOrange",
  灿烂黄: "brilliantYellow",
  翠亮绿: "emeraldGreen",
  极光青: "auroraCyan",
  极客蓝: "geekBlue",
  幻彩紫: "iridescentPurple",
  极致黑: "extremeBlack",
  阿里普惠体: "puhuiFont",
  汉仪易烊千玺体: "yyqxFont",
  跟随系统: "followSystem",
  默认: "defaultTheme",
  "清晰通用的基础简历样式。": "defaultThemeDescription",
  现代: "modernTheme",
  "适合互联网与技术岗位的现代简历样式。": "modernThemeDescription",
  商务: "businessTheme",
  "适合职场与商务场景的正式简历样式。": "businessThemeDescription",
  简约: "minimalTheme",
  "减少视觉干扰，突出内容本身的简历样式。": "minimalThemeDescription",
  经典: "classicTheme",
  "适合传统行业与正式投递的经典简历样式。": "classicThemeDescription",
  学术: "academicTheme",
  "强调研究经历与文字内容的学术简历样式。": "academicThemeDescription",
  清新: "freshTheme",
  "适合教育、设计与初入职场场景的简历样式。": "freshThemeDescription",
  活力: "vividTheme",
  "适合运营、市场与创意岗位的活力简历样式。": "vividThemeDescription",
  创意: "creativeTheme",
  "突出个人表达与作品展示的创意简历样式。": "creativeThemeDescription",
  稳重: "steadyTheme",
  "适合经验型岗位与正式求职的稳重简历样式。": "steadyThemeDescription",
  通栏双栏: "topUserTwoColumnTheme",
  "个人信息顶部通栏，其余模块固定分到左右两栏。": "topUserTwoColumnThemeDescription",
  双栏: "twoColumnTheme",
  "所有模块固定分到左右两栏，适合内容较多的简历。": "twoColumnThemeDescription",
  图标: "iconDisplay",
  文字: "textDisplay",
  不显示: "hiddenDisplay",
  弹性: "flexLayout",
  网格: "gridLayout",
  左: "left",
  居中: "center",
  右: "right",
  系统对齐: "systemAlign",
  两端对齐: "justifyAlign",
  留白: "spaceSeparator",
  圆点: "dotSeparator",
  竖线: "lineSeparator",
  斜线: "slashSeparator",
  逗号: "commaSeparator",
  无图标: "titleIconNone",
  仅图标: "titleIconPlain",
  方形背景: "titleIconSquare",
  圆形背景: "titleIconCircle",
  设计: "design",
  主题配色: "themeColors",
  细节调整: "detailAdjustments",
  标题图标样式: "titleIconMode",
  链接下划线: "linkUnderline",
  联系方式显示: "contactDisplay",
  联系方式布局: "contactLayout",
  头像位置: "avatarPosition",
  信息对齐: "infoAlign",
  经历排版: "experienceLayout",
  时间位置: "timePosition",
  时间格式: "timeFormat",
  信息分隔: "infoSeparator",
  布局: "layout",
  页面布局: "pageLayout",
  恢复布局默认: "restoreLayoutDefault",
  显示页码: "showPageNumber",
  自定义页尾: "customFooter",
  "仅自定义开头的品牌名，页码部分固定展示，留空恢复「轻舟简历」": "customFooterTip",
  "例如：我的简历": "customFooterPlaceholder",
  字体类型: "fontTypes",
  字体大小: "fontSize",
  模块标题字号: "moduleTitleFontSize",
  文本对齐: "textAlign",
  "2026年9月": "cnDateFormat",
  尚未填写: "notFilled",
  自定义字段: "customField",
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
    if (typeof field.props.presentText === "string") {
      field.props.presentText = translateResumeEditorText(field.props.presentText, translate);
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

// 只本地化编辑器选项的展示名称，保留选项值用于状态与持久化。
export function localizeResumeEditorOptionList(options: any[], translate: Translate = $t) {
  return options.map((item) => ({
    ...item,
    name: translateResumeEditorText(item.name, translate),
  }));
}
