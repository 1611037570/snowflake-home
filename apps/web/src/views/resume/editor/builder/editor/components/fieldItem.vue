<script setup lang="ts">
import Icon from "../icon.vue";
// 包裹组的模型绑定只用于状态透传，不落成根元素属性
defineOptions({ inheritAttrs: false });
// 字段包裹组件：定制水平布局的标签与操作区，字段内容通过插槽嵌套
const {
  label,
  tip,
  removable = false,
  draggable = false,
} = defineProps<{
  label?: string;
  tip?: string;
  removable?: boolean;
  draggable?: boolean;
}>();
const { currentForm, hasFieldData, removeField } = inject("df/context")();
// 隐藏开关：绑定被包裹字段的隐藏路径，未声明绑定时不渲染开关
const hidden = defineModel<boolean | undefined>("hidden");
// 字段图标：绑定被包裹字段的图标路径，未声明绑定时不渲染图标选择
const icon = defineModel<string | undefined>("icon");
// 被包裹的字段：数据绑定与渲染条件以字段自身配置为准
const field = computed(() => currentForm.value?.fields?.[0]);
// 可添加字段：数据存在才渲染，与编辑器的添加逻辑保持一致
const renderable = computed(() => !field.value?.addable || hasFieldData(field.value));
// 切换隐藏状态：写回字段的隐藏路径
const toggleHidden = () => (hidden.value = !hidden.value);
// 更新图标：写回字段的图标路径
const updateIcon = (value: string) => (icon.value = value);
// 删除：清空被包裹字段的数据，字段模板保留
const clearField = () => removeField(field.value);
</script>

<template>
  <div v-if="renderable" class="flex w-full items-center">
    <div v-if="label" class="flex shrink-0 items-center" @click.stop.prevent="">
      <Icon v-if="draggable" icon="icon-park-outline:drag" class="item-drag cursor-move!" />
      <SfIconPicker
        v-if="icon !== undefined"
        :modelValue="icon"
        @update:modelValue="updateIcon"
        :size="4"
        class="mr-1"
      />
      <span class="truncate pr-1 text-[15px] text-sf-text">
        {{ label }}
      </span>
      <sf-tooltip :content="tip" v-if="tip" class="text-sf-text" />
    </div>
    <div class="min-w-0 flex-1">
      <slot />
    </div>
    <!-- 操作区固定在右侧，避免字段宽度变化导致按钮位移 -->
    <div v-if="hidden !== undefined || removable" class="flex shrink-0 items-center">
      <Icon
        v-if="hidden !== undefined"
        @pointerdown.stop.prevent
        @click="toggleHidden"
        :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
      />
      <Icon v-if="removable" @pointerdown.stop.prevent @click="clearField" icon="ic:round-delete" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
