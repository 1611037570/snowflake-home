<script setup>
import { ref } from "vue";
const { proxy } = getCurrentInstance();

defineProps({
  add: {
    type: Boolean,
    default: true,
  },
  edit: {
    type: Boolean,
    default: false,
  },
});
const name = defineModel("name", {
  type: String,
  default: "未填写",
});
const { currentForm, removeSelf, addItem } = inject("df/context")();

// 展开状态：直接绑定激活项 name 数组（["1"] 展开 / [] 收起），随数据双向绑定
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});

// 模块标题统一读取配置的 name 字段
const title = computed(() => name.value);

function del() {
  proxy.$confirm(`确定要删除${title.value}模块吗？`, "删除确认").then(() => {
    removeSelf();
  });
}
function handleAdd() {
  // 新增一条子项：引擎内部深拷贝 addConfig 后 push，避免多个子项共享同一份引用
  addItem();
}

// 标题编辑弹窗状态
const editVisible = ref(false);
const editTitle = ref("");

// 打开标题编辑弹窗（预填当前标题）
function handleEdit() {
  editTitle.value = title.value;
  editVisible.value = true;
}

// 保存编辑后的标题到表单配置
function handleEditConfirm() {
  if (!editTitle.value) return;
  currentForm.value.name = editTitle.value;
  editVisible.value = false;
}
</script>

<template>
  <SfCollapse v-model="collapsed">
    <SfCollapseItem name="1">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold">
            <SfIcon
              icon="icon-park-outline:drag"
              size="4"
              class="container-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ title }}
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100">
            <SfIcon
              v-if="edit"
              @click.stop="handleEdit"
              icon="ic:round-edit"
              size="4"
              class="cursor-pointer hover:text-sf-theme"
            />
            <SfIcon
              @click.stop="del"
              icon="ic:round-delete"
              size="4"
              class="mr-3 hover:text-sf-theme"
            />
          </div>
        </div>
      </template>
      <template #default>
        <slot />
        <div
          class="mt-1 mb-3 flex cursor-pointer items-center gap-1 text-sf-theme"
          @click="handleAdd"
          v-if="add"
        >
          <SfIcon icon="ic:round-add" size="4" />
          <span> 增加{{ title }} </span>
        </div>
      </template>
    </SfCollapseItem>
    <SfModal v-model="editVisible" title="编辑模块标题">
      <form class="flex w-80 flex-col gap-4 p-5" @submit.prevent="handleEditConfirm">
        <SfInput v-model="editTitle" placeholder="请输入模块标题" />
        <footer class="flex justify-end gap-3">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!editTitle" @click="handleEditConfirm"
            >保存</el-button
          >
        </footer>
      </form>
    </SfModal>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
