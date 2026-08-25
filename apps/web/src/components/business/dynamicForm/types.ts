/**
 * 动态表单配置 DSL 类型（对外契约）
 * 由 SfDynamicForm 组件统一导出，业务侧配置（如 stores/modules/resume/formConfig.ts）import 使用
 */

/** 数据绑定：source 为数据路径（支持 "?" 数组索引通配），prop 为组件上的绑定属性名 */
export interface ModelBinding {
  source: string[];
  prop: string;
  defaultValue?: any;
}

/** 表单字段（递归）：覆盖 object 叶子 / group 分组 / array 三种形态的字段集合 */
export interface FormField {
  type?: "object" | "array" | "group";
  /** 组件名（引擎按名字查找组件实例） */
  component?: string;
  /** 静态透传给组件的属性 */
  props?: Record<string, any>;
  /** 栅格宽度（1-24） */
  span?: number;
  /** 表单项标签 */
  label?: string;
  /** 表单项提示 */
  tip?: string;
  /** 表单项校验规则（透传给 el-form rules） */
  rules?: any[];
  /** 模块标识（同时是数据路径首段） */
  key?: string;
  /** 模块名 */
  name?: string;
  /** 插槽名（存在则渲染为带插槽的容器组件） */
  slot?: string;
  /** 数据绑定配置 */
  model?: ModelBinding | ModelBinding[];
  /** 子字段（容器递归渲染） */
  fields?: FormField[];
  /** array 容器的数据列表（运行时填充） */
  list?: FormField[];
  /** array 容器「新增子项」的模板配置 */
  addConfig?: FormField;
  /** 是否可拖拽 */
  drag?: boolean;
  /** 拖拽手柄 class */
  dragClass?: string;
  /** 运行时 id（引擎自动补充） */
  id?: string;
}

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
