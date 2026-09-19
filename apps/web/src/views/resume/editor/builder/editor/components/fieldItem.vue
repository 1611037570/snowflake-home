<script setup lang="ts">
import Icon from "../icon.vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import {
  isUserCustomFieldKey,
  removeUserCustomField,
  renameUserCustomField,
} from "@/stores/modules/resume/hooks/useUserCustomField";
import {
  getUserSubtitleKeys,
  hasUserFieldContent,
  isUserSubtitleCapable,
  markUserSubtitle,
  unmarkUserSubtitle,
  MAX_USER_SUBTITLE,
} from "@/stores/modules/resume/hooks/useUserSubtitle";
import { storeToRefs } from "pinia";
// 包裹组的模型绑定只用于状态透传，不落成根元素属性
defineOptions({ inheritAttrs: false });
// 字段包裹组件：定制水平布局的标签与操作区，字段内容通过插槽嵌套
const {
  label,
  tip,
  removable = false,
  draggable = false,
  displayOptions,
} = defineProps<{
  label?: string;
  tip?: string;
  removable?: boolean;
  draggable?: boolean;
  // 展示形态选项：声明后渲染分段切换
  displayOptions?: { label: string; value: string }[];
}>();
const { currentForm, hasFieldData, removeField } = useFormContext();
// 隐藏开关：绑定被包裹字段的隐藏路径，未声明绑定时不渲染开关
const hidden = defineModel<boolean | undefined>("hidden");
// 字段图标：绑定被包裹字段的图标路径，未声明绑定时不渲染图标选择
const icon = defineModel<string | undefined>("icon");
// 展示形态：绑定被包裹字段的展示路径，未声明绑定时不渲染分段切换
const display = defineModel<string | undefined>("display");
// 分段切换项：字段标签对应配置声明的展示形态
const displayList = computed(() =>
  (displayOptions ?? []).map((option) => ({ name: option.label, value: option.value })),
);
// 被包裹的字段：数据绑定与渲染条件以字段自身配置为准
const field = computed(() => currentForm.value?.fields?.[0]);
// 字段标识：包裹组与内层字段共用同一标识
const fieldKey = computed(() => field.value?.key);
// 自定义字段：与预设字段共用包裹与操作，仅重命名与删除语义不同
const isCustomField = computed(() => isUserCustomFieldKey(fieldKey.value));
// 可添加字段：数据存在才渲染，与编辑器的添加逻辑保持一致
const renderable = computed(() => !field.value?.addable || hasFieldData(field.value));
// 简历运行时配置与数据：副标题标记、自定义字段的重命名与删除都落在配置与数据上
const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);
// 当前字段是否已置顶：以顺序数组为唯一判据
const isSubtitle = computed(() =>
  getUserSubtitleKeys(currentData.value?.user?.ui).includes(fieldKey.value ?? ""),
);
// 字段属于「更多」体系时支持置顶到姓名下方
const subtitleCapable = computed(() => isUserSubtitleCapable(runtimeConfig.value, fieldKey.value));
// 已标记的副标题数量：上限按标记个数判断，与序号是否连续无关
const subtitleCount = computed(() => getUserSubtitleKeys(currentData.value?.user?.ui).length);
// 副标题已达上限且当前字段未标记
const subtitleFull = computed(() => !isSubtitle.value && subtitleCount.value >= MAX_USER_SUBTITLE);
// 副标题按钮提示：区分取消、已达上限、内容为空与可标记
const subtitleTip = computed(() => {
  if (isSubtitle.value) return "取消副标题";
  if (subtitleFull.value) return `最多标记 ${MAX_USER_SUBTITLE} 个副标题`;
  if (!hasUserFieldContent(currentData.value, fieldKey.value)) return "填写内容后可置顶";
  return "标记为副标题";
});
// 重命名弹窗与临时标题
const showRenameModal = ref(false);
const fieldLabel = ref("");
// 打开重命名弹窗：以当前标题回填
const openRenameModal = () => {
  fieldLabel.value = label || "";
  showRenameModal.value = true;
};
// 保存标题：仅自定义字段的标题会被持久化
const handleRename = () => {
  const value = fieldLabel.value.trim();
  if (!value || !runtimeConfig.value || !fieldKey.value) return;
  renameUserCustomField(runtimeConfig.value, fieldKey.value, value);
  showRenameModal.value = false;
};
// 切换隐藏状态：写回字段的隐藏路径
const toggleHidden = () => (hidden.value = !hidden.value);
// 更新图标：写回字段的图标路径
const updateIcon = (value: string) => (icon.value = value);
// 切换副标题：标记后字段移入副标题分区，取消后回到更多分区末尾
const toggleSubtitle = () => {
  if (!runtimeConfig.value || !currentData.value || !fieldKey.value) return;
  if (isSubtitle.value) {
    unmarkUserSubtitle(runtimeConfig.value, currentData.value, fieldKey.value);
    return;
  }
  if (subtitleFull.value) return;
  markUserSubtitle(runtimeConfig.value, currentData.value, fieldKey.value);
};
// 删除：自定义字段彻底移除，预设字段只清空数据以便重新添加
const clearField = () => {
  if (!runtimeConfig.value || !currentData.value || !fieldKey.value) return;
  // 先取消副标题标记，字段回到更多分区后再按各自语义移除
  if (isSubtitle.value) {
    unmarkUserSubtitle(runtimeConfig.value, currentData.value, fieldKey.value);
  }
  if (!isCustomField.value) {
    removeField(field.value);
    return;
  }
  removeUserCustomField(runtimeConfig.value, currentData.value, fieldKey.value);
};
</script>

<template>
  <div v-if="renderable" class="flex w-full flex-col gap-3">
    <div class="flex w-full items-center gap-1">
      <div v-if="label" class="flex shrink-0 items-center" @click.stop.prevent="">
        <Icon v-if="draggable" icon="icon-park-outline:drag" class="item-drag cursor-move!" />
        <SfIconPicker
          v-if="icon !== undefined"
          :modelValue="icon"
          @update:modelValue="updateIcon"
          :size="4"
          class="mr-1"
        />
        <span class="truncate pr-1 text-[15px] text-sf-text">
          {{ label }}
        </span>
        <sf-tooltip :content="tip" v-if="tip" class="text-sf-text" />
      </div>
      <div class="min-w-0 flex-1">
        <slot />
      </div>
      <!-- 操作区固定在右侧，避免字段宽度变化导致按钮位移 -->
      <div
        v-if="hidden !== undefined || removable || subtitleCapable"
        class="flex shrink-0 items-center"
      >
        <!-- 重命名仅对自定义字段开放：预设字段标题来自模板配置，不会持久化 -->
        <Icon
          v-if="isCustomField"
          @pointerdown.stop.prevent
          @click="openRenameModal"
          icon="lucide:pencil"
        />
        <SfTooltip :content="subtitleTip">
          <Icon
            v-if="subtitleCapable"
            @pointerdown.stop.prevent
            @click="toggleSubtitle"
            icon="lucide:heading-2"
            :class="[isSubtitle ? 'text-sf-theme' : '', subtitleFull ? 'opacity-50' : '']"
          />
        </SfTooltip>
        <SfTooltip :content="hidden ? '显示' : '隐藏'">
          <Icon
            v-if="hidden !== undefined"
            @pointerdown.stop.prevent
            @click="toggleHidden"
            :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
          />
        </SfTooltip>

        <Icon
          v-if="removable"
          @pointerdown.stop.prevent
          @click="clearField"
          icon="ic:round-delete"
        />
      </div>
    </div>
    <!-- 展示形态切换：仅声明了展示选项的字段渲染 -->
    <div v-if="displayOptions?.length" class="w-40">
      <SfTab v-model="display" :list="displayList" class="h-8!" />
    </div>
  </div>
  <!-- 重命名弹窗：仅自定义字段需要 -->
  <SfModal v-if="isCustomField" v-model="showRenameModal" title="修改字段名称">
    <form class="flex w-80 flex-col gap-3 p-3" @submit.prevent="handleRename">
      <SfInput v-model="fieldLabel" placeholder="请输入字段名称" />
      <footer class="flex justify-end gap-3">
        <el-button @click="showRenameModal = false">取消</el-button>
        <el-button type="primary" :disabled="!fieldLabel.trim()" @click="handleRename"
          >保存</el-button
        >
      </footer>
    </form>
  </SfModal>
</template>

<style lang="scss" scoped></style>
