<template>
  <div class="flex flex-col p-1" v-if="list.length">
    <template v-for="(item, index) in list" :key="index">
      <div class="my-1 border-t-[0.5px] border-sf-border" v-if="index > 0 && border"></div>
      <div
        @mousedown="handleClick($event, item, index)"
        :class="[activeClass(item), hoverClass(item)]"
        class="flex-c relative h-8 rounded-xl"
      >
        <slot :item="item">
          <SfIcon size="4" :icon="item.icon" class="mr-1" v-if="item.icon" />
          <span>
            {{ item.name }}
          </span>
        </slot>
        <div
          v-if="activeKey && item[activeKey] == activeValue"
          class="absolute top-1/2 left-3 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sf-theme"
        ></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineOptions({
  name: "SfList",
});
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  /**
   * 激活项的键名
   */
  activeKey: {
    type: String,
    default: "",
  },
  /**
   * 激活项的值
   */
  activeValue: {},
  /**
   * 是否开启边框
   */
  border: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["onClick"]);
function handleClick(event, item, index) {
  if (item.fn) item.fn();
  event.stopPropagation();
  event.preventDefault();
  emit("onClick", item, index);
}
/**
 * 激活项的类名
 */
function activeClass(item) {
  const name = "text-sf-theme";
  if (item.active) {
    return name;
  }
  if (props.activeKey && item[props.activeKey] == props.activeValue) {
    return name;
  }
  return "text-sf-base";
}
/**
 * 悬停项的类名
 */
function hoverClass(item) {
  const name = "hover:bg-sf-theme-2 cursor-pointer hover:text-sf-theme-text";
  if (typeof item.hover == "boolean") {
    return item.hover ? name : "";
  }
  return name;
}
</script>

<style scoped></style>
