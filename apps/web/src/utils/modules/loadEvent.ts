import { useSystemStore } from "@/stores/modules/system";
// 组合键监听
import { useMagicKeys } from "@vueuse/core";
import { getBrowser } from "./base";

// 加载默认事件
function loadEvent() {
  // 初始化窗口大小
  updateWindowSize();
  // 禁用默认右键菜单
  stopContextmenuEvent();
  // 监听组合键
  watchKey();
}
function updateWindowSize() {
  const systemStore = useSystemStore();
  const { windowSize, browserInfo } = storeToRefs(systemStore);
  windowSize.value = useWindowSize();
  watch(
    windowSize.value,
    () => {
      browserInfo.value = getBrowser();
    },
    { immediate: true },
  );
}
// 禁用右键菜单默认事件
function stopContextmenuEvent() {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
// 监听组合键
function watchKey() {
  const keys: any = useMagicKeys();
  const ctrlZXC = keys["Ctrl+Z+X+C"]; // Ctrl+Z+X+C 组合键引用
  const systemStore = useSystemStore();
  const { monitorWatch } = storeToRefs(systemStore);
  // 监听 Ctrl+Z+X+C 组合键
  watch(ctrlZXC, (newVal /* 组合键状态 */) => {
    if (!newVal) return;
    // 切换监视开关
    monitorWatch.value = !monitorWatch.value;
  });
}

export { loadEvent };
