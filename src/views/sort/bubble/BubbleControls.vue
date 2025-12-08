<template>
  <div class="mb-4 flex flex-wrap justify-center gap-3">
    <button
      @click="actions.nextStep"
      :disabled="status.isCompleted || status.isAnimating"
      class="flex items-center gap-2 rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-yellow-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      <i class="fas fa-step-forward"></i>
      下一步
    </button>

    <button
      @click="actions.reset"
      :disabled="status.isAnimating"
      class="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      <i class="fas fa-redo"></i>
      重置
    </button>
  </div>
</template>

<script setup>
defineProps({
  status: {
    type: Object,
    required: true,
  },
  actions: {
    type: Object,
    required: true,
  },
})
</script>
