<script setup lang="ts">
import Icon from "../icon.vue";
import { useFormContext } from "@/components/business/dynamicForm/api";
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
const { currentForm, hasFieldData, removeField } = useFormContext();
// 隐藏开关：绑定被包裹字段的隐藏路径，未声明绑定时不渲染开关
const hidden = defineModel<boolean | undefined>("hidden");
// 字段图标：绑定被包裹字段的图标路径，未声明绑定时不渲染图标选择
const icon = defineModel<string | undefined>("icon");
// 副标题标记：所有字段共用同一路径，值等于当前字段标识时表示已标记
const subtitleKey = defineModel<string | undefined>("subtitleKey");
// 被包裹的字段：数据绑定与渲染条件以字段自身配置为准
const field = computed(() => currentForm.value?.fields?.[0]);
// 可添加字段：数据存在才渲染，与编辑器的添加逻辑保持一致
const renderable = computed(() => !field.value?.addable || hasFieldData(field.value));
// 当前字段是否为副标题
const isSubtitle = computed(() => !!field.value?.key && subtitleKey.value === field.value.key);
// 切换隐藏状态：写回字段的隐藏路径
const toggleHidden = () => (hidden.value = !hidden.value);
// 更新图标：写回字段的图标路径
const updateIcon = (value: string) => (icon.value = value);
// 切换副标题：同时只允许一个，再次点击取消标记
const toggleSubtitle = () => (subtitleKey.value = isSubtitle.value ? "" : field.value?.key);
// 删除：清空被包裹字段的数据，字段模板保留
const clearField = () => removeField(field.value);
</script>

<template>
  <div v-if="renderable" class="flex w-full items-center gap-1">
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
    <div
      v-if="hidden !== undefined || removable || subtitleKey !== undefined"
      class="flex shrink-0 items-center"
    >
      <SfTooltip :content="isSubtitle ? '取消副标题' : '标记为副标题'">
        <Icon
          v-if="subtitleKey !== undefined"
          @pointerdown.stop.prevent
          @click="toggleSubtitle"
          icon="lucide:heading-2"
          :class="isSubtitle ? 'text-sf-theme' : ''"
        />
      </SfTooltip>
      <SfTooltip :content="hidden ? '显示' : '隐藏'">
        <Icon
          v-if="hidden !== undefined"
          @pointerdown.stop.prevent
          @click="toggleHidden"
          :icon="hidden ? 'lucide:eye' : 'lucide:eye-off'"
        />
      </SfTooltip>
      <Icon v-if="removable" @pointerdown.stop.prevent @click="clearField" icon="ic:round-delete" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
