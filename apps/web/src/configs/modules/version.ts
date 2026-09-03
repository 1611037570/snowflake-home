// 版本号由 Vite 构建时自动注入（时间戳），无需手动维护
declare const __APP_VERSION__: string;
const version = __APP_VERSION__ || "0.0.1";
export default version;
