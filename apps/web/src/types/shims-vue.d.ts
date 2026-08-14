import type { $s } from "@/utils/modules/sizeConvert";
import "vue";

// 扩展 Vue 全局属性类型
declare module "vue" {
  interface ComponentCustomProperties {
    // 把 $s 挂载到全局属性接口上，类型和实际导出的 $s 保持一致
    $s: typeof $s;
  }
}

// 确保这个文件被当作模块处理（避免类型合并失败）
export {};
