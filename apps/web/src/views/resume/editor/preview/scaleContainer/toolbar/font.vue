<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import {
  defaultTextAlign,
  defaultFontFamily,
  defaultFontSize,
  defaultTitleFontSize,
  fontFamilyList,
  textAlignList,
  uiParamRanges,
} from "@/stores/modules/resume/config/uiConfig";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import { loadFont } from "@/utils";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 字体类数值参数：标签、绑定字段与默认值集中维护，模板统一渲染
const fontParams = computed(() => {
  i18n.global.locale.value;
  return [
    { label: $t("fontSize"), key: "font.size", defaultValue: defaultFontSize },
    { label: $t("moduleTitleFontSize"), key: "font.titleSize", defaultValue: defaultTitleFontSize },
  ];
});

const localizedFontFamilyList = computed(() => {
  i18n.global.locale.value;
  return localizeResumeEditorOptionList(fontFamilyList);
});

const localizedTextAlignList = computed(() => {
  i18n.global.locale.value;
  return localizeResumeEditorOptionList(textAlignList);
});

// 字体类型绑定到当前简历配置。
const fontFamily = computed({
  get: () => currentUI.value?.font?.family,
  set: (value) => {
    currentUI.value.font.family = value;
  },
});

// 字体切换复用预览区的加载任务，只展示最后一次选择的加载结果。
const fontLoadStatus = ref("idle");
let fontLoadRequest = 0;
watch(fontFamily, async (family) => {
  const request = ++fontLoadRequest;
  fontLoadStatus.value = "loading";
  try {
    await loadFont(family);
    if (request === fontLoadRequest) fontLoadStatus.value = "success";
  } catch {
    if (request === fontLoadRequest) fontLoadStatus.value = "error";
  }
});

// 文本对齐属于正文排版，与字体配置放在同一入口
const textAlign = computed({
  get: () => currentUI.value?.content?.textAlign,
  set: (value) => {
    currentUI.value.content.textAlign = value;
  },
});

// 读取数值型参数：统一转为数值，缺失时回退默认值，避免出现 NaN
const getNumberValue = (key, defaultValue) => {
  const value = Number(currentUI.value?.[key.split(".")[0]]?.[key.split(".")[1]]);
  return Number.isFinite(value) ? value : defaultValue;
};

// 写入数值型参数
const setParam = (key, value) => {
  if (!currentUI.value) return;
  const [group, field] = key.split(".");
  currentUI.value[group][field] = Number(value);
};
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:type" size="5" />
      <span>{{ $t("textStyle") }}</span>
      <SfIcon
        v-if="fontLoadStatus === 'loading'"
        icon="line-md:loading-twotone-loop"
        size="4"
        :aria-label="$t('fontLoading')"
      />
      <SfIcon
        v-else-if="fontLoadStatus === 'success'"
        icon="lucide:check"
        size="4"
        :aria-label="$t('fontLoadSuccess')"
      />
      <SfIcon
        v-else-if="fontLoadStatus === 'error'"
        icon="lucide:circle-alert"
        size="4"
        class="text-red-500"
        :aria-label="$t('fontLoadFailed')"
      />
    </span>
    <template #dropdown>
      <div
        class="flex w-[240px] flex-col gap-3 overflow-hidden rounded-3xl border border-sf-b bg-sf-primary p-3"
      >
        <!-- 字体类型选择 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ $t("fontTypes") }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="fontFamily = defaultFontFamily"
            />
          </div>
          <SfSelect v-model="fontFamily" :list="localizedFontFamilyList" />
          <div
            v-if="fontLoadStatus !== 'idle'"
            class="flex items-center gap-1 text-xs"
            :class="fontLoadStatus === 'error' ? 'text-red-500' : 'text-sf-text-2'"
            role="status"
            aria-live="polite"
          >
            <SfIcon
              :icon="fontLoadStatus === 'loading'
                ? 'line-md:loading-twotone-loop'
                : fontLoadStatus === 'success'
                  ? 'lucide:check'
                  : 'lucide:circle-alert'"
              size="4"
            />
            <span>{{ $t(fontLoadStatus === 'loading'
              ? 'fontLoading'
              : fontLoadStatus === 'success'
                ? 'fontLoadSuccess'
                : 'fontLoadFailed') }}</span>
          </div>
        </div>

        <div v-for="item in fontParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between text-sm text-sf-text-2">
            <span class="flex items-center gap-1">
              <span>{{ item.label }}</span>
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="setParam(item.key, item.defaultValue)"
              />
            </span>
            <span>{{ getNumberValue(item.key, item.defaultValue) }}px</span>
          </div>
          <SfSlider
            :model-value="getNumberValue(item.key, item.defaultValue)"
            @update:model-value="(value) => setParam(item.key, value)"
            :min="uiParamRanges[item.key].min"
            :max="uiParamRanges[item.key].max"
            :step="uiParamRanges[item.key].step"
            size="small"
          />
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ $t("textAlign") }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="textAlign = defaultTextAlign"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in localizedTextAlignList"
              :key="option.value"
              class="flex-1"
              size="small"
              border
              @click="textAlign = option.value"
              :type="textAlign === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
