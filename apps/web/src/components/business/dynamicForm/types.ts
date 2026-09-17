/**
 * 动态表单配置 DSL 类型（对外契约）
 * 由 ./api 统一导出，业务侧配置（如 stores/modules/resume/formConfig.ts）import 使用
 */

import type { Ref } from "vue";

/** 数据绑定：source 为当前容器内的数据路径，prop 为组件上的绑定属性名 */
export interface ModelBinding {
  source: string[];
  prop: string;
  defaultValue?: any;
  /** 必填标记：供 AI 判断与完成进度统计 */
  required?: boolean;
  /** 仅从外部字典读取，不代理、不写入简历数据 */
  raw?: boolean;
}

/** 条件校验规则：path 为数据路径，其余为可扩展的满足条件 */
export interface FieldCheckRule {
  /** 数据路径，沿用 model.source 路径语义 */
  path: string[];
  /** 期望值：配置后路径数据等于该值即满足；未配置时路径数据为真即满足 */
  equals?: unknown;
}

/** 表单控制配置：由动态表单根据条件决定字段是否渲染或置灰 */
export type FieldChecks = {
  /** 满足条件时字段隐藏但仍保留在编辑器中 */
  hidden?: FieldCheckRule;
  /** 满足条件时字段从当前表单移除 */
  removed?: FieldCheckRule;
};

/** 表单项 UI 配置 */
export interface FieldUIConfig {
  /** 表单项图标选择绑定：与隐藏绑定同结构，存在时渲染图标选择器 */
  icon?: ModelBinding;
  /** 表单项隐藏状态绑定 */
  hidden?: ModelBinding;
  /** 是否允许移除可添加字段 */
  removable?: boolean;
}

/** 表单字段共享配置 */
interface BaseFormField {
  /** 静态透传给组件的属性 */
  props?: Record<string, any>;
  /** 栅格宽度（1-24） */
  span?: number;
  /** 表单项标签 */
  label?: string;
  /** 表单项 class */
  colClass?: string;
  /** 容器子项 class */
  itemClass?: string;
  /** 子字段容器 class */
  rowClass?: string;
  /** 表单项提示 */
  tip?: string;
  /** 表单项 UI 配置 */
  ui?: FieldUIConfig;
  /** 表单项校验规则（透传给 el-form rules） */
  rules?: any[];
  /** 模块标识（同时是数据路径首段） */
  key?: string;
  /** 模块名 */
  name?: string;
  /** 是否可由用户按需添加 */
  addable?: boolean;
  /** 表单控制配置（与 model/props 同级）：由动态表单处理 removed、hidden */
  checks?: FieldChecks;
  required?: boolean;
  /** 是否可拖拽 */
  drag?: boolean;
  /** 模块是否固定：固定模块不参与容器拖拽排序 */
  fixed?: boolean;
  /** 拖拽手柄 class */
  dragClass?: string;
  /** 运行时 id（引擎自动补充） */
  id?: string;
}

/** 普通字段：必须声明渲染组件与数据绑定 */
export interface ObjectFormField extends BaseFormField {
  type: "object";
  component: string;
  model: ModelBinding | ModelBinding[];
  source?: never;
  slot?: never;
  fields?: never;
  itemSchema?: never;
}

/** 分组字段：递归渲染 fields，可选包裹组件与数据绑定 */
export interface GroupFormField extends BaseFormField {
  type: "group";
  /** 当前对象节点的数据路径，子字段在该节点内使用相对路径 */
  context?: string[];
  component?: string;
  model?: ModelBinding | ModelBinding[];
  slot?: string;
  fields: FormField[];
  source?: never;
  itemSchema?: never;
}

/** 数组字段：通过 source 定位记录，并使用 itemSchema 渲染每条记录 */
export interface ArrayFormField extends BaseFormField {
  type: "array";
  source: string[];
  itemSchema: FormField;
  component?: never;
  model?: never;
  slot?: never;
  fields?: never;
}

/** 严格区分普通字段、分组字段和数组字段 */
export type FormField = ObjectFormField | GroupFormField | ArrayFormField;

/** 顶层表单配置 */
export interface FormConfig {
  meta?: { version?: string };
  /** 容器级是否可拖拽 */
  drag?: boolean;
  /** 容器级拖拽手柄 class */
  dragClass?: string;
  /** 表单中所渲染的字段 */
  fields: FormField[];
}

/**
 * 组件树内上下文契约：由 SfDynamicForm 统一提供，业务组件经 useFormContext 读取
 * 各能力按所在容器提供，未提供的能力为 undefined
 */
export interface FormContext {
  /** 当前容器配置（各容器均提供，统一为 ref） */
  currentForm: Ref<FormField | undefined>;
  /** 当前容器类型 */
  currentType?: string;
  /** 仅数组容器提供：当前数组记录数 */
  currentLength?: Ref<number>;
  /** 仅被容器绑定目标的节点提供：删除当前节点 */
  removeCurrent?: () => void;
  /** 向当前容器的数组子字段新增记录，返回新记录下标 */
  addItem: () => number | undefined;
  hasFieldData: (field?: FormField) => boolean;
  addField: (field?: FormField) => boolean;
  removeField: (field?: FormField) => void;
  getFieldDataKey: (field?: FormField) => string | undefined;
}
