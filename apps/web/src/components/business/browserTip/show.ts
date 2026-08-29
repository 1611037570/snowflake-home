import { ElNotification } from "element-plus";
import { h } from "vue";
import { isChrome } from "@/utils";

// 浏览器建议配置：推荐浏览器与下载地址
export const RECOMMEND_BROWSER = "谷歌浏览器";
export const DOWNLOAD_URL = "https://www.google.com/chrome/";

/**
 * 浏览器建议提示：按浏览器类型反馈
 * - 谷歌浏览器：成功提示
 * - 其他浏览器：警告提示，并提供推荐浏览器下载入口
 */
export const showBrowserTip = () => {
  if (isChrome()) {
    ElNotification({
      title: "浏览器建议",
      message: `当前使用${RECOMMEND_BROWSER}，体验最佳。`,
      type: "success",
      duration: 3000,
      offset: 80, // 弹窗下移，避免遮挡顶部内容
    });
    return;
  }
  ElNotification({
    title: "浏览器建议",
    message: h("div", { class: "flex flex-col items-start gap-2" }, [
      h(
        "span",
        `为了获得最佳体验，推荐使用${RECOMMEND_BROWSER}，其他浏览器可能会遇到兼容性或性能问题。`,
      ),
      h(
        "a",
        {
          href: DOWNLOAD_URL,
          target: "_blank",
          class: "rounded-full bg-sf-theme px-3 py-1 text-sm text-sf-theme-text",
        },
        `去下载${RECOMMEND_BROWSER}`,
      ),
    ]),
    type: "warning",
    duration: 0, // 不自动关闭，让用户明确看到
    offset: 80,
  });
};
