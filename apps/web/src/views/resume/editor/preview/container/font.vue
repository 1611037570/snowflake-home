<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  defaultFontFamily,
  defaultFontSize,
  defaultTitleFontSize,
  fontFamilyList,
  uiParamRanges,
} from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 字体类数值参数：标签、绑定字段与默认值集中维护，模板统一渲染
const fontParams = [
  { label: "字体大小", key: "fontSize", defaultValue: defaultFontSize },
  { label: "模块标题字号", key: "titleFontSize", defaultValue: defaultTitleFontSize },
];

// 字体类型（阿里普惠体 / 汉仪易烊千玺体 / 跟随系统）
const fontFamily = computed({
  get: () => currentUI.value?.fontFamily,
  set: (value) => {
    currentUI.value.fontFamily = value;
  },
});

// 读取数值型参数：统一转为数值，避免字符串参与滑块内部计算
const getNumberValue = (key) => Number(currentUI.value?.[key]);

// 写入数值型参数
const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = Number(value);
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="字体设置">
      <SfIcon
        icon="lucide:type"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <div
        class="flex w-[240px] flex-col gap-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <!-- 字体类型选择 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>字体类型</span>
            <SfTooltip content="恢复默认值">
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="fontFamily = defaultFontFamily"
              />
            </SfTooltip>
          </div>
          <SfSelect v-model="fontFamily" :list="fontFamilyList" />
        </div>

        <div v-for="item in fontParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ item.label }}</span>
              <SfTooltip content="恢复默认值">
                <SfIcon
                  icon="material-symbols:restart-alt"
                  size="4"
                  class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                  @click="setParam(item.key, item.defaultValue)"
                />
              </SfTooltip>
            </span>
            <span>{{ getNumberValue(item.key) }}px</span>
          </div>
          <SfSlider
            :model-value="getNumberValue(item.key)"
            @update:model-value="(value) => setParam(item.key, value)"
            :min="uiParamRanges[item.key].min"
            :max="uiParamRanges[item.key].max"
            :step="uiParamRanges[item.key].step"
            size="small"
          />
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
