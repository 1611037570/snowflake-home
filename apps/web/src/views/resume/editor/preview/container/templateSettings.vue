<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  avatarPositionList,
  datePositionList,
  dateStyleList,
  defaultAvatarPosition,
  defaultDatePosition,
  defaultDateStyle,
  defaultInfoSeparator,
  defaultInfoPosition,
  defaultLinkUnderline,
  defaultTitleIconMode,
  defaultUserInfoLayout,
  defaultUserInfoMode,
  infoPositionList,
  infoSeparatorList,
  titleIconModeList,
  userInfoLayoutList,
  userInfoModeList,
} from "@/stores/modules/resume/uiConfig";
import ThemeColorPicker from "@/components/business/themeColorPicker/themeColorPicker.vue";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 个人信息属于简历视觉设计，与模板和模块样式统一管理
const userInfoParams = [
  { label: "联系方式显示", key: "userInfoMode", defaultValue: defaultUserInfoMode, list: userInfoModeList },
  { label: "联系方式布局", key: "userInfoLayout", defaultValue: defaultUserInfoLayout, list: userInfoLayoutList },
  { label: "头像位置", key: "avatarPosition", defaultValue: defaultAvatarPosition, list: avatarPositionList },
  { label: "信息对齐", key: "infoPosition", defaultValue: defaultInfoPosition, list: infoPositionList },
];

// 通过独立计算属性绑定主题色，避免嵌套修改可写计算属性引发递归更新
const themeColor = computed({
  get: () => currentUI.value?.themeColor || "",
  set: (value) => {
    if (currentUI.value && currentUI.value.themeColor !== value) {
      currentUI.value.themeColor = value;
    }
  },
});

// 模块标题图标模式
const titleIconMode = computed({
  get: () => currentUI.value?.titleIconMode,
  set: (value) => {
    currentUI.value.titleIconMode = value;
  },
});

// 链接下划线开关
const linkUnderline = computed({
  get: () => currentUI.value?.linkUnderline ?? defaultLinkUnderline,
  set: (value) => {
    currentUI.value.linkUnderline = value;
  },
});

// 经历排版属于简历视觉设计，与个人信息统一管理
const datePosition = computed({
  get: () => currentUI.value?.datePosition,
  set: (value) => {
    currentUI.value.datePosition = value;
  },
});

const dateStyle = computed({
  get: () => currentUI.value?.dateStyle,
  set: (value) => {
    currentUI.value.dateStyle = value;
  },
});

const infoSeparator = computed({
  get: () => currentUI.value?.infoSeparator ?? defaultInfoSeparator,
  set: (value) => {
    currentUI.value.infoSeparator = value;
  },
});

const getValue = (key) => currentUI.value?.[key];

const setParam = (key, value) => {
  if (!currentUI.value) return;
  currentUI.value[key] = value;
};
</script>

<template>
  <SfDropdown
    v-if="currentUI"
    trigger="click"
    placement="bottom-start"
    :show-arrow="false"
    popper-class="sf-theme-color-popper"
  >
    <span
      class="flex cursor-pointer items-center gap-1 rounded-full px-1.5 py-1 text-sm text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    >
      <SfIcon icon="lucide:swatch-book" size="5" />
      <span>设计</span>
    </span>
    <template #dropdown>
      <div class="flex w-[240px] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="text-xs font-bold text-sf-text">主题配色</div>
        <ThemeColorPicker v-model="themeColor" :teleported="false" />

        <div class="text-xs font-bold text-sf-text">细节调整</div>
        <!-- 模块标题图标模式 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>标题图标</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="titleIconMode = defaultTitleIconMode"
            />
          </div>
          <SfSelect v-model="titleIconMode" :list="titleIconModeList" />
        </div>
        <!-- 链接下划线开关：统一控制预览中的可点击链接样式 -->
        <div class="flex items-center justify-between text-sm text-sf-text-2">
          <span>链接下划线</span>
          <ElSwitch v-model="linkUnderline" />
        </div>

        <div class="text-xs font-bold text-sf-text">个人信息</div>
        <div v-for="item in userInfoParams" :key="item.key" class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>{{ item.label }}</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="setParam(item.key, item.defaultValue)"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in item.list"
              :key="option.value"
              class="flex-1"
              size="small"
              border
              @click="setParam(item.key, option.value)"
              :type="getValue(item.key) === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>

        <div class="text-xs font-bold text-sf-text">经历排版</div>
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>时间位置</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="datePosition = defaultDatePosition"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in datePositionList"
              :key="option.value"
              class="flex-1"
              size="small"
              border
              @click="datePosition = option.value"
              :type="datePosition === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>时间格式</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="dateStyle = defaultDateStyle"
            />
          </div>
          <div class="flex gap-3">
            <SfButton
              v-for="option in dateStyleList"
              :key="option.value"
              class="flex-1"
              size="small"
              border
              @click="dateStyle = option.value"
              :type="dateStyle === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
            >
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>信息分隔</span>
            <SfIcon
              icon="material-symbols:restart-alt"
              size="4"
              class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
              @click="infoSeparator = defaultInfoSeparator"
            />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <SfButton
              v-for="option in infoSeparatorList"
              :key="option.value"
              size="small"
              border
              @click="infoSeparator = option.value"
              :type="infoSeparator === option.value ? 'theme' : 'bg'"
              >{{ option.name }}</SfButton
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
