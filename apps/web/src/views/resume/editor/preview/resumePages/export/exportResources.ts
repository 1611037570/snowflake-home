import { nextTick } from "vue";

// 资源本身可以继续缓存，但取消后立即结束导出等待并释放监听。
export const waitForExportTask = <T>(task: Promise<T>, signal: AbortSignal): Promise<T> =>
  new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException("导出已取消", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    task.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) abort();
  });

// 只等待当前导出树中的在线图标，本地图标与加载失败的图标无需额外等待。
const waitForIcons = (root: HTMLElement, signal: AbortSignal) => new Promise<void>((resolve) => {
  const finish = () => {
    observer.disconnect();
    signal.removeEventListener("abort", finish);
    resolve();
  };
  const check = () => {
    if (!Array.from(root.querySelectorAll('[data-sf-icon-state="loading"]')).some((icon) => !icon.closest(".layout-measure-breakpoint"))) finish();
  };
  const observer = new MutationObserver(check);
  observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-sf-icon-state"] });
  signal.addEventListener("abort", finish, { once: true });
  if (signal.aborted) finish();
  else check();
});

const waitForImages = (root: HTMLElement, signal: AbortSignal) => Promise.all(
  Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter((image) => !image.closest(".layout-measure-breakpoint")).map(async (image) => {
    if (!image.complete) await new Promise<void>((resolve) => {
      const finish = () => {
        image.removeEventListener("load", finish);
        image.removeEventListener("error", finish);
        signal.removeEventListener("abort", finish);
        resolve();
      };
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
      signal.addEventListener("abort", finish, { once: true });
      if (signal.aborted || image.complete) finish();
    });
    // 已下载的图片也完成解码后再复制，加载失败时保留浏览器原有回退行为。
    if (!signal.aborted && image.naturalWidth > 0) await image.decode().catch(() => undefined);
  }),
);

const waitForFonts = (root: HTMLElement) => {
  const fonts = root.ownerDocument.fonts;
  if (!fonts) return Promise.resolve();
  const textByElement = new Map<Element, string>(); // 合并同一元素的文本，减少重复样式读取
  const textByFont = new Map<string, Set<string>>(); // 每种字体只加载实际使用的字符
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains("layout-measure-breakpoint")
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType !== Node.TEXT_NODE || !node.parentElement || !node.textContent?.trim()) continue;
    textByElement.set(node.parentElement, (textByElement.get(node.parentElement) || "") + node.textContent);
  }
  for (const [element, text] of textByElement) {
    const style = root.ownerDocument.defaultView!.getComputedStyle(element);
    const font = style.font || `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const characters = textByFont.get(font) || new Set<string>();
    for (const character of text) characters.add(character);
    textByFont.set(font, characters);
  }
  // 字体下载失败仍使用浏览器回退字体，不等待编辑器其他区域的字体。
  return Promise.all([...textByFont].map(([font, characters]) => fonts.load(font, [...characters].join("")).catch(() => undefined)));
};

// 预览源与隔离文档共用资源就绪规则，不按主题分支处理。
export const waitForExportResources = async (root: HTMLElement, signal: AbortSignal) => {
  await waitForExportTask(Promise.all([waitForIcons(root, signal), waitForImages(root, signal), waitForFonts(root)]), signal);
  await nextTick();
  signal.throwIfAborted();
};
