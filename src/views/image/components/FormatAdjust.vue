<template>
  <Title :name="$t('image.adjust')" />
  <div class="mb-3 flex gap-3 text-[14px]">
    <div class="flex flex-1 flex-col">
      <div class="mb-1 flex items-center">
        转换格式
        <SfIcon
          icon="material-symbols:restart-alt"
          size="4"
          class="hover:text-sf-theme"
          @click.stop="resetFormat"
        />
      </div>
      <ElSelect v-model="format" :placeholder="$t('image.formatSelectPlaceholder')" class="w-full">
        <ElOption v-for="opt in formats" :key="opt" :label="opt" :value="opt" />
      </ElSelect>
    </div>
    <div class="flex flex-1 flex-col">
      <div class="mb-1 flex items-center">
        调整质量
        <SfIcon
          icon="material-symbols:restart-alt"
          size="4"
          class="hover:text-sf-theme"
          @click.stop="resetQuality"
        />
      </div>
      <ElSelect
        v-model="quality"
        :placeholder="$t('image.qualitySelectPlaceholder')"
        class="w-full"
      >
        <ElOption
          v-for="opt in qualityOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </ElSelect>
    </div>
  </div>
</template>

<script setup>
import Title from './title.vue'
const props = defineProps({
  defaultFormat: { type: String, default: '' },
  defaultQuality: { type: Number, default: 1 },
})

// 使用 defineModel 创建双向绑定的质量值
const quality = defineModel('quality', { default: 1 })
const format = defineModel('format', { default: '' })

// 重置到默认质量值
function resetQuality() {
  quality.value = props.defaultQuality
}
function resetFormat() {
  format.value = props.defaultFormat
}

// 质量选项配置
const qualityOptions = [
  { label: $t('image.quality.lossless'), value: 1 },
  { label: $t('image.quality.high'), value: 0.8 },
  { label: $t('image.quality.medium'), value: 0.6 },
  { label: $t('image.quality.low'), value: 0.4 },
  { label: $t('image.quality.veryLow'), value: 0.2 },
]

// 支持的图片格式列表
const formats = ['jpg', 'png', 'webp']
</script>
