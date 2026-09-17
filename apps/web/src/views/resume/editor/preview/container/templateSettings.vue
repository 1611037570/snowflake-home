<script setup>
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { dateStyleList, defaultDateStyle } from "@/stores/modules/resume/uiConfig";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 通过独立计算属性绑定主题色，避免嵌套修改可写计算属性引发递归更新
const themeColor = computed({
  get: () => currentUI.value?.themeColor || "",
  set: (value) => {
    if (currentUI.value && currentUI.value.themeColor !== value) {
      currentUI.value.themeColor = value;
    }
  },
});

// 一键设计预设：点击整仓套用字体、间距与配色，取值均在 uiParamRanges 范围内
const PRESETS = [
  {
    name: "极简留白",
    desc: "大留白 + 宽松行距，适合内容较少的简历",
    themeColor: "#40a9ff",
    ui: {
      paddingVertical: 48,
      paddingHorizontal: 48,
      fontSize: 15,
      lineHeight: 1.5,
      moduleSpacing: 24,
      themeColor: "#40a9ff",
      userInfoMode: "text",
    },
  },
  {
    name: "紧凑商务",
    desc: "小边距 + 紧凑排版，一页纸友好",
    themeColor: "#ff4d4f",
    ui: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 14,
      lineHeight: 1.15,
      moduleSpacing: 8,
      themeColor: "#ff4d4f",
      userInfoMode: "icon",
    },
  },
];

// 套用预设：合并进当前 UI 配置，保留其它自定义项
const applyPreset = (preset) => {
  currentUI.value = { ...currentUI.value, ...preset.ui };
  ElMessage.success(`已应用「${preset.name}」设计方案`);
};

// 标题图标（关闭/开启）
const titleIcon = computed({
  get: () => currentUI.value?.titleIcon,
  set: (value) => {
    currentUI.value.titleIcon = value;
  },
});

// 日期样式（点号/中文）
const dateStyle = computed({
  get: () => currentUI.value?.dateStyle,
  set: (value) => {
    currentUI.value.dateStyle = value;
  },
});
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    popper-class="sf-theme-color-popper"
  >
    <SfTooltip content="模板设置">
      <SfIcon
        icon="lucide:swatch-book"
        size="5"
        boxSize="7"
        class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
      />
    </SfTooltip>
    <template #dropdown>
      <div class="flex w-[240px] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="text-xs font-bold text-sf-text">主题配色</div>
        <ThemeColorPicker v-model="themeColor" :teleported="false" />

        <div class="text-xs font-bold text-sf-text">一键设计</div>
        <div
          v-for="preset in PRESETS"
          :key="preset.name"
          class="flex cursor-pointer items-center gap-3 rounded-2xl border border-sf-b p-3 transition-colors hover:border-sf-theme hover:bg-sf-theme-3"
          @click="applyPreset(preset)"
        >
          <span
            class="h-4 w-4 shrink-0 rounded-full"
            :style="{ backgroundColor: preset.themeColor }"
          ></span>
          <div class="flex min-w-0 flex-col">
            <span class="text-sm text-sf-text">{{ preset.name }}</span>
            <span class="text-xs text-sf-text-2">{{ preset.desc }}</span>
          </div>
        </div>

        <div class="text-xs font-bold text-sf-text">细节调整</div>
        <!-- 标题图标开关：仅在模块标题前展示/隐藏图标 -->
        <div class="flex items-center justify-between text-sm text-sf-text-2">
          <span>标题图标</span>
          <ElSwitch v-model="titleIcon" />
        </div>
        <!-- 日期样式切换：点号 / 中文 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>日期样式</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="dateStyle = defaultDateStyle"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="mode in dateStyleList"
              :key="mode.value"
              class="flex-1"
              size="small"
              border
              @click="dateStyle = mode.value"
              :type="dateStyle === mode.value ? 'theme' : 'bg'"
              >{{ mode.name }}</SfButton
            >
          </div>
        </div>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss">
/* 取色器面板内联渲染在下拉弹层内，取消滚动容器裁剪，避免面板被弹层裁掉 */
.sf-theme-color-popper .el-scrollbar,
.sf-theme-color-popper .el-scrollbar__wrap {
  overflow: visible;
}
</style>
