<script setup>
import { useShortcutStore } from "@/stores";
import SearchTitle from "../searchTitle.vue";
const shortcutStore = useShortcutStore();
const { fixedList } = storeToRefs(shortcutStore);
function handleClick(item) {
  urlNavigation(item.url);
}

// 取消置顶
const currentItem = ref(null);
const list = computed(() => {
  return [
    {
      name: "取消置顶",
      fn: () => {
        currentItem.value.top = false;
      },
    },
  ];
});
function updateCurrentItem(item) {
  currentItem.value = item;
}
</script>

<template>
  <SearchTitle
    title="已固定"
    icon="tabler:history"
    iconClass="text-sf-theme"
    v-if="fixedList.length"
  />
  <div class="grid grid-cols-8 gap-4" v-if="fixedList.length">
    <SfMenu
      @click="handleClick(item)"
      @onMounted="updateCurrentItem(item)"
      :list="list"
      v-for="item in fixedList"
      :key="item.id"
    >
      <div
        class="flex-c cursor-pointer flex-col overflow-hidden rounded-xl bg-white/80 p-2 text-sm text-sf-text backdrop-blur-sm hover:bg-sf-theme-2"
      >
        <SfMixImg :type="item.imgType" :value="item.imgValue" :size="24" />
        <!-- <div class="mt-2 w-full truncate px-1 text-center text-xs">{{ item.name }}</div> -->
      </div>
    </SfMenu>
  </div>
</template>
<style scoped></style>
