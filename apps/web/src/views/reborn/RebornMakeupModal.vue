<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50"
    @click.self="$emit('update:visible', false)"
  >
    <div class="relative w-[90%] max-w-[500px] rounded-2xl bg-white p-8 shadow-xl">
      <button
        class="absolute top-4 right-4 cursor-pointer border-0 bg-transparent text-xl text-gray-500"
        @click="$emit('update:visible', false)"
      >
        &times;
      </button>
      <h2><SfIcon icon="fa6-solid:history" /> 使用补卡</h2>
      <p>选择你想要补签的日期：</p>
      <div class="my-8 grid grid-cols-7 gap-2">
        <div
          v-for="day in missedDays"
          :key="'miss-' + day"
          :class="[
            'relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl bg-[#ff9f9f] font-bold text-white transition',
            selectedMakeupDay === day ? 'ring-4 ring-[#9b59b6]' : '',
          ]"
          @click="$emit('update:selectedMakeupDay', day)"
        >
          <div class="text-[1.2rem]">{{ day }}</div>
        </div>
      </div>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-[#9b59b6] px-6 py-3 font-semibold text-white shadow transition hover:bg-[#8e44ad]"
          @click="$emit('confirm')"
        >
          确认补卡
        </button>
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 px-6 py-3 font-semibold text-[#333] shadow transition hover:bg-gray-200"
          @click="$emit('update:visible', false)"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ visible: Boolean, missedDays: Array, selectedMakeupDay: [Number, null] });
defineEmits(["update:visible", "update:selectedMakeupDay", "confirm"]);
</script>
