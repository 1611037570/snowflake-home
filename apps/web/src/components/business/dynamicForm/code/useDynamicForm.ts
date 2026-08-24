import { inject, toRaw } from "vue";
import {
  DF_CURRENT_FORM,
  DF_CURRENT_INDEX,
  DF_CURRENT_LENGTH,
  DF_CURRENT_TYPE,
  DF_REMOVE,
  DF_REMOVE_ITEM,
  DF_ROOT_DATA,
} from "./injectionKeys";

/**
 * 动态表单上下文 API（对外统一入口）
 * 业务组件通过该 composable 获取引擎提供的上下文能力（索引、增删、配置读取等），
 * 无需直接接触 provide/inject 内部实现，引擎内部实现可自由演进。
 */
export function useDynamicForm() {
  const rootData = inject(DF_ROOT_DATA);
  const currentForm = inject(DF_CURRENT_FORM);
  const currentIndex = inject(DF_CURRENT_INDEX);
  const currentLength = inject(DF_CURRENT_LENGTH);
  const currentType = inject(DF_CURRENT_TYPE);
  const removeSelf = inject(DF_REMOVE);
  const removeItem = inject(DF_REMOVE_ITEM);

  // 统一新增：不依赖 DF_ADD 注入作用域（容器组件在其子级容器之外，注入不到），
  // 改为基于当前容器配置定位新增目标：
  // - array 容器：直接新增到自身 list
  // - object/container 容器：默认对第一个 array 子字段新增
  const addItem = () => {
    const form = currentForm?.value ?? currentForm;
    if (!form) return;
    const arrayField = form.type === "array" ? form : form.fields?.find((f: any) => f.type === "array");
    if (!arrayField?.addConfig) return;
    // 深拷贝 addConfig 后 push，避免多个子项共享同一份引用
    arrayField.list.push(structuredClone(toRaw(arrayField.addConfig)));
  };

  return {
    /** 根数据代理（读写简历数据） */
    rootData,
    /** 当前容器/表单项的配置（ref） */
    currentForm,
    /** 当前容器/子项索引 */
    currentIndex,
    /** 当前数组容器长度 */
    currentLength,
    /** 当前容器类型（object / array / container） */
    currentType,
    /** 新增一个子项（array 容器直接新增；object/container 容器对第一个 array 子字段新增） */
    addItem,
    /** 对象/插槽容器：删除当前容器自身 */
    removeSelf,
    /** 数组容器：删除指定索引的子项 */
    removeItem,
  };
}
