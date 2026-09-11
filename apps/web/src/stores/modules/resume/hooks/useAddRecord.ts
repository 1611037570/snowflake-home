import {
  createArrayItemData,
  type FormField,
} from "@/components/business/dynamicForm";

/**
 * 按当前数组字段的 itemSchema 生成记录默认数据
 * 供 AI 新增记录时先落一条含字段的空记录，保证预览草稿与编辑器表单可正常绑定
 */
export function createRecordSkeleton(arrayField: FormField): Record<string, any> {
  return createArrayItemData(arrayField);
}
