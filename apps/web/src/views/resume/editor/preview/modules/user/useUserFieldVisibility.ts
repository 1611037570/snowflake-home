import { computed } from "vue";
import { useResumePreviewContext } from "../../previewContext";

const EMPTY_HIDDEN_FIELDS = computed(() => new Set<string>());

// 读取用户模块字段的隐藏状态
export function useUserFieldVisibility() {
  const { userHiddenFields: hiddenFields = EMPTY_HIDDEN_FIELDS } = useResumePreviewContext();
  const isUserFieldHidden = (key: string) => hiddenFields.value.has(key);

  return { isUserFieldHidden };
}
