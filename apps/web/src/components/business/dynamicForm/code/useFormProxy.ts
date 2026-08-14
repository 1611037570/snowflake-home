import { getUUID } from "@/utils";
import { ref, watch } from "vue";

const useFormProxy = (form: any) => {
  const formProxy = ref();
  let isInternalUpdate = false;

  const processItems = (items: any) => {
    const list = items?.fields?.map((item: any) => {
      const newItem = {
        ...item,
        id: item.id || getUUID(),
      };
      if (Array.isArray(newItem.fields)) {
        newItem.fields = processItems(newItem.fields);
      }
      return newItem;
    });
    items.fields = list;
    return items;
  };

  // 监听原始数据变化，同步到代理数据
  watch(
    () => form.value,
    (newValue) => {
      if (isInternalUpdate) return;
      if (newValue) {
        formProxy.value = processItems(newValue);
      }
    },
    { deep: true, immediate: true },
  );

  // 监听代理数据变化，同步回原始数据
  watch(
    formProxy,
    (newValue) => {
      isInternalUpdate = true;
      form.value = newValue;
      // 使用 nextTick 或延迟重置标志，确保不会触发上面的 watch
      setTimeout(() => {
        isInternalUpdate = false;
      });
    },
    { deep: true },
  );

  return formProxy;
};
export default useFormProxy;
