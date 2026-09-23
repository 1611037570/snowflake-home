<script setup>
import { useResumeStore } from "@/stores";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { jumpPreview } from "../../../useModuleNav";
import { scrollEditorTo } from "../../../scrollEditorTo";
import eventBus from "@/utils/modules/eventBus";
import Icon from "../icon.vue";
import EditableTitle from "./editableTitle.vue";
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
  proxy.$confirm(`确定要删除${title.value}模块吗？`, "删除确认").then(() => {
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
  proxy
    .$confirm(
      `归档后，模块将从编辑器域移除，便于专注其他模块；预览区仍会正常显示，可恢复，不影响打印效果。`,
      "归档确认",
    )
    .then(() => {
      resumeStore.setModuleArchived(currentForm.value.key, true);
    });
}

// 新增记录追加到列表末尾，同步定位编辑区与预览区
function locateAddedItem(index) {
  if (index == null) return;
  nextTick(() => {
    const moduleKey = currentForm.value?.key;
    scrollEditorTo(
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
  <SfCollapse v-model="collapsed">
    <SfCollapseItem name="1" lazy>
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex flex-1 items-center truncate text-lg font-bold">
            <Icon
              v-if="currentForm.key !== 'user'"
              icon="icon-park-outline:drag"
              class="container-drag cursor-move!"
            />
            <EditableTitle v-model="title" />
          </div>
          <div class="flex items-center">
            <SfTooltip content="定位预览" v-if="!hidden">
              <Icon @click.stop="handlePreviewJump" icon="mdi:map-search-outline" />
            </SfTooltip>
            <SfTooltip content="归档">
              <Icon @click.stop="archiveModule" icon="lucide:archive" size="4" />
            </SfTooltip>
            <SfTooltip :content="hidden ? '显示' : '隐藏'">
              <Icon
                @click.stop="toggleHidden"
                :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
                :class="hidden ? 'text-sf-theme' : ''"
              />
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
        <slot />
        <div
          class="mt-1 flex cursor-pointer items-center gap-1 text-sf-theme"
          @click="handleAdd"
          v-if="add"
        >
          <SfIcon icon="ic:round-add" size="4" />
          <span> 增加{{ title }} </span>
        </div>
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
