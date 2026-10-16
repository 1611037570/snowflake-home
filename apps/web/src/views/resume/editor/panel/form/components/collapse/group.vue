<script setup>
// 字段折叠分组：只负责把分组内的字段收起/展开，不承载模块与记录的操作
defineProps({
  label: {
    type: String,
    default: "",
  },
});
// 展开状态：直接绑定激活项 name 数组（["1"] 展开 / [] 收起），随数据双向绑定
const collapsed = defineModel("collapsed", {
  type: Array,
  default: () => [],
});
</script>

<template>
  <SfCollapse v-model="collapsed" :border="false">
    <SfCollapseItem name="1" lazy class="resume-group-box">
      <template #title>
        <div class="flex h-full w-full items-center text-[14px]">
          <span class="truncate">{{ label }}</span>
        </div>
      </template>
      <template #default>
        <slot />
      </template>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style scoped>
/* 取消折叠内容区默认底部留白，与记录卡片内其它字段保持一致 */
.resume-group-box > :deep(.el-collapse-item__wrap > .el-collapse-item__content) {
  padding-bottom: 0;
}
</style>
