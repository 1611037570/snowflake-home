import { useClipboard } from "@vueuse/core";
const { copy } = useClipboard();
export function useCopy(text: string) {
  copy(text)
    .then(() => {
      ElMessage.success("复制成功");
    })
    .catch(() => {
      ElMessage.error("复制失败");
    });
}
