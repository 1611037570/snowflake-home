<script setup>
import { computed, getCurrentInstance, inject, ref } from "vue";

const { proxy } = getCurrentInstance();

// 模块标题：读取配置的 name
const name = defineModel("name", {
  type: String,
  default: "",
});
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
// 荣誉证书数据数组
const items = defineModel("items", {
  type: Array,
  default: () => [],
});
const { removeSelf, addItem } = inject("df/context")();

const title = computed(() => name.value);

// 删除整个模块
function del() {
  proxy.$confirm(`确定要删除${title.value}模块吗？`, "删除确认").then(() => {
    removeSelf();
  });
}

// 隐藏模块：隐藏后内容仍保留，可在隐藏模块中恢复
function moduleHidden() {
  proxy.$confirm("隐藏后内容仍保留在简历中，可在隐藏模块中恢复。", "隐藏确认").then(() => {
    hidden.value = true;
  });
}

// 新增弹窗状态
const addVisible = ref(false);
const addName = ref("");

// 打开新增弹窗
function handleAdd() {
  addVisible.value = true;
}

// 弹窗确认：先写入数据数组，再同步新增子项配置，编辑区与预览区共用数据自动同步渲染
function handleAddConfirm() {
  const honorName = addName.value.trim();
  if (!honorName) return;
  items.value.push({ name: honorName });
  addItem();
  addVisible.value = false;
  addName.value = "";
}

// 关闭弹窗并清空输入
function handleAddCancel() {
  addVisible.value = false;
  addName.value = "";
}
</script>

<template>
  <SfCollapse v-model="collapsed">
    <SfCollapseItem name="1">
      <template #title>
        <div class="group flex h-full w-full items-center justify-between">
          <div class="flex items-center text-lg font-bold" :class="hidden ? 'text-sf-text-3' : ''">
            <SfIcon
              icon="icon-park-outline:drag"
              size="4"
              class="container-drag mr-1 cursor-move!"
              @click.stop=""
            />
            {{ title }}
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100">
            <SfTooltip content="隐藏模块">
              <SfIcon
                @click.stop="moduleHidden"
                icon="lucide:eye-off"
                size="4"
                class="cursor-pointer hover:text-sf-theme"
              />
            </SfTooltip>
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
        <div class="mt-1 flex cursor-pointer items-center gap-1 text-sf-theme" @click="handleAdd">
          <SfIcon icon="ic:round-add" size="4" />
          <span>增加{{ title }}</span>
        </div>
      </template>
    </SfCollapseItem>
    <SfModal v-model="addVisible" title="添加荣誉证书">
      <form class="flex w-80 flex-col gap-3 p-3" @submit.prevent="handleAddConfirm">
        <SfInput v-model="addName" placeholder="请输入荣誉证书名称" clearable />
        <footer class="flex justify-end gap-3">
          <el-button @click="handleAddCancel">取消</el-button>
          <el-button type="primary" :disabled="!addName.trim()" @click="handleAddConfirm"
            >保存</el-button
          >
        </footer>
      </form>
    </SfModal>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
