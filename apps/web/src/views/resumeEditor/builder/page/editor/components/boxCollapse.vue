<script setup>
import { ref, toRaw } from "vue";
import { DF_CURRENT_FORM, DF_REMOVE } from "@/components/business/dynamicForm/code/injectionKeys";
const { proxy } = getCurrentInstance();

const props = defineProps({
  add: {
    type: Boolean,
    default: true,
  },
  edit: {
    type: Boolean,
    default: false,
  },
});
const currentForm = inject(DF_CURRENT_FORM);
const objectRemove = inject(DF_REMOVE);

// 模块标题统一读取配置的 name 字段
const title = computed(() => currentForm.value?.name || "未填写");

function del() {
  proxy.$confirm(`确定要删除${title.value}模块吗？`, "删除确认").then(() => {
    objectRemove();
  });
}
function handleAdd() {
  // 新增一条子项：toRaw 解包响应式代理后再深拷贝，避免 structuredClone 克隆 Proxy 报错
  const currentFields = currentForm.value.fields[0];
  const { addConfig, list } = currentFields;
  if (!addConfig) return;
  list.push(structuredClone(toRaw(addConfig)));
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
  <SfCollapse>
    <SfCollapseItem>
      <template #title>
        <div class="flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold">
            <SfIcon
              icon="icon-park:drag"
              size="4"
              class="container-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ title }}
          </div>
          <div class="flex items-center gap-2">
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
          class="flex cursor-pointer items-center gap-1 text-sf-theme"
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
