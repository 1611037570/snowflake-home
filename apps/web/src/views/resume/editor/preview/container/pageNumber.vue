<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { defaultFooter } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { system, currentUI } = storeToRefs(resumeStore);

// 页码显示开关：图标改为打开弹窗，切换由弹窗内开关完成
const showPageNumber = computed({
  get: () => system.value.showPageNumber,
  set: (value) => {
    system.value.showPageNumber = value;
  },
});

// 自定义页尾品牌名：留空时展示默认品牌
const footer = computed({
  get: () => currentUI.value?.footer ?? "",
  set: (value) => {
    currentUI.value.footer = value;
  },
});
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <SfTooltip content="页尾设置">
      <SfIcon
        icon="lucide:hash"
        size="5"
        boxSize="7"
        class="rounded-full"
        :class="
          system.showPageNumber
            ? 'text-sf-theme hover:bg-sf-theme-2'
            : 'text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text'
        "
      />
    </SfTooltip>
    <template #dropdown>
      <div class="flex w-[240px] flex-col gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <!-- 页码显示开关 -->
        <div class="flex items-center justify-between text-sm text-sf-text-2">
          <span>显示页码</span>
          <ElSwitch v-model="showPageNumber" />
        </div>
        <!-- 自定义页尾品牌名：留空恢复默认「轻舟简历」，页码部分固定展示 -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-1 text-sm text-sf-text-2">
            <span>自定义页尾</span>
            <SfTooltip content="恢复默认值">
              <SfIcon
                icon="material-symbols:restart-alt"
                size="4"
                class="cursor-pointer text-sf-text-2 transition-colors hover:text-sf-theme"
                @click="footer = defaultFooter"
              />
            </SfTooltip>
            <SfTooltip content="仅自定义开头的品牌名，页码部分固定展示，留空恢复「轻舟简历」" />
          </div>
          <SfInput v-model="footer" placeholder="例如：我的简历" clearable />
        </div>
      </div>
    </template>
  </SfDropdown>
</template>
