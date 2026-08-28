import type { InjectionKey, Ref } from "vue";
import type DataProxy from "./dataProxy";

/**
 * 动态表单的注入键常量
 * 统一使用 InjectionKey 替代魔法字符串，保证 provide/inject 契约一致与可查
 */
/** 实例级注入的组件库（SfDynamicForm 的 components prop） */
export const INSTANCE_COMPONENTS: InjectionKey<Record<string, any>> = Symbol("instanceComponents");
/** 根数据代理 */
export const DF_ROOT_DATA: InjectionKey<DataProxy<any>> = Symbol("df/root/data");
/** 根表单代理 */
export const DF_ROOT_FORM: InjectionKey<any> = Symbol("df/root/form");
/** 当前容器表单配置（统一为 ref） */
export const DF_CURRENT_FORM: InjectionKey<any> = Symbol("df/current/form");
/** 当前容器/子项索引 */
export const DF_CURRENT_INDEX: InjectionKey<any> = Symbol("df/current/index");
/** 当前容器类型 */
export const DF_CURRENT_TYPE: InjectionKey<string> = Symbol("df/current/type");
/** 当前数组容器长度 */
export const DF_CURRENT_LENGTH: InjectionKey<any> = Symbol("df/current/length");
/** 数组容器新增方法 */
export const DF_ADD: InjectionKey<() => void> = Symbol("df/add");
/** 对象容器删除方法 */
export const DF_REMOVE: InjectionKey<() => void> = Symbol("df/remove");
/** 数组容器删除子项方法 */
export const DF_REMOVE_ITEM: InjectionKey<(index: number) => void> = Symbol("df/removeItem");
/**
 * 对外上下文契约（字符串 key，业务组件按约定直接 inject 使用，无需导入）
 * 由各容器节点提供：聚合父级上下文 + 当前容器能力
 */
export const DF_CONTEXT = "df/context";
/**
 * 模块选中能力（内部机制，不对外导出）：根组件 provide，渲染层 inject，
 * selectModule(key) 触发选中后模块边框持续闪烁，鼠标经过模块后恢复正常
 */
export const DF_MODULE_SELECT: InjectionKey<{
  selectedKey: Ref<string | null>;
  selectModule: (key: string | null) => void;
}> = Symbol("df/module/select");
