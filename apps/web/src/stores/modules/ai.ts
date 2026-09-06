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
  // 当前执行阶段的动态提示（如正在读取简历数据）
  stepLabel?: string;
  // 推荐追问：由请求流程补充记录，不再等待模型在 JSON 中返回
  followQuestions?: string[];
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
  // 上下文标记：为 true 时仅作界面展示，不随请求发送给模型
  skipContext?: boolean;
};
// 已添加的模型（用户实际使用的模型配置）
export type ModelItem = {
  // 模型唯一标识
  id: string;
  // 平台类型
  provider: string;
  // 别名（可选，展示优先用这个）
  name?: string;
  // 模型标识
  model: string;
  // API 密钥
  key: string;
  // 完整接口地址
  url: string;
};
// 添加模型时提交的配置（表单或内置模板，不含 id）
type ModelDraft = Omit<ModelItem, "id">;
// 默认对话记录标题
const DEFAULT_CHAT_TITLE = "新对话";
// 默认系统提示
const DEFAULT_SYSTEM_PROMPT =
  "你的设置是：名字叫小羊，性别男，巨蟹座，2000年生，工作是前端工程师，擅长vue typescript，说话直接清爽，不拖沓、不矫情，回答简洁准确。回答以这个设定为基础。";

export const useAiStore = defineStore(
  "ai",
  () => {
    // 激活的模型标识：snowflake（雪花内置服务）或 ModelItem.id
    const activeModel = ref<string>("snowflake");
    // 已添加的用户模型列表（持久化到 localStorage）
    const modelList = ref<ModelItem[]>([]);

    const sidebarCollapsed = ref(true);
    const sidebarMode = ref("float"); // 'dock' or 'float'
    // 对话列表使用 IndexedDB 持久化，替代 localStorage
    const { data: chatList } = useIDBKeyval<Chat[]>("chat-list", []);
    const currentChatId = ref<string>("");
    // 是否开启思考模式
    const thinkMode = ref<boolean>(true);
    // 简历助手对话：随 ai store 持久化保存，重进编辑器时恢复
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

    // ========== 模型管理方法 ==========

    /** 部署表单或内置模板提交的配置到已添加列表 */
    function deployModel(draft: ModelDraft) {
      const deployed: ModelItem = {
        id: `custom-${getUUID().slice(0, 8)}`,
        provider: draft.provider,
        name: draft.name || undefined,
        model: draft.model,
        key: draft.key,
        url: draft.url,
      };
      modelList.value.push(deployed);
      return deployed;
    }

    /** 删除已添加的模型 */
    function deleteModel(modelId: string) {
      const idx = modelList.value.findIndex((model) => model.id === modelId);
      if (idx > -1) {
        modelList.value.splice(idx, 1);
      }
    }

    // 服务商设置弹窗：显隐与当前 Tab（工具栏入口与聊天输入「去添加模型」共用）
    const modelManagerVisible = ref(false);
    const modelManagerTab = ref<"added" | "add">("added");

    /** 打开服务商设置弹窗，可指定初始 Tab */
    function openModelManager(tab: "added" | "add" = "added") {
      modelManagerTab.value = tab;
      modelManagerVisible.value = true;
    }

    return {
      sidebarCollapsed,
      sidebarMode,
      chatList,
      currentChatId,
      currentChat,
      currentMessages,
      activeModel,
      modelList,
      thinkMode,
      resumeAssistantChat,
      createDefaultChat,
      createDefaultMessage,
      addChat,
      prepareNewChat,
      switchChat,
      delChat,
      addMessage,
      deployModel,
      deleteModel,
      modelManagerVisible,
      modelManagerTab,
      openModelManager,
    };
  },
  {
    persist: {
      // 简历助手对话一并持久化到 localStorage，刷新后可恢复最近对话
      storage: localStorage,
      pick: ["sidebarMode", "currentChatId", "activeModel", "modelList", "resumeAssistantChat"],
    },
  },
);
