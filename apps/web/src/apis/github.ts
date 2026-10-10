// 简历页展示的开源仓库，接口与跳转地址共用此配置。
export const GITHUB_REPOSITORY = "1611037570/snowflake-home";
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_REPOSITORY}`;

export const getGithubStars = async (): Promise<number> => {
  const controller = new AbortController();
  // 限制请求等待时间，网络异常时由展示层降级。
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}`, {
      headers: { Accept: "application/vnd.github+json" }, // 请求 GitHub JSON 数据
      signal: controller.signal, // 超时取消信号
    });
    if (!response.ok) throw new Error(`GitHub 请求失败：${response.status}`);
    const data = await response.json();
    // 零颗 Star 也是有效结果，拒绝错误响应与异常数字。
    if (!Number.isSafeInteger(data?.stargazers_count) || data.stargazers_count < 0) {
      throw new Error("GitHub Star 数据无效");
    }
    return data.stargazers_count;
  } finally {
    clearTimeout(timeout);
  }
};
