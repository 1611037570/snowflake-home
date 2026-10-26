<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import { fontFamilyList } from "@/domain/resume/theme/uiConfig";
import { localizeResumeEditorOptionList } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import { loadFont } from "@/utils";
import SettingPill from "./settingPill.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const dropdownVisible = ref(false); // 下拉展开时保持入口高亮
const fontLoadStatus = ref("idle"); // 字体加载状态：idle / loading / success / error
// 分组列表自行渲染选项，选中后主动收起宿主下拉
const dropdownRef = ref(null);

// 字体清单的语种分组顺序，与 fontFamilyList 的 group 字段一一对应
const FONT_GROUP_LIST = [
  { key: "chinese", labelKey: "fontGroupChinese" },
  { key: "latin", labelKey: "fontGroupLatin" },
];

const fontFamily = computed({
  get: () => currentUI.value?.font?.family,
  set: (value) => {
    currentUI.value.font.family = value;
  },
});

// 复用字体加载器里的同一份任务，只展示最后一次选择的加载结果
let fontLoadRequest = 0;
watch(fontFamily, async (family) => {
  const request = ++fontLoadRequest;
  fontLoadStatus.value = "loading";
  try {
    await loadFont(family);
    if (request === fontLoadRequest) fontLoadStatus.value = "success";
  } catch {
    // 加载失败时退回箭头并显示失败提示，字体由预览侧回退到系统字体
    if (request === fontLoadRequest) fontLoadStatus.value = "error";
  }
});

// 字体清单随语言重新生成，供分组与入口名称共用
const fontOptions = computed(() => {
  i18n.global.locale.value;
  return localizeResumeEditorOptionList(fontFamilyList);
});

// 按语种分组：仅英文字体单独成节，避免中文简历选到只有拉丁字形的字体
const fontGroups = computed(() =>
  FONT_GROUP_LIST.map((group) => ({
    key: group.key,
    label: $t(group.labelKey),
    list: fontOptions.value.filter((item) => item.group === group.key),
  })).filter((group) => group.list.length),
);

// 入口直接给出当前字体名，不必展开后再确认
const currentName = computed(
  () => fontOptions.value.find((item) => item.value === fontFamily.value)?.name ?? "",
);

const selectFont = (item) => {
  fontFamily.value = item.value;
  dropdownRef.value?.handleClose?.();
};
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    ref="dropdownRef"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    @visible-change="dropdownVisible = $event"
  >
    <SettingPill
      :label="$t('toolbarFontFamily')"
      :value="currentName"
      :active="dropdownVisible"
      :status="fontLoadStatus"
    />
    <template #dropdown>
      <!-- 字体按语种分节展示，节标题与选项行共用同一套留白 -->
      <div class="w-44 rounded-3xl border border-sf-b bg-sf-primary p-1.5">
        <template v-for="group in fontGroups" :key="group.key">
          <p class="px-3 pt-2 pb-1 text-[11px] leading-none text-sf-text-3">{{ group.label }}</p>
          <button
            v-for="item in group.list"
            :key="item.value"
            type="button"
            class="flex h-8 w-full cursor-pointer items-center justify-between rounded-3xl px-3 text-[13px] transition-colors"
            :class="
              item.value === fontFamily
                ? 'text-sf-theme'
                : 'text-sf-base hover:bg-sf-theme-2 hover:text-sf-theme-text'
            "
            :aria-pressed="item.value === fontFamily"
            @click="selectFont(item)"
          >
            <span>{{ item.name }}</span>
            <SfIcon v-if="item.value === fontFamily" icon="lucide:check" size="4" />
          </button>
        </template>
      </div>
    </template>
  </SfDropdown>
</template>
