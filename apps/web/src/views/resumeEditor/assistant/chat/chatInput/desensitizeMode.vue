<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { desensitizeMode } = storeToRefs(resumeStore);
const dropdownRef = ref();
const desensitizeOptions = [
  { key: "disabled", name: "不脱敏", description: "完整发送简历内容" },
  { key: "normal", name: "普通脱敏", description: "隐藏个人敏感信息" },
  { key: "strict", name: "严格脱敏", description: "额外隐藏公司和学校名称" },
];
const activeKey = computed(() =>
  desensitizeMode.value.disabled ? "disabled" : desensitizeMode.value.level,
);
const activeName = computed(
  () => desensitizeOptions.find((item) => item.key === activeKey.value)?.name,
);

// 选择脱敏等级并关闭下拉菜单
const handleSelect = (item) => {
  resumeStore.desensitizeMode = {
    disabled: item.key === "disabled",
    level: item.key === "strict" ? "strict" : "normal",
  };
  dropdownRef.value?.handleClose?.();
};
</script>

<template>
  <!-- 脱敏等级选择 -->
  <SfDropdown ref="dropdownRef" trigger="click" placement="top-start" :show-arrow="false">
    <div
      class="flex-c cursor-pointer gap-0.5 rounded-3xl px-2 py-1.5 text-[12px] font-semibold transition-all duration-300 select-none hover:bg-sf-bg-2"
      :class="desensitizeMode.disabled ? 'text-sf-text-3  hover:text-sf-text' : 'text-sf-theme'"
    >
      {{ activeName }}
      <SfIcon icon="mingcute:down-line" size="4" />
    </div>
    <template #dropdown>
      <SfList
        class="w-60"
        :list="desensitizeOptions"
        activeKey="key"
        :activeValue="activeKey"
        @onClick="handleSelect"
      >
        <template #default="{ item }">
          <div class="flex min-w-0 flex-1 items-center justify-between gap-3">
            <span class="shrink-0">{{ item.name }}</span>
            <span class="truncate text-[12px] text-sf-text-3">{{ item.description }}</span>
          </div>
        </template>
      </SfList>
    </template>
  </SfDropdown>
</template>
