import { config } from "@/configs";

// 简历页展示的开源仓库，本地缓存键与跳转地址共用此配置。
export const GITHUB_REPOSITORY = "1611037570/snowflake-home";
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_REPOSITORY}`;

export const getGithubStars = async (): Promise<number> => {
  const controller = new AbortController();
  // 限制请求等待时间，网络异常时由展示层降级。
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    // 仓库由服务端固定，凭据不再进入浏览器。
    const response = await fetch(`${config.api.baseUrl}/integrations/github/stars`, {
      signal: controller.signal, // 超时取消信号
    });
    if (!response.ok) throw new Error(`获取仓库星标失败：${response.status}`);
    const data = await response.json();
    // 零颗 Star 也是有效结果，拒绝错误响应与异常数字。
    if (!Number.isSafeInteger(data?.stars) || data.stars < 0) {
      throw new Error("GitHub Star 数据无效");
    }
    return data.stars;
  } finally {
    clearTimeout(timeout);
  }
};
