<template>
  <div
    class="flex flex-col rounded-lg bg-sf-primary-hover/50 px-3 py-2 transition-colors duration-200 hover:bg-sf-primary-hover hover:shadow-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">转换格式</span>
      <ElSwitch v-model="enabled" @change="handleSwitchChange" />
    </div>
    <ElSelect
      v-if="enabled"
      v-model="fmt"
      placeholder="选择转换类型"
      class="w-full"
      @change="handleSelectChange"
    >
      <ElOption v-for="opt in options" :key="opt" :label="opt" :value="opt" />
    </ElSelect>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  originalFormat: { type: String, default: '' },
})
const modelValue = defineModel('modelValue')

const enabled = ref(false)
const formats = ['jpg', 'png', 'webp']
const options = computed(() => formats.filter((f) => f !== props.originalFormat))
const fmt = ref('')

const handleSwitchChange = (isEnabled) => {
  if (isEnabled) {
    fmt.value = options.value[0] || ''
  } else {
    fmt.value = ''
  }
  modelValue.value = fmt.value
}

const handleSelectChange = (selectedValue) => {
  modelValue.value = selectedValue
}
</script>
