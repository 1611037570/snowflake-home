<template>
  <div class="flex flex-col rounded-3xl border border-sf-b bg-sf-primary p-1" v-if="list.length">
    <template v-for="(item, index) in list" :key="index">
      <!-- 分隔线 -->
      <div class="mx-auto my-1 h-[0.5px] w-[95%] bg-sf-bg-3 px-4" v-if="index > 0 && border"></div>
      <div
        v-if="showItem(item)"
        @mousedown="handleClick($event, item, index)"
        :class="[activeClass(item), hoverClass(item)]"
        class="relative flex h-8 w-full items-center justify-between rounded-3xl px-2"
      >
        <slot :item="item">
          <div class="flex flex-1 items-center gap-1">
            <!-- 左侧图标 -->
            <SfIcon size="4" :icon="item.icon" class="mr-1" v-if="item.icon" />
            <!-- 文本 -->
            <span>
              {{ item.name }}
            </span>
          </div>
        </slot>
        <div
          v-if="activeKey && item[activeKey] == activeValue"
          class="h-1.5 w-1.5 rounded-full bg-sf-theme"
        ></div>
        <!-- 右侧图标 -->
        <SfIcon size="4" :icon="item.rightIcon" class="mr-1" v-if="item.rightIcon" />
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
  const className = "hover:bg-sf-theme-2 cursor-pointer hover:text-sf-theme-text";
  // 当item传入disabled属性时
  if (typeof item.disabled == "boolean") {
    // 如果disabled为true，返回空字符串
    return item.disabled ? "" : className;
  }
  return className;
}

/**
 * 显示项
 */
function showItem(item) {
  if (typeof item.hidden == "boolean") {
    return item.hidden ? true : false;
  }
  return true;
}
</script>

<style scoped></style>
