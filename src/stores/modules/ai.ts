import { getUUID } from '@/utils'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const DEFAULT_SYSTEM_PROMPT =
  '你的设置是：名字叫小羊，性别男，巨蟹座，2000年生，工作是前端工程师，擅长vue typescript，说话直接清爽，不拖沓、不矫情，回答简洁准确。回答以这个设定为基础。'
const DEFAULT_CHAT_TITLE = '新对话'

export const useAiStore = defineStore(
  'ai',
  () => {
    const sidebarCollapsed = ref(false)
    const chatList = ref([])
    const currentChatId = ref('')

    const currentChat = computed(() => chatList.value.find((c) => c.id === currentChatId.value))

    const currentMessages = computed({
      get: () => currentChat.value?.messages || [],
      set: (val) => {
        if (currentChat.value) currentChat.value.messages = val
      },
    })

    function prepareNewChat() {
      currentChatId.value = 'new-chat-temp'
    }

    function addChat() {
      const newChat = {
        id: getUUID(),
        title: DEFAULT_CHAT_TITLE,
        createTime: Date.now(),
        updateTime: Date.now(),
        messages: [{ role: 'system', content: DEFAULT_SYSTEM_PROMPT }],
      }
      chatList.value.unshift(newChat)
      currentChatId.value = newChat.id
      return newChat
    }

    function switchChat(id) {
      currentChatId.value = id
    }

    function delChat(id) {
      ElMessageBox.confirm('确定要删除该对话记录吗？此操作不可恢复。', '删除对话', {
        type: 'warning',
      })
        .then(() => {
          const index = chatList.value.findIndex((c) => c.id === id)
          if (index > -1) {
            chatList.value.splice(index, 1)
            if (currentChatId.value === id) {
              currentChatId.value = chatList.value[0]?.id || ''
            }
          }
        })
        .catch(() => {})
    }

    function updateChatTitle() {
      const chat = currentChat.value
      if (!chat || chat.title !== DEFAULT_CHAT_TITLE) return

      const firstUserMsg = chat.messages.find((m) => m.role === 'user')
      if (firstUserMsg) {
        const content = firstUserMsg.content
        chat.title = content.length > 15 ? `${content.slice(0, 15)}...` : content
      }
    }

    function addMessage(msg) {
      if (!currentChat.value) addChat()

      currentChat.value.messages.push({
        ...msg,
        time: msg.time || dayjs().format('HH:mm'),
      })
      currentChat.value.updateTime = Date.now()
      updateChatTitle()
    }

    return {
      sidebarCollapsed,
      chatList,
      currentChatId,
      currentChat,
      currentMessages,
      addChat,
      prepareNewChat,
      switchChat,
      delChat,
      addMessage,
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['sidebarCollapsed', 'chatList', 'currentChatId'],
    },
  },
)
