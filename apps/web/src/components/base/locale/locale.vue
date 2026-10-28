<template>
  <SfDropdown trigger="hover">
    <SfIcon
      icon="ion:language"
      :size="props.size"
      :box-size="props.boxSize"
      :class="[color, props.boxSize ? 'cursor-pointer rounded-lg transition-colors hover:bg-sf-bg' : 'transition-all duration-300 hover:scale-120']"
    />
    <template #dropdown>
      <SfList
        class="w-30"
        :list="LANG_LIST.filter((item) => item.name)"
        activeKey="key"
        :activeValue="currentLocale"
        @onClick="handleClick"
      >
      </SfList>
    </template>
  </SfDropdown>
</template>

<script setup>
import { LANG_LIST, loadPageLang } from "@/locales";
import { useRouter } from "vue-router";

const color = inject("color", "text-sf-base");
defineOptions({ name: "SfLocale" });

// 图形尺寸与交互区域分别配置，默认保留其他页面的原有外观。
const props = defineProps({
  // 图标图形大小，使用间距单位。
  size: { type: [String, Number], default: 8 },
  // 图标交互区域大小，未设置时沿用图形大小。
  boxSize: { type: [String, Number], default: undefined },
});


const router = useRouter();
import { language } from "@/utils";
const currentLocale = computed(() => language.value);
const handleClick = async (item) => {
  await loadPageLang(router.currentRoute.value, item.key);
};
</script>

<style scoped></style>
