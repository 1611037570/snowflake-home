import { version } from "@/configs";
import dayjs from "dayjs";
import { defineStore } from "pinia";
import { ref } from "vue";
const start = "2020-09-03";
export const useSystemStore = defineStore(
  "system",
  () => {
    // 项目运行时间
    const runTime = ref<number>(dayjs().diff(dayjs(start), "day"));
    // 性能监控
    const monitorWatch = ref<boolean>(false);
    // 性能模式
    const performanceMode = ref<boolean>(false);
    // 调试模式
    const debugMode = ref<boolean>(false);
    // 窗口大小
    const windowSize = ref<{
      width: number | unknown;
      height: number | unknown;
    }>({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    // 浏览器信息
    const browserInfo = ref();
    // 当前版本
    const currentVersion = ref(version);
    // 服务器连接状态
    const isConnected = ref<boolean>(false);

    /**
     * 获取最新版本号
     * @returns Promise<string> 最新版本号
     */
    const getVersion = async (): Promise<string> => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`${import.meta.env.BASE_URL}version.json?t=${timestamp}`);
        const data = await res.json();
        return data.version;
      } catch (error) {
        console.error("获取版本号失败:", error);
        throw error;
      }
    };

    /**
     * 检测版本更新
     * 当最新版本与当前版本不匹配时，刷新页面
     */
    const checkVersionUpdate = async () => {
      try {
        // 使用新的getVersion方法获取版本号
        const newVersion = await getVersion();

        // 版本不一致，执行强制刷新
        if (newVersion !== currentVersion.value) {
          console.log("版本不一致，执行强制刷新");
          currentVersion.value = newVersion;
          window.location.reload();
          return;
        }
      } catch (error) {}
    };

    /**
     * 初始化版本号
     * 在系统启动时获取初始版本号
     */
    const initVersion = async () => {
      try {
        const version = await getVersion();
        currentVersion.value = version;
        console.log("版本号初始化完成:", version);
      } catch (error) {
        console.error("版本号初始化失败:", error);
      }
    };

    // 系统启动时初始化版本号
    initVersion();

    return {
      runTime,
      monitorWatch,
      debugMode,
      windowSize,
      browserInfo,
      currentVersion,
      performanceMode,
      isConnected,
      getVersion,
      checkVersionUpdate,
      initVersion,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ["monitorWatch", "currentVersion", "performanceMode"],
    },
  },
);
