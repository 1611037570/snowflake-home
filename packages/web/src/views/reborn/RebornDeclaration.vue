<template>
  <div class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
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
        :value="goalSelectVal"
        @change="(e) => $emit('update:goalSelectVal', e.target.value)"
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
        :value="customGoal"
        @input="(e) => $emit('update:customGoal', e.target.value)"
        placeholder="例如：每天写500字..."
        class="w-full rounded-lg border border-gray-200 p-3 text-base focus:border-[#2ecc71] focus:ring-2 focus:ring-[#2ecc71] focus:outline-none"
      ></textarea>
    </div>
    <div class="mb-5">
      <label class="mb-2 block font-semibold text-[#333]"
        ><SfIcon icon="fa6-solid:fire" /> 为什么想要实现这个目标？</label
      >
      <textarea
        :value="reason"
        @input="(e) => $emit('update:reason', e.target.value)"
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
        @click="$emit('start')"
      >
        <SfIcon icon="fa6-solid:signature" /> 签署重启协议，立即开始
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  goalSelectVal: String,
  isCustomGoal: Boolean,
  customGoal: String,
  reason: String,
})
defineEmits(['update:goalSelectVal', 'update:customGoal', 'update:reason', 'start'])
</script>
