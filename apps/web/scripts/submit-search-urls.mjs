/**
 * 收录提交脚本：向 IndexNow 批量推送，向百度逐条推送并按配额停止。
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
  "/resume/tools",
  "/resume/tools/resignation-score",
  "/resume/tools/offer-comparison",
  "/resume/tools/real-hourly-wage",
  "/resume/settings",
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
  // 剩余配额未知时逐条提交，避免整批链接超过余额而全部被拒绝。
  let submitted = 0;
  for (let index = 0; index < urlList.length; index += 1) {
    try {
      const response = await fetch(`${BAIDU.endpoint}?${query}`, {
        method: "POST", // 百度普通收录的提交方式。
        headers: { "Content-Type": "text/plain" }, // 每个请求只发送一条链接。
        body: urlList[index], // 当前待提交地址。
      });
      const data = await response.json();
      if (data.message === "over quota") {
        console.log("[Baidu] 每日推送配额不足，已停止提交。请到百度搜索资源平台查看可用额度；重复执行不能解除限额。");
      } else if (!response.ok || data.error !== undefined || data.success !== 1) {
        console.log(`[Baidu] HTTP ${response.status}，当前链接未确认提交成功：${JSON.stringify(data)}`);
      } else {
        submitted += 1;
        const remain = Number.isInteger(data.remain) && data.remain >= 0 ? data.remain : null;
        console.log(`[Baidu] 已提交：${urlList[index]}，剩余配额：${remain ?? "未知"}`);
        if (remain !== 0 || index === urlList.length - 1) continue;
        console.log("[Baidu] 返回的剩余配额为零，已停止提交后续链接。");
      }
    } catch (error) {
      // 请求结果不确定时不自动重试，避免重复占用配额。
      console.log(`[Baidu] 请求失败，已停止提交：${error.message}`);
    }
    const pending = urlList.slice(submitted);
    console.log(`[Baidu] 本次已确认提交 ${submitted} 条，未确认提交 ${pending.length} 条：\n${pending.join("\n")}`);
    process.exitCode = 1;
    return;
  }
  console.log(`[Baidu] 本次全部提交完成，共 ${submitted} 条；提交成功不代表已被收录。`);
}

if (isDryRun) {
  console.log("dry-run 模式：仅打印，不发送请求。");
}
await submitIndexNow();
await submitBaidu();
