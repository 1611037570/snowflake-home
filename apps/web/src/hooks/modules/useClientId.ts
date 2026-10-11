import { getUUID } from "@/utils";
import { useStorage } from "@vueuse/core";

// 匿名客户端标识：首次访问生成 UUID 并持久化到本地，用于区分不同访客
export const clientId = useStorage("snowflakeClientId", getUUID());

// 获取当前浏览器的匿名标识
export const getClientId = () => clientId.value;
