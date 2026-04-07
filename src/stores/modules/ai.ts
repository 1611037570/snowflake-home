import { getUUID } from '@/utils'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAiStore = defineStore(
  'ai',
  () => {
    // 侧边栏折叠状态
    const sidebarCollapsed = ref(false)

    // 会话列表
    const chatList = ref([])
    // 当前选中的会话 ID
    const currentChatId = ref('')

    // 当前选中的会话对象
    const currentChat = computed(() => {
      return chatList.value.find((chat) => chat.id === currentChatId.value)
    })

    // 当前会话的消息列表
    const currentMessages = computed({
      get: () => currentChat.value?.messages || [],
      set: (val) => {
        if (currentChat.value) {
          currentChat.value.messages = val
        }
      },
    })

    // 准备新建会话 (进入待新建状态)
    function prepareNewChat() {
      currentChatId.value = 'new-chat-temp'
    }

    // 新建并添加会话到列表
    function addChat() {
      const newChat = {
        id: getUUID(),
        title: '新对话',
        createTime: Date.now(),
        updateTime: Date.now(),
        messages: [
          {
            role: 'system',
            content:
              '你的设置是：名字叫小羊，性别男，巨蟹座，2000年生，工作是前端工程师，擅长vue typescript，说话直接清爽，不拖沓、不矫情，回答简洁准确。回答以这个设定为基础。',
          },
        ],
      }
      chatList.value.unshift(newChat)
      currentChatId.value = newChat.id
      return newChat
    }

    // 切换会话
    function switchChat(id) {
      currentChatId.value = id
    }

    // 删除会话
    function delChat(id) {
      ElMessageBox.confirm('确定要删除该对话记录吗？此操作不可恢复。', '删除对话', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const index = chatList.value.findIndex((chat) => chat.id === id)
          if (index > -1) {
            chatList.value.splice(index, 1)
            // 如果删除的是当前选中的会话，则清空当前选中状态或选中第一个
            if (currentChatId.value === id) {
              currentChatId.value = chatList.value.length > 0 ? chatList.value[0].id : ''
            }
          }
        })
        .catch(() => {})
    }

    // 更新当前会话标题 (基于第一条用户消息)
    function updateChatTitle() {
      if (
        currentChat.value &&
        currentChat.value.messages.length > 0 &&
        currentChat.value.title === '新对话'
      ) {
        const firstUserMsg = currentChat.value.messages.find((m) => m.role === 'user')
        if (firstUserMsg) {
          // 截取前 15 个字符作为标题
          currentChat.value.title =
            firstUserMsg.content.slice(0, 15) + (firstUserMsg.content.length > 15 ? '...' : '')
        }
      }
    }

    // 向当前会话添加消息
    function addMessage(msg) {
      if (!currentChat.value) {
        addChat()
      }
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
