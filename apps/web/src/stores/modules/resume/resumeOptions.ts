// 简历表单选项字典：仅供动态表单 raw 绑定运行时读取，不写入简历数据
import cityData from "./cityData.json";

// 可选值字典：字典的值即为字段的合法取值，AI 数据契约据此提取可选值做写入校验
export const RESUME_VALUE_OPTIONS = {
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
    { name: "随时到岗", value: "随时到岗" },
    { name: "一月内到岗", value: "一月内到岗" },
    { name: "在职看机会", value: "在职看机会" },
  ],
  // 婚姻状况
  marital: [
    { name: "未婚", value: "未婚" },
    { name: "已婚", value: "已婚" },
    { name: "离异", value: "离异" },
  ],
  // 星座
  zodiac: [
    { name: "白羊座", value: "白羊座" },
    { name: "金牛座", value: "金牛座" },
    { name: "双子座", value: "双子座" },
    { name: "巨蟹座", value: "巨蟹座" },
    { name: "狮子座", value: "狮子座" },
    { name: "处女座", value: "处女座" },
    { name: "天秤座", value: "天秤座" },
    { name: "天蝎座", value: "天蝎座" },
    { name: "射手座", value: "射手座" },
    { name: "摩羯座", value: "摩羯座" },
    { name: "水瓶座", value: "水瓶座" },
    { name: "双鱼座", value: "双鱼座" },
  ],
  // 政治面貌
  political: [
    { name: "共产党员", value: "共产党员" },
    { name: "预备党员", value: "预备党员" },
    { name: "共青团员", value: "共青团员" },
    { name: "群众", value: "群众" },
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
  ],
};

// 省市级联字典：静态数据一次性构建；直辖市自身即为城市，可直接选中，不再展开子级
const CITY_OPTIONS = cityData.map((province) => {
  const isDirectCity = province.cities.length === 1 && province.cities[0] === province.label;
  return {
    value: province.label,
    label: province.label,
    children: isDirectCity
      ? undefined
      : province.cities.map((name) => ({ value: name, label: name })),
  };
});

// 表单渲染字典：可选值字典 + 仅用于渲染的字典（如省市级联树，结构不参与可选值提取）
export const RESUME_OPTIONS = {
  ...RESUME_VALUE_OPTIONS,
  // 城市（省市级联）
  city: CITY_OPTIONS,
};
