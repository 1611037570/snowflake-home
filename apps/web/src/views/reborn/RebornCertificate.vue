<template>
  <div class="relative mb-8 overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
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
      <RebornStatCard :value="longestStreak" label="最长连续" />
      <RebornStatCard :value="'100%'" label="完成率" />
      <RebornStatCard :value="appState.makeupUsed" label="补卡使用" />
    </div>
    <div class="my-5 text-center text-[1.1rem] text-gray-500 italic">
      <p>"我们重复做的事情造就了我们。优秀不是一种行为，而是一种习惯。" - 亚里士多德</p>
    </div>
    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-[#2ecc71] px-6 py-3 font-semibold text-white shadow transition hover:-translate-y-0.5 hover:bg-[#27ae60]"
        @click="$emit('newJourney')"
      >
        <SfIcon icon="fa6-solid:rocket" /> 开启新的21天挑战
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
        @click="$emit('shareCertificate')"
      >
        <SfIcon icon="fa6-solid:share-alt" /> 分享成就
      </button>
    </div>
  </div>
</template>

<script setup>
import RebornStatCard from './RebornStatCard.vue'
defineProps({ appState: Object, completionDateText: String, longestStreak: Number })
defineEmits(['newJourney', 'shareCertificate'])
</script>
