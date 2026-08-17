<script setup>
import { useRoute } from "vue-router";
import Main from "./main/index.vue";
import Mine from "./mine.vue";
import Statistics from "./statistics/index.vue";
import Template from "./template.vue";

const navList = [
  {
    name: "首页",
    value: "home",
  },
  {
    name: "简历模板",
    value: "template",
  },
  {
    name: "我的简历",
    value: "mine",
  },
  {
    name: "求职统计",
    value: "statistics",
  },
];
const route = useRoute();
const activeNavIndex = ref(0);
watch(
  () => route.fullPath,
  () => {
    const type = route.query.type;
    const value = Array.isArray(type) ? type[0] : type;
    const index = navList.findIndex((item) => item.value === value);

    if (index !== -1) {
      activeNavIndex.value = index;
    }
  },
  { immediate: true },
);
const activeValue = computed(() => {
  return navList[activeNavIndex.value].value;
});
</script>

<template>
  <main class="relative flex min-h-screen min-w-full flex-col bg-sf-page">
    <header
      class="fixed top-0 right-0 left-0 z-50 h-16 w-full border-b-[0.5px] border-sf-border bg-sf-page font-extrabold text-sf-base"
    >
      <div class="mx-auto flex h-full w-full max-w-[1280px] items-center gap-6">
        <div class="flex shrink-0 items-center gap-2.5 text-[17px] whitespace-nowrap">
          <SfLogo size="8.5" name="resumeMain" />
          <span> {{ $t("router.resumeMain") }}</span>
        </div>

        <nav class="flex items-center gap-[30px] max-[1180px]:gap-5 max-[900px]:hidden">
          <button
            v-for="(item, index) in navList"
            :key="item.value"
            type="button"
            @click="activeNavIndex = index"
            class="cursor-pointer border-0 bg-transparent p-0 text-[15px] font-extrabold"
            :class="
              index === activeNavIndex
                ? `relative text-sf-theme after:absolute after:right-0 after:bottom-[-10px] after:left-0 after:h-[5px] after:rounded-full after:bg-sf-theme after:content-['']`
                : ''
            "
          >
            {{ item.name }}
          </button>
        </nav>

        <div class="ml-auto flex items-center gap-[18px]">
          <SfAbout />
          <SfTheme />
          <SfLocale />
          <SfDonation />
          <SfSetting />
          <SfMore> </SfMore>
        </div>
      </div>
    </header>

    <div
      class="flex h-full w-full flex-1! flex-col overflow-hidden"
      :class="{ 'pt-20': activeValue !== 'home' }"
    >
      <Main v-if="activeValue == 'home'" />
      <Template v-else-if="activeValue == 'template'" />
      <Mine v-else-if="activeValue == 'mine'" />
      <Statistics v-else-if="activeValue == 'statistics'" />
    </div>
  </main>
</template>

<style lang="scss" scoped></style>
