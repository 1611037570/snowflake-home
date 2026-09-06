<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { ALL_MODULE_ICON, ALL_MODULE_KEY, ALL_MODULE_NAME } from "@/stores/modules/resume/defaultConfig";
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

// 模块选择面板显隐
const modulePanelVisible = ref(false);
const modulePanelRef = ref(null);
// 点击面板外区域收起
const closeModulePanel = (e) => {
  if (
    modulePanelVisible.value &&
    modulePanelRef.value &&
    !modulePanelRef.value.contains(e.target)
  ) {
    modulePanelVisible.value = false;
  }
};
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

onMounted(() => document.addEventListener("click", closeModulePanel));
// 组件卸载时移除面板外点击监听
onBeforeUnmount(() => document.removeEventListener("click", closeModulePanel));
</script>

<template>
  <div ref="modulePanelRef" class="relative">
    <div
      class="cursor-pointer rounded-3xl border border-sf-b bg-sf-bg-2 px-2 py-1 text-sm"
      @click="modulePanelVisible = !modulePanelVisible"
    >
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
    <div
      v-if="modulePanelVisible"
      class="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl border border-sf-b bg-sf-primary p-1.5 shadow-lg"
    >
      <SfList :list="moduleOptions" :border="false" @onClick="toggleModule" />
    </div>
  </div>
</template>
