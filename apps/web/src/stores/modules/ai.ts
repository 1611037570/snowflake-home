import { getUUID } from "@/utils";
import { ElMessageBox } from "element-plus";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
export type Chat = {
  // 对话记录id
  id: string;
  // 对话记录标题
  title: string;
  // 创建时间
  createTime: number;
  // 更新时间
  updateTime: number;
  // 消息列表
  messages: Message[];
};
export type Message = {
  // 创建时间
  createTime: number;
  // 角色
  role: string;
  // 消息内容
  content: string;
  // 是否正在输入中
  typing: boolean;
  // 思考内容
  thought: string;
  // 思考内容是否折叠
  thoughtCollapsed: boolean;
  // 总token数
  total_tokens: number;
  // 思考耗时（秒）
  thoughtTime: number;
  // 内容耗时（秒）
  contentTime: number;
  // 内容是否折叠
  contentCollapsed: boolean;
  // 请求状态
  requestStatus: string;
};
// 自定义模型配置
export type CustomModelConfig = {
  // 平台类型
  provider: "ark" | "openai" | "deepseek";
  // 模型名称
  model: string;
  // API 密钥
  key: string;
  // 完整接口地址
  url: string;
  // 添加状态（success表示测试通过可添加）
  status?: "success";
};
// 默认对话记录标题
const DEFAULT_CHAT_TITLE = "新对话";
// 默认系统提示
const DEFAULT_SYSTEM_PROMPT =
  "你的设置是：名字叫小羊，性别男，巨蟹座，2000年生，工作是前端工程师，擅长vue typescript，说话直接清爽，不拖沓、不矫情，回答简洁准确。回答以这个设定为基础。";

export const useAiStore = defineStore(
  "ai",
  () => {
    // 激活的服务标识：snowflake 或平台类型
    const activeModel = ref<string>("snowflake");
    // 各平台配置列表（按平台类型各一份，切换时配置保留）
    const customModels = ref<CustomModelConfig[]>([]);

    const sidebarCollapsed = ref(true);
    const sidebarMode = ref("float"); // 'dock' or 'float'
    // 对话列表使用 IndexedDB 持久化，替代 localStorage
    const { data: chatList } = useIDBKeyval<Chat[]>("chat-list", []);
    const currentChatId = ref<string>("");
    // 是否开启思考模式
    const thinkMode = ref<boolean>(true);
    // 简历助手对话（临时持久化，便于分析排查）
    const resumeAssistantChat = ref<Chat | null>(null);

    const currentChat = computed(() => chatList.value.find((c) => c.id === currentChatId.value));

    const currentMessages = computed({
      get: () => currentChat.value?.messages || [],
      set: (val) => {
        if (currentChat.value) currentChat.value.messages = val;
      },
    });

    function prepareNewChat() {
      currentChatId.value = "new-chat-temp";
    }
    // 创建默认对话
    function createDefaultChat(message?: any): Chat {
      // 当前时间戳
      const now = Date.now();
      // 默认对话记录
      const msg = createDefaultMessage();
      const newChat: Chat = {
        id: getUUID().substring(0, 8),
        title: DEFAULT_CHAT_TITLE,
        createTime: now,
        updateTime: now,
        messages: [
          {
            ...msg,
            createTime: now,
            role: "system",
            content: DEFAULT_SYSTEM_PROMPT,
            typing: false,
            ...message,
          },
        ],
      };
      return newChat;
    }
    // 创建默认消息
    function createDefaultMessage() {
      const message: Message = {
        createTime: Date.now(),
        contentCollapsed: false,
        thoughtCollapsed: false,
        total_tokens: 0,
        thoughtTime: 0,
        contentTime: 0,
        thought: "",
        content: "",
        typing: false,
        role: "",
        requestStatus: "loading",
      };
      return message;
    }
    function addChat() {
      const newChat = createDefaultChat();
      chatList.value.unshift(newChat);
      currentChatId.value = newChat.id;
      return newChat;
    }

    function switchChat(id: string) {
      currentChatId.value = id;
    }

    function delChat(id: string) {
      ElMessageBox.confirm("确定要删除该对话记录吗？此操作不可恢复。", "删除对话", {
        type: "warning",
      })
        .then(() => {
          const index = chatList.value.findIndex((c) => c.id === id);
          if (index > -1) {
            chatList.value.splice(index, 1);
            if (currentChatId.value === id) {
              currentChatId.value = chatList.value[0]?.id || "";
            }
          }
        })
        .catch(() => {});
    }

    function updateChatTitle() {
      const chat = currentChat.value;
      if (!chat || chat.title !== DEFAULT_CHAT_TITLE) return;

      const firstUserMsg = chat.messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        const content = firstUserMsg.content;
        chat.title = content.length > 15 ? `${content.slice(0, 15)}...` : content;
      }
    }

    function addMessage(msg: any) {
      if (!currentChat.value) addChat();
      const defaultMessage = createDefaultMessage();
      currentChat.value!.messages.push({
        ...defaultMessage,
        ...msg,
      });
      currentChat.value!.updateTime = Date.now();
      updateChatTitle();
    }

    return {
      sidebarCollapsed,
      sidebarMode,
      chatList,
      currentChatId,
      currentChat,
      currentMessages,
      activeModel,
      customModels,
      thinkMode,
      resumeAssistantChat,
      createDefaultChat,
      createDefaultMessage,
      addChat,
      prepareNewChat,
      switchChat,
      delChat,
      addMessage,
    };
  },
  {
    persist: {
      storage: localStorage,
      pick: ["sidebarMode", "currentChatId", "activeModel", "customModels", "resumeAssistantChat"],
      // 恢复后兜底：激活配置不存在时回退雪花服务
      afterHydrate: (ctx) => {
        const store = ctx.store as any;
        if (!["snowflake", "openai", "ark", "deepseek"].includes(store.activeModel)) {
          store.activeModel = "snowflake";
        }
      },
    },
  },
);
