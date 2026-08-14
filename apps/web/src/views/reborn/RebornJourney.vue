<template>
  <div class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
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
        <div :class="['flex-1 text-center', currentPhase >= 1 ? 'text-[#2ecc71]' : '']">
          破晓之章
        </div>
        <div :class="['flex-1 text-center', currentPhase >= 2 ? 'text-[#2ecc71]' : '']">
          历练之章
        </div>
        <div :class="['flex-1 text-center', currentPhase >= 3 ? 'text-[#2ecc71]' : '']">
          重生之章
        </div>
      </div>
    </div>
    <div class="my-6 grid grid-cols-3 gap-4">
      <RebornStatCard :value="currentStreak" label="当前连续" />
      <RebornStatCard :value="`${completionRate}%`" label="完成率" />
      <RebornStatCard :value="daysRemaining" label="剩余天数" />
    </div>
    <div
      v-if="showMakeup"
      class="my-5 rounded-xl border-l-4 border-[#f1c40f] bg-gradient-to-br from-[#fff9e6] to-[#fff0cc] p-4 text-center"
    >
      <h3 class="mb-2 text-[#f39c12]"><SfIcon icon="fa6-solid:history" /> 补卡机会</h3>
      <p>
        你还有 <span>{{ appState.makeupRemaining }}</span> 次补卡机会，可以用于补签遗漏的天数
      </p>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
        @click="$emit('openMakeupModal')"
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
        @click="$emit('clickDay', day)"
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
        :value="dailyReflection"
        @input="(e) => $emit('update:dailyReflection', e.target.value)"
        placeholder="今天完成目标的感觉如何？遇到了什么挑战？"
        class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
      ></textarea>
    </div>
    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2ecc71] px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#27ae60]"
        @click="$emit('completeDay')"
      >
        <SfIcon icon="fa6-solid:check-circle" /> 完成今日目标
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-3 font-semibold text-[#333] shadow transition hover:bg-gray-200"
        @click="$emit('resetJourney')"
      >
        <SfIcon icon="fa6-solid:redo" /> 重新开始
      </button>
    </div>
  </div>
</template>

<script setup>
import RebornStatCard from "./RebornStatCard.vue";
defineProps({
  appState: Object,
  progressPercent: Number,
  progressText: String,
  currentPhase: Number,
  currentStreak: Number,
  completionRate: Number,
  daysRemaining: Number,
  showMakeup: Boolean,
  dailyMotivationText: String,
  dailyReflection: String,
});
defineEmits([
  "openMakeupModal",
  "clickDay",
  "completeDay",
  "resetJourney",
  "update:dailyReflection",
]);
</script>
