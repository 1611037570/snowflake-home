/**
 * 收录提交脚本：一次把简历页链接分别推送给 IndexNow 与百度普通收录。
 * 用法：node scripts/submit-search-urls.mjs [--dry-run]
 * 说明：--dry-run 只打印将要发送的内容、不发请求，避免消耗百度当日配额。
 */
import process from "node:process";

/** 链接使用的站点主域，须与页面 canonical 一致。 */
const SITE_ORIGIN = "https://qzcv.net";

/** 待提交的页面路径，取自 site.config.ts 中可收录的简历路由（noindex 页不提交）。 */
const PAGE_PATHS = [
  "/resume",
  "/resume/template",
  "/resume/ai",
  "/resume/statistics",
  "/resume/guide",
  "/resume/guide/resignation-score",
  "/resume/guide/offer-comparison",
  "/resume/guide/real-hourly-wage",
];

/** IndexNow 配置：key 文件须能在站点根直接访问，文件内容即 key 本身。 */
const INDEXNOW = {
  endpoint: "https://api.indexnow.org/IndexNow",
  host: "qzcv.net", // 提交链接所属域名，须与 key 文件所在域名一致
  key: "4232ef4f80a34aaebf95ab00184e5dec", // IndexNow 校验密钥
  keyLocation: "https://qzcv.net/4232ef4f80a34aaebf95ab00184e5dec.txt", // 密钥文件地址
};

/** 百度普通收录配置。 */
const BAIDU = {
  endpoint: "http://data.zz.baidu.com/urls",
  site: "https://qzcv.net", // 百度资源平台验证的站点
  token: "WCRSMxtgMOIp1lQF", // 推送准入密钥
};

const urlList = PAGE_PATHS.map((path) => `${SITE_ORIGIN}${path}`);
const isDryRun = process.argv.includes("--dry-run");

// IndexNow 返回码含义：200 提交成功、202 key 待校验、400 报文错误、403 key 无效、422 链接与 host 不匹配、429 请求过多
async function submitIndexNow() {
  const payload = {
    host: INDEXNOW.host,
    key: INDEXNOW.key,
    keyLocation: INDEXNOW.keyLocation,
    urlList,
  };
  if (isDryRun) {
    console.log("[IndexNow] dry-run 将发送：", JSON.stringify(payload, null, 2));
    return;
  }
  try {
    const response = await fetch(INDEXNOW.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const text = (await response.text()).trim();
    console.log(`[IndexNow] HTTP ${response.status}${text ? ` ${text}` : ""}`);
  } catch (error) {
    console.log(`[IndexNow] 请求失败：${error.message}`);
  }
}

// 百度返回 JSON：成功为 {"remain":剩余配额,"success":成功条数}，失败为 {"error":错误码,"message":原因}
async function submitBaidu() {
  // 百度老接口按原始字符串解析 query，这里手工拼接，避免 URLSearchParams 把 site 编码成 %3A%2F%2F 导致站点识别失败
  const query = `site=${BAIDU.site}&token=${BAIDU.token}`;
  const body = urlList.join("\n");
  if (isDryRun) {
    console.log(`[Baidu] dry-run 将发送：POST ${BAIDU.endpoint}?${query}\n${body}`);
    return;
  }
  try {
    const response = await fetch(`${BAIDU.endpoint}?${query}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    });
    const data = await response.json();
    console.log("[Baidu] 响应：", JSON.stringify(data));
  } catch (error) {
    console.log(`[Baidu] 请求失败：${error.message}`);
  }
}

if (isDryRun) {
  console.log("dry-run 模式：仅打印，不发送请求。");
}
await submitIndexNow();
await submitBaidu();
