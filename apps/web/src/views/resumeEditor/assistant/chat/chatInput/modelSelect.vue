<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { PROVIDER_NAMES } from "@/configs";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { activeModel, modelList } = storeToRefs(aiStore);

// 模型选项列表：仅已添加的自定义模型（至少要有 provider 和 key 才展示）
const modelOptions = computed(() => {
  const options: Array<{ id: string; name: string; active: boolean }> = [];
  modelList.value.forEach((model) => {
    if (model.provider && model.key) {
      options.push({
        id: model.id,
        name: model.name || model.model || PROVIDER_NAMES[model.provider] || model.provider,
        active: activeModel.value === model.id,
      });
    }
  });
  return options;
});

// 触发按钮文本：选中的自定义模型名，未选中自定义模型时回退到内置雪花服务
const activeName = computed(() => {
  const current = modelOptions.value.find((item) => item.id === activeModel.value);
  return current ? current.name : "雪花服务";
});

// 点击模型项：切换为当前使用模型
function selectModel(item: any) {
  aiStore.activeModel = item.id;
}

// 空态：打开服务商设置弹窗并切到添加模型 Tab
function goToAddModel() {
  aiStore.openModelManager("add");
}
</script>

<template>
  <!-- 无已添加模型：按钮直接变为「去添加模型」 -->
  <div
    v-if="!modelOptions.length"
    class="flex cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-bg-2 px-2 py-1 text-sm text-sf-warning"
    @click="goToAddModel"
  >
    <SfIcon icon="lucide:triangle-alert" size="4" />
    <span>未配置模型</span>
  </div>

  <!-- 模型切换：普通 div 触发，SfDropdown + SfList 渲染模型列表 -->
  <SfDropdown v-else trigger="click" placement="top" :show-arrow="false">
    <div
      class="flex-c max-w-44 cursor-pointer gap-1 truncate rounded-3xl border border-transparent px-2 py-1 text-sm hover:border-sf-b hover:bg-sf-bg-2"
    >
      {{ activeName }}
      <SfIcon icon="mingcute:down-line" size="4" />
    </div>
    <template #dropdown>
      <SfList
        class="w-44"
        :list="modelOptions"
        activeKey="id"
        :activeValue="activeModel"
        @onClick="selectModel"
      >
        <template #default="{ item }">
          <div class="flex min-w-0 flex-1 items-center">
            <span class="truncate">{{ item.name }}</span>
          </div>
        </template>
      </SfList>
    </template>
  </SfDropdown>
</template>
