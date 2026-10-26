<script setup>
// 视图条上的参数入口：左侧参数名、右侧当前值或色块，展开时用主题色描边
defineProps({
  /** 参数名称，例如字体、字号 */
  label: { type: String, required: true },
  /** 当前值文本，改用插槽展示时可不传 */
  value: { type: String, default: "" },
  /** 下拉是否展开，展开时整颗入口高亮 */
  active: { type: Boolean, default: false },
  /** 尾部状态：idle 显示箭头，loading 显示加载，error 显示失败提示 */
  status: { type: String, default: "idle" },
});
</script>

<template>
  <button
    type="button"
    class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2 text-[11px] transition-colors"
    :class="
      active
        ? 'border-sf-theme text-sf-theme'
        : 'border-sf-b text-sf-text-2 hover:border-sf-theme hover:text-sf-theme'
    "
  >
    <span class="shrink-0 text-sf-text-3">{{ label }}</span>
    <slot>
      <span class="max-w-20 truncate">{{ value }}</span>
    </slot>
    <SfIcon
      v-if="status === 'loading'"
      icon="line-md:loading-twotone-loop"
      size="3"
      :aria-label="label"
    />
    <SfIcon
      v-else-if="status === 'error'"
      icon="lucide:circle-alert"
      size="3"
      class="text-sf-error"
      :aria-label="label"
    />
    <SfIcon v-else icon="lucide:chevron-down" size="3" />
  </button>
</template>
