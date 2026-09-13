import { computed, inject } from "vue";

const EMPTY_HIDDEN_FIELDS = computed(() => new Set<string>());

// 读取用户模块字段的隐藏状态
export function useUserFieldVisibility() {
  const hiddenFields = inject<any>("userHiddenFields", EMPTY_HIDDEN_FIELDS);
  const isUserFieldHidden = (key: string) => hiddenFields.value.has(key);

  return { isUserFieldHidden };
}
