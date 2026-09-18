/**
 * 引擎对外能力入口：只含契约类型与纯逻辑，不依赖组件，
 * 供 store、hooks、编辑器面板与业务组件在组件树外/内统一引用；
 * 组件本身见 ./index（默认导出 SfDynamicForm）
 */

// 契约类型：DSL 配置、数据寻址与组件树内上下文
export * from "./types";
export type { DataPath, DataPathContext } from "./code/pathContext";
export type { FieldPosition } from "./code/orderData";

// 组件树内上下文：业务组件的读取入口，DF_CONTEXT 供测试与自定义容器注入
export { useFormContext } from "./useFormContext";
export { DF_CONTEXT } from "./code/injectionKeys";

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
export { moveFieldByKey, moveFieldToContainer } from "./code/orderData";
