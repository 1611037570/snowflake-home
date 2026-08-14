import { h, render } from "vue";
import Confirm from "./confirm.vue";
import { DEFAULT_CONFIRM_OPTIONS } from "./data";

export type ConfirmOptions = InstanceType<typeof Confirm>["$props"];

/**
 * Promise 风格确认框（对齐 ElMessageBox.confirm 写法）
 * @param content 弹窗内容
 * @param title 弹窗标题
 * @param options 配置项
 */
export const confirm = (
  content: string,
  title?: string,
  options?: Partial<ConfirmOptions>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 合并配置
    const opts = { ...DEFAULT_CONFIRM_OPTIONS, ...options };

    // 创建独立渲染容器
    const container = document.createElement("div");
    document.body.appendChild(container);

    // 关闭并清理 DOM
    const close = () => {
      render(null, container);
      document.body.removeChild(container);
    };

    // 确认/取消 触发 Promise
    const handleConfirm = () => {
      resolve();
      close();
    };
    const handleCancel = () => {
      reject();
      close();
    };

    // 渲染组件
    const vNode = h(Confirm, {
      ...opts,
      title,
      content,
      close,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    });

    render(vNode, container);
  });
};

export default confirm;
