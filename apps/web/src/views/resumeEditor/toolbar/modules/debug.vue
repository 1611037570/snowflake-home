<template>
  <!-- 调试控制台按钮：是否显示由系统设置中的「调试控制台」开关控制 -->
  <Icon
    v-if="system.showDebug"
    icon="mdi:console-line"
    size="5"
    content="调试控制台"
    @click="drawerVisible = !drawerVisible"
  />

  <!-- 抽屉：关闭时销毁内容，避免内容常驻导致关闭后仍持续序列化整份数据 -->
  <el-drawer v-model="drawerVisible" title="控制台" direction="rtl" size="50%" destroy-on-close>
    <div v-if="drawerVisible" class="flex flex-col gap-3 p-3">
      <SfTab :list="tabList" v-model="activeTab">
        <SfTabPane value="data">
          <SfCollapse v-model="activeNames">
            <SfCollapseItem name="raw">
              <template #title>原始数据 (currentData)</template>
              <div class="max-h-[50vh] overflow-y-auto">
                <div v-for="(value, key) in currentData ?? {}" :key="key" class="mb-3">
                  <div class="mb-3 font-medium">{{ key }}</div>
                  <SfMdPreview
                    :modelValue="fieldMd(value)"
                    editorId="debug-raw"
                    :codeFoldable="false"
                    class="bg-transparent! p-0!"
                  />
                </div>
              </div>
            </SfCollapseItem>
          </SfCollapse>
        </SfTabPane>
        <SfTabPane value="config">
          <SfCollapse>
            <SfCollapseItem name="currentFixedConfig">
              <template #title>原始配置 (currentFixedConfig)</template>
              <div class="max-h-[50vh] overflow-y-auto">
                <div v-for="(value, key) in currentFixedConfig ?? {}" :key="key" class="mb-3">
                  <div class="mb-3 font-medium">{{ key }}</div>
                  <SfMdPreview
                    :modelValue="fieldMd(value)"
                    editorId="debug-config"
                    :codeFoldable="false"
                    class="bg-transparent! p-0!"
                  />
                </div>
              </div>
            </SfCollapseItem>
            <SfCollapseItem name="currentConfig">
              <template #title>当前配置 (currentConfig)</template>
              <div class="max-h-[50vh] overflow-y-auto">
                <div v-for="(value, key) in currentConfig ?? {}" :key="key" class="mb-3">
                  <div class="mb-3 font-medium">{{ key }}</div>
                  <SfMdPreview
                    :modelValue="fieldMd(value)"
                    editorId="debug-config"
                    :codeFoldable="false"
                    class="bg-transparent! p-0!"
                  />
                </div>
              </div>
            </SfCollapseItem>
          </SfCollapse>
        </SfTabPane>
        <SfTabPane value="chat">
          <SfCollapse v-model="chatActiveNames">
            <SfCollapseItem name="assistantChat">
              <template #title>
                <div class="flex w-full items-center justify-between gap-3">
                  <span>消息对话 (resumeAssistantChat)</span>
                  <span
                    v-if="resumeAssistantChat"
                    class="shrink-0 rounded-full bg-sf-theme px-3 text-xs text-sf-theme-text"
                  >
                    当前使用
                  </span>
                </div>
              </template>
              <div v-if="!chatMessages.length" class="text-sm text-sf-text-3">暂无消息</div>
              <div v-else class="max-h-[50vh] overflow-y-auto">
                <div v-for="(msg, index) in chatMessages" :key="index" class="mb-3">
                  <!-- 消息摘要行：点击展开该条消息的完整 JSON 便于排查 -->
                  <div
                    class="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl bg-sf-bg px-3 py-2 transition-colors hover:bg-sf-bg-2"
                    @click="toggleMsgJson(index)"
                  >
                    <span class="shrink-0 text-sm font-medium">{{ msg.role }}</span>
                    <span class="shrink-0 text-xs text-sf-text-3">{{ msg.requestStatus }}</span>
                    <span
                      class="min-w-0 flex-1 truncate whitespace-nowrap text-sm text-sf-text-2"
                    >
                      {{ msgBrief(msg) }}
                    </span>
                    <SfTooltip content="删除该消息">
                      <button
                        type="button"
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sf-text-3 transition-colors hover:bg-sf-error-2 hover:text-sf-error"
                        @click.stop="handleDeleteMsg(index)"
                      >
                        <SfIcon icon="ic:round-delete" size="4" />
                      </button>
                    </SfTooltip>
                  </div>
                  <SfMdPreview
                    v-if="activeMsgIndex === index"
                    :modelValue="fieldMd(msg)"
                    editorId="debug-chat"
                    :codeFoldable="false"
                    class="mt-3 bg-transparent! p-0!"
                  />
                </div>
              </div>
            </SfCollapseItem>
          </SfCollapse>
        </SfTabPane>
      </SfTab>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAiStore, useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import confirm from "@/components/business/confirm";
import Icon from "../components/icon.vue";

const drawerVisible = ref(false);
const activeNames = ref(["raw"]);

// 顶部 Tab：数据 / 配置
const activeTab = ref("data");
const tabList = [
  { name: "数据", value: "data" },
  { name: "配置", value: "config" },
  { name: "消息对话", value: "chat" },
];

// 获取原始数据
const resumeStore = useResumeStore();
const { currentData, currentConfig, system, currentFixedConfig } = storeToRefs(resumeStore);

// 获取简历助手的 LLM 对话（编辑器当前正在使用的对话）
const aiStore = useAiStore();
const { resumeAssistantChat } = storeToRefs(aiStore);
const chatMessages = computed(() => resumeAssistantChat.value?.messages ?? []);

// 当前展开查看 JSON 的消息下标：-1 表示未展开
const activeMsgIndex = ref(-1);
// 消息对话折叠面板：默认展开
const chatActiveNames = ref(["assistantChat"]);

// 消息摘要：压缩为单行便于列表展示
const msgBrief = (msg) => {
  const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content ?? "");
  return content.replace(/\s+/g, " ").trim();
};

// 点击消息摘要行：切换展开/收起该条消息的完整 JSON
const toggleMsgJson = (index) => {
  activeMsgIndex.value = activeMsgIndex.value === index ? -1 : index;
};

// 删除消息：删除后关闭展开的 JSON 预览
function handleDeleteMsg(index) {
  confirm("删除后不可恢复。", "删除该条消息")
    .then(() => {
      const chat = resumeAssistantChat.value;
      if (!chat) return;
      chat.messages.splice(index, 1);
      chat.updateTime = Date.now();
      activeMsgIndex.value = -1;
    })
    .catch(() => {});
}

// 包装为 markdown json 代码块
const wrapJson = (str) => "```json\n" + str + "\n```";

// 单个字段值包装为 markdown json 代码块：按顶层 key 分别预览，避免整份数据整体序列化
const fieldMd = (value) => {
  try {
    return wrapJson(JSON.stringify(value ?? null, null, 2));
  } catch (e) {
    return wrapJson(String(e));
  }
};
</script>
