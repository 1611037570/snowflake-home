/**
 *  获取指定范围的随机数
 * @param min 最小值
 * @param max 最大值
 */
export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机颜色
 */
export const getRandomColor = () => {
  const r = getRandom(0, 255);
  const g = getRandom(0, 255);
  const b = getRandom(0, 255);
  return `rgb(${r},${g},${b})`;
};
/**
 * 从数组中随机获取一个元素
 * @param list 数组
 */
export const getRandomItem = (list: any[]) => {
  const randomIndex = Math.floor(Math.random() * list.length);
  const item = list[randomIndex];
  return item;
};
// 设备配置表（不变，核心数据源）
const DEVICE_CONFIG_MAP = {
  mobile: {
    name: "手机",
    value: "mobile",
  },
  tablet: {
    name: "平板",
    value: "tablet",
  },
  desktop: {
    name: "电脑",
    value: "desktop",
  },
};

// 最终版：仅返回deviceType（手机/平板/电脑），无任何冗余字段，满足直接显示
export function getBrowser() {
  // 兼容获取视口宽高（兜底处理，避免报错）
  const docEl = document.documentElement;
  const body = document.body;
  const clientWidth = docEl.clientWidth || body.clientWidth || window.innerWidth;
  const clientHeight = docEl.clientHeight || body.clientHeight || window.innerHeight;

  // UA与触摸设备判断（修复原拼写错误）
  const ua = (navigator.userAgent || "").toLowerCase();
  const isTouch = "ontouchstart" in window || ua.includes("touch") || ua.includes("mobile");

  // 1. 内部判断设备标识，最终仅返回名称（核心：deviceType直接显示）
  let deviceType = DEVICE_CONFIG_MAP.desktop.name; // 默认电脑
  if (isTouch) {
    const isIpad = ua.includes("ipad") || (ua.includes("macintosh") && isTouch);
    const isAndroidPad = ua.includes("android") && !ua.includes("mobile");
    const isHarmonyPad = ua.includes("harmonyos") && !ua.includes("mobile");
    // 直接赋值显示名称，无中间冗余字段
    deviceType =
      isIpad || isAndroidPad || isHarmonyPad
        ? DEVICE_CONFIG_MAP.tablet.name
        : DEVICE_CONFIG_MAP.mobile.name;
  }

  // 2. 浏览器类型检测
  let browserType = "other";
  const browserMatch = ua.match(/firefox|chrome|safari|opera|edg/g);
  if (browserMatch?.[0]) {
    browserType = browserMatch[0] === "edg" ? "edge" : browserMatch[0];
  }
  if (ua.includes("msie") || ua.includes("trident")) {
    browserType = "msie";
  }

  // 3. 浏览器CSS内核前缀
  let cssPrefix = "";
  switch (browserType) {
    case "chrome":
    case "safari":
    case "edge":
      cssPrefix = "webkit";
      break;
    case "msie":
      cssPrefix = "ms";
      break;
    case "firefox":
      cssPrefix = "Moz";
      break;
    case "opera":
      cssPrefix = "O";
      break;
  }

  // 4. 操作平台检测
  let platform = "";
  if (ua.includes("android")) {
    platform = "android";
  } else if (/(iphone|ipad|ipod)/.test(ua) || (ua.includes("mac os x") && isTouch)) {
    platform = "ios";
  } else if (ua.includes("win64")) {
    platform = "win64";
  } else if (ua.includes("win32") || ua.includes("windows")) {
    platform = "win32";
  } else if (ua.includes("macintosh")) {
    platform = "macintel";
  } else if (ua.includes("linux")) {
    platform = "linux";
  } else {
    platform = "unknown";
  }

  // 5. 屏幕档位
  let screenGrade = "full";
  if (clientWidth < 768) screenGrade = "xs";
  else if (clientWidth < 992) screenGrade = "sm";
  else if (clientWidth < 1200) screenGrade = "md";
  else if (clientWidth < 1920) screenGrade = "xl";

  // 6. 常用布尔值标识（内部判断，直接返回结果）
  const isIOS = platform === "ios";
  const isPC = deviceType === DEVICE_CONFIG_MAP.desktop.name;
  const isMobile = deviceType === DEVICE_CONFIG_MAP.mobile.name;
  const isTablet = deviceType === DEVICE_CONFIG_MAP.tablet.name;

  // 返回结果：无tag、无deviceValue，仅deviceType显示名称，字段无任何重复！
  return {
    height: clientHeight,
    width: clientWidth,
    type: browserType,
    prefix: cssPrefix,
    plat: platform,
    deviceType, // 唯一设备字段：直接返回「手机/平板/电脑」，前端直接显示
    isMobile,
    isIOS,
    isPC,
    isTablet,
    screen: screenGrade,
  };
}

/**
 * 严格判断是否为谷歌浏览器，排除 Edge, Opera 等基于 Chromium 的浏览器
 */
export const isChrome = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr") && !ua.includes("opera");
};
