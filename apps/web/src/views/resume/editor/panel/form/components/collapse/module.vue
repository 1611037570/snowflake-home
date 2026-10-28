<script setup>
import { useResumeStore } from "@/stores";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { jumpPreview } from "../../../../hooks/useModuleNav";
import { useScrollEditorTo } from "../../../../hooks/useScrollEditorTo";
import eventBus from "@/utils/modules/eventBus";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import Icon from "../icon.vue";
import EditableTitle from "./editableTitle.vue";
import SkillDropdown from "./skillDropdown.vue";
import HonorDropdown from "./honorDropdown.vue";
import HelpCenter from "./helpCenter.vue";
import { $t } from "@/locales";
const { proxy } = getCurrentInstance();

const props = defineProps({
  add: {
    type: Boolean,
    default: true,
  },
  addWhenLayout: {
    type: String, // 指定显示新增入口时模块所需的布局值。
    default: "",
  },
  drag: {
    type: Boolean,
    default: true,
  },
  tip: {
    type: String,
    default: "",
  },
});
const title = defineModel("title", {
  type: String,
  default: "",
});
const { currentForm, addItem } = useFormContext();
const resumeStore = useResumeStore();
// 帮助弹窗独立于模块折叠状态，仅在用户打开时挂载。
const helpVisible = ref(false);
// 仅在配置指定的布局下显示列表新增入口，正文布局保持原有编辑区。
const showAdd = computed(() => {
  if (!props.add) return false;
  if (!props.addWhenLayout) return true;
  return (resumeStore.currentUI?.skill?.layout ?? "proficiency") === props.addWhenLayout;
});
// 仅列表尚无记录时展示引导，新增首条记录后立即收起。
const showEmptyState = computed(
  () => showAdd.value && !resumeStore.currentData?.[currentForm.value?.key]?.list?.length,
);
const emptyModule = computed(() =>
  DEFAULT_MODULE_NAMES.find((module) => module.key === currentForm.value?.key),
);
const emptyStateKey = computed(() => emptyModule.value?.key ?? "custom");
// 展开状态：直接绑定激活项 name 数组（["1"] 展开 / [] 收起），随数据双向绑定
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});

// 隐藏状态：控制模块在简历预览中显示/隐藏
const hidden = defineModel("hidden", {
  type: Boolean,
  default: false,
});

function del() {
  proxy.$confirm($t("deleteModuleConfirm", { name: title.value }), $t("deleteConfirm")).then(() => {
    resumeStore.removeModule(currentForm.value.key);
  });
}

function toggleHidden() {
  resumeStore.setModuleHidden(currentForm.value.key, !hidden.value);
}

// 从编辑模块定位到预览区对应模块
function handlePreviewJump() {
  jumpPreview(currentForm.value.key);
}

// 新增记录追加到列表末尾，同步定位编辑区与预览区
function locateAddedItem(index) {
  if (index == null) return;
  nextTick(() => {
    const moduleKey = currentForm.value?.key;
    useScrollEditorTo(
      document.querySelector(`[data-module-key="${moduleKey}"] [data-item-index="${index}"]`),
    );
    // 选中落到新增的那条记录，而不是整个模块
    eventBus.emit("df-select-module", { key: moduleKey, index });
    // 新增模块记录后定位预览区对应模块
    jumpPreview(moduleKey);
  });
}

function handleAdd() {
  // 新增一条子项：引擎内部深拷贝 itemSchema 后 push，避免多个子项共享同一份引用
  const index = addItem();
  locateAddedItem(index);
}
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false" class="bg-sf-primary!">
    <SfCollapseItem
      name="1"
      lazy
      class="resume-module-box"
    >
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div
            class="flex flex-1 items-center truncate text-base font-bold text-sf-text transition-colors group-hover:text-sf-theme"
          >
            <Icon
              v-if="currentForm.key !== 'user'"
              icon="icon-park-outline:drag"
              class="container-drag cursor-move!"
            />
            <!-- 隐藏模块时为标题添加删除线标识 -->
            <EditableTitle v-model="title" :strike-through="hidden">
              <template v-if="currentForm.key === 'skill'" #actions>
                <SkillDropdown />
              </template>
              <!-- 荣誉证书提供文本描述、标签、笔记风、清单和详情卡片布局。 -->
              <template v-else-if="currentForm.key === 'honor'" #actions>
                <HonorDropdown />
              </template>
            </EditableTitle>
          </div>
          <div class="flex items-center">
            <SfTooltip :content="$t('moduleHelpCenter')">
              <Icon @click.stop="helpVisible = true" icon="mingcute:question-line" />
            </SfTooltip>
            <SfTooltip :content="$t('locatePreview')" v-if="!hidden">
              <Icon @click.stop="handlePreviewJump" icon="mdi:map-search-outline" />
            </SfTooltip>
            <SfTooltip :content="hidden ? $t('show') : $t('hide')">
              <Icon @click.stop="toggleHidden" :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'" />
            </SfTooltip>
            <Icon
              v-if="currentForm.key !== 'user'"
              @click.stop="del"
              icon="ic:round-delete"
              size="4"
            />
          </div>
        </div>
      </template>
      <template #default>
        <div v-if="tip" class="mb-2">{{ tip }}</div>
        <div class="">
          <slot />
          <!-- 空态图标与文案居中排列，不使用背景底板。 -->
          <div
            v-if="showEmptyState"
            class="mx-3 mt-3 flex flex-col items-center gap-3 p-3 pb-0! text-center"
          >
            <SfIcon
              :icon="emptyModule?.icon ?? CUSTOM_MODULE_ICON"
              size="7"
              class="text-sf-text-2"
            />
            <p class="text-sm font-semibold text-sf-text">
              {{ $t(`resumeEmpty_${emptyStateKey}_title`) }}
            </p>
            <p class="text-xs leading-relaxed text-sf-text-2">
              {{ $t(`resumeEmpty_${emptyStateKey}_description`) }}
            </p>
          </div>
          <!-- 添加入口居中排列，悬停显示主题色虚线框，上下留白避免贴合分隔线。 -->
          <div class="px-3 py-3" v-if="showAdd">
            <button
              type="button"
              class="flex-c w-full cursor-pointer gap-3 rounded-3xl border border-dashed border-sf-b py-2 text-xs text-sf-text transition-colors hover:border-sf-theme hover:text-sf-theme"
              @click="handleAdd"
            >
              <SfIcon icon="ic:round-add" size="4" />
              <span>{{ $t("addRecord", { name: title }) }}</span>
            </button>
          </div>
        </div>
      </template>
    </SfCollapseItem>
  </SfCollapse>
  <HelpCenter
    v-if="helpVisible"
    v-model="helpVisible"
    :module-key="currentForm.key"
    :module-title="title"
  />
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 模块外框包裹头部与内容，统一方角边界 */
.resume-module-box {
  @apply overflow-hidden border border-sf-b transition-colors;
}
/* 悬停时只强化边框，不增加背景色。 */
.resume-module-box:hover {
  border-color: var(--color-sf-theme);
}
/* 折叠项经过组件转发，直接命中模块内容节点以清除默认下内边距。 */
:global(.resume-module-box .el-collapse-item__content) {
  padding-bottom: 0 !important;
}
/* 模块内部字段保持紧凑，顶层模块之间仍由表单容器保留 gap-3。 */
.resume-module-box :deep(.el-collapse-item__content .el-row) {
  row-gap: 0.25rem;
}
/* 模块头部背景跟随明暗主题，并覆盖全局透明背景 */
.resume-module-box > :deep(.el-collapse-item__header) {
  @apply px-3;
}

/* 展开时在底边添加分隔线 */
.resume-module-box > :deep(.el-collapse-item__header.is-active) {
  @apply border-b!  border-sf-b!;
}
</style>
