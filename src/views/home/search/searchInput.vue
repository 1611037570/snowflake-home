<template>
  <div
    class="translate translate shadow-3xl relative flex h-10 items-center rounded-3xl transition-all duration-300"
    :class="[
      searchFocus ? 'bg-sf-primary' : 'bg-sf-transparent-2 hover:bg-sf-transparent',
      searchFocus ? 'w-[590px]' : 'w-[230px] hover:w-[590px]',
    ]"
    style="backdrop-filter: blur(10px) saturate(1.5)"
  >
    <div v-if="searchFocus" class="absolute top-1/2 left-2 z-10 -translate-y-1/2">
      <SfTooltip
        v-if="expressionsVisible"
        :content="
          expressionsLock
            ? '按tab或点击解锁，计算结果将自动显示'
            : '按tab或点击锁定，计算结果将持续显示'
        "
      >
        <BaseIcon
          @click="expressionsLock = !expressionsLock"
          size="6"
          :icon="expressionsLock ? 'stash:lock-closed' : 'stash:lock-opened'"
        />
      </SfTooltip>
      <SfTooltip v-else :content="currentSource.type">
        <div
          class="flex-c sf-theme-element h-7 overflow-hidden rounded-xl px-2 text-xs font-medium transition-all duration-300 hover:shadow-md"
          @click.stop="toggleSourceMenu"
        >
          <div class="flex items-center justify-center">
            <el-image :src="currentSource.icon" class="h-4 w-4"></el-image>
            <svg
              class="ml-1.5 h-3 w-3 transition-transform duration-200"
              :class="{ 'rotate-180': webSourceListVisible }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </SfTooltip>
    </div>
    <div
      v-if="searchFocus"
      class="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center"
    >
      <SfTooltip content="按del或点击删除内容" v-if="handleValue" class="mr-1">
        <BaseIcon icon="carbon:close-outline" size="6" @click.stop="clearSearch" />
      </SfTooltip>

      <SfTooltip
        v-if="expressionsVisible && handleValue"
        :content="expressionsLock ? '按回车或点击复制结果' : '按回车或点击搜索内容'"
      >
        <BaseIcon
          icon="famicons:copy-outline"
          class="hover:text-sf-theme"
          size="6"
          @click="getResult"
        />
      </SfTooltip>
      <SfTooltip
        v-else-if="!expressionsVisible"
        :content="expressionsLock ? '按回车或点击搜索内容' : '按回车或点击复制结果'"
      >
        <BaseIcon icon="mynaui:search" class="hover:text-sf-theme" size="7" @click="getResult" />
      </SfTooltip>
    </div>
    <SfInput
      v-model="searchValue"
      :placeholder="placeholder"
      :autofocus="autoFocus"
      :clearable="false"
      @keyup.enter="getResult"
      @focus="handleFocus"
      class="translate relative h-10 rounded-lg bg-transparent text-white"
      :class="searchFocus ? 'px-22' : ''"
    >
    </SfInput>
  </div>
</template>

<script setup>
import { webSource } from '@/datas/search.data'
import { useSearchStore } from '@/stores'
import { onKeyStroke } from '@vueuse/core'

import { evaluate, parse } from 'mathjs'

const searchStore = useSearchStore()
const { search } = searchStore
const {
  autoFocus,
  searchFocus,
  searchValue,
  currentWebIndex,
  handleValue,
  currentIndex,
  expressionsFlag,
  expressionsResult,
  expressionsLock,
  expressionsVisible,
  webSourceListVisible,
} = storeToRefs(searchStore)

// 表达式计算
function expressionsComputed() {
  const value = String(searchValue.value)
  try {
    parse(value)
    const res = evaluate(value)
    // 在有小数的时候才保留两位小数
    const resFixed = Number.isInteger(res) ? res : res.toFixed(2)
    expressionsResult.value = resFixed
    console.log('resFixed', resFixed)
    expressionsFlag.value = true
  } catch (err) {
    console.log('err', err)
    expressionsFlag.value = false
  }
}
// 显示/隐藏搜索源下拉菜单
const toggleSourceMenu = () => {
  webSourceListVisible.value = !webSourceListVisible.value
}
// 当前选中的搜索源
const currentSource = computed(() => {
  return webSource.value[currentWebIndex.value]
})

// 监听搜索输入变化，重置当前索引
watch(
  () => searchValue.value,
  () => {
    expressionsComputed()
    currentIndex.value = -1
  },
)

const { copy } = useClipboard({
  legacy: false,
})
function getResult() {
  if (expressionsVisible.value) {
    copy(expressionsResult.value)
    ElMessage.success('复制成功')
    return
  }
  search(currentSource.value)
}

// 清空搜索输入
function clearSearch() {
  searchValue.value = ''
}

function handleFocus() {
  searchFocus.value = true
}

// 计数变量，初始值 0
const count = ref(0)
const target = '输入内容或计算公式...'
const placeholder = ref('')
const { pause } = useIntervalFn(
  () => {
    // 每次执行先累加计数
    placeholder.value += target[count.value]
    count.value++
    // 核心逻辑：计数达到60时停止定时器
    if (count.value >= target.length) {
      pause()
      return // 停止后直接返回，避免后续无效操作
    }
  },
  140,
  {
    immediate: true,
  },
)

// 监听tab切换
onKeyStroke('Tab', (e) => {
  if (searchFocus.value && expressionsFlag.value) {
    e.preventDefault()
    expressionsLock.value = !expressionsLock.value
    return
  }

  if (searchFocus.value) {
    e.preventDefault()

    // 切换到下一个搜索源下标
    const nextIndex = (currentWebIndex.value + 1) % webSource.value.length
    currentWebIndex.value = nextIndex
  }
})
</script>

<style lang="scss" scoped></style>
