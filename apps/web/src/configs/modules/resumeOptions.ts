// 简历表单选项字典：仅供动态表单 raw 绑定运行时读取，不写入简历数据
export const RESUME_OPTIONS = {
  // 性别
  sex: [
    { name: "男", value: "男" },
    { name: "女", value: "女" },
  ],
  // 求职状态
  status: [
    { name: "在职", value: "在职" },
    { name: "离职", value: "离职" },
    { name: "应届生", value: "应届生" },
  ],
  // 学位
  education: [
    { name: "小学", value: "小学" },
    { name: "初中", value: "初中" },
    { name: "高中", value: "高中" },
    { name: "大专", value: "大专" },
    { name: "专升本", value: "专升本" },
    { name: "成人本科", value: "成人本科" },
    { name: "本科", value: "本科" },
    { name: "硕士", value: "硕士" },
    { name: "博士", value: "博士" },
  ],
  // 学制
  mode: [
    { name: "全日制", value: "全日制" },
    { name: "非全日制", value: "非全日制" },
    { name: "不填写", value: "" },
  ],
};
