<script setup>
import { useResumeStore } from "@/stores";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { jumpPreview } from "../../../../hooks/useModuleNav";
import { useScrollEditorTo } from "../../../../hooks/useScrollEditorTo";
import eventBus from "@/utils/modules/eventBus";
import Icon from "../icon.vue";
import EditableTitle from "./editableTitle.vue";
import { $t } from "@/locales";
const { proxy } = getCurrentInstance();

defineProps({
  add: {
    type: Boolean,
    default: true,
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

function archiveModule() {
  proxy.$confirm($t("archiveMessage"), $t("archiveConfirm")).then(() => {
    resumeStore.setModuleArchived(currentForm.value.key, true);
  });
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
  <SfCollapse v-model="collapsed" :border="false" class="rounded-xl!">
    <SfCollapseItem name="1" lazy class="resume-module-box">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex flex-1 items-center truncate text-lg font-bold">
            <Icon
              v-if="currentForm.key !== 'user'"
              icon="icon-park-outline:drag"
              class="container-drag cursor-move!"
            />
            <!-- 隐藏模块时为标题添加删除线标识 -->
            <EditableTitle v-model="title" :strike-through="hidden" />
          </div>
          <div class="flex items-center">
            <SfTooltip :content="$t('locatePreview')" v-if="!hidden">
              <Icon @click.stop="handlePreviewJump" icon="mdi:map-search-outline" />
            </SfTooltip>
            <SfTooltip :content="$t('archive')">
              <Icon @click.stop="archiveModule" icon="lucide:archive" size="4" />
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
        <div class="px-3 pt-3">
          <slot />
          <div
            class="mt-3 flex w-fit cursor-pointer items-center gap-1 rounded-3xl border border-transparent bg-sf-theme-3 px-3 py-1 text-sf-theme hover:border-sf-theme"
            @click="handleAdd"
            v-if="add"
          >
            <SfIcon icon="ic:round-add" size="4" />
            <span>{{ $t("addRecord", { name: title }) }}</span>
          </div>
        </div>
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 模块外框包裹头部与内容，统一圆角边界 */
.resume-module-box {
  @apply overflow-hidden rounded-xl border border-sf-b;
}
/* 模块头部背景跟随明暗主题，并覆盖全局透明背景 */
.resume-module-box > :deep(.el-collapse-item__header) {
  @apply rounded-xl bg-sf-bg! px-3;
}

/* 展开时去掉头部下圆角，并在底边添加分隔线 */
.resume-module-box > :deep(.el-collapse-item__header.is-active) {
  @apply rounded-b-none border-b!  border-sf-b!;
}
</style>
