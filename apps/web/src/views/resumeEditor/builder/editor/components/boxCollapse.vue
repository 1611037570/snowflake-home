<script setup>
import { ref } from "vue";
import { useResumeStore } from "@/stores";
import { jumpPreview } from "../../../useModuleNav";
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
const { currentForm, removeSelf, addItem } = inject("df/context")();
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
// 归档状态：已完成模块从主编辑区移入归档区域
const archived = defineModel("archived", {
  type: Boolean,
  default: false,
});

function del() {
  proxy.$confirm(`确定要删除${title.value}模块吗？`, "删除确认").then(() => {
    removeSelf();
  });
}

function toggleHidden() {
  hidden.value = !hidden.value;
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
      archived.value = true;
      resumeStore.unselectModule(currentForm.value.key);
    });
}

function handleAdd() {
  // 新增一条子项：引擎内部深拷贝 itemSchema 后 push，避免多个子项共享同一份引用
  addItem();
}
</script>

<template>
  <SfCollapse v-model="collapsed">
    <SfCollapseItem name="1">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold">
            <SfIcon
              v-if="currentForm.key !== 'user'"
              icon="icon-park-outline:drag"
              size="4"
              class="container-drag mr-1 cursor-move!"
              @click.stop=""
            />
            <EditableTitle v-model="title" />
          </div>
          <div class="mr-3 flex items-center gap-3 opacity-0 group-hover:opacity-100">
            <SfTooltip content="定位预览" v-if="!hidden">
              <SfIcon
                @click.stop="handlePreviewJump"
                icon="mdi:map-search-outline"
                size="4"
                class="cursor-pointer hover:text-sf-theme"
              />
            </SfTooltip>
            <SfTooltip :content="hidden ? '显示' : '隐藏'">
              <SfIcon
                @click.stop="toggleHidden"
                :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
                size="4"
                class="cursor-pointer hover:text-sf-theme"
              />
            </SfTooltip>
            <SfTooltip content="归档">
              <SfIcon
                @click.stop="archiveModule"
                icon="lucide:archive"
                size="4"
                class="cursor-pointer hover:text-sf-theme"
              />
            </SfTooltip>
            <SfIcon
              v-if="currentForm.key !== 'user'"
              @click.stop="del"
              icon="ic:round-delete"
              size="4"
              class="hover:text-sf-theme"
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
