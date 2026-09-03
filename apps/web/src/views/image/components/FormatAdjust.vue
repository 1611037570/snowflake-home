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
      <SfSelect v-model="format" :placeholder="$t('image.formatSelectPlaceholder')" class="w-full">
        <ElOption v-for="opt in formats" :key="opt" :label="opt" :value="opt" />
      </SfSelect>
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
      <SfSelect
        v-model="quality"
        :list="qualityOptions"
        :placeholder="$t('image.qualitySelectPlaceholder')"
        class="w-full"
      >
      </SfSelect>
    </div>
  </div>
</template>

<script setup>
import Title from "./title.vue";
const props = defineProps({
  defaultFormat: { type: String, default: "" },
  defaultQuality: { type: Number, default: 1 },
});

// 使用 defineModel 创建双向绑定的质量值
const quality = defineModel("quality", { default: 1 });
const format = defineModel("format", { default: "" });

// 重置到默认质量值
function resetQuality() {
  quality.value = props.defaultQuality;
}
function resetFormat() {
  format.value = props.defaultFormat;
}

// 质量选项配置
const qualityOptions = [
  { name: $t("image.quality.lossless"), value: 1 },
  { name: $t("image.quality.high"), value: 0.8 },
  { name: $t("image.quality.medium"), value: 0.6 },
  { name: $t("image.quality.low"), value: 0.4 },
  { name: $t("image.quality.veryLow"), value: 0.2 },
];

// 支持的图片格式列表
const formats = ["jpg", "png", "webp"];
</script>
