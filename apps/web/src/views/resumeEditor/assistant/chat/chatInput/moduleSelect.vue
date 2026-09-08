<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import {
  ALL_MODULE_ICON,
  ALL_MODULE_KEY,
  ALL_MODULE_NAME,
} from "@/stores/modules/resume/defaultConfig";
import { useModuleNav } from "../../../useModuleNav";

const resumeStore = useResumeStore();
const { selectedModule } = storeToRefs(resumeStore);
// 模块导航数据源：全部简历模块
const { moduleList } = useModuleNav();

// 可选模块列表：模块导航数据源派生 + 底部整个简历，标记是否已选中
const moduleOptions = computed(() => {
  const list = moduleList.value.map((m) => ({
    key: m.key,
    name: m.name,
    icon: m.icon,
    active: selectedModule.value.some((item) => item.key === m.key),
  }));
  // 分割线 + 整个简历：整个简历未选中具体模块时激活
  list.push({ divider: true });
  list.push({
    key: ALL_MODULE_KEY,
    name: ALL_MODULE_NAME,
    icon: ALL_MODULE_ICON,
    active: !selectedModule.value.length,
  });
  return list;
});

// 切换模块选中状态：整个简历激活时取消之前的单个选中
const toggleModule = (item) => {
  // 整个简历：清空单个选中，等价于整份简历
  if (item.key === ALL_MODULE_KEY) {
    resumeStore.clearSelectedModules();
    return;
  }
  // 已选中则取消，未选中则加入，统一走 store 操作
  if (selectedModule.value.some((m) => m.key === item.key)) {
    resumeStore.unselectModule(item.key);
  } else {
    resumeStore.selectModule(item.key);
  }
};
</script>

<template>
  <SfDropdown trigger="hover" placement="top-start" :show-arrow="false">
    <div class="cursor-pointer rounded-3xl bg-sf-bg-2 px-2 py-1 text-sm select-none">
      <template v-if="selectedModule.length">
        已选
        <span class="text-sf-theme">
          {{ selectedModule.length }}
        </span>
        模块
      </template>
      <template v-else> {{ ALL_MODULE_NAME }} </template>
    </div>
    <!-- 模块选择面板：从按钮上方弹出 -->
    <template #dropdown>
      <div class="w-56 rounded-2xl border border-sf-b bg-sf-primary p-1.5">
        <p class="px-1 pb-1 text-xs text-sf-text-3">
          选择后 AI 只读取和操作选中的模块，不选则针对整份简历
        </p>
        <SfList :list="moduleOptions" :border="false" @onClick="toggleModule" />
      </div>
    </template>
  </SfDropdown>
</template>
