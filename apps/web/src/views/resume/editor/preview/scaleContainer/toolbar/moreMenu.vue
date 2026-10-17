<script setup>
// 更多入口：把视图类操作收进一个菜单，避免工具条平铺过多图标
import { computed, inject } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { $t } from "@/locales";
import eventBus from "@/utils/modules/eventBus";

const emit = defineEmits(["fullscreen"]);

const resumeStore = useResumeStore();
const { system, selectedModule } = storeToRefs(resumeStore);
// 下拉容器提供的关闭方法：执行操作后收起面板
const closeDropdown = inject("sfDropdownClose", null);

// 执行动作后收起菜单
const runAction = (action) => {
  action();
  closeDropdown?.();
};

// 智能一页：交由预览实例完成参数探测与应用
const fitOnePage = () => runAction(() => eventBus.emit("resume-smart-one-page"));
// 打印模式：预览去色，模拟黑白打印
const togglePrintMode = () => runAction(() => (system.value.printMode = !system.value.printMode));
// 全屏预览：由外层容器打开全屏实例
const openFullscreen = () => runAction(() => emit("fullscreen"));
// 清空选中：仅在预览中存在选中模块时展示
const hasSelection = computed(() => selectedModule.value.length > 0);
const clearSelection = () => runAction(() => resumeStore.clearSelectedModules());
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-end" :show-arrow="false">
    <SfIcon
      icon="mdi:dots-horizontal"
      size="4"
      boxSize="8"
      class="rounded-full text-sf-text-2 transition-colors hover:bg-sf-bg"
    />
    <template #dropdown>
      <div class="flex w-44 flex-col gap-1 rounded-3xl border border-sf-b bg-sf-primary p-1.5">
        <button
          type="button"
          class="flex h-9 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-[13px] text-sf-text-2 transition-colors hover:bg-sf-bg"
          @click="fitOnePage"
        >
          <SfIcon icon="mdi:file-document-outline" size="4" />
          <span>{{ $t("smartOnePage") }}</span>
        </button>
        <button
          type="button"
          class="flex h-9 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-[13px] transition-colors hover:bg-sf-bg"
          :class="system.printMode ? 'text-sf-theme' : 'text-sf-text-2'"
          @click="togglePrintMode"
        >
          <SfIcon
            :icon="
              system.printMode
                ? 'qlementine-icons:light-bulb-off-16'
                : 'qlementine-icons:light-bulb-on-16'
            "
            size="4"
            :class="system.printMode ? 'text-sf-text-2' : 'text-sf-warning'"
          />
          <span>{{ $t("grayPrintMode") }}</span>
        </button>
        <button
          type="button"
          class="flex h-9 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-[13px] text-sf-text-2 transition-colors hover:bg-sf-bg"
          @click="openFullscreen"
        >
          <SfIcon icon="lucide:maximize" size="4" />
          <span>{{ $t("fullscreen") }}</span>
        </button>
        <button
          v-if="hasSelection"
          type="button"
          class="flex h-9 w-full cursor-pointer items-center gap-3 rounded-full px-3 text-[13px] text-sf-text-2 transition-colors hover:bg-sf-bg"
          @click="clearSelection"
        >
          <SfIcon icon="lucide:circle-slash" size="4" />
          <span>{{ $t("clearSelection") }}</span>
        </button>
      </div>
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
