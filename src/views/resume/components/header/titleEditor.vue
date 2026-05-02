<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editTitle = ref(false)
const tempTitle = ref(props.modelValue)

function handleEditTitle() {
  editTitle.value = !editTitle.value
  emit('update:modelValue', tempTitle.value)
}

function openModal() {
  tempTitle.value = props.modelValue
  editTitle.value = true
}

defineExpose({
  openModal,
})
</script>

<template>
  <SfModal v-model="editTitle" title="重命名简历">
    <div class="flex w-100 max-w-full flex-col gap-5 p-4">
      <SfInput
        v-model="tempTitle"
        placeholder="请输入标题"
        class="w-full rounded-lg border border-sf-border bg-sf-bg px-3 py-2"
      />
      <ElButton type="primary" @click="handleEditTitle" class="w-full">确定</ElButton>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
