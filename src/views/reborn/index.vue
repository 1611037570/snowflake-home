<template>
  <div
    class="mx-auto min-h-screen max-w-[900px] bg-gradient-to-br from-[#f5f7fa] to-[#e4efe9] p-5 text-[#333]"
  >
    <div
      v-if="appState.currentPage === 'declaration'"
      class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl"
    >
      <header class="relative mb-8 text-center">
        <h1 class="relative mb-2 inline-block text-[2.5rem] font-bold text-[#2ecc71]">
          <SfIcon icon="fa6-solid:seedling" /> 21天重启人生
        </h1>
        <p class="mb-5 text-[1.1rem] text-gray-500">用21天时间，养成一个改变人生的习惯</p>
      </header>
      <div class="my-6 flex gap-4">
        <div
          class="flex-1 rounded-xl border-t-4 border-[#3498db] bg-gradient-to-br from-[#f0f7ff] to-[#e1f0ff] p-5 text-center shadow"
        >
          <div class="mb-2 font-bold text-[#333]">破晓之章</div>
          <div class="text-sm text-gray-500">第1-7天</div>
          <p>告别旧我，克服初始阻力</p>
        </div>
        <div
          class="flex-1 rounded-xl border-t-4 border-[#9b59b6] bg-gradient-to-br from-[#f9f0ff] to-[#f0e1ff] p-5 text-center shadow"
        >
          <div class="mb-2 font-bold text-[#333]">历练之章</div>
          <div class="text-sm text-gray-500">第8-14天</div>
          <p>塑造新我，建立稳定节奏</p>
        </div>
        <div
          class="flex-1 rounded-xl border-t-4 border-[#2ecc71] bg-gradient-to-br from-[#f0fff4] to-[#e1ffe7] p-5 text-center shadow"
        >
          <div class="mb-2 font-bold text-[#333]">重生之章</div>
          <div class="text-sm text-gray-500">第15-21天</div>
          <p>内化习惯，享受改变成果</p>
        </div>
      </div>
      <div class="mb-5">
        <label class="mb-2 block font-semibold text-[#333]"
          ><SfIcon icon="fa6-solid:bullseye" /> 选择你的重启目标</label
        >
        <select
          v-model="goalSelectVal"
          class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
        >
          <option value="">-- 请选择目标 --</option>
          <option value="daily_exercise">每日运动20分钟</option>
          <option value="reading">每日阅读30分钟</option>
          <option value="meditation">每日冥想10分钟</option>
          <option value="early_sleep">每晚11点前睡觉</option>
          <option value="no_social_media">戒除社交媒体成瘾</option>
          <option value="learning_skill">学习一项新技能</option>
          <option value="healthy_eating">健康饮食</option>
          <option value="gratitude_journal">写感恩日记</option>
          <option value="other">自定义目标</option>
        </select>
      </div>
      <div v-if="isCustomGoal" class="mb-5">
        <label class="mb-2 block font-semibold text-[#333]"
          ><SfIcon icon="fa6-solid:edit" /> 请输入你的自定义目标</label
        >
        <textarea
          v-model="customGoal"
          placeholder="例如：每天写500字..."
          class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
        ></textarea>
      </div>
      <div class="mb-5">
        <label class="mb-2 block font-semibold text-[#333]"
          ><SfIcon icon="fa6-solid:fire" /> 为什么想要实现这个目标？</label
        >
        <textarea
          v-model="reason"
          placeholder="写下你的动力源泉..."
          class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
        ></textarea>
      </div>
      <div
        class="relative my-5 overflow-hidden rounded-r-xl border-l-4 border-[#2ecc71] bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-5"
      >
        <p>科学研究表明，21天足以形成一个新习惯。坚持21天，你将开启全新的人生篇章！</p>
      </div>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2ecc71] px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#27ae60]"
          @click="startJourney"
        >
          <SfIcon icon="fa6-solid:signature" /> 签署重启协议，立即开始
        </button>
      </div>
    </div>

    <div
      v-if="appState.currentPage === 'journey'"
      class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl"
    >
      <header class="relative mb-8 text-center">
        <h1 class="relative mb-2 inline-block text-[2.5rem] font-bold text-[#2ecc71]">
          <SfIcon icon="fa6-solid:mountain" /> 21天重启征程
        </h1>
        <p class="mb-5 text-[1.1rem] text-gray-500">
          你的目标: <span>{{ appState.goal }}</span>
        </p>
      </header>
      <div class="relative my-8">
        <div class="mb-2 flex justify-between">
          <span>重启进度</span>
          <span>{{ progressText }}</span>
        </div>
        <div class="relative mb-2 h-4 overflow-hidden rounded-lg bg-gray-100">
          <div
            class="h-full bg-gradient-to-r from-[#2ecc71] to-[#3498db] transition-[width] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
        <div class="mt-1 flex justify-between text-xs text-gray-500">
          <div :class="['relative flex-1 text-center', currentPhase >= 1 ? 'text-[#2ecc71]' : '']">
            破晓之章
          </div>
          <div :class="['relative flex-1 text-center', currentPhase >= 2 ? 'text-[#2ecc71]' : '']">
            历练之章
          </div>
          <div :class="['relative flex-1 text-center', currentPhase >= 3 ? 'text-[#2ecc71]' : '']">
            重生之章
          </div>
        </div>
      </div>
      <div class="my-6 grid grid-cols-3 gap-4">
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ currentStreak }}</div>
          <div class="text-sm text-gray-500">当前连续</div>
        </div>
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ completionRate }}%</div>
          <div class="text-sm text-gray-500">完成率</div>
        </div>
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ daysRemaining }}</div>
          <div class="text-sm text-gray-500">剩余天数</div>
        </div>
      </div>
      <div
        v-if="showMakeup"
        class="my-5 rounded-xl border-l-4 border-[#f1c40f] bg-gradient-to-br from-[#fff9e6] to-[#fff0cc] p-4 text-center"
        id="makeup-container"
      >
        <h3 class="mb-2 text-[#f39c12]"><SfIcon icon="fa6-solid:history" /> 补卡机会</h3>
        <p>
          你还有 <span>{{ appState.makeupRemaining }}</span> 次补卡机会，可以用于补签遗漏的天数
        </p>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
          @click="openMakeupModal"
        >
          <SfIcon icon="fa6-solid:magic" /> 使用补卡
        </button>
      </div>
      <div class="my-8 grid grid-cols-7 gap-2">
        <div
          v-for="day in 21"
          :key="day"
          :class="[
            'relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-gray-100 font-bold transition',
            appState.completedDays.includes(day)
              ? 'scale-105 bg-gradient-to-br from-[#2ecc71] to-[#3498db] text-white shadow-lg'
              : '',
            appState.missedDays.includes(day) ? 'bg-[#ff9f9f] text-white' : '',
            day === appState.completedDays.length + 1 &&
            !appState.completedDays.includes(day) &&
            !appState.missedDays.includes(day)
              ? 'animate-pulse border-4 border-[#2ecc71]'
              : '',
            day > appState.completedDays.length + 1 ? 'cursor-not-allowed opacity-50' : '',
          ]"
          @click="clickDay(day)"
        >
          <div class="text-[1.2rem]">{{ day }}</div>
          <div
            v-if="appState.completedDays.includes(day)"
            class="absolute top-1 right-1 text-xs opacity-80"
          >
            <SfIcon icon="fa6-solid:check" />
          </div>
        </div>
      </div>
      <div
        class="relative my-5 overflow-hidden rounded-r-xl border-l-4 border-[#2ecc71] bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-5"
      >
        <p>{{ dailyMotivationText }}</p>
      </div>
      <div class="mb-5">
        <label class="mb-2 block font-semibold text-[#333]"
          ><SfIcon icon="fa6-solid:pen" /> 今日反思 (可选)</label
        >
        <textarea
          v-model="dailyReflection"
          placeholder="今天完成目标的感觉如何？遇到了什么挑战？"
          class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
        ></textarea>
      </div>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2ecc71] px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#27ae60]"
          @click="completeDay"
        >
          <SfIcon icon="fa6-solid:check-circle" /> 完成今日目标
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-3 font-semibold text-[#333] shadow transition hover:bg-gray-200"
          @click="resetJourney"
        >
          <SfIcon icon="fa6-solid:redo" /> 重新开始
        </button>
      </div>
    </div>

    <div
      v-if="appState.currentPage === 'certificate'"
      class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl"
    >
      <div
        class="relative my-5 overflow-hidden rounded-2xl border-2 border-[#2ecc71] bg-gradient-to-br from-[#f9fdfb] to-[#e8f6f3] p-10 text-center"
      >
        <h2><SfIcon icon="fa6-solid:award" /> 重启人生完成证书</h2>
        <p>以此证明</p>
        <div class="my-5 text-2xl font-bold text-[#2ecc71]">勇敢的重启者</div>
        <p>成功完成了为期21天的</p>
        <p>
          <strong>{{ appState.goal }}</strong>
        </p>
        <p>挑战，展现了非凡的毅力和决心。</p>
        <p class="mt-7 text-gray-500 italic">{{ completionDateText }}</p>
      </div>
      <div class="my-6 grid grid-cols-3 gap-4">
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ longestStreak }}</div>
          <div class="text-sm text-gray-500">最长连续</div>
        </div>
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">100%</div>
          <div class="text-sm text-gray-500">完成率</div>
        </div>
        <div
          class="rounded-xl bg-gradient-to-br from-[#e8f6f3] to-[#d1f2eb] p-4 text-center shadow"
        >
          <div class="mb-1 text-[2rem] font-bold text-[#2ecc71]">{{ appState.makeupUsed }}</div>
          <div class="text-sm text-gray-500">补卡使用</div>
        </div>
      </div>
      <div class="my-5 text-center text-[1.1rem] text-gray-500 italic">
        <p>"我们重复做的事情造就了我们。优秀不是一种行为，而是一种习惯。" - 亚里士多德</p>
      </div>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2ecc71] px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#27ae60]"
          @click="newJourney"
        >
          <SfIcon icon="fa6-solid:rocket" /> 开启新的21天挑战
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
          @click="shareCertificate"
        >
          <SfIcon icon="fa6-solid:share-alt" /> 分享成就
        </button>
      </div>
    </div>

    <div
      v-if="makeupModalVisible"
      class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
      @click.self="closeMakeupModalFunc"
    >
      <div class="relative w-[90%] max-w-[500px] rounded-2xl bg-white p-8 shadow-xl">
        <button
          class="absolute top-4 right-4 cursor-pointer border-0 bg-transparent text-xl text-gray-500"
          @click="closeMakeupModalFunc"
        >
          &times;
        </button>
        <h2><SfIcon icon="fa6-solid:history" /> 使用补卡</h2>
        <p>选择你想要补签的日期：</p>
        <div class="my-8 grid grid-cols-7 gap-2" id="makeup-days">
          <div
            v-for="day in appState.missedDays"
            :key="'miss-' + day"
            :class="[
              'relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-[#ff9f9f] font-bold text-white transition',
              selectedMakeupDay === day ? 'ring-4 ring-[#9b59b6]' : '',
            ]"
            @click="selectedMakeupDay = day"
          >
            <div class="text-[1.2rem]">{{ day }}</div>
          </div>
        </div>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
            @click="confirmMakeup"
          >
            确认补卡
          </button>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-3 font-semibold text-[#333] shadow transition hover:bg-gray-200"
            @click="closeMakeupModalFunc"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-for="i in confettiCount" :key="'c' + i" class="confetti" />
</template>

<script setup>
import { useIntervalFn, useLocalStorage } from '@vueuse/core'
import { computed, onMounted, ref } from 'vue'

const defaultState = {
  currentPage: 'declaration',
  goal: '',
  reason: '',
  startDate: null,
  completedDays: [],
  missedDays: [],
  makeupUsed: 0,
  makeupRemaining: 2,
  reflections: {},
}

const appState = useLocalStorage('rebootLifeState', defaultState)

const goalSelectVal = ref('')
const isCustomGoal = computed(() => goalSelectVal.value === 'other')
const customGoal = ref('')
const reason = ref('')
const dailyReflection = ref('')
const makeupModalVisible = ref(false)
const selectedMakeupDay = ref(null)
const confettiCount = ref(0)

const motivations = [
  '第1天：万事开头难，但你已经迈出了最重要的一步！',
  '第2天：第二天了，继续保持！新的习惯正在形成。',
  '第3天：三天了！你已经开始建立新的神经通路。',
  '第4天：坚持下去，习惯正在慢慢变得自然。',
  '第5天：一周即将过半，你已经超越了最初的困难期！',
  '第6天：继续保持，你的大脑正在适应新的模式。',
  '第7天：恭喜完成第一周！这是习惯形成的关键里程碑。',
  '第8天：第二周开始了，你正在巩固这个新习惯。',
  '第9天：习惯变得越来越自动化，坚持下去！',
  '第10天：双位数了！你已经走过了近一半的旅程。',
  '第11天：继续保持，你正在成为更好的自己。',
  '第12天：习惯的力量正在显现，坚持下去！',
  '第13天：你已经超越了60%的尝试者！',
  '第14天：两周完成！这是习惯形成的关键阶段。',
  '第15天：最后一周开始了，胜利在望！',
  '第16天：习惯几乎已经成为你的一部分。',
  '第17天：继续保持，你离成功只有几步之遥。',
  '第18天：你正在创造持久的改变！',
  '第19天：坚持到底，胜利就在眼前！',
  '第20天：只剩最后一天了，你已经几乎完成了！',
  '第21天：最后一天！完成它，你将开启全新的人生篇章！',
]

const stories = [
  '你知道吗？爱因斯坦曾经说过：『复利是世界第八大奇迹』。你的每一个小坚持，都在为未来的自己积累巨大的能量。',
  '研究表明，养成一个习惯平均需要66天，但21天足以让你跨越最困难的阶段，让新行为变得自然而然。',
  '像詹姆斯·克利尔在《原子习惯》中说的：『你每个当下的选择，都在投票给你想成为的那个人。』今天的坚持就是为理想中的自己投下宝贵的一票。',
  '马拉松选手不会一开始就跑42公里，他们从5公里、10公里开始。你的21天挑战也是如此，每一天都是向终点迈进的一步。',
  '神经元科学表明，重复的行为会加强神经通路，让行动变得越来越容易。你现在的每一次坚持，都在重塑你的大脑。',
]

const completedCount = computed(() => appState.value.completedDays.length)
const progressPercent = computed(() => (completedCount.value / 21) * 100)
const progressText = computed(() => `${completedCount.value}/21 天`)

const currentStreak = computed(() => {
  let streak = 0
  for (let i = completedCount.value; i > 0; i--) {
    if (appState.value.completedDays.includes(i)) streak++
    else break
  }
  return streak
})

const completionRate = computed(() => Math.round((completedCount.value / 21) * 100))
const daysRemaining = computed(() => 21 - completedCount.value)

const currentPhase = computed(() => {
  if (completedCount.value < 7) return 1
  if (completedCount.value < 14) return 2
  return 3
})

const dailyMotivationText = computed(() => {
  const day = completedCount.value + 1
  if (day <= 21) return motivations[day - 1]
  return stories[Math.floor(Math.random() * stories.length)]
})

const showMakeup = computed(
  () => appState.value.makeupRemaining > 0 && appState.value.missedDays.length > 0,
)

const completionDateText = computed(() => {
  const today = new Date()
  return `完成于 ${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
})

const longestStreak = computed(() => {
  let longest = 0
  let cur = 0
  for (let i = 1; i <= 21; i++) {
    if (appState.value.completedDays.includes(i)) {
      cur++
      longest = Math.max(longest, cur)
    } else {
      cur = 0
    }
  }
  return longest
})

function startJourney() {
  let goal = goalSelectVal.value
  if (goal === 'other') goal = customGoal.value.trim()
  const reasonText = reason.value.trim()
  if (!goal) {
    window.alert('请选择或输入你的重启目标')
    return
  }
  if (!reasonText) {
    window.alert('请填写你的重启理由')
    return
  }
  appState.value.currentPage = 'journey'
  appState.value.goal = goal
  appState.value.reason = reasonText
  appState.value.startDate = new Date().toISOString()
  appState.value.completedDays = []
  appState.value.missedDays = []
  appState.value.makeupUsed = 0
  appState.value.makeupRemaining = 2
  appState.value.reflections = {}
}

function completeSpecificDay(day) {
  if (!appState.value.completedDays.includes(day) && !appState.value.missedDays.includes(day)) {
    appState.value.completedDays.push(day)
    appState.value.completedDays.sort((a, b) => a - b)
    if (dailyReflection.value.trim()) appState.value.reflections[day] = dailyReflection.value.trim()
    dailyReflection.value = ''
    if (appState.value.completedDays.length === 21) {
      appState.value.currentPage = 'certificate'
      createConfetti()
    }
  }
}

function clickDay(day) {
  if (
    day <= appState.value.completedDays.length + 1 &&
    !appState.value.completedDays.includes(day) &&
    !appState.value.missedDays.includes(day)
  ) {
    completeSpecificDay(day)
  }
}

function completeDay() {
  const nextDay = appState.value.completedDays.length + 1
  completeSpecificDay(nextDay)
}

function openMakeupModal() {
  if (appState.value.makeupRemaining <= 0) {
    window.alert('没有可用的补卡机会了')
    return
  }
  if (appState.value.missedDays.length === 0) {
    window.alert('目前没有遗漏的天数需要补签')
    return
  }
  selectedMakeupDay.value = null
  makeupModalVisible.value = true
}

function confirmMakeup() {
  if (!selectedMakeupDay.value) {
    window.alert('请选择要补签的日期')
    return
  }
  const day = Number(selectedMakeupDay.value)
  appState.value.completedDays.push(day)
  appState.value.completedDays.sort((a, b) => a - b)
  const idx = appState.value.missedDays.indexOf(day)
  if (idx > -1) appState.value.missedDays.splice(idx, 1)
  appState.value.makeupUsed++
  appState.value.makeupRemaining--
  makeupModalVisible.value = false
  if (appState.value.completedDays.length === 21) {
    appState.value.currentPage = 'certificate'
    createConfetti()
  }
}

function closeMakeupModalFunc() {
  makeupModalVisible.value = false
}

function resetJourney() {
  if (window.confirm('确定要重新开始吗？当前进度将丢失。')) {
    appState.value.currentPage = 'declaration'
    appState.value.goal = ''
    appState.value.reason = ''
    appState.value.startDate = null
    appState.value.completedDays = []
    appState.value.missedDays = []
    appState.value.makeupUsed = 0
    appState.value.makeupRemaining = 2
    appState.value.reflections = {}
    goalSelectVal.value = ''
    customGoal.value = ''
    reason.value = ''
  }
}

function newJourney() {
  appState.value.currentPage = 'declaration'
}

function shareCertificate() {
  if (navigator.share) {
    navigator
      .share({
        title: '我完成了21天重启人生挑战！',
        text: `我成功坚持了21天，养成了"${appState.value.goal}"的好习惯！`,
        url: window.location.href,
      })
      .catch(() => {})
  } else {
    window.alert('分享功能在当前浏览器中不可用，你可以截图分享你的成就！')
  }
}

function createConfetti() {
  const colors = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c']
  confettiCount.value = 0
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.left = Math.random() * 100 + 'vw'
    confetti.style.top = '-10px'
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`
    confetti.style.width = Math.random() * 10 + 5 + 'px'
    confetti.style.height = Math.random() * 10 + 5 + 'px'
    document.body.appendChild(confetti)
    const animation = confetti.animate(
      [
        { top: '-10px', opacity: 1, transform: `rotate(0deg)` },
        { top: '100vh', opacity: 0, transform: `rotate(${Math.random() * 360}deg)` },
      ],
      { duration: Math.random() * 3000 + 2000, easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)' },
    )
    animation.onfinish = () => confetti.remove()
  }
}

function simulateMissedDays() {
  if (appState.value.completedDays.length > 0 && appState.value.completedDays.length < 21) {
    const randomDay = Math.floor(Math.random() * appState.value.completedDays.length) + 1
    if (
      !appState.value.completedDays.includes(randomDay) &&
      !appState.value.missedDays.includes(randomDay)
    ) {
      appState.value.missedDays.push(randomDay)
    }
  }
}

useIntervalFn(simulateMissedDays, 30000)

onMounted(() => {})
</script>

<style scoped>
.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  background-color: #2ecc71;
  opacity: 0;
  z-index: 1001;
}
</style>
