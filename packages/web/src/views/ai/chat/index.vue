<script setup>
import { useAiSettings } from '@/hooks'
import { useAiStore } from '@/stores'
import { arkLLM } from '@/utils'
import { useScroll } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import AiMessage from './aiMessage.vue'
import ChatInput from './chatInput.vue'
import UserMessage from './userMessage.vue'
import WelcomeScreen from './welcomeScreen.vue'

const props = defineProps({
  chatId: {
    type: String,
    required: true,
  },
})

const aiStore = useAiStore()
const { currentMessages, currentChat } = storeToRefs(aiStore)
const { addMessage } = aiStore

// 输入框内容
const inputMessage = ref('')
// 聊天容器的引用，用于滚动
const chatContainer = ref(null)

// 滚动监听，用于显示回到底部按钮
const scrollTarget = computed(() => chatContainer.value?.wrapRef)
const { arrivedState } = useScroll(scrollTarget, {
  offset: { bottom: 100 },
})

const showScrollBottom = computed(() => {
  // 如果没有消息或者已经触底，则不显示
  if (currentMessages.value.length === 0 || arrivedState.bottom) return false
  return true
})
// ChatInput 组件的引用，用于聚焦
const chatInputRef = ref(null)
// 是否正在发送中
const isSending = ref(false)
// 中止请求的函数
let abortRequest = null

// 是否正在生成中（包含发送中、打字中或加载中状态）
const isGenerating = computed(() => {
  const lastMsg = currentMessages.value.at(-1)
  return isSending.value || lastMsg?.typing
})

// 设置数据
const settings = useAiSettings()

// 过滤掉 system 消息后的显示列表
const displayMessages = computed(() => {
  return currentMessages.value.filter((m) => m.role !== 'system')
})

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value?.wrapRef) {
    chatContainer.value.setScrollTop(chatContainer.value.wrapRef.scrollHeight)
  }
}

// 监听 chatId 变化时滚动到底部并聚焦
watch(
  () => props.chatId,
  () => {
    scrollToBottom()
    nextTick(() => chatInputRef.value?.focus())
  },
  { immediate: true },
)

/**
 * 点击提示词卡片
 */
const handleSuggest = () => {
  isSending.value = true
  scrollToBottom()
  handleAIResponse()
}

/**
 * 停止生成
 */
const stopGenerating = () => {
  isSending.value = false
  if (abortRequest) {
    abortRequest()
    abortRequest = null
  }
  // 确保所有消息的打字状态都重置
  currentMessages.value.forEach((msg) => {
    if (msg.typing) {
      msg.typing = false
    }
  })
}

/**
 * 处理 AI 回复的真实请求
 */
const handleAIResponse = async () => {
  let lastMsg = null
  try {
    // 准备发送给 AI 的消息列表
    const messages = currentMessages.value.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    addMessage({
      role: 'assistant',
      content: '',
      typing: true,
    })
    lastMsg = currentMessages.value[currentMessages.value.length - 1]

    const { sendFn, abortFn } = await arkLLM.request({
      options: {
        input: messages,
        model: 'doubao-seed-2-0-mini-260215',
        thinking: {
          type: settings.value.thinkMode === 'deep' ? 'enabled' : 'disabled',
        }, // 👈 这个就是【深度思考开关】
      },
      stream: true,
      isJson: false,
      onEvent: (type, data) => {
        if (type === 'reasoning') {
          if (lastMsg.thought === undefined) {
            lastMsg.thought = ''
            lastMsg.thoughtCollapsed = false
          }
          lastMsg.thought += data
          scrollToBottom()
        } else if (type === 'content') {
          lastMsg.content += data
          scrollToBottom()
        } else if (type === 'total_tokens') {
          lastMsg.total_tokens = data
        }
      },
      onFail: (error) => {
        lastMsg.content = `请求出错: ${error.message || '未知错误'}`
        lastMsg.typing = false
        isSending.value = false
      },
    })

    abortRequest = abortFn
    await sendFn()
  } catch (error) {
    console.error('AI 请求异常:', error)
  } finally {
    isSending.value = false
    abortRequest = null
    if (lastMsg?.typing) {
      lastMsg.typing = false
    }
    if (currentChat.value) {
      currentChat.value.updateTime = Date.now()
    }
  }
}

/**
 * 处理发送消息
 */
const handleSend = async () => {
  const content = inputMessage.value.trim()
  if (!content || isSending.value) return

  isSending.value = true
  try {
    addMessage({
      role: 'user',
      content,
      typing: false,
    })

    inputMessage.value = ''
    scrollToBottom()
    nextTick(() => chatInputRef.value?.focus())

    // 立即添加一个空的助手消息用于展示 Loading 状态

    scrollToBottom()

    // 触发真实请求
    handleAIResponse()
  } catch {
    isSending.value = false
  }
}

/**
 * 撤回消息并重新编辑
 */
const handleRecall = (msg) => {
  const index = currentMessages.value.indexOf(msg)
  if (index === -1) return

  ElMessageBox.confirm('确定要撤回这条消息并重新编辑吗？其后的对话也将被清除。', '撤回消息', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 停止生成并重置状态
      stopGenerating()

      const recalledMsg = currentMessages.value[index]
      // 撤回该条消息及其后面的所有消息
      currentMessages.value = currentMessages.value.slice(0, index)

      if (currentChat.value) {
        currentChat.value.updateTime = Date.now()
      }

      if (recalledMsg?.role === 'user') {
        inputMessage.value = recalledMsg.content
      }

      nextTick(() => chatInputRef.value?.focus())
    })
    .catch(() => {})
}
</script>

<template>
  <div class="relative flex h-full w-full flex-col select-text">
    <SfScrollbar ref="chatContainer" class="h-full w-full flex-1">
      <WelcomeScreen v-if="currentMessages.length === 0" @suggest="handleSuggest" />
      <template v-else>
        <div class="flex h-full flex-col items-center p-3">
          <component
            :is="msg.role === 'user' ? UserMessage : AiMessage"
            v-for="(msg, index) in displayMessages"
            :key="index"
            :msg="msg"
            :index="index"
            :settings="settings"
            :is-last-few="index >= displayMessages.length - 2"
            @recall="handleRecall(msg)"
            @toggle-thought="msg.thoughtCollapsed = !msg.thoughtCollapsed"
            @toggle-collapsed="msg.collapsed = !msg.collapsed"
          />
        </div>
      </template>
    </SfScrollbar>

    <!-- 滚动到底部按钮 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div v-if="showScrollBottom" class="absolute bottom-42 left-1/2 z-9990 -translate-x-1/2">
        <button
          class="hover:text-primary flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-gray-500 shadow-xl transition-all hover:bg-gray-50 active:scale-95"
          title="回到底部"
          @click="scrollToBottom"
        >
          <SfIcon icon="mingcute:arrow-down-line" class="text-xl" />
        </button>
      </div>
    </Transition>

    <ChatInput
      ref="chatInputRef"
      v-model="inputMessage"
      :settings="settings"
      :isGenerating="isGenerating"
      @send="handleSend"
      @stop="stopGenerating"
      @update:thinkMode="(val) => (settings.thinkMode = val)"
    />
  </div>
</template>

<style scoped></style>
