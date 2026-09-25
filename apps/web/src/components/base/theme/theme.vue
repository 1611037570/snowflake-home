<template>
  <div class="text-sf-text" @click="toggleTheme">
    <!-- 统一使用下拉封装，避免直接触发下拉组件的递归更新。 -->
    <SfDropdown trigger="hover">
      <SfIcon
        :icon="theme === 'dark' ? 'twemoji:sun' : 'ri:moon-clear-fill'"
        size="8"
        style="color: #f3d776"
        class="transition-all duration-300 hover:scale-120"
      />
      <template #dropdown>
        <SfList
          class="w-[120px]"
          :list="list"
          activeKey="value"
          @onClick="handleClick"
          :activeValue="themeMode"
        >
          <template #default="{ item }">
            {{ item.name }}
          </template>
        </SfList>
      </template>
    </SfDropdown>
  </div>
</template>

<script setup>
import { useThemeStore } from "@/stores";

defineOptions({ name: "SfTheme" });

const themeStore = useThemeStore();
const { setTheme } = themeStore;
const { theme, themeMode } = storeToRefs(themeStore);
const toggleTheme = () => {
  setTheme(theme.value);
};
// 主题选项
const list = computed(() => {
  return [
    { name: $t("core.theme.system"), value: "system" },
    { name: $t("core.theme.light"), value: "light" },
    { name: $t("core.theme.dark"), value: "dark" },
  ];
});

function handleClick(item) {
  setTheme(item.value);
}
</script>

<style scoped></style>
