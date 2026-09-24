import { getUUID } from "@/utils";
import { ElMessageBox } from "element-plus";
import { useIDBKeyval } from "@vueuse/integrations/useIDBKeyval";
import { del, get, set } from "idb-keyval";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useResumeStore } from "@/stores/modules/resume";
import type { AiChatSummary } from "@/stores/modules/resume/resumeCatalog";
export type Chat = {
  // 对话记录id
  id: string;
  // 关联简历id
  resumeId?: string;
  // 对话记录标题
  title: string;
  // 创建时间
  createTime: number;
  // 更新时间
  updateTime: number;
  // 消息列表
  messages: Message[];
};
export type ResumeAssistantChatRecord = Omit<Chat, "resumeId"> & { resumeId: string };
export type Message = {
  // 消息唯一标识
  id: string;
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
  followQuestions: string[];
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
  // 由业务宿主解释的请求上下文，重试与重新生成时保持一致
  requestContext?: Record<string, unknown>;
};
export type ModelProtocol = "chatCompletions" | "responses";
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
  // 接口协议类型
  protocol: ModelProtocol;
  // 是否为内置服务
  builtin?: boolean;
};
export type AiAgentKey = "xiaoZhou" | "xiaoYang" | "resumeParser";
export type AiAgentModels = Record<AiAgentKey, string>;
// 添加模型时提交的配置（表单或内置模板，不含 id）
type ModelDraft = Omit<ModelItem, "id">;
// 默认对话记录标题
const DEFAULT_CHAT_TITLE = "新对话";
// 默认系统提示
const DEFAULT_SYSTEM_PROMPT =
  "你的设置是：名字叫小羊，性别男，巨蟹座，2000年生，工作是前端工程师，擅长vue typescript，说话直接清爽，不拖沓、不矫情，回答简洁准确。回答以这个设定为基础。";

// 简历助手会话工厂：由简历助手组装器注册，Pinia 只负责调用
let resumeAssistantChatFactory: (() => Chat) | null = null;
let resumeAssistantChatLoadId = 0;
const resumeAssistantChatKey = (id: string) => `resume-assistant-chat:${id}`;

export const useAiStore = defineStore(
  "ai",
  () => {
    // 已添加的用户模型列表（持久化到 localStorage）
    const modelList = ref<ModelItem[]>([]);
    // 三个业务角色分别绑定模型
    const agentModels = ref<AiAgentModels>({
      xiaoZhou: "",
      xiaoYang: "",
      resumeParser: "",
    });

    const sidebarCollapsed = ref(true);
    const sidebarMode = ref("float"); // 'dock' or 'float'
    // 对话列表使用 IndexedDB 持久化，替代 localStorage
    const { data: chatList } = useIDBKeyval<Chat[]>("chat-list", []);
    const currentChatId = ref<string>("");
    // 是否开启思考模式：默认快速模式，需要深度思考时由开关开启
    const thinkMode = ref<boolean>(false);
    // 当前简历助手对话只在运行时加载，正文按会话 ID 独立保存到 IndexedDB
    const resumeAssistantChat = ref<ResumeAssistantChatRecord | null>(null);
    // 会话摘要从简历目录动态汇总，不在 ai store 重复持久化
    const resumeAssistantChatList = computed(() =>
      useResumeStore().list.flatMap((resume) =>
        resume.ai.map((chat) => ({ ...chat, resumeId: resume.id })),
      ),
    );

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
        id: `msg-${getUUID().slice(0, 8)}`,
        createTime: Date.now(),
        contentCollapsed: false,
        thoughtCollapsed: false,
        total_tokens: 0,
        thoughtTime: 0,
        contentTime: 0,
        thought: "",
        followQuestions: [],
        content: "",
        typing: false,
        role: "",
        requestStatus: "loading",
      };
      return message;
    }
    // 为旧持久化消息补齐唯一标识，保证迁移后预览实例仍可稳定复用
    function ensureMessageIds(chat: Chat) {
      const ids = new Set<string>();
      chat.messages.forEach((message) => {
        let id = message.id;
        while (!id || ids.has(id)) id = `msg-${getUUID().slice(0, 8)}`;
        message.id = id;
        ids.add(id);
      });
    }
    function addChat() {
      const newChat = createDefaultChat();
      chatList.value.unshift(newChat);
      currentChatId.value = newChat.id;
      return newChat;
    }
    // 注册简历助手会话工厂，供“新建话题”等入口直接调用
    function registerResumeAssistantChatFactory(factory: () => Chat) {
      resumeAssistantChatFactory = factory;
    }
    // 加载指定简历的最近会话正文；没有会话时保持空状态
    async function initializeResumeAssistantChat(resumeId: string, chatId?: string) {
      const loadId = ++resumeAssistantChatLoadId;
      resumeAssistantChat.value = null;
      const summaries = useResumeStore().list.find((resume) => resume.id === resumeId)?.ai || [];
      const summary = summaries.find((chat) => chat.id === chatId) || summaries[0];
      if (!summary) {
        resumeAssistantChat.value = null;
        return null;
      }
      const chat = await get<ResumeAssistantChatRecord>(resumeAssistantChatKey(summary.id));
      if (loadId !== resumeAssistantChatLoadId) return null;
      if (!chat || chat.id !== summary.id || chat.resumeId !== resumeId) {
        resumeAssistantChat.value = null;
        return null;
      }
      ensureMessageIds(chat);
      resumeAssistantChat.value = chat;
      return chat;
    }
    // 切换当前简历下的助手话题
    async function switchResumeAssistantChat(id: string) {
      const resumeId = useResumeStore().currentItem?.id;
      if (!resumeId) return null;
      return initializeResumeAssistantChat(resumeId, id);
    }
    // 创建未持久化的简历助手话题草稿
    function createNewResumeAssistantChat() {
      if (!resumeAssistantChatFactory) return;
      return resumeAssistantChatFactory();
    }
    // 首次产生用户消息后保存简历助手话题
    async function saveResumeAssistantChat(chat: Chat) {
      if (!chat.resumeId) return null;
      const directory = useResumeStore().list.find((resume) => resume.id === chat.resumeId);
      if (!directory || directory.deletedAt !== null) return null;
      const record = chat as ResumeAssistantChatRecord;
      await set(
        resumeAssistantChatKey(chat.id),
        JSON.parse(JSON.stringify(record)) as ResumeAssistantChatRecord,
      );
      const updated = await useResumeStore().updateResumeAiChatSummary(chat.resumeId, {
        id: chat.id,
        title: chat.title,
        createTime: chat.createTime,
        updateTime: chat.updateTime,
      } satisfies AiChatSummary);
      if (!updated) {
        await del(resumeAssistantChatKey(chat.id));
        return null;
      }
      resumeAssistantChat.value = record;
      return chat;
    }
    // 持久化已创建的会话正文及目录摘要
    async function persistResumeAssistantChat(chat: Chat) {
      if (!chat.resumeId) return;
      const directory = useResumeStore().list.find((resume) => resume.id === chat.resumeId);
      if (!directory || directory.deletedAt !== null) return;
      const record = chat as ResumeAssistantChatRecord;
      await set(
        resumeAssistantChatKey(chat.id),
        JSON.parse(JSON.stringify(record)) as ResumeAssistantChatRecord,
      );
      await useResumeStore().updateResumeAiChatSummary(chat.resumeId, {
        id: chat.id,
        title: chat.title,
        createTime: chat.createTime,
        updateTime: chat.updateTime,
      });
    }
    // 按会话 ID 读取完整正文，供历史会话查看使用
    function getResumeAssistantChat(id: string) {
      return get<ResumeAssistantChatRecord>(resumeAssistantChatKey(id));
    }
    // 彻底删除简历时清理其关联会话正文和目录摘要
    async function removeResumeAssistantChats(resumeId: string) {
      const resumeStore = useResumeStore();
      const ids = resumeStore.list.find((resume) => resume.id === resumeId)?.ai.map((chat) => chat.id) || [];
      await Promise.all(ids.map((id) => del(resumeAssistantChatKey(id))));
      await resumeStore.clearResumeAiChatSummaries(resumeId);
      if (resumeAssistantChat.value?.resumeId === resumeId) {
        resumeAssistantChat.value = null;
      }
    }
    // 软删除只清除当前运行时指针，保留 IndexedDB 会话和目录摘要
    function clearCurrentResumeAssistantChat(resumeId: string) {
      if (resumeAssistantChat.value?.resumeId === resumeId) {
        resumeAssistantChat.value = null;
      }
    }
    // 首条用户消息生成简历助手话题标题
    function updateResumeAssistantChatTitle(chat: Chat) {
      if (chat.title !== DEFAULT_CHAT_TITLE) return;
      const firstUserMsg = chat.messages.find((message) => message.role === "user");
      if (!firstUserMsg) return;
      const content = firstUserMsg.content;
      chat.title = content.length > 15 ? `${content.slice(0, 15)}...` : content;
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
        protocol: draft.protocol,
        builtin: draft.builtin,
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

    // 获取角色绑定的模型
    function getAgentModelId(agent: AiAgentKey) {
      return agentModels.value[agent];
    }

    // 保存角色绑定的模型
    function setAgentModel(agent: AiAgentKey, modelId: string) {
      agentModels.value[agent] = modelId;
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
      modelList,
      agentModels,
      thinkMode,
      resumeAssistantChat,
      resumeAssistantChatList,
      createDefaultChat,
      createDefaultMessage,
      addChat,
      registerResumeAssistantChatFactory,
      initializeResumeAssistantChat,
      createNewResumeAssistantChat,
      saveResumeAssistantChat,
      persistResumeAssistantChat,
      switchResumeAssistantChat,
      getResumeAssistantChat,
      removeResumeAssistantChats,
      clearCurrentResumeAssistantChat,
      updateResumeAssistantChatTitle,
      prepareNewChat,
      switchChat,
      delChat,
      addMessage,
      deployModel,
      deleteModel,
      getAgentModelId,
      setAgentModel,
      modelManagerVisible,
      modelManagerTab,
      openModelManager,
    };
  },
  {
    persist: {
      // 简历助手对话一并持久化到 localStorage，刷新后可恢复最近对话
      storage: localStorage,
      pick: [
        "sidebarMode",
        "currentChatId",
        "modelList",
        "agentModels",
        "thinkMode",
      ],
    },
  },
);
