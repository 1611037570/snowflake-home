import { inject } from "vue";
import type { FormContext } from "./types";
import { DF_CONTEXT } from "./code/injectionKeys";

/**
 * 读取动态表单上下文的唯一入口：业务组件在自己的 setup 内调用，
 * 由根组件提供的读取器按调用方实例解析最近容器的能力
 */
export function useFormContext(): FormContext {
  const createContext = inject(DF_CONTEXT, undefined);
  if (!createContext) {
    throw new Error("[SfDynamicForm] useFormContext 只能在表单容器内使用");
  }
  return createContext();
}
