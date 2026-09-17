/**
 * 引擎对外能力入口：只含契约类型与纯逻辑，不依赖组件，
 * 供 store、hooks、编辑器面板与测试在组件树外引用；
 * 组件用法见 ./index（默认导出 SfDynamicForm）
 */

// 契约类型：DSL 配置与数据寻址的对外定义
export * from "./types";
export type { DataPath, DataPathContext } from "./code/pathContext";
export type { FieldPosition } from "./code/orderData";

// 公共能力：code 下其余内容为引擎内部实现，不对外
export { isFieldHidden, isFieldRemoved, setFieldCheckValue } from "./code/fieldVisible";
export {
  getArrayDataPath,
  getFieldLabel,
  getModelBindings,
  walkFormFields,
} from "./code/schemaAccess";
export { getFieldDataPath, unwrapField } from "./code/fieldData";
export { createDataPathContext, resolveDataPath } from "./code/pathContext";
export { addArrayRecord, moveArrayRecord, removeArrayRecord } from "./code/arrayData";
export { moveFieldByKey } from "./code/orderData";
