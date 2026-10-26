<template>
  <div class="text-sf-text">
    <!-- 点击入口只展开选项，选择具体模式后才修改主题。 -->
    <SfDropdown trigger="click">
      <SfIcon
        :icon="theme === 'dark' ? 'twemoji:sun' : theme === 'eye-care' ? 'ri:leaf-fill' : 'ri:moon-clear-fill'"
        size="8"
        :style="{ color: theme === 'eye-care' ? 'var(--sf-theme)' : '#f3d776' }"
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
// 直接引用主题 store 模块，绕过 @/stores 桶文件以免拉入全部业务 store
import { useThemeStore } from "@/stores/modules/theme";

defineOptions({ name: "SfTheme" });

const themeStore = useThemeStore();
const { setTheme } = themeStore;
const { theme, themeMode } = storeToRefs(themeStore);
// 主题选项
const list = computed(() => {
  return [
    { name: $t("core.theme.system"), value: "system" },
    { name: $t("core.theme.light"), value: "light" },
    { name: $t("core.theme.dark"), value: "dark" },
    { name: $t("core.theme.eyeCare"), value: "eye-care" },
  ];
});

function handleClick(item) {
  setTheme(item.value);
}
</script>

<style scoped></style>
