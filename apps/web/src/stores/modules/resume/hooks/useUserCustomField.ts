import type { ObjectFormField } from "@/components/business/dynamicForm/types";

export const USER_CUSTOM_FIELD_PREFIX = "custom_";

// 自定义字段使用统一前缀，便于从更多字段配置中恢复运行时节点
export function isUserCustomFieldKey(key: unknown): key is string {
  return typeof key === "string" && key.startsWith(USER_CUSTOM_FIELD_PREFIX);
}

// 根据持久化的字段标识和标题创建更多字段的完整运行时配置
export function createUserCustomField(key: string, label: string): ObjectFormField {
  return {
    type: "object",
    key,
    label,
    component: "userCustomField",
    span: 24,
    ui: {
      layout: "horizontal",
      // 图标选择与隐藏开关均保存至个人信息模块配置
      icon: {
        source: ["ui", key, "icon"],
        prop: "icon",
        defaultValue: "lucide:tag",
      },
      // 复用个人信息字段隐藏状态
      hidden: {
        source: ["ui", key, "hidden"],
        prop: "hidden",
        defaultValue: false,
      },
    },
    checks: {
      hidden: {
        path: ["ui", key, "hidden"],
        equals: true,
      },
    },
    model: {
      source: ["data", key],
      prop: "modelValue",
    },
    props: {
      fieldKey: key,
      placeholder: "请输入内容",
    },
  };
}

// 从个人信息配置中定位更多字段容器
function getMoreField(runtimeConfig: any) {
  const userField = runtimeConfig?.fields?.find((field: any) => field?.key === "user");
  return userField?.fields?.find((field: any) => field?.key === "more");
}

// 新增自定义字段时同步写入字段节点和真实值
export function addUserCustomField(runtimeConfig: any, data: any, key: string, label: string) {
  const moreField = getMoreField(runtimeConfig);
  if (!moreField || !label) return false;

  data.user ??= {};
  data.user.data ??= {};
  if (key in data.user.data) return false;

  data.user.data[key] = "";
  moreField.fields.push(createUserCustomField(key, label));
  return true;
}

// 修改标题只更新字段节点，持久化配置会自动保存该节点标题
export function renameUserCustomField(runtimeConfig: any, key: string, label: string) {
  const moreField = getMoreField(runtimeConfig);
  const field = moreField?.fields?.find((item: any) => item?.key === key);
  if (!field || !label) return false;

  field.label = label;
  return true;
}

// 删除自定义字段时同时清理字段节点和值
export function removeUserCustomField(runtimeConfig: any, data: any, key: string) {
  const moreField = getMoreField(runtimeConfig);
  const index = moreField?.fields?.findIndex((item: any) => item?.key === key) ?? -1;
  if (index < 0) return false;

  moreField.fields.splice(index, 1);
  delete data?.user?.data?.[key];
  delete data?.user?.ui?.[key];
  return true;
}
