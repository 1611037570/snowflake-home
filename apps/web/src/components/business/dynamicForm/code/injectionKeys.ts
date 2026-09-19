import type { InjectionKey, MaybeRef, Ref } from "vue";
import type { FormContext } from "../types";
import type DataProxy from "./dataProxy";
import type { DataPathContext } from "./pathContext";

/**
 * 动态表单的注入键常量
 * 统一使用 InjectionKey 替代魔法字符串，保证 provide/inject 契约一致与可查
 */
/** 实例级注入的组件库（SfDynamicForm 的 components prop） */
export const INSTANCE_COMPONENTS: InjectionKey<Record<string, any>> = Symbol("instanceComponents");
/** 根数据代理 */
export const DF_ROOT_DATA: InjectionKey<DataProxy<any>> = Symbol("df/root/data");
/** 当前容器表单配置（统一为 ref） */
export const DF_CURRENT_FORM: InjectionKey<any> = Symbol("df/current/form");
/** 当前对象节点的数据路径上下文 */
export const DF_CURRENT_PATH_CONTEXT: InjectionKey<MaybeRef<DataPathContext | undefined>> =
  Symbol("df/current/pathContext");
/** 当前容器类型 */
export const DF_CURRENT_TYPE: InjectionKey<string> = Symbol("df/current/type");
/** 当前数组容器长度 */
export const DF_CURRENT_LENGTH: InjectionKey<any> = Symbol("df/current/length");
/** 对象容器删除方法 */
export const DF_REMOVE: InjectionKey<() => void> = Symbol("df/remove");
/**
 * 组件树内上下文契约（由 SfDynamicForm 提供读取器，业务组件经 useFormContext 调用）
 * 读取器内部按业务组件自身实例解析最近容器的能力，无需容器聚合
 */
export const DF_CONTEXT: InjectionKey<() => FormContext> = Symbol("df/context");
/**
 * 模块选中能力（内部机制，不对外导出）：根组件 provide，渲染层 inject，
 * selectModule(key, index) 触发选中后边框持续闪烁；传入 index 表示选中该模块中的某条记录
 */
export const DF_MODULE_SELECT: InjectionKey<{
  selectedKey: Ref<string | null>;
  /** 记录级选中的记录下标，为空表示选中模块或字段本身 */
  selectedIndex: Ref<number | null>;
  selectModule: (key: string | null, index?: number | null) => void;
}> = Symbol("df/module/select");
